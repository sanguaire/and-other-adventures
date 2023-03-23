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

        for (const [key, ability] of Object.entries(this.system.abilities)) {
            this.system.abilities[key].modifier = PcActor._getModifier(ability.value);
        }

        const baseAttackBonus = (this.system.progression?.attackBonus ?? 0) + PcActor.stanceModifiers[this.system.combatStance].attack;

        this.system.attack = {
            base: baseAttackBonus,
            melee: baseAttackBonus + this.system.abilities.str.modifier,
            ranged: baseAttackBonus + this.system.abilities.dex.modifier
        };

        this.system.initiative = this.system.level
            + this.system.abilities.dex.modifier
            + (this.system.class?.initiativeBonus ?? 0)
            + (this.system.class?.hasKnacks ? this.system.knacks.fleet : 0);

        this.system.ac = this._generateArmorClass();

        this._prepareWeapons()
    }

    _generateArmorClass() {
        return this.itemTypes.armor
                .filter(a => a.system.equipped)
                .map(a => a.system.armorBonus)
                .reduce((acc, cur) => acc + cur, 10)
            + (this.system.abilities.dex.modifier)
            + (this.system.class?.hasKnacks ? this.system.knacks.defensive : 0)
            + (PcActor.stanceModifiers[this.system.combatStance].ac);
    }

    _prepareWeapons() {
        for (const weapon of this.itemTypes.weapon) {
            if (weapon.actor) {
                const specializedDamageBonus = this.system.class?.hasSpecialization && weapon.system.specialized ? 2 : 0;
                // noinspection JSDeprecatedSymbols
                const knackDamageBonus = this.system.class?.hasKnacks ? this.system.knacks.strike : 0
                const meleeDamageBonus = weapon.system.damageBonus.melee
                    + this.system.abilities.str.modifier
                    + specializedDamageBonus
                    + knackDamageBonus;
                const rangedDamageBonus = weapon.system.damageBonus.ranged
                    + specializedDamageBonus
                    + knackDamageBonus;

                weapon.system.damage = {
                    melee: `${weapon.system.baseDamage.noOfDie}${weapon.system.baseDamage.dieType}${meleeDamageBonus === 0 ? "" : meleeDamageBonus > 0 ? `+${meleeDamageBonus}` : meleeDamageBonus}`,
                    ranged: `${weapon.system.baseDamage.noOfDie}${weapon.system.baseDamage.dieType}${rangedDamageBonus === 0 ? "" : rangedDamageBonus > 0 ? `+${rangedDamageBonus}` : rangedDamageBonus}`
                }

                weapon.system.localizedDamage = {
                    melee: `${weapon.system.baseDamage.noOfDie}${game.i18n.localize("aoa." + weapon.system.baseDamage.dieType)}${meleeDamageBonus === 0 ? "" : meleeDamageBonus > 0 ? `+${meleeDamageBonus}` : meleeDamageBonus}`,
                    ranged: `${weapon.system.baseDamage.noOfDie}${game.i18n.localize("aoa." + weapon.system.baseDamage.dieType)}${rangedDamageBonus === 0 ? "" : rangedDamageBonus > 0 ? `+${rangedDamageBonus}` : rangedDamageBonus}`
                }

                const specializedAttackBonus = this.system.class?.hasSpecialization && weapon.system.specialized ? 1 : 0;

                weapon.system.attack = {
                    melee: weapon.system.attackBonus.melee + this.system.attack.melee + specializedAttackBonus,
                    ranged: weapon.system.attackBonus.ranged + this.system.attack.ranged + specializedAttackBonus
                }

                weapon.system.ammoQuantity = weapon.system.usesAmmo ? this.items.get(weapon.system.ammoId)?.system.quantity.value ?? 0 : 0

                weapon.system.showMelee = !weapon.system.ranged || weapon.system.hasMeleeOption;

            }

        }
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
