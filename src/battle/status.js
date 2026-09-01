// Status effects: damage-over-time and timed debuffs.
//
// DoT magnitudes scale off the boss's attack, so a level-10 boss's burn hurts
// more than a level-1 boss's. When the boss is dead they fall back to a flat 2.

import { damageUnit, FORTIFY_STACK_CAP } from "./hp.js";
import { aChebDist } from "./geometry.js";

/** Damage per tick for Burn, as a fraction of boss attack. Damage Over Time
 * and Poison scale off the victim instead -- see DOT_HEALTH_PCT below. */
const DOT_RATES = { burn: 0.04 };

/**
 * Damage Over Time is the exception: it scales off the AFFECTED creature's
 * max Health rather than off whoever applied it, so one stack costs the same
 * share of anyone's health bar -- a chip attacker's rot bites a boss exactly
 * as hard, proportionally, as it bites a common minion. Per stack, per tick.
 */
export const DOT_HEALTH_PCT = 0.5;

/** Per-tick DoT damage on a unit (or boss): a flat share of its own max HP. */
export function dotTickDamage(target) {
  return Math.max(1, Math.round(((target.maxHp || 0) * DOT_HEALTH_PCT) / 100));
}

function dotDamage(boss, rate) {
  return Math.max(1, Math.round(boss && boss.hp > 0 ? boss.atk * rate : 2));
}

/**
 * Apply every DoT and decrement every timed debuff on the player side.
 * Pushes its own FX; returns nothing.
 *
 * Ticked once per battle tick, after units act and before the boss acts.
 */
