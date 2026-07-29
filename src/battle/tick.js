// The shared battle tick, used by both Dungeon and Daily Boss fights.
//
// Phase order matters and is deliberate:
//   1. bump tick, snapshot who is alive, build the occupancy set
//   2. player units act    (attack the boss if in range, else minions, else close in)
//   3. enemy minions act
//   4. minion specials
//   5. status effects      (DoT damage + debuff countdowns)
//   6. boss acts           (special THEN basic -- earth/electric/light have
//                           cooldown interplay that assumes this ordering)
//
// Per-screen differences travel in `config`, not in branches here. The caller
// owns React state, timers, rewards, and win/lose handling; this function only
// advances the simulation and reports what happened.

import { MELEE_RANGE, RANGED_RANGE } from "./constants.js";
import {
  aChebDist, aCardinalDist, aBestStep,
  bossOccupies, distToBoss, nearestOpenBossAdj,
} from "./geometry.js";
import { tickStatusEffects, isRooted, speedPenalty } from "./status.js";
import { tickMinionSpecials } from "./minions.js";
import { unitDamage, playerDamageToBoss, damageBoss, attackCooldown } from "./damage.js";
import { getBossModule } from "./bosses/registry.js";
import { makeBossContext } from "./bosses/context.js";

/** Move a unit one BFS step toward (tr,tc), keeping the occupancy set in sync. */
function stepUnit(u, tr, tc, blocked, allOcc, now) {
  const [nr, nc] = aBestStep(u.row, u.col, tr, tc, blocked);
  if (nr === u.row && nc === u.col) return false;
  allOcc.delete(u.row + "," + u.col);
  u.prevRow = u.row;
  u.prevCol = u.col;
  u.lastMoveTime = now;
  u.row = nr;
  u.col = nc;
  allOcc.add(nr + "," + nc);
  return true;
}

/**
 * Pick what a unit should shoot at and what it should walk toward.
 * Ranged units need a clear cardinal line to fire; everyone falls back to
 * walking at the nearest foe by Chebyshev distance.
 */
function selectTarget(u, foes) {
  const nearest = [...foes].sort(
    (a, z) => aChebDist(u.row, u.col, a.row, a.col) - aChebDist(u.row, u.col, z.row, z.col)
  )[0];
  let atkTgt = null;
  if (u.isRanged) {
    const inLine = foes.filter(
      (f) => aCardinalDist(u.row, u.col, f.row, f.col) <= RANGED_RANGE
    );
    if (inLine.length) {
      atkTgt = inLine.sort(
        (a, z) => aCardinalDist(u.row, u.col, a.row, a.col) - aCardinalDist(u.row, u.col, z.row, z.col)
      )[0];
    }
  }
  return { atkTgt, moveTgt: nearest };
}

/**
 * Advance one tick.
 *
 * @param {object} state {tick, playerUnits, enemyUnits, boss}
 * @param {object} config {gridRows, gridCols}
 * @returns {{newFx: Array, now: number, acted: boolean}}
 */
