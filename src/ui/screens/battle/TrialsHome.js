// Trials home: the screen ArenaScreen shows in "trials" mode instead of the
// Arena's stage list. Players see one run of Levels (1-500 -- the engine's
// level/stage pairs, counted straight through), one at a time --
//   - the middle shows the level's six enemies; tapping one opens its skills
//     and the equipment it wears
//   - the bottom steps between levels (◀ ▶) and fights the one on screen.
//     A level already beaten can be fought again for no reward; levels past
//     the furthest reached can be looked at but not fought yet.
//   - "Winning team" (top right, beaten levels only) shows the last team that
//     beat it, with a Copy button for sharing it.
// ArenaScreen owns progress, the planning phase and the battle; this is only
// the view, driven by its props.

import React, { useState } from "../../../react.js";
import { CREATURE_MAP } from "../../../data/creatures.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../../data/types.js";
import { EQUIPMENT_MAP, EQUIP_RARITY_CONFIG } from "../../../data/equipment.js";
import { equipBonus, equipBonusStr, isExclusive, exclusivityCaption } from "../../../core/equipment.js";
import { getAbilityTags, formatAbilityStep, extractHeal, formatStarlitAbilityLevel, formatPlainAbilityLevel } from "../../../core/abilityText.js";
import { getSpecialChargeAt } from "../../../core/creatures.js";
import { ARENA_GRID_COLS, ARENA_GRID_ROWS, ARENA_PLAYER_START_ROW } from "../../../battle/constants.js";
import CreatureIcon from "../../components/CreatureIcon.js";
import { AbilityTagPills, AbilityTagPopup } from "../../components/AbilityTagPills.js";
import { iconText, currencyIcon, gearIcon, typeIcon, roleIcon, rangeIcon } from "../../components/IconText.js";
import { REWARD_DESC } from "../../../data/quests.js";

const ABILITY_LABELS = { basic: "Basic", special: "Special", unique: "Passive" };
const STAGES_PER_LEVEL = 10;
const h = React.createElement;

/** `fixed`: the card is one set height whatever it holds (the creature popup,
 * so every creature's is the same size); the caller scrolls its own body. */
