import {EditableList} from "../../editable-list.mjs";
import {actionHandler} from "../../actions.mjs";
import {ExtendedItemSheet} from "../items/extended-item-sheet.mjs";

export class AoaActorSheet extends ActorSheet {

    static actions = {
        roll: actionHandler,
        editItem: this.editItem,
        attack: actionHandler,
        damage: actionHandler,
        use: actionHandler
    };

    async activateListeners(html) {
        await super.activateListeners(html);

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
            const action = AoaActorSheet.actions[actionSelector];


            if(action) {
                el.click(action.bind(this, this.actor, el));
            } else {
                console.error(`No definition for '${actionSelector}' found`);
            }
        });

        html.find(".drag").on("dragstart", this._onDragStart.bind(this));

        this.beautifyHeaders(html.find(":header"));

    }

    beautifyHeaders(html) {

        let target = html

        target.html(beautify);

        function beautify() {
            const el = $(this);

            if(el.children().length > 0){
                el.children().html(beautify);
            }
            else {
                const newText = el
                    .text()
                    .replace(/[a-zä-ü]*/g, '<span class="move-up">$&</span>')
                    .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
                return newText;
            }
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

    static editItem(actor, html) {
        const itemId = html.closest("[data-item-id]").data("item-id");
        if(itemId) {
            const item = actor.items.get(itemId);

            new ExtendedItemSheet(item).render(true, {editable: true});


        }
    }
}
