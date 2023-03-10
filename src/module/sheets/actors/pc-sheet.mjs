import {CONST} from "../../const.mjs";
import {EditableList} from "../../editable-list.mjs";
import {actionHandler} from "../../actions.mjs";
import {ExtendedItemSheet} from "../items/extended-item-sheet.mjs";
import {AoaActorSheet} from "./aoa-actor-sheet.mjs";

export class PcSheet extends AoaActorSheet {

    static actions = foundry.utils.mergeObject(super.actions, {
        equip: PcSheet.equip,
        showItem: PcSheet.showItem,
    })


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "actor", "flexcol"],
            template: `systems/${CONST.MODULE_ID}/templates/actors/${this.name.toLowerCase().replace("sheet", "-sheet")}.hbs`,
            width: 800,
            height: 900,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "combat"}],
            resizable: false,
            editableLists: [
                {list: "weapon", template: `systems/${CONST.MODULE_ID}/templates/item-templates/weapon.hbs`, itemType: "weapon", listSelector: ".weapon-list", header: game.i18n.localize("aoa.weapons")},
                {list: "armor", template: `systems/${CONST.MODULE_ID}/templates/item-templates/armor.hbs`, itemType: "armor", listSelector: ".armor-list", header: game.i18n.localize("aoa.armors")},
                {list: "skill", template: `systems/${CONST.MODULE_ID}/templates/item-templates/skill.hbs`, itemType: "skill", listSelector: ".skill-list", header: game.i18n.localize("aoa.skills")},
                {list: "language", template: `systems/${CONST.MODULE_ID}/templates/item-templates/only-name.hbs`, itemType: "language", listSelector: ".language-list", header: game.i18n.localize("aoa.languages")},
                {list: "gear", template: `systems/${CONST.MODULE_ID}/templates/item-templates/gear.hbs`, itemType: "gear", listSelector: ".gear-list"},
                {list: "spell", template: `systems/${CONST.MODULE_ID}/templates/item-templates/spell.hbs`, itemType: "spell", listSelector: ".spell-list", header: game.i18n.localize("aoa.spells") },
                {list: "ritual", template: `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`, itemType: "ritual", listSelector: ".ritual-list", header: game.i18n.localize("aoa.rituals")},
                {list: "cantrip", template: `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`, itemType: "cantrip", listSelector: ".cantrip-list", header: game.i18n.localize("aoa.cantrips")},
                {list: "trait", template: `systems/${CONST.MODULE_ID}/templates/item-templates/trait.hbs`, itemType: "trait", listSelector: ".trait-list", header: game.i18n.localize("aoa.traits")}
            ]
        });
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet pc-sheet ${context.cssClass}`

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

        return context;
    }

    render(force = false, options = {}) {


        return super.render(force, options);
    }

    async _renderInner(...args) {
        return super._renderInner(...args);
    }

    async _injectHTML(html) {
        super._injectHTML(html);



    }

    async _updateObject(event, formData) {
        return super._updateObject(event, formData);
    }

    static equip(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            item.update({
               "system.equipped": !item.system.equipped
            });
        }
    }

    static showItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            new ExtendedItemSheet(item).render(true, {editable: game.user.isGM});


        }
    }

}