const overlay = (onClose, children, { fixed = false } = {}) =>
  h("div", { onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 18px" } },
    h("div", { onClick: (e) => e.stopPropagation(), style: { background: "#fff", borderRadius: 18, padding: "18px", width: "100%", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", position: "relative", boxSizing: "border-box",
      ...(fixed
        ? { height: "min(560px, calc(80 * var(--vh)))", display: "flex", flexDirection: "column", overflow: "hidden" }
        : { maxHeight: "calc(80 * var(--vh))", overflowY: "auto" }) } },
      h("button", { onClick: onClose, style: { position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "#f0f0f0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#888", lineHeight: 1 } }, "×"),
      children));

const label = (text) => h("div", { style: { fontSize: 9, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 } }, text);

const EQUIP_SLOTS = 4;
/** Enemies fight with a maxed kit (see makeArenaBattle): the last upgrade tier. */
const MAX_TIER = 4;

/**
 * The enemy's gear, drawn like the creature page's slots but showing only each
 * item's icon and name -- rarity and stats are in the popup (ItemInfo). Only
 * worn items appear; a tile keeps a quarter of the row, so one item looks the
 * same size as four.
 */
function GearSlots({ gear, onOpen, perRow = 4 }) {
  // `perRow`: 4 in the popup; the planning side panel is narrower and uses 2.
  const basis = "calc(" + 100 / perRow + "% - " + (6 * (perRow - 1)) / perRow + "px)";
  return h("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
    gear.slice(0, EQUIP_SLOTS).map((item) => h("div", {
      key: item.id,
      onClick: () => onOpen(item),
      style: { flex: "0 0 " + basis, minWidth: 0, background: "#f7f7ff", border: "1.5px solid #d0ccf7", borderRadius: 10, padding: "8px 4px", textAlign: "center", cursor: "pointer", userSelect: "none", boxSizing: "border-box" },
    },
      h("div", { style: { fontSize: 22 } }, gearIcon(item)),
      h("div", { style: { fontSize: 10, fontWeight: 600, color: "#000", marginTop: 2, lineHeight: 1.2, overflowWrap: "anywhere" } }, item.name))));
}

/** One equipped item, laid out like its Equipment Dex entry, its level beside its name. */
function ItemInfo({ item, level, onClose }) {
  const rar = EQUIP_RARITY_CONFIG[item.rarity];
  return overlay(onClose, [
    rar && h("div", { key: "r", style: { display: "inline-block", fontSize: 10, fontWeight: 700, color: rar.color, background: rar.bg, borderRadius: 4, padding: "2px 7px" } }, rar.label),
    isExclusive(item) && h("div", { key: "x", style: { fontSize: 10, fontWeight: 700, color: "#7F77DD", marginTop: 4 } }, exclusivityCaption(item)),
    h("div", { key: "b", style: { textAlign: "center", paddingTop: 10 } },
      h("div", { style: { fontSize: 64, marginBottom: 4 } }, gearIcon(item)),
      h("div", { style: { fontSize: 18, fontWeight: 700, color: "#000", marginBottom: 6 } }, "Lv. " + level + " " + item.name),
      h("div", { style: { fontSize: 13, color: "#666", marginBottom: item.effect ? 6 : 0 } }, equipBonusStr(equipBonus(item.id, level))),
      item.effect && h("div", { style: { fontSize: 12, color: "#7F77DD", fontWeight: 600 } }, iconText("✦ " + item.effect))),
  ]);
}

/**
 * Type, range and role as emojis under the name. Tapping one names it beside
 * them (tap again, or another, to change it).
 */
function TraitEmojis({ def }) {
  const [shown, setShown] = useState(null);
  const traits = [
    { emoji: typeIcon(def.type), name: def.type },
    { emoji: rangeIcon(def.attackType || "Melee"), name: def.attackType || "Melee" },
    { emoji: roleIcon(def.role), name: def.role },
  ].filter((t) => t.emoji && t.name);
  return h("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 3 } },
    traits.map((t) => h("button", {
      key: t.name,
      onClick: () => setShown((s) => (s === t.name ? null : t.name)),
      "aria-label": t.name,
      style: { fontSize: 16, lineHeight: 1, padding: "3px 4px", borderRadius: 8, border: "none", cursor: "pointer", background: shown === t.name ? "#EEEDFE" : "transparent" },
    }, t.emoji)),
    shown && h("span", { style: { fontSize: 11, fontWeight: 700, color: "#534AB7", marginLeft: 2 } }, shown));
}

/** An enemy's skills and equipment. */
/**
 * A Trials enemy's header -- picture, "Lv. N Name", type/range/role emojis.
 * Shared by the popup below and the planning phase's side panel (ArenaScreen),
 * so the two always read the same. `compact` is the narrower panel's size.
 */
export function TrialsEnemyHeader({ enemy, enemyLevel, compact = false }) {
  const def = CREATURE_MAP[enemy.id];
  // Compact: picture and name on one line, the emojis on their own beneath,
  // so nothing runs past a narrow column's edge.
  if (compact) {
    return h("div", { style: { paddingRight: 22, flexShrink: 0 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
        h(CreatureIcon, { def, size: 32, contain: true }),
        h("div", { style: { fontSize: 13, fontWeight: 800, color: "#111", lineHeight: 1.2, minWidth: 0, overflowWrap: "anywhere" } }, "Lv. " + enemyLevel + " " + def.name)),
      h(TraitEmojis, { def }));
  }
  return h("div", { style: { display: "flex", alignItems: "center", gap: 12, paddingRight: 28, flexShrink: 0 } },
    h(CreatureIcon, { def, size: 56, contain: true }),
    h("div", { style: { minWidth: 0 } },
      h("div", { style: { fontSize: 16, fontWeight: 800, color: "#111", lineHeight: 1.2 } }, "Lv. " + enemyLevel + " " + def.name),
      h(TraitEmojis, { def })));
}

/**
 * A Trials enemy's gear (tap an item for its info) and its abilities, worded
 * as the creature page words them. Shared like TrialsEnemyHeader; the panel
 * passes `compact` for two gear tiles per row.
 */
export function TrialsEnemyBody({ enemy, onTag, compact = false }) {
  const def = CREATURE_MAP[enemy.id];
  const gear = (enemy.__equipped || []).map((id) => EQUIPMENT_MAP[id]).filter(Boolean);
  const gearLevel = enemy.__equipLevel || 1;
  const [itemOpen, setItemOpen] = useState(null);
  return h(React.Fragment, null,
    itemOpen && h(ItemInfo, { item: itemOpen, level: gearLevel, onClose: () => setItemOpen(null) }),
    gear.length > 0 && h("div", { style: { marginBottom: 14 } },
      label("Gear"),
      h(GearSlots, { gear, onOpen: setItemOpen, perRow: compact ? 2 : 4 })),
    ...["basic", "special", "unique"].map((k) => def.abilities?.[k] && (compact ? h(AbilityRow, { key: k, def, k, onTag }) : h(AbilityCard, { key: k, def, k, onTag }))));
}

function EnemyDetail({ enemy, enemyLevel, onClose, onTag }) {
  // Every creature's popup is the same size: the header stays put and the gear
  // and abilities scroll beneath it when they run long.
  return overlay(onClose, [
    h("div", { key: "head", style: { marginBottom: 12, flexShrink: 0 } }, h(TrialsEnemyHeader, { enemy, enemyLevel })),
    h("div", { key: "body", style: { flex: 1, minHeight: 0, overflowY: "auto", margin: "0 -18px -18px", padding: "0 18px 18px" } },
      h(TrialsEnemyBody, { enemy, onTag })),
  ], { fixed: true });
}

const ABILITY_COLORS = { basic: { bg: "#EAF3DE", color: "#173404" }, special: { bg: "#EEEDFE", color: "#26215C" }, unique: { bg: "#FFF3CD", color: "#5A3E00" } };

/**
 * One ability, worded and badged exactly as the creature page shows it (its
 * Abilities tab): the same sentence, DMG / HEAL / SHIELD badges and the
 * Special's ⚡ charge cost -- at the max tier, which is what enemies fight
 * with. No pip row: an enemy's tier never changes.
 */
/**
 * An ability's max-tier wording as the creature page shows it: its sentence
 * plus the DMG / HEAL / SHIELD amounts. Shared by both ability layouts below.
 */
function abilityText(def, k) {
  const abl = def.abilities[k];
  const text = abl.upgrades[Math.min(MAX_TIER, abl.upgrades.length - 1)];
  const starlit = formatStarlitAbilityLevel(def.id, k, abl.upgrades, MAX_TIER);
  const plain = formatPlainAbilityLevel(def.id, k, text, MAX_TIER);
  const fmt = starlit
    ? { label: starlit.label, amount: starlit.amount }
    : plain
      ? { label: plain.label, amount: plain.amount, shieldAmt: plain.shieldAmt }
      : formatAbilityStep(text, abl.upgrades[MAX_TIER - 1] || null);
  let healAmt = starlit ? starlit.healAmt : null;
  if (!starlit) for (let i = MAX_TIER; i >= 0; i--) { healAmt = extractHeal(abl.upgrades[i]); if (healAmt != null) break; }
  return { sentence: fmt.isPercent ? fmt.text : fmt.label, amount: fmt.amount, shieldAmt: fmt.shieldAmt, healAmt };
}

/** The amount badges, in the creature page's colours. */
function amountBadges(t) {
  return [
    t.shieldAmt != null && h("span", { key: "s", style: { fontWeight: 800, color: "#2563EB" } }, t.shieldAmt + " SHIELD"),
    t.amount != null && h("span", { key: "d", style: { fontWeight: 800, color: "#534AB7" } }, t.amount + " DMG"),
    t.healAmt != null && h("span", { key: "h", style: { fontWeight: 800, color: "#2E8B57" } }, t.healAmt + " HEAL"),
  ];
}

/** The Special's energy cost pill (none for a chargeless Special). */
function chargePill(def, k, onTag, small = false) {
  if (k !== "special" || def.abilities.special.charge == null) return null;
  return h("button", {
    onClick: (e) => { e.stopPropagation(); onTag("energy"); },
    style: { fontSize: small ? 8 : 9, fontWeight: 800, color: "#2563eb", background: "#DBEAFE", border: "1px solid rgba(59,130,246,0.4)", borderRadius: 10, padding: small ? "0 6px" : "1px 8px", cursor: "pointer", lineHeight: 1.5, flexShrink: 0, whiteSpace: "nowrap" },
  }, "⚡ " + getSpecialChargeAt(def, MAX_TIER));
}

/**
 * The planning side panel's ability row -- its original compact look (small
 * label with the tags beside it, the name, a line of text), now carrying the
 * creature page's wording and numbers.
 */
function AbilityRow({ def, k, onTag }) {
  const abl = def.abilities[k];
  const t = abilityText(def, k);
  return h("div", { style: { marginBottom: 10 } },
    h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 } },
      label(ABILITY_LABELS[k]),
      h("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" } },
        chargePill(def, k, onTag, true),
        h(AbilityTagPills, { tags: getAbilityTags(def.id, k, MAX_TIER), onOpen: onTag, compact: true }))),
    h("div", { style: { fontSize: 12, fontWeight: 700, color: "#111" } }, abl.name),
    h("div", { style: { fontSize: 10, color: "#555", marginTop: 2 } }, t.sentence),
    h("div", { style: { display: "flex", flexWrap: "wrap", gap: "0 8px", fontSize: 10, marginTop: 1 } }, ...amountBadges(t)));
}

