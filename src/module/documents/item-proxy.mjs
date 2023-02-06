//Provide a type string to class object mapping to keep our code clean
import {GearItem} from "./items/gear-item.mjs";
import {WeaponItem} from "./items/weapon-item.mjs";
import {ArmorItem} from "./items/armor-item.mjs";
import {SkillItem} from "./items/skill-item.mjs";
import {SpellItem} from "./items/spell-item.mjs";
import {PlaybookItem} from "./items/playbook-item.mjs";
import {PlaybookPhaseItem} from "./items/playbook-phase-item.mjs";

const mappings = {
    gear: GearItem,
    weapon: WeaponItem,
    armor: ArmorItem,
    skill: SkillItem,
    spell: SpellItem,
    playbook: PlaybookItem,
    "pb-phase": PlaybookPhaseItem
};

export const ItemProxy = new Proxy(function () {}, {
    //Will intercept calls to the "new" operator
    construct: function (target, args) {
        const [data] = args;

        //Handle missing mapping entries
        if (!mappings.hasOwnProperty(data.type))
            throw new Error("Unsupported Entity type for create(): " + data.type);

        //Return the appropriate, actual object from the right class
        return new mappings[data.type](...args);
    },

    //Property access on this weird, dirty proxy object
    get: function (target, prop, receiver) {
        switch (prop) {
            case "create":
            case "createDocuments":
                //Calling the class' create() static function
                return function (data, options) {
                    if (data.constructor === Array) {
                        //Array of data, this happens when creating Actors imported from a compendium
                        return data.map(i => Item.create(i, options));
                    }

                    if (!mappings.hasOwnProperty(data.type))
                        throw new Error("Unsupported Entity type for create(): " + data.type);

                    return mappings[data.type].create(data, options);
                };

            case Symbol.hasInstance:
                //Applying the "instanceof" operator on the instance object
                return function (instance) {
                    return Object.values(mappings).some(i => instance instanceof i);
                };

            default:
                //Just forward any requested properties to the base Actor class
                return Item[prop];
        }
    },
});
