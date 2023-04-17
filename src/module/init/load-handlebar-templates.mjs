import {CONST} from "../const.mjs";

export const loadHandlebarTemplates = async () => {

    await loadTemplates(handlebarTemplates);
    await loadTemplates(pcTemplates);
    await loadTemplates(componentTemplates);
};

export const pcTemplates = {
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
    difficulty: `systems/${CONST.MODULE_ID}/templates/difficulty.hbs`,
    monsterHeader: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-header.hbs`,
    monsterStatistics: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-statistics.hbs`,
    monsterDescription: `systems/${CONST.MODULE_ID}/templates/actors/parts/monster-description.hbs`,
}


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
    `systems/${CONST.MODULE_ID}/templates/apps/part-sheet.hbs`,
    `systems/${CONST.MODULE_ID}/templates/effects.hbs`,
];

const componentTemplates = {
    editableList: `systems/${CONST.MODULE_ID}/templates/editable-list.hbs`
}
