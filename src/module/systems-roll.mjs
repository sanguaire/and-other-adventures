import {CONST as AOA_CONST} from "./const.mjs";

let RollDirection;
(function (RollDirection) {
    RollDirection[RollDirection["high"] = 0] = "high";
    RollDirection[RollDirection["low"] = 1] = "low";
})(RollDirection || (RollDirection = {}));

export class SystemRoll extends Roll {
    name;

    flavor;
    baseValue;
    modifier;
    target;
    direction;
    showOffset;

    result;

    static toModString = (value) => (value === 0 ? '' : value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`);

    static localizeFormula = (formula) => {
        return formula.replace(CONFIG.Dice.terms.d.DENOMINATION, game.i18n.localize("aoa." + CONFIG.Dice.terms.d.DENOMINATION))
    };

    constructor({roller, key, type, mod, skill, item, flavor, target}={}) {
        let attackMod = 0;
        let modString = "";

        switch (type) {
            case 'ability':
                const abilityRollFlavor = game.settings.get(`${AOA_CONST.MODULE_ID}`, "abilityRollFlavor");
                const abilityMod = abilityRollFlavor === "b" ? roller.system.abilities[key].modifier :
                             abilityRollFlavor === "c" ? roller.system.abilities[key].value : 0;
                modString = SystemRoll.toModString(mod + abilityMod + (skill ? skill.system.bonus : 0));
                super(abilityRollFlavor === "a" ? `1d20` : `1d20${modString}`);

                this.name = `${game.i18n.localize("aoa.rolls." + key)}`;
                this.modifier = mod + abilityMod + (skill ? skill.system.bonus : 0);
                this.baseValue = roller.system.abilities[key].value;
                this.target = abilityRollFlavor === "a" ? roller.system.abilities[key].value + mod :
                              abilityRollFlavor === "c" ? 20 :
                              12;
                this.direction = abilityRollFlavor === "a" ? RollDirection.low: RollDirection.high;
                this.skill = skill;
                this.showOffset = true;
                break;
            case 'save':
                modString = SystemRoll.toModString(mod);
                super(`1d20${modString}`);
                this.name = `${game.i18n.localize("aoa.rolls." + key)}`;
                this.modifier = mod;
                this.baseValue = roller.system.saves[key];
                this.target = roller.system.saves[key];
                this.direction = RollDirection.high;
                this.showOffset = true;
                break;
            case 'melee':
                attackMod = SystemRoll.toModString(item ? item.system.attack.melee + mod : roller.system.attack.melee + mod);
                super(`1d20${attackMod}`);
                this.name = item ? `${game.i18n.localize("aoa.attack-with")} ${item.name}` : `${game.i18n.localize("aoa.rolls.melee")}`;
                this.modifier = attackMod;
                this.target = target;
                this.direction = RollDirection.high;
                this.showOffset = target !== undefined;
                break;
            case 'ranged':
                attackMod = SystemRoll.toModString(item ? item.system.attack.ranged + mod : roller.system.attack.ranged + mod);
                const ammoString = item?.system.usesAmmo ? `(${roller.items.get(item.system.ammoId)?.name})` : "";
                super(`1d20${attackMod}`);
                this.name = item ? `${game.i18n.localize("aoa.attack-with")} ${item.name} ${ammoString}` : `${game.i18n.localize("aoa.rolls.ranged")}`;
                this.modifier = attackMod;
                this.target = target;
                this.direction = RollDirection.high;
                this.showOffset = target !== undefined;
                break;
            case 'monster':
                attackMod = SystemRoll.toModString(item.system.toHit + mod);
                super(`1d20${attackMod}`);
                this.name = `${game.i18n.localize("aoa.attack-with")} ${item.name}`;
                this.modifier = attackMod;
                this.target = target;
                this.direction = RollDirection.high;
                this.showOffset = target !== undefined;
                break;
            case 'damageRanged':
                super(item.system.damage.ranged);
                this.name = `${game.i18n.localize("aoa.rolls.damage")} ${item.name}`;
                this.direction = RollDirection.high;
                this.target = NaN;
                this.modifier =  0
                break;
            case 'damageMelee':
                super(item.system.damage.melee);
                this.name = `${game.i18n.localize("aoa.rolls.damage")} ${item.name}`;
                this.direction = RollDirection.high;
                this.target = NaN;
                this.modifier = 0
                break;
            case 'damageMonster':
                super(item.system.damage.formula);
                this.name = `${game.i18n.localize("aoa.rolls.damage")} ${item.name}`;
                this.direction = RollDirection.high;
                this.target = NaN;
                this.modifier = 0
                break;
            default:
                console.error(`Roll type '${type}' not allowed.`);
        }
        this.actorName = roller.name;
        this.actorId = roller._id;
        this.type = type;
        this.flavor = flavor;
    }
    async render(chatOptions = {}) {
        chatOptions = mergeObject({
            user: game.user.id,
            flavor: null,
            template: `systems/${AOA_CONST.MODULE_ID}/templates/dice/roll.hbs`,
        }, chatOptions || {});

        if (!this._evaluated)
            await this.evaluate({ async: true });

        let vs = '';
        let offset = '';

        if (!isNaN(this.target)) {
            offset = this.showOffset ? ` (${Math.abs(this.total - this.target)})` : '';
            switch (this.direction) {
                case RollDirection.low:
                    vs = `&#8804 ${this.target} `
                    this.result = this.total <= this.target || this.dice[0].total === 1 ? 'success' : 'failure';
                    break;
                case RollDirection.high:
                    vs = `&#8805 ${this.target}`
                    this.result = this.total >= this.target || this.dice[0].total === 20 ? 'success' : 'failure';
                    break;
            }
        }

        const modString = SystemRoll.toModString(this.modifier);

        const chatData = {
            user: chatOptions.user,
            actorName: this.actorName,
            actorId: this.actorId,
            classes: this.buildCssClasses(),
            name: this.name,
            type: this.type,
            flavor: this.flavor,
            formula: SystemRoll.localizeFormula(this.formula),
            total: this.type.includes("damage") ? Math.max(this.total, 1) :  this.total,
            vs,
            direction: this.direction,
            modifiers: modString === ""
                ? ""
                : this.direction === RollDirection.high ?
                    modString :
                    ` (${this.baseValue}${modString})`,
            result: this.result,
            offset,
            skillName: this.skill?.name,
            skillBonus: this.skill?.system.bonus,
            parts: this.dice.map((d) => {
                const toolTip = d.getTooltipData();
                toolTip.formula = SystemRoll.localizeFormula(toolTip.formula);
                return toolTip;
            }),
        };
        return renderTemplate(chatOptions.template, chatData);
    }

    async toMessage(messageData={}, {rollMode, create=true}={}) {

        // Perform the roll, if it has not yet been rolled
        if ( !this._evaluated ) await this.evaluate({async: true});

        // Prepare chat data
        messageData = foundry.utils.mergeObject({
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content: await this.render(),
            sound: CONFIG.sounds.dice
        }, messageData);
        messageData.rolls = [this];

        // Either create the message or just return the chat data
        const cls = getDocumentClass("ChatMessage");
        const msg = new cls(messageData);

        // Either create or return the data
        if ( create ) return cls.create(msg.toObject(), { rollMode });
        else {
            if ( rollMode ) msg.applyRollMode(rollMode);
            return msg.toObject();
        }
    }

    static fromData(data) {
        const roll = new Roll(data.formula);
        roll.terms = data.terms.map((t) => {
            if (t.class) {
                if (t.class === 'DicePool')
                    t.class = 'PoolTerm';
                return RollTerm.fromData(t);
            }
            return t;
        });
        if (data.evaluated ?? true) {
            roll._total = data.total;
            roll._dice = (data.dice || []).map((t) => DiceTerm.fromData(t));
            roll._evaluated = true;
        }
        return roll;
    }

    buildCssClasses = () => [this.result, this.direction === RollDirection.low ? "low" : "high", this.type].join(" ");
}
