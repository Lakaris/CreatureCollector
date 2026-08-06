// Application root: tab/gameMode routing and the app shell.
// Global state lives in src/state/GameContext.js; screens read it directly,
// so App only wires up navigation callbacks.
import React from "./react.js";

import { TYPE_EMOJI } from "./data/types.js";
import { DUNGEON_BOSSES } from "./data/bosses.js";
import { DEV_MODE } from "./config.js";
import { useGame } from "./state/GameContext.js";

import CreatureOverlayHost from "./ui/components/CreatureOverlayHost.js";
import CollectionScreen from "./ui/screens/CollectionScreen.js";
import GachaScreen from "./ui/screens/GachaScreen.js";
import DevPanel from "./ui/screens/DevPanel.js";
import FarmScreen from "./ui/screens/FarmScreen.js";
import TreasureScreen from "./ui/screens/TreasureScreen.js";
import StoreScreen from "./ui/screens/StoreScreen.js";
import EquipmentScreen from "./ui/screens/EquipmentScreen.js";
import HomeScreen from "./ui/screens/HomeScreen.js";
import SettingsScreen from "./ui/screens/SettingsScreen.js";
import DungeonScreen from "./ui/screens/battle/DungeonScreen.js";
import DailyBossScreen from "./ui/screens/battle/DailyBossScreen.js";
import ArenaScreen from "./ui/screens/battle/ArenaScreen.js";
import LabyrinthScreen from "./ui/screens/battle/LabyrinthScreen.js";

const TABS = [
  { id: "home", icon: "ti-home", label: "Home" },
  { id: "hatch", icon: "ti-egg", label: "Hatch" },
  { id: "collection", icon: "ti-layout-grid", label: "Collection" },
  { id: "play", icon: "ti-sword", label: "Play" },
  { id: "farm", icon: "ti-plant", label: "Farm" },
  { id: "equipment", icon: "ti-tool", label: "Equipment" },
  { id: "store", icon: "ti-shopping-cart", label: "Store" },
];

const CARD_BASE = {
  background: "#fff",
  border: "2px solid #e0e0e0",
  borderRadius: 12,
  padding: "22px 18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 14,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

/** Two-digit clock parts for the "resets in" countdown. */
function countdownParts(from, to) {
  const s = Math.max(0, Math.floor((to - from) / 1000));
  return [
    String(Math.floor(s / 3600)).padStart(2, "0"),
    String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    String(s % 60).padStart(2, "0"),
  ].join(":");
}

/** Next noon strictly after `now`. Daily boss rewards unlock on this boundary. */
function nextNoon(now) {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

function NavBar({ tab, setTab, onNavigate, style }) {
  return React.createElement(
    "div",
    { className: "nav", style },
    TABS.map((t) =>
      React.createElement(
        "button",
        {
          key: t.id,
          className: "nav-btn" + (tab === t.id ? " active" : ""),
          onClick: () => {
            setTab(t.id);
            if (onNavigate) onNavigate();
          },
        },
        React.createElement("i", { className: "ti " + t.icon, "aria-hidden": "true" }),
        t.label
      )
    )
  );
}

/** The Daily Boss entry card, including its reward-availability state machine. */
function DailyBossCard() {
  const { nowMs, devTimeOffset, dailyBossData, dailyBossLevel, setGameMode } = useGame();

  const now = new Date(nowMs + devTimeOffset);
  const isToday = dailyBossData.date === now.toDateString();
  const delivered = dailyBossData.delivered;
  const qualified = dailyBossData.qualified;
  const attemptsLeft = Math.max(0, 3 - (isToday ? dailyBossData.fights || 0 : 0));
  const fightDate = qualified && dailyBossData.date ? new Date(dailyBossData.date) : null;
  const rewardAt = fightDate ? nextNoon(fightDate) : null;
  const canCollect = !!(qualified && !delivered && rewardAt && now >= rewardAt);
  const boss = DUNGEON_BOSSES[((dailyBossLevel || 1) - 1) % DUNGEON_BOSSES.length];

  return React.createElement(
    "div",
    {
      onClick: () => setGameMode("dailyboss"),
      style: {
        ...CARD_BASE,
        padding: "16px 18px",
        background: delivered ? "#f5f5f5" : "linear-gradient(135deg,#f0effe,#e8e4ff)",
        border: "2px solid " + (delivered ? "#e0e0e0" : "#a89cf7"),
      },
    },
    React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, TYPE_EMOJI[boss.type] || "👾"),
    React.createElement(
      "div",
      { style: { flex: 1 } },
      React.createElement(
        "div",
        { style: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: delivered ? "#999" : "#111" } },
        "Daily Boss"
      ),
      delivered
        ? React.createElement("div", { style: { fontSize: 12, color: "#bbb" } }, "Completed · returns tomorrow")
        : canCollect
        ? React.createElement("div", { style: { fontSize: 12, color: "#e8a000", fontWeight: 600 } }, "🎁 Rewards ready to collect!")
        : React.createElement(
            "div",
            { style: { display: "flex", gap: 6, alignItems: "center" } },
            React.createElement(
              "span",
              { style: { background: "#534AB7", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } },
              "Lv. " + dailyBossLevel
            ),
            React.createElement(
              "span",
              { style: { color: "#534AB7", fontSize: 12, fontWeight: 700 } },
              attemptsLeft + "/3 Attempts Left"
            )
          )
    ),
    delivered && React.createElement("div", { style: { fontSize: 20 } }, "✅"),
    canCollect && React.createElement("div", { style: { fontSize: 20 } }, "🎁"),
    !delivered &&
      !canCollect &&
      React.createElement(
        "div",
        { style: { textAlign: "right", flexShrink: 0 } },
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", whiteSpace: "nowrap" } }, "Resets in"),
        React.createElement(
          "div",
          { style: { fontSize: 12, fontWeight: 700, color: "#888", fontVariantNumeric: "tabular-nums" } },
          countdownParts(now, nextNoon(now))
        )
      )
  );
}

