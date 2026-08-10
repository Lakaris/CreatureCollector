// Farm tuning: plot costs, crop definitions, and per-level idle field rates.
// Rate arrays are indexed by field level.

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

// Field: 100 levels, one Ancient Fertilizer each (see FarmScreen.js) --
// deliberately 1:1 with the 100 total Ancient Fertilizer a full 5000-floor
// Labyrinth clear pays out (1 every 50 floors). A player who spends
// fertilizer as they climb keeps field level roughly in step with floor/50,
// which lines up with Labyrinth's difficulty tiers (getEnemyLevelForDepth in
// core/labyrinth.js: enemy level = floor/10) and with energyCost's growth in
// core/creatures.js, so food production scales fast enough to keep pace with
// each tier's target creature level. A player who never spends fertilizer
// stays near the level-1 rate, where even modest leveling takes weeks.
const FIELD_MAX_LEVEL = 100;
export const FIELD_RATES = Array.from({ length: FIELD_MAX_LEVEL + 1 }, (_, l) =>
  l === 0 ? 0 : Math.round(8.2 * Math.pow(l, 1.72))
); // food per hour at each level (index=level)
export const FIELD_SHARD_RATES = Array.from({ length: FIELD_MAX_LEVEL + 1 }, (_, l) =>
  l === 0 ? 0 : Math.round(20 + FIELD_RATES[l] * 0.5)
); // equipment shards per hour at each level (index=level)
export const FIELD_CAP_HOURS=24;
export const FIELD_MIN_HOURS=1;
