// Rarity tiers, stat identity, and display colors shared across collection and gacha UI.

// Creature rarities: three tiers (the Rare tier was removed; its old 32%
// hatch weight folded mostly into Common, with a small bump to Epic since
// the former Rare lines were split between those two pools). Skin tiers,
// flair rarities, treasures, and equipment keep their own separate
// rarity tables -- those still include a "rare" tier on purpose.
export const RARITY_CONFIG={
  common:{label:"Common",rate:90,color:"badge-common"},
  epic:{label:"Epic",rate:9.5,color:"badge-epic"},
  legendary:{label:"Legendary",rate:0.5,color:"badge-legendary"},
};
export const SKIN_TIER_CONFIG={
  common:{label:"Common",rate:5,shardValue:10,shardCost:50,color:"badge-common"},
  rare:{label:"Rare",rate:2.5,shardValue:20,shardCost:100,color:"badge-rare"},
  epic:{label:"Epic",rate:1,shardValue:50,shardCost:200,color:"badge-epic"},
  legendary:{label:"Legendary",rate:0.5,shardValue:150,shardCost:500,color:"badge-legendary"},
};
export const SKIN_FAIL_SHARDS=3;
// Per-level growth is rarity-independent: level-up gains scale off base stats
// alone, so the max-level power ratio between two creatures equals their
// base-stat ratio. Rarity's edge lives entirely in the base statlines
// (legendaries start at ~epic-stage-2 strength and finish ~5-10% above other
// finals). The old values (epic 1.3 / legendary 1.5) compounded over 500
// levels into a ~45% endgame gap on top of that base edge.
export const RARITY_STAT_MULT={common:1,epic:1,legendary:1};
export const STAT_CYCLE=["hp","atk","def","spd","abilitySpeed"];
/** HP/ATK/DEF only, excluding Speed and Haste. Shared by the level-up stat rotation and the ascension popup. */
export const CORE_STAT_CYCLE=["hp","atk","def"];
/** Stats a level-up can bump. Speed and Haste are excluded -- they stay at their base value from leveling. */
export const LEVEL_STAT_CYCLE=CORE_STAT_CYCLE;
export const STAT_LABELS={hp:"Health",atk:"Attack",def:"Defense",spd:"Speed",abilitySpeed:"Haste"};
export const STAT_COLORS={hp:"#5DCAA5",atk:"#D85A30",def:"#378ADD",spd:"#7F77DD",abilitySpeed:"#EF9F27"};
/** Plain-language description shown when a stat is tapped on the creature detail page. */
export const STAT_DESCRIPTIONS={
  hp:"Affects the creature's Max Health",
  atk:"Affects how much damage the creature deals to enemies",
  def:"Reduces the amount of damage the creature receives from enemies",
  spd:"Rate of Basic attacks",
  abilitySpeed:"Rate of ability cooldown recovery",
};
