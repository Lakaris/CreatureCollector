// Grid dimensions and combat ranges.
//
// Dungeon and Daily Boss share a 6x10 grid; Arena uses a smaller 5x8.
// Tile size is in CSS pixels and must match the grid rendering. Tiles are
// square -- one value drives both the column and row track, so the cells stay
// square whatever it is set to.
//
// The ceiling on tile size is the widest grid on the narrowest phone: on a
// 320px screen the grid's content box measures 280px (below 700px the side
// panels stack under the grid, so only the grid's own width matters), and six
// columns have to fit inside it -- 46 is the largest that does. The wrapper
// clips rather than scrolls, so overshooting silently cuts the last column off
// the Dungeon and Daily Boss boards instead of showing a scrollbar.

export const ARENA_GRID_COLS = 5;
export const ARENA_GRID_ROWS = 8;
export const ARENA_PLAYER_START_ROW = 5;
export const ARENA_TILE = 46;
export const ARENA_MAX_DEPLOYED = 6;

export const DUNGEON_GRID_COLS = 6;
export const DUNGEON_GRID_ROWS = 10;
export const DUNGEON_PLAYER_START_ROW = 6;
export const DUNGEON_TILE = 46;
export const DUNGEON_MAX_DEPLOYED = 6;

/**
 * Daily free Dungeon Pass regen (granted at Eastern noon, see GameContext),
 * and the ratio of that amount above which the free regen stops topping you
 * up (currently 3x -- an anti-hoarding gate, not a hard inventory cap).
 * Permanently raised by DUNGEON_PASS_DAILY_CAP_BONUS once the Dungeon
 * Starter Pack (data/store.js) is purchased -- see
 * GameContext's dungeonStarterPackPurchased.
 */
export const DUNGEON_PASS_DAILY_CAP = 10;
export const DUNGEON_PASS_DAILY_CAP_BONUS = 10;
export const DUNGEON_PASS_OVERFLOW_MULT = 3;

/**
 * Width the planning phase holds back for the info column beside the board
 * (see useFitTile's `reserveW`). Enough for the card's own padding plus an
 * ability row -- its "SPECIAL" label and the Effects pill, side by side -- so
 * the column is never narrower than the smallest thing it has to show.
 */
export const PLAN_PANEL_MIN_W = 160;

/** Melee units attack at Chebyshev distance 1; ranged at 3. */
export const MELEE_RANGE = 1;
export const RANGED_RANGE = 3;

/** Milliseconds per battle tick at 1x speed. */
export const TICK_MS = 500;

/** Battles are capped at 60 seconds. */
export const BATTLE_TIME_MS = 60000;

/** Bosses occupy a 2x2 block anchored at their row/col. */
export const BOSS_SIZE = 2;

/**
 * Universal duration for every timed buff and debuff (burn, poison, root,
 * slow, shock, weaken, heal-block, dark DoT, ATK modifiers, Speed Up, ...),
 * in ticks: 6 ticks = 3 seconds at 1x speed.
 *
 * Policy: reapplying a non-stacking effect REFRESHES this timer (assign, never
 * add), it does not extend beyond it. Buffs granted by charged specials
 * therefore always have downtime -- every special takes longer than 6 ticks to
 * recharge. Deliberate exceptions: while-in-range auras (Guardian Grove) and
 * until-an-event effects (Antler Dart's stacks) manage their own lifetime.
 */
export const STATUS_TICKS = 6;

/**
 * The duration ladder, for ability text that needs to say how long something
 * lasts. The standard STATUS_TICKS is the unmarked default -- text says
 * nothing -- and these are the words for stepping off it:
 *
 *   "momentarily"  2 ticks (1s)    -- one skipped action; Ruyi Reach's stun
 *   "briefly"      3 ticks (1.5s)  -- half standard; Overload Sting's stun
 *   (unmarked)     6 ticks (3s)    -- STATUS_TICKS, the default everywhere
 *   "enduringly"   9 ticks (4.5s)  -- half again as long; Holdfast's Root
 *
 * Keep the words and the numbers in step: an ability that says "enduringly"
 * must use ENDURING_TICKS, and one that says nothing must use STATUS_TICKS.
 */
export const ENDURING_TICKS = 9;

/**
 * The displayed damage that equals a 1.0x swing. Every ability module turns
 * its card's "N dmg" into a damage multiplier as N / BASIC_DMG_BASELINE, so a
 * creature's output is ATK-derived damage x its ability's base power -- both
 * numbers are real. A card that says 24 hits twice as hard as one that says
 * 12 (same ATK), and lowering a ladder's numbers genuinely lowers its damage.
 *
 * Previously each module divided by its own ladder's first entry, which
 * cancelled the base power out entirely: every creature swung at exactly
 * 1.0x at ability level 1 no matter what its card claimed.
 *
 * 12 is the baseline because it was the modal base among implemented lines
 * when this landed (Doomshade, Dustling, Venomcoil, Frillet, Waddlepop), so
 * those lines' behavior did not move.
 */
export const BASIC_DMG_BASELINE = 12;

/**
 * Attack cooldown, in ticks, is COOLDOWN_TICKS_AT_SPD_1 / spd. Every creature's
 * base Speed is now a normalized 1.0, so this constant alone defines "normal"
 * attack pace (it replaces the old design where a raw spd around 50 was typical
 * and cooldown was 600/spd).
 *
 * 4 ticks = 2 seconds at 1x. This was 12 (a full 6 seconds between swings),
 * which made battles mostly waiting: a creature acted about ten times in a
 * whole 60-second fight. Attacks now land three times as often.
 */
export const COOLDOWN_TICKS_AT_SPD_1 = 4;

/**
 * Basic-attack damage is scaled by the same factor the cadence gained, so
 * tripling the attack rate changes how a fight FEELS without changing damage
 * per second. Derived from the constant above rather than hardcoded: retune
 * the cooldown and the damage follows automatically.
 *
 * Specials are deliberately untouched -- they fire off a charge bar, not the
 * attack cooldown, so they gained no cadence to pay for. They call
 * attackRoll/unitDamage directly; only the basic-attack paths use the
 * basicUnitDamage / basicDamageToBoss wrappers in battle/damage.js.
 */
const LEGACY_COOLDOWN_TICKS = 12;
export const BASIC_ATTACK_DMG_MULT = COOLDOWN_TICKS_AT_SPD_1 / LEGACY_COOLDOWN_TICKS;
