import {ActorProxy} from "./documents/actor-proxy.mjs";
import {ItemProxy} from "./documents/item-proxy.mjs";
import {PcSheet} from "./sheets/actors/pc-sheet.mjs";
import {MonsterSheet} from "./sheets/actors/monster-sheet.mjs";
import {CONST} from "./const.mjs";
import {ExtendedItemSheet} from "./sheets/items/extended-item-sheet.mjs";
import {registerHelpers} from "./handlebars.mjs";
import {chatMessageHandler} from "./chat-message-handler.mjs";
import {registerSettings} from "./settings.mjs";
import {configure} from "./config.mjs";
import {updateActorHandler} from "./update-actor-handler.mjs";
import {updateItemHandler} from "./update-item-handler.mjs";
import {renderActiveEffectConfigHandler, closeActiveEffectConfigHandler} from "./active-effect-config-handler.mjs";
import {getSceneControlButtonsHandler} from "./get-scene-control-buttons-handler.mjs";
import {requestRollHandler} from "./request-roll-handler.mjs";

const handlebarTemplates = [
    `systems/${CONST.MODULE_ID}/templates/items/parts/header.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/parts/trait.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/armor-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/class-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/weapon-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/gear-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/weapon.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/attack.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/gear.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/armor.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/skill.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/only-name.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/trait.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/roll-on.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/spell.hbs`,
    `systems/${CONST.MODULE_ID}/templates/item-templates/effect.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/spell-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/cantrip-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/ritual-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/attack-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/items/trait-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/apps/roll-requester.hbs`,
];

const pcTemplates = {
    pcHeader: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-header.hbs`,
    pcResources:  `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-resources.hbs`,
    pcAbilities: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-abilities.hbs`,
    pcSaves: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-saves.hbs`,
    pcCombat: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-combat.hbs`,
    pcSkill: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-skill.hbs`,
    pcGear: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-gear.hbs`,
    pcSpell: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-spell.hbs`,
    pcSpecials: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-specials.hbs`,
    pcBiography: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-biography.hbs`,
    pcNotes: `systems/${CONST.MODULE_ID}/templates/actors/parts/pc-notes.hbs`,
    effects: `systems/${CONST.MODULE_ID}/templates/effects.hbs`,
    monsterHeader: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-header.hbs`,
    monsterStatistics: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-statistics.hbs`,
    monsterDescription: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-description.hbs`,
}

const componentTemplates = {
    editableList: `systems/${CONST.MODULE_ID}/templates/editable-list.hbs`
}

Hooks.once("socketlib.ready", () => {
    CONFIG.aoa = {
        socket: socketlib.registerSystem(CONST.MODULE_ID)
    };

    CONFIG.aoa.socket.register("requestRoll", requestRollHandler);
});


Hooks.once("init", async () => {
    CONFIG.Actor.documentClass = ActorProxy;
    CONFIG.Item.documentClass = ItemProxy;

    registerSettings();

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(CONST.MODULE_SCOPE, PcSheet, {types: ["pc"], makeDefault: true});
    Actors.registerSheet(CONST.MODULE_SCOPE, MonsterSheet, {types: ["monster"], makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(CONST.MODULE_SCOPE, ExtendedItemSheet, {types: ["class", "armor", "weapon", "gear", "ritual", "spell", "cantrip", "attack"], makeDefault: true});

    registerHelpers();

    loadTemplates(handlebarTemplates);
    loadTemplates(pcTemplates);
    loadTemplates(componentTemplates);

    Hooks.on("renderChatMessage", chatMessageHandler );
    Hooks.on("updateActor", updateActorHandler);
    Hooks.on("updateItem", updateItemHandler);
    Hooks.on("renderActiveEffectConfig", renderActiveEffectConfigHandler);
    Hooks.on("closeActiveEffectConfig", closeActiveEffectConfigHandler);
    Hooks.on("getSceneControlButtons", getSceneControlButtonsHandler);


    configure();

});




