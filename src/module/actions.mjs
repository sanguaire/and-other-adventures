import {CONST as AOA_CONST} from "./const.mjs";
import {SystemRoll} from "./systems-roll.mjs";
import {inputMousewheel} from "./utils/utils.mjs";
import {beautifyHeaders} from "./utils/beautify-headers.mjs";

const dialogClasses = [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol", "animate__animated", AOA_CONST.OPEN_ANIMATION_CLASS];

const baseDialogData = {
    buttons: {
        roll: {
            label: "",
            icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
        }
    },
    close: html => html.addClass(AOA_CONST.CLOSE_ANIMATION_CLASS),
    default: "roll",
    render
};

export const actionHandler = (actor, html) => {
    const action = html.closest("[data-action]").data("action");
    const actionType = html.closest("[data-action-type]").data("action-type");
    const actionKey = html.closest("[data-action-key]").data("action-key");
    const actionFlavor = html.closest("[data-action-flavor]").data("action-flavor");
    const itemId = html.closest("[data-item-id]").data("item-id");

    executeAction(actor, action, actionType, actionKey ?? itemId, actionFlavor);
}

export const executeAction = (actor, action, actionType, ...args) => {
    actions[action][actionType](actor, ...args);
}

function render(html) {
    beautifyHeaders(html.find(":header"));

    html.find("[name='modifier']").change(modifierChange);
    html.find("[name='modifier']").on("wheel", inputMousewheel);

    html.find("[data-action='difficulty'").click((ev) => {
        const target = $(ev.currentTarget);
        const actionType = target.data("action-type");
        const modifierElement = html.find("[name='modifier']");

        const modifiers = {
            easy: 2,
            normal: 0,
            hard: -2,
            veryHard: -5,
            impossible: -10
        }

        if (modifiers.hasOwnProperty(actionType)) {
            modifierElement.val(HandlebarsHelpers.numberFormat(modifiers[actionType], Object.create({
                hash: {
                    decimals: 0,
                    sign: true
                }
            })));
        } else {
            console.error(`Wrong action type '${actionType}'`);
        }
    });
}

function modifierChange(ev) {
    const target = ev.target;
    const value = Number.parseInt(target.value);

    if (value) {
        target.value = HandlebarsHelpers.numberFormat(value, Object.create({
            hash: {
                decimals: 0,
                sign: true
            }
        }));
    }

}

async function renderDialogContent(rollKey, {action = "roll", skills, keys, modifier = 0} = {}) {
    const dlgTemplate = `systems/${AOA_CONST.MODULE_ID}/templates/dialogs/roll.hbs`
    const dlgData = {
        dialogHeader: game.i18n.localize("aoa.rolls." + rollKey),
        skills,
        keys,
        modifier,
        cssClass: "aoa-sheet",
        action
    }

    return await renderTemplate(dlgTemplate, dlgData);
}

const attackNotAllowedForCombatStance = (cs) => ["protective", "commanding"].includes(cs);

const execute = async (innerCallback, html, ...args) => {
    html.addClass(AOA_CONST.CLOSE_ANIMATION_CLASS);

    const formElement = html[0].querySelector("form");
    const formData = new FormDataExtended(formElement);

    await innerCallback(formData, ...args);
};

const abilityRoll = async (actor, abilityKey, flavor, modifier = 0) => {
    const physicalAbilityKeys = ["str", "con", "dex"];
    const mentalAbilityKeys = ["int", "wis", "cha"];
    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const permanentModifier = permanentModifiers.allRolls
        + permanentModifiers.abilities.all
        + permanentModifiers.abilities[abilityKey]
        + (physicalAbilityKeys.includes(abilityKey) ? permanentModifiers.abilities.physical : 0)
        + (mentalAbilityKeys.includes(abilityKey) ? permanentModifiers.abilities.mental : 0);

    modifier += permanentModifier;

    const content = await renderDialogContent(abilityKey, {
        skills: actor.items.filter(i => i.type === "skill"),
        modifier
    });
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.ability"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor, abilityKey)
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor, abilityKey) {
        let skill = undefined;

        if (formData.object.skill && formData.object.skill !== "") {
            skill = actor.items.get(formData.object.skill);
        }

        const modifier = Number.parseInt(formData.object.modifier);
        const roll = new SystemRoll(
            {
                roller: actor,
                key: abilityKey,
                type: "ability",
                mod: modifier,
                flavor: flavor,
                skill: skill
            });
        await roll.toMessage();
    }
};

