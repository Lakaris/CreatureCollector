// Auravast line: Twin Radiance / Sovereign Call / Sworn Guard.
//
// A Light tank that fights by deciding who the fight is about. Every part of
// the kit is about attention -- taking it, giving it, or punishing whoever
// spends it on the wrong target.
//
// Twin Radiance splits one swing across two hits. The card number is the
// TOTAL, the same rule every multi-hit follows, so hitting twice is a texture
// rather than double damage; at max level each landed swing also shaves the
// victim's Defense.
//
// Sovereign Call has two branches and picks whichever the board allows. Its
// first job is to Taunt -- drag an enemy onto the creature built to eat it.
// When nothing can be Taunted (everything already is, or the only thing left
// is a boss, which is immune to control like every other CC), the call turns
// inward instead and raises an Aura: a field two tiles across that lifts the
// Attack and Critical Damage of every ally standing in it. So the ability is
// never dead -- a board with nothing to Taunt is exactly the board where the
// team is already committed and wants the damage instead. At max level a
// successful Taunt also drags a nearby ally in to Assist the same target.
//
// Sworn Guard is the retaliation. When an ally near it is attacked, the dragon
// marks that attacker and hits it markedly harder -- but it can only hold one
// mark at a time, and can not take another until the marked creature is dead.
// That makes it a commitment rather than a rolling buff: it picks the enemy
// that drew first blood and stays on it. At max level taking a mark also
// refreshes Sovereign Call outright, so a fresh mark is immediately followed
// by a fresh Taunt.

