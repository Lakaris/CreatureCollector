// The acting-creature context, and the gear effects that depend on it.
//
// Most effects are applied through shared helpers (applyStatMod,
// applyOverTime, applyShield, damageUnit, healUnit, ...) that only see the
// TARGET. So the engine names the acting creature here -- for the length of
// its turn (tick.js) and for hooks run on another creature's behalf
// (battle-start passives, reflects, Assists, Special echoes) -- and the
// helpers ask this module how that creature's gear shapes what it does.
// Gear is read as `unit.gear?.<key>`; the keys are listed under BATTLE
// EFFECTS in data/equipment.js.
//
// Duration gear stretches: stat mods, Burn / Damage Over Time / Poison,
// Frostbite, Plume Dart shred, Marked (debuffs); positive stat mods, Shield,
// Heal Over Time, auras (buffs). It does NOT stretch hard control -- Stun,
// Root, Fear, Taunt -- or the untouchable states Intangible and Immortal:
// stretching those would change what a kit can lock down rather than how
// long its pressure lingers (the control-effects-don't-stack policy).
//
// Imports nothing, so status.js, hp.js and damage.js can all use it without
// a cycle.

let current = null;

// Which ability a creature is using right now -- {unit, key} with key
// "basic" / "special" / "unique" -- for gear that cares which ability a hit
// came from: Cricket Chirp / Tuning Fork and Magpie Brooch (Basic only),
// Hydra Tooth (any ability tagged Multi-hit). tick.js sets it as a turn moves
// through its sections: "unique" for the always-on passive, "special" while
// the Special casts, "basic" from the basic section to the end of the turn.
// It is bound to ONE unit, so anything another creature does meanwhile (a
// defender's reflect) never reads as this creature's ability.
let active = null;

// The creature whose Special is being ECHOED (Echo Conch), while the echo
// runs -- see asEcho.
let echoActor = null;

// A Basic attack ENDS when the Basic stops being the ability in use -- the
// turn passes to another creature, the tick's unit phase ends, or an Assist
// hands control back to its caller. At that moment the engine is told
// (tick.js registers the handler), so gear that acts on a whole attack --
// every Nth attack, Chain, Splash -- sees each one exactly once, whether it
// came from the default attack flow, a module's custom basicAttack hook, or
// an Assist. Hits within the attack are collected as they land (hp.js).
let basicAttackEndHandler = null;
export function setBasicAttackEndHandler(fn) {
  basicAttackEndHandler = fn;
}

function switchActive(next) {
  const prev = active;
  active = next;
  if (prev && prev.key === "basic" && (!next || next.unit !== prev.unit) && basicAttackEndHandler) {
    basicAttackEndHandler(prev.unit);
  }
}

export function setActiveAbility(unit, key) {
  switchActive(unit ? { unit, key } : null);
}

/** Run `fn` with `unit` using ability `key`, restoring the previous after. */
export function withActiveAbility(unit, key, fn) {
  const prev = active;
  switchActive(unit ? { unit, key } : null);
  try {
    return fn();
  } finally {
    switchActive(prev);
  }
}

// Every creature in the battle, both sides -- refreshed by tick.js each tick
// -- for gear that reacts to things happening to OTHERS (Warlord's Trophy
// counts every defeat on the field).
let roster = [];
export function setBattleRoster(units) {
  roster = units || [];
}
export function battleRoster() {
  return roster;
}

/** The ability `unit` is using right now, or null. */
export function activeAbilityOf(unit) {
  return active && unit && active.unit === unit ? active.key : null;
}

/** True while `unit` is using its own Basic ability. */
export function isUsingBasic(unit) {
  return activeAbilityOf(unit) === "basic";
}

/** The creature applying effects right now (null between turns and on boss turns). */
export function currentApplier() {
  return current;
}

/**
 * POLICY: every Assist runs through here. An Assist is the called ally using
 * its OWN Basic ability ("Called allies immediately use their Basic ability"),
 * even though it happens inside the caller's Special -- so for the length of
 * `fn` the helper is both the Basic-ability user (Basic-hit gear pays it)
 * and the applier (its own duration/stack gear shapes anything it applies).
 * Both are restored afterwards, so the caller's turn carries on as before.
 */
export function asAssist(helper, fn) {
  return withActiveAbility(helper, "basic", () => withApplier(helper, fn));
}

