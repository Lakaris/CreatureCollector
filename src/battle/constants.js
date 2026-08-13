// Grid dimensions and combat ranges.
//
// Dungeon and Daily Boss share a 6x10 grid; Arena uses a smaller 5x8.
// Tile size is in CSS pixels and must match the grid rendering.

export const ARENA_GRID_COLS = 5;
export const ARENA_GRID_ROWS = 8;
export const ARENA_PLAYER_START_ROW = 5;
export const ARENA_TILE = 44;
export const ARENA_MAX_DEPLOYED = 6;

export const DUNGEON_GRID_COLS = 6;
export const DUNGEON_GRID_ROWS = 10;
export const DUNGEON_PLAYER_START_ROW = 6;
export const DUNGEON_TILE = 44;
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
 * Attack cooldown, in ticks, is COOLDOWN_TICKS_AT_SPD_1 / spd. Every creature's
 * base Speed is now a normalized 1.0, so this constant alone defines "normal"
 * attack pace (it replaces the old design where a raw spd around 50 was typical
 * and cooldown was 600/spd).
 */
export const COOLDOWN_TICKS_AT_SPD_1 = 12;
