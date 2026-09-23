// Sicklewing line: Sickle Cut / Twin Reap / Unfettered.
//
// A Legendary Wind mantis whose whole design is refusing to be stopped. The
// three things a tank uses to hold an attacker off -- a Shield to soak it, a
// Taunt to redirect it, and enough Health to outlast it -- are each answered
// by one ability here.
//
// Sickle Cut keeps the engine's default melee flow (closest enemy) with
// per-level damage scaling. At max level a landed hit on an enemy below 20%
// Health simply ends it: an Execute is a kill, not damage, so it is dealt as
// exactly the target's remaining Health with the Shield bypassed. It still
// goes through damageUnit, which is what makes Immortal's floor beat it --
// the one thing the card says stops it -- and lets Revive answer it too.
//
// Twin Reap is the Fork: the two diagonal rays ahead of the mantis, to the
// board's edge (forkCells in geometry.js). Everything standing on either ray
// takes the hit, and at max level is briefly Stunned. A boss whose body
// crosses a ray is hit too, but not Stunned -- bosses obey no control but
// Taunt. Like Cone, it is oriented along rows, the battle axis.
//
// Unfettered runs every tick: flat bonus Speed, and the two bypass flags the
// engine reads -- `_pierceShield`, which the attack loop passes into
// damageUnit, and at max level `_ignoreTaunt`, which selectTarget's Taunt
// override checks first. The Taunt still lands and still counts down; the
// mantis just declines to let it choose its target.

import { aChebDist, forkCells, bossOccupies } from "../geometry.js";
import { attackRoll, damageBoss } from "../damage.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyWhileActiveStatMod, applyTimedDebuff, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Legendary attacker ladder, Pyresaur's exact curve.
const BASIC_DMG_BY_LEVEL = [30, 34, 38, 43, 43];
/** Twin Reap: displayed damage by special level, on the same baseline. */
const SPECIAL_DMG_BY_LEVEL = [55, 62, 70, 80, 80];
/** Sickle Cut lvl 5: Execute below this share of max Health. */
const EXECUTE_BELOW_PCT = 20;
/** Twin Reap lvl 5: "briefly" is the 3-tick step of the duration ladder. */
const STUN_TICKS = 3;
/** Unfettered: flat Speed by unique level. */
const SPEED_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
// Unfettered's Speed is a while-active stack (applyWhileActiveStatMod in
// status.js), re-stamped every tick.

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeSicklewingModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, speedPctByLevel } = cfg;
  return {
    /** Sickle Cut: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /**
     * Unfettered. Runs before the unit's attack each tick: the Speed stack,
     * and the two flags the engine reads for Shield and Taunt bypass.
     */
    onTick(unit, ctx) {
      const idx = abilityIdx(unit, "unique");
      applyWhileActiveStatMod(unit, { kind: "spd", pct: speedPctByLevel[idx], src: unit.uid });
      unit._pierceShield = true;
      unit._ignoreTaunt = idx >= MAX_IDX;
      // Execute lands from onHit, which sees no context; stash the credit.
      unit._credit = ctx.addDamageDealt;
    },

    /**
     * Sickle Cut lvl 5: a landed hit on an enemy below the threshold ends it.
     * Dealt as the target's remaining Health with the Shield bypassed, so it
     * is a kill against anything but the Immortal floor (and Revive's
     * one-shot save), exactly as the card says.
     */
    onHit(unit, target) {
      if (!target || target.uid == null || target.hp <= 0) return 0;
      if (abilityIdx(unit, "basic") < MAX_IDX) return 0;
      if (target.hp * 100 >= (target.maxHp || target.hp) * EXECUTE_BELOW_PCT) return 0;
      const dealt = damageUnit(target, target.hp, { pierceShield: true });
      if (unit._credit) unit._credit(dealt);
      return 0;
    },

    /**
     * Twin Reap: strike both diagonal rays ahead. Uses the default in-range
     * special gate (melee), so the Fork opens once something is close --
     * which, for rays that start one tile out, is when they have targets.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now, gridRows, gridCols } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const stuns = idx >= MAX_IDX;
      const dir = ctx.isEnemySide ? 1 : -1;
      const cells = forkCells(unit.row, unit.col, dir, gridRows, gridCols);
      const cellSet = new Set(cells.map(([r, c]) => r + "," + c));

      // Paint the whole Fork, hit or not -- the shape is the ability.
      for (const [r, c] of cells) {
        newFx.push({ id: now + "trc" + unit.uid + r + "_" + c, row: r, col: c, t: now, isGust: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        if (!cellSet.has(e.row + "," + e.col)) continue;
        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        const dealt = damageUnit(e, dmg);
        ctx.addDamageDealt(dealt);
        if (stuns && !e._dodgedHit) applyTimedDebuff(e, "stunTicks", Math.max(e.stunTicks || 0, STUN_TICKS));
      }
      // A boss whose body crosses either ray takes the hit; no Stun, since
      // bosses obey no control effect but Taunt.
      if (boss && boss.hp > 0 && cells.some(([r, c]) => bossOccupies(boss, r, c))) {
        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "trb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isGust: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  speedPctByLevel: SPEED_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage. The ids
// are inherited from the retired Aetherwing phoenixes.
export const galephoenix = makeSicklewingModule(CFG);
export const skyphoenix = makeSicklewingModule(CFG);
