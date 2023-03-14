import {CONST} from "../../const.mjs";
import {AoaActorSheet} from "./aoa-actor-sheet.mjs";
import {actionHandler} from "../../actions.mjs";

export class MonsterSheet extends AoaActorSheet {

    static actions = foundry.utils.mergeObject(super.actions, {
        hitDie: MonsterSheet.hitDie,
        monsterSave: actionHandler
    });

    static monsterSave = {
        1:  {
            poison: 14,
            breathWeapon: 17,
            polymorph: 15,
            spell: 17,
            magicItem: 16
        },
        2:  {
            poison: 14,
            breathWeapon: 17,
            polymorph: 15,
            spell: 17,
            magicItem: 16
        },
        3:  {
            poison: 13,
            breathWeapon: 16,
            polymorph: 14,
            spell: 14,
            magicItem: 15
        },
        4:  {
            poison: 13,
            breathWeapon: 16,
            polymorph: 14,
            spell: 14,
            magicItem: 15
        },
        5:  {
            poison: 11,
            breathWeapon: 14,
            polymorph: 12,
            spell: 12,
            magicItem: 13
        },
        6:  {
            poison: 11,
            breathWeapon: 14,
            polymorph: 12,
            spell: 12,
            magicItem: 13
        },
        7:  {
            poison: 10,
            breathWeapon: 13,
            polymorph: 11,
            spell: 11,
            magicItem: 12
        },
        8:  {
            poison: 10,
            breathWeapon: 13,
            polymorph: 11,
            spell: 11,
            magicItem: 12
        },
        9:  {
            poison: 8,
            breathWeapon: 11,
            polymorph: 9,
            spell: 9,
            magicItem: 10
        },
        10:  {
            poison: 8,
            breathWeapon: 11,
            polymorph: 9,
            spell: 9,
            magicItem: 10
        },
        11:  {
            poison: 7,
            breathWeapon: 10,
            polymorph: 8,
            spell: 8,
            magicItem: 9
        },
        12:  {
            poison: 7,
            breathWeapon: 10,
            polymorph: 8,
            spell: 8,
            magicItem: 9
        },
        13:  {
            poison: 5,
            breathWeapon: 8,
            polymorph: 6,
            spell: 5,
            magicItem: 7
        },
        14:  {
            poison: 5,
            breathWeapon: 8,
            polymorph: 6,
            spell: 5,
            magicItem: 7
        },
        15:  {
            poison: 4,
            breathWeapon: 7,
            polymorph: 5,
            spell: 4,
            magicItem: 6
        },
        16:  {
            poison: 4,
            breathWeapon: 7,
            polymorph: 5,
            spell: 4,
            magicItem: 6
        },
        17:  {
            poison: 3,
            breathWeapon: 6,
            polymorph: 4,
            spell: 4,
            magicItem: 5
        },
    };


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "actor", "flexcol"],
            template: `systems/${CONST.MODULE_ID}/templates/actors/${this.name.toLowerCase().replace("sheet", "-sheet")}.hbs`,
            width: 300,
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
        console.log(`Rolling hitDie ${roll.total}`);
        console.log(roll);

        await actor.update({
            "system.hp.value": roll.total,
            "system.hp.max": roll.total
        });

    }

    static async save(actor) {



    }
}
