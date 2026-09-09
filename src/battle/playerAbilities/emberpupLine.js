// Emberpup line: Hellfang / Dread Howl / Cinder Scent.
//
// The line hunts what is already burning. Dread Howl sets the ground alight
// and scatters whoever was standing there; Cinder Scent turns that fire into
// both extra Attack and extra reach, so the hound lunges through its own
// blaze at prey that is trying to run.
//
// Hellfang owns its targeting (a basicAttack override) rather than riding the
// engine's default flow, because Cinder Scent's reach bonus is conditional on
// the TARGET -- the hound strikes 3 tiles further at a foe standing in fire,
// but does not chase any further than usual. attackRangeOf is per-unit, so
// the per-target reach lives here instead. At max level a landed bite also
// briefly Roots.
//
// Dread Howl breathes down a Cone (1 tile, then 3, then 5 -- see coneCells),
// damaging everything caught and leaving a Fire Hazard across the same wedge.
// At max level everything hit is also Feared: it flees the hound and can
// neither attack nor cast while it runs (see applyFear in battle/status.js).
//
// Cinder Scent reads the ground through ctx.hazardsOn, stashed each tick
// because the attack hooks receive no context of their own.

import { aChebDist, distToBoss, bossOccupies, coneCells } from "../geometry.js";
import { basicUnitDamage, basicDamageToBoss, damageBoss, attackRoll, attackCooldown } from "../damage.js";
import { MELEE_RANGE, RANGED_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { isIntangible, isStunned, speedPenalty, consumeBlind, applyRoot, applyFear } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
const SPECIAL_DMG_BY_LEVEL = [24, 29, 34, 40, 40];
/** Cinder Scent: bonus Attack against a foe standing in a Fire Hazard. */
const SCENT_ATK_PCT_BY_LEVEL = [20, 30, 40, 50, 50];
/** Cinder Scent lvl 5: extra reach against those same foes. */
const SCENT_RANGE_BONUS = 3;
/** Hellfang lvl 5: "briefly" -- the game's 3-tick short duration. */
const ROOT_TICKS = 3;
/** Dread Howl lvl 5: Fear runs the standard duration. */
const FEAR_TICKS = STATUS_TICKS;
/** The Cone reaches 3 tiles out, widening 1 / 3 / 5. */
const CONE_DEPTH = 3;
/** The trail left behind: duration, and damage as a share of this ATK --
 * the same rate Emberstar's Charging Pierce trail uses. */
const HAZARD_TICKS = STATUS_TICKS;
const HAZARD_DMG_RATE = 0.03;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeEmberpupModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, scentAtkPctByLevel } = cfg;

  /** Is this foe standing in a Fire Hazard? Reads the query stashed by
   * onTick; false before the first tick has run. */
  const inFire = (unit, r, c) => !!(unit._hazardsOn && unit._hazardsOn(r, c, "fire"));
  const bossInFire = (unit, boss) => {
    for (let dr = 0; dr < 2; dr++) for (let dc = 0; dc < 2; dc++) {
      if (inFire(unit, boss.row + dr, boss.col + dc)) return true;
    }
    return false;
  };
  /** Cinder Scent's Attack bonus, as a damage multiplier. */
  const scentMult = (unit, burning) =>
    burning ? 1 + scentAtkPctByLevel[abilityIdx(unit, "unique")] / 100 : 1;

  return {
    /**
     * Stash what the attack hooks and the special's gate need but never
     * receive: the ground query (Cinder Scent) and which way this creature
     * faces (the Cone). specialInRange is given no side flag, and onTick runs
     * before it every tick, so the facing is always current by then.
     */
    onTick(unit, ctx) {
      unit._hazardsOn = ctx.hazardsOn;
      // Forward is -row for the player's side (it deploys at the high rows,
      // the enemy at the low ones) and +row for the enemy side.
      unit._coneDir = ctx.isEnemySide ? 1 : -1;
    },

    /**
     * Hellfang: bite the closest foe within reach -- 3 tiles further when
     * that foe is standing in a Fire Hazard (Cinder Scent at max). Chases
     * the nearest foe at ORDINARY reach when nothing qualifies, so the bonus
     * buys a longer strike, never a longer pursuit.
     */
    basicAttack(unit, ctx) {
      const { aliveE, aliveP, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "basic");
      const mult = basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const roots = idx >= MAX_IDX;
      const base = unit.isRanged ? RANGED_RANGE : MELEE_RANGE;
      const bonus = abilityIdx(unit, "unique") >= MAX_IDX ? SCENT_RANGE_BONUS : 0;

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        const burning = inFire(unit, e.row, e.col);
        if (d <= base + (burning ? bonus : 0) && d < bestD) { bestD = d; best = { unit: e, burning }; }
      }
      const bossD = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      if (bossD < Infinity) {
        const burning = bossInFire(unit, boss);
        if (bossD <= base + (burning ? bonus : 0) && bossD < bestD) { bestD = bossD; best = { isBoss: true, burning }; }
      }

      if (!best) {
        // Nothing in reach: walk at the nearest thing, ordinary rules.
        let chase = null, chaseD = Infinity;
        for (const e of aliveE) {
          if (e.hp <= 0 || isIntangible(e)) continue;
          const d = aChebDist(unit.row, unit.col, e.row, e.col);
          if (d < chaseD) { chaseD = d; chase = e; }
        }
        if (boss && boss.hp > 0 && bossD < chaseD) chase = { row: boss.row, col: boss.col };
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }
      if (unit.atkCd > 0 || isStunned(unit)) return;
      // Blinded: the bite misses entirely, cooldown still paid.
      if (consumeBlind(unit)) { unit.atkCd = attackCooldown(unit, speedPenalty(unit)); return; }

      const scent = scentMult(unit, best.burning);
      if (best.isBoss) {
        // Bosses take the bite but can not be Rooted -- same CC-immunity
        // policy as Taunt.
        const dmg = Math.max(1, Math.round(basicDamageToBoss(unit, boss, aliveP) * mult * scent));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      } else {
        const tgt = best.unit;
        const dmg = Math.max(1, Math.round(basicUnitDamage(unit, tgt) * mult * scent));
        const dealt = damageUnit(tgt, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        // A dodged or redirected bite pins nothing.
        if (roots && dealt > 0 && !tgt._dodgedHit && !tgt._redirectedTo) applyRoot(tgt, ROOT_TICKS);
        newFx.push({ id: now + unit.uid, row: tgt.row, col: tgt.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /** Dread Howl fires once anything stands in the wedge ahead. */
    specialInRange(unit, { aliveE, boss }) {
      const dir = unit._coneDir || 1;
      const cells = new Set(coneCells(unit.row, unit.col, dir, CONE_DEPTH).map(([r, c]) => r + "," + c));
      if (aliveE.some((e) => e.hp > 0 && !isIntangible(e) && cells.has(e.row + "," + e.col))) return true;
      if (boss && boss.hp > 0) {
        for (const cell of cells) {
          const [r, c] = cell.split(",").map(Number);
          if (bossOccupies(boss, r, c)) return true;
        }
      }
      return false;
    },

    /**
     * Dread Howl: damage everything in the Cone, scatter it at max level,
     * and leave the whole wedge burning.
     */
    special(unit, ctx) {
      const { aliveE, aliveP, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const fears = idx >= MAX_IDX;
      const dir = ctx.isEnemySide ? 1 : -1;
      // Clip to the board: a cone cast from an edge would otherwise lay
      // hazard on cells that do not exist and paint FX outside the grid.
      const cellPairs = coneCells(unit.row, unit.col, dir, CONE_DEPTH)
        .filter(([r, c]) => r >= 0 && r < ctx.gridRows && c >= 0 && c < ctx.gridCols);
      const cells = cellPairs.map(([r, c]) => r + "," + c);
      const cellSet = new Set(cells);

      // Paint the whole wedge, not just the tiles that happened to hold a
      // target -- the shape IS the ability, and an empty cone still needs to
      // read as one.
      for (const [r, c] of cellPairs) {
        newFx.push({ id: now + "dhc" + unit.uid + r + "_" + c, row: r, col: c, t: now, isBurn: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e) || !cellSet.has(e.row + "," + e.col)) continue;
        const scent = scentMult(unit, inFire(unit, e.row, e.col));
        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult * scent));
        const dealt = damageUnit(e, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        if (fears) applyFear(e, unit.uid, FEAR_TICKS);
      }
      if (boss && boss.hp > 0) {
        let overlaps = false;
        for (const [r, c] of cellPairs) { if (bossOccupies(boss, r, c)) { overlaps = true; break; } }
        if (overlaps) {
          // Bosses take the howl but are immune to Fear, like every other
          // forced-movement and control effect.
          const dmg = Math.max(1, Math.round(attackRoll(unit) * mult * scentMult(unit, bossInFire(unit, boss))));
          damageBoss(boss, dmg);
          ctx.addDamageDealt(dmg);
          newFx.push({ id: now + "dhb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isBurn: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }

      ctx.addHazard(cells, HAZARD_TICKS, Math.max(1, Math.round(unit.atk * HAZARD_DMG_RATE)), "fire");
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  scentAtkPctByLevel: SCENT_ATK_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const emberpup = makeEmberpupModule(CFG);
export const emberhound = makeEmberpupModule(CFG);
export const infernoking = makeEmberpupModule(CFG);
export const ashmonarch = makeEmberpupModule(CFG);
