// Draws item icons in place of their emoji inside ordinary text.
//
// Item names and reward labels carry their emoji inline ("🍌 20 Flair
// Bananas", REWARD_LABELS' "🍌 Flair Banana", the Labyrinth's "🍌 1"), and
// that text is rendered all over the game. iconText() takes such a string
// and returns React children with each known emoji swapped for its picture,
// sized in em so it matches whatever font size the surrounding text uses --
// a drop-in wherever the plain string used to go.
//
// The three bananas are told apart by what follows the 🍌: a plain 🍌 is the
// Flair Banana, 🍌✨ the Mythical, and 🍌🏺 / 🍌⭐ the Ancient (both spellings
// are in the data). Each pair is swapped whole, so its ✨/🏺/⭐ goes too.
//
// Element, role and range icons are NOT swapped here: their emoji double as
// other things (⚔️ is also the Arena ticket, ✨ a sparkle, 🔥 a Fire Melon), so
// blanket replacement would hit the wrong ones. Call sites that mean the trait
// use typeIcon / roleIcon / rangeIcon below instead.

import React from "../../react.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { EQUIPMENT_MAP } from "../../data/equipment.js";
import { exclusivityAxis } from "../../core/equipment.js";

const ITEM_ICONS = [
  { re: /🍌✨/u, src: "images/item_icons/mythicalflairbanana.png", alt: "Mythical Flair Banana" },
  { re: /🍌[🏺⭐]/u, src: "images/item_icons/ancientflairbanana.png", alt: "Ancient Flair Banana" },
  { re: /🍌(?![✨🏺⭐])/u, src: "images/item_icons/flairbanana.png", alt: "Flair Banana" },
  // Eggs follow the banana pattern: 🥚✨ is a Legendary Egg, a plain 🥚 an Egg.
  { re: /🥚✨/u, src: "images/item_icons/legendaryegg.png", alt: "Legendary Egg" },
  { re: /🥚(?!✨)/u, src: "images/item_icons/creatureegg.png", alt: "Egg" },
  // Ascension melons: 🍈⚪ Common, 🍈🟣 Epic, a plain 🍈 Legendary.
  { re: /🍈⚪/u, src: "images/item_icons/commonascensionmelon.png", alt: "Common Ascension Melon" },
  { re: /🍈🟣/u, src: "images/item_icons/epicascensionmelon.png", alt: "Epic Ascension Melon" },
  { re: /🍈(?![⚪🟣])/u, src: "images/item_icons/legendaryascensionmelon.png", alt: "Legendary Ascension Melon" },
  // Currencies whose emoji mean nothing else in the game's text.
  { re: /💎/u, src: "images/item_icons/gems.png", alt: "Gems" },
  { re: /🍖/u, src: "images/item_icons/food.png", alt: "Food" },
  { re: /🍬/u, src: "images/item_icons/candy.png", alt: "Candy" },
  { re: /🔮/u, src: "images/item_icons/skinshards.png", alt: "Skin Shards" },
  { re: /🔷/u, src: "images/item_icons/flairshard.png", alt: "Flair Shard" },
  { re: /🪴/u, src: "images/item_icons/ancientfertilizer.png", alt: "Ancient Fertilizer" },
  { re: /🌈/u, src: "images/item_icons/rainbowmelon.png", alt: "Rainbow Melon" },
  // Interface symbols (images/ui_icons/symbols). The arrows are the
  // tutorial's bouncing pointers; ✓ and ✅ are both "done".
  { re: /🔒/u, src: "images/ui_icons/symbols/locked.png", alt: "Locked" },
  { re: /🔓/u, src: "images/ui_icons/symbols/unlocked.png", alt: "Unlocked" },
  { re: /✅|✓/u, src: "images/ui_icons/symbols/checkmark.png", alt: "Done" },
  { re: /✕/u, src: "images/ui_icons/symbols/x.png", alt: "Close" },
  { re: /⚠️?/u, src: "images/ui_icons/symbols/warning.png", alt: "Warning" },
  { re: /✦/u, src: "images/ui_icons/symbols/fourpointstar.png", alt: "" },
  { re: /⬇️?/u, src: "images/ui_icons/symbols/tutorialarrowdown.png", alt: "" },
  { re: /⬆️?/u, src: "images/ui_icons/symbols/tutorialarrowup.png", alt: "" },
  { re: /⬅️?/u, src: "images/ui_icons/symbols/tutorialarrowleft.png", alt: "" },
  { re: /➡️?/u, src: "images/ui_icons/symbols/tutorialarrowright.png", alt: "" },
  // Battle actions (images/ui_icons/actions).
  { re: /⏱️?/u, src: "images/ui_icons/actions/time.png", alt: "Time" },
  { re: /🗑️?/u, src: "images/ui_icons/actions/clearteam.png", alt: "Clear" },
  { re: /🏳️?/u, src: "images/ui_icons/actions/retreat.png", alt: "Forfeit" },
];

