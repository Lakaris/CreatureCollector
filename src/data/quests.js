// Quests, daily missions, battle pass, and login rewards.
// Quest entries carry check()/progress() closures that read a questState bag.
// Some of those closures look creatures up by id, hence the CREATURE_MAP import.

import { CREATURE_MAP } from "./creatures.js";

export const QUEST_TABS=[
  {id:"daily",label:"Daily",emoji:"📅"},
  {id:"general",label:"Progression",emoji:"📋"},
  {id:"creature",label:"Creature",emoji:"🐾"},
  {id:"gear",label:"Gear",emoji:"⚔️"},
  {id:"dungeon",label:"Dungeon",emoji:"🏰"},
  {id:"arena",label:"Arena",emoji:"🏟️"},
];
export const BP_PTS_PER_NODE=150;
export const DAILY_COMPLETION_REWARD={eggs:1};
export const DAILY_COMPLETION_BP=100;
export const DAILY_MISSIONS=[
  {id:"dm_login",  label:"Daily Login",           emoji:"🌅", reward:{gems:20}, points:10, check:(c,s)=>true,                                                         progress:(c,s)=>({cur:1,max:1})},
  {id:"dm_dung1",  label:"Use a Dungeon Pass",    emoji:"🏰", reward:{gems:20}, points:25, check:(c,s)=>(c.dungeonsCleared-s.dungeonsCleared)>=1,                    progress:(c,s)=>({cur:Math.min(c.dungeonsCleared-s.dungeonsCleared,1),max:1})},
  {id:"dm_boss",   label:"Fight the Daily Boss",  emoji:"👹", reward:{gems:20}, points:25, check:(c,s)=>(c.dailyBossFights-s.dailyBossFights)>=1,                    progress:(c,s)=>({cur:Math.min(c.dailyBossFights-s.dailyBossFights,1),max:1})},
  {id:"dm_farm",   label:"Grow a Plot",           emoji:"🌱", reward:{gems:20}, points:20, check:(c,s)=>(c.plotsGrown-s.plotsGrown)>=1,                              progress:(c,s)=>({cur:Math.min(c.plotsGrown-s.plotsGrown,1),max:1})},
  {id:"dm_arena",  label:"Attempt an Arena Fight",emoji:"🏟️",reward:{gems:20}, points:25, check:(c,s)=>(c.arenaFights-s.arenaFights)>=1,                            progress:(c,s)=>({cur:Math.min(c.arenaFights-s.arenaFights,1),max:1})},
  {id:"dm_banana", label:"Use a Flair Banana",    emoji:"🍌", reward:{gems:20}, points:20, check:(c,s)=>(c.bananasUsed-s.bananasUsed)>=1,                            progress:(c,s)=>({cur:Math.min(c.bananasUsed-s.bananasUsed,1),max:1})},
  {id:"dm_labyrinth",label:"Attempt a Labyrinth Fight",emoji:"🌀",reward:{gems:20},points:25, check:(c,s)=>(c.labyrinthFights-s.labyrinthFights)>=1,                  progress:(c,s)=>({cur:Math.min(c.labyrinthFights-s.labyrinthFights,1),max:1})},
  {id:"dm_harvest",label:"Harvest Field",         emoji:"🌾", reward:{gems:20}, points:20, check:(c,s)=>(c.fieldHarvests-s.fieldHarvests)>=1,                        progress:(c,s)=>({cur:Math.min(c.fieldHarvests-s.fieldHarvests,1),max:1})},
];

