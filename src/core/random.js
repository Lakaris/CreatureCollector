// Randomness primitives shared by every roll in the game (gacha, skins, treasure,
// flair, dungeon rewards). Before this module each of those hand-rolled the same
// cumulative-weight loop.

/**
 * Pick a key from weighted entries.
 *
 * @param {Array<[any, number]>} entries [key, weight] pairs.
 * @param {{total?: number}} [opts]
 *   `total` rolls against a fixed scale instead of the sum of weights. When the
 *   weights add up to less than `total`, the roll can fall through and return
 *   `undefined` -- that gap IS the miss chance (skin rolls rely on this).
 *   Omit `total` to roll against the actual sum, which always returns a key.
 * @returns {any|undefined}
 */
export function weightedPick(entries, opts = {}) {
  const sum =
    opts.total != null ? opts.total : entries.reduce((s, [, w]) => s + w, 0);
  const roll = Math.random() * sum;
  let cum = 0;
  for (const [key, weight] of entries) {
    cum += weight;
    if (roll < cum) return key;
  }
  return undefined;
}

/** Uniformly pick one element. Returns undefined for an empty array. */
export function randomOf(arr) {
  if (!arr || !arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Fisher-Yates shuffle, returning a new array.
 * Replaces the `.sort(() => Math.random() - 0.5)` idiom, which is measurably
 * biased toward leaving elements near their original positions.
 */
export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deterministic mulberry32-style PRNG. Used for stable per-seed farm bonuses. */
export function seededRand(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
