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
