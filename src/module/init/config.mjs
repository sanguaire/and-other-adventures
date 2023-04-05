import {SystemRoll} from "../systems-roll.mjs";
import {AoaCombat, AoaCombatant, AoaCombatTracker} from "../combat.mjs";
import {AoaToken} from "../aoa-token.mjs";
import {AoaTokenDocument} from "../documents/aoa-token-document.mjs";
import {PcActor} from "../documents/actors/pc-actor.mjs";
import {MonsterActor} from "../documents/actors/monster-actor.js";
import {CONST} from "../const.mjs";
import {ActorProxy} from "../documents/actor-proxy.mjs";
import {ItemProxy} from "../documents/item-proxy.mjs";
import {AoaEffect} from "../documents/aoa-effect.mjs";

export const configure = () => {
    CONFIG.Actor.documentClass = ActorProxy;
    CONFIG.Item.documentClass = ItemProxy;

    CONFIG.Dice.rolls.push(SystemRoll);
    CONFIG.Combatant.documentClass = AoaCombatant;
    CONFIG.Combat.documentClass = AoaCombat;
    CONFIG.ui.combat = AoaCombatTracker;

    CONFIG.Token.objectClass = AoaToken;
    CONFIG.Token.documentClass = AoaTokenDocument;

    CONFIG.ActiveEffect.documentClass = AoaEffect;

    CONFIG.aoa.lightSourceMeasurementUnit = game.settings.get(CONST.MODULE_ID, "lightSourceMeasurementUnit") === "a" ? "meters" : "feet";

    const lightSourceUnit = game.settings.get(CONST.MODULE_ID, "lightSourceMeasurementUnit");

    mergeObject(CONFIG.aoa, {
       lightSourceMeasurementUnit: lightSourceUnit === "a" ? "meters" : "feet",
       lightSources: {
           candle: {
               "alpha": 0.5,
               "angle": 360,
               "bright": lightSourceUnit === "a" ? 1.5 : 5,
               "color": null,
               "coloration": 1,
               "dim": lightSourceUnit === "a" ? 3 : 10,
               "attenuation": 0.5,
               "luminosity": 0.5,
               "saturation": 0,
               "contrast": 0,
               "shadows": 0,
               "animation": {
                   "type": "flame",
                   "speed": 3,
                   "intensity": 3,
                   "reverse": false
               },
               "darkness": {
                   "min": 0,
                   "max": 1
               }
           },
           torch: {
               "alpha": 0.5,
               "angle": 360,
               "bright": lightSourceUnit === "a" ? 6 : 20,
               "color": null,
               "coloration": 1,
               "dim": lightSourceUnit === "a" ?  12 : 40,
               "attenuation": 0.5,
               "luminosity": 0.5,
               "saturation": 0,
               "contrast": 0,
               "shadows": 0,
               "animation": {
                   "type": "flame",
                   "speed": 3,
                   "intensity": 3,
                   "reverse": false
               },
               "darkness": {
                   "min": 0,
                   "max": 1
               }
           },
           lamp: {
               "alpha": 0.5,
               "angle": 360,
               "bright": lightSourceUnit === "a" ? 4 : 15,
               "color": null,
               "coloration": 1,
               "dim": lightSourceUnit === "a" ? 8 : 30,
               "attenuation": 0.5,
               "luminosity": 0.5,
               "saturation": 0,
               "contrast": 0,
               "shadows": 0,
               "animation": {
                   "type": "flame",
                   "speed": 3,
                   "intensity": 3,
                   "reverse": false
               },
               "darkness": {
                   "min": 0,
                   "max": 1
               }
           },
           lantern: {
               "alpha": 0.5,
               "angle": 360,
               "bright": lightSourceUnit === "a" ? 9 : 30,
               "color": null,
               "coloration": 1,
               "dim": lightSourceUnit === "a" ? 18 : 60,
               "attenuation": 0.5,
               "luminosity": 0.5,
               "saturation": 0,
               "contrast": 0,
               "shadows": 0,
               "animation": {
                   "type": "flame",
                   "speed": 3,
                   "intensity": 3,
                   "reverse": false
               },
               "darkness": {
                   "min": 0,
                   "max": 1
               }
           },
           cantrip: {
               "alpha": 0.15,
               "angle": 360,
               "bright": lightSourceUnit === "a" ? 15 : 50,
               "color": "#bdf4ff",
               "coloration": 1,
               "dim": lightSourceUnit === "a" ? 30 : 100,
               "attenuation": 0.5,
               "luminosity": 0.5,
               "saturation": 0,
               "contrast": 0,
               "shadows": 0,
               "animation": {
                   "type": null,
                   "speed": 3,
                   "intensity": 3,
                   "reverse": false
               },
               "darkness": {
                   "min": 0,
                   "max": 1
               }
           }
       }
    });

}
