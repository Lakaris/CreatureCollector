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
  if (u.abilJustFired) u._pendingCharge = (u._pendingCharge || 0) + amount;
  else u.abilCharge = Math.min(u.abilChargeMax, (u.abilCharge || 0) + amount);
}
