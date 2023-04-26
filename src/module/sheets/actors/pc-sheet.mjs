import {CONST} from "../../const.mjs";
import {ExtendedItemSheet} from "../items/extended-item-sheet.mjs";
import {AoaActorSheet} from "./aoa-actor-sheet.mjs";
import {GmActorConfig} from "./gm-actor-config.mjs";
import {AoaEffect} from "../../documents/effects/aoa-effect.mjs";

export class PcSheet extends AoaActorSheet {
    static normalHeight = 900

    static actions = foundry.utils.mergeObject(super.actions, {
        equip: PcSheet.equip,
        showItem: PcSheet.showItem,
        editEffect: PcSheet.editEffect,
        disable: PcSheet.toggleEffect,
    });

    static condensed = true;

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "actor", "flexcol", PcSheet.condensed ? "condensed" : "", "animate__animated", "animate__faster", CONST.OPEN_ANIMATION_CLASS],
            template: `systems/${CONST.MODULE_ID}/templates/actors/${this.name.toLowerCase().replace("sheet", "-sheet")}.hbs`,
            width: PcSheet.condensed ? 600 : 800,
            height: PcSheet.condensed? "auto" : PcSheet.normalHeight,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "combat"}],
            resizable: false,
            editableLists: [
                {list: "weapon", template: `systems/${CONST.MODULE_ID}/templates/item-templates/weapon.hbs`, itemType: "weapon", listSelector: ".weapon-list", header: game.i18n.localize("aoa.weapons"), hasQuantity: true},
                {list: "armor", template: `systems/${CONST.MODULE_ID}/templates/item-templates/armor.hbs`, itemType: "armor", listSelector: ".armor-list", header: game.i18n.localize("aoa.armors")},
                {list: "skill", template: `systems/${CONST.MODULE_ID}/templates/item-templates/skill.hbs`, itemType: "skill", listSelector: ".skill-list", header: game.i18n.localize("aoa.skills")},
                {list: "language", template: `systems/${CONST.MODULE_ID}/templates/item-templates/only-name.hbs`, itemType: "language", listSelector: ".language-list", header: game.i18n.localize("aoa.languages")},
                {list: "gear", template: `systems/${CONST.MODULE_ID}/templates/item-templates/gear.hbs`, itemType: "gear", listSelector: ".gear-list", hasQuantity: true},
                {list: "spell", template: `systems/${CONST.MODULE_ID}/templates/item-templates/spell.hbs`, itemType: "spell", listSelector: ".spell-list", header: game.i18n.localize("aoa.spells") },
                {list: "ritual", template: `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`, itemType: "ritual", listSelector: ".ritual-list", header: game.i18n.localize("aoa.rituals")},
                {list: "cantrip", template: `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`, itemType: "cantrip", listSelector: ".cantrip-list", header: game.i18n.localize("aoa.cantrips")},
                {list: "trait", template: `systems/${CONST.MODULE_ID}/templates/item-templates/trait.hbs`, itemType: "trait", listSelector: ".trait-list", header: game.i18n.localize("aoa.traits")},
                {list: "effects", template: `systems/${CONST.MODULE_ID}/templates/item-templates/effect.hbs`, itemType: "effect", listSelector: ".effect-list", identifier: "label", documentType: "ActiveEffect", gmEdit: true}
            ]
        });
    }

    actualizer;

    async activateListeners(html) {
        return super.activateListeners(html);
    }

    _getHeaderButtons() {
        const buttons =  super._getHeaderButtons();
        const that = this;

        buttons.splice(1, 0, {
            label: "",
            class: "toggle-condense",
            icon: PcSheet.condensed ? "fa-solid fa-arrows-maximize" : "fa-solid fa-arrows-minimize",
            onclick: ev => PcSheet.toggleCondense(ev)
        });

        if(game.user.isGM) {
            buttons.splice(1, 0, {
                label: "",
                class: "show-art",
                icon: "fa-solid fa-magnifying-glass",
                onclick: () => PcSheet.showArt(that.actor)
            });
            buttons.splice(1, 0, {
                label: "",
                class: "show-gm-config",
                icon: "fa-solid fa-clipboard",
                onclick: async () => await new GmActorConfig(this.actor).render(true)
            });
        }

        return buttons;
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet pc-sheet ${PcSheet.condensed ? "condensed" : ""} ${context.cssClass}`

        context.languageRelevant = game.settings.get(CONST.MODULE_ID, "languageRelevant");

        for(const [key, value] of Object.entries(context.actor.system.abilities)) {
            value.modifierDesc = game.i18n.localize(`${CONST.MODULE_SCOPE}.abilities-mod.${key}`);
        }

        const arrayNames = ["weapon", "armor", "gear", "spell", "ritual", "cantrip", "language", "skill", "trait"];

        arrayNames.forEach(an => context[an] = this.actor.items
            .filter(i => i.type === an)
            .sort((a,b)=>(a.sort || 0) - (b.sort||0)));


        context.combatStances = {
            normal: game.i18n.localize("aoa.stances.normal"),
            aggressive: game.i18n.localize("aoa.stances.aggressive"),
            defensive: game.i18n.localize("aoa.stances.defensive"),
            protective: game.i18n.localize("aoa.stances.protective"),
            commanding: game.i18n.localize("aoa.stances.commanding"),
        }

        context.equippedWeapons = context.weapon.filter(w => w.system.equipped);

        context.condensed = PcSheet.condensed;

        context.selectedWeaponItem = this.actor.items.get(this.actor.system.selectedWeapon);

        context.isGM = game.user.isGM;

        context.effects = context.effects.map(e => {
            const effect = this.actor.effects.get(e._id);

            e.duration.remaining = AoaEffect.getRemaining(effect);
            e.duration.remainingString = AoaEffect.getRemainingString(effect);

            return e;
        });

        return context;
    }

    render(force = false, options = {}) {
        if(this.actualizer) {
            Hooks.off('updateWorldTimer', this.actualizer );
        }

        this.actualizer = Hooks.on('updateWorldTime', this.actualize.bind(this, this));

        this.actualizer = setInterval(this.actualize, 1000, this);

        return super.render(force, options);
    }

    actualize(context) {
        const element = context.element;

        context.actor.effects.contents.forEach(e => {
                if(e.duration.seconds) {
                    const textElement = element.find(`[data-item-id="${e._id}"]`).find(".remaining-text");
                    textElement.text(AoaEffect.getRemainingString(e));
                }
            });
    }

    async close(options) {
        Hooks.off('updateWorldTimer', this.actualizer );

        return super.close(options);
    }

    static async equip(actor, html) {
        const considerHands = game.settings.get(CONST.MODULE_ID, "considerHandsOnEquip");
        const itemId = html.closest("[data-item-id]").data("item-id");
        const consideredTypes = ["weapon", "armor"];

        if (!itemId) {
            return;
        }

        const item = actor.items.get(itemId);

        if(item.type === "weapon" && item.system.quantity.value < 1) {
            return;
        }

        const equip = !item.system.equipped

        if (considerHands) {
            if (equip && (item.type === "weapon" || (item.type === "armor" && item.system.needFreeHand))) {
                const equippedItems = actor
                    .items
                    .filter(i => i.system.equipped && consideredTypes.includes(item.type))
                    .filter(i => i.type === "weapon" || i.system.needFreeHand);

                const handsUsed = equippedItems.reduce((prev, cur) => prev + (cur.type === "weapon" && cur.system.needsTwoHands ? 2 : 1), 0);
                const neededHands = item.type === "weapon" && item.system.needsTwoHands ? 2 : 1;

                if (handsUsed + neededHands > 2) {
                    const lastItems = equippedItems.slice(-neededHands);

                    for (const i of lastItems) {
                        await i.update({"system.equipped": false});
                    }
                }
            }

            if (equip && item.type === "armor" && !item.system.stacks) {
                const equippedArmor = actor
                    .items
                    .filter(i => i.system.equipped && i.type === "armor" && !i.system.stacks);

                if (equippedArmor.length >= 1) {
                    const lastArmor = equippedArmor.slice(-1);

                    await lastArmor[0]?.update({
                        "system.equipped": false
                    });
                }
            }
        }

        await item.update({
            "system.equipped": !item.system.equipped
        });
    }

    static showItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if (!itemId) {
            return;
        }
        const item = actor.items.get(itemId);
        new ExtendedItemSheet(item).render(true, {editable: game.user.isGM});
    }

    static toggleCondense() {
        if(PcSheet.condensed) {
            PcSheet.condensed = !PcSheet.condensed;
            ui.activeWindow.render(true, {width: 800, height: PcSheet.normalHeight});
            ui.activeWindow.element.find(".toggle-condense i")[0].classList.value = "fa-solid fa-arrows-minimize";
            ui.activeWindow.element.removeClass("condensed")
        } else {
            PcSheet.condensed = !PcSheet.condensed;
            ui.activeWindow.render(true, {width: 600, height: "auto"});
            ui.activeWindow.element.find(".toggle-condense i")[0].classList.value = "fa-solid fa-arrows-maximize";
            ui.activeWindow.element.addClass("condensed")
        }
    }

    static editEffect(actor, html) {
        const effectId = html.closest("[data-item-id]").data("item-id");

        if(effectId) {
            const effect = actor.effects.get(effectId);

            effect.sheet.render(true);
        }
    }

    static async toggleEffect(actor, html) {
        const effectId = html.closest("[data-item-id]").data("item-id");

        if(effectId) {
            const effect = actor.effects.get(effectId);

            await effect.update({
                "disabled": !effect.disabled
            });
        }
    }




}
