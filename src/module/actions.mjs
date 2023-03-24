import {CONST as AOA_CONST} from "./const.mjs";
import {SystemRoll} from "./systems-roll.mjs";
import {inputMousewheel} from "./utils.mjs";

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

const abilityRoll = async (actor, abilityKey, flavor) => {
    console.log(actor);
    console.log(abilityKey);

    const content = await renderDialogContent(abilityKey, {skills: actor.items.filter(i => i.type === "skill")});

    new Dialog({
            title: "",
            content: content,
            buttons: {
                roll: {
                    label: "",
                    callback: async (html) => await callback(html, actor, abilityKey),
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                }
            },
            default: "roll",
            render
        },
        {
            classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
        }
    ).render(true);

    async function callback(html, actor, abilityKey) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
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
    console.log(actor);
    console.log(saveKey);

    const content = await renderDialogContent(saveKey);

    new Dialog({
            title: "",
            content: content,
            buttons: {
                roll: {
                    label: "",
                    callback: async (html) => await callback(html, actor, saveKey),
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                }
            },
            default: "roll",
            render
        },
        {
            classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
        }
    ).render(true);

    async function callback(html, actor, saveKey) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const knackBonus = actor.system.class?.hasKnacks ? actor.system.knacks.resilience : 0;

        const roll = new SystemRoll({roller: actor, key: saveKey, type: "save", mod: modifier + knackBonus});
        await roll.toMessage();

    };
};

const rangedAttack = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if (item) {
        if(!item.system.equipped) {
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

        new Dialog({
                title: "",
                content: content,
                buttons: {
                    roll: {
                        label: "",
                        callback: async (html) => await callback(html, actor, item),
                        icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                    }
                },
                default: "roll",
                render
            },
            {
                classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
            }
        ).render(true);
    }

    async function callback(html, actor, item) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        if (item.system.usesAmmo) {
            const ammoItem = actor.items.get(item.system.ammoId);

            if (ammoItem) {
                await ammoItem.update({
                    "system.quantity.value": ammoItem.system.quantity.value - 1
                });
            }
        } else {
            const newQuantity = item.system.quantity.value - 1;

            await item.update({
                "system.quantity.value": newQuantity,
                "system.equipped": item.system.equipped && newQuantity > 0
            });
        }

        const roll = new SystemRoll({roller: actor, type: "ranged", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const rangedBasicRoll = async (actor) => {

    const content = await renderDialogContent("ranged");

    new Dialog({
            title: "",
            content: content,
            buttons: {
                roll: {
                    label: "",
                    callback: async (html) => await callback(html, actor,),
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                }
            },
            default: "roll",
            render
        },
        {
            classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
        }
    ).render(true);

    async function callback(html, actor, item) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "ranged", mod: modifier, target});
        await roll.toMessage();
    }
};

const monsterAttack = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if (item) {
        const content = await renderDialogContent("monster");

        new Dialog({
                title: "",
                content: content,
                buttons: {
                    roll: {
                        label: "",
                        callback: async (html) => await callback(html, actor, item),
                        icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                    }
                },
                default: "roll",
                render
            },
            {
                classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
            }
        ).render(true);
    }

    async function callback(html, actor, item) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "monster", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const meleeAttack = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if (item) {
        if(!item.system.equipped) {
            ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
            return;
        }


        const content = await renderDialogContent("melee");

        new Dialog({
                title: "",
                content: content,
                buttons: {
                    roll: {
                        label: "",
                        callback: async (html) => await callback(html, actor, item),
                        icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                    }
                },
                default: "roll",
                render
            },
            {
                classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
            }
        ).render(true);
    }

    async function callback(html, actor, item) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "melee", mod: modifier, item: item, target});
        await roll.toMessage();
    }
};

const meleeBasicRoll = async (actor) => {
    const content = await renderDialogContent("melee");

    new Dialog({
            title: "",
            content: content,
            buttons: {
                roll: {
                    label: "",
                    callback: async (html) => await callback(html, actor),
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                }
            },
            default: "roll",
            render
        },
        {
            classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
        }
    ).render(true);

    async function callback(html, actor) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);

        const targetToken = game.user.targets.first();
        let target = targetToken ? targetToken.document?.actor?.system.ac : undefined;

        const roll = new SystemRoll({roller: actor, type: "melee", mod: modifier, target});
        await roll.toMessage();
    }
};

const meleeDamage = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (item) {
        if(!item.system.equipped) {
            ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
            return;
        }


        const roll = new SystemRoll({roller: actor, type: "damageMelee", item: item});
        await roll.toMessage();
    }
};

const rangedDamage = async (actor, itemId) => {
    const item = actor.items.get(itemId);

    if (item) {
        if(!item.system.equipped) {
            ui.notifications.error(game.i18n.localize("aoa.weapon-not-equipped"));
            return;
        }


        const roll = new SystemRoll({roller: actor, type: "damageRanged", item: item});
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
    console.log(actor);

    const content = await renderDialogContent("save", {
        keys: {
            poison: game.i18n.localize("aoa.saves.poison"),
            breathWeapon: game.i18n.localize("aoa.saves.breathWeapon"),
            polymorph: game.i18n.localize("aoa.saves.polymorph"),
            spell: game.i18n.localize("aoa.saves.spell"),
            magicItem: game.i18n.localize("aoa.saves.magicItem"),
        }
    });

    new Dialog({
            title: "",
            content: content,
            buttons: {
                roll: {
                    label: "",
                    callback: async (html) => await callback(html, actor),
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`
                }
            },
            default: "roll",
            render
        },
        {
            classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol"]
        }
    ).render(true);

    async function callback(html, actor) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
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

    if (item) {
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