export const QUEST_DEFS={
  general:[
    {reward:{gems:100,food:50},quests:[
      {id:"g0a",reward:{food:20},label:"Own 5 creatures",check:s=>Object.keys(s.owned).length>=5,progress:s=>({cur:Math.min(Object.keys(s.owned).length,5),max:5})},
      {id:"g0b",reward:{gems:25},label:"Hatch 3 eggs",check:s=>s.eggsHatched>=3,progress:s=>({cur:Math.min(s.eggsHatched,3),max:3})},
      {id:"g0c",reward:{candy:5},label:"Collect 100 food",check:s=>s.currencies.food>=100,progress:s=>({cur:Math.min(s.currencies.food,100),max:100})},
    ]},
    {reward:{gems:250,candy:25},quests:[
      {id:"g1a",reward:{food:40},label:"Own 10 creatures",check:s=>Object.keys(s.owned).length>=10,progress:s=>({cur:Math.min(Object.keys(s.owned).length,10),max:10})},
      {id:"g1b",reward:{gems:50},label:"Hatch 10 eggs",check:s=>s.eggsHatched>=10,progress:s=>({cur:Math.min(s.eggsHatched,10),max:10})},
      {id:"g1c",reward:{candy:10},label:"Have 1,000 gems",check:s=>s.currencies.gems>=1000,progress:s=>({cur:Math.min(s.currencies.gems,1000),max:1000})},
    ]},
    {reward:{gems:500,food:200},quests:[
      {id:"g2a",reward:{food:80},label:"Own 20 creatures",check:s=>Object.keys(s.owned).length>=20,progress:s=>({cur:Math.min(Object.keys(s.owned).length,20),max:20})},
      {id:"g2b",reward:{gems:100},label:"Hatch 30 eggs",check:s=>s.eggsHatched>=30,progress:s=>({cur:Math.min(s.eggsHatched,30),max:30})},
      {id:"g2c",reward:{candy:20},label:"Unlock a skin",check:s=>s.unlockedSkins.length>=1,progress:s=>({cur:Math.min(s.unlockedSkins.length,1),max:1})},
    ]},
  ],
  creature:[
    {reward:{gems:100},quests:[
      {id:"c0a",reward:{food:15},label:"Own a Water type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Water"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Water")?1:0,max:1})},
      {id:"c0b",reward:{food:15},label:"Own a Wind type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Wind"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Wind")?1:0,max:1})},
      {id:"c0c",reward:{gems:20},label:"Own creatures of 3 different types",check:s=>new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size>=3,progress:s=>({cur:Math.min(new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size,3),max:3})},
    ]},
    {reward:{gems:200,candy:20},quests:[
      {id:"c1a",reward:{candy:8},label:"Own an evolved creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.evolutionOf),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.evolutionOf)?1:0,max:1})},
      {id:"c1b",reward:{gems:30},label:"Own creatures of 5 different types",check:s=>new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size>=5,progress:s=>({cur:Math.min(new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size,5),max:5})},
      {id:"c1c",reward:{food:50},label:"Own 15 creatures",check:s=>Object.keys(s.owned).length>=15,progress:s=>({cur:Math.min(Object.keys(s.owned).length,15),max:15})},
    ]},
    {reward:{gems:500},quests:[
      {id:"c2a",reward:{gems:75},label:"Own a legendary creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.rarity==="legendary"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.rarity==="legendary")?1:0,max:1})},
      {id:"c2b",reward:{candy:15},label:"Own 3 evolved creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.evolutionOf).length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.evolutionOf).length,3),max:3})},
      {id:"c2c",reward:{gems:50},label:"Own creatures of 7 different types",check:s=>new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size>=7,progress:s=>({cur:Math.min(new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size,7),max:7})},
    ]},
  ],
  gear:[
    {reward:{gems:100,equipShards:10},quests:[
      {id:"r0a",reward:{equipShards:5},label:"Collect 5 equip shards",check:s=>s.currencies.equipShards>=5,progress:s=>({cur:Math.min(s.currencies.equipShards,5),max:5})},
      {id:"r0b",reward:{equipShards:8},label:"Clear a dungeon",check:s=>s.dungeonsCleared>=1,progress:s=>({cur:Math.min(s.dungeonsCleared,1),max:1})},
      {id:"r0c",reward:{gems:20},label:"Equip an item on a creature",check:s=>Object.values(s.owned).some(o=>o.equipped&&o.equipped.some(Boolean)),progress:s=>({cur:Object.values(s.owned).some(o=>o.equipped&&o.equipped.some(Boolean))?1:0,max:1})},
    ]},
    {reward:{gems:200,equipShards:25},quests:[
      {id:"r1a",reward:{equipShards:15},label:"Collect 30 equip shards",check:s=>s.currencies.equipShards>=30,progress:s=>({cur:Math.min(s.currencies.equipShards,30),max:30})},
      {id:"r1b",reward:{gems:30},label:"Equip items on 3 creatures",check:s=>Object.values(s.owned).filter(o=>o.equipped&&o.equipped.some(Boolean)).length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>o.equipped&&o.equipped.some(Boolean)).length,3),max:3})},
      {id:"r1c",reward:{equipShards:10},label:"Clear 5 dungeons",check:s=>s.dungeonsCleared>=5,progress:s=>({cur:Math.min(s.dungeonsCleared,5),max:5})},
    ]},
    {reward:{gems:400,equipShards:50},quests:[
      {id:"r2a",reward:{equipShards:25},label:"Collect 100 equip shards",check:s=>s.currencies.equipShards>=100,progress:s=>({cur:Math.min(s.currencies.equipShards,100),max:100})},
      {id:"r2b",reward:{gems:50},label:"Equip items on 5 creatures",check:s=>Object.values(s.owned).filter(o=>o.equipped&&o.equipped.some(Boolean)).length>=5,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>o.equipped&&o.equipped.some(Boolean)).length,5),max:5})},
      {id:"r2c",reward:{equipShards:20},label:"Clear 15 dungeons",check:s=>s.dungeonsCleared>=15,progress:s=>({cur:Math.min(s.dungeonsCleared,15),max:15})},
    ]},
  ],
  dungeon:[
    {reward:{gems:100,dungeonPass:5},quests:[
      {id:"d0a",reward:{dungeonPass:2},label:"Clear 1 dungeon",check:s=>s.dungeonsCleared>=1,progress:s=>({cur:Math.min(s.dungeonsCleared,1),max:1})},
      {id:"d0b",reward:{gems:25},label:"Clear 5 dungeons",check:s=>s.dungeonsCleared>=5,progress:s=>({cur:Math.min(s.dungeonsCleared,5),max:5})},
      {id:"d0c",reward:{dungeonPass:3},label:"Have 10 dungeon passes at once",check:s=>s.currencies.dungeonPass>=10,progress:s=>({cur:Math.min(s.currencies.dungeonPass,10),max:10})},
    ]},
    {reward:{gems:250,dungeonPass:10},quests:[
      {id:"d1a",reward:{gems:50},label:"Clear 20 dungeons",check:s=>s.dungeonsCleared>=20,progress:s=>({cur:Math.min(s.dungeonsCleared,20),max:20})},
      {id:"d1b",reward:{gems:100},label:"Clear 50 dungeons",check:s=>s.dungeonsCleared>=50,progress:s=>({cur:Math.min(s.dungeonsCleared,50),max:50})},
      {id:"d1c",reward:{dungeonPass:5},label:"Have 25 dungeon passes at once",check:s=>s.currencies.dungeonPass>=25,progress:s=>({cur:Math.min(s.currencies.dungeonPass,25),max:25})},
    ]},
    {reward:{gems:600,dungeonPass:20},quests:[
      {id:"d2a",reward:{gems:150},label:"Clear 100 dungeons",check:s=>s.dungeonsCleared>=100,progress:s=>({cur:Math.min(s.dungeonsCleared,100),max:100})},
      {id:"d2b",reward:{gems:250},label:"Clear 200 dungeons",check:s=>s.dungeonsCleared>=200,progress:s=>({cur:Math.min(s.dungeonsCleared,200),max:200})},
      {id:"d2c",reward:{dungeonPass:8},label:"Have 30 dungeon passes at once",check:s=>s.currencies.dungeonPass>=30,progress:s=>({cur:Math.min(s.currencies.dungeonPass,30),max:30})},
    ]},
  ],
  arena:[
    {reward:{gems:100},quests:[
      {id:"a0a",reward:{gems:20},label:"Win 1 arena battle",check:s=>Object.values(s.arenaProgress).some(v=>v>1),progress:s=>({cur:Object.values(s.arenaProgress).some(v=>v>1)?1:0,max:1})},
      {id:"a0b",reward:{gems:35},label:"Reach battle 5 in any arena",check:s=>Object.values(s.arenaProgress).some(v=>v>=5),progress:s=>({cur:Math.min(Math.max(...Object.values(s.arenaProgress)),5),max:5})},
      {id:"a0c",reward:{gems:60},label:"Reach battle 10 in any arena",check:s=>Object.values(s.arenaProgress).some(v=>v>=10),progress:s=>({cur:Math.min(Math.max(...Object.values(s.arenaProgress)),10),max:10})},
    ]},
    {reward:{gems:250},quests:[
      {id:"a1a",reward:{gems:80},label:"Reach arena level 2",check:s=>Object.values(s.arenaLevels).some(v=>v>=2),progress:s=>({cur:Object.values(s.arenaLevels).some(v=>v>=2)?1:0,max:1})},
      {id:"a1b",reward:{gems:50},label:"Win battles in 3 different arenas",check:s=>Object.values(s.arenaProgress).filter(v=>v>1).length>=3,progress:s=>({cur:Math.min(Object.values(s.arenaProgress).filter(v=>v>1).length,3),max:3})},
      {id:"a1c",reward:{gems:60},label:"Reach battle 8 in 2 arenas",check:s=>Object.values(s.arenaProgress).filter(v=>v>=8).length>=2,progress:s=>({cur:Math.min(Object.values(s.arenaProgress).filter(v=>v>=8).length,2),max:2})},
    ]},
    {reward:{gems:500},quests:[
      {id:"a2a",reward:{gems:150},label:"Reach arena level 3",check:s=>Object.values(s.arenaLevels).some(v=>v>=3),progress:s=>({cur:Object.values(s.arenaLevels).some(v=>v>=3)?1:0,max:1})},
      {id:"a2b",reward:{gems:100},label:"Reach level 2 in 3 arenas",check:s=>Object.values(s.arenaLevels).filter(v=>v>=2).length>=3,progress:s=>({cur:Math.min(Object.values(s.arenaLevels).filter(v=>v>=2).length,3),max:3})},
      {id:"a2c",reward:{gems:120},label:"Win battles in all 5 arenas",check:s=>Object.values(s.arenaProgress).filter(v=>v>1).length>=5,progress:s=>({cur:Math.min(Object.values(s.arenaProgress).filter(v=>v>1).length,5),max:5})},
    ]},
  ],
};

