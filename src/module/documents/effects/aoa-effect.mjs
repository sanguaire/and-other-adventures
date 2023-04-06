export class AoaEffect extends ActiveEffect {
    static defineSchema() {
        return mergeObject(super.defineSchema(), {
            needsConcentration: new foundry.data.fields.BooleanField({initial: false, nullable: false, required: true})
        });
    }

    get isTemporary() {
        const duration = this.duration.seconds ?? (this.duration.rounds || this.duration.turns) ?? 0;
        return (duration > 0) || this.getFlag("core", "statusId") || this.needsConcentration;
    }

}
