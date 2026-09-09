// Bonebeak line: Carrion Rip / Gorge / Death Feast.
//
// Carrion Rip keeps the engine's default melee flow (closest enemy) with
// per-level damage scaling, and every landed hit plants a stack of Damage
// Over Time -- two at max level. The rot itself ticks off the victim's own
// max Health (see DOT_HEALTH_PCT in battle/status.js), so a stack costs the
// same share of anyone's health bar.
//
// Gorge is the payoff: it strips every DoT stack off its target and converts
// them into burst, +5% damage per stack eaten. At max level, a kill scatters
// 2 fresh stacks onto a random surviving enemy, so the feeding never stops.
//
// Death Feast does two things. Its targeting half is a preference, not a
// pull: among foes ALREADY in reach the vulture picks a rotting one, which
// lives in tick.js's selectTarget (dotFoeInRange) behind the
// `prefersDotTargets` flag set below, ranked under Taunt/retaliation/Marked.
// Its other half feeds on death -- ANY death, ally or enemy -- recovering
// Health and banking permanent Attack and Defense. Deaths are spotted by
// watching the alive count between ticks, since the engine has no death
// event; the stat gains multiply battle-start snapshots rather than
// compounding on live values, so repeated feeds stay exact.

import { attackRoll, playerDamageToBoss, damageBoss } from "../damage.js";
import { unitDist, distToBoss } from "../geometry.js";
import { MELEE_RANGE, BASIC_DMG_BASELINE } from "../constants.js";
import { isIntangible, applyDot, clearDot, healReceivedMultiplier } from "../status.js";
import { damageUnit, healUnit } from "../hp.js";

/** Displayed damage by level; the engine scales off the base level's value. */
const BASIC_DMG_BY_LEVEL = [14, 18, 23, 29, 29];
const SPECIAL_DMG_BY_LEVEL = [36, 45, 56, 70, 70];
/** Carrion Rip: DoT stacks planted per landed hit (2 at max level). */
const BASIC_STACKS = 1;
const BASIC_STACKS_MAX = 2;
/** Gorge: extra damage per DoT stack eaten. */
const GORGE_BONUS_PCT_PER_STACK = 5;
/** Gorge lvl 5: stacks scattered onto a random enemy when it lands a kill. */
const SPREAD_STACKS = 2;
/** Death Feast, by unique level: % max Health recovered, and % ATK/DEF gained. */
const FEAST_HEAL_PCT_BY_LEVEL = [10, 15, 20, 20, 20];
const FEAST_ATK_PCT_BY_LEVEL = [5, 5, 5, 5, 10];
const FEAST_DEF_PCT_BY_LEVEL = [5, 5, 5, 10, 10];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** The dark boss's heal-block gates Death Feast's recovery. */
function canBeHealed(u) {
  return (u.healImmuneTicks || 0) <= 0;
}

export function makeBonebeakModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, healPctByLevel, atkPctByLevel, defPctByLevel } = cfg;

  /** Recompute ATK/DEF from the battle-start snapshot and the meals banked. */
  function applyFeast(unit) {
    if (unit._feastBaseAtk == null) return;
    const idx = abilityIdx(unit, "unique");
    const n = unit._feastStacks || 0;
    unit.atk = Math.round(unit._feastBaseAtk * (1 + (n * atkPctByLevel[idx]) / 100));
    unit.def = Math.round(unit._feastBaseDef * (1 + (n * defPctByLevel[idx]) / 100));
  }

  /** Everything still standing, both sides plus the boss. */
  function aliveCount(ctx) {
    let n = 0;
    for (const u of ctx.aliveP) if (u.hp > 0) n++;
    for (const e of ctx.aliveE) if (e.hp > 0) n++;
    if (ctx.boss && ctx.boss.hp > 0) n++;
    return n;
  }

  return {
    onBattleStart(unit) {
      // Death Feast multiplies these snapshots rather than compounding on
      // live values, so every meal recomputes exactly.
      unit._feastBaseAtk = unit.atk;
      unit._feastBaseDef = unit.def;
      unit._feastStacks = 0;
      unit._feastSeen = null;
      // Read by selectTarget in tick.js -- prefer rotting foes already in reach.
      unit.prefersDotTargets = true;
    },

    /** Carrion Rip: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Carrion Rip: every landed hit plants rot (two stacks at max level). */
    onHit(unit, target, dealt) {
      if (target && dealt > 0) {
        applyDot(target, abilityIdx(unit, "basic") >= MAX_IDX ? BASIC_STACKS_MAX : BASIC_STACKS);
      }
      return 0;
    },

    /**
     * Death Feast's feeding half. The engine fires no death event, so the
     * vulture watches the head-count between ticks: any drop is a meal,
     * whoever it was. Deaths mid-tick surface on the next one, which is
     * close enough at 500ms a tick.
     */
    onTick(unit, ctx) {
      const alive = aliveCount(ctx);
      if (unit._feastSeen == null) { unit._feastSeen = alive; return; }
      if (alive < unit._feastSeen) {
        const idx = abilityIdx(unit, "unique");
        const meals = unit._feastSeen - alive;
        for (let i = 0; i < meals; i++) {
          if (unit.hp > 0 && canBeHealed(unit)) {
            const heal = Math.round(((unit.maxHp * healPctByLevel[idx]) / 100) * healReceivedMultiplier(unit));
            if (heal > 0) healUnit(unit, heal);
          }
          unit._feastStacks = (unit._feastStacks || 0) + 1;
        }
        applyFeast(unit);
        ctx.newFx.push({ id: ctx.now + "df" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit._feastSeen = alive;
    },

    /**
     * Gorge: eat the rot off the closest foe in reach. Every stack stripped
     * is +5% damage on this strike, and at max level a kill seeds a random
     * survivor with fresh stacks.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const spreads = idx >= MAX_IDX;

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        const d = unitDist(unit, e);
        if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
      }
      const bossD = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;

      // The boss can be gorged on too; it carries stacks like anyone else.
      if (!best && bossD <= MELEE_RANGE) {
        const eaten = clearDot(boss);
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, ctx.aliveP) * mult * (1 + (eaten * GORGE_BONUS_PCT_PER_STACK) / 100)));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "gg" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isDark: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
      if (!best) return;

      const eaten = clearDot(best);
      const dmg = Math.max(1, Math.round(attackRoll(unit) * mult * (1 + (eaten * GORGE_BONUS_PCT_PER_STACK) / 100)));
      const dealt = damageUnit(best, dmg);
      ctx.addDamageDealt(dealt);
      newFx.push({ id: now + "gg" + unit.uid + best.uid, row: best.row, col: best.col, t: now, isDark: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

      if (spreads && best.hp <= 0) {
        const survivors = aliveE.filter((e) => e !== best && e.hp > 0 && !isIntangible(e));
        if (survivors.length) {
          const victim = survivors[Math.floor(Math.random() * survivors.length)];
          applyDot(victim, SPREAD_STACKS);
          newFx.push({ id: now + "ggs" + unit.uid + victim.uid, row: victim.row, col: victim.col, t: now, isDark: true, fromRow: best.row, fromCol: best.col, isEnemy: !!ctx.isEnemySide });
        }
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  healPctByLevel: FEAST_HEAL_PCT_BY_LEVEL,
  atkPctByLevel: FEAST_ATK_PCT_BY_LEVEL,
  defPctByLevel: FEAST_DEF_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const bonebeak = makeBonebeakModule(CFG);
export const gravewing = makeBonebeakModule(CFG);
export const charnelord = makeBonebeakModule(CFG);