/** A creature's ascension shard icon, by the creature's rarity -- the
 * picture for what the game writes as 🔶. */
export function shardIcon(rarity) {
  const r = rarity === "legendary" || rarity === "epic" ? rarity : "common";
  return iconImg({ src: "images/item_icons/" + r + "ascensionshard.png", alt: "Shards" });
}

/** An interface icon from images/ui_icons (`name` like "menu/home"),
 * em-sized like iconText's pictures. */
export function uiIcon(name, alt) {
  return iconImg({ src: "images/ui_icons/" + name + ".png", alt: alt || "" });
}

/** The red "something's waiting" dot, `size` px, positioned by the caller's
 * `style` (usually absolute, on a corner). The art carries its own dark
 * outline, so it needs no white ring to stand off busy backgrounds. */
export function notificationDot(size, style) {
  return React.createElement("img", {
    src: "images/ui_icons/symbols/notificationdot.png",
    alt: "", "aria-hidden": "true", draggable: false,
    style: { display: "block", width: size, height: size, pointerEvents: "none", ...style },
  });
}

// Currency art by currency key (the keys of `currencies`, REWARD_LABELS and
// reward tables). Gear Shards (⚔️ / 🔧), Dungeon Passes (🎫) and the element
// melons (🔥 💧 🌿...) share their emoji with other things -- the Arena, Pass
// Points, the elements themselves -- so iconText can't swap them safely. Call
// sites that know WHICH currency they're drawing use currencyIcon(key) instead.
const CURRENCY_ICONS = {
  gems: "gems", food: "food", candy: "candy", equipShards: "gearshards", dungeonPass: "dungeonpass",
  skinShards: "skinshards", flairShard: "flairshard", ancientFertilizer: "ancientfertilizer",
  egg: "creatureegg", eggs: "creatureegg", legendaryEgg: "legendaryegg", legendaryEggs: "legendaryegg",
  flairBanana: "flairbanana", mythicalFlairBanana: "mythicalflairbanana", ancientFlairBanana: "ancientflairbanana",
  melonFire: "firemelon", melonWater: "watermelon", melonNature: "naturemelon", melonEarth: "earthmelon",
  melonWind: "windmelon", melonElectric: "electricmelon", melonLight: "lightmelon", melonDark: "darkmelon",
  melonRainbow: "rainbowmelon",
  ascensionMelon: "legendaryascensionmelon", ascensionMelonCommon: "commonascensionmelon", ascensionMelonEpic: "epicascensionmelon",
  mysteriousOre: "mysteriousore", deluxeOre: "deluxeore", prismaticOre: "prismaticore",
  gearBundle: "randomequipment",
};

/** A reward's icon by key, em-sized like iconText's pictures. The key is a
 * currency, or a gear id (gear given as a reward -- it draws that gear's own
 * art, so any gear reward picks up its picture with no extra wiring). A key
 * without art keeps its emoji as-is: the key says what it is, and its emoji
 * may be another currency's (Deluxe Ore is 💎, the Gems emoji). With no key
 * at all, fall back to iconText's emoji matching. */
export function currencyIcon(key, fallback) {
  const gear = key && EQUIPMENT_MAP[key];
  if (gear && gear.image) return iconImg({ src: gear.image, alt: gear.name });
  const f = CURRENCY_ICONS[key];
  if (!f) return key ? fallback : iconText(fallback);
  return iconImg({ src: "images/item_icons/" + f + ".png", alt: key });
}

// Trait art, keyed by the same names the data uses. A name missing here keeps
// its emoji.
const TYPE_ICONS = { Fire: "fire", Water: "water", Nature: "nature", Earth: "earth", Wind: "wind", Electric: "electric", Light: "light", Dark: "dark" };
const ROLE_ICONS = { Attacker: "attacker", Tank: "tank", Support: "support" };
const RANGE_ICONS = { Melee: "melee", Ranged: "ranged" };

