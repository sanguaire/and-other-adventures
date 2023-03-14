import {CONST} from "./const.mjs";

export const registerSettings = () => {
    game.settings.register(`${CONST.MODULE_ID}`, "abilityRollFlavor", {
        name: game.i18n.localize("aoa.ability-roll-flavor"),
        hint: "",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "a": game.i18n.localize("aoa.ability-roll-low"),
            "b": game.i18n.localize("aoa.ability-roll-high"),
            "c": game.i18n.localize("aoa.ability-roll-high-against-20")
        },
        default: "a",
        requiresReload: true
    });
};
