// Applying damage to a unit's Health.
//
// POLICY: every point of damage dealt to a unit goes through damageUnit --
// basic attacks, ability modules, boss actions, minion specials, DoTs, and
// reflects alike -- so a Shield always absorbs before Health is touched.
// Never subtract from `.hp` directly anywhere else.
//
// An ability may bypass the Shield ONLY when its own displayed text says so,
// by passing {pierceShield: true}. Nothing does today; adding one means
// writing it in the ability's text first.
//
// The boss's own separate shield pool is handled by damageBoss in damage.js.
//
// This lives in its own module (rather than in status.js beside the Shield
// timer, or in damage.js beside the damage formulas) so that status.js and
// damage.js can both use it without an import cycle.

/**
 * Fortify (Iglet's Hunker In) lives here rather than in status.js because
 * damageUnit below is what spends it, and status.js already imports this
 * module (the reverse import would be a cycle -- see the header note).
 *
 * Each stack halves incoming ABILITY damage -- basic attacks and damaging
 * specials alike -- and is spent by the very hit it reduces. Effect damage
 * (Burn, Damage Over Time, Hazards, reflects) passes {effectDamage: true}
 * and is neither reduced nor spends a stack, so damage over time is the
 * clean counter to a stacked-up Fortify.
 */
export const FORTIFY_STACK_CAP = 10;
export const FORTIFY_REDUCTION_PCT = 50;

/**
 * Dodge (Cragling's Seventy-Two Forms) lives here for the same reason as
 * Fortify: it is spent by the hit it cancels, and this is the one place
 * every hit passes through.
 *
 * `dodgeEvery` is the interval (dodge every Nth instance) and `dodgeCounter`
 * the running tally; the dodged hit deals no damage and, because damageUnit
 * flags it on the target, the attack loop skips its onHit effects and the
 * defender's reflect too -- "no damage and negative effects are dealt".
 *
 * Only ability damage counts: effect damage ({effectDamage: true} -- Burn,
 * DoTs, Hazards, reflects) neither advances the tally nor can be dodged, so
 * a dodge is always spent on a real swing rather than wasted on a burn tick.
 */

/**
 * Protect (Frillet's Aegis Frill) lives here for the same reason Fortify and
 * Dodge do: damageUnit is what spends it, and this is the one place every hit
 * passes through.
 *
 * A protected ally does not take the hit at all -- it is redirected onto the
 * creature that granted Protect, which then resolves it with its OWN Shield,
 * Fortify, and Dodge. One stack is spent per redirect.
 *
 * `src` holds the guardian itself rather than its uid (the way Taunt stores
 * `tauntSourceUid`) because damageUnit has no access to the rosters to
 * resolve one. Battle snapshots are shallow spreads, never JSON, so carrying
 * a live reference here is safe; a guardian that dies or is pruned simply
 * fails the `hp > 0` check below and the redirect stops happening.
 *
 * Only attacks and abilities redirect. Effect damage ({effectDamage: true} --
 * Burn, Damage Over Time, Hazards, reflects) is nobody's to intercept, so it
 * lands where it started and spends no stack.
 */
export const PROTECT_STACK_CAP = 5;

export function applyProtect(target, guard, stacks = 1) {
  if (!target || !guard || target === guard || target.uid == null) return;
  // One guardian at a time -- a newer Protect replaces an older one outright,
  // the same way a new Taunt replaces the old.
  const carried = target.protect && target.protect.src === guard ? target.protect.stacks : 0;
  target.protect = { src: guard, stacks: Math.min(PROTECT_STACK_CAP, carried + stacks) };
}

/** Stacks currently carried, 0 when nothing is guarding this unit. */
export function protectStacks(u) {
  return u && u.protect ? u.protect.stacks : 0;
}

/** Drop the guard outright (buff removal). */
export function clearProtect(u) {
  if (u) u.protect = null;
}

/**
 * POLICY: every Shield a unit is given goes through applyShield.
 *
 * A Shield is a plain number, not a stack of charges -- closer to a Heal that
 * sits in front of Health than to Fortify or Protect. Shields therefore do
 * NOT add together: when a second one lands, the larger is kept along with
 * its own timer, and a strictly smaller one is ignored outright (it neither
 * shrinks the pool nor refreshes the duration). An equal one does replace,
 * so a creature recasting its own Shield still refreshes it.
 *
 * A Shield may stack ONLY when its own displayed text says so. The one thing
 * that does today is the Light boss's Holy Radiance -- its description reads
 * "stackable" -- so it adds to its pool directly (battle/bosses/light.js) and
 * deliberately does not come through here. Bulwark, that boss's passive, adds
 * to the same pool for the same reason: the boss's Shield is one plain number
 * with no timer, spent by damageBoss in damage.js, not a unit Shield at all.
 *
 * Returns true when this Shield was the one kept.
 */
