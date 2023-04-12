import {CONST} from "../const.mjs";
import {AoaEffect} from "../documents/effects/aoa-effect.mjs";

export class EffectsPanel extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `systems/${CONST.MODULE_ID}/templates/apps/effects-panel.hbs`,
            classes: [CONST.MODULE_SCOPE, "panel", "flexrow"],
            resizable: false,
            popOut: false,
            id: "effects-panel"
        });
    }

    constructor() {
        super();

        this.refresh = foundry.utils.debounce(this.render.bind(this), 100);
    }

    async render(force = false, options = {}) {
        await super.render(force, options);
    }

    _injectHTML(html) {
        $("#ui-bottom")
            .prepend(html);
        this._element = html;
        html.hide().fadeIn(200);
    }

    getData(options = {}) {
        const context =  super.getData(options);

        context.cssClass = "effects-panel";

        if(game.user.isGM) {
            const tokens = canvas.tokens.controlled;

            if(tokens && tokens.length === 1) {
                const token = tokens[0];

                if(token.actor) {
                    context.effects = token.actor.effects.map(e => {
                        return {
                            _id: e._id,
                            label: e.label,
                            remainingString: AoaEffect.getRemainingString(e),
                            icon: e.icon,
                            disabled: e.disabled
                        }
                    });
                }
            }
        } else {
            if(game.user.character) {
                context.effects = game.user.character.effects.map(e => {
                    return {
                        _id: e._id,
                        label: e.label,
                        remainingString: AoaEffect.getRemainingString(e),
                        icon: e.icon,
                        disabled: e.disabled
                    }
                });
            }
        }

        return context;
    }
}
