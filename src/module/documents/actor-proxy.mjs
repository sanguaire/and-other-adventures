//Provide a type string to class object mapping to keep our code clean
import {PcActor} from "./actors/pc-actor.mjs";
import {MonsterActor} from "./actors/monster-actor.mjs";
import {AoaActor} from "./actors/aoa-actor.mjs";

const mappings = {
    pc: PcActor,
    monster: MonsterActor
};

const actorHandler = {
    construct(_, args) {
        const type = args[0]?.type;
        const cls = mappings[type] ?? AoaActor;
        return new cls(...args);
    },
}

export const ActorProxy = new Proxy(AoaActor, actorHandler);
