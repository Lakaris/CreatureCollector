// Special charge granted by effects (not the per-tick Haste fill, which lives
// in tick.js's tickSpecialCharge).
//
// POLICY: every bonus charge goes through gainSpecialCharge -- Staff Strike's
// on-hit charge, Stirring Depths' charge-on-damaged, Basic-crit gear -- so all
// of them survive the special's reset the same way (see below) and any future
// "charge gained +X%" effect has one place to hook.
//
// Imports nothing, so damage.js can use it without cycling through tick.js.

/**
 * Berserk Core: "Special abilities are sealed." A sealed creature never
 * charges or casts its Special -- tick.js checks this before both.
 */
export function isSpecialSealed(u) {
  return !!u?.gear?.sealSpecial;
}

/**
 * Add `amount` charge (in charge points, not percent), capped at full.
 *
 * On the tick the special fired (`abilJustFired`), the bar is about to be
 * zeroed by tickSpecialCharge; charge earned in that window is banked in
 * `_pendingCharge` and paid out right after the reset instead of being lost.
 */
export function gainSpecialCharge(u, amount) {
  if (!u || !u.abilChargeMax || !(amount > 0) || isSpecialSealed(u)) return;
  if (u.abilJustFired) { u._pendingCharge = (u._pendingCharge || 0) + amount; return; }
  const room = u.abilChargeMax - (u.abilCharge || 0);
  u.abilCharge = Math.min(u.abilChargeMax, (u.abilCharge || 0) + amount);
  if (amount > room) bankOverflowCharge(u, amount - Math.max(0, room));
}

/**
 * Overcharge Cell: charge gained past a full bar -- from the Haste fill while
 * the Special holds for a target, or from any bonus above -- is banked, up to
 * `gear.chargeOverflowPct` of the bar, and paid into the NEXT charge when the
 * Special's reset happens (tickSpecialCharge in tick.js).
 */
export function bankOverflowCharge(u, amount) {
  const pct = u?.gear?.chargeOverflowPct || 0;
  if (!pct || !(amount > 0) || !u.abilChargeMax) return;
  u._overflowCharge = Math.min((u.abilChargeMax * pct) / 100, (u._overflowCharge || 0) + amount);
}

/**
 * POLICY: every removal of a creature's Special charge goes through here
 * (Constrict's drain), so gear that reacts to it has one place to hook:
 * Thief's Hourglass gives the remover a share of what it took. The remover is
 * the current applier. Returns the charge actually removed.
 */
export function removeSpecialCharge(target, amount, remover = null) {
  if (!target || !target.abilChargeMax || !(amount > 0)) return 0;
  const taken = Math.min(target.abilCharge || 0, amount);
  target.abilCharge = (target.abilCharge || 0) - taken;
  const pct = remover?.gear?.chargeStealPct || 0;
  if (pct && taken > 0 && remover !== target && remover.hp > 0 && remover.abilChargeMax) {
    // The bar sizes differ, so the share is of the same FRACTION of a bar.
    gainSpecialCharge(remover, ((taken / target.abilChargeMax) * remover.abilChargeMax * pct) / 100);
  }
  return taken;
}
