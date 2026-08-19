// Nessling line: Loch Spout / Deep Submerge / Stirring Depths.
//
// Loch Spout is a ranged jet at the FARTHEST enemy in range (boss included);
// it owns targeting and chase movement like other basicAttack overrides. At
// max level every landed hit also inflicts a Haste Down stack (-5% charge
// rate per stack -- see statModMultiplier "haste" in battle/status.js).
//
// Deep Submerge dives: Nessling becomes Intangible for a few ticks (can not
// be targeted or damaged -- hp.js gates the damage, selectTarget and the
// boss context skip it -- while its tile stays occupied) and heals itself on
// the way down. When it surfaces it strikes the FRONT ROW -- the 3x1 line of
// cells directly ahead (toward the enemy side) -- Taunting everyone hit, and
// at max level also inflicting an Attack Down stack. The ~30 charge cost is
// deliberately huge: Stirring Depths is what actually pays for it.
//
// Stirring Depths grants a sliver of ability charge every time this creature
// takes an attack hit (onDamaged, attack-path only -- same scoping as Prism
// Shell's reflect). A tank being focused refills Deep Submerge much faster
// than the base charge rate alone.

import { unitDamage, playerDamageToBoss, damageBoss, attackRoll, attackCooldown } from "../damage.js";
import { aChebDist, distToBoss, bossOccupies } from "../geometry.js";
import { RANGED_RANGE, STATUS_TICKS } from "../constants.js";
import { speedPenalty, isStunned, isIntangible, applyStatMod, healReceivedMultiplier } from "../status.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [14, 16, 18, 21, 21];
const SPECIAL_HEAL_BY_LEVEL = [40, 50, 62, 75, 75];
/** Deep Submerge's surfacing strike: flat displayed 30 at every level. */
const SPECIAL_DMG = 30;
/** Ticks spent submerged ("briefly": 1.5s) before the surfacing strike. */
const SUBMERGE_TICKS = 3;
/** Stirring Depths: ability charge gained per attack hit taken, by unique level. */
const CHARGE_ON_DAMAGED_BY_LEVEL = [0.5, 1, 1.5, 2, 2.5];
/** Loch Spout lvl 5: Haste Down per stack (standard 5%/stack table). */
const HASTE_DOWN_PCT = 5;
/** Deep Submerge lvl 5: Attack Down (standard first-stack value). */
const ATK_DOWN_PCT = 15;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeNesslingModule(cfg) {
  const { basicDmgByLevel, specialHealByLevel } = cfg;
  return {
    /**
     * Loch Spout: hit the FARTHEST foe within ranged reach (the boss counts
     * via its 2x2 body); chase the nearest foe when nothing is in range.
     * Holds completely still (and silent) while submerged.
     */
    basicAttack(unit, ctx) {
      if (isIntangible(unit)) return; // submerged: no attacks, no movement
      const { aliveE, aliveP, boss, newFx, now } = ctx;

      let best = null, bestD = -1;
      for (const e of aliveE) {
        if (isIntangible(e)) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= RANGED_RANGE && d > bestD) { bestD = d; best = { unit: e }; }
      }
      const bossD = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : -1;
      if (bossD >= 0 && bossD <= RANGED_RANGE && bossD > bestD) { bestD = bossD; best = { isBoss: true }; }

      if (!best) {
        let chase = null, chaseD = Infinity;
        for (const e of aliveE) {
          if (isIntangible(e)) continue;
          const d = aChebDist(unit.row, unit.col, e.row, e.col);
          if (d < chaseD) { chaseD = d; chase = e; }
        }
        if (boss && boss.hp > 0 && bossD < chaseD) chase = { row: boss.row, col: boss.col };
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }
      if (unit.atkCd > 0 || isStunned(unit)) return;

      const idx = abilityIdx(unit, "basic");
      const mult = basicDmgByLevel[idx] / basicDmgByLevel[0];
      const hastes = idx >= MAX_IDX;

      if (best.isBoss) {
        // Bosses take the hit but skip Haste Down: their cast timers don't
        // read unit charge speed (same immunity policy as Taunt/Stun).
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, aliveP) * mult));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      } else {
        const tgt = best.unit;
        const dmg = Math.max(1, Math.round(unitDamage(unit, tgt) * mult));
        const dealt = damageUnit(tgt, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        if (hastes) applyStatMod(tgt, { kind: "haste", pct: -HASTE_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        newFx.push({ id: now + unit.uid, row: tgt.row, col: tgt.col, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /** Stirring Depths: every attack hit taken feeds the charge bar. */
    onDamaged(unit, attacker, dmg) {
      if (dmg <= 0 || !unit.abilChargeMax || isStunned(unit)) return 0;
      const gain = CHARGE_ON_DAMAGED_BY_LEVEL[abilityIdx(unit, "unique")];
      unit.abilCharge = Math.min(unit.abilChargeMax, (unit.abilCharge || 0) + gain);
      return 0; // no reflect damage
    },

    /** Deep Submerge: dive (Intangible + heal); the strike lands on surfacing. */
    special(unit, ctx) {
      const { newFx, now } = ctx;
      const heal = specialHealByLevel[abilityIdx(unit, "special")];
      if ((unit.healImmuneTicks || 0) <= 0) {
        unit.hp = Math.min(unit.maxHp, unit.hp + Math.max(1, Math.round(heal * healReceivedMultiplier(unit))));
      }
      unit.intangibleTicks = SUBMERGE_TICKS;
      unit._submergePending = true;
      newFx.push({ id: now + "ds" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /** Surface once the Intangible timer runs out: strike the front row. */
    onTick(unit, ctx) {
      if (!unit._submergePending || isIntangible(unit)) return;
      unit._submergePending = false;

      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = SPECIAL_DMG / BASIC_DMG_BY_LEVEL[0];
      const debuffs = idx >= MAX_IDX;
      // "Front row": the 3x1 line of cells directly ahead, toward the enemy
      // side (player units face +col, enemy-side units -col).
      const dir = ctx.isEnemySide ? -1 : 1;
      const frontCol = unit.col + dir;

      for (const e of aliveE) {
        if (e.col !== frontCol || Math.abs(e.row - unit.row) > 1 || isIntangible(e)) continue;
        const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
        const dealt = damageUnit(e, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        e.tauntTicks = STATUS_TICKS;
        e.tauntSourceUid = unit.uid;
        if (debuffs) applyStatMod(e, { kind: "atk", pct: -ATK_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        newFx.push({ id: now + "dse" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      if (boss && boss.hp > 0) {
        let overlaps = false;
        for (let dr = -1; dr <= 1 && !overlaps; dr++) {
          if (bossOccupies(boss, unit.row + dr, frontCol)) overlaps = true;
        }
        if (overlaps) {
          // The boss takes the strike but ignores the Taunt and Attack Down
          // stays meaningful: bosses DO read ATK stat mods.
          const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
          damageBoss(boss, dmg);
          ctx.addDamageDealt(dmg);
          if (debuffs) applyStatMod(boss, { kind: "atk", pct: -ATK_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
          newFx.push({ id: now + "dsb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const coralleviathan = makeNesslingModule(CFG);
export const tidecrush = makeNesslingModule(CFG);
export const tidelord = makeNesslingModule(CFG);
