// Searchable index of every equipment item in the game -- the gear analogue of
// the Creature Dex (DexScreen). Reached from EquipmentScreen's Dex button.
// Entries always show BASE stats (Lv 1, no ascensions) plus the item's effect;
// unlike EquipmentDetail there is no upgrading, ascending, or equipping here.

import React, { useState, useMemo } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS } from "../../data/equipment.js";
import { CORE_STAT_CYCLE, STAT_LABELS } from "../../data/rarity.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { equipBonus, equipBonusStr, itemAffectsStat } from "../../core/equipment.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";

/** Read-only view of one item at its base state -- EquipmentDetail's info
 * without the equip/upgrade/ascend controls. */
function EquipmentDexEntry({ item, collected, onBack }) {
  const rarCfg = EQUIP_RARITY_CONFIG[item.rarity];
  const baseBonuses = equipBonus(item.id, 1, 0);
  return React.createElement("div", null,
    React.createElement(ScreenHeader, { title: "", onBack }),
    React.createElement("div", { className: "card", style: { position: "relative", padding: "24px 20px" } },
      rarCfg && React.createElement("div", { style: { position: "absolute", top: 10, left: 12, fontSize: 10, fontWeight: 700, color: rarCfg.color, background: rarCfg.bg, borderRadius: 4, padding: "2px 7px" } }, rarCfg.label),
      (item.element || item.role || item.attackType) && React.createElement("div", { style: { position: "absolute", top: 34, left: 12, fontSize: 10, fontWeight: 700, color: "#7F77DD" } },
        [item.element, item.role, item.attackType].filter(Boolean).join(" · ") + " exclusive"
      ),
      React.createElement("div", { style: { position: "absolute", top: 10, right: 12, fontSize: 10, fontWeight: 700, color: collected ? "#2e7d32" : "#aaa", background: collected ? "#e8f5e9" : "#f0f0f0", borderRadius: 4, padding: "2px 7px" } },
        collected ? "✓ Collected" : "Not collected"
      ),
      React.createElement("div", { style: { textAlign: "center", paddingTop: 12 } },
        React.createElement("div", { style: { fontSize: 64, marginBottom: 4 } }, item.emoji),
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#000", marginBottom: 2 } }, item.name),
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 6 } }, "Base stats (Lv 1)"),
        React.createElement("div", { style: { fontSize: 13, color: "#666", marginBottom: item.effect ? 6 : 0 } }, equipBonusStr(baseBonuses)),
        item.effect && React.createElement("div", { style: { fontSize: 12, color: "#7F77DD", fontWeight: 600 } }, "✦ " + item.effect)
      )
    )
  );
}

