// One-time tutorial shown on a brand-new save. Dismissed permanently via
// GameContext's `tutorialSeen` flag. Rest of the screen stays plain white --
// graphics to accompany each line/creature will land here later.
import React, { useState, useRef, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { makeOwnedCreature, getChain } from "../../core/creatures.js";
import { TYPE_EMOJI } from "../../data/types.js";
import { makeArenaBattle } from "../../battle/state.js";
import { tickSpecialCharge, specialChargeReady, consumeSpecialCharge, specialTargetInRange } from "../../battle/tick.js";
import { MELEE_RANGE, RANGED_RANGE, COOLDOWN_TICKS_AT_SPD_1 } from "../../battle/constants.js";
import { aChebDist, aCardinalDist, aBestStep, aEase } from "../../battle/geometry.js";
import { EQUIPMENT_MAP } from "../../data/equipment.js";
import { equipBonus, equipBonusStr } from "../../core/equipment.js";
import CreatureAbilitySummary from "./CreatureAbilitySummary.js";
import CreatureIcon from "./CreatureIcon.js";

const TUTORIAL_LINES = [
  "You wake up on the shore of a deserted looking island with no memory of how you got there.",
  "You head into the forest to explore, and see 3 abandoned eggs beneath a tree.",
  "Curious, you pick it up and it starts to hatch!",
];

// Shown under the creature reveal card once the egg has hatched.
const REVEAL_LINE = "The egg shudders and shakes, and hatches into a mysterious creature!";

// Shown after the reveal card, before the tutorial ends.
const POST_REVEAL_LINES = [
  "A creature bursts out of some nearby bushes, angry that you stole its meal!",
  "Your newly hatched creature rushes out to defend you. It's time to fight!",
];

// Shown once, after the battle's "Victory!" beat, right before the tutorial ends.
const FINAL_LINE = "The creature hastily retreats into the forest with the other 2 eggs, leaving behind a piece of equipment.";

// The equipment item awarded on the finalText screen.
const TUTORIAL_ITEM_ID = "com_hp_atk";

// Index of the line after which the egg-choice screen appears.
const EGG_CHOICE_AFTER_LINE = 1;
const STARTER_CHOICES = ["emberpup", "droplette", "leafling"];

/** Final-evolution-stage def for a starter id -- shown as a preview above the egg row. */
function finalFormDef(starterId) {
  const chain = getChain(starterId);
  return CREATURE_MAP[chain[chain.length - 1]];
}

// The tutorial's first fight uses a smaller grid than a real arena/dungeon
// battle, with a single fixed level-1 Murkwing as the only enemy. Tile size
// is bumped up from ARENA_TILE just for this screen -- it's a much shorter
// grid than a real arena/dungeon board, so it can afford bigger tiles.
const TUTORIAL_GRID_COLS = 5;
const TUTORIAL_GRID_ROWS = 6;
const TUTORIAL_TILE = 56;
const TUTORIAL_PLAYER_ZONE_ROWS = 3;
const TUTORIAL_PLAYER_ZONE_START_ROW = TUTORIAL_GRID_ROWS - TUTORIAL_PLAYER_ZONE_ROWS;
const TUTORIAL_ENEMY_CELL = "0,2";
const TUTORIAL_PLAYER_CELL = "5,2";
const TUTORIAL_ENEMY_ID = "murkwing";
const TUTORIAL_ENEMY_LEVEL = 1;

function TutorialOverlay() {
  const {
    setTutorialSeen, setTutorialRestricted, setTutorialStep, setOwned, owned, equipmentLevels, equipmentAscensions, setEquipmentCopies,
    // Persisted (see GameContext) so quitting mid-tutorial resumes on the same
    // beat instead of restarting from the shore -- "phase" included: it's
    // normalized battle -> battlePlan at load time, never resumes as "battle".
    tutorialPhase: phase, setTutorialPhase: setPhase,
    tutorialLine: line, setTutorialLine: setLine,
    tutorialPostLine: postLine, setTutorialPostLine: setPostLine,
    tutorialPickedCreatureId: pickedCreatureId, setTutorialPickedCreatureId: setPickedCreatureId,
    tutorialPlayerCell: playerCell, setTutorialPlayerCell: setPlayerCell,
  } = useGame();
  const [selectedEgg, setSelectedEgg] = useState(null);
  // Which side-panel is showing: null | { type: "enemy" | "player", minimized }
  const [sidePanel, setSidePanel] = useState(null);
  // Some browsers still fire a trailing click on the drag source right after
  // a completed drop; without this guard that click immediately un-places
  // the creature that the drop just placed, making rearrange look broken.
  const suppressClickRef = useRef(false);
  function suppressNextClick() {
    suppressClickRef.current = true;
    setTimeout(() => { suppressClickRef.current = false; }, 0);
  }

  // Placement uses a custom pointer-driven drag instead of native HTML5
  // drag-and-drop. Native drag's dragover/drop coordinates come from the
  // browser's own drag session and can end up disjointed from the visible
  // cursor (the ghost image lags/leads it, and the reported position can
  // land a row or more off). Plain pointer events -- the same primitive
  // every onClick in this file already uses reliably -- don't have that
  // problem, so we track the pointer ourselves and compute the target cell
  // from its real, current position at drop time.
  //
  // A pointer-down on the placed creature is ambiguous until it resolves:
  // released quickly with no movement -> click-to-remove (handled by the
  // cell's own onClick); held in place -> pop the stats panel; moved beyond
  // a small threshold -> promote to a drag. gestureRef tracks which of
  // those a session is currently in; isDragging/ghostPos only reflect the
  // "promoted to drag" case, for the ghost's own render condition.
  const gridRef = useRef(null);
  const trayRef = useRef(null);
  const gestureRef = useRef({ mode: null, startX: 0, startY: 0, timer: null });
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const HOLD_MS = 350;
  const MOVE_THRESHOLD = 6;

  function cellFromPoint(clientX, clientY) {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const col = Math.floor((clientX - rect.left) / TUTORIAL_TILE);
    const row = Math.floor((clientY - rect.top) / TUTORIAL_TILE);
    if (row < TUTORIAL_PLAYER_ZONE_START_ROW || row >= TUTORIAL_GRID_ROWS || col < 0 || col >= TUTORIAL_GRID_COLS) return null;
    return row + "," + col;
  }

  // holdable=true for the placed creature (press-and-hold shows its stats
  // panel instead of immediately dragging); holdable=false for the roster
  // tile, which has no hold gesture and can start dragging right away.
  function startPointerSession(e, holdable) {
    e.preventDefault();
    e.stopPropagation();
    const g = gestureRef.current;
    g.startX = e.clientX;
    g.startY = e.clientY;
    if (holdable) {
      g.mode = "pending";
      g.timer = setTimeout(() => {
        if (g.mode === "pending") {
          g.mode = "holding";
          setSidePanel({ type: "player", minimized: false });
        }
      }, HOLD_MS);
    } else {
      g.mode = "dragging";
      setGhostPos({ x: e.clientX, y: e.clientY });
      setIsDragging(true);
    }
  }

  useEffect(() => {
    function onMove(e) {
      const g = gestureRef.current;
      if (g.mode === "pending") {
        if (Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > MOVE_THRESHOLD) {
          clearTimeout(g.timer);
          g.mode = "dragging";
          setGhostPos({ x: e.clientX, y: e.clientY });
          setIsDragging(true);
        }
        return;
      }
      if (g.mode === "dragging") setGhostPos({ x: e.clientX, y: e.clientY });
    }
    function onUp(e) {
      const g = gestureRef.current;
      if (!g.mode) return;
      clearTimeout(g.timer);
      if (g.mode === "dragging") {
        const cell = cellFromPoint(e.clientX, e.clientY);
        if (cell) {
          suppressNextClick();
          setPlayerCell(cell);
        } else if (trayRef.current) {
          const r = trayRef.current.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            suppressNextClick();
            setPlayerCell(null);
          }
        }
      } else if (g.mode === "holding") {
        // Panel's already open; just make sure the trailing click doesn't
        // also fire the cell's click-to-remove.
        suppressNextClick();
      }
      // mode "pending" here means a genuine quick tap that never moved and
      // never held long enough to open the panel -- let the natural click
      // event (already about to fire) handle remove/place as usual.
      g.mode = null;
      setIsDragging(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      clearTimeout(gestureRef.current.timer);
    };
  }, []);

  // The tutorial's fight runs on the same tick simulation Arena battles use
  // (real movement, targeting, attack cooldowns, damage rolls) -- just with
  // the enemy's HP pool balanced down to almost nothing first, so the
  // outcome is guaranteed and it loses within the first hit or two.
  const BATTLE_MOVE_ANIM_MS = 350;
  const BATTLE_TICK_MS = 400;
  const battleStateRef = useRef(null);
  const battleUnitDomRefs = useRef(new Map());
  const battleRafRef = useRef(null);
  const battleTickRef = useRef(null);
  const [battleSnap, setBattleSnap] = useState(null);
  const [battleAtkEffects, setBattleAtkEffects] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState(null); // null | "won" | "lost"

  function stopBattleLoops() {
    if (battleTickRef.current) { clearInterval(battleTickRef.current); battleTickRef.current = null; }
    if (battleRafRef.current) { cancelAnimationFrame(battleRafRef.current); battleRafRef.current = null; }
  }

  function startBattleRenderLoop() {
    if (battleRafRef.current) cancelAnimationFrame(battleRafRef.current);
    function frame() {
      const s = battleStateRef.current;
      if (!s) { battleRafRef.current = null; return; }
      const now = Date.now();
      for (const u of [...s.playerUnits, ...s.enemyUnits]) {
        const refs = battleUnitDomRefs.current.get(u.uid);
        if (!refs) continue;
        const { el, hpEl } = refs;
        if (u.hp <= 0) { el.style.opacity = "0"; continue; }
        el.style.opacity = "1";
        const t = aEase(Math.min(1, (now - u.lastMoveTime) / BATTLE_MOVE_ANIM_MS));
        el.style.left = ((u.prevCol + (u.col - u.prevCol) * t) * TUTORIAL_TILE) + "px";
        el.style.top = ((u.prevRow + (u.row - u.prevRow) * t) * TUTORIAL_TILE) + "px";
        if (hpEl) hpEl.style.width = (Math.max(0, u.hp / u.maxHp) * 100) + "%";
      }
      battleRafRef.current = requestAnimationFrame(frame);
    }
    battleRafRef.current = requestAnimationFrame(frame);
  }

  // Ported from ArenaScreen's own inline tick (Arena fights -- this one
  // included -- don't run player abilities, just basic melee/ranged attacks
  // and movement; that's the real simulation actual Arena stages use).
  function runBattleTick() {
    const s = battleStateRef.current;
    if (!s) return;
    s.tick++;
    const now = Date.now();
    const damageDealt = s.damageDealt || (s.damageDealt = {});
    const aliveP = s.playerUnits.filter((u) => u.hp > 0);
    const aliveE = s.enemyUnits.filter((u) => u.hp > 0);
    if (!aliveP.length || !aliveE.length) return;
    const allOcc = new Set([...aliveP, ...aliveE].map((u) => u.row + "," + u.col));
    const newFx = [];
    function actUnit(u, foes) {
      u.atkCd = Math.max(0, u.atkCd - 1);
      // Special-ability charge, same as the real Arena tick: no specials are
      // implemented here, so a full bar flashes the "!" marker and recharges
      // -- holding at full until a foe (or ally, for Supports) is in range.
      tickSpecialCharge(u);
      if (specialChargeReady(u) && specialTargetInRange(u, u.uid[0] === "p" ? aliveP : aliveE, foes, null)) consumeSpecialCharge(u);
      const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
      const byCheb = [...foes].sort((a, b) => aChebDist(u.row, u.col, a.row, a.col) - aChebDist(u.row, u.col, b.row, b.col));
      let atkTgt = null, moveTgt = byCheb[0];
      if (u.isRanged) {
        const inRange = foes.filter((f) => aCardinalDist(u.row, u.col, f.row, f.col) <= RANGED_RANGE);
        if (inRange.length) atkTgt = inRange.sort((a, b) => aCardinalDist(u.row, u.col, a.row, a.col) - aCardinalDist(u.row, u.col, b.row, b.col))[0];
      }
      const tgt = atkTgt || moveTgt;
      if (!tgt) return;
      const dist = atkTgt ? aCardinalDist(u.row, u.col, atkTgt.row, atkTgt.col) : aChebDist(u.row, u.col, tgt.row, tgt.col);
      if (dist <= range && u.atkCd <= 0) {
        const rawDmg = u.atk * (0.8 + Math.random() * 0.4);
        const dmg = Math.max(1, Math.round(Math.max(1, rawDmg - (tgt.def || 20) * 0.35)));
        tgt.hp = Math.max(0, tgt.hp - dmg);
        if (u.uid[0] === "p") damageDealt[u.creatureId] = (damageDealt[u.creatureId] || 0) + dmg;
        u.atkCd = Math.max(3, Math.round(COOLDOWN_TICKS_AT_SPD_1 / u.spd));
        newFx.push({ id: now + u.uid, row: tgt.row, col: tgt.col, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: u.uid[0] === "e" });
      } else if (dist > range) {
        const blk = (r2, c2) => allOcc.has(r2 + "," + c2) || r2 < 0 || r2 >= TUTORIAL_GRID_ROWS || c2 < 0 || c2 >= TUTORIAL_GRID_COLS;
        const [nr, nc] = aBestStep(u.row, u.col, tgt.row, tgt.col, blk);
        if (nr !== u.row || nc !== u.col) {
          allOcc.delete(u.row + "," + u.col);
          u.prevRow = u.row; u.prevCol = u.col; u.lastMoveTime = now;
          u.row = nr; u.col = nc;
          allOcc.add(nr + "," + nc);
        }
      }
    }
    for (const u of aliveP) actUnit(u, aliveE);
    for (const u of aliveE) actUnit(u, aliveP);
    if (newFx.length) setBattleAtkEffects((prev) => [...prev.filter((e) => now - e.t < 700), ...newFx]);
    setBattleSnap({
      playerUnits: s.playerUnits.map((u) => ({ ...u })),
      enemyUnits: s.enemyUnits.map((u) => ({ ...u })),
      damageDealt: { ...s.damageDealt },
    });
    const anyE = s.enemyUnits.some((u) => u.hp > 0);
    const anyP = s.playerUnits.some((u) => u.hp > 0);
    if (!anyE) { stopBattleLoops(); setTimeout(() => setBattleOutcome("won"), 500); }
    else if (!anyP) { stopBattleLoops(); setTimeout(() => setBattleOutcome("lost"), 500); }
  }

  function startBattle() {
    if (!playerCell || !pickedCreatureId) return;
    const playerGrid = { [playerCell]: pickedCreatureId };
    const enemyGrid = { [TUTORIAL_ENEMY_CELL]: enemyDef };
    const state = makeArenaBattle(playerGrid, enemyGrid, owned, 1, BATTLE_MOVE_ANIM_MS, equipmentLevels, equipmentAscensions, null, TUTORIAL_ENEMY_LEVEL);
    // Balance knob: the tutorial's enemy always loses, but shouldn't drop in
    // one or two hits -- give it a real HP pool (sized off the player
    // creature's own attack so it takes a handful of real hits regardless of
    // which starter was picked) while cutting its own attack down to near
    // nothing, so the player is never in real danger. Everything else about
    // the encounter (targeting, movement, attack cooldowns, damage rolls)
    // still comes from the real simulation.
    const playerAtk = state.playerUnits[0]?.atk || 30;
    const HITS_TO_DEFEAT = 2;
    for (const u of state.enemyUnits) {
      const estHitDmg = Math.max(1, Math.round(playerAtk - (u.def || 0) * 0.35));
      u.maxHp = u.hp = Math.max(30, estHitDmg * HITS_TO_DEFEAT);
      u.atk = Math.max(1, Math.round(u.atk * 0.1));
    }
    battleStateRef.current = state;
    setBattleSnap({
      playerUnits: state.playerUnits.map((u) => ({ ...u })),
      enemyUnits: state.enemyUnits.map((u) => ({ ...u })),
      damageDealt: {},
    });
    setBattleAtkEffects([]);
    setBattleOutcome(null);
    setPhase("battle");
    startBattleRenderLoop();
    battleTickRef.current = setInterval(runBattleTick, BATTLE_TICK_MS);
  }

  useEffect(() => () => stopBattleLoops(), []);

  // Skips just this scripted fight (not the whole tutorial) -- grants the
  // same reward the real win does and jumps straight to the hand-off text.
  function skipBattle() {
    stopBattleLoops();
    setEquipmentCopies((prev) => ({ ...prev, [TUTORIAL_ITEM_ID]: (prev[TUTORIAL_ITEM_ID] || 0) + 1 }));
    setPhase("finalText");
  }

  function advance() {
    if (phase === "eggs" || phase === "battlePlan") return;
    if (phase === "battle") {
      if (battleOutcome === "won") {
        setEquipmentCopies((prev) => ({ ...prev, [TUTORIAL_ITEM_ID]: (prev[TUTORIAL_ITEM_ID] || 0) + 1 }));
        setPhase("finalText");
      }
      return;
    }
    if (phase === "finalText") { setTutorialRestricted(true); setTutorialStep("collection"); setTutorialSeen(true); return; }
    if (phase === "reveal") { setPhase("postText"); setPostLine(0); return; }
    if (phase === "postText") {
      if (postLine >= POST_REVEAL_LINES.length - 1) { setPhase("battlePlan"); return; }
      setPostLine((p) => p + 1);
      return;
    }
    if (line === EGG_CHOICE_AFTER_LINE) { setPhase("eggs"); return; }
    if (line >= TUTORIAL_LINES.length - 1) { setPhase("reveal"); return; }
    setLine((l) => l + 1);
  }

  function confirmEgg() {
    if (!selectedEgg) return;
    const def = CREATURE_MAP[selectedEgg];
    setOwned((prev) => ({ ...prev, [selectedEgg]: makeOwnedCreature(def) }));
    setPickedCreatureId(selectedEgg);
    setSelectedEgg(null);
    setPhase("text");
    setLine((l) => l + 1);
  }

  const pickedDef = pickedCreatureId && CREATURE_MAP[pickedCreatureId];
  const enemyDef = CREATURE_MAP[TUTORIAL_ENEMY_ID];

  return React.createElement(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 9998, background: "#fff", cursor: phase === "eggs" || phase === "battlePlan" || (phase === "battle" && battleOutcome !== "won") ? "default" : "pointer" },
      onClick: advance,
    },
    // Always available, even mid-battle -- pinned to the corner least likely
    // to collide with whatever the current phase is showing up top (the
    // Fight button and the Planning Phase title both live on the right
    // and center during battlePlan/battle, so Skip moves to the left there).
    React.createElement(
        "button",
        {
          onClick: (e) => { e.stopPropagation(); setTutorialRestricted(false); setTutorialStep(null); setTutorialSeen(true); },
          style: {
            position: "absolute",
            top: 16,
            left: phase === "battlePlan" || phase === "battle" ? 16 : undefined,
            right: phase === "battlePlan" || phase === "battle" ? undefined : 16,
            background: phase === "battlePlan" || phase === "battle" ? "rgba(255,255,255,0.9)" : "none",
            border: "none",
            borderRadius: phase === "battlePlan" || phase === "battle" ? 8 : 0,
            boxShadow: phase === "battlePlan" || phase === "battle" ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
            color: "#888",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 10px",
            zIndex: 20,
          },
        },
        "Skip"
      ),
    phase === "eggs" &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
          },
        },
        // Fixed-height preview of the selected egg's fully-evolved form, above
        // the egg row -- reserved space (not just conditionally rendered) so
        // picking an egg doesn't shift the row below it. Swaps instantly to
        // whichever egg is currently selected.
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 96, justifyContent: "flex-end" } },
          selectedEgg
            ? [
                React.createElement("div", { key: "emoji", style: { fontSize: 64, lineHeight: 1 } }, finalFormDef(selectedEgg).emoji),
                React.createElement("div", { key: "label", style: { fontSize: 12, fontWeight: 600, color: "#888" } }, "Fully evolved"),
              ]
            : React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#bbb" } }, "Pick an egg to preview its final form")
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 24 } },
          STARTER_CHOICES.map((id) =>
            React.createElement(
              "div",
              { key: id, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } },
              React.createElement(
                "button",
                {
                  onClick: (e) => { e.stopPropagation(); setSelectedEgg(id); },
                  style: {
                    background: "none",
                    border: "3px solid " + (selectedEgg === id ? "#534AB7" : "transparent"),
                    borderRadius: 16,
                    fontSize: 64,
                    cursor: "pointer",
                    padding: 8,
                    lineHeight: 1,
                  },
                },
                React.createElement(
                  "span",
                  {
                    style: {
                      display: "inline-block",
                      animation: selectedEgg === id ? "eggShake 0.4s ease-in-out infinite" : "none",
                    },
                  },
                  "🥚"
                )
              ),
              React.createElement(
                "div",
                { style: { fontSize: 12, fontWeight: 600, color: "#888" } },
                (TYPE_EMOJI[CREATURE_MAP[id].type] || "") + " " + CREATURE_MAP[id].type
              )
            )
          )
        ),
        React.createElement(
          "button",
          {
            onClick: (e) => { e.stopPropagation(); confirmEgg(); },
            disabled: !selectedEgg,
            style: {
              padding: "12px 28px",
              background: selectedEgg ? "#534AB7" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: selectedEgg ? "pointer" : "default",
            },
          },
          "Pick this egg"
        )
      ),
    phase === "reveal" &&
      pickedDef &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "24px 24px 140px",
            overflowY: "auto",
            textAlign: "center",
          },
        },
        React.createElement("div", { style: { fontSize: 88, lineHeight: 1 } }, pickedDef.emoji),
        React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: "#222" } }, pickedDef.name),
        React.createElement(
          "div",
          { style: { fontSize: 13, fontWeight: 600, color: "#888", marginTop: -8 } },
          (TYPE_EMOJI[pickedDef.type] || "") + " " + pickedDef.type
        ),
        React.createElement(
          "div",
          { style: { marginTop: 12 } },
          React.createElement(CreatureAbilitySummary, { def: pickedDef, flat: true })
        )
      ),
    phase === "reveal" &&
      pickedDef &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 24,
            background: "#fff",
            border: "2px solid #534AB7",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          },
        },
        React.createElement(
          "div",
          { style: { fontSize: 14, lineHeight: 1.5, color: "#333" } },
          REVEAL_LINE
        ),
        React.createElement(
          "div",
          { style: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 8 } },
          "Tap to continue"
        )
      ),
    (phase === "text" || phase === "postText") &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 24,
            background: "#fff",
            border: "2px solid #534AB7",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          },
        },
        React.createElement(
          "div",
          { style: { fontSize: 14, lineHeight: 1.5, color: "#333" } },
          phase === "postText" ? POST_REVEAL_LINES[postLine] : TUTORIAL_LINES[line]
        ),
        React.createElement(
          "div",
          { style: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 8 } },
          "Tap to continue"
        )
      ),
    // Item reveal, mirroring the egg-reveal card above: the tutorial's
    // closing beat now hands the player a real equipment item instead of
    // just narrating the creature's exit.
    phase === "finalText" &&
      (() => {
        const item = EQUIPMENT_MAP[TUTORIAL_ITEM_ID];
        const bonuses = equipBonus(item.id, 1, 0);
        return React.createElement(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "24px 24px 140px",
              overflowY: "auto",
              textAlign: "center",
            },
          },
          React.createElement("div", { style: { fontSize: 88, lineHeight: 1 } }, item.emoji),
          React.createElement(
            "div",
            { style: { fontSize: 11, fontWeight: 800, color: "#2e7d32", background: "#e8f5e9", borderRadius: 20, padding: "3px 12px", letterSpacing: 0.3, textTransform: "uppercase" } },
            "Obtained!"
          ),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: "#222" } }, item.name),
          React.createElement(
            "div",
            { style: { fontSize: 13, fontWeight: 600, color: "#888", marginTop: -8 } },
            equipBonusStr(bonuses)
          )
        );
      })(),
    phase === "finalText" &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 24,
            background: "#fff",
            border: "2px solid #534AB7",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          },
        },
        React.createElement(
          "div",
          { style: { fontSize: 14, lineHeight: 1.5, color: "#333" } },
          FINAL_LINE
        ),
        React.createElement(
          "div",
          { style: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 8 } },
          "Tap to continue"
        )
      ),
    // Mirrors ArenaScreen's planning-phase layout (header / grid / roster
    // tray) so the tutorial's first fight looks like every other planning
    // screen in the game, just at a smaller 5x6 scale with one fixed enemy.
    phase === "battlePlan" &&
      pickedDef &&
      (() => {
        const playerZoneStartRow = TUTORIAL_PLAYER_ZONE_START_ROW;
        const attackIcon = (def) => (def.attackType === "Ranged" ? "🏹" : "⚔️");
        const deployed = !!playerCell;
        return React.createElement(
          "div",
          { style: { position: "absolute", inset: 0, background: "#f5f5f5", display: "flex", flexDirection: "column" } },
          // header
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", padding: "16px 16px 12px", gap: 12, flexShrink: 0, background: "#fff", borderBottom: "1px solid #e0e0e0" } },
            React.createElement(
              "div",
              { style: { flex: 1, textAlign: "center" } },
              React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111" } }, "Planning Phase")
            ),
            React.createElement(
              "button",
              {
                onClick: (e) => { e.stopPropagation(); if (deployed) startBattle(); },
                style: {
                  background: deployed ? "#534AB7" : "#ccc",
                  border: "none",
                  borderRadius: 10,
                  padding: "6px 14px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: deployed ? "pointer" : "default",
                },
              },
              "Fight →"
            )
          ),
          // grid + side info panel
          React.createElement(
            "div",
            { style: { flex: 1, overflowY: "auto", display: "flex", justifyContent: "flex-start", alignItems: "flex-start", padding: 16, gap: 12 } },
            React.createElement(
              "div",
              {
                ref: gridRef,
                style: { borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #bbb", flexShrink: 0 },
              },
              React.createElement(
                "div",
                { style: { display: "grid", gridTemplateColumns: "repeat(" + TUTORIAL_GRID_COLS + "," + TUTORIAL_TILE + "px)", gridTemplateRows: "repeat(" + TUTORIAL_GRID_ROWS + "," + TUTORIAL_TILE + "px)", gap: 0 } },
                Array.from({ length: TUTORIAL_GRID_ROWS }, (_, r) =>
                  Array.from({ length: TUTORIAL_GRID_COLS }, (_, c) => {
                    const key = r + "," + c;
                    const isPlayerZone = r >= playerZoneStartRow;
                    const isEnemyCell = key === TUTORIAL_ENEMY_CELL;
                    const isPlayerCell = isPlayerZone && key === playerCell;
                    const d = isEnemyCell ? enemyDef : isPlayerCell ? pickedDef : null;
                    const isDivider = r === playerZoneStartRow;
                    const BORDER = "1px solid #bbb";
                    return React.createElement(
                      "div",
                      {
                        key,
                        onClick: (e) => {
                          e.stopPropagation();
                          if (suppressClickRef.current) { suppressClickRef.current = false; return; }
                          if (isPlayerCell) { setPlayerCell(null); return; }
                          if (isEnemyCell) { setSidePanel({ type: "enemy", minimized: false }); return; }
                          if (isPlayerZone && !playerCell) setPlayerCell(key);
                        },
                        style: {
                          width: TUTORIAL_TILE,
                          height: TUTORIAL_TILE,
                          background: isPlayerZone ? "#f0f0f0" : "#fdf7f7",
                          borderTop: isDivider ? "2.5px solid #534AB7" : r === 0 ? "0" : BORDER,
                          borderLeft: c === 0 ? "0" : BORDER,
                          borderRight: "0",
                          borderBottom: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                          cursor: isPlayerCell || isEnemyCell ? "pointer" : "default",
                          boxSizing: "border-box",
                          position: "relative",
                        },
                      },
                      d &&
                        React.createElement(
                          "div",
                          {
                            onPointerDown: isPlayerCell ? (e) => startPointerSession(e, true) : undefined,
                            style: {
                              position: "relative",
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              touchAction: isPlayerCell ? "none" : undefined,
                              cursor: isPlayerCell ? "grab" : undefined,
                            },
                          },
                          React.createElement("span", { style: { position: "absolute", top: 1, left: 2, fontSize: 9, lineHeight: 1, pointerEvents: "none" } }, TYPE_EMOJI[d.type] || ""),
                          React.createElement("span", { style: { position: "absolute", top: 1, right: 2, fontSize: 9, lineHeight: 1, pointerEvents: "none" } }, attackIcon(d)),
                          React.createElement(CreatureIcon, { def: d, size: 32 })
                        )
                    );
                  })
                ).flat()
              )
            ),
            // Side panel -- mirrors ArenaScreen's planning-phase enemy/ally
            // panels: name/type/level header, minimize toggle, abilities.
            // Shown for either the enemy (tap) or the player's creature
            // (press-and-hold), one at a time.
            sidePanel &&
              (() => {
                const panelDef = sidePanel.type === "enemy" ? enemyDef : pickedDef;
                const subtitle =
                  panelDef.type + " · " + (panelDef.attackType || "Melee") + " · Lv." +
                  (sidePanel.type === "enemy" ? TUTORIAL_ENEMY_LEVEL : 1) +
                  " · " + (sidePanel.type === "enemy" ? "Enemy" : "Ally");
                const minimized = sidePanel.minimized;
                return React.createElement(
                  "div",
                  { style: { flex: 1, minWidth: 0, background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", position: "relative" } },
                  React.createElement(
                    "button",
                    {
                      onClick: (e) => { e.stopPropagation(); setSidePanel((p) => ({ ...p, minimized: !p.minimized })); },
                      style: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: "#f0f0f0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 },
                    },
                    minimized ? "＋" : "－"
                  ),
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: minimized ? 0 : 12 } },
                    React.createElement(CreatureIcon, { def: panelDef, size: 28 }),
                    React.createElement(
                      "div",
                      null,
                      React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#111" } }, panelDef.name),
                      React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, subtitle)
                    )
                  ),
                  !minimized &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "div",
                        { style: { fontSize: 9, fontWeight: 700, color: "#888", marginBottom: 2, display: "flex", justifyContent: "space-between" } },
                        React.createElement("span", null, "HP"),
                        React.createElement("span", null, panelDef.stats.hp)
                      ),
                      React.createElement(
                        "div",
                        { style: { height: 6, background: "#eee", borderRadius: 3, overflow: "hidden", marginBottom: 10 } },
                        React.createElement("div", { style: { height: "100%", width: "100%", background: "#22c55e", borderRadius: 3 } })
                      ),
                      Object.entries(panelDef.abilities).map(([k, abl]) => {
                        if (!abl) return null;
                        return React.createElement(
                          "div",
                          { key: k, style: { marginBottom: 10 } },
                          React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 } }, k === "unique" ? "Passive" : k === "basic" ? "Basic" : "Special"),
                          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#111" } }, abl.name),
                          React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 2 } }, abl.upgrades ? abl.upgrades[0] : "")
                        );
                      })
                    )
                );
              })()
          ),
          // roster tray
          React.createElement(
            "div",
            {
              ref: trayRef,
              style: { background: "#fff", borderTop: "1px solid #e0e0e0", padding: "10px 12px 24px", flexShrink: 0 },
            },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 } },
              React.createElement("span", { style: { fontSize: 22, fontWeight: 800, color: "#111" } }, deployed ? 1 : 0),
              React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#aaa" } }, "/1 deployed")
            ),
            React.createElement(
              "div",
              { style: { display: "flex", gap: 6 } },
              React.createElement(
                "div",
                {
                  onPointerDown: !playerCell ? (e) => startPointerSession(e, false) : undefined,
                  onClick: (e) => {
                    e.stopPropagation();
                    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
                    if (!playerCell) setPlayerCell(TUTORIAL_PLAYER_CELL);
                  },
                  style: {
                    width: 52,
                    height: 58,
                    position: "relative",
                    background: deployed ? "#f0f0f0" : "#fff",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    cursor: deployed ? "default" : "grab",
                    touchAction: deployed ? undefined : "none",
                  },
                },
                React.createElement(
                  "div",
                  { style: { opacity: deployed ? 0.4 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
                  React.createElement(
                    "div",
                    { style: { position: "relative", lineHeight: 1 } },
                    React.createElement("div", { style: { position: "absolute", top: -2, left: -6, fontSize: 10, lineHeight: 1 } }, TYPE_EMOJI[pickedDef.type] || ""),
                    React.createElement("div", { style: { position: "absolute", top: -2, right: -6, fontSize: 10, lineHeight: 1 } }, attackIcon(pickedDef)),
                    React.createElement(CreatureIcon, { def: pickedDef, size: 24, style: { marginTop: 6 } })
                  ),
                  React.createElement("div", { style: { fontSize: 8, color: "#333", fontWeight: 600, textAlign: "center", lineHeight: 1.2, maxWidth: 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, pickedDef.name),
                  React.createElement("div", { style: { fontSize: 8, color: "#666", fontWeight: 700 } }, "Lv.1")
                )
              )
            )
          ),
          // Ghost that follows the pointer during a custom drag.
          isDragging &&
            React.createElement(
              "div",
              {
                style: {
                  position: "fixed",
                  left: ghostPos.x,
                  top: ghostPos.y,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  zIndex: 600,
                  opacity: 0.85,
                  filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
                },
              },
              React.createElement(CreatureIcon, { def: pickedDef, size: 40 })
            )
        );
      })(),
    // The tutorial's fight, running the same tick simulation real Arena
    // battles use (see runBattleTick/startBattleRenderLoop above) rather
    // than a scripted stand-in.
    phase === "battle" &&
      pickedDef &&
      (() => {
        const snap = battleSnap || { playerUnits: [], enemyUnits: [], damageDealt: {} };
        const allUnits = [...snap.playerUnits, ...snap.enemyUnits];
        return React.createElement(
          "div",
          { style: { position: "absolute", inset: 0, background: "#f5f5f5", display: "flex", flexDirection: "column" } },
          React.createElement(
            "div",
            { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 16px 12px", flexShrink: 0, background: "#fff", borderBottom: "1px solid #e0e0e0" } },
            !battleOutcome &&
              React.createElement(
                "button",
                {
                  onClick: (e) => { e.stopPropagation(); skipBattle(); },
                  style: {
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 8,
                    color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 10px",
                  },
                },
                "Skip"
              )
          ),
          React.createElement(
            "div",
            { style: { flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 } },
            React.createElement(
              "div",
              {
                style: {
                  width: TUTORIAL_GRID_COLS * TUTORIAL_TILE,
                  height: TUTORIAL_GRID_ROWS * TUTORIAL_TILE,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  border: "1px solid #bbb",
                  position: "relative",
                },
              },
              React.createElement(
                "div",
                { style: { position: "absolute", top: 0, left: 0, display: "grid", gridTemplateColumns: "repeat(" + TUTORIAL_GRID_COLS + "," + TUTORIAL_TILE + "px)", gridTemplateRows: "repeat(" + TUTORIAL_GRID_ROWS + "," + TUTORIAL_TILE + "px)", gap: 0 } },
                Array.from({ length: TUTORIAL_GRID_ROWS }, (_, r) =>
                  Array.from({ length: TUTORIAL_GRID_COLS }, (_, c) => {
                    const isPlayerZone = r >= TUTORIAL_PLAYER_ZONE_START_ROW;
                    const isDivider = r === TUTORIAL_PLAYER_ZONE_START_ROW;
                    const BORDER = "1px solid #bbb";
                    return React.createElement("div", {
                      key: r + "," + c,
                      style: {
                        width: TUTORIAL_TILE,
                        height: TUTORIAL_TILE,
                        boxSizing: "border-box",
                        background: isPlayerZone ? "#f0f0f0" : "#fdf7f7",
                        borderTop: isDivider ? "2.5px solid #534AB7" : r === 0 ? "0" : BORDER,
                        borderLeft: c === 0 ? "0" : BORDER,
                        borderRight: "0",
                        borderBottom: "0",
                      },
                    });
                  })
                ).flat()
              ),
              battleAtkEffects.map((e) => {
                const color = e.isEnemy ? "#ef4444" : "#a78bfa";
                if (e.isRanged) {
                  const dRow = e.row - e.fromRow, dCol = e.col - e.fromCol;
                  const dist = Math.sqrt(dRow * dRow + dCol * dCol) || 1;
                  const dur = Math.round(300 + dist * 50);
                  return React.createElement("div", {
                    key: e.id,
                    ref: (el) => { if (!el) return; el.getBoundingClientRect(); el.style.left = (e.col * TUTORIAL_TILE + TUTORIAL_TILE / 2) + "px"; el.style.top = (e.row * TUTORIAL_TILE + TUTORIAL_TILE / 2) + "px"; el.style.opacity = "0"; },
                    style: {
                      position: "absolute", left: e.fromCol * TUTORIAL_TILE + TUTORIAL_TILE / 2, top: e.fromRow * TUTORIAL_TILE + TUTORIAL_TILE / 2,
                      width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: "0 0 6px " + color,
                      transform: "translate(-50%,-50%)", transition: "left " + dur + "ms linear,top " + dur + "ms linear,opacity " + (dur * 0.3) + "ms linear " + (dur * 0.7) + "ms",
                      pointerEvents: "none", zIndex: 20,
                    },
                  });
                }
                return React.createElement(
                  React.Fragment, { key: e.id },
                  React.createElement("div", {
                    style: {
                      position: "absolute", left: e.fromCol * TUTORIAL_TILE + TUTORIAL_TILE / 2, top: e.fromRow * TUTORIAL_TILE + TUTORIAL_TILE / 2,
                      width: TUTORIAL_TILE * 1.1, height: TUTORIAL_TILE * 1.1, borderRadius: "50%",
                      background: e.isEnemy ? "rgba(239,68,68,0.35)" : "rgba(99,102,241,0.35)",
                      border: "2px solid " + (e.isEnemy ? "#ef4444" : "#6366f1"),
                      animation: "meleeSwing 0.4s ease-out forwards", pointerEvents: "none", zIndex: 19, transform: "translate(-50%,-50%)",
                    },
                  }),
                  React.createElement("div", {
                    style: {
                      position: "absolute", left: e.col * TUTORIAL_TILE + TUTORIAL_TILE / 2, top: e.row * TUTORIAL_TILE + TUTORIAL_TILE / 2,
                      width: TUTORIAL_TILE * 0.85, height: TUTORIAL_TILE * 0.85, borderRadius: "50%", background: color,
                      animation: "atkImpact 0.55s ease-out forwards", pointerEvents: "none", zIndex: 20, transform: "translate(-50%,-50%)",
                    },
                  })
                );
              }),
              allUnits.map((u) =>
                React.createElement(
                  "div",
                  {
                    key: "bu" + u.uid,
                    ref: (el) => {
                      if (el) {
                        const hpEl = el.querySelector(".tut-hp-fill");
                        battleUnitDomRefs.current.set(u.uid, { el, hpEl });
                        el.style.left = (u.col * TUTORIAL_TILE) + "px";
                        el.style.top = (u.row * TUTORIAL_TILE) + "px";
                      } else {
                        battleUnitDomRefs.current.delete(u.uid);
                      }
                    },
                    style: { position: "absolute", width: TUTORIAL_TILE, height: TUTORIAL_TILE, display: "flex", alignItems: "center", justifyContent: "center", opacity: u.hp > 0 ? 1 : 0, zIndex: 5 },
                  },
                  React.createElement(CreatureIcon, { def: CREATURE_MAP[u.creatureId] || { emoji: "❓" }, size: 32 }),
                  (u.abilFlashTicks || 0) > 0 && React.createElement("div", { style: { position: "absolute", top: 1, left: "50%", transform: "translateX(-50%)", fontSize: 13, fontWeight: 900, color: "#3b82f6", textShadow: "0 0 3px #fff, 0 0 3px #fff", lineHeight: 1, pointerEvents: "none" } }, "!"),
                  React.createElement(
                    "div",
                    { style: { position: "absolute", bottom: 3, left: 4, right: 4, height: 4, background: "#ddd", borderRadius: 2, overflow: "hidden" } },
                    React.createElement("div", { className: "tut-hp-fill", style: { height: "100%", width: (u.hp / u.maxHp * 100) + "%", background: u.uid[0] === "e" ? "#ef4444" : "#22c55e", borderRadius: 2 } })
                  ),
                  (u.abilChargeMax || 0) > 0 && React.createElement(
                    "div",
                    { style: { position: "absolute", bottom: 0, left: 4, right: 4, height: 2, background: "#dbeafe", borderRadius: 2, overflow: "hidden" } },
                    // Snap (no transition) around the fire so the bar visibly
                    // hits 100% instead of easing down from mid-animation.
                    React.createElement("div", { style: { height: "100%", width: (Math.min(1, (u.abilCharge || 0) / u.abilChargeMax) * 100) + "%", background: "#3b82f6", borderRadius: 2, transition: (u.abilFlashTicks || 0) > 0 ? "none" : "width 0.35s linear" } })
                  )
                )
              )
            )
          ),
          battleOutcome &&
            React.createElement(
              "div",
              { style: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, padding: "14px 28px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", textAlign: "center", animation: "fadeInCentered .35s ease-out", zIndex: 5 } },
              React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: battleOutcome === "won" ? "#2e7d32" : "#ef4444" } }, battleOutcome === "won" ? "Victory!" : "Defeat!"),
              // "won" waits for the player to tap to continue (see advance());
              // "lost" is an unreachable fallback given the balance in
              // startBattle(), but keeps a manual way out just in case.
              battleOutcome === "won" &&
                React.createElement("div", { style: { fontSize: 11, color: "#999", marginTop: 4 } }, "Tap to continue"),
              battleOutcome === "lost" &&
                React.createElement(
                  "button",
                  {
                    onClick: (e) => { e.stopPropagation(); setTutorialRestricted(true); setTutorialStep("collection"); setTutorialSeen(true); },
                    style: { marginTop: 10, padding: "10px 28px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" },
                  },
                  "Continue"
                )
            )
        );
      })()
  );
}

export default TutorialOverlay;
