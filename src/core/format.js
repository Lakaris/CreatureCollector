// Display formatting helpers.

/**
 * Format a count for display, abbreviating once it gets long: 100,000+ as
 * "k" (e.g. 320000 -> "320k"), 1,000,000+ as "m" (e.g. 1320000 -> "1.32m").
 * Anything smaller keeps its full comma-grouped form (e.g. "12,500").
 */
export function formatNum(n) {
  const v = n || 0;
  const abs = Math.abs(v);
  if (abs >= 1000000) return Number((v / 1000000).toFixed(2)) + "m";
  if (abs >= 100000) return Number((v / 1000).toFixed(2)) + "k";
  return v.toLocaleString();
}

/**
 * Format a duration as its two largest meaningful units.
 *
 * @param {number} ms
 * @param {{days?: boolean}} [opts] When `days` is true, roll hours into days
 *   ("2d 5h"); otherwise cap at hours ("5h 30m").
 */
export function formatDuration(ms, opts = {}) {
  const safe = Math.max(0, ms || 0);
  const minutes = Math.floor((safe % 3600000) / 60000);
  if (opts.days) {
    const d = Math.floor(safe / 86400000);
    const h = Math.floor((safe % 86400000) / 3600000);
    return d > 0 ? `${d}d ${h}h` : `${h}h ${minutes}m`;
  }
  const h = Math.floor(safe / 3600000);
  return h > 0 ? `${h}h ${minutes}m` : `${minutes}m`;
}
