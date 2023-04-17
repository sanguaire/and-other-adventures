export const updateActorHandler = async (actor, changes, data, userId) => {
    if(!actor.canUserModify(game.user, "update")) {
        return;
    }

    if(game.combat && game.user.isGM) {
        await game.combat.resetAll();
        await game.combat.rollAll();
    }

    if(userId !== game.user.id) {
        return;
    }

   const hpValue = changes.system?.hp?.value;

    handleHpChange();
    function handleHpChange() {
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
                if (hpValue <= 0 && !tokenDocument.hasStatusEffect(deadEffectData.id)) {
                    tokenDocument.toggleActiveEffect(deadEffectData, {active: true, overlay: true});
                }

                if (hpValue > 0) {
                    tokenDocument.toggleActiveEffect(deadEffectData, {active: false});
                }

            }

            if (actor.type === "pc") {
                if (hpValue <= 0 && !tokenDocument.hasStatusEffect(koEffectData.id)) {
                    tokenDocument.toggleActiveEffect(koEffectData, {active: true, overlay: true});
                }

                if (hpValue <= -10 && !tokenDocument.hasStatusEffect(deadEffectData.id)) {
                    tokenDocument.toggleActiveEffect(deadEffectData, {active: true, overlay: true});
                    tokenDocument.toggleActiveEffect(koEffectData, {active: false});
                }

                if (hpValue > -10) {
                    tokenDocument.toggleActiveEffect(deadEffectData, {active: false});
                }

                if (hpValue > 0) {
                    tokenDocument.toggleActiveEffect(koEffectData, {active: false});
                }
            }
        }
    }
}
