import {CONST} from "../../const.mjs"

export class AoaEffect extends ActiveEffect {

    constructor(data, context = {}) {
        return super(data, context);
    }

    get isTemporary() {
        const duration = this.duration.seconds ?? (this.duration.rounds || this.duration.turns) ?? 0;
        return (duration > 0) || (this.statuses.size > 0) || this.getFlag(CONST.MODULE_ID, "needsConcentration");
    }

    static getRemainingString =  (effect) => {
        if(!effect.duration.seconds) {
            return "";
        }

        const durationTs = TimeSpan.FromSeconds(this.getRemaining(effect));
        return durationTs.days() > 0
            ? `${durationTs.days()} ${game.i18n.localize("aoa.days")}`
            : `${durationTs.hours().toString().padStart(2, "0")}:${durationTs.minutes().toString().padStart(2, "0")}:${durationTs.seconds().toString().padStart(2, "0")}`;
    }

    static getRemaining = (effect) => {
        const start = (effect.duration.startTime || game.time.worldTime);
        const elapsed = game.time.worldTime - start;
        return effect.duration.seconds - elapsed;
    }

}