export function applyShield(u, amount, ticks) {
  const shield = Math.max(1, Math.round(amount));
  if (shield < (u.shield || 0)) return false;
  u.shield = shield;
  u.shieldTicks = ticks;
  return true;
}

/**
 * Burn `dmg` through a unit's Shield pool first -- temporary bonus Health
 * from e.g. Pebbit's Boulder Hunker or Morusk's Blubber Wall. Returns
 * whatever damage is left over for Health.
 */
export function absorbShield(u, dmg) {
  if ((u.shield || 0) <= 0 || dmg <= 0) return dmg;
  const absorbed = Math.min(u.shield, dmg);
  u.shield -= absorbed;
  return dmg - absorbed;
}

/**
 * Deal `dmg` to a unit: Shield first, then Health. Returns the full damage
 * dealt (including the shield-absorbed part) so callers can keep their damage
 * totals and charts unchanged.
 */
export function damageUnit(target, dmg, { pierceShield = false, effectDamage = false, redirected = false } = {}) {
  if (!target || dmg <= 0) return 0;
  // Intangible (Deep Submerge): can not be damaged at all -- every damage
  // source routes through here, so the immunity is engine-wide by design.
  if ((target.intangibleTicks || 0) > 0) return 0;
  target._dodgedHit = false;
  target._redirectedTo = null;
  // Protect: hand the hit to the guardian before anything else resolves, so
  // it meets that creature's defenses rather than this one's. `redirected`
  // stops a chain -- two creatures guarding each other must not ping-pong.
  if (!effectDamage && !redirected && (target.protect?.stacks || 0) > 0) {
    const guard = target.protect.src;
    if (guard && guard !== target && guard.hp > 0 && (guard.intangibleTicks || 0) <= 0) {
      target.protect.stacks--;
      if (target.protect.stacks <= 0) target.protect = null;
      target._redirectedTo = guard;
      return damageUnit(guard, dmg, { pierceShield, effectDamage, redirected: true });
    }
  }
  // Dodge: every Nth ability hit misses outright. Checked before Fortify so a
  // dodged swing does not also burn a Fortify stack.
  if (!effectDamage && (target.dodgeEvery || 0) > 0) {
    target.dodgeCounter = (target.dodgeCounter || 0) + 1;
    if (target.dodgeCounter >= target.dodgeEvery) {
      target.dodgeCounter = 0;
      target._dodgedHit = true;
      return 0;
    }
  }
  // Fortify: ability damage only. Halve it, then spend the stack that did it.
  if (!effectDamage && (target.fortifyStacks || 0) > 0) {
    dmg = Math.max(1, Math.round((dmg * (100 - FORTIFY_REDUCTION_PCT)) / 100));
    target.fortifyStacks--;
  }
  // Windbreak (Iglet's aura): unlike Fortify this reduces EVERY source,
  // effect damage included -- it is shelter, not a guard stance.
  if ((target.windbreakTicks || 0) > 0 && (target.windbreakPct || 0) > 0) {
    dmg = Math.max(1, Math.round((dmg * (100 - target.windbreakPct)) / 100));
  }
  const toHealth = pierceShield ? dmg : absorbShield(target, dmg);
  // Immortal (Silver Draught): Health can not be reduced below 1 -- the
  // clamp beats everything, shield-piercing damage included.
  const floor = (target.immortalTicks || 0) > 0 ? 1 : 0;
  target.hp = Math.max(floor, target.hp - toHealth);
  // Revive (Rekindle): a unit carrying the one-shot flag (set by its module
  // at battle start) returns at full Health the first time it would die.
  // Consuming it here means every damage source routes through it. Statuses
  // are deliberately kept -- a reborn phoenix doesn't mind still burning.
  if (target.hp <= 0 && target._reviveReady) {
    target._reviveReady = false;
    target.hp = target.maxHp;
  }
  // Time of death, for defeat animations (ui/components/battleArtState.js).
  // Stamped here because every damage source routes through this function, and
  // only after the revive check so a reborn unit is not marked dead. Cleared
  // by that same revive path, so a second death re-stamps.
  if (target.hp <= 0) {
    if (!target.deathTime) target.deathTime = Date.now();
  } else if (target.deathTime) {
    target.deathTime = 0;
  }
  return dmg;
}
