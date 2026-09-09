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
export const STAT_CYCLE=["hp","atk","def","spd","abilitySpeed","crit","critDmg"];
/** HP/ATK/DEF only, excluding Speed, Haste, and the crit pair. Shared by the level-up stat rotation and the ascension popup. */
export const CORE_STAT_CYCLE=["hp","atk","def"];
/** Stats a level-up can bump. Speed, Haste, and the crit pair are excluded -- they stay at their base value from leveling. */
export const LEVEL_STAT_CYCLE=CORE_STAT_CYCLE;

/**
 * How the stat pills are laid out on a creature's page: side-by-side groups,
 * each an internal grid of `cols` columns.
 *
 * The three stats the statline is balanced on -- and the only three leveling
 * and ascension touch -- sit in a row on the left at full size. The four that
 * move only through Equipment and Flair sit to their right in a 2x2 at the
 * smaller size (`compact`), so the page reads primary-then-secondary at a
 * glance rather than as one undifferentiated block of seven.
 *
 * `weight` is the group's share of the width. 1.75 : 1 is not arbitrary -- it
 * is what keeps the big row genuinely bigger while leaving the narrow 2x2
 * enough room for its longest label. On the 375px design width it works out to
 * roughly 64px per primary pill against 55px per secondary one, and the
 * widest labels ("Defense" at 10px, "Crit Damage" at 8px) need 38px and 42px
 * respectively -- so neither ever wraps, with the tighter margin on the right.
 * Shrink the right group much past this and "Crit Damage" breaks onto a second
 * line before it runs out of room.
 *
 * `fillHeight` marks the group whose rows grow to fill the strip. The 2x2 is
 * two rows deep against the primary group's one, so it is what actually sets
 * the height here; marking the primary group instead means its single row
 * stretches to match, which is what makes those pills tall as well as wide.
 * Everything not marked sizes to its content and centres against the rest --
 * without that the 2x2 stretched too and came out with taller pills than the
 * "big" ones it sits beside.
 *
 * Rendering reads this rather than STAT_CYCLE, so a stat's place in the layout
 * is decided here rather than by its position in the cycle. Every stat in
 * STAT_CYCLE should appear in exactly one group -- StatStrip warns in the
 * console if one goes missing rather than silently hiding it.
 */
export const STAT_LAYOUT=[
  {stats:["hp","atk","def"],cols:3,compact:false,weight:1.75,fillHeight:true},
  {stats:["spd","abilitySpeed","crit","critDmg"],cols:2,compact:true,weight:1},
];

export const STAT_LABELS={hp:"Health",atk:"Attack",def:"Defense",spd:"Speed",abilitySpeed:"Haste",crit:"Critical Chance",critDmg:"Critical Damage"};

/**
 * The stats the gear filters offer as chips -- every stat a piece of equipment
 * can carry, which is all of them.
 *
 * This is just STAT_CYCLE, and that is the point: the three filter screens
 * (Equipment, its Dex, and the creature page's gear picker) each used to spell
 * the list out as `[...CORE_STAT_CYCLE,"spd","abilitySpeed"]`. That was an
 * accurate copy of STAT_CYCLE right up until a stat was added to the cycle and
 * not to the three copies -- at which point gear carrying the new stat became
 * unfindable in all three places at once. Naming it here means adding a stat
 * puts it in the filters by itself.
 */
export const GEAR_FILTER_STATS=STAT_CYCLE;
/**
 * Names for the small pills only (STAT_LAYOUT's `compact` groups). "Crit
 * Chance" and "Crit Damage" need ~52px on one line at that size and the pill
 * gives them 49, so at full length they break onto two lines. Narrowing the
 * primary row to buy those three pixels would cost more than it's worth, and a
 * two-line label in a 27px pill looks worse than the abbreviation does.
 *
 * Only the pill is abbreviated -- the stat-info popup, equipment summaries,
 * and filter chips all still read STAT_LABELS, so the full name is never more
 * than a tap away. Anything absent here just uses its full name.
 */
export const STAT_SHORT_LABELS={crit:"Crit",critDmg:"Crit Dmg"};

/** A stat's name for somewhere tight -- the short form where one exists, the
 * full name otherwise. Used by the stat pills and the gear filter chips, both
 * of which sit in rows that run out of width before they run out of stats. */
export function shortStatLabel(stat){
  return STAT_SHORT_LABELS[stat]||STAT_LABELS[stat];
}
export const STAT_COLORS={hp:"#5DCAA5",atk:"#D85A30",def:"#378ADD",spd:"#7F77DD",abilitySpeed:"#EF9F27",crit:"#D6456F",critDmg:"#A34BC4"};
/** Stats measured in percentage points rather than as a count or a multiplier.
 * The value is stored as the percentage itself (crit 7 = a 7% chance,
 * critDmg 50 = half again the damage), so the only thing this changes is how
 * it reads -- see StatBar. */
export const STAT_SUFFIX={crit:"%",critDmg:"%"};
/**
 * Decimal places for stats whose meaningful changes are smaller than a whole
 * unit, so they are both ROUNDED to and SHOWN at that precision.
 *
 * Crit Chance always shows its one decimal, so it reads as the fractional stat
 * it is rather than as a whole number that happens to be 4. It needs the
 * decimal to move at all: every Crit Chance flair in the game comes to +4.2%
 * of a base of 4, which is 0.168 -- visible as 4.0 -> 4.2, and invisible
 * without it.
 *
 * Anything absent keeps whole numbers (Health, Attack, Defense) or the default
 * single decimal that only appears once it is non-zero (Speed, Haste, Crit
 * Damage -- whose flairs are worth whole points and register easily).
 */
export const STAT_DECIMALS={crit:1};

/** A stat value as it should read to a player, its % suffix included. */
export function formatStat(stat,value){
  const dp=STAT_DECIMALS[stat];
  const n=Number(value);
  const shown=dp!=null&&Number.isFinite(n)?n.toFixed(dp):value;
  return shown+(STAT_SUFFIX[stat]||"");
}
/** Plain-language description shown when a stat is tapped on the creature detail page. */
export const STAT_DESCRIPTIONS={
  hp:"Affects the creature's Max Health",
  atk:"Affects how much damage the creature deals to enemies",
  def:"Reduces the amount of damage this creature receives",
  spd:"Rate of Basic attacks",
  abilitySpeed:"Rate of ability cooldown recovery",
  crit:"Chance for an attack to land a critical hit",
  critDmg:"Extra damage dealt when landing a Critical Hit",
};
