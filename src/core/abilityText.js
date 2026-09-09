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

/**
 * Targeting-selector tags (how the ability picks its target). These render
 * as their own pills on ability cards; every other tag is an effect and gets
 * folded into a single "Effects" pill whose popup lists them all -- long
 * effect lists (e.g. Deep Submerge's final tier) were pushing the ability
 * name and text around, especially on small screens.
 */
// "beside" picks out allies rather than an enemy, but it is still a targeting
// rule, so it rides with the others as its own pill instead of collapsing
// into the Effects popup.
// Tags that get their own standalone pill instead of collapsing into the
// "Effects" pill. Cone is here as a shape rather than a picker because it IS
// the ability's targeting -- the other shapes (Line, Splash, Nearby,
// Horizontal Row) stay inside the Effects pill, where they already were.
export const TARGETING_TAGS = new Set(["closest", "farthest", "weakest", "beside", "cone"]);

/** Split an ability's tags into standalone targeting pills and collapsed effects. */
export function splitAbilityTags(tags) {
  return {
    targeting: tags.filter((t) => TARGETING_TAGS.has(t)),
    effects: tags.filter((t) => !TARGETING_TAGS.has(t)),
  };
}

/** Small mechanic tags shown on ability cards (e.g. Emberstar's Charging Pierce); click opens a definition popup. */
export const ABILITY_TAG_DEFS = {
  pierce: { label: "Pierce", description: "Deal damage to all enemies this attack passes through." },
  closest: { label: "Closest", description: "Targets the closest enemy in range." },
  farthest: { label: "Farthest", description: "Targets the farthest aligned enemy in range." },
  burn: { label: "Burn", description: "Deals damage over time." },
  // Label only -- the blue charge pill draws its own ⚡ (see CreatureDetail
  // and DexEntry); this is just the heading of the popup it opens.
  energy: { label: "Energy", description: "Energy needed to use this ability." },
  weakest: { label: "Weakest", description: "Targets the creature with the lowest current Health." },
  beside: { label: "Beside", description: "Affects the allies standing in the tiles next to this creature." },
  dodge: { label: "Dodge", description: "The attack misses; no damage and negative effects are dealt." },
  // The same miss as Dodge, but worn by the attacker instead of the defender:
  // a debuff spent by the swing it ruins, and deliberately not stackable.
  blind: { label: "Blind", description: "This creature's next attack misses; no damage and negative effects are dealt." },
  assist: { label: "Assist", description: "Called allies immediately use their Basic ability on the enemy this creature targeted." },
  cleanse: { label: "Cleanse", description: "Removes all debuffs." },
  line: { label: "Line", description: "Hits every tile in the direction of the attack, all the way to the arena's edge." },
  horizontalrow: { label: "Horizontal Row", description: "Hits every tile in the targeted creature's row." },
  speedup: { label: "Speed Up", description: "Increases the creature's Speed.", stacking: [25, 50, 75, 100, 125] },
  taunt: { label: "Taunt", description: "Enemies target the creature who inflicted the debuff onto them." },
  // Marked never pulls allies toward the target: only allies who already
  // have it within attack range switch onto it -- no forced movement.
  marked: { label: "Marked", description: "All allies within range targets this creature." },
  splash: { label: "Splash", description: "Affects all tiles surrounding the targeted creature." },
  // A shape, not a flavor -- any expanding front (a howl, a breath, a
  // shockwave) can use it. Grouped under Targeting on the effect-filter page
  // alongside Line, Splash, and Nearby.
  cone: { label: "Cone", description: "Hits an expanding area up to 3 tiles in front of this creature, widening from 1 tile to 3 to 5." },
  // The missing half of Taunt: forced movement AWAY instead of toward.
  fear: { label: "Fear", description: "Paths away from the creature that inflicted it if able; can not attack or use Special abilities until it ends." },
  frostbite: { label: "Frostbite", description: "Water creatures deal 5% more damage to this creature.", stacking: [5, 10, 15, 20, 25] },
  // Both Hazards punish moving across them; each adds its own effect on
  // whatever simply stands there. Water slows EVERYONE on the tile, its own
  // side included -- slick ground does not take sides.
  waterhazard: { label: "Water Hazard", description: "Deals damage if a creature attempts to move while on it; -10% Haste when standing on it." },
  firehazard: { label: "Fire Hazard", description: "Deals damage if a creature attempts to move while on it; deals damage over time when standing on it." },
  immortal: { label: "Immortal", description: "Health can not be reduced below 1." },
  healovertime: { label: "Heal Over Time", description: "Restores Health over time." },
  revive: { label: "Revive", description: "Returns to battle after being defeated." },
  // Each stack ticks for another DOT_HEALTH_PCT of the AFFECTED creature's
  // max Health (see battle/status.js), so the per-stack totals below read as
  // percentages of the victim's own health bar -- keep the two in sync.
  damageovertime: { label: "Damage Over Time", maxStacks: 5, stackingLabel: "Damage per tick", stacking: [0.5, 1, 1.5, 2, 2.5], description: "Deals damage over time; each stack increases damage." },
  // Poison is Damage Over Time under a second name: same per-stack damage,
  // same cap, same duration, but its own independent stacks -- a creature can
  // carry both at once, and an ability that eats one leaves the other alone.
  poison: { label: "Poison", maxStacks: 5, stackingLabel: "Damage per tick", stacking: [0.5, 1, 1.5, 2, 2.5], description: "Deals damage over time; each stack increases damage." },
  // Stacks are charges, not magnitude -- the reduction is a flat 50% at any
  // stack count -- so this deliberately has no `stacking` table.
  //
  // Implementation notes: "damaged by an ability" covers basic attacks AND
  // damaging specials -- both are reduced and both consume one stack. Effect
  // damage (Burn, Damage Over Time, Hazards, reflects) is NOT reduced and
  // never consumes a stack, so damage over time is the clean counter to a
  // stacked-up Fortify. Fortify is an ordinary dispellable buff.
  fortify: { label: "Fortify", maxStacks: 10, description: "Receive 50% less damage, remove 1 stack when damaged by an ability." },
  dispel: { label: "Dispel", description: "Removes all debuffs." },
  // Crits are stats (crit chance x critDmg -- see battle/constants.js); this
  // tag marks the abilities that skip the chance roll entirely.
  guaranteedcrit: { label: "Guaranteed Crit", description: "This attack always lands a Critical Hit." },
  // Summoned creatures carry their own type line and kit, rendered as a
  // miniature ability card by AbilityTagPopup.
  //
  // Implementation note for Ghostly Step: the Wisp teleports to an EMPTY
  // tile beside its target -- never onto an occupied one.
  wisp: {
    label: "Wisp",
    description: "A spectral ally that fights on its own.",
    profile: "Dark / Tank / Melee",
    kit: [
      { key: "Basic", text: "Taunt an enemy." },
      { key: "Special", text: "Teleport beside a random enemy." },
      { key: "Passive", text: "Deal damage to the enemy that defeated this creature equal to 10% of the Summoner's Health. Goes away when the Summoner is defeated." },
    ],
  },
  attackup: { label: "Attack Up", description: "Increases the creature's Attack.", stacking: [15, 30, 45, 60, 75] },
  // The positive twin of Defense Down, on the same per-source stacking rules
  // as Attack Up. Its magnitudes match Attack Up's rather than Defense Down's
  // -- buffs and debuffs are tuned on separate ladders here.
  defenseup: { label: "Defense Up", description: "Increases the creature's Defense.", stacking: [15, 30, 45, 60, 75] },
  reflect: { label: "Reflect", description: "Damages the enemy that damaged this creature." },
  shield: { label: "Shield", description: "Temporary bonus Health." },
  // Rides on the ordinary Shield rules, so the bigger shield still wins and
  // an Overheal shield never stacks on top of an existing one.
  overheal: { label: "Overheal", description: "Healing beyond full Health is gained as a Shield instead of being wasted." },
  // Stacks are charges, not magnitude -- one stack soaks one redirected hit --
  // so this has no `stacking` table, the same shape as Fortify. Which allies
  // carry it is set by the granting ability's own targeting tag (Beside,
  // Nearby, and so on). An ordinary dispellable buff.
  protect: { label: "Protect", maxStacks: 5, description: "Redirect attacks and abilities to the creature that granted Protect; remove 1 stack whenever anything is redirected." },
  counter: { label: "Counter", description: "Attacks the creature that attacked it." },
  nearby: { label: "Nearby", description: "Affects this creature and every tile surrounding it." },
  // Deliberately says nothing about size or effect: each Aura sets its own in
  // the ability that grants it (Sovereign Call's reaches 2 tiles). The rules
  // the description no longer spells out still hold, and the implementation
  // owes them: an Aura runs for a set time, Auras DO stack with one another
  // (each is its own field, not stacks of one effect), and one ends the moment
  // the creature emitting it is defeated.
  aura: { label: "Aura", description: "An area around this creature; allies inside it gain its effect." },
  healdown: { label: "Healing Down", description: "Reduces the creature's healing received.", stacking: [20, 40, 60, 80, 100] },
  stun: { label: "Stun", description: "Can not attack or gain ability charge." },
  root: { label: "Root", description: "Can not move. Attacks and abilities still work." },
  // Same effect as Root, but self-inflicted as a stance, so Cleanse and Dispel
  // leave it alone. A twin entry rather than a flag on `root` because the pill
  // has to read differently -- same shape as Poison twinning Damage Over Time.
  rootundispellable: { label: "Root", undispellable: true, description: "Can not move. Attacks and abilities still work." },
  restrained: { label: "Restrained", undispellable: true, description: "Interacts with this creature's abilities. Removed when leaving the inflicting creature's range." },
  // Drains the bar itself, unlike Haste Down (which slows how fast it fills)
  // and Stun (which stops it filling at all).
  abilitychargeremoval: { label: "Ability Charge Removal", description: "Reduces the Ability Charge progress." },
  // Slow, Shock and Heal Block are boss-inflicted statuses (battle/bosses/*).
  // They already existed as mechanics with their own icons in the battle info
  // panel (ui/components/UnitInfoPanel.js) but had no definitions, so the boss
  // abilities that inflict them had nothing to put on a pill.
  //
  // Slow and Shock are mechanically the same penalty (speedPenalty in
  // battle/status.js doubles the attack cooldown for either) but they are two
  // separate statuses with two separate names on screen, so they get two
  // entries rather than one shared label -- the same reasoning that gives
  // Poison its own entry alongside Damage Over Time.
  slow: { label: "Slow", description: "This creature attacks half as often." },
  shock: { label: "Shock", description: "This creature attacks half as often." },
  healimmunity: { label: "Heal Block", description: "Can not be healed." },
  hastedown: { label: "Haste Down", description: "Reduces the creature's Haste.", stacking: [5, 10, 15, 20, 25] },
  speeddown: { label: "Speed Down", description: "Reduces the creature's Speed.", stacking: [5, 10, 15, 20, 25] },
  attackdown: { label: "Attack Down", description: "Reduces the creature's Attack.", stacking: [15, 20, 25, 30, 40] },
  defensedown: { label: "Defense Down", description: "Reduces the creature's Defense.", stacking: [15, 20, 25, 30, 40] },
  intangible: { label: "Intangible", undispellable: true, description: "Can not be targeted or damaged. Enemies targeting this creature change targets." },
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

// Inferno Breath is a Line attack, not a screen-wide one -- it burns the
// column ahead of the dragon, so the phrase says column rather than "all".
const IGNISSAUR_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to a column of enemies" },
};

