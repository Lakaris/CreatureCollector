// Voltravene line (three-headed storm dragons): Trident Arc / Storm Lance /
// Stormsight.
//
// Trident Arc is the three heads, and it owns the whole Basic turn (targeting,
// damage, cooldown, chasing), like the other basicAttack overrides. Each head
// picks by its own rule -- the Weakest, the Closest and the Farthest enemy it
// can reach -- and two heads that pick the same creature both land on it. All
// three are ONE attack, one use of the Basic: per-attack gear counts it once,
// per-hit gear counts each head. Each head is priced at a third of a normal
// Legendary Attacker's Basic, so three on one target matches one -- until the
// max tier, where the second head on the same enemy deals +50% and the third
// +100% (the card's "each additional attack" means each additional HEAD).
//
// A Taunt or a Marked foe overrides all three rules at once: every head goes
// for that creature, as the default attack flow would send its one swing.
//
// Storm Lance is Inferno Breath's shape: a ray from the dragon toward the
// nearest cardinally-aligned enemy, out to the arena's edge. At max level it
// leaves a Lightning Hazard along that whole ray (see lightningStrikesCaster in
// battle/tick.js for what the Hazard does).
//
// Stormsight reads that ground. The Basic deals more to an enemy standing on a
// Lightning Hazard -- ANY Lightning Hazard -- and can reach one from any range,
// so a Hazard behind the enemy line drags the Farthest head out to it. At max
// level the dragon also gains flat Speed for every enemy standing in a Hazard
// IT laid; recounted every tick, it lapses the moment they step off.

import { attackRangeOf, unitDist, occupies, cardinalStepToward, cellsOf } from "../geometry.js";
import { basicUnitDamage, attackRoll, attackCooldown } from "../damage.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { speedPenalty, isStunned, isIntangible, consumeBlind, applyWhileActiveStatMod } from "../status.js";
import { damageUnit } from "../hp.js";

/** Displayed damage per head by level; the engine deals stat-based damage
 * scaled by the current level's value over BASIC_DMG_BASELINE. A third of a
 * Legendary Attacker's 30 / 34 / 38 / 43 / 43, so three heads on one target
 * add up to one normal Basic. */
const BASIC_DMG_BY_LEVEL = [10, 11, 13, 14, 14];
/** Trident Arc lvl 5: extra damage per head already landed on the same enemy
 * this attack -- the 2nd head +50%, the 3rd +100%. */
const REPEAT_HIT_BONUS_PCT = 50;
/** Storm Lance: damage to every enemy on the ray, by special level. */
const SPECIAL_DMG_BY_LEVEL = [55, 62, 70, 80, 80];
/** Storm Lance lvl 5: the Lightning Hazard's lifetime ("temporarily", the
 * unmarked duration) and its move damage as a share of the dragon's Attack --
 * Waddlepop's rate, the other hazard that only hurts on an event. A Special
 * cast on it hits harder still (LIGHTNING_CAST_DMG_MULT in battle/tick.js). */
const HAZARD_TICKS = STATUS_TICKS;
const HAZARD_ATK_RATE = 0.25;
/** Stormsight: Basic damage bonus vs enemies on a Lightning Hazard. */
const STORMSIGHT_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
/** Stormsight lvl 5: flat Speed per enemy standing in this dragon's Hazards. */
const SPEED_PER_FOE_PCT = 2;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** Is `t` on a Lightning Hazard -- any tile of its body (a boss spans four)?
 * `own` narrows it to the Hazards this dragon laid. */
function onLightning(ctx, t, own = false) {
  const on = own ? ctx.ownHazardOn : ctx.hazardsOn;
  return cellsOf(t.ref).some((k) => { const [r, c] = k.split(",").map(Number); return on(r, c, "lightning"); });
}

