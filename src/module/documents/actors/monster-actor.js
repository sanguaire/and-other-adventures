export class MonsterActor extends Actor {

    static monsterSave = {
        1:  {
            poison: 14,
            breathWeapon: 17,
            polymorph: 15,
            spell: 17,
            magicItem: 16
        },
        2:  {
            poison: 14,
            breathWeapon: 17,
            polymorph: 15,
            spell: 17,
            magicItem: 16
        },
        3:  {
            poison: 13,
            breathWeapon: 16,
            polymorph: 14,
            spell: 14,
            magicItem: 15
        },
        4:  {
            poison: 13,
            breathWeapon: 16,
            polymorph: 14,
            spell: 14,
            magicItem: 15
        },
        5:  {
            poison: 11,
            breathWeapon: 14,
            polymorph: 12,
            spell: 12,
            magicItem: 13
        },
        6:  {
            poison: 11,
            breathWeapon: 14,
            polymorph: 12,
            spell: 12,
            magicItem: 13
        },
        7:  {
            poison: 10,
            breathWeapon: 13,
            polymorph: 11,
            spell: 11,
            magicItem: 12
        },
        8:  {
            poison: 10,
            breathWeapon: 13,
            polymorph: 11,
            spell: 11,
            magicItem: 12
        },
        9:  {
            poison: 8,
            breathWeapon: 11,
            polymorph: 9,
            spell: 9,
            magicItem: 10
        },
        10:  {
            poison: 8,
            breathWeapon: 11,
            polymorph: 9,
            spell: 9,
            magicItem: 10
        },
        11:  {
            poison: 7,
            breathWeapon: 10,
            polymorph: 8,
            spell: 8,
            magicItem: 9
        },
        12:  {
            poison: 7,
            breathWeapon: 10,
            polymorph: 8,
            spell: 8,
            magicItem: 9
        },
        13:  {
            poison: 5,
            breathWeapon: 8,
            polymorph: 6,
            spell: 5,
            magicItem: 7
        },
        14:  {
            poison: 5,
            breathWeapon: 8,
            polymorph: 6,
            spell: 5,
            magicItem: 7
        },
        15:  {
            poison: 4,
            breathWeapon: 7,
            polymorph: 5,
            spell: 4,
            magicItem: 6
        },
        16:  {
            poison: 4,
            breathWeapon: 7,
            polymorph: 5,
            spell: 4,
            magicItem: 6
        },
        17:  {
            poison: 3,
            breathWeapon: 6,
            polymorph: 4,
            spell: 4,
            magicItem: 5
        },
    };

    prepareBaseData() {
        this.system.saves = MonsterActor.monsterSave[Math.clamped(this.system.hitDie.number, 1 ,17)]
        this._prepareAttacks();
    }

    _prepareAttacks() {
        for(const attack of this.itemTypes.attack) {
            const damageBonus = attack.system.damage.bonus;
            const damageFormula = `${attack.system.damage.noOfDie}${attack.system.damage.dieType}${damageBonus === 0 ? "" : damageBonus > 0 ? `+${damageBonus}` : damageBonus}`
            const localizedDamageFormula = `${attack.system.damage.noOfDie}${game.i18n.localize("aoa." + attack.system.damage.dieType)}${damageBonus === 0 ? "" : damageBonus > 0 ? `+${damageBonus}` : damageBonus}`

            attack.system.damage.formula = damageFormula;
            attack.system.damage.localizedFormula = localizedDamageFormula;
        }
    }

    async _onCreateEmbeddedDocuments(embeddedName, ...args) {
        console.log(args);

        if(embeddedName === "Item") {
            const changes = args[1].filter(c => c.type === "attack").map(c =>  {
                return {
                    _id: c._id,
                    system: {
                        toHit: this.system.hitDie.number
                    }
                }
            });

            await this.updateEmbeddedDocuments("Item", changes);
        }

        super._onCreateEmbeddedDocuments(embeddedName, ...args);
    }
}
