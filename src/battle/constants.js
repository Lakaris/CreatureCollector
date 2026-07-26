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

/** Melee units attack at Chebyshev distance 1; ranged at 3. */
export const MELEE_RANGE = 1;
export const RANGED_RANGE = 3;

/** Milliseconds per battle tick at 1x speed. */
export const TICK_MS = 500;

/** Battles are capped at 60 seconds. */
export const BATTLE_TIME_MS = 60000;

/** Bosses occupy a 2x2 block anchored at their row/col. */
export const BOSS_SIZE = 2;