export function runBattleTick(state, config) {
  const { gridRows, gridCols } = config;
  const now = Date.now();
  state.tick++;

  const aliveP = state.playerUnits.filter((u) => u.hp > 0);
  const aliveE = state.enemyUnits.filter((u) => u.hp > 0);
  const boss = state.boss;
  const newFx = [];
  if (!aliveP.length) return { newFx, now, acted: false };

  const allOcc = new Set([...aliveP, ...aliveE].map((u) => u.row + "," + u.col));
  const bossAlive = !!(boss && boss.hp > 0);
  const damageDealt = state.damageDealt || (state.damageDealt = {});

  /** Cells a unit may not path through. */
  const blocked = (r, c) =>
    r < 0 || r >= gridRows || c < 0 || c >= gridCols ||
    (bossAlive && bossOccupies(boss, r, c)) ||
    allOcc.has(r + "," + c);

  // ── 1. Player units ──────────────────────────────────────────────────────
  for (const u of aliveP) {
    u.atkCd = Math.max(0, u.atkCd - 1);
    u.abilCd = Math.max(0, (u.abilCd || 0) - 1);

    const canMove = !isRooted(u);
    const penalty = speedPenalty(u);
    const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
    const distB = bossAlive ? distToBoss(boss, u.row, u.col) : Infinity;

    // Boss takes priority when in range -- hold position even while on cooldown.
    if (distB <= range && bossAlive) {
      if (u.atkCd <= 0) {
        const dmgToBoss = playerDamageToBoss(u, boss, aliveP);
        damageBoss(boss, dmgToBoss);
        damageDealt[u.creatureId] = (damageDealt[u.creatureId] || 0) + dmgToBoss;
        u.atkCd = attackCooldown(u, penalty);
        newFx.push({ id: now + u.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: false });
      }
      continue;
    }

    // Otherwise fight the minions.
    if (aliveE.length) {
      const { atkTgt, moveTgt } = selectTarget(u, aliveE);
      const tgt = atkTgt || moveTgt;
      if (tgt) {
        const dist = atkTgt
          ? aCardinalDist(u.row, u.col, atkTgt.row, atkTgt.col)
          : aChebDist(u.row, u.col, tgt.row, tgt.col);
        if (dist <= range && u.atkCd <= 0) {
          const dmg = unitDamage(u, tgt);
          tgt.hp = Math.max(0, tgt.hp - dmg);
          damageDealt[u.creatureId] = (damageDealt[u.creatureId] || 0) + dmg;
          u.atkCd = attackCooldown(u, penalty);
          newFx.push({ id: now + u.uid, row: tgt.row, col: tgt.col, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: false });
        } else if (canMove && dist > range) {
          stepUnit(u, tgt.row, tgt.col, blocked, allOcc, now);
        }
        continue;
      }
    }

    // No minions left: close on the boss, but only if not already in range.
    if (bossAlive && canMove && distB > range) {
      const dest = nearestOpenBossAdj(boss, u.row, u.col, allOcc, gridRows, gridCols);
      if (dest) stepUnit(u, dest[0], dest[1], blocked, allOcc, now);
    }
  }

  // ── 2. Enemy minions ─────────────────────────────────────────────────────
  for (const u of aliveE) {
    u.atkCd = Math.max(0, u.atkCd - 1);
    const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
    const { atkTgt, moveTgt } = selectTarget(u, aliveP);
    const tgt = atkTgt || moveTgt;
    if (!tgt) continue;

    const dist = atkTgt
      ? aCardinalDist(u.row, u.col, atkTgt.row, atkTgt.col)
      : aChebDist(u.row, u.col, tgt.row, tgt.col);
    if (dist <= range && u.atkCd <= 0) {
      tgt.hp = Math.max(0, tgt.hp - unitDamage(u, tgt));
      u.atkCd = attackCooldown(u);
      newFx.push({ id: now + u.uid, row: tgt.row, col: tgt.col, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: true });
    } else if (dist > range) {
      stepUnit(u, tgt.row, tgt.col, blocked, allOcc, now);
    }
  }

  // ── 3. Minion specials ───────────────────────────────────────────────────
  tickMinionSpecials(aliveE, aliveP, newFx, now);

  // ── 4. Status effects ────────────────────────────────────────────────────
  tickStatusEffects(aliveP, boss, newFx, now);

  // ── 5. Boss ──────────────────────────────────────────────────────────────
  if (bossAlive) {
    boss.atkCd = Math.max(0, boss.atkCd - 1);
    boss.moveCd = Math.max(0, boss.moveCd - 1);
    boss.specialCd = Math.max(0, boss.specialCd - 1);

    const mod = getBossModule(boss._bossKey);
    if (mod) {
      const ctx = makeBossContext({ boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols });
      if (mod.onInit && !boss._initDone) {
        mod.onInit(ctx);
        boss._initDone = true;
      }
      if (mod.onStatusTick) mod.onStatusTick(ctx);
      if (mod.special) mod.special(ctx);
      if (mod.basic) mod.basic(ctx);
    }
  }

  return { newFx, now, acted: true };
}

/**
 * Win/lose check. Returns "won" when the boss and all minions are down,
 * "lost" when the party is wiped, otherwise null.
 */
export function battleOutcome(state) {
  const bossAlive = !!(state.boss && state.boss.hp > 0);
  const anyEnemy = state.enemyUnits.some((u) => u.hp > 0);
  const anyPlayer = state.playerUnits.some((u) => u.hp > 0);
  if (!bossAlive && !anyEnemy) return "won";
  if (!anyPlayer) return "lost";
  return null;
}
