import {EditableList} from "../../editable-list.mjs";
import {actionHandler} from "../../actions.mjs";
import {ExtendedItemSheet} from "../items/extended-item-sheet.mjs";
import {inputMousewheel} from "../../utils/utils.mjs";
import {beautifyHeaders} from "../../utils/beautify-headers.mjs";
import {addDiceIconAnimation} from "../../utils/add-dice-icon-animation.mjs";

export class AoaActorSheet extends ActorSheet {


    static actions = {
        roll: actionHandler,
        editItem: this.editItem,
        attack: actionHandler,
        damage: actionHandler,
        use: actionHandler,
        showArt: this.showArt
    };

    async activateListeners(html) {
        await super.activateListeners(html);

        const actor = this.actor;

        this.prepareEditableLists();
        await this.activateEditableListListeners(html);

        beautifyHeaders(html.find(":header"));

        if(this.actor.permission < 3) {
            return
        }

        this.mapActions(html);

        html.find(".drag").on("dragstart", this._onDragStart.bind(this));
        html.find("[data-dtype='Number'][type='text']").on('wheel', (ev) => inputMousewheel(ev, actor));

        /* html.find("i.fa-dice-d20").hover(this.onRollHoverIn.bind(this), this.onRollHoverOut.bind(this));*/
        addDiceIconAnimation(html);
    }

    mapActions(html) {
        html.find("[data-action]").map((idx, e) => {
            const el = $(e);
            const actionSelector = el.data("action");
            const action = AoaActorSheet.actions[actionSelector];

            if (action) {
                el.click(action.bind(this, this.actor, el));
            } else {
                console.error(`No definition for '${actionSelector}' found`);
            }
        });
    }

    async activateEditableListListeners(html) {
        for (const el of this.editableLists) {
            await el.activateListeners(html);
        }
    }

    prepareEditableLists() {
        this.editableLists = this.options.editableLists?.map(el => {
            el.context = this.getData();
            el.object = this.actor;
            return new EditableList(el);
        }) ?? [];
    }

    static editItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            new ExtendedItemSheet(item).render(true, {editable: true});
        }
    }

    static showArt(actor) {
        new ImagePopout(actor.img, {
            title: actor.name,
            sharable: true,
            uuid: actor.uuid
        }).render(true);
    }

    // Drag and Drop
    _onDragStart(event) {
        const li = $(event.currentTarget);
        if ( event.target.classList.contains("content-link") ) return;

        // Create drag data
        let dragData;

        const id = li.closest("[data-item-id]").data("item-id");
        const documentType = li.closest("[data-document-type]").data("document-type");

        // Owned Items
        if ( id ) {
            const item = documentType === "Item"
                ? this.actor.items.get(id)
                : documentType === "ActiveEffect"
                    ? this.actor.effects.get(id)
                    : console.error(`No drag for '${documentType}`);

            dragData = item.toDragData();
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