/** Reveal-one-at-a-time list of farm harvest results. */
function HarvestPopup() {
  const { harvestPopup, revealedCount, setHarvestPopup } = useGame();
  if (!harvestPopup) return null;
  return React.createElement(
    "div",
    { style: { position: "fixed", inset: 0, background: "#f5f5f5", display: "flex", flexDirection: "column", zIndex: 9999 } },
    React.createElement(
      "div",
      { style: { padding: "40px 24px 0", fontSize: 20, fontWeight: 700, color: "#333", textAlign: "center", marginBottom: 20 } },
      "🌾 Harvest Results"
    ),
    React.createElement(
      "div",
      { style: { flex: 1, overflowY: "auto", padding: "0 24px", display: "flex", flexWrap: "wrap", gap: 10, alignContent: "flex-start" } },
      harvestPopup.slice(0, revealedCount).map((item, i) =>
        React.createElement(
          "div",
          { key: i, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animation: "fadeIn .25s ease" } },
          React.createElement("span", { style: { fontSize: 24 } }, item.emoji),
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1 } }, item.label),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#2e7d32" } }, "+" + item.amount)
          )
        )
      )
    ),
    React.createElement(
      "div",
      { style: { padding: "16px 24px 32px" } },
      revealedCount >= harvestPopup.length &&
        React.createElement(
          "button",
          {
            onClick: () => setHarvestPopup(null),
            style: { width: "100%", padding: "14px 0", background: "#4caf50", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: "pointer" },
          },
          "Collect!"
        )
    )
  );
}

