import {trimNewLineWhitespace} from "./utils.mjs";
import {CONST} from "./const.mjs";

const listTemplate = `systems/${CONST.MODULE_ID}/templates/editable-list.hbs`;

export class EditableList {
    constructor({list, itemType, context,  actor, template, listSelector, header, documentType = "Item", identifier = "name", gmEdit = false }) {
        this.list = foundry.utils.getProperty(context, list);
        this.itemType = itemType;
        this.actor = actor;
        this.documentType = documentType;
        this.identifier = identifier;
        this.gmEdit = gmEdit;
        this._template = template;
        this._listSelector = listSelector;
        this._header = header;
    }

    async activateListeners(html) {
       const content = await renderTemplate(
           listTemplate,
           {
               list: this.list,
               template: this._template,
               itemType: this.itemType,
               editable: game.user.isGM || !this.gmEdit,
               header: this._header});
       const target = html.find(this._listSelector);
       target.append(content);

       if(this.gmEdit && !game.user.isGM){
            return;
       }

       target.find(".new").change(this.newItem.bind(this));
       target.find(".item input").change(this.changeItem.bind(this));
    }

    newItem = (ev) => {
        const ct = $(ev.currentTarget);
        const itemType = ct.closest("[data-item-type]").data("itemType");
        let value = ct.val();

        if (typeof value === 'string') value = trimNewLineWhitespace(value);

        if(!value || value === "") {
            return;
        }

        const newData = {};
        newData.type = itemType;
        newData[this.identifier] = value;

        this.actor.createEmbeddedDocuments(this.documentType, [newData]);
    };

    changeItem = (ev) => {
        const ct = $(ev.currentTarget);
        const itemId = ct.closest('[data-item-id]').data('itemId');
        const property = ct.closest('[data-property]').data('property');
        const type = ct.prop("type");
        let value = type === "checkbox" ? ct.prop("checked") : ct.val();

        if (typeof value === 'string') value = trimNewLineWhitespace(value);

        if((!value || value === "") && property === this.identifier) {
            this.actor.deleteEmbeddedDocuments(this.documentType, [itemId])
        } else
        {
            const updateData = {
                _id: itemId
            };

            updateData[property] = value;

            this.actor.updateEmbeddedDocuments(this.documentType, [updateData])
        }
    };
}


