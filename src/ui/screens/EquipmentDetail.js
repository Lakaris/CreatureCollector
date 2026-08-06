// Single equipment item: stats, upgrade, and ascension. Reached from
// EquipmentScreen's inventory grid. Levels/ascensions are global per item id
// (shared across every creature that equips it), matching how CreatureDetail's
// own Gear tab already treats equipment.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_MAP, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION, EQUIP_ASC_COSTS } from "../../data/equipment.js";
import { equipUpgradeCost, equipBonus, equipBonusStr } from "../../core/equipment.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";
import Notify from "../../ui/components/Notify.js";
import EquipmentPicker from "../../ui/screens/EquipmentPicker.js";
import CreatureIcon from "../../ui/components/CreatureIcon.js";

function EquipmentDetail({ itemId, onBack }) {
  const { owned, currencies, setCurrencies, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, equipmentCopies, setEquipmentCopies } = useGame();
  const [notify, setNotify] = React.useState(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  function notify_(msg) { setNotify(msg); setTimeout(() => setNotify(null), 2200); }

  const pi = EQUIPMENT_MAP[itemId];
  if (!pi) { onBack(); return null; }

  if (pickerOpen) return React.createElement(EquipmentPicker, { itemId, onBack: () => setPickerOpen(false), onEquipped: () => setPickerOpen(false) });

  const lvl = equipmentLevels[pi.id] || 1;
  const asc = equipmentAscensions[pi.id] || 0;
  const copies = equipmentCopies[pi.id] || 0;
  const bonuses = equipBonus(pi.id, lvl, asc);
  const nextUpgradeBonuses = lvl < EQUIP_MAX_LEVEL ? equipBonus(pi.id, lvl + 1, asc) : null;
  const rarCfg = EQUIP_RARITY_CONFIG[pi.rarity];
  const upgradeCost = lvl < EQUIP_MAX_LEVEL ? equipUpgradeCost(lvl) : null;
  const canAffordUpgrade = upgradeCost !== null && (currencies.equipShards || 0) >= upgradeCost;
  const ascCost = asc < EQUIP_MAX_ASCENSION ? EQUIP_ASC_COSTS[asc] : null;
  const canAffordAsc = ascCost !== null && copies >= ascCost;
  const starStr = "★".repeat(asc);

  const equippedBy = Object.values(owned || {}).filter((p) => (p.equipped || []).includes(pi.id));

  function doUpgrade() {
    if (lvl >= EQUIP_MAX_LEVEL) return;
    const cost = equipUpgradeCost(lvl);
    if ((currencies.equipShards || 0) < cost) { notify_("Not enough 🔧 Gear Shards!"); return; }
    setCurrencies((c) => ({ ...c, equipShards: (c.equipShards || 0) - cost }));
    setEquipmentLevels((prev) => ({ ...prev, [pi.id]: (prev[pi.id] || 0) + 1 }));
  }

  function doAscendEquip() {
    if (asc >= EQUIP_MAX_ASCENSION) return;
    const need = EQUIP_ASC_COSTS[asc];
    if (copies < need) { notify_("Not enough copies!"); return; }
    setEquipmentCopies((prev) => ({ ...prev, [pi.id]: (prev[pi.id] || 0) - need }));
    setEquipmentAscensions((prev) => ({ ...prev, [pi.id]: (prev[pi.id] || 0) + 1 }));
  }

  return React.createElement("div", null,
    notify && React.createElement(Notify, { msg: notify }),
    React.createElement(ScreenHeader, { title: "", onBack }),
    React.createElement("div", { className: "card", style: { position: "relative" } },
      rarCfg && React.createElement("div", { style: { position: "absolute", top: 10, left: 12, fontSize: 10, fontWeight: 700, color: rarCfg.color, background: rarCfg.bg, borderRadius: 4, padding: "2px 7px" } }, rarCfg.label),
      (pi.element || pi.role) && React.createElement("div", { style: { position: "absolute", top: 34, left: 12, fontSize: 10, fontWeight: 700, color: "#7F77DD" } },
        [pi.element, pi.role].filter(Boolean).join(" · ") + " exclusive"
      ),
      (() => {
        const pet = equippedBy[0];
        const d = pet ? CREATURE_MAP[pet.id] : null;
        return React.createElement("div", {
          onClick: () => setPickerOpen(true),
          style: { position: "absolute", top: 10, right: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, width: 60, height: 46, borderRadius: 8, background: d ? "#f0effe" : "#f5f5f5", border: "1px solid " + (d ? "#d0ccf7" : "#e0e0e0"), cursor: "pointer", boxSizing: "border-box" }
        },
          d
            ? [
                React.createElement(CreatureIcon, { key: "icon", def: d, size: 22 }),
                React.createElement("div", { key: "name", style: { fontSize: 9, fontWeight: 700, color: "#534AB7", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d.name)
              ]
            : [
                React.createElement("div", { key: "plus", style: { fontSize: 16, color: "#bbb", lineHeight: 1 } }, "＋"),
                React.createElement("div", { key: "label", style: { fontSize: 9, fontWeight: 700, color: "#aaa" } }, "Equip")
              ]
        );
      })(),
      React.createElement("div", { style: { textAlign: "center", marginBottom: 16, paddingTop: 12 } },
        React.createElement("div", { style: { fontSize: 64, marginBottom: 4 } }, pi.emoji),
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#000", marginBottom: 2 } }, pi.name),
        asc > 0 && React.createElement("div", { style: { fontSize: 14, color: "#f59e0b", letterSpacing: 2, marginBottom: 4 } }, starStr),
        React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: lvl >= EQUIP_MAX_LEVEL ? "#d97706" : "#444", marginBottom: 6 } }, lvl >= EQUIP_MAX_LEVEL ? "MAX" : "Lv " + lvl),
        React.createElement("div", { style: { fontSize: 13, color: "#666", marginBottom: pi.effect ? 6 : 0 } }, equipBonusStr(bonuses)),
        pi.effect && React.createElement("div", { style: { fontSize: 12, color: "#7F77DD", fontWeight: 600 } }, "✦ " + pi.effect)
      ),
      React.createElement("div", { style: { borderTop: "1px solid #eee", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 6 } }, "UPGRADE"),
          lvl < EQUIP_MAX_LEVEL
            ? React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 12, color: "#534AB7", marginBottom: 8 } }, "Lv " + (lvl + 1) + ": " + equipBonusStr(nextUpgradeBonuses)),
                React.createElement("button", { onClick: doUpgrade, disabled: !canAffordUpgrade, style: { width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, cursor: canAffordUpgrade ? "pointer" : "default", background: canAffordUpgrade ? "#534AB7" : "#e0e0e0", color: canAffordUpgrade ? "#fff" : "#aaa" } }, "🔧 Upgrade " + (currencies.equipShards || 0) + "/" + upgradeCost)
              )
            : React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#f59e0b" } }, "✦ Max Level")
        ),
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 6 } }, "ASCENSION"),
          asc < EQUIP_MAX_ASCENSION
            ? React.createElement("button", { onClick: doAscendEquip, disabled: !canAffordAsc, style: { width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, cursor: canAffordAsc ? "pointer" : "default", background: canAffordAsc ? "#f59e0b" : "#e0e0e0", color: canAffordAsc ? "#fff" : "#aaa" } }, "✦ Ascend " + copies + "/" + ascCost)
            : React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#f59e0b" } }, "✦ Max Ascension")
        )
      )
    )
  );
}

export default EquipmentDetail;
