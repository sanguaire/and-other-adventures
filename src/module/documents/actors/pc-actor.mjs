export class PcActor extends Actor {

    prepareBaseData() {
        for (const [key, value] of Object.entries(this.system.abilities)) {
            this.system.abilities[key].modifier = 0;
        }
    }

}
