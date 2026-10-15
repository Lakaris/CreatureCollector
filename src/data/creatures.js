// Creature roster: every species definition, its evolution links, and derived lookups.
// Evolution chains are a doubly-linked list of ids via `evolutionOf` (back) and
// `evolutionId` (forward); walk them with the helpers in src/core/creatures.js.
//
// STATS. `hp`/`atk`/`def` are the statline a creature is balanced on and the
// only ones leveling and ascension touch; `spd`, `abilitySpeed`, `crit`, and
// `critDmg` start where they start and move only through Equipment and Flair.
//
// The crit pair, both in percentage points: `crit` is the chance an attack
// lands a critical hit, `critDmg` how much extra damage one deals (30 = a
// third again). Every creature is currently on the same 4 / 30, and the
// uniformity is deliberate -- a flat pair is worth the same +1.2% expected
// damage (4% x 30%) to every creature AND to every enemy, so the stats exist
// and can be built on without shifting any matchup off the time-to-kill bands
// the statlines are tuned to. Making crit a lever that separates creatures is
// a balance pass of its own -- vary these numbers then, not by accident now.
// Type bosses carry the same pair, in data/bosses.js.

import { TYPE_ORDER } from "./types.js";
import { DUNGEON_BOSSES } from "./bosses.js";

