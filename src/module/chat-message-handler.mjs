import {PcSheet} from "./sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "./sheets/actors/monster-sheet.mjs";

export const chatMessageHandler = (message, html, data) => {
    if(!game.user.isGM)
        return;

    const actorId = html.find("[data-actor-id]").data("actor-id");

    if(actorId) {
        const actor = game.actors.get(actorId);

        const actorNameElement = html.find(".actor-name");

        actorNameElement.html(`<a>${actor ? actor.name : actorNameElement.html()}</a>`);
        actorNameElement.click(handleActorClick);
    }
}

const handleActorClick = (ev) => {
    ev.stopPropagation();

    const html = $(ev.currentTarget);
    const actorId = html.closest("[data-actor-id]").data("actor-id");

    if(actorId) {
        const actor = game.actors.get(actorId);

        if(actor.type === "pc" ) {
            new PcSheet(actor).render(true);
        }

        if(actor.type === "monster") {
            new MonsterSheet(actor).render(true);
        }
    }
};
