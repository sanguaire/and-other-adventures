export const updateItemHandler = async (item) => {
    if(!item.canUserModify(game.user, "update")) {
        return;
    }

    if(item.type === "weapon" && item.isEmbedded) {
        if(item._id === item.actor.system.selectedWeapon && !item.system.equipped) {
            item.actor.update(
                {
                    "system.selectedWeapon": ""
                }
            );
        }
    }
}
