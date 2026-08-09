// Global game state.
//
// Every piece of persistent game state lives here rather than in App, so screens
// can read what they need directly instead of having it threaded down through
// props. Callbacks stay explicit props -- they are per-call-site, not global.
//
// Re-render profile is unchanged from before this module existed: all state used
// to live in App, so any update already re-rendered the whole screen tree. If
// that ever becomes a bottleneck, split this into per-domain contexts; the slice
// helpers below are grouped to make that a mechanical change.
//
// Persistence: progress autosaves to localStorage (see SAVE_KEY below) so it
// survives a page reload / app restart. Only gameplay progress is saved --
// transient UI state (which tab is open, popup visibility, etc.) always
// starts fresh. See loadSave()/the autosave effect near the bottom of
// GameProvider for the full list of what's persisted.

import React, { useState, useEffect, useMemo, useRef, useContext, createContext } from "../react.js";
import { DUNGEON_BOSSES, ARENA_TABS } from "../data/bosses.js";
import { isPastDailyHour } from "../core/dates.js";

const GameContext = createContext(null);

/** Starting currency balances for a new save. */
const INITIAL_CURRENCIES = {
  gems: 1500, food: 100, candy: 50, equipShards: 0, dungeonPass: 10,
  eggs: 0, legendaryEggs: 0,
  melonFire: 5, melonWater: 5, melonNature: 5, melonEarth: 5,
  melonWind: 5, melonElectric: 5, melonLight: 5, melonDark: 5, melonRainbow: 2,
  flairBanana: 500, mythicalFlairBanana: 500, ancientFlairBanana: 500, flairShard: 0,
  mysteriousOre: 5, deluxeOre: 0, rainbowOre: 0, treasureShards: 0,
  ancientFertilizer: 0,
};

// ── Save/load ────────────────────────────────────────────────────────────
// A single JSON blob under one localStorage key. Sets aren't JSON-safe, so
// they're stored as arrays and converted back on load (SET_FIELDS lists
// which top-level fields need that conversion). Bumping SAVE_VERSION
// invalidates old saves outright rather than trying to migrate them --
// simple and safe; there's no server data to reconcile against.
const SAVE_KEY = "cc_save_v1";
const SAVE_VERSION = 1;
const SET_FIELDS = [
  "everOwnedCreatureIds", "equipFavorites", "claimedQuests",
  "dailyMissionsDone", "collectedTreasures", "completedTreasureSets",
];

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== SAVE_VERSION) return null;
    for (const k of SET_FIELDS) {
      if (Array.isArray(parsed[k])) parsed[k] = new Set(parsed[k]);
    }
    return parsed;
  } catch {
    return null;
  }
}

// Loaded once -- GameProvider mounts exactly once for the app's lifetime.
const initialSave = loadSave();

