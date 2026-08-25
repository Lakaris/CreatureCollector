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
export function damageUnit(target, dmg, { pierceShield = false } = {}) {
  if (!target || dmg <= 0) return 0;
  // Intangible (Deep Submerge): can not be damaged at all -- every damage
  // source routes through here, so the immunity is engine-wide by design.
  if ((target.intangibleTicks || 0) > 0) return 0;
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