import { aChebDist, distToBoss } from "../geometry.js";
import { basicUnitDamage, basicDamageToBoss, damageBoss } from "../damage.js";
import { STATUS_TICKS, ENDURING_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { asAssist } from "../applier.js";
import { applyStatMod, applyAura, applyTaunt, isTauntable } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced, the flattened curve the rest of the tank cohort uses.
const BASIC_DMG_BY_LEVEL = [12, 13, 15, 17, 17];
/** Twin Radiance strikes twice; the card number is split across both hits. */
const BASIC_HITS = 2;
/** Sovereign Call's Aura: Attack % granted to allies inside, by special level. */
const AURA_ATK_PCT_BY_LEVEL = [10, 15, 20, 20, 20];
/** Sovereign Call's Aura: Critical Damage % granted, by special level. */
const AURA_CRITDMG_PCT_BY_LEVEL = [10, 10, 10, 20, 20];
/**
 * How far the Aura reaches. The card text does not name a size -- each Aura
 * sets its own -- so this is the one place Sovereign Call's is pinned.
 */
const AURA_RANGE = 2;
/** Sworn Guard: extra damage against the marked enemy, by unique level. */
const GUARD_DMG_PCT_BY_LEVEL = [20, 30, 40, 50, 50];
/** How far an ally can be and still be worth avenging. */
const GUARD_WATCH_RANGE = 2;
/** How far Sovereign Call reaches to pull an ally into an Assist. */
const ASSIST_RANGE = 2;
/** Twin Radiance lvl 5: Defense Down (standard first-stack value). */
const DEF_DOWN_PCT = 15;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

// Tauntability now lives in status.js (isTauntable) so the boss and creatures
// answer the same question -- a boss obeys Taunt like anything else.

export function makeAuravastModule(cfg) {
  const { basicDmgByLevel, auraAtkByLevel, auraCritDmgByLevel, guardDmgByLevel } = cfg;
  return {
    /** Twin Radiance hits twice for half each -- one swing, two impacts. */
    hitsForAttack() {
      return BASIC_HITS;
    },

    /**
     * Twin Radiance's level scaling, plus Sworn Guard's bonus against the one
     * enemy this creature has marked.
     */
    dmgMultForAttack(unit, target) {
      let mult = basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
      if (target && target.uid != null && target.uid === unit._swornMarkUid) {
        mult *= 1 + guardDmgByLevel[abilityIdx(unit, "unique")] / 100;
      }
      return mult;
    },

    /** Twin Radiance lvl 5: every landed hit shaves the victim's Defense. */
    onHit(unit, target) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Sworn Guard. Watches its allies rather than itself, so it reads the
     * last-attacker stamp the attack loop leaves on whoever got hit (see
     * tick.js) instead of the onDamaged hook, which only ever reports a
     * creature's own wounds.
     */
    onTick(unit, ctx) {
      const { aliveP, aliveE, now } = ctx;

      // A mark is held until its target dies -- then the guard re-arms.
      if (unit._swornMarkUid != null && !aliveE.some((e) => e.uid === unit._swornMarkUid && e.hp > 0)) {
        unit._swornMarkUid = null;
      }
      const seen = unit._swornSeenAt || 0;
      unit._swornSeenAt = now;
      if (unit._swornMarkUid != null) return;

      for (const a of aliveP) {
        if (a.hp <= 0 || a.uid === unit.uid) continue;
        if (!(a._lastHitAt > seen) || a._lastHitByUid == null) continue;
        if (aChebDist(unit.row, unit.col, a.row, a.col) > GUARD_WATCH_RANGE) continue;
        const foe = aliveE.find((e) => e.uid === a._lastHitByUid && e.hp > 0);
        if (!foe) continue;
        unit._swornMarkUid = foe.uid;
        // Max tier: taking a mark also refills Sovereign Call outright.
        if (abilityIdx(unit, "unique") >= MAX_IDX) unit.abilCharge = unit.abilChargeMax;
        ctx.newFx.push({ id: now + "sg" + unit.uid + foe.uid, row: foe.row, col: foe.col, t: now, isDark: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        break;
      }
    },

    /**
     * Sovereign Call: Taunt if anything can be Taunted, otherwise raise the
     * Aura. Uses the default in-range special gate, so it fires as the line
     * meets -- which is when a Taunt is worth spending and when allies are
     * bunched tightly enough for the Aura to cover them.
     */
    special(unit, ctx) {
      const { aliveE, aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (!isTauntable(e)) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d < bestD) { bestD = d; best = e; }
      }
      // A boss is a Taunt target like anything else, and competes on distance
      // with the minions rather than being a fallback.
      const boss = ctx.boss;
      if (isTauntable(boss)) {
        const bd = distToBoss(boss, unit.row, unit.col);
        if (bd < bestD) { bestD = bd; best = boss; }
      }

      if (best) {
        const onBoss = best === boss;
        // A boss sits on a 2x2 body, so its marker goes at the body's centre.
        const fxRow = onBoss ? best.row + 0.5 : best.row;
        const fxCol = onBoss ? best.col + 0.5 : best.col;
        applyTaunt(best, unit);
        newFx.push({ id: now + "sc" + unit.uid + (onBoss ? "boss" : best.uid), row: fxRow, col: fxCol, t: now, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

        // Max tier: pull a nearby ally in to swing at the same target.
        if (idx >= MAX_IDX) {
          let helper = null, helperD = Infinity;
          for (const a of aliveP) {
            if (a.hp <= 0 || a.uid === unit.uid) continue;
            const d = aChebDist(unit.row, unit.col, a.row, a.col);
            if (d <= ASSIST_RANGE && d < helperD) { helperD = d; helper = a; }
          }
          if (helper && best.hp > 0) {
            // A boss takes damage through damageBoss and its own shield pool,
            // never damageUnit (see battle/hp.js).
            // An Assist is the helper's own Basic ability (see asAssist), so
            // its Basic-crit gear pays out on this swing.
            const dealt = asAssist(helper, () => onBoss
              ? damageBoss(best, Math.max(1, Math.round(basicDamageToBoss(helper, best, aliveP))))
              : damageUnit(best, Math.max(1, Math.round(basicUnitDamage(helper, best)))));
            // Credited to the dragon: this damage is Sovereign Call's doing,
            // and the chart tracks the ability that caused it.
            ctx.addDamageDealt(dealt || 0);
            newFx.push({ id: now + "sca" + helper.uid + (onBoss ? "boss" : best.uid), row: fxRow, col: fxCol, t: now, fromRow: helper.row, fromCol: helper.col, isEnemy: !!ctx.isEnemySide });
          }
        }
        return;
      }

      // Nothing to Taunt: raise the Aura instead.
      applyAura(unit, {
        range: AURA_RANGE,
        atkPct: auraAtkByLevel[idx],
        critDmgPct: auraCritDmgByLevel[idx],
        ticks: ENDURING_TICKS,
      });
      newFx.push({ id: now + "scaura" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  auraAtkByLevel: AURA_ATK_PCT_BY_LEVEL,
  auraCritDmgByLevel: AURA_CRITDMG_PCT_BY_LEVEL,
  guardDmgByLevel: GUARD_DMG_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const holydragon = makeAuravastModule(CFG);
export const celestialdragon = makeAuravastModule(CFG);