export function GameProvider({ children }) {
  // ── UI / navigation (never persisted) ────────────────────────────────────
  const [tab, setTab] = useState("home");
  const [gameMode, setGameMode] = useState(null);
  const [collectionDeepLink, setCollectionDeepLink] = useState(null);
  const [creatureOverlay, setCreatureOverlay] = useState(null);
  const [dexOverlay, setDexOverlay] = useState(null);
  const [featuredCreatureId, setFeaturedCreatureId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(() => initialSave?.tutorialSeen ?? false);
  // True for the stretch right after the tutorial's intro battle, once the player
  // lands back on Home but before they've "graduated" -- hides a handful of Home
  // features and locks Hatch/Equipment so there's less to get lost in. Cleared by
  // Skip (which fast-forwards past the whole tutorial) alongside tutorialSeen.
  const [tutorialRestricted, setTutorialRestricted] = useState(() => initialSave?.tutorialRestricted ?? false);
  // Which step of the post-battle guided walkthrough the player's on, while
  // tutorialRestricted is true: "collection" (arrow at the starter's card) ->
  // "slot" (arrow at Slot 1) -> "item" (arrow at the Iron Band) -> null (done,
  // clears alongside tutorialRestricted).
  const [tutorialStep, setTutorialStep] = useState(() => initialSave?.tutorialStep ?? null);
  const [harvestPopup, setHarvestPopup] = useState(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [devTimeOffset, setDevTimeOffset] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  // ── Profile ──────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(() => initialSave?.username ?? "Player");
  const [profileEmoji, setProfileEmoji] = useState(() => initialSave?.profileEmoji ?? "🧑‍✈️");
  const [profileAvatarId, setProfileAvatarId] = useState(() => initialSave?.profileAvatarId ?? "default");
  const [profileFrame, setProfileFrame] = useState(() => initialSave?.profileFrame ?? "none");
  const [profileTitle, setProfileTitle] = useState(() => initialSave?.profileTitle ?? null);

  // ── Currencies + collection ──────────────────────────────────────────────
  const [currencies, setCurrencies] = useState(() => ({ ...INITIAL_CURRENCIES, ...(initialSave?.currencies || {}) }));
  const [owned, setOwned] = useState(() => initialSave?.owned ?? {});
  const [unlockedSkins, setUnlockedSkins] = useState(() => initialSave?.unlockedSkins ?? []);
  const [skinShards, setSkinShards] = useState(() => initialSave?.skinShards ?? 0);
  // Every creature id ever owned, including pre-evolution forms that `owned`
  // drops once they evolve -- kept around so their icon stays pickable as a
  // profile avatar forever.
  const [everOwnedCreatureIds, setEverOwnedCreatureIds] = useState(() => initialSave?.everOwnedCreatureIds ?? new Set(Object.keys(owned)));

  // ── Equipment (identity is per-creature; level/ascension are global) ──────
  const [equipmentLevels, setEquipmentLevels] = useState(() => initialSave?.equipmentLevels ?? {});
  const [equipmentAscensions, setEquipmentAscensions] = useState(() => initialSave?.equipmentAscensions ?? {});
  const [equipmentCopies, setEquipmentCopies] = useState(() => initialSave?.equipmentCopies ?? {});
  const [equipFavorites, setEquipFavorites] = useState(() => initialSave?.equipFavorites ?? new Set());

  // ── Gacha ────────────────────────────────────────────────────────────────
  const [pity, setPity] = useState(() => initialSave?.pity ?? { standard: 0, stormwyvern: 0, legendary: 0 });

  // ── Arena ────────────────────────────────────────────────────────────────
  const [arenaLevels, setArenaLevels] = useState(() =>
    initialSave?.arenaLevels ?? Object.fromEntries(ARENA_TABS.map((t) => [t.id, 1]))
  );
  const [arenaProgress, setArenaProgress] = useState(() =>
    initialSave?.arenaProgress ?? Object.fromEntries(ARENA_TABS.map((t) => [t.id, 1]))
  );

  // ── Labyrinth ────────────────────────────────────────────────────────────
  // A single endless track (unlike Arena's per-tab tiers): depth climbs by one
  // on every win and never resets on loss, so the player just retries the same
  // depth.
  const [labyrinthDepth, setLabyrinthDepth] = useState(() => initialSave?.labyrinthDepth ?? 1);
  const [labyrinthBestDepth, setLabyrinthBestDepth] = useState(() => initialSave?.labyrinthBestDepth ?? 1);

  // ── Farm ─────────────────────────────────────────────────────────────────
  const [farmPlots, setFarmPlots] = useState(() => initialSave?.farmPlots ?? 1);
  const [farmFieldLevel, setFarmFieldLevel] = useState(() => initialSave?.farmFieldLevel ?? 1);
  const [farmFieldLastHarvest, setFarmFieldLastHarvest] = useState(() => initialSave?.farmFieldLastHarvest ?? Date.now());
  const [farmFieldSeed, setFarmFieldSeed] = useState(() => initialSave?.farmFieldSeed ?? ((Math.random() * 1e9) | 0));
  const [farmCrops, setFarmCrops] = useState(() => initialSave?.farmCrops ?? Array(6).fill(null));
  const [plotUpgrades, setPlotUpgrades] = useState(() => initialSave?.plotUpgrades ?? Array(6).fill(0));
  const [specialPurchased, setSpecialPurchased] = useState(() => initialSave?.specialPurchased ?? false);

  // ── Dungeon / daily boss ─────────────────────────────────────────────────
  const [dungeonBossLevels, setDungeonBossLevels] = useState(() =>
    initialSave?.dungeonBossLevels ?? Object.fromEntries(DUNGEON_BOSSES.map((b) => [b.key, 1]))
  );
  const [passRechargeCount, setPassRechargeCount] = useState(() => initialSave?.passRechargeCount ?? 0);
  const [lastDungeonPassGain, setLastDungeonPassGain] = useState(() => initialSave?.lastDungeonPassGain ?? "");
  const [lastPassRechargeReset, setLastPassRechargeReset] = useState(() => initialSave?.lastPassRechargeReset ?? "");
  const [dailyBossData, setDailyBossData] = useState(() => initialSave?.dailyBossData ?? { date: "", fights: 0, wins: 0 });
  const [dailyBossLevel, setDailyBossLevel] = useState(() => initialSave?.dailyBossLevel ?? 1);

  // ── Progression counters (feed quest predicates) ──────────────────────────
  const [eggsHatched, setEggsHatched] = useState(() => initialSave?.eggsHatched ?? 0);
  const [dungeonsCleared, setDungeonsCleared] = useState(() => initialSave?.dungeonsCleared ?? 0);
  const [arenaFights, setArenaFights] = useState(() => initialSave?.arenaFights ?? 0);
  const [labyrinthFights, setLabyrinthFights] = useState(() => initialSave?.labyrinthFights ?? 0);
  const [bananasUsed, setBananasUsed] = useState(() => initialSave?.bananasUsed ?? 0);
  const [dailyBossFights, setDailyBossFights] = useState(() => initialSave?.dailyBossFights ?? 0);
  const [plotsGrown, setPlotsGrown] = useState(() => initialSave?.plotsGrown ?? 0);
  const [fieldHarvests, setFieldHarvests] = useState(() => initialSave?.fieldHarvests ?? 0);

  // ── Quests / daily missions ──────────────────────────────────────────────
  const [questBatchIdx, setQuestBatchIdx] = useState(() => initialSave?.questBatchIdx ?? {
    general: 0, creature: 0, gear: 0, dungeon: 0, arena: 0,
  });
  const [claimedQuests, setClaimedQuests] = useState(() => initialSave?.claimedQuests ?? new Set());
  const [dailyDay, setDailyDay] = useState(() => initialSave?.dailyDay ?? 0);
  const [dailyLastClaimed, setDailyLastClaimed] = useState(() => initialSave?.dailyLastClaimed ?? null);
  const [dailyMissionsDate, setDailyMissionsDate] = useState(() => initialSave?.dailyMissionsDate ?? null);
  const [dailyMissionsSnapshot, setDailyMissionsSnapshot] = useState(() => initialSave?.dailyMissionsSnapshot ?? {
    eggsHatched: 0, dungeonsCleared: 0, arenaFights: 0,
    bananasUsed: 0, dailyBossFights: 0, plotsGrown: 0,
    labyrinthFights: 0, fieldHarvests: 0, currencies: {},
  });
  const [dailyMissionsDone, setDailyMissionsDone] = useState(() => initialSave?.dailyMissionsDone ?? new Set());
  const [dailyCompletionClaimed, setDailyCompletionClaimed] = useState(() => initialSave?.dailyCompletionClaimed ?? false);
  const [dailySelectedMissions, setDailySelectedMissions] = useState(() => initialSave?.dailySelectedMissions ?? []);

  // ── Battle pass ──────────────────────────────────────────────────────────
  const [battlepassLastReset, setBattlepassLastReset] = useState(() => initialSave?.battlepassLastReset ?? null);
  const [battlepassClaimed, setBattlepassClaimed] = useState(() => initialSave?.battlepassClaimed ?? Array(50).fill(false));
  const [battlepassPaidClaimed, setBattlepassPaidClaimed] = useState(() => initialSave?.battlepassPaidClaimed ?? Array(50).fill(false));
  const [battlepassPremium, setBattlepassPremium] = useState(() => initialSave?.battlepassPremium ?? false);
  const [battlepassPoints, setBattlepassPoints] = useState(() => initialSave?.battlepassPoints ?? 0);

  // ── Treasure ─────────────────────────────────────────────────────────────
  const [collectedTreasures, setCollectedTreasures] = useState(() => initialSave?.collectedTreasures ?? new Set());
  const [completedTreasureSets, setCompletedTreasureSets] = useState(() => initialSave?.completedTreasureSets ?? new Set());

  // Track every creature id ever owned so pre-evolution icons stay available
  // as profile avatars after `owned` drops them on evolution.
  useEffect(() => {
    setEverOwnedCreatureIds((prev) => {
      const ownedIds = Object.keys(owned);
      if (ownedIds.every((id) => prev.has(id))) return prev;
      const next = new Set(prev);
      ownedIds.forEach((id) => next.add(id));
      return next;
    });
  }, [owned]);

  // Dungeon passes regenerate, and recharge counts reset, at noon local time.
  // This is deliberately a NOON reset, unlike the midnight resets used by daily
  // missions and login rewards.
  useEffect(() => {
    const check = () => {
      if (isPastDailyHour(lastDungeonPassGain, 12)) {
        setCurrencies((c) =>
          (c.dungeonPass || 0) >= 30 ? c : { ...c, dungeonPass: (c.dungeonPass || 0) + 10 }
        );
        setLastDungeonPassGain(new Date().toDateString());
      }
      if (isPastDailyHour(lastPassRechargeReset, 12)) {
        setPassRechargeCount(0);
        setLastPassRechargeReset(new Date().toDateString());
      }
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [lastDungeonPassGain, lastPassRechargeReset]);

  // Reveals harvest results one at a time.
  useEffect(() => {
    if (!harvestPopup || revealedCount >= harvestPopup.length) return;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 350);
    return () => clearTimeout(t);
  }, [harvestPopup, revealedCount]);

  // Drives the daily-boss countdown display.
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Autosave ─────────────────────────────────────────────────────────────
  // A ref is refreshed after every render (see the deps-less effect below) so
  // the interval/flush callbacks below always read the latest values without
  // needing a giant dependency array that's easy to silently fall out of sync.
  const persistedRef = useRef(null);
  persistedRef.current = {
    v: SAVE_VERSION,
    tutorialSeen, tutorialRestricted, tutorialStep,
    username, profileEmoji, profileAvatarId, profileFrame, profileTitle,
    currencies, owned, unlockedSkins, skinShards, everOwnedCreatureIds,
    equipmentLevels, equipmentAscensions, equipmentCopies, equipFavorites,
    pity, arenaLevels, arenaProgress,
    labyrinthDepth, labyrinthBestDepth,
    farmPlots, farmFieldLevel, farmFieldLastHarvest, farmFieldSeed, farmCrops, plotUpgrades, specialPurchased,
    dungeonBossLevels, passRechargeCount, lastDungeonPassGain, lastPassRechargeReset, dailyBossData, dailyBossLevel,
    eggsHatched, dungeonsCleared, arenaFights, labyrinthFights, bananasUsed, dailyBossFights, plotsGrown, fieldHarvests,
    questBatchIdx, claimedQuests, dailyDay, dailyLastClaimed, dailyMissionsDate, dailyMissionsSnapshot,
    dailyMissionsDone, dailyCompletionClaimed, dailySelectedMissions,
    battlepassLastReset, battlepassClaimed, battlepassPaidClaimed, battlepassPremium, battlepassPoints,
    collectedTreasures, completedTreasureSets,
  };

  useEffect(() => {
    function save() {
      try {
        const s = persistedRef.current;
        const toSave = { ...s };
        for (const k of SET_FIELDS) toSave[k] = [...s[k]];
        localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
      } catch {
        // localStorage can throw (quota exceeded, private-browsing restrictions) --
        // losing an autosave tick isn't worth surfacing to the player.
      }
    }
    const interval = setInterval(save, 5000);
    window.addEventListener("beforeunload", save);
    document.addEventListener("visibilitychange", save);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", save);
      save();
    };
  }, []);

  /** Wipes the on-disk save. Used by "Reset everything" in the Dev Panel so a
   * reset can't be undone by a reload racing the next autosave tick. */
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }

  /** The bag of state quest `check()`/`progress()` predicates read. */
  const questState = useMemo(
    () => ({
      owned, currencies, unlockedSkins, arenaProgress, arenaLevels,
      eggsHatched, dungeonsCleared, arenaFights, bananasUsed, dailyBossFights, plotsGrown,
      labyrinthDepth, labyrinthBestDepth, labyrinthFights, fieldHarvests,
    }),
    [owned, currencies, unlockedSkins, arenaProgress, arenaLevels,
     eggsHatched, dungeonsCleared, arenaFights, bananasUsed, dailyBossFights, plotsGrown,
     labyrinthDepth, labyrinthBestDepth, labyrinthFights, fieldHarvests]
  );

  const value = {
    // ui
    tab, setTab, gameMode, setGameMode,
    collectionDeepLink, setCollectionDeepLink,
    creatureOverlay, setCreatureOverlay,
    dexOverlay, setDexOverlay,
    featuredCreatureId, setFeaturedCreatureId,
    username, setUsername, profileEmoji, setProfileEmoji,
    profileAvatarId, setProfileAvatarId,
    profileFrame, setProfileFrame, profileTitle, setProfileTitle,
    settingsOpen, setSettingsOpen,
    tutorialSeen, setTutorialSeen,
    tutorialRestricted, setTutorialRestricted,
    tutorialStep, setTutorialStep,
    harvestPopup, setHarvestPopup, revealedCount, setRevealedCount,
    // currencies + collection
    currencies, setCurrencies, owned, setOwned,
    unlockedSkins, setUnlockedSkins, skinShards, setSkinShards,
    everOwnedCreatureIds,
    // equipment
    equipmentLevels, setEquipmentLevels,
    equipmentAscensions, setEquipmentAscensions,
    equipmentCopies, setEquipmentCopies,
    equipFavorites, setEquipFavorites,
    // gacha
    pity, setPity,
    // arena
    arenaLevels, setArenaLevels, arenaProgress, setArenaProgress,
    // labyrinth
    labyrinthDepth, setLabyrinthDepth, labyrinthBestDepth, setLabyrinthBestDepth,
    // farm
    farmPlots, setFarmPlots, farmFieldLevel, setFarmFieldLevel,
    farmFieldLastHarvest, setFarmFieldLastHarvest,
    farmFieldSeed, setFarmFieldSeed,
    farmCrops, setFarmCrops, plotUpgrades, setPlotUpgrades,
    specialPurchased, setSpecialPurchased,
    // dungeon / daily boss
    dungeonBossLevels, setDungeonBossLevels,
    passRechargeCount, setPassRechargeCount,
    dailyBossData, setDailyBossData, dailyBossLevel, setDailyBossLevel,
    devTimeOffset, setDevTimeOffset, nowMs,
    // counters
    eggsHatched, setEggsHatched, dungeonsCleared, setDungeonsCleared,
    arenaFights, setArenaFights, labyrinthFights, setLabyrinthFights, bananasUsed, setBananasUsed,
    dailyBossFights, setDailyBossFights, plotsGrown, setPlotsGrown,
    fieldHarvests, setFieldHarvests,
    // quests
    questBatchIdx, setQuestBatchIdx, claimedQuests, setClaimedQuests,
    dailyDay, setDailyDay, dailyLastClaimed, setDailyLastClaimed,
    dailyMissionsDate, setDailyMissionsDate,
    dailyMissionsSnapshot, setDailyMissionsSnapshot,
    dailyMissionsDone, setDailyMissionsDone,
    dailyCompletionClaimed, setDailyCompletionClaimed,
    dailySelectedMissions, setDailySelectedMissions,
    // battle pass
    battlepassLastReset, setBattlepassLastReset,
    battlepassClaimed, setBattlepassClaimed,
    battlepassPaidClaimed, setBattlepassPaidClaimed,
    battlepassPremium, setBattlepassPremium,
    battlepassPoints, setBattlepassPoints,
    // treasure
    collectedTreasures, setCollectedTreasures,
    completedTreasureSets, setCompletedTreasureSets,
    // derived
    questState,
    // persistence
    clearSave,
  };

  return React.createElement(GameContext.Provider, { value }, children);
}

/**
 * Read global game state. Destructure only what you need:
 *   const { currencies, setCurrencies } = useGame();
 */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside a <GameProvider>");
  return ctx;
}

export default GameContext;
