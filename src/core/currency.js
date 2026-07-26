// Currency mutation helpers. Currency amounts live in one flat `{key: amount}`
// map in app state; these wrap the common add/spend patterns so call sites stop
// re-implementing the spread.

/** True when every `{key: cost}` entry is affordable. */
export function canAfford(currencies, cost) {
  return Object.entries(cost || {}).every(
    ([key, amount]) => (currencies[key] || 0) >= amount
  );
}

/** Add a single currency (negative `amount` subtracts). Returns a new map. */
export function addCurrency(currencies, key, amount) {
  return { ...currencies, [key]: (currencies[key] || 0) + amount };
}

/**
 * Subtract a `{key: cost}` map. Returns a new map, clamped at zero so a
 * mis-priced call can never drive a balance negative.
 */
export function spend(currencies, cost) {
  const next = { ...currencies };
  for (const [key, amount] of Object.entries(cost || {})) {
    next[key] = Math.max(0, (next[key] || 0) - amount);
  }
  return next;
}