function App() {
  const {
    tab, setTab, gameMode, setGameMode,
    harvestPopup,
    collectionDeepLink, setCollectionDeepLink,
    setCreatureOverlay,
    setDungeonsCleared, setArenaFights, setLabyrinthFights, setEggsHatched, setBananasUsed, setPlotsGrown,
    settingsOpen, setSettingsOpen, labyrinthDepth,
  } = useGame();

  const contentRef = React.useRef(null);
  const viewCreature = (id) => setCreatureOverlay(id);

  // ── Settings: its own full-screen page, no bottom nav ─────────────────────
  if (settingsOpen)
    return React.createElement(
      "div",
      { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5" } },
      React.createElement(SettingsScreen, { onBack: () => setSettingsOpen(false) })
    );

  // ── Full-screen game modes ───────────────────────────────────────────────
  if (tab === "play" && gameMode === "dungeon")
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(DungeonScreen, {
        onBack: () => setGameMode(null),
        onClear: (n) => setDungeonsCleared((c) => c + n),
        onViewCreature: viewCreature,
      }),
      React.createElement(CreatureOverlayHost)
    );

  if (tab === "play" && gameMode === "dailyboss")
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(DailyBossScreen, {
        onBack: () => setGameMode(null),
        onViewCreature: viewCreature,
      }),
      React.createElement(CreatureOverlayHost)
    );

  if (tab === "play" && gameMode === "arena")
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(ArenaScreen, {
        onBack: () => setGameMode(null),
        onFight: () => setArenaFights((c) => c + 1),
        onViewCreature: viewCreature,
      }),
      React.createElement(CreatureOverlayHost)
    );

  if (tab === "play" && gameMode === "labyrinth")
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(LabyrinthScreen, {
        onBack: () => setGameMode(null),
        onFight: () => setLabyrinthFights((c) => c + 1),
        onViewCreature: viewCreature,
      }),
      React.createElement(CreatureOverlayHost)
    );

  if (tab === "play" && gameMode === "treasure")
    return React.createElement(TreasureScreen, { onBack: () => setGameMode(null) });

  if (tab === "play" && gameMode === "farm")
    return React.createElement(FarmScreen, {
      onBack: () => setGameMode(null),
      onPlant: () => setPlotsGrown((c) => c + 1),
      onGoToStore: () => setTab("store"),
    });

  // ── Farm tab: full-bleed screen with its own nav overlay ──────────────────
  if (tab === "farm")
    return React.createElement(
      "div",
      { style: { position: "fixed", inset: 0 } },
      React.createElement(FarmScreen, {
        onBack: null,
        onPlant: () => setPlotsGrown((c) => c + 1),
        onGoToStore: () => setTab("store"),
      }),
      !harvestPopup &&
        React.createElement(
          "div",
          { style: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(245,245,245,0.95)", backdropFilter: "blur(8px)" } },
          React.createElement(NavBar, { tab, setTab })
        ),
      React.createElement(HarvestPopup)
    );

  // ── Play menu ────────────────────────────────────────────────────────────
  if (tab === "play")
    return React.createElement(
      "div",
      { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5" } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "16px 16px 12px", flexShrink: 0 } },
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700 } }, "Play")
      ),
      React.createElement(
        "div",
        { style: { padding: "20px 16px 0", flex: 1, overflowY: "auto" } },
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement(
            "div",
            { onClick: () => setGameMode("arena"), style: CARD_BASE },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, "🏟️"),
            React.createElement("div", null, React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 2 } }, "Arena"))
          ),
          React.createElement(
            "div",
            { onClick: () => setGameMode("dungeon"), style: CARD_BASE },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, "🏰"),
            React.createElement("div", null, React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 2 } }, "Dungeon"))
          ),
          React.createElement(
            "div",
            { onClick: () => setGameMode("labyrinth"), style: CARD_BASE },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, "🌀"),
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 2 } }, "Labyrinth"),
              React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "Floor " + (labyrinthDepth || 1))
            )
          ),
          React.createElement(DailyBossCard),
          React.createElement(
            "div",
            {
              onClick: () => setGameMode("treasure"),
              style: { ...CARD_BASE, background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "2px solid #fbbf24" },
            },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, "💰"),
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 2 } }, "Treasure"),
              React.createElement("div", { style: { fontSize: 12, color: "#d97706" } }, "Open Mysterious Ore for treasures")
            )
          )
        )
      ),
      React.createElement(
        "div",
        { style: { background: "#f5f5f5" } },
        React.createElement(NavBar, { tab, setTab, onNavigate: () => window.scrollTo(0, 0) })
      )
    );

  // ── Default shell ────────────────────────────────────────────────────────
  return React.createElement(
    "div",
    { className: "app" },
    React.createElement("h2", { className: "sr-only" }, "Creature Collector"),
    React.createElement(
      "div",
      { className: "app-content", ref: contentRef },
      tab === "home" && React.createElement(HomeScreen),
      tab === "hatch" && React.createElement(GachaScreen, { onHatch: (n) => setEggsHatched((c) => c + n) }),
      tab === "collection" &&
        React.createElement(CollectionScreen, {
          onBananaUsed: () => setBananasUsed((c) => c + 1),
          deepLinkId: collectionDeepLink,
          onDeepLinkConsumed: () => setCollectionDeepLink(null),
        }),
      tab === "store" && React.createElement(StoreScreen),
      tab === "equipment" && React.createElement(EquipmentScreen),
      tab !== "home" && DEV_MODE && React.createElement(DevPanel),
      React.createElement("div", { style: { height: 12 } })
    ),
    React.createElement(NavBar, {
      tab,
      setTab,
      onNavigate: () => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
      },
    }),
    React.createElement(CreatureOverlayHost)
  );
}

export default App;
