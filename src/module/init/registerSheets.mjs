import {CONST} from "../const.mjs";
import {PcSheet} from "../sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "../sheets/actors/monster-sheet.mjs";
import {ExtendedItemSheet} from "../sheets/items/extended-item-sheet.mjs";

export const registerSheets = () => {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(CONST.MODULE_SCOPE, PcSheet, {label: game.i18n.localize("aoa.pc-sheet"), types: ["pc"], makeDefault: true});
    Actors.registerSheet(CONST.MODULE_SCOPE, MonsterSheet, {label: game.i18n.localize("aoa.monster-sheet"),types: ["monster"], makeDefault: false});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(CONST.MODULE_SCOPE, ExtendedItemSheet, {label: game.i18n.localize("aoa.item-sheet"), types: ["class", "armor", "weapon", "gear", "ritual", "spell", "cantrip", "attack"], makeDefault: true});

};
