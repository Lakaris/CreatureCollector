// Aurorion line: Smite / Solar Pounce / Radiant Mane.
//
// Smite keeps the engine's default melee attack flow (closest enemy) with
// per-level damage scaling; at max level every landed hit also raises a small
// Shield worth a share of this creature's Defense. Shields never stack (the
// larger is kept -- see applyShield), so the swing-by-swing reapplication is
// a thin rolling buffer rather than a pile.
//
// Solar Pounce is the payoff for the passive: an attack that skips the crit
// chance roll entirely and always pays out critDmg (withGuaranteedCrit in
// battle/damage.js). At max level it first strips every buff off its target
// -- the game's first buff removal (dispelBuffs in battle/status.js). The
// order matters and is what the ability text promises: buffs come off BEFORE
// the hit lands, so the guaranteed crit meets Health rather than a Shield the
// dispel was about to delete anyway.
//
// Radiant Mane is flat bonus Critical Damage, added to the creature's own
// critDmg stat. It is stored against a remembered base so re-applying it
// every tick can never compound.

import { aChebDist, distToBoss } from "../geometry.js";
import { attackRoll, damageBoss, playerDamageToBoss, withGuaranteedCrit } from "../damage.js";
import { MELEE_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, applyShield } from "../hp.js";
import { dispelBuffs, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
const SPECIAL_DMG_BY_LEVEL = [30, 38, 48, 58, 58];
/** Smite lvl 5: Shield as a % of this creature's Defense -- deliberately thin. */
const SHIELD_PCT_OF_DEF = 15;
/** Radiant Mane: bonus Critical Damage in percentage points, by unique level. */
const CRIT_DMG_BY_LEVEL = [10, 20, 30, 40, 50];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeAurorionModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, critDmgByLevel } = cfg;
  return {
    /** Smite: level scaling relative to the shared baseline. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Smite lvl 5: a landed hit raises the Shield. A swing that dealt
     * nothing (dodged, or an Intangible target) earns none. */
    onHit(unit, target, dealt) {
      if (dealt > 0 && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyShield(unit, (unit.def * SHIELD_PCT_OF_DEF) / 100, STATUS_TICKS);
      }
      return 0;
    },

    /**
     * Radiant Mane: flat bonus Critical Damage. Written against a remembered
     * base rather than incremented, so running every tick is idempotent, and
     * set here rather than onBattleStart so enemy-side Aurorions get it too
     * (onBattleStart only runs for the player's units -- see state.js).
     */
    onTick(unit) {
      if (unit._maneBaseCritDmg == null) unit._maneBaseCritDmg = unit.critDmg || 0;
      unit.critDmg = unit._maneBaseCritDmg + critDmgByLevel[abilityIdx(unit, "unique")];
    },

    /**
     * Solar Pounce: strike the closest foe in melee reach, always critically.
     * Uses the default in-range special gate, so the charge holds until
     * something is actually beside it.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const dispels = idx >= MAX_IDX;

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (isIntangible(e)) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
      }
      const bd = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      if (bd <= MELEE_RANGE && bd < bestD) {
        // Bosses carry stat mods and their own Shield pool, so the strip
        // lands on them too -- it is what answers Holy Radiance's stacking
        // Shield (battle/bosses/light.js).
        if (dispels) dispelBuffs(boss);
        const dmg = withGuaranteedCrit(unit, () =>
          Math.max(1, Math.round(playerDamageToBoss(unit, boss, ctx.aliveP) * mult)));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "sp" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
      if (!best) return;

      if (dispels) dispelBuffs(best);
      const dmg = withGuaranteedCrit(unit, () => Math.max(1, Math.round(attackRoll(unit) * mult)));
      const dealt = damageUnit(best, dmg);
      if (dealt) ctx.addDamageDealt(dealt);
      newFx.push({ id: now + "sp" + unit.uid + best.uid, row: best.row, col: best.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  critDmgByLevel: CRIT_DMG_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const aurorabird = makeAurorionModule(CFG);
export const radiancebird = makeAurorionModule(CFG);
export const celestbird = makeAurorionModule(CFG);
export const empyravis = makeAurorionModule(CFG);
