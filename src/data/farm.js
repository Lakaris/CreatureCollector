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
  {key:"ascensionMelonCommon",label:"Common Ascension Melon",emoji:"🍈⚪", yield:4, upgradeEvery:5},
  {key:"ascensionMelonRare",label:"Rare Ascension Melon",emoji:"🍈🔵", yield:3, upgradeEvery:5},
  {key:"ascensionMelonEpic",label:"Epic Ascension Melon",emoji:"🍈🟣", yield:2, upgradeEvery:5},
  {key:"ascensionMelon",label:"Legendary Ascension Melon",emoji:"🍈", yield:1, upgradeEvery:5},
];

// Field: 500 levels, one Ancient Fertilizer each (see FarmScreen.js) --
// deliberately 1:1 with the 500 total Ancient Fertilizer a full 5000-floor
// Labyrinth clear pays out (1 every 10 floors). A player who spends
// fertilizer as they climb keeps field level roughly in step with floor/10,
// which is also the Labyrinth's target creature level (getEnemyLevelForDepth
// in core/labyrinth.js: enemy level = floor/10), so field level ~= the
// creature level the player is currently pushing.
//
// The rate curves are paired with the upgrade cost curves on purpose:
// - Food grows as l^1.6, the same exponent as energyCost in core/creatures.js,
//   so at any depth ~10 creature levels (= 10 field levels = 100 floors) cost
//   about one week of capped harvests -- steady pace the whole way up.
// - Gear Shards grow as l^1.72, the same exponent as equipUpgradeCost in
//   core/equipment.js, funding ~2 equipment levels per week with equipment
//   level ~= field/5 (equip 100 lands at endgame alongside creature 500).
// The flat pedestals (6 food, 20 shards) keep level-1 income meaningful: a
// fresh player's first 24h harvest buys a few upgrades, and the first
// 10-level creature band takes ~a week. A player who never spends fertilizer
// stays near the level-1 rate, where even modest leveling takes weeks, and
// a high-level field makes re-leveling lower creatures/items trivial.
const FIELD_MAX_LEVEL = 500;
export const FIELD_RATES = Array.from({ length: FIELD_MAX_LEVEL + 1 }, (_, l) =>
  l === 0 ? 0 : Math.round(6 + 0.48 * Math.pow(l, 1.6))
); // food per hour at each level (index=level)
export const FIELD_SHARD_RATES = Array.from({ length: FIELD_MAX_LEVEL + 1 }, (_, l) =>
  l === 0 ? 0 : Math.round(20 + 0.019 * Math.pow(l, 1.72))
); // equipment shards per hour at each level (index=level)
export const FIELD_CAP_HOURS=24;
export const FIELD_MIN_HOURS=1;

// Food/Gear Shard plots don't use the flat yield/upgradeEvery progression
// below -- they instead pay out 12h (== PLOT_GROW_MS) of whatever the Field
// currently produces per hour at farmFieldLevel, so upgrading the Field also
// raises what these plots pay out.
export function getPlotYield(cropDef,upgradeLevel,farmFieldLevel){
  if(cropDef.key==="food")return 12*(FIELD_RATES[farmFieldLevel]||FIELD_RATES[1]);
  if(cropDef.key==="equipShards")return 12*(FIELD_SHARD_RATES[farmFieldLevel]||FIELD_SHARD_RATES[1]);
  return cropDef.yield+Math.floor(upgradeLevel/cropDef.upgradeEvery);
}
