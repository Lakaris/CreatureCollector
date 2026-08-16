// Application root: tab/gameMode routing and the app shell.
// Global state lives in src/state/GameContext.js; screens read it directly,
// so App only wires up navigation callbacks.
import React from "./react.js";

import { TYPE_EMOJI } from "./data/types.js";
import { DUNGEON_BOSSES } from "./data/bosses.js";
import { CREATURE_MAP } from "./data/creatures.js";
import { DEV_MODE } from "./config.js";
import { useGame } from "./state/GameContext.js";
import { easternNoonDayKey, isPastEasternNoon, nextEasternNoon } from "./core/dates.js";
import { formatNum } from "./core/format.js";

import CreatureOverlayHost from "./ui/components/CreatureOverlayHost.js";
import TutorialOverlay from "./ui/components/TutorialOverlay.js";
import NavBar, { TABS } from "./ui/components/NavBar.js";
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

// Shown on a Play-page feature card from the moment it unlocks until the
// player first taps it -- see newFeaturePillsSeen in GameContext.js.
const NEW_PILL = { fontSize: 9, fontWeight: 800, color: "#fff", background: "#ef4444", borderRadius: 6, padding: "2px 6px", letterSpacing: 0.3, flexShrink: 0 };

/** Two-digit clock parts for the "resets in" countdown. */
function countdownParts(from, to) {
  const s = Math.max(0, Math.floor((to - from) / 1000));
  return [
    String(Math.floor(s / 3600)).padStart(2, "0"),
    String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    String(s % 60).padStart(2, "0"),
  ].join(":");
}

