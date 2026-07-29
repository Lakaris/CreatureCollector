// Rarity tiers, stat identity, and display colors shared across collection and gacha UI.

export const RARITY_CONFIG={
  common:{label:"Common",rate:60,color:"badge-common"},
  rare:{label:"Rare",rate:32,color:"badge-rare"},
  epic:{label:"Epic",rate:7.5,color:"badge-epic"},
  legendary:{label:"Legendary",rate:0.5,color:"badge-legendary"},
};
export const SKIN_TIER_CONFIG={
  common:{label:"Common",rate:5,shardValue:10,shardCost:50,color:"badge-common"},
  rare:{label:"Rare",rate:2.5,shardValue:20,shardCost:100,color:"badge-rare"},
  epic:{label:"Epic",rate:1,shardValue:50,shardCost:200,color:"badge-epic"},
  legendary:{label:"Legendary",rate:0.5,shardValue:150,shardCost:500,color:"badge-legendary"},
};
export const SKIN_FAIL_SHARDS=3;
export const RARITY_STAT_MULT={common:1,rare:1.15,epic:1.3,legendary:1.5};
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
