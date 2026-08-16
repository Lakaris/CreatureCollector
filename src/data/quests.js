// Quests, daily missions, battle pass, and login rewards.
// Quest entries carry check()/progress() closures that read a questState bag.
// Some of those closures look creatures up by id, hence the CREATURE_MAP import.

import { CREATURE_MAP } from "./creatures.js";
import { FIELD_RATES, FIELD_SHARD_RATES } from "./farm.js";
import { EQUIPMENT_DEFS } from "./equipment.js";

const RARE_EQUIP_IDS=EQUIPMENT_DEFS.filter(e=>e.rarity==="rare").map(e=>e.id);
const COMMON_EQUIP_IDS=EQUIPMENT_DEFS.filter(e=>e.rarity==="common").map(e=>e.id);

export const QUEST_TABS=[
  {id:"general",label:"Progression",emoji:"📋"},
  {id:"daily",label:"Daily",emoji:"📅"},
  {id:"creature",label:"Creature",emoji:"🐾"},
  {id:"gear",label:"Gear",emoji:"⚔️"},
  {id:"dungeon",label:"Dungeon",emoji:"🏰"},
  {id:"arena",label:"Arena",emoji:"🏟️"},
];
export const BP_PTS_PER_NODE=100;
export const DAILY_COMPLETION_REWARD={eggs:1};
export const DAILY_COMPLETION_BP=100;
export const DAILY_MISSIONS=[
  {id:"dm_login",  label:"Daily Login",           emoji:"🌅", reward:{gems:20}, points:10, check:(c,s)=>true,                                                         progress:(c,s)=>({cur:1,max:1})},
  {id:"dm_dung1",  label:"Use a Dungeon Pass",    emoji:"🏰", reward:{gems:20}, points:25, check:(c,s)=>(c.dungeonsCleared-s.dungeonsCleared)>=1,                    progress:(c,s)=>({cur:Math.min(c.dungeonsCleared-s.dungeonsCleared,1),max:1}), nav:"dungeon"},
  {id:"dm_boss",   label:"Fight the Daily Boss",  emoji:"👹", reward:{gems:20}, points:25, check:(c,s)=>(c.dailyBossFights-s.dailyBossFights)>=1,                    progress:(c,s)=>({cur:Math.min(c.dailyBossFights-s.dailyBossFights,1),max:1}), nav:"dailyboss"},
  {id:"dm_farm",   label:"Grow a Plot",           emoji:"🌱", reward:{gems:20}, points:20, check:(c,s)=>(c.plotsGrown-s.plotsGrown)>=1,                              progress:(c,s)=>({cur:Math.min(c.plotsGrown-s.plotsGrown,1),max:1}), nav:"plots"},
  {id:"dm_arena",  label:"Attempt an Arena Fight",emoji:"🏟️",reward:{gems:20}, points:25, check:(c,s)=>(c.arenaFights-s.arenaFights)>=1,                            progress:(c,s)=>({cur:Math.min(c.arenaFights-s.arenaFights,1),max:1}), nav:"arena"},
  {id:"dm_banana", label:"Use a Flair Banana",    emoji:"🍌", reward:{gems:20}, points:20, check:(c,s)=>(c.bananasUsed-s.bananasUsed)>=1,                            progress:(c,s)=>({cur:Math.min(c.bananasUsed-s.bananasUsed,1),max:1}), nav:"collection"},
  {id:"dm_labyrinth",label:"Attempt a Labyrinth Fight",emoji:"🌀",reward:{gems:20},points:25, check:(c,s)=>(c.labyrinthFights-s.labyrinthFights)>=1,                  progress:(c,s)=>({cur:Math.min(c.labyrinthFights-s.labyrinthFights,1),max:1}), nav:"labyrinth"},
  {id:"dm_harvest",label:"Harvest Field",         emoji:"🌾", reward:{gems:20}, points:20, check:(c,s)=>(c.fieldHarvests-s.fieldHarvests)>=1,                        progress:(c,s)=>({cur:Math.min(c.fieldHarvests-s.fieldHarvests,1),max:1}), nav:"farm"},
  {id:"dm_hatch",  label:"Hatch an Egg",          emoji:"🥚", reward:{gems:20}, points:20, check:(c,s)=>(c.eggsHatched-s.eggsHatched)>=1,                            progress:(c,s)=>({cur:Math.min(c.eggsHatched-s.eggsHatched,1),max:1}), nav:"hatch"},
  {id:"dm_petlvl", label:"Level Up a Creature",   emoji:"⬆️", reward:{gems:20}, points:20, check:(c,s)=>(c.petLevelUps-s.petLevelUps)>=1,                            progress:(c,s)=>({cur:Math.min(c.petLevelUps-s.petLevelUps,1),max:1}), nav:"collection"},
  {id:"dm_equiplvl",label:"Upgrade a Piece of Gear",emoji:"🔧",reward:{gems:20}, points:20, check:(c,s)=>(c.equipLevelUps-s.equipLevelUps)>=1,                        progress:(c,s)=>({cur:Math.min(c.equipLevelUps-s.equipLevelUps,1),max:1}), nav:"equipment"},
];

