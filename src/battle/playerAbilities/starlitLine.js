// Starlit line: Piercing Blessing / Radiant Exchange family.
//
// Basic overrides the engine's default "attack the nearest thing" convention
// entirely: it targets the FARTHEST aligned enemy within range and fires a
// beam along that row/column -- enemies it crosses take damage, allies it
// crosses get healed.
//
// Special (Radiant Exchange) targets the CLOSEST enemy in range and bursts a
// 3x3 area centered on it: everything enemy in that blast takes damage and a
// flat ATK debuff; the whole party gets an ATK buff at the same time. Neither
// stacks -- a fresh cast just refreshes the timer and magnitude.

import { RANGED_RANGE, BOSS_SIZE } from "../constants.js";
import { aCardinalDist, distToBoss } from "../geometry.js";
import { attackCooldown, damageBoss } from "../damage.js";
import { speedPenalty } from "../status.js";
import { getRootDef } from "../../core/creatures.js";

const BLAZEHORNET_ROOT_ID = "blazehornet";

function abilityIdx(unit, key, table) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, table.length - 1);
}

/** Starlit's own targeting range (boosted by Starlit Wings), falling back to the engine default. */
function rangeOf(unit) {
  return unit.range || RANGED_RANGE;
}

/** Cardinal distance from `unit` to the boss body's near edge, or Infinity when not aligned. */
function bossCardinalDist(unit, boss) {
  const rowAligned = unit.row >= boss.row && unit.row < boss.row + BOSS_SIZE;
  const colAligned = unit.col >= boss.col && unit.col < boss.col + BOSS_SIZE;
  if (rowAligned) {
    if (unit.col < boss.col) return boss.col - unit.col;
    if (unit.col >= boss.col + BOSS_SIZE) return unit.col - (boss.col + BOSS_SIZE - 1);
    return 0;
  }
  if (colAligned) {
    if (unit.row < boss.row) return boss.row - unit.row;
    if (unit.row >= boss.row + BOSS_SIZE) return unit.row - (boss.row + BOSS_SIZE - 1);
    return 0;
  }
  return Infinity;
}

/** The boss cell nearest `unit` along their shared row/column. */
function bossNearCell(unit, boss) {
  if (unit.row >= boss.row && unit.row < boss.row + BOSS_SIZE) {
    return { row: unit.row, col: unit.col < boss.col ? boss.col : boss.col + BOSS_SIZE - 1 };
  }
  return { row: unit.row < boss.row ? boss.row : boss.row + BOSS_SIZE - 1, col: unit.col };
}

/** True when `o` sits on the straight line from `unit` to (tr,tc), inclusive of the target, exclusive of `unit`. */
function onBeam(unit, tr, tc, o) {
  if (o === unit) return false;
  if (unit.row === tr) {
    if (o.row !== unit.row) return false;
    const lo = Math.min(unit.col, tc), hi = Math.max(unit.col, tc);
    return o.col >= lo && o.col <= hi && o.col !== unit.col;
  }
  if (o.col !== unit.col) return false;
  const lo = Math.min(unit.row, tr), hi = Math.max(unit.row, tr);
  return o.row >= lo && o.row <= hi && o.row !== unit.row;
}

/** Chase waypoint when nothing is currently aligned/in range: whatever's Chebyshev-nearest. */
function nearestFoe(unit, aliveE, boss) {
  let best = null, bestD = Infinity;
  for (const e of aliveE) {
    const d = Math.max(Math.abs(e.row - unit.row), Math.abs(e.col - unit.col));
    if (d < bestD) { bestD = d; best = { row: e.row, col: e.col }; }
  }
  if (boss && boss.hp > 0) {
    const d = distToBoss(boss, unit.row, unit.col);
    if (d < bestD) best = { row: boss.row, col: boss.col };
  }
  return best;
}

