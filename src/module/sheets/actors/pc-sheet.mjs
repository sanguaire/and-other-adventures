import {CONST} from "../../const.mjs";
import {EditableList} from "../../editable-list.mjs";
import {actionHandler} from "../../actions.mjs";
import {ExtendedItemSheet} from "../items/extended-item-sheet.mjs";

export class PcSheet extends ActorSheet {
    actions = {
        roll: actionHandler,
        equip: this.equip,
        showItem: this.showItem,
        editItem: this.editItem,
        attack: actionHandler,
        damage: actionHandler,
        use: actionHandler
    }

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
                {list: "cantrip", template: `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`, itemType: "cantrip", listSelector: ".cantrip-list", header: game.i18n.localize("aoa.cantrips")}
            ]
        });
    }


    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet pc-sheet ${context.cssClass}`

        for(const [key, value] of Object.entries(context.actor.system.abilities)) {
            value.modifierDesc = game.i18n.localize(`${CONST.MODULE_SCOPE}.abilities-mod.${key}`);
        }

        const arrayNames = ["weapon", "armor", "gear", "spell", "ritual", "cantrip", "language", "skill"];

        arrayNames.forEach(an => context[an] = this.actor.items
            .filter(i => i.type === an)
            .sort((a,b)=>(a.sort || 0) - (b.sort||0)));

        return context;
    }

    async activateListeners(html) {
        super.activateListeners(html);

        this.editableLists = this.options.editableLists.map(el => {
            el.context = this.getData();
            el.actor = this.actor;
            return new EditableList(el);
        });

        for (const el of this.editableLists) {
            await el.activateListeners(html);
        }

        html.find("[data-action]").map((idx,e) => {
            const el = $(e);
            const actionSelector = el.data("action");
            const action = this.actions[actionSelector];


            if(action) {
                el.click(action.bind(null, this.actor, el));
            } else {
                console.error(`No definition for '${actionSelector}' found`);
            }
        });

        html.find(".drag").on("dragstart", this._onDragStart.bind(this));

        html.find(":header").html(function() {
           return $(this)
               .text()
               .replace(/[a-zä-ü]*/g, '<span class="move-up">$&</span>')
               .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
        });
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

    equip(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            item.update({
               "system.equipped": !item.system.equipped
            });
        }
    }

    showItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            new ExtendedItemSheet(item).render(true, {editable: false});


        }
    }

    editItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            new ExtendedItemSheet(item).render(true, {editable: true});


        }
    }

    _onDragStart(event) {
        const li = $(event.currentTarget);
        if ( event.target.classList.contains("content-link") ) return;

        // Create drag data
        let dragData;

        const itemId = li.closest("[data-item-id]").data("item-id");

        // Owned Items
        if ( itemId ) {
            const item = this.actor.items.get(itemId);
            dragData = item.toDragData();
        }

        const effectId = li.closest("[data-effect-id]").data("effect-id");

        // Active Effect
        if ( effectId ) {
            const effect = this.actor.effects.get(effectId);
            dragData = effect.toDragData();
        }

        if ( !dragData ) return;

        // Set data transfer
        event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    async _onDropItem(event, data) {
        if ( !this.actor.isOwner ) return false;
        const item = await Item.implementation.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if ( this.actor.uuid === item.parent?.uuid ) return this._onSortItem(event, itemData);

        if(itemData.type === "class" && this.actor.itemTypes.class.length > 0) {
            await this.actor.deleteEmbeddedDocuments("Item", this.actor.itemTypes.class.map(cl => cl._id));
        }

        return super._onDropItemCreate(itemData);
    }
}
