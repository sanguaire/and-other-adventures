export function trimNewLineWhitespace(x) {
    return x.replace(/^(\s+)/gm, '');
}

export async function inputMousewheel(ev, entity) {
    const target = $(ev.target);
    const event = ev.originalEvent;

    const name = target.attr("name");
    const decimals = target.attr("decimals") ?? 0;
    const sign = target.attr("sign");
    const noWheel = target.attr("no-wheel");

    if(noWheel)
        return false;

    const up = ev.originalEvent.deltaY < 0;
    let value = Number.parseInt(target.val());

    if(up) {
        value += 1;
    } else {
        value -= 1;
    }

    if(typeof decimals !== 'undefined' || sign) {
        target.val( HandlebarsHelpers.numberFormat(value, Object.create({
            hash: {
                decimals,
                sign
            }
        })));
    } else {
        target.val(value);
    }

    if(entity && typeof name !== 'undefined') {
        const updateDef = {};

        updateDef[name] = value;

        await entity.update(updateDef);
    }

    return false;
}

export const delay = (timeInMs) => {
    return new Promise(resolve => setTimeout(resolve, timeInMs));
};

