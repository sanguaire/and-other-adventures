export class AoaNote extends Note {
    _drawTooltip() {
        return super._drawTooltip();
    }

    _getTextStyle() {
        const style = CONFIG.canvasTextStyle.clone();

        // Positioning
        if ( this.document.textAnchor === CONST.TEXT_ANCHOR_POINTS.LEFT ) style.align = "right";
        else if ( this.document.textAnchor === CONST.TEXT_ANCHOR_POINTS.RIGHT ) style.align = "left";

        // Font preferences
        style.fontFamily = this.document.fontFamily || CONFIG.defaultFontFamily;
        style.fontSize = this.document.fontSize;
        style.letterSpacing = style.fontSize * 0.1;
        style.padding = style.fontSize * 0.4;

        // Toggle stroke style depending on whether the text color is dark or light
        const color = Color.from(this.document.textColor ?? 0xFFFFFF);
        style.fill = color;
        style.strokeThickness = 4;
        style.stroke = color.hsv[2] > 0.6 ? 0x000000 : 0xFFFFFF;
        return style;
    }

    _canDrag(user, event) {
        return super._canDrag(user, event) && ui.controls.activeControl === "notes";
    }

    _canControl(user, event) {
        return super._canControl(user, event) && ui.controls.activeControl === "notes";
    }

}
