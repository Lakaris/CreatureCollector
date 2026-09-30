// Player-creature ability registry, keyed by creature id.
//
// Mirrors src/battle/bosses/registry.js: each module owns the mechanical
// implementation of one creature's abilities (multi-hit attacks, on-hit
// effects, battle-start passives). Most creatures have no module here yet --
// their `abilities` in src/data/creatures.js are flavor text only, rendered
// in the UI but not read by the battle engine. Creatures get a module added
// here as their abilities are mechanically implemented.

import { emberstar, magmastar, blastar } from "./emberstarLine.js";
import { starlit, starbright, starburn } from "./starlitLine.js";
import { bloomibis, animavis } from "./bloomibisLine.js";
import { ignissaur, pyresaur } from "./ignissaurLine.js";
import { cirruskit, cumulynx, nimbupard, stormpelt } from "./cirruskitLine.js";
import { crystalcrab, gemcrab, gemtitan } from "./crystalcrabLine.js";
import { pebbit, bouldroad, granitoad, toadalith } from "./pebbitLine.js";
import { morusk, ivormar } from "./moruskLine.js";
import { shockstinger, voltlasher, galvascorpion } from "./shockstingerLine.js";
import { nessling, lochcoil, nessarch } from "./nesslingLine.js";
import { loptrix, ragnavix } from "./loptrixLine.js";
import { waddlepop, frostillery, bombardguin, cryogeddon } from "./waddlepopLine.js";
import { jadebun, pestlehare, elixhare, lunarch } from "./jadebunLine.js";
import { coatlet, plumecoatl, quetzalis } from "./coatletLine.js";
import { emberchirp, pyrefinch, cauterix, hearthenix } from "./emberchirpLine.js";
import { doomshade, nihilgeist, wispModule } from "./doomshadeLine.js";
import { iglet, shellter, frostkeep, hibernarch } from "./igletLine.js";
import { cragling, cragfist, cloudvault, skysage } from "./craglingLine.js";
import { bonebeak, gravewing, charnelord } from "./bonebeakLine.js";
import { dustling, silkhusk, gloamwing, lunashroud } from "./dustlingLine.js";
import { venomcoil, mirewreathe, toxiconda, gaiaconda } from "./venomcoilLine.js";
import { frillet, bulwarden, aegiceras, rampartops } from "./frilletLine.js";
import { siegefin, siegespire } from "./siegefinLine.js";
import { aurorion, lumileo, celestleo, empyreon } from "./aurorionLine.js";
import { emberpup, emberhound, infernoking, ashmonarch } from "./emberpupLine.js";
import { oathcub, vowbruin, sanctursa, oathmaul } from "./oathcubLine.js";
import { auravast, lumimajor } from "./auravastLine.js";
import { sparkshell, capacitort, dynashell, accumulith } from "./sparkshellLine.js";
import { sicklewing, galescythe } from "./sicklewingLine.js";
import { clubtail, anvilback } from "./clubtailLine.js";
import { cinderbill, emberpouch, kilnwing, pyrelican } from "./cinderbillLine.js";

export const PLAYER_ABILITY_MODULES = { emberstar, magmastar, blastar, starlit, starbright, starburn, bloomibis, animavis, ignissaur, pyresaur, cirruskit, cumulynx, nimbupard, stormpelt, crystalcrab, gemcrab, gemtitan, pebbit, bouldroad, granitoad, toadalith, morusk, ivormar, shockstinger, voltlasher, galvascorpion, nessling, lochcoil, nessarch, loptrix, ragnavix, waddlepop, frostillery, bombardguin, cryogeddon, jadebun, pestlehare, elixhare, lunarch, coatlet, plumecoatl, quetzalis, emberchirp, pyrefinch, cauterix, hearthenix, doomshade, nihilgeist, iglet, shellter, frostkeep, hibernarch, cragling, cragfist, cloudvault, skysage, bonebeak, gravewing, charnelord, dustling, silkhusk, gloamwing, lunashroud, venomcoil, mirewreathe, toxiconda, gaiaconda, frillet, bulwarden, aegiceras, rampartops, siegefin, siegespire, aurorion, lumileo, celestleo, empyreon, emberpup, emberhound, infernoking, ashmonarch, oathcub, vowbruin, sanctursa, oathmaul, auravast, lumimajor, sparkshell, capacitort, dynashell, accumulith, sicklewing, galescythe, clubtail, anvilback, cinderbill, emberpouch, kilnwing, pyrelican, "__wisp": wispModule };

/** Look up a player creature's ability module. Returns undefined if unimplemented. */
export function getPlayerAbilityModule(creatureId) {
  return PLAYER_ABILITY_MODULES[creatureId];
}
