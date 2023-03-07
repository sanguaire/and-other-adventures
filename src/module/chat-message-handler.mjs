export const chatMessageHandler = (message, html, data) => {
    if(!game.user.isGM)
        return;

    const actorId = html.find("[data-actor-id]").data("actor-id");

    if(actorId) {
        const actorNameElement = html.find(".actor-name");

        actorNameElement.html(`<a>${actorNameElement.html()}</a>`);
    }
}
