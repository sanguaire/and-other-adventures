import {AoaTokenDocument} from "../aoa-token-document.mjs";

export class AoaActor extends Actor {
    async _onCreateEmbeddedDocuments(embeddedName, ...args) {

        if (embeddedName === "ActiveEffect") {
            const effects = args[0];

            for (const effect of effects) {
                if (effect.label === "Fackel") {
                    const tokenDocs = this.getActiveTokens(false, true);

                    for (const tokenDoc of tokenDocs) {
                        await tokenDoc.update({
                            "light": {
                                "alpha": 0.5,
                                "angle": 360,
                                "bright": 6,
                                "color": null,
                                "coloration": 1,
                                "dim": 12,
                                "attenuation": 0.5,
                                "luminosity": 0.5,
                                "saturation": 0,
                                "contrast": 0,
                                "shadows": 0,
                                "animation": {
                                    "type": null,
                                    "speed": 5,
                                    "intensity": 5,
                                    "reverse": false
                                },
                                "darkness": {
                                    "min": 0,
                                    "max": 1
                                }
                            }
                        });
                    }


                }
            }

        }


        super._onCreateEmbeddedDocuments(embeddedName, ...args);
    }
}