/**
 * @param {object} cfg
 * @param {number[]} cfg.basicDmgByLevel  Per-hit damage to each enemy on the Basic beam.
 * @param {number[]} cfg.basicHealByLevel Heal to each ally on the Basic beam, same indexing.
 * @param {number[]} cfg.specialDmgByLevel Damage to each enemy in Radiant Exchange's 3x3 burst.
 * @param {number[]} [cfg.specialHealByLevel] Heal to the whole party on cast, by special-ability level (unlocks at max level).
 * @param {number} cfg.atkModPct  ATK buff (allies) / debuff (enemies) magnitude, as a percent.
 * @param {number} cfg.atkModTicks ATK buff/debuff duration, in battle ticks.
 * @param {number[]} cfg.atkSynergyByLevel +ATK% granted to both Starlit and an allied Blazehornet, by unique-ability level.
 * @param {number[]} cfg.selfSpeedByLevel  +Speed% granted to Starlit itself, by unique-ability level.
 * @param {number} [cfg.rangeBonus=0] Flat tile-range bonus (Starlit Wings' own +2 tile range).
 */
export function makeStarlitModule(cfg) {
  const { basicDmgByLevel, basicHealByLevel, specialDmgByLevel, specialHealByLevel, atkModPct, atkModTicks, atkSynergyByLevel, selfSpeedByLevel, rangeBonus = 0 } = cfg;
  return {
    /** Starlit Wings: +range and +Speed% always; +ATK% to both if an allied Blazehornet is deployed. */
    onBattleStart(unit, allUnits) {
      const idx = abilityIdx(unit, "unique", atkSynergyByLevel);

      unit.range = RANGED_RANGE + rangeBonus;
      unit.spd = unit.spd * (1 + selfSpeedByLevel[idx] / 100);

      const atkPct = atkSynergyByLevel[idx];
      if (!atkPct) return;
      const ally = allUnits.find((o) => o !== unit && getRootDef(o.creatureId)?.id === BLAZEHORNET_ROOT_ID);
      if (!ally) return;
      unit.atk = Math.round(unit.atk * (1 + atkPct / 100));
      ally.atk = Math.round(ally.atk * (1 + atkPct / 100));
    },

    basicAttack(unit, ctx) {
      const { aliveE, aliveP, boss, newFx, now } = ctx;
      if (unit.atkCd > 0) return;

      // Farthest aligned enemy in range wins -- the whole point of this ability.
      const range = rangeOf(unit);
      let best = null;
      for (const e of aliveE) {
        if (e.row !== unit.row && e.col !== unit.col) continue;
        const d = aCardinalDist(unit.row, unit.col, e.row, e.col);
        if (d <= range && (!best || d > best.dist)) best = { tr: e.row, tc: e.col, dist: d };
      }
      if (boss && boss.hp > 0) {
        const bd = bossCardinalDist(unit, boss);
        if (bd <= range && (!best || bd > best.dist)) {
          const cell = bossNearCell(unit, boss);
          best = { tr: cell.row, tc: cell.col, dist: bd };
        }
      }

      if (!best) {
        const chase = nearestFoe(unit, aliveE, boss);
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }

      const idx = abilityIdx(unit, "basic", basicDmgByLevel);
      const dmg = basicDmgByLevel[idx];
      const heal = basicHealByLevel[idx];
      let totalDmg = 0;

      for (const e of aliveE) {
        if (onBeam(unit, best.tr, best.tc, e)) {
          e.hp = Math.max(0, e.hp - dmg);
          totalDmg += dmg;
        }
      }
      if (boss && boss.hp > 0 && bossCardinalDist(unit, boss) <= best.dist) {
        damageBoss(boss, dmg);
        totalDmg += dmg;
      }
      for (const a of aliveP) {
        if (onBeam(unit, best.tr, best.tc, a)) a.hp = Math.min(a.maxHp, a.hp + heal);
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
      newFx.push({ id: now + "pb" + unit.uid, row: best.tr, col: best.tc, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: false });
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    specialCooldown(unit) {
      return Math.max(8, Math.round(20 / (unit.spd || 1)));
    },

    special(unit, ctx) {
      const { aliveE, aliveP, boss, newFx, now } = ctx;

      // Closest enemy in range picks the blast center -- a lobbed burst, not a beam, so no line-of-sight needed.
      const range = rangeOf(unit);
      let centerR = null, centerC = null, bestDist = Infinity;
      for (const e of aliveE) {
        const d = Math.max(Math.abs(e.row - unit.row), Math.abs(e.col - unit.col));
        if (d <= range && d < bestDist) { bestDist = d; centerR = e.row; centerC = e.col; }
      }
      if (boss && boss.hp > 0) {
        const bd = distToBoss(boss, unit.row, unit.col);
        if (bd <= range && bd < bestDist) { bestDist = bd; centerR = boss.row; centerC = boss.col; }
      }
      if (centerR === null) return;

      const idx = abilityIdx(unit, "special", specialDmgByLevel);
      const dmg = specialDmgByLevel[idx];
      const heal = specialHealByLevel ? specialHealByLevel[idx] : 0;
      let totalDmg = 0;

      for (const e of aliveE) {
        if (Math.abs(e.row - centerR) <= 1 && Math.abs(e.col - centerC) <= 1) {
          e.hp = Math.max(0, e.hp - dmg);
          e.atkModTicks = atkModTicks;
          e.atkModPct = -atkModPct;
          totalDmg += dmg;
        }
      }
      if (boss && boss.hp > 0) {
        let overlaps = false;
        for (let dr = 0; dr < BOSS_SIZE && !overlaps; dr++) {
          for (let dc = 0; dc < BOSS_SIZE && !overlaps; dc++) {
            if (Math.abs((boss.row + dr) - centerR) <= 1 && Math.abs((boss.col + dc) - centerC) <= 1) overlaps = true;
          }
        }
        if (overlaps) {
          damageBoss(boss, dmg);
          boss.atkModTicks = atkModTicks;
          boss.atkModPct = -atkModPct;
          totalDmg += dmg;
        }
      }

      // Whole-party buff -- not limited to the blast, this is the "exchange" half of Radiant Exchange.
      // At max level this also recovers HP, matching Radiant Exchange's final upgrade text.
      for (const a of aliveP) {
        a.atkModTicks = atkModTicks;
        a.atkModPct = atkModPct;
        if (heal) a.hp = Math.min(a.maxHp, a.hp + heal);
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
      newFx.push({ id: now + "re" + unit.uid, row: centerR, col: centerC, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: false });
    },
  };
}

export const sacredwasp = makeStarlitModule({
  basicDmgByLevel: [10, 10, 11, 11, 11], basicHealByLevel: [12, 13, 13, 13, 13],
  specialDmgByLevel: [18, 20, 22, 22, 22], specialHealByLevel: [0, 0, 0, 5, 10], atkModPct: 15, atkModTicks: 6,
  atkSynergyByLevel: [10, 20, 30, 40, 40], selfSpeedByLevel: [20, 20, 20, 20, 50], rangeBonus: 2,
});
// Starbright and Starburn intentionally mirror Starlit's numbers exactly for now -- evolutions
// don't yet have differentiated ability scaling, only different base stats/rarity requirements.
export const divinedrone = makeStarlitModule({
  basicDmgByLevel: [10, 10, 11, 11, 11], basicHealByLevel: [12, 13, 13, 13, 13],
  specialDmgByLevel: [18, 20, 22, 22, 22], specialHealByLevel: [0, 0, 0, 5, 10], atkModPct: 15, atkModTicks: 6,
  atkSynergyByLevel: [10, 20, 30, 40, 40], selfSpeedByLevel: [20, 20, 20, 20, 50], rangeBonus: 2,
});
export const holyswarm = makeStarlitModule({
  basicDmgByLevel: [10, 10, 11, 11, 11], basicHealByLevel: [12, 13, 13, 13, 13],
  specialDmgByLevel: [18, 20, 22, 22, 22], specialHealByLevel: [0, 0, 0, 5, 10], atkModPct: 15, atkModTicks: 6,
  atkSynergyByLevel: [10, 20, 30, 40, 40], selfSpeedByLevel: [20, 20, 20, 20, 50], rangeBonus: 2,
});