// Dustling line: placeholder kit -- a plain damage basic and a heal special
// whose final tier carries its own shield clause; Moonlit Scales' per-tier
// numbers render raw.
const DUSTLING_PHRASES = {
  basic: null,
  // Both a heal and a hit in one cast, so it uses the dual-badge shape.
  // Heal-only: the splash lands Healing Down on enemies but deals no damage,
  // so this uses the plain heal badge. The phrase deliberately stops on
  // "Healing Down" so the max tier can append " and Blind" and finish the
  // same sentence.
  special: {
    phrase: "Heal and Splash the Lowest ally. Allies recover half the amount and enemies are inflicted with Healing Down",
    heal: true,
  },
  // "other ally" is load-bearing: the moth never heals itself with this, only
  // whichever OTHER ally is lowest. The phrase stops before the max tier's
  // " and they gain Speed Up" so that upgrade finishes the same sentence --
  // and "they" is the healed ally, not the moth: the Speed Up lands on
  // whoever was healed.
  unique: { phrase: "When damaged by an attack, Heal the Lowest other ally", heal: true },
};

// Bonebeak line: the basic's stack count varies per tier, so it rides on the
// generic damage phrase; Death Feast's per-tier percentages render raw.
const BONEBEAK_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to an enemy. Dispel all stacks of Damage Over Time on the enemy and deal 5% extra damage for each stack dispelled" },
};

