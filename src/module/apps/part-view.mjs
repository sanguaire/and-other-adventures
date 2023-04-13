import {CONST} from "../const.mjs";
import {EditableList} from "../editable-list.mjs";
import {beautifyHeaders} from "../utils/beautify-headers.mjs";

export class PartView {
    static create(object, part, editableLists) {

        const view = object instanceof Actor
            ? new ActorPartView(object, {editableLists})
            : object instanceof Item
                ? new ItemPartView(object, {editableLists})
                : null;

        if(!view) {
            throw new Error("Wrong object type.");
        }

        view.part = part;

        return view.render(true);
    }
}
class ActorPartView extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, options);
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet ${context.cssClass}`
        context.part = this.part;

        return context
    }

    _getHeaderButtons() {
        const buttons = [
            {
                label: "Close",
                class: "close",
                icon: "fas fa-times",
                onclick: () => this.close()
            }
        ];

        return buttons;
    }

    async activateListeners(html) {
        await super.activateListeners(html);

        prepareEditableLists.apply(this);
        await activateEditableListListeners.apply(this, html);

        mapActions.apply(this, html);

        beautifyHeaders(html.find(":header"));

    }
}
class ItemPartView extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, options);
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet ${context.cssClass}`
        context.part = this.part;
        context.effects = this.item.effects.map(e => e.toObject());


        return context
    }

    get effects() {
        return this.item.effects;
    }

    async activateListeners(html) {
        await super.activateListeners(html);

        prepareEditableLists.apply(this);
        await activateEditableListListeners.apply(this, html);

        mapActions.apply(this, html);

        beautifyHeaders(html.find(":header"));

    }
}

const options = {
    template: `systems/${CONST.MODULE_ID}/templates/apps/part-sheet.hbs`,
    classes: [CONST.MODULE_SCOPE, "sheet", "request", "flexcol", "animate__animated", "animate__faster", CONST.OPEN_ANIMATION_CLASS],
    width: 800,
    height: 500,
    resizable: false,
    sheetConfig: false
}

function prepareEditableLists() {
    this.editableLists = this.options.editableLists?.map(el => {
        el.context = this.getData();
        el.object = this.actor ?? this.item;
        return new EditableList(el);
    }) ?? [];
}

async function activateEditableListListeners(html) {
    for (const el of this.editableLists) {
        await el.activateListeners($(html));
    }
}

function mapActions(html) {
    $(html).find("[data-action]").map((idx, e) => {
        const el = $(e);
        const actionSelector = el.data("action");
        const action = actions[actionSelector];

        if (action) {
            el.click(action.bind(this, this.actor ?? this.item, el));
        } else {
            console.error(`No definition for '${actionSelector}' found`);
        }
    });
}


function editEffect(object, html) {
    const effectId = $(html).closest("[data-item-id]").data("item-id");

    if(effectId) {
        const effect = object.effects.get(effectId);

        effect.sheet.render(true);
    }
}

async function toggleEffect(object, html) {
    const effectId = $(html).closest("[data-item-id]").data("item-id");

    if(effectId) {
        const effect = object.effects.get(effectId);

        await effect.update({
            "disabled": !effect.disabled
        });
    }
}

const actions = {
    editEffect: editEffect,
    disable: toggleEffect
}
