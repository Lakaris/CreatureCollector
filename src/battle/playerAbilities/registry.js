// Player-creature ability registry, keyed by creature id.
//
// Mirrors src/battle/bosses/registry.js: each module owns the mechanical
// implementation of one creature's abilities (multi-hit attacks, on-hit
// effects, battle-start passives). Most creatures have no module here yet --
// their `abilities` in src/data/creatures.js are flavor text only, rendered
// in the UI but not read by the battle engine. Creatures get a module added
// here as their abilities are mechanically implemented.

import { blazehornet, infernohive, infernoswarm } from "./emberstarLine.js";
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
import { frosthydra, glacialhydra, bombardguin, cryogeddon } from "./waddlepopLine.js";
import { glowpup, radiantkit, dawnbeast, solarcrown } from "./jadebunLine.js";
import { galeserpent, vortexserpent, cyclonwyrm } from "./quetzalisLine.js";
import { emberchirp, pyrefinch, cauterix, hearthenix } from "./emberchirpLine.js";
import { doomgrub, nihilwyrm, wispModule } from "./doomshadeLine.js";
import { frostpup, snowmane, blizzardback, glaciertusk } from "./igletLine.js";
import { ironmole, steelmole, titanmole, skysage } from "./craglingLine.js";
import { bonebeak, gravewing, charnelord } from "./bonebeakLine.js";
import { dustling, silkhusk, gloamwing, lunashroud } from "./dustlingLine.js";
import { leafling, canoparch, verdantlord, ancientgrove } from "./venomcoilLine.js";
import { mosskrab, jadekrab, crystalshell, rampartops } from "./frilletLine.js";
import { sylvandragon, ancientdragon } from "./siegefinLine.js";
import { aurorabird, radiancebird, celestbird, empyravis } from "./aurorionLine.js";
import { emberpup, emberhound, infernoking, ashmonarch } from "./emberpupLine.js";
// Ids inherited from the retired Prismcrab line (now the Oathcub paladin bears).
import { prismcrab, spectrumcrab, rainbowshell, chromatarch } from "./oathcubLine.js";
import { holydragon, celestialdragon } from "./auravastLine.js";

export const PLAYER_ABILITY_MODULES = { blazehornet, infernohive, infernoswarm, sacredwasp, divinedrone, holyswarm, bloomphoenix, lifephoenix, ignisdragon, pyredragon, breezekit, galestride, tempesthawk, stormlord, crystalcrab, gemcrab, gemtitan, pebbit, bouldrath, granitarch, mountainking, morusk, ivormar, shockcrab, voltcrusher, galvaniccrab, coralleviathan, tidecrush, tidelord, abyssgolem, nihilgolem, frosthydra, glacialhydra, bombardguin, cryogeddon, glowpup, radiantkit, dawnbeast, solarcrown, galeserpent, vortexserpent, cyclonwyrm, emberchirp, pyrefinch, cauterix, hearthenix, doomgrub, nihilwyrm, frostpup, snowmane, blizzardback, glaciertusk, ironmole, steelmole, titanmole, skysage, bonebeak, gravewing, charnelord, dustling, silkhusk, gloamwing, lunashroud, leafling, canoparch, verdantlord, ancientgrove, mosskrab, jadekrab, crystalshell, rampartops, sylvandragon, ancientdragon, aurorabird, radiancebird, celestbird, empyravis, emberpup, emberhound, infernoking, ashmonarch, prismcrab, spectrumcrab, rainbowshell, chromatarch, holydragon, celestialdragon, "__wisp": wispModule };

/** Look up a player creature's ability module. Returns undefined if unimplemented. */
export function getPlayerAbilityModule(creatureId) {
  return PLAYER_ABILITY_MODULES[creatureId];
}
