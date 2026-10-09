// Loptrix line: Mocking Nip / Scapegoat / Vanishing Act.
//
// Mocking Nip is a melee nip at the WEAKEST enemy (lowest current Health,
// a boss loses Health ties): it owns targeting and chase movement like
// other basicAttack overrides, walking at the weakest foe rather than the
// nearest. At max level every landed hit inflicts a Defense Down stack.
//
// Scapegoat teleports beside the weakest enemy with a free adjacent tile
// (never landing on anyone -- same landing rules as Zephyr Step), strikes
// it, and inflicts Marked: allies who already have the victim within attack
// range switch onto it, with no movement pull (see markedFoeInRange in
// battle/tick.js). The ~24 charge is deliberately long -- Vanishing Act may
// have just carried Loptrix out at low Health, and it should have to heal up
// before diving back in.
//
// Vanishing Act starts the fight with most of the special already charged
// (70-100% by level), and when Loptrix FALLS below 30% Health it teleports
// next to a Ranged ally if any has a free adjacent tile ("if able" -- it
// keeps trying while below the line until a spot opens, then won't trigger
// again until it has recovered above 30% first). At max level the escape
// also dispels all debuffs on self.

import { basicUnitDamage, attackRoll, attackCooldown } from "../damage.js";
import { aChebDist, unitDist, occupies } from "../geometry.js";
import { MELEE_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { speedPenalty, isStunned, isIntangible, applyStatMod, dispelDebuffs, consumeBlind, applyTimedDebuff } from "../status.js";
import { damageUnit } from "../hp.js";
import { hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [20, 26, 33, 42, 42];
const SPECIAL_DMG_BY_LEVEL = [40, 50, 62, 78, 95];
/** Vanishing Act: % of the special charge granted at battle start, by level. */
const START_CHARGE_PCT_BY_LEVEL = [70, 80, 90, 100, 100];
/** Vanishing Act's escape triggers when falling below this fraction of max Health. */
const VANISH_HP_FRAC = 0.3;
/** Mocking Nip lvl 5: Defense Down (standard first-stack value). */
const DEF_DOWN_PCT = 15;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** The ring of cells around a foe's body (8 for a 1x1, 12 for a 2x2 boss). */
function cellsBeside(u) {
  const out = [];
  const size = u.size || 1;
  for (let r = u.row - 1; r <= u.row + size; r++) {
    for (let c = u.col - 1; c <= u.col + size; c++) {
      if (r >= u.row && r < u.row + size && c >= u.col && c < u.col + size) continue;
      out.push([r, c]);
    }
  }
  return out;
}

/** Scapegoat's candidates: every living targetable foe, weakest first. The
 * sort is stable, so a boss (last in the enemy list) loses Health ties. */
function candidatesByHp(aliveE) {
  return aliveE.filter((u) => u.hp > 0 && !isIntangible(u)).sort((a, z) => a.hp - z.hp);
}

export function makeLoptrixModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, startChargePctByLevel } = cfg;
  return {
    /** Vanishing Act: open the fight with most of Scapegoat already charged. */
    onBattleStart(unit) {
      if (!unit.abilChargeMax) return;
      const pct = startChargePctByLevel[abilityIdx(unit, "unique")];
      unit.abilCharge = Math.min(unit.abilChargeMax, (unit.abilChargeMax * pct) / 100);
      unit._vanishReady = true;
    },

    /**
     * Mocking Nip: nip the WEAKEST foe. Attacks it in melee reach; otherwise
     * walks at it (the weakest, not the nearest -- the trickster picks on
     * whoever is faltering).
     */
    basicAttack(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      const victim = candidatesByHp(aliveE)[0];
      if (!victim) return;

      if (unitDist(unit, victim) > MELEE_RANGE) { ctx.stepToward(victim.row, victim.col); return; }
      if (unit.atkCd > 0 || isStunned(unit)) return;
      // Blinded: the nip misses entirely, cooldown still paid.
      if (consumeBlind(unit)) { unit.atkCd = attackCooldown(unit, speedPenalty(unit)); return; }

      const idx = abilityIdx(unit, "basic");
      const mult = basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const dmg = Math.max(1, Math.round(basicUnitDamage(unit, victim) * mult));
      const dealt = damageUnit(victim, dmg);
      if (dealt) ctx.addDamageDealt(dealt);
      if (idx >= MAX_IDX && !hasRule(victim, "ignoresOnHitEffects")) applyStatMod(victim, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      const mid = ((victim.size || 1) - 1) / 2;
      newFx.push({ id: now + unit.uid, row: victim.row + mid, col: victim.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /**
     * Scapegoat holds its charge until some foe qualifies: either Loptrix
     * already stands beside one, or one has a free adjacent tile to land on.
     */
    specialInRange(unit, { aliveE, aliveP, gridRows, gridCols }) {
      const everyone = [...aliveE, ...aliveP];
      const open = (r, c) =>
        r >= 0 && r < gridRows && c >= 0 && c < gridCols && !everyone.some((o) => occupies(o, r, c));
      for (const foe of candidatesByHp(aliveE)) {
        if (unitDist(unit, foe) <= 1 || cellsBeside(foe).some(([r, c]) => open(r, c))) return true;
      }
      return false;
    },

    /**
     * Scapegoat: teleport beside the weakest reachable foe, strike it, and
     * Mark it -- a boss included.
     * Never lands on an occupied square; stays put when already adjacent.
     */
    special(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;

      for (const foe of candidatesByHp(aliveE)) {
        let dest = null;
        if (unitDist(unit, foe) > 1) {
          // ctx.blocked covers bounds and every unit's body.
          const openCells = cellsBeside(foe).filter(([r, c]) => !ctx.blocked(r, c));
          if (!openCells.length) continue;
          openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
          dest = openCells[0];
        }

        const fromRow = unit.row, fromCol = unit.col;
        // Rooted: no teleport, so this foe is unreachable -- try the next.
        // One we are already beside needs no teleport and still gets hit.
        if (dest && !ctx.relocate(dest[0], dest[1])) continue;

        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        const dealt = damageUnit(foe, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        applyTimedDebuff(foe, "markedTicks", STATUS_TICKS, { stretch: true });

        const mid = ((foe.size || 1) - 1) / 2;
        newFx.push({ id: now + "sg" + unit.uid, row: unit.row, col: unit.col, t: now, isRanged: true, fromRow, fromCol, isEnemy: !!ctx.isEnemySide });
        newFx.push({ id: now + "sghit" + unit.uid, row: foe.row + mid, col: foe.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
    },

    /** Vanishing Act's escape: on falling below 30% Health, blink to safety. */
    onTick(unit, ctx) {
      const low = unit.hp > 0 && unit.hp < unit.maxHp * VANISH_HP_FRAC;
      if (!low) { unit._vanishReady = true; return; }
      if (!unit._vanishReady) return; // one escape per dip below the line

      const { aliveP, newFx, now } = ctx;
      // Nearest Ranged ally with a free adjacent tile ("if able": no ally or
      // no open tile means keep waiting -- the trigger isn't consumed).
      const allies = aliveP
        .filter((a) => a !== unit && a.hp > 0 && a.isRanged)
        .sort((a, z) => unitDist(unit, a) - unitDist(unit, z));
      for (const ally of allies) {
        if (unitDist(unit, ally) <= 1) {
          // Already beside a Ranged ally: no blink needed, just the dispel.
          unit._vanishReady = false;
          if (abilityIdx(unit, "unique") >= MAX_IDX) dispelDebuffs(unit);
          return;
        }
        const openCells = cellsBeside(ally).filter(([r, c]) => !ctx.blocked(r, c));
        if (!openCells.length) continue;
        openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
        const fromRow = unit.row, fromCol = unit.col;
        // Rooted: the escape fails and stays armed for when the Root lapses.
        if (!ctx.relocate(openCells[0][0], openCells[0][1])) continue;
        unit._vanishReady = false;
        if (abilityIdx(unit, "unique") >= MAX_IDX) dispelDebuffs(unit);
        newFx.push({ id: now + "va" + unit.uid, row: unit.row, col: unit.col, t: now, isRanged: true, fromRow, fromCol, isEnemy: !!ctx.isEnemySide });
        return;
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  startChargePctByLevel: START_CHARGE_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const loptrix = makeLoptrixModule(CFG);
export const ragnavix = makeLoptrixModule(CFG);
