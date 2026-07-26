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
export const STAT_LABELS={hp:"HP",atk:"ATK",def:"DEF",spd:"SPD",abilitySpeed:"Haste"};
export const STAT_COLORS={hp:"#5DCAA5",atk:"#D85A30",def:"#378ADD",spd:"#7F77DD",abilitySpeed:"#EF9F27"};