// Cragling line: the basic's Ability Charge % and the passive's dodge
// interval vary per tier, so both carry their own per-tier sentences.
const CRAGLING_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to a column of enemies" },
};

const BREEZEKIT_PHRASES = {
  basic: null,
  special: { phrase: "Teleport beside and deal damage to an enemy" },
};

const CRYSTALCRAB_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to an enemy and Taunt them" },
};

// Blubber Wall's data strings carry two numbers ("Shield 8% HP; burst 50%
// DEF"); the `shieldBurst` shape moves both into badges -- SHIELD gets the
// Health % and DMG gets the Defense % -- leaving the phrase fixed per tier.
const MORUSK_PHRASES = {
  basic: null,
  special: {
    phrase: "Gain a Shield based on this creature's Health. When destroyed, deal damage to nearby enemies based on this creature's Defense",
    shieldBurst: true,
  },
};

// Deep Submerge carries two numbers ("Heal 40 HP; 30 dmg"); `healDamage`
// moves both into badges -- HEAL for the self-heal, DMG for the front-row
// strike -- leaving the phrase fixed per tier.
const NESSLING_PHRASES = {
  basic: null,
  special: {
    // The phrase stops at the strike; each tier's own text supplies the
    // ending, so the final tier can read "...and inflict Attack Down and
    // Taunt." instead of tacking a clause onto the base sentence.
    phrase: "Briefly become Intangible and Heal. Afterwards deal damage to the front row of enemies",
    healDamage: true,
  },
};

// Scrapcaw line (ids still say murkwing/darkpaw/abysslord -- creature ids
// never change): both attacks are plain damage phrases; Shadow Pact's
// per-Dark-ally percentages vary per tier, so the passive renders raw.
const MURKWING_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to an enemy and call all allies beside you to Assist" },
};

