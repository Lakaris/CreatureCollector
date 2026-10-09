// Boss kit registry, keyed by the `key` field of DUNGEON_BOSSES.
//
// Each module owns one boss's full kit: its runtime behaviour AND the tiles the
// planning phase highlights. Those were previously two separate hand-written
// implementations per boss that had to be kept in sync by hand -- and had
// already drifted.
//
// Bosses are creatures ("__boss_<kit>", data/creatures.js), so each kit is ALSO
// exposed through the creature-module interface every other creature uses
// (see asCreatureModule below) and registered with them in
// battle/playerAbilities/registry.js. The kits themselves are unchanged: they
// still read the boss context (bosses/context.js) they were written against.

import fire from "./fire.js";
import nature from "./nature.js";
import earth from "./earth.js";
import electric from "./electric.js";
import water from "./water.js";
import light from "./light.js";
import dark from "./dark.js";
import wind from "./wind.js";
import daily from "./daily.js";
import { makeBossContext } from "./context.js";
import { tickTimedMods } from "../status.js";

export const BOSS_MODULES = { fire, nature, earth, electric, water, light, dark, wind, daily };

/** Look up a boss's ability module. Returns undefined for unknown keys. */
export function getBossModule(key) {
  return BOSS_MODULES[key];
}

/**
 * Tiles the planning phase should highlight for `mode` ("basic" | "special").
 * Returns an empty Set when the boss or mode is unknown.
 */
export function getHighlightTiles(key, mode, geo) {
  const mod = BOSS_MODULES[key];
  if (!mod) return new Set();
  if (mode === "basic" && mod.basicTiles) return mod.basicTiles(geo);
  if (mode === "special" && mod.specialTiles) return mod.specialTiles(geo);
  return new Set();
}

/**
 * A boss kit as a creature module. The engine runs it like any creature's,
 * with three boss-shaped differences, all deliberate:
 *
 *  - The boss's turn comes LAST in the tick (the "boss" classification's
 *    actsLast rule -- see battle/classifications.js and the acts-last pass in
 *    battle/tick.js), in the order its kit always ran: its own clocks count
 *    down and its timed effects tick, then onInit (once), onStatusTick, its
 *    Special, its Basic.
 *  - Its Special is called EVERY turn, through the shared castSpecial, because
 *    some kits do work there between casts (Electric fires its queued bolts).
 *    A kit marks a real cast by resetting its own `specialCd` to a fresh
 *    cooldown, so special() reports whether the cooldown went up; a turn that
 *    returns false cast nothing, and castSpecial skips the per-cast effects
 *    (a Lightning Hazard's strike, per-cast gear) for it.
 *  - The boss context is built from the creature context, ONCE per turn and
 *    shared by every hook (what the Special shoves, the Basic's movement then
 *    sees): the kit's `aliveP` is the boss's foes (the player side), its
 *    `aliveE` its own side minus itself, and its `allOcc` the engine's own
 *    occupancy -- which the acts-last pass clears of the boss's body for the
 *    turn, since a kit moves its 2x2 body by checking the tiles it moves into.
 */
export function asCreatureModule(kit) {
  const perTurn = new WeakMap();
  const bossCtx = (unit, ctx) => {
    let bctx = perTurn.get(ctx);
    if (!bctx) {
      bctx = makeBossContext({
        boss: unit,
        aliveP: ctx.aliveE,
        aliveE: ctx.aliveP.filter((u) => u !== unit),
        allOcc: ctx.allOcc,
        newFx: ctx.newFx,
        now: ctx.now,
        gridRows: ctx.gridRows,
        gridCols: ctx.gridCols,
      });
      perTurn.set(ctx, bctx);
    }
    return bctx;
  };
  return {
    isBossKit: true,

    /** The start of the boss's turn: its clocks, its timed effects, its
     * one-time opening (onInit) and its per-turn upkeep (onStatusTick). */
    onTick(unit, ctx) {
      unit.atkCd = Math.max(0, unit.atkCd - 1);
      unit.moveCd = Math.max(0, unit.moveCd - 1);
      unit.specialCd = Math.max(0, unit.specialCd - 1);
      tickTimedMods(unit);
      const bctx = bossCtx(unit, ctx);
      if (kit.onInit && !unit._initDone) {
        kit.onInit(bctx);
        unit._initDone = true;
      }
      if (kit.onStatusTick) kit.onStatusTick(bctx);
    },

    /** Called every turn; true only when this turn started a cast. */
    special(unit, ctx) {
      if (!kit.special) return false;
      const before = unit.specialCd || 0;
      kit.special(bossCtx(unit, ctx));
      return (unit.specialCd || 0) > before;
    },

    basicAttack(unit, ctx) {
      if (kit.basic) kit.basic(bossCtx(unit, ctx));
    },
  };
}

/** Every boss kit as a creature module, keyed by its creatureId. */
export const BOSS_CREATURE_MODULES = Object.fromEntries(
  Object.entries(BOSS_MODULES).map(([key, kit]) => ["__boss_" + key, asCreatureModule(kit)])
);

export default BOSS_MODULES;
