import {CONST as AOA_CONST, CONST} from "../const.mjs";
import {beautifyHeaders} from "../utils/beautify-headers.mjs";

const dialogClasses = [AOA_CONST.MODULE_SCOPE, "sheet", "dialog", "flexcol", "animate__animated", AOA_CONST.OPEN_ANIMATION_CLASS];


export const rollTableWrapping = () => {
    libWrapper.register(
        CONST.MODULE_ID,
        'RollTable.prototype.roll',
        async function (wrapper, ...args) {
            let [options] = args;

            let roll  = new Roll(this.formula);

            if(roll.formula.includes("#mod")) {
                const modResult = await modifierDlg(this.name);
                roll = new Roll( roll.formula.replace("#mod", modResult.mod));
            }

            mergeObject(options ?? {}, {roll})

            return await wrapper(options);
        },
        'WRAPPER'
    );
}

function modifierDlg(tableName) {
    return new Promise((resolve, reject) => {
        const dlg = new Dialog({
            title: "Modifikator",
            content: `<form class="aoa-sheet">
                    <h1>${tableName} ${game.i18n.localize("aoa.modifier")}</h1>
                    <input type="text" data-dtype="number" name="mod" value="0">
                    </form>`,
            buttons: {
                ok: {
                    label: "",
                    icon: `<i class="fa-solid fa-dice-d20 fa-xl"></i>`,
                    callback: (html) => callback(html, resolve)
                }
            },
            close: () => {reject()},
            render
        }, {classes: dialogClasses});

        dlg.render(true);
    })
}

function callback(html, resolve) {
    const formElement = html[0].querySelector("form");
    const formData = new FormDataExtended(formElement);

    resolve({mod: Number.parseInt(formData.object.mod) ?? 0})
}

function render(html) {
    beautifyHeaders(html.find(":header"));
}