// Iglet line: only the basic gets a plain phrase (generic damage) -- Hunker
// In's stack counts and Windbreak's percentages vary per tier, so both render
// their own sentences raw.
const IGLET_PHRASES = {
  basic: null,
};

// Doomshade line: only the basic gets a plain phrase (generic damage) --
// Grave Lantern and Lantern Keeper spell out their own per-tier sentences,
// which carry numbers the badge shapes can't express, so they render raw.
const DOOMSHADE_PHRASES = {
  basic: null,
};

// Emberchirp line: the basic pairs a self-heal with its damage (dual
// HEAL+DMG badges via the healDamage shape); the special is a heal phrase
// whose final tier carries its own extension text; the passive renders raw.
const EMBERCHIRP_PHRASES = {
  basic: { phrase: "Deal damage to an enemy and recover Health", healDamage: true },
  special: { phrase: "Deal damage to itself and heal all nearby allies excluding itself", heal: true },
};

// Quetzalis line: plain damage phrases; the basic's per-tier text carries
// its ramping shred clause, and the passive's ramp % renders raw.
const QUETZALIS_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to a row of enemies" },
};

// Jadebun line: heal-phrase abilities; the special's per-tier text carries
// the conditional buffs (and the final tier its own "and shield them."
// ending), so the shared phrase stops at "Heal an ally".
const JADEBUN_PHRASES = {
  basic: { phrase: "Heal an ally", heal: true },
  special: { phrase: "Heal an ally", heal: true },
};

// Waddlepop line: the passive's ramp % renders raw per tier.
const WADDLEPOP_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to all enemies and temporarily leave a Water Hazard" },
};

// Loptrix line: the passive's charge/teleport text renders raw per tier.
const LOPTRIX_PHRASES = {
  basic: null,
  special: { phrase: "Teleport to an enemy. Deal damage and inflict Marked on them" },
};

// Siegefin line: Brine Shot is a plain hit. Holdfast and Deepsight carry their
// own per-tier numbers (Speed while anchored, Range gained) and render as written.
// Aurorion line: both damaging abilities ride the phrase system. Solar
// Pounce's max tier LEADS with the buff dispel, using the tier text's
// semicolon-clause prefix ("Dispel all buffs; 58 dmg" -- see
// LEADING_DAMAGE_RE), which formatPlainAbilityLevel renders in front of the
// shared phrase. Radiant Mane's Critical Damage ladder renders as written.
const AURORION_PHRASES = {
  basic: null,
  special: { phrase: "Deal damage to an enemy, this attack always critically hits" },
};

// Emberpup line: Hellfang rides the generic damage phrase; Dread Howl names
// its own shape. Cinder Scent's Attack ladder renders as written.
const EMBERPUP_PHRASES = {
  basic: null,
  special: {
    phrase: "Deal damage to all enemies in a Cone and temporarily leave a Fire Hazard",
    phraseByLevel: { 4: "Deal damage to all enemies in a Cone, inflict Fear, and temporarily leave a Fire Hazard" },
  },
};

const SIEGEFIN_PHRASES = {
  basic: null,
};

// Frillet line: Guard Horn is a plain hit, so it rides the generic damage
// phrase; Aegis Frill and Bulwark Body carry their own per-tier numbers
// (Shield share of Defense, counter chance) and render as written.
const FRILLET_PHRASES = {
  basic: null,
};

// Auravast line: Twin Radiance splits one swing across two hits, so it needs
// its own phrase rather than the generic "Deal damage to an enemy" -- the card
// number is the TOTAL, same rule every multi-hit follows. Sovereign Call and
// Sworn Guard are written out per tier and render as-is.
const AURAVAST_PHRASES = {
  basic: { phrase: "Deal damage twice to an enemy" },
};

// Oathcub line: Mailed Paw is a plain hit riding the generic damage phrase, so
// its number-bump tiers read as the full sentence instead of "+10% damage".
// Radiant Smite and Reliquary carry their own per-tier percentages (the share
// of Shield converted, the Overheal cap) and render exactly as written.
const OATHCUB_PHRASES = {
  basic: null,
  special: null,
};

// Venomcoil line: both damaging abilities carry a percentage that changes at
// max tier (the lifesteal share, the Ability Charge drained), so their level
// text is written out per tier and rides on the generic damage phrase.
const VENOMCOIL_PHRASES = {
  basic: null,
  special: null,
};

const SHOCKSTINGER_PHRASES = {
  basic: null,
  special: { phrase: "This ability has no cooldown but can only be used if a Restrained enemy with 20+ stacks is within range. Deal damage and briefly Stun them. Remove all stacks of Restrained" },
};