export const REWARD_LABELS={gems:"💎 Gems",food:"🍖 Food",candy:"🍬 Candy",equipShards:"⚔️ Gear Shards",dungeonPass:"🎫 Dungeon Passes",egg:"🥚 Egg",eggs:"🥚 Egg",battlepassPoints:"🎫 Pass Points",flairBanana:"🍌 Flair Banana",mythicalFlairBanana:"🍌✨ Mythical Flair Banana",ancientFlairBanana:"🍌⭐ Ancient Flair Banana",rainbowMelon:"🍈 Rainbow Melon",ascensionMelon:"🍈 Ascension Melon",legendaryEgg:"🌟 Legendary Egg",ancientFertilizer:"🪴 Ancient Fertilizer"};
export const REWARD_DESC={
  gems:"A powerful currency with many uses",
  food:"Used to level up Creatures.",
  candy:"Used to unlock Skins.",
  equipShards:"Used to upgrade Gear.",
  dungeonPass:"Used to enter Dungeons.",
  egg:"Used to hatch Creatures.",
  eggs:"Used to hatch Creatures.",
  battlepassPoints:"Used to progress the Battle Pass.",
  flairBanana:"Used to unlock Flairs.",
  mythicalFlairBanana:"Used to unlock Rare and higher rarity Flairs.",
  ancientFlairBanana:"Used to unlock Epic and higher rarity Flairs.",
  rainbowMelon:"A colorful melon with special properties.",
  ascensionMelon:"Used to ascend your Creatures to a higher form.",
  legendaryEgg:"Used to hatch powerful Creatures.",
  legendaryEggs:"Used to hatch powerful Legendary Creatures.",
  mysteriousOre:"Used to unlock cosmetic skins for your Creatures.",
  deluxeOre:"Used to unlock rare and epic skins for your Creatures.",
  candy:"Used to unlock Skins.",
  ancientFertilizer:"Used to upgrade your Main Field, boosting its Food/Gear Shard rates.",
};

