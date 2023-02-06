import {ActorProxy} from "./documents/actor-proxy.mjs";
import {ItemProxy} from "./documents/item-proxy.mjs";
import {PcSheet} from "./sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "./sheets/actors/monster-sheet.mjs";
import {CONST} from "./const.mjs";

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = ActorProxy;
    CONFIG.Item.documentClass = ItemProxy;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(CONST.MODULE_NAME, PcSheet, {types: ["pc"], makeDefault: true})
    Actors.registerSheet(CONST.MODULE_NAME, MonsterSheet, {types: ["monster"], makeDefault: true})

    Items.unregisterSheet("core", ItemSheet);


});

