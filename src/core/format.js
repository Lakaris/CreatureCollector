// Display formatting helpers.

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
