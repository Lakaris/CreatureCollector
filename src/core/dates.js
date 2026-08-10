// Daily-reset helpers.
//
// Every daily system in the game (login rewards, daily missions, daily
// boss, dungeon-pass regen) resets at the SAME moment: noon Eastern Time
// (America/New_York), which auto-adjusts across EST/EDT. There is only
// one convention now -- do not reintroduce a local-midnight or
// local-noon variant.

const ET_TZ = "America/New_York";

const etDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: ET_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const etOffsetFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: ET_TZ,
  timeZoneName: "shortOffset",
  hour: "2-digit",
});

/** Eastern-time calendar date, as "YYYY-MM-DD". */
export function easternDateKey(ts = Date.now()) {
  return etDateFmt.format(ts);
}

/**
 * Offset of Eastern Time from UTC, in minutes (e.g. -300 for EST, -240 for
 * EDT), for the moment `ts`. Detected live so DST transitions "just work".
 */
function easternOffsetMinutes(ts) {
  const part = etOffsetFmt.formatToParts(ts).find((p) => p.type === "timeZoneName");
  const m = part && part.value.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!m) return -300;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return h * 60 + (h < 0 ? -min : min);
}

/**
 * The "game day" key, which flips at noon Eastern rather than midnight.
 * Shifting the timestamp back 12h before reading the Eastern calendar date
 * puts anything before noon ET into the previous game-day's bucket.
 */
export function easternNoonDayKey(ts = Date.now()) {
  return easternDateKey(ts - 12 * 3600 * 1000);
}

/** True when `lastKey` (an `easternNoonDayKey` string) is not the current game day. */
export function isPastEasternNoon(lastKey, ts = Date.now()) {
  return lastKey !== easternNoonDayKey(ts);
}

/** Timestamp (ms) of the next noon-Eastern boundary strictly after `ts`. */
export function nextEasternNoon(ts = Date.now()) {
  const key = easternDateKey(ts);
  const [y, mo, d] = key.split("-").map(Number);
  const offsetMin = easternOffsetMinutes(ts);
  let candidate = Date.UTC(y, mo - 1, d, 12, 0, 0) - offsetMin * 60000;
  if (candidate <= ts) {
    candidate = Date.UTC(y, mo - 1, d + 1, 12, 0, 0) - offsetMin * 60000;
  }
  return candidate;
}
