export const updateActorHandler = async (actor, changes, data, userId) => {
    if(!actor.canUserModify(game.user, "update")) {
        return;
    }

    if(game.combat && game.user.isGM) {
			
        const oldTurn = game.combat.turn;		
        await game.combat.resetAll();
        await game.combat.rollAll();
        await game.combat.update({"turn": oldTurn});
    }

    if(userId !== game.user.id) {
        return;
    }

   const hpValue = changes.system?.hp?.value;

    await handleHpChange();
    async function handleHpChange() {
        if (hpValue === "undefined") {
            return;
        }

        const tokens = actor.getActiveTokens();
        const deadEffectData = CONFIG.statusEffects.find(e => e.id === "dead");
        const koEffectData = CONFIG.statusEffects.find(e => e.id === "unconscious");
        for (const t of tokens) {
            const tokenDocument = t.document;

            if (!tokenDocument.canUserModify(game.user, "update")) {
                continue;
            }

            if (actor.type === "monster") {
                const combatant = tokenDocument.combatant;

                if (hpValue <= 0 && !tokenDocument.hasStatusEffect(deadEffectData.id)) {
                    if(combatant) {
                        await combatant.update({"defeated": true})
                    }
                    await tokenDocument.toggleActiveEffect(deadEffectData, {active: true, overlay: true});
                }

                if (hpValue > 0) {
                    if(combatant) {
                        await combatant.update({"defeated": false})
                    }
                    await tokenDocument.toggleActiveEffect(deadEffectData, {active: false});
                }

            }

            if (actor.type === "pc") {
                if (hpValue <= 0 && !tokenDocument.hasStatusEffect(koEffectData.id)) {
                    await tokenDocument.toggleActiveEffect(koEffectData, {active: true, overlay: true});
                }

                if (hpValue <= -10 && !tokenDocument.hasStatusEffect(deadEffectData.id)) {
                    await tokenDocument.toggleActiveEffect(deadEffectData, {active: true, overlay: true});
                    await tokenDocument.toggleActiveEffect(koEffectData, {active: false});
                }

                if (hpValue > -10) {
                    await tokenDocument.toggleActiveEffect(deadEffectData, {active: false});
                }

                if (hpValue > 0) {
                    await tokenDocument.toggleActiveEffect(koEffectData, {active: false});
                }
            }
        }
    }
}