/** The Daily Boss entry card, including its reward-availability state machine. */
function DailyBossCard({ locked, onLockedTap, disabled }) {
  const { nowMs, devTimeOffset, dailyBossData, dailyBossLevel, setGameMode, newFeaturePillsSeen, setNewFeaturePillsSeen } = useGame();
  const showNewPill = !locked && !newFeaturePillsSeen.dailyBoss;
  function openDailyBoss() {
    if (!newFeaturePillsSeen.dailyBoss) setNewFeaturePillsSeen((prev) => ({ ...prev, dailyBoss: true }));
    setGameMode("dailyboss");
  }

  if (locked)
    return React.createElement(
      "div",
      { onClick: disabled ? undefined : onLockedTap, style: { ...CARD_BASE, padding: "16px 18px", background: "#f5f5f5", border: "2px solid #e0e0e0", cursor: disabled ? "default" : "pointer" } },
      React.createElement("div", { style: { fontSize: 36, lineHeight: 1, opacity: 0.5 } }, "🔒"),
      React.createElement(
        "div",
        { style: { flex: 1 } },
        React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#999" } }, "Daily Boss"),
        React.createElement("div", { style: { fontSize: 12, color: "#aaa" } }, "Unlocks via progression quest")
      )
    );

  const nowTs = nowMs + devTimeOffset;
  const isToday = !isPastEasternNoon(dailyBossData.date, nowTs);
  const delivered = dailyBossData.delivered;
  const qualified = dailyBossData.qualified;
  const attemptsLeft = Math.max(0, 3 - (isToday ? dailyBossData.fights || 0 : 0));
  const rewardAt = qualified && dailyBossData.date ? nextEasternNoon(nowTs) : null;
  const canCollect = !!(qualified && !delivered && rewardAt && nowTs >= rewardAt);
  const boss = DUNGEON_BOSSES[((dailyBossLevel || 1) - 1) % DUNGEON_BOSSES.length];

  return React.createElement(
    "div",
    {
      onClick: disabled ? undefined : openDailyBoss,
      style: {
        ...CARD_BASE,
        padding: "16px 18px",
        background: delivered ? "#f5f5f5" : "linear-gradient(135deg,#f0effe,#e8e4ff)",
        border: "2px solid " + (delivered ? "#e0e0e0" : "#a89cf7"),
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      },
    },
    React.createElement("div", { style: { fontSize: 36, lineHeight: 1 } }, TYPE_EMOJI[boss.type] || "👾"),
    React.createElement(
      "div",
      { style: { flex: 1 } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: delivered ? "#999" : "#111" } }, "Daily Boss"),
        showNewPill && React.createElement("div", { style: NEW_PILL }, "NEW")
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
              attemptsLeft + " / 3 Attempts Left"
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
          countdownParts(nowTs, nextEasternNoon(nowTs))
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
          { key: i, style: { display: "flex", alignItems: "center", gap: 8, width: 160, padding: "8px 12px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animation: "fadeIn .25s ease" } },
          React.createElement("span", { style: { fontSize: 24, flexShrink: 0 } }, item.emoji),
          React.createElement(
            "div",
            { style: { minWidth: 0 } },
            React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, item.label),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#2e7d32" } }, "+" + formatNum(item.amount))
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
          "Collect"
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
    setDungeonsCleared, setDungeonAutoFights, setArenaFights, setLabyrinthFights, setEggsHatched, setBananasUsed, setCandyUsed, setPlotsGrown,
    settingsOpen, setSettingsOpen,
    tutorialSeen, tutorialRestricted, setTutorialRestricted, tutorialStep, setTutorialStep,
    owned,
    dungeonsUnlocked, dailyBossUnlocked, arenaUnlocked, treasureUnlocked,
    newFeaturePillsSeen, setNewFeaturePillsSeen,
    flairGuideStep, setFlairGuideStep,
    candyGuideStep, setCandyGuideStep,
    farmGuideStep, setFarmGuideStep,
    equipmentDetailOpen,
  } = useGame();

  const contentRef = React.useRef(null);
  const [playLockedMsg, setPlayLockedMsg] = React.useState(null);
  React.useEffect(() => {
    if (!playLockedMsg) return;
    const t = setTimeout(() => setPlayLockedMsg(null), 2200);
    return () => clearTimeout(t);
  }, [playLockedMsg]);

  // The "Use 1 Flair Banana" quest's guided arrows aren't a lockdown -- the
  // player can tap anything else at any point, it just cancels the guide.
  // A single capture-phase listener (fires before any button's own onClick)
  // checks the click against whatever the current step's target is tagged
  // with (data-guide-target); anything else clears flairGuideStep. The
  // matching element's own onClick is what advances to the next step.
  React.useEffect(() => {
    if (!flairGuideStep) return;
    function onClick(e) {
      if (!e.target.closest('[data-guide-target="' + flairGuideStep + '"]')) setFlairGuideStep(null);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [flairGuideStep]);
  // Same idea as the flairGuideStep watcher above, for the "Use a Candy"
  // quest's guide.
  React.useEffect(() => {
    if (!candyGuideStep) return;
    function onClick(e) {
      if (!e.target.closest('[data-guide-target="' + candyGuideStep + '"]')) setCandyGuideStep(null);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [candyGuideStep]);
  // Same idea again, for the "Use 1 Ancient Fertilizer" quest's single-step
  // guide (an arrow at the Field's Upgrade button).
  React.useEffect(() => {
    if (!farmGuideStep) return;
    function onClick(e) {
      if (!e.target.closest('[data-guide-target="' + farmGuideStep + '"]')) setFarmGuideStep(null);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [farmGuideStep]);
  const viewCreature = (id) => setCreatureOverlay(id);
  const starterName = (() => {
    const first = Object.values(owned || {})[0];
    return first ? (CREATURE_MAP[first.id]?.name || "your creature") : "your creature";
  })();

  // Home and Farm are the only tabs reachable while tutorialRestricted (every
  // other nav button is locked, see NavBar), so this only needs wiring into
  // those two branches below.
  const restrictedSkipButton =
    tutorialRestricted &&
    React.createElement(
      "button",
      {
        onClick: () => setTutorialRestricted(false),
        style: {
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 50,
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          color: "#888",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: "6px 10px",
        },
      },
      "Skip tutorial"
    );

  // Banner + arrow pointing at a bottom-nav tab, used whenever the tutorial
  // hands the player off from wherever they are to a specific tab next.
  // Horizontal position is derived from the tab's index so it always lines
  // up with NavBar's own layout (evenly split across TABS.length columns).
  // `text` is optional -- pass null/undefined for an arrow-only nudge when
  // the destination doesn't need re-explaining. `textBottom` overrides the
  // text box's default `bottom: 150` for a hand-off shown while still
  // standing on a screen whose own bottom-of-card buttons would otherwise
  // sit underneath it (e.g. Farm's Speed Up / Upgrade Field) -- the arrow
  // stays pinned at `bottom: 80` regardless, since it's just pointing at the
  // destination tab and never overlaps anything.
  function navHandoff(text, tabId, textBottom = 150) {
    const idx = TABS.findIndex((t) => t.id === tabId);
    const leftPct = ((idx + 0.5) / TABS.length) * 100 + "vw";
    return React.createElement(
      React.Fragment,
      null,
      text &&
        React.createElement(
          "div",
          {
            style: {
              position: "fixed", left: 16, right: 16, bottom: textBottom,
              background: "#fff", border: "2px solid #534AB7", borderRadius: 16,
              padding: "14px 16px", fontSize: 14, color: "#333", lineHeight: 1.4,
              boxShadow: "0 4px 16px rgba(0,0,0,0.14)", zIndex: 60,
            },
          },
          text
        ),
      React.createElement(
        "div",
        {
          style: {
            position: "fixed", left: leftPct, bottom: 80, transform: "translate(-50%,0)",
            fontSize: 32, color: "#534AB7", animation: "pointerBounce 1s ease-in-out infinite",
            zIndex: 60, pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
          },
        },
        "⬇️"
      )
    );
  }

  // Shown once the Iron Band is equipped: the tutorial hands the player off
  // to the Farm tab next, so this points at it regardless of which unlocked
  // screen (Collection or its creature-detail overlay) they're currently on.
  const farmPointer =
    tutorialStep === "farm" && navHandoff("Your new friend seems to have found something and is beckoning you to follow.", "farm");

  // Shown right after harvesting: hands the player off to Collection for a
  // level-up detour before they're allowed back to Home/Descend. Shown while
  // still standing on Farm, so the text box is raised well above its default
  // position -- Farm's own Speed Up / Upgrade Field buttons live right where
  // the default `bottom: 150` would otherwise sit.
  const levelupNavPointer =
    tutorialStep === "levelupNav" && navHandoff("Let's level up " + starterName + ".", "collection", 260);

  // Shown as soon as the player's leveled their creature up once (see
  // CreatureDetail's doLevelUp): hands off to the Equipment tab so they can
  // upgrade the Iron Band too. Only requiring one level-up here (rather than
  // a fixed target level) means it can never be softlocked by the food-cost
  // curve outpacing the guided harvest's fixed food amount.
  const toEquipmentPointer =
    tutorialStep === "toEquipment" && navHandoff("Now let's level up the Iron Band.", "equipment");

  // Shown once the Iron Band's been upgraded once: hands off back to Home,
  // where the tutorial resumes at the Descend step.
  const toHomeFinalPointer =
    tutorialStep === "toHome" && navHandoff(null, "home");

  // Shown right after the Set 1 Progression reward (Dungeon + Daily Boss)
  // is claimed and the player backs out to Home: hands off to the Play tab,
  // where the second half of this reveal (an arrow at the Dungeon card
  // itself) picks up -- see the tab === "play" branch below.
  const dungeonRevealPointer =
    tutorialRestricted && tutorialStep === "dungeonReveal" &&
    navHandoff("The ground begins to shake and a new structure rises up from the ground.", "play");

  // Shown right after Exiting floor 10's win screen (the first Ancient
  // Fertilizer): hands off to Farm, where the rest of this restricted flow
  // (lock everything but Upgrade Field, then the closing message) lives in
  // FarmScreen.js.
  const fertilizerRevealPointer =
    tutorialRestricted && tutorialStep === "fertilizerReveal" &&
    navHandoff("As you defeat the last creature, a small bag of fertilizer brimming with magical energy drops to the ground.", "farm");

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
        onAutoFight: () => setDungeonAutoFights((c) => c + 1),
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
      React.createElement(HarvestPopup),
      restrictedSkipButton,
      levelupNavPointer
    );

  // ── Play menu ────────────────────────────────────────────────────────────
  if (tab === "play") {
    // Second half of the post-Set-1 Dungeon reveal (see dungeonRevealPointer
    // above): every other card is inert and dimmed, only Dungeon responds.
    const dungeonPointActive = tutorialRestricted && tutorialStep === "dungeonPoint";
    return React.createElement(
      "div",
      { style: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f5" } },
      playLockedMsg &&
        React.createElement(
          "div",
          { style: { position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", zIndex: 300, pointerEvents: "none", animation: "toastFade 2.2s ease-in-out" } },
          playLockedMsg
        ),
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
            {
              onClick: () => {
                if (dungeonPointActive) return;
                if (!arenaUnlocked) { setPlayLockedMsg("Unlocks via progression quest"); return; }
                if (!newFeaturePillsSeen.arena) setNewFeaturePillsSeen((prev) => ({ ...prev, arena: true }));
                setGameMode("arena");
              },
              style: arenaUnlocked
                ? { ...CARD_BASE, opacity: dungeonPointActive ? 0.4 : 1, cursor: dungeonPointActive ? "default" : "pointer" }
                : { ...CARD_BASE, background: "#f5f5f5" },
            },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1, opacity: arenaUnlocked ? 1 : 0.5 } }, arenaUnlocked ? "🏟️" : "🔒"),
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 } },
                React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: arenaUnlocked ? "#111" : "#999" } }, "Arena"),
                arenaUnlocked && !newFeaturePillsSeen.arena && React.createElement("div", { style: NEW_PILL }, "NEW")
              ),
              !arenaUnlocked && React.createElement("div", { style: { fontSize: 12, color: "#aaa" } }, "Unlocks via progression quest")
            )
          ),
          React.createElement(
            "div",
            { style: { position: "relative" } },
            React.createElement(
              "div",
              {
                onClick: () => {
                  if (!dungeonsUnlocked) { setPlayLockedMsg("Unlocks via progression quest"); return; }
                  if (!newFeaturePillsSeen.dungeon) setNewFeaturePillsSeen((prev) => ({ ...prev, dungeon: true }));
                  setGameMode("dungeon");
                  // Tutorial stays restricted -- the "Prove your worth" line now
                  // shows once they're actually inside (see DungeonScreen), not
                  // here on the card itself.
                  if (dungeonPointActive) setTutorialStep("dungeonEnter");
                },
                style: dungeonsUnlocked ? CARD_BASE : { ...CARD_BASE, background: "#f5f5f5" },
              },
              React.createElement("div", { style: { fontSize: 36, lineHeight: 1, opacity: dungeonsUnlocked ? 1 : 0.5 } }, dungeonsUnlocked ? "🏰" : "🔒"),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 } },
                  React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: dungeonsUnlocked ? "#111" : "#999" } }, "Dungeon"),
                  dungeonsUnlocked && !newFeaturePillsSeen.dungeon && React.createElement("div", { style: NEW_PILL }, "NEW")
                ),
                !dungeonsUnlocked && React.createElement("div", { style: { fontSize: 12, color: "#aaa" } }, "Unlocks via progression quest")
              )
            ),
            // Second half of the post-Set-1 reveal: arrow above the Dungeon
            // card itself (rather than a nav-bar tab). The explanatory line
            // now shows once they're actually inside (see DungeonScreen) --
            // this is just a nudge toward what to tap.
            dungeonPointActive &&
              React.createElement(
                "div",
                {
                  style: {
                    position: "absolute", bottom: "100%", left: "50%", marginBottom: 4, transform: "translate(-50%,0)",
                    fontSize: 32, color: "#534AB7", animation: "pointerBounce 1s ease-in-out infinite",
                    zIndex: 6, pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                  },
                },
                "⬇️"
              )
          ),
          React.createElement(DailyBossCard, { locked: !dailyBossUnlocked, onLockedTap: () => setPlayLockedMsg("Unlocks via progression quest"), disabled: dungeonPointActive }),
          React.createElement(
            "div",
            {
              onClick: () => {
                if (dungeonPointActive) return;
                if (!treasureUnlocked) { setPlayLockedMsg("Unlocks via progression quest"); return; }
                if (!newFeaturePillsSeen.treasure) setNewFeaturePillsSeen((prev) => ({ ...prev, treasure: true }));
                setGameMode("treasure");
              },
              style: treasureUnlocked
                ? { ...CARD_BASE, background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "2px solid #fbbf24", opacity: dungeonPointActive ? 0.4 : 1, cursor: dungeonPointActive ? "default" : "pointer" }
                : { ...CARD_BASE, background: "#f5f5f5" },
            },
            React.createElement("div", { style: { fontSize: 36, lineHeight: 1, opacity: treasureUnlocked ? 1 : 0.5 } }, treasureUnlocked ? "💰" : "🔒"),
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 } },
                React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: treasureUnlocked ? "#111" : "#999" } }, "Treasure"),
                treasureUnlocked && !newFeaturePillsSeen.treasure && React.createElement("div", { style: NEW_PILL }, "NEW")
              ),
              treasureUnlocked
                ? React.createElement("div", { style: { fontSize: 12, color: "#d97706" } }, "Open Mysterious Ore for treasures")
                : React.createElement("div", { style: { fontSize: 12, color: "#aaa" } }, "Unlocks via progression quest")
            )
          )
        ),
        // Play has its own render path outside the default shell below, so it
        // needs its own DEV_MODE gate to get the same dev panel every other
        // tab shows.
        DEV_MODE && React.createElement(DevPanel)
      ),
      React.createElement(
        "div",
        { style: { background: "#f5f5f5" } },
        React.createElement(NavBar, { tab, setTab, onNavigate: () => window.scrollTo(0, 0) })
      ),
      restrictedSkipButton
    );
  }

  // ── Default shell ────────────────────────────────────────────────────────
  return React.createElement(
    "div",
    { className: "app" },
    React.createElement("h2", { className: "sr-only" }, "Creature Collector"),
    React.createElement(
      "div",
      { className: "app-content", ref: contentRef, style: tab === "home" || tab === "hatch" || (tab === "equipment" && equipmentDetailOpen) ? { overflow: "hidden" } : undefined },
      tab === "home" && React.createElement(HomeScreen),
      tab === "hatch" && React.createElement(GachaScreen, { onHatch: (n) => setEggsHatched((c) => c + n) }),
      tab === "collection" &&
        React.createElement(CollectionScreen, {
          onBananaUsed: () => setBananasUsed((c) => c + 1),
          onCandyUsed: () => setCandyUsed((c) => c + 1),
          deepLinkId: collectionDeepLink,
          onDeepLinkConsumed: () => setCollectionDeepLink(null),
        }),
      tab === "store" && React.createElement(StoreScreen),
      tab === "equipment" && React.createElement(EquipmentScreen),
      // Dev tools are excluded on Hatch, and on an open Equipment item's
      // detail page -- both are laid out to fill exactly one viewport with
      // no scrolling, and the dev panel's height would blow past that.
      tab !== "home" && tab !== "hatch" && !(tab === "equipment" && equipmentDetailOpen) && DEV_MODE && React.createElement(DevPanel),
      tab !== "hatch" && !(tab === "equipment" && equipmentDetailOpen) && React.createElement("div", { style: { height: 12 } })
    ),
    React.createElement(NavBar, {
      tab,
      setTab,
      onNavigate: () => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
      },
    }),
    React.createElement(CreatureOverlayHost),
    !tutorialSeen && React.createElement(TutorialOverlay),
    tutorialSeen && restrictedSkipButton,
    tutorialSeen && farmPointer,
    tutorialSeen && toEquipmentPointer,
    tutorialSeen && toHomeFinalPointer,
    tutorialSeen && dungeonRevealPointer,
    tutorialSeen && fertilizerRevealPointer
  );
}

export default App;
