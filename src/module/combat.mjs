import {CONST} from "./const.mjs";

export class AoaCombat extends Combat {
    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
        this._sortCombatants();
    }

    _sortCombatants(a, b) {
        if(!(a && b)) {
            return 1;
        }

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

    static stances = {
        normal: "",
        aggressive: "&#xf71d",
        defensive: "&#xf132",
        protective: "&#xf0e9",
        commanding: "&#xf4af"
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `systems/${CONST.MODULE_ID}/templates/sidebar/combat-tracker.hbs`,
        });
    }

    async getData(options = {}) {
        const context = await super.getData(options);

        context.turns.forEach(t => {
            const actor = context.combat.combatants.get(t.id).actor;

            t.type = actor.type;
            t.stance = actor.type === "pc" ?
                `${AoaCombatTracker.stances[actor.system.combatStance]}` :
                "";
            t.ac = actor.system.ac;
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
