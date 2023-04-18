import {CONST} from "../../const.mjs";
import {AoaActorSheet} from "./aoa-actor-sheet.mjs";
import {PartView} from "../../apps/part-view.mjs";
import {pcTemplates} from "../../init/load-handlebar-templates.mjs";

export class MonsterSheet extends AoaActorSheet {

    static actions = foundry.utils.mergeObject(super.actions, {
        hitDie: MonsterSheet.hitDie,
        showEffects: MonsterSheet.showEffects
    });

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "actor", "monster", "flexcol", "animate__animated", "animate__faster", CONST.OPEN_ANIMATION_CLASS],
            template: `systems/${CONST.MODULE_ID}/templates/actors/${this.name.toLowerCase().replace("sheet", "-sheet")}.hbs`,
            width: 400,
            height: 600,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "statistics"}],
            resizable: false,
            editableLists: [
                {list: "attack", template: `systems/${CONST.MODULE_ID}/templates/item-templates/attack.hbs`, itemType: "attack", listSelector: ".attack-list", header: game.i18n.localize("aoa.attacks")},
            ]
        });
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet monster-sheet ${context.cssClass}`

        const arrayNames = ["attack"];

        arrayNames.forEach(an => context[an] = this.actor.items
            .filter(i => i.type === an)
            .sort((a,b)=>(a.sort || 0) - (b.sort||0)));


        return context;
    }

    static async hitDie(actor) {
        const roll = await new Roll(`${actor.system.hitDie.number}${actor.system.hitDie.dieType}+${actor.system.hitDie.bonus}`).roll({async: true})

        await actor.update({
            "system.hp.value": roll.total,
            "system.hp.max": roll.total
        });

    }

    static async showEffects(actor) {
        PartView.create(actor, pcTemplates.effects, [{list: "effects", template: `systems/${CONST.MODULE_ID}/templates/item-templates/effect.hbs`, itemType: "effect", listSelector: ".effect-list", identifier: "label", documentType: "ActiveEffect", gmEdit: true}]);
    }


}
