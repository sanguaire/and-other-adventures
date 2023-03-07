import {CONST as AOA_CONST} from "./const.mjs";
import {SystemRoll} from "./systems-roll.mjs";

export const actionHandler = (actor, html) => {
    const action = html.closest("[data-action]").data("action");
    const actionType = html.closest("[data-action-type]").data("action-type");
    const actionKey = html.closest("[data-action-key]").data("action-key");
    const actionFlavor = html.closest("[data-action-flavor]").data("action-flavor");
    const itemId = html.closest("[data-item-id]").data("item-id");

    actions[action][actionType](actor, actionKey ?? itemId, actionFlavor);
}

function render(html) {
    html.find(":header").html(function() {
        return $(this)
            .text()
            .replace(/[a-zä-ü]*/g, '<span class="move-up">$&</span>')
            .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
    });
}

async function renderDialogContent(abilityKey) {
    const dlgTemplate = `systems/${AOA_CONST.MODULE_ID}/templates/dialogs/roll.hbs`
    const dlgData = {
        dialogHeader: game.i18n.localize("aoa.rolls." + abilityKey),
        cssClass: "aoa-sheet"
    }

    const content = await renderTemplate(dlgTemplate, dlgData);
    return content;
}

async function renderSkillDialogContent(item) {
    const dlgTemplate = `systems/${AOA_CONST.MODULE_ID}/templates/dialogs/roll-skill.hbs`
    const dlgData = {
        dialogHeader: game.i18n.localize("aoa.rolls.skill"),
        skillName: item.name,
        skillValue: item.system.bonus,
        cssClass: "aoa-sheet"
    }

    const content = await renderTemplate(dlgTemplate, dlgData);
    return content;
}

const abilityRoll = async (actor, abilityKey, flavor) => {
    console.log(actor);
    console.log(abilityKey);

    const content = await renderDialogContent(abilityKey);

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
        const modifier = Number.parseInt(formData.object.modifier);

        const roll = new SystemRoll({roller: actor, key: abilityKey, type: "skill", mod: modifier, flavor: flavor});
        await roll.toMessage();
    }
};

const saveRoll = async (actor, saveKey)  => {
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

        const roll = new SystemRoll({roller: actor, key:saveKey, type:"save", mod:modifier + knackBonus});
        await roll.toMessage();

    };
};

const skillRoll = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if(item) {
        const content = await renderSkillDialogContent(item);

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
    async function callback(html, actor, skill) {
        const formElement = html[0].querySelector("form");
        const formData = new FormDataExtended(formElement);
        const modifier = Number.parseInt(formData.object.modifier);
        const bonus = Number.parseInt(skill.system.bonus);
        const abilityKey = formData.object.ability;

        const roll = new SystemRoll({roller: actor, key: abilityKey, type: "skill", mod: modifier + bonus, skill});
        await roll.toMessage();
    }
};

const rangedAttack = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if(item) {
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


        const roll = new SystemRoll({roller: actor, type: "ranged", mod: modifier, item: item});
        await roll.toMessage();
    }
};

const meleeAttack = async (actor, itemId) => {
    console.log(actor);
    console.log(itemId);

    const item = actor.items.get(itemId);

    if(item) {
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


        const roll = new SystemRoll({roller: actor, type: "melee", mod: modifier, item: item});
        await roll.toMessage();
    }
};

const meleeDamage = async(actor, itemId) => {
    const item = actor.items.get(itemId);

    if(item) {
        const roll = new SystemRoll({roller: actor, type: "damageMelee", item: item});
        await roll.toMessage();
    }
}

const rangedDamage = async(actor, itemId) => {
    const item = actor.items.get(itemId);

    if(item) {
        const roll = new SystemRoll({roller: actor, type: "damageRanged", item: item});
        await roll.toMessage();
    }
}

const spellUse = async(actor, itemId, flavor) => {
    const item = actor.items.get(itemId);

    if(item) {
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
        }, { rollMode: game.settings.get("core", "rollMode")});

        actor.update({
            "system.usedSpells": actor.system.usedSpells + 1
        });
    }

}


const actions = {
    roll: {
        abilities: abilityRoll,
        saves: saveRoll,
        skill: skillRoll,
    },
    attack: {
        ranged: rangedAttack,
        melee: meleeAttack,
    },
    damage: {
        ranged: rangedDamage,
        melee: meleeDamage
    },
    use: {
        spell: spellUse
    }
}