function AbilityCard({ def, k, onTag }) {
  const abl = def.abilities[k];
  const ac = ABILITY_COLORS[k];
  const t = abilityText(def, k);
  // The creature page's card without its grey box: the ability sits straight
  // on the popup, separated from the next by a hairline.
  return h("div", { className: "ability-card", style: { background: "none", borderRadius: 0, padding: "8px 0", marginBottom: 0, borderTop: "1px solid #eee" } },
    h("div", { className: "ability-header", style: { alignItems: "center" } },
      h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 } },
        h("span", { style: { fontSize: 8, fontWeight: 800, color: "#555", background: "#e8e8e8", borderRadius: 20, padding: "2px 7px", textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" } }, ABILITY_LABELS[k]),
        h("div", { style: { width: 40, height: 40, borderRadius: 8, background: ac.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } },
          abl.icon
            ? h("img", { src: abl.icon, style: { width: "100%", height: "100%", objectFit: "cover" } })
            : h("span", { style: { fontSize: 9, fontWeight: 700, color: ac.color, opacity: 0.5, userSelect: "none" } }, "No img"))),
      // The pills always sit on their own line beneath the name (see
      // CreatureDetail).
      h("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 } },
        h("span", { className: "ability-name" }, abl.name),
        h("div", { style: { display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 5, justifyContent: "flex-end" } },
          chargePill(def, k, onTag),
          h(AbilityTagPills, { tags: getAbilityTags(def.id, k, MAX_TIER), onOpen: onTag })))),
    h("p", { className: "ability-desc", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } },
      h("span", null, t.sentence),
      h("span", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 } }, ...amountBadges(t))));
}

