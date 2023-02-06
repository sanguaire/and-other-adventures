import {ActorProxy} from "./documents/actor-proxy.mjs";
import {ItemProxy} from "./documents/item-proxy.mjs";

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = ActorProxy;
    CONFIG.Item.documentClass = ItemProxy;

    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);
});

