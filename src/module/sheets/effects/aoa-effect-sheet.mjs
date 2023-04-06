import {CONST} from "../../const.mjs";

export class AoaEffectSheet extends ActiveEffectConfig {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sheet", "active-effect-sheet"],
            template: `systems/${CONST.MODULE_ID}/templates/configuration/active-effect-config.hbs`,
            width: 560,
            height: "auto",
            tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}]
        });
    }
}
