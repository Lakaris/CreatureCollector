// Reward granting. Quests, daily missions, the battle pass, login rewards,
// treasure sets, farm harvests, and arena stages all hand out rewards as a
// plain `{currencyKey: amount}` object; this is the one place that applies them.

/**
 * Merge a `{key: amount}` reward object into a currency map, returning a new map.
 * Missing keys start at 0.
 */
export function mergeRewards(currencies, reward) {
  const next = { ...currencies };
  for (const [key, amount] of Object.entries(reward || {})) {
    next[key] = (next[key] || 0) + amount;
  }
  return next;
}

/** Apply a reward object through a React setState updater. */
export function applyRewards(setCurrencies, reward) {
  setCurrencies((c) => mergeRewards(c, reward));
}
