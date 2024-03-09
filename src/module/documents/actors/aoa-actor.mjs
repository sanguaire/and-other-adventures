export class AoaActor extends Actor {

    async applyActiveEffects() {
        const overrides = {};

        // Organize non-disabled effects by their application priority
        const changes = this.effects.reduce((changes, e) => {
            if ( e.disabled || e.isSuppressed ) return changes;
            return changes.concat(e.changes.filter(c => c.key.toLowerCase() !== "light").map(c => {
                c = foundry.utils.duplicate(c);
                c.effect = e;
                c.priority = c.priority ?? (c.mode * 10);
                return c;
            }));
        }, []);

        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for ( let change of changes ) {
            if ( !change.key ) continue;
            const changes = change.effect.apply(this, change);
            Object.assign(overrides, changes);
        }

        // Expand the set of final overrides
        this.overrides = foundry.utils.expandObject(overrides);

        await this.applyLight();
    }

    async applyLight() {
        if(!game.user.isGM)
            return;

        const lightSources = foundry.utils.duplicate(CONFIG.aoa.lightSources);
        lightSources.noLight = this.prototypeToken.light.toObject();

        const lights = this.effects.reduce((changes, e) => {
            if ( e.disabled || e.isSuppressed ) return changes;
            return changes.concat(e.changes.filter(c => c.key.toLowerCase() === "light").map(c => {
                c = foundry.utils.duplicate(c);
                c.effect = e;
                c.priority = c.priority ?? (c.mode * 10);
                return c;
            }));
        }, []);

        lights.sort((a, b) => a.priority - b.priority);

        if(lights.length === 0) {
            const tokenDocs = this.getActiveTokens(false, true);

            for (const tokenDoc of tokenDocs) {
                await tokenDoc.update({
                    "light": lightSources.noLight
                });
            }
        }

        for (let light of lights) {
            if(!(light.key && light.value && lightSources.hasOwnProperty(light.value))) continue;

            const tokenDocs = this.getActiveTokens(false, true);

            for (const tokenDoc of tokenDocs) {
                await tokenDoc.update({
                    "light": lightSources[light.value]
                });
            }
        }
    }

    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);

        console.log(data);
        console.log(options);
        console.log(userId);
    }

}
