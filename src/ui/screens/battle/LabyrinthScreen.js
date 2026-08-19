// Labyrinth: an endless run of symmetric minion-vs-minion fights. Depth climbs
// by one on every win (never resets on loss); enemy composition and stats scale
// with depth. Structurally mirrors ArenaScreen.js (same planning/battle flow,
// same grid + drag/hold mechanics) but with a single unbounded track instead of
// per-type tiers of 10 fixed stages.

import React, { useState } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../../data/creatures.js";
import { TYPE_EMOJI } from "../../../data/types.js";
import { applyRewards } from "../../../core/rewards.js";
import { ARENA_GRID_COLS, ARENA_GRID_ROWS, ARENA_PLAYER_START_ROW, ARENA_TILE, ARENA_MAX_DEPLOYED } from "../../../battle/constants.js";
import { aEase } from "../../../battle/geometry.js";
import { makeArenaBattle } from "../../../battle/state.js";
import { runBattleTick } from "../../../battle/tick.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import UnitInfoPanel, { debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import { LABYRINTH_REWARD_DISPLAY as REWARD_DISPLAY, getDepthReward, MAX_LABYRINTH_DEPTH, getEnemyLevelForDepth, getEnemyEvolutionMixForDepth, getDifficultyMultipliers } from "../../../core/labyrinth.js";
import { MAX_ABILITY_LEVEL } from "../../../core/creatures.js";
import { getAbilityTags } from "../../../core/abilityText.js";
import { AbilityTagPills, AbilityTagPopup } from "../../../ui/components/AbilityTagPills.js";
import useTouchDragPlacement from "../../../ui/hooks/useTouchDragPlacement.js";

function seedFor(depth) {
  return (depth * 2654435761) >>> 0;
}

/** Deterministic enemy pool for a depth: any-type creatures, with the mix of
 * base/mid/final evolution forms shifting per getEnemyEvolutionMixForDepth. */
function getEnemiesForDepth(depth) {
  const firstEvos = CREATURES.filter((c) => !c.evolutionOf);
  const midEvos = CREATURES.filter((c) => c.evolutionOf && c.evolutionId);
  const finalEvos = CREATURES.filter((c) => c.evolutionOf && !c.evolutionId);
  if (!firstEvos.length) return [];
  const seed = seedFor(depth);
  const { base: nBase, mid: nMid, final: nFinal } = getEnemyEvolutionMixForDepth(depth);
  const enemies = [];
  for (let i = 0; i < nFinal && finalEvos.length; i++) enemies.push(finalEvos[Math.abs(seed + i * 29) % finalEvos.length]);
  for (let i = 0; i < nMid && midEvos.length; i++) enemies.push(midEvos[Math.abs(seed + i * 19) % midEvos.length]);
  for (let i = enemies.length; i < 6; i++) enemies.push(firstEvos[Math.abs(seed + i * 13) % firstEvos.length]);
  return enemies;
}

// ── Labyrinth Boss creatures ─────────────────────────────────────────────
// Every 10th floor, one predetermined enemy is a Boss creature: a 2x2 body
// with +25% to every stat, Speed and Haste included (see makeArenaBattle's
// __giant handling). The rotations are curated for variety -- consecutive
// boss floors differ in type, role, AND range -- and the evolution stage
// tracks the floor's normal enemy mix (base forms early, finals late).
const LAB_BOSS_ROTATION_BASE = ["pebbit", "voltail", "bloomphoenix", "blazehornet", "coralleviathan", "voidspider", "sacredwasp", "shockcrab", "squallhawk", "morusk"];
const LAB_BOSS_ROTATION_MID = ["infernohive", "tidecrush", "galebeak", "jadekrab", "divinedrone", "shadowspider", "voltcrusher", "deepdrake", "spectrumcrab", "steelmole"];
const LAB_BOSS_ROTATION_FINAL = ["gemtitan", "arcstorm", "lifephoenix", "infernoswarm", "tidelord", "abyssspider", "holyswarm", "galvaniccrab", "strikewing", "ivormar"];

/** The predetermined Boss creature for a depth, or null off boss floors. */
function getLabyrinthBossForDepth(depth) {
  if (depth % 10 !== 0 || depth < 10) return null;
  const mix = getEnemyEvolutionMixForDepth(depth);
  const rot = mix.final > 0 ? LAB_BOSS_ROTATION_FINAL : mix.mid > 0 ? LAB_BOSS_ROTATION_MID : LAB_BOSS_ROTATION_BASE;
  return CREATURE_MAP[rot[(depth / 10 - 1) % rot.length]] || null;
}

function getEnemyLayoutForDepth(depth) {
  // Floor 1 is hand-placed: 2 fixed enemies (Duskling + Sparkit) instead of
  // the usual seeded 6-enemy roster (see FLOOR_1_DIFFICULTY in
  // core/labyrinth.js for the matching stat tuning -- both were calibrated
  // together).
  if (depth === 1) {
    const duskling = CREATURE_MAP["shadowpup"];
    const sparkit = CREATURE_MAP["sparkpup"];
    const layout = {};
    if (duskling) layout["1,1"] = duskling;
    if (sparkit) layout["1,3"] = sparkit;
    return layout;
  }
  let enemies = getEnemiesForDepth(depth);
  if (!enemies.length) return {};
  const baseSeed = seedFor(depth);
  const COLS = ARENA_GRID_COLS;
  const grid = {}; const used = new Set();
  // Boss floors: the Boss creature claims a 2x2 block first (its cells are
  // marked used, so regular enemies place around it -- never overlapping),
  // and one regular enemy slot is dropped to make room.
  const bossDef = getLabyrinthBossForDepth(depth);
  if (bossDef) {
    enemies = enemies.slice(0, 5);
    const anchorCol = ((baseSeed >>> 4) % (COLS - 1));
    grid["0," + anchorCol] = { ...bossDef, __giant: true };
    for (const [r, c] of [[0, anchorCol], [0, anchorCol + 1], [1, anchorCol], [1, anchorCol + 1]]) used.add(r + "," + c);
  }
  const ranged = enemies.filter((c) => c.attackType === "Ranged");
  const melee = enemies.filter((c) => c.attackType !== "Ranged");
  function seedCol(n) { return ((baseSeed * 1664525 + n * 1013904223) >>> 0) % COLS; }
  function place(creature, rows, idx) {
    const startCol = seedCol(idx * 7 + rows[0] * 3);
    for (const row of rows) for (let dc = 0; dc < COLS; dc++) { const col = (startCol + dc) % COLS, key = row + "," + col; if (!used.has(key)) { grid[key] = creature; used.add(key); return; } }
  }
  ranged.forEach((c, i) => place(c, i % 2 === 0 ? [0, 1] : [1, 0], i));
  melee.forEach((c, i) => place(c, i % 2 === 0 ? [2, 1] : [1, 2], i + 10));
  return grid;
}

