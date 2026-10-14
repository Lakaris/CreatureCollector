// Zephyrcoo (storm cuckoo) line: Gust Peck / Nest Swap / Brood Ward.
// (Ids still say "stormwyvern"/"tempestlord" -- the line was re-themed, and
// creature ids never change, for save compat.)
//
// Gust Peck keeps the engine's default ranged attack flow against the
// closest enemy. When its Basic is ready but no enemy is in reach, it heals
// the most wounded ally in reach instead (`basicOutOfReach` -- the cooldown is
// paid, and it holds its ground rather than stepping in); with nobody hurt it
// walks forward as usual. Every upgrade is +damage and +healing. The max tier
// gives this creature a Shield on every use -- a thin one, sized off its
// Attack (Shields scale off Attack unless the text names another stat).
//
// Brood Ward begins each battle with 1 use. The moment an ally FALLS below
// 30% Health, this creature Swaps places with them (ctx.swapWith -- refused
// while either is Rooted) and they recover 20-50% of their max Health. That
// ally is remembered as the Swapped creature. A failed Swap keeps the use and
// tries again next tick while the ally is still down there. At max, every
// Swap this creature makes (Brood Ward's or Nest Swap's) also Shields it.
//
// Nest Swap: when Brood Ward has 0 uses, regain 1 use and Swap back with the
// Swapped creature, which temporarily gains 5-20% Speed and Haste -- flat
// bumps, not the Speed Up / Haste Up buffs (see `exact` in applyStatMod).
// Below max it holds its charge until Brood Ward has been spent. At max it
// fires whenever charged: with no Swappable creature (none remembered, it has
// fallen, or the Swap is refused), every Nearby ally gains 20% Speed and
// Haste instead.

import { unitDist, attackRangeOf } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { healUnit, applyShield } from "../hp.js";
import { applyStatMod, healReceivedMultiplier } from "../status.js";

/** Displayed values by level (the card's DMG and HEAL badges). */
const BASIC_DMG_BY_LEVEL = [16, 18, 20, 23, 23];
const BASIC_HEAL_BY_LEVEL = [4, 5, 6, 7, 7];
/** Nest Swap: Speed and Haste the Swapped creature gains, by special level. */
const SWAP_BOOST_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
/** Nest Swap max tier: Speed and Haste for Nearby allies when nobody is Swappable. */
const NEARBY_BOOST_PCT = 20;
/** Brood Ward: share of max Health the Swapped ally recovers, by unique level. */
const WARD_HEAL_PCT_BY_LEVEL = [20, 30, 40, 50, 50];
const WARD_BELOW = 0.3;
const WARD_USES = 1;
/** Shield sizes, as a share of this creature's Attack. Gust Peck's comes with
 * every Basic, so it is deliberately thin; a Swap's is the bigger one. */
const PECK_SHIELD_PCT_OF_ATK = 15;
const SWAP_SHIELD_PCT_OF_ATK = 40;
const NEARBY = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

const canBeHealed = (u) => (u.healImmuneTicks || 0) <= 0;
const healFor = (target, amount) => Math.max(1, Math.round(amount * healReceivedMultiplier(target)));

function wardUses(unit) {
  if (unit._wardUses == null) unit._wardUses = WARD_USES;
  return unit._wardUses;
}

/** A Swap this creature made: Brood Ward's max tier Shields it. */
function afterSwap(unit) {
  if (abilityIdx(unit, "unique") >= MAX_IDX) applyShield(unit, (unit.atk * SWAP_SHIELD_PCT_OF_ATK) / 100, STATUS_TICKS);
}

function boost(u, pct, src) {
  applyStatMod(u, { kind: "spd", pct, src, ticks: STATUS_TICKS, exact: true });
  applyStatMod(u, { kind: "haste", pct, src, ticks: STATUS_TICKS, exact: true });
}

