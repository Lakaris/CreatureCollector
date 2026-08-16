// Blazehornet line: Twin Sting / Charging Pierce / Burning Bond family.
//
// Mirrors the boss-module pattern (src/battle/bosses/*.js): one small factory
// producing a module per evolution stage, sharing logic but parameterized by
// the numbers that differ stage-to-stage (only the DEF-synergy table here).

import { getRootDef } from "../../core/creatures.js";
import { attackRoll, damageBoss } from "../damage.js";
import { bossOccupies } from "../geometry.js";
import { STATUS_TICKS } from "../constants.js";

/** Hits per attack, indexed by ability level (0-based, level 1 = index 0). */
const HITS_BY_LEVEL = [2, 2, 3, 3, 4];
/** Cumulative basic-attack damage multiplier, same indexing. */
const DMG_MULT_BY_LEVEL = [1, 1.05, 1.05, 1.15, 1.15];

const BURN_DURATION_TICKS = STATUS_TICKS;
const BURN_STACK_CAP = 10;
/** Bonus flat damage per 5 Burn stacks on the target, as a fraction of Blazehornet's ATK (unique lvl 5 only). */
const BURN_BONUS_ATK_FRACTION = 0.08;

const STARLIT_ROOT_ID = "sacredwasp";

/** Charging Pierce: lane width (tiles), indexed by special-ability level. */
const WIDTH_BY_LEVEL = [1, 1, 3, 3, 3];
/** Cumulative per-hit damage multiplier along the charge, same indexing as basic. */
const SPECIAL_DMG_MULT_BY_LEVEL = [1, 1.05, 1.05, 1.15, 1.15];
/** Only the final upgrade (lvl 5) leaves a fire trail. */
const TRAIL_FROM_LEVEL = 4;
const TRAIL_DURATION_TICKS = 6;
/** Ticks between charges, at spd 1 (see attackCooldown's COOLDOWN_TICKS_AT_SPD_1=12 for basic attacks). */
const SPECIAL_COOLDOWN_TICKS = 20;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, HITS_BY_LEVEL.length - 1);
}

/**
 * @param {number[]} defBonusByLevel  +DEF% granted to both Blazehornet and the
 *   allied Starlit, indexed by unique-ability level (0-based).
 */