/** Planning-grid view of a layout, with the Boss's other 3 cells filled in so
 * pressing anywhere on its 2x2 body opens its info panel. Display only --
 * makeArenaBattle still gets one grid entry per unit, so the footprint cells
 * are flagged and skipped when drawing (the anchor draws the whole body). */
function withBossFootprint(grid) {
  const out = { ...grid };
  for (const [key, d] of Object.entries(grid)) {
    if (!d || !d.__giant) continue;
    const [r, c] = key.split(",").map(Number);
    for (const [rr, cc] of [[r, c + 1], [r + 1, c], [r + 1, c + 1]]) {
      const k = rr + "," + cc;
      if (!out[k]) out[k] = { ...d, __giantFootprint: true };
    }
  }
  return out;
}

function LabyrinthScreen({ onBack, onFight, onViewCreature }) {
  const { equipmentLevels, equipmentAscensions, labyrinthDepth, setLabyrinthDepth, setLabyrinthBestDepth, labyrinthFloor10WarningSeen, setLabyrinthFloor10WarningSeen, setCurrencies, owned, tutorialRestricted, tutorialStep, setTutorialRestricted, setTutorialStep, setPostTutorialPopupPending, setTab, labyrinthPlanGrid: planGrid, setLabyrinthPlanGrid: setPlanGrid } = useGame();
  const depth = Math.min(labyrinthDepth || 1, MAX_LABYRINTH_DEPTH);
  const level = getEnemyLevelForDepth(depth);
  // Enemies always fight with a maxed kit (see makeArenaBattle), so the panel
  // shows the last upgrade tier.
  const enemyAbilityLevel = MAX_ABILITY_LEVEL;
  const [battling, setBattling] = useState(false);
  const [battleOutcome, setBattleOutcome] = useState(null); // null|"won"|"lost"
  const [bSnap, setBSnap] = useState(null);
  const [atkEffects, setAtkEffects] = useState([]);
  const [battleSelectedUid, setBattleSelectedUid] = useState(null);
  const _spd = Math.min(2, parseInt(localStorage.getItem("battleSpeed") || "1") || 1);
  const speedRef = React.useRef(_spd);
  const moveAnimRef = React.useRef(Math.round(500 / _spd * 0.84));
  const [battleSpeed, setBattleSpeed] = useState(_spd);
  const bRef = React.useRef(null);
  const tickRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const battleStartRef = React.useRef(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const unitDomRefs = React.useRef(new Map());
  const wonDepthRef = React.useRef(1);
  const [continueSeconds, setContinueSeconds] = useState(3);
  const continueTimerRef = React.useRef(null);
  const [dragId, setDragId] = useState(null);
  const [dragCell, setDragCell] = useState(null);
  const [enemyInfo, setEnemyInfo] = useState(null); // { id, boss } | null
  const [bossInfoOpen, setBossInfoOpen] = useState(false);
  const [floor10Warning, setFloor10Warning] = useState(false);
  const [labAbilityTagPopup, setLabAbilityTagPopup] = useState(null);
  const [enemyMinimized, setEnemyMinimized] = useState(false);
  const [gridInfoCreature, setGridInfoCreature] = useState(null);
  const [allyMinimized, setAllyMinimized] = useState(false);
  const rightPanelRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (!rightPanelRef.current) return;
    if (gridInfoCreature) {
      setAllyMinimized(false);
      const el = rightPanelRef.current;
      if (el.scrollHeight > el.clientHeight + 4) setEnemyMinimized(true);
    } else {
      setEnemyMinimized(false);
      setAllyMinimized(false);
    }
  }, [gridInfoCreature]);
  // Whichever panel the player just expanded wins the space; if the two together
  // don't fit, the OTHER panel auto-minimizes to make room.
  function expandPanel(which) {
    requestAnimationFrame(() => {
      const el = rightPanelRef.current; if (!el) return;
      if (el.scrollHeight > el.clientHeight + 4) {
        if (which === "enemy") setAllyMinimized(true); else setEnemyMinimized(true);
      }
    });
  }
  const [holdId, setHoldId] = useState(null);
  const [holdPct, setHoldPct] = useState(0);
  const hs = React.useRef({ delay: null, raf: null, id: null, fired: false });
  const ghs = React.useRef({ timer: null, fired: false });
  const creatureListRef = React.useRef(null);
  const dragScroll = React.useRef({ armed: false, on: false, x: 0, y: 0, sl: 0, intentScroll: false });
  const HOLD_DELAY = 350, HOLD_MS = 700;
  const ownedList = Object.values(owned || {}).sort((a, b) => (b.level || 1) - (a.level || 1)).filter((o) => o && CREATURE_MAP[o.id]);
  const placedIds = new Set(Object.values(planGrid));

  function onListMouseDown(e) { dragScroll.current = { armed: true, on: false, x: e.pageX, y: e.pageY, sl: creatureListRef.current.scrollLeft, intentScroll: false }; }
  function onListMouseMove(e) {
    const ds = dragScroll.current; if (!ds.armed) return;
    const dx = e.pageX - ds.x, dy = e.pageY - ds.y;
    if (!ds.on) {
      // Horizontal drag on the row = scroll intent; vertical drag = the user is
      // lifting a creature toward the grid above, so hand off to native DnD untouched.
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { ds.on = true; ds.intentScroll = true; endHold(); }
      else if (Math.abs(dy) > 6) { ds.armed = false; return; }
      else return;
    }
    creatureListRef.current.scrollLeft = ds.sl - dx;
    e.preventDefault();
  }
  function onListMouseUp() { dragScroll.current = { armed: false, on: false, x: 0, y: 0, sl: 0, intentScroll: false }; }
  function beginHold(creatureId) {
    endHold();
    hs.current.fired = false;
    hs.current.delay = setTimeout(() => {
      hs.current.delay = null; hs.current.id = creatureId; setHoldId(creatureId);
      const t0 = Date.now();
      function tick() {
        const pct = Math.min(100, (Date.now() - t0) / HOLD_MS * 100);
        setHoldPct(pct);
        if (pct < 100) { hs.current.raf = requestAnimationFrame(tick); }
        else { hs.current.fired = true; hs.current.id = null; setTimeout(() => { setHoldId(null); setHoldPct(0); onViewCreature && onViewCreature(creatureId); }, 120); }
      }
      hs.current.raf = requestAnimationFrame(tick);
    }, HOLD_DELAY);
  }
  function endHold() {
    if (hs.current.delay) { clearTimeout(hs.current.delay); hs.current.delay = null; }
    if (hs.current.raf) { cancelAnimationFrame(hs.current.raf); hs.current.raf = null; }
    hs.current.id = null; hs.current.fired = false; setHoldId(null); setHoldPct(0);
  }

  function autoDeploy() {
    const scored = Object.values(owned || {}).map((oc) => {
      const def = CREATURE_MAP[oc.id];
      if (!def) return null;
      return { id: oc.id, score: (oc.level || 1), attackType: def.attackType };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const melees = scored.filter((c) => c.attackType === "Melee");
    const ranged = scored.filter((c) => c.attackType === "Ranged");
    const half = Math.floor(ARENA_MAX_DEPLOYED / 2);
    const meleePick = Math.min(melees.length, half + Math.max(0, half - ranged.length));
    const rangedPick = Math.min(ranged.length, ARENA_MAX_DEPLOYED - meleePick);
    const grid = {};
    melees.slice(0, meleePick).forEach((s, i) => { if (i < ARENA_GRID_COLS) grid[ARENA_PLAYER_START_ROW + "," + i] = s.id; });
    ranged.slice(0, rangedPick).forEach((s, i) => { if (i < ARENA_GRID_COLS) grid[(ARENA_GRID_ROWS - 1) + "," + i] = s.id; });
    setPlanGrid(grid);
  }

  function applyDrop(r, c, { id, fromCell }) {
    const key = r + "," + c;
    if (fromCell && fromCell !== key) {
      const cid = planGrid[fromCell];
      setPlanGrid((p) => { const n = { ...p }; delete n[fromCell]; if (cid) n[key] = cid; return n; });
    } else if (id) {
      if (!placedIds.has(id) && Object.keys(planGrid).length < ARENA_MAX_DEPLOYED) {
        setPlanGrid((p) => ({ ...p, [key]: id }));
      }
    }
  }
  function handleCellDrop(r, c) {
    applyDrop(r, c, { id: dragId, fromCell: dragCell });
    setDragId(null); setDragCell(null);
  }
  const touchDrag = useTouchDragPlacement({
    cellSelector: "[data-cell]",
    applyDrop,
    onCancelHold: () => { endHold(); if (ghs.current.timer) { clearTimeout(ghs.current.timer); ghs.current.timer = null; } },
    onCancelDrop: (fromCell) => setPlanGrid((p) => { const n = { ...p }; delete n[fromCell]; return n; }),
  });

  function stopLoops() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }
  function initBattle(playerGrid, enemyGrid) {
    return makeArenaBattle(playerGrid, enemyGrid, owned, level, moveAnimRef.current, equipmentLevels, equipmentAscensions, getDifficultyMultipliers(depth));
  }
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
        el.style.left = ((u.prevCol + (u.col - u.prevCol) * t) * ARENA_TILE) + "px";
        el.style.top = ((u.prevRow + (u.row - u.prevRow) * t) * ARENA_TILE) + "px";
        if (hpEl) hpEl.style.width = (Math.max(0, u.hp / u.maxHp) * 100) + "%";
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
  }
  function runTick() {
    const s = bRef.current; if (!s) return;
    // Same engine as Dungeon/Daily Boss -- player abilities, statuses, and
    // targeting behave identically everywhere; the Labyrinth just has no boss
    // unit (s.boss is undefined, which the engine treats as "no boss").
    const { newFx, now } = runBattleTick(s, { gridRows: ARENA_GRID_ROWS, gridCols: ARENA_GRID_COLS });
    if (newFx.length) setAtkEffects((prev) => [...prev.filter((e) => now - e.t < 700), ...newFx]);
    setBSnap({
      playerUnits: s.playerUnits.map((u) => ({ ...u })),
      enemyUnits: s.enemyUnits.map((u) => ({ ...u })),
      damageDealt: { ...s.damageDealt },
    });
    const gameElapsed = (Date.now() - battleStartRef.current) * speedRef.current;
    const tl = Math.min(60, Math.ceil(Math.max(0, 60000 - gameElapsed) / 1000));
    setTimeLeft(tl);
    if (tl <= 0) { stopLoops(); onFight && onFight(); setTimeout(() => setBattleOutcome("lost"), 600); return; }
    const anyP = s.playerUnits.some((u) => u.hp > 0);
    const anyE = s.enemyUnits.some((u) => u.hp > 0);
    if (!anyE) {
      stopLoops();
      wonDepthRef.current = depth;
      const reward = getDepthReward(depth);
      applyRewards(setCurrencies, reward);
      onFight && onFight();
      // The tutorial's last scripted beat -- winning is the actual finish
      // line (not just attempting the fight), so the restriction lifts here.
      if (tutorialStep === "labyrinth") { setTutorialRestricted(false); setTutorialStep(null); setPostTutorialPopupPending(true); }
      setTimeout(() => {
        setLabyrinthDepth((d) => Math.min(MAX_LABYRINTH_DEPTH, (d || 1) + 1));
        setLabyrinthBestDepth((b) => Math.min(MAX_LABYRINTH_DEPTH, Math.max(b || 1, (depth || 1) + 1)));
        setBattleOutcome("won");
      }, 1200);
    } else if (!anyP) {
      stopLoops();
      onFight && onFight();
      setTimeout(() => setBattleOutcome("lost"), 600);
    }
  }
  // Floor 10 is the first Boss floor: the very first time the player reaches
  // its planning phase, a one-shot warning text box appears above the roster
  // (see labyrinthFloor10WarningSeen in GameContext). It doesn't block
  // anything -- tapping it (or just starting the fight) clears it for good.
  function needsFloor10Warning() {
    return depth === 10 && !labyrinthFloor10WarningSeen;
  }
  function dismissFloor10Warning() {
    setFloor10Warning(false);
    setLabyrinthFloor10WarningSeen(true);
  }
  React.useEffect(() => {
    if (!battling && !battleOutcome && needsFloor10Warning()) setFloor10Warning(true);
  }, [depth, battling, battleOutcome, labyrinthFloor10WarningSeen]);
  function fight() {
    if (depth >= MAX_LABYRINTH_DEPTH) return;
    if (floor10Warning) dismissFloor10Warning();
    stopLoops();
    const enemyGrid = getEnemyLayoutForDepth(depth);
    setBattling(true);
    setBattleOutcome(null);
    setBSnap(null);
    setAtkEffects([]);
    setBattleSelectedUid(null);
    setTimeLeft(60); battleStartRef.current = Date.now();
    bRef.current = initBattle(planGrid, enemyGrid);
    startRenderLoop();
    tickRef.current = setInterval(runTick, Math.round(500 / speedRef.current));
  }
  function cycleSpeed() {
    const next = battleSpeed === 1 ? 2 : 1;
    speedRef.current = next; moveAnimRef.current = Math.round(500 / next * 0.84);
    localStorage.setItem("battleSpeed", next); setBattleSpeed(next);
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = setInterval(runTick, Math.round(500 / next)); }
  }
  function clearContinueTimer() {
    if (continueTimerRef.current) { clearInterval(continueTimerRef.current); continueTimerRef.current = null; }
  }
  function continueToNextFight() {
    clearContinueTimer();
    if (depth >= MAX_LABYRINTH_DEPTH) { exitToPlanning(); return; }
    // Auto-continuing out of floor 9 must still stop for the floor 10 warning:
    // drop back to planning (where the effect above raises the text box)
    // instead of jumping straight into the Boss fight.
    if (needsFloor10Warning()) { exitToPlanning(); return; }
    fight();
  }
  function exitToPlanning() {
    clearContinueTimer();
    // Deliberately NOT clearing planGrid: the last team stays on the grid as
    // the default for the next floor (it's part of the autosave, so it also
    // survives closing the app). "Clear All" is the explicit way to empty it.
    setBattling(false); setBattleOutcome(null); setBSnap(null); setAtkEffects([]); setBattleSelectedUid(null);
  }
  React.useEffect(() => {
    // Floor 1's victory screen is exit-only (see the render below) -- no
    // point running the auto-continue countdown toward a button that isn't
    // there.
    if (battleOutcome !== "won" || wonDepthRef.current === 1) return;
    setContinueSeconds(3);
    continueTimerRef.current = setInterval(() => {
      setContinueSeconds((s) => {
        if (s <= 1) {
          clearContinueTimer();
          continueToNextFight();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clearContinueTimer;
  }, [battleOutcome]);
  React.useEffect(() => () => { stopLoops(); clearContinueTimer(); }, []);

  const abilityLabels = { basic: "Basic", special: "Special", unique: "Unique" };

  if (battleOutcome) {
    const won = battleOutcome === "won";
    const reward = getDepthReward(wonDepthRef.current);
    return React.createElement("div", { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", zIndex: 210, padding: 24, textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 64, marginBottom: 12 } }, won ? "✅" : "💀"),
      React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: won ? "#534AB7" : "#ef4444", marginBottom: won ? 20 : 4 } }, won ? "Floor " + wonDepthRef.current + " Complete" : "Defeat!"),
      won && React.createElement("div", { style: { marginBottom: 20, minHeight: 55, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 } },
        Object.keys(reward).length > 0 && React.createElement(React.Fragment, null,
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1 } }, "Reward"),
          Object.entries(reward).map(([k, v]) => {
            const d = REWARD_DISPLAY[k] || ["🎁", k, k];
            return React.createElement("div", { key: k, style: { fontSize: 16, fontWeight: 700, color: "#534AB7" } }, d[0] + " " + v + " " + (v === 1 ? d[1] : d[2]));
          })
        )
      ),
      won
        ? (wonDepthRef.current === 1
            ? React.createElement("button", { onClick: () => { exitToPlanning(); onBack && onBack(); setTab("home"); }, style: { padding: "12px 36px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Exit")
            // Floor 10's first Ancient Fertilizer is also exit-only, same as
            // floor 1 -- Continuing straight into floor 11 would blow past
            // the Farm hand-off this reward is meant to trigger (see the
            // "fertilizerReveal" restricted-tutorial flow in App.js/
            // NavBar.js/FarmScreen.js, which teaches the Field's Upgrade
            // button using the fertilizer just won).
            : wonDepthRef.current === 10
            ? React.createElement("button", { onClick: () => { exitToPlanning(); onBack && onBack(); setTab("home"); setTutorialRestricted(true); setTutorialStep("fertilizerReveal"); }, style: { padding: "12px 36px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Exit")
            : React.createElement("div", { style: { display: "flex", gap: 10 } },
                React.createElement("button", { onClick: exitToPlanning, style: { padding: "12px 28px", background: "#eee", color: "#444", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Exit"),
                React.createElement("button", { onClick: continueToNextFight, style: { padding: "12px 28px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Continue (" + continueSeconds + ")")
              ))
        : React.createElement("button", { onClick: exitToPlanning, style: { padding: "12px 36px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Continue")
    );
  }
  if (battling) {
    const snap = bSnap || { playerUnits: [], enemyUnits: [], damageDealt: {} };
    const allUnits = [...snap.playerUnits, ...snap.enemyUnits];
    const selectedUnit = battleSelectedUid ? allUnits.find((u) => u.uid === battleSelectedUid) : null;
    return React.createElement("div", { style: { position: "fixed", inset: 0, background: "#f5f5f5", display: "flex", flexDirection: "column" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "16px 16px 12px", gap: 10, background: "#fff", borderBottom: "1px solid #e0e0e0", flexShrink: 0 } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#111" } }, "🌀 Labyrinth — Floor " + depth)
        ),
        // Floor 1's fight is the guaranteed-safe tutorial encounter -- no
        // need for a bail-out button there.
        depth !== 1 && React.createElement("button", { onClick: exitToPlanning, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#eee", color: "#555", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 } }, "↺ Restart"),
        React.createElement("button", { onClick: cycleSpeed, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 } }, battleSpeed + "x ⚡")
      ),
      React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", padding: "12px", overflow: "hidden", gap: 6 } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: timeLeft <= 10 ? "#ef4444" : "#534AB7" } }, timeLeft + "s ⏱"),
        React.createElement("div", { className: "battle-row", style: { display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 10, width: "100%", maxWidth: "100%", overflowX: "auto", boxSizing: "border-box" } },
        React.createElement("div", { className: "battle-side-panel" }, React.createElement(DamageChart, { damageDealt: snap.damageDealt })),
        React.createElement("div", { className: "battle-grid", style: { width: ARENA_GRID_COLS*ARENA_TILE, height: ARENA_GRID_ROWS*ARENA_TILE, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #bbb", position: "relative", flexShrink: 0 } },
          React.createElement("div", { style: { position: "absolute", top: 0, left: 0, display: "grid", gridTemplateColumns: `repeat(${ARENA_GRID_COLS},${ARENA_TILE}px)`, gridTemplateRows: `repeat(${ARENA_GRID_ROWS},${ARENA_TILE}px)`, gap: 0 } },
            Array.from({ length: ARENA_GRID_ROWS }, (_, r) => Array.from({ length: ARENA_GRID_COLS }, (_, c) => {
              const BORDER = "1px solid #bbb";
              return React.createElement("div", { key: r + "," + c, style: {
                width: ARENA_TILE, height: ARENA_TILE, boxSizing: "border-box",
                background: "#fff",
                borderTop: r === 0 ? "0" : BORDER,
                borderLeft: c === 0 ? "0" : BORDER, borderRight: "0", borderBottom: "0",
              } });
            })).flat()
          ),
          atkEffects.map((e) => {
            const color = e.isEnemy ? "#ef4444" : "#a78bfa";
            if (e.isHeal) { return React.createElement("div", { key: e.id, style: { position: "absolute", left: e.col * ARENA_TILE, top: e.row * ARENA_TILE, width: ARENA_TILE, height: ARENA_TILE, borderRadius: "50%", background: "rgba(34,197,94,0.4)", boxShadow: "inset 0 0 8px rgba(22,163,74,0.9)", animation: "splashWave 0.7s ease-out forwards", pointerEvents: "none", zIndex: 21 } }); }
            if (e.isPillar) { return React.createElement("div", { key: e.id, style: { position: "absolute", left: e.col * ARENA_TILE, top: e.row * ARENA_TILE, width: ARENA_TILE, height: ARENA_TILE, background: "rgba(251,146,60,0.6)", boxShadow: "inset 0 0 8px rgba(239,68,68,0.8)", animation: "pillarFlame 0.7s ease-out forwards", pointerEvents: "none", zIndex: 20 } }); }
            if (e.isRanged) {
              const dRow = e.row - e.fromRow, dCol = e.col - e.fromCol;
              const dist = Math.sqrt(dRow * dRow + dCol * dCol) || 1;
              const dur = Math.round(300 + dist * 50);
              return React.createElement("div", {
                key: e.id,
                ref: (el) => { if (!el) return; el.getBoundingClientRect(); el.style.left = (e.col * ARENA_TILE + ARENA_TILE / 2) + "px"; el.style.top = (e.row * ARENA_TILE + ARENA_TILE / 2) + "px"; el.style.opacity = "0"; },
                style: { position: "absolute", left: e.fromCol * ARENA_TILE + ARENA_TILE / 2, top: e.fromRow * ARENA_TILE + ARENA_TILE / 2,
                  width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`,
                  transform: "translate(-50%,-50%)", transition: `left ${dur}ms linear,top ${dur}ms linear,opacity ${dur * 0.3}ms linear ${dur * 0.7}ms`,
                  pointerEvents: "none", zIndex: 20 } });
            }
            return React.createElement(React.Fragment, { key: e.id },
              React.createElement("div", { style: {
                position: "absolute", left: e.fromCol * ARENA_TILE + ARENA_TILE / 2, top: e.fromRow * ARENA_TILE + ARENA_TILE / 2,
                width: ARENA_TILE * 1.1, height: ARENA_TILE * 1.1, borderRadius: "50%",
                background: e.isEnemy ? "rgba(239,68,68,0.35)" : "rgba(99,102,241,0.35)",
                border: `2px solid ${e.isEnemy ? "#ef4444" : "#6366f1"}`,
                animation: "meleeSwing 0.4s ease-out forwards", pointerEvents: "none", zIndex: 19, transform: "translate(-50%,-50%)" } }, null),
              React.createElement("div", { style: {
                position: "absolute", left: e.col * ARENA_TILE + ARENA_TILE / 2, top: e.row * ARENA_TILE + ARENA_TILE / 2,
                width: ARENA_TILE * 0.85, height: ARENA_TILE * 0.85, borderRadius: "50%", background: color,
                animation: "atkImpact 0.55s ease-out forwards", pointerEvents: "none", zIndex: 20, transform: "translate(-50%,-50%)" } }, null)
            );
          }),
          allUnits.map((u) => React.createElement("div", {
            key: "u" + u.uid,
            ref: (el) => {
              if (el) { const hpEl = el.querySelector(".hp-fill"); unitDomRefs.current.set(u.uid, { el, hpEl }); el.style.left = (u.col * ARENA_TILE) + "px"; el.style.top = (u.row * ARENA_TILE) + "px"; }
              else unitDomRefs.current.delete(u.uid);
            },
            onClick: u.hp > 0 ? () => setBattleSelectedUid(u.uid) : undefined,
            style: { position: "absolute", width: ARENA_TILE * (u.size || 1), height: ARENA_TILE * (u.size || 1), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: u.hp > 0 ? 1 : 0, zIndex: (u.size || 1) > 1 ? 6 : 5, pointerEvents: u.hp > 0 ? "auto" : "none", cursor: u.hp > 0 ? "pointer" : "default", borderRadius: (u.size || 1) > 1 ? 10 : 0, boxShadow: (u.size || 1) > 1 ? "inset 0 0 0 2px rgba(245,158,11,0.75), 0 0 10px rgba(245,158,11,0.45)" : "none" },
          },
            React.createElement("div", { style: { position: "relative", lineHeight: 1 } },
              React.createElement(CreatureIcon, { def: CREATURE_MAP[u.creatureId] || { emoji: "❓" }, size: (u.size || 1) > 1 ? 46 : 20 }),
              (u.size || 1) > 1 && React.createElement("div", { style: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 13, lineHeight: 1, pointerEvents: "none" } }, "👑"),
              (u.burnTicks || 0) > 0 && React.createElement("div", { style: { position: "absolute", top: -4, right: -6, fontSize: 10, lineHeight: 1 } }, "🔥"),
              (u.abilFlashTicks || 0) > 0 && React.createElement("div", { style: { position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 900, color: "#3b82f6", textShadow: "0 0 3px #fff, 0 0 3px #fff", lineHeight: 1, pointerEvents: "none" } }, "!")
            ),
            React.createElement("div", { style: { position: "absolute", bottom: 3, left: 3, right: 3, height: 3, background: "#ddd", borderRadius: 2, overflow: "hidden" } },
              React.createElement("div", { className: "hp-fill", style: { height: "100%", width: (u.hp / u.maxHp * 100) + "%", background: u.uid[0] === "e" ? "#ef4444" : (u.burnTicks||0)>0 ? "#f97316" : "#22c55e", borderRadius: 2 } })
            ),
            (u.abilChargeMax || 0) > 0 && React.createElement("div", { style: { position: "absolute", bottom: 0, left: 3, right: 3, height: 2, background: "#dbeafe", borderRadius: 2, overflow: "hidden" } },
              // Snap (no transition) around the fire so the bar visibly hits
              // 100% instead of easing down from wherever the animation was.
              React.createElement("div", { style: { height: "100%", width: (Math.min(1, (u.abilCharge || 0) / u.abilChargeMax) * 100) + "%", background: "#3b82f6", borderRadius: 2, transition: (u.abilFlashTicks || 0) > 0 ? "none" : "width 0.35s linear" } })
            )
          )),
        ),
        React.createElement("div", { className: "battle-side-panel" }, selectedUnit ? React.createElement(UnitInfoPanel, {
          emoji: CREATURE_MAP[selectedUnit.creatureId]?.emoji || "❓",
          image: CREATURE_MAP[selectedUnit.creatureId]?.image,
          name: CREATURE_MAP[selectedUnit.creatureId]?.name || selectedUnit.creatureId,
          subtitle: (selectedUnit.uid[0] === "e" ? "Enemy" : "Ally") + " · Lv. " + (selectedUnit.uid[0] === "e" ? level : (owned?.[selectedUnit.creatureId]?.level || 1)),
          hp: selectedUnit.hp, maxHp: selectedUnit.maxHp, shield: selectedUnit.shield,
          abilityName: CREATURE_MAP[selectedUnit.creatureId]?.abilities?.special?.name,
          abilCharge: selectedUnit.abilCharge, abilChargeMax: selectedUnit.abilChargeMax, abilFlashTicks: selectedUnit.abilFlashTicks,
          debuffs: debuffsFor(selectedUnit),
          onClose: () => setBattleSelectedUid(null),
        }) : React.createElement("div", { style: { width: 150, flexShrink: 0 } }))
        )
      )
    );
  }
  const deployedCount = Object.keys(planGrid).length;
  const enemyGrid = withBossFootprint(getEnemyLayoutForDepth(depth));
  return React.createElement("div", { style: { position: "fixed", inset: 0, background: "#f5f5f5", display: "flex", flexDirection: "column" } },
      labAbilityTagPopup && React.createElement(AbilityTagPopup, { popup: labAbilityTagPopup, onClose: () => setLabAbilityTagPopup(null) }),
      // What the crown beside a Boss's name means. Same shape as
      // AbilityTagPopup so every definition popup reads the same.
      bossInfoOpen && React.createElement("div", {
        onClick: () => setBossInfoOpen(false),
        style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 },
      },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: "#fff", borderRadius: 14, padding: "18px 20px", width: 280, maxWidth: "85vw", boxShadow: "0 8px 30px rgba(0,0,0,0.25)" } },
          React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 } }, "👑 Boss"),
          React.createElement("div", { style: { fontSize: 13, color: "#555", lineHeight: 1.4, marginBottom: 16 } }, "+25% to all stats"),
          React.createElement("button", { onClick: () => setBossInfoOpen(false), style: { width: "100%", padding: "9px 0", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Close")
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "16px 16px 12px", gap: 12, flexShrink: 0, background: "#fff", borderBottom: "1px solid #e0e0e0" } },
        // Locked during the first-ever Descend (tutorialStep "labyrinth") --
        // the player's meant to fight the floor, not back out of it.
        React.createElement("button", { disabled: tutorialRestricted && tutorialStep === "labyrinth", onClick: () => { if (tutorialRestricted && tutorialStep === "labyrinth") return; setGridInfoCreature(null); endHold(); onBack && onBack(); setTab("home"); }, style: { background: "none", border: "none", cursor: (tutorialRestricted && tutorialStep === "labyrinth") ? "not-allowed" : "pointer", fontSize: 20, color: (tutorialRestricted && tutorialStep === "labyrinth") ? "#ccc" : "#555", padding: 0, lineHeight: 1 } },
          React.createElement("i", { className: "ti ti-arrow-left" })
        ),
        React.createElement("div", { style: { flex: 1, textAlign: "center", minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111" } }, "Planning Phase"),
          React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#888" } }, "Floor " + depth + (depth >= MAX_LABYRINTH_DEPTH ? " (Max)" : ""))
        ),
        React.createElement("button", {
          onClick: (deployedCount > 0 && depth < MAX_LABYRINTH_DEPTH) ? () => fight() : undefined,
          style: { background: (deployedCount > 0 && depth < MAX_LABYRINTH_DEPTH) ? "#534AB7" : "#ccc", border: "none", borderRadius: 10, padding: "6px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: (deployedCount > 0 && depth < MAX_LABYRINTH_DEPTH) ? "pointer" : "default" },
        }, depth >= MAX_LABYRINTH_DEPTH ? "Max Floor" : "Fight →")
      ),
      React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "flex", justifyContent: "flex-start", alignItems: "flex-start", padding: "16px 0 16px 16px", gap: 12 } },
        React.createElement("div", { style: { borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #bbb", position: "relative", flexShrink: 0 } },
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${ARENA_GRID_COLS},${ARENA_TILE}px)`, gridTemplateRows: `repeat(${ARENA_GRID_ROWS},${ARENA_TILE}px)`, gap: 0 } },
            Array.from({ length: ARENA_GRID_ROWS }, (_, r) => Array.from({ length: ARENA_GRID_COLS }, (_, c) => {
              const isPlayerZone = r >= ARENA_PLAYER_START_ROW;
              const key = r + "," + c;
              const creatureId = planGrid[key];
              const def = creatureId ? CREATURE_MAP[creatureId] : null;
              const enemyDef = !isPlayerZone ? enemyGrid[key] : null;
              const isDivider = r === ARENA_PLAYER_START_ROW;
              const BORDER = "1px solid #bbb";
              const onHoldStart = isPlayerZone && creatureId
                ? (() => { ghs.current.fired = false; ghs.current.timer = setTimeout(() => { ghs.current.fired = true; setGridInfoCreature(creatureId); }, 180); })
                : enemyDef
                  ? (() => { ghs.current.fired = false; ghs.current.timer = setTimeout(() => { ghs.current.fired = true; setEnemyMinimized(false); setEnemyInfo({ id: enemyDef.id, boss: !!enemyDef.__giant }); expandPanel("enemy"); }, 180); })
                  : undefined;
              const onHoldEnd = isPlayerZone && creatureId
                ? (() => { if (ghs.current.timer) { clearTimeout(ghs.current.timer); ghs.current.timer = null; } if (!ghs.current.fired && !touchDrag.dragRef.current.active) { setPlanGrid((p) => { const n = { ...p }; delete n[key]; return n; }); } })
                : enemyDef
                  ? (() => { if (ghs.current.timer) { clearTimeout(ghs.current.timer); ghs.current.timer = null; } })
                  : undefined;
              return React.createElement("div", {
                key, "data-cell": key,
                draggable: !!(isPlayerZone && creatureId),
                onDragStart: isPlayerZone && creatureId ? (e) => { e.dataTransfer.effectAllowed = "move"; setDragCell(key); setDragId(null); } : undefined,
                onDragOver: isPlayerZone ? (e) => e.preventDefault() : undefined,
                onDrop: isPlayerZone ? (e) => { e.preventDefault(); handleCellDrop(r, c); } : undefined,
                onMouseDown: onHoldStart,
                onMouseUp: onHoldEnd,
                onTouchStart: onHoldStart ? (e) => { e.preventDefault(); onHoldStart(); if (isPlayerZone && creatureId) touchDrag.start(e, { fromCell: key, cellId: creatureId }); } : undefined,
                onTouchEnd: onHoldEnd,
                style: {
                  width: ARENA_TILE, height: ARENA_TILE,
                  background: isPlayerZone ? "#f0f0f0" : "#fdf7f7",
                  borderTop: isDivider ? "2.5px solid #534AB7" : r === 0 ? "0" : BORDER,
                  borderLeft: c === 0 ? "0" : BORDER,
                  borderRight: "0", borderBottom: "0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, cursor: isPlayerZone ? (creatureId ? "grab" : "default") : "default",
                  boxSizing: "border-box", userSelect: "none",
                },
              }, (() => {
                const d = def || enemyDef;
                if (!d) return "";
                // Labyrinth Boss creature: its icon spans the whole 2x2 body
                // from the anchor cell; the other 3 cells draw nothing (they
                // exist only so a press anywhere on the body opens the panel).
                if (d.__giantFootprint) return "";
                if (d.__giant) {
                  return React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", pointerEvents: "none" } },
                    React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: ARENA_TILE * 2, height: ARENA_TILE * 2, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, borderRadius: 10, boxShadow: "inset 0 0 0 2px rgba(245,158,11,0.75)" } },
                      React.createElement(CreatureIcon, { def: d, size: 54 }),
                      React.createElement("span", { style: { position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", fontSize: 12, lineHeight: 1 } }, "👑"),
                      React.createElement("span", { style: { position: "absolute", top: 3, left: 4, fontSize: 9, lineHeight: 1 } }, TYPE_EMOJI[d.type] || ""),
                      React.createElement("span", { style: { position: "absolute", top: 3, right: 4, fontSize: 9, lineHeight: 1 } }, d.attackType === "Ranged" ? "🏹" : "⚔️")
                    ));
                }
                return React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement("span", { style: { position: "absolute", top: 1, left: 2, fontSize: 8, lineHeight: 1, pointerEvents: "none" } }, TYPE_EMOJI[d.type] || ""), React.createElement("span", { style: { position: "absolute", top: 1, right: 2, fontSize: 8, lineHeight: 1, pointerEvents: "none" } }, d.attackType === "Ranged" ? "🏹" : "⚔️"), React.createElement(CreatureIcon, { def: d, size: 26 }));
              })());
            })).flat()
          )
        ),
        React.createElement("div", { ref: rightPanelRef, style: { flex: 1, alignSelf: "stretch", padding: "0 12px 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" } },
          enemyInfo && (() => {
            const def = CREATURE_MAP[enemyInfo.id];
            if (!def) return null;
            return React.createElement("div", { style: { background: "#fff", borderRadius: 14, padding: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", position: "relative" } },
              React.createElement("button", { onClick: () => setEnemyMinimized((p) => { const next = !p; if (!next) expandPanel("enemy"); return next; }), style: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: "#f0f0f0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 } }, enemyMinimized ? "＋" : "－"),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: enemyMinimized ? 0 : 12 } },
                React.createElement(CreatureIcon, { def, size: 28 }),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 5 } },
                    def.name,
                    // Boss marker: tapping the crown explains what being a Boss
                    // is worth (the +25% in makeArenaBattle's __giant handling).
                    enemyInfo.boss && React.createElement("button", {
                      onClick: (e) => { e.stopPropagation(); setBossInfoOpen(true); },
                      style: { background: "none", border: "none", padding: 0, fontSize: 14, lineHeight: 1, cursor: "pointer" },
                    }, "👑")
                  ),
                  React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, def.type + " · " + (def.attackType || "Melee") + " · Lv." + level + " · Enemy")
                )
              ),
              !enemyMinimized && def.abilities && Object.entries(def.abilities).map(([k, abl]) => {
                if (!abl) return null;
                const abilityTags = getAbilityTags(def.id, k);
                return React.createElement("div", { key: k, style: { marginBottom: 10 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 } },
                    React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, abilityLabels[k] || k),
                    abilityTags.length > 0 && React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" } },
                      React.createElement(AbilityTagPills,{tags:abilityTags,onOpen:setLabAbilityTagPopup})
                    )
                  ),
                  React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#111" } }, abl.name),
                  React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 2 } }, abl.upgrades ? abl.upgrades[Math.min(enemyAbilityLevel, abl.upgrades.length - 1)] : "")
                );
              })
            );
          })(),
          gridInfoCreature && (() => {
            const def = CREATURE_MAP[gridInfoCreature];
            const oc = owned && owned[gridInfoCreature];
            if (!def) return null;
            return React.createElement("div", { style: { background: "#fff", borderRadius: 14, padding: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", position: "relative" } },
              React.createElement("button", { onClick: () => setAllyMinimized((p) => { const next = !p; if (!next) expandPanel("ally"); return next; }), style: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: "#f0f0f0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 } }, allyMinimized ? "＋" : "－"),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: allyMinimized ? 0 : 12 } },
                React.createElement(CreatureIcon, { def, size: 28 }),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111" } }, def.name),
                  React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, def.type + " · " + (def.attackType || "Melee") + (oc ? " · Lv." + oc.level : ""))
                )
              ),
              !allyMinimized && def.abilities && Object.entries(def.abilities).map(([k, abl]) => {
                if (!abl) return null;
                const lvl = oc && oc.abilityLevels ? oc.abilityLevels[k] || 0 : 0;
                const desc = abl.upgrades ? abl.upgrades[Math.min(lvl, abl.upgrades.length - 1)] : "";
                const abilityTags = getAbilityTags(def.id, k);
                return React.createElement("div", { key: k, style: { marginBottom: 10 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 } },
                    React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, abilityLabels[k] || k),
                    abilityTags.length > 0 && React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" } },
                      React.createElement(AbilityTagPills,{tags:abilityTags,onOpen:setLabAbilityTagPopup})
                    )
                  ),
                  React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#111" } }, abl.name),
                  desc && React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 2 } }, desc)
                );
              })
            );
          })()
        )
      ),
      tutorialRestricted && tutorialStep === "labyrinth" && React.createElement("div", { style: { margin: "0 16px 12px", background: "#fff", border: "2px solid #534AB7", borderRadius: 16, padding: "14px 16px", fontSize: 14, color: "#333", lineHeight: 1.4, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", flexShrink: 0 } },
        "You see a dusty plaque with the words \"Make your way to the bottom of this cursed labyrinth and all your questions will be answered.\""
      ),
      // Same slot and styling as the plaque above -- sits over the roster tray
      // -- but with the rest of the screen greyed out behind it. Tapping
      // anywhere (the dimmer or the box) just dismisses the text; the player
      // still starts the fight themselves.
      floor10Warning && React.createElement("div", { onClick: dismissFloor10Warning, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, cursor: "pointer" } }),
      floor10Warning && React.createElement("div", {
        onClick: dismissFloor10Warning,
        style: { position: "relative", zIndex: 301, margin: "0 16px 12px", background: "#fff", border: "2px solid #534AB7", borderRadius: 16, padding: "14px 16px", color: "#333", lineHeight: 1.4, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", flexShrink: 0, cursor: "pointer" },
      },
        React.createElement("div", { style: { fontSize: 14 } }, "You see a exceptionally powerful creature on this floor. It must be guarding something valuable."),
        React.createElement("div", { style: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 8 } }, "Tap to continue")
      ),
      React.createElement("div", {
        style: { background: "#fff", borderTop: "1px solid #e0e0e0", padding: "10px 12px 24px", flexShrink: 0 },
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => { e.preventDefault(); if (dragCell) { setPlanGrid((p) => { const n = { ...p }; delete n[dragCell]; return n; }); } setDragId(null); setDragCell(null); },
      },
        React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } },
            React.createElement("span", { style: { fontSize: 22, fontWeight: 800, color: deployedCount >= ARENA_MAX_DEPLOYED ? "#ef4444" : "#111" } }, deployedCount),
            React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#aaa" } }, " / " + ARENA_MAX_DEPLOYED + " deployed")
          ),
          React.createElement("div", { style: { display: "flex", gap: 8 } },
            React.createElement("button", { onClick: () => deployedCount > 0 && setPlanGrid({}), disabled: deployedCount === 0, style: { padding: "8px 14px", fontSize: 14, fontWeight: 700, background: "#fff", color: deployedCount > 0 ? "#534AB7" : "#ccc", border: "1.5px solid " + (deployedCount > 0 ? "#534AB7" : "#ccc"), borderRadius: 12, cursor: deployedCount > 0 ? "pointer" : "default" } }, "🗑 Clear All"),
            React.createElement("button", { onClick: autoDeploy, style: { padding: "8px 16px", fontSize: 14, fontWeight: 700, background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" } }, "⚡ Auto Deploy")
          )
        ),
        React.createElement("div", {
          ref: creatureListRef,
          onMouseDown: onListMouseDown,
          onMouseMove: onListMouseMove,
          onMouseUp: onListMouseUp,
          onMouseLeave: onListMouseUp,
          style: { display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(2,58px)", gridAutoColumns: 52, gap: 6, overflowX: "auto", overflowY: "hidden", cursor: "grab", paddingBottom: 4, userSelect: "none" },
        },
          ownedList.map((oc) => {
            const def = CREATURE_MAP[oc.id];
            if (!def) return null;
            const isPlaced = placedIds.has(oc.id);
            const isHolding = holdId === oc.id && holdPct > 0;
            const CIRC = 2 * Math.PI * 18;
            return React.createElement("div", {
              key: oc.id,
              "data-creature": oc.id,
              draggable: !isPlaced,
              onDragStart: !isPlaced ? (e) => { if (dragScroll.current.intentScroll) { e.preventDefault(); return; } if (hs.current.id === oc.id) { e.preventDefault(); return; } endHold(); e.dataTransfer.effectAllowed = "move"; setDragId(oc.id); setDragCell(null); } : undefined,
              onMouseDown: () => beginHold(oc.id),
              onMouseUp: endHold,
              onTouchStart: (e) => { e.preventDefault(); beginHold(oc.id); if (!isPlaced) touchDrag.start(e, { id: oc.id }); },
              onTouchEnd: endHold,
              style: {
                flexShrink: 0, width: 52, height: 58, position: "relative",
                background: isPlaced ? "#f0f0f0" : "#fff",
                border: "none",
                borderRadius: 10, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                cursor: isPlaced ? "default" : "grab", userSelect: "none",
              },
            },
              isHolding && holdPct > 15 && React.createElement("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }, viewBox: "0 0 52 58" },
                React.createElement("circle", { cx: 26, cy: 29, r: 18, fill: "none", stroke: "#534AB7", strokeWidth: 3, strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - holdPct / 100), strokeLinecap: "round", transform: "rotate(-90 26 29)" })
              ),
              React.createElement("div", { style: { opacity: isPlaced ? 0.4 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
                React.createElement("div", { style: { position: "relative", lineHeight: 1 } },
                  React.createElement("div", { style: { position: "absolute", top: -2, left: -6, fontSize: 10, lineHeight: 1 } }, TYPE_EMOJI[def.type] || ""),
                  React.createElement("div", { style: { position: "absolute", top: -2, right: -6, fontSize: 10, lineHeight: 1 } }, def.attackType === "Ranged" ? "🏹" : "⚔️"),
                  React.createElement(CreatureIcon, { def, size: 24, style: { marginTop: 6 } })
                ),
                React.createElement("div", { style: { fontSize: 8, color: "#333", fontWeight: 600, textAlign: "center", lineHeight: 1.2, maxWidth: 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, def.name),
                React.createElement("div", { style: { fontSize: 8, color: "#666", fontWeight: 700 } }, "Lv." + oc.level)
              )
            );
          })
        )
      ),
      touchDrag.ghost && (() => { const gdef = CREATURE_MAP[touchDrag.ghost.id]; if (!gdef) return null; return React.createElement("div", { style: { position: "fixed", left: touchDrag.ghost.x - 26, top: touchDrag.ghost.y - 29, width: 52, height: 52, pointerEvents: "none", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" } }, React.createElement(CreatureIcon, { def: gdef, size: 36 })); })()
    );
}

export default LabyrinthScreen;