export const DAILY_REWARDS=[
  {day:1,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:2,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:3,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:4,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:5,label:"5 Flair Banana",emoji:"🍌",reward:{flairBanana:5}},
  {day:6,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:7,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:8,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:9,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:10,label:"1 Rainbow Melon",emoji:"🍈",reward:{rainbowMelon:1}},
  {day:11,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:12,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:13,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:14,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:15,label:"1 Mythical Flair Banana",emoji:"🍌✨",reward:{mythicalFlairBanana:1}},
  {day:16,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:17,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:18,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:19,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:20,label:"3 Ascension Melon",emoji:"🍈",reward:{ascensionMelon:3}},
  {day:21,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:22,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:23,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:24,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:25,label:"1 Ancient Flair Banana",emoji:"🍌⭐",reward:{ancientFlairBanana:1}},
  {day:26,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:27,label:"50 Food",emoji:"🍖",reward:{food:50}},
  {day:28,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:29,label:"10 Gear Shards",emoji:"⚔️",reward:{equipShards:10}},
  {day:30,label:"1 Legendary Egg",emoji:"🌟",reward:{legendaryEggs:1}},
];

export const BATTLEPASS_MISSIONS=[
  {label:"Hatch 1 egg",           check:s=>s.eggsHatched>=1},
  {label:"Hatch 3 eggs",          check:s=>s.eggsHatched>=3},
  {label:"Clear 1 dungeon",       check:s=>s.dungeonsCleared>=1},
  {label:"Hatch 5 eggs",          check:s=>s.eggsHatched>=5},
  {label:"Earn 10 gear shards",   check:s=>(s.currencies.equipShards||0)>=10},
  {label:"Clear 3 dungeons",      check:s=>s.dungeonsCleared>=3},
  {label:"Hatch 8 eggs",          check:s=>s.eggsHatched>=8},
  {label:"Earn 50 gear shards",   check:s=>(s.currencies.equipShards||0)>=50},
  {label:"Clear 5 dungeons",      check:s=>s.dungeonsCleared>=5},
  {label:"Hatch 12 eggs",         check:s=>s.eggsHatched>=12},
  {label:"Reach Arena rank 5",    check:s=>Math.max(0,...Object.values(s.arenaProgress||{}))>=5},
  {label:"Earn 100 gear shards",  check:s=>(s.currencies.equipShards||0)>=100},
  {label:"Clear 8 dungeons",      check:s=>s.dungeonsCleared>=8},
  {label:"Hatch 20 eggs",         check:s=>s.eggsHatched>=20},
  {label:"Reach Arena rank 10",   check:s=>Math.max(0,...Object.values(s.arenaProgress||{}))>=10},
  {label:"Earn 200 gear shards",  check:s=>(s.currencies.equipShards||0)>=200},
  {label:"Clear 12 dungeons",     check:s=>s.dungeonsCleared>=12},
  {label:"Hatch 30 eggs",         check:s=>s.eggsHatched>=30},
  {label:"Reach Arena rank 15",   check:s=>Math.max(0,...Object.values(s.arenaProgress||{}))>=15},
  {label:"Earn 500 gear shards",  check:s=>(s.currencies.equipShards||0)>=500},
  {label:"Clear 15 dungeons",     check:s=>s.dungeonsCleared>=15},
  {label:"Hatch 40 eggs",         check:s=>s.eggsHatched>=40},
  {label:"Reach Arena rank 20",   check:s=>Math.max(0,...Object.values(s.arenaProgress||{}))>=20},
  {label:"Earn 1000 gear shards", check:s=>(s.currencies.equipShards||0)>=1000},
  {label:"Clear 20 dungeons",     check:s=>s.dungeonsCleared>=20},
  {label:"Hatch 50 eggs",         check:s=>s.eggsHatched>=50},
  {label:"Reach Arena rank 25",   check:s=>Math.max(0,...Object.values(s.arenaProgress||{}))>=25},
  {label:"Earn 2000 gear shards", check:s=>(s.currencies.equipShards||0)>=2000},
  {label:"Clear 30 dungeons",     check:s=>s.dungeonsCleared>=30},
  {label:"Hatch 60 eggs",         check:s=>s.eggsHatched>=60},
];

export const DAILY_POOL=DAILY_MISSIONS.filter(m=>m.id!=="dm_login");