export const QUEST_DEFS={
  general:[
    {reward:{legendaryEggs:1,dungeons:1,dailyBoss:1},quests:[
      {id:"g0a",reward:{eggs:1},label:"Hatch 10 eggs",check:s=>s.eggsHatched>=10,progress:s=>({cur:Math.min(s.eggsHatched,10),max:10}),nav:"hatch"},
      {id:"g0b",reward:{flairBanana:1},label:"Use 1 Flair Banana",check:s=>s.bananasUsed>=1,progress:s=>({cur:Math.min(s.bananasUsed,1),max:1}),nav:"collection"},
      {id:"g0c",reward:{com_hp_atk2:1,com_hp_def2:1,com_hp_def:1,com_atk_def2:1,com_atk_def:1},label:"Complete all Daily Quests",check:s=>!!s.everCompletedDailyQuests,progress:s=>({cur:s.everCompletedDailyQuests?1:0,max:1}),nav:"dailyTab"},
      {id:"g0d",reward:{food:100},label:"Level up 5 creatures to level 2",check:s=>Object.values(s.owned).filter(o=>o.level>=2).length>=5,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>o.level>=2).length,5),max:5}),nav:"collection"},
      {id:"g0e",reward:{equipShards:100},label:"Level up equipment 5 times",check:s=>s.equipLevelUps>=5,progress:s=>({cur:Math.min(s.equipLevelUps,5),max:5}),nav:"equipment"},
      {id:"g0f",reward:{eggs:1},label:"Complete Floor 30 of the Labyrinth",check:s=>(s.labyrinthBestDepth||1)>=31,progress:s=>({cur:Math.min((s.labyrinthBestDepth||1)-1,30),max:30}),nav:"labyrinth"},
      {id:"g0g",reward:{eggs:1},label:"Use 1 Ancient Fertilizer",check:s=>(s.fertilizerUsed||0)>=1,progress:s=>({cur:Math.min(s.fertilizerUsed||0,1),max:1}),nav:"farm"},
    ]},
    {reward:{plots:1},quests:[
      {id:"g1_boss",reward:{eggs:1},label:"Fight the Daily Boss",check:s=>s.dailyBossFights>=1,progress:s=>({cur:Math.min(s.dailyBossFights,1),max:1}),nav:"dailyboss"},
      {id:"g1_dungeon",reward:{dungeonPass:5},label:"Clear 1 dungeon",check:s=>s.dungeonsCleared>=1,progress:s=>({cur:Math.min(s.dungeonsCleared,1),max:1}),nav:"dungeon"},
      {id:"g1_autofight",reward:{dungeonPass:10},label:"Auto Fight 10 times",check:s=>(s.dungeonAutoFights||0)>=10,progress:s=>({cur:Math.min(s.dungeonAutoFights||0,10),max:10}),nav:"dungeon"},
      {id:"g1_petlvl",reward:{food:1000},label:"Level up creatures 10 times",check:s=>s.petLevelUps>=10,progress:s=>({cur:Math.min(s.petLevelUps,10),max:10}),nav:"collection"},
      {id:"g1_equiplvl",reward:{equipShards:1000},label:"Level up equipment 10 times",check:s=>s.equipLevelUps>=10,progress:s=>({cur:Math.min(s.equipLevelUps,10),max:10}),nav:"equipment"},
    ]},
    {reward:{gems:500,food:200,treasure:1,arena:1},quests:[
      {id:"g2_arena_all",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 3 of the Arena",check:s=>(s.arenaLevels?.all||1)>=4,progress:s=>({cur:(s.arenaLevels?.all||1)>=4?1:0,max:1}),nav:"arena",navArena:"all"},
      {id:"g2_arena_fire",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Fire Arena",check:s=>(s.arenaLevels?.fire||1)>=3,progress:s=>({cur:(s.arenaLevels?.fire||1)>=3?1:0,max:1}),nav:"arena",navArena:"fire"},
      {id:"g2_arena_nature",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Nature Arena",check:s=>(s.arenaLevels?.nature||1)>=3,progress:s=>({cur:(s.arenaLevels?.nature||1)>=3?1:0,max:1}),nav:"arena",navArena:"nature"},
      {id:"g2_arena_earth",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Earth Arena",check:s=>(s.arenaLevels?.earth||1)>=3,progress:s=>({cur:(s.arenaLevels?.earth||1)>=3?1:0,max:1}),nav:"arena",navArena:"earth"},
      {id:"g2_arena_electric",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Electric Arena",check:s=>(s.arenaLevels?.electric||1)>=3,progress:s=>({cur:(s.arenaLevels?.electric||1)>=3?1:0,max:1}),nav:"arena",navArena:"electric"},
      {id:"g2_arena_water",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Water Arena",check:s=>(s.arenaLevels?.ice||1)>=3,progress:s=>({cur:(s.arenaLevels?.ice||1)>=3?1:0,max:1}),nav:"arena",navArena:"ice"},
      {id:"g2_arena_light",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Light Arena",check:s=>(s.arenaLevels?.light||1)>=3,progress:s=>({cur:(s.arenaLevels?.light||1)>=3?1:0,max:1}),nav:"arena",navArena:"light"},
      {id:"g2_arena_dark",reward:{ascensionMelon:1},label:"Complete Stage 10 Level 2 of the Dark Arena",check:s=>(s.arenaLevels?.dark||1)>=3,progress:s=>({cur:(s.arenaLevels?.dark||1)>=3?1:0,max:1}),nav:"arena",navArena:"dark"},
      {id:"g2_candy",reward:{candy:10},label:"Use a Candy",check:s=>s.candyUsed>=1,progress:s=>({cur:Math.min(s.candyUsed,1),max:1}),nav:"candyGuide"},
    ]},
  ],
  creature:[
    {reward:{gems:100},quests:[
      {id:"c0a",reward:{eggs:2},label:"Own a Fire type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Fire"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Fire")?1:0,max:1}),nav:"hatch"},
      {id:"c0b",reward:{eggs:2},label:"Own a Water type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Water"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Water")?1:0,max:1}),nav:"hatch"},
      {id:"c0c",reward:{eggs:2},label:"Own a Nature type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Nature"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Nature")?1:0,max:1}),nav:"hatch"},
      {id:"c0d",reward:{eggs:2},label:"Own an Earth type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Earth"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Earth")?1:0,max:1}),nav:"hatch"},
      {id:"c0e",reward:{eggs:2},label:"Own a Wind type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Wind"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Wind")?1:0,max:1}),nav:"hatch"},
      {id:"c0f",reward:{eggs:2},label:"Own an Electric type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Electric"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Electric")?1:0,max:1}),nav:"hatch"},
      {id:"c0g",reward:{eggs:2},label:"Own a Light type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Light"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Light")?1:0,max:1}),nav:"hatch"},
      {id:"c0h",reward:{eggs:2},label:"Own a Dark type creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Dark"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.type==="Dark")?1:0,max:1}),nav:"hatch"},
    ]},
    {reward:{gems:200,candy:20},quests:[
      {id:"c1_ascend",reward:{ascensionMelon:5},label:"Ascend a Creature",check:s=>Object.values(s.owned).some(o=>(o.ascensions||0)>=1),progress:s=>({cur:Object.values(s.owned).some(o=>(o.ascensions||0)>=1)?1:0,max:1}),nav:"collection"},
      {id:"c1_fire",reward:{eggs:2},label:"Own 3 Fire type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Fire").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Fire").length,3),max:3}),nav:"hatch"},
      {id:"c1_water",reward:{eggs:2},label:"Own 3 Water type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Water").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Water").length,3),max:3}),nav:"hatch"},
      {id:"c1_nature",reward:{eggs:2},label:"Own 3 Nature type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Nature").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Nature").length,3),max:3}),nav:"hatch"},
      {id:"c1_earth",reward:{eggs:2},label:"Own 3 Earth type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Earth").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Earth").length,3),max:3}),nav:"hatch"},
      {id:"c1_wind",reward:{eggs:2},label:"Own 3 Wind type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Wind").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Wind").length,3),max:3}),nav:"hatch"},
      {id:"c1_electric",reward:{eggs:2},label:"Own 3 Electric type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Electric").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Electric").length,3),max:3}),nav:"hatch"},
      {id:"c1_light",reward:{eggs:2},label:"Own 3 Light type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Light").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Light").length,3),max:3}),nav:"hatch"},
      {id:"c1_dark",reward:{eggs:2},label:"Own 3 Dark type creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Dark").length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.type==="Dark").length,3),max:3}),nav:"hatch"},
    ]},
    {reward:{gems:500},quests:[
      {id:"c2a",reward:{gems:75},label:"Own a legendary creature",check:s=>Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.rarity==="legendary"),progress:s=>({cur:Object.values(s.owned).some(o=>CREATURE_MAP[o.id]?.rarity==="legendary")?1:0,max:1})},
      {id:"c2b",reward:{candy:15},label:"Own 3 evolved creatures",check:s=>Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.evolutionOf).length>=3,progress:s=>({cur:Math.min(Object.values(s.owned).filter(o=>CREATURE_MAP[o.id]?.evolutionOf).length,3),max:3})},
      {id:"c2c",reward:{gems:50},label:"Own creatures of 7 different types",check:s=>new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size>=7,progress:s=>({cur:Math.min(new Set(Object.values(s.owned).map(o=>CREATURE_MAP[o.id]?.type).filter(Boolean)).size,7),max:7})},
    ]},
  ],
  gear:[
    {reward:{gems:100,equipShards:10},quests:[
      {id:"r0d",reward:{equipShards:500},label:"Upgrade 5 equipment to level 3",check:s=>Object.keys(s.equipmentLevels||{}).filter(id=>(s.equipmentLevels[id]||1)>=3).length>=5,progress:s=>({cur:Math.min(Object.keys(s.equipmentLevels||{}).filter(id=>(s.equipmentLevels[id]||1)>=3).length,5),max:5}),nav:"equipment"},
      {id:"r0e",reward:{eggs:5},label:"Obtain 5 Rare equipment",check:s=>RARE_EQUIP_IDS.filter(id=>(s.equipmentCopies?.[id]||0)>0).length>=5,progress:s=>({cur:Math.min(RARE_EQUIP_IDS.filter(id=>(s.equipmentCopies?.[id]||0)>0).length,5),max:5}),nav:"dungeon"},
      {id:"r0f",reward:{eggs:5},label:"Obtain all common equipment",check:s=>COMMON_EQUIP_IDS.every(id=>(s.equipmentCopies?.[id]||0)>0),progress:s=>({cur:COMMON_EQUIP_IDS.filter(id=>(s.equipmentCopies?.[id]||0)>0).length,max:COMMON_EQUIP_IDS.length}),nav:"dungeon"},
      {id:"r0g",reward:{equipShards:500},label:"Equip 5 pieces of equipment to creatures",check:s=>Object.values(s.owned).reduce((n,o)=>n+(o.equipped?o.equipped.filter(Boolean).length:0),0)>=5,progress:s=>({cur:Math.min(Object.values(s.owned).reduce((n,o)=>n+(o.equipped?o.equipped.filter(Boolean).length:0),0),5),max:5}),nav:"collection"},
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
      {id:"g1_fire",reward:{dungeonPass:5},label:"Defeat the Level 1 Fire Boss",check:s=>(s.dungeonBossLevels?.fire||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.fire||1)-1,1),max:1}),nav:"dungeon",navBoss:"fire"},
      {id:"g1_nature",reward:{dungeonPass:5},label:"Defeat the Level 1 Nature Boss",check:s=>(s.dungeonBossLevels?.nature||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.nature||1)-1,1),max:1}),nav:"dungeon",navBoss:"nature"},
      {id:"g1_earth",reward:{dungeonPass:5},label:"Defeat the Level 1 Earth Boss",check:s=>(s.dungeonBossLevels?.earth||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.earth||1)-1,1),max:1}),nav:"dungeon",navBoss:"earth"},
      {id:"g1_electric",reward:{dungeonPass:5},label:"Defeat the Level 1 Electric Boss",check:s=>(s.dungeonBossLevels?.electric||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.electric||1)-1,1),max:1}),nav:"dungeon",navBoss:"electric"},
      {id:"g1_water",reward:{dungeonPass:5},label:"Defeat the Level 1 Water Boss",check:s=>(s.dungeonBossLevels?.water||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.water||1)-1,1),max:1}),nav:"dungeon",navBoss:"water"},
      {id:"g1_light",reward:{dungeonPass:5},label:"Defeat the Level 1 Light Boss",check:s=>(s.dungeonBossLevels?.light||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.light||1)-1,1),max:1}),nav:"dungeon",navBoss:"light"},
      {id:"g1_dark",reward:{dungeonPass:5},label:"Defeat the Level 1 Dark Boss",check:s=>(s.dungeonBossLevels?.dark||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.dark||1)-1,1),max:1}),nav:"dungeon",navBoss:"dark"},
      {id:"g1_wind",reward:{dungeonPass:5},label:"Defeat the Level 1 Wind Boss",check:s=>(s.dungeonBossLevels?.wind||1)>=2,progress:s=>({cur:Math.min((s.dungeonBossLevels?.wind||1)-1,1),max:1}),nav:"dungeon",navBoss:"wind"},
    ]},
    {reward:{gems:250,dungeonPass:10},quests:[
      {id:"g2_fire",reward:{legendaryEggs:1},label:"Defeat the Level 3 Fire Boss",check:s=>(s.dungeonBossLevels?.fire||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.fire||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"fire"},
      {id:"g2_nature",reward:{legendaryEggs:1},label:"Defeat the Level 3 Nature Boss",check:s=>(s.dungeonBossLevels?.nature||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.nature||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"nature"},
      {id:"g2_earth",reward:{legendaryEggs:1},label:"Defeat the Level 3 Earth Boss",check:s=>(s.dungeonBossLevels?.earth||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.earth||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"earth"},
      {id:"g2_electric",reward:{legendaryEggs:1},label:"Defeat the Level 3 Electric Boss",check:s=>(s.dungeonBossLevels?.electric||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.electric||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"electric"},
      {id:"g2_water",reward:{legendaryEggs:1},label:"Defeat the Level 3 Water Boss",check:s=>(s.dungeonBossLevels?.water||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.water||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"water"},
      {id:"g2_light",reward:{legendaryEggs:1},label:"Defeat the Level 3 Light Boss",check:s=>(s.dungeonBossLevels?.light||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.light||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"light"},
      {id:"g2_dark",reward:{legendaryEggs:1},label:"Defeat the Level 3 Dark Boss",check:s=>(s.dungeonBossLevels?.dark||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.dark||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"dark"},
      {id:"g2_wind",reward:{legendaryEggs:1},label:"Defeat the Level 3 Wind Boss",check:s=>(s.dungeonBossLevels?.wind||1)>=4,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.wind||1)-3,0),1),max:1}),nav:"dungeon",navBoss:"wind"},
    ]},
    {reward:{gems:400,dungeonPass:15},quests:[
      {id:"g3_fire",reward:{legendaryEggs:1},label:"Defeat the Level 7 Fire Boss",check:s=>(s.dungeonBossLevels?.fire||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.fire||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"fire"},
      {id:"g3_nature",reward:{legendaryEggs:1},label:"Defeat the Level 7 Nature Boss",check:s=>(s.dungeonBossLevels?.nature||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.nature||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"nature"},
      {id:"g3_earth",reward:{legendaryEggs:1},label:"Defeat the Level 7 Earth Boss",check:s=>(s.dungeonBossLevels?.earth||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.earth||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"earth"},
      {id:"g3_electric",reward:{legendaryEggs:1},label:"Defeat the Level 7 Electric Boss",check:s=>(s.dungeonBossLevels?.electric||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.electric||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"electric"},
      {id:"g3_water",reward:{legendaryEggs:1},label:"Defeat the Level 7 Water Boss",check:s=>(s.dungeonBossLevels?.water||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.water||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"water"},
      {id:"g3_light",reward:{legendaryEggs:1},label:"Defeat the Level 7 Light Boss",check:s=>(s.dungeonBossLevels?.light||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.light||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"light"},
      {id:"g3_dark",reward:{legendaryEggs:1},label:"Defeat the Level 7 Dark Boss",check:s=>(s.dungeonBossLevels?.dark||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.dark||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"dark"},
      {id:"g3_wind",reward:{legendaryEggs:1},label:"Defeat the Level 7 Wind Boss",check:s=>(s.dungeonBossLevels?.wind||1)>=8,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.wind||1)-7,0),1),max:1}),nav:"dungeon",navBoss:"wind"},
    ]},
    {reward:{gems:600,dungeonPass:20},quests:[
      {id:"g4_fire",reward:{legendaryEggs:1},label:"Defeat the Level 10 Fire Boss",check:s=>(s.dungeonBossLevels?.fire||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.fire||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"fire"},
      {id:"g4_nature",reward:{legendaryEggs:1},label:"Defeat the Level 10 Nature Boss",check:s=>(s.dungeonBossLevels?.nature||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.nature||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"nature"},
      {id:"g4_earth",reward:{legendaryEggs:1},label:"Defeat the Level 10 Earth Boss",check:s=>(s.dungeonBossLevels?.earth||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.earth||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"earth"},
      {id:"g4_electric",reward:{legendaryEggs:1},label:"Defeat the Level 10 Electric Boss",check:s=>(s.dungeonBossLevels?.electric||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.electric||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"electric"},
      {id:"g4_water",reward:{legendaryEggs:1},label:"Defeat the Level 10 Water Boss",check:s=>(s.dungeonBossLevels?.water||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.water||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"water"},
      {id:"g4_light",reward:{legendaryEggs:1},label:"Defeat the Level 10 Light Boss",check:s=>(s.dungeonBossLevels?.light||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.light||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"light"},
      {id:"g4_dark",reward:{legendaryEggs:1},label:"Defeat the Level 10 Dark Boss",check:s=>(s.dungeonBossLevels?.dark||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.dark||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"dark"},
      {id:"g4_wind",reward:{legendaryEggs:1},label:"Defeat the Level 10 Wind Boss",check:s=>(s.dungeonBossLevels?.wind||1)>=11,progress:s=>({cur:Math.min(Math.max((s.dungeonBossLevels?.wind||1)-10,0),1),max:1}),nav:"dungeon",navBoss:"wind"},
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

export const REWARD_LABELS={gems:"💎 Gems",food:"🍖 Food",candy:"🍬 Candy",equipShards:"⚔️ Gear Shards",dungeonPass:"🎫 Dungeon Passes",egg:"🥚 Egg",eggs:"🥚 Egg",battlepassPoints:"🎫 Pass Points",flairBanana:"🍌 Flair Banana",mythicalFlairBanana:"🍌✨ Mythical Flair Banana",ancientFlairBanana:"🍌⭐ Ancient Flair Banana",melonRainbow:"🍈 Rainbow Melon",ascensionMelon:"🍈 Legendary Ascension Melon",ascensionMelonCommon:"🍈⚪ Common Ascension Melon",ascensionMelonRare:"🍈🔵 Rare Ascension Melon",ascensionMelonEpic:"🍈🟣 Epic Ascension Melon",legendaryEgg:"🌟 Legendary Egg",legendaryEggs:"🌟 Legendary Egg",ancientFertilizer:"🪴 Ancient Fertilizer",plots:"🌾 Plots",dungeons:"🏰 Dungeons",dailyBoss:"👹 Daily Boss",arena:"🏟️ Arena",treasure:"💰 Treasure",com_hp_atk2:"🧤 Leather Vambrace",com_hp_def2:"🪵 Wooden Buckler",com_hp_def:"🪨 Stone Brace",com_atk_def2:"📌 Bronze Spikes",com_atk_def:"🥊 Iron Knuckles",gearBundle:"🛡️ 5 Common Equipment"};
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
  melonRainbow:"A colorful melon with special properties.",
  melonFire:"Used to upgrade a Fire creature's abilities.",
  melonWater:"Used to upgrade a Water creature's abilities.",
  melonNature:"Used to upgrade a Nature creature's abilities.",
  melonEarth:"Used to upgrade an Earth creature's abilities.",
  melonWind:"Used to upgrade a Wind creature's abilities.",
  melonElectric:"Used to upgrade an Electric creature's abilities.",
  melonLight:"Used to upgrade a Light creature's abilities.",
  melonDark:"Used to upgrade a Dark creature's abilities.",
  ascensionMelon:"Used to ascend your Legendary Creatures to a higher form.",
  ascensionMelonCommon:"Used to ascend your Common Creatures to a higher form.",
  ascensionMelonRare:"Used to ascend your Rare Creatures to a higher form.",
  ascensionMelonEpic:"Used to ascend your Epic Creatures to a higher form.",
  legendaryEgg:"Used to hatch powerful Creatures.",
  legendaryEggs:"Used to hatch powerful Legendary Creatures.",
  mysteriousOre:"Used to unlock cosmetic skins for your Creatures.",
  deluxeOre:"Used to unlock rare and epic skins for your Creatures.",
  candy:"Used to unlock Skins.",
  ancientFertilizer:"Used to upgrade your Field, boosting its Food/Gear Shard rates.",
  plots:"Unlocks the Farm's extra Plots.",
  dungeons:"Unlocks the Dungeon.",
  dailyBoss:"Unlocks the Daily Boss.",
  arena:"Unlocks the Arena.",
  treasure:"Unlocks the Treasure.",
  com_hp_atk2:"Common gear. +5 Health, +5 Attack.",
  com_hp_def2:"Common gear. +5 Health, +5 Defense.",
  com_hp_def:"Common gear. +5 Health, +5 Defense.",
  com_atk_def2:"Common gear. +5 Attack, +5 Defense.",
  com_atk_def:"Common gear. +5 Attack, +5 Defense.",
  gearBundle:"Equipment for creatures",
};

// "FIELD_12H" is a sentinel, not a literal amount -- resolveDailyReward()
// below swaps it for 12 hours' worth of the Field's current Food/Gear Shard
// rate, so these days keep pace as the player upgrades the Field with
// Ancient Fertilizer instead of paying out a fixed number forever.
export const DAILY_REWARDS=[
  {day:1,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:2,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:3,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:4,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:5,label:"5 Flair Banana",emoji:"🍌",reward:{flairBanana:5}},
  {day:6,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:7,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:8,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:9,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:10,label:"1 Rainbow Melon",emoji:"🍈",reward:{melonRainbow:1}},
  {day:11,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:12,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:13,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:14,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:15,label:"1 Mythical Flair Banana",emoji:"🍌✨",reward:{mythicalFlairBanana:1}},
  {day:16,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:17,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:18,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:19,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:20,label:"3 Legendary Ascension Melon",emoji:"🍈",reward:{ascensionMelon:3}},
  {day:21,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:22,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:23,label:"5 Candy",emoji:"🍬",reward:{candy:5}},
  {day:24,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:25,label:"1 Ancient Flair Banana",emoji:"🍌⭐",reward:{ancientFlairBanana:1}},
  {day:26,label:"1 Egg",emoji:"🥚",reward:{eggs:1}},
  {day:27,label:"Food",emoji:"🍖",reward:{food:"FIELD_12H"}},
  {day:28,label:"5 Dungeon Passes",emoji:"🎫",reward:{dungeonPass:5}},
  {day:29,label:"Gear Shards",emoji:"⚔️",reward:{equipShards:"FIELD_12H"}},
  {day:30,label:"1 Legendary Egg",emoji:"🌟",reward:{legendaryEggs:1}},
];

/** Resolves any "FIELD_<N>H" sentinel (food against FIELD_RATES, equipShards
 * against FIELD_SHARD_RATES) into N hours of the Field's current per-hour
 * rate at the given level. Keys without a sentinel pass through unchanged. */
export function resolveReward(reward,farmFieldLevel){
  const resolved={...reward};
  const m=k=>typeof resolved[k]==="string"?/^FIELD_(\d+)H$/.exec(resolved[k]):null;
  const foodMatch=m("food");
  if(foodMatch) resolved.food=(FIELD_RATES[farmFieldLevel]||FIELD_RATES[1])*Number(foodMatch[1]);
  const shardMatch=m("equipShards");
  if(shardMatch) resolved.equipShards=(FIELD_SHARD_RATES[farmFieldLevel]||FIELD_SHARD_RATES[1])*Number(shardMatch[1]);
  return resolved;
}

/** Resolves a DAILY_REWARDS entry's "FIELD_<N>H" sentinels into an actual
 * amount and a matching label. Entries without a sentinel pass through
 * unchanged. */
export function resolveDailyReward(entry,farmFieldLevel){
  const reward=resolveReward(entry.reward,farmFieldLevel);
  let label=entry.label;
  if(reward.food!==entry.reward.food) label=reward.food+" Food";
  if(reward.equipShards!==entry.reward.equipShards) label=reward.equipShards+" Gear Shards";
  return {...entry,reward,label};
}

// 30 tiers each. Free lane pays modest amounts; Premium pays roughly 3x plus
// the two chase items (Mythical/Ancient Flair Banana, Legendary Eggs) get
// their own dedicated tiers instead of scaling the free lane's item.
export const BATTLEPASS_REWARDS_FREE=[
  {eggs:1},{food:"FIELD_6H"},{ascensionMelon:1},{equipShards:"FIELD_6H"},{melonRainbow:1},
  {eggs:1},{food:"FIELD_6H"},{candy:5},{equipShards:"FIELD_6H"},{flairBanana:5},
  {eggs:1},{food:"FIELD_6H"},{ascensionMelon:1},{equipShards:"FIELD_6H"},{melonRainbow:1},
  {eggs:1},{food:"FIELD_6H"},{candy:5},{equipShards:"FIELD_6H"},{flairBanana:5},
  {eggs:1},{food:"FIELD_6H"},{ascensionMelon:1},{equipShards:"FIELD_6H"},{melonRainbow:1},
  {eggs:1},{food:"FIELD_6H"},{candy:5},{equipShards:"FIELD_6H"},{legendaryEggs:1},
];
export const BATTLEPASS_REWARDS_PAID=[
  {legendaryEggs:3},{food:"FIELD_18H"},{ascensionMelon:3},{equipShards:"FIELD_18H"},{melonRainbow:3},
  {eggs:4},{food:"FIELD_18H"},{candy:15},{equipShards:"FIELD_18H"},{mythicalFlairBanana:5},
  {eggs:4},{food:"FIELD_18H"},{ascensionMelon:3},{equipShards:"FIELD_18H"},{melonRainbow:3},
  {eggs:4},{food:"FIELD_18H"},{candy:15},{equipShards:"FIELD_18H"},{ancientFlairBanana:1},
  {eggs:4},{food:"FIELD_18H"},{ascensionMelon:3},{equipShards:"FIELD_18H"},{melonRainbow:3},
  {eggs:4},{food:"FIELD_18H"},{candy:15},{equipShards:"FIELD_18H"},{legendaryEggs:3},
];

export const NEW_PLAYER_GIFT_REWARDS=[
  {day:1,label:"5 Eggs",emoji:"🥚",reward:{eggs:5}},
  {day:2,label:"1 Legendary Egg",emoji:"🌟",reward:{legendaryEggs:1}},
  {day:3,label:"5 Eggs",emoji:"🥚",reward:{eggs:5}},
  {day:4,label:"1 Legendary Ascension Melon",emoji:"🍈",reward:{ascensionMelon:1}},
  {day:5,label:"5 Eggs",emoji:"🥚",reward:{eggs:5}},
  {day:6,label:"1 Legendary Egg",emoji:"🌟",reward:{legendaryEggs:1}},
  {day:7,label:"5 Eggs",emoji:"🥚",reward:{eggs:5}},
  {day:8,label:"1 Rainbow Melon",emoji:"🍈",reward:{melonRainbow:1}},
  {day:9,label:"5 Eggs",emoji:"🥚",reward:{eggs:5}},
  {day:10,label:"3 Legendary Eggs",emoji:"🌟",reward:{legendaryEggs:3}},
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
