// Oathcub line: Mailed Paw / Radiant Smite / Reliquary.
//
// A Light tank that fights out of its own Shield rather than its Attack. Every
// number in the kit points back at Defense, so gearing it as a tank is also
// gearing its offence -- which is the whole reason its Attack sits on the tank
// ladder instead of a bruiser's.
//
// Mailed Paw keeps the engine's default melee flow (closest enemy) with
// per-level damage scaling; at max level every landed hit also braces this
// creature with a stack of Defense Up. That feeds back into the Shield the
// special spends, so the basic is the special's ramp.
//
// Radiant Smite is the identity: put up a Shield worth a share of Defense,
// then burn a share of the CURRENT Shield into every nearby enemy. It reads
// the shield after raising it, so a bigger shield already standing -- from
// Reliquary, or from an ally's -- is what gets converted, and the ability
// scales off help rather than ignoring it. Shields do not stack, so raising it
// keeps whichever is larger (see applyShield). The Shield is deliberately NOT
// spent by the smite: this is a tank, and a special that stripped its own
// defence to deal damage would fight the role.
//
// Reliquary is what keeps it fed between casts: healing that would overflow
// past full Health is banked as a Shield instead, capped at a share of
// Defense. It works through the engine's heal chokepoint (battle/hp.js), so
// EVERY healer in the game feeds it, not just a scripted one.

import { aChebDist, distToBoss } from "../geometry.js";
import { damageBoss } from "../damage.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { applyShield, damageUnit } from "../hp.js";
import { applyStatMod, applyBlind, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced, the same flattened curve the rest of the tank cohort uses.
const BASIC_DMG_BY_LEVEL = [12, 13, 15, 17, 17];
/**
 * Radiant Smite's Shield, as a % of this creature's Defense. The card text
 * reads "based off of this creature's Defense" rather than naming a number,
 * so this is the one place it is pinned -- and it is the figure the smite's
 * damage percentages below were balanced against.
 */
const SMITE_SHIELD_PCT = 30;
/** Radiant Smite: share of the current Shield dealt as damage, by level. */
const SMITE_DMG_PCT_BY_LEVEL = [60, 75, 90, 110, 110];
/** Reliquary: Overheal cap as a % of this creature's Defense, by level. */
const OVERHEAL_CAP_PCT_BY_LEVEL = [40, 50, 60, 70, 80];
/** Mailed Paw lvl 5: Defense Up (standard first-stack value, matching Attack Up). */
const DEF_UP_PCT = 15;
/** "Nearby" = this creature and every tile surrounding it. */
const NEARBY_RANGE = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeOathcubModule(cfg) {
  const { basicDmgByLevel, smiteDmgPctByLevel, overhealCapPctByLevel } = cfg;
  return {
    /**
     * Reliquary: hand the engine's heal chokepoint this creature's Overheal
     * cap. Read by healUnit in battle/hp.js whenever anything heals it.
     */
    onBattleStart(unit) {
      unit.overhealPct = overhealCapPctByLevel[abilityIdx(unit, "unique")];
    },

    /** Mailed Paw: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Mailed Paw lvl 5: every landed hit braces this creature. */
    onHit(unit) {
      if (abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(unit, { kind: "def", pct: DEF_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Radiant Smite: Shield up, then convert a share of that Shield into
     * damage on every nearby enemy. Uses the default in-range special gate
     * (Tank, melee), so it goes off once the line meets -- which is when
     * something is standing close enough to be worth hitting.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");

      applyShield(unit, (unit.def * SMITE_SHIELD_PCT) / 100, STATUS_TICKS);
      newFx.push({ id: now + "rs" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

      // Read AFTER raising it, so a larger standing Shield is what converts.
      const dmg = Math.max(1, Math.round(((unit.shield || 0) * smiteDmgPctByLevel[idx]) / 100));
      const blinds = idx >= MAX_IDX;

      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        if (aChebDist(unit.row, unit.col, e.row, e.col) > NEARBY_RANGE) continue;
        const dealt = damageUnit(e, dmg);
        // Protect may have handed the hit to a guardian -- Blind belongs on
        // whoever actually took it, the same rule the attack loop uses.
        const hit = e._redirectedTo || e;
        if (blinds && !e._dodgedHit) applyBlind(hit);
        ctx.addDamageDealt(dealt);
        newFx.push({ id: now + "rsh" + unit.uid + e.uid, row: e.row, col: e.col, t: now, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      // A boss standing next to it is a nearby enemy too. Bosses are immune to
      // control, so it takes the light and not the Blind -- the same policy
      // Hellfang's Root and Taunt follow.
      if (boss && boss.hp > 0 && distToBoss(boss, unit.row, unit.col) <= NEARBY_RANGE) {
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "rsb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  smiteDmgPctByLevel: SMITE_DMG_PCT_BY_LEVEL,
  overhealCapPctByLevel: OVERHEAL_CAP_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage. The ids
// are inherited from the retired Prismcrab line so existing saves still
// resolve; see the note in data/skins.js.
export const prismcrab = makeOathcubModule(CFG);
export const spectrumcrab = makeOathcubModule(CFG);
export const rainbowshell = makeOathcubModule(CFG);
export const chromatarch = makeOathcubModule(CFG);