const saveRoll = async (actor, saveKey, flavor, modifier = 0) => {
    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const permanentModifier = permanentModifiers.allRolls
        + permanentModifiers.saves.all
        + permanentModifiers.saves[saveKey];

    modifier += permanentModifier;

    const content = await renderDialogContent(saveKey, {modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.save"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor, saveKey),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor, saveKey) {
        const modifier = Number.parseInt(formData.object.modifier);

        const knackBonus = actor.system.class?.hasKnacks ? actor.system.knacks.resilience : 0;

        const roll = new SystemRoll({roller: actor, key: saveKey, type: "save", mod: modifier + knackBonus});
        await roll.toMessage();

    }
};

const rangedAttack = async (actor, itemId) => {
    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.attacks.all
        + permanentModifiers.attacks.ranged;

    const item = actor.items.get(itemId);

    if (attackNotAllowedForCombatStance(actor.system.combatStance)) {
        ui.notifications.error(`${game.i18n.localize("aoa.no-attack-for-combat-stance")}: ${game.i18n.localize("aoa.stances." + actor.system.combatStance)}`);
        return;
    }

    if (item) {
        if (!item.system.equipped) {
            ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
            return;
        }

        if (item.system.usesAmmo) {
            const ammoItem = actor.items.get(item.system.ammoId);

            if (!ammoItem || ammoItem.system.quantity.value < 1) {
                ui.notifications.error(`${game.i18n.localize("aoa.no-ammo")} '${item.name}'`);
                return;
            }
        }

        const content = await renderDialogContent("ranged", {modifier});
        const data = foundry.utils.mergeObject(baseDialogData,
            {
                title: game.i18n.localize("aoa.rolls.ranged"),
                content: content,
                buttons: {
                    roll: {
                        callback: async (html) => await execute(callback, html, actor, item),
                    }
                }
            });

        new Dialog(data,
            {
                classes: dialogClasses
            }
        ).render(true);
    }

    async function callback(formData, actor, item) {
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        if (item.system.usesAmmo) {
            const ammoItem = actor.items.get(item.system.ammoId);

            if (ammoItem) {
                await actor.updateEmbeddedDocuments(
                    "Item",
                    [{
                        _id: item.system.ammoId,
                        system: {
                            quantity: {
                                value: ammoItem.system.quantity.value - 1
                            }
                        }
                    }]);
            }
        } else {
            const newQuantity = item.system.quantity.value - 1;

            await actor.updateEmbeddedDocuments(
                "Item",
                [
                    {
                        _id: item.id,
                        system: {
                            quantity: {
                                value: newQuantity
                            },
                            equipped: item.system.equipped && newQuantity > 0
                        }
                    }
                ]
            )
        }

        const roll = new SystemRoll({roller: actor, type: "ranged", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const rangedBasicRoll = async (actor) => {
    if (attackNotAllowedForCombatStance(actor.system.combatStance)) {
        ui.notifications.error(`${game.i18n.localize("aoa.no-attack-for-combat-stance")}: ${game.i18n.localize("aoa.stances." + actor.system.combatStance)}`);
        return;
    }

    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.attacks.all
        + permanentModifiers.attacks.ranged;

    const content = await renderDialogContent("ranged", {modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.ranged"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor) {
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        const target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "ranged", mod: modifier, target});
        await roll.toMessage();
    }
};

const monsterAttack = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    const content = await renderDialogContent("monster");
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.monster"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor, item),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor, item) {
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        const target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "monster", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const meleeAttack = async (actor, itemId) => {
    if (attackNotAllowedForCombatStance(actor.system.combatStance)) {
        ui.notifications.error(`${game.i18n.localize("aoa.no-attack-for-combat-stance")}: ${game.i18n.localize("aoa.stances." + actor.system.combatStance)}`);
        return;
    }

    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    if (!item.system.equipped) {
        ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
        return;
    }

    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.attacks.all
        + permanentModifiers.attacks.melee;

    const content = await renderDialogContent("melee", {modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.melee"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor, item),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor, item) {
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        const target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "melee", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const meleeBasicRoll = async (actor) => {

    if (attackNotAllowedForCombatStance(actor.system.combatStance)) {
        ui.notifications.error(`${game.i18n.localize("aoa.no-attack-for-combat-stance")}: ${game.i18n.localize("aoa.stances." + actor.system.combatStance)}`);
        return;
    }

    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.attacks.all
        + permanentModifiers.attacks.melee;

    const content = await renderDialogContent("melee", {modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.melee"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor) {
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        const target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "melee", mod: modifier, target});
        await roll.toMessage();
    }
};

const meleeDamage = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    if (!item.system.equipped) {
        ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
        return;
    }

    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.damage.all
        + permanentModifiers.damage.melee;

    const content = await renderDialogContent("damageMelee", {action: "damage", modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.damage"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, item),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, item) {
        const modifier = Number.parseInt(formData.object.modifier);
        const targetToken = game.user.targets.first();

        const roll = new SystemRoll({roller: actor, type: "damageMelee", item: item, mod: modifier, targetToken});
        await roll.toMessage();

    }
};

const rangedDamage = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    if (!item.system.equipped) {
        ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
        return;
    }

    const permanentModifiers = actor.system.gmConfig.permanentModifiers;
    const modifier = permanentModifiers.allRolls
        + permanentModifiers.damage.all
        + permanentModifiers.damage.ranged;

    const content = await renderDialogContent("damageRanged", {action: "damage", modifier});
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.damage"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, item),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, item) {
        const modifier = Number.parseInt(formData.object.modifier);
        const targetToken = game.user.targets.first();

        const roll = new SystemRoll({roller: actor, type: "damageRanged", item: item, mod: modifier, targetToken});
        await roll.toMessage();
    }
};

const monsterDamage = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (item) {
        const roll = new SystemRoll({roller: actor, type: "damageMonster", item: item});
        await roll.toMessage();
    }
};

const monsterSaveRoll = async (actor) => {
    const content = await renderDialogContent("save", {
        keys: {
            poison: game.i18n.localize("aoa.saves.poison"),
            breathWeapon: game.i18n.localize("aoa.saves.breathWeapon"),
            polymorph: game.i18n.localize("aoa.saves.polymorph"),
            spell: game.i18n.localize("aoa.saves.spell"),
            magicItem: game.i18n.localize("aoa.saves.magicItem"),
        }
    });
    const data = foundry.utils.mergeObject(baseDialogData,
        {
            title: game.i18n.localize("aoa.rolls.save"),
            content: content,
            buttons: {
                roll: {
                    callback: async (html) => await execute(callback, html, actor),
                }
            }
        });

    new Dialog(data,
        {
            classes: dialogClasses
        }
    ).render(true);

    async function callback(formData, actor) {
        let abilityKey = "";

        if (formData.object.key && formData.object.key !== "") {
            abilityKey = formData.object.key;
        }

        const modifier = Number.parseInt(formData.object.modifier);
        const roll = new SystemRoll(
            {
                roller: actor,
                key: abilityKey,
                type: "save",
                mod: modifier
            });
        await roll.toMessage();
    }
};

const spellUse = async (actor, itemId, flavor) => {
    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    const chatData = {
        name: game.i18n.localize("aoa.casts"),
        flavor,
        actorName: actor.name,
        actorId: actor.uuid,
        description: item.system.description
    }
    const content = await renderTemplate(`systems/${AOA_CONST.MODULE_ID}/templates/chat/use.hbs`, chatData);
    ChatMessage.create({
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content
    }, {rollMode: game.settings.get("core", "rollMode")});
    actor.update({
        "system.usedSpells": actor.system.usedSpells + 1
    });

}

const gearUse = async (actor, itemId, flavor) => {
    const item = actor.items.get(itemId);

    if (!item) {
        return;
    }

    const quantity = item.system.quantity.value;

    if (quantity < 1) {
        return;
    }

    await item.update({
        "system.quantity.value": quantity - 1
    });

    const chatData = {
        name: game.i18n.localize("aoa.uses"),
        flavor,
        actorName: actor.name,
        actorId: actor.uuid,
        description: item.system.description
    }
    const content = await renderTemplate(`systems/${AOA_CONST.MODULE_ID}/templates/chat/use.hbs`, chatData);
    ChatMessage.create({
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content
    }, {rollMode: game.settings.get("core", "rollMode")});

}

const igniteTorch = async (actor) => {
    await createLightEffect(actor, "torch")
}

const igniteCandle = async (actor) => {
    await createLightEffect(actor, "candle")
}

const igniteLamp = async (actor) => {
    await createLightEffect(actor, "lamp")
}

const igniteLantern = async (actor) => {
    await createLightEffect(actor, "lantern")
}

const igniteCantrip = async (actor) => {
    await createLightEffect(actor, "cantrip")
}

const createLightEffect = async (actor, lightName) => {
    lightName = lightName.toLowerCase();

    const definitions = {
        torch: {
            seconds: 3600,
            icon: "icons/sundries/lights/torch-brown-lit.webp",
            priority: 2
        },
        candle: {
            seconds: 3600,
            icon: "icons/sundries/lights/candle-unlit-yellow.webp",
            priority: 1
        },
        lamp: {
            seconds: 21600,
            icon: "icons/sundries/lights/lantern-iron-yellow.webp",
            priority: 3
        },
        lantern: {
            seconds: 21600,
            icon: "icons/sundries/lights/lantern-iron-lit-yellow.webp",
            priority: 4
        },
        cantrip: {
            seconds: 0,
            icon: "icons/magic/light/explosion-star-blue-small.webp",
            priority: 5
        }
    }

    const lightObject = {};

    if(game.version.startsWith("11")) {
        lightObject.name = game.i18n.localize(`aoa.light.${lightName}`);
    } else {
        lightObject.label =  game.i18n.localize(`aoa.light.${lightName}`);
    }

    await actor.createEmbeddedDocuments("ActiveEffect", [
        mergeObject(lightObject,
        {
        "flags": {
            "and-other-adventures": {
                "needsConcentration": lightName === "cantrip"
            }
        },
        "changes": [
            {
                "key": "Light",
                "mode": 0,
                "value": lightName,
                "priority": definitions[lightName].priority
            }
        ],
        "disabled": false,
        "duration": {
            "seconds": definitions[lightName].seconds
        },
        "icon": definitions[lightName].icon
    })]);
}

const actions = {
    roll: {
        abilities: abilityRoll,
        saves: saveRoll,
        monsterSave: monsterSaveRoll,
        melee: meleeBasicRoll,
        ranged: rangedBasicRoll
    },
    attack: {
        ranged: rangedAttack,
        melee: meleeAttack,
        monster: monsterAttack,
    },
    damage: {
        ranged: rangedDamage,
        melee: meleeDamage,
        monster: monsterDamage,
    },
    use: {
        spell: spellUse,
        gear: gearUse
    },
    light: {
        torch: igniteTorch,
        candle: igniteCandle,
        lamp: igniteLamp,
        lantern: igniteLantern,
        cantrip: igniteCantrip,
    }
}

