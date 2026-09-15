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
  {id:"leafling",name:"Venomcoil",emoji:"🐍",type:"Nature",rarity:"common",description:"A hatchling anaconda barely longer than a bootlace, already beading venom along every scale. It practices constricting on a rolled-up sock.",
   stats:{hp:49,atk:40,def:27,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"canoparch"},
  {id:"canoparch",name:"Mirewreathe",emoji:"🐍",type:"Nature",rarity:"common",description:"Long enough now to loop something twice and mean it. The swamp it lives in has been quietly relabelled on local maps.",
   stats:{hp:76,atk:63,def:43,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"leafling",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"verdantlord"},
  {id:"pebbit",name:"Pebbit",emoji:"🐸",type:"Earth",rarity:"common",description:"A round little rock frog with a pebble-smooth hide. Surprisingly difficult to step on.",
   stats:{hp:63,atk:31,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"bouldrath"},
  {id:"bouldrath",name:"Bouldroad",emoji:"🐸",type:"Earth",rarity:"common",description:"Pebbit grown into a stout toad that hauls a boulder on its back. It refuses to explain why.",
   stats:{hp:112,atk:56,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"pebbit",shardsToAscend:10,ascensionsToEvolve:30,evolutionId:"granitarch"},
  {id:"breezekit",name:"Cirruskit",emoji:"🐈",type:"Wind",rarity:"common",description:"A leopard cub spun from high, thin cloud. It is ninety percent vapour and one hundred percent certain it is stalking something.",
   stats:{hp:38,atk:30,def:22,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"galestride"},
  {id:"galestride",name:"Cumulynx",emoji:"🐆",type:"Wind",rarity:"common",description:"Its coat has thickened into proper cumulus. It naps on updrafts and leaves fog behind wherever it lands.",
   stats:{hp:63,atk:54,def:38,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"breezekit",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"tempesthawk"},
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
  {id:"verdantlord",name:"Toxiconda",emoji:"🐍",type:"Nature",rarity:"common",description:"Fully grown, permanently damp, and venomous end to end. Whatever it has wrapped stopped arguing some time ago.",
   stats:{hp:103,atk:88,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"canoparch",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"ancientgrove"},
  {id:"ancientgrove",name:"Gaiaconda",emoji:"🐍",type:"Nature",rarity:"common",description:"A river with scales. Its coils have their own weather, and everything caught inside them is having a worse day than the forecast suggested.",
   stats:{hp:130,atk:114,def:86,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Venom Fang",upgrades:["12 dmg and recover Health equal to 10% of the damage dealt","15 dmg and recover Health equal to 10% of the damage dealt","19 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 10% of the damage dealt","24 dmg and recover Health equal to 30% of the damage dealt"]},
     special:{name:"Crushing Coil",charge:10,upgrades:["35 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","44 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","55 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 10% Ability Charge","68 dmg and Restrain them. If the enemy was already Restrained, remove 20% Ability Charge"]},
     unique:{name:"Dripping Scales",upgrades:["Whenever this creature inflicts Restrain, also inflict Poison. Gain 2% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 4% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 6% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 8% Speed when targeting a Restrained enemy","Whenever this creature inflicts Restrain, also inflict Poison. Gain 10% Speed when targeting a Restrained enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"verdantlord",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 1 extensions
  {id:"granitarch",name:"Granitoad",emoji:"🗿",type:"Earth",rarity:"common",description:"A granite-plated toad stacked with boulders. Its croak registers on seismographs two towns over.",
   stats:{hp:158,atk:78,def:115,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"bouldrath",shardsToAscend:14,ascensionsToEvolve:45,evolutionId:"mountainking"},
  {id:"mountainking",name:"Toadalith",emoji:"🏔️",type:"Earth",rarity:"common",description:"A toad the size of a hill beneath a peak of stacked boulders. Maps list it as terrain; it prefers 'ambush.'",
   stats:{hp:209,atk:103,def:153,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Pebble Spit",upgrades:["9 dmg","10 dmg","11 dmg","12 dmg","13 dmg"]},
     special:{name:"Boulder Hunker",charge:18,upgrades:["Taunt all nearby enemies and gain a Shield equal to 3% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 6% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 9% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 12% of this creature's Defense","Taunt all nearby enemies and gain a Shield equal to 15% of this creature's Defense"]},
     unique:{name:"Stone Skin",upgrades:["Debuffs expire 10% faster","Debuffs expire 20% faster","Debuffs expire 30% faster","Debuffs expire 40% faster","Debuffs expire 50% faster"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"granitarch",shardsToAscend:18,ascensionsToEvolve:null},
  // Wind line 1 extensions
  {id:"tempesthawk",name:"Nimbupard",emoji:"🐅",type:"Wind",rarity:"common",description:"The cloud has darkened. Weather stations log its naps as 'localized drizzle' and have stopped asking questions.",
   stats:{hp:89,atk:77,def:55,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"galestride",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"stormlord"},
  {id:"stormlord",name:"Stormpelt",emoji:"🦁",type:"Wind",rarity:"common",description:"The apex of wind, wearing a thunderhead as a pelt. Entire storm systems orbit it like satellites.",
   stats:{hp:116,atk:99,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["10 dmg","11 dmg","12 dmg","13 dmg","13 dmg and inflict Defense Down"]},
     special:{name:"Zephyr Step",charge:8,upgrades:["18 dmg","20 dmg","22 dmg","25 dmg","25 dmg. Gain Speed Up"]},
     unique:{name:"Slipstream",upgrades:["Attacks Pierce enemies and deal 5% more damage","Attacks Pierce enemies and deal 10% more damage","Attacks Pierce enemies and deal 15% more damage","Attacks Pierce enemies and deal 20% more damage","Attacks Pierce enemies and deal 20% more damage. Attacks have +1 Range"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tempesthawk",shardsToAscend:18,ascensionsToEvolve:null},
  // Fire line 2
  {id:"ashpup",name:"Vixling",emoji:"🦊",type:"Nature",rarity:"common",description:"A woodland red fox kit with leaves tangled in its russet fur. It knows every trail in the forest, including several that don't exist.",
   stats:{hp:41,atk:41,def:22,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Bramble Shot",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Poisons target for 4 dmg/s for 2s"]},
     special:{name:"Underbrush Dash",charge:16,upgrades:["Dodge next hit; +20 SPD","Dodge; +28 SPD","Dodge; +36 SPD","Dodge; +45 SPD; leave tangling brush that snares enemies for 1s","Dodge; +55 SPD; brush also slows enemies 20% for 2s"]},
     unique:{name:"Fern Trail",upgrades:["Passive: movement leaves undergrowth that slows enemies 10%","Slows 15%","Slows 20% and reduces enemy ATK 8%","Slows 25% and reduces ATK 12%","Slows 30%; ATK -16%; undergrowth sprouts thorns after 2s for 10 dmg/s"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"cinderfox"},
  {id:"cinderfox",name:"Bramblefox",emoji:"🦊",type:"Nature",rarity:"common",description:"Vixling grown into a cunning hunter. Its tail flicks barbed brambles at anything that follows too closely.",
   stats:{hp:65,atk:67,def:38,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Bramble Shot",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Poisons target for 4 dmg/s for 2s"]},
     special:{name:"Fern Feint",charge:16,upgrades:["Dodge next hit; +20 SPD","Dodge; +28 SPD","Dodge; +36 SPD","Dodge; +45 SPD; leave burr patch","Dodge; +55 SPD; burr patch also slows enemies 20%"]},
     unique:{name:"Trickster's Step",upgrades:["Passive: 10% chance to dodge any hit","12% dodge chance","15% dodge chance; on dodge, counter for 18 dmg","18% dodge chance; counter for 25 dmg","22% dodge chance; counter for 35 dmg; counter also poisons for 3s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"ashpup",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"scorchbeast"},
  {id:"scorchbeast",name:"Sylvavix",emoji:"🍁",type:"Nature",rarity:"common",description:"Bramblefox at home in the deep woods. Moss lines its spine, and the forest quietly rearranges its trails to help it hunt.",
   stats:{hp:88,atk:95,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Bramble Shot",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Poisons for 4 dmg/s for 2s"]},
     special:{name:"Thorn Volley",charge:16,upgrades:["Volley; 45 dmg on impact","58 dmg","72 dmg","90 dmg","Pins foe in place for 1s"]},
     unique:{name:"Nettle Marks",upgrades:["Passive: attacks deal +15% dmg on poisoned targets","20%","26%","32%","40%; also removes 1 buff from poisoned enemies on hit"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"cinderfox",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"emberlord"},
  {id:"emberlord",name:"Verdanvox",emoji:"🌲",type:"Nature",rarity:"common",description:"A fox of the old forest wearing a mane of autumn leaves. Sylvavix's final and most cunning form.",
   stats:{hp:119,atk:127,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Bramble Shot",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Poisons for 4 dmg/s for 2s"]},
     special:{name:"Thorn Volley",charge:16,upgrades:["Volley; 45 dmg on impact","58 dmg","72 dmg","90 dmg","Pins foe for 1s"]},
     unique:{name:"Verdant Dominion",upgrades:["Passive: poisoned enemies take 20% more dmg from all sources","25%","30%","36%","42%; Verdanvox gains +1% ATK for each second an enemy remains poisoned"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"scorchbeast",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 1
  {id:"droplette",name:"Droplette",emoji:"💧",type:"Water",rarity:"common",description:"A tiny water sprite no bigger than a raindrop. Its healing tears can soothe any wound.",
   stats:{hp:46,atk:30,def:29,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Mist",charge:14,upgrades:["Heal ally 20 HP","Heal 28 HP","Heal 38 HP","Heal 50 HP","Heal all allies 22 HP"]},
     unique:{name:"Rain Aura",upgrades:["Passive: all allies regen 1 HP/s","Regen 2 HP/s","Regen 3 HP/s","Regen 4 HP/s","Regen 5 HP/s; heal overflows as temporary shield"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"bubblin"},
  {id:"bubblin",name:"Bubblin",emoji:"🫧",type:"Water",rarity:"common",description:"A Droplette that has grown a protective bubble shell. It heals by popping mini bubbles.",
   stats:{hp:75,atk:48,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Bubble Shield",charge:18,upgrades:["Shield ally 30 HP","Shield 42 HP","Shield 55 HP","Shield 70 HP","Shield all allies 25 HP"]},
     unique:{name:"Bubble Burst",upgrades:["Passive: when shield breaks, heals wearer 15 HP","Heals 22 HP","Heals 30 HP; stuns attacker 0.5s","Heals 40 HP; stuns 0.5s","Heals 50 HP; stuns 1s; also deals 20 dmg to attacker"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"droplette",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"wavecrest"},
  {id:"wavecrest",name:"Wavecrest",emoji:"🌊",type:"Water",rarity:"common",description:"Bubblin evolved into a creature that rides its own waves. Heals by surf.",
   stats:{hp:107,atk:69,def:66,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Tide",charge:16,upgrades:["Heal all allies 30 HP","Heal 42 HP","Heal 55 HP","Heal 70 HP","Heal 85 HP; remove all debuffs from allies"]},
     unique:{name:"Surf Heal",upgrades:["Passive: abilities heal all allies 8 HP on cast","Heal 12 HP","Heal 16 HP; also restore 5% max HP","Heal 22 HP; restore 8% max HP","Heal 30 HP; restore 12% max HP; Wavecrest gains double regen"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"bubblin",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"tidecrown"},
  {id:"tidecrown",name:"Tidecrown",emoji:"🐬",type:"Water",rarity:"common",description:"Wavecrest's final form. The ocean answers its call. Healers across the land seek its blessing.",
   stats:{hp:141,atk:92,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Tide",charge:16,upgrades:["Heal all allies 30 HP","Heal 42 HP","Heal 55 HP","Heal 70 HP","Heal 85 HP; remove all debuffs"]},
     unique:{name:"Tidal Grace",upgrades:["Passive: healing done by Tidecrown +20%","+28%","+36%; overheal converts to shield","+45%; overheal shield","+55%; overheal shield; Tidecrown revives one fallen ally at 30% HP once per battle"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"wavecrest",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 2
  {id:"frostpup",name:"Iglet",emoji:"🐢",type:"Water",rarity:"common",description:"A turtle hatchling that packed its own shell out of snow. It is enormously proud of this and will not be told it is doing turtling wrong.",
   stats:{hp:59,atk:29,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"snowmane"},
  {id:"snowmane",name:"Shellter",emoji:"🧊",type:"Water",rarity:"common",description:"The snow dome has become a proper igloo, doorway and all. It does not let anyone else use the doorway.",
   stats:{hp:95,atk:48,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"frostpup",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"blizzardback"},
  {id:"blizzardback",name:"Frostkeep",emoji:"🏔️",type:"Water",rarity:"common",description:"The igloo is load-bearing ice now. A survey team once mistook it for a research station and knocked politely.",
   stats:{hp:135,atk:67,def:101,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"snowmane",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"glaciertusk"},
  {id:"glaciertusk",name:"Hibernarch",emoji:"🗻",type:"Water",rarity:"common",description:"A turtle carrying a fortress of ancient ice. It has been asleep inside for most of recorded history and has no plans to stop.",
   stats:{hp:177,atk:88,def:133,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Frost Nip",upgrades:["10 dmg","11 dmg","12 dmg","14 dmg","14 dmg and heal 50% of the damage dealt"]},
     special:{name:"Hunker In",charge:14,upgrades:["Gain 2 stacks of Fortify.","Gain 3 stacks of Fortify.","Gain 4 stacks of Fortify.","Gain 5 stacks of Fortify.","Gain 5 stacks of Fortify. When Fortify is removed, dispel all debuffs on this creature."]},
     unique:{name:"Windbreak",upgrades:["Nearby allies receive 2% less damage. Doubled while this creature has Fortify.","Nearby allies receive 4% less damage. Doubled while this creature has Fortify.","Nearby allies receive 7% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify.","Nearby allies receive 10% less damage. Doubled while this creature has Fortify. Inflict Frostbite when attacked."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"blizzardback",shardsToAscend:18,ascensionsToEvolve:null},
  // Nature line 2
  {id:"sproutlet",name:"Puddlet",emoji:"🐣",type:"Water",rarity:"epic",description:"A fluffy heron hatchling with more legs than balance. It practices spear-fishing in puddles and mostly stabs its own reflection.",
   stats:{hp:53,atk:57,def:34,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Staggers target for 0.5s"]},
     special:{name:"Plunge Strike",charge:12,upgrades:["Dive; 30 dmg on impact","38 dmg","48 dmg","60 dmg","Also soaks target, slowing it 20% for 2s"]},
     unique:{name:"Patient Hunter",upgrades:["Passive: +10% dmg to enemies below half HP","+14%","+18%","+24%","+30%; first strike each battle always crits"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"fernback"},
  {id:"fernback",name:"Wadewing",emoji:"🐦",type:"Water",rarity:"epic",description:"Puddlet grown into its stilts. It stands motionless in the shallows until something forgets it's there.",
   stats:{hp:85,atk:91,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Staggers target 0.5s"]},
     special:{name:"Skimming Strike",charge:8,upgrades:["Skim; 34 dmg and knock the target back 1 tile","44 dmg","56 dmg","70 dmg","Knocks back 2 tiles"]},
     unique:{name:"Stillwater Poise",upgrades:["Passive: after standing still for 2s, next attack deals +30% dmg","+40%","+50%","+65%","+80%; and cannot miss"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"sproutlet",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"rootkeeper"},
  {id:"rootkeeper",name:"Heronarch",emoji:"🦢",type:"Water",rarity:"epic",description:"The river's crowned sentinel. Every strike is a single perfect line. Fish reportedly organize petitions about it.",
   stats:{hp:132,atk:140,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Beak Jab",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Staggers 0.5s"]},
     special:{name:"Tidal Lance",charge:8,upgrades:["Lance; 80 dmg to the target and the tile behind it","100 dmg","124 dmg","152 dmg","Hits everything in the row behind the target"]},
     unique:{name:"River Sovereign",upgrades:["Passive: attacks deal +15% dmg and ignore 15% of DEF","+20% dmg; ignore 20%","+26% dmg; ignore 25%","+32% dmg; ignore 30%","+40% dmg; ignore 40%; once per battle, survives a killing blow at 1 HP"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"fernback",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 2
  {id:"mudpaw",name:"Mudboar",emoji:"🐗",type:"Earth",rarity:"common",description:"A stocky mud boar with rock-hard skin. It rolls into foes like a living boulder.",
   stats:{hp:60,atk:30,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mud Tusk",upgrades:["10 dmg","13 dmg","16 dmg","20 dmg","Slows target 15% for 2s"]},
     special:{name:"Mud Roll",charge:10,upgrades:["Roll into foe; 35 dmg","45 dmg","56 dmg","70 dmg","Knocks back and stuns 0.5s"]},
     unique:{name:"Mud Hide",upgrades:["Passive: reduce dmg taken 6","Reduce 9","Reduce 12","Reduce 16","Reduce 20; 10% chance to ignore a hit entirely"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"clayback"},
  {id:"clayback",name:"Clayback",emoji:"🦏",type:"Earth",rarity:"common",description:"Mudboar hardened over time. Its hide deflects even bladed weapons.",
   stats:{hp:98,atk:48,def:71,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mud Tusk",upgrades:["10 dmg","13 dmg","16 dmg","20 dmg","Slows target 15% for 2s"]},
     special:{name:"Clay Armor",charge:8,upgrades:["DEF +35 for 6s; reduce next hit by 20","DEF +50; reduce 28","DEF +65; reduce 36","DEF +82; reduce 46","DEF +100; fully block next hit"]},
     unique:{name:"Earthen Shell",upgrades:["Passive: reduce dmg taken 10","Reduce 15","Reduce 20; thorns 8 dmg to attackers","Reduce 26; thorns 12 dmg","Reduce 32; thorns 18 dmg; shell regenerates 3 DEF/s up to +20 bonus DEF"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mudpaw",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"stonecrest"},
  {id:"stonecrest",name:"Stonehorn",emoji:"🐊",type:"Earth",rarity:"common",description:"A colossal stone crocodile. Its scales have the hardness of gemstone.",
   stats:{hp:139,atk:69,def:102,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stone Chomp",upgrades:["14 dmg + DEF -8% on target for 3s","18 dmg","23 dmg","30 dmg","Also reduces target SPD by 10%"]},
     special:{name:"Stone Fortress",charge:10,upgrades:["DEF +50 for 7s; immune to knockback","DEF +68","DEF +88","DEF +110","DEF +135; immune to all CC"]},
     unique:{name:"Diamond Scale",upgrades:["Passive: reduce dmg taken 18; immune to poison","Reduce 25","Reduce 32; reflect 10% of blocked dmg","Reduce 40; reflect 15%","Reduce 50; reflect 20%; poison immunity; Stonecrest heals 10 HP per reflected instance"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"clayback",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"quarryking"},
  {id:"quarryking",name:"Quarryhorn",emoji:"🦛",type:"Earth",rarity:"common",description:"The immovable final form. A walking quarry whose step reshapes the land.",
   stats:{hp:186,atk:92,def:137,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stone Chomp",upgrades:["14 dmg + DEF -8% on target for 3s","18 dmg","23 dmg","30 dmg","Also reduces target SPD 10%"]},
     special:{name:"Quarry Armor",charge:14,upgrades:["DEF +70 for 8s; reduce next 3 hits by 30","DEF +92; 4 hits","DEF +118; 5 hits","DEF +145; 6 hits","DEF +175; immune to next 3 hits entirely"]},
     unique:{name:"Unbreakable",upgrades:["Passive: reduce dmg taken 26; heal 6 HP/s","Reduce 35; heal 9 HP/s","Reduce 44; heal 12 HP/s; CC immune","Reduce 55; heal 16 HP/s; CC immune","Reduce 65; heal 22 HP/s; CC immune; revive once at 30% HP; death deals 200 dmg to all enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonecrest",shardsToAscend:18,ascensionsToEvolve:null},
  // Wind line 2
  {id:"puffwing",name:"Puffwing",emoji:"🐦",type:"Wind",rarity:"common",description:"A tiny puffin with wings that generate constant gusts. It hovers even when asleep.",
   stats:{hp:36,atk:37,def:20,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Wind Peck",upgrades:["9 dmg","12 dmg","16 dmg","21 dmg","Pushes target back slightly"]},
     special:{name:"Tailwind",charge:8,upgrades:["Self +30 SPD for 3s","+42 SPD","+56 SPD","+72 SPD","Also grants +10% Ability Speed"]},
     unique:{name:"Slipstream",upgrades:["Passive: nearby allies gain +12 SPD","Allies +18 SPD","Allies +24 SPD; Puffwing +10 SPD","Allies +30 SPD; Puffwing +15 SPD","Allies +40 SPD; Puffwing +22 SPD; moving fast grants 5% dodge"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"draftfin"},
  {id:"draftfin",name:"Pufftide",emoji:"🦅",type:"Wind",rarity:"common",description:"Puffwing matured into a sharp-winged hawk that dives at hurricane speeds.",
   stats:{hp:58,atk:61,def:34,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Wind Peck",upgrades:["9 dmg","12 dmg","16 dmg","21 dmg","Pushes target back"]},
     special:{name:"Dive Strike",charge:20,upgrades:["Dive; 48 dmg on impact","62 dmg","78 dmg","96 dmg","Leaves wind vortex at impact point for 2s"]},
     unique:{name:"Wind Cutter",upgrades:["Passive: wind attacks pierce 10% of enemy DEF","Pierce 15%","Pierce 20%","Pierce 26%","Pierce 32%; critical hits also knock target back"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"puffwing",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"cyclotail"},
  {id:"cyclotail",name:"Stormfin",emoji:"🦜",type:"Wind",rarity:"common",description:"Draftfin's feathers have become blades of compressed air. Its tail generates cyclones.",
   stats:{hp:80,atk:84,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Air Blade",upgrades:["14 dmg","18 dmg","23 dmg","30 dmg","Hits twice; second hit deals 60% dmg"]},
     special:{name:"Cyclone Tail",charge:10,upgrades:["Spin; 55 dmg to all nearby","70 dmg","88 dmg","108 dmg","Cyclone persists for 2s pulling enemies in"]},
     unique:{name:"Blade Feathers",upgrades:["Passive: each attack sends a wind blade for 12 bonus dmg","16 dmg","20 dmg","26 dmg","32 dmg; wind blades have 15% chance to crit for double"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"draftfin",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"stormbeak"},
  {id:"stormbeak",name:"Stormbeak",emoji:"🦉",type:"Wind",rarity:"common",description:"The final aerial predator. Stormbeak's wings span skies and its beak can shatter stone.",
   stats:{hp:107,atk:111,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Air Blade",upgrades:["14 dmg","18 dmg","23 dmg","30 dmg","Hits twice"]},
     special:{name:"Cyclone Tail",charge:10,upgrades:["Spin; 55 dmg to all nearby","70 dmg","88 dmg","108 dmg","Cyclone persists 2s pulling enemies in"]},
     unique:{name:"Storm Predator",upgrades:["Passive: wind attacks deal +18% dmg; crit chance +8%","20% dmg; +10% crit","22% dmg; +12% crit","26% dmg; +15% crit","30% dmg; +18% crit; crits unleash a wind burst hitting all nearby enemies for 40 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"cyclotail",shardsToAscend:18,ascensionsToEvolve:null},
  // Light line 1
  {id:"glowpup",name:"Jadebun",emoji:"🐰",type:"Light",rarity:"common",description:"A rabbit whose fur carries the cool green sheen of polished jade. It gathers moonlit herbs in its cheeks and refuses to explain why.",
   stats:{hp:43,atk:28,def:26,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"radiantkit"},
  {id:"radiantkit",name:"Pestlehare",emoji:"🐇",type:"Light",rarity:"common",description:"Jadebun has taken up a mortar and pestle twice its own height. Neighbors report that the pounding begins promptly at moonrise and does not stop.",
   stats:{hp:70,atk:46,def:44,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"glowpup",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"dawnbeast"},
  {id:"dawnbeast",name:"Elixhare",emoji:"🌙",type:"Light",rarity:"common",description:"Its mortar now yields a silver draught that knits wounds closed in seconds. Three separate alchemists' guilds have offered to buy the recipe. It has declined all three.",
   stats:{hp:100,atk:65,def:62,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"radiantkit",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"solarcrown"},
  {id:"solarcrown",name:"Lunarch",emoji:"🌕",type:"Light",rarity:"common",description:"The Jade Rabbit of legend, ascended to the moon to pound the elixir of immortality at Chang'e's side. It still comes back down for a gentle nuzzle.",
   stats:{hp:133,atk:87,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Herb Poultice",upgrades:["Heal 10 HP","Heal 12 HP","Heal 14 HP","Heal 17 HP","Heal 20 HP"]},
     special:{name:"Silver Draught",charge:18,upgrades:["Heal 24 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 29 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 35 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal","Heal 42 HP and shield them. If they're above 50% Health, they gain Attack Up. If they're below 50% Health, they briefly gain Immortal"]},
     unique:{name:"Pestle Tempo",upgrades:["When an ally within range is below 50% Health, gain 2% Haste and Speed","When an ally within range is below 50% Health, gain 4% Haste and Speed","When an ally within range is below 50% Health, gain 6% Haste and Speed","When an ally within range is below 50% Health, gain 8% Haste and Speed","When an ally within range is below 50% Health, gain 10% Haste and Speed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"dawnbeast",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 1
  {id:"shadowpup",name:"Duskling",emoji:"🐈‍⬛",type:"Dark",rarity:"common",description:"A small black cat that flickers in and out of shadow. Enjoys knocking things off shelves.",
   stats:{hp:45,atk:45,def:22,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shadow Slash",upgrades:["11 dmg","14 dmg","18 dmg","24 dmg","Reduces target DEF 10% for 2s"]},
     special:{name:"Fade",charge:16,upgrades:["Become untargetable 1.5s; +15 SPD after","Untargetable 2s; +20 SPD","Untargetable 2s; +28 SPD","Untargetable 2.5s; +36 SPD","Untargetable 3s; +45 SPD; emerge dealing 25 dmg to nearby foes"]},
     unique:{name:"Shadowstep",upgrades:["Passive: first attack each battle ignores all DEF","First 2 attacks","First 3 attacks","First 4 attacks","First 5 attacks; shadow attacks also silence target 0.5s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"gloomkit"},
  {id:"gloomkit",name:"Nightbat",emoji:"🦇",type:"Dark",rarity:"common",description:"Duskling evolved into a stealthy shadow bat. It strikes from the darkness and vanishes.",
   stats:{hp:71,atk:72,def:37,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shadow Slash",upgrades:["11 dmg","14 dmg","18 dmg","24 dmg","Reduces DEF 10% 2s"]},
     special:{name:"Dark Shroud",charge:14,upgrades:["Cloak self 2s; ATK +25%","Cloak 2.5s; +32%","Cloak 3s; +40%","Cloak 3s; +50%","Cloak 3.5s; +62%; emerge with area shadow burst 35 dmg"]},
     unique:{name:"Predator's Mark",upgrades:["Passive: marked targets take +10% dmg from Gloomkit","Marked +14%","Marked +18%","Marked +22%","Marked +28%; mark spreads to 1 nearby enemy on death of marked target"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowpup",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"nightstalker"},
  {id:"nightstalker",name:"Nightstalker",emoji:"🐺",type:"Dark",rarity:"common",description:"Nightbat grown into a shadowy wolf that hunts by instinct alone. It never misses.",
   stats:{hp:99,atk:102,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Night Fang",upgrades:["17 dmg; silence 10% chance 1s","22 dmg","28 dmg","36 dmg","20% silence 1.5s"]},
     special:{name:"Shadow Hunt",charge:14,upgrades:["Mark target; Nightstalker deals +20% dmg to marked","Mark; +28%","Mark; +36%","Mark; +45%","Mark; +55%; marked target also takes +15% dmg from all sources"]},
     unique:{name:"Apex Predator",upgrades:["Passive: kills grant +8% ATK for 5s (stacks 3x)","Kills grant +11%","Kills grant +14%","Kills grant +18%","Kills grant +22%; at 3 stacks next attack deals 200% dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"gloomkit",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"voidfang"},
  {id:"voidfang",name:"Voidfang",emoji:"🐉",type:"Dark",rarity:"common",description:"Nightstalker's final dark dragon form. It does not walk. It unexists from one place and reappears at another.",
   stats:{hp:133,atk:135,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Night Fang",upgrades:["17 dmg; silence 10%","22 dmg","28 dmg","36 dmg","20%; silence 1.5s"]},
     special:{name:"Void Tear",charge:20,upgrades:["Teleport to target; 70 dmg; silence 1.5s","88 dmg","108 dmg","132 dmg","Silence 2s; also strips 1 buff from target"]},
     unique:{name:"Void Sovereign",upgrades:["Passive: dark attacks bypass 15% of enemy DEF; kills grant full HP regen for 2s","Bypass 20%","Bypass 26%; regen 3s","Bypass 32%; regen 3s","Bypass 40%; regen 4s; dark attacks also silence for 0.5s; Voidfang is immune to silence"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"nightstalker",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 2
  {id:"murkwing",name:"Scrapcaw",emoji:"🐦",type:"Dark",rarity:"epic",description:"The lowest rung of a very organized murder. It carries messages, holds things, and is told almost nothing.",
   stats:{hp:58,atk:62,def:40,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gloom Peck",upgrades:["16 dmg","21 dmg","27 dmg","34 dmg","34 dmg and gain 1% Ability Charge"]},
     special:{name:"Nightcall",charge:12,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","78 dmg. Assisting allies deal 20% more damage"]},
     unique:{name:"Shadow Pact",upgrades:["Gain 5% Attack and 5% Haste for each other Dark ally.","Gain 5% Attack and 10% Haste for each other Dark ally.","Gain 5% Attack and 15% Haste for each other Dark ally.","Gain 5% Attack and 20% Haste for each other Dark ally.","Gain 5% Attack and 25% Haste for each other Dark ally."]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"darkpaw"},
  {id:"darkpaw",name:"Corvoid",emoji:"🐦‍⬛",type:"Dark",rarity:"epic",description:"Promoted for loyalty rather than talent. It gets to tell other crows what to do now, and is enormously pleased about this.",
   stats:{hp:88,atk:95,def:60,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gloom Peck",upgrades:["16 dmg","21 dmg","27 dmg","34 dmg","34 dmg and gain 1% Ability Charge"]},
     special:{name:"Nightcall",charge:12,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","78 dmg. Assisting allies deal 20% more damage"]},
     unique:{name:"Shadow Pact",upgrades:["Gain 5% Attack and 5% Haste for each other Dark ally.","Gain 5% Attack and 10% Haste for each other Dark ally.","Gain 5% Attack and 15% Haste for each other Dark ally.","Gain 5% Attack and 20% Haste for each other Dark ally.","Gain 5% Attack and 25% Haste for each other Dark ally."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"murkwing",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"abysslord"},
  {id:"abysslord",name:"Murderking",emoji:"🦅",type:"Dark",rarity:"epic",description:"Every crow within three counties answers its call. It rarely needs to raise a claw itself, though it is unnervingly good at it when it does.",
   stats:{hp:128,atk:138,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gloom Peck",upgrades:["16 dmg","21 dmg","27 dmg","34 dmg","34 dmg and gain 1% Ability Charge"]},
     special:{name:"Nightcall",charge:12,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","78 dmg. Assisting allies deal 20% more damage"]},
     unique:{name:"Shadow Pact",upgrades:["Gain 5% Attack and 5% Haste for each other Dark ally.","Gain 5% Attack and 10% Haste for each other Dark ally.","Gain 5% Attack and 15% Haste for each other Dark ally.","Gain 5% Attack and 20% Haste for each other Dark ally.","Gain 5% Attack and 25% Haste for each other Dark ally."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"darkpaw",shardsToAscend:20,ascensionsToEvolve:null},
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
  {id:"frostfang",name:"Frostfang",emoji:"🐺",type:"Water",rarity:"epic",description:"A cold-blooded predator whose howl drops the temperature in a wide area.",
   stats:{hp:66,atk:59,def:45,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["12 dmg + 15% slow","16 dmg + 20% slow","21 dmg + 25% slow","27 dmg + 30% slow","Freeze target solid for 1.5s on 5th hit"]},
     special:{name:"Blizzard Howl",charge:8,upgrades:["Chills enemies in radius 3","Chills radius 4","Chills radius 5","Chills radius 6","Fully freezes all chilled enemies in range"]},
     unique:{name:"Frozen Aura",upgrades:["Passive: nearby enemies are slowed by 8%","Nearby enemies slowed by 14%","Nearby enemies slowed by 20%; their attack speed is also reduced 10%","Nearby enemies slowed by 28%; attack speed reduced 16%","Nearby enemies slowed by 35%; attack speed reduced 22%; every 8s they are briefly frozen for 0.5s"]}
   },role:"Support",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"glacierwulf"},
  {id:"glacierwulf",name:"Glacierwulf",emoji:"❄️",type:"Water",rarity:"epic",description:"Frostfang reborn in permafrost. Its breath alone freezes the air.",
   stats:{hp:106,atk:94,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["12 dmg + 15% slow","16 dmg + 20% slow","21 dmg + 25% slow","27 dmg + 30% slow","Freeze target solid for 1.5s on 5th hit"]},
     special:{name:"Blizzard Howl",charge:8,upgrades:["Chills enemies in radius 3","Chills radius 4","Chills radius 5","Chills radius 6","Fully freezes all chilled enemies in range"]},
     unique:{name:"Permafrost Aura",upgrades:["Passive: nearby enemies are slowed 25% and take +8% ice damage","Nearby enemies slowed 32%; +12% ice damage taken","Nearby enemies slowed 40%; +16% ice damage taken; every 6s they are frozen for 1s","Nearby enemies slowed 48%; +20% ice damage; frozen for 1.5s every 5s","Nearby enemies slowed 55%; +25% ice damage; frozen for 2s every 4s; being unfrozen deals 20 shatter damage"]}
   },role:"Support",attackType:"Melee",evolutionOf:"frostfang",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"frostwyvern"},
  {id:"voltail",name:"Sparkshell",emoji:"🐢",type:"Electric",rarity:"common",description:"A tortoise hatchling whose shell holds a static charge it did not ask for. Anything that pokes it gets a small, indignant shock and learns nothing.",
   stats:{hp:70,atk:34,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"stormclaw"},
  {id:"stormclaw",name:"Capacitort",emoji:"🐢",type:"Electric",rarity:"common",description:"The shell has organised itself into proper cells. It has worked out that being hit is a way of eating, and now stands in front of things on purpose.",
   stats:{hp:111,atk:54,def:93,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"voltail",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"arcstorm"},
  {id:"tideclaw",name:"Tideclaw",emoji:"🦞",type:"Water",rarity:"epic",description:"Commands the tides with its claws. Extremely grumpy before breakfast.",
   stats:{hp:70,atk:55,def:62,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Slash",upgrades:["18 dmg","24 dmg","31 dmg","40 dmg","Reduces target ATK by 10% for 3s"]},
     special:{name:"Tidal Pull",charge:14,upgrades:["Pull 1 foe","Pull 1 foe, 20 dmg","Pull 1 foe, 28 dmg","Pull + stun 0.5s","Pull all nearby foes to center simultaneously"]},
     unique:{name:"Deep Pressure",upgrades:["Passive: nearby enemies have ATK reduced by 8%","Nearby enemies have ATK reduced by 14%","Nearby enemies have ATK and SPD reduced by 14%","Nearby enemies have ATK and SPD reduced by 20%","Nearby enemies have ATK and SPD reduced by 28%; they also deal 10% less critical damage"]}
   },role:"Support",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"tidalcrusher"},
  // Water line 1 final
  {id:"frostwyvern",name:"Frostwyvern",emoji:"🐲",type:"Water",rarity:"epic",description:"Glacierwulf's draconic final form. Frost crystallizes the air around it.",
   stats:{hp:130,atk:115,def:90,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["16 dmg+20% slow","21 dmg","27 dmg","34 dmg","Freeze 1s on 5th hit"]},
     special:{name:"Blizzard Howl",charge:8,upgrades:["Chill radius 3","Chill radius 4","Chill radius 5","Chill radius 6","Freeze all chilled in range"]},
     unique:{name:"Glacial Sovereign",upgrades:["Passive: slow nearby enemies 40%; +12% ice dmg taken","Slow 48%; +16%","Slow 56%; +20%; freeze 1s every 5s","Slow 65%; +25%","Slow 75%; +30%; freeze 2s every 4s; unfreezing deals 35 shatter dmg"]}
   },role:"Support",attackType:"Melee",evolutionOf:"glacierwulf",shardsToAscend:22,ascensionsToEvolve:null},
  // Water line 2 mid+final
  {id:"tidalcrusher",name:"Tidalcrusher",emoji:"🦀",type:"Water",rarity:"epic",description:"Tideclaw evolved into a massive armored crab. Its pincers bend steel.",
   stats:{hp:108,atk:82,def:95,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crush Claw",upgrades:["20 dmg+DEF-8% 3s","26 dmg","33 dmg","42 dmg","Also slow 15% 3s"]},
     special:{name:"Tidal Grip",charge:8,upgrades:["Pull 1 foe+30 dmg","Pull+38 dmg","Pull+stun 1s","Pull all nearby","Pull all+stun 1s"]},
     unique:{name:"Iron Shell",upgrades:["Passive: -15 all dmg taken","Reduce 22","Reduce 28; thorns 10 dmg","Reduce 36; thorns 15 dmg","Reduce 44; thorns 22 dmg; 12% chance negate a hit"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tideclaw",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"abyssking"},
  {id:"abyssking",name:"Abyssking",emoji:"🦀",type:"Water",rarity:"epic",description:"The apex deep-sea tyrant. Its shell is harder than any known metal.",
   stats:{hp:145,atk:110,def:130,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crush Claw",upgrades:["20 dmg+DEF-8%","26 dmg","33 dmg","42 dmg","Also slow 15%"]},
     special:{name:"Abyssal Grip",charge:22,upgrades:["Pull all+40 dmg","Pull all+52 dmg","Pull all+stun 1.5s","Pull all+stun 2s","Pull all+silence 2s+strip 1 buff"]},
     unique:{name:"Abyss Fortress",upgrades:["Passive: -22 all dmg; allies behind take -10%","-30 dmg; -15%","-38 dmg; -20%; thorns 15 dmg","-48 dmg; -26%; thorns 22 dmg","-58 dmg; -32%; thorns 30 dmg; negate hits 15%"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tidalcrusher",shardsToAscend:22,ascensionsToEvolve:null},
  // Water line 3
  {id:"seadrake",name:"Seadrake",emoji:"🐍",type:"Water",rarity:"common",description:"A sleek oceanic serpent that moves like a current and strikes like a wave.",
   stats:{hp:69,atk:59,def:41,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+10% slow","16 dmg","20 dmg","26 dmg","Poison 5 dmg/s 2s"]},
     special:{name:"Riptide",charge:22,upgrades:["Dash; leave water trail 2s","Stronger trail 3s","Trail slows 25%","Trail slows 35%","Trail also deals 15 dmg/s"]},
     unique:{name:"Slick Scales",upgrades:["Passive: 12% dodge chance","15%","18%; counter 15 dmg on dodge","22%; counter 22 dmg","26%; counter 30 dmg; dodges grant +10 SPD 2s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"deepdrake"},
  {id:"deepdrake",name:"Bathydrake",emoji:"🐍",type:"Water",rarity:"common",description:"Seadrake fully grown. It coils around ships and drags them to the seafloor.",
   stats:{hp:105,atk:90,def:64,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+slow","16 dmg","20 dmg","26 dmg","Poison 2s"]},
     special:{name:"Coil Crush",charge:12,upgrades:["Constrict 1 foe; 45 dmg+DEF-15% 4s","55 dmg","68 dmg","84 dmg","Constrict stuns 1s also"]},
     unique:{name:"Deep Coils",upgrades:["Passive: constrict effects last +1s","Constricted foes take +15% dmg","Constricted take +22% dmg","Constricted take +30% dmg","Constricted take +38% dmg; Deepdrake heals 15 HP/s while constricting"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"seadrake",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"abyssdrake"},
  {id:"abyssdrake",name:"Abyssaur",emoji:"🐉",type:"Water",rarity:"common",description:"An ancient leviathan. Every ocean myth traces back to this creature.",
   stats:{hp:144,atk:123,def:87,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+slow","16 dmg","20 dmg","26 dmg","Poison 2s"]},
     special:{name:"Leviathan Coil",charge:10,upgrades:["Constrict all nearby; 60 dmg","76 dmg","95 dmg","118 dmg","Constrict silences+strips 1 buff"]},
     unique:{name:"Leviathan Body",upgrades:["Passive: 18% dodge; immune to constrict","22% dodge","26% dodge; counter 35 dmg","30% dodge; counter 50 dmg","35% dodge; counter 65 dmg; immune to all movement-impairing effects"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"deepdrake",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"leviadon"},
  {id:"leviadon",name:"Leviadon",emoji:"🐉",type:"Water",rarity:"common",description:"Abyssaur grown past mythology. Cartographers no longer draw sea monsters on maps; they draw where Leviadon was last sighted.",
   stats:{hp:187,atk:160,def:113,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Abyss Fang",upgrades:["16 dmg+slow","20 dmg","26 dmg","33 dmg","Poison 3s+slow"]},
     special:{name:"Maelstrom Coil",charge:10,upgrades:["Constrict all nearby; 78 dmg","95 dmg","118 dmg","145 dmg","Constrict silences 2s+strips 2 buffs"]},
     unique:{name:"Deep Sovereign",upgrades:["Passive: 24% dodge; immune to constrict; counter 45 dmg","28% dodge; counter 60","32% dodge; counter 78","38% dodge; counter 98","44% dodge; counter 122; immune to all movement-impairing effects; attackers are slowed 25%"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"abyssdrake",shardsToAscend:28,ascensionsToEvolve:null},
  // Fire line 1
  {id:"lavagator",name:"Lavagator",emoji:"🐊",type:"Fire",rarity:"epic",description:"A lava-soaked crocodile that lurks in molten rivers. Approach only if you are also on fire.",
   stats:{hp:79,atk:55,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn 3 dmg/s 2s","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Magma Slam",charge:20,upgrades:["50 dmg; lava pool 2s","62 dmg","76 dmg","94 dmg","Pool lasts 4s; 12 dmg/s"]},
     unique:{name:"Lava Skin",upgrades:["Passive: attackers take 12 fire dmg","Attackers take 18 dmg","Attackers take 25 dmg+burn 2s","Attackers take 32 dmg+burn 3s","Attackers take 42 dmg+burn 3s; Lavagator heals 5 HP per burn tick"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"magmadrake"},
  {id:"magmadrake",name:"Magmadrake",emoji:"🐊",type:"Fire",rarity:"epic",description:"Lavagator evolved into a draconic fire lizard. Geysers erupt in its footprints.",
   stats:{hp:119,atk:82,def:87,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Geyser Strike",charge:18,upgrades:["70 dmg; knock up 1s","88 dmg","108 dmg","132 dmg","Geyser persists 2s; 20 dmg/s"]},
     unique:{name:"Magma Core",upgrades:["Passive: -12 all dmg; attackers burn 2s","Reduce 18; burn 3s","Reduce 24; burn 3s","Reduce 32; burn 4s","Reduce 40; burn 4s; immune to fire dmg"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"lavagator",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"cinderdrake"},
  {id:"cinderdrake",name:"Pyrotegu",emoji:"🐉",type:"Fire",rarity:"epic",description:"Magmadrake's final draconic form. A true fire dragon whose breath melts mountains.",
   stats:{hp:163,atk:111,def:118,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Volcano Breath",charge:20,upgrades:["90 dmg cone+burn 4s","112 dmg","138 dmg","168 dmg","Ignite ground 5s; 20 dmg/s"]},
     unique:{name:"Dragon Sovereignty",upgrades:["Passive: fire dmg dealt +22%; burn ignores 15% DEF","Fire +28%; ignore 20%","Fire +34%; ignore 26%","Fire +42%; ignore 32%","Fire +50%; ignore 40%; Cinderdrake revives once at 30% HP wreathed in flame dealing 80 dmg to all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"magmadrake",shardsToAscend:22,ascensionsToEvolve:null},
  // Fire line 2
  {id:"blazemoth",name:"Blazemoth",emoji:"🦋",type:"Fire",rarity:"common",description:"A moth irresistibly drawn to flame, now made entirely of it. Navigation is not its strong suit.",
   stats:{hp:58,atk:59,def:32,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; 20% burn 2s","14 dmg","18 dmg","24 dmg","Burn spreads to 1 nearby foe"]},
     special:{name:"Fire Dance",charge:10,upgrades:["+25% dodge+ATK 3s","+32%","+40%","+50%","Also gain +20 SPD 3s"]},
     unique:{name:"Flame Wings",upgrades:["Passive: dodge = counter 15 fire dmg","Counter 22 dmg","Counter 30 dmg+burn","Counter 38 dmg+burn 2s","Counter 48 dmg+burn 3s; burn spreads to 1 nearby"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"scorchwing"},
  {id:"scorchwing",name:"Scorchwing",emoji:"🦋",type:"Fire",rarity:"common",description:"Blazemoth whose wings have become sheets of living flame. Entire forests ignite in its wake.",
   stats:{hp:87,atk:90,def:50,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; burn 2s","14 dmg","18 dmg","24 dmg","Burn spreads"]},
     special:{name:"Wildfire Dance",charge:14,upgrades:["Evade+ATK+SPD+35% 3s","+45%","+55%","+68%","Leave fire trail 3s; 15 dmg/s"]},
     unique:{name:"Inferno Scales",upgrades:["Passive: 18% dodge; fire dmg +15%","22% dodge; +20%","26% dodge; +26%","30% dodge; +32%","35% dodge; +40%; at 5 dodges unleash ring 80 fire dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"blazemoth",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"infernosprite"},
  {id:"infernosprite",name:"Infernosprite",emoji:"🦋",type:"Fire",rarity:"common",description:"Scorchwing transcended into pure flame. It no longer has a physical form — only fire.",
   stats:{hp:118,atk:122,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; burn","14 dmg","18 dmg","24 dmg","Burn spreads"]},
     special:{name:"Phoenix Dance",charge:12,upgrades:["Full evade 2s; emerge dealing 60 dmg","75 dmg","92 dmg","112 dmg","Emerge explosion 80 dmg hits all; burn all 4s"]},
     unique:{name:"Pure Flame",upgrades:["Passive: 25% dodge; fire attacks bypass 15% DEF","28% dodge; bypass 20%","32% dodge; bypass 26%","36% dodge; bypass 32%","40% dodge; bypass 40%; Infernosprite revives once as a fire explosion dealing 120 dmg to all"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"scorchwing",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"novasprite"},
  {id:"novasprite",name:"Novasprite",emoji:"☄️",type:"Fire",rarity:"common",description:"Infernosprite condensed into a single point of stellar fire. Moth enthusiasts insist it still counts.",
   stats:{hp:153,atk:159,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Nova Dust",upgrades:["14 dmg; burn","18 dmg","23 dmg","30 dmg","Burn spreads to 2 nearby foes"]},
     special:{name:"Supernova Dance",charge:12,upgrades:["Full evade 2s; emerge dealing 78 dmg","95 dmg","118 dmg","145 dmg","Emerge explosion 105 dmg hits all; burn all 5s"]},
     unique:{name:"Stellar Flame",upgrades:["Passive: 30% dodge; fire attacks bypass 22% DEF","34% dodge; bypass 28%","38% dodge; bypass 35%","44% dodge; bypass 44%","50% dodge; bypass 55%; Novasprite revives once as a supernova dealing 160 dmg to all"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"infernosprite",shardsToAscend:28,ascensionsToEvolve:null},
  // Fire line 3
  {id:"emberscorp",name:"Emberscorp",emoji:"🦂",type:"Fire",rarity:"epic",description:"A scorpion whose tail-stinger burns white-hot. It hunts by heat signature.",
   stats:{hp:60,atk:65,def:52,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn 4 dmg/s 2s","15 dmg","19 dmg","25 dmg","Burn 6 dmg/s 3s; -10% DEF"]},
     special:{name:"Scorch Pincers",charge:8,upgrades:["Grab+50 dmg; burn 3s","62 dmg","76 dmg","94 dmg","Grab+silence 1.5s also"]},
     unique:{name:"Venom Flame",upgrades:["Passive: burn also poisons 4 dmg/s 2s","Poison 5 dmg/s 2s","Poison 6 dmg/s 3s","Poison 8 dmg/s 3s","Poison 10 dmg/s 4s; poisoned+burned foes take +20% all dmg"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"pyrescorp"},
  {id:"pyrescorp",name:"Pyrescorp",emoji:"🦂",type:"Fire",rarity:"epic",description:"Emberscorp doubled in size. Its pincers can melt through solid rock.",
   stats:{hp:90,atk:98,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn","15 dmg","19 dmg","25 dmg","Burn+DEF-10%"]},
     special:{name:"Magma Crush",charge:12,upgrades:["Grab+70 dmg; burn+slow 4s","88 dmg","108 dmg","132 dmg","Also stuns 1s; strips 1 buff"]},
     unique:{name:"Searing Venom",upgrades:["Passive: burn+poison combo deals +15% dmg","20%","26%","32%","40%; Pyrescorp gains +1% ATK per active burn/poison stack"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberscorp",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"magmascorp"},
  {id:"magmascorp",name:"Magmascorp",emoji:"🦂",type:"Fire",rarity:"epic",description:"The molten final form. A scorpion whose body is a living volcano and whose sting can crack the earth.",
   stats:{hp:122,atk:134,def:106,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn","15 dmg","19 dmg","25 dmg","Burn+DEF-10%"]},
     special:{name:"Volcano Crush",charge:18,upgrades:["Grab all nearby+85 dmg+eruption","105 dmg","128 dmg","156 dmg","Eruption stuns 1.5s; lava pool 4s"]},
     unique:{name:"Volcanic Body",upgrades:["Passive: all burn/poison effects +30% stronger; attackers burned 3s","Burn+poison +40%","Burn+poison +50%; attackers poisoned also","Burn+poison +62%","Burn+poison +75%; attackers burned+poisoned; Magmascorp immune to both"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"pyrescorp",shardsToAscend:22,ascensionsToEvolve:null},

  // Nature line 2
  {id:"mosskrab",name:"Frillet",emoji:"🦕",type:"Nature",rarity:"common",description:"A triceratops hatchling whose frill is already wider than the rest of it. It has appointed itself the personal bodyguard of everyone it has ever met.",
   stats:{hp:58,atk:28,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"jadekrab"},
  {id:"jadekrab",name:"Bulwarden",emoji:"🦏",type:"Nature",rarity:"common",description:"The frill has thickened into proper plate. It stands in front of things now, professionally, and takes the question of who asked it to very personally.",
   stats:{hp:94,atk:46,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mosskrab",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"crystalshell"},
  {id:"crystalshell",name:"Aegiceras",emoji:"🦏",type:"Nature",rarity:"common",description:"Its frill is a tower shield with a heartbeat. Allies have learned to simply stand behind it and wait for the noise to stop.",
   stats:{hp:133,atk:65,def:109,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"jadekrab",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"rampartops"},
  {id:"rampartops",name:"Rampartops",emoji:"🏔️",type:"Nature",rarity:"common",description:"A fortress that grazes. It has been the deciding factor in two sieges, neither of which it noticed.",
   stats:{hp:175,atk:85,def:143,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Guard Horn",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Aegis Frill",charge:16,upgrades:["Gain a Shield equal to 25% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 30% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 35% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 2 stacks of Protect","Gain a Shield equal to 40% of this creature's Defense and all Beside allies gain 3 stacks of Protect"]},
     unique:{name:"Bulwark Body",upgrades:["Whenever this creature is damaged by an attack, it has a 50% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 60% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 70% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has an 80% chance to counter, dealing 80% less damage","Whenever this creature is damaged by an attack, it has a 100% chance to counter, dealing 80% less damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"crystalshell",shardsToAscend:18,ascensionsToEvolve:null},
  // Nature line 3
  {id:"thornturtle",name:"Thornturtle",emoji:"🐢",type:"Nature",rarity:"epic",description:"A turtle whose shell has grown a thicket of razor thorns. Even looking at it hurts.",
   stats:{hp:81,atk:41,def:62,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn 8 dmg return","13 dmg","16 dmg","21 dmg","Thorn dmg return 15"]},
     special:{name:"Shell Curl",charge:16,upgrades:["Retract; -40% dmg taken 3s+thorns 20 dmg","Reduce 55%","Reduce 70%","Reduce 80%","Immune to dmg 2s; emerge explodes 50 dmg"]},
     unique:{name:"Spiked Shell",upgrades:["Passive: all attackers take 15 thorn dmg","Attackers take 22 dmg","22 dmg+poison 3 dmg/s 2s","30 dmg+poison","40 dmg+poison 5 dmg/s 3s; 15% chance negate hit and return 50% of it"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"jadeshell"},
  {id:"jadeshell",name:"Jadeshell",emoji:"🐢",type:"Nature",rarity:"epic",description:"Thornturtle grown to the size of a small island. Entire ecosystems have formed on its back.",
   stats:{hp:122,atk:61,def:93,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn return","13 dmg","16 dmg","21 dmg","Thorn return 15"]},
     special:{name:"Island Shell",charge:18,upgrades:["Allies stand on shell; all take -30% dmg 4s","-40%","-50%","-60%","-70%; allies on shell also gain +15% ATK"]},
     unique:{name:"Titan Thorns",upgrades:["Passive: thorn dmg +30%; heal 8 HP/s","Thorn +40%; 11 HP/s","Thorn +50%; 14 HP/s","Thorn +62%; 18 HP/s","Thorn +75%; 24 HP/s; at 10 thorn triggers in a fight, release a 100 dmg thorn explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"thornturtle",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"ancientshell"},
  {id:"ancientshell",name:"Shellith",emoji:"🐢",type:"Nature",rarity:"epic",description:"An ageless colossus. Ancientshell has outlived civilizations. Mountains erode before its shell does.",
   stats:{hp:166,atk:83,def:126,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn return","13 dmg","16 dmg","21 dmg","Thorn return 15"]},
     special:{name:"Ancient Shell",charge:8,upgrades:["All allies invincible 1s; then shield 100 HP","Invincible 1.5s","Invincible 2s","Invincible 2.5s","Invincible 3s; shield 150 HP; remove all debuffs"]},
     unique:{name:"Primordial Shell",upgrades:["Passive: -25 all dmg; thorns 20 dmg; allies -12% dmg","Reduce 34; thorns 28; allies -16%","Reduce 43; thorns 36; allies -20%","Reduce 54; thorns 46; allies -25%","Reduce 65; thorns 56; allies -30%; revive once; death triggers massive thorn explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"jadeshell",shardsToAscend:22,ascensionsToEvolve:null},
  // Earth line 1
  {id:"ironmole",name:"Cragling",emoji:"🐵",type:"Earth",rarity:"common",description:"Hatched from a rock on a mountaintop, fully formed and immediately in trouble. It has already been asked to leave three temples.",
   stats:{hp:46,atk:48,def:26,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"steelmole"},
  {id:"steelmole",name:"Cragfist",emoji:"🐒",type:"Earth",rarity:"common",description:"It has taken up an iron staff twice its size and refuses to be told this is impractical. So far it has been right.",
   stats:{hp:72,atk:76,def:41,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"ironmole",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"titanmole"},
  {id:"titanmole",name:"Cloudvault",emoji:"🦧",type:"Earth",rarity:"common",description:"Learned to somersault across an entire province in a single bound. Mostly uses this to outrun consequences.",
   stats:{hp:100,atk:105,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"steelmole",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"skysage"},
  {id:"skysage",name:"Skysage",emoji:"🦍",type:"Earth",rarity:"common",description:"It has awarded itself a title, a throne, and a rank equal to heaven. Nobody has yet found a convincing way to take any of them back.",
   stats:{hp:128,atk:134,def:76,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Staff Strike",upgrades:["20 dmg and gain .5% Ability Charge","20 dmg and gain 1% Ability Charge","20 dmg and gain 1.5% Ability Charge","20 dmg and gain 2% Ability Charge","20 dmg and gain 2.5% Ability Charge"]},
     special:{name:"Ruyi Reach",charge:10,upgrades:["30 dmg","38 dmg","48 dmg","60 dmg","60 dmg. Momentarily stun all enemies hit"]},
     unique:{name:"Seventy-Two Forms",upgrades:["Dodge every 10th instance of damage.","Dodge every 9th instance of damage.","Dodge every 8th instance of damage.","Dodge every 7th instance of damage.","Dodge every 6th instance of damage."]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"titanmole",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 3
  {id:"quakebeetle",name:"Quakebeetle",emoji:"🪲",type:"Earth",rarity:"epic",description:"A heavy-shelled beetle whose footsteps register on seismometers. It is unaware of this.",
   stats:{hp:68,atk:42,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shell Slam",upgrades:["11 dmg; stagger 0.5s","14 dmg","18 dmg","24 dmg","Stagger 1s+DEF-8%"]},
     special:{name:"Tremor Charge",charge:14,upgrades:["Charge+55 dmg+knockback","68 dmg","84 dmg","102 dmg","Shockwave hits all in path"]},
     unique:{name:"Seismic Body",upgrades:["Passive: every move causes tremor; nearby foes -10% ATK","Tremor -14% ATK","Tremor -18% ATK+SPD","Tremor -22% ATK+SPD","Tremor -28% ATK+SPD+Ability Speed; tremor triggers every 3s automatically"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"stonebeetle"},
  {id:"stonebeetle",name:"Lithbeetle",emoji:"🪲",type:"Earth",rarity:"epic",description:"Quakebeetle's shell has hardened to stone. It is functionally a boulder with legs.",
   stats:{hp:102,atk:62,def:118,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Stone Slam",upgrades:["14 dmg; DEF-10% 3s","18 dmg","23 dmg","30 dmg","DEF-15%+stun 0.5s"]},
     special:{name:"Boulder Charge",charge:22,upgrades:["Charge; 80 dmg; stun 1s","96 dmg","116 dmg","140 dmg","Stun 1.5s; leave crater 3s"]},
     unique:{name:"Living Stone",upgrades:["Passive: -20 all dmg; quake aura -15% all enemy stats","Reduce 28; -20%","Reduce 36; -26%","Reduce 46; -32%","Reduce 56; -40%; Stonebeetle immune to all ground effects"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quakebeetle",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"gemscrab"},
  {id:"gemscrab",name:"Gemscrab",emoji:"🪲",type:"Earth",rarity:"epic",description:"Stonebeetle's shell has crystallized into pure gemstone. It diffracts light and cannot be cracked.",
   stats:{hp:138,atk:84,def:160,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gem Slam",upgrades:["18 dmg; DEF-15% 4s","23 dmg","30 dmg","38 dmg","DEF-20%+stun 1s+strip 1 buff"]},
     special:{name:"Gem Fortress",charge:22,upgrades:["DEF+100 6s; thorns 25 dmg; quake aura","DEF+130","DEF+165","DEF+200","DEF+240; reflect 25% all dmg; aura stuns every 3s 0.5s"]},
     unique:{name:"Gemstone Core",upgrades:["Passive: -28 all dmg; reflect 20% blocked; thorns 22 dmg","-38 dmg; reflect 25%; thorns 30","-48 dmg; reflect 30%; thorns 40","-60 dmg; reflect 36%; thorns 52","-72 dmg; reflect 44%; thorns 65; CC immune; revive once; death shatters releasing 150 dmg gem explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonebeetle",shardsToAscend:22,ascensionsToEvolve:null},
  // Wind line 1
  {id:"skyeel",name:"Skyeel",emoji:"🐉",type:"Wind",rarity:"common",description:"A long serpentine eel that drifts through the upper atmosphere. Surprisingly fast for something that has no legs.",
   stats:{hp:52,atk:55,def:31,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20% 2s"]},
     special:{name:"Sky Coil",charge:20,upgrades:["Coil foe+wind prison; 40 dmg+SPD-25% 4s","50 dmg","62 dmg","76 dmg","Also silence 1.5s"]},
     unique:{name:"Aerial Body",upgrades:["Passive: immune to ground effects; +15% dodge","Immune; +20% dodge","Immune; +25% dodge; wind attacks +12% dmg","Immune; +30% dodge; +16% dmg","Immune; +35% dodge; +20% dmg; dodges release wind burst 30 dmg nearby"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"galeeel"},
  {id:"galeeel",name:"Vorteel",emoji:"🐉",type:"Wind",rarity:"common",description:"Skyeel that has absorbed a gale. It moves faster than the eye can track.",
   stats:{hp:78,atk:84,def:50,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20%"]},
     special:{name:"Cyclone Coil",charge:8,upgrades:["Coil all nearby+60 dmg+SPD-35% 5s","74 dmg","90 dmg","110 dmg","Also stun 1s+silence 2s"]},
     unique:{name:"Storm Body",upgrades:["Passive: immune to ground; +25% dodge; wind dmg +15%","Dodge +30%; +20%","Dodge +35%; +26%","Dodge +40%; +32%","Dodge +46%; +40%; dodges trigger free Gale Fang"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"skyeel",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"stormeel"},
  {id:"stormeel",name:"Stormeel",emoji:"🐉",type:"Wind",rarity:"common",description:"A storm given serpent form. Stormeel's passage reshapes cloud formations permanently.",
   stats:{hp:107,atk:114,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20%"]},
     special:{name:"Tempest Coil",charge:18,upgrades:["Coil all+80 dmg+SPD-50%+silence 2s","96 dmg","116 dmg","140 dmg","Also strip all buffs+stun 1.5s"]},
     unique:{name:"Living Storm",upgrades:["Passive: immune to ground/wind; +36% dodge; wind dmg +22%","Dodge +42%; +28%","Dodge +48%; +34%","Dodge +55%; +42%","Dodge +62%; +50%; Stormeel becomes invisible at max speed; first hit per second is always a crit"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"galeeel",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"hurricaneel"},
  {id:"hurricaneel",name:"Hurricaneel",emoji:"🌀",type:"Wind",rarity:"common",description:"Stormeel promoted to a named weather system. Meteorologists track it; it does not track back.",
   stats:{hp:138,atk:148,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Cyclone Fang",upgrades:["15 dmg+push","19 dmg","25 dmg","32 dmg","Push+slow 30%"]},
     special:{name:"Hurricane Coil",charge:18,upgrades:["Coil all+100 dmg+SPD-55%+silence 2s","120 dmg","145 dmg","175 dmg","Also strip all buffs+stun 2s"]},
     unique:{name:"Eye of the Storm",upgrades:["Passive: immune to ground/wind; +42% dodge; wind dmg +30%","Dodge +48%; +38%","Dodge +55%; +46%","Dodge +62%; +56%","Dodge +70%; +68%; Hurricaneel is invisible at max speed; first hit per second is always a crit"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"stormeel",shardsToAscend:28,ascensionsToEvolve:null},
  // Electric stage 3
  {id:"arcstorm",name:"Dynashell",emoji:"🔋",type:"Electric",rarity:"common",description:"Its shell reads as industrial equipment on every instrument pointed at it. Two survey teams have tried to file it as infrastructure.",
   stats:{hp:143,atk:70,def:119,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"stormclaw",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"ionarch"},
  {id:"ionarch",name:"Accumulith",emoji:"⚡",type:"Electric",rarity:"common",description:"A tortoise carrying a power station. It discharges once, politely, and the field is quiet afterwards.",
   stats:{hp:186,atk:91,def:156,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Static Zap",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg. For each 10 Charge on this creature, this attack Chains to 1 additional enemy"]},
     special:{name:"Discharge",charge:16,upgrades:["Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +5% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +10% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -5% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste","Remove 50% of this creature's current Charge and gain an Aura. Allies within it gain Speed Up and +15% Haste; enemies within it are inflicted with Speed Down and -15% Haste. Aura size +1 for each 10 Charge consumed"]},
     unique:{name:"Battery Shell",upgrades:["Gain 1 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 2 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 0.5% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge","Gain 3 Charge (max 60) whenever this creature gains a buff or receives damage. Gain 1% Attack and Defense for each stack of Charge. At max Charge, this creature gains Haste Up"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"arcstorm",shardsToAscend:18,ascensionsToEvolve:null},
  // Electric line 2
  {id:"zapfrog",name:"Zapfrog",emoji:"🐸",type:"Electric",rarity:"common",description:"A neon frog whose skin conducts lethal voltage. Its croak causes nearby electronics to malfunction.",
   stats:{hp:55,atk:58,def:34,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+15% slow 2s","15 dmg","19 dmg","25 dmg","Shock 8 dmg/s 2s also"]},
     special:{name:"Electric Leap",charge:14,upgrades:["Leap to foe; 50 dmg+shock 3s","62 dmg","76 dmg","94 dmg","Land creates electric zone 2s"]},
     unique:{name:"Wet Skin",upgrades:["Passive: water-type attacks on Zapfrog empower next electric attack +50%","Empower +70%","Empower +90%","Empower +120%","Empower +150%; water/electric combo always crits; crits chain to 2 extra foes"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"voltfrog"},
  {id:"voltfrog",name:"Voltfrog",emoji:"🐸",type:"Electric",rarity:"common",description:"Zapfrog grown. Its croak is now a thunderclap. Meteorologists have blamed it for freak storms.",
   stats:{hp:84,atk:89,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+slow","15 dmg","19 dmg","25 dmg","Shock 2s also"]},
     special:{name:"Thunder Leap",charge:16,upgrades:["Leap; 72 dmg+stun 1s+shockwave 40 dmg","88 dmg","108 dmg","132 dmg","Shockwave hits all; stun 1.5s; leave electric lake 3s"]},
     unique:{name:"Electric Mucus",upgrades:["Passive: any melee attacker takes 20 shock dmg+slow 15% 2s","Shock 28+slow 20%","Shock 36+slow 25%","Shock 46+slow 30%","Shock 58+slow 38%+stun 0.5s; Voltfrog immune to shock/paralysis"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"zapfrog",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"stormtoad"},
  {id:"stormtoad",name:"Fulgutoad",emoji:"🐸",type:"Electric",rarity:"common",description:"Voltfrog's ultimate form. A colossal electric toad that literally rains lightning from its body.",
   stats:{hp:113,atk:120,def:71,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+slow","15 dmg","19 dmg","25 dmg","Shock 2s also"]},
     special:{name:"Storm Leap",charge:22,upgrades:["Mega leap; 95 dmg+stun 1.5s; shockwave 70 dmg all","115 dmg","140 dmg","168 dmg","Stun 2s; shockwave chains 3 foes; electric lake 4s 20 dmg/s"]},
     unique:{name:"Storm Lord",upgrades:["Passive: melee attackers take 40 shock+stun 0.5s; lightning rain hits 3 random foes each second","Shock 52+stun; rain 4 foes","Shock 65+stun; rain 5 foes","Shock 80+stun; rain 6 foes","Shock 98+stun 1s; rain 8 foes; enemies in range of Stormtoad have a 20% chance to be struck by lightning every 2s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltfrog",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"tempestoad"},
  {id:"tempestoad",name:"Tempestoad",emoji:"🐸",type:"Electric",rarity:"common",description:"Fulgutoad with its own climate. It croaks once per storm, mostly out of politeness.",
   stats:{hp:147,atk:156,def:92,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Storm Tongue",upgrades:["15 dmg+slow","19 dmg","25 dmg","32 dmg","Shock 2.5s also"]},
     special:{name:"Thunderhead Leap",charge:22,upgrades:["Mega leap; 120 dmg+stun 2s; shockwave 90 dmg all","145 dmg","175 dmg","210 dmg","Stun 2.5s; shockwave chains 5 foes; electric lake 5s 28 dmg/s"]},
     unique:{name:"Climate Lord",upgrades:["Passive: melee attackers take 52 shock+stun 0.5s; lightning rain hits 4 random foes each second","Shock 66; rain 5 foes","Shock 82; rain 6 foes","Shock 100; rain 7 foes","Shock 122+stun 1s; rain all foes; enemies in range have a 28% chance to be struck by lightning every 2s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormtoad",shardsToAscend:28,ascensionsToEvolve:null},
  // Light line 1 -- holy lions. Melee Attackers: they close the distance and
  // smite. The ids stay bird-named (aurorabird/radiancebird/celestbird/
  // empyravis) on purpose: they are save keys, referenced by owned records and
  // by the three skin sets in data/skins.js, so renaming them would orphan
  // every player's copy. Only the display names changed.
  //
  // Ability names are shared across all four stages, per the roster convention
  // -- only the numbers and the final upgrade grow. (The old bird kit broke
  // that, naming each stage's basic differently.)
  {id:"aurorabird",name:"Aurorion",emoji:"🦁",type:"Light",rarity:"common",description:"A lion cub with a mane of dawn-coloured light. It practises its roar at sunrise and smites whatever is standing nearest.",
   stats:{hp:51,atk:53,def:31,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"radiancebird"},
  {id:"radiancebird",name:"Lumileo",emoji:"🦁",type:"Light",rarity:"common",description:"Its mane has hardened into blades of solid daylight. Shadows step aside where it walks, whether or not they are asked to.",
   stats:{hp:78,atk:80,def:46,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"aurorabird",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"celestbird"},
  {id:"celestbird",name:"Celestleo",emoji:"🦁",type:"Light",rarity:"common",description:"A lion of the high air, crowned in light. Its claws leave burns that go on glowing for days after the fight.",
   stats:{hp:105,atk:108,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"radiancebird",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"empyravis"},
  {id:"empyravis",name:"Empyreon",emoji:"☀️",type:"Light",rarity:"common",description:"Less a lion now than a sunrise that decided to hunt. Its judgement tends to land a moment before its paws do.",
   stats:{hp:137,atk:140,def:82,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Smite",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and gain a Shield equal to 15% of this creature's Defense"]},
     special:{name:"Solar Pounce",charge:8,upgrades:["30 dmg","38 dmg","48 dmg","58 dmg","Dispel all buffs and 58 dmg"]},
     unique:{name:"Radiant Mane",upgrades:["Gain 10% Critical Damage","Gain 20% Critical Damage","Gain 30% Critical Damage","Gain 40% Critical Damage","Gain 50% Critical Damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"celestbird",shardsToAscend:28,ascensionsToEvolve:null},
  // Light line 2
  {id:"prismcrab",name:"Oathcub",emoji:"🐻",type:"Light",rarity:"common",description:"A bear cub that swore an oath nobody administered, to a cause nobody named. It has been unshakeable about it for four months.",
   stats:{hp:69,atk:35,def:56,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"spectrumcrab"},
  {id:"spectrumcrab",name:"Vowbruin",emoji:"🐻",type:"Light",rarity:"common",description:"Grown into its armour, most of which it found. It stands in doorways on purpose now and asks people to state their business.",
   stats:{hp:103,atk:53,def:84,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"prismcrab",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"rainbowshell"},
  {id:"rainbowshell",name:"Sanctursa",emoji:"🐻",type:"Light",rarity:"common",description:"Its plate has been blessed so many times the metal has started to hum. Wounded soldiers shelter behind it without asking, which it permits.",
   stats:{hp:140,atk:72,def:114,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"spectrumcrab",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"chromatarch"},
  {id:"chromatarch",name:"Oathmaul",emoji:"🐻",type:"Light",rarity:"common",description:"A bear that took a holy oath it was not offered and has kept it, immaculately, ever since. Its armour was made by three separate smiths, each of whom assumed someone else had been asked.",
   stats:{hp:182,atk:93,def:149,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mailed Paw",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and gain Defense Up"]},
     special:{name:"Radiant Smite",charge:16,upgrades:["Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 60% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 75% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 90% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield","Gain a Shield based off of this creature's Defense, then deal damage to all nearby enemies equal to 110% of this creature's Shield and inflict Blind"]},
     unique:{name:"Reliquary",upgrades:["This creature has Overheal. Excess Shielding can not exceed 40% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 50% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 60% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 70% of this creature's Defense","This creature has Overheal. Excess Shielding can not exceed 80% of this creature's Defense"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"rainbowshell",shardsToAscend:18,ascensionsToEvolve:null},
  // Light line 3
  {id:"holymoth",name:"Sacramoth",emoji:"🦋",type:"Light",rarity:"common",description:"A moth that orbits holy shrines. Where it lands, wounds close and darkness retreats.",
   stats:{hp:58,atk:39,def:38,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Holy Dust",upgrades:["8 dmg; 22% blind 1s","11 dmg","14 dmg","18 dmg","28% blind 1.5s; regen 4 HP/s 2s on hit ally"]},
     special:{name:"Sacred Aura",charge:22,upgrades:["Aura; all allies +12% ATK+DEF 4s","Aura +16%","Aura +20%","Aura +25%","Aura +30%; also +10% Ability Speed; remove 1 debuff each"]},
     unique:{name:"Sacred Wings",upgrades:["Passive: Ability Speed +20% for all allies; each ability cast heals caster 8 HP","+26%; heal 11","30%; heal 14","+36%; heal 18","+44%; heal 24; abilities also cleanse 1 debuff from caster"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"radiantmoth"},
  {id:"radiantmoth",name:"Lumimoth",emoji:"🦋",type:"Light",rarity:"common",description:"Holymoth evolved. Its wing scales now emit a radiance that makes allies temporarily invulnerable.",
   stats:{hp:87,atk:57,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Holy Dust",upgrades:["8 dmg; blind 22%","11 dmg","14 dmg","18 dmg","Blind 1.5s; regen 4 HP/s ally"]},
     special:{name:"Radiant Aura",charge:8,upgrades:["All allies +20% ATK+DEF+Ability Speed 5s","Aura +26%","Aura +32%","Aura +40%","Aura +48%; remove all debuffs; grant overshield 30 HP"]},
     unique:{name:"Moth Radiance",upgrades:["Passive: Ability Speed +30% allies; each ability heals all allies 10 HP","+38%; heal 14","+46%; heal 18","+56%; heal 24","+66%; heal 32; abilities also have 20% chance to fully cleanse all debuffs from all allies"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"holymoth",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"celestimoth"},
  {id:"celestimoth",name:"Celestimoth",emoji:"🦋",type:"Light",rarity:"common",description:"Radiantmoth's celestial final form. The light from its wings can be seen from the other side of the world.",
   stats:{hp:117,atk:78,def:77,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Celestial Dust",upgrades:["11 dmg; blind 28% 2s; heal 1 ally 12 HP","14 dmg","18 dmg","24 dmg","35% blind 2.5s; heal all allies 8 HP"]},
     special:{name:"Celestial Aura",charge:14,upgrades:["All allies +30% ATK+DEF+Ability Speed; remove all debuffs 6s","Aura +38%","Aura +46%","Aura +56%","Aura +66%; grant immunity to all debuffs 6s; regen 15 HP/s"]},
     unique:{name:"Heaven's Wings",upgrades:["Passive: all allies Ability Speed +50%; each ability costs no cooldown 15% chance","+60%; 18% free","70%; 22% free","+80%; 26% free","+92%; 32% free; Celestimoth immune to all dmg while an ability is being cast by any ally; revives 3 times"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"radiantmoth",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"seraphlume"},
  {id:"seraphlume",name:"Seraphlume",emoji:"🦋",type:"Light",rarity:"common",description:"Celestimoth's last metamorphosis. Its wings are no longer lit; they are the source everything else is lit by.",
   stats:{hp:152,atk:101,def:100,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Seraphic Dust",upgrades:["14 dmg; blind 34% 2.5s; heal 1 ally 16 HP","18 dmg","23 dmg","30 dmg","42% blind 3s; heal all allies 12 HP"]},
     special:{name:"Seraphic Aura",charge:14,upgrades:["All allies +38% ATK+DEF+Ability Speed; remove all debuffs 7s","Aura +46%","Aura +56%","Aura +68%","Aura +82%; grant immunity to all debuffs 7s; regen 22 HP/s"]},
     unique:{name:"Lightsource",upgrades:["Passive: all allies Ability Speed +60%; abilities 18% chance to cost no cooldown","+70%; 22% free","+82%; 26% free","+95%; 31% free","+110%; 38% free; Seraphlume immune to all dmg while any ally casts; revives 3 times"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"celestimoth",shardsToAscend:28,ascensionsToEvolve:null},
  // Dark line 1
  {id:"voidspider",name:"Vacurach",emoji:"🕷️",type:"Dark",rarity:"common",description:"A spider that spins webs out of solidified void. Prey caught in its web simply stops existing.",
   stats:{hp:61,atk:64,def:37,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison 4 dmg/s 2s","16 dmg","21 dmg","27 dmg","Poison 6 dmg/s 3s+silence 0.5s"]},
     special:{name:"Void Web",charge:8,upgrades:["Web; root+silence 2s+25 dmg on struggle","Root+silence 2.5s+32 dmg","Root+silence 3s+40 dmg","Root+silence 3s+50 dmg","Root+silence 3s+silence spreads to 1 nearby; 62 dmg"]},
     unique:{name:"Void Venom",upgrades:["Passive: webbed foes take +20% dmg; void venom ignores 15% DEF","Webbed +28%; ignore 20%","Webbed +36%; ignore 26%","Webbed +44%; ignore 32%","Webbed +55%; ignore 40%; webbed foes can't remove debuffs; Voidspider invisible until it attacks"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:20,evolutionId:"shadowspider"},
  {id:"shadowspider",name:"Umbrachnid",emoji:"🕷️",type:"Dark",rarity:"common",description:"Voidspider grown to the size of a cart horse. Its webs cover entire dungeon floors.",
   stats:{hp:91,atk:97,def:56,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison+silence","16 dmg","21 dmg","27 dmg","Poison+silence 0.5s"]},
     special:{name:"Shadow Web Flood",charge:12,upgrades:["Flood area in webs; root all 3s+silence 3s","Root 3.5s","Root+silence 4s","Root+silence 4s+strip 1 buff","Root+silence 4.5s+strip all buffs; 80 dmg to all rooted"]},
     unique:{name:"Shadow Venom",upgrades:["Passive: void venom ignores 25% DEF; first attack invisible = +80% dmg+crit","Ignore 32%; first hit +100%","Ignore 40%; first hit +120%","Ignore 48%; first hit +150%","Ignore 58%; first hit +180%; Shadowspider permanently invisible; only visible when attacking"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidspider",shardsToAscend:15,ascensionsToEvolve:30,evolutionId:"abyssspider"},
  {id:"abyssspider",name:"Abyrach",emoji:"🕷️",type:"Dark",rarity:"common",description:"The final abyss predator. Abyssspider exists in the space between shadows. You only know it's there when it's too late.",
   stats:{hp:126,atk:131,def:75,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison+silence","16 dmg","21 dmg","27 dmg","Poison+silence+strip 1 buff"]},
     special:{name:"Abyss Web",charge:16,upgrades:["Web all; root 4s+silence 4s+strip all buffs+80 dmg","96 dmg","116 dmg","140 dmg","Root+silence 5s; webbed foes take 25 dmg/s; void slowly drains 5 HP/s"]},
     unique:{name:"Abyss Sovereign",upgrades:["Passive: permanently invisible; attacks are always crits from stealth; void venom ignores 40% DEF","Ignore 48%","Ignore 58%","Ignore 68%","Ignore 80%; on kill gain 6s invisibility; each kill enhances next strike +25% dmg; Abyssspider revives once invisible"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowspider",shardsToAscend:22,ascensionsToEvolve:45,evolutionId:"oblivirach"},
  {id:"oblivirach",name:"Oblivirach",emoji:"🕷️",type:"Dark",rarity:"common",description:"Abyrach past the point where shadows are needed. It hunts in the gaps of memory; witnesses recall nothing, twice.",
   stats:{hp:163,atk:171,def:97,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Oblivion Bite",upgrades:["16 dmg+poison+silence","21 dmg","27 dmg","35 dmg","Poison+silence 1.5s+strip 2 buffs"]},
     special:{name:"Oblivion Web",charge:16,upgrades:["Web all; root 4s+silence 4s+strip all buffs+100 dmg","120 dmg","145 dmg","175 dmg","Root+silence 6s; webbed foes take 32 dmg/s; void drains 8 HP/s"]},
     unique:{name:"Forgotten Sovereign",upgrades:["Passive: permanently invisible; stealth attacks always crit; void venom ignores 50% DEF","Ignore 58%","Ignore 68%","Ignore 80%","Ignore 92%; on kill gain 8s invisibility and +32% dmg on the next strike; Oblivirach revives once invisible"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"abyssspider",shardsToAscend:28,ascensionsToEvolve:null},
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
  // Pelican line (ids kept from the retired Magmavore volcano-beasts): Common,
  // 4 stages, one kit shared verbatim across every stage. A fire pelican that
  // mantles its allies -- the "pelican in her piety" of the old emblem.
  {id:"magmavore",name:"Cinderbill",emoji:"🐣",type:"Fire",rarity:"common",description:"A pelican chick whose bill is already too big for it and already too warm to hold. It practises scooping on puddles, which steam.",
   stats:{hp:58,atk:28,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"pyroclaw"},
  {id:"pyroclaw",name:"Emberpouch",emoji:"🐦",type:"Fire",rarity:"common",description:"The pouch has learned to hold lava without complaint. It has not yet learned to hold anything else, which has made fishing complicated.",
   stats:{hp:94,atk:46,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"magmavore",shardsToAscend:8,ascensionsToEvolve:30,evolutionId:"cindercolosus"},
  {id:"cindercolosus",name:"Kilnwing",emoji:"🦢",type:"Fire",rarity:"common",description:"Its wings run kiln-hot along the leading edge. Anything it settles over comes out the far side warm, rested, and faintly glazed.",
   stats:{hp:133,atk:65,def:109,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"pyroclaw",shardsToAscend:12,ascensionsToEvolve:45,evolutionId:"calderarch"},
  {id:"calderarch",name:"Pyrelican",emoji:"🔥",type:"Fire",rarity:"common",description:"The pelican of the old emblem, feeding its brood from its own heart and finding this a reasonable arrangement. Nothing under its wing has ever been left cold.",
   stats:{hp:175,atk:85,def:143,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Expose"]},
     special:{name:"Magma Mantle",charge:18,upgrades:["Heal 8 HP","Heal 10 HP","Heal 13 HP","Heal 16 HP","Heal 16 HP"]},
     unique:{name:"Forgeheart",upgrades:["Allies with Protect from this creature deal 3% more damage","Allies with Protect from this creature deal 6% more damage","Allies with Protect from this creature deal 9% more damage","Allies with Protect from this creature deal 12% more damage","Allies with Protect from this creature deal 15% more damage"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"cindercolosus",shardsToAscend:18,ascensionsToEvolve:null},
  {id:"shadowstrike",name:"Shadowstrike",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"A wraith-like cat that phases through walls and strikes from the shadows.",
   stats:{hp:80,atk:83,def:47,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shadow Swipe",upgrades:["28 dmg","38 dmg","48 dmg","60 dmg","Always crits when attacking from stealth"]},
     special:{name:"Phase Step",charge:10,upgrades:["Dodge next hit","Dodge + 15 dmg counter","Dodge + 22 dmg counter","Dodge + 30 dmg counter","Phase Step also enters stealth for 2s after dodge"]},
     unique:{name:"Shade Form",upgrades:["Passive: 8% chance to dodge any attack","12% chance to dodge attacks","16% chance to dodge attacks; crits deal +15% bonus damage","20% chance to dodge; crits deal +22% bonus damage","25% chance to dodge; crits deal +30% bonus damage; successfully dodging an attack grants stealth for 1s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"phantomfang"},
  // Dark line 1 final
  {id:"phantomfang",name:"Phantomfang",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"Shadowstrike halfway dissolved into the void. Half-cat, half-shadow, fully committed to ruining your day.",
   stats:{hp:102,atk:106,def:59,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shadow Swipe",upgrades:["28 dmg","38 dmg","48 dmg","60 dmg","Always crits when attacking from stealth"]},
     special:{name:"Phase Step",charge:10,upgrades:["Dodge next hit","Dodge + 15 dmg counter","Dodge + 22 dmg counter","Dodge + 30 dmg counter","Phase Step also enters stealth for 2s after dodge"]},
     unique:{name:"Void Body",upgrades:["Passive: 16% dodge; crits deal +22% dmg; stealth entry heals 18 HP; stealth crits +25% dmg","Dodge 20%; crits +28%; heal 24","Dodge 24%; crits +35%; heal 32","Dodge 28%; crits +44%; heal 42","Dodge 34%; crits +54%; heal 55; kills extend stealth 1.5s; immune to slows in stealth"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowstrike",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"nightwraith"},  {id:"nightwraith",name:"Nightwraith",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"Shadowstrike's final form. Not a cat, not a wraith — just the void wearing a cat's smile.",
   stats:{hp:117,atk:121,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Swipe",upgrades:["38 dmg; crit from stealth","50 dmg","62 dmg","78 dmg","Stealth crits deal +40% bonus+silence 1.5s"]},
     special:{name:"Shadow Shift",charge:12,upgrades:["Untargetable 2.5s; emerge+stealth 2s","3s; emerge+stealth","3.5s; emerge 60 dmg counter","4s; emerge 80 dmg","4.5s; emerge 100 dmg+stun 1s+strip all buffs"]},
     unique:{name:"Abyss Form",upgrades:["Passive: 28% dodge; crits +35% dmg; stealth entry heals 25 HP","32% dodge; crits +44%; heal 35","36% dodge; crits +54%; heal 48","42% dodge; crits +65%; heal 64","48% dodge; crits +80%; heal 85; kills extend stealth 2s; immune to detection"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"phantomfang",shardsToAscend:20,ascensionsToEvolve:null},
  // Fire line 2
  {id:"salamagma",name:"Salamagma",emoji:"🦎",type:"Fire",rarity:"epic",description:"A lava salamander the size of a bus. Scientists describe it as 'extremely hot and very angry.'",
   stats:{hp:102,atk:65,def:108,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn 5/s 3s","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned 3s"]},
     special:{name:"Lava Coat",charge:22,upgrades:["DEF+70+thorns burn 20/s 4s","DEF+90","DEF+115+thorns 25/s","DEF+140","DEF+170; thorns 30/s; immune to freeze/slow"]},
     unique:{name:"Molten Body",upgrades:["Passive: all attackers burned 3s; -18 all dmg","Burned 4s; -26 dmg","Burned 4s; -34 dmg; burn +20% dmg","Burned 5s; -44 dmg; burn +28%","Burned 5s; -55 dmg; burn +38%; Salamagma immune to fire+burn; heals 8 HP per burn tick on enemies"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"ignadon"},
  {id:"ignadon",name:"Ignadon",emoji:"🦎",type:"Fire",rarity:"epic",description:"Salamagma's scales have hardened to igneous rock. It no longer moves â€” it erupts from place to place.",
   stats:{hp:140,atk:89,def:148,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn 5/s 3s","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned 3s"]},
     special:{name:"Lava Coat",charge:22,upgrades:["DEF+70+thorns burn 20/s 4s","DEF+90","DEF+115+thorns 25/s","DEF+140","DEF+170; thorns 30/s; immune to freeze/slow"]},
     unique:{name:"Igneous Body",upgrades:["Passive: all attackers burned 4s; -24 all dmg; burn +16% dmg","Burned 4s; -32 dmg; +22%","Burned 5s; -40 dmg; +28%","Burned 5s; -50 dmg; +36%","Burned 5s; -62 dmg; +46%; Ignadon immune to fire+burn; heals 6 HP per burn tick on enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"salamagma",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"lavawyrm"},  {id:"lavawyrm",name:"Molochvast",emoji:"🐉",type:"Fire",rarity:"epic",description:"Salamagma's draconic final form. Volcanologists use it as a reference point for 'catastrophically hot.'",
   stats:{hp:165,atk:105,def:175,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned"]},
     special:{name:"Dragon Coat",charge:16,upgrades:["DEF+100+thorns burn 28/s 5s","DEF+130","DEF+165","DEF+200","DEF+240; thorns ignite ground 4s 25/s; allies nearby immune to burn"]},
     unique:{name:"Dragon Inferno",upgrades:["Passive: all attackers burned 5s; -28 all dmg; burn +25% dmg","-38 dmg; +32%","-48 dmg; +40%","-60 dmg; +50%","-72 dmg; +62%; Lavawyrm revives once wreathed in flame; revival deals 200 fire dmg to all enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"ignadon",shardsToAscend:20,ascensionsToEvolve:null},
  // Fire line 3
  {id:"blazehornet",name:"Emberstar",emoji:"⭐",type:"Fire",rarity:"epic",description:"A starfish that washed onto a lava flow and simply kept walking. Its five arms glow like heating elements.",
   stats:{hp:77,atk:79,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +10% DEF","+20% DEF","+30% DEF","+40% DEF","+40% DEF; deals additional damage for every 5 Burn stacks on the target"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"infernohive"},
  {id:"infernohive",name:"Magmastar",emoji:"🌟",type:"Fire",rarity:"epic",description:"Emberstar's arms have hardened into vents of molten rock. Wherever it rests, the seafloor starts smoking.",
   stats:{hp:107,atk:108,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +15% DEF","+25% DEF","+35% DEF","+45% DEF","+45% DEF; deals additional damage for every 5 Burn stacks on the target; burn deals 15% more damage"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"blazehornet",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"infernoswarm"},  {id:"infernoswarm",name:"Blastar",emoji:"☄️",type:"Fire",rarity:"epic",description:"Emberstar grown into a burning star of the deep. Every arm ends in a plasma spine, and it regrows them faster than anything can tear them off.",
   stats:{hp:125,atk:128,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Barb",upgrades:["15 dmg 2 times.","16 dmg each","3 hits; 12 dmg each","3 hits; 13 dmg each","4 hits; 11 dmg each"]},
     special:{name:"Charging Pierce",charge:20,upgrades:["30 dmg.","34 dmg","34 dmg; increased damage range","38 dmg; increased damage range","38 dmg; increased damage range; leaves behind a temporary fire trail, damaging enemies it touches"]},
     unique:{name:"Burning Bond",upgrades:["Dealing damage inflicts Burn. If Starlit is on the field, both gain +20% DEF","+30% DEF","+40% DEF","+50% DEF","+50% DEF; deals additional damage for every 5 Burn stacks on the target; burn deals 25% more damage; Blastar is immune to fire and Burn"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"infernohive",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 1
  {id:"coralleviathan",name:"Nessling",emoji:"🦕",type:"Water",rarity:"epic",description:"A long-necked lake serpent barely the size of a rowboat. Already extremely difficult to photograph.",
   stats:{hp:122,atk:62,def:97,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"tidecrush"},
  {id:"tidecrush",name:"Lochcoil",emoji:"🦕",type:"Water",rarity:"epic",description:"Nessling grown into a chain of humps that surface one at a time. Nine separate expeditions have logged it as a floating tree.",
   stats:{hp:167,atk:85,def:133,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"coralleviathan",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"tidelord"},  {id:"tidelord",name:"Nessarch",emoji:"🐉",type:"Water",rarity:"epic",description:"The monster of the loch itself. A century of sonar sweeps, submarines, and expeditions has produced exactly one blurry photograph, which it posed for.",
   stats:{hp:197,atk:101,def:157,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Loch Spout",upgrades:["14 dmg","16 dmg","18 dmg","21 dmg","21 dmg and inflict Haste Down"]},
     special:{name:"Deep Submerge",charge:30,upgrades:["Heal 40 HP; 30 dmg and Taunt them","Heal 50 HP; 30 dmg and Taunt them","Heal 62 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg and Taunt them","Heal 75 HP; 30 dmg, and inflict Attack Down and Taunt."]},
     unique:{name:"Stirring Depths",upgrades:["Gain 0.5 Ability Charge when damaged","Gain 1 Ability Charge when damaged","Gain 1.5 Ability Charge when damaged","Gain 2 Ability Charge when damaged","Gain 2.5 Ability Charge when damaged"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"tidecrush",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 2
  {id:"frostadder",name:"Frostadder",emoji:"🐍",type:"Water",rarity:"epic",description:"A viper whose venom has been replaced by liquid nitrogen. Every bite is a small ice age.",
   stats:{hp:83,atk:84,def:45,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8% 1s","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen foes take +20% dmg"]},
     special:{name:"Cryo Strike",charge:18,upgrades:["70 dmg+freeze 2s+shatter 40 dmg","85 dmg","104 dmg","126 dmg","Freeze 2.5s; shatter 60 dmg; strip 1 buff"]},
     unique:{name:"Glacial Venom",upgrades:["Passive: all attacks also slow 25% 2s; freeze dmg +25%","Slow 30%; freeze +32%","Slow 36%; freeze +40%","Slow 44%; freeze +50%","Slow 52%; freeze +62%; at 3 frozen enemies active, Frostadder's next hit auto-shatters all for 100 dmg each"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"glaciafang"},
  {id:"glaciafang",name:"Glaciafang",emoji:"🐍",type:"Water",rarity:"epic",description:"Frostadder grown enormous, its scales fused into solid ice plates. Every bite drops the temperature by 20 degrees.",
   stats:{hp:113,atk:116,def:62,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8% 1s","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen foes take +20% dmg"]},
     special:{name:"Cryo Strike",charge:18,upgrades:["70 dmg+freeze 2s+shatter 40 dmg","85 dmg","104 dmg","126 dmg","Freeze 2.5s; shatter 60 dmg; strip 1 buff"]},
     unique:{name:"Glacial Plates",upgrades:["Passive: all attacks slow 32% 2.5s; freeze dmg +36%; frozen foes take +22% all dmg","Slow 38%; +44%; +28%","Slow 46%; +54%; +34%","Slow 54%; +66%; +42%","Slow 64%; +80%; +52%; at 2 frozen enemies, next hit auto-shatters all for 90 dmg; immune to slow+freeze"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"frostadder",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"glacialwyrm"},  {id:"glacialwyrm",name:"Glacivern",emoji:"🐉",type:"Water",rarity:"epic",description:"Frostadder's final form. A dragon of living ice. Everything within 200m is permanently winter.",
   stats:{hp:133,atk:136,def:74,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8%","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen +20% dmg"]},
     special:{name:"Glacier Strike",charge:14,upgrades:["110 dmg+freeze 2.5s+shatter 80 dmg","132 dmg","158 dmg","190 dmg","Freeze 3s; shatter 120 dmg; strip all buffs; can't be unfrozen for 1s"]},
     unique:{name:"Winter Sovereign",upgrades:["Passive: slow 40% on all attacks; freeze dmg +50%; frozen foes take +30% all dmg","Slow 48%; +60%; +38%","Slow 58%; +72%; +46%","Slow 68%; +86%; +56%","Slow 80%; +100%; +68%; Glacialwyrm revives once; revival freezes all enemies 3s and shatters for 150 dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"glaciafang",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 3
  {id:"stormjelly",name:"Stormjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"A storm-charged jellyfish that floats in the upper atmosphere. Its tentacles conduct lightning into rain.",
   stats:{hp:77,atk:50,def:49,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["12 dmg; shock+slow 15% 2s","15 dmg","19 dmg","25 dmg","Shock+slow 22% 2.5s; heal 1 ally 10 HP"]},
     special:{name:"Storm Veil",charge:10,upgrades:["Shield all allies 55 HP+12% dodge 5s","Shield 72; 16%","Shield 90; 20%","Shield 110; 25%","Shield 135; 30%; also grant lightning-immune 4s"]},
     unique:{name:"Tempest Drift",upgrades:["Passive: immune to ground; 15% dodge; all allies +8% dodge+12 HP/s regen","18% dodge; +10% dodge; 16/s","22% dodge; +12%; 20/s","26% dodge; +15%; 25/s","30% dodge; +18%; 32/s; Stormjelly's heals also cleanse 1 debuff; can't be targeted while all allies are alive"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"tempestjelly"},
  {id:"tempestjelly",name:"Tempestjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"Stormjelly grown vast and crackling. Its glow can be seen from the ocean floor. Sailors call it a 'sky reef.'",
   stats:{hp:104,atk:69,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["12 dmg; shock+slow 15% 2s","15 dmg","19 dmg","25 dmg","Shock+slow 22% 2.5s; heal 1 ally 10 HP"]},
     special:{name:"Storm Veil",charge:10,upgrades:["Shield all allies 55 HP+12% dodge 5s","Shield 72; 16%","Shield 90; 20%","Shield 110; 25%","Shield 135; 30%; also grant lightning-immune 4s"]},
     unique:{name:"Tempest Drift",upgrades:["Passive: immune to ground; 20% dodge; allies +10% dodge+16 HP/s regen; heals cleanse 1 debuff","22% dodge; allies +12%; 20/s","26% dodge; allies +14%; 24/s","30% dodge; allies +17%; 30/s","34% dodge; allies +20%; 38/s; shields overflow as HP; can't be targeted while any ally is below 50% HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"stormjelly",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"abyssjelly"},  {id:"abyssjelly",name:"Abyssjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"Stormjelly sunk to the abyss and absorbed its darkness. It heals with one hand and shocks with the other.",
   stats:{hp:123,atk:81,def:79,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Sting",upgrades:["16 dmg; shock+slow+heal 1 ally 15 HP","21 dmg","27 dmg","35 dmg","Shock+slow 30% 3s; heal all allies 10 HP"]},
     special:{name:"Abyss Veil",charge:12,upgrades:["Shield all 80 HP+24% dodge; remove all debuffs","Shield 105+30%","Shield 132+36%","Shield 162+44%","Shield 198+54%; grant immunity all debuffs 5s; regen 20/s 5s all allies"]},
     unique:{name:"Deep Resonance",upgrades:["Passive: 28% dodge; allies +22% dodge+25 HP/s; heals overflows as shield 60 HP","Dodge 34%; allies +28%; shield 80","Dodge 40%; allies +34%; shield 100","Dodge 48%; allies +42%; shield 125","Dodge 56%; allies +52%; shield 155; Abyssjelly revives 3 times; each revival heals all allies 80 HP+grants 2s invincibility"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"tempestjelly",shardsToAscend:20,ascensionsToEvolve:null},

  // Nature line 1
  {id:"verdantboa",name:"Viriboa",emoji:"🐍",type:"Nature",rarity:"epic",description:"A boa constrictor grown from the world tree itself. What it wraps around becomes part of the forest.",
   stats:{hp:82,atk:86,def:48,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root 0.5s+poison 5/s 2s","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; rooted foes +15% dmg taken"]},
     special:{name:"Constrict",charge:14,upgrades:["Constrict; 75 dmg+DEF-20% 5s+poison 6/s 4s","90 dmg","108 dmg","130 dmg","Also silence 2s; constricted foes can't use abilities"]},
     unique:{name:"World Tree Body",upgrades:["Passive: poison stacks 4x; rooted foes +20% dmg taken; heal 8/s per poison active","Stacks 5x; +26%; heal 10/s","Stacks 5x; +32%; heal 13/s","Stacks 6x; +40%; heal 16/s","Stacks 6x; +50%; heal 20/s; constricted foes take max poison stacks automatically"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"thorncoil"},
  {id:"thorncoil",name:"Thorncoil",emoji:"🐍",type:"Nature",rarity:"epic",description:"Verdantboa's scales have hardened into bark-like wood. What it wraps around becomes mulch, then forest.",
   stats:{hp:112,atk:117,def:66,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root 0.5s+poison 5/s 2s","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; rooted foes +15% dmg taken"]},
     special:{name:"Constrict",charge:14,upgrades:["Constrict; 75 dmg+DEF-20% 5s+poison 6/s 4s","90 dmg","108 dmg","130 dmg","Also silence 2s; constricted foes can't use abilities"]},
     unique:{name:"Thorned Scales",upgrades:["Passive: poison stacks 5x; rooted foes take +26% dmg; heal 9/s per poison active; attackers take 18 thorn dmg","Stacks 5x; +32%; heal 11/s; thorn 24","Stacks 6x; +40%; heal 14/s; thorn 32","Stacks 6x; +50%; heal 18/s; thorn 42","Stacks 7x; +62%; heal 23/s; thorn 54; constricted foes take max poison stacks automatically"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"verdantboa",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"rootlord"},  {id:"rootlord",name:"Rootlord",emoji:"🐉",type:"Nature",rarity:"epic",description:"Verdantboa become one with the ancient forest. It does not move — the forest moves with it.",
   stats:{hp:132,atk:138,def:78,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root+poison","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; +15% dmg taken"]},
     special:{name:"Ancient Constrict",charge:14,upgrades:["Constrict all nearby; 110 dmg+DEF-30% 6s+poison 10/s 5s","132 dmg","158 dmg","190 dmg","Constrict silences; strip all buffs; poison can't be cured"]},
     unique:{name:"Forest Sovereign",upgrades:["Passive: poison always at max stacks; rooted foes +35% dmg; +25 HP/s per entangled enemy","Rooted +44%; +30/s","Rooted +54%; +36/s","Rooted +66%; +44/s","Rooted +80%; +54/s; Rootlord revives once growing a full forest that roots all enemies 4s+deals 200 poison dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"thorncoil",shardsToAscend:20,ascensionsToEvolve:null},
  // Nature line 2
  {id:"mossgolem",name:"Sporolith",emoji:"🧱",type:"Nature",rarity:"epic",description:"A golem built by the forest itself from centuries of accumulated moss. It is very slow and profoundly unkillable.",
   stats:{hp:129,atk:65,def:98,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Moss Slam",upgrades:["14 dmg; stagger 0.5s; heal 1 ally 18 HP","18 dmg","23 dmg","30 dmg","Stagger 1s; heal all allies 10 HP"]},
     special:{name:"Living Moss",charge:10,upgrades:["Aura; all allies +20 HP/s 6s+DEF+40","Regen 28/s; DEF+55","Regen 36/s; DEF+72","Regen 46/s; DEF+90","Regen 58/s; DEF+110; also remove all debuffs from all allies"]},
     unique:{name:"Ancient Moss",upgrades:["Passive: all allies +18 HP/s; -20 dmg taken by allies; Mossgolem immune to CC","Allies +24/s; -28 dmg","Allies +30/s; -36 dmg; Mossgolem CC immune","Allies +38/s; -46 dmg","Allies +48/s; -58 dmg; Nature allies heal 15 HP per ability cast; Mossgolem revives once healing all 80 HP"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"stonewarden"},
  {id:"stonewarden",name:"Stonewarden",emoji:"🧱",type:"Nature",rarity:"epic",description:"Mossgolem's moss compressed into dense stone. It is slower now, and roughly five times harder to kill.",
   stats:{hp:176,atk:89,def:134,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Moss Slam",upgrades:["14 dmg; stagger 0.5s; heal 1 ally 18 HP","18 dmg","23 dmg","30 dmg","Stagger 1s; heal all allies 10 HP"]},
     special:{name:"Living Moss",charge:10,upgrades:["Aura; all allies +20 HP/s 6s+DEF+40","Regen 28/s; DEF+55","Regen 36/s; DEF+72","Regen 46/s; DEF+90","Regen 58/s; DEF+110; also remove all debuffs from all allies"]},
     unique:{name:"Stone Warden",upgrades:["Passive: all allies +24 HP/s; -28 dmg taken by allies; Stonewarden CC immune; 12 thorns on hit","Allies +30/s; -36 dmg; thorns 18","Allies +38/s; -46 dmg; thorns 25","Allies +48/s; -58 dmg; thorns 34","Allies +60/s; -72 dmg; thorns 44; Nature allies heal 12 HP per ability cast; revives once healing all 100 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mossgolem",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"jadegiant"},  {id:"jadegiant",name:"Jadolith",emoji:"🏔️",type:"Nature",rarity:"epic",description:"Mossgolem crystallized into living jade. An immovable monument that refuses to stop healing people.",
   stats:{hp:208,atk:104,def:158,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Jade Slam",upgrades:["18 dmg; stagger 1s; heal all allies 15 HP","23 dmg","30 dmg","38 dmg","Stagger 1.5s; heal all 25 HP; DEF-12% on target"]},
     special:{name:"Jade Bloom",charge:14,upgrades:["All allies +35 HP/s 7s+DEF+70; cleanse all","Regen 46/s; DEF+92","Regen 58/s; DEF+116","Regen 72/s; DEF+142","Regen 90/s; DEF+175; revive 1 fallen ally 25% HP; grant all invincible 1s"]},
     unique:{name:"Jade Sovereign",upgrades:["Passive: all allies +32 HP/s; -35 all dmg to allies; thorns 40 dmg; absorb 25% ally dmg taken","Allies +42/s; -45; thorns 52; absorb 30%","Allies +54/s; -56; thorns 66; absorb 36%","Allies +68/s; -70; thorns 82; absorb 44%","Allies +85/s; -85; thorns 100; absorb 54%; Jadegiant revives twice each time healing all allies 150 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonewarden",shardsToAscend:20,ascensionsToEvolve:null},
  // Nature line 3
  {id:"venomfiend",name:"Venomfiend",emoji:"🐸",type:"Nature",rarity:"epic",description:"A toad whose skin secretes a venom so potent it dissolved its own classification in the biology textbooks.",
   stats:{hp:65,atk:55,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Toxic Spit",upgrades:["14 dmg; poison 7/s 3s+slow 18%","18 dmg","23 dmg","30 dmg","Poison 10/s 4s+slow 25%; spreads to 1 nearby"]},
     special:{name:"Plague Cloud",charge:22,upgrades:["Cloud; poison 8/s 5s; -25% ATK+SPD all in cloud","Poison 11/s","Poison 14/s","Poison 18/s","Poison 22/s 6s; silence 2s; can't gain buffs in cloud"]},
     unique:{name:"Plague Body",upgrades:["Passive: poison stacks 5x; each stack poisons an additional 5/s; ally Nature creatures immune to poison","Stacks 6x; +6/s per","Stacks 6x; +7/s; +15% heal for allied healers","Stacks 7x; +8/s; +20% heal","Stacks 7x; +10/s; +25% heal; poisoned enemies spread their poison on death in a radius"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"blighttoad"},
  {id:"blighttoad",name:"Blighttoad",emoji:"🐸",type:"Nature",rarity:"epic",description:"Venomfiend's venom has become semi-sentient. It selects its own targets now. Biologists have filed for early retirement.",
   stats:{hp:89,atk:75,def:92,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Toxic Spit",upgrades:["14 dmg; poison 7/s 3s+slow 18%","18 dmg","23 dmg","30 dmg","Poison 10/s 4s+slow 25%; spreads to 1 nearby"]},
     special:{name:"Plague Cloud",charge:22,upgrades:["Cloud; poison 8/s 5s; -25% ATK+SPD all in cloud","Poison 11/s","Poison 14/s","Poison 18/s","Poison 22/s 6s; silence 2s; can't gain buffs in cloud"]},
     unique:{name:"Blight Body",upgrades:["Passive: poison stacks 6x; each stack +6/s; ally Nature immune to poison; poisoned enemies spread on death","Stacks 6x; +7/s","Stacks 7x; +8/s; +18% heal for allied healers","Stacks 7x; +10/s; +24% heal","Stacks 8x; +12/s; +30% heal; Blighttoad immune to poison; heals 8/s per poisoned enemy alive"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"venomfiend",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"plaguefiend"},  {id:"plaguefiend",name:"Plaguefiend",emoji:"🐸",type:"Nature",rarity:"epic",description:"Venomfiend's final form. Not a creature — a public health crisis with legs. Several legs.",
   stats:{hp:105,atk:88,def:108,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plague Spit",upgrades:["20 dmg; poison 12/s 4s+slow 28%; spreads to 2 nearby","26 dmg","33 dmg","42 dmg","Spreads to 3 nearby; poison can't be cleansed"]},
     special:{name:"Pestilence Cloud",charge:10,upgrades:["Massive cloud; max poison all in area; -35% all stats 6s","Stronger","Even stronger","Max","Silence 3s; all in cloud take +30% dmg; poison spreads on contact between enemies"]},
     unique:{name:"Plague Sovereign",upgrades:["Passive: poison stacks 8x; each stack +12/s; death spreads max poison in huge radius; ally Nature immune to poison+heal 20/s","Stacks 9x; +14/s; heal 26/s","Stacks 9x; +17/s; heal 32/s","Stacks 10x; +21/s; heal 40/s","Stacks 10x; +26/s; heal 50/s; Plaguefiend revives once; revival poisons all enemies at max stacks"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"blighttoad",shardsToAscend:20,ascensionsToEvolve:null},
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
  // Earth line 2
  {id:"terradrake",name:"Terrauana",emoji:"🦎",type:"Earth",rarity:"epic",description:"A rock-armored drake that was literally born from a landslide. It considers earthquakes 'light stretching.'",
   stats:{hp:88,atk:93,def:54,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Terra Bite",upgrades:["18 dmg+DEF-8% 3s+stagger 0.5s","23 dmg","30 dmg","38 dmg","DEF-12% 4s+stagger 1s; shockwave nearby 30 dmg"]},
     special:{name:"Seismic Slam",charge:12,upgrades:["85 dmg; quake 3s 20/s","102 dmg","123 dmg","148 dmg","Quake 5s 28/s; pillars hit all; fissures trap 2s"]},
     unique:{name:"Stone Drake",upgrades:["Passive: -18 all dmg; immune to knockback+stun; shockwave aura 20 dmg each move","Reduce 26; shockwave 28","Reduce 34; shockwave 38","Reduce 44; shockwave 50","Reduce 56; shockwave 65; CC immune; at 200 shockwave dmg dealt trigger free Continental Slam"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"rockjaw"},
  {id:"rockjaw",name:"Rockjaw",emoji:"🦎",type:"Earth",rarity:"epic",description:"Terradrake's scales crystallized into jagged quartz. It doesn't bite so much as it excavates targets.",
   stats:{hp:120,atk:127,def:73,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Terra Bite",upgrades:["18 dmg+DEF-8% 3s+stagger 0.5s","23 dmg","30 dmg","38 dmg","DEF-12% 4s+stagger 1s; shockwave nearby 30 dmg"]},
     special:{name:"Seismic Slam",charge:12,upgrades:["85 dmg; quake 3s 20/s","102 dmg","123 dmg","148 dmg","Quake 5s 28/s; pillars hit all; fissures trap 2s"]},
     unique:{name:"Rock Drake",upgrades:["Passive: -24 all dmg; CC immune; shockwave aura 28 dmg each move; each bite reduces DEF 6%","Reduce 32; shockwave 38; DEF -8%","Reduce 42; shockwave 50; DEF -10%","Reduce 54; shockwave 64; DEF -12%","Reduce 68; shockwave 80; DEF -15%; at 150 shockwave dmg dealt trigger free Continental Slam"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"terradrake",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"quartzdrake"},  {id:"quartzdrake",name:"Quartzlisk",emoji:"🐉",type:"Earth",rarity:"epic",description:"Terradrake's final form. A quartz dragon whose footsteps register as magnitude 7 events.",
   stats:{hp:142,atk:149,def:86,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Quartz Bite",upgrades:["26 dmg+DEF-15% 4s+stagger 1s; shockwave all nearby 40 dmg","32 dmg","40 dmg","50 dmg","DEF-22% 5s+stagger 1.5s; shockwave crits; strip 1 buff"]},
     special:{name:"Quake Breath",charge:10,upgrades:["130 dmg cone; quake 4s 30/s; fissures all","156 dmg","188 dmg","226 dmg","Quake 6s 42/s; 6 fissures each 40/s; stunned 2s on entering"]},
     unique:{name:"Quartz Sovereign",upgrades:["Passive: -30 all dmg; CC immune; shockwave aura 40 dmg each move; attacks DEF-15% per hit (no cap)","Reduce 40; shockwave 52; DEF-20%","Reduce 50; shockwave 66; DEF-26%","Reduce 62; shockwave 82; DEF-32%","Reduce 76; shockwave 100; DEF-40%; Quartzdrake revives once; revival causes magnitude 10 quake dealing 300 dmg all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"rockjaw",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 3
  {id:"seismichog",name:"Seismichog",emoji:"🦔",type:"Earth",rarity:"epic",description:"A hedgehog whose quills have become tectonic plates. Hugging it is not recommended by anyone.",
   stats:{hp:112,atk:59,def:97,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Quill Spike",upgrades:["14 dmg+thorn 20 return; DEF-8%","18 dmg","23 dmg","30 dmg","Thorn 30 return; DEF-12%; stagger 0.5s"]},
     special:{name:"Quill Curl",charge:22,upgrades:["Retract; -55% dmg 3s+thorns 35/s; emerge 70 dmg","Reduce 65%","Reduce 75%","Reduce 85%","Reduce 85%; immune 2s; emerge 120 dmg+stun 1s+knock all back"]},
     unique:{name:"Tectonic Plates",upgrades:["Passive: each attacker takes 25 thorn+stagger 0.5s; -22 all dmg","Thorn 35+stagger 0.5s; -30 dmg","Thorn 46+stagger; -38 dmg","Thorn 60+stagger; -48 dmg","Thorn 76+stagger 1s; -60 dmg; CC immune; at 10 thorn triggers release quill explosion 180 dmg all"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"quakequill"},
  {id:"quakequill",name:"Quakequill",emoji:"🦔",type:"Earth",rarity:"epic",description:"Seismichog's quills have grown dense as bedrock. Touching one causes a localized earthquake. Locals have adapted.",
   stats:{hp:152,atk:81,def:134,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Quill Spike",upgrades:["14 dmg+thorn 20 return; DEF-8%","18 dmg","23 dmg","30 dmg","Thorn 30 return; DEF-12%; stagger 0.5s"]},
     special:{name:"Quill Curl",charge:22,upgrades:["Retract; -55% dmg 3s+thorns 35/s; emerge 70 dmg","Reduce 65%","Reduce 75%","Reduce 85%","Reduce 85%; immune 2s; emerge 120 dmg+stun 1s+knock all back"]},
     unique:{name:"Quake Plates",upgrades:["Passive: each attacker takes 38 thorn+stagger 0.5s; -30 all dmg; quill explosion every 8 triggers at 160 dmg","Thorn 50; -40 dmg; 185 dmg","Thorn 65; -52 dmg; 215 dmg","Thorn 82; -64 dmg; 248 dmg","Thorn 102; -78 dmg; 285 dmg; CC immune; stagger duration doubles; explosion also stuns 1.5s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"seismichog",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"tectohog"},  {id:"tectohog",name:"Tectohog",emoji:"🦔",type:"Earth",rarity:"epic",description:"Seismichog's final form. A tectonic titan hedgehog. Geologists agree it should not exist. It does anyway.",
   stats:{hp:179,atk:95,def:159,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tectonic Spike",upgrades:["22 dmg+thorn 40 return; DEF-14%+stagger 1s","28 dmg","36 dmg","46 dmg","Thorn 58 return; DEF-20%; stagger 1.5s; strip 1 buff"]},
     special:{name:"Plate Armor",charge:18,upgrades:["Retract; immune 2.5s+thorns 55/s; emerge 150 dmg+stun 1.5s+knock all","Immune 3s; emerge 180","Immune 3.5s; emerge 215","Immune 4s; emerge 258","Immune 4.5s; emerge 310+stun 2s+strip all buffs; heal all allies 80 HP"]},
     unique:{name:"Tectonic Sovereign",upgrades:["Passive: thorns 60+stagger 1s; -38 all dmg; CC immune; quill explosion every 10 triggers at 200 dmg","Thorns 76; -48 dmg; 230 dmg explosion","Thorns 95; -60 dmg; 265 dmg explosion","Thorns 118; -74 dmg; 305 dmg explosion","Thorns 145; -90 dmg; 350 dmg explosion; revives once; revival a perfect quill explosion 400 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quakequill",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 1
  {id:"galeserpent",name:"Coatlet",emoji:"🐍",type:"Wind",rarity:"epic",description:"A small serpent growing its first quetzal feathers. It practices flying by falling off progressively taller rocks.",
   stats:{hp:77,atk:78,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"vortexserpent"},
  {id:"vortexserpent",name:"Plumecoatl",emoji:"🪶",type:"Wind",rarity:"epic",description:"Half snake, half bird, entirely convinced it invented the wind. Its molted feathers are collected as currency in three villages.",
   stats:{hp:105,atk:108,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"galeserpent",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"cyclonwyrm"},
  {id:"cyclonwyrm",name:"Quetzalis",emoji:"🐉",type:"Wind",rarity:"epic",description:"The feathered serpent of legend. It taught mortals astronomy, agriculture, and letters, then left before anyone could schedule a follow-up.",
   stats:{hp:124,atk:127,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Plume Dart",upgrades:["16 dmg and they lose -.5% Defense (max 50%)","21 dmg and they lose -.5% Defense (max 50%)","27 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -.5% Defense (max 50%)","34 dmg and they lose -1% Defense (max 50%)"]},
     special:{name:"Feathered Gale",charge:14,upgrades:["55 dmg","68 dmg","84 dmg","102 dmg","102 dmg and inflict Defense Down"]},
     unique:{name:"Rising Star",upgrades:["Gain +1% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +2% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +3% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +4% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used","Gain +5% Attack and Speed whenever an enemy is hit by Feathered Gale until the next time Feathered Gale is used"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"vortexserpent",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 2
  {id:"stormsurger",name:"Tempesthawk",emoji:"🦅",type:"Wind",rarity:"epic",description:"A hawk that surfed a supercell storm into existence. It doesn't fly so much as it weaponizes the atmosphere.",
   stats:{hp:78,atk:79,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Storm Talon",upgrades:["22 dmg+knockback+slow 25% 2s","28 dmg","36 dmg","46 dmg","Knockback+slow 35%; vortex on land; stun 0.5s"]},
     special:{name:"Supercell Dive",charge:22,upgrades:["Dive; 88 dmg+stun 1s; shockwave 60 dmg all nearby","106 dmg","128 dmg","154 dmg","Stun 1.5s; shockwave 90 dmg+knock all; leave storm zone 3s 20/s"]},
     unique:{name:"Storm Predator",upgrades:["Passive: +30% crit; crits on slowed foes +40% dmg; crits trigger free talon strike","Crit +38%; +52% dmg","Crit +46%; +66%; also free special on crit every 6s","Crit +56%; +82%;","Crit +68%; +100%; every 5 crits trigger a tornado 200 dmg AOE; Tempesthawk cannot be targeted while airborne between attacks"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"thundertalon"},
  {id:"thundertalon",name:"Thundertalon",emoji:"🦅",type:"Wind",rarity:"epic",description:"Tempesthawk so electrically charged it ionizes the air around it. Clouds follow it like groupies. It does not notice.",
   stats:{hp:107,atk:108,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Storm Talon",upgrades:["22 dmg+knockback+slow 25% 2s","28 dmg","36 dmg","46 dmg","Knockback+slow 35%; vortex on land; stun 0.5s"]},
     special:{name:"Supercell Dive",charge:22,upgrades:["Dive; 88 dmg+stun 1s; shockwave 60 dmg all nearby","106 dmg","128 dmg","154 dmg","Stun 1.5s; shockwave 90 dmg+knock all; leave storm zone 3s 20/s"]},
     unique:{name:"Thunder Predator",upgrades:["Passive: +36% crit; crits on slowed foes +50% dmg; crits trigger 1 free talon strike+arc lightning 40 dmg","Crit +44%; +62%; arc 55 dmg","Crit +52%; +76%; arc 72 dmg; free special on crit every 7s","Crit +62%; +92%; arc 90 dmg","Crit +74%; +110%; arc 112 dmg; every 4 crits trigger tornado 160 dmg AOE; Thundertalon untargetable between attacks"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormsurger",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"stormphoenix"},  {id:"stormphoenix",name:"Tempestrel",emoji:"🕊️",type:"Wind",rarity:"epic",description:"Tempesthawk reborn in a thunderstorm. A bird of lightning and wind that dies and regrows from a bolt of lightning.",
   stats:{hp:126,atk:128,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lightning Talon",upgrades:["32 dmg+knockback+slow 40% 3s; arc to 1 nearby 60%","40 dmg","50 dmg","64 dmg","Slow 55%; arc 2 nearby; strip 1 buff; stun 0.5s"]},
     special:{name:"Phoenix Cyclone",charge:20,upgrades:["135 dmg+stun 1.5s; tornado 4s; shockwave all","162 dmg","195 dmg","234 dmg","Stun 2s; tornado 5s 40/s; pull all in; strip all buffs; Stormphoenix gains +40 SPD 4s"]},
     unique:{name:"Phoenix Storm",upgrades:["Passive: +45% crit; crits deal +55% dmg+arc 3 nearby; crits trigger 3 free talon strikes; revives once as thunderstorm dealing 250 dmg all","Crit +55%; +70%","Crit +65%; +88%","Crit +77%; +108%","Crit +90%; +130%; Stormphoenix revives twice; each revival stronger; final form: every attack is a guaranteed crit that arcs to all enemies"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"thundertalon",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 3
  {id:"galelocust",name:"Galelocust",emoji:"🦗",type:"Wind",rarity:"epic",description:"A locust whose wing-beats generate gusts strong enough to strip paint. Farmers consider it a natural disaster.",
   stats:{hp:78,atk:80,def:42,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["18 dmg+push; hit all in path","23 dmg","30 dmg","38 dmg","Push+slow 22% 2s; hit all in path; leave wind trail 1.5s"]},
     special:{name:"Swarm Rush",charge:8,upgrades:["Multiply to 5; dash through all foes 20 dmg each","26 dmg each","33 dmg each","42 dmg each","7 swarm clones; each knock back; merge into 1 causing 80 dmg explosion"]},
     unique:{name:"Swarm Mind",upgrades:["Passive: basic attacks hit all nearby at 50% dmg; wind dmg +18%; SPD scales: +1%/5 SPD","50% nearby; +24%; +1%/4","60% nearby; +30%; +1%/3","70% nearby; +38%; +1%/3","80% nearby; +48%; +1%/2; Galelocust spawns 2 permanent phantom clones dealing 40% dmg"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"swarmrider"},
  {id:"swarmrider",name:"Swarmrider",emoji:"🦗",type:"Wind",rarity:"epic",description:"A larger, angrier locust. Each wingbeat punches through reinforced concrete. Farmers have moved to other planets.",
   stats:{hp:107,atk:109,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["18 dmg+push; hit all in path","23 dmg","30 dmg","38 dmg","Push+slow 22% 2s; hit all in path; leave wind trail 1.5s"]},
     special:{name:"Swarm Rush",charge:8,upgrades:["Multiply to 5; dash through all foes 20 dmg each","26 dmg each","33 dmg each","42 dmg each","7 swarm clones; each knock back; merge into 1 causing 80 dmg explosion"]},
     unique:{name:"Rider Swarm",upgrades:["Passive: basics hit all nearby at 60% dmg; wind +24%; SPD scales +1%/4 SPD; 2 phantom clones 50% dmg","60% nearby; +30%; 2 clones 62%","70% nearby; +38%; 2 clones 76%; clones also trigger knockback","80% nearby; +48%; 3 clones 76%","90% nearby; +60%; 3 clones 90%; clones trigger unique passive; on kill 2s all enemies silenced"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"galelocust",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"stormlocust"},  {id:"stormlocust",name:"Cyclocus",emoji:"🦗",type:"Wind",rarity:"epic",description:"Galelocust evolved into a storm incarnate. It is no longer one creature — it is a migration event.",
   stats:{hp:126,atk:128,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["28 dmg+push; hit all in path; slow 30%","36 dmg","46 dmg","58 dmg","Slow 44%; wind trail 2s; every 3rd hit is AOE explosion 80 dmg"]},
     special:{name:"Mega Swarm",charge:12,upgrades:["12 swarm clones dash through all foes 30 dmg each","38 dmg","48 dmg","60 dmg","20 clones; merge explodes 160 dmg all+stun 1.5s+strip all buffs; clones also trigger unique passive"]},
     unique:{name:"Infinite Swarm",upgrades:["Passive: 3 phantom clones 40% dmg; all attacks hit all nearby at 70% dmg; wind +28%","Clones 4; 80% nearby; +36%","Clones 5; 90% nearby; +46%","Clones 6; 100% nearby; +58%","Clones 8; 120% nearby; +72%; on kill Stormlocust splits into 3 attacking separately for 5s then reforms"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"swarmrider",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 1
  {id:"voltdrake",name:"Voltimon",emoji:"🦎",type:"Electric",rarity:"epic",description:"A lizard that evolved inside a thundercloud. It does not understand why other creatures fear storms.",
   stats:{hp:83,atk:85,def:47,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["20 dmg+arc to 2 foes 50%+paralyze 15% 1s","26 dmg","33 dmg","42 dmg","Arc 3 foes 65%; paralyze 22% 1.5s; stun 0.5s on paralyze"]},
     special:{name:"Volt Surge",charge:22,upgrades:["85 dmg+stun 1s; chain to all nearby","102 dmg","123 dmg","148 dmg","Chain ignores DEF; stun 1.5s; each chained foe -25% SPD 4s"]},
     unique:{name:"Storm Scales",upgrades:["Passive: every hit arcs to 3 foes 55% dmg; electric +20%; arcs paralyze 15%","Arc 4 foes 65%; +26%; paralyze 20%","Arc 5 foes 75%; +32%; paralyze 26%","Arc 6 foes 88%; +40%; paralyze 33%","Arc 8 foes 100%; +50%; paralyze 42%; on paralyze release free arc chain; immune to paralysis+stun"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"stormscale"},
  {id:"stormscale",name:"Stormscale",emoji:"🦎",type:"Electric",rarity:"epic",description:"Voltdrake's lightning scales have arced together into living electricity. It bites and the arc does the rest.",
   stats:{hp:113,atk:117,def:64,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["20 dmg+arc to 2 foes 50%+paralyze 15% 1s","26 dmg","33 dmg","42 dmg","Arc 3 foes 65%; paralyze 22% 1.5s; stun 0.5s on paralyze"]},
     special:{name:"Volt Surge",charge:22,upgrades:["85 dmg+stun 1s; chain to all nearby","102 dmg","123 dmg","148 dmg","Chain ignores DEF; stun 1.5s; each chained foe -25% SPD 4s"]},
     unique:{name:"Storm Scales",upgrades:["Passive: every hit arcs to 4 foes 64% dmg; electric +26%; arcs paralyze 18%; paralyzed foes take +25% dmg","Arc 5 foes 74%; +32%; paralyze 24%","Arc 6 foes 84%; +40%; paralyze 30%","Arc 7 foes 94%; +50%; paralyze 38%","Arc 9 foes 106%; +62%; paralyze 48%; on paralyze release free arc chain; immune to paralysis+stun"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltdrake",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"thunderdrake"},  {id:"thunderdrake",name:"Thunderlisk",emoji:"🐉",type:"Electric",rarity:"epic",description:"Voltdrake's thunderous final form. Weather services list it under 'severe electrical phenomena' rather than 'wildlife.'",
   stats:{hp:134,atk:138,def:75,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["30 dmg+arc all nearby 70%+paralyze 25% 1.5s","38 dmg","48 dmg","60 dmg","Arc all; paralyze 35% 2s; stun 1s on paralyze; strip 1 buff"]},
     special:{name:"Dragon Thunder",charge:22,upgrades:["130 dmg+stun 1.5s; chain ignores DEF; -35% SPD all hit","156 dmg","188 dmg","226 dmg","Stun 2s; -50% SPD; chain to all on screen; all hit lose 1 buff"]},
     unique:{name:"Dragon Lightning",upgrades:["Passive: every hit arcs to all enemies 80% dmg; paralyzed foes take +40% dmg; electric +38%","Arc 90%; +48%","Arc 100%; +60%","Arc 112%; +74%","Arc 125%; +90%; Thunderdrake revives once as a lightning storm hitting all enemies 10x for 80 dmg each"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormscale",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 3
  {id:"shockcrab",name:"Shockstinger",emoji:"🦂",type:"Electric",rarity:"epic",description:"A scorpion that stores charge in its tail like a living capacitor. Desert electricians keep their distance.",
   stats:{hp:118,atk:61,def:96,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"voltcrusher"},
  {id:"voltcrusher",name:"Voltlasher",emoji:"🦂",type:"Electric",rarity:"epic",description:"Shockstinger's charges have built to dangerous levels. Every segment of its tail is a live wire. The power company has sent a letter.",
   stats:{hp:162,atk:83,def:132,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"shockcrab",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"galvaniccrab"},  {id:"galvaniccrab",name:"Galvascorpion",emoji:"🦂",type:"Electric",rarity:"epic",description:"Shockstinger's final form. A superconducting armored scorpion that generates its own power grid. The power company has questions.",
   stats:{hp:191,atk:98,def:156,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Volt Sting",upgrades:["14 dmg and inflict 1 stack of Restrained","18 dmg and inflict 1 stack of Restrained","23 dmg and inflict 1 stack of Restrained","30 dmg and inflict 1 stack of Restrained","30 dmg and inflict 2 stacks of Restrained"]},
     special:{name:"Overload Sting",upgrades:["45 dmg","52 dmg","60 dmg","70 dmg","70 dmg. This creature gains Speed Up"]},
     unique:{name:"Static Grip",upgrades:["Enemies with Restrained have -2% Speed","Enemies with Restrained have -4% Speed","Enemies with Restrained have -6% Speed","Enemies with Restrained have -8% Speed","Enemies with Restrained have -10% Speed"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"voltcrusher",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 1
  {id:"solardrake",name:"Solardrake",emoji:"🦎",type:"Light",rarity:"epic",description:"A drake that basks directly in the sun's core and considers it 'mild.' Its scales emit light that heals.",
   stats:{hp:84,atk:87,def:49,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Solar Beam",upgrades:["20 dmg+blind 20% 1.5s; heal 1 ally 14 HP","26 dmg","33 dmg","42 dmg","Blind 28% 2s; heal all allies 8 HP; arc 1 nearby"]},
     special:{name:"Solar Flare",charge:22,upgrades:["88 dmg; blind all 2.5s; heal all allies 40 HP","106 dmg","128 dmg","154 dmg","Blind 3.5s; heal 65 HP; grant all allies +18% ATK+DEF 4s"]},
     unique:{name:"Solar Scales",upgrades:["Passive: light dmg +22%; all heals +18%; each attack also heals 1 ally 12 HP","Light +28%; heals +24%; ally 16 HP","Light +36%; heals +30%; ally 22 HP","Light +46%; heals +38%; ally 30 HP","Light +58%; heals +48%; ally 40 HP; Solardrake immune to blind; crits heal all allies 25 HP"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"lumadrak"},
  {id:"lumadrak",name:"Lumadrak",emoji:"🦎",type:"Light",rarity:"epic",description:"Solardrake whose scales now emit constant healing light. Enemy medics have lodged formal protests with the council.",
   stats:{hp:115,atk:119,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Solar Beam",upgrades:["20 dmg+blind 20% 1.5s; heal 1 ally 14 HP","26 dmg","33 dmg","42 dmg","Blind 28% 2s; heal all allies 8 HP; arc 1 nearby"]},
     special:{name:"Solar Flare",charge:22,upgrades:["88 dmg; blind all 2.5s; heal all allies 40 HP","106 dmg","128 dmg","154 dmg","Blind 3.5s; heal 65 HP; grant all allies +18% ATK+DEF 4s"]},
     unique:{name:"Luma Scales",upgrades:["Passive: light dmg +30%; all heals +26%; each attack heals 1 ally 18 HP; blind attackers 20% 1s","Light +38%; heals +32%; ally 24 HP; blind 26%","Light +48%; heals +40%; ally 32 HP; blind 32%","Light +60%; heals +50%; ally 42 HP; blind 40%","Light +74%; heals +62%; ally 54 HP; blind 50%; Lumadrak immune to blind; crits heal all allies 20 HP"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"solardrake",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"celestidrake"},  {id:"celestidrake",name:"Lumiskink",emoji:"🐉",type:"Light",rarity:"epic",description:"Solardrake ascended into a dragon of pure starlight. It is simultaneously the strongest healer and the most terrifying attacker.",
   stats:{hp:135,atk:141,def:79,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Celestial Beam",upgrades:["32 dmg+blind 28% 2.5s; heal all allies 15 HP; arc 2 nearby","40 dmg","50 dmg","64 dmg","Blind 38% 3s; heal all 25 HP; arc all; strip 1 buff from each"]},
     special:{name:"Celestial Nova",charge:16,upgrades:["135 dmg; blind all 3.5s; heal all 70 HP+invincible 1.5s","162 dmg","195 dmg","234 dmg","Blind 5s; heal 110 HP; invincible 2s; remove all debuffs; revive 1 fallen ally 35% HP"]},
     unique:{name:"Celestial Sovereign",upgrades:["Passive: light +40%; all heals +36%; crits heal all 40 HP; Celestidrake immune to all dmg while healing","Light +50%; heals +44%; crit heals 52 HP","Light +62%; heals +54%; crit heals 66 HP","Light +76%; heals +66%; crit heals 84 HP","Light +92%; heals +80%; crit heals 105 HP; Celestidrake revives twice each time as a supernova healing all allies 200 HP+dealing 200 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"lumadrak",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 2
  {id:"sacredwasp",name:"Starlit",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp whose stinger delivers blessing instead of venom. Theology departments find it very confusing.",
   stats:{hp:71,atk:47,def:47,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"divinedrone"},
  {id:"divinedrone",name:"Starbright",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp so sacred the concept of harm has agreed to avoid it. It stings with pure blessings. Theologians are keeping notes.",
   stats:{hp:97,atk:65,def:65,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"sacredwasp",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"holyswarm"},  {id:"holyswarm",name:"Starburn",emoji:"🐝",type:"Light",rarity:"epic",description:"Sacredwasp became a divine swarm that is simultaneously everywhere and everywhere healing. Theologians have updated their texts.",
   stats:{hp:115,atk:77,def:76,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Piercing Blessing",upgrades:["10 dmg","10 dmg","11 dmg","11 dmg; enemy hit: -10% Haste for 3s","11 dmg; enemy hit: -10% Haste for 3s; ally hit: +10% Haste for 3s"]},
     special:{name:"Radiant Exchange",charge:20,upgrades:["18 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","20 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP","22 dmg; enemy hit: -15% ATK for 3s; ally hit: +15% ATK for 3s and recover HP"]},
     unique:{name:"Starlit Wings",upgrades:["Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +10% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +20% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +30% ATK","Gain 20% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK","Gain 50% Speed and +2 Range; if Emberstar is on the field, both gain +40% ATK"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"divinedrone",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 3
  {id:"lumigator",name:"Lumigator",emoji:"🦎",type:"Light",rarity:"epic",description:"A massive albino alligator that glows from within. It was protecting a sacred pool of light. Now it protects everything.",
   stats:{hp:109,atk:56,def:88,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Light Bite",upgrades:["14 dmg; blind 15% 1s; heal self+1 ally 16 HP","18 dmg","23 dmg","30 dmg","Blind 22% 1.5s; heal all allies 10 HP; DEF-10% on target"]},
     special:{name:"Sacred Shell",charge:16,upgrades:["DEF+80+regen 15/s+blind aura 20% 5s; allies -18% dmg taken","DEF+102","DEF+128; aura 26%","DEF+158","DEF+192; aura 32%; allies -28% dmg; immune to blind"]},
     unique:{name:"Living Light",upgrades:["Passive: -20 all dmg; all allies regen 12/s; blind aura 18% nearby foes; Lumigator immune to blind","Reduce 28; regen 16/s; aura 24%","Reduce 36; regen 20/s; aura 30%","Reduce 46; regen 26/s; aura 38%","Reduce 58; regen 34/s; aura 48%; absorb 20% of ally dmg taken; revives once healing all allies 120 HP"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:10,evolutionId:"gleamgator"},
  {id:"gleamgator",name:"Gleamgator",emoji:"🦎",type:"Light",rarity:"epic",description:"Lumigator's glow has intensified. Nearby enemies go blind. Nearby allies feel inexplicably at peace with everything.",
   stats:{hp:150,atk:77,def:121,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Light Bite",upgrades:["14 dmg; blind 15% 1s; heal self+1 ally 16 HP","18 dmg","23 dmg","30 dmg","Blind 22% 1.5s; heal all allies 10 HP; DEF-10% on target"]},
     special:{name:"Sacred Shell",charge:16,upgrades:["DEF+80+regen 15/s+blind aura 20% 5s; allies -18% dmg taken","DEF+102","DEF+128; aura 26%","DEF+158","DEF+192; aura 32%; allies -28% dmg; immune to blind"]},
     unique:{name:"Gleam Hide",upgrades:["Passive: -26 all dmg; allies regen 16/s; blind aura 24% nearby foes; Gleamgator immune to blind","Reduce 34; regen 20/s; aura 30%","Reduce 44; regen 26/s; aura 38%","Reduce 56; regen 34/s; aura 48%","Reduce 70; regen 44/s; aura 60%; absorb 15% of ally dmg taken; revives once healing all allies 100 HP+blinding all enemies 4s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"lumigator",shardsToAscend:18,ascensionsToEvolve:25,evolutionId:"radiantgator"},  {id:"radiantgator",name:"Lumicator",emoji:"🦎",type:"Light",rarity:"epic",description:"Lumigator's transcendent final form. An alligator of living sunlight that makes enemies blind and allies immortal.",
   stats:{hp:177,atk:91,def:144,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Radiant Bite",upgrades:["22 dmg; blind 28% 2s; heal all allies 18 HP; DEF-14% on target; cleanse 1 ally","28 dmg","36 dmg","46 dmg","Blind 40% 2.5s; heal all 28 HP; cleanse all allies 1 debuff; strip 1 buff target"]},
     special:{name:"Radiant Fortress",charge:14,upgrades:["DEF+130+regen 28/s+blind aura 32% 7s; allies -28% dmg; immune to blind+slow","DEF+165","DEF+204","DEF+248","DEF+300; aura 44%; allies -40% dmg; immune to all debuffs 5s; allies regen 40/s"]},
     unique:{name:"Radiant Sovereign",upgrades:["Passive: -32 all dmg; allies regen 22/s; blind aura 38%; absorb 28% ally dmg; immune to blind+all CC","Reduce 42; regen 28/s; aura 48%; absorb 34%","Reduce 54; regen 36/s; aura 60%; absorb 42%","Reduce 68; regen 46/s; aura 74%; absorb 52%","Reduce 84; regen 58/s; aura 90%; absorb 64%; Radiantgator revives twice each revival healing all allies 200 HP+blinding all enemies 5s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"gleamgator",shardsToAscend:20,ascensionsToEvolve:null},
  // Dark line 3: Doomshade -- Legendary spectre tank whose Wisps taunt and explode.
  {id:"doomgrub",name:"Doomshade",emoji:"👻",type:"Dark",rarity:"legendary",description:"A spectre that drifted out of a lantern festival centuries ago and never went back. It hands out little flames to anyone who gets close. The flames are load-bearing.",
   stats:{hp:155,atk:79,def:122,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Spectral Rake",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Grave Lantern",charge:16,upgrades:["If there are less than 2 Wisps, summon 1 Wisp with 25 Health.","If there are less than 2 Wisps, summon 1 Wisp with 32 Health.","If there are less than 2 Wisps, summon 1 Wisp with 40 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health. It gains 100% Ability Charge."]},
     unique:{name:"Lantern Keeper",upgrades:["Summon 1 Wisp with 25 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 32 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 40 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 50 Health and it gains 100% Ability Charge.","Summon 2 Wisps with 50 Health and they gain 100% Ability Charge."]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"nihilwyrm"},
  {id:"nihilwyrm",name:"Nihilgeist",emoji:"☠️",type:"Dark",rarity:"legendary",description:"Doomshade with nothing left to haunt except the concept of light itself. Its wisps no longer flicker. They wait.",
   stats:{hp:186,atk:95,def:147,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Spectral Rake",upgrades:["12 dmg","15 dmg","19 dmg","24 dmg","24 dmg and inflict Damage Over Time"]},
     special:{name:"Grave Lantern",charge:16,upgrades:["If there are less than 2 Wisps, summon 1 Wisp with 25 Health.","If there are less than 2 Wisps, summon 1 Wisp with 32 Health.","If there are less than 2 Wisps, summon 1 Wisp with 40 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health.","If there are less than 2 Wisps, summon 1 Wisp with 50 Health. It gains 100% Ability Charge."]},
     unique:{name:"Lantern Keeper",upgrades:["Summon 1 Wisp with 25 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 32 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 40 Health and it gains 100% Ability Charge.","Summon 1 Wisp with 50 Health and it gains 100% Ability Charge.","Summon 2 Wisps with 50 Health and they gain 100% Ability Charge."]}
   },role:"Tank",attackType:"Melee",evolutionOf:"doomgrub",shardsToAscend:30,ascensionsToEvolve:null},
  {id:"stormwyvern",name:"Stormwyvern",emoji:"🐉",type:"Wind",rarity:"legendary",description:"Ancient ruler of storm clouds. Its wingspan generates hurricanes.",
   stats:{hp:113,atk:103,def:87,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Storm Fang",upgrades:["40 dmg wind","55 dmg","70 dmg","88 dmg","Hits chain to 2 additional nearby foes for 40% dmg"]},
     special:{name:"Tempest Wings",charge:12,upgrades:["Push foes back","Push + 30 dmg","Push + 42 dmg","Push + 55 dmg","Creates a wind wall blocking projectiles for 3s"]},
     unique:{name:"Storm Lord",upgrades:["Passive: nearby allies gain +12 ATK and +10 SPD","Nearby allies gain +18 ATK and +16 SPD","Nearby allies gain +24 ATK and +22 SPD","Nearby allies gain +32 ATK and +28 SPD; Stormwyvern itself gains +15 SPD","Nearby allies gain +42 ATK and +36 SPD; Stormwyvern gains +25 SPD; allies also deal +10% wind damage"]}
   },role:"Support",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"tempestlord"},
  {id:"celestialux",name:"Celestialux",emoji:"✨",type:"Light",rarity:"legendary",description:"A being of pure starlight existing between dimensions. Its true form cannot be seen — only felt.",
   stats:{hp:111,atk:103,def:86,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Starfire",upgrades:["55 dmg","72 dmg","90 dmg","112 dmg","Starfire pierces through all enemies in a line"]},
     special:{name:"Stellar Veil",charge:18,upgrades:["Reflect 15% dmg","Reflect 20%","Reflect 28%","Reflect 35%","Stellar Veil also heals 15 HP per reflected hit"]},
     unique:{name:"Starborn",upgrades:["Passive: all allies regenerate 2 HP/s","All allies regenerate 3 HP/s","All allies regenerate 4 HP/s; Celestialux's crits heal itself for 10 HP","All allies regenerate 6 HP/s; crits heal self for 18 HP","All allies regenerate 8 HP/s; crits heal self for 25 HP and also restore 3 HP to all allies"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:30,ascensionsToEvolve:5,evolutionId:"nebulalux"},
  // Wind line 1 final
  {id:"tempestlord",name:"Tempestlord",emoji:"🌪️",type:"Wind",rarity:"legendary",description:"The storm given eternal form. Where Tempestlord passes, the age of clear skies ends permanently.",
   stats:{hp:135,atk:124,def:105,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gale Sovereign",upgrades:["55 dmg wind; chain 3 foes 60%","70 dmg","88 dmg","110 dmg","Chain all enemies; each hit applies -8% SPD stack; no cap"]},
     special:{name:"Eternal Tempest",charge:22,upgrades:["All allies +55 ATK+45 SPD+30% wind dmg 7s","Aura stronger","Even stronger","Max","Permanent aura; also grant +20% Ability Speed; allies immune to wind dmg"]},
     unique:{name:"Storm Sovereign",upgrades:["Passive: all allies +55 ATK+45 SPD; Tempestlord generates endless gale zone 30/s; enemies -40% SPD","Allies +68 ATK+56 SPD; zone 38/s; -50%","Allies +84 ATK+70 SPD; zone 48/s; -60%","Allies +104 ATK+88 SPD; zone 60/s; -72%","Allies +128 ATK+108 SPD; zone 75/s; -84%; Tempestlord revives 3 times each as a category-5 tornado"]}
   },role:"Support",attackType:"Melee",evolutionOf:"stormwyvern",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 1 final
  {id:"nebulalux",name:"Nebulalux",emoji:"🌌",type:"Light",rarity:"legendary",description:"Celestialux absorbed an entire nebula. It now contains more light than a small galaxy and shares all of it.",
   stats:{hp:134,atk:123,def:103,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Nebula Beam",upgrades:["72 dmg; pierce all; heal all allies 28 HP","90 dmg; heal 36","112 dmg; heal 46","140 dmg; heal 58","Nebula Beam crits always; heals 80 HP; arc 3 extra beams to random foes"]},
     special:{name:"Stellar Veil",charge:18,upgrades:["Reflect 40% dmg; heal 25 HP per reflected hit","Reflect 50%; heal 34","Reflect 62%; heal 44","Reflect 76%; heal 57","Reflect 92%; heal 74; reflected dmg also blinds attacker 3s; allies immune to reflected dmg"]},
     unique:{name:"Cosmic Born",upgrades:["Passive: all allies +18 HP/s regen; Nebulalux crits heal all allies 45 HP; immune to all dmg 15% chance","Regen +24/s; crit heal 58; immune 20%","Regen +30/s; crit heal 74; immune 26%","Regen +38/s; crit heal 94; immune 32%","Regen +48/s; crit heal 118; immune 40%; Nebulalux revives 3 times each time healing all allies to full HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"celestialux",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 1
  {id:"blazephoenix",name:"Blazephoenix",emoji:"🦅",type:"Fire",rarity:"legendary",description:"A phoenix hatched from the heart of a dying star. It considers extinction and rebirth a perfectly normal Tuesday.",
   stats:{hp:109,atk:112,def:61,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Solar Talon",upgrades:["26 dmg+burn 8/s 3s; arc 2 foes","33 dmg","42 dmg","54 dmg","Burn 12/s 4s; arc all nearby; burn spread to 1 foe per arc"]},
     special:{name:"Rebirth Flame",charge:22,upgrades:["Blazephoenix becomes fire; emerges 3s later full HP; 80 dmg AOE on emerge","Emerge 100 dmg","Emerge 124 dmg","Emerge 154 dmg","Emerge stuns all 2s; burn all 6s; strip all buffs"]},
     unique:{name:"Eternal Flame",upgrades:["Passive: revives once per fight; each revival stronger+32% ATK; burn ignores 30% DEF; fire dmg +35%","Ignores 38%; +44%","Ignores 46%; +55%","Ignores 56%; +68%","Ignores 68%; +84%; Blazephoenix revives endlessly until 3 revivals; final death is a supernova 300 dmg all"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"solarpyre"},
  {id:"solarpyre",name:"Solarpyre",emoji:"🌟",type:"Fire",rarity:"legendary",description:"Blazephoenix's true form. A solar storm wearing feathers. Astronomers have filed formal complaints.",
   stats:{hp:130,atk:134,def:74,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Solar Talon",upgrades:["40 dmg+burn 12/s 4s; arc all; burn can't be removed","50 dmg","62 dmg","78 dmg","Burn 18/s 5s; all arcs crit; crits trigger free arc chain"]},
     special:{name:"Solar Rebirth",charge:18,upgrades:["Transform to pure solar energy; emerge 4s later full HP; 140 dmg AOE+burn all 8s","Emerge 175 dmg","Emerge 218 dmg","Emerge 272 dmg","Emerge 340 dmg; stun all 3s; strip all buffs; arena on fire 6s 40/s after emerge"]},
     unique:{name:"Living Star",upgrades:["Passive: revives endlessly (3 revivals); each revival: +40% ATK+burn ignores +15% DEF; fire +50%; crits spread burn to all nearby","Fire +62%; burn DEF ignore +20% stacking","Fire +76%; +26% stacking","Fire +94%; +33% stacking","Fire +115%; +42% stacking; Solarpyre revives at full power; final revival: permanent star form dealing 80/s to all enemies"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"blazephoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 2
  {id:"ignisdragon",name:"Ignissaur",emoji:"🐲",type:"Fire",rarity:"legendary",description:"A dragon forged in the earth's mantle and never told it could leave. Surprisingly well-adjusted about it.",
   stats:{hp:116,atk:125,def:77,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Fang",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg and inflict Burn"]},
     special:{name:"Inferno Breath",charge:8,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and inflict Burn"]},
     unique:{name:"Stoked Flames",upgrades:["Deals 1% extra damage for each stack of Burn on the enemy","Deals 2% extra damage for each stack of Burn on the enemy","Deals 3% extra damage for each stack of Burn on the enemy","Deals 4% extra damage for each stack of Burn on the enemy","Deals 5% extra damage for each stack of Burn on the enemy"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"pyredragon"},
  {id:"pyredragon",name:"Pyresaur",emoji:"🐉",type:"Fire",rarity:"legendary",description:"Ignisdragon fully ignited. Every scale is a miniature sun. Sunglasses are not sufficient protection.",
   stats:{hp:140,atk:150,def:92,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Fang",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg and inflict Burn"]},
     special:{name:"Inferno Breath",charge:8,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and inflict Burn"]},
     unique:{name:"Stoked Flames",upgrades:["Deals 1% extra damage for each stack of Burn on the enemy","Deals 2% extra damage for each stack of Burn on the enemy","Deals 3% extra damage for each stack of Burn on the enemy","Deals 4% extra damage for each stack of Burn on the enemy","Deals 5% extra damage for each stack of Burn on the enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"ignisdragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 3
  {id:"magmatitan",name:"Magmaur",emoji:"🦣",type:"Fire",rarity:"legendary",description:"A creature so massive it reroutes lava flows. Geologists refer to it in hushed, reverent tones.",
   stats:{hp:168,atk:87,def:136,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Magma Stomp",upgrades:["20 dmg; lava pool 3s 18/s; stagger 0.5s","26 dmg","33 dmg","42 dmg","Lava pool 5s 26/s; stagger 1s; lava spreads 2m each step"]},
     special:{name:"Lava Armor",charge:22,upgrades:["DEF+120+burn aura 30/s 6s+thorns burn 25; immune slow","DEF+152","DEF+190; thorns 32","DEF+235","DEF+288; thorns 42; also immune to stun+knock; aura 42/s 7s"]},
     unique:{name:"Living Volcano",upgrades:["Passive: every step erupts 60 dmg nearby; -28 all dmg; all attackers burned 5s 20/s; fire zone at all times 25/s","Step 76; -36; burn 28/s","Step 96; -46; burn 36/s","Step 120; -58; burn 46/s","Step 150; -72; burn 58/s; Magmatitan immune to all fire and earth dmg; revives once as a full volcanic eruption"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"infernocolossus"},
  {id:"infernocolossus",name:"Infernocolossus",emoji:"🌋",type:"Fire",rarity:"legendary",description:"Magmatitan evolved past the concept of cooling down. It is now classified as an active geological event.",
   stats:{hp:202,atk:104,def:164,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Inferno Stomp",upgrades:["32 dmg; lava pool 5s 28/s; stagger 1.5s; pool spreads 4m","40 dmg","50 dmg","64 dmg","Stagger 2s+stun 0.5s; pool spreads 6m; all stepping in pool burned max stacks"]},
     special:{name:"Volcano Armor",charge:10,upgrades:["DEF+180+burn aura 48/s 7s+thorns 45; CC immune; allies -25% dmg taken","DEF+228","DEF+284; thorns 58","DEF+350","DEF+432; thorns 74; aura 68/s 8s; allies -38% dmg; reflect 30% all dmg taken"]},
     unique:{name:"Infernal Sovereign",upgrades:["Passive: step erupts 120 dmg; -44 all dmg; burn aura 44/s; fire+earth dmg +55%; immune to all fire/earth; absorb 35% ally dmg","Step 150; -56; burn 56/s; +68%","Step 188; -70; burn 70/s; +84%","Step 235; -88; burn 88/s; +104%","Step 295; -110; burn 110/s; +128%; Infernocolossus revives 3 times each as a world-ending volcanic eruption dealing 500 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"magmatitan",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 1
  {id:"frosthydra",name:"Waddlepop",emoji:"🐧",type:"Water",rarity:"common",description:"A round penguin that lobs suspiciously ticking snowballs. It packs them itself and takes no questions.",
   stats:{hp:48,atk:50,def:28,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:15,evolutionId:"glacialhydra"},
  {id:"glacialhydra",name:"Frostillery",emoji:"🐧",type:"Water",rarity:"common",description:"Waddlepop upgraded to full siege capability. It carries an entire bandolier of ice bombs and considers every problem a targeting solution.",
   stats:{hp:96,atk:100,def:56,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"frosthydra",shardsToAscend:10,ascensionsToEvolve:30,evolutionId:"bombardguin"},
  {id:"bombardguin",name:"Bombardguin",emoji:"🐧",type:"Water",rarity:"common",description:"Frostillery with proper mortar training. It calculates arcs on one flipper and never misses twice.",
   stats:{hp:120,atk:125,def:70,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"glacialhydra",shardsToAscend:14,ascensionsToEvolve:45,evolutionId:"cryogeddon"},
  {id:"cryogeddon",name:"Cryogeddon",emoji:"🧊",type:"Water",rarity:"common",description:"The penguin at the end of winter. Its bombardments have their own entry in the glacier fossil record.",
   stats:{hp:144,atk:150,def:84,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ice Lob",upgrades:["12 dmg","14 dmg","16 dmg","18 dmg","18 dmg and inflict Speed Down"]},
     special:{name:"Cryo Bomb",charge:12,upgrades:["24 dmg","28 dmg","32 dmg","37 dmg","37 dmg. Inflicts Frostbite"]},
     unique:{name:"Snowball Effect",upgrades:["Cryo Bomb deals 2% more damage whenever it's used (max 100%)","Cryo Bomb deals 4% more damage whenever it's used (max 100%)","Cryo Bomb deals 6% more damage whenever it's used (max 100%)","Cryo Bomb deals 8% more damage whenever it's used (max 100%)","Cryo Bomb deals 10% more damage whenever it's used (max 100%)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"bombardguin",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 2
  {id:"abyssraken",name:"Abyssraken",emoji:"🦑",type:"Water",rarity:"legendary",description:"The original kraken. Every sea monster myth traces back to this. It is mildly annoyed by the inaccuracies.",
   stats:{hp:157,atk:81,def:127,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tentacle Grab",upgrades:["18 dmg; grab+root 2s; drain 15 HP","23 dmg","30 dmg","38 dmg","Root 3s; drain 22 HP; silence 1.5s; strip 1 buff"]},
     special:{name:"Ink Cloud",charge:14,upgrades:["Blind all 3s; -30% ATK+SPD 5s; ally team +15% dodge","Blind 4s; -38%","Blind 4s; -46%; dodge +20%","Blind 5s; -55%; dodge +26%","Blind 5s; -66%; dodge +32%; also silence all 2s; allies heal 30 HP"]},
     unique:{name:"Abyss Sovereign",upgrades:["Passive: -26 all dmg; 8 tentacle aura each 20/s; grabbed foes take +30% dmg+drain 15/s","Reduce 34; 28/s; +38%","Reduce 44; 38/s; +48%","Reduce 56; 50/s; +60%","Reduce 70; 65/s; +75%; Abyssraken immune to all water dmg; revives once all tentacles auto-grab all enemies"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"deepkraken"},
  {id:"deepkraken",name:"Bathykraken",emoji:"🦑",type:"Water",rarity:"legendary",description:"Abyssraken grown to its true size. Oceans look small standing next to it. It considers this 'a tight fit.'",
   stats:{hp:189,atk:97,def:152,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Kraken Tentacle",upgrades:["28 dmg; grab 3 foes; root 3s; drain 30 HP; strip 1 buff","36 dmg","46 dmg","58 dmg","Root 4s; drain 44 HP; silence 2s; strip all buffs; grabbed foes take +30% dmg"]},
     special:{name:"Abyss Ink",charge:20,upgrades:["Blind all 5s; -55% ATK+SPD 6s; allies +38% dodge; remove all enemy buffs","Blind 6s; -66%; dodge +46%","Blind 6s; -80%; dodge +56%","Blind 7s; -96%; dodge +68%","Blind 7s; -115%; dodge +82%; silence all 3s; drain 40/s all enemies; heal all allies 80 HP"]},
     unique:{name:"Kraken Sovereign",upgrades:["Passive: -42 all dmg; 12 tentacle aura 52/s; grabbed foes drain 40/s+take +50% dmg; immune to all water","Reduce 54; aura 66/s; drain 52/s; +62%","Reduce 68; aura 84/s; drain 66/s; +76%","Reduce 86; aura 106/s; drain 84/s; +94%","Reduce 108; aura 132/s; drain 106/s; +116%; Deepkraken revives 3 times; each revival auto-grabs and silences all enemies"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"abyssraken",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 3
  {id:"oceanwyrm",name:"Tidalwarden",emoji:"🐍",type:"Water",rarity:"legendary",description:"A serpent old enough to remember when the oceans were young. It helped fill them.",
   stats:{hp:105,atk:109,def:60,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ocean Fang",upgrades:["24 dmg+freeze 10% 1.5s+slow 25%; arc 2 nearby","30 dmg","38 dmg","48 dmg","Freeze 18% 2s; slow 35%; arc all; frozen foes shatter 50 dmg on arc"]},
     special:{name:"Tidal Coil",charge:18,upgrades:["Coil all; maelstrom 5s 35/s; root+drain 20/s","Coil; 45/s; drain 26/s","Coil; 58/s; drain 34/s","Coil; 74/s; drain 44/s","Coil; 95/s; drain 56/s; coiled foes frozen; shatter 80 dmg on release"]},
     unique:{name:"Ancient Ocean",upgrades:["Passive: slow 40% on all attacks; freeze dmg +55%; coiled foes take +35% dmg; arc always hits all","Slow 50%; freeze +68%; coiled +44%","Slow 62%; freeze +84%; coiled +55%","Slow 76%; freeze +104%; coiled +68%","Slow 94%; freeze +128%; coiled +84%; Oceanwyrm immune to all water+ice; revives once as a world-flood tsunami"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"tidaldragon"},
  {id:"tidaldragon",name:"Tidalorca",emoji:"🐉",type:"Water",rarity:"legendary",description:"Oceanwyrm's draconic final form. Every ocean current on the planet follows its movements.",
   stats:{hp:127,atk:131,def:72,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tidal Fang",upgrades:["38 dmg+freeze 28% 2.5s+slow 50%; arc all; shatter frozen 80 dmg","48 dmg","60 dmg","74 dmg","Freeze 42% 3s; slow 65%; strip 2 buffs; shatter 120 dmg; arc all enemies always"]},
     special:{name:"World Coil",charge:18,upgrades:["Coil entire enemy team; 80/s for 6s; root+freeze+drain 50/s","96/s","116/s","140/s","170/s for 7s; drain 70/s; frozen coiled foes shatter 150 dmg; drain distributes to all allies; coiled lose all buffs"]},
     unique:{name:"Tidal Sovereign",upgrades:["Passive: slow 65% all attacks; freeze+shatters +80% dmg; arc 100% all; immune to all water+ice; coiled foes take +55% all dmg","Freeze+shatter +100%; coiled +68%","Freeze+shatter +125%; coiled +84%","Freeze+shatter +155%; coiled +104%","Freeze+shatter +190%; coiled +128%; Tidaldragon revives 3 times each as a world-tsunami dealing 500 dmg all+freezing all 5s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"oceanwyrm",shardsToAscend:30,ascensionsToEvolve:null},
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

  // Nature line 1
  {id:"verdanthydra",name:"Thornwarden",emoji:"🐲",type:"Nature",rarity:"legendary",description:"A hydra grown from the world tree's roots. Each head controls a different forest. All of them are poisonous.",
   stats:{hp:129,atk:99,def:127,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Vine Bite",upgrades:["22 dmg+poison 9/s 3s+root 1s; each head targets different foe","28 dmg","36 dmg","46 dmg","Poison 14/s 4s; root 1.5s; all heads attack; rooted foes +20% dmg taken"]},
     special:{name:"Forest Regen",charge:12,upgrades:["Regrow heads; heal 90 HP+regen 20/s 5s; each head adds +10% ATK+12% DEF","Heal 115; +13%+15%","Heal 145; +16%+18%","Heal 180; +20%+22%","Heal 225; +25%+28%; also heal all allies 60 HP; remove all debuffs allies"]},
     unique:{name:"Forest Sovereign",upgrades:["Passive: regrow 1 head/8s (max 7); each head +15% ATK+18% DEF+poison aura 18/s; rooted foes take +30% dmg","Head +18%+22%; aura 24/s; +38%","Head +22%+28%; aura 30/s; +48%","Head +28%+35%; aura 38/s; +60%","Head +35%+44%; aura 48/s; +75%; at 7 heads immune to all dmg 2s every 5s; revives once regrowing all heads"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"roothydra"},
  {id:"roothydra",name:"Worldthorn",emoji:"🐉",type:"Nature",rarity:"legendary",description:"Verdanthydra evolved into the world forest itself. Every tree on the planet is technically its body now.",
   stats:{hp:156,atk:118,def:152,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Ancient Vine Bite",upgrades:["35 dmg+poison 20/s 5s+root 2s; all heads hit all enemies","44 dmg","56 dmg","70 dmg","Poison 30/s 6s; root 3s; can't remove poison or root; strip 2 buffs per head"]},
     special:{name:"Ancient Regen",charge:18,upgrades:["Instant 7 heads; full HP+regen 40/s 6s; also heal all allies full HP","Also revive 1 fallen 40%","Also revive 2 fallen","Also revive 3 fallen","Revive all fallen at 60% HP; grant all invincible 2s; remove all debuffs; grant +30% all stats 8s"]},
     unique:{name:"World Tree",upgrades:["Passive: regrow 1 head/3s; each head +42% ATK+52% DEF+poison aura 60/s; 7 heads: invincible 3s every 4s","Head +52%+65%; aura 76/s","Head +65%+80%; aura 96/s","Head +80%+98%; aura 120/s","Head +100%+120%; aura 150/s; Roothydra revives 3 times each growing to 7 heads instantly and rooting all enemies 5s+max poison"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"verdanthydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 2
  {id:"sylvandragon",name:"Siegefin",emoji:"🐠",type:"Nature",rarity:"legendary",description:"A seahorse that has anchored its tail to the seabed and refuses, on principle, to be anywhere else. It resolves distant problems by spitting at them very accurately.",
   stats:{hp:107,atk:112,def:63,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Brine Shot",upgrades:["28 dmg","32 dmg","36 dmg","40 dmg","40 dmg and inflict Healing Down"]},
     special:{name:"Holdfast",charge:18,upgrades:["This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 15% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 20% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 25% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash","This creature enduringly Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash"]},
     unique:{name:"Deepsight",upgrades:["This creature gains +1 Range","This creature gains +2 Range","This creature gains +3 Range","This creature gains +4 Range","This creature gains +5 Range"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"ancientdragon"},
  {id:"ancientdragon",name:"Siegespire",emoji:"🐉",type:"Nature",rarity:"legendary",description:"It has not moved in sixty years and has no intention of starting. Ships navigate by it now, which it considers a reasonable arrangement.",
   stats:{hp:129,atk:134,def:75,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Brine Shot",upgrades:["28 dmg","32 dmg","36 dmg","40 dmg","40 dmg and inflict Healing Down"]},
     special:{name:"Holdfast",charge:18,upgrades:["This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 15% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 20% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 25% Speed and its attacks Splash","This creature Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash","This creature enduringly Roots itself, which can not be dispelled, and dispels all debuffs. While Rooted, this creature gains 30% Speed and its attacks Splash"]},
     unique:{name:"Deepsight",upgrades:["This creature gains +1 Range","This creature gains +2 Range","This creature gains +3 Range","This creature gains +4 Range","This creature gains +5 Range"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"sylvandragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 3
  {id:"bloomphoenix",name:"Bloomibis",emoji:"🦉",type:"Nature",rarity:"legendary",description:"A cat-faced owl crowned with living antlers. Whatever it watches over simply refuses to stay hurt.",
   stats:{hp:107,atk:70,def:67,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Antler Dart",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg. +5% Attack to self on hit (stacking) until the next time Soothing Hoot is used"]},
     special:{name:"Soothing Hoot",charge:22,upgrades:["Heal 38 HP","Heal 48 HP","Heal 60 HP","Heal 75 HP","Heal 75 HP. Also cleanses all debuffs from healed allies"]},
     unique:{name:"Guardian Grove",upgrades:["Heal 6 HP/s","Heal 8 HP/s","Heal 10 HP/s","Heal 13 HP/s","Heal 13 HP/s and gain +10% Attack"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"lifephoenix"},
  {id:"lifephoenix",name:"Animavis",emoji:"🌿",type:"Nature",rarity:"legendary",description:"Bloomphoenix's final form. The concept of life given wings. It sustains ecosystems just by existing nearby.",
   stats:{hp:127,atk:84,def:81,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Antler Dart",upgrades:["16 dmg","18 dmg","20 dmg","23 dmg","23 dmg. +5% Attack to self on hit (stacking) until the next time Soothing Hoot is used"]},
     special:{name:"Soothing Hoot",charge:22,upgrades:["Heal 38 HP","Heal 48 HP","Heal 60 HP","Heal 75 HP","Heal 75 HP. Also cleanses all debuffs from healed allies"]},
     unique:{name:"Guardian Grove",upgrades:["Heal 6 HP/s","Heal 8 HP/s","Heal 10 HP/s","Heal 13 HP/s","Heal 13 HP/s and gain +10% Attack"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"bloomphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 1
  {id:"earthgolem",name:"Terravast",emoji:"🗿",type:"Earth",rarity:"legendary",description:"Built by an ancient civilization as a guardian. The civilization is gone. Earthgolem is still guarding.",
   stats:{hp:175,atk:89,def:135,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Bedrock Slam",upgrades:["20 dmg; quake 2s 18/s; DEF-10%+stagger 1s","26 dmg","33 dmg","42 dmg","DEF-16%; stagger 1.5s; shockwave 40 dmg all nearby; quake 3s"]},
     special:{name:"Ancient Ward",charge:16,upgrades:["DEF+150+thorns 40+reflect 25% 8s; allies take -30% dmg; CC immune","DEF+190; allies -38%","DEF+238; reflect 32%; allies -48%","DEF+298; reflect 40%; allies -60%","DEF+372; reflect 50%; allies -75%; Earthgolem immune to all dmg during ward"]},
     unique:{name:"Primordial Stone",upgrades:["Passive: -32 all dmg; CC immune; reflect 28% blocked; thorns 50 all attackers; shockwave 45 dmg every step","Reduce 42; reflect 36%; thorns 64; shockwave 58","Reduce 54; reflect 46%; thorns 80; shockwave 74","Reduce 68; reflect 58%; thorns 100; shockwave 94","Reduce 86; reflect 72%; thorns 126; shockwave 118; Earthgolem revives 3 times; each revival cracks the earth dealing 350 dmg all"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"titangolem"},
  {id:"titangolem",name:"Terralith",emoji:"🏔️",type:"Earth",rarity:"legendary",description:"Earthgolem grew until it became the mountain. Geographers debate whether it counts as topography.",
   stats:{hp:211,atk:106,def:161,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mountain Slam",upgrades:["32 dmg; quake 3s 28/s; DEF-20%+stagger 2s; shockwave 65 all nearby","40 dmg","50 dmg","64 dmg","DEF-28%; stagger 2.5s+stun 1s; shockwave 88 dmg; quake 5s; pillars erupt 4 random spots"]},
     special:{name:"Titan Ward",charge:8,upgrades:["DEF+230+thorns 65+reflect 42% 9s; allies take -50% dmg; CC immune; thorns stun attacker 0.5s","DEF+290; allies -62%","DEF+362; reflect 52%; allies -76%; thorns stun 1s","DEF+452; reflect 64%; allies -94%","DEF+565; reflect 80%; allies -100% (immune); thorns stun 1.5s; Titangolem invincible during ward"]},
     unique:{name:"Titan Sovereign",upgrades:["Passive: -52 all dmg; CC immune; reflect 58% blocked; thorns 120+stun 1s; shockwave 110 each step; absorb 45% ally dmg","Reduce 66; reflect 74%; thorns 152+stun 1.5s; shockwave 140; absorb 56%","Reduce 82; reflect 92%; thorns 190+stun 2s; shockwave 175; absorb 68%","Reduce 100; reflect 114%; thorns 238+stun 2.5s; shockwave 218; absorb 82%","Reduce 122; reflect 140%; thorns 298+stun 3s; shockwave 275; absorb 100%; Titangolem revives 3 times; each revival is a continental collapse 600 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"earthgolem",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 2
  {id:"quartzhydra",name:"Geoloch",emoji:"💎",type:"Earth",rarity:"legendary",description:"A gemstone hydra that grew inside the earth's crystal core. Each head is a different precious stone.",
   stats:{hp:141,atk:106,def:131,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Crystal Bite",upgrades:["22 dmg+DEF-12% 4s; thorn 25 return; each head targets different foe","28 dmg","36 dmg","46 dmg","DEF-18% 5s; thorn 38; crystal shards 30 dmg AOE on each bite"]},
     special:{name:"Gem Regen",charge:16,upgrades:["Regrow 1 head; +14% ATK+18% DEF per head; heal 85 HP; thorn reflection +20%","Heal 108; +18% ATK+22% DEF","Heal 135; +22%+28%","Heal 168; +28%+35%","Heal 210; +35%+44%; regrow to 7 heads; also heal all allies 50 HP"]},
     unique:{name:"Gem Hydra",upgrades:["Passive: regrow 1 head/7s (max 7); each head +16% ATK+20% DEF+crystal aura 22/s; reflect 30% blocked; thorns 35 per head","Head +20%+25%; aura 28/s; reflect 38%; thorns 44","Head +25%+32%; aura 36/s; reflect 48%; thorns 56","Head +32%+40%; aura 46/s; reflect 60%; thorns 72","Head +40%+50%; aura 58/s; reflect 74%; thorns 92; at 7 heads immune to all physical dmg; revives once regrowing all heads+crystal explosion 300 dmg"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"gemhydra"},
  {id:"gemhydra",name:"Prismarex",emoji:"🐉",type:"Earth",rarity:"legendary",description:"Quartzhydra fully crystalized. An eight-headed dragon of pure gemstone. It is its own mountain, treasury, and fortress.",
   stats:{hp:169,atk:127,def:158,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Gem Bite",upgrades:["35 dmg+DEF-22% 5s; thorn 65 return; crystal 55 AOE each bite; all 8 heads attack","44 dmg","56 dmg","70 dmg","DEF-32% 6s; thorn 90; crystal 80 AOE; each head strips 1 buff"]},
     special:{name:"Sovereign Regen",charge:22,upgrades:["Instant 8 heads; heal full HP; head bonuses max out; also heal all allies full HP","Also revive 1 fallen","Also revive 2 fallen","Also revive 3 fallen","Revive all fallen 60%; grant all invincible 2.5s; full cleanse; grant +40% all stats 8s"]},
     unique:{name:"Gem Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +48% ATK+60% DEF+crystal aura 72/s; 8 heads: immune to all physical+magic dmg 3s every 4s; reflect 90% blocked; thorns 150+stun 1s per head","Head +60%+75%; aura 90/s","Head +75%+94%; aura 112/s","Head +94%+116%; aura 140/s","Head +118%+145%; aura 175/s; Gemhydra with 8 heads is immune to all dmg; revives 3 times each crystal explosion 500 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quartzhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 3
  {id:"seismicdrake",name:"Richterdrake",emoji:"🦎",type:"Earth",rarity:"legendary",description:"A drake whose heartbeat registers as seismic activity. It thinks the world shaking is how everyone says hello.",
   stats:{hp:108,atk:117,def:71,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Seismic Bite",upgrades:["24 dmg+quake 2s 18/s; DEF-12%+stagger 1s; shockwave 35 dmg","30 dmg","38 dmg","48 dmg","DEF-18%; stagger 1.5s; shockwave 50 dmg; quake 3s; fissure at target's feet"]},
     special:{name:"Tectonic Roar",charge:14,upgrades:["Roar; all enemies -30% ATK+DEF+SPD 6s; quake 4s 28/s","Roar; -38% 7s","Roar; -48% 7s","Roar; -60% 8s","Roar; -75% 8s; also silence 3s; all allies +30% ATK+DEF+SPD 6s"]},
     unique:{name:"Seismic Dragon",upgrades:["Passive: heartbeat quake every 3s 80 dmg all; -24 all dmg; shockwave on every attack; DEF-5%/hit (no cap)","Heartbeat 100 dmg every 2.5s; -32","Heartbeat 125 dmg every 2s; -40","Heartbeat 156 dmg every 1.5s; -50","Heartbeat 195 dmg every 1s; -62; CC immune; Seismicdrake revives once; revival is a magnitude-10 earthquake 400 dmg all+bury all 5s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"quakewyrm"},
  {id:"quakewyrm",name:"Seismarex",emoji:"🐉",type:"Earth",rarity:"legendary",description:"Seismicdrake's final form. A tectonic wyrm so massive that continents shift when it turns around.",
   stats:{hp:131,atk:140,def:85,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Tectonic Bite",upgrades:["38 dmg+quake 3s 30/s; DEF-22%+stagger 2s; shockwave 70 dmg+stun all nearby 0.5s","48 dmg","60 dmg","74 dmg","DEF-32%; stagger 2.5s; shockwave 100 dmg+stun 1s; fissure 4s 40/s at each target"]},
     special:{name:"World Roar",charge:16,upgrades:["All enemies -55% all stats 8s; quake 6s 45/s; all allies +45% all stats 8s","Enemies -68%; allies +56%","Enemies -84%; allies +70%","Enemies -104%; allies +88%","Enemies -128%; allies +110%; also silence all enemies 4s; remove all enemy buffs; grant ally immunity 3s"]},
     unique:{name:"Wyrm Sovereign",upgrades:["Passive: heartbeat 150 dmg all every 1s; -38 all dmg; shockwave 100 dmg each attack; DEF-8%/hit; CC immune; absorb 40% ally dmg","Heartbeat 188 dmg; -48; shockwave 125; -10%/hit; absorb 50%","Heartbeat 235; -60; shockwave 156; -12%/hit; absorb 62%","Heartbeat 294; -76; shockwave 195; -15%/hit; absorb 76%","Heartbeat 368; -96; shockwave 244; -19%/hit; absorb 94%; Quakewyrm revives 3 times each as a continental collapse 600 dmg all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"seismicdrake",shardsToAscend:30,ascensionsToEvolve:null},
  // Wind line 2
  // Mantis line (ids kept from the retired Aetherwing phoenixes): Legendary,
  // 2 stages, one kit shared verbatim. A Wind mantis that cuts.
  {id:"galephoenix",name:"Sicklewing",emoji:"🦗",type:"Wind",rarity:"legendary",description:"A mantis that learned the wind would carry it and stopped flying under its own power. It waits with its forelegs folded and the air around them thin.",
   stats:{hp:103,atk:106,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sickle Cut",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg. Execute enemies below 20% Health"]},
     special:{name:"Twin Reap",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and briefly Stun all enemies hit"]},
     unique:{name:"Unfettered",upgrades:["This creature gains 5% Speed and its attacks bypass Shields","This creature gains 10% Speed and its attacks bypass Shields","This creature gains 15% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields and bypass Taunt"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"skyphoenix"},
  {id:"skyphoenix",name:"Galescythe",emoji:"🌪️",type:"Wind",rarity:"legendary",description:"It moves once and the argument is over. Nobody has seen the claws open; the consensus is that they never close.",
   stats:{hp:123,atk:127,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Sickle Cut",upgrades:["30 dmg","34 dmg","38 dmg","43 dmg","43 dmg. Execute enemies below 20% Health"]},
     special:{name:"Twin Reap",charge:10,upgrades:["55 dmg","62 dmg","70 dmg","80 dmg","80 dmg and briefly Stun all enemies hit"]},
     unique:{name:"Unfettered",upgrades:["This creature gains 5% Speed and its attacks bypass Shields","This creature gains 10% Speed and its attacks bypass Shields","This creature gains 15% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields","This creature gains 20% Speed and its attacks bypass Shields and bypass Taunt"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"galephoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Wind line 3
  {id:"cyclonedrake",name:"Maelstrake",emoji:"🦅",type:"Wind",rarity:"legendary",description:"A drake born inside a cyclone and raised by the wind. It has never once touched the ground and considers this normal.",
   stats:{hp:96,atk:99,def:53,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Cyclone Talon",upgrades:["22 dmg+push+vortex 2s 20/s at landing; slow 28%","28 dmg","36 dmg","46 dmg","Push+vortex 3s 30/s; slow 42%; strip 1 buff; chain to 2 nearby at 60%"]},
     special:{name:"Cyclone Body",charge:14,upgrades:["Spin; 70 dmg all nearby; pull all; slow 50% 4s; vortex 4s 30/s lingers","84 dmg","102 dmg","122 dmg","Spin; 145 dmg; pull; slow 66%; silence 2s; vortex 6s 44/s; all hit lose 1 buff"]},
     unique:{name:"Cyclone Drake",upgrades:["Passive: immune to all ground; +36% dodge; cyclone aura 36/s; all enemies in range -50% SPD+ATK; SPD scales dmg +1.5%/5 SPD","Dodge +44%; aura 46/s; -62%","Dodge +54%; aura 58/s; -76%","Dodge +66%; aura 72/s; -94%","Dodge +80%; aura 90/s; -116%; Cyclonedrake permanently airborne+untargetable unless attacking; revives once as a mega cyclone"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"vortexwyrm"},
  {id:"vortexwyrm",name:"Maelstrix",emoji:"🐉",type:"Wind",rarity:"legendary",description:"Cyclonedrake's final form. A wyrm of living wind that exists simultaneously everywhere the wind blows.",
   stats:{hp:115,atk:119,def:64,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Vortex Talon",upgrades:["35 dmg+push+vortex 4s 50/s at each landing; slow 62%; chain all","44 dmg","56 dmg","70 dmg","Slow 80%; chain all at 100%; vortex sucks enemies in; each chain strip 1 buff; stun 0.5s on entry"]},
     special:{name:"Vortex Form",charge:20,upgrades:["Become wind; attack from everywhere simultaneously; 60 dmg 6 hits+pull+slow 80% 5s","72 dmg","88 dmg","106 dmg","8 hits; slow 100% (root); silence 3s; all hits strip 1 buff; emerge dealing 120 additional dmg"]},
     unique:{name:"Vortex Sovereign",upgrades:["Passive: immune to ground+all targeting between attacks; +55% dodge; aura 110/s; enemies -80% SPD+ATK; SPD scales dmg +2%/5 SPD","Dodge +65%; aura 138/s; -100%","Dodge +78%; aura 172/s; -124%","Dodge +94%; aura 215/s; -155%","Dodge +114%; aura 270/s; -194%; Vortexwyrm exists as wind at all times; physically cannot be hit unless it chooses; revives 3 times each as a world-cyclone"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cyclonedrake",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 1
  {id:"thunderhydra",name:"Voltravene",emoji:"⚡",type:"Electric",rarity:"legendary",description:"A hydra with a head for every type of lightning. Scientists documented it once. Their equipment never worked again.",
   stats:{hp:110,atk:121,def:80,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["22 dmg+arc all 70%; paralyze 22% 1.5s; each head targets different foe","28 dmg","36 dmg","46 dmg","Arc all 100%; paralyze 32% 2s; stun on paralyze 0.5s; each arc chains to 2 more"]},
     special:{name:"Lightning Regen",charge:22,upgrades:["Regrow 1 head; +12% ATK+8% DEF per head; release 60 dmg lightning burst per head","Burst 75 dmg per head","Burst 94 dmg","Burst 118 dmg","Burst 148 dmg; also paralyze all nearby 2s; instantly regrow to 6 heads"]},
     unique:{name:"Thunder Regen",upgrades:["Passive: regrow 1 head/7s (max 6); each head +14% ATK+10% DEF+arc aura 20/s+paralyze 12%/s; lightning zone at all times","Head +18%+13%; aura 26/s; paralyze 16%/s","Head +22%+16%; aura 34/s; paralyze 21%/s","Head +28%+20%; aura 44/s; paralyze 27%/s","Head +35%+25%; aura 56/s; paralyze 35%/s; at 6 heads immune to electric dmg; revives once regrowing all heads+EMP 300 dmg all"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"stormhydra"},
  {id:"stormhydra",name:"Arcmajor",emoji:"🐉",type:"Electric",rarity:"legendary",description:"Thunderhydra's final form. Nine heads, nine storms. Meteorologists have collectively retired.",
   stats:{hp:132,atk:146,def:96,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Storm Bite",upgrades:["35 dmg+arc all 100%; paralyze 40% 2.5s; stun 1s on paralyze; all 9 heads attack; each chain to all","44 dmg","56 dmg","70 dmg","Paralyze 55% 3s; stun 1.5s; each arc also strips 1 buff; arcs deal full dmg to all"]},
     special:{name:"World Lightning",charge:16,upgrades:["Release 9-head lightning; 120 dmg per head to 1 foe each; stun all 2s; regrow to 9 heads","150 dmg per head","188 dmg","235 dmg","295 dmg; all enemies paralyzed 3s+stripped all buffs; heal all allies 80 HP; all lightning arcs chain to each other"]},
     unique:{name:"Storm Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +42% ATK+30% DEF+arc aura 68/s+paralyze 40%/s; 9 heads: immune to all electric; EMP every 8s 150 dmg+stun 2s all","Head +52%+38%; aura 86/s; 190 dmg EMP","Head +65%+48%; aura 108/s; 238 dmg","Head +80%+60%; aura 135/s; 298 dmg","Head +100%+75%; aura 170/s; 375 dmg; Stormhydra revives 3 times each EMP stunning all enemies 5s+dealing 500 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"thunderhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 2
  {id:"voltphoenix",name:"Arcsurge",emoji:"🦅",type:"Electric",rarity:"legendary",description:"A phoenix that died in a lightning bolt and came back as one. Power grids nationwide have filed grievances.",
   stats:{hp:102,atk:105,def:57,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Arc Feather",upgrades:["22 dmg+arc all 65%+paralyze 18% 1.5s; each arc chains once","28 dmg","36 dmg","46 dmg","Arc 85%; paralyze 26% 2s; stun 0.5s; chains to all in range"]},
     special:{name:"Volt Rebirth",charge:18,upgrades:["Become lightning; emerge 3s later full HP; EMP 150 dmg+stun 2s+paralyze all 3s on emerge","Emerge EMP 188 dmg","Emerge 235 dmg","Emerge 294 dmg","Emerge 368 dmg; EMP disables all abilities 5s; strip all buffs; allies gain +45% electric dmg 6s"]},
     unique:{name:"Electric Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: EMP stun all 3s+paralyze all 4s+arc all 100% 200 dmg; +38% ATK; immune to all electric","Revival +48%; EMP 225 dmg","Revival +60%; EMP 250 dmg","Revival +75%; EMP 280 dmg","Revival +94%; EMP 312 dmg; 3rd revival: become permanent lightning form dealing 100/s to all enemies; allies immune"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"arcphoenix"},
  {id:"arcphoenix",name:"Arcondor",emoji:"🌩️",type:"Electric",rarity:"legendary",description:"Voltphoenix's true form. Pure electricity given feathers and a bad attitude toward things that conduct poorly.",
   stats:{hp:122,atk:126,def:68,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Arc Feather",upgrades:["35 dmg+arc all 100%+paralyze 38% 2.5s; stun 1s; chains to all; stun on paralyze","44 dmg","56 dmg","70 dmg","Paralyze 52% 3s; stun 1.5s; each chain also arcs again; strip 1 buff per arc"]},
     special:{name:"Arc Rebirth",charge:20,upgrades:["Become arc; emerge 4s full HP; EMP 240 dmg+stun 3s+paralyze all 5s+disable abilities 6s on emerge","Emerge 300 dmg","Emerge 375 dmg","Emerge 469 dmg","Emerge 586 dmg; strip all buffs; allies immune to electric 8s+gain +60% ATK 5s; Arcphoenix also gains +55% ATK 5s"]},
     unique:{name:"Arc Sovereign",upgrades:["Passive: revives endlessly; each revival: EMP stun all 5s+paralyze 6s+arc 100% 320 dmg; +52% ATK per revival; permanent arc storm 80/s","Revival +65%; storm 100/s","Revival +80%; storm 125/s","Revival +100%; storm 156/s","Revival +125%; storm 195/s; Arcphoenix permanently arcs to all enemies every second for 100 dmg; untargetable between attacks"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 3
  {id:"galvanigolem",name:"Galvatus",emoji:"🤖",type:"Electric",rarity:"legendary",description:"An ancient war golem rebuilt with a lightning core. Its builders are long gone. It is still very much operational.",
   stats:{hp:169,atk:86,def:133,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Thunder Fist",upgrades:["20 dmg+shock 18/s 3s+stagger 0.5s; arc 2 nearby 60%","26 dmg","33 dmg","42 dmg","Shock 26/s 4s; stagger 1s; paralyze 18% 1.5s; arc all 70%"]},
     special:{name:"Electric Ward",charge:22,upgrades:["DEF+130+electric field 35/s 7s+paralyze 20%/s; immune to paralysis+stun","DEF+165; paralyze 26%/s","DEF+206; paralyze 33%/s","DEF+258; paralyze 42%/s","DEF+322; paralyze 54%/s 8s; field also disables abilities 2s on entry; allies immune to electric"]},
     unique:{name:"Thunder Core",upgrades:["Passive: -30 all dmg; electric field always active 44/s+paralyze 28%/s; charges max 12; each charge +18 dmg to next attack; gain 1 charge/3s; release burst 220 dmg+paralyze all 3s","Reduce 38; field 56/s; burst 275","Reduce 48; field 70/s; burst 344","Reduce 60; field 88/s; burst 430","Reduce 76; field 110/s; burst 538; CC immune; revives 3 times each EMP stunning all enemies 6s+dealing 600 dmg"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"staticgolem"},
  {id:"staticgolem",name:"Arcvast",emoji:"🌩️",type:"Electric",rarity:"legendary",description:"Galvanigolem's final form. A walking thunderstorm in metal armor. Nations have tried to weaponize it. Nations have failed.",
   stats:{hp:203,atk:103,def:160,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Lightning Fist",upgrades:["32 dmg+shock 28/s 4s+stagger 1.5s; paralyze 30% 2s; arc all 90%","40 dmg","50 dmg","64 dmg","Shock 40/s 5s; stagger 2s+stun 0.5s; paralyze 44% 2.5s; arc all 100%+chain twice"]},
     special:{name:"Static Fortress",charge:8,upgrades:["DEF+200+electric field 56/s 9s+paralyze 44%/s; immune CC; disable on entry 3s; allies -40% dmg taken","DEF+250; allies -50%","DEF+312; paralyze 56%/s; allies -62%","DEF+390; allies -76%","DEF+488; paralyze 70%/s 10s; allies -94% (near immune); field also stuns on entry 1s; reflect 50% all dmg"]},
     unique:{name:"Static Sovereign",upgrades:["Passive: -48 all dmg; field 110/s+paralyze 56%/s; CC immune; charges max 16; each charge +22 dmg; gain 1 charge/2s; release burst 420 dmg+stun 5s+disable 6s all","Reduce 60; field 138/s; burst 525","Reduce 76; field 172/s; burst 656","Reduce 96; field 215/s; burst 820","Reduce 120; field 270/s; burst 1025; Staticgolem immune to all dmg while charging; revives 3 times each world EMP dealing 700 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"galvanigolem",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 2
  {id:"solarphoenix",name:"Dawnwing",emoji:"🔥",type:"Light",rarity:"legendary",description:"A phoenix made of solar plasma. It exists at the intersection of light, heat, and 'please don't look directly at it.'",
   stats:{hp:111,atk:96,def:71,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Solar Feather",upgrades:["24 dmg+blind 22% 2s; heal all allies 16 HP; arc 3 foes","30 dmg; heal 20","38 dmg; heal 26","48 dmg; heal 33","Solar burst: blind all 3s; heal all 55 HP; arc all; strip 1 buff per arc"]},
     special:{name:"Solar Rebirth",charge:18,upgrades:["Become solar flare; emerge 3s later full HP; 120 dmg+blind all 4s; heal all allies 80 HP","Emerge 150 dmg; heal 100","Emerge 188 dmg; heal 125","Emerge 235 dmg; heal 156","Emerge 294 dmg; blind 5s; heal 195; grant all allies invincible 2s; revive 1 fallen ally 30% HP"]},
     unique:{name:"Solar Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: blind all 5s+heal all allies 200 HP+grant invincible 2s; light dmg +40%; heals +35%","Light +50%; heals +44%","Light +62%; heals +55%","Light +76%; heals +68%","Light +94%; heals +84%; Solarphoenix immune to all blind; crits always heal all allies 55 HP; revives at full power"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"divinephoenix"},
  {id:"divinephoenix",name:"Celestialis",emoji:"☀️",type:"Light",rarity:"legendary",description:"Solarphoenix ascended to true divinity. It can no longer be described using standard luminosity measurements.",
   stats:{hp:133,atk:116,def:85,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Divine Feather",upgrades:["38 dmg+blind 38% 3s; heal all 28 HP; arc all; each arc heals 1 ally 18 HP","48 dmg; heal 36/22","60 dmg; heal 46/28","74 dmg; heal 58/36","Divine burst: blind all 5s; heal all 92 HP; each arc heals all allies 46 HP; strip all buffs from each hit"]},
     special:{name:"Divine Rebirth",charge:14,upgrades:["Become divine light; emerge 4s full HP; 192 dmg+blind all 6s; heal all 160 HP+invincible 3s; revive 1 fallen 40%","Emerge 240; heal 200; revive 2","Emerge 300; heal 250; revive 2 at 50%","Emerge 375; heal 312; revive 3 at 55%","Emerge 469; heal 390; revive all at 65%; grant all +45% all stats 8s; full cleanse"]},
     unique:{name:"Divine Sovereign",upgrades:["Passive: revives endlessly; each revival: blind all 8s+heal all 350 HP+invincible 3s+revive 1 fallen 50%; light +60%; heals +55%; immune to all blind","Light +75%; heals +68%; revive 2 per revival","Light +94%; heals +84%; revive 3","Light +116%; heals +104%; revive all at 60%","Light +144%; heals +128%; revive all at 80%; Divinephoenix immune to all dmg while any ally is alive; can never be killed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"solarphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 3
  {id:"holydragon",name:"Auravast",emoji:"🐲",type:"Light",rarity:"legendary",description:"A dragon born in a beam of divine light. It guards sacred places and heals anyone who approaches. Even enemies.",
   stats:{hp:154,atk:79,def:122,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Radiance",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Sovereign Call",charge:16,upgrades:["Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +10% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +15% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage","Taunt an enemy and call a nearby ally to Assist. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage"]},
     unique:{name:"Sworn Guard",upgrades:["Whenever an ally within range is attacked, target that enemy and deal 20% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 30% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 40% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, instantly refresh this creature's Special ability, target that enemy, and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"celestialdragon"},
  {id:"celestialdragon",name:"Lumimajor",emoji:"🐉",type:"Light",rarity:"legendary",description:"Holydragon's celestial final form. A dragon of pure starlight and divine grace. Its very presence is a blessing.",
   stats:{hp:186,atk:94,def:146,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Twin Radiance",upgrades:["12 dmg","13 dmg","15 dmg","17 dmg","17 dmg and inflict Defense Down"]},
     special:{name:"Sovereign Call",charge:16,upgrades:["Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +10% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +15% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +10% Critical Damage","Taunt an enemy. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage","Taunt an enemy and call a nearby ally to Assist. If there are no Tauntable enemies, this creature gains an Aura granting all allies within it +20% Attack and +20% Critical Damage"]},
     unique:{name:"Sworn Guard",upgrades:["Whenever an ally within range is attacked, target that enemy and deal 20% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 30% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 40% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, target that enemy and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated","Whenever an ally within range is attacked, instantly refresh this creature's Special ability, target that enemy, and deal 50% extra damage against it. This effect can not trigger again until that enemy is defeated"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"holydragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 1
  {id:"voidhydra",name:"Abyssmaw",emoji:"🐲",type:"Dark",rarity:"legendary",description:"A hydra that feeds on the void between stars. Each head has eaten a different constellation and is still hungry.",
   stats:{hp:114,atk:124,def:80,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Void Bite",upgrades:["22 dmg+silence 1.5s+drain 18 HP; each head targets different foe","28 dmg","36 dmg","46 dmg","Silence 2s; drain 26 HP; strip 2 buffs; all heads attack; drain distributes to all allies"]},
     special:{name:"Dark Regen",charge:14,upgrades:["Regrow 1 head; +12% ATK+10% DEF; heal self 85 HP; release void burst 55 dmg+silence all 2s","Heal 108; burst 70","Heal 135; burst 88","Heal 168; burst 110","Heal 210; burst 138; regrow to 7 heads; also drain 40% of all enemies' HP"]},
     unique:{name:"Void Sovereign",upgrades:["Passive: regrow 1 head/7s (max 7); each head +14% ATK+12% DEF+void aura 20/s; drain aura 18/s all enemies; silence 1s every 4s per head","Head +18%+15%; aura 26/s; drain 24/s","Head +22%+18%; aura 34/s; drain 32/s","Head +28%+22%; aura 44/s; drain 42/s","Head +35%+28%; aura 56/s; drain 55/s; at 7 heads immune to all dmg 2s every 5s; revives once regrowing all heads+consuming 50% of all enemy HP"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"nihilhydra"},
  {id:"nihilhydra",name:"Nullravene",emoji:"🐉",type:"Dark",rarity:"legendary",description:"Voidhydra's final form. The nothing between galaxies given nine heads and a purpose. The purpose is unclear. It is likely terrible.",
   stats:{hp:136,atk:149,def:97,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Nihil Bite",upgrades:["35 dmg+silence 2.5s+drain 35 HP; all 9 heads hit all enemies; strip 3 buffs each","44 dmg","56 dmg","70 dmg","Silence 3.5s; drain 50 HP; drain distributes to all allies; drained HP becomes permanent bonus HP"]},
     special:{name:"Annihilation Regen",charge:22,upgrades:["Instant 9 heads; full HP; release void wave 120 dmg+silence all 4s+drain 40% all HP","Drain 50% HP","Drain 60% HP","Drain 72% HP","Drain 85% HP; wave also strips all buffs; heal all allies full HP; grant all invincible 2s; permanent drain aura 80/s"]},
     unique:{name:"Nihil Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +42% ATK+35% DEF+void aura 68/s; drain aura 55/s all; 9 heads: immune to all dmg; silence 2s/4s per head","Head +52%+44%; aura 86/s; drain 70/s","Head +65%+55%; aura 108/s; drain 88/s","Head +80%+68%; aura 135/s; drain 110/s","Head +100%+85%; aura 170/s; drain 138/s; Nihilhydra revives 3 times each consuming 70% of all enemy HP and distributing it to all allies"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 2
  {id:"darkphoenix",name:"Umbravex",emoji:"🦅",type:"Dark",rarity:"legendary",description:"A phoenix that died in the void and came back wrong. It still heals — the void just considers it 'anti-life.'",
   stats:{hp:103,atk:107,def:58,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Shadow Feather",upgrades:["22 dmg+silence 1s+drain 14 HP; crit from stealth; arc 3 foes","28 dmg","36 dmg","46 dmg","Silence 1.5s; drain 20 HP; arc all; strip 1 buff per arc; drain distributes to allies"]},
     special:{name:"Void Rebirth",charge:8,upgrades:["Become void; emerge 3s later full HP+stealth 4s; 110 dmg void wave+silence all 3s on emerge","Emerge 138 dmg","Emerge 172 dmg","Emerge 215 dmg","Emerge 269 dmg; silence 4s; strip all buffs; drain 30% all HP on emerge; allies healed by drain amount"]},
     unique:{name:"Dark Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: stronger +38% ATK; void wave 150 dmg+silence all 5s+drain 40% HP; stealth 4s after revival","Revival +48%; wave 188 dmg; drain 50%","Revival +60%; wave 235; drain 60%","Revival +75%; wave 294; drain 72%","Revival +94%; wave 368; drain 85%; 3rd revival: permanent dark form; immune to all targeting unless attacking; always crits; silent all enemies permanently"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"oblivionphoenix"},
  {id:"oblivionphoenix",name:"Nihilvour",emoji:"🌑",type:"Dark",rarity:"legendary",description:"Darkphoenix's true form. Oblivion given wings. The concept of light files a restraining order and loses.",
   stats:{hp:124,atk:128,def:70,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Oblivion Feather",upgrades:["35 dmg+silence 2s+drain 28 HP; always crit from stealth; arc all at 100%; drain to all allies","44 dmg","56 dmg","70 dmg","Silence 3s; drain 40 HP; strip 2 buffs per arc; stealth crits deal +80% bonus dmg"]},
     special:{name:"Oblivion Rebirth",charge:20,upgrades:["Become oblivion; emerge 4s full HP+stealth 6s; 175 dmg void wave+silence all 5s+drain 50% all HP on emerge; strip all buffs","Emerge 219 dmg; drain 62%","Emerge 274 dmg; drain 76%","Emerge 342 dmg; drain 92%","Emerge 428 dmg; silence 6s; drain 100% (consume); allies gain all drained HP; revive 1 fallen 45% HP"]},
     unique:{name:"Oblivion Sovereign",upgrades:["Passive: revives endlessly; each revival: void wave 280 dmg+silence all 7s+drain 80% HP+stealth 6s; immune to all dmg+targeting between attacks; crits always deal +100% bonus dmg","Wave 350+silence 8s+drain 100%","Wave 438+silence 9s","Wave 547+10s","Wave 684+11s; Oblivionphoenix can never be permanently killed; each revival removes 1 random ability from each enemy permanently"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"darkphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 3
  {id:"abyssgolem",name:"Loptrix",emoji:"🦊",type:"Dark",rarity:"legendary",description:"A fox that is never quite where you last saw it. It has been formally banished from four separate pantheons, which it regards as a personal best.",
   stats:{hp:114,atk:101,def:79,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mocking Nip",upgrades:["20 dmg","26 dmg","33 dmg","42 dmg","42 dmg and inflict Defense Down"]},
     special:{name:"Scapegoat",charge:24,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","95 dmg"]},
     unique:{name:"Vanishing Act",upgrades:["Gain 70% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 80% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 90% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able and dispel all debuffs on self."]}
   },role:"Support",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:5,evolutionId:"nihilgolem"},
  {id:"nihilgolem",name:"Ragnavix",emoji:"🌘",type:"Dark",rarity:"legendary",description:"Loptrix at the height of its mischief, no longer bothering to hold a single shape. It once talked an entire army into fighting itself and left before anyone noticed. Nothing has ever been proven.",
   stats:{hp:136,atk:122,def:95,spd:1,abilitySpeed:1,crit:4,critDmg:30},
   abilities:{
     basic:{name:"Mocking Nip",upgrades:["20 dmg","26 dmg","33 dmg","42 dmg","42 dmg and inflict Defense Down"]},
     special:{name:"Scapegoat",charge:24,upgrades:["40 dmg","50 dmg","62 dmg","78 dmg","95 dmg"]},
     unique:{name:"Vanishing Act",upgrades:["Gain 70% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 80% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 90% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able.","Gain 100% Ability Charge at the start of the fight. When falling below 30% Health, teleport next to a Ranged ally if able and dispel all debuffs on self."]}
   },role:"Support",attackType:"Melee",evolutionOf:"abyssgolem",shardsToAscend:30,ascensionsToEvolve:null},
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
 * Stand-in for content whose creature has been retired, until the real
 * replacements land. Battle-only like the two above, so it never shows up in
 * the Dex, hatches, or the collection.
 *
 * It has no ability module (see battle/playerAbilities/registry.js), which is
 * exactly the behavior asked for: the engine's default flow walks it at the
 * nearest enemy and swings, its special has no `charge` and no module so it
 * never fires (and shows no ⚡ pill), and its passive is text only.
 */
CREATURE_MAP["__placeholder"]={id:"__placeholder",emoji:"❔",name:"Placeholder",type:"Nature",rarity:"common",role:"Attacker",attackType:"Melee",stats:{hp:80,atk:83,def:45,spd:1,abilitySpeed:1,crit:4,critDmg:30},abilities:{basic:{name:"Placeholder Strike",upgrades:["20 dmg","20 dmg","20 dmg","20 dmg","20 dmg"]},special:{name:"Placeholder Special",upgrades:["Does nothing","Does nothing","Does nothing","Does nothing","Does nothing"]},unique:{name:"Placeholder Passive",upgrades:["Does nothing","Does nothing","Does nothing","Does nothing","Does nothing"]}}};

/**
 * Retired evolution lines, removed from the roster ahead of their
 * replacements: Whirlbug, Squallhawk, Shimmerfly, Buzzwig, Shockbeetle,
 * Teneboad, Wraithworm, Sparkit, Boltfly, Eclipseboa, Pulvicrawl and
 * Venomviper. Each id still resolves -- to its own copy of the placeholder,
 * keeping its id so save records stay addressable -- so an existing save
 * that owns one renders it as the Placeholder instead of breaking on a
 * missing definition. Delete these once the replacement creatures exist.
 */
export const RETIRED_CREATURE_IDS=["whirlbug","cyclonbug","vortexbug","typhoonid","squallhawk","galebeak","strikewing","stormraptor","shimmerfly","lumiwing","brightclaw","celestipaw","buzzwig","zaptail","shockfang","stormhorn","shockbeetle","voltbeetle","arcbeetle","dynamid","gloomtoad","voidtoad","shadowtoad","erebotoad","wraithworm","phantomworm","voidwyrm","nihilmamba","sparkpup","voltkit","thunderpaw","boltlion","boltfly","arcbolt","zapdragon","eclipseboa","voidboa","darkhydra","dustcrawler","sandcrawler","dunekraken","venomviper","toxicserpent","poisonwyrm","ophidrax"];
for(const id of RETIRED_CREATURE_IDS) CREATURE_MAP[id]={...CREATURE_MAP["__placeholder"],id};

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