function EquipmentDexScreen({ onBack }) {
  const { owned, equipmentCopies, equipmentAscensions, equipFavorites } = useGame();
  const [selected, setSelected] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterRarities, setFilterRarities] = useState(new Set());
  const [filterStats, setFilterStats] = useState(new Set());
  const [filterHasEffect, setFilterHasEffect] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterElements, setFilterElements] = useState(new Set());
  const [filterRoles, setFilterRoles] = useState(new Set());
  const [filterRanges, setFilterRanges] = useState(new Set());
  const [missingOnly, setMissingOnly] = useState(false);

  function toggleRarity(r) { setFilterRarities((prev) => { const n = new Set(prev); n.has(r) ? n.delete(r) : n.add(r); return n; }); }
  function toggleStat(s) { setFilterStats((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }); }
  function toggleElement(t) { setFilterElements((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function toggleRole(r) { setFilterRoles((prev) => { const n = new Set(prev); n.has(r) ? n.delete(r) : n.add(r); return n; }); }
  function toggleRange(r) { setFilterRanges((prev) => { const n = new Set(prev); n.has(r) ? n.delete(r) : n.add(r); return n; }); }

  // Same "do I own this" predicate as EquipmentScreen's inventory grid:
  // copies in hand, ascensions banked, or equipped on any creature.
  const ownedIds = useMemo(() => {
    const s = new Set();
    EQUIPMENT_DEFS.forEach((item) => {
      if ((equipmentCopies[item.id] || 0) > 0 || (equipmentAscensions[item.id] || 0) > 0) s.add(item.id);
    });
    Object.values(owned || {}).forEach((p) => (p.equipped || []).forEach((id) => { if (id) s.add(id); }));
    return s;
  }, [owned, equipmentCopies, equipmentAscensions]);

  const visible = EQUIPMENT_DEFS.filter((item) => {
    if (missingOnly && ownedIds.has(item.id)) return false;
    if (filterRarities.size > 0 && !filterRarities.has(item.rarity)) return false;
    if (filterStats.size > 0 && ![...filterStats].every((s) => itemAffectsStat(item, s))) return false;
    if (filterFavorites && !equipFavorites.has(item.id)) return false;
    if (filterHasEffect && !item.effect) return false;
    if (filterElements.size > 0 && !filterElements.has(item.element)) return false;
    if (filterRoles.size > 0 && !filterRoles.has(item.role)) return false;
    if (filterRanges.size > 0 && !filterRanges.has(item.attackType)) return false;
    return true;
  });

  if (selected) return React.createElement(EquipmentDexEntry, { item: selected, collected: ownedIds.has(selected.id), onBack: () => setSelected(null) });

  return React.createElement("div", null,
    React.createElement(ScreenHeader, { title: "Equipment Dex", onBack, right:
      React.createElement("span", { style: { fontSize: 12, color: "#666" } }, ownedIds.size + " / " + EQUIPMENT_DEFS.length + " collected")
    }),
    React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 6 } },
      React.createElement("button", { onClick: () => setFiltersOpen((p) => !p), style: { fontSize: 11, color: "#534AB7", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" } }, filtersOpen ? "Hide Filters ▲" : "Filter ▼")
    ),
    filtersOpen && React.createElement("div", { style: { marginBottom: 10 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Rarity"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          Object.entries(EQUIP_RARITY_CONFIG).map(([r, cfg]) => React.createElement("button", { key: r, className: "filter-chip" + (filterRarities.has(r) ? " active" : ""), onClick: () => toggleRarity(r) }, cfg.label)),
          React.createElement("button", { className: "filter-chip" + (missingOnly ? " active" : ""), onClick: () => setMissingOnly((p) => !p) }, "Missing only")
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Stat"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          [...CORE_STAT_CYCLE, "spd", "abilitySpeed"].map((s) => React.createElement("button", { key: s, className: "filter-chip" + (filterStats.has(s) ? " active" : ""), onClick: () => toggleStat(s) }, STAT_LABELS[s]))
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Type"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          Object.entries(TYPE_EMOJI).map(([t, em]) => React.createElement("button", { key: t, className: "filter-chip" + (filterElements.has(t) ? " active" : ""), onClick: () => toggleElement(t) }, em + " " + t))
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Role"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          ["Attacker", "Tank", "Support"].map((r) => React.createElement("button", { key: r, className: "filter-chip" + (filterRoles.has(r) ? " active" : ""), onClick: () => toggleRole(r) }, ROLE_CONFIG[r].emoji + " " + r))
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Range"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          ["Melee", "Ranged"].map((r) => React.createElement("button", { key: r, className: "filter-chip" + (filterRanges.has(r) ? " active" : ""), onClick: () => toggleRange(r) }, ATTACK_TYPE_CONFIG[r].emoji + " " + r))
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Show"),
        React.createElement("button", { className: "filter-chip" + (filterFavorites ? " active" : ""), onClick: () => setFilterFavorites((p) => !p) }, "★ Favorites"),
        React.createElement("button", { className: "filter-chip" + (filterHasEffect ? " active" : ""), onClick: () => setFilterHasEffect((p) => !p) }, "Has Effect")
      )
    ),
    visible.length === 0
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px 20px", color: "#666" } },
          React.createElement("p", { style: { fontSize: 13 } }, "No equipment matches your filters")
        )
      : React.createElement("div", { className: "creature-grid" },
          visible.map((item) => {
            const isCollected = ownedIds.has(item.id);
            const rarCfg = EQUIP_RARITY_CONFIG[item.rarity];
            return React.createElement("div", { key: item.id, className: "creature-card", onClick: () => { setSelected(item); const c = document.querySelector(".app-content"); if (c) c.scrollTop = 0; }, style: { position: "relative", paddingTop: 30, background: rarCfg.bg, border: "1px solid " + rarCfg.color + "44" } },
              item.element && React.createElement("span", { style: { position: "absolute", top: 5, left: 5, fontSize: 14, lineHeight: 1 } }, TYPE_EMOJI[item.element] || ""),
              item.attackType && React.createElement("span", { style: { position: "absolute", top: 5, right: 5, fontSize: 13, lineHeight: 1 } }, ATTACK_TYPE_CONFIG[item.attackType].emoji),
              item.role && React.createElement("span", { style: { position: "absolute", top: item.attackType ? 20 : 5, right: 5, fontSize: 13, lineHeight: 1 } }, ROLE_CONFIG[item.role].emoji),
              React.createElement("div", { className: "creature-emoji" }, item.emoji),
              React.createElement("div", { className: "creature-name" }, item.name),
              // Same invisible-when-uncollected badge trick as the Creature
              // Dex, so every card keeps identical height either way.
              React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "center", marginBottom: 4, flexWrap: "wrap", alignItems: "center" } },
                React.createElement("span", { className: "lv-badge", style: { visibility: isCollected ? "visible" : "hidden" } }, "✓")
              )
            );
          })
        )
  );
}

export default EquipmentDexScreen;
