// Creature picker for equipping one piece of gear, opened from EquipmentDetail.
// Mirrors CollectionScreen's own creature-grid/creature-card markup so this
// picker looks and feels like browsing the Collection tab. For exclusive gear,
// creatures that can't take it (wrong element/role/range/species) are left
// out of the list entirely rather than shown disabled.
// Eligible creatures whose 4 gear slots are already full are still tappable --
// tapping one opens a popup asking which of its equipped items to replace.

import React, { useState } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { EQUIPMENT_MAP, EQUIP_RARITY_CONFIG } from "../../data/equipment.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getDisplayArt } from "../../core/creatures.js";
import CreatureIcon from "../../ui/components/CreatureIcon.js";
import { equipBonus, equipBonusStr, isExclusive, itemFitsCreature, exclusivityLabels } from "../../core/equipment.js";
import AscStars, { ascStarTier } from "../../ui/components/AscStars.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";

/** Height of the bottom ascension bar -- matches CollectionScreen's ASC_BAR_H. */
const ASC_BAR_H = 26;

function EquipmentPicker({ itemId, onBack, onEquipped }) {
  const { owned, setOwned, unlockedSkins, equipmentLevels, equipmentAscensions } = useGame();
  const [replaceCreatureId, setReplaceCreatureId] = useState(null);
  const item = EQUIPMENT_MAP[itemId];
  if (!item) { onBack(); return null; }

  function equipOnto(creatureId, slotIdx) {
    setOwned((prev) => {
      const next = { ...prev };
      // An item lives on only one creature at a time -- pull it off whoever has it.
      for (const pet of Object.values(prev)) {
        if ((pet.equipped || []).includes(itemId)) {
          next[pet.id] = { ...pet, equipped: (pet.equipped || []).map((id) => (id === itemId ? null : id)) };
        }
      }
      const target = next[creatureId] || prev[creatureId];
      const slots = [...(target.equipped || [null, null, null, null])];
      const idx = slotIdx != null ? slotIdx : slots.findIndex((s) => !s);
      if (idx === -1) return prev;
      slots[idx] = itemId;
      next[creatureId] = { ...target, equipped: slots };
      return next;
    });
    onEquipped ? onEquipped() : onBack();
  }

  function handlePick(o, hasOpenSlot) {
    if (hasOpenSlot) { equipOnto(o.id); return; }
    setReplaceCreatureId(o.id);
  }

  const entries = Object.values(owned || {})
    .filter((o) => CREATURE_MAP[o.id])
    .filter((o) => !(o.equipped || []).includes(itemId)) // already-equipped creature isn't a switch target
    .filter((o) => itemFitsCreature(item, CREATURE_MAP[o.id]));

  const replacePet = replaceCreatureId ? owned[replaceCreatureId] : null;
  const replaceDef = replacePet ? CREATURE_MAP[replacePet.id] : null;

  return React.createElement("div", null,
    replacePet && replaceDef && React.createElement("div", { onClick: () => setReplaceCreatureId(null), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "0 24px" } },
      React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: "#fff", borderRadius: 16, padding: "20px 18px", width: "100%", maxWidth: 320, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" } },
        React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4, textAlign: "center" } }, replaceDef.name + "'s gear is full"),
        React.createElement("div", { style: { fontSize: 12, color: "#666", marginBottom: 14, textAlign: "center" } }, "Choose an item to replace with " + item.name),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
          (replacePet.equipped || [null, null, null, null]).map((existingId, slotIdx) => {
            const existing = existingId ? EQUIPMENT_MAP[existingId] : null;
            if (!existing) return null;
            const lvl = equipmentLevels[existing.id] || 1;
            const asc = equipmentAscensions[existing.id] || 0;
            const bonuses = equipBonus(existing.id, lvl, asc);
            return React.createElement("div", {
              key: slotIdx,
              onClick: () => { const cid = replaceCreatureId; setReplaceCreatureId(null); equipOnto(cid, slotIdx); },
              style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "#f7f7fb", border: "1px solid #eee", cursor: "pointer", minHeight: 62, boxSizing: "border-box" }
            },
              React.createElement("span", { style: { fontSize: 22, flexShrink: 0 } }, existing.emoji),
              React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#333" } }, existing.name + (asc > 0 ? " (Lv " + lvl + ", ✦" + asc + ")" : " (Lv " + lvl + ")")),
                React.createElement("div", { style: { fontSize: 11, color: "#666" } }, equipBonusStr(bonuses)),
                React.createElement("div", { style: { fontSize: 10, color: "#7F77DD", fontWeight: 600, marginTop: 2, minHeight: 13 } }, existing.effect ? "✦ " + existing.effect : "")
              )
            );
          })
        ),
        React.createElement("button", { onClick: () => setReplaceCreatureId(null), style: { width: "100%", padding: "10px 0", background: "#eee", color: "#333", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 } }, "Cancel")
      )
    ),
    React.createElement(ScreenHeader, { title: "Choose a Creature", onBack }),
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "#666" } },
      React.createElement("span", { style: { fontSize: 20 } }, item.emoji),
      React.createElement("span", null, "Equipping " + item.name + exclusivityLabels(item).map((l) => " · " + l + " only").join(""))
    ),
    entries.length === 0
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px 20px", color: "#666" } },
          React.createElement("p", { style: { fontSize: 13 } }, isExclusive(item) ? "No eligible creatures for this gear yet." : "No creatures yet — hatch some eggs!")
        )
      : React.createElement("div", { className: "creature-grid" },
          // Card layout is CollectionScreen's, element for element: rarity-tinted
          // card, full-card art, Type/Role/Range stacked top-left, level top-right,
          // and the banded ascension stars in a white bar along the bottom. Keep
          // the two in sync -- this picker is meant to read as the Collection grid.
          entries.map((o) => {
            const d = CREATURE_MAP[o.id];
            const hasOpenSlot = (o.equipped || [null, null, null, null]).some((s) => !s);
            const art = getDisplayArt(d, o, unlockedSkins);
            const rarCfg = EQUIP_RARITY_CONFIG[d.rarity];
            const asc = ascStarTier(o.ascensions);
            return React.createElement("div", {
              key: o.id,
              className: "creature-card",
              onClick: () => handlePick(o, hasOpenSlot),
              style: { position: "relative", paddingTop: 30, cursor: "pointer", background: rarCfg.bg, border: "1px solid " + rarCfg.color + "44" }
            },
              art.kind !== "emoji" && React.createElement(CreatureIcon, { key: "art", def: d, ownedData: o, unlockedSkins, still: true, size: 72, style: { position: "absolute", top: 0, left: 0, width: "100%", height: "calc(100% - " + ASC_BAR_H + "px)" } }),
              // Badge column, top-left: Type, then Role, then Range.
              React.createElement("div", { style: { position: "absolute", top: 5, left: 5, display: "flex", flexDirection: "column", gap: 4, alignItems: "center", pointerEvents: "none" } },
                React.createElement("span", { style: { fontSize: 14, lineHeight: 1 } }, TYPE_EMOJI[d.type] || d.type),
                d.role && React.createElement("span", { style: { fontSize: 13, lineHeight: 1 } }, ROLE_CONFIG[d.role].emoji),
                d.attackType && React.createElement("span", { style: { fontSize: 13, lineHeight: 1 } }, ATTACK_TYPE_CONFIG[d.attackType].emoji)
              ),
              React.createElement("span", { style: { position: "absolute", top: 5, right: 5, fontSize: 12, fontWeight: 700, color: "#666", lineHeight: 1, pointerEvents: "none", textShadow: "0 0 3px #fff, 0 0 3px #fff" } }, "Lv " + o.level),
              // Picker-only: this creature's four slots are taken, so tapping it
              // opens the replace popup instead of equipping. Floated just above
              // the star bar with the same halo the level uses, so it reads over
              // art without changing the card's shape.
              !hasOpenSlot && React.createElement("div", { style: { position: "absolute", left: 2, right: 2, bottom: ASC_BAR_H + 2, fontSize: 8, fontWeight: 800, color: "#d97706", textAlign: "center", lineHeight: 1.15, pointerEvents: "none", textShadow: "0 0 3px #fff, 0 0 3px #fff" } }, "Slots full · tap to replace"),
              React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 0, height: ASC_BAR_H, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.92)", borderTop: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "0 0 9px 9px", overflow: "hidden", containerType: "inline-size" } },
                React.createElement(AscStars, { n: asc.count, max: 5, doubled: asc.doubled, colors: asc.colors, slotted: true, style: { fontSize: "min(16px,17.5cqw)", gap: 1, ...asc.style } })
              ),
              art.kind !== "emoji"
                ? React.createElement("div", { style: { height: 72 } })
                : React.createElement("div", { style: { height: 72, display: "flex", alignItems: "center", justifyContent: "center" } },
                    React.createElement(CreatureIcon, { def: d, ownedData: o, unlockedSkins, still: true, size: 26 }))
            );
          })
        )
  );
}

export default EquipmentPicker;