const PLAIN_ABILITY_PHRASES = {
  bloomphoenix: BLOOMIBIS_PHRASES,
  lifephoenix: BLOOMIBIS_PHRASES,
  ignisdragon: IGNISSAUR_PHRASES,
  pyredragon: IGNISSAUR_PHRASES,
  breezekit: BREEZEKIT_PHRASES,
  galestride: BREEZEKIT_PHRASES,
  tempesthawk: BREEZEKIT_PHRASES,
  stormlord: BREEZEKIT_PHRASES,
  crystalcrab: CRYSTALCRAB_PHRASES,
  gemcrab: CRYSTALCRAB_PHRASES,
  gemtitan: CRYSTALCRAB_PHRASES,
  // Pebbit line: only the basic is a plain damage ability; the special's
  // shield % and the passive's expiry % live in their text.
  pebbit: { basic: null },
  bouldrath: { basic: null },
  granitarch: { basic: null },
  mountainking: { basic: null },
  morusk: MORUSK_PHRASES,
  ivormar: MORUSK_PHRASES,
  shockcrab: SHOCKSTINGER_PHRASES,
  voltcrusher: SHOCKSTINGER_PHRASES,
  galvaniccrab: SHOCKSTINGER_PHRASES,
  coralleviathan: NESSLING_PHRASES,
  tidecrush: NESSLING_PHRASES,
  tidelord: NESSLING_PHRASES,
  abyssgolem: LOPTRIX_PHRASES,
  nihilgolem: LOPTRIX_PHRASES,
  frosthydra: WADDLEPOP_PHRASES,
  glacialhydra: WADDLEPOP_PHRASES,
  bombardguin: WADDLEPOP_PHRASES,
  cryogeddon: WADDLEPOP_PHRASES,
  glowpup: JADEBUN_PHRASES,
  radiantkit: JADEBUN_PHRASES,
  dawnbeast: JADEBUN_PHRASES,
  solarcrown: JADEBUN_PHRASES,
  galeserpent: QUETZALIS_PHRASES,
  vortexserpent: QUETZALIS_PHRASES,
  cyclonwyrm: QUETZALIS_PHRASES,
  dustling: DUSTLING_PHRASES,
  silkhusk: DUSTLING_PHRASES,
  gloamwing: DUSTLING_PHRASES,
  lunashroud: DUSTLING_PHRASES,
  bonebeak: BONEBEAK_PHRASES,
  gravewing: BONEBEAK_PHRASES,
  charnelord: BONEBEAK_PHRASES,
  ironmole: CRAGLING_PHRASES,
  steelmole: CRAGLING_PHRASES,
  titanmole: CRAGLING_PHRASES,
  skysage: CRAGLING_PHRASES,
  murkwing: MURKWING_PHRASES,
  darkpaw: MURKWING_PHRASES,
  abysslord: MURKWING_PHRASES,
  frostpup: IGLET_PHRASES,
  snowmane: IGLET_PHRASES,
  blizzardback: IGLET_PHRASES,
  glaciertusk: IGLET_PHRASES,
  doomgrub: DOOMSHADE_PHRASES,
  nihilwyrm: DOOMSHADE_PHRASES,
  emberchirp: EMBERCHIRP_PHRASES,
  pyrefinch: EMBERCHIRP_PHRASES,
  cauterix: EMBERCHIRP_PHRASES,
  hearthenix: EMBERCHIRP_PHRASES,
  leafling: VENOMCOIL_PHRASES,
  canoparch: VENOMCOIL_PHRASES,
  verdantlord: VENOMCOIL_PHRASES,
  ancientgrove: VENOMCOIL_PHRASES,
  emberpup: EMBERPUP_PHRASES,
  emberhound: EMBERPUP_PHRASES,
  infernoking: EMBERPUP_PHRASES,
  ashmonarch: EMBERPUP_PHRASES,
  aurorabird: AURORION_PHRASES,
  radiancebird: AURORION_PHRASES,
  celestbird: AURORION_PHRASES,
  empyravis: AURORION_PHRASES,
  sylvandragon: SIEGEFIN_PHRASES,
  ancientdragon: SIEGEFIN_PHRASES,
  mosskrab: FRILLET_PHRASES,
  jadekrab: FRILLET_PHRASES,
  crystalshell: FRILLET_PHRASES,
  rampartops: FRILLET_PHRASES,
  prismcrab: OATHCUB_PHRASES,
  spectrumcrab: OATHCUB_PHRASES,
  rainbowshell: OATHCUB_PHRASES,
  chromatarch: OATHCUB_PHRASES,
  holydragon: AURAVAST_PHRASES,
  celestialdragon: AURAVAST_PHRASES,
};

export function usesPlainAbilityLevels(creatureId, key) {
  const perCreature = PLAIN_ABILITY_PHRASES[creatureId];
  return !!perCreature && key in perCreature;
}

const LEADING_HEAL_RE = /^Heal\s+(\d+)\s*HP(?:\/s)?\b/i;

/**
 * A lead-in clause joined to the shared phrase by a connector, ahead of the
 * damage: "Dispel all buffs and 58 dmg". The clause may contain no digits, so
 * a trailing rider ("24 dmg and inflict Healing Down") can never be mistaken
 * for one -- there, the number comes first and the rider is appended instead.
 */
