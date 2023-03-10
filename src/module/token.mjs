export class AoaToken extends Token {

    async _draw() {
        await super._draw();

        this.ac = this.addChild(new PIXI.Container());

        this.drawAc();
    }

    drawAc() {
        this.ac.renderable = false;
        this.ac.removeChildren().forEach(c => c.destroy());

        const style = this._getTextStyle();
        const text = `${game.i18n.localize("aoa.ac-abr")}: ${this.document.actor?.system.ac}`

        const acText = new PreciseText(text, style);
        const metrics = PIXI.TextMetrics.measureText(text, style);
        const graphics = new PIXI.Graphics();

        graphics.beginFill(0xFFFFFF, 0.8);
        graphics.drawRoundedRect(-metrics.width, 0, metrics.width + 20, metrics.height, 5);
        graphics.endFill();

        acText.anchor.set(1, 0);
        acText.position.set(10, 0);

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
}
