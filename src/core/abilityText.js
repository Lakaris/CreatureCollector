import { getRootDef } from "./creatures.js";

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
/** Heal amount out of a "heal all allies 12 HP" / "recover 10 HP" clause, or null if none found. */
export function extractHeal(text) {
  if (!text) return null;
  const m = /(?:heal|recover)[^\d]{0,40}?(\d+)\s*HP/i.exec(text);
  if (!m) return null;
  const amount = Number(m[1]);
  return Number.isFinite(amount) ? amount : null;
}

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

/** Small mechanic tags shown on ability cards (e.g. Blazehornet's Charging Pierce); click opens a definition popup. */
export const ABILITY_TAG_DEFS = {
  pierce: { label: "Pierce", description: "Deal damage to all enemies this attack passes through." },
  closest: { label: "Closest", description: "Targets the closest enemy in range" },
  farthest: { label: "Farthest", description: "Targets the farthest aligned enemy in range" },
  burn: { label: "🔥 Burn", description: "Deals damage over time" },
  energy: { label: "⚡ Energy", description: "Energy needed to use this ability" },
  weakest: { label: "Weakest", description: "Targets the creature with the lowest current Health" },
  cleanse: { label: "Cleanse", description: "Removes all debuffs" },
  line: { label: "Line", description: "Hits every tile in the direction of the attack, all the way to the arena's edge" },
  speedup: { label: "💨 Speed Up", description: "Temporarily gain +25% Speed" },
  taunt: { label: "Taunt", description: "Enemies target the creature who inflicted the debuff onto them" },
  reflect: { label: "Reflect", description: "Damages the enemy that damaged this creature" },
};

/**
 * Abilities whose level text is written as absolute "N dmg" / "Heal N HP" values
 * but displayed as a fixed phrase at every level -- the number lives only in the
 * DMG/HEAL badge (which grows per level), never in the description text and never
 * as a "+X% damage" step message.
 *
 * Entry shapes: `null` is a damage ability using the generic "Deal damage to an
 * enemy" phrase; `{phrase}` is a damage ability with its own phrase; `{phrase,
 * heal:true}` is a heal ability whose leading "Heal N HP[/s]" clause is swapped
 * for the phrase (N feeds the HEAL badge). An ability key absent from a
 * creature's entry keeps the default per-level formatting (e.g. Ignissaur's
 * passive, whose percent lives in the text itself).
 */
const BLOOMIBIS_PHRASES = {
  basic: null,
  special: { phrase: "Heal 3 allies", heal: true },
  unique: { phrase: "Allies within range are passively healed", heal: true },
};

const IGNISSAUR_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to all enemies" },
};

const CRYSTALCRAB_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to an enemy and Taunt them" },
};

const PLAIN_ABILITY_PHRASES = {
  bloomphoenix: BLOOMIBIS_PHRASES,
  lifephoenix: BLOOMIBIS_PHRASES,
  ignisdragon: IGNISSAUR_PHRASES,
  pyredragon: IGNISSAUR_PHRASES,
  breezekit: {
    basic: null,
    special: { phrase: "Teleport beside and deal damage to an enemy" },
  },
  crystalcrab: CRYSTALCRAB_PHRASES,
  gemcrab: CRYSTALCRAB_PHRASES,
  gemtitan: CRYSTALCRAB_PHRASES,
};

export function usesPlainAbilityLevels(creatureId, key) {
  const perCreature = PLAIN_ABILITY_PHRASES[creatureId];
  return !!perCreature && key in perCreature;
}

const LEADING_HEAL_RE = /^Heal\s+(\d+)\s*HP(?:\/s)?\b/i;

/**
 * {label, amount, healAmt} for one level of a plain-leveled ability (see
 * PLAIN_ABILITY_PHRASES), or null for every other ability -- callers fall back
 * to the generic formatting in that case. Text after the leading clause (e.g. a
 * final level's bonus effect) is appended to the phrase.
 */
export function formatPlainAbilityLevel(creatureId, key, text) {
  if (!usesPlainAbilityLevels(creatureId, key)) return null;
  const cfg = PLAIN_ABILITY_PHRASES[creatureId][key];
  if (cfg && cfg.heal) {
    const m = LEADING_HEAL_RE.exec(text);
    if (!m) return { label: text, amount: null, healAmt: null };
    return { label: cfg.phrase + text.slice(m[0].length), amount: null, healAmt: Number(m[1]) };
  }
  const hit = extractLeadingDamage(text);
  if (!hit) return { label: text, amount: null, healAmt: null };
  const phrase = cfg ? cfg.phrase : "Deal damage to an enemy";
  return { label: hit.prefix + phrase + hit.rest, amount: hit.amount, healAmt: null };
}

/** sacredwasp/divinedrone/holyswarm (Starlit/Starbright/Starburn) currently share identical ability values. */
export function isStarlitAbilityLine(creatureId) {
  return creatureId === "sacredwasp" || creatureId === "divinedrone" || creatureId === "holyswarm";
}

/**
 * Passive self stat buffs some unique abilities grant unconditionally (e.g. Starlit Wings'
 * "Gain 20% Speed"). Mirrors battle/playerAbilities/starlitLine.js's `selfSpeedByLevel` -- keep
 * these numbers in sync if that ever changes, since this copy exists only so the stat display
 * doesn't have to import the battle simulation module.
 */
