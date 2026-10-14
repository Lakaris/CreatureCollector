// Puddlet (heron) line: Beak Jab / Spear Flurry / Skewer.
//
// Beak Jab keeps the engine's default melee attack flow (closest enemy, Blind,
// Dodge, Protect, reflects and the per-attack gear all as usual); every
// upgrade is +damage, and the max tier inflicts Defense Down on every enemy it
// hits -- Pierced ones included (not a boss: it shrugs off on-hit effects, see
// ignoresOnHitEffects).
//
// Spear Flurry strikes the closest enemy in melee reach 3 times. The card
// number is the TOTAL, so each hit carries a third of it (the rule every
// multi-hit follows). If the target falls mid-flurry, the remaining hits go
// to the next closest enemy in reach. At max, the cast grants 1% Speed per
// enemy it hit -- each enemy once, Pierced ones included -- as its own exact
// percentage (not the Speed Up buff; see `exact` in applyStatMod).
//
// Skewer: every Basic and Spear Flurry hit Pierces -- it carries on through
// its target to the enemies straight behind it (1 tile, 2 at max), each
// taking the hit for 5-20% more. Only the enemies BEHIND the initial target
// count as Pierced; the target itself takes the hit as normal. A 2x2 target
// (a boss) takes the hit alone, nothing passes through it, though a boss
// standing behind a target is Pierced like anyone. A gear rider hit (Chain,
// Twin Fang, ...) never Pierces onward.

import { basicUnitDamage, attackRoll } from "../damage.js";
import { unitDist, occupies } from "../geometry.js";
import { MELEE_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { battleRoster, sameSide } from "../applier.js";
import { applyStatMod, isIntangible } from "../status.js";
import { hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [14, 18, 23, 29, 29];
/** Spear Flurry's TOTAL across its hits. */
const SPECIAL_DMG_BY_LEVEL = [36, 45, 57, 69, 69];
const SPECIAL_HITS = 3;
/** Skewer: extra damage Pierced enemies take, by unique level. */
const PIERCE_BONUS_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
/** Beak Jab max tier: one Defense Down stack (the shared table sets the total). */
const DEF_DOWN_PCT = 15;
/** Spear Flurry max tier: Speed per enemy hit. */
const SPEED_PER_ENEMY_PCT = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** How many enemies an attack passes through behind its target. */
const pierceDepth = (unit) => (abilityIdx(unit, "unique") >= MAX_IDX ? 2 : 1);
const pierceMult = (unit) => 1 + PIERCE_BONUS_PCT_BY_LEVEL[abilityIdx(unit, "unique")] / 100;

/** Beak Jab max tier: Defense Down on what it hits (never a boss). */
function shred(unit, target) {
  if (abilityIdx(unit, "basic") < MAX_IDX || target.hp <= 0 || hasRule(target, "ignoresOnHitEffects")) return;
  applyStatMod(target, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
}

/** The enemies straight behind `target`, seen from `unit`: the tiles past it
 * along the attack's direction, up to the Pierce depth, nearest first. A 2x2
 * target lets nothing through. */
function piercedBehind(unit, target) {
  if ((target.size || 1) > 1) return [];
  const dr = Math.sign(target.row - unit.row), dc = Math.sign(target.col - unit.col);
  if (!dr && !dc) return [];
  const foes = battleRoster().filter((e) => e.hp > 0 && e !== target && !sameSide(e, unit) && !isIntangible(e));
  const out = [];
  for (let k = 1; k <= pierceDepth(unit); k++) {
    const r = target.row + dr * k, c = target.col + dc * k;
    for (const e of foes) if (!out.includes(e) && occupies(e, r, c)) out.push(e);
  }
  return out.slice(0, pierceDepth(unit));
}

export function makePuddletModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel } = cfg;
  return {
    /** Beak Jab: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /**
     * Every landed Beak Jab hit: the max tier's Defense Down, then Skewer's
     * Pierce through to the enemies behind. Rider hits (gear) are the
     * attack's too and carry the Defense Down, but never Pierce onward.
     */
    onHit(unit, target) {
      shred(unit, target);
      if (unit._attackRiders || unit._skewering) return 0;
      unit._skewering = true;
      try {
        const ratio = basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
        for (const e of piercedBehind(unit, target)) {
          // Banked for the damage chart (takeExtraBasicDmg in tick.js).
          unit._extraBasicDmg = (unit._extraBasicDmg || 0) + (damageUnit(e, Math.max(1, Math.round(basicUnitDamage(unit, e) * ratio * pierceMult(unit)))) || 0);
          shred(unit, e);
        }
      } finally {
        unit._skewering = false;
      }
      return 0;
    },

    /** Spear Flurry: 3 hits on the closest enemy in reach, each Piercing. */
    special(unit, ctx) {
      const { newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const perHit = specialDmgByLevel[idx] / BASIC_DMG_BASELINE / SPECIAL_HITS;
      const closestInReach = () => {
        let best = null, bestD = Infinity;
        for (const e of ctx.aliveE) {
          if (e.hp <= 0 || isIntangible(e)) continue;
          const d = unitDist(unit, e);
          if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
        }
        return best;
      };
      const struck = new Set();
      let target = closestInReach();
      for (let i = 0; i < SPECIAL_HITS && target; i++) {
        const dmg = Math.max(1, Math.round(attackRoll(unit) * perHit));
        ctx.addDamageDealt(damageUnit(target, dmg) || 0);
        struck.add(target);
        for (const e of piercedBehind(unit, target)) {
          ctx.addDamageDealt(damageUnit(e, Math.max(1, Math.round(attackRoll(unit) * perHit * pierceMult(unit)))) || 0);
          struck.add(e);
        }
        const mid = ((target.size || 1) - 1) / 2;
        newFx.push({ id: now + "sf" + i + unit.uid, row: target.row + mid, col: target.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        if (target.hp <= 0) target = closestInReach();
      }
      if (idx >= MAX_IDX && struck.size) {
        applyStatMod(unit, { kind: "spd", pct: SPEED_PER_ENEMY_PCT * struck.size, src: unit.uid, ticks: STATUS_TICKS, exact: true });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const puddlet = makePuddletModule(CFG);
export const wadewing = makePuddletModule(CFG);
export const heronarch = makePuddletModule(CFG);
