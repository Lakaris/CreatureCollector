// Equipment inventory tab: browse every piece of gear you own, filter it, and
// upgrade/ascend it. Levels/ascensions/copies are global per item id (shared
// across every creature that equips it) -- this screen is a read/upgrade view
// on that same global state, not a per-creature equip flow (that stays on
// CreatureDetail's own Gear tab, since assigning gear to a slot only makes
// sense in the context of one creature).

import React, { useState, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { CORE_STAT_CYCLE, STAT_LABELS } from "../../data/rarity.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION, EQUIP_ASC_COSTS } from "../../data/equipment.js";
import { TYPE_EMOJI, ROLE_CONFIG } from "../../data/types.js";
import { equipBonus, equipBonusStr, itemAffectsStat } from "../../core/equipment.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";
import EquipmentDetail from "../../ui/screens/EquipmentDetail.js";
import CreatureIcon from "../../ui/components/CreatureIcon.js";

// Must match TUTORIAL_ITEM_ID in TutorialOverlay.js -- the item the
// tutorial's guided walkthrough points at equipping/upgrading.
const TUTORIAL_ITEM_ID="com_hp_atk";

function EquipmentScreen() {
  const { owned, equipmentLevels, equipmentAscensions, equipmentCopies, setEquipmentCopies, setEquipmentAscensions, equipFavorites, setEquipFavorites, tutorialRestricted, tutorialStep, setTutorialStep } = useGame();
  const [selected, setSelected] = useState(null);
  // Resuming mid-tutorial after a reload: "upgradeItem" expects the Iron
  // Band's detail page already open, but `selected` is local state that
  // doesn't survive a reload.
  useEffect(() => {
    if (tutorialRestricted && tutorialStep === "upgradeItem") setSelected(TUTORIAL_ITEM_ID);
  }, []);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterRarities, setFilterRarities] = useState(new Set());
  const [filterStats, setFilterStats] = useState(new Set());
  const [filterHasEffect, setFilterHasEffect] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterElements, setFilterElements] = useState(new Set());
  const [filterRoles, setFilterRoles] = useState(new Set());

  function toggleFavorite(id, e) { e.stopPropagation(); setEquipFavorites((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleRarity(r) { setFilterRarities((prev) => { const n = new Set(prev); n.has(r) ? n.delete(r) : n.add(r); return n; }); }
  function toggleStat(s) { setFilterStats((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }); }
  function toggleElement(t) { setFilterElements((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function toggleRole(r) { setFilterRoles((prev) => { const n = new Set(prev); n.has(r) ? n.delete(r) : n.add(r); return n; }); }

  if (selected) return React.createElement(EquipmentDetail, { itemId: selected, onBack: () => setSelected(null) });

  const equippedAnywhere = new Set();
  const equippedByMap = {};
  Object.values(owned || {}).forEach((p) => (p.equipped || []).forEach((id) => {
    if (!id) return;
    equippedAnywhere.add(id);
    equippedByMap[id] = p;
  }));

  const anyReady = EQUIPMENT_DEFS.some((item) => {
    const asc = equipmentAscensions[item.id] || 0;
    const copies = equipmentCopies[item.id] || 0;
    return asc < EQUIP_MAX_ASCENSION && copies >= EQUIP_ASC_COSTS[asc];
  });

  const RARITY_RANK = { legendary: 3, epic: 2, rare: 1, common: 0 };
  const items = EQUIPMENT_DEFS
    .filter((item) => {
      if (!(equipmentCopies[item.id] > 0) && !(equipmentAscensions[item.id] > 0) && !equippedAnywhere.has(item.id)) return false;
      if (filterRarities.size > 0 && !filterRarities.has(item.rarity)) return false;
      if (filterStats.size > 0 && ![...filterStats].every((s) => itemAffectsStat(item, s))) return false;
      if (filterFavorites && !equipFavorites.has(item.id)) return false;
      if (filterHasEffect && !item.effect) return false;
      if (filterElements.size > 0 && !filterElements.has(item.element)) return false;
      if (filterRoles.size > 0 && !filterRoles.has(item.role)) return false;
      return true;
    })
    .sort((a, b) => {
      const ea = equippedAnywhere.has(a.id) ? 1 : 0, eb = equippedAnywhere.has(b.id) ? 1 : 0; if (eb !== ea) return eb - ea;
      const ascA = equipmentAscensions[a.id] || 0, ascB = equipmentAscensions[b.id] || 0;
      const copA = equipmentCopies[a.id] || 0, copB = equipmentCopies[b.id] || 0;
      const canAscA = (ascA < EQUIP_MAX_ASCENSION && copA >= EQUIP_ASC_COSTS[ascA]) ? 1 : 0;
      const canAscB = (ascB < EQUIP_MAX_ASCENSION && copB >= EQUIP_ASC_COSTS[ascB]) ? 1 : 0;
      if (canAscB !== canAscA) return canAscB - canAscA;
      const fa = equipFavorites.has(a.id) ? 1 : 0, fb = equipFavorites.has(b.id) ? 1 : 0; if (fb !== fa) return fb - fa;
      const la = equipmentLevels[a.id] || 0, lb = equipmentLevels[b.id] || 0; if (lb !== la) return lb - la;
      return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
    });

  return React.createElement("div", null,
    React.createElement(ScreenHeader, {
      title: "Equipment",
      right: anyReady && React.createElement("button", {
        onClick: () => {
          const newCopies = { ...equipmentCopies };
          const newAsc = { ...equipmentAscensions };
          EQUIPMENT_DEFS.forEach((item) => {
            let asc = newAsc[item.id] || 0;
            let copies = newCopies[item.id] || 0;
            while (asc < EQUIP_MAX_ASCENSION && copies >= EQUIP_ASC_COSTS[asc]) { copies -= EQUIP_ASC_COSTS[asc]; asc++; }
            newAsc[item.id] = asc; newCopies[item.id] = copies;
          });
          setEquipmentCopies(newCopies);
          setEquipmentAscensions(newAsc);
        },
        style: { fontSize: 12, fontWeight: 800, color: "#fff", background: "#f59e0b", border: "none", borderRadius: 9, cursor: "pointer", padding: "6px 12px", letterSpacing: ".03em" }
      }, "✦ Ascend All"),
    }),
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#666" } }, "All Gear"),
      !tutorialRestricted && React.createElement("button", { onClick: () => setFiltersOpen((p) => !p), style: { fontSize: 11, color: "#534AB7", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" } }, filtersOpen ? "Hide Filters ▲" : "Filter ▼")
    ),
    !tutorialRestricted && filtersOpen && React.createElement("div", { style: { marginBottom: 4 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Rarity"),
        React.createElement("div", { className: "filter-row", style: { margin: 0, padding: 0, flex: 1 } },
          Object.entries(EQUIP_RARITY_CONFIG).map(([r, cfg]) => React.createElement("button", { key: r, className: "filter-chip" + (filterRarities.has(r) ? " active" : ""), onClick: () => toggleRarity(r) }, cfg.label))
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
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" } }, "Show"),
        React.createElement("button", { className: "filter-chip" + (filterFavorites ? " active" : ""), onClick: () => setFilterFavorites((p) => !p) }, "★ Favorites"),
        React.createElement("button", { className: "filter-chip" + (filterHasEffect ? " active" : ""), onClick: () => setFilterHasEffect((p) => !p) }, "Has Effect")
      )
    ),
    items.length === 0
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px 20px", color: "#666" } },
          React.createElement("i", { className: "ti ti-tool", style: { fontSize: 40, display: "block", marginBottom: 8, opacity: .3 } }),
          React.createElement("p", { style: { fontSize: 13 } }, "No gear yet — earn some from battles and treasure!")
        )
      : React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 } },
          items.map((item) => {
            const lvl = equipmentLevels[item.id] || 1;
            const asc = equipmentAscensions[item.id] || 0;
            const copies = equipmentCopies[item.id] || 0;
            const bonuses = equipBonus(item.id, lvl, asc);
            const rarCfg = EQUIP_RARITY_CONFIG[item.rarity];
            const isEquipped = equippedAnywhere.has(item.id);
            const canAscendItem = asc < EQUIP_MAX_ASCENSION && copies >= EQUIP_ASC_COSTS[asc];
            const showItemPointer = tutorialStep === "equipItem" && item.id === TUTORIAL_ITEM_ID;
            return React.createElement("div", {
              key: item.id,
              onClick: () => { setSelected(item.id); if (tutorialStep === "equipItem" && item.id === TUTORIAL_ITEM_ID) setTutorialStep("upgradeItem"); },
              style: { position: "relative", background: rarCfg ? rarCfg.bg : "#fff", borderRadius: 10, padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", width: "calc(50% - 4px)", boxSizing: "border-box", textAlign: "center", border: "1.5px solid " + (isEquipped ? "#d0ccf7" : (rarCfg ? rarCfg.color + "44" : "#eee")), userSelect: "none" }
            },
              showItemPointer && React.createElement("div", { style: { position: "absolute", left: "50%", top: -34, transform: "translate(-50%,0)", fontSize: 26, color: "#534AB7", animation: "pointerBounce 1s ease-in-out infinite", zIndex: 6, pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" } }, "⬇️"),
              React.createElement("div", { style: { position: "absolute", top: 6, left: 8 } },
                React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: lvl >= EQUIP_MAX_LEVEL ? "#f59e0b" : "#888", lineHeight: "16px" } }, lvl >= EQUIP_MAX_LEVEL ? "MAX" : "Lv " + lvl)
              ),
              React.createElement("div", { style: { position: "absolute", top: 6, right: 8, fontSize: 16, cursor: "pointer", color: equipFavorites.has(item.id) ? "#f59e0b" : "#ccc", lineHeight: 1 }, onClick: (e) => toggleFavorite(item.id, e) }, equipFavorites.has(item.id) ? "★" : "☆"),
              asc > 0 && React.createElement("div", { style: { position: "absolute", top: 4, left: 0, right: 0, textAlign: "center", fontSize: 10, fontWeight: 700, color: "#f59e0b", lineHeight: "14px", pointerEvents: "none" } }, asc >= EQUIP_MAX_ASCENSION ? "✦".repeat(10) : (asc <= 5 ? "★".repeat(asc) : "★".repeat(5) + "★".repeat(asc - 5))),
              React.createElement("div", { style: { position: "relative", display: "inline-block", marginTop: 4 } },
                React.createElement("span", { style: { fontSize: 22 } }, item.emoji)
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#000" } }, item.name),
                React.createElement("div", { style: { fontSize: 11, color: "#666" } }, equipBonusStr(bonuses)),
                item.effect && React.createElement("div", { style: { fontSize: 10, color: "#7F77DD", fontWeight: 600, marginTop: 2 } }, "✦ " + item.effect),
                canAscendItem && React.createElement("div", { style: { marginTop: 3 } },
                  React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: "#fff", background: "#f59e0b", borderRadius: 6, padding: "2px 6px", letterSpacing: ".04em" } }, "ASCEND READY")
                )
              ),
              isEquipped && (() => {
                const pet = equippedByMap[item.id];
                const d = pet ? CREATURE_MAP[pet.id] : null;
                if (!d) return null;
                return React.createElement("div", {
                  style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1, marginTop: 2, padding: "3px 8px", borderRadius: 8, background: "#fff" }
                },
                  React.createElement(CreatureIcon, { def: d, size: 18 }),
                  React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#534AB7", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d.name)
                );
              })()
            );
          })
        )
  );
}

export default EquipmentScreen;
