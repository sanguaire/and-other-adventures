import {CONST} from "../const.mjs";

export const registerSettings = () => {
    game.settings.register(CONST.MODULE_ID, "abilityRollFlavor", {
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
    game.settings.register(CONST.MODULE_ID, "considerHandsOnEquip", {
        name: game.i18n.localize("aoa.consider-hands"),
        hint: "",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true
    });
    game.settings.register(CONST.MODULE_ID, "lightSourceMeasurementUnit", {
        name: game.i18n.localize("aoa.light-source-unit"),
        hint: "",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "a": game.i18n.localize("aoa.meters"),
            "b": game.i18n.localize("aoa.feet")
        },
        default: "a",
        requiresReload: true
    });
};
