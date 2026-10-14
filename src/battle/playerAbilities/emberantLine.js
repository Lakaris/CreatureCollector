// Emberant (fire ant) line: Formic Spray / Kindled Brood / Alarm Pheromone.
//
// Formic Spray keeps the engine's default ranged attack flow (closest enemy);
// every upgrade is +damage, and the max tier Burns every enemy it hits (not a
// boss -- it shrugs off on-hit effects).
//
// Kindled Brood is an ally-buff, so it fires as soon as it is charged: every
// Nearby ally (this creature included) is healed and becomes Kindled for the
// standard duration -- a buff (`kindledTicks`, dispellable, shown in the info
// panel) under which every enemy its abilities damage is Burned. That Burn
// lands as its own stack source beside the ability's (withSourceSuffix), so
// an ability that already Burns lays one additional stack. At max, the allies
// also gain Attack Up.
//
// Alarm Pheromone: Nearby allies (this creature included) deal 5-20% more
// damage to Burning enemies (onDamageBonus in hp.js -- ability damage only;
// several Emberants don't add up, the strongest applies). At max, when an
// ally of this creature tries to Burn an enemy already at max Burn stacks,
// the enemy detonates instead: modest damage to every enemy Nearby it (itself
// included), and all its Burn is dispelled -- the attempted Burn is spent on
// the detonation. Once per enemy, and on a long cooldown per Emberant (design
// intent, not card text -- see the line's notes in data/creatures.js).

import { attackRoll } from "../damage.js";
import { unitDist } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, healUnit, onHitLanded, onDamageBonus } from "../hp.js";
import { battleRoster, sameSide, buffTicks, battleTick, withNestedAbility } from "../applier.js";
import { applyBurn, applyStatMod, healReceivedMultiplier, withSourceSuffix, onBurnAtCap } from "../status.js";
import { hasRule } from "../classifications.js";

/** Displayed values by level (the card's DMG and HEAL badges). */
const BASIC_DMG_BY_LEVEL = [16, 18, 20, 23, 23];
const SPECIAL_HEAL_BY_LEVEL = [12, 16, 20, 24, 24];
/** Kindled Brood max tier: one Attack Up stack, the standard 15%. */
const ATK_UP_PCT = 15;
/** Alarm Pheromone: more damage to Burning enemies, by unique level. */
const ALARM_DMG_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
/** The detonation: modest damage (card-equivalent, like a Special's number)
 * on a long cooldown, in ticks (2 per second). */
const DETONATE_DMG = 20;
const DETONATE_COOLDOWN_TICKS = 30;
const NEARBY = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

const LINE_IDS = new Set(["emberant", "formicinder"]);
const emberants = () => battleRoster().filter((u) => u.hp > 0 && LINE_IDS.has(u.creatureId));
const isBurning = (u) => (u.burnTicks || 0) > 0;

// Kindled: an ability hit from a Kindled creature Burns what it damaged.
// Effect damage (DoT ticks, reflects, hazards) never does. A Basic's Burn is
// an on-hit effect, which a boss shrugs off; a Special's still lands.
onHitLanded((attacker, target, info) => {
  if (!((attacker.kindledTicks || 0) > 0) || info.effectDamage || target.hp <= 0 || sameSide(attacker, target)) return;
  if (info.ability === "basic" && hasRule(target, "ignoresOnHitEffects")) return;
  withSourceSuffix(":kindled", () => applyBurn(target, attacker.atk));
});

// Alarm Pheromone: allies Nearby an Emberant hit Burning enemies harder.
onDamageBonus((attacker, target) => {
  if (!isBurning(target)) return 0;
  let best = 0;
  for (const e of emberants()) {
    if (!sameSide(e, attacker) || unitDist(e, attacker) > NEARBY) continue;
    best = Math.max(best, ALARM_DMG_PCT_BY_LEVEL[abilityIdx(e, "unique")]);
  }
  return best;
});

// Alarm Pheromone max tier: a Burn attempted on a max-stacked enemy detonates it.
onBurnAtCap((applier, target) => {
  if (!applier || target._pheromoneDetonated || target.hp <= 0) return false;
  const now = battleTick();
  const queen = emberants().find((e) => sameSide(e, applier) && !sameSide(e, target)
    && abilityIdx(e, "unique") >= MAX_IDX && (e._detonateReadyAt || 0) <= now);
  if (!queen) return false;
  target._pheromoneDetonated = true;
  queen._detonateReadyAt = now + DETONATE_COOLDOWN_TICKS;
  const victims = battleRoster().filter((f) => f.hp > 0 && !sameSide(f, queen) && unitDist(target, f) <= NEARBY);
  withNestedAbility(queen, "unique", () => {
    for (const f of victims) {
      damageUnit(f, Math.max(1, Math.round((attackRoll(queen) * DETONATE_DMG) / BASIC_DMG_BASELINE)), { effectDamage: true });
    }
  });
  // All its Burn goes, every stack and every source's tally with it.
  target.burnTicks = 0;
  target.burnStacks = 0;
  target.burnSourceAtk = 0;
  target.burnSource = null;
  target.burnUndispellable = false;
  target._burnStacksSrc = {};
  return true;
});

export function makeEmberantModule(cfg) {
  const { basicDmgByLevel, specialHealByLevel } = cfg;
  return {
    /** Formic Spray: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Formic Spray max tier: every landed hit inflicts Burn. */
    onHit(unit, target) {
      if (abilityIdx(unit, "basic") >= MAX_IDX && target.hp > 0 && !hasRule(target, "ignoresOnHitEffects")) applyBurn(target, unit.atk);
      return 0;
    },

    /** Kindled Brood heals and buffs: it fires as soon as it is charged. */
    specialInRange() {
      return true;
    },

    special(unit, ctx) {
      const idx = abilityIdx(unit, "special");
      for (const a of ctx.aliveP) {
        if (a.hp <= 0 || unitDist(unit, a) > NEARBY) continue;
        if ((a.healImmuneTicks || 0) <= 0) healUnit(a, Math.max(1, Math.round(specialHealByLevel[idx] * healReceivedMultiplier(a))));
        a.kindledTicks = Math.max(a.kindledTicks || 0, buffTicks(a, STATUS_TICKS));
        if (idx >= MAX_IDX) applyStatMod(a, { kind: "atk", pct: ATK_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
        ctx.newFx.push({ id: ctx.now + "kb" + unit.uid + a.uid, row: a.row, col: a.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
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
export const emberant = makeEmberantModule(CFG);
export const formicinder = makeEmberantModule(CFG);
