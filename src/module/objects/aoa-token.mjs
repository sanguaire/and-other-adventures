export class AoaToken extends Token {

    async _onCreate(options, userId) {
        super._onCreate(options, userId);

        await this.document?.actor?.applyActiveEffects();
        
        if(game.user.isGM && this.document && this.document.isLinked === false) {
             AoaToken.hitDie(this.document.actor);
        }
    }

    async _draw() {
        await super._draw();

        this.ac = this.addChild(new PIXI.Container());

        this.drawAc();
    }


    drawAc() {
        return;

        this.ac.renderable = false;
        this.ac.removeChildren().forEach(c => c.destroy());

        const style = this._getTextStyle();
        const text = `${game.i18n.localize("aoa.ac-abr")}: ${this.document.actor?.system.ac}`

        const acText = new PreciseText(text, style);
        const metrics = PIXI.TextMetrics.measureText(text, style);
        const graphics = new PIXI.Graphics();

        graphics.beginFill(0x000000, 0.8);
        graphics.drawRoundedRect(-metrics.width, -10, metrics.width + 20, metrics.height, 5);
        graphics.endFill();

        acText.anchor.set(1, 0);
        acText.position.set(10, -10);

        this.ac.addChild(graphics);
        this.ac.addChild(acText);


        this.ac.renderable = true;
    }

    refreshHUD({bars = true, border = true, effects = true, elevation = true, nameplate = true, ac = true} = {}) {
        super.refreshHUD({bars, border, effects, elevation , nameplate});

        if(ac) {
            const newText = `${game.i18n.localize("aoa.ac-abr")}: ${this.document.actor?.system.ac}`;

            if(this.ac.children[1].text !== newText) {
                this.drawAc()
            }

            this.ac.visible = this._canViewMode(this.document.displayBars) && this._canViewMode(this.document.displayName);
        }
    }
    
    static async hitDie(actor) {
        const roll = await new Roll(`${actor.system.hitDie.number}${actor.system.hitDie.dieType}+${actor.system.hitDie.bonus}`).roll({async: true})

        await actor.update({
            "system.hp.value": roll.total,
            "system.hp.max": roll.total
        });

    }
}
