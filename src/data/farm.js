// Farm tuning: plot costs, crop definitions, and per-level idle field rates.
// Rate arrays are indexed by field level.

export const FARM_PLOT_COSTS=[0,100,250,500,1000,2000]; // index = plot number (0-based), cost to unlock that plot
export const PLOT_GROW_MS=12*3600000; // 12 hours
export const PLOT_CROPS=[
  {key:"food",        label:"Food",            emoji:"🍖", yield:10, upgradeEvery:1},
  {key:"equipShards", label:"Gear Shards",    emoji:"🔧", yield:5,  upgradeEvery:3},
  {key:"candy",       label:"Candy",           emoji:"🍬", yield:2,  upgradeEvery:5},
  {key:"melonFire",    label:"Fire Melon",    emoji:"🔥", yield:1, upgradeEvery:5},
  {key:"melonWater",   label:"Water Melon",   emoji:"💧", yield:1, upgradeEvery:5},
  {key:"melonNature",  label:"Nature Melon",  emoji:"🌿", yield:1, upgradeEvery:5},
  {key:"melonEarth",   label:"Earth Melon",   emoji:"🪨", yield:1, upgradeEvery:5},
  {key:"melonWind",    label:"Wind Melon",    emoji:"💨", yield:1, upgradeEvery:5},
  {key:"melonElectric",label:"Electric Melon",emoji:"⚡", yield:1, upgradeEvery:5},
  {key:"melonLight",   label:"Light Melon",   emoji:"✨", yield:1, upgradeEvery:5},
  {key:"melonDark",    label:"Dark Melon",    emoji:"🌑", yield:1, upgradeEvery:5},
  {key:"ascensionMelon",label:"Ascension Melon",emoji:"🍈", yield:1, upgradeEvery:5},
];

export const FIELD_RATES=[0,2,5,10,18,30]; // food per hour at each level (index=level)
export const FIELD_MONEY_RATES=[0,5,12,25,45,80]; // money per hour at each level (index=level)
export const FIELD_SHARD_RATES=[0,50,60,75,95,120]; // equipment shards per hour at each level (index=level)
export const FIELD_UPGRADE_COSTS=[0,200,500,1000,2000]; // cost to upgrade from level i to i+1
export const FIELD_CAP_HOURS=24;
export const FIELD_MIN_HOURS=1;
