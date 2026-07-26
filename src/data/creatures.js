// Creature roster: every species definition, its evolution links, and derived lookups.
// Evolution chains are a doubly-linked list of ids via `evolutionOf` (back) and
// `evolutionId` (forward); walk them with the helpers in src/core/creatures.js.

export const CREATURES=[
  {id:"emberpup",name:"Emberpup",emoji:"🐶",type:"Fire",rarity:"common",description:"A scrappy fire pup that chases its own tail, sometimes igniting it.",
   stats:{hp:42,atk:35,def:28,spd:55,abilitySpeed:40},
   abilities:{
     basic:{name:"Spark Bite",upgrades:["Deals 10 fire damage","Deals 14 fire damage","Deals 18 fire damage","Deals 23 fire damage","Burns target for 4s, dealing 5 dmg/s"]},
     special:{name:"Tail Spin",upgrades:["Hits nearby foes for 12 damage","Hits for 17 damage","Hits for 22 damage","Hits for 28 damage","Knocks all nearby foes airborne briefly"]},
     unique:{name:"Ember Coat",upgrades:["Passive: reduces fire damage taken by 5%","Reduces fire damage taken by 10%; deals 3 fire dmg to attackers","Reduces fire damage taken by 15%; deals 5 fire dmg to attackers","Reduces fire damage taken by 20%; deals 8 fire dmg to attackers","Reduces fire damage taken by 30%; deals 12 fire dmg to attackers and briefly burns them"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"emberhound"},
  {id:"emberhound",name:"Emberhound",emoji:"🔥",type:"Fire",rarity:"common",description:"Emberpup fully grown. Mane is permanently on fire. Still chases its tail.",
   stats:{hp:70,atk:60,def:48,spd:72,abilitySpeed:62},
   abilities:{
     basic:{name:"Spark Bite",upgrades:["Deals 10 fire damage","Deals 14 fire damage","Deals 18 fire damage","Deals 23 fire damage","Burns target for 4s, dealing 5 dmg/s"]},
     special:{name:"Tail Spin",upgrades:["Hits nearby foes for 12 damage","Hits for 17 damage","Hits for 22 damage","Hits for 28 damage","Knocks all nearby foes airborne briefly"]},
     unique:{name:"Blaze Coat",upgrades:["Passive: reduces fire damage taken by 15%; deals 8 fire dmg to attackers","Reduces fire damage by 20%; deals 12 fire dmg to attackers","Reduces fire damage by 25%; deals 16 fire dmg to attackers","Reduces fire damage by 30%; deals 20 fire dmg to attackers and burns them","Reduces fire damage by 40%; deals 28 fire dmg to attackers and ignites the ground around Emberhound briefly"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"infernoking"},
  {id:"leafling",name:"Leafling",emoji:"🌿",type:"Nature",rarity:"common",description:"A tiny sprout that draws energy from sunlight and morning dew.",
   stats:{hp:50,atk:22,def:40,spd:35,abilitySpeed:55},
   abilities:{
     basic:{name:"Vine Whip",upgrades:["Deals 8 damage","Deals 12 damage","Deals 16 damage","Deals 21 damage","Has a 25% chance to entangle for 2s"]},
     special:{name:"Root Trap",upgrades:["Slows foes 20%","Slows foes 30%","Slows foes 40%","Slows foes 50%","Roots foes in place for 2s instead of slowing"]},
     unique:{name:"Photosynthesis",upgrades:["Passive: regenerates 1 HP/s in battle","Regenerates 2 HP/s","Regenerates 3 HP/s; regen doubles when below 50% HP","Regenerates 4 HP/s; regen doubles when below 50% HP","Regenerates 6 HP/s; regen triples when below 30% HP"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"canoparch"},
  {id:"canoparch",name:"Canoparch",emoji:"🌳",type:"Nature",rarity:"common",description:"An ancient tree-creature whose roots crack stone and topple towers.",
   stats:{hp:85,atk:42,def:72,spd:28,abilitySpeed:68},
   abilities:{
     basic:{name:"Vine Whip",upgrades:["Deals 8 damage","Deals 12 damage","Deals 16 damage","Deals 21 damage","Has a 25% chance to entangle for 2s"]},
     special:{name:"Root Trap",upgrades:["Slows foes 20%","Slows foes 30%","Slows foes 40%","Slows foes 50%","Roots foes in place for 2s instead of slowing"]},
     unique:{name:"Ancient Bark",upgrades:["Passive: after taking damage, gains +8 DEF for 3s","After taking damage, gains +14 DEF for 3s","After taking damage, gains +20 DEF for 4s","After taking damage, gains +28 DEF for 4s; effect stacks twice","After taking damage, gains +36 DEF for 5s; stacks three times and also reduces incoming damage by 10%"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"leafling",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"verdantlord"},
  {id:"pebbit",name:"Pebbit",emoji:"🪨",type:"Earth",rarity:"common",description:"A round little rock rabbit. Surprisingly difficult to step on.",
   stats:{hp:60,atk:20,def:60,spd:25,abilitySpeed:30},
   abilities:{
     basic:{name:"Rock Toss",upgrades:["Deals 9 damage","Deals 13 damage","Deals 18 damage","Deals 24 damage","Stuns target for 0.5s on hit"]},
     special:{name:"Stone Shell",upgrades:["+15 DEF for 3s","+22 DEF for 3s","+30 DEF for 3s","+38 DEF for 4s","Also reflects 20% of damage taken during buff"]},
     unique:{name:"Stone Skin",upgrades:["Passive: reduces all damage taken by 2","Reduces all damage taken by 4","Reduces all damage taken by 6","Reduces all damage taken by 8; also reduces crit damage by 20%","Reduces all damage taken by 12; also reduces crit damage by 35% and has a 10% chance to fully negate a hit"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:4,evolutionId:"bouldrath"},
  {id:"bouldrath",name:"Bouldrath",emoji:"⛰️",type:"Earth",rarity:"common",description:"A pebbit that reached mountain scale. Geologists are baffled.",
   stats:{hp:110,atk:40,def:100,spd:18,abilitySpeed:28},
   abilities:{
     basic:{name:"Rock Toss",upgrades:["Deals 9 damage","Deals 13 damage","Deals 18 damage","Deals 24 damage","Stuns target for 0.5s on hit"]},
     special:{name:"Stone Shell",upgrades:["+15 DEF for 3s","+22 DEF for 3s","+30 DEF for 3s","+38 DEF for 4s","Also reflects 20% of damage taken during buff"]},
     unique:{name:"Titan Resilience",upgrades:["Passive: reduces all damage taken by 10","Reduces all damage taken by 16","Reduces all damage taken by 22; immune to knockback","Reduces all damage taken by 28; immune to knockback and stun","Reduces all damage taken by 35; immune to all crowd control; reflects 15% of blocked damage"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"pebbit",shardsToAscend:10,ascensionsToEvolve:5,evolutionId:"granitarch"},
  {id:"breezekit",name:"Breezekit",emoji:"💨",type:"Wind",rarity:"common",description:"Always in motion, this breezy critter can outrun most predators easily.",
   stats:{hp:38,atk:30,def:22,spd:80,abilitySpeed:65},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["Deals 10 dmg","Deals 14 dmg","Deals 18 dmg","Deals 24 dmg","Pushes target back 1 tile"]},
     special:{name:"Tail Wind",upgrades:["+20 SPD for 3s","+28 SPD","+36 SPD","+45 SPD","Also boosts nearby allies speed by 15"]},
     unique:{name:"Slipstream",upgrades:["Passive: nearby allies gain +8 SPD","Nearby allies gain +14 SPD","Nearby allies gain +20 SPD","Nearby allies gain +26 SPD; Breezekit also gains +10 SPD","Nearby allies gain +35 SPD; Breezekit gains +18 SPD; allies also gain +5% dodge chance"]}
   },role:"Support",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"galestride"},
  {id:"galestride",name:"Galestride",emoji:"🌪️",type:"Wind",rarity:"common",description:"A fully grown Breezekit that leaves mini-tornadoes as footprints.",
   stats:{hp:62,atk:55,def:38,spd:115,abilitySpeed:90},
   abilities:{
     basic:{name:"Gust Swipe",upgrades:["Deals 10 dmg","Deals 14 dmg","Deals 18 dmg","Deals 24 dmg","Pushes target back 1 tile"]},
     special:{name:"Tail Wind",upgrades:["+20 SPD for 3s","+28 SPD","+36 SPD","+45 SPD","Also boosts nearby allies speed by 15"]},
     unique:{name:"Storm Presence",upgrades:["Passive: nearby allies gain +20 SPD and +5% dodge","Nearby allies gain +28 SPD and +8% dodge","Nearby allies gain +36 SPD and +12% dodge","Nearby allies gain +45 SPD and +15% dodge; Galestride also gains +15 SPD","Nearby allies gain +55 SPD and +20% dodge; Galestride gains +25 SPD; allies leave brief wind trails when they move"]}
   },role:"Support",attackType:"Melee",evolutionOf:"breezekit",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"tempesthawk"},
  // Fire line 1 extensions
  {id:"infernoking",name:"Infernoking",emoji:"🦁",type:"Fire",rarity:"common",description:"A blazing lion whose roar sets the sky ablaze. Even its shadow burns.",
   stats:{hp:95,atk:82,def:65,spd:95,abilitySpeed:82},
   abilities:{
     basic:{name:"Flame Claw",upgrades:["18 dmg","24 dmg","31 dmg","40 dmg","Leaves a burning mark; next hit deals +20% dmg"]},
     special:{name:"Inferno Surge",upgrades:["ATK +25% for 4s","ATK +35% for 4s","ATK +45% for 5s","ATK +55% for 5s","Also burns nearby enemies for 8 dmg/s"]},
     unique:{name:"Blazing Mane",upgrades:["Passive: fire damage dealt +10%","Fire damage +16%","Fire damage +22%; attackers take 8 fire dmg","Fire damage +28%; attackers take 14 fire dmg","Fire damage +35%; attackers take 20 fire dmg and are burned for 2s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberhound",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"ashmonarch"},
  {id:"ashmonarch",name:"Ashmonarch",emoji:"👑",type:"Fire",rarity:"common",description:"The apex of the Emberpup line. Its crown of ash is said to contain the last embers of a dying star.",
   stats:{hp:125,atk:110,def:88,spd:120,abilitySpeed:108},
   abilities:{
     basic:{name:"Flame Claw",upgrades:["18 dmg","24 dmg","31 dmg","40 dmg","Leaves a burning mark; next hit deals +20% dmg"]},
     special:{name:"Inferno Surge",upgrades:["ATK +25% for 4s","ATK +35% for 4s","ATK +45% for 5s","ATK +55% for 5s","Also burns nearby enemies for 8 dmg/s"]},
     unique:{name:"Ash Sovereign",upgrades:["Passive: fire attacks Ignite for 5 dmg/s for 3s","Ignite 8 dmg/s for 3s","Ignite 11 dmg/s for 4s","Ignite 15 dmg/s for 4s","Ignite 20 dmg/s for 5s; ignited foes have -15% DEF"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"infernoking",shardsToAscend:18,ascensionsToEvolve:null},

  // Nature line 1 extensions
  {id:"verdantlord",name:"Verdantlord",emoji:"🌲",type:"Nature",rarity:"common",description:"Canoparch grown into a walking forest. Villages have been built on its back.",
   stats:{hp:118,atk:58,def:102,spd:35,abilitySpeed:98},
   abilities:{
     basic:{name:"Branch Smash",upgrades:["20 dmg","27 dmg","34 dmg","44 dmg","Roots target for 1s"]},
     special:{name:"Forest Bloom",upgrades:["Heals ally 25 HP","Heals 35 HP","Heals 45 HP; removes 1 debuff","Heals 58 HP; removes all debuffs","Heals all allies 30 HP; all gain regen 5 HP/s for 4s"]},
     unique:{name:"Living Canopy",upgrades:["Passive: all allies regen 2 HP/s","All allies regen 4 HP/s","All allies regen 6 HP/s; Nature moves deal +8% dmg","All allies regen 8 HP/s; +12% Nature dmg","All allies regen 12 HP/s; +18% Nature dmg; allies revive once with 15% HP"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"canoparch",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"ancientgrove"},
  {id:"ancientgrove",name:"Ancientgrove",emoji:"🏔️",type:"Nature",rarity:"common",description:"So old its age is unmeasurable. The first forests grew from seeds it scattered.",
   stats:{hp:158,atk:78,def:135,spd:42,abilitySpeed:128},
   abilities:{
     basic:{name:"Branch Smash",upgrades:["20 dmg","27 dmg","34 dmg","44 dmg","Roots target for 1s"]},
     special:{name:"Forest Bloom",upgrades:["Heals ally 25 HP","Heals 35 HP","Heals 45 HP; removes 1 debuff","Heals 58 HP; removes all debuffs","Heals all allies 30 HP; all gain regen 5 HP/s for 4s"]},
     unique:{name:"Primordial Roots",upgrades:["Passive: reduce all incoming dmg to allies by 5","Reduce by 8","Reduce by 11","Reduce by 15","Reduce by 20; allies gain +10% max HP"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"verdantlord",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 1 extensions
  {id:"granitarch",name:"Granitarch",emoji:"🗿",type:"Earth",rarity:"common",description:"A Bouldrath that hardened over centuries underground. Geologists weep at the sight.",
   stats:{hp:155,atk:58,def:138,spd:22,abilitySpeed:42},
   abilities:{
     basic:{name:"Granite Slam",upgrades:["22 dmg","30 dmg","38 dmg","48 dmg","Sends shockwave knocking back nearby foes"]},
     special:{name:"Stone Fortress",upgrades:["DEF +40 for 5s","DEF +58 for 5s","DEF +76 for 6s","DEF +95 for 6s","Also reflects 20% of damage absorbed during fortress"]},
     unique:{name:"Granite Core",upgrades:["Passive: reduce all damage taken by 14","Reduce by 20","Reduce by 26; immune to knockback and stun","Reduce by 33; immune to CC","Reduce by 42; CC immunity; reflect 20% of damage blocked"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"bouldrath",shardsToAscend:14,ascensionsToEvolve:5,evolutionId:"mountainking"},
  {id:"mountainking",name:"Mountainking",emoji:"🏔️",type:"Earth",rarity:"common",description:"Living mountain. The peak on its back has a permanent snow cap and its own weather system.",
   stats:{hp:205,atk:78,def:182,spd:16,abilitySpeed:48},
   abilities:{
     basic:{name:"Granite Slam",upgrades:["22 dmg","30 dmg","38 dmg","48 dmg","Sends shockwave knocking back nearby foes"]},
     special:{name:"Stone Fortress",upgrades:["DEF +40 for 5s","DEF +58 for 5s","DEF +76 for 6s","DEF +95 for 6s","Also reflects 20% of damage absorbed during fortress"]},
     unique:{name:"Unshakable Peak",upgrades:["Passive: reduce all dmg taken by 22; allies behind Mountainking take -10% dmg","Reduce 30; -15% for allies","Reduce 38; -20% for allies","Reduce 48; -25% for allies; immune to all CC","Reduce 58; -30% for allies; CC immune; revive once at 25% HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"granitarch",shardsToAscend:18,ascensionsToEvolve:null},
  // Wind line 1 extensions
  {id:"tempesthawk",name:"Tempesthawk",emoji:"🦅",type:"Wind",rarity:"common",description:"A Galestride that grew wings of compressed air. Its wingbeats create gales felt miles away.",
   stats:{hp:88,atk:78,def:55,spd:152,abilitySpeed:122},
   abilities:{
     basic:{name:"Razor Wind",upgrades:["16 dmg","21 dmg","28 dmg","36 dmg","Hits twice in quick succession"]},
     special:{name:"Gale Aura",upgrades:["Allies gain +35 SPD for 4s","+50 SPD","+65 SPD","+80 SPD","Also grants +10% dodge and +12% Ability Speed"]},
     unique:{name:"Wind Rider",upgrades:["Passive: allies gain +45 SPD and +8% dodge","Allies +60 SPD +12% dodge","Allies +75 SPD +16% dodge","Allies +90 SPD +20% dodge; Tempesthawk +20 SPD","Allies +110 SPD +25% dodge; Tempesthawk +35 SPD; dodging attacks grants allies a burst of +15 SPD for 2s"]}
   },role:"Support",attackType:"Melee",evolutionOf:"galestride",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"stormlord"},
  {id:"stormlord",name:"Stormlord",emoji:"🌪️",type:"Wind",rarity:"common",description:"The apex of wind. Entire storm systems orbit it like satellites.",
   stats:{hp:115,atk:100,def:72,spd:195,abilitySpeed:155},
   abilities:{
     basic:{name:"Razor Wind",upgrades:["16 dmg","21 dmg","28 dmg","36 dmg","Hits twice in quick succession"]},
     special:{name:"Gale Aura",upgrades:["Allies gain +35 SPD for 4s","+50 SPD","+65 SPD","+80 SPD","Also grants +10% dodge and +12% Ability Speed"]},
     unique:{name:"Storm Sovereign",upgrades:["Passive: all allies gain +60 SPD +15% dodge; wind attacks ignore 15% of enemy DEF","Allies +78 SPD +20% dodge; ignore 22% DEF","Allies +96 SPD +25% dodge; ignore 28% DEF","Allies +118 SPD +30% dodge; ignore 35% DEF","Allies +140 SPD +35% dodge; ignore 42% DEF; each dodge triggers a wind burst dealing 30 dmg to the attacker"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tempesthawk",shardsToAscend:18,ascensionsToEvolve:null},
  // Fire line 2
  {id:"ashpup",name:"Cindervix",emoji:"🦊",type:"Fire",rarity:"common",description:"A quick fire vixen made of smoldering ash. Its footprints leave scorch marks wherever it runs.",
   stats:{hp:38,atk:44,def:22,spd:52,abilitySpeed:46},
   abilities:{
     basic:{name:"Ember Bite",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Burns target for 4 dmg/s for 2s"]},
     special:{name:"Ash Dash",upgrades:["Dodge next hit; +20 SPD","Dodge; +28 SPD","Dodge; +36 SPD","Dodge; +45 SPD; leave ash cloud that blinds enemies for 1s","Dodge; +55 SPD; ash cloud also slows enemies 20% for 2s"]},
     unique:{name:"Ash Trail",upgrades:["Passive: movement leaves ash that slows enemies 10%","Ash slows 15%","Ash slows 20% and reduces enemy ATK 8%","Ash slows 25% and reduces ATK 12%","Ash slows 30%; ATK -16%; ash ignites after 2s for 10 dmg/s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"cinderfox"},
  {id:"cinderfox",name:"Cinderfox",emoji:"🦊",type:"Fire",rarity:"common",description:"Cindervix grown into a cunning predator. Its tail is a whip of living flame.",
   stats:{hp:62,atk:70,def:38,spd:75,abilitySpeed:70},
   abilities:{
     basic:{name:"Ember Bite",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Burns target for 4 dmg/s for 2s"]},
     special:{name:"Ash Dash",upgrades:["Dodge next hit; +20 SPD","Dodge; +28 SPD","Dodge; +36 SPD","Dodge; +45 SPD; leave ash cloud","Dodge; +55 SPD; ash cloud also slows enemies 20%"]},
     unique:{name:"Flickering Form",upgrades:["Passive: 10% chance to dodge any hit","12% dodge chance","15% dodge chance; on dodge, counter for 18 dmg","18% dodge chance; counter for 25 dmg","22% dodge chance; counter for 35 dmg; counter also burns for 3s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"ashpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"scorchbeast"},
  {id:"scorchbeast",name:"Scorchvix",emoji:"🐻",type:"Fire",rarity:"common",description:"Cinderfox's ferocity given massive form. Its fur permanently crackles with orange fire.",
   stats:{hp:88,atk:95,def:58,spd:95,abilitySpeed:92},
   abilities:{
     basic:{name:"Ember Bite",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Burns for 4 dmg/s for 2s"]},
     special:{name:"Wildfire Charge",upgrades:["Charge; 45 dmg on impact","58 dmg","72 dmg","90 dmg","Knocks foe airborne for 1s"]},
     unique:{name:"Scorched Earth",upgrades:["Passive: fire attacks deal +15% dmg on burned targets","20%","26%","32%","40%; also removes 1 buff from burned enemies on hit"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cinderfox",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"emberlord"},
  {id:"emberlord",name:"Embervox",emoji:"🔥",type:"Fire",rarity:"common",description:"A fire titan wearing a mane of pure flame. Scorchbeast's final and most terrifying form.",
   stats:{hp:118,atk:128,def:78,spd:120,abilitySpeed:118},
   abilities:{
     basic:{name:"Ember Bite",upgrades:["10 dmg","13 dmg","17 dmg","22 dmg","Burns for 4 dmg/s for 2s"]},
     special:{name:"Wildfire Charge",upgrades:["Charge; 45 dmg on impact","58 dmg","72 dmg","90 dmg","Knocks airborne for 1s"]},
     unique:{name:"Ember Dominion",upgrades:["Passive: burning enemies take 20% more dmg from all sources","25%","30%","36%","42%; Emberlord gains +1% ATK for each second an enemy remains burning"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"scorchbeast",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 1
  {id:"droplette",name:"Droplette",emoji:"💧",type:"Water",rarity:"common",description:"A tiny water sprite no bigger than a raindrop. Its healing tears can soothe any wound.",
   stats:{hp:45,atk:22,def:38,spd:42,abilitySpeed:60},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Mist",upgrades:["Heal ally 20 HP","Heal 28 HP","Heal 38 HP","Heal 50 HP","Heal all allies 22 HP"]},
     unique:{name:"Rain Aura",upgrades:["Passive: all allies regen 1 HP/s","Regen 2 HP/s","Regen 3 HP/s","Regen 4 HP/s","Regen 5 HP/s; heal overflows as temporary shield"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"bubblin"},
  {id:"bubblin",name:"Bubblin",emoji:"🫧",type:"Water",rarity:"common",description:"A Droplette that has grown a protective bubble shell. It heals by popping mini bubbles.",
   stats:{hp:72,atk:35,def:62,spd:58,abilitySpeed:90},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Bubble Shield",upgrades:["Shield ally 30 HP","Shield 42 HP","Shield 55 HP","Shield 70 HP","Shield all allies 25 HP"]},
     unique:{name:"Bubble Burst",upgrades:["Passive: when shield breaks, heals wearer 15 HP","Heals 22 HP","Heals 30 HP; stuns attacker 0.5s","Heals 40 HP; stuns 0.5s","Heals 50 HP; stuns 1s; also deals 20 dmg to attacker"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"droplette",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"wavecrest"},
  {id:"wavecrest",name:"Wavecrest",emoji:"🌊",type:"Water",rarity:"common",description:"Bubblin evolved into a creature that rides its own waves. Heals by surf.",
   stats:{hp:102,atk:50,def:90,spd:74,abilitySpeed:115},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Tide",upgrades:["Heal all allies 30 HP","Heal 42 HP","Heal 55 HP","Heal 70 HP","Heal 85 HP; remove all debuffs from allies"]},
     unique:{name:"Surf Heal",upgrades:["Passive: abilities heal all allies 8 HP on cast","Heal 12 HP","Heal 16 HP; also restore 5% max HP","Heal 22 HP; restore 8% max HP","Heal 30 HP; restore 12% max HP; Wavecrest gains double regen"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"bubblin",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"tidecrown"},
  {id:"tidecrown",name:"Tidecrown",emoji:"🐬",type:"Water",rarity:"common",description:"Wavecrest's final form. The ocean answers its call. Healers across the land seek its blessing.",
   stats:{hp:136,atk:65,def:120,spd:92,abilitySpeed:148},
   abilities:{
     basic:{name:"Water Jet",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target ATK by 8% for 2s"]},
     special:{name:"Healing Tide",upgrades:["Heal all allies 30 HP","Heal 42 HP","Heal 55 HP","Heal 70 HP","Heal 85 HP; remove all debuffs"]},
     unique:{name:"Tidal Grace",upgrades:["Passive: healing done by Tidecrown +20%","+28%","+36%; overheal converts to shield","+45%; overheal shield","+55%; overheal shield; Tidecrown revives one fallen ally at 30% HP once per battle"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"wavecrest",shardsToAscend:18,ascensionsToEvolve:null},
  // Water line 2
  {id:"frostpup",name:"Tundracub",emoji:"🐻",type:"Water",rarity:"common",description:"A round, fluffy bear cub with patches of ice growing through its fur. Very huggable, slightly dangerous.",
   stats:{hp:55,atk:25,def:52,spd:28,abilitySpeed:35},
   abilities:{
     basic:{name:"Ice Scratch",upgrades:["10 dmg + 10% slow","13 dmg + 12% slow","17 dmg + 15% slow","22 dmg + 18% slow","Slow lasts 3s"]},
     special:{name:"Frost Coat",upgrades:["DEF +20 for 5s","DEF +30","DEF +40","DEF +52","Also freezes next attacker for 0.5s"]},
     unique:{name:"Permafrost",upgrades:["Passive: reduce all dmg taken by 5","Reduce by 8","Reduce by 11; slow attackers 10%","Reduce by 15; slow attackers 15%","Reduce by 20; slow attackers 20%; every 10s emit a frost pulse freezing all nearby foes 0.5s"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"snowmane"},
  {id:"snowmane",name:"Frostpaw",emoji:"🦌",type:"Water",rarity:"common",description:"An elegant ice deer with antlers that permanently frost the air around it.",
   stats:{hp:90,atk:40,def:85,spd:42,abilitySpeed:55},
   abilities:{
     basic:{name:"Ice Scratch",upgrades:["10 dmg + 10% slow","13 dmg + 12% slow","17 dmg + 15% slow","22 dmg + 18% slow","Slow lasts 3s"]},
     special:{name:"Ice Barrier",upgrades:["Shield self 45 HP","Shield 62 HP","Shield 80 HP","Shield 100 HP","Shielded allies are immune to slows"]},
     unique:{name:"Frost Aura",upgrades:["Passive: nearby enemies slowed 12%","Slowed 18%","Slowed 24%; ATK reduced 8%","Slowed 30%; ATK reduced 12%","Slowed 38%; ATK reduced 16%; frozen briefly every 6s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"frostpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"blizzardback"},
  {id:"blizzardback",name:"Blizzardback",emoji:"🦣",type:"Water",rarity:"common",description:"A great ice mammoth whose back is covered in a permanent blizzard.",
   stats:{hp:128,atk:57,def:118,spd:55,abilitySpeed:72},
   abilities:{
     basic:{name:"Ice Scratch",upgrades:["10 dmg + 10% slow","13 dmg + 12% slow","17 dmg + 15% slow","22 dmg + 18% slow","Slow lasts 3s"]},
     special:{name:"Blizzard Wall",upgrades:["Summon ice wall; enemies hit take 50 dmg","60 dmg","75 dmg","92 dmg","Wall lasts 4s and slows all who touch it 35%"]},
     unique:{name:"Blizzard Back",upgrades:["Passive: reduce dmg taken 12; emit blizzard slowing nearby foes 20%","Reduce 18; slow 26%","Reduce 24; slow 32%","Reduce 32; slow 40%","Reduce 40; slow 48%; blizzard also reduces enemy Ability Speed by 20%"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"snowmane",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"glaciertusk"},
  {id:"glaciertusk",name:"Glaciarch",emoji:"🐘",type:"Water",rarity:"common",description:"An ancient ice mammoth the size of a small glacier. Its tusks can impale mountains.",
   stats:{hp:168,atk:75,def:155,spd:68,abilitySpeed:92},
   abilities:{
     basic:{name:"Ice Scratch",upgrades:["10 dmg + 10% slow","13 dmg + 12% slow","17 dmg + 15% slow","22 dmg + 18% slow","Slow lasts 3s"]},
     special:{name:"Blizzard Wall",upgrades:["Summon ice wall; enemies hit take 50 dmg","60 dmg","75 dmg","92 dmg","Wall lasts 4s; slows all who touch it 35%"]},
     unique:{name:"Living Glacier",upgrades:["Passive: reduce all dmg taken 20; allies behind Glaciertusk take -12% dmg","Reduce 28; -16%","Reduce 36; -20%","Reduce 46; -26%","Reduce 56; -32%; any freeze effect now lasts +1s longer"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"blizzardback",shardsToAscend:18,ascensionsToEvolve:null},
  // Nature line 2
  {id:"sproutlet",name:"Sproutlet",emoji:"🌱",type:"Nature",rarity:"common",description:"The tiniest sprout, barely visible. What it lacks in size it makes up for in persistence.",
   stats:{hp:48,atk:18,def:35,spd:40,abilitySpeed:64},
   abilities:{
     basic:{name:"Vine Lash",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Briefly roots target for 0.5s"]},
     special:{name:"Nature's Touch",upgrades:["Heal ally 18 HP","Heal 25 HP","Heal 33 HP","Heal 43 HP","Heal + grant regen 4 HP/s for 3s"]},
     unique:{name:"Photosynthesis II",upgrades:["Passive: regen 2 HP/s in battle","Regen 3 HP/s","Regen 4 HP/s; doubles below 60% HP","Regen 5 HP/s; doubles below 60%","Regen 7 HP/s; triples below 30% HP"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"fernback"},
  {id:"fernback",name:"Fernback",emoji:"🌿",type:"Nature",rarity:"common",description:"Sproutlet grown into a leafy creature that spreads healing pollen wherever it walks.",
   stats:{hp:76,atk:28,def:58,spd:56,abilitySpeed:95},
   abilities:{
     basic:{name:"Vine Lash",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Roots target 0.5s"]},
     special:{name:"Pollen Burst",upgrades:["Heal all allies 18 HP","Heal 25 HP","Heal 33 HP","Heal 43 HP","Heal + grant +10% ATK for 3s"]},
     unique:{name:"Healing Pollen",upgrades:["Passive: each second, random ally heals 4 HP","Heal 6 HP","Heal 8 HP","Heal 11 HP","Heal 15 HP; also removes 1 debuff from healed ally"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"sproutlet",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"thornbeast"},
  {id:"thornbeast",name:"Thornbeast",emoji:"🌾",type:"Nature",rarity:"common",description:"Fernback hardened by seasons. Its back is a thicket of razor thorns that puncture armor.",
   stats:{hp:108,atk:42,def:85,spd:70,abilitySpeed:126},
   abilities:{
     basic:{name:"Vine Lash",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Roots 0.5s"]},
     special:{name:"Thorn Shield",upgrades:["Shield ally 40 HP; attacker takes 15 dmg","Shield 55; 20 dmg","Shield 72; 26 dmg","Shield 90; 32 dmg","Shield all allies 35 HP; attackers take 22 dmg"]},
     unique:{name:"Living Thorns",upgrades:["Passive: attackers take 12 thorn dmg","Attackers take 18 dmg","Attackers take 24 dmg; also poisoned 4 dmg/s 2s","Attackers take 32 dmg; poison 6 dmg/s 2s","Attackers take 42 dmg; poison 8 dmg/s 3s; Thornbeast gains 8 HP per thorn trigger"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"fernback",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"rootkeeper"},
  {id:"rootkeeper",name:"Rootkeeper",emoji:"🌴",type:"Nature",rarity:"common",description:"Thornbeast's final form. An ancient guardian whose roots span entire continents underground.",
   stats:{hp:142,atk:56,def:112,spd:85,abilitySpeed:162},
   abilities:{
     basic:{name:"Vine Lash",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Roots 0.5s"]},
     special:{name:"Root Network",upgrades:["Heal all allies 38 HP; remove 1 debuff each","Heal 52 HP","Heal 68 HP","Heal 88 HP","Heal 108 HP; grant all allies regen 10 HP/s for 4s"]},
     unique:{name:"Ancient Network",upgrades:["Passive: Rootkeeper and all allies regen 6 HP/s","Regen 9 HP/s","Regen 12 HP/s; Nature abilities grant +5% extra healing","Regen 16 HP/s; +8% extra healing","Regen 22 HP/s; +12% extra healing; fallen allies regen to 20% HP over 5s once per battle"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"thornbeast",shardsToAscend:18,ascensionsToEvolve:null},
  // Earth line 2
  {id:"mudpaw",name:"Mudboar",emoji:"🐗",type:"Earth",rarity:"common",description:"A stocky mud boar with rock-hard skin. It rolls into foes like a living boulder.",
   stats:{hp:58,atk:18,def:58,spd:22,abilitySpeed:28},
   abilities:{
     basic:{name:"Mud Tusk",upgrades:["10 dmg","13 dmg","16 dmg","20 dmg","Slows target 15% for 2s"]},
     special:{name:"Mud Roll",upgrades:["Roll into foe; 35 dmg","45 dmg","56 dmg","70 dmg","Knocks back and stuns 0.5s"]},
     unique:{name:"Mud Hide",upgrades:["Passive: reduce dmg taken 6","Reduce 9","Reduce 12","Reduce 16","Reduce 20; 10% chance to ignore a hit entirely"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"clayback"},
  {id:"clayback",name:"Clayback",emoji:"🦏",type:"Earth",rarity:"common",description:"Mudboar hardened over time. Its hide deflects even bladed weapons.",
   stats:{hp:94,atk:28,def:95,spd:32,abilitySpeed:44},
   abilities:{
     basic:{name:"Mud Tusk",upgrades:["10 dmg","13 dmg","16 dmg","20 dmg","Slows target 15% for 2s"]},
     special:{name:"Clay Armor",upgrades:["DEF +35 for 6s; reduce next hit by 20","DEF +50; reduce 28","DEF +65; reduce 36","DEF +82; reduce 46","DEF +100; fully block next hit"]},
     unique:{name:"Earthen Shell",upgrades:["Passive: reduce dmg taken 10","Reduce 15","Reduce 20; thorns 8 dmg to attackers","Reduce 26; thorns 12 dmg","Reduce 32; thorns 18 dmg; shell regenerates 3 DEF/s up to +20 bonus DEF"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mudpaw",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"stonecrest"},
  {id:"stonecrest",name:"Stonehorn",emoji:"🐊",type:"Earth",rarity:"common",description:"A colossal stone crocodile. Its scales have the hardness of gemstone.",
   stats:{hp:132,atk:44,def:134,spd:40,abilitySpeed:58},
   abilities:{
     basic:{name:"Stone Chomp",upgrades:["14 dmg + DEF -8% on target for 3s","18 dmg","23 dmg","30 dmg","Also reduces target SPD by 10%"]},
     special:{name:"Stone Fortress",upgrades:["DEF +50 for 7s; immune to knockback","DEF +68","DEF +88","DEF +110","DEF +135; immune to all CC"]},
     unique:{name:"Diamond Scale",upgrades:["Passive: reduce dmg taken 18; immune to poison","Reduce 25","Reduce 32; reflect 10% of blocked dmg","Reduce 40; reflect 15%","Reduce 50; reflect 20%; poison immunity; Stonecrest heals 10 HP per reflected instance"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"clayback",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"quarryking"},
  {id:"quarryking",name:"Quarryhorn",emoji:"🦛",type:"Earth",rarity:"common",description:"The immovable final form. A walking quarry whose step reshapes the land.",
   stats:{hp:175,atk:62,def:178,spd:46,abilitySpeed:72},
   abilities:{
     basic:{name:"Stone Chomp",upgrades:["14 dmg + DEF -8% on target for 3s","18 dmg","23 dmg","30 dmg","Also reduces target SPD 10%"]},
     special:{name:"Quarry Armor",upgrades:["DEF +70 for 8s; reduce next 3 hits by 30","DEF +92; 4 hits","DEF +118; 5 hits","DEF +145; 6 hits","DEF +175; immune to next 3 hits entirely"]},
     unique:{name:"Unbreakable",upgrades:["Passive: reduce dmg taken 26; heal 6 HP/s","Reduce 35; heal 9 HP/s","Reduce 44; heal 12 HP/s; CC immune","Reduce 55; heal 16 HP/s; CC immune","Reduce 65; heal 22 HP/s; CC immune; revive once at 30% HP; death deals 200 dmg to all enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonecrest",shardsToAscend:18,ascensionsToEvolve:null},
  // Wind line 2
  {id:"puffwing",name:"Puffwing",emoji:"🐦",type:"Wind",rarity:"common",description:"A tiny puffin with wings that generate constant gusts. It hovers even when asleep.",
   stats:{hp:35,atk:38,def:20,spd:78,abilitySpeed:64},
   abilities:{
     basic:{name:"Wind Peck",upgrades:["9 dmg","12 dmg","16 dmg","21 dmg","Pushes target back slightly"]},
     special:{name:"Tailwind",upgrades:["Self +30 SPD for 3s","+42 SPD","+56 SPD","+72 SPD","Also grants +10% Ability Speed"]},
     unique:{name:"Slipstream",upgrades:["Passive: nearby allies gain +12 SPD","Allies +18 SPD","Allies +24 SPD; Puffwing +10 SPD","Allies +30 SPD; Puffwing +15 SPD","Allies +40 SPD; Puffwing +22 SPD; moving fast grants 5% dodge"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"draftfin"},
  {id:"draftfin",name:"Pufftide",emoji:"🦅",type:"Wind",rarity:"common",description:"Puffwing matured into a sharp-winged hawk that dives at hurricane speeds.",
   stats:{hp:57,atk:62,def:34,spd:108,abilitySpeed:92},
   abilities:{
     basic:{name:"Wind Peck",upgrades:["9 dmg","12 dmg","16 dmg","21 dmg","Pushes target back"]},
     special:{name:"Dive Strike",upgrades:["Dive; 48 dmg on impact","62 dmg","78 dmg","96 dmg","Leaves wind vortex at impact point for 2s"]},
     unique:{name:"Wind Cutter",upgrades:["Passive: wind attacks pierce 10% of enemy DEF","Pierce 15%","Pierce 20%","Pierce 26%","Pierce 32%; critical hits also knock target back"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"puffwing",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"cyclotail"},
  {id:"cyclotail",name:"Stormfin",emoji:"🦜",type:"Wind",rarity:"common",description:"Draftfin's feathers have become blades of compressed air. Its tail generates cyclones.",
   stats:{hp:78,atk:86,def:48,spd:140,abilitySpeed:118},
   abilities:{
     basic:{name:"Air Blade",upgrades:["14 dmg","18 dmg","23 dmg","30 dmg","Hits twice; second hit deals 60% dmg"]},
     special:{name:"Cyclone Tail",upgrades:["Spin; 55 dmg to all nearby","70 dmg","88 dmg","108 dmg","Cyclone persists for 2s pulling enemies in"]},
     unique:{name:"Blade Feathers",upgrades:["Passive: each attack sends a wind blade for 12 bonus dmg","16 dmg","20 dmg","26 dmg","32 dmg; wind blades have 15% chance to crit for double"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"draftfin",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"stormbeak"},
  {id:"stormbeak",name:"Stormbeak",emoji:"🦉",type:"Wind",rarity:"common",description:"The final aerial predator. Stormbeak's wings span skies and its beak can shatter stone.",
   stats:{hp:102,atk:115,def:64,spd:175,abilitySpeed:150},
   abilities:{
     basic:{name:"Air Blade",upgrades:["14 dmg","18 dmg","23 dmg","30 dmg","Hits twice"]},
     special:{name:"Cyclone Tail",upgrades:["Spin; 55 dmg to all nearby","70 dmg","88 dmg","108 dmg","Cyclone persists 2s pulling enemies in"]},
     unique:{name:"Storm Predator",upgrades:["Passive: wind attacks deal +18% dmg; crit chance +8%","20% dmg; +10% crit","22% dmg; +12% crit","26% dmg; +15% crit","30% dmg; +18% crit; crits unleash a wind burst hitting all nearby enemies for 40 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"cyclotail",shardsToAscend:18,ascensionsToEvolve:null},
  // Electric line 1
  {id:"sparkpup",name:"Sparkit",emoji:"🐭",type:"Electric",rarity:"common",description:"A tiny mouse with oversized ears that act as lightning rods. Startles easily and discharges.",
   stats:{hp:40,atk:46,def:25,spd:60,abilitySpeed:56},
   abilities:{
     basic:{name:"Static Bite",upgrades:["10 dmg; 15% chance to stun 0.5s","13 dmg; 18%","17 dmg; 22%","22 dmg; 26%","30% chance; stun 0.75s"]},
     special:{name:"Charge Up",upgrades:["Next attack +25% dmg","Next +35%","Next +46%","Next +58%","Next +72%; also gains +15 SPD for 2s"]},
     unique:{name:"Static Body",upgrades:["Passive: every 5th hit taken zaps attacker 12 dmg","Every 4th; 18 dmg","Every 3rd; 25 dmg","Every 3rd; 35 dmg; stuns 0.25s","Every 2nd; 45 dmg; stuns 0.5s"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"voltkit"},
  {id:"voltkit",name:"Voltcat",emoji:"🐱",type:"Electric",rarity:"common",description:"Zaprat evolved into a cracking electric cat. Its purr sounds like a tesla coil.",
   stats:{hp:65,atk:74,def:42,spd:82,abilitySpeed:80},
   abilities:{
     basic:{name:"Static Bite",upgrades:["10 dmg; stun chance 15%","13 dmg; 18%","17 dmg; 22%","22 dmg; 26%","30%; stun 0.75s"]},
     special:{name:"Volt Pounce",upgrades:["Pounce; 48 dmg + stun 0.5s","62 dmg","78 dmg","96 dmg","Also leaves electric field at landing for 2s"]},
     unique:{name:"Overcharge",upgrades:["Passive: every 6s gain +20% ATK for 2s","Every 5s +26%","Every 4s +32%","Every 3s +40%","Every 3s +50%; while overcharged attacks stun for 0.25s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"sparkpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"thunderpaw"},
  {id:"thunderpaw",name:"Voltiger",emoji:"🐯",type:"Electric",rarity:"common",description:"A thundering tiger whose stripes are live voltage. Its roar triggers lightning.",
   stats:{hp:90,atk:102,def:58,spd:106,abilitySpeed:104},
   abilities:{
     basic:{name:"Thunder Claw",upgrades:["16 dmg; 20% stun chance 0.5s","21 dmg","27 dmg","35 dmg","25% stun 1s; arcs to nearby foe 50%"]},
     special:{name:"Volt Rush",upgrades:["Dash; 62 dmg; leaves electric trail","78 dmg","96 dmg","118 dmg","Trail lasts 3s; enemies in trail stunned 0.5s/s"]},
     unique:{name:"Lightning Coat",upgrades:["Passive: attacks have 18% chance to chain to 1 nearby foe for 50% dmg","22%; 60%","26%; 70%","30%; 80%","35%; 90%; chained hits also stun 0.5s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltkit",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"boltlion"},
  {id:"boltlion",name:"Boltiger",emoji:"🦁",type:"Electric",rarity:"common",description:"Thundertiger's royal final form. A lion made of living lightning. Every step is a crack of thunder.",
   stats:{hp:120,atk:135,def:78,spd:135,abilitySpeed:132},
   abilities:{
     basic:{name:"Thunder Claw",upgrades:["16 dmg; 20% stun chance 0.5s","21 dmg","27 dmg","35 dmg","25% stun 1s; arcs 50%"]},
     special:{name:"Volt Rush",upgrades:["Dash; 62 dmg; electric trail","78 dmg","96 dmg","118 dmg","Trail lasts 3s; enemies stunned 0.5s/s"]},
     unique:{name:"Thunder King",upgrades:["Passive: electric attacks deal +22% dmg; allies gain +8% electric dmg","Electric +28%; allies +12%","Electric +34%; allies +16%","Electric +42%; allies +20%","Electric +50%; allies +26%; Boltlion's crits call an additional lightning strike for 80 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"thunderpaw",shardsToAscend:18,ascensionsToEvolve:null},
  // Electric line 2
  {id:"buzzwig",name:"Buzzwig",emoji:"🐝",type:"Electric",rarity:"common",description:"A fuzzy electric bee that builds nests out of crackling amber. Its sting carries a jolt.",
   stats:{hp:35,atk:50,def:18,spd:68,abilitySpeed:62},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["11 dmg; 20% poison (4 dmg/s 2s)","14 dmg","18 dmg","24 dmg","Poison + 15% slow 2s"]},
     special:{name:"Amber Trap",upgrades:["Trap; root 1s + 25 dmg if triggered","Root 1.5s + 32 dmg","Root 2s + 40 dmg","Root 2s + 50 dmg","3 traps simultaneously; each root 2s"]},
     unique:{name:"Electric Pollen",upgrades:["Passive: abilities have 20% chance to apply shock (8 dmg/s 2s)","25% shock","30% shock 3s","35% shock 3s","40% shock 3s; shocked enemies take +12% dmg from all sources"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"zaptail"},
  {id:"zaptail",name:"Zaptail",emoji:"🦟",type:"Electric",rarity:"common",description:"Buzzwig evolved into a lightning-fast electric dragonfly. It strikes before you see it coming.",
   stats:{hp:57,atk:78,def:32,spd:94,abilitySpeed:88},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["11 dmg; 20% shock","14 dmg","18 dmg","24 dmg","Shock + slow 15% 2s"]},
     special:{name:"Zap Dash",upgrades:["Dash through enemies; 42 dmg each","54 dmg","68 dmg","84 dmg","Leave electric trail; enemies in trail take 15 dmg/s for 2s"]},
     unique:{name:"Speed Zapper",upgrades:["Passive: after using any ability gain +20 SPD for 2s","Gain +28 SPD","Gain +36 SPD; also +8% Ability Speed","Gain +45 SPD; +12% Ability Speed","Gain +56 SPD; +16% Ability Speed; SPD bonus also empowers next attack for 15% more dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"buzzwig",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"shockfang"},
  {id:"shockfang",name:"Shockfang",emoji:"🦎",type:"Electric",rarity:"common",description:"A jagged electric lizard whose fangs deliver voltage directly into the nervous system.",
   stats:{hp:78,atk:106,def:48,spd:120,abilitySpeed:112},
   abilities:{
     basic:{name:"Shock Fang",upgrades:["18 dmg; paralysis 20% chance (stop 0.5s)","23 dmg; 24%","30 dmg; 28%","38 dmg; 32%","35%; paralysis 1s"]},
     special:{name:"Electro Burst",upgrades:["55 dmg in burst; stun 0.5s","70 dmg","88 dmg","108 dmg","Stun 1s; stun releases 30 dmg shockwave"]},
     unique:{name:"High Voltage",upgrades:["Passive: critical hits deal +30% bonus electric dmg","Crit +40%","Crit +50%","Crit +62%","Crit +75%; crits also paralyze for 0.5s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"zaptail",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"stormhorn"},
  {id:"stormhorn",name:"Stormhorn",emoji:"🦬",type:"Electric",rarity:"common",description:"Shockfang's apex form. A massive electric bison whose horns channel lightning storms.",
   stats:{hp:102,atk:142,def:66,spd:148,abilitySpeed:140},
   abilities:{
     basic:{name:"Shock Fang",upgrades:["18 dmg; paralysis 20%","23 dmg","30 dmg","38 dmg","35%; paralysis 1s"]},
     special:{name:"Electro Burst",upgrades:["55 dmg; stun 0.5s","70 dmg","88 dmg","108 dmg","Stun 1s; shockwave 30 dmg"]},
     unique:{name:"Thunder Stampede",upgrades:["Passive: each hit adds a charge (max 5); at 5 charges release 120 dmg electric explosion","Explosion 150 dmg","Explosion 185 dmg","Explosion 225 dmg","Explosion 270 dmg; explosion stuns all hit 1.5s and resets charge counter"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"shockfang",shardsToAscend:18,ascensionsToEvolve:null},
  // Light line 1
  {id:"glowpup",name:"Lumibun",emoji:"🐰",type:"Light",rarity:"common",description:"A softly glowing rabbit that heals whatever it nuzzles. Vets love it.",
   stats:{hp:45,atk:20,def:32,spd:48,abilitySpeed:70},
   abilities:{
     basic:{name:"Light Beam",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target DEF by 8% for 2s"]},
     special:{name:"Radiant Heal",upgrades:["Heal ally 22 HP","Heal 30 HP","Heal 40 HP","Heal 52 HP","Heal + cleanse 1 debuff"]},
     unique:{name:"Inner Light",upgrades:["Passive: heal 3 HP/s","Heal 4 HP/s","Heal 5 HP/s; double when below 50% HP","Heal 7 HP/s; double below 50%","Heal 9 HP/s; double below 50%; revive a fallen ally at 15% HP once"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"radiantkit"},
  {id:"radiantkit",name:"Dawnhare",emoji:"🐇",type:"Light",rarity:"common",description:"Lumibun grown into a shining hare that leaves trails of healing light.",
   stats:{hp:74,atk:32,def:54,spd:66,abilitySpeed:104},
   abilities:{
     basic:{name:"Light Beam",upgrades:["8 dmg","11 dmg","14 dmg","18 dmg","Reduces target DEF 8% for 2s"]},
     special:{name:"Radiant Shield",upgrades:["Shield ally 35 HP; grant +10% DEF","Shield 48; +14% DEF","Shield 62; +18% DEF","Shield 78; +22% DEF","Shield all allies 28 HP; +12% DEF"]},
     unique:{name:"Healing Light",upgrades:["Passive: abilities heal lowest HP ally for 10 HP on cast","Heal 14 HP","Heal 18 HP","Heal 24 HP","Heal 32 HP; heal also cleanses 1 debuff"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"glowpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"dawnbeast"},
  {id:"dawnbeast",name:"Radiantbun",emoji:"🦊",type:"Light",rarity:"common",description:"Dawnhare evolved into a luminous fox that embodies the first light of dawn.",
   stats:{hp:104,atk:47,def:76,spd:86,abilitySpeed:138},
   abilities:{
     basic:{name:"Dawn Ray",upgrades:["12 dmg; reduce target ATK 10% for 2s","16 dmg","21 dmg","27 dmg","Also reduce target Ability Speed 10%"]},
     special:{name:"Dawn Blessing",upgrades:["Heal all allies 30 HP; grant +12% ATK 3s","Heal 42; +16%","Heal 55; +20%","Heal 70; +25%","Heal 88; +30%; also grant +10% SPD"]},
     unique:{name:"Dawn Embrace",upgrades:["Passive: after Dawnbeast heals, caster gains +5% ATK for 3s (stacks 3x)","Gains +7%","Gains +9%; also +5% SPD","Gains +12%; +7% SPD","Gains +15%; +10% SPD; at 3 stacks Dawnbeast's next attack deals 50% bonus light dmg"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"radiantkit",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"solarcrown"},
  {id:"solarcrown",name:"Solarhare",emoji:"🦁",type:"Light",rarity:"common",description:"The golden lion of pure light. Dawnbeast's ultimate form, whose radiance heals entire battlefields.",
   stats:{hp:138,atk:64,def:100,spd:108,abilitySpeed:178},
   abilities:{
     basic:{name:"Dawn Ray",upgrades:["12 dmg; reduce ATK 10%","16 dmg","21 dmg","27 dmg","Reduce ATK 10%; reduce Ability Speed 10%"]},
     special:{name:"Solar Blessing",upgrades:["Heal all allies 45 HP; +15% ATK +15% DEF 4s","Heal 60","Heal 78","Heal 98","Heal 122; +20% all stats for 5s; remove all debuffs"]},
     unique:{name:"Solar Sovereign",upgrades:["Passive: all allies gain +10% to all healing received; Solarcrown heals 6 HP/s","Allies +14%; Solarcrown 9 HP/s","Allies +18%; 12 HP/s","Allies +23%; 16 HP/s","Allies +28%; 22 HP/s; at full HP Solarcrown's attacks release light bursts healing allies 15 HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"dawnbeast",shardsToAscend:18,ascensionsToEvolve:null},
  // Light line 2
  {id:"shimmerfly",name:"Shimmerfly",emoji:"🦋",type:"Light",rarity:"common",description:"A butterfly made of prismatic light. Its wing dust blinds enemies and heals allies.",
   stats:{hp:38,atk:15,def:28,spd:56,abilitySpeed:78},
   abilities:{
     basic:{name:"Prism Dust",upgrades:["7 dmg; 20% blind 1s","9 dmg","12 dmg","15 dmg","25% blind 1.5s"]},
     special:{name:"Wing Heal",upgrades:["Heal ally 20 HP","Heal 28 HP","Heal 37 HP","Heal 48 HP","Heal + grant 5% dodge for 3s"]},
     unique:{name:"Prism Scales",upgrades:["Passive: 12% chance any hit is negated (absorbed by light)","15%","18%","22%","26%; absorbed hits heal Shimmerfly 10 HP"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"lumiwing"},
  {id:"lumiwing",name:"Lumiwing",emoji:"🌟",type:"Light",rarity:"common",description:"Shimmerfly with wings that now emit constant healing pulses.",
   stats:{hp:62,atk:26,def:46,spd:78,abilitySpeed:112},
   abilities:{
     basic:{name:"Prism Dust",upgrades:["7 dmg; blind 20%","9 dmg","12 dmg","15 dmg","25%; blind 1.5s"]},
     special:{name:"Luminous Barrier",upgrades:["Shield ally 38 HP; 8% dodge","Shield 52; 12%","Shield 68; 16%","Shield 86; 20%","Shield all allies 28 HP; 12% dodge"]},
     unique:{name:"Light Resonance",upgrades:["Passive: each heal by Lumiwing has a 20% chance to heal a second ally for 50% of the amount","25%; 60%","30%; 70%","35%; 80%","40%; 90%; both allies also gain +5% DEF for 3s"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"shimmerfly",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"brightclaw"},
  {id:"brightclaw",name:"Brightmoth",emoji:"🕊️",type:"Light",rarity:"common",description:"Lumiwing transformed into a dove of blazing light. Its talons carry purifying fire.",
   stats:{hp:90,atk:40,def:68,spd:100,abilitySpeed:146},
   abilities:{
     basic:{name:"Light Talon",upgrades:["12 dmg; cleanse 1 ally debuff on hit","16 dmg","21 dmg","27 dmg","Cleanse all debuffs from 1 ally"]},
     special:{name:"Bright Heal",upgrades:["Heal all allies 32 HP; remove 1 debuff each","Heal 44","Heal 58","Heal 74","Heal 92; remove all debuffs; grant immunity to 1 debuff for 4s"]},
     unique:{name:"Wings of Grace",upgrades:["Passive: every 5s, remove 1 debuff from a random ally","Every 4s","Every 3s; also heal 12 HP","Every 3s; heal 18 HP","Every 2s; heal 25 HP; debuff removal triggers a 15 dmg light burst on enemies"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"lumiwing",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"celestipaw"},
  {id:"celestipaw",name:"Starmoth",emoji:"✨",type:"Light",rarity:"common",description:"Brightclaw ascended to pure starlight. A luminous lynx whose form transcends the physical, embodying light itself.",
   stats:{hp:120,atk:56,def:92,spd:125,abilitySpeed:186},
   abilities:{
     basic:{name:"Light Talon",upgrades:["12 dmg; cleanse ally","16 dmg","21 dmg","27 dmg","Cleanse all"]},
     special:{name:"Celestial Heal",upgrades:["Heal all allies 50 HP; remove all debuffs; grant +15% DEF 4s","Heal 66","Heal 84","Heal 105","Heal 128 HP; +20% all stats 5s; grant regen 12 HP/s 4s"]},
     unique:{name:"Celestial Grace",upgrades:["Passive: all allies take -8% dmg; heal 8 HP/s; Celestipaw's heals cannot be reduced","-10%; 11 HP/s","-12%; 14 HP/s; heals now crit for +50%","-15%; 18 HP/s; heal crits","-18%; 24 HP/s; heal crits; once per battle: when an ally would die Celestipaw sacrifices 40% of its HP to fully revive them at 50% HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"brightclaw",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 1
  {id:"shadowpup",name:"Duskling",emoji:"🐈‍⬛",type:"Dark",rarity:"common",description:"A small black cat that flickers in and out of shadow. Enjoys knocking things off shelves.",
   stats:{hp:42,atk:50,def:20,spd:64,abilitySpeed:54},
   abilities:{
     basic:{name:"Shadow Slash",upgrades:["11 dmg","14 dmg","18 dmg","24 dmg","Reduces target DEF 10% for 2s"]},
     special:{name:"Fade",upgrades:["Become untargetable 1.5s; +15 SPD after","Untargetable 2s; +20 SPD","Untargetable 2s; +28 SPD","Untargetable 2.5s; +36 SPD","Untargetable 3s; +45 SPD; emerge dealing 25 dmg to nearby foes"]},
     unique:{name:"Shadowstep",upgrades:["Passive: first attack each battle ignores all DEF","First 2 attacks","First 3 attacks","First 4 attacks","First 5 attacks; shadow attacks also silence target 0.5s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"gloomkit"},
  {id:"gloomkit",name:"Nightbat",emoji:"🦇",type:"Dark",rarity:"common",description:"Duskling evolved into a stealthy shadow bat. It strikes from the darkness and vanishes.",
   stats:{hp:68,atk:78,def:34,spd:88,abilitySpeed:78},
   abilities:{
     basic:{name:"Shadow Slash",upgrades:["11 dmg","14 dmg","18 dmg","24 dmg","Reduces DEF 10% 2s"]},
     special:{name:"Dark Shroud",upgrades:["Cloak self 2s; ATK +25%","Cloak 2.5s; +32%","Cloak 3s; +40%","Cloak 3s; +50%","Cloak 3.5s; +62%; emerge with area shadow burst 35 dmg"]},
     unique:{name:"Predator's Mark",upgrades:["Passive: marked targets take +10% dmg from Gloomkit","Marked +14%","Marked +18%","Marked +22%","Marked +28%; mark spreads to 1 nearby enemy on death of marked target"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowpup",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"nightstalker"},
  {id:"nightstalker",name:"Nightstalker",emoji:"🐺",type:"Dark",rarity:"common",description:"Nightbat grown into a shadowy wolf that hunts by instinct alone. It never misses.",
   stats:{hp:95,atk:108,def:52,spd:112,abilitySpeed:102},
   abilities:{
     basic:{name:"Night Fang",upgrades:["17 dmg; silence 10% chance 1s","22 dmg","28 dmg","36 dmg","20% silence 1.5s"]},
     special:{name:"Shadow Hunt",upgrades:["Mark target; Nightstalker deals +20% dmg to marked","Mark; +28%","Mark; +36%","Mark; +45%","Mark; +55%; marked target also takes +15% dmg from all sources"]},
     unique:{name:"Apex Predator",upgrades:["Passive: kills grant +8% ATK for 5s (stacks 3x)","Kills grant +11%","Kills grant +14%","Kills grant +18%","Kills grant +22%; at 3 stacks next attack deals 200% dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"gloomkit",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"voidfang"},
  {id:"voidfang",name:"Voidfang",emoji:"🐉",type:"Dark",rarity:"common",description:"Nightstalker's final dark dragon form. It does not walk. It unexists from one place and reappears at another.",
   stats:{hp:128,atk:142,def:70,spd:142,abilitySpeed:130},
   abilities:{
     basic:{name:"Night Fang",upgrades:["17 dmg; silence 10%","22 dmg","28 dmg","36 dmg","20%; silence 1.5s"]},
     special:{name:"Void Tear",upgrades:["Teleport to target; 70 dmg; silence 1.5s","88 dmg","108 dmg","132 dmg","Silence 2s; also strips 1 buff from target"]},
     unique:{name:"Void Sovereign",upgrades:["Passive: dark attacks bypass 15% of enemy DEF; kills grant full HP regen for 2s","Bypass 20%","Bypass 26%; regen 3s","Bypass 32%; regen 3s","Bypass 40%; regen 4s; dark attacks also silence for 0.5s; Voidfang is immune to silence"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"nightstalker",shardsToAscend:18,ascensionsToEvolve:null},
  // Dark line 2
  {id:"murkwing",name:"Murkwing",emoji:"🕷️",type:"Dark",rarity:"common",description:"A shadowy bat that drains energy from those around it. Even torches dim in its presence.",
   stats:{hp:38,atk:36,def:26,spd:70,abilitySpeed:64},
   abilities:{
     basic:{name:"Drain Bite",upgrades:["9 dmg; heal self 4 HP","12 dmg; heal 5","15 dmg; heal 7","20 dmg; heal 9","Heal 12; also reduce target ATK 8% for 2s"]},
     special:{name:"Shadow Shriek",upgrades:["Shriek; silence all nearby 1s + 25 dmg","Silence 1.5s + 32 dmg","Silence 2s + 40 dmg","Silence 2s + 50 dmg","Silence 2.5s + 62 dmg; also reduce Ability Speed 20%"]},
     unique:{name:"Life Leech",upgrades:["Passive: 15% of dmg dealt heals Murkwing","18%","22%","26%","30%; excess healing shields up to 30 HP"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:5,ascensionsToEvolve:3,evolutionId:"darkpaw"},
  {id:"darkpaw",name:"Corvoid",emoji:"🐦‍⬛",type:"Dark",rarity:"common",description:"Murkwing evolved into a sleek black raven. Its gaze saps the will to fight.",
   stats:{hp:62,atk:58,def:42,spd:96,abilitySpeed:92},
   abilities:{
     basic:{name:"Drain Bite",upgrades:["9 dmg; heal 4","12 dmg; heal 5","15 dmg; heal 7","20 dmg; heal 9","Heal 12; reduce ATK 8% 2s"]},
     special:{name:"Curse",upgrades:["Curse target: -15% ATK and DEF for 4s","-20% for 4s","-25% for 5s","-32% for 5s","-40% for 6s; curse spreads to 1 nearby foe"]},
     unique:{name:"Shadow Feast",upgrades:["Passive: after killing a foe, heal 30 HP and gain +12% ATK for 5s","Heal 42; +16%","Heal 56; +20%","Heal 72; +25%","Heal 90; +30% ATK + DEF; buff lasts 7s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"murkwing",shardsToAscend:8,ascensionsToEvolve:4,evolutionId:"shadowcrest"},
  {id:"shadowcrest",name:"Shadowcrest",emoji:"🦅",type:"Dark",rarity:"common",description:"Darkraven grown into a dark eagle whose feathers absorb light. Looking at it causes unease.",
   stats:{hp:86,atk:80,def:62,spd:124,abilitySpeed:118},
   abilities:{
     basic:{name:"Void Talon",upgrades:["14 dmg; heal 6; reduce ATK 10% 2s","18 dmg","23 dmg","30 dmg","ATK -14%; heal 10 HP"]},
     special:{name:"Dark Aura",upgrades:["All enemies -15% ATK -10% DEF for 5s","-20% ATK -14% DEF","-26% ATK -18% DEF","-32% ATK -22% DEF","-40% ATK -28% DEF; also -20% SPD"]},
     unique:{name:"Darkness Drain",upgrades:["Passive: 20% of dmg dealt heals Shadowcrest; overheal shields up to 40 HP","22%; 50 HP shield","26%; 60 HP","30%; 72 HP","35%; 85 HP; shield also reduces incoming dmg by 10%"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"darkpaw",shardsToAscend:12,ascensionsToEvolve:5,evolutionId:"abysslord"},
  {id:"abysslord",name:"Abysslord",emoji:"🌑",type:"Dark",rarity:"common",description:"The void given form. Shadowcrest's final evolution exists on the border between world and nothingness.",
   stats:{hp:114,atk:108,def:84,spd:156,abilitySpeed:150},
   abilities:{
     basic:{name:"Void Talon",upgrades:["14 dmg; heal 6; ATK -10%","18 dmg","23 dmg","30 dmg","ATK -14%; heal 10 HP"]},
     special:{name:"Abyss Aura",upgrades:["All enemies -20% ATK -15% DEF -10% SPD for 6s","-26%/-20%/-14%","-32%/-26%/-18%","-40%/-32%/-22%","-50%/-40%/-28% for 7s; also silences all 1.5s"]},
     unique:{name:"Abyss Sovereign",upgrades:["Passive: 25% of dmg heals Abysslord; kills restore 40 HP to all allies","28% drain; 52 HP","32% drain; 65 HP","36% drain; 80 HP","40% drain; 100 HP; on kill Abysslord gains +15% all stats for 6s; enemies near Abysslord slowly lose HP (5 dmg/s)"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowcrest",shardsToAscend:18,ascensionsToEvolve:null},
  {id:"frostfang",name:"Frostfang",emoji:"🐺",type:"Water",rarity:"rare",description:"A cold-blooded predator whose howl drops the temperature in a wide area.",
   stats:{hp:65,atk:60,def:45,spd:62,abilitySpeed:55},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["12 dmg + 15% slow","16 dmg + 20% slow","21 dmg + 25% slow","27 dmg + 30% slow","Freeze target solid for 1.5s on 5th hit"]},
     special:{name:"Blizzard Howl",upgrades:["Chills enemies in radius 3","Chills radius 4","Chills radius 5","Chills radius 6","Fully freezes all chilled enemies in range"]},
     unique:{name:"Frozen Aura",upgrades:["Passive: nearby enemies are slowed by 8%","Nearby enemies slowed by 14%","Nearby enemies slowed by 20%; their attack speed is also reduced 10%","Nearby enemies slowed by 28%; attack speed reduced 16%","Nearby enemies slowed by 35%; attack speed reduced 22%; every 8s they are briefly frozen for 0.5s"]}
   },role:"Support",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:4,evolutionId:"glacierwulf"},
  {id:"glacierwulf",name:"Glacierwulf",emoji:"❄️",type:"Water",rarity:"rare",description:"Frostfang reborn in permafrost. Its breath alone freezes the air.",
   stats:{hp:105,atk:95,def:72,spd:88,abilitySpeed:78},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["12 dmg + 15% slow","16 dmg + 20% slow","21 dmg + 25% slow","27 dmg + 30% slow","Freeze target solid for 1.5s on 5th hit"]},
     special:{name:"Blizzard Howl",upgrades:["Chills enemies in radius 3","Chills radius 4","Chills radius 5","Chills radius 6","Fully freezes all chilled enemies in range"]},
     unique:{name:"Permafrost Aura",upgrades:["Passive: nearby enemies are slowed 25% and take +8% ice damage","Nearby enemies slowed 32%; +12% ice damage taken","Nearby enemies slowed 40%; +16% ice damage taken; every 6s they are frozen for 1s","Nearby enemies slowed 48%; +20% ice damage; frozen for 1.5s every 5s","Nearby enemies slowed 55%; +25% ice damage; frozen for 2s every 4s; being unfrozen deals 20 shatter damage"]}
   },role:"Support",attackType:"Melee",evolutionOf:"frostfang",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"frostwyvern"},
  {id:"voltail",name:"Voltail",emoji:"⚡",type:"Electric",rarity:"rare",description:"Its tail acts as a lightning rod, storing energy for devastating strikes.",
   stats:{hp:55,atk:72,def:35,spd:70,abilitySpeed:68},
   abilities:{
     basic:{name:"Static Zap",upgrades:["14 dmg","19 dmg","25 dmg","32 dmg","Arcs to 1 nearby foe for 50% damage"]},
     special:{name:"Charge Up",upgrades:["Next ability +20% dmg","Next +30%","Next +40%","Next +55%","Also grants a charge shield absorbing 20 dmg"]},
     unique:{name:"Static Body",upgrades:["Passive: every 5th hit received, zaps the attacker for 15 electric dmg","Every 4th hit zaps for 22 electric dmg","Every 3rd hit zaps for 30 electric dmg","Every 3rd hit zaps for 40 electric dmg and briefly stuns the attacker","Every 2nd hit zaps for 50 electric dmg, stuns the attacker, and arcs to one nearby enemy for 25 dmg"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"stormclaw"},
  {id:"stormclaw",name:"Stormclaw",emoji:"🌩️",type:"Electric",rarity:"rare",description:"A Voltail so overcharged it permanently crackles with uncontained lightning.",
   stats:{hp:88,atk:115,def:55,spd:98,abilitySpeed:95},
   abilities:{
     basic:{name:"Static Zap",upgrades:["14 dmg","19 dmg","25 dmg","32 dmg","Arcs to 1 nearby foe for 50% damage"]},
     special:{name:"Charge Up",upgrades:["Next ability +20% dmg","Next +30%","Next +40%","Next +55%","Also grants a charge shield absorbing 20 dmg"]},
     unique:{name:"Living Conductor",upgrades:["Passive: every hit received zaps the attacker for 35 electric dmg","Every hit zaps for 50 electric dmg","Every hit zaps for 65 electric dmg and arcs to 1 nearby enemy","Every hit zaps for 80 electric dmg, arcs to 2 nearby enemies, and briefly stuns them","Every hit zaps for 100 electric dmg, arcs to 3 nearby enemies, stuns them, and generates a small charge shield (max 1 active)"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltail",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"arcstorm"},
  {id:"tideclaw",name:"Tideclaw",emoji:"🦞",type:"Water",rarity:"rare",description:"Commands the tides with its claws. Extremely grumpy before breakfast.",
   stats:{hp:70,atk:55,def:62,spd:42,abilitySpeed:50},
   abilities:{
     basic:{name:"Water Slash",upgrades:["18 dmg","24 dmg","31 dmg","40 dmg","Reduces target ATK by 10% for 3s"]},
     special:{name:"Tidal Pull",upgrades:["Pull 1 foe","Pull 1 foe, 20 dmg","Pull 1 foe, 28 dmg","Pull + stun 0.5s","Pull all nearby foes to center simultaneously"]},
     unique:{name:"Deep Pressure",upgrades:["Passive: nearby enemies have ATK reduced by 8%","Nearby enemies have ATK reduced by 14%","Nearby enemies have ATK and SPD reduced by 14%","Nearby enemies have ATK and SPD reduced by 20%","Nearby enemies have ATK and SPD reduced by 28%; they also deal 10% less critical damage"]}
   },role:"Support",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"tidalcrusher"},
  // Water line 1 final
  {id:"frostwyvern",name:"Frostwyvern",emoji:"🐲",type:"Water",rarity:"rare",description:"Glacierwulf's draconic final form. Frost crystallizes the air around it.",
   stats:{hp:130,atk:115,def:90,spd:108,abilitySpeed:98},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["16 dmg+20% slow","21 dmg","27 dmg","34 dmg","Freeze 1s on 5th hit"]},
     special:{name:"Blizzard Howl",upgrades:["Chill radius 3","Chill radius 4","Chill radius 5","Chill radius 6","Freeze all chilled in range"]},
     unique:{name:"Glacial Sovereign",upgrades:["Passive: slow nearby enemies 40%; +12% ice dmg taken","Slow 48%; +16%","Slow 56%; +20%; freeze 1s every 5s","Slow 65%; +25%","Slow 75%; +30%; freeze 2s every 4s; unfreezing deals 35 shatter dmg"]}
   },role:"Support",attackType:"Melee",evolutionOf:"glacierwulf",shardsToAscend:22,ascensionsToEvolve:null},
  // Water line 2 mid+final
  {id:"tidalcrusher",name:"Tidalcrusher",emoji:"🦀",type:"Water",rarity:"rare",description:"Tideclaw evolved into a massive armored crab. Its pincers bend steel.",
   stats:{hp:108,atk:82,def:95,spd:62,abilitySpeed:78},
   abilities:{
     basic:{name:"Crush Claw",upgrades:["20 dmg+DEF-8% 3s","26 dmg","33 dmg","42 dmg","Also slow 15% 3s"]},
     special:{name:"Tidal Grip",upgrades:["Pull 1 foe+30 dmg","Pull+38 dmg","Pull+stun 1s","Pull all nearby","Pull all+stun 1s"]},
     unique:{name:"Iron Shell",upgrades:["Passive: -15 all dmg taken","Reduce 22","Reduce 28; thorns 10 dmg","Reduce 36; thorns 15 dmg","Reduce 44; thorns 22 dmg; 12% chance negate a hit"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tideclaw",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"abyssking"},
  {id:"abyssking",name:"Abyssking",emoji:"🦀",type:"Water",rarity:"rare",description:"The apex deep-sea tyrant. Its shell is harder than any known metal.",
   stats:{hp:145,atk:110,def:130,spd:80,abilitySpeed:98},
   abilities:{
     basic:{name:"Crush Claw",upgrades:["20 dmg+DEF-8%","26 dmg","33 dmg","42 dmg","Also slow 15%"]},
     special:{name:"Abyssal Grip",upgrades:["Pull all+40 dmg","Pull all+52 dmg","Pull all+stun 1.5s","Pull all+stun 2s","Pull all+silence 2s+strip 1 buff"]},
     unique:{name:"Abyss Fortress",upgrades:["Passive: -22 all dmg; allies behind take -10%","-30 dmg; -15%","-38 dmg; -20%; thorns 15 dmg","-48 dmg; -26%; thorns 22 dmg","-58 dmg; -32%; thorns 30 dmg; negate hits 15%"]}
   },role:"Support",attackType:"Melee",evolutionOf:"tidalcrusher",shardsToAscend:22,ascensionsToEvolve:null},
  // Water line 3
  {id:"seadrake",name:"Seadrake",emoji:"🐍",type:"Water",rarity:"rare",description:"A sleek oceanic serpent that moves like a current and strikes like a wave.",
   stats:{hp:62,atk:52,def:55,spd:72,abilitySpeed:45},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+10% slow","16 dmg","20 dmg","26 dmg","Poison 5 dmg/s 2s"]},
     special:{name:"Riptide",upgrades:["Dash; leave water trail 2s","Stronger trail 3s","Trail slows 25%","Trail slows 35%","Trail also deals 15 dmg/s"]},
     unique:{name:"Slick Scales",upgrades:["Passive: 12% dodge chance","15%","18%; counter 15 dmg on dodge","22%; counter 22 dmg","26%; counter 30 dmg; dodges grant +10 SPD 2s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"deepdrake"},
  {id:"deepdrake",name:"Bathydrake",emoji:"🐍",type:"Water",rarity:"rare",description:"Seadrake fully grown. It coils around ships and drags them to the seafloor.",
   stats:{hp:95,atk:80,def:84,spd:106,abilitySpeed:68},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+slow","16 dmg","20 dmg","26 dmg","Poison 2s"]},
     special:{name:"Coil Crush",upgrades:["Constrict 1 foe; 45 dmg+DEF-15% 4s","55 dmg","68 dmg","84 dmg","Constrict stuns 1s also"]},
     unique:{name:"Deep Coils",upgrades:["Passive: constrict effects last +1s","Constricted foes take +15% dmg","Constricted take +22% dmg","Constricted take +30% dmg","Constricted take +38% dmg; Deepdrake heals 15 HP/s while constricting"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"seadrake",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"abyssdrake"},
  {id:"abyssdrake",name:"Abyssaur",emoji:"🐉",type:"Water",rarity:"rare",description:"An ancient leviathan. Every ocean myth traces back to this creature.",
   stats:{hp:130,atk:110,def:114,spd:140,abilitySpeed:92},
   abilities:{
     basic:{name:"Water Fang",upgrades:["12 dmg+slow","16 dmg","20 dmg","26 dmg","Poison 2s"]},
     special:{name:"Leviathan Coil",upgrades:["Constrict all nearby; 60 dmg","76 dmg","95 dmg","118 dmg","Constrict silences+strips 1 buff"]},
     unique:{name:"Leviathan Body",upgrades:["Passive: 18% dodge; immune to constrict","22% dodge","26% dodge; counter 35 dmg","30% dodge; counter 50 dmg","35% dodge; counter 65 dmg; immune to all movement-impairing effects"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"deepdrake",shardsToAscend:22,ascensionsToEvolve:null},
  // Fire line 1
  {id:"lavagator",name:"Lavagator",emoji:"🐊",type:"Fire",rarity:"rare",description:"A lava-soaked crocodile that lurks in molten rivers. Approach only if you are also on fire.",
   stats:{hp:68,atk:72,def:52,spd:48,abilitySpeed:52},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn 3 dmg/s 2s","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Magma Slam",upgrades:["50 dmg; lava pool 2s","62 dmg","76 dmg","94 dmg","Pool lasts 4s; 12 dmg/s"]},
     unique:{name:"Lava Skin",upgrades:["Passive: attackers take 12 fire dmg","Attackers take 18 dmg","Attackers take 25 dmg+burn 2s","Attackers take 32 dmg+burn 3s","Attackers take 42 dmg+burn 3s; Lavagator heals 5 HP per burn tick"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"magmadrake"},
  {id:"magmadrake",name:"Magmadrake",emoji:"🐊",type:"Fire",rarity:"rare",description:"Lavagator evolved into a draconic fire lizard. Geysers erupt in its footprints.",
   stats:{hp:102,atk:108,def:78,spd:72,abilitySpeed:78},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Geyser Strike",upgrades:["70 dmg; knock up 1s","88 dmg","108 dmg","132 dmg","Geyser persists 2s; 20 dmg/s"]},
     unique:{name:"Magma Core",upgrades:["Passive: -12 all dmg; attackers burn 2s","Reduce 18; burn 3s","Reduce 24; burn 3s","Reduce 32; burn 4s","Reduce 40; burn 4s; immune to fire dmg"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"lavagator",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"cinderdrake"},
  {id:"cinderdrake",name:"Pyrotegu",emoji:"🐉",type:"Fire",rarity:"rare",description:"Magmadrake's final draconic form. A true fire dragon whose breath melts mountains.",
   stats:{hp:138,atk:148,def:106,spd:96,abilitySpeed:105},
   abilities:{
     basic:{name:"Lava Snap",upgrades:["14 dmg+burn","18 dmg","23 dmg","30 dmg","Burn 5 dmg/s 3s"]},
     special:{name:"Volcano Breath",upgrades:["90 dmg cone+burn 4s","112 dmg","138 dmg","168 dmg","Ignite ground 5s; 20 dmg/s"]},
     unique:{name:"Dragon Sovereignty",upgrades:["Passive: fire dmg dealt +22%; burn ignores 15% DEF","Fire +28%; ignore 20%","Fire +34%; ignore 26%","Fire +42%; ignore 32%","Fire +50%; ignore 40%; Cinderdrake revives once at 30% HP wreathed in flame dealing 80 dmg to all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"magmadrake",shardsToAscend:22,ascensionsToEvolve:null},
  // Fire line 2
  {id:"blazemoth",name:"Blazemoth",emoji:"🦋",type:"Fire",rarity:"rare",description:"A moth irresistibly drawn to flame, now made entirely of it. Navigation is not its strong suit.",
   stats:{hp:55,atk:62,def:32,spd:72,abilitySpeed:68},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; 20% burn 2s","14 dmg","18 dmg","24 dmg","Burn spreads to 1 nearby foe"]},
     special:{name:"Fire Dance",upgrades:["+25% dodge+ATK 3s","+32%","+40%","+50%","Also gain +20 SPD 3s"]},
     unique:{name:"Flame Wings",upgrades:["Passive: dodge = counter 15 fire dmg","Counter 22 dmg","Counter 30 dmg+burn","Counter 38 dmg+burn 2s","Counter 48 dmg+burn 3s; burn spreads to 1 nearby"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"scorchwing"},
  {id:"scorchwing",name:"Scorchwing",emoji:"🦋",type:"Fire",rarity:"rare",description:"Blazemoth whose wings have become sheets of living flame. Entire forests ignite in its wake.",
   stats:{hp:82,atk:95,def:50,spd:105,abilitySpeed:100},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; burn 2s","14 dmg","18 dmg","24 dmg","Burn spreads"]},
     special:{name:"Wildfire Dance",upgrades:["Evade+ATK+SPD+35% 3s","+45%","+55%","+68%","Leave fire trail 3s; 15 dmg/s"]},
     unique:{name:"Inferno Scales",upgrades:["Passive: 18% dodge; fire dmg +15%","22% dodge; +20%","26% dodge; +26%","30% dodge; +32%","35% dodge; +40%; at 5 dodges unleash ring 80 fire dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"blazemoth",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"infernosprite"},
  {id:"infernosprite",name:"Infernosprite",emoji:"🦋",type:"Fire",rarity:"rare",description:"Scorchwing transcended into pure flame. It no longer has a physical form — only fire.",
   stats:{hp:110,atk:130,def:68,spd:140,abilitySpeed:132},
   abilities:{
     basic:{name:"Ember Dust",upgrades:["11 dmg; burn","14 dmg","18 dmg","24 dmg","Burn spreads"]},
     special:{name:"Phoenix Dance",upgrades:["Full evade 2s; emerge dealing 60 dmg","75 dmg","92 dmg","112 dmg","Emerge explosion 80 dmg hits all; burn all 4s"]},
     unique:{name:"Pure Flame",upgrades:["Passive: 25% dodge; fire attacks bypass 15% DEF","28% dodge; bypass 20%","32% dodge; bypass 26%","36% dodge; bypass 32%","40% dodge; bypass 40%; Infernosprite revives once as a fire explosion dealing 120 dmg to all"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"scorchwing",shardsToAscend:22,ascensionsToEvolve:null},
  // Fire line 3
  {id:"emberscorp",name:"Emberscorp",emoji:"🦂",type:"Fire",rarity:"rare",description:"A scorpion whose tail-stinger burns white-hot. It hunts by heat signature.",
   stats:{hp:60,atk:65,def:52,spd:55,abilitySpeed:58},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn 4 dmg/s 2s","15 dmg","19 dmg","25 dmg","Burn 6 dmg/s 3s; -10% DEF"]},
     special:{name:"Scorch Pincers",upgrades:["Grab+50 dmg; burn 3s","62 dmg","76 dmg","94 dmg","Grab+silence 1.5s also"]},
     unique:{name:"Venom Flame",upgrades:["Passive: burn also poisons 4 dmg/s 2s","Poison 5 dmg/s 2s","Poison 6 dmg/s 3s","Poison 8 dmg/s 3s","Poison 10 dmg/s 4s; poisoned+burned foes take +20% all dmg"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"pyrescorp"},
  {id:"pyrescorp",name:"Pyrescorp",emoji:"🦂",type:"Fire",rarity:"rare",description:"Emberscorp doubled in size. Its pincers can melt through solid rock.",
   stats:{hp:90,atk:98,def:78,spd:80,abilitySpeed:86},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn","15 dmg","19 dmg","25 dmg","Burn+DEF-10%"]},
     special:{name:"Magma Crush",upgrades:["Grab+70 dmg; burn+slow 4s","88 dmg","108 dmg","132 dmg","Also stuns 1s; strips 1 buff"]},
     unique:{name:"Searing Venom",upgrades:["Passive: burn+poison combo deals +15% dmg","20%","26%","32%","40%; Pyrescorp gains +1% ATK per active burn/poison stack"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"emberscorp",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"magmascorp"},
  {id:"magmascorp",name:"Magmascorp",emoji:"🦂",type:"Fire",rarity:"rare",description:"The molten final form. A scorpion whose body is a living volcano and whose sting can crack the earth.",
   stats:{hp:122,atk:134,def:106,spd:108,abilitySpeed:115},
   abilities:{
     basic:{name:"Fire Sting",upgrades:["12 dmg+burn","15 dmg","19 dmg","25 dmg","Burn+DEF-10%"]},
     special:{name:"Volcano Crush",upgrades:["Grab all nearby+85 dmg+eruption","105 dmg","128 dmg","156 dmg","Eruption stuns 1.5s; lava pool 4s"]},
     unique:{name:"Volcanic Body",upgrades:["Passive: all burn/poison effects +30% stronger; attackers burned 3s","Burn+poison +40%","Burn+poison +50%; attackers poisoned also","Burn+poison +62%","Burn+poison +75%; attackers burned+poisoned; Magmascorp immune to both"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"pyrescorp",shardsToAscend:22,ascensionsToEvolve:null},

  // Nature line 1
  {id:"venomviper",name:"Venomviper",emoji:"🐍",type:"Nature",rarity:"rare",description:"A bright green viper dripping with potent toxin. Beautiful and absolutely terrifying.",
   stats:{hp:58,atk:55,def:42,spd:65,abilitySpeed:65},
   abilities:{
     basic:{name:"Venom Bite",upgrades:["11 dmg+poison 5 dmg/s 2s","14 dmg","18 dmg","24 dmg","Poison 7 dmg/s 3s; -10% DEF"]},
     special:{name:"Toxic Spit",upgrades:["Ranged; poison 5 dmg/s 4s+slow 20%","Poison 7 dmg/s","Poison 9 dmg/s","Poison 12 dmg/s","Poison spreads to 1 nearby foe"]},
     unique:{name:"Lethal Toxin",upgrades:["Passive: poison stacks twice on same foe","Poison stacks 3x","Stacks 3x; +10% dmg per stack","Stacks 4x; +12% dmg per stack","Stacks 4x; +15% per stack; at 4 stacks foe is paralyzed 1s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"toxicserpent"},
  {id:"toxicserpent",name:"Serpoxin",emoji:"🐍",type:"Nature",rarity:"rare",description:"Venomviper grown to enormous size. Its venom cloud alone is enough to wilt entire forests.",
   stats:{hp:88,atk:82,def:64,spd:96,abilitySpeed:98},
   abilities:{
     basic:{name:"Venom Bite",upgrades:["11 dmg+poison","14 dmg","18 dmg","24 dmg","Poison+DEF-10%"]},
     special:{name:"Poison Cloud",upgrades:["Cloud; 5 dmg/s 4s to all in area","7 dmg/s","9 dmg/s","12 dmg/s 5s","Cloud lingers 6s; also reduces ATK 15%"]},
     unique:{name:"Virulent Venom",upgrades:["Passive: all poisons deal +20% dmg","Poisons +28%","Poisons +36%; heal 5 HP per poison tick done","Poisons +44%; heal 8 HP","Poisons +55%; heal 12 HP; Nature allies gain 10% of Toxicserpent's poison output as healing"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"venomviper",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"poisonwyrm"},
  {id:"poisonwyrm",name:"Regicobra",emoji:"🐉",type:"Nature",rarity:"rare",description:"A legendary toxic wyrm. Its scales shed clouds of spores that poison entire regions.",
   stats:{hp:120,atk:112,def:88,spd:128,abilitySpeed:128},
   abilities:{
     basic:{name:"Venom Bite",upgrades:["11 dmg+poison","14 dmg","18 dmg","24 dmg","Poison+DEF-10%"]},
     special:{name:"Spore Eruption",upgrades:["Huge cloud; poison all 8s","Poison stronger","Even stronger","Max poison","Spores also paralyze 1s; spread to 2 nearby foes"]},
     unique:{name:"Plague Lord",upgrades:["Passive: enemies can't remove poison from Poisonwyrm's stacks; stacks cap raised by 2","Stacks +3","Stacks +4; poison deals +20% dmg","Stacks +5; +28% dmg","Stacks +6; +36% dmg; Poisonwyrm heals 15 HP per poison stack active on any enemy"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"toxicserpent",shardsToAscend:22,ascensionsToEvolve:null},
  // Nature line 2
  {id:"mosskrab",name:"Mosskrab",emoji:"🦀",type:"Nature",rarity:"rare",description:"A moss-covered crab that looks like a walking garden. Surprisingly effective healer.",
   stats:{hp:68,atk:42,def:72,spd:38,abilitySpeed:68},
   abilities:{
     basic:{name:"Vine Pinch",upgrades:["10 dmg; root 0.5s","13 dmg","17 dmg","22 dmg","Root 1s; heal self 10 HP"]},
     special:{name:"Moss Heal",upgrades:["Heal ally 28 HP+regen 3 HP/s 4s","Heal 38+regen 4","Heal 50+regen 5","Heal 65+regen 7","Heal all allies 30 HP+regen 5 HP/s"]},
     unique:{name:"Living Moss",upgrades:["Passive: all allies regen 3 HP/s","Regen 5 HP/s","Regen 7 HP/s; Nature moves +8% healing","Regen 9 HP/s; +12%","Regen 12 HP/s; +16%; Mosskrab's heals cannot crit-miss"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"jadekrab"},
  {id:"jadekrab",name:"Jadekrab",emoji:"🦀",type:"Nature",rarity:"rare",description:"Mosskrab whose shell has turned to jade crystal. Its carapace deflects even magic.",
   stats:{hp:102,atk:62,def:108,spd:56,abilitySpeed:100},
   abilities:{
     basic:{name:"Vine Pinch",upgrades:["10 dmg; root 0.5s","13 dmg","17 dmg","22 dmg","Root 1s; heal 10 HP"]},
     special:{name:"Jade Bloom",upgrades:["Heal all allies 42 HP+regen 5 HP/s","Heal 56+regen 7","Heal 72+regen 9","Heal 90+regen 12","Remove all debuffs; regen 15 HP/s 4s"]},
     unique:{name:"Jade Carapace",upgrades:["Passive: reduce all dmg by 18; Nature allies +10% max HP","Reduce 25; +14%","Reduce 32; +18%","Reduce 40; +22%","Reduce 50; +28%; reflect 15% blocked dmg to attacker"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mosskrab",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"crystalshell"},
  {id:"crystalshell",name:"Crystalshell",emoji:"🦀",type:"Nature",rarity:"rare",description:"Jadekrab's ultimate form. A mobile fortress of living crystal that heals everything around it.",
   stats:{hp:138,atk:84,def:146,spd:74,abilitySpeed:132},
   abilities:{
     basic:{name:"Vine Pinch",upgrades:["10 dmg; root 0.5s","13 dmg","17 dmg","22 dmg","Root 1s; heal 10 HP"]},
     special:{name:"Crystal Bloom",upgrades:["Heal all allies 60 HP+regen 8 HP/s+cleanse","Heal 78","Heal 98","Heal 122","Revive 1 fallen ally at 25% HP; cleanse all; regen 12 HP/s"]},
     unique:{name:"Crystal Sovereign",upgrades:["Passive: all allies -15% dmg taken; +12 HP/s regen","Allies -20%; +15 HP/s","Allies -26%; +19 HP/s","Allies -32%; +24 HP/s","Allies -38%; +30 HP/s; Crystalshell revives once at full HP; death heals all allies 100 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"jadekrab",shardsToAscend:22,ascensionsToEvolve:null},
  // Nature line 3
  {id:"thornturtle",name:"Thornturtle",emoji:"🐢",type:"Nature",rarity:"rare",description:"A turtle whose shell has grown a thicket of razor thorns. Even looking at it hurts.",
   stats:{hp:72,atk:32,def:80,spd:28,abilitySpeed:72},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn 8 dmg return","13 dmg","16 dmg","21 dmg","Thorn dmg return 15"]},
     special:{name:"Shell Curl",upgrades:["Retract; -40% dmg taken 3s+thorns 20 dmg","Reduce 55%","Reduce 70%","Reduce 80%","Immune to dmg 2s; emerge explodes 50 dmg"]},
     unique:{name:"Spiked Shell",upgrades:["Passive: all attackers take 15 thorn dmg","Attackers take 22 dmg","22 dmg+poison 3 dmg/s 2s","30 dmg+poison","40 dmg+poison 5 dmg/s 3s; 15% chance negate hit and return 50% of it"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"jadeshell"},
  {id:"jadeshell",name:"Jadeshell",emoji:"🐢",type:"Nature",rarity:"rare",description:"Thornturtle grown to the size of a small island. Entire ecosystems have formed on its back.",
   stats:{hp:108,atk:48,def:120,spd:42,abilitySpeed:108},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn return","13 dmg","16 dmg","21 dmg","Thorn return 15"]},
     special:{name:"Island Shell",upgrades:["Allies stand on shell; all take -30% dmg 4s","-40%","-50%","-60%","-70%; allies on shell also gain +15% ATK"]},
     unique:{name:"Titan Thorns",upgrades:["Passive: thorn dmg +30%; heal 8 HP/s","Thorn +40%; 11 HP/s","Thorn +50%; 14 HP/s","Thorn +62%; 18 HP/s","Thorn +75%; 24 HP/s; at 10 thorn triggers in a fight, release a 100 dmg thorn explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"thornturtle",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"ancientshell"},
  {id:"ancientshell",name:"Shellith",emoji:"🐢",type:"Nature",rarity:"rare",description:"An ageless colossus. Ancientshell has outlived civilizations. Mountains erode before its shell does.",
   stats:{hp:148,atk:65,def:162,spd:56,abilitySpeed:145},
   abilities:{
     basic:{name:"Thorn Snap",upgrades:["10 dmg+thorn return","13 dmg","16 dmg","21 dmg","Thorn return 15"]},
     special:{name:"Ancient Shell",upgrades:["All allies invincible 1s; then shield 100 HP","Invincible 1.5s","Invincible 2s","Invincible 2.5s","Invincible 3s; shield 150 HP; remove all debuffs"]},
     unique:{name:"Primordial Shell",upgrades:["Passive: -25 all dmg; thorns 20 dmg; allies -12% dmg","Reduce 34; thorns 28; allies -16%","Reduce 43; thorns 36; allies -20%","Reduce 54; thorns 46; allies -25%","Reduce 65; thorns 56; allies -30%; revive once; death triggers massive thorn explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"jadeshell",shardsToAscend:22,ascensionsToEvolve:null},
  // Earth line 1
  {id:"ironmole",name:"Ironmole",emoji:"🦔",type:"Earth",rarity:"rare",description:"A mole with iron-reinforced claws that can tunnel through bedrock. Hates sunlight, loves ambush.",
   stats:{hp:78,atk:48,def:88,spd:32,abilitySpeed:44},
   abilities:{
     basic:{name:"Iron Claw",upgrades:["12 dmg; reduce DEF 6% 3s","15 dmg","19 dmg","25 dmg","Reduce DEF 10%+slow 15%"]},
     special:{name:"Tunnel Ambush",upgrades:["Burrow; emerge 3s later+60 dmg","70 dmg","85 dmg","104 dmg","Emerge+stun 1s+crater zone 2s 20 dmg/s"]},
     unique:{name:"Iron Hide",upgrades:["Passive: -15 all dmg; immune to knockback","Reduce 22; immune to stun also","Reduce 28","Reduce 36; CC immune","Reduce 44; CC immune; reflect 15% of blocked dmg"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"steelmole"},
  {id:"steelmole",name:"Steelmole",emoji:"🦔",type:"Earth",rarity:"rare",description:"Ironmole evolved. Its claws are now steel-grade and its hide deflects artillery.",
   stats:{hp:116,atk:72,def:132,spd:48,abilitySpeed:66},
   abilities:{
     basic:{name:"Iron Claw",upgrades:["12 dmg; DEF-6%","15 dmg","19 dmg","25 dmg","DEF-10%+slow 15%"]},
     special:{name:"Steel Drill",upgrades:["Drill through foe; 80 dmg+DEF-20% 5s","95 dmg","115 dmg","140 dmg","Drill stuns 1.5s+strip 1 buff"]},
     unique:{name:"Steel Fortress",upgrades:["Passive: -22 all dmg; reflect 10% dmg blocked","-30 dmg; reflect 14%","-38 dmg; reflect 18%","-48 dmg; reflect 22%","-58 dmg; reflect 28%; CC immune; at 100 reflected dmg trigger a free tunnel ambush"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"ironmole",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"titanmole"},
  {id:"titanmole",name:"Titanmole",emoji:"🦔",type:"Earth",rarity:"rare",description:"Steelmole's titan form. Its tunnels cause earthquakes. Geologists blame it for every continental shift.",
   stats:{hp:158,atk:98,def:178,spd:64,abilitySpeed:90},
   abilities:{
     basic:{name:"Iron Claw",upgrades:["12 dmg; DEF-6%","15 dmg","19 dmg","25 dmg","DEF-10%+slow 15%"]},
     special:{name:"Titan Drill",upgrades:["Pierce through all foes in line; 100 dmg+DEF-25%","120 dmg","145 dmg","175 dmg","Pierce+stun 2s+strip all buffs"]},
     unique:{name:"Titan Core",upgrades:["Passive: -30 all dmg; CC immune; reflect 18% blocked","-40 dmg; reflect 22%","-50 dmg; reflect 28%","-62 dmg; reflect 34%","-75 dmg; reflect 42%; revive once; death causes massive underground collapse 200 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"steelmole",shardsToAscend:22,ascensionsToEvolve:null},
  // Earth line 2
  {id:"dustcrawler",name:"Pulvicrawl",emoji:"🦂",type:"Earth",rarity:"rare",description:"A fat desert scorpion that hides under sand and ambushes prey. Masters the art of patience.",
   stats:{hp:62,atk:58,def:62,spd:45,abilitySpeed:55},
   abilities:{
     basic:{name:"Sand Sting",upgrades:["12 dmg+blind 0.5s","15 dmg","19 dmg","25 dmg","Blind 1s+slow 15%"]},
     special:{name:"Sand Burial",upgrades:["Bury foe 1.5s; 40 dmg on emerge","50 dmg","62 dmg","76 dmg","Bury 2s; +25% dmg taken while buried"]},
     unique:{name:"Sand Ambush",upgrades:["Passive: first attack from burrow deals +50% dmg","First attack +65%","First attack +80%","First attack +100%","First attack +120%; stuns 1s; Dustcrawler can burrow freely without cooldown during ultimate"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"sandcrawler"},
  {id:"sandcrawler",name:"Arenid",emoji:"🦂",type:"Earth",rarity:"rare",description:"Dustcrawler evolved. It moves through sand as fast as other creatures move through air.",
   stats:{hp:94,atk:88,def:94,spd:68,abilitySpeed:82},
   abilities:{
     basic:{name:"Sand Sting",upgrades:["12 dmg+blind","15 dmg","19 dmg","25 dmg","Blind+slow 15%"]},
     special:{name:"Desert Burial",upgrades:["Bury foe 2s; 60 dmg+stun on emerge","74 dmg","90 dmg","110 dmg","Bury 3s; emerge stun 1.5s+strip 1 buff"]},
     unique:{name:"Sandstorm Body",upgrades:["Passive: sandstorm aura; nearby foes 15% miss chance","20% miss","25% miss; ambush attacks +70%","30% miss; ambush +90%","35% miss; ambush +110%; crit chance +18% in sandstorm"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"dustcrawler",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"dunekraken"},
  {id:"dunekraken",name:"Dunekraken",emoji:"🦂",type:"Earth",rarity:"rare",description:"A mythical desert colossus. Dunekraken doesn't burrow through sand — it is the sand.",
   stats:{hp:128,atk:120,def:128,spd:92,abilitySpeed:110},
   abilities:{
     basic:{name:"Sand Sting",upgrades:["12 dmg+blind","15 dmg","19 dmg","25 dmg","Blind+slow"]},
     special:{name:"Kraken Burial",upgrades:["Bury all nearby 2s+60 dmg each","76 dmg","95 dmg","118 dmg","Bury 3s; strip all buffs; +30% dmg taken while buried"]},
     unique:{name:"Desert Sovereign",upgrades:["Passive: 30% miss chance aura; ambush attacks +130%","Miss 36%; ambush +160%","Miss 42%; ambush +190%","Miss 48%; ambush +220%","Miss 55%; ambush +250%; Dunekraken is invisible until it attacks; first ambush each fight stuns all enemies 2s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"sandcrawler",shardsToAscend:22,ascensionsToEvolve:null},
  // Earth line 3
  {id:"quakebeetle",name:"Quakebeetle",emoji:"🪲",type:"Earth",rarity:"rare",description:"A heavy-shelled beetle whose footsteps register on seismometers. It is unaware of this.",
   stats:{hp:68,atk:42,def:78,spd:35,abilitySpeed:65},
   abilities:{
     basic:{name:"Shell Slam",upgrades:["11 dmg; stagger 0.5s","14 dmg","18 dmg","24 dmg","Stagger 1s+DEF-8%"]},
     special:{name:"Tremor Charge",upgrades:["Charge+55 dmg+knockback","68 dmg","84 dmg","102 dmg","Shockwave hits all in path"]},
     unique:{name:"Seismic Body",upgrades:["Passive: every move causes tremor; nearby foes -10% ATK","Tremor -14% ATK","Tremor -18% ATK+SPD","Tremor -22% ATK+SPD","Tremor -28% ATK+SPD+Ability Speed; tremor triggers every 3s automatically"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"stonebeetle"},
  {id:"stonebeetle",name:"Lithbeetle",emoji:"🪲",type:"Earth",rarity:"rare",description:"Quakebeetle's shell has hardened to stone. It is functionally a boulder with legs.",
   stats:{hp:102,atk:62,def:118,spd:52,abilitySpeed:98},
   abilities:{
     basic:{name:"Stone Slam",upgrades:["14 dmg; DEF-10% 3s","18 dmg","23 dmg","30 dmg","DEF-15%+stun 0.5s"]},
     special:{name:"Boulder Charge",upgrades:["Charge; 80 dmg; stun 1s","96 dmg","116 dmg","140 dmg","Stun 1.5s; leave crater 3s"]},
     unique:{name:"Living Stone",upgrades:["Passive: -20 all dmg; quake aura -15% all enemy stats","Reduce 28; -20%","Reduce 36; -26%","Reduce 46; -32%","Reduce 56; -40%; Stonebeetle immune to all ground effects"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quakebeetle",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"gemscrab"},
  {id:"gemscrab",name:"Gemscrab",emoji:"🪲",type:"Earth",rarity:"rare",description:"Stonebeetle's shell has crystallized into pure gemstone. It diffracts light and cannot be cracked.",
   stats:{hp:138,atk:84,def:160,spd:70,abilitySpeed:130},
   abilities:{
     basic:{name:"Gem Slam",upgrades:["18 dmg; DEF-15% 4s","23 dmg","30 dmg","38 dmg","DEF-20%+stun 1s+strip 1 buff"]},
     special:{name:"Gem Fortress",upgrades:["DEF+100 6s; thorns 25 dmg; quake aura","DEF+130","DEF+165","DEF+200","DEF+240; reflect 25% all dmg; aura stuns every 3s 0.5s"]},
     unique:{name:"Gemstone Core",upgrades:["Passive: -28 all dmg; reflect 20% blocked; thorns 22 dmg","-38 dmg; reflect 25%; thorns 30","-48 dmg; reflect 30%; thorns 40","-60 dmg; reflect 36%; thorns 52","-72 dmg; reflect 44%; thorns 65; CC immune; revive once; death shatters releasing 150 dmg gem explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonebeetle",shardsToAscend:22,ascensionsToEvolve:null},
  // Wind line 1
  {id:"skyeel",name:"Skyeel",emoji:"🐉",type:"Wind",rarity:"rare",description:"A long serpentine eel that drifts through the upper atmosphere. Surprisingly fast for something that has no legs.",
   stats:{hp:48,atk:58,def:32,spd:92,abilitySpeed:50},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20% 2s"]},
     special:{name:"Sky Coil",upgrades:["Coil foe+wind prison; 40 dmg+SPD-25% 4s","50 dmg","62 dmg","76 dmg","Also silence 1.5s"]},
     unique:{name:"Aerial Body",upgrades:["Passive: immune to ground effects; +15% dodge","Immune; +20% dodge","Immune; +25% dodge; wind attacks +12% dmg","Immune; +30% dodge; +16% dmg","Immune; +35% dodge; +20% dmg; dodges release wind burst 30 dmg nearby"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"galeeel"},
  {id:"galeeel",name:"Vorteel",emoji:"🐉",type:"Wind",rarity:"rare",description:"Skyeel that has absorbed a gale. It moves faster than the eye can track.",
   stats:{hp:72,atk:88,def:52,spd:138,abilitySpeed:76},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20%"]},
     special:{name:"Cyclone Coil",upgrades:["Coil all nearby+60 dmg+SPD-35% 5s","74 dmg","90 dmg","110 dmg","Also stun 1s+silence 2s"]},
     unique:{name:"Storm Body",upgrades:["Passive: immune to ground; +25% dodge; wind dmg +15%","Dodge +30%; +20%","Dodge +35%; +26%","Dodge +40%; +32%","Dodge +46%; +40%; dodges trigger free Gale Fang"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"skyeel",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"stormeel"},
  {id:"stormeel",name:"Stormeel",emoji:"🐉",type:"Wind",rarity:"rare",description:"A storm given serpent form. Stormeel's passage reshapes cloud formations permanently.",
   stats:{hp:98,atk:120,def:70,spd:185,abilitySpeed:102},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["12 dmg+push","15 dmg","19 dmg","25 dmg","Push+slow 20%"]},
     special:{name:"Tempest Coil",upgrades:["Coil all+80 dmg+SPD-50%+silence 2s","96 dmg","116 dmg","140 dmg","Also strip all buffs+stun 1.5s"]},
     unique:{name:"Living Storm",upgrades:["Passive: immune to ground/wind; +36% dodge; wind dmg +22%","Dodge +42%; +28%","Dodge +48%; +34%","Dodge +55%; +42%","Dodge +62%; +50%; Stormeel becomes invisible at max speed; first hit per second is always a crit"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"galeeel",shardsToAscend:22,ascensionsToEvolve:null},
  // Wind line 2
  {id:"squallhawk",name:"Squallhawk",emoji:"🦅",type:"Wind",rarity:"rare",description:"A hawk that rides its own personal squall. Technically never touches the ground.",
   stats:{hp:42,atk:68,def:28,spd:105,abilitySpeed:45},
   abilities:{
     basic:{name:"Talon Strike",upgrades:["13 dmg; knockback","17 dmg","22 dmg","28 dmg","Knockback+slow 20% 2s"]},
     special:{name:"Dive Bomb",upgrades:["Dive; 55 dmg+stun 0.5s","68 dmg","84 dmg","102 dmg","Stun 1s; leave wind vortex 2s"]},
     unique:{name:"Hunter's Wind",upgrades:["Passive: +18% crit chance; crits also push foe","Crit +24%","Crit +30%; crit slows 20% 2s","Crit +36%; crit slows 25%","Crit +44%; crit slows 30%; crits on slowed foes deal +30% dmg"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"galebeak"},
  {id:"galebeak",name:"Galebeak",emoji:"🦅",type:"Wind",rarity:"rare",description:"Squallhawk grown. Its beak can pierce steel and its talons generate sonic booms.",
   stats:{hp:64,atk:102,def:42,spd:152,abilitySpeed:68},
   abilities:{
     basic:{name:"Talon Strike",upgrades:["13 dmg+knockback","17 dmg","22 dmg","28 dmg","Knockback+slow 20%"]},
     special:{name:"Sonic Dive",upgrades:["Sonic boom on land; 80 dmg+stun 1s","96 dmg","116 dmg","140 dmg","Stun 1.5s; shockwave hits all nearby 40 dmg"]},
     unique:{name:"Gale Predator",upgrades:["Passive: +26% crit; crits slow 28% 2s; wind attacks +15%","Crit +32%; +20% wind","Crit +38%; +26% wind","Crit +45%; +32% wind","Crit +54%; +40% wind; on crit a free talon strike automatically fires"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"squallhawk",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"strikewing"},
  {id:"strikewing",name:"Strikewing",emoji:"🦅",type:"Wind",rarity:"rare",description:"An apex aerial predator. Strikewing hits with the force of a lightning bolt and vanishes before you register the pain.",
   stats:{hp:88,atk:140,def:58,spd:202,abilitySpeed:92},
   abilities:{
     basic:{name:"Thunder Talon",upgrades:["18 dmg+knockback+slow","23 dmg","30 dmg","38 dmg","Knockback+stun 0.5s+slow 30%"]},
     special:{name:"Apex Dive",upgrades:["100 dmg+stun 1.5s; shockwave 60 dmg","120 dmg","145 dmg","175 dmg","Shockwave hits all; stun 2s; all hit lose 1 buff"]},
     unique:{name:"Apex Predator",upgrades:["Passive: +36% crit; crits on slowed foes +40% dmg; wind attacks ignore 20% DEF","Crit +44%; +50% dmg; ignore 26%","Crit +52%; +60% dmg; ignore 32%","Crit +62%; +72% dmg; ignore 40%","Crit +72%; +85% dmg; ignore 50%; Strikewing cannot be targeted by enemies while flying between attacks"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"galebeak",shardsToAscend:22,ascensionsToEvolve:null},
  // Wind line 3
  {id:"whirlbug",name:"Whirlbug",emoji:"🪲",type:"Wind",rarity:"rare",description:"A large spinning beetle that generates a personal tornado at all times. Very hard to catch.",
   stats:{hp:45,atk:60,def:30,spd:95,abilitySpeed:62},
   abilities:{
     basic:{name:"Spin Slash",upgrades:["11 dmg; hit all nearby","14 dmg","18 dmg","24 dmg","Hit nearby+push all back"]},
     special:{name:"Tornado Spin",upgrades:["Spin; 40 dmg all nearby 2s","50 dmg","62 dmg","76 dmg","Spin 3s; pull enemies toward center"]},
     unique:{name:"Perpetual Spin",upgrades:["Passive: spinning at all times; nearby foes -12% ATK","Spinning -16% ATK","Spinning -20% ATK+SPD","Spinning -25% ATK+SPD","Spinning -30% ATK+SPD+Ability Speed; Whirlbug gains +5 SPD per second it stays alive, max +50"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"cyclonbug"},
  {id:"cyclonbug",name:"Cyclonbug",emoji:"🪲",type:"Wind",rarity:"rare",description:"Whirlbug grown. Its spin generates F3-level winds. Construction workers hate it.",
   stats:{hp:68,atk:90,def:46,spd:138,abilitySpeed:92},
   abilities:{
     basic:{name:"Cyclone Slash",upgrades:["15 dmg all nearby+push","19 dmg","24 dmg","32 dmg","Push+slow 25% 2s"]},
     special:{name:"Cyclone Drill",upgrades:["Drill through foe+cyclone at exit; 60 dmg","74 dmg","90 dmg","110 dmg","Cyclone persists 3s; 20 dmg/s; pulls enemies"]},
     unique:{name:"Cyclone Body",upgrades:["Passive: spinning aura; nearby foes -20% ATK+SPD; Cyclonbug +15% dodge","Aura -26%; dodge +20%","Aura -32%; dodge +25%","Aura -38%; dodge +30%","Aura -46%; dodge +36%; spinning aura dmg nearby foes 15 dmg/s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"whirlbug",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"vortexbug"},
  {id:"vortexbug",name:"Vortexbug",emoji:"🪲",type:"Wind",rarity:"rare",description:"A living vortex in beetle form. Vortexbug doesn't fight enemies. It just spins until they stop existing.",
   stats:{hp:92,atk:122,def:63,spd:182,abilitySpeed:122},
   abilities:{
     basic:{name:"Vortex Slash",upgrades:["20 dmg all nearby+push+slow","26 dmg","33 dmg","42 dmg","Push+stun 0.5s+slow 35%"]},
     special:{name:"Vortex Core",upgrades:["Super spin; 80 dmg all+pull+slow 50% 4s","96 dmg","116 dmg","140 dmg","Pull+silence 2s+strip 2 buffs"]},
     unique:{name:"Omega Spin",upgrades:["Passive: aura -30% ATK+SPD+Ability Speed on foes; +26% dodge; dmg 20/s","Aura -38%; dodge +32%; dmg 26/s","Aura -46%; dodge +38%; dmg 32/s","Aura -55%; dodge +46%; dmg 40/s","Aura -65%; dodge +55%; dmg 50/s; Vortexbug immune to all projectiles; dodges trigger free Vortex Core once per 4s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cyclonbug",shardsToAscend:22,ascensionsToEvolve:null},
  // Electric stage 3
  {id:"arcstorm",name:"Arcstorm",emoji:"🌩️",type:"Electric",rarity:"rare",description:"Stormclaw transcended. It no longer moves — it teleports between lightning bolts.",
   stats:{hp:115,atk:145,def:72,spd:122,abilitySpeed:116},
   abilities:{
     basic:{name:"Static Zap",upgrades:["14 dmg; arc 1 foe 50%","19 dmg","25 dmg","32 dmg","Arc to 2 foes; stun each 0.5s"]},
     special:{name:"Arc Surge",upgrades:["Teleport+75 dmg+stun 1s","90 dmg","108 dmg","130 dmg","Stun 1.5s; shockwave 50 dmg nearby on arrival"]},
     unique:{name:"Arc Sovereign",upgrades:["Passive: every hit arcs to 3 foes 60% dmg; electric +22%","Arc to 4 foes 70%; +28%","Arc 5 foes 80%; +34%","Arc 6 foes 90%; +42%","Arc 8 foes 100%; +50%; arcs stun 0.5s; Arcstorm immune to paralysis+stun"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormclaw",shardsToAscend:22,ascensionsToEvolve:null},
  // Electric line 2
  {id:"zapfrog",name:"Zapfrog",emoji:"🐸",type:"Electric",rarity:"rare",description:"A neon frog whose skin conducts lethal voltage. Its croak causes nearby electronics to malfunction.",
   stats:{hp:52,atk:60,def:35,spd:75,abilitySpeed:72},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+15% slow 2s","15 dmg","19 dmg","25 dmg","Shock 8 dmg/s 2s also"]},
     special:{name:"Electric Leap",upgrades:["Leap to foe; 50 dmg+shock 3s","62 dmg","76 dmg","94 dmg","Land creates electric zone 2s"]},
     unique:{name:"Wet Skin",upgrades:["Passive: water-type attacks on Zapfrog empower next electric attack +50%","Empower +70%","Empower +90%","Empower +120%","Empower +150%; water/electric combo always crits; crits chain to 2 extra foes"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"voltfrog"},
  {id:"voltfrog",name:"Voltfrog",emoji:"🐸",type:"Electric",rarity:"rare",description:"Zapfrog grown. Its croak is now a thunderclap. Meteorologists have blamed it for freak storms.",
   stats:{hp:80,atk:92,def:55,spd:108,abilitySpeed:102},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+slow","15 dmg","19 dmg","25 dmg","Shock 2s also"]},
     special:{name:"Thunder Leap",upgrades:["Leap; 72 dmg+stun 1s+shockwave 40 dmg","88 dmg","108 dmg","132 dmg","Shockwave hits all; stun 1.5s; leave electric lake 3s"]},
     unique:{name:"Electric Mucus",upgrades:["Passive: any melee attacker takes 20 shock dmg+slow 15% 2s","Shock 28+slow 20%","Shock 36+slow 25%","Shock 46+slow 30%","Shock 58+slow 38%+stun 0.5s; Voltfrog immune to shock/paralysis"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"zapfrog",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"stormtoad"},
  {id:"stormtoad",name:"Fulgutoad",emoji:"🐸",type:"Electric",rarity:"rare",description:"Voltfrog's ultimate form. A colossal electric toad that literally rains lightning from its body.",
   stats:{hp:108,atk:124,def:72,spd:132,abilitySpeed:128},
   abilities:{
     basic:{name:"Volt Tongue",upgrades:["12 dmg+slow","15 dmg","19 dmg","25 dmg","Shock 2s also"]},
     special:{name:"Storm Leap",upgrades:["Mega leap; 95 dmg+stun 1.5s; shockwave 70 dmg all","115 dmg","140 dmg","168 dmg","Stun 2s; shockwave chains 3 foes; electric lake 4s 20 dmg/s"]},
     unique:{name:"Storm Lord",upgrades:["Passive: melee attackers take 40 shock+stun 0.5s; lightning rain hits 3 random foes each second","Shock 52+stun; rain 4 foes","Shock 65+stun; rain 5 foes","Shock 80+stun; rain 6 foes","Shock 98+stun 1s; rain 8 foes; enemies in range of Stormtoad have a 20% chance to be struck by lightning every 2s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltfrog",shardsToAscend:22,ascensionsToEvolve:null},
  // Electric line 3
  {id:"shockbeetle",name:"Shockbeetle",emoji:"🪲",type:"Electric",rarity:"rare",description:"A metallic beetle that stores charge in its shell. Touching it is inadvisable.",
   stats:{hp:58,atk:62,def:48,spd:58,abilitySpeed:62},
   abilities:{
     basic:{name:"Shock Slam",upgrades:["12 dmg+paralyze 15% 0.5s","15 dmg","19 dmg","25 dmg","Paralyze 22% 1s"]},
     special:{name:"Discharge Shell",upgrades:["Release charge; 55 dmg+stun 0.5s","68 dmg","84 dmg","102 dmg","Stun 1s; paralyze all nearby 0.75s"]},
     unique:{name:"Charge Build",upgrades:["Passive: each hit taken adds 1 charge (max 6); at 6 release 80 dmg burst","Burst 100 dmg","Burst 124 dmg","Burst 152 dmg","Burst 185 dmg; burst stuns all nearby 1.5s; Shockbeetle regens 5 HP per charge"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"voltbeetle"},
  {id:"voltbeetle",name:"Voltbeetle",emoji:"🪲",type:"Electric",rarity:"rare",description:"Shockbeetle evolved. Its shell is now a superconductor. Scientists want to study it. It disagrees.",
   stats:{hp:88,atk:94,def:72,spd:84,abilitySpeed:90},
   abilities:{
     basic:{name:"Volt Slam",upgrades:["16 dmg+paralyze 20% 0.75s","21 dmg","27 dmg","35 dmg","Paralyze 28% 1.5s"]},
     special:{name:"Superdischarge",upgrades:["Discharge; 80 dmg+stun 1s; recharge 4 charge","96 dmg","116 dmg","140 dmg","Stun 1.5s; chain to 2 nearby foes 50%"]},
     unique:{name:"Supercharge",upgrades:["Passive: charges max 8; burst 120 dmg; gain 1 charge every 4s passively","Burst 148 dmg; charge every 3s","Burst 180 dmg; every 3s","Burst 218 dmg; every 2s","Burst 260 dmg; every 2s; burst stuns+paralyzes 2s; Voltbeetle immune to electric dmg"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"shockbeetle",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"arcbeetle"},
  {id:"arcbeetle",name:"Arcbeetle",emoji:"🪲",type:"Electric",rarity:"rare",description:"Voltbeetle's arc-welded final form. It generates its own electromagnetic field that disrupts everything nearby.",
   stats:{hp:120,atk:128,def:98,spd:112,abilitySpeed:118},
   abilities:{
     basic:{name:"Arc Slam",upgrades:["22 dmg+paralyze 28% 1.5s","28 dmg","36 dmg","46 dmg","Paralyze 38% 2s; arc to 1 nearby 60%"]},
     special:{name:"Arc Explosion",upgrades:["120 dmg; EM burst disables abilities 2s+stun 1.5s","144 dmg","172 dmg","204 dmg","Disable 3s; stun 2s; chain full power to 2 nearby"]},
     unique:{name:"Electromagnetic Core",upgrades:["Passive: EM aura; all enemies -25% Ability Speed+paralyze 15% each action","-30%; paralyze 20%","-36%; paralyze 25%","-44%; paralyze 32%","-52%; paralyze 40%; ArcBeetle revives once; death triggers full EMP stunning all enemies 3s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"voltbeetle",shardsToAscend:22,ascensionsToEvolve:null},
  // Light line 1
  {id:"aurorabird",name:"Aurorabird",emoji:"🦜",type:"Light",rarity:"rare",description:"A parrot made of aurora light. Every feather is a different color. Extremely chatty about healing.",
   stats:{hp:52,atk:38,def:45,spd:75,abilitySpeed:82},
   abilities:{
     basic:{name:"Light Peck",upgrades:["9 dmg; cleanse 1 ally debuff","12 dmg","15 dmg","20 dmg","Cleanse all debuffs from 1 ally"]},
     special:{name:"Aurora Heal",upgrades:["Heal all allies 28 HP+regen 5 HP/s 3s","Heal 38+regen 7","Heal 50+regen 9","Heal 65+regen 12","Heal 80+regen 15; grant immunity 1 debuff 4s"]},
     unique:{name:"Aurora Feathers",upgrades:["Passive: all healing +18%; each heal also cleanses 1 debuff","+24%; cleanse 2","30%; cleanse 2","+36%; cleanse all","+44%; cleanse all; overhealing creates shields up to 40 HP"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"radiancebird"},
  {id:"radiancebird",name:"Lumiavis",emoji:"🦜",type:"Light",rarity:"rare",description:"Aurorabird grown into a brilliant phoenix-like being. Its song alone heals wounds.",
   stats:{hp:78,atk:58,def:68,spd:108,abilitySpeed:120},
   abilities:{
     basic:{name:"Radiance Peck",upgrades:["12 dmg; cleanse all debuffs 1 ally","15 dmg","19 dmg","25 dmg","Cleanse all allies 1 debuff each"]},
     special:{name:"Song of Light",upgrades:["Heal all allies 45 HP+regen 8 HP/s+remove 1 debuff","Heal 58+regen 11","Heal 74+regen 14","Heal 92+regen 18","Heal 112+regen 22; remove all debuffs; grant +15% all stats 5s"]},
     unique:{name:"Song Resonance",upgrades:["Passive: healing +26%; healing crits grant +8% ATK to healed ally 4s","+32%; +10% ATK","+38%; +12% ATK; heal overflow = shield","+46%; +15% ATK; overflow shield","+55%; +18% ATK; overflow shield; Radiancebird fully revives once at 50% HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"aurorabird",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"celestbird"},
  {id:"celestbird",name:"Celestbird",emoji:"🦜",type:"Light",rarity:"rare",description:"Radiancebird ascended into a being of pure celestial light. Its very existence heals the world around it.",
   stats:{hp:106,atk:78,def:92,spd:145,abilitySpeed:158},
   abilities:{
     basic:{name:"Celestial Peck",upgrades:["16 dmg; cleanse all allies 1 debuff each","21 dmg","27 dmg","35 dmg","Also grant 1 buff to a random ally"]},
     special:{name:"Celestial Song",upgrades:["Heal all allies 65 HP; regen 12 HP/s; remove all debuffs; grant +18% all stats","Heal 82","Heal 102","Heal 126","Heal 155; regen 18 HP/s; revive 1 fallen ally 30% HP; all stats +25%"]},
     unique:{name:"Celestial Blessing",upgrades:["Passive: all healing +36%; all allies regen 8 HP/s; Celestbird immune to dmg while healing","+44%; regen 11","+52%; regen 14","+62%; regen 18","+72%; regen 24; Celestbird revives 3 times; each time heals all allies 60 HP and blinds enemies 2s"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"radiancebird",shardsToAscend:22,ascensionsToEvolve:null},
  // Light line 2
  {id:"prismcrab",name:"Prismcrab",emoji:"🦀",type:"Light",rarity:"rare",description:"A translucent crab whose shell splits light into rainbows. Enemies get confused by the colors and miss.",
   stats:{hp:60,atk:35,def:65,spd:50,abilitySpeed:82},
   abilities:{
     basic:{name:"Prism Pinch",upgrades:["10 dmg; 18% blind 1s","13 dmg","16 dmg","21 dmg","25% blind 1.5s"]},
     special:{name:"Rainbow Shield",upgrades:["Shield ally 42 HP; 12% dodge 4s","Shield 56; 16%","Shield 72; 20%","Shield 90; 25%","Shield all allies 32 HP; 15% dodge"]},
     unique:{name:"Prism Carapace",upgrades:["Passive: 15% chance to deflect any attack as light beam 20 dmg","18% deflect 26 dmg","22% deflect 34 dmg","26% deflect 44 dmg","30% deflect 56 dmg; deflected beams blind attacker 1s"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"spectrumcrab"},
  {id:"spectrumcrab",name:"Spectrumcrab",emoji:"🦀",type:"Light",rarity:"rare",description:"Prismcrab evolved. Its shell now projects full spectrums that disorient entire armies.",
   stats:{hp:90,atk:52,def:98,spd:74,abilitySpeed:122},
   abilities:{
     basic:{name:"Spectrum Pinch",upgrades:["13 dmg+blind 22% 1.5s","16 dmg","21 dmg","27 dmg","30% blind 2s; also heal self 8 HP"]},
     special:{name:"Spectrum Barrier",upgrades:["Shield all allies 55 HP+20% dodge 5s","Shield 72+25%","Shield 90+30%","Shield 110+36%","Shield 135+42%; also grant immunity to blind 6s"]},
     unique:{name:"Rainbow Aura",upgrades:["Passive: 22% deflect 35 dmg; blind attacker 1s; allies +8% dodge","26% deflect 45 dmg; allies +12%","30% deflect 57 dmg; allies +16%","35% deflect 72 dmg; allies +20%","40% deflect 90 dmg; allies +25% dodge; deflections heal all allies 10 HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"prismcrab",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"rainbowshell"},
  {id:"rainbowshell",name:"Rainbowshell",emoji:"🦀",type:"Light",rarity:"rare",description:"The final prismatic form. Rainbowshell's shell contains every frequency of light. Nothing can hit what it cannot see.",
   stats:{hp:122,atk:70,def:134,spd:100,abilitySpeed:160},
   abilities:{
     basic:{name:"Spectrum Pinch",upgrades:["13 dmg+blind 22%","16 dmg","21 dmg","27 dmg","30% blind 2s; heal 8 HP"]},
     special:{name:"Rainbow Aegis",upgrades:["Shield all allies 78 HP+35% dodge+cleanse 1 debuff","Shield 98+42%","Shield 122+50%","Shield 150+58%","Shield 182+68%; cleanse all; grant immune to blind+slow 6s"]},
     unique:{name:"Perfect Prism",upgrades:["Passive: 32% deflect 65 dmg; blind 1.5s; allies +20% dodge; deflections heal all 15 HP","38% deflect 82 dmg; +24% dodge; heal 20","44% deflect 102 dmg; +28%; heal 26","52% deflect 126 dmg; +32%; heal 34","60% deflect 155 dmg; +38%; heal 44; Rainbowshell cannot be blinded; revives once healing all allies 80 HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"spectrumcrab",shardsToAscend:22,ascensionsToEvolve:null},
  // Light line 3
  {id:"holymoth",name:"Sacramoth",emoji:"🦋",type:"Light",rarity:"rare",description:"A moth that orbits holy shrines. Where it lands, wounds close and darkness retreats.",
   stats:{hp:42,atk:28,def:35,spd:68,abilitySpeed:118},
   abilities:{
     basic:{name:"Holy Dust",upgrades:["8 dmg; 22% blind 1s","11 dmg","14 dmg","18 dmg","28% blind 1.5s; regen 4 HP/s 2s on hit ally"]},
     special:{name:"Sacred Aura",upgrades:["Aura; all allies +12% ATK+DEF 4s","Aura +16%","Aura +20%","Aura +25%","Aura +30%; also +10% Ability Speed; remove 1 debuff each"]},
     unique:{name:"Sacred Wings",upgrades:["Passive: Ability Speed +20% for all allies; each ability cast heals caster 8 HP","+26%; heal 11","30%; heal 14","+36%; heal 18","+44%; heal 24; abilities also cleanse 1 debuff from caster"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"radiantmoth"},
  {id:"radiantmoth",name:"Lumimoth",emoji:"🦋",type:"Light",rarity:"rare",description:"Holymoth evolved. Its wing scales now emit a radiance that makes allies temporarily invulnerable.",
   stats:{hp:62,atk:42,def:52,spd:98,abilitySpeed:175},
   abilities:{
     basic:{name:"Holy Dust",upgrades:["8 dmg; blind 22%","11 dmg","14 dmg","18 dmg","Blind 1.5s; regen 4 HP/s ally"]},
     special:{name:"Radiant Aura",upgrades:["All allies +20% ATK+DEF+Ability Speed 5s","Aura +26%","Aura +32%","Aura +40%","Aura +48%; remove all debuffs; grant overshield 30 HP"]},
     unique:{name:"Moth Radiance",upgrades:["Passive: Ability Speed +30% allies; each ability heals all allies 10 HP","+38%; heal 14","+46%; heal 18","+56%; heal 24","+66%; heal 32; abilities also have 20% chance to fully cleanse all debuffs from all allies"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"holymoth",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"celestimoth"},
  {id:"celestimoth",name:"Celestimoth",emoji:"🦋",type:"Light",rarity:"rare",description:"Radiantmoth's celestial final form. The light from its wings can be seen from the other side of the world.",
   stats:{hp:84,atk:58,def:70,spd:132,abilitySpeed:228},
   abilities:{
     basic:{name:"Celestial Dust",upgrades:["11 dmg; blind 28% 2s; heal 1 ally 12 HP","14 dmg","18 dmg","24 dmg","35% blind 2.5s; heal all allies 8 HP"]},
     special:{name:"Celestial Aura",upgrades:["All allies +30% ATK+DEF+Ability Speed; remove all debuffs 6s","Aura +38%","Aura +46%","Aura +56%","Aura +66%; grant immunity to all debuffs 6s; regen 15 HP/s"]},
     unique:{name:"Heaven's Wings",upgrades:["Passive: all allies Ability Speed +50%; each ability costs no cooldown 15% chance","+60%; 18% free","70%; 22% free","+80%; 26% free","+92%; 32% free; Celestimoth immune to all dmg while an ability is being cast by any ally; revives 3 times"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"radiantmoth",shardsToAscend:22,ascensionsToEvolve:null},
  // Dark line 1
  {id:"voidspider",name:"Vacurach",emoji:"🕷️",type:"Dark",rarity:"rare",description:"A spider that spins webs out of solidified void. Prey caught in its web simply stops existing.",
   stats:{hp:52,atk:72,def:38,spd:68,abilitySpeed:58},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison 4 dmg/s 2s","16 dmg","21 dmg","27 dmg","Poison 6 dmg/s 3s+silence 0.5s"]},
     special:{name:"Void Web",upgrades:["Web; root+silence 2s+25 dmg on struggle","Root+silence 2.5s+32 dmg","Root+silence 3s+40 dmg","Root+silence 3s+50 dmg","Root+silence 3s+silence spreads to 1 nearby; 62 dmg"]},
     unique:{name:"Void Venom",upgrades:["Passive: webbed foes take +20% dmg; void venom ignores 15% DEF","Webbed +28%; ignore 20%","Webbed +36%; ignore 26%","Webbed +44%; ignore 32%","Webbed +55%; ignore 40%; webbed foes can't remove debuffs; Voidspider invisible until it attacks"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"shadowspider"},
  {id:"shadowspider",name:"Umbrachnid",emoji:"🕷️",type:"Dark",rarity:"rare",description:"Voidspider grown to the size of a cart horse. Its webs cover entire dungeon floors.",
   stats:{hp:78,atk:108,def:58,spd:98,abilitySpeed:86},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison+silence","16 dmg","21 dmg","27 dmg","Poison+silence 0.5s"]},
     special:{name:"Shadow Web Flood",upgrades:["Flood area in webs; root all 3s+silence 3s","Root 3.5s","Root+silence 4s","Root+silence 4s+strip 1 buff","Root+silence 4.5s+strip all buffs; 80 dmg to all rooted"]},
     unique:{name:"Shadow Venom",upgrades:["Passive: void venom ignores 25% DEF; first attack invisible = +80% dmg+crit","Ignore 32%; first hit +100%","Ignore 40%; first hit +120%","Ignore 48%; first hit +150%","Ignore 58%; first hit +180%; Shadowspider permanently invisible; only visible when attacking"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidspider",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"abyssspider"},
  {id:"abyssspider",name:"Abyrach",emoji:"🕷️",type:"Dark",rarity:"rare",description:"The final abyss predator. Abyssspider exists in the space between shadows. You only know it's there when it's too late.",
   stats:{hp:106,atk:148,def:78,spd:130,abilitySpeed:115},
   abilities:{
     basic:{name:"Void Bite",upgrades:["13 dmg+poison+silence","16 dmg","21 dmg","27 dmg","Poison+silence+strip 1 buff"]},
     special:{name:"Abyss Web",upgrades:["Web all; root 4s+silence 4s+strip all buffs+80 dmg","96 dmg","116 dmg","140 dmg","Root+silence 5s; webbed foes take 25 dmg/s; void slowly drains 5 HP/s"]},
     unique:{name:"Abyss Sovereign",upgrades:["Passive: permanently invisible; attacks are always crits from stealth; void venom ignores 40% DEF","Ignore 48%","Ignore 58%","Ignore 68%","Ignore 80%; on kill gain 6s invisibility; each kill enhances next strike +25% dmg; Abyssspider revives once invisible"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowspider",shardsToAscend:22,ascensionsToEvolve:null},
  // Dark line 2
  {id:"gloomtoad",name:"Teneboad",emoji:"🐸",type:"Dark",rarity:"rare",description:"A bloated dark toad that absorbs light around it. Anything it eats seems to just disappear.",
   stats:{hp:60,atk:62,def:45,spd:62,abilitySpeed:58},
   abilities:{
     basic:{name:"Dark Tongue",upgrades:["12 dmg; drain 6 HP from target","15 dmg","19 dmg","25 dmg","Drain 10 HP; silence 0.5s"]},
     special:{name:"Gloom Cloud",upgrades:["Cloud; -20% ATK+SPD all enemies 4s","Cloud -26%","Cloud -32%","Cloud -40%","Cloud -48%; also -20% Ability Speed; silence all 1.5s"]},
     unique:{name:"Void Stomach",upgrades:["Passive: 20% of dmg dealt heals Gloomtoad","24%","28%","33%","38%; overheal = shield up to 50 HP; on kill absorb 40% of foe's max HP as permanent bonus HP"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"voidtoad"},
  {id:"voidtoad",name:"Noctoad",emoji:"🐸",type:"Dark",rarity:"rare",description:"Gloomtoad evolved into something that shouldn't exist. Its croaks erase nearby shadows from existence.",
   stats:{hp:90,atk:94,def:68,spd:90,abilitySpeed:86},
   abilities:{
     basic:{name:"Void Tongue",upgrades:["16 dmg; drain 10 HP+silence 0.5s","21 dmg","27 dmg","35 dmg","Drain 15 HP; silence 1s; strip 1 buff"]},
     special:{name:"Void Cloud",upgrades:["Cloud; -30% all enemy stats 5s; silence all 2s","-38%","-46%","-55%","-64%; silence 3s; enemies in cloud can't use abilities"]},
     unique:{name:"Void Absorption",upgrades:["Passive: 28% dmg heals; on kill absorb 50% foe max HP as bonus","32%; absorb 60%","38%; absorb 70%","44%; absorb 80%","52%; absorb 100%; Voidtoad also absorbs 1 buff from each foe it kills"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"gloomtoad",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"shadowtoad"},
  {id:"shadowtoad",name:"Nyctoad",emoji:"🐸",type:"Dark",rarity:"rare",description:"Voidtoad's final form. A darkness incarnate — wherever Shadowtoad is, light simply ceases to function.",
   stats:{hp:122,atk:128,def:92,spd:120,abilitySpeed:115},
   abilities:{
     basic:{name:"Void Tongue",upgrades:["16 dmg+drain 10 HP+silence","21 dmg","27 dmg","35 dmg","Drain 15+silence 1s+strip 1 buff"]},
     special:{name:"Shadow Abyss",upgrades:["Abyss cloud; -40% all enemy stats 6s; silence 3s; can't gain buffs in cloud","-50%","-60%","-72%","-84%; silence 4s; all abilities silenced; drain 20 HP/s in cloud"]},
     unique:{name:"Darkness Incarnate",upgrades:["Passive: 36% dmg heals; kills absorb 100% foe HP bonus; absorb 1 buff per kill","40%; absorb 2 buffs","46%; absorb 3 buffs","52%; absorb all buffs","60%; absorb all buffs+skills; Shadowtoad immune to all light dmg+blind; revives twice growing stronger each time"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidtoad",shardsToAscend:22,ascensionsToEvolve:null},
  // Dark line 3
  {id:"wraithworm",name:"Wraithworm",emoji:"🐛",type:"Dark",rarity:"rare",description:"A translucent dark caterpillar that phases through solid matter. Not malicious, just deeply unsettling.",
   stats:{hp:48,atk:68,def:30,spd:72,abilitySpeed:68},
   abilities:{
     basic:{name:"Phase Bite",upgrades:["13 dmg; ignore 20% DEF","16 dmg","21 dmg","27 dmg","Ignore 28% DEF; silence 0.5s"]},
     special:{name:"Phase Shift",upgrades:["Become untargetable 2s; pass through walls","2.5s","3s; emerge deal 40 dmg","3s; emerge 50 dmg","3.5s; emerge 62 dmg+silence 1.5s"]},
     unique:{name:"Phase Body",upgrades:["Passive: 20% chance any hit phases through (negate)","24%","28%; when negated counter 25 dmg","32%; counter 35 dmg","38%; counter 48 dmg+silence 1s; at 5 negated hits trigger a free Phase Shift"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:10,ascensionsToEvolve:3,evolutionId:"phantomworm"},
  {id:"phantomworm",name:"Spectriworm",emoji:"🐛",type:"Dark",rarity:"rare",description:"Wraithworm evolved into a spectral serpent. It exists only partially in this dimension and fully in chaos.",
   stats:{hp:72,atk:102,def:46,spd:104,abilitySpeed:100},
   abilities:{
     basic:{name:"Phase Bite",upgrades:["13 dmg; ignore 20% DEF","16 dmg","21 dmg","27 dmg","Ignore 28%+silence 0.5s"]},
     special:{name:"Phantom Phase",upgrades:["Untargetable 3s; during this auto-attack for 30 dmg/s","35 dmg/s","42 dmg/s","50 dmg/s","58 dmg/s; emerge dealing 80 dmg+silence all nearby 2s"]},
     unique:{name:"Phantom Existence",upgrades:["Passive: 30% phase-negate chance; counter 40 dmg; attacks ignore 25% DEF","35%; counter 52; ignore 32%","40%; counter 66; ignore 40%","46%; counter 82; ignore 48%","52%; counter 100; ignore 58%; Phantomworm permanently phases between attacks; cannot be targeted between actions"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"wraithworm",shardsToAscend:15,ascensionsToEvolve:5,evolutionId:"voidwyrm"},
  {id:"voidwyrm",name:"Vacumamba",emoji:"🐉",type:"Dark",rarity:"rare",description:"Phantomworm's draconic final form. Voidwyrm doesn't exist in any fixed location — it appears wherever it decides to strike.",
   stats:{hp:98,atk:140,def:62,spd:140,abilitySpeed:135},
   abilities:{
     basic:{name:"Void Fang",upgrades:["18 dmg; ignore 30% DEF+silence 0.5s","23 dmg","30 dmg","38 dmg","Ignore 38% DEF+silence 1s+strip 1 buff"]},
     special:{name:"Void Shift",upgrades:["Vanish all fight; reappear at will; strike for 90 dmg+crit+silence 2s","108 dmg","130 dmg","156 dmg","Strike is undodgeable; applies full void web; strip all buffs from target"]},
     unique:{name:"Void Incarnate",upgrades:["Passive: 44% phase-negate; attacks always ignore 45% DEF; counter 80 dmg; invisible between actions","Ignore 55%; counter 100","Ignore 66%; counter 122","Ignore 78%; counter 148","Ignore 90%; counter 178; Voidwyrm cannot be damaged while phasing; revives once fully healed+invisible"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"phantomworm",shardsToAscend:22,ascensionsToEvolve:null},
  {id:"magmavore",name:"Magmavore",emoji:"🌋",type:"Fire",rarity:"epic",description:"Born inside a volcano, it feeds on molten rock and spits lava at those who dare approach.",
   stats:{hp:90,atk:85,def:70,spd:40,abilitySpeed:45},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["22 dmg + burn pool","30 dmg","38 dmg","50 dmg","Pool lasts 5s and deals 12 dmg/s"]},
     special:{name:"Eruption Shield",upgrades:["Ring deals 25 dmg","Ring 35 dmg","Ring 45 dmg","Ring 55 dmg","Ring also grants +25 DEF while active"]},
     unique:{name:"Molten Hide",upgrades:["Passive: attackers take 10 fire dmg on hit","Attackers take 16 fire dmg on hit","Attackers take 22 fire dmg on hit; Magmavore resists earth damage by 15%","Attackers take 30 fire dmg on hit and are briefly burned (4 dmg/s for 2s)","Attackers take 40 fire dmg, burned for 3s; Magmavore resists earth damage by 30% and heals 5 HP from each burn tick dealt"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"pyroclaw"},
  {id:"pyroclaw",name:"Pyroclaw",emoji:"🌋",type:"Fire",rarity:"epic",description:"Magmavore's molten middle form. Its claws bore through bedrock for fun. Geologists call the aftermath 'intimate.'",
   stats:{hp:123,atk:115,def:97,spd:37,abilitySpeed:43},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["22 dmg + burn pool","30 dmg","38 dmg","50 dmg","Pool lasts 5s and deals 12 dmg/s"]},
     special:{name:"Eruption Shield",upgrades:["Ring deals 25 dmg","Ring 35 dmg","Ring 45 dmg","Ring 55 dmg","Ring also grants +25 DEF while active"]},
     unique:{name:"Pyroclastic Claws",upgrades:["Passive: attackers take 22 fire dmg; each attack leaves a 2s burn pool","Attackers 30 fire; pool 3s","Attackers 40 fire; pool 3s 10/s","Attackers 52 fire; pool 4s 14/s","Attackers 68 fire; pool 4s 18/s; Pyroclaw immune to fire; every 5 attacks erupts 80 dmg all nearby"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"magmavore",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"cindercolosus"},  {id:"cindercolosus",name:"Cindercolosus",emoji:"🧱",type:"Fire",rarity:"epic",description:"Magmavore evolved. Its body is a living volcano. The ground cracks beneath it.",
   stats:{hp:145,atk:135,def:115,spd:35,abilitySpeed:42},
   abilities:{
     basic:{name:"Lava Spit",upgrades:["22 dmg + burn pool","30 dmg","38 dmg","50 dmg","Pool lasts 5s and deals 12 dmg/s"]},
     special:{name:"Eruption Shield",upgrades:["Ring deals 25 dmg","Ring 35 dmg","Ring 45 dmg","Ring 55 dmg","Ring also grants +25 DEF while active"]},
     unique:{name:"Volcanic Core",upgrades:["Passive: every 10s erupts, dealing 30 fire dmg to nearby enemies","Every 8s erupts for 44 fire dmg","Every 7s erupts for 60 fire dmg and creates a burn pool","Every 6s erupts for 78 fire dmg, burn pool lasts 3s","Every 5s erupts for 100 fire dmg, burn pool lasts 4s; enemies hit are knocked back"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"pyroclaw",shardsToAscend:20,ascensionsToEvolve:null},
  {id:"shadowstrike",name:"Shadowstrike",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"A wraith-like cat that phases through walls and strikes from the shadows.",
   stats:{hp:72,atk:90,def:48,spd:88,abilitySpeed:80},
   abilities:{
     basic:{name:"Shadow Swipe",upgrades:["28 dmg","38 dmg","48 dmg","60 dmg","Always crits when attacking from stealth"]},
     special:{name:"Phase Step",upgrades:["Dodge next hit","Dodge + 15 dmg counter","Dodge + 22 dmg counter","Dodge + 30 dmg counter","Phase Step also enters stealth for 2s after dodge"]},
     unique:{name:"Shade Form",upgrades:["Passive: 8% chance to dodge any attack","12% chance to dodge attacks","16% chance to dodge attacks; crits deal +15% bonus damage","20% chance to dodge; crits deal +22% bonus damage","25% chance to dodge; crits deal +30% bonus damage; successfully dodging an attack grants stealth for 1s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"phantomfang"},
  // Dark line 1 final
  {id:"phantomfang",name:"Phantomfang",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"Shadowstrike halfway dissolved into the void. Half-cat, half-shadow, fully committed to ruining your day.",
   stats:{hp:90,atk:117,def:60,spd:112,abilitySpeed:97},
   abilities:{
     basic:{name:"Shadow Swipe",upgrades:["28 dmg","38 dmg","48 dmg","60 dmg","Always crits when attacking from stealth"]},
     special:{name:"Phase Step",upgrades:["Dodge next hit","Dodge + 15 dmg counter","Dodge + 22 dmg counter","Dodge + 30 dmg counter","Phase Step also enters stealth for 2s after dodge"]},
     unique:{name:"Void Body",upgrades:["Passive: 16% dodge; crits deal +22% dmg; stealth entry heals 18 HP; stealth crits +25% dmg","Dodge 20%; crits +28%; heal 24","Dodge 24%; crits +35%; heal 32","Dodge 28%; crits +44%; heal 42","Dodge 34%; crits +54%; heal 55; kills extend stealth 1.5s; immune to slows in stealth"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"shadowstrike",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"nightwraith"},  {id:"nightwraith",name:"Nightwraith",emoji:"🐈‍⬛",type:"Dark",rarity:"epic",description:"Shadowstrike's final form. Not a cat, not a wraith — just the void wearing a cat's smile.",
   stats:{hp:102,atk:135,def:68,spd:128,abilitySpeed:108},
   abilities:{
     basic:{name:"Void Swipe",upgrades:["38 dmg; crit from stealth","50 dmg","62 dmg","78 dmg","Stealth crits deal +40% bonus+silence 1.5s"]},
     special:{name:"Shadow Shift",upgrades:["Untargetable 2.5s; emerge+stealth 2s","3s; emerge+stealth","3.5s; emerge 60 dmg counter","4s; emerge 80 dmg","4.5s; emerge 100 dmg+stun 1s+strip all buffs"]},
     unique:{name:"Abyss Form",upgrades:["Passive: 28% dodge; crits +35% dmg; stealth entry heals 25 HP","32% dodge; crits +44%; heal 35","36% dodge; crits +54%; heal 48","42% dodge; crits +65%; heal 64","48% dodge; crits +80%; heal 85; kills extend stealth 2s; immune to detection"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"phantomfang",shardsToAscend:20,ascensionsToEvolve:null},
  // Fire line 2
  {id:"salamagma",name:"Salamagma",emoji:"🦎",type:"Fire",rarity:"epic",description:"A lava salamander the size of a bus. Scientists describe it as 'extremely hot and very angry.'",
   stats:{hp:102,atk:65,def:108,spd:30,abilitySpeed:40},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn 5/s 3s","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned 3s"]},
     special:{name:"Lava Coat",upgrades:["DEF+70+thorns burn 20/s 4s","DEF+90","DEF+115+thorns 25/s","DEF+140","DEF+170; thorns 30/s; immune to freeze/slow"]},
     unique:{name:"Molten Body",upgrades:["Passive: all attackers burned 3s; -18 all dmg","Burned 4s; -26 dmg","Burned 4s; -34 dmg; burn +20% dmg","Burned 5s; -44 dmg; burn +28%","Burned 5s; -55 dmg; burn +38%; Salamagma immune to fire+burn; heals 8 HP per burn tick on enemies"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"ignadon"},
  {id:"ignadon",name:"Ignadon",emoji:"🦎",type:"Fire",rarity:"epic",description:"Salamagma's scales have hardened to igneous rock. It no longer moves â€” it erupts from place to place.",
   stats:{hp:140,atk:89,def:148,spd:41,abilitySpeed:51},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn 5/s 3s","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned 3s"]},
     special:{name:"Lava Coat",upgrades:["DEF+70+thorns burn 20/s 4s","DEF+90","DEF+115+thorns 25/s","DEF+140","DEF+170; thorns 30/s; immune to freeze/slow"]},
     unique:{name:"Igneous Body",upgrades:["Passive: all attackers burned 4s; -24 all dmg; burn +16% dmg","Burned 4s; -32 dmg; +22%","Burned 5s; -40 dmg; +28%","Burned 5s; -50 dmg; +36%","Burned 5s; -62 dmg; +46%; Ignadon immune to fire+burn; heals 6 HP per burn tick on enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"salamagma",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"lavawyrm"},  {id:"lavawyrm",name:"Molochvast",emoji:"🐉",type:"Fire",rarity:"epic",description:"Salamagma's draconic final form. Volcanologists use it as a reference point for 'catastrophically hot.'",
   stats:{hp:165,atk:105,def:175,spd:48,abilitySpeed:58},
   abilities:{
     basic:{name:"Magma Bite",upgrades:["18 dmg+burn","23 dmg","30 dmg","38 dmg","Burn 8/s 4s; attackers burned"]},
     special:{name:"Dragon Coat",upgrades:["DEF+100+thorns burn 28/s 5s","DEF+130","DEF+165","DEF+200","DEF+240; thorns ignite ground 4s 25/s; allies nearby immune to burn"]},
     unique:{name:"Dragon Inferno",upgrades:["Passive: all attackers burned 5s; -28 all dmg; burn +25% dmg","-38 dmg; +32%","-48 dmg; +40%","-60 dmg; +50%","-72 dmg; +62%; Lavawyrm revives once wreathed in flame; revival deals 200 fire dmg to all enemies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"ignadon",shardsToAscend:20,ascensionsToEvolve:null},
  // Fire line 3
  {id:"blazehornet",name:"Blazehornet",emoji:"🐝",type:"Fire",rarity:"epic",description:"A giant hornet whose stinger is pure white-hot plasma. Extremely territorial about everything.",
   stats:{hp:58,atk:105,def:35,spd:105,abilitySpeed:42},
   abilities:{
     basic:{name:"Plasma Sting",upgrades:["20 dmg+burn 6/s 3s","26 dmg","33 dmg","42 dmg","Burn 9/s 4s; -12% DEF per sting stack"]},
     special:{name:"Hornet Dive",upgrades:["Dive; 80 dmg+stun 0.5s+burn 4s","96 dmg","116 dmg","140 dmg","Stun 1s; burn spreads to 2 nearby"]},
     unique:{name:"Swarm Instinct",upgrades:["Passive: each basic attack spawns phantom sting 40% dmg","Phantom 52%","Phantom 65%; crits on burning foes","Phantom 80%; crits on burning","Phantom 100%; crits on burning; 3 phantoms on crit; Blazehornet immune to fire+burn"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"infernohive"},
  {id:"infernohive",name:"Infernohive",emoji:"🐝",type:"Fire",rarity:"epic",description:"Blazehornet's swarm begins to merge into a living plasma engine. It treats the air as fuel and enemies as sparks.",
   stats:{hp:80,atk:144,def:48,spd:143,abilitySpeed:56},
   abilities:{
     basic:{name:"Plasma Sting",upgrades:["20 dmg+burn 6/s 3s","26 dmg","33 dmg","42 dmg","Burn 9/s 4s; -12% DEF per sting stack"]},
     special:{name:"Hornet Dive",upgrades:["Dive; 80 dmg+stun 0.5s+burn 4s","96 dmg","116 dmg","140 dmg","Stun 1s; burn spreads to 2 nearby"]},
     unique:{name:"Hive Instinct",upgrades:["Passive: each basic spawns phantom sting 60% dmg; crits on burning foes","Phantom 74%","Phantom 88%; burn stacks faster","Phantom 104%; burn +12% dmg","Phantom 122%; burn +22% dmg; 2 phantoms on crit; Infernohive immune to fire+burn"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"blazehornet",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"infernoswarm"},  {id:"infernoswarm",name:"Infernoswarm",emoji:"🐝",type:"Fire",rarity:"epic",description:"Blazehornet multiplied beyond counting. Technically one creature. Practically a wildfire.",
   stats:{hp:94,atk:170,def:56,spd:168,abilitySpeed:65},
   abilities:{
     basic:{name:"Plasma Sting",upgrades:["20 dmg+burn","26 dmg","33 dmg","42 dmg","Burn 9/s 4s; DEF-12%/stack"]},
     special:{name:"Swarm Dive",upgrades:["Full swarm dive; 120 dmg+stun 1s+burn all","144 dmg","172 dmg","204 dmg","Stun 1.5s; burn all nearby; burn ignores 25% DEF"]},
     unique:{name:"Living Wildfire",upgrades:["Passive: phantom stings 100% dmg; crits on burning foes always crit; burn +28% dmg","Burn +36%","Burn +46%","Burn +58%","Burn +72%; Infernoswarm immune to all fire; each sting on a burned foe heals 8 HP; on kill explode 80 dmg AOE"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"infernohive",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 1
  {id:"coralleviathan",name:"Coralleviathan",emoji:"🐙",type:"Water",rarity:"epic",description:"A coral-encrusted leviathan the size of a reef. Marine biologists consider it a protected ecosystem.",
   stats:{hp:108,atk:55,def:118,spd:28,abilitySpeed:38},
   abilities:{
     basic:{name:"Tentacle Slam",upgrades:["16 dmg; stagger 0.5s+DEF-8%","21 dmg","27 dmg","35 dmg","DEF-12%; stagger 1s; heal self 12 HP"]},
     special:{name:"Coral Fortress",upgrades:["DEF+90+regen 12/s 5s+thorns 20","DEF+115","DEF+145+thorns 28","DEF+178","DEF+215; thorns 38; regen 20/s; allies behind take -20% dmg"]},
     unique:{name:"Living Reef",upgrades:["Passive: -22 all dmg; all allies +10 HP/s regen; thorns 18 dmg","Reduce 30; +14 regen; thorns 26","Reduce 38; +18 regen; thorns 35","Reduce 48; +23 regen; thorns 46","Reduce 58; +30 regen; thorns 58; revives once healing all allies 100 HP"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"tidecrush"},
  {id:"tidecrush",name:"Tidecrush",emoji:"🐙",type:"Water",rarity:"epic",description:"Coralleviathan's coral has thickened into an impenetrable fortress. Marine biologists now classify it as a biome.",
   stats:{hp:148,atk:76,def:161,spd:38,abilitySpeed:50},
   abilities:{
     basic:{name:"Tentacle Slam",upgrades:["16 dmg; stagger 0.5s+DEF-8%","21 dmg","27 dmg","35 dmg","DEF-12%; stagger 1s; heal self 12 HP"]},
     special:{name:"Coral Fortress",upgrades:["DEF+90+regen 12/s 5s+thorns 20","DEF+115","DEF+145+thorns 28","DEF+178","DEF+215; thorns 38; regen 20/s; allies behind take -20% dmg"]},
     unique:{name:"Deep Reef",upgrades:["Passive: -30 all dmg; allies +14 HP/s regen; thorns 28 dmg; absorb 15% ally dmg","Reduce 38; +18 regen; thorns 38; absorb 19%","Reduce 48; +22 regen; thorns 50; absorb 23%","Reduce 60; +28 regen; thorns 64; absorb 28%","Reduce 74; +35 regen; thorns 80; absorb 34%; revives once healing all allies 80 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"coralleviathan",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"tidelord"},  {id:"tidelord",name:"Tidelord",emoji:"🐙",type:"Water",rarity:"epic",description:"Coralleviathan's final form. Entire ocean ecosystems orbit it like moons. Navigation is its hobby.",
   stats:{hp:175,atk:90,def:190,spd:44,abilitySpeed:58},
   abilities:{
     basic:{name:"Tentacle Slam",upgrades:["16 dmg; DEF-8%","21 dmg","27 dmg","35 dmg","DEF-12%; stagger 1s; heal 12 HP"]},
     special:{name:"Tide Fortress",upgrades:["DEF+140+regen 20/s+thorns 30; allies invincible 1s","DEF+175","DEF+215","DEF+260","DEF+310; thorns 50; regen 30/s; allies invincible 1.5s; redirect 30% of ally dmg to Tidelord"]},
     unique:{name:"Ocean Sovereign",upgrades:["Passive: -35 all dmg; allies +20 HP/s; thorns 40 dmg; absorb 20% dmg allies take","-45; +26; thorns 52; absorb 26%","-56; +33; thorns 66; absorb 32%","-68; +42; thorns 82; absorb 40%","-82; +52; thorns 100; absorb 50%; Tidelord revives twice; each revival heals all allies 150 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"tidecrush",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 2
  {id:"frostadder",name:"Frostadder",emoji:"🐍",type:"Water",rarity:"epic",description:"A viper whose venom has been replaced by liquid nitrogen. Every bite is a small ice age.",
   stats:{hp:62,atk:108,def:42,spd:92,abilitySpeed:42},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8% 1s","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen foes take +20% dmg"]},
     special:{name:"Cryo Strike",upgrades:["70 dmg+freeze 2s+shatter 40 dmg","85 dmg","104 dmg","126 dmg","Freeze 2.5s; shatter 60 dmg; strip 1 buff"]},
     unique:{name:"Glacial Venom",upgrades:["Passive: all attacks also slow 25% 2s; freeze dmg +25%","Slow 30%; freeze +32%","Slow 36%; freeze +40%","Slow 44%; freeze +50%","Slow 52%; freeze +62%; at 3 frozen enemies active, Frostadder's next hit auto-shatters all for 100 dmg each"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"glaciafang"},
  {id:"glaciafang",name:"Glaciafang",emoji:"🐍",type:"Water",rarity:"epic",description:"Frostadder grown enormous, its scales fused into solid ice plates. Every bite drops the temperature by 20 degrees.",
   stats:{hp:85,atk:148,def:58,spd:126,abilitySpeed:56},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8% 1s","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen foes take +20% dmg"]},
     special:{name:"Cryo Strike",upgrades:["70 dmg+freeze 2s+shatter 40 dmg","85 dmg","104 dmg","126 dmg","Freeze 2.5s; shatter 60 dmg; strip 1 buff"]},
     unique:{name:"Glacial Plates",upgrades:["Passive: all attacks slow 32% 2.5s; freeze dmg +36%; frozen foes take +22% all dmg","Slow 38%; +44%; +28%","Slow 46%; +54%; +34%","Slow 54%; +66%; +42%","Slow 64%; +80%; +52%; at 2 frozen enemies, next hit auto-shatters all for 90 dmg; immune to slow+freeze"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"frostadder",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"glacialwyrm"},  {id:"glacialwyrm",name:"Glacivern",emoji:"🐉",type:"Water",rarity:"epic",description:"Frostadder's final form. A dragon of living ice. Everything within 200m is permanently winter.",
   stats:{hp:100,atk:175,def:68,spd:148,abilitySpeed:65},
   abilities:{
     basic:{name:"Ice Fang",upgrades:["20 dmg+freeze 8%","26 dmg","33 dmg","42 dmg","Freeze 15% 1.5s; frozen +20% dmg"]},
     special:{name:"Glacier Strike",upgrades:["110 dmg+freeze 2.5s+shatter 80 dmg","132 dmg","158 dmg","190 dmg","Freeze 3s; shatter 120 dmg; strip all buffs; can't be unfrozen for 1s"]},
     unique:{name:"Winter Sovereign",upgrades:["Passive: slow 40% on all attacks; freeze dmg +50%; frozen foes take +30% all dmg","Slow 48%; +60%; +38%","Slow 58%; +72%; +46%","Slow 68%; +86%; +56%","Slow 80%; +100%; +68%; Glacialwyrm revives once; revival freezes all enemies 3s and shatters for 150 dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"glaciafang",shardsToAscend:20,ascensionsToEvolve:null},
  // Water line 3
  {id:"stormjelly",name:"Stormjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"A storm-charged jellyfish that floats in the upper atmosphere. Its tentacles conduct lightning into rain.",
   stats:{hp:62,atk:42,def:72,spd:88,abilitySpeed:82},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["12 dmg; shock+slow 15% 2s","15 dmg","19 dmg","25 dmg","Shock+slow 22% 2.5s; heal 1 ally 10 HP"]},
     special:{name:"Storm Veil",upgrades:["Shield all allies 55 HP+12% dodge 5s","Shield 72; 16%","Shield 90; 20%","Shield 110; 25%","Shield 135; 30%; also grant lightning-immune 4s"]},
     unique:{name:"Tempest Drift",upgrades:["Passive: immune to ground; 15% dodge; all allies +8% dodge+12 HP/s regen","18% dodge; +10% dodge; 16/s","22% dodge; +12%; 20/s","26% dodge; +15%; 25/s","30% dodge; +18%; 32/s; Stormjelly's heals also cleanse 1 debuff; can't be targeted while all allies are alive"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"tempestjelly"},
  {id:"tempestjelly",name:"Tempestjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"Stormjelly grown vast and crackling. Its glow can be seen from the ocean floor. Sailors call it a 'sky reef.'",
   stats:{hp:85,atk:58,def:98,spd:119,abilitySpeed:112},
   abilities:{
     basic:{name:"Shock Sting",upgrades:["12 dmg; shock+slow 15% 2s","15 dmg","19 dmg","25 dmg","Shock+slow 22% 2.5s; heal 1 ally 10 HP"]},
     special:{name:"Storm Veil",upgrades:["Shield all allies 55 HP+12% dodge 5s","Shield 72; 16%","Shield 90; 20%","Shield 110; 25%","Shield 135; 30%; also grant lightning-immune 4s"]},
     unique:{name:"Tempest Drift",upgrades:["Passive: immune to ground; 20% dodge; allies +10% dodge+16 HP/s regen; heals cleanse 1 debuff","22% dodge; allies +12%; 20/s","26% dodge; allies +14%; 24/s","30% dodge; allies +17%; 30/s","34% dodge; allies +20%; 38/s; shields overflow as HP; can't be targeted while any ally is below 50% HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"stormjelly",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"abyssjelly"},  {id:"abyssjelly",name:"Abyssjelly",emoji:"🪼",type:"Water",rarity:"epic",description:"Stormjelly sunk to the abyss and absorbed its darkness. It heals with one hand and shocks with the other.",
   stats:{hp:100,atk:68,def:115,spd:140,abilitySpeed:132},
   abilities:{
     basic:{name:"Void Sting",upgrades:["16 dmg; shock+slow+heal 1 ally 15 HP","21 dmg","27 dmg","35 dmg","Shock+slow 30% 3s; heal all allies 10 HP"]},
     special:{name:"Abyss Veil",upgrades:["Shield all 80 HP+24% dodge; remove all debuffs","Shield 105+30%","Shield 132+36%","Shield 162+44%","Shield 198+54%; grant immunity all debuffs 5s; regen 20/s 5s all allies"]},
     unique:{name:"Deep Resonance",upgrades:["Passive: 28% dodge; allies +22% dodge+25 HP/s; heals overflows as shield 60 HP","Dodge 34%; allies +28%; shield 80","Dodge 40%; allies +34%; shield 100","Dodge 48%; allies +42%; shield 125","Dodge 56%; allies +52%; shield 155; Abyssjelly revives 3 times; each revival heals all allies 80 HP+grants 2s invincibility"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"tempestjelly",shardsToAscend:20,ascensionsToEvolve:null},

  // Nature line 1
  {id:"verdantboa",name:"Viriboa",emoji:"🐍",type:"Nature",rarity:"epic",description:"A boa constrictor grown from the world tree itself. What it wraps around becomes part of the forest.",
   stats:{hp:68,atk:98,def:50,spd:90,abilitySpeed:40},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root 0.5s+poison 5/s 2s","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; rooted foes +15% dmg taken"]},
     special:{name:"Constrict",upgrades:["Constrict; 75 dmg+DEF-20% 5s+poison 6/s 4s","90 dmg","108 dmg","130 dmg","Also silence 2s; constricted foes can't use abilities"]},
     unique:{name:"World Tree Body",upgrades:["Passive: poison stacks 4x; rooted foes +20% dmg taken; heal 8/s per poison active","Stacks 5x; +26%; heal 10/s","Stacks 5x; +32%; heal 13/s","Stacks 6x; +40%; heal 16/s","Stacks 6x; +50%; heal 20/s; constricted foes take max poison stacks automatically"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"thorncoil"},
  {id:"thorncoil",name:"Thorncoil",emoji:"🐍",type:"Nature",rarity:"epic",description:"Verdantboa's scales have hardened into bark-like wood. What it wraps around becomes mulch, then forest.",
   stats:{hp:93,atk:134,def:68,spd:123,abilitySpeed:53},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root 0.5s+poison 5/s 2s","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; rooted foes +15% dmg taken"]},
     special:{name:"Constrict",upgrades:["Constrict; 75 dmg+DEF-20% 5s+poison 6/s 4s","90 dmg","108 dmg","130 dmg","Also silence 2s; constricted foes can't use abilities"]},
     unique:{name:"Thorned Scales",upgrades:["Passive: poison stacks 5x; rooted foes take +26% dmg; heal 9/s per poison active; attackers take 18 thorn dmg","Stacks 5x; +32%; heal 11/s; thorn 24","Stacks 6x; +40%; heal 14/s; thorn 32","Stacks 6x; +50%; heal 18/s; thorn 42","Stacks 7x; +62%; heal 23/s; thorn 54; constricted foes take max poison stacks automatically"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"verdantboa",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"rootlord"},  {id:"rootlord",name:"Rootlord",emoji:"🐉",type:"Nature",rarity:"epic",description:"Verdantboa become one with the ancient forest. It does not move — the forest moves with it.",
   stats:{hp:110,atk:158,def:80,spd:145,abilitySpeed:62},
   abilities:{
     basic:{name:"Vine Strike",upgrades:["18 dmg+root+poison","23 dmg","30 dmg","38 dmg","Root 1s+poison 8/s 3s; +15% dmg taken"]},
     special:{name:"Ancient Constrict",upgrades:["Constrict all nearby; 110 dmg+DEF-30% 6s+poison 10/s 5s","132 dmg","158 dmg","190 dmg","Constrict silences; strip all buffs; poison can't be cured"]},
     unique:{name:"Forest Sovereign",upgrades:["Passive: poison always at max stacks; rooted foes +35% dmg; +25 HP/s per entangled enemy","Rooted +44%; +30/s","Rooted +54%; +36/s","Rooted +66%; +44/s","Rooted +80%; +54/s; Rootlord revives once growing a full forest that roots all enemies 4s+deals 200 poison dmg"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"thorncoil",shardsToAscend:20,ascensionsToEvolve:null},
  // Nature line 2
  {id:"mossgolem",name:"Sporolith",emoji:"🧱",type:"Nature",rarity:"epic",description:"A golem built by the forest itself from centuries of accumulated moss. It is very slow and profoundly unkillable.",
   stats:{hp:115,atk:52,def:125,spd:22,abilitySpeed:32},
   abilities:{
     basic:{name:"Moss Slam",upgrades:["14 dmg; stagger 0.5s; heal 1 ally 18 HP","18 dmg","23 dmg","30 dmg","Stagger 1s; heal all allies 10 HP"]},
     special:{name:"Living Moss",upgrades:["Aura; all allies +20 HP/s 6s+DEF+40","Regen 28/s; DEF+55","Regen 36/s; DEF+72","Regen 46/s; DEF+90","Regen 58/s; DEF+110; also remove all debuffs from all allies"]},
     unique:{name:"Ancient Moss",upgrades:["Passive: all allies +18 HP/s; -20 dmg taken by allies; Mossgolem immune to CC","Allies +24/s; -28 dmg","Allies +30/s; -36 dmg; Mossgolem CC immune","Allies +38/s; -46 dmg","Allies +48/s; -58 dmg; Nature allies heal 15 HP per ability cast; Mossgolem revives once healing all 80 HP"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"stonewarden"},
  {id:"stonewarden",name:"Stonewarden",emoji:"🧱",type:"Nature",rarity:"epic",description:"Mossgolem's moss compressed into dense stone. It is slower now, and roughly five times harder to kill.",
   stats:{hp:157,atk:72,def:170,spd:30,abilitySpeed:43},
   abilities:{
     basic:{name:"Moss Slam",upgrades:["14 dmg; stagger 0.5s; heal 1 ally 18 HP","18 dmg","23 dmg","30 dmg","Stagger 1s; heal all allies 10 HP"]},
     special:{name:"Living Moss",upgrades:["Aura; all allies +20 HP/s 6s+DEF+40","Regen 28/s; DEF+55","Regen 36/s; DEF+72","Regen 46/s; DEF+90","Regen 58/s; DEF+110; also remove all debuffs from all allies"]},
     unique:{name:"Stone Warden",upgrades:["Passive: all allies +24 HP/s; -28 dmg taken by allies; Stonewarden CC immune; 12 thorns on hit","Allies +30/s; -36 dmg; thorns 18","Allies +38/s; -46 dmg; thorns 25","Allies +48/s; -58 dmg; thorns 34","Allies +60/s; -72 dmg; thorns 44; Nature allies heal 12 HP per ability cast; revives once healing all 100 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"mossgolem",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"jadegiant"},  {id:"jadegiant",name:"Jadolith",emoji:"🏔️",type:"Nature",rarity:"epic",description:"Mossgolem crystallized into living jade. An immovable monument that refuses to stop healing people.",
   stats:{hp:185,atk:85,def:200,spd:35,abilitySpeed:50},
   abilities:{
     basic:{name:"Jade Slam",upgrades:["18 dmg; stagger 1s; heal all allies 15 HP","23 dmg","30 dmg","38 dmg","Stagger 1.5s; heal all 25 HP; DEF-12% on target"]},
     special:{name:"Jade Bloom",upgrades:["All allies +35 HP/s 7s+DEF+70; cleanse all","Regen 46/s; DEF+92","Regen 58/s; DEF+116","Regen 72/s; DEF+142","Regen 90/s; DEF+175; revive 1 fallen ally 25% HP; grant all invincible 1s"]},
     unique:{name:"Jade Sovereign",upgrades:["Passive: all allies +32 HP/s; -35 all dmg to allies; thorns 40 dmg; absorb 25% ally dmg taken","Allies +42/s; -45; thorns 52; absorb 30%","Allies +54/s; -56; thorns 66; absorb 36%","Allies +68/s; -70; thorns 82; absorb 44%","Allies +85/s; -85; thorns 100; absorb 54%; Jadegiant revives twice each time healing all allies 150 HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"stonewarden",shardsToAscend:20,ascensionsToEvolve:null},
  // Nature line 3
  {id:"venomfiend",name:"Venomfiend",emoji:"🐸",type:"Nature",rarity:"epic",description:"A toad whose skin secretes a venom so potent it dissolved its own classification in the biology textbooks.",
   stats:{hp:65,atk:55,def:68,spd:78,abilitySpeed:82},
   abilities:{
     basic:{name:"Toxic Spit",upgrades:["14 dmg; poison 7/s 3s+slow 18%","18 dmg","23 dmg","30 dmg","Poison 10/s 4s+slow 25%; spreads to 1 nearby"]},
     special:{name:"Plague Cloud",upgrades:["Cloud; poison 8/s 5s; -25% ATK+SPD all in cloud","Poison 11/s","Poison 14/s","Poison 18/s","Poison 22/s 6s; silence 2s; can't gain buffs in cloud"]},
     unique:{name:"Plague Body",upgrades:["Passive: poison stacks 5x; each stack poisons an additional 5/s; ally Nature creatures immune to poison","Stacks 6x; +6/s per","Stacks 6x; +7/s; +15% heal for allied healers","Stacks 7x; +8/s; +20% heal","Stacks 7x; +10/s; +25% heal; poisoned enemies spread their poison on death in a radius"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"blighttoad"},
  {id:"blighttoad",name:"Blighttoad",emoji:"🐸",type:"Nature",rarity:"epic",description:"Venomfiend's venom has become semi-sentient. It selects its own targets now. Biologists have filed for early retirement.",
   stats:{hp:89,atk:75,def:92,spd:106,abilitySpeed:111},
   abilities:{
     basic:{name:"Toxic Spit",upgrades:["14 dmg; poison 7/s 3s+slow 18%","18 dmg","23 dmg","30 dmg","Poison 10/s 4s+slow 25%; spreads to 1 nearby"]},
     special:{name:"Plague Cloud",upgrades:["Cloud; poison 8/s 5s; -25% ATK+SPD all in cloud","Poison 11/s","Poison 14/s","Poison 18/s","Poison 22/s 6s; silence 2s; can't gain buffs in cloud"]},
     unique:{name:"Blight Body",upgrades:["Passive: poison stacks 6x; each stack +6/s; ally Nature immune to poison; poisoned enemies spread on death","Stacks 6x; +7/s","Stacks 7x; +8/s; +18% heal for allied healers","Stacks 7x; +10/s; +24% heal","Stacks 8x; +12/s; +30% heal; Blighttoad immune to poison; heals 8/s per poisoned enemy alive"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"venomfiend",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"plaguefiend"},  {id:"plaguefiend",name:"Plaguefiend",emoji:"🐸",type:"Nature",rarity:"epic",description:"Venomfiend's final form. Not a creature — a public health crisis with legs. Several legs.",
   stats:{hp:105,atk:88,def:108,spd:125,abilitySpeed:130},
   abilities:{
     basic:{name:"Plague Spit",upgrades:["20 dmg; poison 12/s 4s+slow 28%; spreads to 2 nearby","26 dmg","33 dmg","42 dmg","Spreads to 3 nearby; poison can't be cleansed"]},
     special:{name:"Pestilence Cloud",upgrades:["Massive cloud; max poison all in area; -35% all stats 6s","Stronger","Even stronger","Max","Silence 3s; all in cloud take +30% dmg; poison spreads on contact between enemies"]},
     unique:{name:"Plague Sovereign",upgrades:["Passive: poison stacks 8x; each stack +12/s; death spreads max poison in huge radius; ally Nature immune to poison+heal 20/s","Stacks 9x; +14/s; heal 26/s","Stacks 9x; +17/s; heal 32/s","Stacks 10x; +21/s; heal 40/s","Stacks 10x; +26/s; heal 50/s; Plaguefiend revives once; revival poisons all enemies at max stacks"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"blighttoad",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 1
  {id:"crystalcrab",name:"Crystalcrab",emoji:"🦀",type:"Earth",rarity:"epic",description:"A crab whose shell has grown into perfect gemstone crystal. It is the only creature that is also a geological landmark.",
   stats:{hp:108,atk:50,def:120,spd:30,abilitySpeed:38},
   abilities:{
     basic:{name:"Crystal Claw",upgrades:["14 dmg+DEF-10% 3s; thorns 15 on retaliation","18 dmg","23 dmg","30 dmg","DEF-14% 4s; thorns 22; heal self 12 HP"]},
     special:{name:"Prism Shell",upgrades:["DEF+100+thorns 25+reflect 15% dmg 6s","DEF+128","DEF+158; reflect 20%","DEF+192; reflect 25%","DEF+230; reflect 32%; allies nearby take -22% dmg; immune to CC 6s"]},
     unique:{name:"Gem Carapace",upgrades:["Passive: -25 all dmg; reflect 22% blocked; thorns 28 dmg; deflect 18% projectiles","Reduce 33; reflect 28%; thorns 36; deflect 22%","Reduce 42; reflect 34%; thorns 46; deflect 27%","Reduce 52; reflect 42%; thorns 58; deflect 32%","Reduce 64; reflect 52%; thorns 72; deflect 38%; CC immune; revives once dealing 200 crystal explosion"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"gemcrab"},
  {id:"gemcrab",name:"Gemcrab",emoji:"🦀",type:"Earth",rarity:"epic",description:"Crystalcrab's shell has grown into massive prismatic plates. Enemies go blind. Allies feel unreasonably safe.",
   stats:{hp:148,atk:69,def:163,spd:41,abilitySpeed:51},
   abilities:{
     basic:{name:"Crystal Claw",upgrades:["14 dmg+DEF-10% 3s; thorns 15 on retaliation","18 dmg","23 dmg","30 dmg","DEF-14% 4s; thorns 22; heal self 12 HP"]},
     special:{name:"Prism Shell",upgrades:["DEF+100+thorns 25+reflect 15% dmg 6s","DEF+128","DEF+158; reflect 20%","DEF+192; reflect 25%","DEF+230; reflect 32%; allies nearby take -22% dmg; immune to CC 6s"]},
     unique:{name:"Prism Carapace",upgrades:["Passive: -32 all dmg; reflect 30% blocked; thorns 40 dmg; deflect 24% projectiles; blind attackers 15% 1s","Reduce 40; reflect 38%; thorns 52; deflect 28%; blind 20%","Reduce 50; reflect 46%; thorns 66; deflect 32%; blind 26%","Reduce 62; reflect 56%; thorns 82; deflect 38%; blind 33%","Reduce 76; reflect 68%; thorns 100; deflect 45%; blind 42%; revives once dealing 160 crystal explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"crystalcrab",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"gemtitan"},
  {id:"gemtitan",name:"Gemtitan",emoji:"🦀",type:"Earth",rarity:"epic",description:"Crystalcrab's titan form. It is now its own mountain range and is frankly unreasonable about taking damage.",
   stats:{hp:175,atk:82,def:192,spd:48,abilitySpeed:60},
   abilities:{
     basic:{name:"Titan Claw",upgrades:["20 dmg+DEF-14% 4s; thorns 28","26 dmg","33 dmg","42 dmg","DEF-20% 5s; thorns 42; stagger 0.5s; heal self 20 HP"]},
     special:{name:"Titan Shell",upgrades:["DEF+160+thorns 40+reflect 28% 7s; allies invincible 1s","DEF+200; allies 1.5s","DEF+245; reflect 35%; invincible 2s","DEF+295; reflect 43%; invincible 2.5s","DEF+350; reflect 52%; invincible 3s; reflect also stuns attacker 0.5s"]},
     unique:{name:"Gem Sovereign",upgrades:["Passive: -40 all dmg; reflect 50% blocked; thorns 60; deflect 40% projectiles; CC immune","Reduce 50; reflect 60%; thorns 76; deflect 48%","Reduce 62; reflect 72%; thorns 94; deflect 56%","Reduce 76; reflect 86%; thorns 115; deflect 65%","Reduce 92; reflect 100% blocked; thorns 140; deflect 75%; Gemtitan revives twice; each revival 200 crystal explosion"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"gemcrab",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 2
  {id:"terradrake",name:"Terrauana",emoji:"🦎",type:"Earth",rarity:"epic",description:"A rock-armored drake that was literally born from a landslide. It considers earthquakes 'light stretching.'",
   stats:{hp:72,atk:105,def:58,spd:72,abilitySpeed:40},
   abilities:{
     basic:{name:"Terra Bite",upgrades:["18 dmg+DEF-8% 3s+stagger 0.5s","23 dmg","30 dmg","38 dmg","DEF-12% 4s+stagger 1s; shockwave nearby 30 dmg"]},
     special:{name:"Seismic Slam",upgrades:["85 dmg; quake 3s 20/s","102 dmg","123 dmg","148 dmg","Quake 5s 28/s; pillars hit all; fissures trap 2s"]},
     unique:{name:"Stone Drake",upgrades:["Passive: -18 all dmg; immune to knockback+stun; shockwave aura 20 dmg each move","Reduce 26; shockwave 28","Reduce 34; shockwave 38","Reduce 44; shockwave 50","Reduce 56; shockwave 65; CC immune; at 200 shockwave dmg dealt trigger free Continental Slam"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"rockjaw"},
  {id:"rockjaw",name:"Rockjaw",emoji:"🦎",type:"Earth",rarity:"epic",description:"Terradrake's scales crystallized into jagged quartz. It doesn't bite so much as it excavates targets.",
   stats:{hp:98,atk:144,def:78,spd:98,abilitySpeed:53},
   abilities:{
     basic:{name:"Terra Bite",upgrades:["18 dmg+DEF-8% 3s+stagger 0.5s","23 dmg","30 dmg","38 dmg","DEF-12% 4s+stagger 1s; shockwave nearby 30 dmg"]},
     special:{name:"Seismic Slam",upgrades:["85 dmg; quake 3s 20/s","102 dmg","123 dmg","148 dmg","Quake 5s 28/s; pillars hit all; fissures trap 2s"]},
     unique:{name:"Rock Drake",upgrades:["Passive: -24 all dmg; CC immune; shockwave aura 28 dmg each move; each bite reduces DEF 6%","Reduce 32; shockwave 38; DEF -8%","Reduce 42; shockwave 50; DEF -10%","Reduce 54; shockwave 64; DEF -12%","Reduce 68; shockwave 80; DEF -15%; at 150 shockwave dmg dealt trigger free Continental Slam"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"terradrake",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"quartzdrake"},  {id:"quartzdrake",name:"Quartzlisk",emoji:"🐉",type:"Earth",rarity:"epic",description:"Terradrake's final form. A quartz dragon whose footsteps register as magnitude 7 events.",
   stats:{hp:115,atk:170,def:92,spd:115,abilitySpeed:62},
   abilities:{
     basic:{name:"Quartz Bite",upgrades:["26 dmg+DEF-15% 4s+stagger 1s; shockwave all nearby 40 dmg","32 dmg","40 dmg","50 dmg","DEF-22% 5s+stagger 1.5s; shockwave crits; strip 1 buff"]},
     special:{name:"Quake Breath",upgrades:["130 dmg cone; quake 4s 30/s; fissures all","156 dmg","188 dmg","226 dmg","Quake 6s 42/s; 6 fissures each 40/s; stunned 2s on entering"]},
     unique:{name:"Quartz Sovereign",upgrades:["Passive: -30 all dmg; CC immune; shockwave aura 40 dmg each move; attacks DEF-15% per hit (no cap)","Reduce 40; shockwave 52; DEF-20%","Reduce 50; shockwave 66; DEF-26%","Reduce 62; shockwave 82; DEF-32%","Reduce 76; shockwave 100; DEF-40%; Quartzdrake revives once; revival causes magnitude 10 quake dealing 300 dmg all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"rockjaw",shardsToAscend:20,ascensionsToEvolve:null},
  // Earth line 3
  {id:"seismichog",name:"Seismichog",emoji:"🦔",type:"Earth",rarity:"epic",description:"A hedgehog whose quills have become tectonic plates. Hugging it is not recommended by anyone.",
   stats:{hp:98,atk:55,def:115,spd:38,abilitySpeed:40},
   abilities:{
     basic:{name:"Quill Spike",upgrades:["14 dmg+thorn 20 return; DEF-8%","18 dmg","23 dmg","30 dmg","Thorn 30 return; DEF-12%; stagger 0.5s"]},
     special:{name:"Quill Curl",upgrades:["Retract; -55% dmg 3s+thorns 35/s; emerge 70 dmg","Reduce 65%","Reduce 75%","Reduce 85%","Reduce 85%; immune 2s; emerge 120 dmg+stun 1s+knock all back"]},
     unique:{name:"Tectonic Plates",upgrades:["Passive: each attacker takes 25 thorn+stagger 0.5s; -22 all dmg","Thorn 35+stagger 0.5s; -30 dmg","Thorn 46+stagger; -38 dmg","Thorn 60+stagger; -48 dmg","Thorn 76+stagger 1s; -60 dmg; CC immune; at 10 thorn triggers release quill explosion 180 dmg all"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"quakequill"},
  {id:"quakequill",name:"Quakequill",emoji:"🦔",type:"Earth",rarity:"epic",description:"Seismichog's quills have grown dense as bedrock. Touching one causes a localized earthquake. Locals have adapted.",
   stats:{hp:134,atk:76,def:157,spd:51,abilitySpeed:53},
   abilities:{
     basic:{name:"Quill Spike",upgrades:["14 dmg+thorn 20 return; DEF-8%","18 dmg","23 dmg","30 dmg","Thorn 30 return; DEF-12%; stagger 0.5s"]},
     special:{name:"Quill Curl",upgrades:["Retract; -55% dmg 3s+thorns 35/s; emerge 70 dmg","Reduce 65%","Reduce 75%","Reduce 85%","Reduce 85%; immune 2s; emerge 120 dmg+stun 1s+knock all back"]},
     unique:{name:"Quake Plates",upgrades:["Passive: each attacker takes 38 thorn+stagger 0.5s; -30 all dmg; quill explosion every 8 triggers at 160 dmg","Thorn 50; -40 dmg; 185 dmg","Thorn 65; -52 dmg; 215 dmg","Thorn 82; -64 dmg; 248 dmg","Thorn 102; -78 dmg; 285 dmg; CC immune; stagger duration doubles; explosion also stuns 1.5s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"seismichog",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"tectohog"},  {id:"tectohog",name:"Tectohog",emoji:"🦔",type:"Earth",rarity:"epic",description:"Seismichog's final form. A tectonic titan hedgehog. Geologists agree it should not exist. It does anyway.",
   stats:{hp:158,atk:90,def:185,spd:60,abilitySpeed:62},
   abilities:{
     basic:{name:"Tectonic Spike",upgrades:["22 dmg+thorn 40 return; DEF-14%+stagger 1s","28 dmg","36 dmg","46 dmg","Thorn 58 return; DEF-20%; stagger 1.5s; strip 1 buff"]},
     special:{name:"Plate Armor",upgrades:["Retract; immune 2.5s+thorns 55/s; emerge 150 dmg+stun 1.5s+knock all","Immune 3s; emerge 180","Immune 3.5s; emerge 215","Immune 4s; emerge 258","Immune 4.5s; emerge 310+stun 2s+strip all buffs; heal all allies 80 HP"]},
     unique:{name:"Tectonic Sovereign",upgrades:["Passive: thorns 60+stagger 1s; -38 all dmg; CC immune; quill explosion every 10 triggers at 200 dmg","Thorns 76; -48 dmg; 230 dmg explosion","Thorns 95; -60 dmg; 265 dmg explosion","Thorns 118; -74 dmg; 305 dmg explosion","Thorns 145; -90 dmg; 350 dmg explosion; revives once; revival a perfect quill explosion 400 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quakequill",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 1
  {id:"galeserpent",name:"Galestrip",emoji:"🐍",type:"Wind",rarity:"epic",description:"A wind serpent that exists as a permanent tornado in snake form. Local weather forecasters have given up.",
   stats:{hp:52,atk:110,def:35,spd:118,abilitySpeed:32},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["20 dmg+push+slow 22% 2s","26 dmg","33 dmg","42 dmg","Push+slow 32% 3s; leave wind vortex 2s"]},
     special:{name:"Cyclone Body",upgrades:["Spin; 65 dmg all nearby+pull+slow 40% 3s","78 dmg","95 dmg","114 dmg","Pull+slow 55% 4s+silence 2s; tornado lingers 3s"]},
     unique:{name:"Tornado Form",upgrades:["Passive: immune to ground; +25% dodge; wind dmg +22%; SPD scales damage: +1% per 5 SPD","Dodge 30%; +28%; +1%/4 SPD","Dodge 36%; +35%; +1%/3 SPD","Dodge 42%; +44%; +1%/2 SPD","Dodge 50%; +55%; +2%/2 SPD; at max SPD become invincible for 3s every 10s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"vortexserpent"},
  {id:"vortexserpent",name:"Vortexserpent",emoji:"🐍",type:"Wind",rarity:"epic",description:"Galeserpent so fast it has become indistinguishable from wind. Meteorologists list it as a recurring weather event.",
   stats:{hp:71,atk:151,def:48,spd:161,abilitySpeed:43},
   abilities:{
     basic:{name:"Gale Fang",upgrades:["20 dmg+push+slow 22% 2s","26 dmg","33 dmg","42 dmg","Push+slow 32% 3s; leave wind vortex 2s"]},
     special:{name:"Cyclone Body",upgrades:["Spin; 65 dmg all nearby+pull+slow 40% 3s","78 dmg","95 dmg","114 dmg","Pull+slow 55% 4s+silence 2s; tornado lingers 3s"]},
     unique:{name:"Vortex Form",upgrades:["Passive: immune to ground; +32% dodge; wind dmg +30%; SPD scales dmg +1%/4 SPD; vortex trails on move slow 30%","Dodge 38%; +38%; +1%/3","Dodge 44%; +46%; +1%/2","Dodge 52%; +56%; +2%/2; immune to CC while airborne","Dodge 60%; +68%; +2%/SPD; CC immune; become untargetable 1.5s every 8s; Vortexserpent can't be slowed or stopped"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"galeserpent",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"cyclonwyrm"},  {id:"cyclonwyrm",name:"Zephyrpent",emoji:"🐉",type:"Wind",rarity:"epic",description:"Galeserpent's draconic final form. A cyclone dragon. Meteorologists have it listed as a recurring annual event.",
   stats:{hp:84,atk:178,def:56,spd:190,abilitySpeed:50},
   abilities:{
     basic:{name:"Cyclone Fang",upgrades:["30 dmg+push+slow 36% 3s; vortex 2s","38 dmg","48 dmg","60 dmg","Slow 48%; vortex 3s+sucks enemies in; strip 1 buff"]},
     special:{name:"Dragon Cyclone",upgrades:["100 dmg all+pull all+slow 60% 5s+silence 2s","120 dmg","145 dmg","175 dmg","Slow 75%; silence 3s; strip all buffs; tornado 5s 30/s traps all hit"]},
     unique:{name:"Cyclone Sovereign",upgrades:["Passive: immune to ground+wind; +40% dodge; +40% wind dmg; each dodge triggers free Gale Fang","Dodge 48%; +50% wind; free Gale Fang","Dodge 56%; +62%; also free special on dodge every 8s","Dodge 65%; +76%;","Dodge 75%; +92%; at max SPD become a living cyclone—untargetable 1s every 5s; Cyclonwyrm revives once as a tornado"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"vortexserpent",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 2
  {id:"stormsurger",name:"Tempesthawk",emoji:"🦅",type:"Wind",rarity:"epic",description:"A hawk that surfed a supercell storm into existence. It doesn't fly so much as it weaponizes the atmosphere.",
   stats:{hp:52,atk:115,def:32,spd:112,abilitySpeed:35},
   abilities:{
     basic:{name:"Storm Talon",upgrades:["22 dmg+knockback+slow 25% 2s","28 dmg","36 dmg","46 dmg","Knockback+slow 35%; vortex on land; stun 0.5s"]},
     special:{name:"Supercell Dive",upgrades:["Dive; 88 dmg+stun 1s; shockwave 60 dmg all nearby","106 dmg","128 dmg","154 dmg","Stun 1.5s; shockwave 90 dmg+knock all; leave storm zone 3s 20/s"]},
     unique:{name:"Storm Predator",upgrades:["Passive: +30% crit; crits on slowed foes +40% dmg; crits trigger free talon strike","Crit +38%; +52% dmg","Crit +46%; +66%; also free special on crit every 6s","Crit +56%; +82%;","Crit +68%; +100%; every 5 crits trigger a tornado 200 dmg AOE; Tempesthawk cannot be targeted while airborne between attacks"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"thundertalon"},
  {id:"thundertalon",name:"Thundertalon",emoji:"🦅",type:"Wind",rarity:"epic",description:"Tempesthawk so electrically charged it ionizes the air around it. Clouds follow it like groupies. It does not notice.",
   stats:{hp:71,atk:157,def:44,spd:153,abilitySpeed:47},
   abilities:{
     basic:{name:"Storm Talon",upgrades:["22 dmg+knockback+slow 25% 2s","28 dmg","36 dmg","46 dmg","Knockback+slow 35%; vortex on land; stun 0.5s"]},
     special:{name:"Supercell Dive",upgrades:["Dive; 88 dmg+stun 1s; shockwave 60 dmg all nearby","106 dmg","128 dmg","154 dmg","Stun 1.5s; shockwave 90 dmg+knock all; leave storm zone 3s 20/s"]},
     unique:{name:"Thunder Predator",upgrades:["Passive: +36% crit; crits on slowed foes +50% dmg; crits trigger 1 free talon strike+arc lightning 40 dmg","Crit +44%; +62%; arc 55 dmg","Crit +52%; +76%; arc 72 dmg; free special on crit every 7s","Crit +62%; +92%; arc 90 dmg","Crit +74%; +110%; arc 112 dmg; every 4 crits trigger tornado 160 dmg AOE; Thundertalon untargetable between attacks"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormsurger",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"stormphoenix"},  {id:"stormphoenix",name:"Tempestrel",emoji:"🕊️",type:"Wind",rarity:"epic",description:"Tempesthawk reborn in a thunderstorm. A bird of lightning and wind that dies and regrows from a bolt of lightning.",
   stats:{hp:84,atk:185,def:52,spd:180,abilitySpeed:55},
   abilities:{
     basic:{name:"Lightning Talon",upgrades:["32 dmg+knockback+slow 40% 3s; arc to 1 nearby 60%","40 dmg","50 dmg","64 dmg","Slow 55%; arc 2 nearby; strip 1 buff; stun 0.5s"]},
     special:{name:"Phoenix Cyclone",upgrades:["135 dmg+stun 1.5s; tornado 4s; shockwave all","162 dmg","195 dmg","234 dmg","Stun 2s; tornado 5s 40/s; pull all in; strip all buffs; Stormphoenix gains +40 SPD 4s"]},
     unique:{name:"Phoenix Storm",upgrades:["Passive: +45% crit; crits deal +55% dmg+arc 3 nearby; crits trigger 3 free talon strikes; revives once as thunderstorm dealing 250 dmg all","Crit +55%; +70%","Crit +65%; +88%","Crit +77%; +108%","Crit +90%; +130%; Stormphoenix revives twice; each revival stronger; final form: every attack is a guaranteed crit that arcs to all enemies"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"thundertalon",shardsToAscend:20,ascensionsToEvolve:null},
  // Wind line 3
  {id:"galelocust",name:"Galelocust",emoji:"🦗",type:"Wind",rarity:"epic",description:"A locust whose wing-beats generate gusts strong enough to strip paint. Farmers consider it a natural disaster.",
   stats:{hp:55,atk:110,def:35,spd:108,abilitySpeed:38},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["18 dmg+push; hit all in path","23 dmg","30 dmg","38 dmg","Push+slow 22% 2s; hit all in path; leave wind trail 1.5s"]},
     special:{name:"Swarm Rush",upgrades:["Multiply to 5; dash through all foes 20 dmg each","26 dmg each","33 dmg each","42 dmg each","7 swarm clones; each knock back; merge into 1 causing 80 dmg explosion"]},
     unique:{name:"Swarm Mind",upgrades:["Passive: basic attacks hit all nearby at 50% dmg; wind dmg +18%; SPD scales: +1%/5 SPD","50% nearby; +24%; +1%/4","60% nearby; +30%; +1%/3","70% nearby; +38%; +1%/3","80% nearby; +48%; +1%/2; Galelocust spawns 2 permanent phantom clones dealing 40% dmg"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"swarmrider"},
  {id:"swarmrider",name:"Swarmrider",emoji:"🦗",type:"Wind",rarity:"epic",description:"A larger, angrier locust. Each wingbeat punches through reinforced concrete. Farmers have moved to other planets.",
   stats:{hp:75,atk:151,def:48,spd:146,abilitySpeed:51},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["18 dmg+push; hit all in path","23 dmg","30 dmg","38 dmg","Push+slow 22% 2s; hit all in path; leave wind trail 1.5s"]},
     special:{name:"Swarm Rush",upgrades:["Multiply to 5; dash through all foes 20 dmg each","26 dmg each","33 dmg each","42 dmg each","7 swarm clones; each knock back; merge into 1 causing 80 dmg explosion"]},
     unique:{name:"Rider Swarm",upgrades:["Passive: basics hit all nearby at 60% dmg; wind +24%; SPD scales +1%/4 SPD; 2 phantom clones 50% dmg","60% nearby; +30%; 2 clones 62%","70% nearby; +38%; 2 clones 76%; clones also trigger knockback","80% nearby; +48%; 3 clones 76%","90% nearby; +60%; 3 clones 90%; clones trigger unique passive; on kill 2s all enemies silenced"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"galelocust",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"stormlocust"},  {id:"stormlocust",name:"Cyclocus",emoji:"🦗",type:"Wind",rarity:"epic",description:"Galelocust evolved into a storm incarnate. It is no longer one creature — it is a migration event.",
   stats:{hp:88,atk:178,def:56,spd:172,abilitySpeed:60},
   abilities:{
     basic:{name:"Wind Slash",upgrades:["28 dmg+push; hit all in path; slow 30%","36 dmg","46 dmg","58 dmg","Slow 44%; wind trail 2s; every 3rd hit is AOE explosion 80 dmg"]},
     special:{name:"Mega Swarm",upgrades:["12 swarm clones dash through all foes 30 dmg each","38 dmg","48 dmg","60 dmg","20 clones; merge explodes 160 dmg all+stun 1.5s+strip all buffs; clones also trigger unique passive"]},
     unique:{name:"Infinite Swarm",upgrades:["Passive: 3 phantom clones 40% dmg; all attacks hit all nearby at 70% dmg; wind +28%","Clones 4; 80% nearby; +36%","Clones 5; 90% nearby; +46%","Clones 6; 100% nearby; +58%","Clones 8; 120% nearby; +72%; on kill Stormlocust splits into 3 attacking separately for 5s then reforms"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"swarmrider",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 1
  {id:"voltdrake",name:"Voltimon",emoji:"🦎",type:"Electric",rarity:"epic",description:"A lizard that evolved inside a thundercloud. It does not understand why other creatures fear storms.",
   stats:{hp:65,atk:105,def:45,spd:90,abilitySpeed:42},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["20 dmg+arc to 2 foes 50%+paralyze 15% 1s","26 dmg","33 dmg","42 dmg","Arc 3 foes 65%; paralyze 22% 1.5s; stun 0.5s on paralyze"]},
     special:{name:"Volt Surge",upgrades:["85 dmg+stun 1s; chain to all nearby","102 dmg","123 dmg","148 dmg","Chain ignores DEF; stun 1.5s; each chained foe -25% SPD 4s"]},
     unique:{name:"Storm Scales",upgrades:["Passive: every hit arcs to 3 foes 55% dmg; electric +20%; arcs paralyze 15%","Arc 4 foes 65%; +26%; paralyze 20%","Arc 5 foes 75%; +32%; paralyze 26%","Arc 6 foes 88%; +40%; paralyze 33%","Arc 8 foes 100%; +50%; paralyze 42%; on paralyze release free arc chain; immune to paralysis+stun"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"stormscale"},
  {id:"stormscale",name:"Stormscale",emoji:"🦎",type:"Electric",rarity:"epic",description:"Voltdrake's lightning scales have arced together into living electricity. It bites and the arc does the rest.",
   stats:{hp:89,atk:144,def:61,spd:123,abilitySpeed:56},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["20 dmg+arc to 2 foes 50%+paralyze 15% 1s","26 dmg","33 dmg","42 dmg","Arc 3 foes 65%; paralyze 22% 1.5s; stun 0.5s on paralyze"]},
     special:{name:"Volt Surge",upgrades:["85 dmg+stun 1s; chain to all nearby","102 dmg","123 dmg","148 dmg","Chain ignores DEF; stun 1.5s; each chained foe -25% SPD 4s"]},
     unique:{name:"Storm Scales",upgrades:["Passive: every hit arcs to 4 foes 64% dmg; electric +26%; arcs paralyze 18%; paralyzed foes take +25% dmg","Arc 5 foes 74%; +32%; paralyze 24%","Arc 6 foes 84%; +40%; paralyze 30%","Arc 7 foes 94%; +50%; paralyze 38%","Arc 9 foes 106%; +62%; paralyze 48%; on paralyze release free arc chain; immune to paralysis+stun"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltdrake",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"thunderdrake"},  {id:"thunderdrake",name:"Thunderlisk",emoji:"🐉",type:"Electric",rarity:"epic",description:"Voltdrake's thunderous final form. Weather services list it under 'severe electrical phenomena' rather than 'wildlife.'",
   stats:{hp:105,atk:170,def:72,spd:145,abilitySpeed:65},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["30 dmg+arc all nearby 70%+paralyze 25% 1.5s","38 dmg","48 dmg","60 dmg","Arc all; paralyze 35% 2s; stun 1s on paralyze; strip 1 buff"]},
     special:{name:"Dragon Thunder",upgrades:["130 dmg+stun 1.5s; chain ignores DEF; -35% SPD all hit","156 dmg","188 dmg","226 dmg","Stun 2s; -50% SPD; chain to all on screen; all hit lose 1 buff"]},
     unique:{name:"Dragon Lightning",upgrades:["Passive: every hit arcs to all enemies 80% dmg; paralyzed foes take +40% dmg; electric +38%","Arc 90%; +48%","Arc 100%; +60%","Arc 112%; +74%","Arc 125%; +90%; Thunderdrake revives once as a lightning storm hitting all enemies 10x for 80 dmg each"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"stormscale",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 2
  {id:"boltfly",name:"Boltfly",emoji:"🦟",type:"Electric",rarity:"epic",description:"A mosquito-sized bolt of lightning that has decided it wants to be a mosquito. Fast, annoying, and 100,000 volts.",
   stats:{hp:52,atk:110,def:32,spd:112,abilitySpeed:40},
   abilities:{
     basic:{name:"Shock Pierce",upgrades:["18 dmg; ignore 20% DEF+paralyze 18% 1s","23 dmg","30 dmg","38 dmg","Ignore 28% DEF; paralyze 26% 1.5s; arc to 2 nearby"]},
     special:{name:"Volt Dash",upgrades:["Teleport to foe; 72 dmg+stun 1s+paralyze 2s","87 dmg","105 dmg","126 dmg","Stun 1.5s; paralyze 2.5s; shockwave 50 dmg on arrival to all nearby"]},
     unique:{name:"Living Lightning",upgrades:["Passive: 28% dodge; each dodge teleport behind attacker; counter 40 dmg+paralyze 1s","32% dodge; counter 52","36% dodge; counter 66+paralyze 1.5s","42% dodge; counter 84","48% dodge; counter 106+stun 0.5s; immune to paralysis; at 5 dodges release full-screen lightning 120 dmg all"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"arcbolt"},
  {id:"arcbolt",name:"Arcbolt",emoji:"🦟",type:"Electric",rarity:"epic",description:"Boltfly condensed into a faster, angrier bolt of itself. 500,000 volts and proud of it. Power grids file complaints.",
   stats:{hp:71,atk:151,def:44,spd:153,abilitySpeed:54},
   abilities:{
     basic:{name:"Shock Pierce",upgrades:["18 dmg; ignore 20% DEF+paralyze 18% 1s","23 dmg","30 dmg","38 dmg","Ignore 28% DEF; paralyze 26% 1.5s; arc to 2 nearby"]},
     special:{name:"Volt Dash",upgrades:["Teleport to foe; 72 dmg+stun 1s+paralyze 2s","87 dmg","105 dmg","126 dmg","Stun 1.5s; paralyze 2.5s; shockwave 50 dmg on arrival to all nearby"]},
     unique:{name:"Arc Current",upgrades:["Passive: 34% dodge; each dodge teleport behind attacker; counter 55 dmg+paralyze 1.5s; immune to paralysis","38% dodge; counter 72+paralyze 2s","44% dodge; counter 92","50% dodge; counter 116+stun 0.5s","56% dodge; counter 144+stun 0.5s; at 4 dodges release full-screen arc chain hitting all for 90 dmg+paralyze 2s"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"boltfly",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"zapdragon"},  {id:"zapdragon",name:"Voltray",emoji:"🐲",type:"Electric",rarity:"epic",description:"Boltfly evolved into a dragon of pure electrical current. Power grids within 10 miles behave erratically.",
   stats:{hp:84,atk:178,def:52,spd:180,abilitySpeed:64},
   abilities:{
     basic:{name:"Arc Pierce",upgrades:["28 dmg; ignore 30% DEF; paralyze 30% 2s; arc all nearby 70%","36 dmg","46 dmg","58 dmg","Ignore 40%; paralyze 40% 2.5s; arc all 90%; stun on paralyze"]},
     special:{name:"Dragon Volt",upgrades:["Teleport to foe; 110 dmg+stun 1.5s+paralyze all nearby 2.5s; shockwave 80 dmg all","132 dmg","158 dmg","190 dmg","Stun 2s; paralyze 3s; shockwave stuns all nearby 1s; strip all buffs"]},
     unique:{name:"Dragon Current",upgrades:["Passive: 42% dodge; each dodge teleport+counter 80 dmg+paralyze 2s; immune to paralysis; arc 100% all on every hit","Dodge 50%; counter 100","Dodge 58%; counter 125","Dodge 67%; counter 155","Dodge 76%; counter 190; Zapdragon revives once as a ball lightning that bounces between all enemies 10x for 100 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"arcbolt",shardsToAscend:20,ascensionsToEvolve:null},
  // Electric line 3
  {id:"shockcrab",name:"Shockcrab",emoji:"🦀",type:"Electric",rarity:"epic",description:"A crab that stores charge in its shell like a living capacitor. Marine electricians keep their distance.",
   stats:{hp:105,atk:55,def:115,spd:32,abilitySpeed:38},
   abilities:{
     basic:{name:"Volt Pinch",upgrades:["14 dmg+shock 12/s 2s+paralyze 15% 0.5s","18 dmg","23 dmg","30 dmg","Shock 18/s 3s; paralyze 22% 1s; stun on paralyze 0.5s"]},
     special:{name:"Capacitor Shell",upgrades:["Store 5 charges; each charge +12 dmg to next attack+8 HP regen/s","6 charges; +15 dmg; 11/s","7 charges; +19 dmg; 14/s","8 charges; +24 dmg; 18/s","10 charges; +30 dmg; 22/s; release triggers paralyze all nearby 1.5s+60 burst dmg"]},
     unique:{name:"Super Capacitor",upgrades:["Passive: charges max 10; each charge +15 regen; release burst 100 dmg+paralyze all 1.5s; gain 1 charge/4s passively","Burst 125; charge/3s","Burst 155; charge/3s","Burst 190; charge/2s","Burst 230; charge/2s; burst paralyzes 2s; Shockcrab immune to all electric dmg; revives once at full charge"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"voltcrusher"},
  {id:"voltcrusher",name:"Voltcrusher",emoji:"🦀",type:"Electric",rarity:"epic",description:"Shockcrab's charges have built to dangerous levels. Every inch of shell is a live wire. The navy has sent a letter.",
   stats:{hp:144,atk:76,def:157,spd:43,abilitySpeed:50},
   abilities:{
     basic:{name:"Volt Pinch",upgrades:["14 dmg+shock 12/s 2s+paralyze 15% 0.5s","18 dmg","23 dmg","30 dmg","Shock 18/s 3s; paralyze 22% 1s; stun on paralyze 0.5s"]},
     special:{name:"Capacitor Shell",upgrades:["Store 5 charges; each +12 dmg to next attack+8 HP regen/s","6 charges; +15; 11/s","7 charges; +19; 14/s","8 charges; +24; 18/s","10 charges; +30; 22/s; release paralyzes all nearby 1.5s+70 burst dmg"]},
     unique:{name:"Volt Capacitor",upgrades:["Passive: charges max 12; each charge +18 regen; release burst 160 dmg+paralyze all 2s; gain 1 charge/3s","Burst 195; paralyze 2.5s","Burst 235; paralyze 2.5s","Burst 280; paralyze 3s","Burst 330; paralyze 3s; Voltcrusher immune to all electric dmg; burst stuns 1s; revives once at half charge"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"shockcrab",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"galvaniccrab"},  {id:"galvaniccrab",name:"Galvaniccrab",emoji:"🦀",type:"Electric",rarity:"epic",description:"Shockcrab's final form. A superconducting fortress crab that generates its own power grid. The navy has questions.",
   stats:{hp:170,atk:90,def:185,spd:50,abilitySpeed:58},
   abilities:{
     basic:{name:"Arc Pinch",upgrades:["22 dmg+shock 20/s 3s; paralyze 28% 1.5s+arc 2 nearby","28 dmg","36 dmg","46 dmg","Paralyze 38% 2s+stun 0.5s; arc all nearby; strip 1 buff"]},
     special:{name:"Supercapacitor",upgrades:["12 charges max; release: 180 dmg burst+paralyze all 2s+EMP 3s","Release 220 dmg","Release 265 dmg","Release 315 dmg","Release 375 dmg+paralyze 3s+EMP 4s; release auto-charges 12 new charges; allies gain 25 HP/s 5s"]},
     unique:{name:"Galvanic Core",upgrades:["Passive: charges max 14; release 280 dmg+paralyze 2.5s; regen 20/s at max charge; electric aura paralyzes 20% each action","-; paralyze 28%","-; paralyze 36%","-; paralyze 46%","Paralyze 58%; Galvaniccrab immune to all dmg while releasing charges; revives twice each time EMP stunning all enemies 4s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"voltcrusher",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 1
  {id:"solardrake",name:"Solardrake",emoji:"🦎",type:"Light",rarity:"epic",description:"A drake that basks directly in the sun's core and considers it 'mild.' Its scales emit light that heals.",
   stats:{hp:68,atk:102,def:50,spd:88,abilitySpeed:38},
   abilities:{
     basic:{name:"Solar Beam",upgrades:["20 dmg+blind 20% 1.5s; heal 1 ally 14 HP","26 dmg","33 dmg","42 dmg","Blind 28% 2s; heal all allies 8 HP; arc 1 nearby"]},
     special:{name:"Solar Flare",upgrades:["88 dmg; blind all 2.5s; heal all allies 40 HP","106 dmg","128 dmg","154 dmg","Blind 3.5s; heal 65 HP; grant all allies +18% ATK+DEF 4s"]},
     unique:{name:"Solar Scales",upgrades:["Passive: light dmg +22%; all heals +18%; each attack also heals 1 ally 12 HP","Light +28%; heals +24%; ally 16 HP","Light +36%; heals +30%; ally 22 HP","Light +46%; heals +38%; ally 30 HP","Light +58%; heals +48%; ally 40 HP; Solardrake immune to blind; crits heal all allies 25 HP"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"lumadrak"},
  {id:"lumadrak",name:"Lumadrak",emoji:"🦎",type:"Light",rarity:"epic",description:"Solardrake whose scales now emit constant healing light. Enemy medics have lodged formal protests with the council.",
   stats:{hp:93,atk:140,def:68,spd:119,abilitySpeed:51},
   abilities:{
     basic:{name:"Solar Beam",upgrades:["20 dmg+blind 20% 1.5s; heal 1 ally 14 HP","26 dmg","33 dmg","42 dmg","Blind 28% 2s; heal all allies 8 HP; arc 1 nearby"]},
     special:{name:"Solar Flare",upgrades:["88 dmg; blind all 2.5s; heal all allies 40 HP","106 dmg","128 dmg","154 dmg","Blind 3.5s; heal 65 HP; grant all allies +18% ATK+DEF 4s"]},
     unique:{name:"Luma Scales",upgrades:["Passive: light dmg +30%; all heals +26%; each attack heals 1 ally 18 HP; blind attackers 20% 1s","Light +38%; heals +32%; ally 24 HP; blind 26%","Light +48%; heals +40%; ally 32 HP; blind 32%","Light +60%; heals +50%; ally 42 HP; blind 40%","Light +74%; heals +62%; ally 54 HP; blind 50%; Lumadrak immune to blind; crits heal all allies 20 HP"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"solardrake",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"celestidrake"},  {id:"celestidrake",name:"Lumiskink",emoji:"🐉",type:"Light",rarity:"epic",description:"Solardrake ascended into a dragon of pure starlight. It is simultaneously the strongest healer and the most terrifying attacker.",
   stats:{hp:110,atk:165,def:80,spd:140,abilitySpeed:60},
   abilities:{
     basic:{name:"Celestial Beam",upgrades:["32 dmg+blind 28% 2.5s; heal all allies 15 HP; arc 2 nearby","40 dmg","50 dmg","64 dmg","Blind 38% 3s; heal all 25 HP; arc all; strip 1 buff from each"]},
     special:{name:"Celestial Nova",upgrades:["135 dmg; blind all 3.5s; heal all 70 HP+invincible 1.5s","162 dmg","195 dmg","234 dmg","Blind 5s; heal 110 HP; invincible 2s; remove all debuffs; revive 1 fallen ally 35% HP"]},
     unique:{name:"Celestial Sovereign",upgrades:["Passive: light +40%; all heals +36%; crits heal all 40 HP; Celestidrake immune to all dmg while healing","Light +50%; heals +44%; crit heals 52 HP","Light +62%; heals +54%; crit heals 66 HP","Light +76%; heals +66%; crit heals 84 HP","Light +92%; heals +80%; crit heals 105 HP; Celestidrake revives twice each time as a supernova healing all allies 200 HP+dealing 200 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"lumadrak",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 2
  {id:"sacredwasp",name:"Vespura",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp whose stinger delivers blessing instead of venom. Theology departments find it very confusing.",
   stats:{hp:58,atk:42,def:65,spd:90,abilitySpeed:92},
   abilities:{
     basic:{name:"Blessed Sting",upgrades:["10 dmg+blind 18% 1s; heal 1 ally 18 HP","13 dmg","16 dmg","21 dmg","Blind 26% 1.5s; heal all allies 10 HP; cleanse 1 debuff from healed"]},
     special:{name:"Sacred Aura",upgrades:["All allies +22% ATK+DEF+Ability Speed 5s; remove all debuffs","Aura +28%","Aura +34%","Aura +42%","Aura +52%; grant immunity to all debuffs 6s; regen 18/s 5s all allies"]},
     unique:{name:"Sacred Wings",upgrades:["Passive: all Ability Speed +32%; each ability heals all allies 14 HP; abilities cleanse 1 debuff from all","Ability Speed +40%; heals 18 HP","Ability Speed +50%; heals 24 HP","Ability Speed +62%; heals 32 HP","Ability Speed +76%; heals 42 HP; 20% chance ability is free; Sacredwasp immune to dmg while casting"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"divinedrone"},
  {id:"divinedrone",name:"Divinedrone",emoji:"🐝",type:"Light",rarity:"epic",description:"A wasp so sacred the concept of harm has agreed to avoid it. It stings with pure blessings. Theologians are keeping notes.",
   stats:{hp:80,atk:58,def:89,spd:123,abilitySpeed:126},
   abilities:{
     basic:{name:"Blessed Sting",upgrades:["10 dmg+blind 18% 1s; heal 1 ally 18 HP","13 dmg","16 dmg","21 dmg","Blind 26% 1.5s; heal all allies 10 HP; cleanse 1 debuff from healed"]},
     special:{name:"Sacred Aura",upgrades:["All allies +22% ATK+DEF+Ability Speed 5s; remove all debuffs","Aura +28%","Aura +34%","Aura +42%","Aura +52%; grant immunity to all debuffs 6s; regen 18/s 5s all allies"]},
     unique:{name:"Divine Wings",upgrades:["Passive: all Ability Speed +40%; each ability heals all allies 20 HP+cleanse 1 debuff; 18% chance free ability","Ability Speed +50%; heal 26 HP; 22% free","Ability Speed +62%; heal 34 HP; 28% free","Ability Speed +76%; heal 44 HP; 35% free","Ability Speed +92%; heal 56 HP; 44% free; Divinedrone immune to dmg while any ally is at full HP; buffs last 2s longer"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"sacredwasp",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"holyswarm"},  {id:"holyswarm",name:"Holyswarm",emoji:"🐝",type:"Light",rarity:"epic",description:"Sacredwasp became a divine swarm that is simultaneously everywhere and everywhere healing. Theologians have updated their texts.",
   stats:{hp:95,atk:68,def:105,spd:145,abilitySpeed:148},
   abilities:{
     basic:{name:"Divine Sting",upgrades:["14 dmg+blind 26% 2s; heal all allies 18 HP; cleanse 1 debuff all","18 dmg","23 dmg","30 dmg","Blind 36% 2.5s; heal all 28 HP; cleanse all debuffs from all allies"]},
     special:{name:"Divine Aura",upgrades:["All allies +35% ATK+DEF+Ability Speed; remove all debuffs; grant immune all debuffs 6s; regen 22/s","Aura +44%","Aura +55%","Aura +68%","Aura +84%; regen 32/s; grant invincible 1.5s; revive 1 fallen ally 32% HP"]},
     unique:{name:"Divine Resonance",upgrades:["Passive: Ability Speed +55% all allies; each ability heals all 28 HP+cleanse 1 debuff; 25% chance free ability","Ability Speed +66%; heal 36 HP; 30% free","Ability Speed +80%; heal 46 HP; 36% free","Ability Speed +96%; heal 58 HP; 44% free","Ability Speed +115%; heal 72 HP; 54% free; Holyswarm immune to all dmg while any ally is alive; revives 3 times"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"divinedrone",shardsToAscend:20,ascensionsToEvolve:null},
  // Light line 3
  {id:"lumigator",name:"Lumigator",emoji:"🦎",type:"Light",rarity:"epic",description:"A massive albino alligator that glows from within. It was protecting a sacred pool of light. Now it protects everything.",
   stats:{hp:95,atk:50,def:108,spd:45,abilitySpeed:50},
   abilities:{
     basic:{name:"Light Bite",upgrades:["14 dmg; blind 15% 1s; heal self+1 ally 16 HP","18 dmg","23 dmg","30 dmg","Blind 22% 1.5s; heal all allies 10 HP; DEF-10% on target"]},
     special:{name:"Sacred Shell",upgrades:["DEF+80+regen 15/s+blind aura 20% 5s; allies -18% dmg taken","DEF+102","DEF+128; aura 26%","DEF+158","DEF+192; aura 32%; allies -28% dmg; immune to blind"]},
     unique:{name:"Living Light",upgrades:["Passive: -20 all dmg; all allies regen 12/s; blind aura 18% nearby foes; Lumigator immune to blind","Reduce 28; regen 16/s; aura 24%","Reduce 36; regen 20/s; aura 30%","Reduce 46; regen 26/s; aura 38%","Reduce 58; regen 34/s; aura 48%; absorb 20% of ally dmg taken; revives once healing all allies 120 HP"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"gleamgator"},
  {id:"gleamgator",name:"Gleamgator",emoji:"🦎",type:"Light",rarity:"epic",description:"Lumigator's glow has intensified. Nearby enemies go blind. Nearby allies feel inexplicably at peace with everything.",
   stats:{hp:131,atk:69,def:148,spd:61,abilitySpeed:67},
   abilities:{
     basic:{name:"Light Bite",upgrades:["14 dmg; blind 15% 1s; heal self+1 ally 16 HP","18 dmg","23 dmg","30 dmg","Blind 22% 1.5s; heal all allies 10 HP; DEF-10% on target"]},
     special:{name:"Sacred Shell",upgrades:["DEF+80+regen 15/s+blind aura 20% 5s; allies -18% dmg taken","DEF+102","DEF+128; aura 26%","DEF+158","DEF+192; aura 32%; allies -28% dmg; immune to blind"]},
     unique:{name:"Gleam Hide",upgrades:["Passive: -26 all dmg; allies regen 16/s; blind aura 24% nearby foes; Gleamgator immune to blind","Reduce 34; regen 20/s; aura 30%","Reduce 44; regen 26/s; aura 38%","Reduce 56; regen 34/s; aura 48%","Reduce 70; regen 44/s; aura 60%; absorb 15% of ally dmg taken; revives once healing all allies 100 HP+blinding all enemies 4s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"lumigator",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"radiantgator"},  {id:"radiantgator",name:"Lumicator",emoji:"🦎",type:"Light",rarity:"epic",description:"Lumigator's transcendent final form. An alligator of living sunlight that makes enemies blind and allies immortal.",
   stats:{hp:155,atk:82,def:175,spd:72,abilitySpeed:78},
   abilities:{
     basic:{name:"Radiant Bite",upgrades:["22 dmg; blind 28% 2s; heal all allies 18 HP; DEF-14% on target; cleanse 1 ally","28 dmg","36 dmg","46 dmg","Blind 40% 2.5s; heal all 28 HP; cleanse all allies 1 debuff; strip 1 buff target"]},
     special:{name:"Radiant Fortress",upgrades:["DEF+130+regen 28/s+blind aura 32% 7s; allies -28% dmg; immune to blind+slow","DEF+165","DEF+204","DEF+248","DEF+300; aura 44%; allies -40% dmg; immune to all debuffs 5s; allies regen 40/s"]},
     unique:{name:"Radiant Sovereign",upgrades:["Passive: -32 all dmg; allies regen 22/s; blind aura 38%; absorb 28% ally dmg; immune to blind+all CC","Reduce 42; regen 28/s; aura 48%; absorb 34%","Reduce 54; regen 36/s; aura 60%; absorb 42%","Reduce 68; regen 46/s; aura 74%; absorb 52%","Reduce 84; regen 58/s; aura 90%; absorb 64%; Radiantgator revives twice each revival healing all allies 200 HP+blinding all enemies 5s"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"gleamgator",shardsToAscend:20,ascensionsToEvolve:null},
  // Dark line 2
  {id:"eclipseboa",name:"Eclipseboa",emoji:"🐍",type:"Dark",rarity:"epic",description:"A massive boa that swallows light itself. Where it passes, even fire goes out.",
   stats:{hp:65,atk:108,def:48,spd:88,abilitySpeed:38},
   abilities:{
     basic:{name:"Eclipse Bite",upgrades:["20 dmg+silence 0.5s+drain 10 HP","26 dmg","33 dmg","42 dmg","Silence 1s; drain 15 HP; strip 1 buff"]},
     special:{name:"Shadow Coil",upgrades:["Constrict; 80 dmg+silence 3s+drain 15/s 4s+DEF-22%","96 dmg","116 dmg","140 dmg","Silence 4s; drain 22/s; DEF-30%; strip all buffs; can't gain buffs while constricted"]},
     unique:{name:"Eclipse Body",upgrades:["Passive: 20% of dmg dealt heals Eclipseboa; silence ignores 25% DEF; constricted foes take +25% dmg","Heal 26%; ignore 32%; +32%","Heal 32%; ignore 40%; +40%","Heal 40%; ignore 50%; +50%","Heal 50%; ignore 62%; +62%; on kill swallow foe absorbing 60% of its max HP as permanent bonus HP; invisible until attacking"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"voidboa"},
  {id:"voidboa",name:"Voidboa",emoji:"🐍",type:"Dark",rarity:"epic",description:"Eclipseboa grown twice as long and twice as dark. It has begun sprouting additional heads. Each one has opinions.",
   stats:{hp:89,atk:148,def:65,spd:119,abilitySpeed:51},
   abilities:{
     basic:{name:"Eclipse Bite",upgrades:["20 dmg+silence 0.5s+drain 10 HP","26 dmg","33 dmg","42 dmg","Silence 1s; drain 15 HP; strip 1 buff"]},
     special:{name:"Shadow Coil",upgrades:["Constrict; 80 dmg+silence 3s+drain 15/s 4s+DEF-22%","96 dmg","116 dmg","140 dmg","Silence 4s; drain 22/s; DEF-30%; strip all buffs; can't gain buffs while constricted"]},
     unique:{name:"Void Scales",upgrades:["Passive: 28% of dmg dealt heals; silence ignores 32% DEF; constricted foes take +32% dmg; grow 1 phantom head on kill +15% dmg","Heal 34%; ignore 40%; +40%","Heal 40%; ignore 48%; +48%; phantom head +20%","Heal 48%; ignore 58%; +58%; phantom +26%","Heal 58%; ignore 70%; +70%; phantom +34%; max 3 phantom heads; each head attacks separately; invisible until attacking"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"eclipseboa",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"darkhydra"},  {id:"darkhydra",name:"Eclipsemaw",emoji:"🐲",type:"Dark",rarity:"epic",description:"Eclipseboa grew multiple heads and an attitude problem. Each head operates independently and all of them are hungry.",
   stats:{hp:105,atk:175,def:77,spd:140,abilitySpeed:60},
   abilities:{
     basic:{name:"Void Fang",upgrades:["32 dmg+silence 1s+drain 18 HP; each head hits a different foe","40 dmg","50 dmg","64 dmg","Silence 1.5s; drain 26 HP; all 3 heads attack; strip 1 buff each"]},
     special:{name:"Hydra Coil",upgrades:["All 3 heads constrict a foe each; 100 dmg+silence 4s+drain 25/s","120 dmg","145 dmg","175 dmg","Silence 5s; drain 38/s; DEF-40%; can't gain buffs; strip all buffs; if only 1 foe then 1 head takes 3x"]},
     unique:{name:"Hydra Darkness",upgrades:["Passive: 38% dmg heals; killed enemies absorbed 80% max HP bonus; silence ignores 40% DEF; each kill grows a phantom head +18% dmg","Heal 46%; absorb 100%; ignore 50%","Heal 56%; phantom heads +24%","Heal 68%; phantom heads +32%","Heal 82%; phantom heads +42%; max 5 phantom heads; Darkhydra revives once per head (3 revivals); each revival stronger"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidboa",shardsToAscend:20,ascensionsToEvolve:null},
  // Dark line 3
  {id:"doomgrub",name:"Doomgrub",emoji:"🐛",type:"Dark",rarity:"epic",description:"A caterpillar that consumed enough darkness to become a minor apocalypse. It is still technically a grub.",
   stats:{hp:105,atk:58,def:112,spd:35,abilitySpeed:38},
   abilities:{
     basic:{name:"Void Chomp",upgrades:["14 dmg+drain 12 HP; attackers take 18 void dmg+silence 0.5s","18 dmg","23 dmg","30 dmg","Drain 18 HP; attackers silence 1s+strip 1 buff"]},
     special:{name:"Cocoon Phase",upgrades:["Retract; immune 3s+thorns 30 void/s; emerge 90 dmg+silence all 2s","Immune 3.5s; emerge 108","Immune 4s; emerge 130+stun 1s","Immune 4.5s; emerge 156","Immune 5s; emerge 185+stun 1.5s+strip all buffs; gain 6 charges on emerge"]},
     unique:{name:"Dark Vessel",upgrades:["Passive: attackers take 25 void+silence 1s; -22 all dmg; drain 12/s all nearby enemies","Void 35; -30; drain 16/s","Void 46; -38; drain 20/s","Void 60; -48; drain 26/s","Void 76; -60; drain 32/s; CC immune; on hitting 0 HP Doomgrub actually metamorphoses into Nihilwyrm immediately"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:15,ascensionsToEvolve:3,evolutionId:"doomchrysalis"},
  {id:"doomchrysalis",name:"Doomchrysalis",emoji:"🐛",type:"Dark",rarity:"epic",description:"Doomgrub cocooned itself in void-matter. Whatever is inside is not a grub anymore. Scientists approaching to investigate have not returned.",
   stats:{hp:144,atk:80,def:153,spd:48,abilitySpeed:50},
   abilities:{
     basic:{name:"Void Chomp",upgrades:["14 dmg+drain 12 HP; attackers take 18 void dmg+silence 0.5s","18 dmg","23 dmg","30 dmg","Drain 18 HP; attackers silence 1s+strip 1 buff"]},
     special:{name:"Cocoon Phase",upgrades:["Retract; immune 3s+thorns 30 void/s; emerge 90 dmg+silence all 2s","Immune 3.5s; emerge 108","Immune 4s; emerge 130+stun 1s","Immune 4.5s; emerge 156","Immune 5s; emerge 185+stun 1.5s+strip all buffs; gain 6 charges on emerge"]},
     unique:{name:"Chrysalis Void",upgrades:["Passive: attackers take 40 void+silence 1.5s; -30 all dmg; drain 18/s all nearby enemies; CC immune","Void 54; -40; drain 24/s","Void 70; -52; drain 30/s","Void 90; -66; drain 38/s","Void 114; -82; drain 48/s; on hitting 0 HP Doomchrysalis metamorphoses immediately with full HP+deals 150 void AOE"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"doomgrub",shardsToAscend:18,ascensionsToEvolve:4,evolutionId:"nihilwyrm"},  {id:"nihilwyrm",name:"Nihilcaim",emoji:"🐉",type:"Dark",rarity:"epic",description:"Doomgrub's final form. The nothing at the end of things. It does not fight. It simply removes things from existence.",
   stats:{hp:170,atk:94,def:180,spd:56,abilitySpeed:58},
   abilities:{
     basic:{name:"Void Devour",upgrades:["22 dmg+drain 22 HP; attackers take 36 void+silence 1.5s+strip 1 buff","28 dmg","36 dmg","46 dmg","Drain 32 HP; attackers void 52+silence 2s+strip all buffs"]},
     special:{name:"Nihil Phase",upgrades:["Immune 5s+void thorns 50/s; emerge 160 dmg+silence all 3s+stun 1.5s","Emerge 190","Emerge 228","Emerge 272","Emerge 325+stun 2s+strip all buffs all; heal Nihilwyrm full HP on emerge; emit 100 dmg void burst"]},
     unique:{name:"Nihil Form",upgrades:["Passive: attackers take 58 void+silence 2s+strip all buffs; -40 all dmg; drain 30/s all; CC immune; absorb 30% of all ally dmg taken","Void 72; -50; drain 38/s; absorb 36%","Void 90; -62; drain 48/s; absorb 44%","Void 112; -76; drain 60/s; absorb 54%","Void 138; -92; drain 74/s; absorb 66%; Nihilwyrm revives 3 times each revival removing 1 random ability from each enemy permanently"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"doomchrysalis",shardsToAscend:20,ascensionsToEvolve:null},
  {id:"stormwyvern",name:"Stormwyvern",emoji:"🐉",type:"Wind",rarity:"legendary",description:"Ancient ruler of storm clouds. Its wingspan generates hurricanes.",
   stats:{hp:110,atk:105,def:88,spd:92,abilitySpeed:78},
   abilities:{
     basic:{name:"Storm Fang",upgrades:["40 dmg wind","55 dmg","70 dmg","88 dmg","Hits chain to 2 additional nearby foes for 40% dmg"]},
     special:{name:"Tempest Wings",upgrades:["Push foes back","Push + 30 dmg","Push + 42 dmg","Push + 55 dmg","Creates a wind wall blocking projectiles for 3s"]},
     unique:{name:"Storm Lord",upgrades:["Passive: nearby allies gain +12 ATK and +10 SPD","Nearby allies gain +18 ATK and +16 SPD","Nearby allies gain +24 ATK and +22 SPD","Nearby allies gain +32 ATK and +28 SPD; Stormwyvern itself gains +15 SPD","Nearby allies gain +42 ATK and +36 SPD; Stormwyvern gains +25 SPD; allies also deal +10% wind damage"]}
   },role:"Support",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"tempestlord"},
  {id:"celestialux",name:"Celestialux",emoji:"✨",type:"Light",rarity:"legendary",description:"A being of pure starlight existing between dimensions. Its true form cannot be seen — only felt.",
   stats:{hp:130,atk:120,def:100,spd:110,abilitySpeed:100},
   abilities:{
     basic:{name:"Starfire",upgrades:["55 dmg","72 dmg","90 dmg","112 dmg","Starfire pierces through all enemies in a line"]},
     special:{name:"Stellar Veil",upgrades:["Reflect 15% dmg","Reflect 20%","Reflect 28%","Reflect 35%","Stellar Veil also heals 15 HP per reflected hit"]},
     unique:{name:"Starborn",upgrades:["Passive: all allies regenerate 2 HP/s","All allies regenerate 3 HP/s","All allies regenerate 4 HP/s; Celestialux's crits heal itself for 10 HP","All allies regenerate 6 HP/s; crits heal self for 18 HP","All allies regenerate 8 HP/s; crits heal self for 25 HP and also restore 3 HP to all allies"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:30,ascensionsToEvolve:3,evolutionId:"nebulalux"},
  // Wind line 1 final
  {id:"tempestlord",name:"Tempestlord",emoji:"🌪️",type:"Wind",rarity:"legendary",description:"The storm given eternal form. Where Tempestlord passes, the age of clear skies ends permanently.",
   stats:{hp:145,atk:138,def:118,spd:122,abilitySpeed:102},
   abilities:{
     basic:{name:"Gale Sovereign",upgrades:["55 dmg wind; chain 3 foes 60%","70 dmg","88 dmg","110 dmg","Chain all enemies; each hit applies -8% SPD stack; no cap"]},
     special:{name:"Eternal Tempest",upgrades:["All allies +55 ATK+45 SPD+30% wind dmg 7s","Aura stronger","Even stronger","Max","Permanent aura; also grant +20% Ability Speed; allies immune to wind dmg"]},
     unique:{name:"Storm Sovereign",upgrades:["Passive: all allies +55 ATK+45 SPD; Tempestlord generates endless gale zone 30/s; enemies -40% SPD","Allies +68 ATK+56 SPD; zone 38/s; -50%","Allies +84 ATK+70 SPD; zone 48/s; -60%","Allies +104 ATK+88 SPD; zone 60/s; -72%","Allies +128 ATK+108 SPD; zone 75/s; -84%; Tempestlord revives 3 times each as a category-5 tornado"]}
   },role:"Support",attackType:"Melee",evolutionOf:"stormwyvern",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 1 final
  {id:"nebulalux",name:"Nebulalux",emoji:"🌌",type:"Light",rarity:"legendary",description:"Celestialux absorbed an entire nebula. It now contains more light than a small galaxy and shares all of it.",
   stats:{hp:152,atk:140,def:118,spd:128,abilitySpeed:118},
   abilities:{
     basic:{name:"Nebula Beam",upgrades:["72 dmg; pierce all; heal all allies 28 HP","90 dmg; heal 36","112 dmg; heal 46","140 dmg; heal 58","Nebula Beam crits always; heals 80 HP; arc 3 extra beams to random foes"]},
     special:{name:"Stellar Veil",upgrades:["Reflect 40% dmg; heal 25 HP per reflected hit","Reflect 50%; heal 34","Reflect 62%; heal 44","Reflect 76%; heal 57","Reflect 92%; heal 74; reflected dmg also blinds attacker 3s; allies immune to reflected dmg"]},
     unique:{name:"Cosmic Born",upgrades:["Passive: all allies +18 HP/s regen; Nebulalux crits heal all allies 45 HP; immune to all dmg 15% chance","Regen +24/s; crit heal 58; immune 20%","Regen +30/s; crit heal 74; immune 26%","Regen +38/s; crit heal 94; immune 32%","Regen +48/s; crit heal 118; immune 40%; Nebulalux revives 3 times each time healing all allies to full HP"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"celestialux",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 1
  {id:"blazephoenix",name:"Blazephoenix",emoji:"🦅",type:"Fire",rarity:"legendary",description:"A phoenix hatched from the heart of a dying star. It considers extinction and rebirth a perfectly normal Tuesday.",
   stats:{hp:82,atk:140,def:60,spd:115,abilitySpeed:46},
   abilities:{
     basic:{name:"Solar Talon",upgrades:["26 dmg+burn 8/s 3s; arc 2 foes","33 dmg","42 dmg","54 dmg","Burn 12/s 4s; arc all nearby; burn spread to 1 foe per arc"]},
     special:{name:"Rebirth Flame",upgrades:["Blazephoenix becomes fire; emerges 3s later full HP; 80 dmg AOE on emerge","Emerge 100 dmg","Emerge 124 dmg","Emerge 154 dmg","Emerge stuns all 2s; burn all 6s; strip all buffs"]},
     unique:{name:"Eternal Flame",upgrades:["Passive: revives once per fight; each revival stronger+32% ATK; burn ignores 30% DEF; fire dmg +35%","Ignores 38%; +44%","Ignores 46%; +55%","Ignores 56%; +68%","Ignores 68%; +84%; Blazephoenix revives endlessly until 3 revivals; final death is a supernova 300 dmg all"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"solarpyre"},
  {id:"solarpyre",name:"Solarpyre",emoji:"🌟",type:"Fire",rarity:"legendary",description:"Blazephoenix's true form. A solar storm wearing feathers. Astronomers have filed formal complaints.",
   stats:{hp:130,atk:225,def:96,spd:185,abilitySpeed:74},
   abilities:{
     basic:{name:"Solar Talon",upgrades:["40 dmg+burn 12/s 4s; arc all; burn can't be removed","50 dmg","62 dmg","78 dmg","Burn 18/s 5s; all arcs crit; crits trigger free arc chain"]},
     special:{name:"Solar Rebirth",upgrades:["Transform to pure solar energy; emerge 4s later full HP; 140 dmg AOE+burn all 8s","Emerge 175 dmg","Emerge 218 dmg","Emerge 272 dmg","Emerge 340 dmg; stun all 3s; strip all buffs; arena on fire 6s 40/s after emerge"]},
     unique:{name:"Living Star",upgrades:["Passive: revives endlessly (3 revivals); each revival: +40% ATK+burn ignores +15% DEF; fire +50%; crits spread burn to all nearby","Fire +62%; burn DEF ignore +20% stacking","Fire +76%; +26% stacking","Fire +94%; +33% stacking","Fire +115%; +42% stacking; Solarpyre revives at full power; final revival: permanent star form dealing 80/s to all enemies"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"blazephoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 2
  {id:"ignisdragon",name:"Ignissaur",emoji:"🐲",type:"Fire",rarity:"legendary",description:"A dragon forged in the earth's mantle and never told it could leave. Surprisingly well-adjusted about it.",
   stats:{hp:95,atk:138,def:85,spd:72,abilitySpeed:44},
   abilities:{
     basic:{name:"Inferno Breath",upgrades:["28 dmg cone+burn 9/s 3s; melt DEF-10%","36 dmg","46 dmg","58 dmg","Burn 14/s 4s; DEF-16%; breath width doubled"]},
     special:{name:"Magma Core",upgrades:["Channel; 45/s 5s; armor melts: foe DEF-5%/s","55/s 6s; -6%/s","68/s 6s; -7%/s","84/s 7s; -8%/s","104/s 7s; -10%/s; fully melted foe stunned 2s"]},
     unique:{name:"Mantle Dragon",upgrades:["Passive: all burn deals +30% dmg; DEF melts -2% per hit (no cap); fire+earth dmg +25%","Burn +38%; -2.5%/hit; +32%","Burn +48%; -3%/hit; +40%","Burn +60%; -3.5%/hit; +50%","Burn +75%; -4%/hit; +62%; melted foes (DEF -40%+) take 80/s auto-fire dmg; Ignisdragon immune to all dmg while channeling"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"pyredragon"},
  {id:"pyredragon",name:"Pyresaur",emoji:"🐉",type:"Fire",rarity:"legendary",description:"Ignisdragon fully ignited. Every scale is a miniature sun. Sunglasses are not sufficient protection.",
   stats:{hp:152,atk:222,def:136,spd:116,abilitySpeed:70},
   abilities:{
     basic:{name:"Solar Breath",upgrades:["44 dmg cone+burn 18/s 5s; DEF-20%; width tripled","56 dmg","70 dmg","88 dmg","Burn 26/s 6s; DEF-28%; burns can't be removed; breath chains to all nearby of each hit foe"]},
     special:{name:"Magma Dominion",upgrades:["Channel; 70/s 6s; DEF-12%/s; enemy at 0 DEF explodes 150 dmg","88/s","108/s","132/s","162/s 7s; explosion 200 dmg; explosion spreads burn max stacks to all nearby"]},
     unique:{name:"Dragon Pyre",upgrades:["Passive: burn +55% dmg; DEF melt -5%/hit; fire dmg +60%; immune to all fire; attacks set ground on fire permanently in fight","Burn +68%; -6%/hit; +74%","Burn +84%; -7.5%/hit; +90%","Burn +104%; -9%/hit; +110%","Burn +128%; -11%/hit; +135%; Pyredragon revives 3 times at full HP each causing a world-fire explosion 400 dmg all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"ignisdragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Fire line 3
  {id:"magmatitan",name:"Magmaur",emoji:"🦣",type:"Fire",rarity:"legendary",description:"A creature so massive it reroutes lava flows. Geologists refer to it in hushed, reverent tones.",
   stats:{hp:148,atk:78,def:165,spd:22,abilitySpeed:28},
   abilities:{
     basic:{name:"Magma Stomp",upgrades:["20 dmg; lava pool 3s 18/s; stagger 0.5s","26 dmg","33 dmg","42 dmg","Lava pool 5s 26/s; stagger 1s; lava spreads 2m each step"]},
     special:{name:"Lava Armor",upgrades:["DEF+120+burn aura 30/s 6s+thorns burn 25; immune slow","DEF+152","DEF+190; thorns 32","DEF+235","DEF+288; thorns 42; also immune to stun+knock; aura 42/s 7s"]},
     unique:{name:"Living Volcano",upgrades:["Passive: every step erupts 60 dmg nearby; -28 all dmg; all attackers burned 5s 20/s; fire zone at all times 25/s","Step 76; -36; burn 28/s","Step 96; -46; burn 36/s","Step 120; -58; burn 46/s","Step 150; -72; burn 58/s; Magmatitan immune to all fire and earth dmg; revives once as a full volcanic eruption"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"infernocolossus"},
  {id:"infernocolossus",name:"Infernocolossus",emoji:"🌋",type:"Fire",rarity:"legendary",description:"Magmatitan evolved past the concept of cooling down. It is now classified as an active geological event.",
   stats:{hp:238,atk:126,def:264,spd:36,abilitySpeed:44},
   abilities:{
     basic:{name:"Inferno Stomp",upgrades:["32 dmg; lava pool 5s 28/s; stagger 1.5s; pool spreads 4m","40 dmg","50 dmg","64 dmg","Stagger 2s+stun 0.5s; pool spreads 6m; all stepping in pool burned max stacks"]},
     special:{name:"Volcano Armor",upgrades:["DEF+180+burn aura 48/s 7s+thorns 45; CC immune; allies -25% dmg taken","DEF+228","DEF+284; thorns 58","DEF+350","DEF+432; thorns 74; aura 68/s 8s; allies -38% dmg; reflect 30% all dmg taken"]},
     unique:{name:"Infernal Sovereign",upgrades:["Passive: step erupts 120 dmg; -44 all dmg; burn aura 44/s; fire+earth dmg +55%; immune to all fire/earth; absorb 35% ally dmg","Step 150; -56; burn 56/s; +68%","Step 188; -70; burn 70/s; +84%","Step 235; -88; burn 88/s; +104%","Step 295; -110; burn 110/s; +128%; Infernocolossus revives 3 times each as a world-ending volcanic eruption dealing 500 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"magmatitan",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 1
  {id:"frosthydra",name:"Frigidra",emoji:"🐲",type:"Water",rarity:"legendary",description:"A five-headed ice hydra. Cut off one head and three more grow back, each more furious than the last.",
   stats:{hp:105,atk:132,def:92,spd:65,abilitySpeed:42},
   abilities:{
     basic:{name:"Cryo Bite",upgrades:["24 dmg+freeze 12% 1.5s; each head targets a different foe","30 dmg","38 dmg","48 dmg","Freeze 20% 2s; all 5 heads attack; frozen foes shatter 60 dmg"]},
     special:{name:"Hydra Regen",upgrades:["Regrow 1 severed head; heal 80 HP; each head adds +8% ATK","Heal 100; +10%","Heal 125; +12%","Heal 156; +15%","Heal 195; +18%; regrow all heads; heads grant +20% ATK each; up to 8 heads"]},
     unique:{name:"Hydra Regeneration",upgrades:["Passive: regrow 1 head every 8s (max 8); each head +12% ATK+8% DEF; heads add blizzard aura 15/s","Every 6s; +15% ATK+10% DEF; aura 20/s","Every 5s; +18%+12%; aura 26/s","Every 4s; +22%+15%; aura 34/s","Every 3s; +28%+20%; aura 44/s; at 8 heads become invincible 1s every 5s; revives once regrowing to 8 heads instantly"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"glacialhydra"},
  {id:"glacialhydra",name:"Glacivore",emoji:"🐉",type:"Water",rarity:"legendary",description:"Frosthydra's final form. An eight-headed ice leviathan. Geographers have started naming seas after it.",
   stats:{hp:168,atk:212,def:148,spd:104,abilitySpeed:68},
   abilities:{
     basic:{name:"Glacial Bite",upgrades:["38 dmg+freeze 25% 2.5s; all 8 heads target all enemies","48 dmg","60 dmg","74 dmg","Freeze 38% 3s; shatter 100 dmg; strip 2 buffs per head"]},
     special:{name:"Ultimate Regen",upgrades:["Instantly regrow to 8 heads; heal full HP; 8-head ATK+DEF boost immediately","Also grant allies full HP","Also revive 1 fallen ally","Also revive 2 fallen","Also grant all allies 5s invincibility+full cleanse; Frosthydra buffs doubled"]},
     unique:{name:"Hydra Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +35% ATK+25% DEF; 8 heads: invincible 2s every 4s; aura 60/s","Head +44% ATK+32% DEF; aura 76/s","Head +55%+40%; aura 96/s","Head +68%+50%; aura 120/s","Head +85%+62%; aura 150/s; Glacialhydra with 8 heads is functionally unkillable; revives 3 times each regrowing to 8 heads"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"frosthydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 2
  {id:"abyssraken",name:"Abyssraken",emoji:"🦑",type:"Water",rarity:"legendary",description:"The original kraken. Every sea monster myth traces back to this. It is mildly annoyed by the inaccuracies.",
   stats:{hp:138,atk:72,def:155,spd:30,abilitySpeed:40},
   abilities:{
     basic:{name:"Tentacle Grab",upgrades:["18 dmg; grab+root 2s; drain 15 HP","23 dmg","30 dmg","38 dmg","Root 3s; drain 22 HP; silence 1.5s; strip 1 buff"]},
     special:{name:"Ink Cloud",upgrades:["Blind all 3s; -30% ATK+SPD 5s; ally team +15% dodge","Blind 4s; -38%","Blind 4s; -46%; dodge +20%","Blind 5s; -55%; dodge +26%","Blind 5s; -66%; dodge +32%; also silence all 2s; allies heal 30 HP"]},
     unique:{name:"Abyss Sovereign",upgrades:["Passive: -26 all dmg; 8 tentacle aura each 20/s; grabbed foes take +30% dmg+drain 15/s","Reduce 34; 28/s; +38%","Reduce 44; 38/s; +48%","Reduce 56; 50/s; +60%","Reduce 70; 65/s; +75%; Abyssraken immune to all water dmg; revives once all tentacles auto-grab all enemies"]}
   },role:"Tank",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"deepkraken"},
  {id:"deepkraken",name:"Bathykraken",emoji:"🦑",type:"Water",rarity:"legendary",description:"Abyssraken grown to its true size. Oceans look small standing next to it. It considers this 'a tight fit.'",
   stats:{hp:222,atk:116,def:248,spd:48,abilitySpeed:64},
   abilities:{
     basic:{name:"Kraken Tentacle",upgrades:["28 dmg; grab 3 foes; root 3s; drain 30 HP; strip 1 buff","36 dmg","46 dmg","58 dmg","Root 4s; drain 44 HP; silence 2s; strip all buffs; grabbed foes take +30% dmg"]},
     special:{name:"Abyss Ink",upgrades:["Blind all 5s; -55% ATK+SPD 6s; allies +38% dodge; remove all enemy buffs","Blind 6s; -66%; dodge +46%","Blind 6s; -80%; dodge +56%","Blind 7s; -96%; dodge +68%","Blind 7s; -115%; dodge +82%; silence all 3s; drain 40/s all enemies; heal all allies 80 HP"]},
     unique:{name:"Kraken Sovereign",upgrades:["Passive: -42 all dmg; 12 tentacle aura 52/s; grabbed foes drain 40/s+take +50% dmg; immune to all water","Reduce 54; aura 66/s; drain 52/s; +62%","Reduce 68; aura 84/s; drain 66/s; +76%","Reduce 86; aura 106/s; drain 84/s; +94%","Reduce 108; aura 132/s; drain 106/s; +116%; Deepkraken revives 3 times; each revival auto-grabs and silences all enemies"]}
   },role:"Tank",attackType:"Ranged",evolutionOf:"abyssraken",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 3
  {id:"oceanwyrm",name:"Tidalwarden",emoji:"🐍",type:"Water",rarity:"legendary",description:"A serpent old enough to remember when the oceans were young. It helped fill them.",
   stats:{hp:78,atk:138,def:58,spd:118,abilitySpeed:48},
   abilities:{
     basic:{name:"Ocean Fang",upgrades:["24 dmg+freeze 10% 1.5s+slow 25%; arc 2 nearby","30 dmg","38 dmg","48 dmg","Freeze 18% 2s; slow 35%; arc all; frozen foes shatter 50 dmg on arc"]},
     special:{name:"Tidal Coil",upgrades:["Coil all; maelstrom 5s 35/s; root+drain 20/s","Coil; 45/s; drain 26/s","Coil; 58/s; drain 34/s","Coil; 74/s; drain 44/s","Coil; 95/s; drain 56/s; coiled foes frozen; shatter 80 dmg on release"]},
     unique:{name:"Ancient Ocean",upgrades:["Passive: slow 40% on all attacks; freeze dmg +55%; coiled foes take +35% dmg; arc always hits all","Slow 50%; freeze +68%; coiled +44%","Slow 62%; freeze +84%; coiled +55%","Slow 76%; freeze +104%; coiled +68%","Slow 94%; freeze +128%; coiled +84%; Oceanwyrm immune to all water+ice; revives once as a world-flood tsunami"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"tidaldragon"},
  {id:"tidaldragon",name:"Tidalorca",emoji:"🐉",type:"Water",rarity:"legendary",description:"Oceanwyrm's draconic final form. Every ocean current on the planet follows its movements.",
   stats:{hp:125,atk:222,def:93,spd:190,abilitySpeed:76},
   abilities:{
     basic:{name:"Tidal Fang",upgrades:["38 dmg+freeze 28% 2.5s+slow 50%; arc all; shatter frozen 80 dmg","48 dmg","60 dmg","74 dmg","Freeze 42% 3s; slow 65%; strip 2 buffs; shatter 120 dmg; arc all enemies always"]},
     special:{name:"World Coil",upgrades:["Coil entire enemy team; 80/s for 6s; root+freeze+drain 50/s","96/s","116/s","140/s","170/s for 7s; drain 70/s; frozen coiled foes shatter 150 dmg; drain distributes to all allies; coiled lose all buffs"]},
     unique:{name:"Tidal Sovereign",upgrades:["Passive: slow 65% all attacks; freeze+shatters +80% dmg; arc 100% all; immune to all water+ice; coiled foes take +55% all dmg","Freeze+shatter +100%; coiled +68%","Freeze+shatter +125%; coiled +84%","Freeze+shatter +155%; coiled +104%","Freeze+shatter +190%; coiled +128%; Tidaldragon revives 3 times each as a world-tsunami dealing 500 dmg all+freezing all 5s"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"oceanwyrm",shardsToAscend:30,ascensionsToEvolve:null},
  // Water line 4
  {id:"morusk",name:"Morusk",emoji:"🦭",type:"Water",rarity:"legendary",description:"A walrus whose tusks have grown to the size of siege weapons. Ships have mistaken it for an island on three separate recorded occasions.",
   stats:{hp:145,atk:80,def:140,spd:40,abilitySpeed:25},
   abilities:{
     basic:{name:"Tusk Slam",upgrades:["22 dmg; stun 1.5s; -20% ATK 3s; knock back 2","28 dmg","36 dmg","46 dmg","Stun 2s; -30% ATK 4s; knock back 4; stunned foes take +40% dmg"]},
     special:{name:"Blubber Wall",upgrades:["Self+1 ally absorb 120 dmg; -25% dmg taken 4s; taunt nearby foes","Absorb 150; -32%","Absorb 188; -40%","Absorb 235; -50%","Absorb 295; -60%; reflect 25% dmg back; taunt all; remove 2 ally debuffs"]},
     unique:{name:"Permafrost Hide",upgrades:["Passive: -30 all dmg; frozen+slowed foes deal -20% dmg; counter 18 dmg on each hit taken","Reduce 38; -26%; counter 24","Reduce 48; -33%; counter 32","Reduce 60; -42%; counter 42","Reduce 76; -54%; counter 56; Morusk immune to freeze+slow; allies in range gain -18 dmg reduction"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"ivormar"},
  {id:"ivormar",name:"Ivormar",emoji:"🦭",type:"Water",rarity:"legendary",description:"Morusk at its true scale. Oceanographers have been charting it as unexplored territory for three decades. It finds this mildly flattering.",
   stats:{hp:225,atk:125,def:215,spd:58,abilitySpeed:35},
   abilities:{
     basic:{name:"Siege Tusk",upgrades:["36 dmg; stun 2.5s; -35% ATK 4s; knock back 5; strip 1 buff","46 dmg","58 dmg","72 dmg","Stun 3.5s; -50% ATK 5s; strip all buffs; stunned foes take +50% dmg from all sources"]},
     special:{name:"Ivory Fortress",upgrades:["Self+2 allies absorb 240 dmg; -50% dmg taken 5s; taunt all; remove 3 debuffs","Absorb 300; -62%","Absorb 375; -76%","Absorb 470; -92%","Absorb 588; -112%; reflect 45% dmg; taunt all; grant regen 40/s 5s to allies; CC immune for duration"]},
     unique:{name:"Ivory Colossus",upgrades:["Passive: -48 all dmg; frozen+slowed foes -35% dmg; counter 45; immune to all water+ice; allies -12 dmg in range","Reduce 60; -44%; counter 58; allies -16","Reduce 76; -55%; counter 74; allies -20","Reduce 96; -68%; counter 94; allies -26","Reduce 120; -84%; counter 118; allies -32; Ivormar revives once; revival freezes all 4s+restores all allies to 60% HP"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"morusk",shardsToAscend:30,ascensionsToEvolve:null},

  // Nature line 1
  {id:"verdanthydra",name:"Thornwarden",emoji:"🐲",type:"Nature",rarity:"legendary",description:"A hydra grown from the world tree's roots. Each head controls a different forest. All of them are poisonous.",
   stats:{hp:118,atk:105,def:132,spd:52,abilitySpeed:40},
   abilities:{
     basic:{name:"Vine Bite",upgrades:["22 dmg+poison 9/s 3s+root 1s; each head targets different foe","28 dmg","36 dmg","46 dmg","Poison 14/s 4s; root 1.5s; all heads attack; rooted foes +20% dmg taken"]},
     special:{name:"Forest Regen",upgrades:["Regrow heads; heal 90 HP+regen 20/s 5s; each head adds +10% ATK+12% DEF","Heal 115; +13%+15%","Heal 145; +16%+18%","Heal 180; +20%+22%","Heal 225; +25%+28%; also heal all allies 60 HP; remove all debuffs allies"]},
     unique:{name:"Forest Sovereign",upgrades:["Passive: regrow 1 head/8s (max 7); each head +15% ATK+18% DEF+poison aura 18/s; rooted foes take +30% dmg","Head +18%+22%; aura 24/s; +38%","Head +22%+28%; aura 30/s; +48%","Head +28%+35%; aura 38/s; +60%","Head +35%+44%; aura 48/s; +75%; at 7 heads immune to all dmg 2s every 5s; revives once regrowing all heads"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"roothydra"},
  {id:"roothydra",name:"Worldthorn",emoji:"🐉",type:"Nature",rarity:"legendary",description:"Verdanthydra evolved into the world forest itself. Every tree on the planet is technically its body now.",
   stats:{hp:190,atk:168,def:212,spd:82,abilitySpeed:64},
   abilities:{
     basic:{name:"Ancient Vine Bite",upgrades:["35 dmg+poison 20/s 5s+root 2s; all heads hit all enemies","44 dmg","56 dmg","70 dmg","Poison 30/s 6s; root 3s; can't remove poison or root; strip 2 buffs per head"]},
     special:{name:"Ancient Regen",upgrades:["Instant 7 heads; full HP+regen 40/s 6s; also heal all allies full HP","Also revive 1 fallen 40%","Also revive 2 fallen","Also revive 3 fallen","Revive all fallen at 60% HP; grant all invincible 2s; remove all debuffs; grant +30% all stats 8s"]},
     unique:{name:"World Tree",upgrades:["Passive: regrow 1 head/3s; each head +42% ATK+52% DEF+poison aura 60/s; 7 heads: invincible 3s every 4s","Head +52%+65%; aura 76/s","Head +65%+80%; aura 96/s","Head +80%+98%; aura 120/s","Head +100%+120%; aura 150/s; Roothydra revives 3 times each growing to 7 heads instantly and rooting all enemies 5s+max poison"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"verdanthydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 2
  {id:"sylvandragon",name:"Sylviguana",emoji:"🦎",type:"Nature",rarity:"legendary",description:"A dragon that tends the great forests and considers itself their gardener. Its pruning method involves venom.",
   stats:{hp:82,atk:135,def:65,spd:105,abilitySpeed:48},
   abilities:{
     basic:{name:"Thorn Fang",upgrades:["24 dmg+poison 9/s 3s; thorn return 20 on hit","30 dmg","38 dmg","48 dmg","Poison 14/s 4s; thorn 30; root 1s; spread poison to 1 nearby"]},
     special:{name:"Ancient Venom",upgrades:["Inject: foe gains max poison stacks+root 3s; 100 dmg over duration","120 dmg","145 dmg","175 dmg","Max stacks; root 4s; poison can't be cured; spread to all nearby of target"]},
     unique:{name:"Garden Dragon",upgrades:["Passive: poison stacks 8x; each stack +14/s; poisoned foes +40% dmg taken; thorns 35 on each attacker+poison them 3 stacks","Stacks 9x; +16/s; +50%; thorns 44","Stacks 10x; +20/s; +62%; thorns 56","Stacks 11x; +25/s; +76%; thorns 72","Stacks 12x; +32/s; +94%; thorns 92; Sylvandragon revives once; revival injects all enemies with max poison stacks+root 5s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"ancientdragon"},
  {id:"ancientdragon",name:"Primordrus",emoji:"🐉",type:"Nature",rarity:"legendary",description:"Sylvandragon become the ancient forest. It is both creature and ecosystem. Taxonomists have given up.",
   stats:{hp:132,atk:218,def:104,spd:168,abilitySpeed:76},
   abilities:{
     basic:{name:"Ancient Fang",upgrades:["38 dmg+max poison spread to 2 nearby+root 1.5s; thorn 55 return","48 dmg","60 dmg","74 dmg","Spread to all nearby; root 2s; thorn 80; strip 2 buffs; poison can't be removed"]},
     special:{name:"Primordial Venom",upgrades:["Inject all enemies; max 12-stack poison+root 4s; 160 dmg total","192 dmg","230 dmg","276 dmg","Root 5s; inject 12-stack; 280 dmg total; can't cure; death spreads to nearby; all allies fully healed"]},
     unique:{name:"Primordial Dragon",upgrades:["Passive: poison stacks 12x; each +38/s; poisoned foes +65% dmg; thorns 80 on attacker+poison 6 stacks; kills spread max poison+root 4s AOE","Stacks 14x; +46/s; +80%; thorns 100","Stacks 16x; +56/s; +98%; thorns 125","Stacks 18x; +68/s; +120%; thorns 155","Stacks 20x; +84/s; +148%; thorns 192; Ancientdragon revives 3 times each as a world-forest explosion rooting all+max poisoning all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"sylvandragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Nature line 3
  {id:"bloomphoenix",name:"Bloomibis",emoji:"🦜",type:"Nature",rarity:"legendary",description:"A phoenix made of living petals. When it dies it blooms, reviving more colorful and considerably better at healing.",
   stats:{hp:92,atk:52,def:100,spd:110,abilitySpeed:82},
   abilities:{
     basic:{name:"Petal Burst",upgrades:["12 dmg; heal all allies 22 HP; cleanse 1 debuff from healed","15 dmg; heal 28","19 dmg; heal 36","25 dmg; heal 46","Bloom burst: heal all 60 HP; cleanse all debuffs; grant +12% all stats 3s"]},
     special:{name:"Life Bloom",upgrades:["Bloom aura; all allies +28 HP/s+30% Ability Speed+remove all debuffs 6s","Regen +36; +38%","Regen +46; +48%","Regen +58; +60%","Regen +72; +75%; grant immunity to all debuffs 7s; revive 1 fallen ally 32% HP"]},
     unique:{name:"Eternal Bloom",upgrades:["Passive: revives endlessly (3x) each revival healing all allies 100 HP+removing all debuffs+granting bloom aura 8s; Ability Speed +45% all allies","Revival heals 125 HP; +55% Ability Speed","Revival heals 155 HP; +68%","Revival heals 192 HP; +84%","Revival heals 240 HP; +104%; on 3rd revival Bloomphoenix becomes permanent petal storm healing all allies 80/s+immune to all dmg"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"lifephoenix"},
  {id:"lifephoenix",name:"Animavis",emoji:"🌿",type:"Nature",rarity:"legendary",description:"Bloomphoenix's final form. The concept of life given wings. It sustains ecosystems just by existing nearby.",
   stats:{hp:148,atk:84,def:160,spd:178,abilitySpeed:132},
   abilities:{
     basic:{name:"Life Burst",upgrades:["18 dmg; heal all allies 38 HP; cleanse all debuffs; grant 1 buff","23 dmg; heal 48","30 dmg; heal 60","38 dmg; heal 76","Bloom explosion: heal all 120 HP; cleanse all; grant 3 buffs; spread to all nearby allies also"]},
     special:{name:"Eternal Life",upgrades:["All allies +55 HP/s+55% Ability Speed+full cleanse; revive 1 fallen 40% HP","Regen +68; +68%; revive 2 fallen","Regen +84; +84%; revive 2 at 50%","Regen +104; +104%; revive 3 at 55%","Regen +128; +128%; revive all fallen 65% HP; grant all invincible 2.5s; all stats +35% 8s"]},
     unique:{name:"Life Sovereign",upgrades:["Passive: revives endlessly; each revival: all allies full HP+full cleanse+invincible 2s+petal storm 100/s all enemies for 5s; Ability Speed +65% all","Ability Speed +80%","Ability Speed +98%","Ability Speed +120%","Ability Speed +148%; Lifephoenix immune to all dmg while any ally is alive; can never be permanently killed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"bloomphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 1
  {id:"earthgolem",name:"Terravast",emoji:"🗿",type:"Earth",rarity:"legendary",description:"Built by an ancient civilization as a guardian. The civilization is gone. Earthgolem is still guarding.",
   stats:{hp:155,atk:72,def:172,spd:18,abilitySpeed:24},
   abilities:{
     basic:{name:"Bedrock Slam",upgrades:["20 dmg; quake 2s 18/s; DEF-10%+stagger 1s","26 dmg","33 dmg","42 dmg","DEF-16%; stagger 1.5s; shockwave 40 dmg all nearby; quake 3s"]},
     special:{name:"Ancient Ward",upgrades:["DEF+150+thorns 40+reflect 25% 8s; allies take -30% dmg; CC immune","DEF+190; allies -38%","DEF+238; reflect 32%; allies -48%","DEF+298; reflect 40%; allies -60%","DEF+372; reflect 50%; allies -75%; Earthgolem immune to all dmg during ward"]},
     unique:{name:"Primordial Stone",upgrades:["Passive: -32 all dmg; CC immune; reflect 28% blocked; thorns 50 all attackers; shockwave 45 dmg every step","Reduce 42; reflect 36%; thorns 64; shockwave 58","Reduce 54; reflect 46%; thorns 80; shockwave 74","Reduce 68; reflect 58%; thorns 100; shockwave 94","Reduce 86; reflect 72%; thorns 126; shockwave 118; Earthgolem revives 3 times; each revival cracks the earth dealing 350 dmg all"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"titangolem"},
  {id:"titangolem",name:"Terralith",emoji:"🏔️",type:"Earth",rarity:"legendary",description:"Earthgolem grew until it became the mountain. Geographers debate whether it counts as topography.",
   stats:{hp:250,atk:116,def:278,spd:28,abilitySpeed:38},
   abilities:{
     basic:{name:"Mountain Slam",upgrades:["32 dmg; quake 3s 28/s; DEF-20%+stagger 2s; shockwave 65 all nearby","40 dmg","50 dmg","64 dmg","DEF-28%; stagger 2.5s+stun 1s; shockwave 88 dmg; quake 5s; pillars erupt 4 random spots"]},
     special:{name:"Titan Ward",upgrades:["DEF+230+thorns 65+reflect 42% 9s; allies take -50% dmg; CC immune; thorns stun attacker 0.5s","DEF+290; allies -62%","DEF+362; reflect 52%; allies -76%; thorns stun 1s","DEF+452; reflect 64%; allies -94%","DEF+565; reflect 80%; allies -100% (immune); thorns stun 1.5s; Titangolem invincible during ward"]},
     unique:{name:"Titan Sovereign",upgrades:["Passive: -52 all dmg; CC immune; reflect 58% blocked; thorns 120+stun 1s; shockwave 110 each step; absorb 45% ally dmg","Reduce 66; reflect 74%; thorns 152+stun 1.5s; shockwave 140; absorb 56%","Reduce 82; reflect 92%; thorns 190+stun 2s; shockwave 175; absorb 68%","Reduce 100; reflect 114%; thorns 238+stun 2.5s; shockwave 218; absorb 82%","Reduce 122; reflect 140%; thorns 298+stun 3s; shockwave 275; absorb 100%; Titangolem revives 3 times; each revival is a continental collapse 600 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"earthgolem",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 2
  {id:"quartzhydra",name:"Geoloch",emoji:"💎",type:"Earth",rarity:"legendary",description:"A gemstone hydra that grew inside the earth's crystal core. Each head is a different precious stone.",
   stats:{hp:122,atk:118,def:138,spd:42,abilitySpeed:36},
   abilities:{
     basic:{name:"Crystal Bite",upgrades:["22 dmg+DEF-12% 4s; thorn 25 return; each head targets different foe","28 dmg","36 dmg","46 dmg","DEF-18% 5s; thorn 38; crystal shards 30 dmg AOE on each bite"]},
     special:{name:"Gem Regen",upgrades:["Regrow 1 head; +14% ATK+18% DEF per head; heal 85 HP; thorn reflection +20%","Heal 108; +18% ATK+22% DEF","Heal 135; +22%+28%","Heal 168; +28%+35%","Heal 210; +35%+44%; regrow to 7 heads; also heal all allies 50 HP"]},
     unique:{name:"Gem Hydra",upgrades:["Passive: regrow 1 head/7s (max 7); each head +16% ATK+20% DEF+crystal aura 22/s; reflect 30% blocked; thorns 35 per head","Head +20%+25%; aura 28/s; reflect 38%; thorns 44","Head +25%+32%; aura 36/s; reflect 48%; thorns 56","Head +32%+40%; aura 46/s; reflect 60%; thorns 72","Head +40%+50%; aura 58/s; reflect 74%; thorns 92; at 7 heads immune to all physical dmg; revives once regrowing all heads+crystal explosion 300 dmg"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"gemhydra"},
  {id:"gemhydra",name:"Prismarex",emoji:"🐉",type:"Earth",rarity:"legendary",description:"Quartzhydra fully crystalized. An eight-headed dragon of pure gemstone. It is its own mountain, treasury, and fortress.",
   stats:{hp:196,atk:190,def:222,spd:68,abilitySpeed:58},
   abilities:{
     basic:{name:"Gem Bite",upgrades:["35 dmg+DEF-22% 5s; thorn 65 return; crystal 55 AOE each bite; all 8 heads attack","44 dmg","56 dmg","70 dmg","DEF-32% 6s; thorn 90; crystal 80 AOE; each head strips 1 buff"]},
     special:{name:"Sovereign Regen",upgrades:["Instant 8 heads; heal full HP; head bonuses max out; also heal all allies full HP","Also revive 1 fallen","Also revive 2 fallen","Also revive 3 fallen","Revive all fallen 60%; grant all invincible 2.5s; full cleanse; grant +40% all stats 8s"]},
     unique:{name:"Gem Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +48% ATK+60% DEF+crystal aura 72/s; 8 heads: immune to all physical+magic dmg 3s every 4s; reflect 90% blocked; thorns 150+stun 1s per head","Head +60%+75%; aura 90/s","Head +75%+94%; aura 112/s","Head +94%+116%; aura 140/s","Head +118%+145%; aura 175/s; Gemhydra with 8 heads is immune to all dmg; revives 3 times each crystal explosion 500 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"quartzhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Earth line 3
  {id:"seismicdrake",name:"Richterdrake",emoji:"🦎",type:"Earth",rarity:"legendary",description:"A drake whose heartbeat registers as seismic activity. It thinks the world shaking is how everyone says hello.",
   stats:{hp:88,atk:130,def:78,spd:82,abilitySpeed:44},
   abilities:{
     basic:{name:"Seismic Bite",upgrades:["24 dmg+quake 2s 18/s; DEF-12%+stagger 1s; shockwave 35 dmg","30 dmg","38 dmg","48 dmg","DEF-18%; stagger 1.5s; shockwave 50 dmg; quake 3s; fissure at target's feet"]},
     special:{name:"Tectonic Roar",upgrades:["Roar; all enemies -30% ATK+DEF+SPD 6s; quake 4s 28/s","Roar; -38% 7s","Roar; -48% 7s","Roar; -60% 8s","Roar; -75% 8s; also silence 3s; all allies +30% ATK+DEF+SPD 6s"]},
     unique:{name:"Seismic Dragon",upgrades:["Passive: heartbeat quake every 3s 80 dmg all; -24 all dmg; shockwave on every attack; DEF-5%/hit (no cap)","Heartbeat 100 dmg every 2.5s; -32","Heartbeat 125 dmg every 2s; -40","Heartbeat 156 dmg every 1.5s; -50","Heartbeat 195 dmg every 1s; -62; CC immune; Seismicdrake revives once; revival is a magnitude-10 earthquake 400 dmg all+bury all 5s"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"quakewyrm"},
  {id:"quakewyrm",name:"Seismarex",emoji:"🐉",type:"Earth",rarity:"legendary",description:"Seismicdrake's final form. A tectonic wyrm so massive that continents shift when it turns around.",
   stats:{hp:142,atk:210,def:125,spd:132,abilitySpeed:70},
   abilities:{
     basic:{name:"Tectonic Bite",upgrades:["38 dmg+quake 3s 30/s; DEF-22%+stagger 2s; shockwave 70 dmg+stun all nearby 0.5s","48 dmg","60 dmg","74 dmg","DEF-32%; stagger 2.5s; shockwave 100 dmg+stun 1s; fissure 4s 40/s at each target"]},
     special:{name:"World Roar",upgrades:["All enemies -55% all stats 8s; quake 6s 45/s; all allies +45% all stats 8s","Enemies -68%; allies +56%","Enemies -84%; allies +70%","Enemies -104%; allies +88%","Enemies -128%; allies +110%; also silence all enemies 4s; remove all enemy buffs; grant ally immunity 3s"]},
     unique:{name:"Wyrm Sovereign",upgrades:["Passive: heartbeat 150 dmg all every 1s; -38 all dmg; shockwave 100 dmg each attack; DEF-8%/hit; CC immune; absorb 40% ally dmg","Heartbeat 188 dmg; -48; shockwave 125; -10%/hit; absorb 50%","Heartbeat 235; -60; shockwave 156; -12%/hit; absorb 62%","Heartbeat 294; -76; shockwave 195; -15%/hit; absorb 76%","Heartbeat 368; -96; shockwave 244; -19%/hit; absorb 94%; Quakewyrm revives 3 times each as a continental collapse 600 dmg all"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"seismicdrake",shardsToAscend:30,ascensionsToEvolve:null},
  // Wind line 2
  {id:"galephoenix",name:"Aetherwing",emoji:"🕊️",type:"Wind",rarity:"legendary",description:"A phoenix reborn in the eye of a hurricane. It considers Category 5 storms 'brisk.' ",
   stats:{hp:72,atk:142,def:52,spd:128,abilitySpeed:44},
   abilities:{
     basic:{name:"Gale Feather",upgrades:["24 dmg+push+slow 32% 2.5s; arc 3 foes","30 dmg","38 dmg","48 dmg","Slow 48%; arc all; each arc pushes back; leave cyclone 2s 20/s"]},
     special:{name:"Hurricane Rebirth",upgrades:["Become wind; emerge 3.5s later full HP+4s invincible; 100 dmg hurricane on emerge","Emerge 125 dmg","Emerge 156 dmg","Emerge 195 dmg","Emerge 244 dmg; hurricane 5s 50/s; all enemies -55% SPD; allies gain +45 SPD"]},
     unique:{name:"Storm Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: stronger +35% ATK+full SPD; hurricane 6s 45/s on each revival; enemies -55% SPD around revival point","Revival +44% ATK; hurricane 7s 58/s","Revival +55%; 8s 74/s","Revival +68%; 9s 94/s","Revival +84%; 10s 118/s; 3rd revival: permanent storm form+untargetable for 4s every 8s; enemies always -40% SPD"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"skyphoenix"},
  {id:"skyphoenix",name:"Skyphoenix",emoji:"✨",type:"Wind",rarity:"legendary",description:"Galephoenix's true form. A creature of pure atmospheric power that rewrites the rules of weather by existing.",
   stats:{hp:116,atk:228,def:83,spd:206,abilitySpeed:70},
   abilities:{
     basic:{name:"Sky Feather",upgrades:["38 dmg+push+slow 55% 3.5s; arc all; each arc also pushes+slows; cyclone 3s 35/s at landing","48 dmg","60 dmg","74 dmg","Slow 72%; cyclone 4s 50/s; cyclone stuns 1s on enter; strip 2 buffs per arc"]},
     special:{name:"Sky Rebirth",upgrades:["Become sky itself; emerge 4.5s later full HP+8s invincible; 160 dmg F10 hurricane on emerge; all enemies trapped","Emerge 200 dmg","Emerge 250 dmg","Emerge 312 dmg","Emerge 390 dmg; hurricane 8s 80/s; allies immune to wind+gain +65 SPD+50% dodge permanently in fight"]},
     unique:{name:"Sky Sovereign",upgrades:["Passive: revives endlessly; each revival: +48% ATK+full SPD; permanent world storm 80/s; immune to all targeting between attacks; enemies always -65% SPD","Revival +60%; storm 100/s","Revival +75%; storm 125/s","Revival +94%; storm 156/s","Revival +118%; storm 195/s; Skyphoenix becomes permanently airborne and untargetable unless attacking; crits always hit"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"galephoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Wind line 3
  {id:"cyclonedrake",name:"Maelstrake",emoji:"🦅",type:"Wind",rarity:"legendary",description:"A drake born inside a cyclone and raised by the wind. It has never once touched the ground and considers this normal.",
   stats:{hp:65,atk:135,def:48,spd:148,abilitySpeed:38},
   abilities:{
     basic:{name:"Cyclone Talon",upgrades:["22 dmg+push+vortex 2s 20/s at landing; slow 28%","28 dmg","36 dmg","46 dmg","Push+vortex 3s 30/s; slow 42%; strip 1 buff; chain to 2 nearby at 60%"]},
     special:{name:"Cyclone Body",upgrades:["Spin; 70 dmg all nearby; pull all; slow 50% 4s; vortex 4s 30/s lingers","84 dmg","102 dmg","122 dmg","Spin; 145 dmg; pull; slow 66%; silence 2s; vortex 6s 44/s; all hit lose 1 buff"]},
     unique:{name:"Cyclone Drake",upgrades:["Passive: immune to all ground; +36% dodge; cyclone aura 36/s; all enemies in range -50% SPD+ATK; SPD scales dmg +1.5%/5 SPD","Dodge +44%; aura 46/s; -62%","Dodge +54%; aura 58/s; -76%","Dodge +66%; aura 72/s; -94%","Dodge +80%; aura 90/s; -116%; Cyclonedrake permanently airborne+untargetable unless attacking; revives once as a mega cyclone"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"vortexwyrm"},
  {id:"vortexwyrm",name:"Maelstrix",emoji:"🐉",type:"Wind",rarity:"legendary",description:"Cyclonedrake's final form. A wyrm of living wind that exists simultaneously everywhere the wind blows.",
   stats:{hp:104,atk:218,def:77,spd:238,abilitySpeed:61},
   abilities:{
     basic:{name:"Vortex Talon",upgrades:["35 dmg+push+vortex 4s 50/s at each landing; slow 62%; chain all","44 dmg","56 dmg","70 dmg","Slow 80%; chain all at 100%; vortex sucks enemies in; each chain strip 1 buff; stun 0.5s on entry"]},
     special:{name:"Vortex Form",upgrades:["Become wind; attack from everywhere simultaneously; 60 dmg 6 hits+pull+slow 80% 5s","72 dmg","88 dmg","106 dmg","8 hits; slow 100% (root); silence 3s; all hits strip 1 buff; emerge dealing 120 additional dmg"]},
     unique:{name:"Vortex Sovereign",upgrades:["Passive: immune to ground+all targeting between attacks; +55% dodge; aura 110/s; enemies -80% SPD+ATK; SPD scales dmg +2%/5 SPD","Dodge +65%; aura 138/s; -100%","Dodge +78%; aura 172/s; -124%","Dodge +94%; aura 215/s; -155%","Dodge +114%; aura 270/s; -194%; Vortexwyrm exists as wind at all times; physically cannot be hit unless it chooses; revives 3 times each as a world-cyclone"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"cyclonedrake",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 1
  {id:"thunderhydra",name:"Voltravene",emoji:"⚡",type:"Electric",rarity:"legendary",description:"A hydra with a head for every type of lightning. Scientists documented it once. Their equipment never worked again.",
   stats:{hp:95,atk:128,def:88,spd:80,abilitySpeed:44},
   abilities:{
     basic:{name:"Thunder Bite",upgrades:["22 dmg+arc all 70%; paralyze 22% 1.5s; each head targets different foe","28 dmg","36 dmg","46 dmg","Arc all 100%; paralyze 32% 2s; stun on paralyze 0.5s; each arc chains to 2 more"]},
     special:{name:"Lightning Regen",upgrades:["Regrow 1 head; +12% ATK+8% DEF per head; release 60 dmg lightning burst per head","Burst 75 dmg per head","Burst 94 dmg","Burst 118 dmg","Burst 148 dmg; also paralyze all nearby 2s; instantly regrow to 6 heads"]},
     unique:{name:"Thunder Regen",upgrades:["Passive: regrow 1 head/7s (max 6); each head +14% ATK+10% DEF+arc aura 20/s+paralyze 12%/s; lightning zone at all times","Head +18%+13%; aura 26/s; paralyze 16%/s","Head +22%+16%; aura 34/s; paralyze 21%/s","Head +28%+20%; aura 44/s; paralyze 27%/s","Head +35%+25%; aura 56/s; paralyze 35%/s; at 6 heads immune to electric dmg; revives once regrowing all heads+EMP 300 dmg all"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"stormhydra"},
  {id:"stormhydra",name:"Arcmajor",emoji:"🐉",type:"Electric",rarity:"legendary",description:"Thunderhydra's final form. Nine heads, nine storms. Meteorologists have collectively retired.",
   stats:{hp:152,atk:206,def:142,spd:128,abilitySpeed:70},
   abilities:{
     basic:{name:"Storm Bite",upgrades:["35 dmg+arc all 100%; paralyze 40% 2.5s; stun 1s on paralyze; all 9 heads attack; each chain to all","44 dmg","56 dmg","70 dmg","Paralyze 55% 3s; stun 1.5s; each arc also strips 1 buff; arcs deal full dmg to all"]},
     special:{name:"World Lightning",upgrades:["Release 9-head lightning; 120 dmg per head to 1 foe each; stun all 2s; regrow to 9 heads","150 dmg per head","188 dmg","235 dmg","295 dmg; all enemies paralyzed 3s+stripped all buffs; heal all allies 80 HP; all lightning arcs chain to each other"]},
     unique:{name:"Storm Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +42% ATK+30% DEF+arc aura 68/s+paralyze 40%/s; 9 heads: immune to all electric; EMP every 8s 150 dmg+stun 2s all","Head +52%+38%; aura 86/s; 190 dmg EMP","Head +65%+48%; aura 108/s; 238 dmg","Head +80%+60%; aura 135/s; 298 dmg","Head +100%+75%; aura 170/s; 375 dmg; Stormhydra revives 3 times each EMP stunning all enemies 5s+dealing 500 dmg"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"thunderhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 2
  {id:"voltphoenix",name:"Arcsurge",emoji:"🦅",type:"Electric",rarity:"legendary",description:"A phoenix that died in a lightning bolt and came back as one. Power grids nationwide have filed grievances.",
   stats:{hp:72,atk:140,def:52,spd:120,abilitySpeed:52},
   abilities:{
     basic:{name:"Arc Feather",upgrades:["22 dmg+arc all 65%+paralyze 18% 1.5s; each arc chains once","28 dmg","36 dmg","46 dmg","Arc 85%; paralyze 26% 2s; stun 0.5s; chains to all in range"]},
     special:{name:"Volt Rebirth",upgrades:["Become lightning; emerge 3s later full HP; EMP 150 dmg+stun 2s+paralyze all 3s on emerge","Emerge EMP 188 dmg","Emerge 235 dmg","Emerge 294 dmg","Emerge 368 dmg; EMP disables all abilities 5s; strip all buffs; allies gain +45% electric dmg 6s"]},
     unique:{name:"Electric Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: EMP stun all 3s+paralyze all 4s+arc all 100% 200 dmg; +38% ATK; immune to all electric","Revival +48%; EMP 225 dmg","Revival +60%; EMP 250 dmg","Revival +75%; EMP 280 dmg","Revival +94%; EMP 312 dmg; 3rd revival: become permanent lightning form dealing 100/s to all enemies; allies immune"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"arcphoenix"},
  {id:"arcphoenix",name:"Arcondor",emoji:"🌩️",type:"Electric",rarity:"legendary",description:"Voltphoenix's true form. Pure electricity given feathers and a bad attitude toward things that conduct poorly.",
   stats:{hp:116,atk:225,def:83,spd:193,abilitySpeed:82},
   abilities:{
     basic:{name:"Arc Feather",upgrades:["35 dmg+arc all 100%+paralyze 38% 2.5s; stun 1s; chains to all; stun on paralyze","44 dmg","56 dmg","70 dmg","Paralyze 52% 3s; stun 1.5s; each chain also arcs again; strip 1 buff per arc"]},
     special:{name:"Arc Rebirth",upgrades:["Become arc; emerge 4s full HP; EMP 240 dmg+stun 3s+paralyze all 5s+disable abilities 6s on emerge","Emerge 300 dmg","Emerge 375 dmg","Emerge 469 dmg","Emerge 586 dmg; strip all buffs; allies immune to electric 8s+gain +60% ATK 5s; Arcphoenix also gains +55% ATK 5s"]},
     unique:{name:"Arc Sovereign",upgrades:["Passive: revives endlessly; each revival: EMP stun all 5s+paralyze 6s+arc 100% 320 dmg; +52% ATK per revival; permanent arc storm 80/s","Revival +65%; storm 100/s","Revival +80%; storm 125/s","Revival +100%; storm 156/s","Revival +125%; storm 195/s; Arcphoenix permanently arcs to all enemies every second for 100 dmg; untargetable between attacks"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"voltphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Electric line 3
  {id:"galvanigolem",name:"Galvatus",emoji:"🤖",type:"Electric",rarity:"legendary",description:"An ancient war golem rebuilt with a lightning core. Its builders are long gone. It is still very much operational.",
   stats:{hp:148,atk:75,def:165,spd:24,abilitySpeed:32},
   abilities:{
     basic:{name:"Thunder Fist",upgrades:["20 dmg+shock 18/s 3s+stagger 0.5s; arc 2 nearby 60%","26 dmg","33 dmg","42 dmg","Shock 26/s 4s; stagger 1s; paralyze 18% 1.5s; arc all 70%"]},
     special:{name:"Electric Ward",upgrades:["DEF+130+electric field 35/s 7s+paralyze 20%/s; immune to paralysis+stun","DEF+165; paralyze 26%/s","DEF+206; paralyze 33%/s","DEF+258; paralyze 42%/s","DEF+322; paralyze 54%/s 8s; field also disables abilities 2s on entry; allies immune to electric"]},
     unique:{name:"Thunder Core",upgrades:["Passive: -30 all dmg; electric field always active 44/s+paralyze 28%/s; charges max 12; each charge +18 dmg to next attack; gain 1 charge/3s; release burst 220 dmg+paralyze all 3s","Reduce 38; field 56/s; burst 275","Reduce 48; field 70/s; burst 344","Reduce 60; field 88/s; burst 430","Reduce 76; field 110/s; burst 538; CC immune; revives 3 times each EMP stunning all enemies 6s+dealing 600 dmg"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"staticgolem"},
  {id:"staticgolem",name:"Arcvast",emoji:"🌩️",type:"Electric",rarity:"legendary",description:"Galvanigolem's final form. A walking thunderstorm in metal armor. Nations have tried to weaponize it. Nations have failed.",
   stats:{hp:238,atk:120,def:264,spd:38,abilitySpeed:50},
   abilities:{
     basic:{name:"Lightning Fist",upgrades:["32 dmg+shock 28/s 4s+stagger 1.5s; paralyze 30% 2s; arc all 90%","40 dmg","50 dmg","64 dmg","Shock 40/s 5s; stagger 2s+stun 0.5s; paralyze 44% 2.5s; arc all 100%+chain twice"]},
     special:{name:"Static Fortress",upgrades:["DEF+200+electric field 56/s 9s+paralyze 44%/s; immune CC; disable on entry 3s; allies -40% dmg taken","DEF+250; allies -50%","DEF+312; paralyze 56%/s; allies -62%","DEF+390; allies -76%","DEF+488; paralyze 70%/s 10s; allies -94% (near immune); field also stuns on entry 1s; reflect 50% all dmg"]},
     unique:{name:"Static Sovereign",upgrades:["Passive: -48 all dmg; field 110/s+paralyze 56%/s; CC immune; charges max 16; each charge +22 dmg; gain 1 charge/2s; release burst 420 dmg+stun 5s+disable 6s all","Reduce 60; field 138/s; burst 525","Reduce 76; field 172/s; burst 656","Reduce 96; field 215/s; burst 820","Reduce 120; field 270/s; burst 1025; Staticgolem immune to all dmg while charging; revives 3 times each world EMP dealing 700 dmg all"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"galvanigolem",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 2
  {id:"solarphoenix",name:"Dawnwing",emoji:"🔥",type:"Light",rarity:"legendary",description:"A phoenix made of solar plasma. It exists at the intersection of light, heat, and 'please don't look directly at it.'",
   stats:{hp:80,atk:138,def:60,spd:118,abilitySpeed:50},
   abilities:{
     basic:{name:"Solar Feather",upgrades:["24 dmg+blind 22% 2s; heal all allies 16 HP; arc 3 foes","30 dmg; heal 20","38 dmg; heal 26","48 dmg; heal 33","Solar burst: blind all 3s; heal all 55 HP; arc all; strip 1 buff per arc"]},
     special:{name:"Solar Rebirth",upgrades:["Become solar flare; emerge 3s later full HP; 120 dmg+blind all 4s; heal all allies 80 HP","Emerge 150 dmg; heal 100","Emerge 188 dmg; heal 125","Emerge 235 dmg; heal 156","Emerge 294 dmg; blind 5s; heal 195; grant all allies invincible 2s; revive 1 fallen ally 30% HP"]},
     unique:{name:"Solar Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: blind all 5s+heal all allies 200 HP+grant invincible 2s; light dmg +40%; heals +35%","Light +50%; heals +44%","Light +62%; heals +55%","Light +76%; heals +68%","Light +94%; heals +84%; Solarphoenix immune to all blind; crits always heal all allies 55 HP; revives at full power"]}
   },role:"Support",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"divinephoenix"},
  {id:"divinephoenix",name:"Celestialis",emoji:"☀️",type:"Light",rarity:"legendary",description:"Solarphoenix ascended to true divinity. It can no longer be described using standard luminosity measurements.",
   stats:{hp:128,atk:222,def:96,spd:190,abilitySpeed:80},
   abilities:{
     basic:{name:"Divine Feather",upgrades:["38 dmg+blind 38% 3s; heal all 28 HP; arc all; each arc heals 1 ally 18 HP","48 dmg; heal 36/22","60 dmg; heal 46/28","74 dmg; heal 58/36","Divine burst: blind all 5s; heal all 92 HP; each arc heals all allies 46 HP; strip all buffs from each hit"]},
     special:{name:"Divine Rebirth",upgrades:["Become divine light; emerge 4s full HP; 192 dmg+blind all 6s; heal all 160 HP+invincible 3s; revive 1 fallen 40%","Emerge 240; heal 200; revive 2","Emerge 300; heal 250; revive 2 at 50%","Emerge 375; heal 312; revive 3 at 55%","Emerge 469; heal 390; revive all at 65%; grant all +45% all stats 8s; full cleanse"]},
     unique:{name:"Divine Sovereign",upgrades:["Passive: revives endlessly; each revival: blind all 8s+heal all 350 HP+invincible 3s+revive 1 fallen 50%; light +60%; heals +55%; immune to all blind","Light +75%; heals +68%; revive 2 per revival","Light +94%; heals +84%; revive 3","Light +116%; heals +104%; revive all at 60%","Light +144%; heals +128%; revive all at 80%; Divinephoenix immune to all dmg while any ally is alive; can never be killed"]}
   },role:"Support",attackType:"Ranged",evolutionOf:"solarphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Light line 3
  {id:"holydragon",name:"Auravast",emoji:"🐲",type:"Light",rarity:"legendary",description:"A dragon born in a beam of divine light. It guards sacred places and heals anyone who approaches. Even enemies.",
   stats:{hp:135,atk:68,def:152,spd:45,abilitySpeed:48},
   abilities:{
     basic:{name:"Holy Breath",upgrades:["18 dmg cone+blind 18% 2s; heal all allies 20 HP; DEF-12% target","23 dmg; heal 26","30 dmg; heal 33","38 dmg; heal 42","Holy burst: blind all 3s; heal all 68 HP; DEF-20% all hit; cleanse 1 debuff all allies"]},
     special:{name:"Sacred Shell",upgrades:["DEF+115+blind aura 24% 7s+regen 18/s; allies take -28% dmg; immune to blind","DEF+145; allies -36%; regen 23/s","DEF+182; aura 30%; allies -46%; regen 29/s","DEF+228; allies -58%; regen 37/s","DEF+285; aura 38%; allies -72%; regen 46/s; Holydragon immune to all dmg during sacred shell; allies cleansed"]},
     unique:{name:"Holy Sovereign",upgrades:["Passive: -28 all dmg; allies regen 24/s; blind aura 28% all enemies; absorb 35% ally dmg; Holydragon immune to blind+all CC","Reduce 36; regen 30/s; aura 36%; absorb 44%","Reduce 46; regen 38/s; aura 46%; absorb 56%","Reduce 58; regen 48/s; aura 58%; absorb 70%","Reduce 72; regen 60/s; aura 72%; absorb 88%; Holydragon revives 3 times each healing all allies to full HP+granting invincible 3s"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"celestialdragon"},
  {id:"celestialdragon",name:"Lumimajor",emoji:"🐉",type:"Light",rarity:"legendary",description:"Holydragon's celestial final form. A dragon of pure starlight and divine grace. Its very presence is a blessing.",
   stats:{hp:218,atk:110,def:244,spd:72,abilitySpeed:78},
   abilities:{
     basic:{name:"Celestial Breath",upgrades:["28 dmg cone+blind 34% 3s; heal all 36 HP; DEF-22% all hit; cleanse all allies 1 debuff","36 dmg; heal 46","46 dmg; heal 58","58 dmg; heal 72","Celestial explosion: blind all 5s; heal all 115 HP; DEF-32%; cleanse all allies all debuffs; grant 1 buff each"]},
     special:{name:"Celestial Fortress",upgrades:["DEF+178+blind aura 45% 9s+regen 36/s; allies take -50% dmg; immune CC; immune blind; redirect 30% ally dmg","DEF+222; allies -62%; redirect 38%","DEF+278; aura 56%; allies -78%; redirect 48%","DEF+347; allies -96%; redirect 60%","DEF+434; aura 70%; allies immune to all dmg 2s then -80%; redirect 100%; Celestialdragon immune during fortress"]},
     unique:{name:"Celestial Sovereign",upgrades:["Passive: -44 all dmg; allies regen 44/s; blind aura 55%; absorb 55% ally dmg; immune to all CC+blind; revives 3 times each healing all allies full+blind all enemies 8s","Reduce 56; regen 56/s; aura 68%; absorb 68%","Reduce 70; regen 70/s; aura 84%; absorb 84%","Reduce 88; regen 88/s; aura 104%; absorb 104%","Reduce 110; regen 110/s; aura 130%; absorb 130%; Celestialdragon cannot be killed while any ally is alive; revives 3 times instantly each time"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"holydragon",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 1
  {id:"voidhydra",name:"Abyssmaw",emoji:"🐲",type:"Dark",rarity:"legendary",description:"A hydra that feeds on the void between stars. Each head has eaten a different constellation and is still hungry.",
   stats:{hp:98,atk:132,def:88,spd:72,abilitySpeed:44},
   abilities:{
     basic:{name:"Void Bite",upgrades:["22 dmg+silence 1.5s+drain 18 HP; each head targets different foe","28 dmg","36 dmg","46 dmg","Silence 2s; drain 26 HP; strip 2 buffs; all heads attack; drain distributes to all allies"]},
     special:{name:"Dark Regen",upgrades:["Regrow 1 head; +12% ATK+10% DEF; heal self 85 HP; release void burst 55 dmg+silence all 2s","Heal 108; burst 70","Heal 135; burst 88","Heal 168; burst 110","Heal 210; burst 138; regrow to 7 heads; also drain 40% of all enemies' HP"]},
     unique:{name:"Void Sovereign",upgrades:["Passive: regrow 1 head/7s (max 7); each head +14% ATK+12% DEF+void aura 20/s; drain aura 18/s all enemies; silence 1s every 4s per head","Head +18%+15%; aura 26/s; drain 24/s","Head +22%+18%; aura 34/s; drain 32/s","Head +28%+22%; aura 44/s; drain 42/s","Head +35%+28%; aura 56/s; drain 55/s; at 7 heads immune to all dmg 2s every 5s; revives once regrowing all heads+consuming 50% of all enemy HP"]}
   },role:"Attacker",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"nihilhydra"},
  {id:"nihilhydra",name:"Nullravene",emoji:"🐉",type:"Dark",rarity:"legendary",description:"Voidhydra's final form. The nothing between galaxies given nine heads and a purpose. The purpose is unclear. It is likely terrible.",
   stats:{hp:158,atk:212,def:142,spd:116,abilitySpeed:70},
   abilities:{
     basic:{name:"Nihil Bite",upgrades:["35 dmg+silence 2.5s+drain 35 HP; all 9 heads hit all enemies; strip 3 buffs each","44 dmg","56 dmg","70 dmg","Silence 3.5s; drain 50 HP; drain distributes to all allies; drained HP becomes permanent bonus HP"]},
     special:{name:"Annihilation Regen",upgrades:["Instant 9 heads; full HP; release void wave 120 dmg+silence all 4s+drain 40% all HP","Drain 50% HP","Drain 60% HP","Drain 72% HP","Drain 85% HP; wave also strips all buffs; heal all allies full HP; grant all invincible 2s; permanent drain aura 80/s"]},
     unique:{name:"Nihil Sovereign",upgrades:["Passive: regrow 1 head/2s; each head +42% ATK+35% DEF+void aura 68/s; drain aura 55/s all; 9 heads: immune to all dmg; silence 2s/4s per head","Head +52%+44%; aura 86/s; drain 70/s","Head +65%+55%; aura 108/s; drain 88/s","Head +80%+68%; aura 135/s; drain 110/s","Head +100%+85%; aura 170/s; drain 138/s; Nihilhydra revives 3 times each consuming 70% of all enemy HP and distributing it to all allies"]}
   },role:"Attacker",attackType:"Melee",evolutionOf:"voidhydra",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 2
  {id:"darkphoenix",name:"Umbravex",emoji:"🦅",type:"Dark",rarity:"legendary",description:"A phoenix that died in the void and came back wrong. It still heals — the void just considers it 'anti-life.'",
   stats:{hp:75,atk:138,def:55,spd:125,abilitySpeed:48},
   abilities:{
     basic:{name:"Shadow Feather",upgrades:["22 dmg+silence 1s+drain 14 HP; crit from stealth; arc 3 foes","28 dmg","36 dmg","46 dmg","Silence 1.5s; drain 20 HP; arc all; strip 1 buff per arc; drain distributes to allies"]},
     special:{name:"Void Rebirth",upgrades:["Become void; emerge 3s later full HP+stealth 4s; 110 dmg void wave+silence all 3s on emerge","Emerge 138 dmg","Emerge 172 dmg","Emerge 215 dmg","Emerge 269 dmg; silence 4s; strip all buffs; drain 30% all HP on emerge; allies healed by drain amount"]},
     unique:{name:"Dark Phoenix",upgrades:["Passive: revives endlessly (3x); each revival: stronger +38% ATK; void wave 150 dmg+silence all 5s+drain 40% HP; stealth 4s after revival","Revival +48%; wave 188 dmg; drain 50%","Revival +60%; wave 235; drain 60%","Revival +75%; wave 294; drain 72%","Revival +94%; wave 368; drain 85%; 3rd revival: permanent dark form; immune to all targeting unless attacking; always crits; silent all enemies permanently"]}
   },role:"Attacker",attackType:"Ranged",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"oblivionphoenix"},
  {id:"oblivionphoenix",name:"Nihilvour",emoji:"🌑",type:"Dark",rarity:"legendary",description:"Darkphoenix's true form. Oblivion given wings. The concept of light files a restraining order and loses.",
   stats:{hp:120,atk:222,def:88,spd:200,abilitySpeed:77},
   abilities:{
     basic:{name:"Oblivion Feather",upgrades:["35 dmg+silence 2s+drain 28 HP; always crit from stealth; arc all at 100%; drain to all allies","44 dmg","56 dmg","70 dmg","Silence 3s; drain 40 HP; strip 2 buffs per arc; stealth crits deal +80% bonus dmg"]},
     special:{name:"Oblivion Rebirth",upgrades:["Become oblivion; emerge 4s full HP+stealth 6s; 175 dmg void wave+silence all 5s+drain 50% all HP on emerge; strip all buffs","Emerge 219 dmg; drain 62%","Emerge 274 dmg; drain 76%","Emerge 342 dmg; drain 92%","Emerge 428 dmg; silence 6s; drain 100% (consume); allies gain all drained HP; revive 1 fallen 45% HP"]},
     unique:{name:"Oblivion Sovereign",upgrades:["Passive: revives endlessly; each revival: void wave 280 dmg+silence all 7s+drain 80% HP+stealth 6s; immune to all dmg+targeting between attacks; crits always deal +100% bonus dmg","Wave 350+silence 8s+drain 100%","Wave 438+silence 9s","Wave 547+10s","Wave 684+11s; Oblivionphoenix can never be permanently killed; each revival removes 1 random ability from each enemy permanently"]}
   },role:"Attacker",attackType:"Ranged",evolutionOf:"darkphoenix",shardsToAscend:30,ascensionsToEvolve:null},
  // Dark line 3
  {id:"abyssgolem",name:"Voidstone",emoji:"🗿",type:"Dark",rarity:"legendary",description:"A golem carved from solidified void. It was built as a weapon and then the abyss claimed it. Now it guards the nothing.",
   stats:{hp:152,atk:72,def:168,spd:20,abilitySpeed:32},
   abilities:{
     basic:{name:"Void Slam",upgrades:["20 dmg; silence 1.5s; drain 22 HP; attackers take 35 void+silence 1s","26 dmg","33 dmg","42 dmg","Silence 2s; drain 32 HP; attackers void 50+silence 1.5s+strip 1 buff"]},
     special:{name:"Void Ward",upgrades:["DEF+130+void aura 38/s+drain 25/s all 7s; silence all 2s; allies take -30% dmg","DEF+165; drain 32/s; allies -38%","DEF+206; drain 40/s; allies -48%; silence 3s","DEF+258; drain 50/s; allies -60%","DEF+322; drain 62/s; allies -75%; silence 4s; all drained to all allies; Abyssgolem immune during ward"]},
     unique:{name:"Void Core",upgrades:["Passive: -30 all dmg; void aura 48/s; drain aura 30/s all enemies; attackers take 60 void+silence 2s+strip 1 buff; CC immune","Reduce 38; aura 60/s; drain 38/s; attacker void 76","Reduce 48; aura 76/s; drain 48/s; void 96","Reduce 60; aura 96/s; drain 60/s; void 120","Reduce 76; aura 120/s; drain 76/s; void 150; Abyssgolem revives 3 times each consuming 40% of all enemy HP and stunning all enemies 5s"]}
   },role:"Tank",attackType:"Melee",shardsToAscend:20,ascensionsToEvolve:3,evolutionId:"nihilgolem"},
  {id:"nihilgolem",name:"Nullith",emoji:"💀",type:"Dark",rarity:"legendary",description:"Abyssgolem's final form. The end of all things wearing the shape of a golem. The void is pleased with its performance.",
   stats:{hp:244,atk:116,def:272,spd:32,abilitySpeed:50},
   abilities:{
     basic:{name:"Nihil Slam",upgrades:["32 dmg; silence 3s; drain 50 HP; attackers take 90 void+silence 2.5s+strip all buffs+lose 20% current HP","40 dmg","50 dmg","64 dmg","Silence 4s; drain 72 HP; attacker void 130+silence 3.5s+strip all+lose 30% current HP; drain to all allies"]},
     special:{name:"Nihil Ward",upgrades:["DEF+200+void aura 62/s+drain 55/s all 9s; silence all 4s; allies take -55% dmg; redirect 45% all ally dmg to Nihilgolem","DEF+250; drain 70/s; allies -68%; redirect 56%","DEF+312; drain 88/s; allies -84%; redirect 70%","DEF+390; drain 110/s; allies -104% (immune); redirect 88%","DEF+488; drain 138/s; allies immune; redirect 100%; silence 5s; immune to all dmg during ward; all drained to all allies"]},
     unique:{name:"Nihil Sovereign",upgrades:["Passive: -48 all dmg; void aura 150/s; drain aura 96/s; attackers take 120 void+silence 3s+strip all+lose 35% current HP; CC immune; absorb 65% all ally dmg","Reduce 60; aura 188/s; drain 120/s; attacker void 150+lose 44%","Reduce 76; aura 235/s; drain 150/s; void 188+lose 55%","Reduce 96; aura 295/s; drain 188/s; void 235+lose 68%","Reduce 120; aura 370/s; drain 235/s; void 295+lose 85%; Nihilgolem immune to all dmg when any ally is alive; revives 3 times each consuming 60% of all enemy max HP and distributing it to all allies"]}
   },role:"Tank",attackType:"Melee",evolutionOf:"abyssgolem",shardsToAscend:30,ascensionsToEvolve:null},
];

export const CREATURE_MAP=Object.fromEntries(CREATURES.map(c=>[c.id,c]));

// Battle-only summon; not part of the collectible roster, so it is injected
// into the map rather than living in CREATURES.
CREATURE_MAP["__vine_minion"]={id:"__vine_minion",emoji:"🌱",name:"Vine Minion",type:"Nature",attackType:"Melee",stats:{hp:80,atk:25,def:15,spd:40},abilities:{basic:{name:"Vine Whip",description:"Attacks the nearest enemy"},special:{name:"Entangle",description:"Attacks all surrounding tiles"}}};

export const FINAL_FORMS=CREATURES.filter(c=>!c.evolutionId);
export const ALL_TYPES=[...new Set(CREATURES.map(c=>c.type))].sort();