export function makeZephyrcooModule(cfg) {
  const { basicDmgByLevel, basicHealByLevel } = cfg;
  return {
    /** Brood Ward: watch for an ally falling below 30% Health. */
    onTick(unit, ctx) {
      const armed = unit._wardArmed || (unit._wardArmed = new Set());
      let pick = null;
      for (const a of ctx.aliveP) {
        if (a === unit || a.hp <= 0) continue;
        const low = a.hp < a.maxHp * WARD_BELOW;
        if (!low) { armed.add(a.uid); continue; }
        // Only a FALL counts: an ally already low when first seen (or one
        // Brood Ward has already answered) waits until it climbs back up.
        if (!armed.has(a.uid)) continue;
        if (!pick || a.hp / a.maxHp < pick.hp / pick.maxHp) pick = a;
      }
      if (!pick || wardUses(unit) <= 0 || !ctx.swapWith(pick)) return;
      armed.delete(pick.uid);
      unit._wardUses--;
      unit._swappedUid = pick.uid;
      if (canBeHealed(pick)) healUnit(pick, healFor(pick, (pick.maxHp * WARD_HEAL_PCT_BY_LEVEL[abilityIdx(unit, "unique")]) / 100));
      afterSwap(unit);
      ctx.newFx.push({ id: ctx.now + "bw" + unit.uid, row: pick.row, col: pick.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /** Gust Peck: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Gust Peck max tier: a landed hit Shields this creature. */
    onHit(unit) {
      if (abilityIdx(unit, "basic") >= MAX_IDX) applyShield(unit, (unit.atk * PECK_SHIELD_PCT_OF_ATK) / 100, STATUS_TICKS);
      return 0;
    },

    /** Gust Peck with no enemy in reach: heal the most wounded ally in reach. */
    basicOutOfReach(unit, ctx) {
      const range = attackRangeOf(unit);
      let tgt = null;
      for (const a of ctx.aliveP) {
        if (a === unit || a.hp <= 0 || a.hp >= a.maxHp || !canBeHealed(a) || unitDist(unit, a) > range) continue;
        if (!tgt || a.hp / a.maxHp < tgt.hp / tgt.maxHp) tgt = a;
      }
      if (!tgt) return false;
      const idx = abilityIdx(unit, "basic");
      healUnit(tgt, healFor(tgt, basicHealByLevel[idx]));
      if (idx >= MAX_IDX) applyShield(unit, (unit.atk * PECK_SHIELD_PCT_OF_ATK) / 100, STATUS_TICKS);
      ctx.newFx.push({ id: ctx.now + "gp" + unit.uid, row: tgt.row, col: tgt.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      return true;
    },

    /** Nest Swap waits for Brood Ward to be spent -- except at max, where it
     * always has something to do. */
    specialInRange(unit) {
      return wardUses(unit) <= 0 || abilityIdx(unit, "special") >= MAX_IDX;
    },

    special(unit, ctx) {
      const idx = abilityIdx(unit, "special");
      let swapped = false;
      if (wardUses(unit) <= 0) {
        unit._wardUses++;
        const partner = ctx.aliveP.find((a) => a.uid === unit._swappedUid && a.hp > 0);
        if (partner && ctx.swapWith(partner)) {
          swapped = true;
          unit._swappedUid = null;
          boost(partner, SWAP_BOOST_PCT_BY_LEVEL[idx], unit.uid);
          afterSwap(unit);
          ctx.newFx.push({ id: ctx.now + "ns" + unit.uid, row: partner.row, col: partner.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }
      if (swapped || idx < MAX_IDX) return;
      // No Swappable creature: every Nearby ally (this creature included) gets the boost.
      for (const a of ctx.aliveP) {
        if (a.hp <= 0 || unitDist(unit, a) > NEARBY) continue;
        boost(a, NEARBY_BOOST_PCT, unit.uid);
        ctx.newFx.push({ id: ctx.now + "nb" + unit.uid + a.uid, row: a.row, col: a.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  basicHealByLevel: BASIC_HEAL_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const stormwyvern = makeZephyrcooModule(CFG);
export const tempestlord = makeZephyrcooModule(CFG);
