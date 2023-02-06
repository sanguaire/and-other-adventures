import {ActorProxy} from "./documents/actor-proxy.mjs";
import {ItemProxy} from "./documents/item-proxy.mjs";
import {PcSheet} from "./sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "./sheets/actors/monster-sheet.mjs";
import {CONST} from "./const.mjs";

const handlebarTemplates = [
    `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-header.hbs`,
    `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-resources.hbs`,
    `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-abilities.hbs`,
    `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-combat.hbs`,
    `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-skill.hbs`,
]

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = ActorProxy;
    CONFIG.Item.documentClass = ItemProxy;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(CONST.MODULE_SCOPE, PcSheet, {types: ["pc"], makeDefault: true})
    Actors.registerSheet(CONST.MODULE_SCOPE, MonsterSheet, {types: ["monster"], makeDefault: true})

    Items.unregisterSheet("core", ItemSheet);

    loadTemplates(handlebarTemplates);

});

