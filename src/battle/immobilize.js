// Immobilized: the general term for any effect that PREVENTS MOVEMENT (read
// by Hunter's Snare, and by anything else that wants "can't move right now").
//
// POLICY: this is the one definition. A new movement-preventing effect is
// added here and every reader picks it up.
//
// Today that is Root alone. Stun stops attacks and Special charge but not
// walking (see tick.js), Fear forces movement rather than preventing it, and
// Restrained is a slow-and-leash rather than a hold -- none of them count.
//
// Imports nothing, so hp.js can use it without a cycle.

export function isImmobilized(u) {
  return !!u && (u.rootTicks || 0) > 0;
}

/**
 * POLICY: every enemy effect that forcibly MOVES a creature -- a push, a
 * pull, a knockback, a charge that shoves it along -- asks this first, and
 * leaves the creature where it stands when it returns true (Anchor Charm: "Can
 * not be moved by enemies"). Only the movement is cancelled: the attack's
 * damage and other effects still land. A creature's own movement (walking,
 * teleporting) is never affected.
 */
export function resistsDisplacement(u) {
  return !!u?.gear?.unmovable;
}

/**
 * POLICY: every successful Displace -- a creature forcibly moved by a push,
 * pull or knockback, whoever caused it (a creature's ability via
 * displaceUnit, a boss, a Wind Hazard) -- is announced here once, so gear
 * that reacts to displacement (Cyclone Ring) sees every one. `source` is the
 * creature that caused it, when there is one.
 */
const displacedListeners = [];
export function onDisplaced(fn) {
  displacedListeners.push(fn);
}
export function announceDisplaced(u, source = null) {
  for (const fn of displacedListeners) fn(u, source);
}
