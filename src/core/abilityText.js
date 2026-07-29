// Parses the leading damage number out of an ability upgrade string, for display
// purposes only -- the underlying strings in data/creatures.js are left untouched.
//
// Covers three shapes seen in the data, optionally preceded by a single
// semicolon-delimited clause (e.g. "Shield 55; 20 dmg", "Charge; 45 dmg on impact"):
//   - compact:  "20 dmg", "20 dmg+push+slow 22% 2s"
//   - verbose:  "Deals 10 fire damage", "Deals 12 damage"
//   - hits-for: "Hits nearby foes for 12 damage", "Hits for 17 damage"
//
// Text that doesn't match (pure-utility levels, DoT-only text, multi-clause
// text) is left completely alone by every function here.

const LEADING_DAMAGE_RE = /^([^;]*;\s*)?(?:(\d+)\s*dmg\b|Deals?\s+(\d+)(?:\s+\w+)?\s+(?:damage|dmg)\b|Hits?\s+(?:.+?\s+)?for\s+(\d+)\s+damage\b)/i;

/** {amount, prefix, rest} for the leading damage clause, or null if none found. */
export function extractLeadingDamage(text) {
  if (!text) return null;
  const m = LEADING_DAMAGE_RE.exec(text);
  if (!m) return null;
  const amount = Number(m[2] ?? m[3] ?? m[4]);
  if (!Number.isFinite(amount)) return null;
  return { amount, prefix: m[1] || "", rest: text.slice(m[0].length) };
}

/**
 * Generic single-level display: "20 dmg+push+slow 22% 2s" becomes
 * {label:"Deal damage to an enemy+push+slow 22% 2s", amount:20}. Falls back to
 * {label:text, amount:null} when no leading damage number is found.
 */
export function formatAbilityDisplay(text) {
  const hit = extractLeadingDamage(text);
  if (!hit) return { label: text, amount: null };
  return { label: hit.prefix + "Deal damage to an enemy" + hit.rest, amount: hit.amount };
}

/**
 * Rounds a raw percentage to the nearest 5 (5%, 10%, 15%, 20%, ...) so the
 * displayed number always looks like a deliberate step instead of whatever
 * fell out of the underlying integer damage values (e.g. a real 23% or 24%
 * jump both become a clean 25%). Any nonzero raw value still rounds to at
 * least +-5, so a real increase never gets rounded away to 0%.
 */
function roundToNiceStep(rawPct) {
  let pct = Math.round(rawPct / 5) * 5;
  if (pct === 0 && rawPct > 0) pct = 5;
  if (pct === 0 && rawPct < 0) pct = -5;
  return pct;
}

/**
 * Upgrade-step display for a level-by-level list: "+15% damage" relative to
 * the previous level, when both levels have a parseable leading damage
 * number. Falls back to the original text otherwise (including for the
 * first level, which has no previous level to compare against).
 */
export function formatUpgradeStep(text, prevText) {
  if (!prevText) return text;
  const cur = extractLeadingDamage(text);
  const prev = extractLeadingDamage(prevText);
  if (!cur || !prev || !prev.amount) return text;
  const pct = roundToNiceStep(((cur.amount - prev.amount) / prev.amount) * 100);
  return (pct >= 0 ? "+" : "") + pct + "% damage";
}

/**
 * Single-level display that also knows about the previous level, for the
 * creature page's "current ability" card. When this level is a genuine
 * damage increase over the previous one, returns {isPercent:true, text:"+15% damage"}
 * (rounded to a clean multiple of 5). Otherwise falls back to the generic
 * {isPercent:false, label, amount} shape from formatAbilityDisplay (e.g. for
 * the base level, or a level that isn't a parseable damage increase).
 *
 * A level whose own text has no parseable damage number (e.g. a final
 * upgrade that only adds a bonus effect, like "Hits twice in quick
 * succession") still carries forward the last known damage amount from the
 * previous level instead of dropping the number entirely -- the ability
 * still hits for that much, the upgrade just didn't change it.
 */
export function formatAbilityStep(text, prevText) {
  const cur = extractLeadingDamage(text);
  if (prevText) {
    const prev = extractLeadingDamage(prevText);
    if (cur && prev && prev.amount && cur.amount > prev.amount) {
      const pct = roundToNiceStep(((cur.amount - prev.amount) / prev.amount) * 100);
      if (pct > 0) return { isPercent: true, text: "+" + pct + "% damage", amount: cur.amount };
    }
    if (!cur && prev && prev.amount) {
      return { isPercent: false, label: text, amount: prev.amount };
    }
  }
  return { isPercent: false, ...formatAbilityDisplay(text) };
}
