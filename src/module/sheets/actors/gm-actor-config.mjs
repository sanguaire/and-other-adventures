import {CONST} from "../../const.mjs";
import {AoaActorSheet} from "./aoa-actor-sheet.mjs";
import {actionHandler} from "../../actions.mjs";

export class GmActorConfig extends AoaActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `systems/${CONST.MODULE_ID}/templates/actors/gm-actor-config.hbs`,
            classes: [CONST.MODULE_SCOPE, "sheet", "request", "flexcol", "animate__animated", "animate__faster", CONST.OPEN_ANIMATION_CLASS],
            width: 500,
            height: 525,
            resizable: false,
        });
    }

    static actions = foundry.utils.mergeObject(super.actions, {
        light: actionHandler
    });

    get title() {
        return `GM: ${super.title}`;
    }

    _getHeaderButtons() {
        return super._getHeaderButtons().filter(b => b.class=== "close");
    }

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet gm-config-sheet ${context.cssClass}`

        return context;
    }

}