const LEAD_CLAUSE_RE = /^([^;\d]*?\s+and)\s+(?=\d+\s*dmg\b)/i;

/**
 * {label, amount, healAmt} for one level of a plain-leveled ability (see
 * PLAIN_ABILITY_PHRASES), or null for every other ability -- callers fall back
 * to the generic formatting in that case. Text after the leading clause (e.g. a
 * final level's bonus effect) is appended to the phrase.
 */
export function formatPlainAbilityLevel(creatureId, key, text, idx) {
  if (!usesPlainAbilityLevels(creatureId, key)) return null;
  const cfg = PLAIN_ABILITY_PHRASES[creatureId][key];
  if (cfg && cfg.heal) {
    const m = LEADING_HEAL_RE.exec(text);
    if (!m) return { label: text, amount: null, healAmt: null };
    return { label: cfg.phrase + text.slice(m[0].length), amount: null, healAmt: Number(m[1]) };
  }
  if (cfg && cfg.healDamage) {
    const h = /Heal\s+(\d+)\s*HP/i.exec(text);
    const d = /(\d+)\s*dmg\b/i.exec(text);
    const rest = d ? text.slice(d.index + d[0].length) : "";
    return {
      label: cfg.phrase + rest,
      amount: d ? Number(d[1]) : null,
      healAmt: h ? Number(h[1]) : null,
    };
  }
  if (cfg && cfg.shieldBurst) {
    const sh = /Shield\s+(\d+)%\s*HP/i.exec(text);
    const bd = /(\d+)%\s*DEF/i.exec(text);
    return {
      label: cfg.phrase,
      amount: bd ? bd[1] + "%" : null,
      healAmt: null,
      shieldAmt: sh ? sh[1] + "%" : null,
    };
  }
  // `phraseByLevel` replaces the shared phrase outright at one tier, for a
  // max tier that RE-ORDERS its clauses rather than appending one (Dread
  // Howl's Fear lands mid-sentence). The override is the complete sentence,
  // so the tier text's own rider is not appended on top of it.
  const override = cfg && cfg.phraseByLevel && cfg.phraseByLevel[idx];
  const phrase = override || (cfg ? cfg.phrase : "Deal damage to an enemy");
  // A tier that LEADS with its own clause joined by a connector -- written
  // "Dispel all buffs and 58 dmg" -- renders as ONE sentence: the clause,
  // then the shared phrase with its first letter lowercased ("Dispel all
  // buffs and deal damage to an enemy..."). The semicolon form
  // ("Shield 55; 20 dmg") still renders as two clauses via hit.prefix below.
  const lead = LEAD_CLAUSE_RE.exec(text);
  if (lead) {
    const after = extractLeadingDamage(text.slice(lead[0].length));
    if (after) {
      return {
        label: lead[1] + " " + phrase.charAt(0).toLowerCase() + phrase.slice(1) + after.rest,
        amount: after.amount,
        healAmt: null,
      };
    }
  }
  const hit = extractLeadingDamage(text);
  if (!hit) return { label: text, amount: null, healAmt: null };
  return { label: hit.prefix + phrase + (override ? "" : hit.rest), amount: hit.amount, healAmt: null };
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
  const isEmberstarLine = getRootDef(creatureId)?.id === "blazehornet";
  const isStarlitLine = isStarlitAbilityLine(creatureId);
  const tags = [];
  if (key === "special" && isEmberstarLine) {
    tags.push("pierce", "closest");
    // Charging Pierce only leaves its trail from the 4th upgrade on.
    if (abilityLevel == null || abilityLevel >= 4) tags.push("firehazard");
  }
  if (key === "basic" && isEmberstarLine) tags.push("closest");
  if (key === "unique" && isEmberstarLine) tags.push("burn");
  if (key === "basic" && isStarlitLine) tags.push("farthest", "pierce");
  if (key === "special" && isStarlitLine) tags.push("closest");
  const isBloomibisLine = getRootDef(creatureId)?.id === "bloomphoenix";
  if (key === "basic" && isBloomibisLine) tags.push("closest");
  if (key === "unique" && isBloomibisLine) tags.push("nearby");
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
  if (getRootDef(creatureId)?.id === "breezekit") {
    if (key === "basic") {
      tags.push("closest");
      // Gust Swipe only shreds DEF from its 4th upgrade on -- same
      // level-gating rule as its Speed Up below.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defensedown");
    }
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
  const isPebbitLine = getRootDef(creatureId)?.id === "pebbit";
  if (isPebbitLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") tags.push("taunt", "shield", "nearby");
  }
  const isEmberpupLine = getRootDef(creatureId)?.id === "emberpup";
  if (isEmberpupLine) {
    // Hellfang only pins from its 4th upgrade on; Dread Howl only Fears from
    // its 4th on -- the Cone is its shape at every tier.
    if (key === "basic") {
      tags.push("closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("root");
    }
    if (key === "special") {
      tags.push("cone", "firehazard");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("fear");
    }
  }
  const isAurorionLine = getRootDef(creatureId)?.id === "aurorabird";
  if (isAurorionLine) {
    if (key === "basic") {
      tags.push("closest");
      // Smite only shields from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("shield");
    }
    if (key === "special") {
      tags.push("closest", "guaranteedcrit");
      // Solar Pounce only strips buffs from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("dispel");
    }
  }
  const isSiegefinLine = getRootDef(creatureId)?.id === "sylvandragon";
  if (isSiegefinLine) {
    if (key === "basic") {
      tags.push("closest");
      // Brine Shot only saps healing from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("healdown");
    }
    // Holdfast's Root is the undispellable twin -- it is the creature's own
    // stance, and the same cast dispels everything else.
    if (key === "special") tags.push("rootundispellable");
  }
  const isAuravastLine = getRootDef(creatureId)?.id === "holydragon";
  if (isAuravastLine) {
    // Twin Radiance only shaves Defense from its 4th upgrade on; Sovereign
    // Call only pulls in an Assist from its 4th on. The Aura is the ability's
    // fallback at every tier, so it carries no gate.
    if (key === "basic") {
      tags.push("closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defensedown");
    }
    if (key === "special") {
      tags.push("closest", "taunt", "aura");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("assist");
    }
    // Sworn Guard is a targeting rule and a damage bonus -- neither is an
    // effect anything else can read, so it deliberately carries no pills.
  }
  const isOathcubLine = getRootDef(creatureId)?.id === "prismcrab";
  if (isOathcubLine) {
    // Mailed Paw only braces from its 4th upgrade on; Radiant Smite only
    // Blinds from its 4th on -- the Shield it spends is part of every tier.
    if (key === "basic") {
      tags.push("closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defenseup");
    }
    if (key === "special") {
      tags.push("nearby", "shield");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("blind");
    }
    // Reliquary banks excess Healing as a Shield, so it carries both.
    if (key === "unique") tags.push("overheal", "shield");
  }
  const isFrilletLine = getRootDef(creatureId)?.id === "mosskrab";
  if (isFrilletLine) {
    // Guard Horn only shaves Defense from its 4th upgrade on.
    if (key === "basic") {
      tags.push("closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defensedown");
    }
    if (key === "special") tags.push("beside", "protect");
    if (key === "unique") tags.push("counter");
  }
  const isVenomcoilLine = getRootDef(creatureId)?.id === "leafling";
  if (isVenomcoilLine) {
    if (key === "basic") tags.push("closest");
    // Restrained is the same debuff the Shockstinger line uses -- it comes off
    // by range, which for a melee constrictor means the moment its grip breaks.
    if (key === "special") tags.push("closest", "restrained", "abilitychargeremoval");
    // The Speed gain is a flat stat bump, not the Speed Up buff, so it carries
    // no pill of its own; the Poison the Restrain drags along does.
    if (key === "unique") tags.push("poison");
  }
  const isShockstingerLine = getRootDef(creatureId)?.id === "shockcrab";
  if (isShockstingerLine) {
    if (key === "basic") tags.push("closest", "restrained");
    if (key === "special") {
      tags.push("closest", "stun", "restrained");
      // Overload Sting only grants Speed Up from its 4th upgrade on -- same
      // level-gating rule as Cirruskit's Zephyr Step.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("speedup");
    }
    if (key === "unique") tags.push("restrained");
  }
  const isNesslingLine = getRootDef(creatureId)?.id === "coralleviathan";
  if (isNesslingLine) {
    if (key === "basic") {
      tags.push("farthest");
      // Loch Spout only inflicts Haste Down from its 4th upgrade on -- same
      // level-gating rule as Bloomibis's Cleanse.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("hastedown");
    }
    if (key === "special") {
      tags.push("intangible", "closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("attackdown");
    }
  }
  const isDustlingLine = getRootDef(creatureId)?.id === "dustling";
  if (isDustlingLine) {
    if (key === "basic") {
      tags.push("closest");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("attackdown");
    }
    if (key === "special") {
      // "Lowest" is this game's existing Weakest tag -- same rule, and the
      // one already used by the other ally-healers.
      tags.push("weakest", "splash");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("blind");
    }
    if (key === "unique") {
      tags.push("weakest");
      // Moonlit Scales only hands out Speed Up from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("speedup");
    }
  }
  const isBonebeakLine = getRootDef(creatureId)?.id === "bonebeak";
  if (isBonebeakLine) {
    // Carrion Rip applies the DoT from tier 1 -- the upgrades only add a
    // second stack -- so the tag is not level-gated here. Gorge carries it
    // too now that it leaves stacks behind; Death Feast has no tags.
    if (key === "basic") tags.push("closest", "damageovertime");
    if (key === "special") tags.push("damageovertime");
  }
  const isCraglingLine = getRootDef(creatureId)?.id === "ironmole";
  if (isCraglingLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") {
      tags.push("closest", "line");
      // Ruyi Reach only stuns from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("stun");
    }
    if (key === "unique") tags.push("dodge");
  }
  const isMurkwingLine = getRootDef(creatureId)?.id === "murkwing";
  if (isMurkwingLine) {
    if (key === "basic") tags.push("closest");
    // Beside is a targeting pill (it picks the allies called); Assist is the
    // effect. Shadow Pact deliberately carries no tags.
    if (key === "special") tags.push("beside", "assist");
  }
  const isIgletLine = getRootDef(creatureId)?.id === "frostpup";
  if (isIgletLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") {
      tags.push("fortify");
      // Hunker In only dispels from its 4th upgrade on -- same level-gating
      // rule as the other final-tier effects.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("dispel");
    }
    if (key === "unique") {
      // Fortify is listed here too: Windbreak's text keys off it, and the
      // tag popup is the only place Fortify's rules are written down.
      tags.push("nearby", "fortify");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("frostbite");
    }
  }
  const isDoomshadeLine = getRootDef(creatureId)?.id === "doomgrub";
  if (isDoomshadeLine) {
    if (key === "basic") {
      tags.push("closest");
      // Spectral Rake only inflicts the DoT from its 4th upgrade on.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("damageovertime");
    }
    if (key === "special") tags.push("closest");
    // The Wisp tag carries what a Wisp actually does; the abilities just summon them.
    if (key === "unique") tags.push("wisp");
  }
  const isEmberchirpLine = getRootDef(creatureId)?.id === "emberchirp";
  if (isEmberchirpLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") tags.push("nearby", "healovertime");
    if (key === "unique") tags.push("revive");
  }
  const isQuetzalisLine = getRootDef(creatureId)?.id === "galeserpent";
  if (isQuetzalisLine) {
    if (key === "basic") tags.push("closest");
    if (key === "special") {
      tags.push("closest", "horizontalrow");
      // The gale only inflicts Defense Down from its 4th upgrade on -- same
      // level-gating rule as the other final-tier effects.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defensedown");
    }
  }
  const isJadebunLine = getRootDef(creatureId)?.id === "glowpup";
  if (isJadebunLine) {
    if (key === "basic") tags.push("weakest");
    if (key === "special") {
      tags.push("weakest", "immortal", "attackup");
      // The elixir only shields from its 4th upgrade on -- same level-gating
      // rule as the other final-tier effects.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("shield");
    }
  }
  const isWaddlepopLine = getRootDef(creatureId)?.id === "frosthydra";
  if (isWaddlepopLine) {
    if (key === "basic") {
      tags.push("closest");
      // Ice Lob only chills -- inflicting Speed Down -- from its 4th upgrade
      // on; same level-gating rule as the other final-tier effects.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("speeddown");
    }
    if (key === "special") {
      tags.push("closest", "splash", "speeddown", "waterhazard");
      if (abilityLevel == null || abilityLevel >= 4) tags.push("frostbite");
    }
  }
  const isLoptrixLine = getRootDef(creatureId)?.id === "abyssgolem";
  if (isLoptrixLine) {
    if (key === "basic") {
      tags.push("weakest");
      // Mocking Nip only inflicts Defense Down from its 4th upgrade on;
      // same level-gating rule as the other final-tier effects.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("defensedown");
    }
    if (key === "special") tags.push("weakest", "marked");
  }
  const isMoruskLine = getRootDef(creatureId)?.id === "morusk";
  if (isMoruskLine) {
    if (key === "basic") {
      tags.push("closest");
      // Tusk Slam only inflicts Healing Down from its 4th upgrade
      // on -- same level-gating rule as Bloomibis's Cleanse.
      if (abilityLevel == null || abilityLevel >= 4) tags.push("healdown");
    }
    if (key === "special") tags.push("shield", "nearby");
    if (key === "unique") tags.push("speeddown");
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
/**
 * Effect-filter support (the Collection/Dex "Effects" filter): every tag
 * LABEL a creature's kit carries at max rank, so level-gated riders (a max
 * tier's Blind, Defense Down, ...) count. Deduped by label rather than key so
 * twin tags sharing a name -- Root and its undispellable stance twin -- read
 * as one effect. `energy` is excluded (a pill heading, not an effect).
 *
 * Kits are static for a session, so results cache per creature id.
 */
const effectLabelCache = new Map();
export function getCreatureEffectLabels(creatureId) {
  let set = effectLabelCache.get(creatureId);
  if (set) return set;
  set = new Set();
  for (const key of ["basic", "special", "unique"]) {
    for (const t of getAbilityTags(creatureId, key, null)) {
      if (t === "energy") continue;
      const def = ABILITY_TAG_DEFS[t];
      if (def) set.add(def.label);
    }
  }
  effectLabelCache.set(creatureId, set);
  return set;
}

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
