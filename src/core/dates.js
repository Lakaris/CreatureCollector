// Daily-reset helpers.
//
// The game uses TWO different reset conventions, both intentional and both live:
//   - Midnight (date-string) resets: daily missions, login rewards, daily boss.
//   - Noon resets: dungeon-pass regeneration and pass-recharge counts.
// Keep them distinct; collapsing them would silently change reset timing.

/** Local date string used as the "which day is it" key. */
export function todayStr(now = Date.now()) {
  return new Date(now).toDateString();
}

/** True when `lastDateStr` is from an earlier day than `now` (midnight reset). */
export function isNewDay(lastDateStr, now = Date.now()) {
  return lastDateStr !== todayStr(now);
}

/**
 * True when it is past `hour` local time and the stored marker is not today.
 * Used by the noon-reset systems.
 */
export function isPastDailyHour(lastDateStr, hour = 12, now = Date.now()) {
  const d = new Date(now);
  return d.getHours() >= hour && lastDateStr !== d.toDateString();
}

/** Timestamp of the next occurrence of `hour` local time, strictly in the future. */
export function nextResetAt(hour = 12, now = Date.now()) {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}
