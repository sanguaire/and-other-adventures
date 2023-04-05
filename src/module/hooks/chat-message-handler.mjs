import {PcSheet} from "../sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "../sheets/actors/monster-sheet.mjs";
import {CONST as AOA_CONST} from "../const.mjs";

export const chatMessageHandler = (message, html, data) => {
    if(!game.user.isGM)
        return;

    const actorId = html.find("[data-actor-id]").data("actor-id");
    const targetId = html.find("[data-target-id]").data("target-id");


    prepareActorIdElement();
    prepareTargetIdElement();

    function prepareActorIdElement() {
        if (actorId) {
            const actor = game.actors.get(actorId);

            const actorNameElement = html.find(".actor-name");

            actorNameElement.html(`<a>${actor ? actor.name : actorNameElement.html()}</a>`);
            actorNameElement.click(handleActorClick);
        }
    }

    function prepareTargetIdElement() {
        if (targetId) {
            const targetActor = game.actors.get(targetId);

            const targetNameElement = html.find(".target-name");
            const damageApplied = message.getFlag(AOA_CONST.MODULE_ID, "damageApplied");

            if (!damageApplied) {
                targetNameElement.html(`<a data-tooltip="${game.i18n.localize("aoa.apply-damage")}">${targetActor ? targetActor.name : targetNameElement.html()}</a>`);
                targetNameElement.click(handleTargetDamageClick);
            } else {
                targetNameElement.html(`<span>${targetActor ? targetActor.name : targetNameElement.html()} <i style="color: darkgreen;" class="fa-solid fa-check"></i></span>`);
            }

        }
    }
}

const handleActorClick = (ev) => {
    ev.stopPropagation();

    const html = $(ev.currentTarget);
    const actorId = html.closest("[data-actor-id]").data("actor-id");
    const messageId = html.closest("[data-message-id]").data("message-id");

    if(actorId && messageId) {
        const element = fromUuidSync(actorId) ?? game.actors.get(actorId);
        const actor = element instanceof TokenDocument ? element.actor : element;

        if(actor.type === "pc" ) {
            new PcSheet(actor).render(true);
        }

        if(actor.type === "monster") {
            new MonsterSheet(actor).render(true);
        }
    }
};


const handleTargetDamageClick = async (ev) => {
    ev.stopPropagation();

    const html = $(ev.currentTarget);
    const tokenId = html.closest("[data-target-id]").data("target-id");
    const messageId = html.closest("[data-message-id]").data("message-id");

    if(tokenId && messageId) {
        const token = fromUuidSync(tokenId)
        const actor = token.actor;
        const message = game.messages.get(messageId);

        if(!actor) {
            return
        }

        await Dialog.confirm({
            title: game.i18n.localize("aoa.damage"),
            content: `<div class="aoa-sheet">${game.i18n.localize("aoa.apply-damage")}?</div>`,
            yes: async () => {
                const damage = message.rolls.reduce((prev, cur) => prev + cur.total, 0 );
                await actor.update({
                   "system.hp.value": actor.system.hp.value - damage
                });

                await message.setFlag(AOA_CONST.MODULE_ID, "damageApplied", true);
            },
            options: {
                classes: [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol", "animate__animated", "animate__faster", AOA_CONST.OPEN_ANIMATION_CLASS]
            }
        });
    }
};
