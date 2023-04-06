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


    getData(options = {}) {
        const seconds = this.object.duration.seconds;
        const startTime = this.object.duration.startTime;

        const ts = TimeSpan.FromSeconds(seconds);

        const data = {
            days: ts.days(),
            hours: ts.hours(),
            minutes: ts.minutes(),
            seconds: ts.seconds(),
            formattedStart: SimpleCalendar.api.formatTimestamp(startTime)
        }

        return mergeObject(super.getData(options), data);
    }

}
