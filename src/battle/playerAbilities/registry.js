// Player-creature ability registry, keyed by creature id.
//
// Mirrors src/battle/bosses/registry.js: each module owns the mechanical
// implementation of one creature's abilities (multi-hit attacks, on-hit
// effects, battle-start passives). Most creatures have no module here yet --
// their `abilities` in src/data/creatures.js are flavor text only, rendered
// in the UI but not read by the battle engine. Creatures get a module added
// here as their abilities are mechanically implemented.

import { blazehornet, infernohive, infernoswarm } from "./blazehornetLine.js";
import { sacredwasp, divinedrone, holyswarm } from "./starlitLine.js";
import { bloomphoenix, lifephoenix } from "./bloomibisLine.js";
import { ignisdragon, pyredragon } from "./ignissaurLine.js";
import { breezekit } from "./breezekitLine.js";

export const PLAYER_ABILITY_MODULES = { blazehornet, infernohive, infernoswarm, sacredwasp, divinedrone, holyswarm, bloomphoenix, lifephoenix, ignisdragon, pyredragon, breezekit };

/** Look up a player creature's ability module. Returns undefined if unimplemented. */
export function getPlayerAbilityModule(creatureId) {
  return PLAYER_ABILITY_MODULES[creatureId];
}
