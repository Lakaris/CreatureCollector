// Test Battle (DEV_MODE only): a sandbox for battle testing. Place any
// creatures -- including multiple copies of the same one -- on either side of
// an arena-sized grid, then run the fight on the shared battle engine
// (runBattleTick, the same one Dungeon/Arena/Labyrinth/Daily Boss use).
//
// The battle phase mirrors the real screens (LabyrinthScreen's presentation:
// RAF-interpolated movement, damage chart, tap-a-unit info panel, identical FX
// rendering). Deliberately unlike them everywhere else: no rewards, no unlock
// gates, no timer, tap-to-place planning, and free placement on any cell. The
// whole screen is a debug tool and may be removed or toggled off later.

import React, { useState, useRef, useEffect } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../../data/creatures.js";
import { TYPE_EMOJI } from "../../../data/types.js";
import { ARENA_GRID_COLS, ARENA_GRID_ROWS, ARENA_TILE } from "../../../battle/constants.js";
import { aEase } from "../../../battle/geometry.js";
import { makeArenaBattle } from "../../../battle/state.js";
import { runBattleTick } from "../../../battle/tick.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import UnitInfoPanel, { debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import useTouchDragPlacement from "../../../ui/hooks/useTouchDragPlacement.js";
import { ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../../data/types.js";
import { EQUIPMENT_DEFS, EQUIP_RARITY_CONFIG } from "../../../data/equipment.js";
import { equipBonus, equipBonusStr, equippedStatBonuses } from "../../../core/equipment.js";
import { calcStats } from "../../../core/creatures.js";

const COLS = ARENA_GRID_COLS, ROWS = ARENA_GRID_ROWS, TILE = ARENA_TILE;

function TestBattleScreen({ onBack }) {
  const { owned, equipmentLevels, equipmentAscensions } = useGame();

  // Planning state. testGrid: "row,col" -> {id, side:"player"|"enemy"}.
  // Multiple cells may hold the same creature id -- that's the point.
  const [testGrid, setTestGrid] = useState({});
  const [side, setSide] = useState("player");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [enemyLevel, setEnemyLevel] = useState(1);
  const [maxAbilities, setMaxAbilities] = useState(false);
  // Gear slots are stored per placement as {id, lvl} (lvl 0 = the save's real
  // level/ascension for that item; 1-100 = that exact level, ascension 0), so
  // the same item can sit on different creatures -- or different slots -- at
  // different levels. `gearLevel` is just the DEFAULT stamped onto newly
  // equipped items; each slot's level is editable afterwards in the picker.
  const [gearLevel, setGearLevel] = useState(0);
  const slotLvl = (slot) => ((slot?.lvl || 0) >= 1 ? Math.min(100, slot.lvl) : (equipmentLevels?.[slot?.id] || 1));
  const slotAsc = (slot) => ((slot?.lvl || 0) >= 1 ? 0 : (equipmentAscensions?.[slot?.id] || 0));

  // Roster filters.
  const [fType, setFType] = useState(new Set());
  const [fRole, setFRole] = useState(new Set());
  const [fRange, setFRange] = useState(new Set());
  const [fRarity, setFRarity] = useState(new Set());
  const [fOwned, setFOwned] = useState(false);
  const toggleIn = (setter) => (v) => setter((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; });

  // Drag state: HTML5 drag for mouse (dragId = tray origin, dragCell = grid
  // origin) plus the shared touch-drag hook the real planning screens use.
  const [dragId, setDragId] = useState(null);
  const [dragCell, setDragCell] = useState(null);
  function applyDrop(r, c, { id, fromCell }) {
    const key = r + "," + c;
    setTestGrid((prev) => {
      const n = { ...prev };
      if (fromCell) {
        const entry = n[fromCell];
        if (!entry || fromCell === key) return prev;
        delete n[fromCell];
        n[key] = entry; // a moved creature keeps its side; drop overwrites the target
      } else if (id) {
        n[key] = { id, side };
      }
      return n;
    });
  }
  // Press-and-hold on a placed creature opens its gear picker (equipCell =
  // the held cell's key). The hold races the drag: once the touch hook
  // confirms a drag it cancels the hold via onCancelHold, and a fired hold
  // swallows the click that would otherwise clear the cell on release.
  const [equipCell, setEquipCell] = useState(null);
  const [equipSlotSel, setEquipSlotSel] = useState(0);
  const [equipSearch, setEquipSearch] = useState("");
  const holdRef = useRef({ timer: null, fired: false });
  function beginHold(key) {
    holdRef.current.fired = false;
    holdRef.current.timer = setTimeout(() => { holdRef.current.fired = true; setEquipSlotSel(0); setEquipSearch(""); setEquipCell(key); }, 500);
  }
  function cancelHold() { if (holdRef.current.timer) { clearTimeout(holdRef.current.timer); holdRef.current.timer = null; } }
  const touchDrag = useTouchDragPlacement({
    cellSelector: "[data-cell]",
    applyDrop,
    onCancelHold: cancelHold,
    onCancelDrop: (fromCell) => setTestGrid((prev) => { const n = { ...prev }; delete n[fromCell]; return n; }),
  });
  function handleCellDrop(r, c) {
    applyDrop(r, c, { id: dragId, fromCell: dragCell });
    setDragId(null); setDragCell(null);
  }
  function setCellSlot(key, slotIdx, slot) {
    setTestGrid((prev) => {
      const entry = prev[key]; if (!entry) return prev;
      const equipped = [...(entry.equipped || [null, null, null, null])];
      equipped[slotIdx] = slot;
      return { ...prev, [key]: { ...entry, equipped } };
    });
  }
  function setCellSlotLevel(key, slotIdx, lvl) {
    setTestGrid((prev) => {
      const entry = prev[key]; if (!entry || !entry.equipped?.[slotIdx]) return prev;
      const equipped = [...entry.equipped];
      equipped[slotIdx] = { ...equipped[slotIdx], lvl: Math.max(0, Math.min(100, lvl | 0)) };
      return { ...prev, [key]: { ...entry, equipped } };
    });
  }

  // Battle state -- same shape as LabyrinthScreen's.
  const [battling, setBattling] = useState(false);
  const [outcome, setOutcome] = useState(null); // null|"won"|"lost"
  const [bSnap, setBSnap] = useState(null);
  const [atkEffects, setAtkEffects] = useState([]);
  const [battleSelectedUid, setBattleSelectedUid] = useState(null);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const moveAnimRef = useRef(Math.round(500 * 0.84));
  const bRef = useRef(null);
  const tickRef = useRef(null);
  const rafRef = useRef(null);
  const unitDomRefs = useRef(new Map());

  function stopLoops() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }
  useEffect(() => () => stopLoops(), []);

  const playerCount = Object.values(testGrid).filter((p) => p.side === "player").length;
  const enemyCount = Object.values(testGrid).filter((p) => p.side === "enemy").length;

  const list = CREATURES.filter((c) =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (!fType.size || fType.has(c.type)) &&
    (!fRole.size || fRole.has(c.role)) &&
    (!fRange.size || fRange.has(c.attackType)) &&
    (!fRarity.size || fRarity.has(c.rarity)) &&
    (!fOwned || !!owned?.[c.id])
  ).sort((a, b) => ((owned?.[b.id] ? 1 : 0) - (owned?.[a.id] ? 1 : 0)));

  function cellTap(r, c) {
    const key = r + "," + c;
    setTestGrid((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key];
      else if (selectedId) n[key] = { id: selectedId, side };
      return n;
    });
  }

  // RAF render loop, verbatim from the real screens: interpolates each unit's
  // DOM node between its previous and current cell so movement is smooth
  // regardless of the React snapshot cadence.
  function startRenderLoop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    function frame() {
      const s = bRef.current; if (!s) { rafRef.current = null; return; }
      const now = Date.now();
      for (const u of [...s.playerUnits, ...s.enemyUnits]) {
        const refs = unitDomRefs.current.get(u.uid); if (!refs) continue;
        const { el, hpEl } = refs;
        if (u.hp <= 0) { el.style.opacity = "0"; continue; }
        el.style.opacity = "1";
        const t = aEase(Math.min(1, (now - u.lastMoveTime) / moveAnimRef.current));
        el.style.left = ((u.prevCol + (u.col - u.prevCol) * t) * TILE) + "px";
        el.style.top = ((u.prevRow + (u.row - u.prevRow) * t) * TILE) + "px";
        if (hpEl) hpEl.style.width = (Math.max(0, u.hp / u.maxHp) * 100) + "%";
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  function runTick() {
    const s = bRef.current; if (!s) return;
    const { newFx, now } = runBattleTick(s, { gridRows: ROWS, gridCols: COLS });
    if (newFx.length) setAtkEffects((prev) => [...prev.filter((e) => now - e.t < 700), ...newFx]);
    setBSnap({
      playerUnits: s.playerUnits.map((u) => ({ ...u })),
      enemyUnits: s.enemyUnits.map((u) => ({ ...u })),
      damageDealt: { ...s.damageDealt },
    });
    const anyP = s.playerUnits.some((u) => u.hp > 0);
    const anyE = s.enemyUnits.some((u) => u.hp > 0);
    if (!anyE || !anyP) { stopLoops(); setOutcome(!anyE ? "won" : "lost"); }
  }

  /** Per-placement gear: the stat contribution of a cell's 4 equipped items
   * (flat stats + Sigil/Crest/Relic percent bonuses, at the current global
   * item levels), replicating computeCombatStats' equipment layer. Applied
   * additively to the unit AFTER battle creation so duplicates of the same
   * creature can wear different gear -- close enough for a sandbox, though
   * battle-start passives (e.g. Starlit's ATK synergy) multiply pre-gear
   * stats here rather than post-gear like the real per-creature flow. */
  function gearDelta(def, baseOc, equipped) {
    const oc = { ...baseOc, equipped: equipped.map((s) => s && s.id) };
    const base = calcStats(def, oc);
    const flat = { hp: 0, atk: 0, def: 0, spd: 0, abilitySpeed: 0 };
    for (const slot of equipped) {
      if (!slot) continue;
      const b = equipBonus(slot.id, slotLvl(slot), slotAsc(slot));
      for (const stat in b) flat[stat] = (flat[stat] || 0) + b[stat];
    }
    const pcts = equippedStatBonuses(oc);
    const delta = {};
    for (const stat of ["hp", "atk", "def", "spd", "abilitySpeed"]) {
      const pct = pcts.filter((b) => b.stat === stat).reduce((acc, b) => acc + Math.ceil((base[stat] || 0) * (b.pct / 100)), 0);
      delta[stat] = (flat[stat] || 0) + pct;
    }
    return delta;
  }
  function applyGear(unit, def, baseOc, equipped) {
    if (!equipped || !equipped.some(Boolean)) return;
    const d = gearDelta(def, baseOc, equipped);
    const hpBonus = Math.round((d.hp || 0) * 4); // matches state.js's HP_SCALE
    unit.hp += hpBonus; unit.maxHp += hpBonus;
    unit.atk += d.atk || 0; unit.def += d.def || 0;
    unit.spd += d.spd || 0; unit.abilitySpeed += d.abilitySpeed || 0;
  }

  function startFight() {
    stopLoops();
    const playerGrid = {}, enemyGrid = {}, playerKeys = [], enemyKeys = [];
    for (const [key, p] of Object.entries(testGrid)) {
      if (p.side === "player") { playerGrid[key] = p.id; playerKeys.push(key); }
      else { enemyGrid[key] = CREATURE_MAP[p.id]; enemyKeys.push(key); }
    }
    // Player creatures use the real owned record when there is one (levels,
    // gear, fed abilities); unowned ones get a throwaway level-1 record so
    // anything in the dex is placeable. "Max abilities" overrides every
    // player-side kit to 5/5/5 (enemy ability tiers follow Enemy Lv, same as
    // Arena: level/100, so 500 = maxed).
    const ownedForTest = {};
    for (const id of Object.values(playerGrid)) {
      const oc = owned?.[id] || { id, level: 1, ascensions: 0, abilityLevels: { basic: 0, special: 0, unique: 0 } };
      // Strip the record's own equipped list: gear in this sandbox is
      // per-placement (set via press-and-hold), never inherited from the save.
      ownedForTest[id] = { ...(maxAbilities ? { ...oc, abilityLevels: { basic: 5, special: 5, unique: 5 } } : oc), equipped: [] };
    }
    bRef.current = makeArenaBattle(playerGrid, enemyGrid, ownedForTest, 1, moveAnimRef.current, equipmentLevels, equipmentAscensions, null, Math.max(1, enemyLevel | 0));
    // makeArenaBattle assigns uids p0..pN / e0..eN in Object.entries order,
    // which matches playerKeys/enemyKeys -- so index i maps unit -> its cell.
    bRef.current.playerUnits.forEach((u, i) => {
      const entry = testGrid[playerKeys[i]];
      applyGear(u, CREATURE_MAP[u.creatureId], ownedForTest[u.creatureId], entry?.equipped);
    });
    bRef.current.enemyUnits.forEach((u, i) => {
      const entry = testGrid[enemyKeys[i]];
      applyGear(u, CREATURE_MAP[u.creatureId], { level: Math.max(1, enemyLevel | 0), ascensions: 0 }, entry?.equipped);
    });
    setAtkEffects([]);
    setOutcome(null);
    setBattleSelectedUid(null);
    setBSnap({ playerUnits: bRef.current.playerUnits.map((u) => ({ ...u })), enemyUnits: bRef.current.enemyUnits.map((u) => ({ ...u })), damageDealt: {} });
    setBattling(true);
    startRenderLoop();
    tickRef.current = setInterval(runTick, Math.round(500 / speedRef.current));
  }

  function cycleSpeed() {
    const next = speedRef.current === 1 ? 2 : 1;
    speedRef.current = next; moveAnimRef.current = Math.round(500 / next * 0.84);
    setSpeed(next);
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = setInterval(runTick, Math.round(500 / next)); }
  }

  function backToPlanning() { stopLoops(); setBattling(false); setOutcome(null); setBSnap(null); setAtkEffects([]); setBattleSelectedUid(null); }

  const header = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "12px 16px", flexShrink: 0 } },
    React.createElement("button", { onClick: () => { stopLoops(); onBack && onBack(); }, style: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1 } }, "←"),
    React.createElement("div", { style: { fontSize: 16, fontWeight: 700 } }, "🧪 Test Battle"),
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#b45309", background: "#fef3c7", borderRadius: 6, padding: "2px 7px" } }, "DEBUG")
  );

  // ── Battle phase (mirrors LabyrinthScreen's battle presentation) ─────────
  if (battling) {
    const snap = bSnap || { playerUnits: [], enemyUnits: [], damageDealt: {} };
    const allUnits = [...snap.playerUnits, ...snap.enemyUnits];
    const selectedUnit = battleSelectedUid ? allUnits.find((u) => u.uid === battleSelectedUid && u.hp > 0) : null;
    return React.createElement("div", { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5", zIndex: 200 } },
      header,
      React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", padding: "12px", overflow: "hidden", gap: 6 } },
        React.createElement("div", { style: { display: "flex", gap: 8 } },
          React.createElement("button", { onClick: cycleSpeed, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 } }, speed + "x ⚡"),
          React.createElement("button", { onClick: startFight, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#fff", color: "#534AB7", border: "1.5px solid #534AB7", borderRadius: 8, cursor: "pointer" } }, "↺ Restart"),
          React.createElement("button", { onClick: backToPlanning, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#fff", color: "#666", border: "1.5px solid #ccc", borderRadius: 8, cursor: "pointer" } }, "✎ Edit Teams")
        ),
        React.createElement("div", { className: "battle-row", style: { display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 10, width: "100%", maxWidth: "100%", overflowX: "auto", boxSizing: "border-box" } },
          React.createElement("div", { className: "battle-side-panel" }, React.createElement(DamageChart, { damageDealt: snap.damageDealt })),
          React.createElement("div", { className: "battle-grid", style: { width: COLS * TILE, height: ROWS * TILE, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #bbb", position: "relative", flexShrink: 0 } },
            React.createElement("div", { style: { position: "absolute", top: 0, left: 0, display: "grid", gridTemplateColumns: `repeat(${COLS},${TILE}px)`, gridTemplateRows: `repeat(${ROWS},${TILE}px)`, gap: 0 } },
              Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => {
                const BORDER = "1px solid #bbb";
                return React.createElement("div", { key: r + "," + c, style: {
                  width: TILE, height: TILE, boxSizing: "border-box",
                  background: "#fff",
                  borderTop: r === 0 ? "0" : BORDER,
                  borderLeft: c === 0 ? "0" : BORDER, borderRight: "0", borderBottom: "0",
                } });
              })).flat()
            ),
            atkEffects.map((e) => {
              const color = e.isEnemy ? "#ef4444" : "#a78bfa";
              if (e.isHeal) { return React.createElement("div", { key: e.id, style: { position: "absolute", left: e.col * TILE, top: e.row * TILE, width: TILE, height: TILE, borderRadius: "50%", background: "rgba(34,197,94,0.4)", boxShadow: "inset 0 0 8px rgba(22,163,74,0.9)", animation: "splashWave 0.7s ease-out forwards", pointerEvents: "none", zIndex: 21 } }); }
              if (e.isPillar) { return React.createElement("div", { key: e.id, style: { position: "absolute", left: e.col * TILE, top: e.row * TILE, width: TILE, height: TILE, background: "rgba(251,146,60,0.6)", boxShadow: "inset 0 0 8px rgba(239,68,68,0.8)", animation: "pillarFlame 0.7s ease-out forwards", pointerEvents: "none", zIndex: 20 } }); }
              if (e.isRanged) {
                const dRow = e.row - e.fromRow, dCol = e.col - e.fromCol;
                const dist = Math.sqrt(dRow * dRow + dCol * dCol) || 1;
                const dur = Math.round(300 + dist * 50);
                return React.createElement("div", {
                  key: e.id,
                  ref: (el) => { if (!el) return; el.getBoundingClientRect(); el.style.left = (e.col * TILE + TILE / 2) + "px"; el.style.top = (e.row * TILE + TILE / 2) + "px"; el.style.opacity = "0"; },
                  style: { position: "absolute", left: e.fromCol * TILE + TILE / 2, top: e.fromRow * TILE + TILE / 2,
                    width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`,
                    transform: "translate(-50%,-50%)", transition: `left ${dur}ms linear,top ${dur}ms linear,opacity ${dur * 0.3}ms linear ${dur * 0.7}ms`,
                    pointerEvents: "none", zIndex: 20 } });
              }
              return React.createElement(React.Fragment, { key: e.id },
                React.createElement("div", { style: {
                  position: "absolute", left: e.fromCol * TILE + TILE / 2, top: e.fromRow * TILE + TILE / 2,
                  width: TILE * 1.1, height: TILE * 1.1, borderRadius: "50%",
                  background: e.isEnemy ? "rgba(239,68,68,0.35)" : "rgba(99,102,241,0.35)",
                  border: `2px solid ${e.isEnemy ? "#ef4444" : "#6366f1"}`,
                  animation: "meleeSwing 0.4s ease-out forwards", pointerEvents: "none", zIndex: 19, transform: "translate(-50%,-50%)" } }, null),
                React.createElement("div", { style: {
                  position: "absolute", left: e.col * TILE + TILE / 2, top: e.row * TILE + TILE / 2,
                  width: TILE * 0.85, height: TILE * 0.85, borderRadius: "50%", background: color,
                  animation: "atkImpact 0.55s ease-out forwards", pointerEvents: "none", zIndex: 20, transform: "translate(-50%,-50%)" } }, null)
              );
            }),
            allUnits.map((u) => React.createElement("div", {
              key: "u" + u.uid,
              ref: (el) => {
                if (el) { const hpEl = el.querySelector(".hp-fill"); unitDomRefs.current.set(u.uid, { el, hpEl }); el.style.left = (u.col * TILE) + "px"; el.style.top = (u.row * TILE) + "px"; }
                else unitDomRefs.current.delete(u.uid);
              },
              onClick: u.hp > 0 ? () => setBattleSelectedUid(u.uid) : undefined,
              style: { position: "absolute", width: TILE, height: TILE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: u.hp > 0 ? 1 : 0, zIndex: 5, pointerEvents: u.hp > 0 ? "auto" : "none", cursor: u.hp > 0 ? "pointer" : "default" },
            },
              React.createElement("div", { style: { position: "relative", lineHeight: 1 } },
                React.createElement(CreatureIcon, { def: CREATURE_MAP[u.creatureId] || { emoji: "❓" }, size: 20 }),
                (u.burnTicks || 0) > 0 && React.createElement("div", { style: { position: "absolute", top: -4, right: -6, fontSize: 10, lineHeight: 1 } }, "🔥"),
                (u.abilFlashTicks || 0) > 0 && React.createElement("div", { style: { position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 900, color: "#3b82f6", textShadow: "0 0 3px #fff, 0 0 3px #fff", lineHeight: 1, pointerEvents: "none" } }, "!")
              ),
              React.createElement("div", { style: { position: "absolute", bottom: 3, left: 3, right: 3, height: 3, background: "#ddd", borderRadius: 2, overflow: "hidden" } },
                React.createElement("div", { className: "hp-fill", style: { height: "100%", width: (u.hp / u.maxHp * 100) + "%", background: u.uid[0] === "e" ? "#ef4444" : (u.burnTicks || 0) > 0 ? "#f97316" : "#22c55e", borderRadius: 2 } })
              ),
              (u.abilChargeMax || 0) > 0 && React.createElement("div", { style: { position: "absolute", bottom: 0, left: 3, right: 3, height: 2, background: "#dbeafe", borderRadius: 2, overflow: "hidden" } },
                // Snap (no transition) around the fire so the bar visibly hits
                // 100% instead of easing down from wherever the animation was.
                React.createElement("div", { style: { height: "100%", width: (Math.min(1, (u.abilCharge || 0) / u.abilChargeMax) * 100) + "%", background: "#3b82f6", borderRadius: 2, transition: (u.abilFlashTicks || 0) > 0 ? "none" : "width 0.35s linear" } })
              )
            ))
          ),
          React.createElement("div", { className: "battle-side-panel" }, selectedUnit ? React.createElement(UnitInfoPanel, {
            emoji: CREATURE_MAP[selectedUnit.creatureId]?.emoji || "❓",
            image: CREATURE_MAP[selectedUnit.creatureId]?.image,
            name: CREATURE_MAP[selectedUnit.creatureId]?.name || selectedUnit.creatureId,
            subtitle: (selectedUnit.uid[0] === "e" ? "Enemy" : "Ally") + " · Lv. " + (selectedUnit.uid[0] === "e" ? enemyLevel : (owned?.[selectedUnit.creatureId]?.level || 1)),
            hp: selectedUnit.hp, maxHp: selectedUnit.maxHp,
            abilityName: CREATURE_MAP[selectedUnit.creatureId]?.abilities?.special?.name,
            abilCharge: selectedUnit.abilCharge, abilChargeMax: selectedUnit.abilChargeMax, abilFlashTicks: selectedUnit.abilFlashTicks,
            debuffs: debuffsFor(selectedUnit),
            onClose: () => setBattleSelectedUid(null),
          }) : React.createElement("div", { style: { width: 150, flexShrink: 0 } }))
        )
      ),
      outcome && React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.92)", zIndex: 210, gap: 14 } },
        React.createElement("div", { style: { fontSize: 56 } }, outcome === "won" ? "✅" : "💀"),
        React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: outcome === "won" ? "#534AB7" : "#ef4444" } }, outcome === "won" ? "Players Win" : "Enemies Win"),
        React.createElement("div", { style: { display: "flex", gap: 10 } },
          React.createElement("button", { onClick: startFight, style: { padding: "10px 22px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" } }, "↺ Rematch"),
          React.createElement("button", { onClick: backToPlanning, style: { padding: "10px 22px", background: "#fff", color: "#534AB7", border: "1.5px solid #534AB7", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" } }, "✎ Edit Teams")
        )
      )
    );
  }

  // ── Planning phase ───────────────────────────────────────────────────────
  return React.createElement("div", { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5", zIndex: 200 } },
    header,
    React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 } },
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" } },
        React.createElement("div", { style: { display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid #534AB7" } },
          React.createElement("button", { onClick: () => setSide("player"), style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: side === "player" ? "#534AB7" : "#fff", color: side === "player" ? "#fff" : "#534AB7" } }, "Place Player"),
          React.createElement("button", { onClick: () => setSide("enemy"), style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: side === "enemy" ? "#ef4444" : "#fff", color: side === "enemy" ? "#fff" : "#ef4444" } }, "Place Enemy")
        ),
        React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#666", display: "flex", alignItems: "center", gap: 4 } }, "Enemy Lv",
          React.createElement("input", { type: "number", min: 1, max: 500, value: enemyLevel, onChange: (e) => setEnemyLevel(parseInt(e.target.value) || 1), style: { width: 56, padding: "4px 6px", borderRadius: 6, border: "1px solid #ccc", fontSize: 12 } })
        ),
        React.createElement("label", { title: "Default level stamped on newly equipped gear: 0 = the save's real item level, 1-100 = that level. Each slot's level is editable in the gear picker.", style: { fontSize: 12, fontWeight: 600, color: "#666", display: "flex", alignItems: "center", gap: 4 } }, "Gear Lv",
          React.createElement("input", { type: "number", min: 0, max: 100, value: gearLevel, onChange: (e) => setGearLevel(Math.max(0, Math.min(100, parseInt(e.target.value) || 0))), style: { width: 52, padding: "4px 6px", borderRadius: 6, border: "1px solid #ccc", fontSize: 12 } }),
          React.createElement("span", { style: { fontSize: 9, color: "#aaa", fontWeight: 600 } }, gearLevel >= 1 ? "" : "(save)")
        ),
        React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#666", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked: maxAbilities, onChange: (e) => setMaxAbilities(e.target.checked) }), "Max abilities"
        )
      ),
      React.createElement("div", { style: { fontSize: 11, color: "#888", textAlign: "center" } },
        "Tap or drag to place, drag to move, tap to clear — hold a placed creature to equip gear. Duplicates allowed. " + playerCount + " player / " + enemyCount + " enemy placed."
      ),
      React.createElement("div", { style: { width: COLS * TILE, height: ROWS * TILE, borderRadius: 12, overflow: "hidden", border: "1px solid #bbb", position: "relative", background: "#fff", flexShrink: 0 } },
        Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => {
          const key = r + "," + c;
          const p = testGrid[key];
          const def = p && CREATURE_MAP[p.id];
          const gearCount = p && p.equipped ? p.equipped.filter(Boolean).length : 0;
          return React.createElement("div", {
            key, "data-cell": key,
            onClick: () => { if (holdRef.current.fired) { holdRef.current.fired = false; return; } cellTap(r, c); },
            draggable: !!p,
            onDragStart: p ? (e) => { cancelHold(); e.dataTransfer.effectAllowed = "move"; setDragCell(key); setDragId(null); } : undefined,
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => { e.preventDefault(); handleCellDrop(r, c); },
            onMouseDown: p ? () => beginHold(key) : undefined,
            onMouseUp: cancelHold,
            onMouseLeave: cancelHold,
            onTouchStart: p ? (e) => { e.preventDefault(); beginHold(key); touchDrag.start(e, { fromCell: key, cellId: p.id }); } : undefined,
            onTouchEnd: cancelHold,
            style: { position: "absolute", left: c * TILE, top: r * TILE, width: TILE, height: TILE, borderTop: r === 0 ? "0" : "1px solid #e5e5e5", borderLeft: c === 0 ? "0" : "1px solid #e5e5e5", boxSizing: "border-box", cursor: p ? "grab" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", background: p ? (p.side === "player" ? "rgba(83,74,183,0.12)" : "rgba(239,68,68,0.12)") : "transparent" }
          },
            def && React.createElement("div", { style: { position: "relative", lineHeight: 1, pointerEvents: "none" } },
              React.createElement(CreatureIcon, { def, size: 22 }),
              React.createElement("div", { style: { position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 14, height: 3, borderRadius: 2, background: p.side === "player" ? "#534AB7" : "#ef4444" } }),
              gearCount > 0 && React.createElement("div", { style: { position: "absolute", top: -7, right: -9, fontSize: 8, fontWeight: 800, color: "#fff", background: "#f59e0b", borderRadius: 7, padding: "1px 4px", lineHeight: 1.3 } }, "🔧" + gearCount)
            )
          );
        })).flat()
      ),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { onClick: startFight, disabled: !playerCount || !enemyCount, style: { padding: "10px 26px", fontSize: 14, fontWeight: 800, background: (playerCount && enemyCount) ? "#534AB7" : "#ccc", color: "#fff", border: "none", borderRadius: 10, cursor: (playerCount && enemyCount) ? "pointer" : "default" } }, "▶ Play"),
        React.createElement("button", { onClick: () => setTestGrid({}), disabled: !playerCount && !enemyCount, style: { padding: "10px 16px", fontSize: 13, fontWeight: 700, background: "#fff", color: (playerCount || enemyCount) ? "#534AB7" : "#ccc", border: "1.5px solid " + ((playerCount || enemyCount) ? "#534AB7" : "#ccc"), borderRadius: 10, cursor: "pointer" } }, "🗑 Clear")
      ),
      React.createElement("input", { placeholder: "Search creatures…", value: search, onChange: (e) => setSearch(e.target.value), style: { width: "100%", maxWidth: COLS * TILE, padding: "7px 10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" } }),
      // Roster filters: type / role / range / rarity chips + owned toggle.
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 480 } },
        Object.entries(TYPE_EMOJI).map(([t, em]) => React.createElement("button", { key: "t" + t, title: t, className: "filter-chip" + (fType.has(t) ? " active" : ""), onClick: () => toggleIn(setFType)(t) }, em)),
        Object.keys(ROLE_CONFIG).map((r) => React.createElement("button", { key: "r" + r, className: "filter-chip" + (fRole.has(r) ? " active" : ""), onClick: () => toggleIn(setFRole)(r) }, ROLE_CONFIG[r].emoji + " " + r)),
        ["Melee", "Ranged"].map((r) => React.createElement("button", { key: "g" + r, className: "filter-chip" + (fRange.has(r) ? " active" : ""), onClick: () => toggleIn(setFRange)(r) }, ATTACK_TYPE_CONFIG[r].emoji + " " + r)),
        [...new Set(CREATURES.map((c) => c.rarity))].map((r) => React.createElement("button", { key: "y" + r, className: "filter-chip" + (fRarity.has(r) ? " active" : ""), onClick: () => toggleIn(setFRarity)(r) }, r[0].toUpperCase() + r.slice(1))),
        React.createElement("button", { className: "filter-chip" + (fOwned ? " active" : ""), onClick: () => setFOwned((p) => !p) }, "★ Owned")
      ),
      React.createElement("div", { style: { fontSize: 10, color: "#aaa" } }, list.length + " creatures — tap to select, or drag straight onto the grid"),
      React.createElement("div", {
        style: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 480, paddingBottom: 20 },
        // Dropping a grid creature onto the roster area removes it, matching
        // the real planning screens' "drop outside the grid unequips" behavior.
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => { e.preventDefault(); if (dragCell) { setTestGrid((prev) => { const n = { ...prev }; delete n[dragCell]; return n; }); } setDragId(null); setDragCell(null); },
      },
        list.map((c) => React.createElement("div", {
          key: c.id,
          onClick: () => setSelectedId(c.id === selectedId ? null : c.id),
          draggable: true,
          onDragStart: (e) => { e.dataTransfer.effectAllowed = "move"; setDragId(c.id); setDragCell(null); },
          onTouchStart: (e) => { e.preventDefault(); touchDrag.start(e, { id: c.id }); },
          style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 64, padding: "6px 2px", borderRadius: 10, cursor: "grab", userSelect: "none", background: selectedId === c.id ? "#EEEDFE" : "#fff", border: "2px solid " + (selectedId === c.id ? "#534AB7" : "#eee") }
        },
          React.createElement(CreatureIcon, { def: c, size: 24 }),
          React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: "#333", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", pointerEvents: "none" } }, (TYPE_EMOJI[c.type] || "") + " " + c.name)
        ))
      )
    ),
    touchDrag.ghost && (() => { const gdef = CREATURE_MAP[touchDrag.ghost.id]; if (!gdef) return null; return React.createElement("div", { style: { position: "fixed", left: touchDrag.ghost.x - 26, top: touchDrag.ghost.y - 29, width: 52, height: 52, pointerEvents: "none", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" } }, React.createElement(CreatureIcon, { def: gdef, size: 36 })); })(),
    // Gear picker for the held placement: 4 slots, every item unlocked for
    // testing (stats shown at the current global item levels).
    equipCell && testGrid[equipCell] && (() => {
      const entry = testGrid[equipCell];
      const def = CREATURE_MAP[entry.id];
      const equipped = entry.equipped || [null, null, null, null];
      const items = EQUIPMENT_DEFS.filter((it) => !equipSearch || it.name.toLowerCase().includes(equipSearch.toLowerCase()));
      return React.createElement("div", { onClick: () => setEquipCell(null), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 } },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: "#fff", borderRadius: 16, padding: "16px", width: "min(92vw, 380px)", maxHeight: "82vh", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 8px 40px rgba(0,0,0,0.25)" } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement(CreatureIcon, { def, size: 26 }),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111" } }, def.name + " — Gear"),
              React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: entry.side === "player" ? "#534AB7" : "#ef4444" } }, entry.side === "player" ? "Player side" : "Enemy side")
            ),
            React.createElement("button", { onClick: () => setEquipCell(null), style: { background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" } }, "Done")
          ),
          React.createElement("div", { style: { display: "flex", gap: 6, justifyContent: "center", alignItems: "flex-start" } },
            equipped.map((slot, i) => {
              const it = slot && EQUIPMENT_DEFS.find((d) => d.id === slot.id);
              const rarCfg = it && EQUIP_RARITY_CONFIG[it.rarity];
              return React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 } },
                React.createElement("div", {
                  onClick: () => { if (equipSlotSel === i && slot) setCellSlot(equipCell, i, null); else setEquipSlotSel(i); },
                  title: it ? it.name : "Empty slot",
                  style: { width: 54, height: 54, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", background: it ? (rarCfg ? rarCfg.bg : "#f5f5f5") : "#f5f5f5", border: "2.5px solid " + (equipSlotSel === i ? "#534AB7" : it && rarCfg ? rarCfg.color + "66" : "#e0e0e0"), boxSizing: "border-box", userSelect: "none" }
                },
                  React.createElement("div", { style: { fontSize: 20, lineHeight: 1 } }, it ? it.emoji : "＋"),
                  React.createElement("div", { style: { fontSize: 7, fontWeight: 700, color: "#888" } }, it ? "tap ×" : "Slot " + (i + 1))
                ),
                // Per-slot level: 0 = the save's real level for this item.
                it && React.createElement("input", {
                  type: "number", min: 0, max: 100, value: slot.lvl || 0,
                  title: "0 = save level (Lv " + (equipmentLevels?.[slot.id] || 1) + ")",
                  onClick: (e) => e.stopPropagation(),
                  onChange: (e) => setCellSlotLevel(equipCell, i, parseInt(e.target.value) || 0),
                  style: { width: 50, padding: "2px 4px", borderRadius: 6, border: "1px solid #ccc", fontSize: 10, textAlign: "center", boxSizing: "border-box" }
                }),
                it && React.createElement("div", { style: { fontSize: 8, color: "#aaa", fontWeight: 600 } }, (slot.lvl || 0) >= 1 ? "Lv " + slotLvl(slot) : "save Lv" + slotLvl(slot))
              );
            })
          ),
          React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } },
            React.createElement("input", { placeholder: "Search gear…", value: equipSearch, onChange: (e) => setEquipSearch(e.target.value), style: { flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 12 } }),
            React.createElement("label", { title: "Default level stamped on newly equipped gear: 0 = the save's real item level, 1-100 = that level. Each slot's level is editable in the gear picker.", style: { fontSize: 11, fontWeight: 600, color: "#666", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 } }, "Lv",
              React.createElement("input", { type: "number", min: 0, max: 100, value: gearLevel, onChange: (e) => setGearLevel(Math.max(0, Math.min(100, parseInt(e.target.value) || 0))), style: { width: 48, padding: "4px 6px", borderRadius: 6, border: "1px solid #ccc", fontSize: 11 } }),
              React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, gearLevel >= 1 ? "" : "(save)")
            )
          ),
          React.createElement("div", { style: { overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 } },
            items.map((it) => {
              const rarCfg = EQUIP_RARITY_CONFIG[it.rarity];
              const preview = { id: it.id, lvl: gearLevel };
              const lvl = slotLvl(preview);
              const bonuses = equipBonus(it.id, lvl, slotAsc(preview));
              return React.createElement("div", {
                key: it.id,
                onClick: () => {
                  setCellSlot(equipCell, equipSlotSel, { id: it.id, lvl: gearLevel });
                  const nextEmpty = equipped.findIndex((s, j) => j !== equipSlotSel && !s);
                  if (nextEmpty >= 0) setEquipSlotSel(nextEmpty);
                },
                style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, cursor: "pointer", background: rarCfg ? rarCfg.bg : "#f5f5f5", border: "1px solid " + (rarCfg ? rarCfg.color + "44" : "#eee"), userSelect: "none" }
              },
                React.createElement("div", { style: { fontSize: 18, flexShrink: 0 } }, it.emoji),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#111" } }, it.name + "  ·  Lv " + lvl),
                  React.createElement("div", { style: { fontSize: 10, color: "#666" } }, equipBonusStr(bonuses)),
                  it.effect && React.createElement("div", { style: { fontSize: 9, color: "#7F77DD", fontWeight: 600 } }, "✦ " + it.effect)
                ),
                React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: rarCfg ? rarCfg.color : "#888", flexShrink: 0 } }, rarCfg ? rarCfg.label : it.rarity)
              );
            })
          )
        )
      );
    })()
  );
}

export default TestBattleScreen;