/** The last team that beat a stage, laid out as it was deployed. */
function WinningTeam({ clear, stageName, onClose }) {
  const [copied, setCopied] = useState(false);
  const cells = Object.entries(clear.team).filter(([, id]) => CREATURE_MAP[id]);
  const rows = ARENA_GRID_ROWS - ARENA_PLAYER_START_ROW;
  function copy() {
    // Front row first, left to right -- the order a reader would rebuild it in.
    const sorted = cells.slice().sort(([a], [b]) => { const [ar, ac] = a.split(",").map(Number), [br, bc] = b.split(",").map(Number); return ar - br || ac - bc; });
    const text = "Trials " + stageName + " — winning team:\n" + sorted.map(([cell, id]) => {
      const [r, c] = cell.split(",").map(Number);
      return "• " + CREATURE_MAP[id].name + " Lv." + (clear.levels?.[id] || 1) + " (row " + (r - ARENA_PLAYER_START_ROW + 1) + ", column " + (c + 1) + ")";
    }).join("\n");
    try {
      navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false));
    } catch {
      setCopied(false);
    }
  }
  return overlay(onClose, [
    h("div", { key: "t", style: { fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 2 } }, "Winning team"),
    h("div", { key: "s", style: { fontSize: 11, color: "#888", marginBottom: 12 } }, stageName + " · cleared " + new Date(clear.at).toLocaleDateString()),
    h("div", { key: "g", style: { display: "grid", gridTemplateColumns: `repeat(${ARENA_GRID_COLS}, 1fr)`, gap: 4, marginBottom: 14 } },
      Array.from({ length: rows * ARENA_GRID_COLS }, (_, i) => {
        const r = ARENA_PLAYER_START_ROW + Math.floor(i / ARENA_GRID_COLS), c = i % ARENA_GRID_COLS;
        const id = clear.team[r + "," + c];
        const def = id && CREATURE_MAP[id];
        return h("div", { key: i, style: { aspectRatio: "1", background: "#f3f3f3", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" } },
          def && h(CreatureIcon, { def, size: 40, contain: true }),
          def && h("div", { style: { fontSize: 8, fontWeight: 700, color: "#555" } }, "Lv." + (clear.levels?.[id] || 1)));
      })),
    h("div", { key: "n", style: { fontSize: 11, color: "#555", marginBottom: 14 } }, cells.map(([, id]) => CREATURE_MAP[id].name).join(", ")),
    h("button", { key: "c", onClick: copy, style: { width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "#534AB7", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" } }, copied ? "Copied!" : "Copy team"),
  ]);
}

function TrialsHome({ onBack, viewIdx, progIdx, maxIdx, stage, enemyLevel, enemies, reward, clear, isReplay, isLocked, onPrev, onNext, onToCurrent, onFight }) {
  const [detail, setDetail] = useState(null);
  const [tagPopup, setTagPopup] = useState(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  // Trials reads as one run of Levels (1-500). Every tenth is a boss level,
  // and a level's number is also its enemies' level.
  const levelName = "Level " + viewIdx;
  const isBossLevel = stage === STAGES_PER_LEVEL;
  const status = isLocked ? "🔒 Locked" : isReplay ? "✅ Cleared" : isBossLevel ? "👑 Boss level" : null;
  // The winning team is there to look back on: shown once a level is beaten.
  const showTeam = isReplay && !!clear;
  const arrow = (dir, enabled, onClick) => h("button", {
    onClick: enabled ? onClick : undefined,
    "aria-label": dir === "prev" ? "Previous level" : "Next level",
    style: { width: 48, height: 48, borderRadius: "50%", border: "none", background: enabled ? "#f0effe" : "#f3f3f3", color: enabled ? "#534AB7" : "#ccc", fontSize: 22, fontWeight: 800, cursor: enabled ? "pointer" : "default", flexShrink: 0 },
  }, dir === "prev" ? "◀" : "▶");

  return h("div", { className: "screen-fade", style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5" } },
    detail && h(EnemyDetail, { enemy: detail, enemyLevel, onClose: () => setDetail(null), onTag: setTagPopup }),
    tagPopup && h(AbilityTagPopup, { popup: tagPopup, onClose: () => setTagPopup(null) }),
    teamOpen && showTeam && h(WinningTeam, { clear, stageName: levelName, onClose: () => setTeamOpen(false) }),
    // The reward's description -- the same popup the Arena's reward icons open.
    rewardOpen && reward && h("div", { onClick: () => setRewardOpen(false), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" } },
      h("div", { onClick: (e) => e.stopPropagation(), style: { background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" } },
        h("div", { style: { fontSize: 52, lineHeight: 1, marginBottom: 12 } }, currencyIcon(reward.key, reward.emoji)),
        h("div", { style: { fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 } }, reward.label),
        h("div", { style: { fontSize: 13, color: "#888", marginBottom: 4 } }, REWARD_DESC[reward.key] || ""),
        h("button", { onClick: () => setRewardOpen(false), style: { marginTop: 20, padding: "10px 28px", borderRadius: 12, border: "none", background: "#534AB7", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" } }, "OK"))),
    // header -- the winning team sits top right, on beaten levels only
    h("div", { style: { padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--bar-line)", background: "var(--bar-bg)", flexShrink: 0 } },
      h("button", { onClick: onBack, style: { background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#555", padding: 0, lineHeight: 1 } }, h("i", { className: "ti ti-arrow-left" })),
      h("div", { style: { fontSize: 18, fontWeight: 700, flex: 1 } }, "⚔️ Trials"),
      showTeam && h("button", {
        onClick: () => setTeamOpen(true),
        style: { padding: "5px 12px", borderRadius: 20, border: "1.5px solid #c4b5fd", background: "#f5f3ff", color: "#534AB7", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
      }, "🏆 Winning team")),
    // middle: the level's six enemies
    // Centred by an auto margin rather than justifyContent, so a level taller
    // than the screen still scrolls to its top instead of clipping it.
    h("div", { style: { flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column" } },
     h("div", { style: { margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" } },
      status && h("div", { style: { fontSize: 13, fontWeight: 700, color: isLocked ? "#aaa" : isReplay ? "#16a34a" : "#ff9800" } }, iconText(status)),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", maxWidth: 380, opacity: isLocked ? 0.55 : 1 } },
        enemies.map((e, i) => {
          const def = CREATURE_MAP[e.id];
          const gear = (e.__equipped || []).map((id) => EQUIPMENT_MAP[id]).filter(Boolean);
          return h("button", { key: i, onClick: () => setDetail(e), style: { background: "none", border: "none", padding: "6px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" } },
            h(CreatureIcon, { def, size: 64, contain: true }),
            h("div", { style: { fontSize: 11, fontWeight: 700, color: "#111", textAlign: "center", lineHeight: 1.2 } }, "Lv. " + enemyLevel + " " + def.name),
            h("div", { style: { display: "flex", gap: 2, fontSize: 13, minHeight: 16 } }, gear.map((g) => h("span", { key: g.id, title: g.name }, gearIcon(g)))));
        })),
      // the level's reward, or why there is none
      isReplay
        ? h("div", { style: { fontSize: 14, color: "#888", textAlign: "center" } }, "Cleared — replays give no rewards")
        : reward && h("button", { onClick: () => setRewardOpen(true), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", padding: 4, cursor: "pointer", font: "inherit" } },
            h("div", { style: { fontSize: 13, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, "Reward"),
            h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
              h("div", { style: { fontSize: 30, lineHeight: 1 } }, currencyIcon(reward.key, reward.emoji)),
              h("div", { style: { fontSize: 17, fontWeight: 800, color: "#534AB7" } }, reward.label))))),
    // bottom: level navigation and Fight
    h("div", { style: { background: "#fff", borderTop: "1px solid #e0e0e0", padding: "12px 16px 16px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
        arrow("prev", viewIdx > 1, onPrev),
        h("div", { style: { flex: 1, textAlign: "center" } },
          h("div", { style: { fontSize: 18, fontWeight: 800, color: "#111" } }, levelName),
          viewIdx !== progIdx && h("button", { onClick: onToCurrent, style: { marginTop: 2, background: "none", border: "none", color: "#534AB7", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 } }, "Back to current level")),
        arrow("next", viewIdx < maxIdx, onNext)),
      h("button", {
        onClick: isLocked ? undefined : onFight,
        style: { width: "100%", padding: "13px", borderRadius: 14, border: "none", background: isLocked ? "#ccc" : "#534AB7", color: "#fff", fontWeight: 800, fontSize: 16, cursor: isLocked ? "default" : "pointer" },
      }, iconText(isLocked ? "🔒 Beat the earlier levels first" : isReplay ? "⚔️ Fight again" : "⚔️ Fight"))));
}

export default TrialsHome;
