export class PcActor extends Actor {

    prepareBaseData() {

        const activeClass = this.itemTypes.class[0];

        this.system.class = activeClass ?  {
            name: activeClass.name,
            _id: activeClass._id,
            ...activeClass.system
            } : null

        this.system.progression = this.system.class?.levelProgression[this.system.level];
        this.system.nextLevel = this.system.class?.levelProgression[this.system.level+1]?.xp ?? this.system.progression?.xp ?? 0;
        this.system.levelUp = this.system.class && this.system.level < 10 && this.system.xp >= this.system.nextLevel;

        this.system.saves = this.system.progression?.saves ?? {
            "poison": 0,
            "breathWeapon": 0,
            "polymorph": 0,
            "spell": 0,
            "magicItem": 0
        }

        for (const [key, ability] of Object.entries(this.system.abilities)) {
            this.system.abilities[key].modifier = this._getModifier(ability.value);
        }

        const baseAttackBonus = this.system.progression?.attackBonus ?? 0;

        this.system.attackBonus = {
            base: baseAttackBonus,
            melee: baseAttackBonus + this.system.abilities.str.modifier,
            ranged: baseAttackBonus + this.system.abilities.dex.modifier
        };

        this.system.initiative = this.system.level
            + this.system.abilities.dex.modifier
            + (this.system.class?.initiativeBonus ?? 0)
            + (this.system.class?.hasKnacks ? this.system.knacks.fleet : 0);

        this.system.armorClass = this._generateArmorClass();


        this._prepareWeapons()

    }

    _generateArmorClass() {
        return this.itemTypes.armor
            .filter(a => a.system.equipped)
            .map(a => a.system.armorBonus)
            .reduce((acc, cur) => acc+cur, 10)
            + (this.system.abilities.dex.modifier)
            + (this.system.class?.hasKnacks ? this.system.knacks.defensive : 0);
    }

    _prepareWeapons () {
        for(const weapon of this.itemTypes.weapon) {
            if(weapon.actor) {
                const specializedDamageBonus = weapon.system.specialized ? 2 : 0;
                // noinspection JSDeprecatedSymbols
                const knackDamageBonus = this.system.class?.hasKnacks ? this.system.knacks.strike : 0
                const meleeDamageBonus = weapon.system.damageBonus.melee
                    + weapon.actor.system.abilities.str.modifier
                    + specializedDamageBonus
                    + knackDamageBonus;
                const rangedDamageBonus = weapon.system.damageBonus.ranged
                    + specializedDamageBonus
                    + knackDamageBonus;

                weapon.system.damage = {
                    melee: `${weapon.system.baseDamage.noOfDie}${weapon.system.baseDamage.dieType}${meleeDamageBonus === 0 ? "" : meleeDamageBonus > 0 ? `+${meleeDamageBonus}` : meleeDamageBonus}`,
                    ranged: `${weapon.system.baseDamage.noOfDie}${weapon.system.baseDamage.dieType}${rangedDamageBonus === 0 ? "" : rangedDamageBonus > 0 ? `+${rangedDamageBonus}` : rangedDamageBonus}`
                }

                const specializedAttackBonus = weapon.system.specialized ? 1 : 0;

                weapon.system.attack = {
                    melee: weapon.system.attackBonus.melee + weapon.actor.system.abilities.str.modifier + specializedAttackBonus,
                    ranged: weapon.system.attackBonus.ranged + weapon.actor.system.abilities.dex.modifier + specializedAttackBonus
                }

            }

            weapon.system.showMelee = !weapon.system.ranged || weapon.system.hasMeleeOption;
        }
    }

    _getModifier = (value) => {
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
