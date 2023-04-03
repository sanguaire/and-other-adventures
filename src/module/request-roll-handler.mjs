import {executeAction} from "./actions.mjs";

export const requestRollHandler = (actionType, actionKey, modifier) => {
    executeAction(game.user.character, "roll", actionType, actionKey, null, modifier);
};
