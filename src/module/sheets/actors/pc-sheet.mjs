import {CONST} from "../../const.mjs";

export class PcSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [CONST.MODULE_SCOPE, "sheet", "actor"],
            template: `systems/${CONST.MODULE_ID}/templates/actors/pc-sheet.hbs`,
            width: 800,
            height: 900,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "combat"}],
            resizable: false
        });
    }
        
}
