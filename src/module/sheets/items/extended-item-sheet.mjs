import {CONST} from "../../const.mjs";
import {trimNewLineWhitespace} from "../../utils.mjs";

export class ExtendedItemSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "item", "flexcol"],
            template: `systems/${CONST.MODULE_ID}/templates/items/item-sheet.hbs`,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "item"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
            resizable: true
        });
    }

    async _render(force, options) {
        await super._render(force, mergeObject(options, {
            width: this.getWidth(),
            height: this.getHeight(),
        }));

        this.element.find("textarea").each(function() {
            $(this).css("height", "auto");
            $(this).css("height", $(this)[0].scrollHeight + "px");
        });
    }

    getWidth() {
        switch(this.item.type){
            case "class":
                return 875;
            default:
                return 500;
        }

        const t = new Tabs
    }

    getHeight() {
        switch(this.item.type){
            case "class":
                return 670;
            default:
                return 350;
        }
    }

    getData(options = {}) {
        const context = super.getData(options);
        context.cssClass = `aoa-sheet item-sheet ${context.cssClass}`
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(":header").html(function() {
            return $(this)
                .text()
                .replace(/[a-zä-ü].*/g, '<span class="move-up">$&</span>')
                .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
        });

        html.find(".new-ability").change(this.newAbility.bind(this));
        html.find(".change-ability").change(this.changeAbility.bind(this));

        html.find("textarea").html(function() {
           return $(this)
               .text()
               .replace(/(^\s*)|(\s*$)/gi,"")
               .replace(/[ ]{2,}/gi," ")
               .replace(/\n /gi,"\n");
        });


    }

    _onChangeRange(event) {
        super._onChangeRange(event);
    }

    newAbility(ev) {
        const ct = $(ev.currentTarget);
        let value = ct.val();

        if (typeof value === 'string') value = trimNewLineWhitespace(value);

        if(!value || value === "") {
            return;
        }

        const newId = foundry.utils.randomID();

        this.item.system.classAbilities.push({id: newId, name: value, description: ""});

        this.item.update({
            "system.classAbilities": this.item.system.classAbilities
        });
        this.render(true);
    }

    changeAbility = (ev) => {
        const ct = $(ev.currentTarget);
        const itemId = ct.closest('[data-item-id]').data('itemId');
        const property = ct.closest('[data-property]').data('property');
        const type = ct.prop("type");
        let value = type === "checkbox" ? ct.prop("checked") : ct.val();

        if (typeof value === 'string') value = trimNewLineWhitespace(value);

        if((!value || value === "") && property === "name") {
            this.item.update({
                "system.classAbilities": this.item.system.classAbilities.filter(a => a.id !== itemId)
            })
        } else
        {
            const idx = this.item.system.classAbilities.map(a => a.id).indexOf(itemId);
            const item = this.item.system.classAbilities[idx];

            item[property] = value;

            this.item.system.classAbilities.splice(idx, 1, item);

            this.item.update({
                "system.classAbilities": this.item.system.classAbilities
            })
        }
    };

}
