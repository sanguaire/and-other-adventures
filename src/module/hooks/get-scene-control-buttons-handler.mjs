import {RollRequester} from "../apps/roll-requester.mjs";

export const getSceneControlButtonsHandler = (controls) => {
    if (!game.user.isGM) return;

    controls.find(c => c.name==='token').tools.push({
       name: "requestRoll",
       title: game.i18n.localize("aoa.request-roll"),
       icon: "fa-solid fa-dice",
       button: true,
       onClick: () => {
           RollRequester.create()
       }
    });
}
