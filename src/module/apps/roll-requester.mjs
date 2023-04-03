import {CONST} from "../const.mjs";
import {beautifyHeaders} from "../utils/beautify-headers.mjs";
import {PcActor} from "../documents/actors/pc-actor.mjs";
import {inputMousewheel} from "../utils.mjs";

export class RollRequester extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `systems/${CONST.MODULE_ID}/templates/apps/roll-requester.hbs`,
            classes: [CONST.MODULE_SCOPE, "sheet", "request", "flexcol", "animate__animated", "animate__faster", CONST.OPEN_ANIMATION_CLASS],
            width: 450,
            height: 500,
            title: game.i18n.localize("aoa.request-roll"),
            resizable: false,
        });
    }

    static requester = null;

    getData(options = {}) {
        const context = super.getData(options);

        context.cssClass = `aoa-sheet request-sheet ${context.cssClass}`

        context.users = game.users.players.filter(u => u.active && u.character !== null);

        context.abilities = Object.keys(game.template.Actor.pc.abilities).map(key => {
            return {
                key,
                name: game.i18n.localize("aoa.abilities." + key)
            }
        });

        context.saves = Object.keys(game.template.Item.class.levelProgression[1].saves).map(key => {
            return {
                key: key,
                name: game.i18n.localize("aoa.saves." + key)
            }
        });

        return context;
    }

    static create() {

        if (!this.requester) {
            this.requester = new this();
        }

        if (!this.requester.rendered) {
            this.requester.render(true);
        } else {
            this.requester.render(false);
            this.requester.maximize();
            this.requester.bringToTop();
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("[data-action='select']").click((ev) => {
            const target = $(ev.currentTarget);
            const userId = target.data("user-id");

            target.toggleClass("selected");

            if (target.hasClass("selected")) {
                this.selectedUsers.push(userId);
            } else {
                const index = this.selectedUsers.indexOf(userId);
                this.selectedUsers.splice(index, 1);
            }

            if (this.selectedUsers.length > 0) {
                html.find("[data-action='roll']").removeClass("disabled");
            } else {
                html.find("[data-action='roll']").addClass("disabled");

            }

        });

        html.find("[data-action='roll'").click((ev) => {
            const target = $(ev.currentTarget);
            const actionType = target.closest("[data-action-type]").data("action-type");
            const actionKey = target.closest("[data-action-key]").data("action-key");
            const modifier = Number.parseInt($(".aoa-sheet.request-sheet").find("[name='modifier']").val());

            console.log(`${actionType} ${actionKey}`);

            CONFIG.aoa.socket.executeForUsers("requestRoll", this.selectedUsers, actionType, actionKey, modifier );

        });

        html.find("[name='modifier']").change(RollRequester.modifierChange);
        html.find("[name='modifier']").on("wheel", inputMousewheel);

        beautifyHeaders(html.find(":header"));
    }

    render(force = false, options = {}) {
        this.selectedUsers = []
        return super.render(force, options);
    }

    static modifierChange(ev) {
        const target = ev.target;
        const value = Number.parseInt(target.value);

        if (value) {
            target.value = HandlebarsHelpers.numberFormat(value, Object.create({
                hash: {
                    decimals: 0,
                    sign: true
                }
            }));
        }

    }
}
