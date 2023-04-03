import {SystemRoll} from "./systems-roll.mjs";
import {AoaCombat, AoaCombatant, AoaCombatTracker} from "./combat.mjs";
import {AoaToken} from "./aoa-token.mjs";
import {AoaTokenDocument} from "./documents/aoa-token-document.mjs";

export const configure = () => {
    CONFIG.Dice.rolls.push(SystemRoll);
    CONFIG.Combatant.documentClass = AoaCombatant;
    CONFIG.Combat.documentClass = AoaCombat;
    CONFIG.ui.combat = AoaCombatTracker;

    CONFIG.Token.objectClass = AoaToken;
    CONFIG.Token.documentClass = AoaTokenDocument;


}