function traitIcon(file, alt, fallback) {
  if (!file) return fallback;
  return React.createElement("img", {
    src: file,
    alt,
    title: alt,
    draggable: false,
    style: { width: "1.15em", height: "1.15em", objectFit: "contain", verticalAlign: "-0.2em", display: "inline-block" },
  });
}

/** An element's icon (Fire, Water...), em-sized like iconText's pictures --
 * a drop-in for TYPE_EMOJI[type]. Unknown types fall back to the emoji, then
 * the name. */
export function typeIcon(type) {
  const f = TYPE_ICONS[type];
  return traitIcon(f && "images/item_icons/elements/" + f + ".png", type, TYPE_EMOJI[type] || type || "");
}

/** A role's icon (Attacker / Tank / Support); drop-in for ROLE_CONFIG[r].emoji. */
export function roleIcon(role) {
  const f = ROLE_ICONS[role];
  return traitIcon(f && "images/item_icons/roles/" + f + ".png", role, (ROLE_CONFIG[role] && ROLE_CONFIG[role].emoji) || "");
}

/** A range's icon (Melee / Ranged); drop-in for ATTACK_TYPE_CONFIG[a].emoji. */
export function rangeIcon(range) {
  const f = RANGE_ICONS[range];
  return traitIcon(f && "images/item_icons/ranges/" + f + ".png", range, (ATTACK_TYPE_CONFIG[range] && ATTACK_TYPE_CONFIG[range].emoji) || "");
}

/** The icon for who a piece of gear is restricted to: the element / role /
 * range icon, or the species' emoji for creature-exclusive gear. Empty for
 * universal gear. */
export function restrictionIcon(item) {
  const a = exclusivityAxis(item);
  if (!a) return "";
  if (a.field === "element") return typeIcon(a.value);
  if (a.field === "role") return roleIcon(a.value);
  if (a.field === "attackType") return rangeIcon(a.value);
  return (CREATURE_MAP[a.value] && CREATURE_MAP[a.value].emoji) || a.value;
}

function iconImg(icon, key) {
  return React.createElement("img", {
    key,
    src: icon.src,
    alt: icon.alt,
    draggable: false,
    style: { width: "1.15em", height: "1.15em", objectFit: "contain", verticalAlign: "-0.2em", display: "inline-block" },
  });
}

/** Art size, in px, on the gear grid cards -- the Equipment page and the
 * creature page's Gear tab share it so both grids look the same. The picture
 * sits in the top-centre gap between the corner columns (level + exclusivity
 * icon left, favourite right), which stay narrow so it can be this big. */
export const GEAR_CARD_ICON_PX = 44;

/** An equipment piece's icon: its `image` if it has art, else its emoji.
 * Without `px` it's sized in em like iconText's pictures, so the font size of
 * the element it sits in sets how big it draws -- a drop-in for `item.emoji`.
 * With `px` it's a block exactly that tall, with no text line around it. */
export function gearIcon(item, px) {
  if (!item) return null;
  if (!item.image) {
    return px ? React.createElement("span", { style: { display: "block", fontSize: px / 1.15, lineHeight: px + "px", height: px } }, item.emoji) : item.emoji;
  }
  return React.createElement("img", {
    src: item.image,
    alt: item.name || "",
    draggable: false,
    style: px
      ? { width: px, height: px, objectFit: "contain", display: "block" }
      : { width: "1.15em", height: "1.15em", objectFit: "contain", verticalAlign: "-0.2em", display: "inline-block" },
  });
}

/** Children for `text` with item emoji replaced by their icons. Non-strings
 * pass through untouched, so it's safe on any value. */
export function iconText(text) {
  if (typeof text !== "string") return text;
  let parts = [text];
  ITEM_ICONS.forEach((icon, i) => {
    const re = new RegExp(icon.re.source, "gu");
    parts = parts.flatMap((p) => {
      if (typeof p !== "string" || !re.test(p)) return [p];
      re.lastIndex = 0;
      const out = [];
      p.split(re).forEach((seg, j) => {
        if (j > 0) out.push(iconImg(icon, "i" + i + "-" + j + "-" + out.length));
        if (seg) out.push(seg);
      });
      return out;
    });
  });
  return parts.length === 1 ? parts[0] : parts;
}
