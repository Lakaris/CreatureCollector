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

import React, { useState, useEffect, useMemo, useContext, createContext } from "../react.js";
import { CREATURES } from "../data/creatures.js";
import { DUNGEON_BOSSES, ARENA_TABS } from "../data/bosses.js";
import { makeOwnedCreature } from "../core/creatures.js";
import { isPastDailyHour } from "../core/dates.js";

const GameContext = createContext(null);

/** Starting currency balances for a new save. */
const INITIAL_CURRENCIES = {
  gems: 1500, food: 100, candy: 50, money: 0, equipShards: 0, dungeonPass: 10,
  eggs: 0, legendaryEggs: 0,
  melonFire: 5, melonWater: 5, melonNature: 5, melonEarth: 5,
  melonWind: 5, melonElectric: 5, melonLight: 5, melonDark: 5, melonRainbow: 2,
  flairBanana: 500, mythicalFlairBanana: 500, ancientFlairBanana: 500, flairShard: 0,
  mysteriousOre: 5, deluxeOre: 0, rainbowOre: 0, treasureShards: 0,
};

export function GameProvider({ children }) {
  // ── UI / navigation ──────────────────────────────────────────────────────
  const [tab, setTab] = useState("home");
  const [gameMode, setGameMode] = useState(null);
  const [collectionDeepLink, setCollectionDeepLink] = useState(null);
  const [creatureOverlay, setCreatureOverlay] = useState(null);
  const [featuredCreatureId, setFeaturedCreatureId] = useState(null);
  const [username, setUsername] = useState("Player");
  const [profileEmoji, setProfileEmoji] = useState("🧑‍✈️");
  const [profileAvatarId, setProfileAvatarId] = useState("default");
  const [profileFrame, setProfileFrame] = useState("none");
  const [profileTitle, setProfileTitle] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [harvestPopup, setHarvestPopup] = useState(null);
  const [revealedCount, setRevealedCount] = useState(0);

  // ── Currencies + collection ──────────────────────────────────────────────
  const [currencies, setCurrencies] = useState(INITIAL_CURRENCIES);
  const [owned, setOwned] = useState(() =>
    Object.fromEntries(
      CREATURES.filter((c) => !c.evolutionOf).map((c) => [c.id, makeOwnedCreature(c)])
    )
  );
  const [unlockedSkins, setUnlockedSkins] = useState([]);
  const [skinShards, setSkinShards] = useState(0);
  // Every creature id ever owned, including pre-evolution forms that `owned`
  // drops once they evolve -- kept around so their icon stays pickable as a
  // profile avatar forever.
  const [everOwnedCreatureIds, setEverOwnedCreatureIds] = useState(() => new Set(Object.keys(owned)));

  // ── Equipment (identity is per-creature; level/ascension are global) ──────
  const [equipmentLevels, setEquipmentLevels] = useState({});
  const [equipmentAscensions, setEquipmentAscensions] = useState({});
  const [equipmentCopies, setEquipmentCopies] = useState({});
  const [equipFavorites, setEquipFavorites] = useState(new Set());

  // ── Gacha ────────────────────────────────────────────────────────────────
  const [pity, setPity] = useState({ standard: 0, stormwyvern: 0, legendary: 0 });

  // ── Arena ────────────────────────────────────────────────────────────────
  const [arenaLevels, setArenaLevels] = useState(() =>
    Object.fromEntries(ARENA_TABS.map((t) => [t.id, 1]))
  );
  const [arenaProgress, setArenaProgress] = useState(() =>
    Object.fromEntries(ARENA_TABS.map((t) => [t.id, 1]))
  );

  // ── Labyrinth ────────────────────────────────────────────────────────────
  // A single endless track (unlike Arena's per-tab tiers): depth climbs by one
  // on every win and never resets on loss, so the player just retries the same
  // depth.
  const [labyrinthDepth, setLabyrinthDepth] = useState(1);
  const [labyrinthBestDepth, setLabyrinthBestDepth] = useState(1);

  // ── Farm ─────────────────────────────────────────────────────────────────
  const [farmPlots, setFarmPlots] = useState(1);
  const [farmFieldLevel, setFarmFieldLevel] = useState(1);
  const [farmFieldLastHarvest, setFarmFieldLastHarvest] = useState(() => Date.now());
  const [farmFieldSeed, setFarmFieldSeed] = useState(() => (Math.random() * 1e9) | 0);
  const [farmCrops, setFarmCrops] = useState(Array(6).fill(null));
  const [plotUpgrades, setPlotUpgrades] = useState(Array(6).fill(0));
  const [specialPurchased, setSpecialPurchased] = useState(false);

  // ── Dungeon / daily boss ─────────────────────────────────────────────────
  const [dungeonBossLevels, setDungeonBossLevels] = useState(() =>
    Object.fromEntries(DUNGEON_BOSSES.map((b) => [b.key, 1]))
  );
  const [passRechargeCount, setPassRechargeCount] = useState(0);
  const [lastDungeonPassGain, setLastDungeonPassGain] = useState("");
  const [lastPassRechargeReset, setLastPassRechargeReset] = useState("");
  const [dailyBossData, setDailyBossData] = useState({ date: "", fights: 0, wins: 0 });
  const [dailyBossLevel, setDailyBossLevel] = useState(1);
  const [devTimeOffset, setDevTimeOffset] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  // ── Progression counters (feed quest predicates) ──────────────────────────
  const [eggsHatched, setEggsHatched] = useState(0);
  const [dungeonsCleared, setDungeonsCleared] = useState(0);
  const [arenaFights, setArenaFights] = useState(0);
  const [labyrinthFights, setLabyrinthFights] = useState(0);
  const [bananasUsed, setBananasUsed] = useState(0);
  const [dailyBossFights, setDailyBossFights] = useState(0);
  const [plotsGrown, setPlotsGrown] = useState(0);

  // ── Quests / daily missions ──────────────────────────────────────────────
  const [questBatchIdx, setQuestBatchIdx] = useState({
    general: 0, creature: 0, gear: 0, dungeon: 0, arena: 0,
  });
  const [claimedQuests, setClaimedQuests] = useState(new Set());
  const [dailyDay, setDailyDay] = useState(0);
  const [dailyLastClaimed, setDailyLastClaimed] = useState(null);
  const [dailyMissionsDate, setDailyMissionsDate] = useState(null);
  const [dailyMissionsSnapshot, setDailyMissionsSnapshot] = useState({
    eggsHatched: 0, dungeonsCleared: 0, arenaFights: 0,
    bananasUsed: 0, dailyBossFights: 0, plotsGrown: 0, currencies: {},
  });
  const [dailyMissionsDone, setDailyMissionsDone] = useState(new Set());
  const [dailyCompletionClaimed, setDailyCompletionClaimed] = useState(false);
  const [dailySelectedMissions, setDailySelectedMissions] = useState([]);

  // ── Battle pass ──────────────────────────────────────────────────────────
  const [battlepassLastReset, setBattlepassLastReset] = useState(null);
  const [battlepassClaimed, setBattlepassClaimed] = useState(Array(50).fill(false));
  const [battlepassPaidClaimed, setBattlepassPaidClaimed] = useState(Array(50).fill(false));
  const [battlepassPremium, setBattlepassPremium] = useState(false);
  const [battlepassPoints, setBattlepassPoints] = useState(0);

  // ── Treasure ─────────────────────────────────────────────────────────────
  const [collectedTreasures, setCollectedTreasures] = useState(new Set());
  const [completedTreasureSets, setCompletedTreasureSets] = useState(new Set());

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

  /** The bag of state quest `check()`/`progress()` predicates read. */
  const questState = useMemo(
    () => ({
      owned, currencies, unlockedSkins, arenaProgress, arenaLevels,
      eggsHatched, dungeonsCleared, arenaFights, bananasUsed, dailyBossFights, plotsGrown,
      labyrinthDepth, labyrinthBestDepth, labyrinthFights,
    }),
    [owned, currencies, unlockedSkins, arenaProgress, arenaLevels,
     eggsHatched, dungeonsCleared, arenaFights, bananasUsed, dailyBossFights, plotsGrown,
     labyrinthDepth, labyrinthBestDepth, labyrinthFights]
  );

  const value = {
    // ui
    tab, setTab, gameMode, setGameMode,
    collectionDeepLink, setCollectionDeepLink,
    creatureOverlay, setCreatureOverlay,
    featuredCreatureId, setFeaturedCreatureId,
    username, setUsername, profileEmoji, setProfileEmoji,
    profileAvatarId, setProfileAvatarId,
    profileFrame, setProfileFrame, profileTitle, setProfileTitle,
    settingsOpen, setSettingsOpen,
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
