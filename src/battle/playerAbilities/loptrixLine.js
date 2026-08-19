// Loptrix line: Mocking Nip / Scapegoat / Vanishing Act.
//
// Mocking Nip is a melee nip at the WEAKEST enemy (lowest current Health,
// boss included as a last resort): it owns targeting and chase movement like
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

import { unitDamage, playerDamageToBoss, damageBoss, attackRoll, attackCooldown } from "../damage.js";
import { aChebDist, distToBoss, bossOccupies } from "../geometry.js";
import { BOSS_SIZE, MELEE_RANGE, STATUS_TICKS } from "../constants.js";
import { speedPenalty, isStunned, isIntangible, applyStatMod, dispelDebuffs } from "../status.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
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

/** The 8 cells around a minion, or the ring around the boss's 2x2 body. */
function cellsBeside(candidate) {
  const out = [];
  if (candidate.isBossCandidate) {
    const b = candidate.boss;
    for (let r = b.row - 1; r <= b.row + BOSS_SIZE; r++) {
      for (let c = b.col - 1; c <= b.col + BOSS_SIZE; c++) {
        if (r >= b.row && r < b.row + BOSS_SIZE && c >= b.col && c < b.col + BOSS_SIZE) continue;
        out.push([r, c]);
      }
    }
    return out;
  }
  const u = candidate.unit;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      out.push([u.row + dr, u.col + dc]);
    }
  }
  return out;
}

/** Scapegoat's candidates: every living targetable foe (boss last), weakest first. */
function candidatesByHp(aliveE, boss) {
  const list = aliveE.filter((u) => !isIntangible(u)).map((unit) => ({ unit, hp: unit.hp }));
  if (boss && boss.hp > 0) list.push({ isBossCandidate: true, boss, hp: boss.hp });
  return list.sort((a, z) => a.hp - z.hp);
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
      const { aliveE, aliveP, boss, newFx, now } = ctx;
      const cands = candidatesByHp(aliveE, boss);
      if (!cands.length) return;
      const tgt = cands[0];

      const d = tgt.isBossCandidate
        ? distToBoss(tgt.boss, unit.row, unit.col)
        : aChebDist(unit.row, unit.col, tgt.unit.row, tgt.unit.col);
      if (d > MELEE_RANGE) {
        const tr = tgt.isBossCandidate ? tgt.boss.row : tgt.unit.row;
        const tc = tgt.isBossCandidate ? tgt.boss.col : tgt.unit.col;
        ctx.stepToward(tr, tc);
        return;
      }
      if (unit.atkCd > 0 || isStunned(unit)) return;

      const idx = abilityIdx(unit, "basic");
      const mult = basicDmgByLevel[idx] / basicDmgByLevel[0];
      if (tgt.isBossCandidate) {
        // Bosses take the nip but skip Defense Down -- they have no DEF stat.
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, tgt.boss, aliveP) * mult));
        damageBoss(tgt.boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + unit.uid, row: tgt.boss.row + 0.5, col: tgt.boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      } else {
        const victim = tgt.unit;
        const dmg = Math.max(1, Math.round(unitDamage(unit, victim) * mult));
        const dealt = damageUnit(victim, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        if (idx >= MAX_IDX) applyStatMod(victim, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        newFx.push({ id: now + unit.uid, row: victim.row, col: victim.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /**
     * Scapegoat holds its charge until some foe qualifies: either Loptrix
     * already stands beside one, or one has a free adjacent tile to land on.
     */
    specialInRange(unit, { aliveE, aliveP, boss, gridRows, gridCols }) {
      const occ = new Set([...aliveE, ...aliveP].map((o) => o.row + "," + o.col));
      const open = (r, c) =>
        r >= 0 && r < gridRows && c >= 0 && c < gridCols && !occ.has(r + "," + c) &&
        !(boss && boss.hp > 0 && bossOccupies(boss, r, c));
      for (const cand of candidatesByHp(aliveE, boss)) {
        const besideAlready = cand.isBossCandidate
          ? distToBoss(cand.boss, unit.row, unit.col) <= 1
          : aChebDist(unit.row, unit.col, cand.unit.row, cand.unit.col) <= 1;
        if (besideAlready || cellsBeside(cand).some(([r, c]) => open(r, c))) return true;
      }
      return false;
    },

    /**
     * Scapegoat: teleport beside the weakest reachable foe, strike it, and
     * Mark it (bosses take the hit but can't be Marked). Never lands on an
     * occupied square; stays put when already adjacent.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / basicDmgByLevel[0];

      for (const cand of candidatesByHp(aliveE, boss)) {
        const besideAlready = cand.isBossCandidate
          ? distToBoss(cand.boss, unit.row, unit.col) <= 1
          : aChebDist(unit.row, unit.col, cand.unit.row, cand.unit.col) <= 1;

        let dest = null;
        if (!besideAlready) {
          // ctx.blocked covers bounds, every unit's cell, and the boss body.
          const openCells = cellsBeside(cand).filter(([r, c]) => !ctx.blocked(r, c));
          if (!openCells.length) continue;
          openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
          dest = openCells[0];
        }

        const fromRow = unit.row, fromCol = unit.col;
        if (dest) ctx.relocate(dest[0], dest[1]);

        const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
        if (cand.isBossCandidate) {
          damageBoss(cand.boss, dmg);
          ctx.addDamageDealt(dmg);
        } else {
          const dealt = damageUnit(cand.unit, dmg);
          if (dealt) ctx.addDamageDealt(dealt);
          cand.unit.markedTicks = STATUS_TICKS;
        }

        const tr = cand.isBossCandidate ? cand.boss.row + 0.5 : cand.unit.row;
        const tc = cand.isBossCandidate ? cand.boss.col + 0.5 : cand.unit.col;
        newFx.push({ id: now + "sg" + unit.uid, row: unit.row, col: unit.col, t: now, isRanged: true, fromRow, fromCol, isEnemy: !!ctx.isEnemySide });
        newFx.push({ id: now + "sghit" + unit.uid, row: tr, col: tc, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
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
        .sort((a, z) => aChebDist(unit.row, unit.col, a.row, a.col) - aChebDist(unit.row, unit.col, z.row, z.col));
      for (const ally of allies) {
        if (aChebDist(unit.row, unit.col, ally.row, ally.col) <= 1) {
          // Already beside a Ranged ally: no blink needed, just the dispel.
          unit._vanishReady = false;
          if (abilityIdx(unit, "unique") >= MAX_IDX) dispelDebuffs(unit);
          return;
        }
        const openCells = cellsBeside({ unit: ally }).filter(([r, c]) => !ctx.blocked(r, c));
        if (!openCells.length) continue;
        openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
        const fromRow = unit.row, fromCol = unit.col;
        ctx.relocate(openCells[0][0], openCells[0][1]);
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
export const abyssgolem = makeLoptrixModule(CFG);
export const nihilgolem = makeLoptrixModule(CFG);