const ABILITY_STAT_BONUSES = {
  sacredwasp: { stat: "spd", byLevel: [20, 20, 20, 20, 50] },
  divinedrone: { stat: "spd", byLevel: [20, 20, 20, 20, 50] },
  holyswarm: { stat: "spd", byLevel: [20, 20, 20, 20, 50] },
};

/** The passive self stat buff (if any) a creature's unique ability grants at its current level. */
export function getAbilityStatBonus(creatureId, abilityLevels) {
  const cfg = ABILITY_STAT_BONUSES[creatureId];
  if (!cfg) return null;
  const idx = Math.min(abilityLevels?.unique || 0, cfg.byLevel.length - 1);
  const pct = cfg.byLevel[idx];
  if (!pct) return null;
  return { stat: cfg.stat, pct };
}

/**
 * Mechanic tag keys (into ABILITY_TAG_DEFS) for a given creature id + ability
 * key ("basic"/"special"/"unique"). Pass the currently-displayed tier (0-based
 * upgrade index, or the owned ability level) as `abilityLevel` when known to
 * hide tags for effects that unlock at a later upgrade (Bloomibis's Cleanse,
 * Ignissaur's Burn).
 */
export function getAbilityTags(creatureId, key, abilityLevel) {
  const isBlazehornetLine = getRootDef(creatureId)?.id === "blazehornet";
  const isStarlitLine = isStarlitAbilityLine(creatureId);
  const tags = [];
  if (key === "special" && isBlazehornetLine) tags.push("pierce", "closest");
  if (key === "basic" && isBlazehornetLine) tags.push("closest");
  if (key === "unique" && isBlazehornetLine) tags.push("burn");
  if (key === "basic" && isStarlitLine) tags.push("farthest", "pierce");
  if (key === "special" && isStarlitLine) tags.push("closest");
  const isBloomibisLine = getRootDef(creatureId)?.id === "bloomphoenix";
  if (key === "basic" && isBloomibisLine) tags.push("closest");
  if (key === "special" && isBloomibisLine) {
    tags.push("weakest");
    // Soothing Hoot only cleanses from its 4th upgrade on; when the caller
    // passes the displayed tier (the owned-creature screen), hide the tag
    // below that. Level-less contexts (dex, gacha) show the full kit.
    if (abilityLevel == null || abilityLevel >= 4) tags.push("cleanse");
  }
  const isIgnissaurLine = getRootDef(creatureId)?.id === "ignisdragon";
  if (isIgnissaurLine && (key === "basic" || key === "special")) {
    if (key === "basic") tags.push("closest");
    if (key === "special") tags.push("line");
    // Both attacks only inflict Burn from their 4th upgrade on -- same
    // level-gating rule as Bloomibis's Cleanse above.
    if (abilityLevel == null || abilityLevel >= 4) tags.push("burn");
  }
  // Breezekit only (its evolutions keep their old kits for now).
  if (creatureId === "breezekit") {
    if (key === "basic") tags.push("closest");
    if (key === "special") {
      tags.push("weakest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("speedup");
    }
    if (key === "unique") tags.push("pierce");
  }
  const isCrystalcrabLine = getRootDef(creatureId)?.id === "crystalcrab";
  if (isCrystalcrabLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") tags.push("taunt", "closest");
    if (key === "unique") tags.push("reflect");
  }
  return tags;
}

// Mirror basicHealByLevel/specialHealByLevel in battle/playerAbilities/starlitLine.js (sacredwasp/
// divinedrone/holyswarm) -- Piercing Blessing's and Radiant Exchange's text no longer spell out
// the heal amount at every level (it's shown as its own badge instead), so the badge sources the
// real per-level value directly instead of parsing text.
const STARLIT_BASIC_HEAL_BY_LEVEL = [12, 13, 13, 13, 13];
const STARLIT_SPECIAL_HEAL_BY_LEVEL = [0, 0, 0, 5, 10];

/**
 * Piercing Blessing's and Radiant Exchange's levels are written as self-contained, cumulative
 * sentences (see creatures.js) rather than incremental diffs, so they're shown as-is instead of
 * being run through formatAbilityStep/formatUpgradeStep's "+X% damage" bump-message logic.
 * Returns {label, amount, healAmt} for one level of a Starlit-line basic/special ability, or
 * null when this doesn't apply (any other creature, or the unique ability) -- callers should
 * fall back to the generic formatting in that case.
 */
export function formatStarlitAbilityLevel(creatureId, key, upgrades, idx) {
  if (!isStarlitAbilityLine(creatureId) || (key !== "basic" && key !== "special")) return null;
  const text = upgrades[idx];
  const hit = extractLeadingDamage(text);
  const phrase = key === "basic" ? "Deal damage to enemies and heal allies" : "Deal damage to an enemy";
  const label = hit ? hit.prefix + phrase + hit.rest : text;
  const amount = hit ? hit.amount : null;
  const healTable = key === "basic" ? STARLIT_BASIC_HEAL_BY_LEVEL : STARLIT_SPECIAL_HEAL_BY_LEVEL;
  const healAmt = healTable[Math.min(idx, healTable.length - 1)] || null;
  return { label, amount, healAmt };
}
