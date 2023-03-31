export class PcActor extends Actor {

    static stanceModifiers = {
        normal: {
            attack: 0,
            ac: 0
        },
        aggressive: {
            attack: 2,
            ac: -4
        },
        defensive: {
            attack: -4,
            ac: 2
        },
        protective: {
            attack: 0,
            ac: 2
        },
        commanding: {
            attack: 0,
            ac: -6
        }
    };

    prepareBaseData() {
        const activeClass = this.itemTypes.class[0];

        this.system.class = activeClass ? {
            name: activeClass.name,
            _id: activeClass._id,
            ...activeClass.system
        } : null

        this.system.progression = this.system.class?.levelProgression[Math.clamped(this.system.level, 1 , 10)];
        this.system.nextLevel = this.system.class?.levelProgression[Math.clamped(this.system.level + 1, 1, 10)].xp ?? 0;
        this.system.levelUp = this.system.class && this.system.level < 10 && this.system.xp >= this.system.nextLevel;

        this.system.isSpellcaster = this.system.class?.hasCantrips || this.system.class?.hasSpells || this.system.class?.hasRituals;
        this.system.hasSpellsOrRituals = this.system.class?.hasSpells || this.system.class?.hasRituals;

        this.system.saves = this.system.progression?.saves ?? {
            "poison": 0,
            "breathWeapon": 0,
            "polymorph": 0,
            "spell": 0,
            "magicItem": 0
        }

        this.system.ac = 10;
    }


    prepareDerivedData() {
        for (const [key, ability] of Object.entries(this.system.abilities)) {
            this.system.abilities[key].modifier = PcActor._getModifier(ability.value);
        }

        const baseAttackBonus = (this.system.progression?.attackBonus ?? 0) + PcActor.stanceModifiers[this.system.combatStance].attack;

        this.system.attack = {
            base: baseAttackBonus,
            melee: baseAttackBonus + this.system.abilities[this.system.meleeBonusBasedOn].modifier,
            ranged: baseAttackBonus + this.system.abilities.dex.modifier
        };

        this.system.initiative = this.system.level
            + this.system.abilities.dex.modifier
            + (this.system.class?.initiativeBonus ?? 0)
            + (this.system.class?.hasKnacks ? this.system.knacks.fleet : 0);

        this.system.ac += this._getArmorClassBonus();

        this._prepareWeapons()
    }

    _getArmorClassBonus() {
        return this.itemTypes.armor
                .filter(a => a.system.equipped && a.system.stacks)
                .map(a => a.system.armorBonus)
                .reduce((acc, cur) => acc + cur, 0)
            + (this.itemTypes.armor
                .find(a => a.system.equipped && !a.system.stacks)?.system.armorBonus ?? 0)
            + (this.system.abilities[this.system.acBonusBasedOn].modifier)
            + (this.system.class?.hasKnacks ? this.system.knacks.defensive : 0)
            + (PcActor.stanceModifiers[this.system.combatStance].ac);
    }

    _prepareWeapons() {
        for (const weapon of this.itemTypes.weapon) {
            if (weapon.actor) {
                PcActor.prepareWeaponDamage(weapon);
                PcActor.prepareWeaponAttackBonus(weapon);
            }
        }
    }

    static prepareWeaponDamage(weapon) {
        const numberOfDie = weapon.system.baseDamage.noOfDie;
        const dieType = weapon.system.baseDamage.dieType;
        const abilityMeleeDamageModifier = weapon.actor.system.abilities.str.modifier;
        const abilityRangedDamageModifier = 0;
        const specializedDamageBonus = weapon.actor.system.class?.hasSpecialization && weapon.system.specialized ? 2 : 0;
        // noinspection JSDeprecatedSymbols
        const knackDamageBonus = weapon.actor.system.class?.hasKnacks ? weapon.actor.system.knacks.strike : 0

        const meleeDamageBonus = weapon.system.damageBonus.melee
            + abilityMeleeDamageModifier
            + specializedDamageBonus
            + knackDamageBonus;

        const rangedDamageBonus = weapon.system.damageBonus.ranged
            + abilityRangedDamageModifier
            + specializedDamageBonus
            + knackDamageBonus;

        const getBonusString = bonusValue => bonusValue === 0 ? "" : bonusValue > 0 ? `+${bonusValue}` : bonusValue;

        const meleeDamageBonusString = getBonusString(meleeDamageBonus);
        const rangedDamageBonusString = getBonusString(rangedDamageBonus)

        weapon.system.damage = {
            melee: `${numberOfDie}${dieType}${meleeDamageBonusString}`,
            ranged: `${numberOfDie}${dieType}${rangedDamageBonusString}`
        }

        weapon.system.localizedDamage = {
            melee: `${numberOfDie}${game.i18n.localize("aoa." + dieType)}${meleeDamageBonusString}`,
            ranged: `${numberOfDie}${game.i18n.localize("aoa." + dieType)}${rangedDamageBonusString}`
        }
    }

    static prepareWeaponAttackBonus(weapon) {
        const specializedAttackBonus = weapon.actor.system.class?.hasSpecialization && weapon.system.specialized ? 1 : 0;
        const actorMeleeAttackBonus = weapon.actor.system.attack.melee;
        const actorRangedAttackBonus = weapon.actor.system.attack.ranged;

        weapon.system.attack = {
            melee: weapon.system.attackBonus.melee + actorMeleeAttackBonus + specializedAttackBonus,
            ranged: weapon.system.attackBonus.ranged + actorRangedAttackBonus + specializedAttackBonus
        }

        weapon.system.ammoQuantity = weapon.system.usesAmmo ? weapon.actor.items.get(weapon.system.ammoId)?.system.quantity.value ?? 0 : 0
        weapon.system.showMelee = !weapon.system.ranged || weapon.system.hasMeleeOption;
    }

    static _getModifier = (value) => {
        return value >= 18 ?
            3 :
            value >= 16 ?
                2 :
                value >= 13 ?
                    1 :
                    value >= 9 ?
                        0 :
                        value >= 6 ?
                            -1 :
                            value >= 4 ?
                                -2 :
                                value >= 2 ?
                                    -3 :
                                    -4
    };

    get equipment() {
        return this.items.filter(i => i.system.hasOwnProperty("equipped"));
    }

}