export function makeVoltraveneModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, stormsightPctByLevel } = cfg;
  return {
    /**
     * Stormsight lvl 5: Speed for every enemy standing in a Hazard this dragon
     * laid. Re-stamped each tick at the current count -- one stack per source,
     * so the value simply tracks the count -- and not stamped at all at zero,
     * so it lapses on its own.
     */
    onTick(unit, ctx) {
      if (abilityIdx(unit, "unique") < MAX_IDX) return;
      let foes = 0;
      for (const e of ctx.aliveE) if (e.hp > 0 && onLightning(ctx, { ref: e }, true)) foes++;
      if (foes) applyWhileActiveStatMod(unit, { kind: "spd", pct: SPEED_PER_FOE_PCT * foes, src: unit.uid });
    },

    /** Trident Arc. */
    basicAttack(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      if (isStunned(unit)) return;
      const range = attackRangeOf(unit);

      // Everything a head could pick: whatever is in range, plus -- Stormsight
      // -- anything standing on a Lightning Hazard, at any range.
      const pool = [];
      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        const t = { ref: e, d: unitDist(unit, e) };
        t.charged = onLightning(ctx, t);
        if (t.d <= range || t.charged) pool.push(t);
      }

      // A Taunt, then a Marked foe in reach, takes all three heads -- the same
      // priority the default attack flow gives its single swing.
      const taunter = (unit.tauntTicks || 0) > 0 && unit.tauntSourceUid != null
        ? aliveE.find((e) => e.uid === unit.tauntSourceUid && e.hp > 0 && !isIntangible(e)) : null;
      let forced = null;
      if (taunter) {
        forced = pool.find((t) => t.ref === taunter);
        // Taunted but out of reach: close in on the taunter, nothing else.
        if (!forced) { ctx.stepToward(taunter.row, taunter.col); return; }
      } else {
        const marked = pool.filter((t) => (t.ref.markedTicks || 0) > 0 && t.d <= range);
        if (marked.length) forced = marked.reduce((a, b) => (b.d < a.d ? b : a));
      }

      if (!pool.length) {
        // Nothing in reach: chase whatever is nearest.
        let chase = null, chaseD = Infinity;
        for (const e of aliveE) {
          if (e.hp <= 0 || isIntangible(e)) continue;
          const d = unitDist(unit, e);
          if (d < chaseD) { chaseD = d; chase = e; }
        }
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }
      if (unit.atkCd > 0) return;
      // Blinded: all three heads miss, cooldown still paid.
      if (consumeBlind(unit)) { unit.atkCd = attackCooldown(unit, speedPenalty(unit)); unit.lastAttackTime = now; return; }

      // One pick per head. Ties go to the first found.
      const hp = (t) => t.ref.hp;
      const picks = forced
        ? [forced, forced, forced]
        : [
            pool.reduce((a, b) => (hp(b) < hp(a) ? b : a)), // Weakest
            pool.reduce((a, b) => (b.d < a.d ? b : a)),     // Closest
            pool.reduce((a, b) => (b.d > a.d ? b : a)),     // Farthest
          ];

      const bIdx = abilityIdx(unit, "basic");
      const uIdx = abilityIdx(unit, "unique");
      const mult = basicDmgByLevel[bIdx] / BASIC_DMG_BASELINE;
      const repeats = bIdx >= MAX_IDX;
      const landed = new Map();

      for (const t of picks) {
        // A head whose target fell to an earlier head this attack is spent.
        if (t.ref.hp <= 0) continue;
        const n = landed.get(t) || 0;
        landed.set(t, n + 1);
        let m = mult;
        if (repeats) m *= 1 + (REPEAT_HIT_BONUS_PCT * n) / 100;
        if (t.charged) m *= 1 + stormsightPctByLevel[uIdx] / 100;
        const dmg = Math.max(1, Math.round(basicUnitDamage(unit, t.ref) * m));
        const dealt = damageUnit(t.ref, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        const mid = ((t.ref.size || 1) - 1) / 2;
        newFx.push({ id: now + "ta" + unit.uid + t.ref.uid + "_" + n, row: t.ref.row + mid, col: t.ref.col + mid, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
      unit.lastAttackTime = now;
    },

    /** Storm Lance needs an enemy in line -- an enemy-targeting Special, so it
     * waits for one rather than firing off cooldown. */
    specialInRange(unit, { aliveE }) {
      return aliveE.some((e) => e.hp > 0 && !isIntangible(e) && cardinalStepToward(unit, e));
    },

    /** Storm Lance: torch the ray toward the nearest aligned foe, to the edge. */
    special(unit, ctx) {
      const { aliveE, gridRows, gridCols, newFx, now } = ctx;
      let dir = null, bestDist = Infinity;
      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        const step = cardinalStepToward(unit, e);
        if (step && step.dist < bestDist) {
          bestDist = step.dist;
          dir = step;
        }
      }
      if (!dir) return;

      const idx = abilityIdx(unit, "special");
      const ratio = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const cells = [];
      // Once per creature however many of its tiles the ray crosses.
      const struck = new Set();
      let r = unit.row + dir.dr, c = unit.col + dir.dc;
      while (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
        cells.push(r + "," + c);
        newFx.push({ id: now + "sl" + unit.uid + r + "_" + c, row: r, col: c, t: now, isShock: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        const foe = aliveE.find((e) => e.hp > 0 && !isIntangible(e) && !struck.has(e) && occupies(e, r, c));
        if (foe) {
          struck.add(foe);
          ctx.addDamageDealt(damageUnit(foe, Math.max(1, Math.round(attackRoll(unit) * ratio))));
        }
        r += dir.dr;
        c += dir.dc;
      }
      // Max level: the struck ray stays live as a Lightning Hazard.
      if (idx >= MAX_IDX && cells.length) {
        ctx.addHazard(cells, HAZARD_TICKS, Math.max(1, Math.round(unit.atk * HAZARD_ATK_RATE)), "lightning");
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  stormsightPctByLevel: STORMSIGHT_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const voltravene = makeVoltraveneModule(CFG);
export const arcmajor = makeVoltraveneModule(CFG);
