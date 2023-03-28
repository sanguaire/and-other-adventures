import {CONST as AOA_CONST} from "./const.mjs";
import {SystemRoll} from "./systems-roll.mjs";
import {inputMousewheel} from "./utils.mjs";

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

    actions[action][actionType](actor, actionKey ?? itemId, actionFlavor);
}

function render(html) {
    html.find(":header").html(function () {
        return $(this)
            .text()
            .replace(/[a-zä-ü]*/g, '<span class="move-up">$&</span>')
            .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
    });

    html.find("[name='modifier']").change(modifierChange);
    html.find("[name='modifier']").on("wheel", inputMousewheel);
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

async function renderDialogContent(rollKey, {skills, keys} = {}) {
    const dlgTemplate = `systems/${AOA_CONST.MODULE_ID}/templates/dialogs/roll.hbs`
    const dlgData = {
        dialogHeader: game.i18n.localize("aoa.rolls." + rollKey),
        skills,
        keys,
        cssClass: "aoa-sheet"
    }

    const content = await renderTemplate(dlgTemplate, dlgData);
    return content;
}

const attackNotAllowedForCombatStance = (cs) => ["protective", "commanding"].includes(cs);

const execute = async (innerCallback, html, ...args) => {
    html.addClass(AOA_CONST.CLOSE_ANIMATION_CLASS);

    const formElement = html[0].querySelector("form");
    const formData = new FormDataExtended(formElement);

    await innerCallback(formData, ...args);
};

const abilityRoll = async (actor, abilityKey, flavor) => {
    const content = await renderDialogContent(abilityKey, {skills: actor.items.filter(i => i.type === "skill")});
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
        let skillBonus = 0;

        console.log(formData);

        if (formData.object.skill && formData.object.skill !== "") {
            skill = actor.items.get(formData.object.skill);
            skillBonus = Number.parseInt(skill.system.bonus);
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

const saveRoll = async (actor, saveKey) => {
    const content = await renderDialogContent(saveKey);
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

        const content = await renderDialogContent("ranged");
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

    const content = await renderDialogContent("ranged");
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

    const content = await renderDialogContent("melee");
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

    const content = await renderDialogContent("melee");
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
    const content = await renderDialogContent("damageMelee", {});
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

        const roll = new SystemRoll({roller: actor, type: "damageMelee", item: item, mod: modifier});
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
    const content = await renderDialogContent("damageRanged", {});
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

        const roll = new SystemRoll({roller: actor, type: "damageRanged", item: item, mod: modifier});
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

        console.log(formData);

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
        name: game.i18n.localize("aoa.uses"),
        flavor,
        actorName: actor.name,
        actorId: actor.id,
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
        spell: spellUse
    }
}