export const CREATURES=[
  {id:"emberpup",name:"Emberpup",emoji:"🐶",type:"Fire",rarity:"common",description:"A scrappy fire pup that chases its own tail, sometimes igniting it.",
   stats:{hp:43,atk:37,def:25,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Hellfang",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and briefly inflict Root"]},
     special:{name:"Dread Howl",charge:14,upgrades:["24 dmg","29 dmg","34 dmg","40 dmg","40 dmg. Inflicts Fear"]},
     unique:{name:"Cinder Scent",upgrades:["This creature has +20% Attack when attacking an enemy affected by a Fire Hazard","This creature has +30% Attack when attacking an enemy affected by a Fire Hazard","This creature has +40% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack and +3 Range when attacking an enemy affected by a Fire Hazard"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"emberhound"},
  {id:"emberhound",name:"Emberhound",emoji:"🔥",type:"Fire",rarity:"common",description:"Emberpup fully grown. Mane is permanently on fire. Still chases its tail.",
   stats:{hp:72,atk:62,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Hellfang",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and briefly inflict Root"]},
     special:{name:"Dread Howl",charge:14,upgrades:["24 dmg","29 dmg","34 dmg","40 dmg","40 dmg. Inflicts Fear"]},
     unique:{name:"Cinder Scent",upgrades:["This creature has +20% Attack when attacking an enemy affected by a Fire Hazard","This creature has +30% Attack when attacking an enemy affected by a Fire Hazard","This creature has +40% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack and +3 Range when attacking an enemy affected by a Fire Hazard"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberpup",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"infernoking"},
  {id:"venomcoil",name:"Venomcoil",emoji:"🐍",type:"Nature",rarity:"common",description:"A hatchling anaconda barely longer than a bootlace, already beading venom along every scale. It practices constricting on a rolled-up sock.",
   stats:{hp:49,atk:40,def:27,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"mirewreathe"},
  {id:"mirewreathe",name:"Mirewreathe",emoji:"🐍",type:"Nature",rarity:"common",description:"Long enough now to loop something twice and mean it. The swamp it lives in has been quietly relabelled on local maps.",
   stats:{hp:76,atk:63,def:43,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"venomcoil",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"toxiconda"},
  {id:"pebbit",name:"Pebbit",emoji:"🐸",type:"Earth",rarity:"common",description:"A round little rock frog with a pebble-smooth hide. Surprisingly difficult to step on.",
   stats:{hp:63,atk:31,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"bouldroad"},
  {id:"bouldroad",name:"Bouldroad",emoji:"🐸",type:"Earth",rarity:"common",description:"Pebbit grown into a stout toad that hauls a boulder on its back. It refuses to explain why.",
   stats:{hp:112,atk:56,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"pebbit",shardsToAscend:10,ascensionsToEvolve:30,evolutionId:"granitoad"},
  {id:"cirruskit",name:"Cirruskit",emoji:"🐈",type:"Wind",rarity:"common",description:"A leopard cub spun from high, thin cloud. It is ninety percent vapour and one hundred percent certain it is stalking something.",
   stats:{hp:38,atk:30,def:22,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"cumulynx"},
  {id:"cumulynx",name:"Cumulynx",emoji:"🐆",type:"Wind",rarity:"common",description:"Its coat has thickened into proper cumulus. It naps on updrafts and leaves fog behind wherever it lands.",
   stats:{hp:63,atk:54,def:38,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"cirruskit",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"nimbupard"},
  // Fire line 1 extensions
  {id:"infernoking",name:"Infernoking",emoji:"🦁",type:"Fire",rarity:"common",description:"A blazing lion whose roar sets the sky ablaze. Even its shadow burns.",
   stats:{hp:97,atk:84,def:61,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Hellfang",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and briefly inflict Root"]},
     special:{name:"Dread Howl",charge:14,upgrades:["24 dmg","29 dmg","34 dmg","40 dmg","40 dmg. Inflicts Fear"]},
     unique:{name:"Cinder Scent",upgrades:["This creature has +20% Attack when attacking an enemy affected by a Fire Hazard","This creature has +30% Attack when attacking an enemy affected by a Fire Hazard","This creature has +40% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack and +3 Range when attacking an enemy affected by a Fire Hazard"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberhound",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"ashmonarch"},
  {id:"ashmonarch",name:"Ashmonarch",emoji:"👑",type:"Fire",rarity:"common",description:"The apex of the Emberpup line. Its crown of ash is said to contain the last embers of a dying star.",
   stats:{hp:128,atk:112,def:83,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Hellfang",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and briefly inflict Root"]},
     special:{name:"Dread Howl",charge:14,upgrades:["24 dmg","29 dmg","34 dmg","40 dmg","40 dmg. Inflicts Fear"]},
     unique:{name:"Cinder Scent",upgrades:["This creature has +20% Attack when attacking an enemy affected by a Fire Hazard","This creature has +30% Attack when attacking an enemy affected by a Fire Hazard","This creature has +40% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack when attacking an enemy affected by a Fire Hazard","This creature has +50% Attack and +3 Range when attacking an enemy affected by a Fire Hazard"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"infernoking",shardsToAscend:18,ascensionsToEvolve:null},

  // Nature line 1 extensions
  {id:"toxiconda",name:"Toxiconda",emoji:"🐍",type:"Nature",rarity:"common",description:"Fully grown, permanently damp, and venomous end to end. Whatever it has wrapped stopped arguing some time ago.",
   stats:{hp:103,atk:88,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"mirewreathe",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"gaiaconda"},
  {id:"gaiaconda",name:"Gaiaconda",emoji:"🐍",type:"Nature",rarity:"common",description:"A river with scales. Its coils have their own weather, and everything caught inside them is having a worse day than the forecast suggested.",
   stats:{hp:130,atk:114,def:86,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"toxiconda",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 1 extensions
  {id:"granitoad",name:"Granitoad",emoji:"🗿",type:"Earth",rarity:"common",description:"A granite-plated toad stacked with boulders. Its croak registers on seismographs two towns over.",
   stats:{hp:158,atk:78,def:115,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"bouldroad",shardsToAscend:14,ascensionsToEvolve:45,evolutionId:"toadalith"},
  {id:"toadalith",name:"Toadalith",emoji:"🏔️",type:"Earth",rarity:"common",description:"A toad the size of a hill beneath a peak of stacked boulders. Maps list it as terrain; it prefers 'ambush.'",
   stats:{hp:209,atk:103,def:153,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"granitoad",shardsToAscend:18,ascensionsToEvolve:null},
  // Wind line 1 extensions
  {id:"nimbupard",name:"Nimbupard",emoji:"🐅",type:"Wind",rarity:"common",description:"The cloud has darkened. Weather stations log its naps as 'localized drizzle' and have stopped asking questions.",
   stats:{hp:89,atk:77,def:55,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"cumulynx",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"stormpelt"},
  {id:"stormpelt",name:"Stormpelt",emoji:"🦁",type:"Wind",rarity:"common",description:"The apex of wind, wearing a thunderhead as a pelt. Entire storm systems orbit it like satellites.",
   stats:{hp:116,atk:99,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"nimbupard",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 1
  // Water line 1 -- axolotls: Common, 4 stages, one kit shared verbatim. A
  // ranged Support whose whole output is one shaped ability.
  //
  // The animal is doing work here: an axolotl regrows what it loses, which is
  // why the healing half needs no explaining, and it never leaves its larval
  // form, which is why the line gets bigger without ever becoming something
  // else.
  //
  // Swell is a 1x3 wave that travels 3 tiles forward from the caster: it damages
  // enemies and heals allies standing in its path, the same cast doing both.
  // Its printed numbers sit BELOW an average common healer's on purpose --
  // Undertow is what brings them up to par, so the two must be read together.
  //
  // Undertow is why the wave has to resolve ROW BY ROW, outward from the caster,
  // rather than as one instantaneous cell set the way Line and Fork do: the
  // order rows are touched in changes the result. Accumulate the falloff as the
  // wave advances and apply each row's effects before stepping to the next one.
  //
  // The falloff is 30 PERCENTAGE POINTS off the bonus per occupied row, not 30%
  // of the output, and it applies from the FIRST occupied row -- so the printed
  // bonus is never delivered in full, and a wave that passes through enough
  // creatures inverts into a penalty. At the first upgrade (+50% / +60%) a third
  // occupied row leaves -40% damage and -30% healing.
  //
  // There is deliberately NO floor constant: the wave is 3 tiles deep, so it can
  // spend at most 90 points, and the worst case it can actually reach is x0.60
  // damage and x0.70 healing. A floor that never fires is only a claim the code
  // does not keep. Deepen the wave or raise the falloff and that stops holding.
  {id:"gillet",name:"Gillet",emoji:"🦎",type:"Water",rarity:"common",description:"A hand-sized axolotl wearing three pink fronds where a sensible animal keeps its gills. It has already healed from several things nobody saw happen.",
   stats:{hp:46,atk:30,def:29,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Frostbite"]},
     special:{name:"Swell",charge:16,upgrades:["Heal 20 HP; 14 dmg","Heal 24 HP; 17 dmg","Heal 28 HP; 20 dmg","Heal 33 HP; 24 dmg","Heal 33 HP; 24 dmg"]},
     unique:{name:"Undertow",upgrades:["This creature's Special ability deals an additional 50% damage and heals an additional 60% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 60% damage and heals an additional 70% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 70% damage and heals an additional 80% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 80% damage and heals an additional 90% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 90% damage and heals an additional 100% Health. Each row of enemies or allies hit reduces both bonuses by 30%"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"gillow"},
  {id:"gillow",name:"Gillow",emoji:"🦎",type:"Water",rarity:"common",description:"The fronds have filled out and now trail behind it like a wake. It regrows whatever it loses and seems mildly puzzled that anyone finds this impressive.",
   stats:{hp:75,atk:48,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Frostbite"]},
     special:{name:"Swell",charge:16,upgrades:["Heal 20 HP; 14 dmg","Heal 24 HP; 17 dmg","Heal 28 HP; 20 dmg","Heal 33 HP; 24 dmg","Heal 33 HP; 24 dmg"]},
     unique:{name:"Undertow",upgrades:["This creature's Special ability deals an additional 50% damage and heals an additional 60% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 60% damage and heals an additional 70% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 70% damage and heals an additional 80% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 80% damage and heals an additional 90% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 90% damage and heals an additional 100% Health. Each row of enemies or allies hit reduces both bonuses by 30%"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"gillet",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"plumewake"},
  {id:"plumewake",name:"Plumewake",emoji:"🦎",type:"Water",rarity:"common",description:"Big enough now that the water moves when it does. It pushes a slow swell ahead of itself, and everything on the near side of that swell comes out of it better than it went in.",
   stats:{hp:107,atk:69,def:66,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Frostbite"]},
     special:{name:"Swell",charge:16,upgrades:["Heal 20 HP; 14 dmg","Heal 24 HP; 17 dmg","Heal 28 HP; 20 dmg","Heal 33 HP; 24 dmg","Heal 33 HP; 24 dmg"]},
     unique:{name:"Undertow",upgrades:["This creature's Special ability deals an additional 50% damage and heals an additional 60% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 60% damage and heals an additional 70% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 70% damage and heals an additional 80% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 80% damage and heals an additional 90% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 90% damage and heals an additional 100% Health. Each row of enemies or allies hit reduces both bonuses by 30%"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"gillow",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"xolotide"},
  {id:"xolotide",name:"Xolotide",emoji:"🦎",type:"Water",rarity:"common",description:"The old lake's last and largest. It never once finished growing up, and the water it sends out arrives somewhere between a current and a blessing.",
   stats:{hp:141,atk:92,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Frostbite"]},
     special:{name:"Swell",charge:16,upgrades:["Heal 20 HP; 14 dmg","Heal 24 HP; 17 dmg","Heal 28 HP; 20 dmg","Heal 33 HP; 24 dmg","Heal 33 HP; 24 dmg"]},
     unique:{name:"Undertow",upgrades:["This creature's Special ability deals an additional 50% damage and heals an additional 60% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 60% damage and heals an additional 70% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 70% damage and heals an additional 80% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 80% damage and heals an additional 90% Health. Each row of enemies or allies hit reduces both bonuses by 30%","This creature's Special ability deals an additional 90% damage and heals an additional 100% Health. Each row of enemies or allies hit reduces both bonuses by 30%"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"plumewake",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 2
  {id:"iglet",name:"Iglet",emoji:"🐢",type:"Water",rarity:"common",description:"A turtle hatchling that packed its own shell out of snow. It is enormously proud of this and will not be told it is doing turtling wrong.",
   stats:{hp:59,atk:29,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"shellter"},
  {id:"shellter",name:"Shellter",emoji:"🧊",type:"Water",rarity:"common",description:"The snow dome has become a proper igloo, doorway and all. It does not let anyone else use the doorway.",
   stats:{hp:95,atk:48,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"iglet",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"frostkeep"},
  {id:"frostkeep",name:"Frostkeep",emoji:"🏔️",type:"Water",rarity:"common",description:"The igloo is load-bearing ice now. A survey team once mistook it for a research station and knocked politely.",
   stats:{hp:135,atk:67,def:101,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"shellter",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"hibernarch"},
  {id:"hibernarch",name:"Hibernarch",emoji:"🗻",type:"Water",rarity:"common",description:"A turtle carrying a fortress of ancient ice. It has been asleep inside for most of recorded history and has no plans to stop.",
   stats:{hp:177,atk:88,def:133,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"frostkeep",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line -- Puddlet (heron) line. Spear Flurry's card number is the TOTAL
  // of its 3 hits, the rule every multi-hit follows. Battle module:
  // battle/playerAbilities/puddletLine.js.
  //   - Skewer: the Pierced enemies are ONLY the ones behind the initial target
  //     (the 1 -- 2 at max -- that the attack passes through). The "% more damage"
  //     applies to those enemies alone; the initial target takes the hit as
  //     normal.
  {id:"puddlet",name:"Puddlet",emoji:"🐣",type:"Water",rarity:"epic",description:"A fluffy heron hatchling with more legs than balance. It practices spear-fishing in puddles and mostly stabs its own reflection.",
   stats:{hp:53,atk:57,def:34,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["14 dmg","18 dmg","23 dmg","29 dmg","29 dmg and inflict Defense Down"]},
     special:{name:"Spear Flurry",charge:12,upgrades:["36 dmg","45 dmg","57 dmg","69 dmg","69 dmg. For each enemy hit, temporarily gain 1% Speed"]},
     unique:{name:"Skewer",upgrades:["All attacks Pierce 1 enemy. Pierced enemies receive 5% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 10% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 15% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 20% more damage","All attacks Pierce 2 enemies. Pierced enemies receive 20% more damage"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"wadewing"},
  {id:"wadewing",name:"Wadewing",emoji:"🐦",type:"Water",rarity:"epic",description:"Puddlet grown into its stilts. It stands motionless in the shallows until something forgets it's there.",
   stats:{hp:85,atk:91,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["14 dmg","18 dmg","23 dmg","29 dmg","29 dmg and inflict Defense Down"]},
     special:{name:"Spear Flurry",charge:12,upgrades:["36 dmg","45 dmg","57 dmg","69 dmg","69 dmg. For each enemy hit, temporarily gain 1% Speed"]},
     unique:{name:"Skewer",upgrades:["All attacks Pierce 1 enemy. Pierced enemies receive 5% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 10% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 15% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 20% more damage","All attacks Pierce 2 enemies. Pierced enemies receive 20% more damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"puddlet",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"heronarch"},
  {id:"heronarch",name:"Heronarch",emoji:"🦢",type:"Water",rarity:"epic",description:"The river's crowned sentinel. Every strike is a single perfect line. Fish reportedly organize petitions about it.",
   stats:{hp:132,atk:140,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["14 dmg","18 dmg","23 dmg","29 dmg","29 dmg and inflict Defense Down"]},
     special:{name:"Spear Flurry",charge:12,upgrades:["36 dmg","45 dmg","57 dmg","69 dmg","69 dmg. For each enemy hit, temporarily gain 1% Speed"]},
     unique:{name:"Skewer",upgrades:["All attacks Pierce 1 enemy. Pierced enemies receive 5% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 10% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 15% more damage","All attacks Pierce 1 enemy. Pierced enemies receive 20% more damage","All attacks Pierce 2 enemies. Pierced enemies receive 20% more damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"wadewing",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 1
  {id:"jadebun",name:"Jadebun",emoji:"🐰",type:"Light",rarity:"common",description:"A rabbit whose fur carries the cool green sheen of polished jade. It gathers moonlit herbs in its cheeks and refuses to explain why.",
   stats:{hp:43,atk:28,def:26,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"pestlehare"},
  {id:"pestlehare",name:"Pestlehare",emoji:"🐇",type:"Light",rarity:"common",description:"Jadebun has taken up a mortar and pestle twice its own height. Neighbors report that the pounding begins promptly at moonrise and does not stop.",
   stats:{hp:70,atk:46,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"jadebun",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"elixhare"},
  {id:"elixhare",name:"Elixhare",emoji:"🌙",type:"Light",rarity:"common",description:"Its mortar now yields a silver draught that knits wounds closed in seconds. Three separate alchemists' guilds have offered to buy the recipe. It has declined all three.",
   stats:{hp:100,atk:65,def:62,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"pestlehare",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"lunarch"},
  {id:"lunarch",name:"Lunarch",emoji:"🌕",type:"Light",rarity:"common",description:"The Jade Rabbit of legend, ascended to the moon to pound the elixir of immortality at Chang'e's side. It still comes back down for a gentle nuzzle.",
   stats:{hp:133,atk:87,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"elixhare",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 1 -- vampire bats: Common, 4 stages, one kit shared verbatim. A
  // ranged Attacker that drinks its way through a fight.
  //
  // Insatiable scales LIFESTEAL ITSELF rather than the Special, so it multiplies
  // every source at once -- Bloodletting's 30% drain and any lifesteal gear the
  // bat is wearing (Bloodthirster's 20%, Vampiric Band's Overheal share). That
  // is deliberate: the passive is the reason to build lifesteal onto this line
  // rather than a flat number bolted to one ability. Route it through
  // healUnit's `lifesteal` flag (battle/hp.js), so gear and ability drain both
  // pick it up from one place. Battle module: battle/playerAbilities/dusklingLine.js.
  {id:"duskling",name:"Duskling",emoji:"🦇",type:"Dark",rarity:"common",description:"A palm-sized bat pup that roosts upside down in places nobody agreed to. It flickers in and out of shadow, mostly by accident.",
   stats:{hp:45,atk:45,def:22,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sonic Screech",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Bloodletting",charge:14,upgrades:["30 dmg","38 dmg","47 dmg","58 dmg","58 dmg"]},
     unique:{name:"Insatiable",upgrades:["Lifesteal on this creature is 20% more effective","Lifesteal on this creature is 30% more effective","Lifesteal on this creature is 40% more effective","Lifesteal on this creature is 50% more effective","Lifesteal on this creature is 50% more effective. This creature gains 20% Haste when targeting enemies below 30% Health"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"nightbat"},
  {id:"nightbat",name:"Nightbat",emoji:"🦇",type:"Dark",rarity:"common",description:"Duskling with its wingspan filled in. It hunts by sound, strikes from the dark, and is gone before the echo gets back.",
   stats:{hp:71,atk:72,def:37,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sonic Screech",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Bloodletting",charge:14,upgrades:["30 dmg","38 dmg","47 dmg","58 dmg","58 dmg"]},
     unique:{name:"Insatiable",upgrades:["Lifesteal on this creature is 20% more effective","Lifesteal on this creature is 30% more effective","Lifesteal on this creature is 40% more effective","Lifesteal on this creature is 50% more effective","Lifesteal on this creature is 50% more effective. This creature gains 20% Haste when targeting enemies below 30% Health"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"duskling",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"nightstalker"},
  {id:"nightstalker",name:"Nightstalker",emoji:"🦇",type:"Dark",rarity:"common",description:"A bat that no longer needs the dark to hide in. It reads a whole room off its echoes and has never once been surprised.",
   stats:{hp:99,atk:102,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sonic Screech",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Bloodletting",charge:14,upgrades:["30 dmg","38 dmg","47 dmg","58 dmg","58 dmg"]},
     unique:{name:"Insatiable",upgrades:["Lifesteal on this creature is 20% more effective","Lifesteal on this creature is 30% more effective","Lifesteal on this creature is 40% more effective","Lifesteal on this creature is 50% more effective","Lifesteal on this creature is 50% more effective. This creature gains 20% Haste when targeting enemies below 30% Health"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"nightbat",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"voidfang"},
  {id:"voidfang",name:"Voidfang",emoji:"🦇",type:"Dark",rarity:"common",description:"The line's last form: a bat whose wings open onto somewhere else. It does not cross a room so much as stop being on one side of it.",
   stats:{hp:133,atk:135,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sonic Screech",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Bloodletting",charge:14,upgrades:["30 dmg","38 dmg","47 dmg","58 dmg","58 dmg"]},
     unique:{name:"Insatiable",upgrades:["Lifesteal on this creature is 20% more effective","Lifesteal on this creature is 30% more effective","Lifesteal on this creature is 40% more effective","Lifesteal on this creature is 50% more effective","Lifesteal on this creature is 50% more effective. This creature gains 20% Haste when targeting enemies below 30% Health"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"nightstalker",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 4: vultures that feed on the battlefield -- the kit below is
  // placeholder text pending its real LOC; Death Feast is the identity.
  {id:"bonebeak",name:"Bonebeak",emoji:"🦤",type:"Dark",rarity:"epic",description:"A fledgling vulture with no hunting instinct whatsoever and impeccable timing. It is always already there when something stops moving.",
   stats:{hp:84,atk:46,def:90,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Carrion Rip",upgrades:["14 dmg and inflict Damage Over Time","18 dmg and inflict Damage Over Time","23 dmg and inflict Damage Over Time","29 dmg and inflict Damage Over Time","29 dmg and inflict 2 stacks of Damage Over Time"]},
     special:{name:"Gorge",charge:14,upgrades:["36 dmg","45 dmg","56 dmg","70 dmg","70 dmg. If this attack defeats an enemy, a random enemy gains 2 stacks of Damage Over Time"]},
     unique:{name:"Death Feast",upgrades:["This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 10% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 15% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 10% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 10% Attack and 10% Defense."]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"gravewing"},
  {id:"gravewing",name:"Gravewing",emoji:"🦃",type:"Dark",rarity:"epic",description:"It has learned that patience is a hunting strategy. It circles battlefields on principle now, several hours before anything has gone wrong.",
   stats:{hp:120,atk:66,def:128,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Carrion Rip",upgrades:["14 dmg and inflict Damage Over Time","18 dmg and inflict Damage Over Time","23 dmg and inflict Damage Over Time","29 dmg and inflict Damage Over Time","29 dmg and inflict 2 stacks of Damage Over Time"]},
     special:{name:"Gorge",charge:14,upgrades:["36 dmg","45 dmg","56 dmg","70 dmg","70 dmg. If this attack defeats an enemy, a random enemy gains 2 stacks of Damage Over Time"]},
     unique:{name:"Death Feast",upgrades:["This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 10% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 15% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 10% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 10% Attack and 10% Defense."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"bonebeak",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"charnelord"},
  {id:"charnelord",name:"Charnelord",emoji:"🦅",type:"Dark",rarity:"epic",description:"Every fight it has ever attended has ended, and it has outlived all of them. It does not win battles so much as wait for them to finish.",
   stats:{hp:158,atk:88,def:168,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Carrion Rip",upgrades:["14 dmg and inflict Damage Over Time","18 dmg and inflict Damage Over Time","23 dmg and inflict Damage Over Time","29 dmg and inflict Damage Over Time","29 dmg and inflict 2 stacks of Damage Over Time"]},
     special:{name:"Gorge",charge:14,upgrades:["36 dmg","45 dmg","56 dmg","70 dmg","70 dmg. If this attack defeats an enemy, a random enemy gains 2 stacks of Damage Over Time"]},
     unique:{name:"Death Feast",upgrades:["This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 10% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 15% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 5% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 5% Attack and 10% Defense.","This creature prioritizes enemies inflicted with Damage Over Time. Whenever an ally or enemy is defeated, recover 20% Health and gain 10% Attack and 10% Defense."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"gravewing",shardsToAscend:20,ascensionsToEvolve:null},
  {id:"sparkshell",name:"Sparkshell",emoji:"🐢",type:"Electric",rarity:"common",description:"A tortoise hatchling whose shell holds a static charge it did not ask for. Anything that pokes it gets a small, indignant shock and learns nothing.",
   stats:{hp:70,atk:34,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"capacitort"},
  {id:"capacitort",name:"Capacitort",emoji:"🐢",type:"Electric",rarity:"common",description:"The shell has organised itself into proper cells. It has worked out that being hit is a way of eating, and now stands in front of things on purpose.",
   stats:{hp:111,atk:54,def:93,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"sparkshell",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"dynashell"},

  // Nature line 2
  {id:"frillet",name:"Frillet",emoji:"🦕",type:"Nature",rarity:"common",description:"A triceratops hatchling whose frill is already wider than the rest of it. It has appointed itself the personal bodyguard of everyone it has ever met.",
   stats:{hp:58,atk:28,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"bulwarden"},
  {id:"bulwarden",name:"Bulwarden",emoji:"🦏",type:"Nature",rarity:"common",description:"The frill has thickened into proper plate. It stands in front of things now, professionally, and takes the question of who asked it to very personally.",
   stats:{hp:94,atk:46,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"frillet",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"aegiceras"},
  {id:"aegiceras",name:"Aegiceras",emoji:"🦏",type:"Nature",rarity:"common",description:"Its frill is a tower shield with a heartbeat. Allies have learned to simply stand behind it and wait for the noise to stop.",
   stats:{hp:133,atk:65,def:109,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"bulwarden",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"rampartops"},
  {id:"rampartops",name:"Rampartops",emoji:"🏔️",type:"Nature",rarity:"common",description:"A fortress that grazes. It has been the deciding factor in two sieges, neither of which it noticed.",
   stats:{hp:175,atk:85,def:143,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"aegiceras",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 1
  {id:"cragling",name:"Cragling",emoji:"🐵",type:"Earth",rarity:"common",description:"Hatched from a rock on a mountaintop, fully formed and immediately in trouble. It has already been asked to leave three temples.",
   stats:{hp:46,atk:48,def:26,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"cragfist"},
  {id:"cragfist",name:"Cragfist",emoji:"🐒",type:"Earth",rarity:"common",description:"It has taken up an iron staff twice its size and refuses to be told this is impractical. So far it has been right.",
   stats:{hp:72,atk:76,def:41,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cragling",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"cloudvault"},
  {id:"cloudvault",name:"Cloudvault",emoji:"🦧",type:"Earth",rarity:"common",description:"Learned to somersault across an entire province in a single bound. Mostly uses this to outrun consequences.",
   stats:{hp:100,atk:105,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cragfist",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"skysage"},
  {id:"skysage",name:"Skysage",emoji:"🦍",type:"Earth",rarity:"common",description:"It has awarded itself a title, a throne, and a rank equal to heaven. Nobody has yet found a convincing way to take any of them back.",
   stats:{hp:128,atk:134,def:76,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cloudvault",shardsToAscend:18,ascensionsToEvolve:null},
  // Electric stage 3
  {id:"dynashell",name:"Dynashell",emoji:"🔋",type:"Electric",rarity:"common",description:"Its shell reads as industrial equipment on every instrument pointed at it. Two survey teams have tried to file it as infrastructure.",
   stats:{hp:143,atk:70,def:119,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"capacitort",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"accumulith"},
  {id:"accumulith",name:"Accumulith",emoji:"⚡",type:"Electric",rarity:"common",description:"A tortoise carrying a power station. It discharges once, politely, and the field is quiet afterwards.",
   stats:{hp:186,atk:91,def:156,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (stacking, max 50) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"dynashell",shardsToAscend:18,ascensionsToEvolve:null},
  // Light line 1 -- holy lions. Melee Attackers: they close the distance and
  // smite. The ids stay bird-named (aurorion/lumileo/celestleo/
  // empyreon) on purpose: they are save keys, referenced by owned records and
  // by the three skin sets in data/skins.js, so renaming them would orphan
  // every player's copy. Only the display names changed.
  //
  // Ability names are shared across all four stages, per the roster convention
  // -- only the numbers and the final upgrade grow. (The old bird kit broke
  // that, naming each stage's basic differently.)
  {id:"aurorion",name:"Aurorion",emoji:"🦁",type:"Light",rarity:"common",description:"A lion cub with a mane of dawn-coloured light. It practises its roar at sunrise and smites whatever is standing nearest.",
   stats:{hp:51,atk:53,def:31,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"lumileo"},
  {id:"lumileo",name:"Lumileo",emoji:"🦁",type:"Light",rarity:"common",description:"Its mane has hardened into blades of solid daylight. Shadows step aside where it walks, whether or not they are asked to.",
   stats:{hp:78,atk:80,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"aurorion",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"celestleo"},
  {id:"celestleo",name:"Celestleo",emoji:"🦁",type:"Light",rarity:"common",description:"A lion of the high air, crowned in light. Its claws leave burns that go on glowing for days after the fight.",
   stats:{hp:105,atk:108,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"lumileo",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"empyreon"},
  {id:"empyreon",name:"Empyreon",emoji:"☀️",type:"Light",rarity:"common",description:"Less a lion now than a sunrise that decided to hunt. Its judgement tends to land a moment before its paws do.",
   stats:{hp:137,atk:140,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"celestleo",shardsToAscend:28,ascensionsToEvolve:null},
  // Light line 2
  {id:"oathcub",name:"Oathcub",emoji:"🐻",type:"Light",rarity:"common",description:"A bear cub that swore an oath nobody administered, to a cause nobody named. It has been unshakeable about it for four months.",
   stats:{hp:69,atk:35,def:56,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"vowbruin"},
  {id:"vowbruin",name:"Vowbruin",emoji:"🐻",type:"Light",rarity:"common",description:"Grown into its armour, most of which it found. It stands in doorways on purpose now and asks people to state their business.",
   stats:{hp:103,atk:53,def:84,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"oathcub",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"sanctursa"},
  {id:"sanctursa",name:"Sanctursa",emoji:"🐻",type:"Light",rarity:"common",description:"Its plate has been blessed so many times the metal has started to hum. Wounded soldiers shelter behind it without asking, which it permits.",
   stats:{hp:140,atk:72,def:114,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"vowbruin",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"oathmaul"},
  {id:"oathmaul",name:"Oathmaul",emoji:"🐻",type:"Light",rarity:"common",description:"A bear that took a holy oath it was not offered and has kept it, immaculately, ever since. Its armour was made by three separate smiths, each of whom assumed someone else had been asked.",
   stats:{hp:182,atk:93,def:149,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"sanctursa",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 3: moths whose wing-dust mends whatever it settles on -- the
  // kit below is placeholder text pending its real LOC.
  {id:"dustling",name:"Dustling",emoji:"🐛",type:"Dark",rarity:"common",description:"A grub that already sheds more dust than it weighs. Anything it crawls across ends the day healthier and covered in glitter.",
   stats:{hp:44,atk:26,def:24,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Dust Flick",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Attack Down"]},
     special:{name:"Pollen Veil",charge:12,upgrades:["Heal 24 HP","Heal 30 HP","Heal 38 HP","Heal 48 HP","Heal 48 HP and Blind"]},
     unique:{name:"Moonlit Scales",upgrades:["Heal 6 HP","Heal 8 HP","Heal 11 HP","Heal 14 HP","Heal 14 HP and they gain Speed Up"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"silkhusk"},
  {id:"silkhusk",name:"Silkhusk",emoji:"🌰",type:"Dark",rarity:"common",description:"It stopped moving three weeks ago and has been quietly rebuilding itself since. The dust still drifts out through the silk, and still works.",
   stats:{hp:71,atk:43,def:41,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Dust Flick",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Attack Down"]},
     special:{name:"Pollen Veil",charge:12,upgrades:["Heal 24 HP","Heal 30 HP","Heal 38 HP","Heal 48 HP","Heal 48 HP and Blind"]},
     unique:{name:"Moonlit Scales",upgrades:["Heal 6 HP","Heal 8 HP","Heal 11 HP","Heal 14 HP","Heal 14 HP and they gain Speed Up"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"dustling",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"gloamwing"},
  {id:"gloamwing",name:"Gloamwing",emoji:"🦋",type:"Dark",rarity:"common",description:"Newly out of the husk, and only willing to fly between dusk and true dark. Field medics have learned to work in that window and ask no questions.",
   stats:{hp:101,atk:61,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Dust Flick",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Attack Down"]},
     special:{name:"Pollen Veil",charge:12,upgrades:["Heal 24 HP","Heal 30 HP","Heal 38 HP","Heal 48 HP","Heal 48 HP and Blind"]},
     unique:{name:"Moonlit Scales",upgrades:["Heal 6 HP","Heal 8 HP","Heal 11 HP","Heal 14 HP","Heal 14 HP and they gain Speed Up"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"silkhusk",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"lunashroud"},
  {id:"lunashroud",name:"Lunashroud",emoji:"🌙",type:"Dark",rarity:"common",description:"A moth the size of a banner, trailing dust that closes wounds it never made. It has been mistaken for the moon by two separate expeditions.",
   stats:{hp:134,atk:82,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Dust Flick",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Attack Down"]},
     special:{name:"Pollen Veil",charge:12,upgrades:["Heal 24 HP","Heal 30 HP","Heal 38 HP","Heal 48 HP","Heal 48 HP and Blind"]},
     unique:{name:"Moonlit Scales",upgrades:["Heal 6 HP","Heal 8 HP","Heal 11 HP","Heal 14 HP","Heal 14 HP and they gain Speed Up"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"gloamwing",shardsToAscend:18,ascensionsToEvolve:null},
  // Pelican line: Common, 4 stages, one kit shared verbatim across every
  // stage. A fire pelican that mantles its allies -- the "pelican in her
  // piety" of the old emblem.
  {id:"cinderbill",name:"Cinderbill",emoji:"🐣",type:"Fire",rarity:"common",description:"A pelican chick whose bill is already too big for it and already too warm to hold. It practises scooping on puddles, which steam.",
   stats:{hp:58,atk:28,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"emberpouch"},
  {id:"emberpouch",name:"Emberpouch",emoji:"🐦",type:"Fire",rarity:"common",description:"The pouch has learned to hold lava without complaint. It has not yet learned to hold anything else, which has made fishing complicated.",
   stats:{hp:94,atk:46,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"cinderbill",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"kilnwing"},
  {id:"kilnwing",name:"Kilnwing",emoji:"🦢",type:"Fire",rarity:"common",description:"Its wings run kiln-hot along the leading edge. Anything it settles over comes out the far side warm, rested, and faintly glazed.",
   stats:{hp:133,atk:65,def:109,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"emberpouch",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"pyrelican"},
  {id:"pyrelican",name:"Pyrelican",emoji:"🔥",type:"Fire",rarity:"common",description:"The pelican of the old emblem, feeding its brood from its own heart and finding this a reasonable arrangement. Nothing under its wing has ever been left cold.",
   stats:{hp:175,atk:85,def:143,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"kilnwing",shardsToAscend:18,ascensionsToEvolve:null},
  // Fire line 3
  {id:"emberstar",name:"Emberstar",emoji:"⭐",type:"Fire",rarity:"epic",description:"A starfish that washed onto a lava flow and simply kept walking. Its five arms glow like heating elements.",
   stats:{hp:77,atk:79,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +10% DEF","+20% DEF","+30% DEF","+40% DEF","+40% DEF; deals additional damage for every 5 Burn stacks on the target"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"magmastar"},
  {id:"magmastar",name:"Magmastar",emoji:"🌟",type:"Fire",rarity:"epic",description:"Emberstar's arms have hardened into vents of molten rock. Wherever it rests, the seafloor starts smoking.",
   stats:{hp:107,atk:108,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +15% DEF","+25% DEF","+35% DEF","+45% DEF","+45% DEF; deals additional damage for every 5 Burn stacks on the target; burn deals 15% more damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberstar",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"blastar"},  {id:"blastar",name:"Blastar",emoji:"☄️",type:"Fire",rarity:"epic",description:"Emberstar grown into a burning star of the deep. Every arm ends in a plasma spine, and it regrows them faster than anything can tear them off.",
   stats:{hp:125,atk:128,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +20% DEF","+30% DEF","+40% DEF","+50% DEF","+50% DEF; deals additional damage for every 5 Burn stacks on the target; burn deals 25% more damage; Blastar is immune to fire and Burn"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"magmastar",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 1
  {id:"nessling",name:"Nessling",emoji:"🦕",type:"Water",rarity:"epic",description:"A long-necked lake serpent barely the size of a rowboat. Already extremely difficult to photograph.",
   stats:{hp:122,atk:62,def:97,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"lochcoil"},
  {id:"lochcoil",name:"Lochcoil",emoji:"🦕",type:"Water",rarity:"epic",description:"Nessling grown into a chain of humps that surface one at a time. Nine separate expeditions have logged it as a floating tree.",
   stats:{hp:167,atk:85,def:133,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"nessling",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"nessarch"},  {id:"nessarch",name:"Nessarch",emoji:"🐉",type:"Water",rarity:"epic",description:"The monster of the loch itself. A century of sonar sweeps, submarines, and expeditions has produced exactly one blurry photograph, which it posed for.",
   stats:{hp:197,atk:101,def:157,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"lochcoil",shardsToAscend:20,ascensionsToEvolve:null},
  // Nature line 2 -- Pricklet (poisonous crested porcupine) line. Ids keep the
  // old Sporolith line's sporolith/stonewarden/jadolith. Battle module:
  // battle/playerAbilities/prickletLine.js.
  //   - Bristle Up's retaliation is a Reflect-type effect (it carries the
  //     Reflect pill) but scales off this creature's Defense, not the damage
  //     taken. "Temporarily" reads as the standard duration (STATUS_TICKS).
  //   - Venom Barbs' Attack cut is a stat mod from this creature's Passive
  //     (its own stack source, per the per-ability stacking policy).
  {id:"sporolith",name:"Pricklet",emoji:"🦔",type:"Nature",rarity:"epic",description:"A crested porcupine kit whose quills are still soft enough to bend. The venom, unfortunately, came in right on schedule.",
   stats:{hp:129,atk:65,def:98,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Barbed Jab",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg and inflict Poison"]},
     special:{name:"Bristle Up",charge:10,upgrades:["Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 15% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 18% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 21% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense and inflict Poison on them"]},
     unique:{name:"Venom Barbs",upgrades:["Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 5% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 10% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 15% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack. Whenever this creature is attacked by an enemy with max stacks of Poison, it dispels all debuffs on itself"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"stonewarden"},
  {id:"stonewarden",name:"Bristlecrest",emoji:"🦔",type:"Nature",rarity:"epic",description:"Pricklet's crest has stiffened into a crown of barbed quills, every tip stained green. It raises them at anyone who stares too long.",
   stats:{hp:176,atk:89,def:134,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Barbed Jab",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg and inflict Poison"]},
     special:{name:"Bristle Up",charge:10,upgrades:["Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 15% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 18% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 21% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense and inflict Poison on them"]},
     unique:{name:"Venom Barbs",upgrades:["Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 5% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 10% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 15% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack. Whenever this creature is attacked by an enemy with max stacks of Poison, it dispels all debuffs on itself"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"sporolith",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"jadolith"},
  {id:"jadolith",name:"Toxicrest",emoji:"🦔",type:"Nature",rarity:"epic",description:"A porcupine that has made peace with being unhuggable. The quills it leaves in its attackers keep working long after it has waddled away.",
   stats:{hp:208,atk:104,def:158,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Barbed Jab",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg and inflict Poison"]},
     special:{name:"Bristle Up",charge:10,upgrades:["Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 15% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 18% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 21% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense","Gain Defense Up. Temporarily, when attacked, deal damage to the attacker equal to 25% of this creature's Defense and inflict Poison on them"]},
     unique:{name:"Venom Barbs",upgrades:["Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 5% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 10% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 15% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack","Whenever this creature inflicts Poison on an enemy, that enemy temporarily has 20% less Attack. Whenever this creature is attacked by an enemy with max stacks of Poison, it dispels all debuffs on itself"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonewarden",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 1
  {id:"crystalcrab",name:"Crystalcrab",emoji:"🦀",type:"Earth",rarity:"epic",description:"A crab whose shell has grown into perfect gemstone crystal. It is the only creature that is also a geological landmark.",
   stats:{hp:122,atk:62,def:94,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crystal Claw",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg"]},
     special:{name:"Taunting Snap",charge:10,upgrades:["26 dmg","29 dmg","33 dmg","38 dmg","38 dmg"]},
     unique:{name:"Prism Shell",upgrades:["Reflect 3% of the damage inflicted onto this creature","Reflect 6% of the damage inflicted onto this creature","Reflect 9% of the damage inflicted onto this creature","Reflect 12% of the damage inflicted onto this creature","Reflect 15% of the damage inflicted onto this creature"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"gemcrab"},
  {id:"gemcrab",name:"Gemcrab",emoji:"🦀",type:"Earth",rarity:"epic",description:"Crystalcrab's shell has grown into massive prismatic plates. Enemies go blind. Allies feel unreasonably safe.",
   stats:{hp:168,atk:84,def:128,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crystal Claw",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg"]},
     special:{name:"Taunting Snap",charge:10,upgrades:["26 dmg","29 dmg","33 dmg","38 dmg","38 dmg"]},
     unique:{name:"Prism Shell",upgrades:["Reflect 3% of the damage inflicted onto this creature","Reflect 6% of the damage inflicted onto this creature","Reflect 9% of the damage inflicted onto this creature","Reflect 12% of the damage inflicted onto this creature","Reflect 15% of the damage inflicted onto this creature"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"crystalcrab",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"gemtitan"},
  {id:"gemtitan",name:"Gemtitan",emoji:"🦀",type:"Earth",rarity:"epic",description:"Crystalcrab's titan form. It is now its own mountain range and is frankly unreasonable about taking damage.",
   stats:{hp:197,atk:100,def:152,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crystal Claw",upgrades:["14 dmg","15 dmg","17 dmg","20 dmg","20 dmg"]},
     special:{name:"Taunting Snap",charge:10,upgrades:["26 dmg","29 dmg","33 dmg","38 dmg","38 dmg"]},
     unique:{name:"Prism Shell",upgrades:["Reflect 3% of the damage inflicted onto this creature","Reflect 6% of the damage inflicted onto this creature","Reflect 9% of the damage inflicted onto this creature","Reflect 12% of the damage inflicted onto this creature","Reflect 15% of the damage inflicted onto this creature"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"gemcrab",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 1
  {id:"coatlet",name:"Coatlet",emoji:"🐍",type:"Wind",rarity:"epic",description:"A small serpent growing its first quetzal feathers. It practices flying by falling off progressively taller rocks.",
   stats:{hp:77,atk:78,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"plumecoatl"},
  {id:"plumecoatl",name:"Plumecoatl",emoji:"🪶",type:"Wind",rarity:"epic",description:"Half snake, half bird, entirely convinced it invented the wind. Its molted feathers are collected as currency in three villages.",
   stats:{hp:105,atk:108,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"coatlet",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"quetzalis"},
  {id:"quetzalis",name:"Quetzalis",emoji:"🐉",type:"Wind",rarity:"epic",description:"The feathered serpent of legend. It taught mortals astronomy, agriculture, and letters, then left before anyone could schedule a follow-up.",
   stats:{hp:124,atk:127,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"plumecoatl",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 1
  // Static-fleece sheep line: Epic, 3 stages, one kit shared verbatim. It
  // banks Charge by attacking and grounds the whole lot into the flock.
  //
  // Charge is granted PER ENEMY HIT, not per cast -- so Chain gear (Static
  // Pin and friends) multiplies the rate, and a chained swing banks one stack
  // per creature it reaches. That is what the 50 cap is sized for; the bare
  // ability hits one enemy and the card says 1, which is why the text names
  // no gear. It is granted from the on-hit hook (battle/playerAbilities/
  // frizzlambLine.js), so every chained hit counts itself.
  {id:"frizzlamb",name:"Frizzlamb",emoji:"🐑",type:"Electric",rarity:"epic",description:"A lamb whose fleece stands permanently on end. It has never been successfully petted, and the attempts have stopped.",
   stats:{hp:92,atk:60,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Prickle",upgrades:["12 dmg","13 dmg","14 dmg","15 dmg","16 dmg"]},
     special:{name:"Flock Surge",charge:30,upgrades:["Dispel all Charge on this creature. All nearby allies recover 0.5% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.6% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.7% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.8% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 1% of their Health for each Charge dispelled and gain Defense Up"]},
     unique:{name:"Skittish",upgrades:["This creature gains 2% Speed","This creature gains 4% Speed","This creature gains 6% Speed","This creature gains 8% Speed","This creature gains 10% Speed"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"staticoat"},
  {id:"staticoat",name:"Staticoat",emoji:"🐑",type:"Electric",rarity:"epic",description:"The fleece holds a working charge now. Shepherds ground themselves before counting it, which it chooses to take as a compliment.",
   stats:{hp:126,atk:82,def:86,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Prickle",upgrades:["12 dmg","13 dmg","14 dmg","15 dmg","16 dmg"]},
     special:{name:"Flock Surge",charge:30,upgrades:["Dispel all Charge on this creature. All nearby allies recover 0.5% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.6% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.7% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.8% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 1% of their Health for each Charge dispelled and gain Defense Up"]},
     unique:{name:"Skittish",upgrades:["This creature gains 2% Speed","This creature gains 4% Speed","This creature gains 6% Speed","This creature gains 8% Speed","This creature gains 10% Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"frizzlamb",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"thunderfleece"},
  {id:"thunderfleece",name:"Thunderfleece",emoji:"🐏",type:"Electric",rarity:"epic",description:"A ram carrying a season of stored weather in its coat. It walks into the middle of the flock, discharges, and everyone feels better about the afternoon.",
   stats:{hp:149,atk:97,def:101,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Prickle",upgrades:["12 dmg","13 dmg","14 dmg","15 dmg","16 dmg"]},
     special:{name:"Flock Surge",charge:30,upgrades:["Dispel all Charge on this creature. All nearby allies recover 0.5% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.6% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.7% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 0.8% of their Health for each Charge dispelled","Dispel all Charge on this creature. All nearby allies recover 1% of their Health for each Charge dispelled and gain Defense Up"]},
     unique:{name:"Skittish",upgrades:["This creature gains 2% Speed","This creature gains 4% Speed","This creature gains 6% Speed","This creature gains 8% Speed","This creature gains 10% Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"staticoat",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 3
  {id:"shockstinger",name:"Shockstinger",emoji:"🦂",type:"Electric",rarity:"epic",description:"A scorpion that stores charge in its tail like a living capacitor. Desert electricians keep their distance.",
   stats:{hp:118,atk:61,def:96,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"voltlasher"},
  {id:"voltlasher",name:"Voltlasher",emoji:"🦂",type:"Electric",rarity:"epic",description:"Shockstinger's charges have built to dangerous levels. Every segment of its tail is a live wire. The power company has sent a letter.",
   stats:{hp:162,atk:83,def:132,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"shockstinger",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"galvascorpion"},  {id:"galvascorpion",name:"Galvascorpion",emoji:"🦂",type:"Electric",rarity:"epic",description:"Shockstinger's final form. A superconducting armored scorpion that generates its own power grid. The power company has questions.",
   stats:{hp:191,atk:98,def:156,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"voltlasher",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 2
  {id:"starlit",name:"Starlit",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp whose stinger delivers blessing instead of venom. Theology departments find it very confusing.",
   stats:{hp:71,atk:47,def:47,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"starbright"},
  {id:"starbright",name:"Starbright",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp so sacred the concept of harm has agreed to avoid it. It stings with pure blessings. Theologians are keeping notes.",
   stats:{hp:97,atk:65,def:65,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"starlit",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"starburn"},  {id:"starburn",name:"Starburn",emoji:"🐝",type:"Light",rarity:"epic",description:"Sacredwasp became a divine swarm that is simultaneously everywhere and everywhere healing. Theologians have updated their texts.",
   stats:{hp:115,atk:77,def:76,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"starbright",shardsToAscend:20,ascensionsToEvolve:null},
  // Dark line 3: Doomshade -- Legendary spectre tank whose Wisps taunt and explode.
  {id:"doomshade",name:"Doomshade",emoji:"👻",type:"Dark",rarity:"legendary",description:"A spectre that drifted out of a lantern festival centuries ago and never went back. It hands out little flames to anyone who gets close. The flames are load-bearing.",
   stats:{hp:155,atk:79,def:122,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Spectral Rake",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Grave Lantern",charge:16,upgrades:["If there are less than 2 Wisps, summon 1 Wisp with 25 Health.","If there are less than 2 Wisps, summon 1 Wisp with 32 Health.","If there are less than 2 Wisps, summon 1 Wisp with 40 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health. It gains 100% Ability Charge."]},
     unique:{name:"Lantern Keeper",upgrades:["Summon 1 Wisp with 25 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 32 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 40 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 50 Health and it gains 100% Ability Charge.","Summon 2 Wisps with 50 Health and they gain 100% Ability Charge."]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"nihilgeist"},
  {id:"nihilgeist",name:"Nihilgeist",emoji:"☠️",type:"Dark",rarity:"legendary",description:"Doomshade with nothing left to haunt except the concept of light itself. Its wisps no longer flicker. They wait.",
   stats:{hp:186,atk:95,def:147,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Spectral Rake",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Grave Lantern",charge:16,upgrades:["If there are less than 2 Wisps, summon 1 Wisp with 25 Health.","If there are less than 2 Wisps, summon 1 Wisp with 32 Health.","If there are less than 2 Wisps, summon 1 Wisp with 40 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health. It gains 100% Ability Charge."]},
     unique:{name:"Lantern Keeper",upgrades:["Summon 1 Wisp with 25 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 32 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 40 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 50 Health and it gains 100% Ability Charge.","Summon 2 Wisps with 50 Health and they gain 100% Ability Charge."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"doomshade",shardsToAscend:30,ascensionsToEvolve:null},
  // (Ids still say "stormwyvern"/"tempestlord" -- the line was re-themed into a
  // storm cuckoo, and creature ids never change, for save compat.)
  // Battle module: battle/playerAbilities/zephyrcooLine.js.
  {id:"stormwyvern",name:"Zephyrcoo",emoji:"🐦‍⬛",type:"Wind",rarity:"legendary",description:"A storm-grey cuckoo that has never once built a nest of its own. It slips into other creatures' places so smoothly that they usually thank it for the trouble.",
   stats:{hp:113,atk:103,def:87,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Peck",upgrades:["Heal 4 HP; 16 dmg","Heal 5 HP; 18 dmg","Heal 6 HP; 20 dmg","Heal 7 HP; 23 dmg","Heal 7 HP; 23 dmg"]},
     special:{name:"Nest Swap",charge:26,upgrades:["If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 5% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 10% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 15% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 20% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 20% Speed and Haste. If there are no Swappable creatures, all Nearby allies instead temporarily gain 20% Speed and Haste"]},
     unique:{name:"Brood Ward",upgrades:["Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 20% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 30% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 40% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 50% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 50% Health. This effect begins with 1 use. This creature gains a Shield whenever it Swaps"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"tempestlord"},
  // Wind line 1 final
  {id:"tempestlord",name:"Tempestine",emoji:"🐦‍⬛",type:"Wind",rarity:"legendary",description:"The myths say a god once wore this shape so he could be sheltered from his own storm. Tempestine has spent every storm since returning the favour, swooping into the place of whoever is about to fall.",
   stats:{hp:135,atk:124,def:105,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Peck",upgrades:["Heal 4 HP; 16 dmg","Heal 5 HP; 18 dmg","Heal 6 HP; 20 dmg","Heal 7 HP; 23 dmg","Heal 7 HP; 23 dmg"]},
     special:{name:"Nest Swap",charge:26,upgrades:["If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 5% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 10% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 15% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 20% Speed and Haste","If this creature's Passive ability has 0 uses, regain 1 use of it and Swap places with the Swapped creature. The Swapped creature temporarily gains 20% Speed and Haste. If there are no Swappable creatures, all Nearby allies instead temporarily gain 20% Speed and Haste"]},
     unique:{name:"Brood Ward",upgrades:["Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 20% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 30% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 40% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 50% Health. This effect begins with 1 use","Whenever an ally falls below 30% Health, this creature Swaps places with them and they recover 50% Health. This effect begins with 1 use. This creature gains a Shield whenever it Swaps"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"stormwyvern",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 1 -- fire ants: Legendary, 2 stages, one kit shared verbatim. A
  // ranged Fire Support that doesn't burn things itself so much as hand the
  // flame out: its own healing is deliberately small, and its value is in
  // making the rest of the team set enemies alight and hit them harder for it.
  //
  // The animal is doing work here: a queen's value is her colony, not her own
  // bite. The two stages are the real life cycle -- a winged princess, then a
  // queen who has shed her wings to found a colony -- and every ability is a
  // colony behaviour: Formic Spray is the acid formicine ants fire at range,
  // Kindled Brood is the queen feeding and arming the workers around her, and
  // Alarm Pheromone is the scent that sends a whole colony onto one target.
  //
  // Statline: moved from Attacker to Support keeping the hp+atk+def budget
  // (282 / 338), split on the healing-legendary ratio Bloomibis and Animavis
  // use (~44 / 29 / 28%).
  //
  // Implementation notes:
  //   - Kindled Brood's "inflict Burn when dealing damage" is a buff on each
  //     Nearby ally for the standard duration ("temporarily" is not one of the
  //     duration-ladder words, so it reads as unmarked: STATUS_TICKS). An
  //     ability that ALREADY inflicts Burn lays one extra stack instead.
  //   - "Max stacks of Burn" is BURN_STACK_CAP (5) in battle/status.js.
  //   - Alarm Pheromone's max-tier detonation is meant to be modest damage on a
  //     relatively long cooldown, on top of the once-per-enemy limit the card
  //     states. The cooldown is design intent, not card text -- the card does
  //     not mention it (DETONATE_COOLDOWN_TICKS in the battle module,
  //     battle/playerAbilities/emberantLine.js).
  {id:"emberant",name:"Emberant",emoji:"🐜",type:"Fire",rarity:"legendary",description:"A fire ant princess still wearing the wings she'll shed to found a colony. Every worker in reach already treats her like a queen, and the ground around her is warm to stand on.",
   stats:{hp:123,atk:81,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Formic Spray",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg and inflict Burn"]},
     special:{name:"Kindled Brood",charge:20,upgrades:["Heal 12 HP","Heal 16 HP","Heal 20 HP","Heal 24 HP","Heal 24 HP"]},
     unique:{name:"Alarm Pheromone",upgrades:["Nearby allies deal 5% more damage to Burning enemies","Nearby allies deal 10% more damage to Burning enemies","Nearby allies deal 15% more damage to Burning enemies","Nearby allies deal 20% more damage to Burning enemies","Nearby allies deal 20% more damage to Burning enemies. If an ally attempts to inflict Burn while the enemy is at max stacks of Burn, they detonate and deal damage to all Nearby enemies and all their Burn is dispelled. This effect can only happen once per enemy"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"formicinder"},
  {id:"formicinder",name:"Formicinder",emoji:"🐜",type:"Fire",rarity:"legendary",description:"The wings are gone and the colony is hers. She doesn't fight so much as lend her sting to everything around her, and whatever they bite starts to smoulder.",
   stats:{hp:147,atk:97,def:94,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Formic Spray",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg and inflict Burn"]},
     special:{name:"Kindled Brood",charge:20,upgrades:["Heal 12 HP","Heal 16 HP","Heal 20 HP","Heal 24 HP","Heal 24 HP"]},
     unique:{name:"Alarm Pheromone",upgrades:["Nearby allies deal 5% more damage to Burning enemies","Nearby allies deal 10% more damage to Burning enemies","Nearby allies deal 15% more damage to Burning enemies","Nearby allies deal 20% more damage to Burning enemies","Nearby allies deal 20% more damage to Burning enemies. If an ally attempts to inflict Burn while the enemy is at max stacks of Burn, they detonate and deal damage to all Nearby enemies and all their Burn is dispelled. This effect can only happen once per enemy"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"emberant",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 2
  {id:"ignissaur",name:"Ignissaur",emoji:"🐲",type:"Fire",rarity:"legendary",description:"A dragon forged in the earth's mantle and never told it could leave. Surprisingly well-adjusted about it.",
   stats:{hp:116,atk:125,def:77,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Fang",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg and inflict Burn"]},
     special:{name:"Inferno Breath",charge:8,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and inflict Burn"]},
     unique:{name:"Stoked Flames",upgrades:["Deals 1% extra damage for each stack of Burn on the enemy","Deals 2% extra damage for each stack of Burn on the enemy","Deals 3% extra damage for each stack of Burn on the enemy","Deals 4% extra damage for each stack of Burn on the enemy","Deals 5% extra damage for each stack of Burn on the enemy"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"pyresaur"},
  {id:"pyresaur",name:"Pyresaur",emoji:"🐉",type:"Fire",rarity:"legendary",description:"Ignisdragon fully ignited. Every scale is a miniature sun. Sunglasses are not sufficient protection.",
   stats:{hp:140,atk:150,def:92,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Fang",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg and inflict Burn"]},
     special:{name:"Inferno Breath",charge:8,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and inflict Burn"]},
     unique:{name:"Stoked Flames",upgrades:["Deals 1% extra damage for each stack of Burn on the enemy","Deals 2% extra damage for each stack of Burn on the enemy","Deals 3% extra damage for each stack of Burn on the enemy","Deals 4% extra damage for each stack of Burn on the enemy","Deals 5% extra damage for each stack of Burn on the enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"ignissaur",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 1
  {id:"waddlepop",name:"Waddlepop",emoji:"🐧",type:"Water",rarity:"common",description:"A round penguin that lobs suspiciously ticking snowballs. It packs them itself and takes no questions.",
   stats:{hp:48,atk:50,def:28,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"frostillery"},
  {id:"frostillery",name:"Frostillery",emoji:"🐧",type:"Water",rarity:"common",description:"Waddlepop upgraded to full siege capability. It carries an entire bandolier of ice bombs and considers every problem a targeting solution.",
   stats:{hp:96,atk:100,def:56,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"waddlepop",shardsToAscend:10,ascensionsToEvolve:30,evolutionId:"bombardguin"},
  {id:"bombardguin",name:"Bombardguin",emoji:"🐧",type:"Water",rarity:"common",description:"Frostillery with proper mortar training. It calculates arcs on one flipper and never misses twice.",
   stats:{hp:120,atk:125,def:70,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"frostillery",shardsToAscend:14,ascensionsToEvolve:45,evolutionId:"cryogeddon"},
  {id:"cryogeddon",name:"Cryogeddon",emoji:"🧊",type:"Water",rarity:"common",description:"The penguin at the end of winter. Its bombardments have their own entry in the glacier fossil record.",
   stats:{hp:144,atk:150,def:84,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"bombardguin",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 4
  {id:"morusk",name:"Morusk",emoji:"🦭",type:"Water",rarity:"legendary",description:"A walrus whose tusks have grown to the size of siege weapons. Ships have mistaken it for an island on three separate recorded occasions.",
   stats:{hp:145,atk:80,def:140,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tusk Slam",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Healing Down"]},
     special:{name:"Blubber Wall",charge:12,upgrades:["Shield 8% HP; burst 50% DEF","Shield 10% HP; burst 50% DEF","Shield 10% HP; burst 65% DEF","Shield 12% HP; burst 65% DEF","Shield 12% HP; burst 80% DEF"]},
     unique:{name:"Permafrost Hide",upgrades:["Dealing damage temporarily lowers the enemy's Speed by 1%","Dealing damage temporarily lowers the enemy's Speed by 2%","Dealing damage temporarily lowers the enemy's Speed by 3%","Dealing damage temporarily lowers the enemy's Speed by 4%","Dealing damage temporarily lowers the enemy's Speed by 5%"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"ivormar"},
  {id:"ivormar",name:"Ivormar",emoji:"🦭",type:"Water",rarity:"legendary",description:"Morusk at its true scale. Oceanographers have been charting it as unexplored territory for three decades. It finds this mildly flattering.",
   stats:{hp:174,atk:96,def:168,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tusk Slam",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Healing Down"]},
     special:{name:"Blubber Wall",charge:12,upgrades:["Shield 8% HP; burst 50% DEF","Shield 10% HP; burst 50% DEF","Shield 10% HP; burst 65% DEF","Shield 12% HP; burst 65% DEF","Shield 12% HP; burst 80% DEF"]},
     unique:{name:"Permafrost Hide",upgrades:["Dealing damage temporarily lowers the enemy's Speed by 1%","Dealing damage temporarily lowers the enemy's Speed by 2%","Dealing damage temporarily lowers the enemy's Speed by 3%","Dealing damage temporarily lowers the enemy's Speed by 4%","Dealing damage temporarily lowers the enemy's Speed by 5%"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"morusk",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 2
  {id:"siegefin",name:"Siegefin",emoji:"🐠",type:"Nature",rarity:"legendary",description:"A seahorse that has anchored its tail to the seabed and refuses, on principle, to be anywhere else. It resolves distant problems by spitting at them very accurately.",
   stats:{hp:107,atk:112,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Brine Shot",upgrades:["28 dmg","32 dmg","36 dmg","40 dmg","40 dmg and inflict Healing Down"]},
     special:{name:"Holdfast",charge:18,upgrades:["This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 15% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 20% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 25% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash","This creature enduringly Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash"]},
     unique:{name:"Deepsight",upgrades:["This creature gains +1 Range","This creature gains +2 Range","This creature gains +3 Range","This creature gains +4 Range","This creature gains +5 Range"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"siegespire"},
  {id:"siegespire",name:"Siegespire",emoji:"🐉",type:"Nature",rarity:"legendary",description:"It has not moved in sixty years and has no intention of starting. Ships navigate by it now, which it considers a reasonable arrangement.",
   stats:{hp:129,atk:134,def:75,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Brine Shot",upgrades:["28 dmg","32 dmg","36 dmg","40 dmg","40 dmg and inflict Healing Down"]},
     special:{name:"Holdfast",charge:18,upgrades:["This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 15% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 20% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 25% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash","This creature enduringly Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash"]},
     unique:{name:"Deepsight",upgrades:["This creature gains +1 Range","This creature gains +2 Range","This creature gains +3 Range","This creature gains +4 Range","This creature gains +5 Range"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"siegefin",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 3
  {id:"bloomibis",name:"Bloomibis",emoji:"🦉",type:"Nature",rarity:"legendary",description:"A cat-faced owl crowned with living antlers. Whatever it watches over simply refuses to stay hurt.",
   stats:{hp:107,atk:70,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Antler Dart",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg. +5% Attack to self on hit (stacking) until the next time Soothing Hoot is used"]},
     special:{name:"Soothing Hoot",charge:22,upgrades:["Heal 38 HP","Heal 48 HP","Heal 60 HP","Heal 75 HP","Heal 75 HP. Also dispels all debuffs from healed allies"]},
     unique:{name:"Guardian Grove",upgrades:["Heal 6 HP/s","Heal 8 HP/s","Heal 10 HP/s","Heal 13 HP/s","Heal 13 HP/s and gain +10% Attack"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"animavis"},
  {id:"animavis",name:"Animavis",emoji:"🌿",type:"Nature",rarity:"legendary",description:"Bloomphoenix's final form. The concept of life given wings. It sustains ecosystems just by existing nearby.",
   stats:{hp:127,atk:84,def:81,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Antler Dart",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg. +5% Attack to self on hit (stacking) until the next time Soothing Hoot is used"]},
     special:{name:"Soothing Hoot",charge:22,upgrades:["Heal 38 HP","Heal 48 HP","Heal 60 HP","Heal 75 HP","Heal 75 HP. Also dispels all debuffs from healed allies"]},
     unique:{name:"Guardian Grove",upgrades:["Heal 6 HP/s","Heal 8 HP/s","Heal 10 HP/s","Heal 13 HP/s","Heal 13 HP/s and gain +10% Attack"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"bloomibis",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 3
  // Ankylosaur line: Legendary, 2 stages, one kit shared verbatim. Slow and
  // heavy -- it trades Speed and Haste for Attack, and winds its tail up
  // between swings.
  {id:"clubtail",name:"Clubtail",emoji:"🦕",type:"Earth",rarity:"legendary",description:"An ankylosaur built low to the ground and armoured like a paving job. The tail club arrives some time after the decision to swing it.",
   stats:{hp:108,atk:117,def:71,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tail Club",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","48 dmg"]},
     special:{name:"Wind Up",charge:8,upgrades:["This creature's next attack deals 30% more damage, stacking up to 100%","This creature's next attack deals 35% more damage, stacking up to 100%","This creature's next attack deals 40% more damage, stacking up to 100%","This creature's next attack deals 45% more damage, stacking up to 100%","This creature's next attack deals 50% more damage, stacking up to 100%"]},
     unique:{name:"Dead Weight",upgrades:["This creature has -60% Speed, -60% Haste, and +40% Attack","This creature has -50% Speed, -60% Haste, and +40% Attack","This creature has -50% Speed, -50% Haste, and +40% Attack","This creature has -50% Speed, -50% Haste, and +50% Attack","This creature has -50% Speed, -50% Haste, and +50% Attack. Whenever this creature defeats an enemy, the excess damage Splashes evenly onto the 8 surrounding tiles"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"anvilback"},
  {id:"anvilback",name:"Anvilback",emoji:"🦕",type:"Earth",rarity:"legendary",description:"Clubtail at full weight. It has never hurried once and has never needed to -- whatever it was going to reach is still there when it arrives.",
   stats:{hp:131,atk:140,def:85,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tail Club",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","48 dmg"]},
     special:{name:"Wind Up",charge:8,upgrades:["This creature's next attack deals 30% more damage, stacking up to 100%","This creature's next attack deals 35% more damage, stacking up to 100%","This creature's next attack deals 40% more damage, stacking up to 100%","This creature's next attack deals 45% more damage, stacking up to 100%","This creature's next attack deals 50% more damage, stacking up to 100%"]},
     unique:{name:"Dead Weight",upgrades:["This creature has -60% Speed, -60% Haste, and +40% Attack","This creature has -50% Speed, -60% Haste, and +40% Attack","This creature has -50% Speed, -50% Haste, and +40% Attack","This creature has -50% Speed, -50% Haste, and +50% Attack","This creature has -50% Speed, -50% Haste, and +50% Attack. Whenever this creature defeats an enemy, the excess damage Splashes evenly onto the 8 surrounding tiles"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"clubtail",shardsToAscend:30,ascensionsToEvolve:null},
  // Wind line 2
  // Mantis line: Legendary, 2 stages, one kit shared verbatim. A Wind
  // mantis that cuts.
  {id:"sicklewing",name:"Sicklewing",emoji:"🦗",type:"Wind",rarity:"legendary",description:"A mantis that learned the wind would carry it and stopped flying under its own power. It waits with its forelegs folded and the air around them thin.",
   stats:{hp:103,atk:106,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sickle Cut",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg. Execute enemies below 20% Health"]},
     special:{name:"Twin Reap",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and briefly Stun all enemies hit"]},
     unique:{name:"Unfettered",upgrades:["This creature gains 5% Speed and its attacks bypass Shields","This creature gains 10% Speed and its attacks bypass Shields","This creature gains 15% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields and bypass Taunt"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"galescythe"},
  {id:"galescythe",name:"Galescythe",emoji:"🌪️",type:"Wind",rarity:"legendary",description:"It moves once and the argument is over. Nobody has seen the claws open; the consensus is that they never close.",
   stats:{hp:123,atk:127,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sickle Cut",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg. Execute enemies below 20% Health"]},
     special:{name:"Twin Reap",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and briefly Stun all enemies hit"]},
     unique:{name:"Unfettered",upgrades:["This creature gains 5% Speed and its attacks bypass Shields","This creature gains 10% Speed and its attacks bypass Shields","This creature gains 15% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields and bypass Taunt"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"sicklewing",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 1 -- three-headed storm dragons: Legendary, 2 stages, one kit
  // shared verbatim. A ranged Attacker built around the Lightning Hazard.
  //
  // The three heads ARE the Basic: each picks its own target -- the Weakest,
  // the Closest and the Farthest enemy -- and when two picks are the same
  // creature, it takes both hits. All three are ONE attack (one use of the
  // Basic), so per-attack gear counts it once while per-hit effects count each
  // head. Each hit is priced at a third of a normal Legendary Attacker's Basic,
  // so three on one target matches it -- until the max tier, whose second and
  // third hits on the same enemy deal +50% / +100%, which makes this the
  // strongest single-target Basic in the game (63 vs 43 at max) and puts it
  // ahead against bosses, where every head always hits the same body.
  //
  // Implemented in battle/playerAbilities/voltraveneLine.js; the Lightning
  // Hazard itself lives in battle/tick.js (lightningStrikesCaster). Notes:
  //   - Trident Arc's max tier says "each additional ATTACK" -- that means each
  //     additional HEAD's hit on the same enemy, even though in engine terms
  //     all three heads are one attack. Second hit +50%, third +100%.
  //   - Storm Lance lays the Hazard from its max tier, along the ray it struck
  //     (the card says only "temporarily leave", matching Dread Howl's Fire
  //     Hazard wording). It is the only source, so Stormsight has nothing to
  //     read until then.
  //   - "Can always target them" lets the Basic reach an enemy on a Hazard
  //     from any range.
  //   - Stormsight's max tier counts enemies standing in Hazards THIS creature
  //     laid -- not any Lightning Hazard -- and is flat Speed (2% each),
  //     recounted as enemies step on and off; a flat stat bump, so no pill.
  {id:"voltravene",name:"Voltravene",emoji:"🐲",type:"Electric",rarity:"legendary",description:"A young storm dragon with three heads that have never agreed on anything, least of all which enemy to bite. They settle it the obvious way and bite all three.",
   stats:{hp:110,atk:121,def:80,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Trident Arc",upgrades:["10 dmg","11 dmg","13 dmg","14 dmg","14 dmg. If an enemy is damaged multiple times, deal 50% more damage for each additional attack"]},
     special:{name:"Storm Lance",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and temporarily leave a Lightning Hazard"]},
     unique:{name:"Stormsight",upgrades:["This creature's Basic ability deals 5% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 10% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 15% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 20% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 20% more damage to enemies standing on a Lightning Hazard and can always target them. For each enemy in a Lightning Hazard it created, gain 2% Speed"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"arcmajor"},
  {id:"arcmajor",name:"Arcmajor",emoji:"🐉",type:"Electric",rarity:"legendary",description:"Grown into its storm, the three heads finally work as one: each chooses its own prey, and the sky answers all of them at once. The ground it leaves behind keeps humming.",
   stats:{hp:132,atk:146,def:96,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Trident Arc",upgrades:["10 dmg","11 dmg","13 dmg","14 dmg","14 dmg. If an enemy is damaged multiple times, deal 50% more damage for each additional attack"]},
     special:{name:"Storm Lance",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and temporarily leave a Lightning Hazard"]},
     unique:{name:"Stormsight",upgrades:["This creature's Basic ability deals 5% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 10% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 15% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 20% more damage to enemies standing on a Lightning Hazard and can always target them","This creature's Basic ability deals 20% more damage to enemies standing on a Lightning Hazard and can always target them. For each enemy in a Lightning Hazard it created, gain 2% Speed"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltravene",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 3 -- griffins: Legendary, 2 stages, one kit shared verbatim. A
  // melee Light tank that fights on other creatures' behalf rather than its own.
  //
  // Twin Radiance is named for the two halves of the beast -- eagle and lion
  // landing as one strike -- so the name is the theme, not decoration.
  {id:"auravast",name:"Auravast",emoji:"🦅",type:"Light",rarity:"legendary",description:"Eagle at the front, lion at the back, gold the whole way through. It swore itself to something a long time ago and has never been argued out of it; anything that approaches is invited, politely, to stand behind it.",
   stats:{hp:154,atk:79,def:122,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Radiance",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Sovereign Call",charge:16,upgrades:["Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +10% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +15% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage","Taunt an enemy and call a nearby ally to Assist. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage"]},
     unique:{name:"Sworn Guard",upgrades:["Whenever an ally within range is attacked, target that enemy and deal 20% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 30% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 40% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, instantly refresh this creature's Special ability, target that enemy, and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"lumimajor"},
  {id:"lumimajor",name:"Lumimajor",emoji:"🦅",type:"Light",rarity:"legendary",description:"The griffin heralds paint onto shields, standing in a light of its own making. It has never once moved out of the way of anything, and allies have learned to form up in its shadow.",
   stats:{hp:186,atk:94,def:146,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Radiance",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Sovereign Call",charge:16,upgrades:["Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +10% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +15% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage","Taunt an enemy and call a nearby ally to Assist. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage"]},
     unique:{name:"Sworn Guard",upgrades:["Whenever an ally within range is attacked, target that enemy and deal 20% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 30% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 40% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, instantly refresh this creature's Special ability, target that enemy, and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"auravast",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 3
  {id:"loptrix",name:"Loptrix",emoji:"🦊",type:"Dark",rarity:"legendary",description:"A fox that is never quite where you last saw it. It has been formally banished from four separate pantheons, which it regards as a personal best.",
   stats:{hp:114,atk:101,def:79,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mocking Nip",upgrades:["20 dmg","26 dmg","33 dmg","42 dmg","42 dmg and inflict Defense Down"]},
     special:{name:"Scapegoat",charge:24,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","95 dmg"]},
     unique:{name:"Vanishing Act",upgrades:["Gain 70% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 80% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 90% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able and dispel all debuffs on self."]}
   },role:"Support",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"ragnavix"},
  {id:"ragnavix",name:"Ragnavix",emoji:"🌘",type:"Dark",rarity:"legendary",description:"Loptrix at the height of its mischief, no longer bothering to hold a single shape. It once talked an entire army into fighting itself and left before anyone noticed. Nothing has ever been proven.",
   stats:{hp:136,atk:122,def:95,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mocking Nip",upgrades:["20 dmg","26 dmg","33 dmg","42 dmg","42 dmg and inflict Defense Down"]},
     special:{name:"Scapegoat",charge:24,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","95 dmg"]},
     unique:{name:"Vanishing Act",upgrades:["Gain 70% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 80% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 90% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able and dispel all debuffs on self."]}
   },role:"Support",attackType:"Melee",evolutionOf:"loptrix",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire healer line: a phoenix that heals with fire.
  {id:"emberchirp",name:"Emberchirp",emoji:"🐤",type:"Fire",rarity:"common",description:"A round chick that runs a slight fever at all times. It naps in campfires and wakes up offended when they go out.",
   stats:{hp:39,atk:26,def:25,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stolen Spark",upgrades:["Heal 4 HP; 8 dmg","Heal 4 HP; 10 dmg","Heal 4 HP; 13 dmg","Heal 4 HP; 16 dmg","Heal 6 HP; 16 dmg"]},
     special:{name:"Shared Flame",charge:12,upgrades:["Heal 20 HP","Heal 26 HP","Heal 33 HP","Heal 42 HP","Heal 42 HP. All other allies gain Heal Over Time"]},
     unique:{name:"Rekindle",upgrades:["Gain 1% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 2% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 3% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 4% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 5% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated."]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"pyrefinch"},
  {id:"pyrefinch",name:"Pyrefinch",emoji:"🐦‍🔥",type:"Fire",rarity:"common",description:"Its down has burned away into true flame feathers. Injured animals have started sleeping outside its nest, which it pretends to find annoying.",
   stats:{hp:66,atk:43,def:41,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stolen Spark",upgrades:["Heal 4 HP; 8 dmg","Heal 4 HP; 10 dmg","Heal 4 HP; 13 dmg","Heal 4 HP; 16 dmg","Heal 6 HP; 16 dmg"]},
     special:{name:"Shared Flame",charge:12,upgrades:["Heal 20 HP","Heal 26 HP","Heal 33 HP","Heal 42 HP","Heal 42 HP. All other allies gain Heal Over Time"]},
     unique:{name:"Rekindle",upgrades:["Gain 1% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 2% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 3% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 4% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 5% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated."]}
   },role:"Support",attackType:"Ranged",evolutionOf:"emberchirp",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"cauterix"},
  {id:"cauterix",name:"Cauterix",emoji:"❤️‍🔥",type:"Fire",rarity:"common",description:"It has learned to close wounds the direct way. Its patients describe the treatment as 'brief', 'effective', and 'never again', then come back anyway.",
   stats:{hp:95,atk:61,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stolen Spark",upgrades:["Heal 4 HP; 8 dmg","Heal 4 HP; 10 dmg","Heal 4 HP; 13 dmg","Heal 4 HP; 16 dmg","Heal 6 HP; 16 dmg"]},
     special:{name:"Shared Flame",charge:12,upgrades:["Heal 20 HP","Heal 26 HP","Heal 33 HP","Heal 42 HP","Heal 42 HP. All other allies gain Heal Over Time"]},
     unique:{name:"Rekindle",upgrades:["Gain 1% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 2% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 3% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 4% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 5% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated."]}
   },role:"Support",attackType:"Ranged",evolutionOf:"pyrefinch",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"hearthenix"},
  {id:"hearthenix",name:"Hearthenix",emoji:"🌅",type:"Fire",rarity:"common",description:"The phoenix of the hearth. Where other phoenixes are reborn from their own ashes, Hearthenix extends the courtesy to everyone else.",
   stats:{hp:125,atk:82,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stolen Spark",upgrades:["Heal 4 HP; 8 dmg","Heal 4 HP; 10 dmg","Heal 4 HP; 13 dmg","Heal 4 HP; 16 dmg","Heal 6 HP; 16 dmg"]},
     special:{name:"Shared Flame",charge:12,upgrades:["Heal 20 HP","Heal 26 HP","Heal 33 HP","Heal 42 HP","Heal 42 HP. All other allies gain Heal Over Time"]},
     unique:{name:"Rekindle",upgrades:["Gain 1% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 2% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 3% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 4% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated.","Gain 5% increased Healing for each 10% missing Health. Revive with 100% Health the first time this creature is defeated."]}
   },role:"Support",attackType:"Ranged",evolutionOf:"cauterix",shardsToAscend:18,ascensionsToEvolve:null},
];

export const CREATURE_MAP=Object.fromEntries(CREATURES.map(c=>[c.id,c]));

// Battle-only summon; not part of the collectible roster, so it is injected
// into the map rather than living in CREATURES.
CREATURE_MAP["__vine_minion"]={id:"__vine_minion",emoji:"🌱",name:"Vine Minion",type:"Nature",attackType:"Melee",stats:{hp:80,atk:25,def:15,spd:1,abilitySpeed:1,crit:4,critDmg:30},abilities:{basic:{name:"Vine Whip",description:"Attacks the nearest enemy"},special:{name:"Entangle",description:"Attacks all surrounding tiles"}}};
// Doomshade's summoned Wisp (see the Wisp tag in core/abilityText.js for its
// player-facing kit, and battle/playerAbilities/doomshadeLine.js for the
// implementation). Battle-only like the vine minion: present in CREATURE_MAP
// for rendering/name lookups but absent from CREATURES, so it never appears
// in the Dex, hatches, or collections. Its real Health comes from the
// summoning ability's tier; stats here are only a fallback shape.
CREATURE_MAP["__wisp"]={id:"__wisp",emoji:"🕯️",name:"Wisp",type:"Dark",role:"Tank",attackType:"Melee",stats:{hp:25,atk:0,def:0,spd:1,abilitySpeed:1,crit:4,critDmg:30},abilities:{basic:{name:"Beckon",description:"Taunt an enemy"},special:{name:"Ghostly Step",charge:10,description:"Teleport beside a random enemy"},unique:{name:"Grave Grudge",description:"Deal damage to the enemy that defeated this creature equal to 10% of the Summoner's Health"}}};

/**
 * Bosses are creatures too: one "__boss_<kit>" entry per boss kit, generated
 * from DUNGEON_BOSSES (data/bosses.js) so a boss's name, type, stats and card
 * text live in one place. Battle-only like the two above -- never in the Dex,
 * hatches, or the collection. What makes them bosses is their `classes`
 * (battle/classifications.js) and their 2x2 `size`; their behaviour is the
 * kit in battle/bosses/<kit>.js. The Daily boss runs the shared "daily" kit
 * under whichever dungeon boss's name and stats the day borrows.
 */
for (const b of DUNGEON_BOSSES) {
  CREATURE_MAP["__boss_" + b.key] = { id: "__boss_" + b.key, emoji: "👾", name: b.name, type: b.type, role: "Boss", attackType: "Melee", size: 2, classes: ["boss"], stats: b.baseStats, abilities: b.abilities };
}
CREATURE_MAP["__boss_daily"] = { id: "__boss_daily", emoji: "👾", name: "Daily Boss", type: "Daily", role: "Boss", attackType: "Melee", size: 2, classes: ["boss"], stats: DUNGEON_BOSSES[0].baseStats, abilities: DUNGEON_BOSSES[0].abilities };

export const FINAL_FORMS=CREATURES.filter(c=>!c.evolutionId);
// Ordered by TYPE_ORDER rather than alphabetically, so the Collection and Dex
// type filters read in the same order as the Dungeon's boss bar. A type absent
// from TYPE_ORDER sorts to the end instead of disappearing.
export const ALL_TYPES=[...new Set(CREATURES.map(c=>c.type))]
  .sort((a,b)=>{const ia=TYPE_ORDER.indexOf(a),ib=TYPE_ORDER.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});

/** Every creature form (every evolution stage, not just final forms), grouped by
 * family with each family ordered base-to-final -- so pre-evolutions sit right
 * next to the form they evolve into instead of scattered by their position in
 * CREATURES (which is grouped by stage batch, not by family). Family order
 * matches FINAL_FORMS. Walks `evolutionOf` directly rather than importing
 * core/creatures.js's getChain, to avoid a data/core circular import. */
export const ALL_DEX_FORMS=FINAL_FORMS.flatMap(final=>{
  const chain=[];
  let cur=final;
  while(cur){chain.unshift(cur);cur=cur.evolutionOf?CREATURE_MAP[cur.evolutionOf]:null;}
  return chain;
});
