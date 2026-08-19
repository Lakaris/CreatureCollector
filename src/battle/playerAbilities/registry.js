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
import { breezekit, galestride, tempesthawk, stormlord } from "./breezekitLine.js";
import { crystalcrab, gemcrab, gemtitan } from "./crystalcrabLine.js";
import { pebbit, bouldrath, granitarch, mountainking } from "./pebbitLine.js";
import { morusk, ivormar } from "./moruskLine.js";
import { shockcrab, voltcrusher, galvaniccrab } from "./shockstingerLine.js";
import { coralleviathan, tidecrush, tidelord } from "./nesslingLine.js";
import { abyssgolem, nihilgolem } from "./loptrixLine.js";

export const PLAYER_ABILITY_MODULES = { blazehornet, infernohive, infernoswarm, sacredwasp, divinedrone, holyswarm, bloomphoenix, lifephoenix, ignisdragon, pyredragon, breezekit, galestride, tempesthawk, stormlord, crystalcrab, gemcrab, gemtitan, pebbit, bouldrath, granitarch, mountainking, morusk, ivormar, shockcrab, voltcrusher, galvaniccrab, coralleviathan, tidecrush, tidelord, abyssgolem, nihilgolem };

/** Look up a player creature's ability module. Returns undefined if unimplemented. */
export function getPlayerAbilityModule(creatureId) {
  return PLAYER_ABILITY_MODULES[creatureId];
}