export function tickStatusEffects(aliveP, boss, newFx, now) {
  for (const u of aliveP) {
    // Burn — fire boss's Burning Touch (boss-ATK scaled), or an enemy
    // Emberstar's Burning Bond, which stores its own source ATK on the
    // target (the fire boss never sets burnSourceAtk).
    if ((u.burnTicks || 0) > 0) {
      const dmg = u.burnSourceAtk
        ? Math.max(1, Math.round(u.burnSourceAtk * 0.035))
        : dotDamage(boss, DOT_RATES.burn);
      damageUnit(u, dmg, { effectDamage: true });
      u.burnTicks--;
      if (!u.burnTicks) u.burnSourceAtk = 0;
      newFx.push({ id: now + "brn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    // Root's timer runs in tickTimedMods instead -- that one ticks BOTH
    // sides, and an enemy-side Root used to never expire.
    // Damage Over Time and Poison + weaken + heal-block — the dark boss's
    // Shadow DoT, the nature boss's Overgrowth, and every player-inflicted
    // one alike, all scaling off this creature's own max Health (see
    // DOT_HEALTH_PCT), multiplied by that flavor's stack count.
    const hurt = (dmg) => damageUnit(u, dmg, { effectDamage: true });
    tickOverTime(u, "dot", hurt, newFx, now);
    tickOverTime(u, "poison", hurt, newFx, now);
    if ((u.weakTicks || 0) > 0) u.weakTicks--;
    if ((u.healImmuneTicks || 0) > 0) u.healImmuneTicks--;
  }
}

/**
 * Rooted units are held in place and NOTHING else: they still attack, and
 * they still cast their specials. The only thing Root takes away is
 * position -- walking (ctx.stepToward) and teleporting (ctx.relocate) both
 * refuse while it is up, so a special that has to close the distance simply
 * finds nowhere to go.
 */
export function isRooted(u) {
  return (u.rootTicks || 0) > 0;
}

/** Slow and shock both halve action speed by doubling the cooldown. */
export function speedPenalty(u) {
  return (u.slowTicks || 0) > 0 || (u.shockTicks || 0) > 0 ? 2 : 1;
}

/** Weakened units deal 30% less damage. */
export function weakenMultiplier(u) {
  return (u.weakTicks || 0) > 0 ? 0.7 : 1;
}

// ── Stackable stat modifiers ─────────────────────────────────────────────
//
// ATK Up/Down, Speed Up/Down, DEF Down, and Healing Down all live in one
// per-source list (`u.statMods`). The rules:
//
//   - One source contributes AT MOST one stack per effect: reapplying from
//     the same source refreshes that stack's own duration (and magnitude),
//     never adds a second.
//   - Different sources stack, each with its own magnitude and its own
//     independent timer, so fielding several creatures with the same
//     buff/debuff is rewarded instead of wasted.
//   - Each effect (same stat, same direction) caps at 5 stacks. At the cap
//     a stronger newcomer replaces the weakest stack; a weaker one is
//     ignored.
//   - The total effect is the sum of the active stacks' percents.
//
// Entries: {kind:"atk"|"spd"|"def"|"heal", pct:<signed>, src, ticks}.
// Control debuffs (Root, Stun, Taunt, Slow, Shock, Weaken, Heal Block) and
// DoTs deliberately stay out of this system -- they don't stack.

export const STAT_MOD_STACK_CAP = 5;

/**
 * Effects whose total comes from a stacking table (indexed by stack count)
 * instead of summing each source's magnitude. Attack/Defense Down step
 * 15/20/25/30/40: middle stacks add a flat 5 each so a stat can't be zeroed
 * by piling on sources, and the 5th stack pays double, making a full stack
 * the clear payoff.
 *
 * Keys are `kind` + direction. Effects with no table here just sum their
 * stacks (Speed Up +25 each, Healing Down -20 each, Speed/Haste Down -5 each),
 * which is already linear, so both models agree. These tables are mirrored
 * by the `stacking` fields in ABILITY_TAG_DEFS (core/abilityText.js) --
 * keep the two in sync so the pills never lie.
 */
const STACK_TABLES = {
  "atk-": [15, 20, 25, 30, 40],
  "def-": [15, 20, 25, 30, 40],
};

/** Same stat, same direction = the same effect for stacking/cap purposes. */
function sameEffect(a, kind, pct) {
  return a.kind === kind && (a.pct < 0) === (pct < 0);
}

/**
 * Apply (or refresh) one source's stack of a stat modifier.
 * `src` is the applier's uid; anything falsy is treated as one shared
 * anonymous source.
 */
export function applyStatMod(u, { kind, pct, src, ticks = 6 }) {
  if (!pct) return;
  const mods = (u.statMods ||= []);
  const mine = mods.find((m) => sameEffect(m, kind, pct) && m.src === src);
  if (mine) { mine.pct = pct; mine.ticks = ticks; return; }
  const stacks = mods.filter((m) => sameEffect(m, kind, pct));
  if (stacks.length >= STAT_MOD_STACK_CAP) {
    const weakest = stacks.reduce((a, b) => (Math.abs(a.pct) <= Math.abs(b.pct) ? a : b));
    if (Math.abs(pct) <= Math.abs(weakest.pct)) return;
    mods.splice(mods.indexOf(weakest), 1);
  }
  mods.push({ kind, pct, src, ticks });
}

/**
 * Combined multiplier for one stat. Each direction is resolved separately:
 * table-driven effects read their total off STACK_TABLES by stack count,
 * everything else sums its stacks' percents.
 */
export function statModMultiplier(u, kind) {
  if (!u.statMods || !u.statMods.length) return 1;
  let sum = 0;
  for (const negative of [true, false]) {
    const stacks = u.statMods.filter((m) => m.kind === kind && (m.pct < 0) === negative);
    if (!stacks.length) continue;
    const table = STACK_TABLES[kind + (negative ? "-" : "+")];
    if (table) sum += (negative ? -1 : 1) * table[Math.min(stacks.length, table.length) - 1];
    else for (const m of stacks) sum += m.pct;
  }
  const mult = 1 + sum / 100;
  // Speed keeps a floor so stacked slows can never freeze a unit outright;
  // the rest just can't go negative (a fully Healing-Downed unit heals 0).
  return kind === "spd" ? Math.max(0.25, mult) : Math.max(0, mult);
}

/** Active stack count for one effect (kind + direction); for the info panel. */
export function statModStacks(u, kind, negative) {
  if (!u.statMods) return 0;
  return u.statMods.filter((m) => m.kind === kind && (m.pct < 0) === negative).length;
}

/** True if any negative stat mod is active (they count as cleansable debuffs). */
export function hasNegativeStatMods(u) {
  return !!u.statMods && u.statMods.some((m) => m.pct < 0);
}

/** Strip every negative stat mod (Cleanse); buff stacks are untouched. */
export function clearNegativeStatMods(u) {
  if (u.statMods) u.statMods = u.statMods.filter((m) => m.pct >= 0);
}

/**
 * One expiry tick for stat mods: age every stack, drop the expired.
 * `negativeOnly` is for Pebbit's Stone Skin, which fast-forwards debuffs.
 */
export function tickStatMods(u, negativeOnly = false) {
  if (!u.statMods || !u.statMods.length) return;
  for (const m of u.statMods) if (!negativeOnly || m.pct < 0) m.ticks--;
  u.statMods = u.statMods.filter((m) => m.ticks > 0);
}

/**
 * Decrement every generic timed modifier on one unit (player, minion, or
 * boss): stat-mod stacks, Taunt, Shield, and Stun. Ticked once per battle
 * tick from each unit loop.
 */
export function tickTimedMods(u) {
  tickStatMods(u);
  if ((u.tauntTicks || 0) > 0) {
    u.tauntTicks--;
    if (!u.tauntTicks) u.tauntSourceUid = null;
  }
  if ((u.shieldTicks || 0) > 0) {
    u.shieldTicks--;
    if (!u.shieldTicks) u.shield = 0;
  }
  if ((u.stunTicks || 0) > 0) u.stunTicks--;
  if ((u.rootTicks || 0) > 0 && !--u.rootTicks) u.rootUndispellable = false;
  if ((u.intangibleTicks || 0) > 0) u.intangibleTicks--;
  if ((u.markedTicks || 0) > 0) u.markedTicks--;
  if ((u.frostbiteTicks || 0) > 0) {
    u.frostbiteTicks--;
    if (!u.frostbiteTicks) u.frostbiteStacks = 0;
  }
  if ((u.immortalTicks || 0) > 0) u.immortalTicks--;
  if ((u.dartShredTicks || 0) > 0) {
    u.dartShredTicks--;
    if (!u.dartShredTicks) u.dartShredPct = 0;
  }
  // Windbreak's aura decays on its own once its source stops refreshing it
  // (the Iglet died, or the ally walked out of range) -- see applyWindbreak.
  if ((u.windbreakTicks || 0) > 0) {
    u.windbreakTicks--;
    if (!u.windbreakTicks) u.windbreakPct = 0;
  }
  // Heal Over Time: restore hotAmount per tick. Heal Block and Healing Down
  // apply at each tick, like any other heal (5 Healing Down stacks = 0).
  if ((u.hotTicks || 0) > 0) {
    u.hotTicks--;
    if ((u.healImmuneTicks || 0) <= 0 && u.hp > 0) {
      const amt = Math.round((u.hotAmount || 1) * healReceivedMultiplier(u));
      if (amt > 0) u.hp = Math.min(u.maxHp, u.hp + amt);
    }
    if (!u.hotTicks) u.hotAmount = 0;
  }
}

/**
 * Plume Dart's ramping Defense shred (Quetzalis line): every landed dart
 * shaves another slice off the victim's DEF, up to the cap. One shared
 * refreshing timer, all progress lost on expiry -- a grind, distinct from
 * the per-source Defense Down stat mod (both multiply in unitDamage).
 */
export const DART_SHRED_CAP_PCT = 50;
export function applyDartShred(u, pct) {
  u.dartShredPct = Math.min(DART_SHRED_CAP_PCT, (u.dartShredPct || 0) + pct);
  u.dartShredTicks = 6;
}
export function dartShredMultiplier(u) {
  if ((u.dartShredTicks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.dartShredPct || 0) / 100);
}

/**
 * Blind (Pollen Veil at max level): the carrier's next basic attack misses
 * outright -- no damage, and none of the on-hit effects that swing would have
 * carried. The miss consumes it, so it costs exactly one swing.
 *
 * The mirror image of Dodge in hp.js: same missed hit, but worn by the
 * attacker rather than the defender. Deliberately a plain boolean -- it does
 * not stack, and a second application just re-arms the same single miss.
 * Scoped to basic attacks: specials are abilities, not attacks.
 */
export function applyBlind(u) {
  u.blinded = true;
}

export function isBlinded(u) {
  return !!u.blinded;
}

/** Spend the Blind if present; true when this swing should miss. */
export function consumeBlind(u) {
  if (!u.blinded) return false;
  u.blinded = false;
  return true;
}

/**
 * Over-time debuffs: Damage Over Time (Carrion Rip, Spectral Rake, and the
 * dark boss's Shadow DoT) and Poison (the nature boss's Overgrowth), which
 * are the SAME effect wearing two names. Both stack like Burn -- +N per
 * application, one shared refreshing timer, all of it lost together on
 * expiry -- and every stack adds another helping of the per-tick damage, so
 * 3 stacks hurt three times as much.
 *
 * They are deliberately separate debuffs rather than one pooled counter:
 * a creature can carry both at once, each with its own stacks and its own
 * timer, and an ability that consumes one leaves the other alone.
 *
 * The damage comes from the VICTIM's max Health (dotTickDamage above), not
 * from whoever applied it, so no inflicter identity needs storing here.
 */
export const DOT_STACK_CAP = 5;
export const POISON_STACK_CAP = DOT_STACK_CAP;
/** Standard debuff duration; matches STATUS_TICKS in battle/constants.js. */
const OVER_TIME_TICKS = 6;

/**
 * The two flavors, and which fields each one keeps its state in. `fx` is the
 * effect flag the battle screens render it with (purple rot vs green venom).
 */
export const OVER_TIME_FLAVORS = {
  dot: { ticks: "dotTicks", stacks: "dotStacks", fx: "isDark", fxKey: "dot" },
  poison: { ticks: "poisonTicks", stacks: "poisonStacks", fx: "isPoison", fxKey: "psn" },
};

export function applyOverTime(u, flavor, stacks = 1) {
  const f = OVER_TIME_FLAVORS[flavor];
  u[f.stacks] = Math.min(DOT_STACK_CAP, (u[f.stacks] || 0) + stacks);
  u[f.ticks] = OVER_TIME_TICKS;
}

/** Stacks currently carried -- at least 1 while the effect is running at all. */
export function overTimeStacks(u, flavor) {
  const f = OVER_TIME_FLAVORS[flavor];
  return (u[f.ticks] || 0) > 0 ? Math.max(1, u[f.stacks] || 0) : 0;
}

/**
 * Strip one flavor outright and report how many stacks were taken, for
 * abilities that consume it (Gorge eats the rot for bonus damage).
 */
export function clearOverTime(u, flavor) {
  const f = OVER_TIME_FLAVORS[flavor];
  const taken = overTimeStacks(u, flavor);
  u[f.ticks] = 0;
  u[f.stacks] = 0;
  return taken;
}

/**
 * Tick one flavor on one target: damage scaled by stacks, decrement, and drop
 * the stacks when the timer runs out. Returns true if it fired.
 *
 * `damage` is injected because units go through damageUnit and the boss
 * through damageBoss; `uid` likewise, because the boss has none of its own.
 */
export function tickOverTime(u, flavor, damage, newFx, now, fxPrefix = "", uid = u.uid) {
  const f = OVER_TIME_FLAVORS[flavor];
  if ((u[f.ticks] || 0) <= 0) return false;
  damage(dotTickDamage(u) * Math.max(1, u[f.stacks] || 0));
  u[f.ticks]--;
  if (!u[f.ticks]) u[f.stacks] = 0;
  newFx.push({ id: now + fxPrefix + f.fxKey + uid, row: u.row, col: u.col, t: now, [f.fx]: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
  return true;
}

// Named wrappers -- the two flavors read better at their call sites than
// applyOverTime(u, "dot") does, and modules only ever want one of them.
export const applyDot = (u, stacks = 1) => applyOverTime(u, "dot", stacks);
export const dotStacks = (u) => overTimeStacks(u, "dot");
export const clearDot = (u) => clearOverTime(u, "dot");

export const applyPoison = (u, stacks = 1) => applyOverTime(u, "poison", stacks);
export const poisonStacks = (u) => overTimeStacks(u, "poison");
export const clearPoison = (u) => clearOverTime(u, "poison");

/**
 * Frostbite (Cryo Bomb at max level): Water creatures deal 5% more damage
 * to the carrier per stack. Stacks like Burn -- +1 per application with one
 * shared refreshing timer -- capped at 5 (+25%).
 */
export const FROSTBITE_STACK_CAP = 5;
export function applyFrostbite(u) {
  u.frostbiteStacks = Math.min(FROSTBITE_STACK_CAP, (u.frostbiteStacks || 0) + 1);
  u.frostbiteTicks = 6;
}
export function frostbiteMultiplier(attackerIsWater, defender) {
  if (!attackerIsWater || (defender.frostbiteTicks || 0) <= 0) return 1;
  return 1 + (defender.frostbiteStacks || 0) * 0.05;
}

/**
 * Fortify (Hunker In): stacks that halve incoming ability damage, spent one
 * per hit. The reduction and the spending both live in hp.js's damageUnit
 * (the single damage chokepoint); this is just the granting side.
 *
 * Deliberately timerless -- stacks leave only by being spent -- so it is NOT
 * ticked in tickTimedMods. It is an ordinary dispellable buff by design;
 * nothing in the game strips buffs today, so that only matters once
 * something does (dispelDebuffs clears debuffs and must never touch it).
 */
export function applyFortify(u, stacks) {
  u.fortifyStacks = Math.min(FORTIFY_STACK_CAP, (u.fortifyStacks || 0) + stacks);
}

export function hasFortify(u) {
  return (u.fortifyStacks || 0) > 0;
}

/**
 * Windbreak (Iglet's passive): a while-in-range aura cutting damage taken for
 * nearby allies, applied fresh by the source every tick.
 *
 * `tickKey` is the tick's shared timestamp (ctx.now): the first writer in a
 * tick clears last tick's value, and later writers max against it, so several
 * Iglets never stack -- the strongest shelters, and a dead one's value can't
 * linger. tickTimedMods expires it two ticks after the last refresh.
 */
export function applyWindbreak(u, pct, tickKey) {
  if (u._windbreakAt !== tickKey) {
    u.windbreakPct = 0;
    u._windbreakAt = tickKey;
  }
  u.windbreakPct = Math.max(u.windbreakPct || 0, pct);
  u.windbreakTicks = 2;
}

/**
 * Heal Over Time (e.g. Shared Flame at max level): a BUFF -- untouched by
 * dispelDebuffs -- restoring `perTick` Health per tick, ticked in
 * tickTimedMods above. One shared timer; reapplying keeps the stronger
 * per-tick amount and the longer remaining duration, never stacks.
 */
export function applyHealOverTime(u, perTick, ticks = 6) {
  u.hotAmount = Math.max(u.hotAmount || 0, perTick);
  u.hotTicks = Math.max(u.hotTicks || 0, ticks);
}

/**
 * Strip every dispellable debuff from a unit: DoTs, control effects
 * (including Marked), and negative stat-mod stacks. Buffs are untouched.
 * Restrained is deliberately NOT cleared -- it is undispellable by design.
 * Used by Soothing Hoot's Cleanse and Vanishing Act's self-dispel.
 */
/**
 * Root a unit for `ticks`. `undispellable` marks a Root the creature put on
 * ITSELF as a stance (Siegefin's Holdfast) rather than one an enemy inflicted:
 * dispelDebuffs leaves it alone, so the same ability can cleanse everything
 * else without immediately undoing its own anchor.
 */
export function applyRoot(u, ticks, { undispellable = false } = {}) {
  u.rootTicks = Math.max(u.rootTicks || 0, ticks);
  u.rootUndispellable = !!undispellable;
}

export function dispelDebuffs(u) {
  u.burnTicks = 0;
  u.burnStacks = 0;
  u.burnSourceAtk = 0;
  // A self-inflicted stance Root survives (see applyRoot).
  if (!u.rootUndispellable) u.rootTicks = 0;
  u.dotTicks = 0;
  u.dotStacks = 0;
  u.poisonTicks = 0;
  u.poisonStacks = 0;
  u.blinded = false;
  u.weakTicks = 0;
  u.healImmuneTicks = 0;
  u.slowTicks = 0;
  u.shockTicks = 0;
  u.tauntTicks = 0;
  u.tauntSourceUid = null;
  u.stunTicks = 0;
  u.markedTicks = 0;
  u.frostbiteTicks = 0;
  u.frostbiteStacks = 0;
  u.dartShredTicks = 0;
  u.dartShredPct = 0;
  clearNegativeStatMods(u);
}

/**
 * Intangible (Deep Submerge): can not be targeted or damaged; enemies
 * targeting this creature change targets. Its tile stays occupied. The
 * timer lives here; the damage gate lives in hp.js and the targeting
 * exclusions in tick.js / bosses/context.js.
 */
export function isIntangible(u) {
  return (u.intangibleTicks || 0) > 0;
}

/** Healing received multiplier: stacked Healing Down, floor 0 (no healing). */
export function healReceivedMultiplier(u) {
  return statModMultiplier(u, "heal");
}

/** Stunned units (Overload Sting) can't attack and gain no special charge. */
export function isStunned(u) {
  return (u.stunTicks || 0) > 0;
}

/**
 * Restrained (Shockstinger line): stacks applied on hit gate Overload Sting
 * (20+ to fire); while any stacks are on the carrier, Static Grip slows it
 * by the strongest applier's percentage. It has no timer and can't be
 * Cleansed. Two things take it off: Overload Sting consuming the stacks, and
 * the carrier getting out of the inflicter's reach (see tickRestrained).
 *
 * Stacks are tracked PER SOURCE -- `u.restrained` is a list of
 * {src, stacks, pct, range} -- because the leash is measured from whoever
 * applied them: walking away from one scorpion shouldn't shake off another's
 * grip. `restrainedStacks` and `restrainedSlowPct` are kept in sync as the
 * aggregate totals, which is all the rest of the engine reads.
 */
function syncRestrained(u) {
  const list = u.restrained || [];
  u.restrainedStacks = list.reduce((n, r) => n + r.stacks, 0);
  u.restrainedSlowPct = list.reduce((p, r) => Math.max(p, r.pct), 0);
}

/**
 * Add stacks from one source. `range` is the INFLICTER's attack reach, stored
 * per entry so the leash check doesn't need to look the applier's kit back up.
 */
export function applyRestrained(target, srcUid, stacks, slowPct, range) {
  if (!target || target.uid == null) return;
  const list = target.restrained || (target.restrained = []);
  let entry = list.find((r) => r.src === srcUid);
  if (!entry) list.push((entry = { src: srcUid, stacks: 0, pct: 0, range }));
  entry.stacks += stacks;
  entry.pct = Math.max(entry.pct, slowPct);
  entry.range = range;
  syncRestrained(target);
}

/** Strip every stack from every source (Overload Sting spending them). */
export function clearRestrained(u) {
  u.restrained = [];
  syncRestrained(u);
}

/**
 * Drop the stacks of any source that can no longer reach this carrier: the
 * inflicter walked off, the carrier walked off, or the inflicter was
 * defeated (a creature that has left the field has no range to be inside).
 *
 * Run once per tick after everything has finished moving, so it reads final
 * positions. `findUnit` resolves an applier's uid against BOTH sides, since
 * the carrier is always on the opposite one.
 */
export function tickRestrained(units, findUnit) {
  for (const u of units) {
    const list = u.restrained;
    if (!list || !list.length) continue;
    const kept = list.filter((r) => {
      const src = findUnit(r.src);
      if (!src || src.hp <= 0) return false;
      return aChebDist(src.row, src.col, u.row, u.col) <= r.range;
    });
    if (kept.length === list.length) continue;
    u.restrained = kept;
    syncRestrained(u);
  }
}

export function restrainedSlowMultiplier(u) {
  if ((u.restrainedStacks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.restrainedSlowPct || 0) / 100);
}

// Shield absorption itself lives in battle/hp.js (see absorbShield /
// damageUnit) so that every damage source shares one path; this file only
// owns the Shield's timer, in tickTimedMods above.
