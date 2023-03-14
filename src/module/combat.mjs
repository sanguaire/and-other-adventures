import {CONST} from "./const.mjs";

export class AoaCombat extends Combat {
/*    _onCreateEmbeddedDocuments(type, documents, result, options, userId) {
        console.log({type, documents, result, options, userId});

        if(type==="Combatant") {
            documents.forEach(d => {
                d.update({"initiative": (d.actor.type === 'pc' ? d.actor.system.initiative : d.actor.system.hitDie.number)} )
            })
        }

        super._onCreateEmbeddedDocuments(type, documents, result, options, userId);
    }*/

    _sortCombatants(a, b) {
        const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
        const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;


        return (ib - ia) || (a.actor.type === "pc" && b.actor.type === "monster" ? -1 : 1 );
    }
}

export class AoaCombatant extends Combatant {
    _getInitiativeFormula() {
        return this.actor.type === 'pc' ? this.actor.system.initiative : this.actor.system.hitDie.number;
    }

    async rollInitiative(formula) {
        return this.update({initiative: this._getInitiativeFormula()});
    }

    get initiative() {
        return this.actor.type === 'pc' ? this.actor.system.initiative : this.actor.system.hitDie.number;
    }

    set initiative(value) {

    }
}

export class AoaCombatTracker extends CombatTracker {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `systems/${CONST.MODULE_ID}/templates/sidebar/combat-tracker.hbs`,
        });
    }

    async getData(options = {}) {
        const context = await super.getData(options);

        context.turns.forEach(t => {
            t.type = context.combat.combatants.get(t.id).actor.type;
        });

        return context;
    }

    async _onCombatantControl(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);

        // Switch control action
        switch (btn.dataset.control) {

            // Toggle combatant visibility
            case "toggleHidden":
                await c.token?.update({hidden: !c.hidden})
                return c.update({hidden: !c.hidden});

            // Toggle combatant defeated flag
            case "toggleDefeated":
                return this._onToggleDefeatedStatus(c);

            // Roll combatant initiative
            case "rollInitiative":
                return combat.rollInitiative([c.id]);

            // Actively ping the Combatant
            case "pingCombatant":
                return this._onPingCombatant(c);
        }
    }
}