export function makeBlazehornetModule(defBonusByLevel) {
  return {
    /** Once per battle: if an allied Starlit-line creature is deployed, both gain +DEF. */
    onBattleStart(unit, allUnits) {
      const idx = abilityIdx(unit, "unique");
      const pct = defBonusByLevel[idx];
      if (!pct) return;
      const ally = allUnits.find(
        (o) => o !== unit && getRootDef(o.creatureId)?.id === STARLIT_ROOT_ID
      );
      if (!ally) return;
      unit.def = Math.round(unit.def * (1 + pct / 100));
      ally.def = Math.round(ally.def * (1 + pct / 100));
    },

    /** Twin Sting: attack N times per swing, scaling with basic-ability level. */
    hitsForAttack(unit) {
      return HITS_BY_LEVEL[abilityIdx(unit, "basic")];
    },
    dmgMultForAttack(unit) {
      return DMG_MULT_BY_LEVEL[abilityIdx(unit, "basic")];
    },

    /** Burning Bond: every hit inflicts/refreshes Burn; lvl 5 adds bonus dmg per 5 stacks. */
    onHit(unit, target) {
      target.burnTicks = BURN_DURATION_TICKS;
      target.burnStacks = Math.min((target.burnStacks || 0) + 1, BURN_STACK_CAP);
      target.burnSourceAtk = unit.atk;

      if (abilityIdx(unit, "unique") >= defBonusByLevel.length - 1) {
        const stacksOf5 = Math.floor((target.burnStacks || 0) / 5);
        if (stacksOf5 > 0) {
          const bonus = stacksOf5 * Math.round(unit.atk * BURN_BONUS_ATK_FRACTION);
          return bonus;
        }
      }
      return 0;
    },

    /** Charging Pierce: cooldown between charges, faster at higher Speed. */
    specialCooldown(unit) {
      return Math.max(6, Math.round(SPECIAL_COOLDOWN_TICKS / (unit.spd || 1)));
    },

    /**
     * Charging Pierce is an engage tool -- the dash crosses the whole grid to
     * reach its target, so unlike the engine's default in-attack-range hold
     * (see specialTargetInRange in battle/tick.js) it fires whenever any foe
     * exists at all.
     */
    specialInRange(unit, { aliveE, boss }) {
      return aliveE.length > 0 || !!(boss && boss.hp > 0);
    },

    /**
     * Charging Pierce: dash in a straight line toward the nearest foe until
     * hitting the grid wall, dealing damage to every enemy along the way
     * (1 lane at low level, 3 parallel lanes -- self + 1 either side -- from
     * level 3). Lands on the last open tile before the wall, bouncing to the
     * nearest free cell if that tile is occupied. Level 5 leaves a fire trail
     * along the path (handled by the caller via ctx.addFireTrail).
     */
    special(unit, ctx) {
      const { aliveE, boss, gridRows, gridCols, newFx, now } = ctx;

      const enemyPoints = aliveE.filter((e) => e.hp > 0).map((e) => ({ row: e.row, col: e.col }));
      if (boss && boss.hp > 0) enemyPoints.push({ row: boss.row + 0.5, col: boss.col + 0.5 });
      if (!enemyPoints.length) return;

      let nearest = null, bestD = Infinity;
      for (const p of enemyPoints) {
        const d = Math.max(Math.abs(p.row - unit.row), Math.abs(p.col - unit.col));
        if (d < bestD) { bestD = d; nearest = p; }
      }

      const ddr = nearest.row - unit.row, ddc = nearest.col - unit.col;
      const [dr, dc] = Math.abs(ddr) >= Math.abs(ddc)
        ? [ddr >= 0 ? 1 : -1, 0]
        : [0, ddc >= 0 ? 1 : -1];
      const [pr, pc] = dr !== 0 ? [0, 1] : [1, 0]; // perpendicular unit vector

      const idx = abilityIdx(unit, "special");
      const width = WIDTH_BY_LEVEL[idx];
      const dmgMult = SPECIAL_DMG_MULT_BY_LEVEL[idx];
      const offsets = width === 3 ? [-1, 0, 1] : [0];

      const trailCells = [];
      let hitBoss = false;
      let landing = null;

      for (const off of offsets) {
        let r = unit.row + pr * off, c = unit.col + pc * off;
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue;
        let last = null;
        while (true) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= gridRows || nc < 0 || nc >= gridCols) break;
          r = nr; c = nc;
          last = [r, c];
          trailCells.push(r + "," + c);
          newFx.push({ id: now + "charge" + unit.uid + r + "_" + c, row: r, col: c, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

          const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * dmgMult));
          const minion = aliveE.find((e) => e.hp > 0 && e.row === r && e.col === c);
          if (minion) minion.hp = Math.max(0, minion.hp - dmg);
          if (!hitBoss && boss && boss.hp > 0 && bossOccupies(boss, r, c)) {
            damageBoss(boss, dmg);
            hitBoss = true;
          }
        }
        if (off === 0) landing = last;
      }

      if (landing) {
        const [lr, lc] = landing;
        const dest = ctx.blocked(lr, lc) ? ctx.nearestOpenCell(lr, lc) : [lr, lc];
        if (dest) ctx.relocate(dest[0], dest[1]);
      }

      if (idx >= TRAIL_FROM_LEVEL && trailCells.length) {
        ctx.addFireTrail(trailCells, TRAIL_DURATION_TICKS, unit.atk);
      }
    },
  };
}

export const blazehornet = makeBlazehornetModule([10, 20, 30, 40, 40]);
export const infernohive = makeBlazehornetModule([15, 25, 35, 45, 45]);
export const infernoswarm = makeBlazehornetModule([20, 30, 40, 50, 50]);
