export const updateActorHandler = async (actor, changes) => {
    await game.combat.resetAll();
    await game.combat.rollAll();
}
