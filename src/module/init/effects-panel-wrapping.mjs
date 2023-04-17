import {CONST} from "../const.mjs";

export const effectsPanelWrapping = () => {
    libWrapper.register(
        CONST.MODULE_ID,
        'Token.prototype._onControl',
        function (wrapper, ...args) {
            if (game.ready) {
                game.aoa.effectsPanel.refresh();

            }
            wrapper(...args);
        },
        'WRAPPER'
    );
    libWrapper.register(
        CONST.MODULE_ID,
        'Token.prototype._onRelease',
        function (wrapper, ...args) {
            game.aoa.effectsPanel.refresh();
            wrapper(...args);
        },
        'WRAPPER'
    );
    libWrapper.register(
        CONST.MODULE_ID,
        'TokenDocument.prototype._onUpdate',
        function (wrapper, ...args) {
            wrapper(...args);
            game.aoa.effectsPanel.refresh();
        },
        'WRAPPER'
    );
    libWrapper.register(
        CONST.MODULE_ID,
        'Actor.prototype.prepareData',
        function (wrapper, ...args) {
            wrapper(...args);
            if (canvas.ready && game.user.character === this) {
                game.aoa.effectsPanel.refresh();
            }
        },
        'WRAPPER'
    );
    libWrapper.register(
        CONST.MODULE_ID,
        'User.prototype.prepareData',
        function (wrapper, ...args) {
            wrapper(...args);
            if (canvas.ready && canvas.tokens.controlled.length > 0) {
                game.aoa.effectsPanel.refresh();
            }
        },
        'WRAPPER'
    );
};