/**
 * Echo Conch: run `fn` (the unit's Special, cast again) as an echo. While it
 * runs, everything the unit deals, heals, or shields is scaled by
 * `effectiveness()` -- damageUnit / damageBoss, healUnit, applyShield,
 * applyHealOverTime and ground hazards all read it. Durations, stacks, and
 * stat-mod magnitudes are untouched: "effectiveness" is healing and damage.
 * An echo is a Special, never a Basic, and never echoes itself.
 */
export function asEcho(unit, fn) {
  const prevEcho = echoActor;
  echoActor = unit || null;
  try {
    return withActiveAbility(unit, "special", () => withApplier(unit, fn));
  } finally {
    echoActor = prevEcho;
  }
}

/**
 * Run `fn` as `unit`'s own PASSIVE reacting to something (Overheal banking a
 * Shield): the unit is the applier, but it is neither using its Basic nor
 * echoing, so nothing already scaled upstream is scaled twice.
 */
export function asPassive(unit, fn) {
  const prevEcho = echoActor;
  echoActor = null;
  try {
    return withActiveAbility(unit, "unique", () => withApplier(unit, fn));
  } finally {
    echoActor = prevEcho;
  }
}

/** True while `unit`'s Special is being echoed -- for modules whose Special
 * keeps state that a weaker second cast must not overwrite (Blubber Wall). */
export function isEchoCast(unit) {
  return !!unit && unit === echoActor;
}

/** Multiplier on the current applier's damage/healing/shielding: its echo
 * percentage during an echo, 1 otherwise. */
export function effectiveness() {
  const a = current;
  if (!a || a !== echoActor) return 1;
  return (a.gear?.echoSpecialPct ?? 100) / 100;
}

/** Name the acting creature (null = nobody, e.g. hazards and boss turns). */
export function setApplier(unit) {
  current = unit || null;
}

/** Run `fn` with `unit` as the applier, restoring the previous one after. */
export function withApplier(unit, fn) {
  const prev = current;
  current = unit || null;
  try {
    return fn();
  } finally {
    current = prev;
  }
}

/** Duration for a debuff landing on `target`. A creature's own debuffs on
 * itself (costs, self-inflicted stances) are never stretched. */
export function debuffTicks(target, ticks) {
  const a = current;
  const extra = a && a !== target ? a.gear?.debuffTicks || 0 : 0;
  return ticks + extra;
}

/** Duration for a buff landing on `target` (the applier itself or an ally). */
export function buffTicks(target, ticks) {
  return ticks + (current?.gear?.buffTicks || 0);
}

/**
 * Stacks to land for a debuff on `target` (Wyrmblood Chalice: one extra per
 * application). Only STACKABLE effects call this -- Burn, Damage Over Time,
 * Poison, Frostbite, Plume Dart shred, Restrained, and stat-mod stacks (where
 * it is the one exception to "one stack per source"). Everything that does
 * not stack is untouched, which is the "Stackable" in the item's text. Unlike
 * debuffTicks, a creature's debuffs on ITSELF count too.
 */
export function debuffStacks(target, n) {
  return current?.gear?.extraDebuffStack ? n + 1 : n;
}

/** Stacks to land for a buff (Ambrosia Chalice): stat mods, Fortify, Protect. */
export function buffStacks(target, n) {
  return current?.gear?.extraBuffStack ? n + 1 : n;
}

/** Size of a Shield the applier grants: Pearl Lacquer-style gear, and an
 * echo's reduced effectiveness. */
export function shieldAmount(amount) {
  return amount * (1 + (current?.gear?.shieldPct || 0) / 100) * effectiveness();
}

/**
 * POLICY: every debuff landing on a unit asks this first, and is dropped when
 * it returns true (Molted Skin: "Immune to the first debuff inflicted"). Each
 * call that blocks spends one charge of `debuffImmunity`. Only debuffs
 * INFLICTED count: a creature's own self-debuffs (stances, costs) pass
 * untouched and never spend a charge, and so does terrain (`environmental`,
 * e.g. ice hazards that hit both sides alike).
 */
export function resistsDebuff(target, { environmental = false } = {}) {
  if (!target || environmental || current === target) return false;
  const left = (target.gear?.debuffImmunity || 0) - (target._debuffsResisted || 0);
  if (left <= 0) return false;
  target._debuffsResisted = (target._debuffsResisted || 0) + 1;
  return true;
}
