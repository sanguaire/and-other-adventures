import {CONST} from "../const.mjs";

export const tooltipWrapping = () =>  {
    libWrapper.register(
        CONST.MODULE_ID,
        'TooltipManager.prototype.activate',
        function (wrapper, ...args) {
            let [element, options] = args;

            let text = options?.text || game.i18n.localize(element.dataset.tooltip);

            text = `<div>${text}</div>`;

            options = options ? mergeObject(options, {text}) : {text};

            wrapper(element, options);
        },
        'WRAPPER'
    );
};
