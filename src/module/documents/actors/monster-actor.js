export class MonsterActor extends Actor {
    prepareBaseData() {
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
}
