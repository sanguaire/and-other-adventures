export class AoaEffect extends ActiveEffect {
    get isTemporary() {
        const duration = this.duration.seconds ?? (this.duration.rounds || this.duration.turns) ?? 0;
        return (duration > 0) || this.getFlag("core", "statusId") || this.changes.filter(c => c.key.toLowerCase() === "light").length > 0;
    }
}
