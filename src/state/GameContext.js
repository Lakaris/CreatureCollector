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
import { isPastEasternNoon, easternNoonDayKey } from "../core/dates.js";
import { DUNGEON_PASS_DAILY_CAP, DUNGEON_PASS_DAILY_CAP_BONUS, DUNGEON_PASS_OVERFLOW_MULT } from "../battle/constants.js";

const GameContext = createContext(null);

/** Starting currency balances for a new save -- everyone starts at zero,
 * except Dungeon Passes: new (and reset) players start with 10. */
export const INITIAL_CURRENCIES = {
  gems: 0, food: 0, candy: 0, equipShards: 0, dungeonPass: 10,
  eggs: 0, legendaryEggs: 0,
  melonFire: 0, melonWater: 0, melonNature: 0, melonEarth: 0,
  melonWind: 0, melonElectric: 0, melonLight: 0, melonDark: 0, melonRainbow: 0,
  flairBanana: 0, mythicalFlairBanana: 0, ancientFlairBanana: 0, flairShard: 0,
  mysteriousOre: 0, deluxeOre: 0, rainbowOre: 0, treasureShards: 0,
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
  "purchasedOneTimeBundles",
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
  // ── UI / navigation (never persisted, EXCEPT tab/gameMode while the
  // tutorial is active -- see the autosave block below. Quitting mid-tutorial
  // needs to drop the player back on the exact screen they left, since most
  // tutorial steps aren't reachable through NavBar's normal tab locks; outside
  // the tutorial this stays "always starts fresh" as before) ────────────────
  const [tab, setTab] = useState(() => (initialSave?.tutorialRestricted && initialSave?.tab) || "home");
  const [gameMode, setGameMode] = useState(() => (initialSave?.tutorialRestricted ? (initialSave?.gameMode ?? null) : null));
  const [collectionDeepLink, setCollectionDeepLink] = useState(null);
  // Which Farm sub-tab to jump to next time FarmScreen mounts/updates (e.g.
  // "plots" when the "Grow a Plot" daily mission is tapped incomplete) --
  // consumed once by FarmScreen then cleared, same pattern as collectionDeepLink.
  const [farmDeepLink, setFarmDeepLink] = useState(null);
  // Which Dungeon boss tab to jump to next time DungeonScreen mounts/updates
  // (e.g. "wind" for the "Defeat the Level 1 Wind Boss" quest) -- consumed
  // once by DungeonScreen then cleared, same pattern as farmDeepLink.
  const [dungeonDeepLink, setDungeonDeepLink] = useState(null);
  // Which Arena tab to jump to next time ArenaScreen mounts/updates (e.g.
  // "ice" for the "Complete Stage 10 Level 2 of the Water Arena" quest) --
  // consumed once by ArenaScreen then cleared, same pattern as farmDeepLink.
  const [arenaDeepLink, setArenaDeepLink] = useState(null);
  const [creatureOverlay, setCreatureOverlay] = useState(null);
  const [dexOverlay, setDexOverlay] = useState(null);
  // Ephemeral, never persisted: which step of the "Use 1 Flair Banana" quest's
  // guided arrows is showing (null | "collection" | "flair" | "feed"), or null
  // when no guide is active. Set by QuestsScreen when that quest is tapped
  // incomplete; cleared the moment the player clicks anything the current
  // arrow *isn't* pointing at (see App.js's global click watcher) or once the
  // banana's actually fed.
  const [flairGuideStep, setFlairGuideStep] = useState(null);
  // Same idea as flairGuideStep, for the "Use a Candy" quest: null |
  // "candyCollection" | "candySkins" | "candyFeed". Kept as a separate piece
  // of state (rather than reusing flairGuideStep's step names) so the two
  // guided flows never interfere with each other if one is left mid-way.
  const [candyGuideStep, setCandyGuideStep] = useState(null);
  // Same idea again, for the "Use 1 Ancient Fertilizer" quest: null |
  // "upgradeField". Only one step (the quest just points at the Field's
  // Upgrade button), cleared the same way by App.js's global click watcher.
  const [farmGuideStep, setFarmGuideStep] = useState(null);
  // True while EquipmentScreen is showing a single item's detail page (not
  // the grid) -- App.js reads this to give that page the same full-screen,
  // no-scroll, no-dev-tools treatment as Hatch/Farm, since it's a sub-view
  // of the "equipment" tab rather than a tab of its own.
  const [equipmentDetailOpen, setEquipmentDetailOpen] = useState(false);
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
  // Progress through TutorialOverlay's own intro narrative (island/eggs/battle),
  // persisted so quitting mid-tutorial resumes on the same beat instead of
  // restarting from the shore. "battle" never resumes as itself -- the live
  // simulation isn't worth serializing -- it lands back on "battlePlan"
  // (playerCell is kept, so the creature's still placed; they just re-tap Fight).
  const [tutorialPhase, setTutorialPhase] = useState(() => {
    const p = initialSave?.tutorialPhase;
    return p === "battle" ? "battlePlan" : (p ?? "text");
  });
  const [tutorialLine, setTutorialLine] = useState(() => initialSave?.tutorialLine ?? 0);
  const [tutorialPostLine, setTutorialPostLine] = useState(() => initialSave?.tutorialPostLine ?? 0);
  const [tutorialPickedCreatureId, setTutorialPickedCreatureId] = useState(() => initialSave?.tutorialPickedCreatureId ?? null);
  const [tutorialPlayerCell, setTutorialPlayerCell] = useState(() => initialSave?.tutorialPlayerCell ?? null);
  // Set the instant the tutorial's guided walkthrough finishes (see
  // LabyrinthScreen's Floor 1 win handling); HomeScreen consumes this once
  // to auto-open the New Player Gift, then the Daily screen behind it, and
  // clears it so it never fires again on a later visit.
  const [postTutorialPopupPending, setPostTutorialPopupPending] = useState(() => initialSave?.postTutorialPopupPending ?? false);
  // True right after closing the Daily or New Player Gift screen -- HomeScreen
  // shows an arrow at Quests until it's tapped (no other button is blocked
  // meanwhile; it just doesn't go away on its own).
  const [showQuestsArrow, setShowQuestsArrow] = useState(() => initialSave?.showQuestsArrow ?? false);
  // Set when the Progression quests' Set 1 completion reward (which unlocks
  // Dungeon + Daily Boss) is claimed; consumed the next time the player backs
  // out of the Quests screen to Home, which kicks off the short "a new
  // structure rises up" guided hand-off to the Dungeon. One-shot, like
  // postTutorialPopupPending above.
  const [pendingDungeonReveal, setPendingDungeonReveal] = useState(() => initialSave?.pendingDungeonReveal ?? false);
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

  // ── Battle planning grids ────────────────────────────────────────────────
  // "r,c" -> creatureId, one per game mode. Lifted up here (instead of local
  // screen state) so a deployment survives backing out of the planning phase
  // or closing the app entirely -- previously each screen wiped its grid the
  // moment the player tapped the back arrow.
  const [arenaPlanGrid, setArenaPlanGrid] = useState(() => initialSave?.arenaPlanGrid ?? {});
  const [dungeonPlanGrid, setDungeonPlanGrid] = useState(() => initialSave?.dungeonPlanGrid ?? {});
  const [labyrinthPlanGrid, setLabyrinthPlanGrid] = useState(() => initialSave?.labyrinthPlanGrid ?? {});
  const [dailyBossPlanGrid, setDailyBossPlanGrid] = useState(() => initialSave?.dailyBossPlanGrid ?? {});

  // ── Farm ─────────────────────────────────────────────────────────────────
  const [farmPlots, setFarmPlots] = useState(() => initialSave?.farmPlots ?? 1);
  const [farmFieldLevel, setFarmFieldLevel] = useState(() => initialSave?.farmFieldLevel ?? 1);
  const [farmFieldLastHarvest, setFarmFieldLastHarvest] = useState(() => initialSave?.farmFieldLastHarvest ?? Date.now());
  const [farmFieldSeed, setFarmFieldSeed] = useState(() => initialSave?.farmFieldSeed ?? ((Math.random() * 1e9) | 0));
  const [farmCrops, setFarmCrops] = useState(() => initialSave?.farmCrops ?? Array(6).fill(null));
  const [plotUpgrades, setPlotUpgrades] = useState(() => initialSave?.plotUpgrades ?? Array(6).fill(0));
  const [specialPurchased, setSpecialPurchased] = useState(() => initialSave?.specialPurchased ?? false);
  // True once the "Plots" progression-quest reward has been claimed --
  // replaces the old labyrinth-depth gate for unlocking extra Farm plots.
  const [plotsUnlocked, setPlotsUnlocked] = useState(() => initialSave?.plotsUnlocked ?? false);
  // Ids of one-time Store bundles already bought (see purchaseBundle below).
  // Bundles with a dedicated gameplay effect track ownership through their
  // own flag instead (starter_pack -> specialPurchased, dungeon_starter_pack
  // -> dungeonStarterPackPurchased) since other screens need to read it
  // directly; this Set is for the rest, so a future purely-cosmetic one-time
  // bundle doesn't need a new state field of its own.
  const [purchasedOneTimeBundles, setPurchasedOneTimeBundles] = useState(() => initialSave?.purchasedOneTimeBundles ?? new Set());

  // ── Dungeon / daily boss ─────────────────────────────────────────────────
  const [dungeonBossLevels, setDungeonBossLevels] = useState(() =>
    initialSave?.dungeonBossLevels ?? Object.fromEntries(DUNGEON_BOSSES.map((b) => [b.key, 1]))
  );
  const [passRechargeCount, setPassRechargeCount] = useState(() => initialSave?.passRechargeCount ?? 0);
  // Defaults to "already claimed today" (not "") for a brand-new save --
  // INITIAL_CURRENCIES.dungeonPass already starts players at 10, so the
  // regen effect below shouldn't ALSO top them up the moment the app mounts.
  const [lastDungeonPassGain, setLastDungeonPassGain] = useState(() => initialSave?.lastDungeonPassGain ?? easternNoonDayKey());
  const [lastPassRechargeReset, setLastPassRechargeReset] = useState(() => initialSave?.lastPassRechargeReset ?? "");
  const [dailyBossData, setDailyBossData] = useState(() => initialSave?.dailyBossData ?? { date: "", fights: 0, wins: 0 });
  const [dailyBossLevel, setDailyBossLevel] = useState(() => initialSave?.dailyBossLevel ?? 1);
  // True once the one-time Dungeon Starter Pack (data/store.js) has been
  // bought -- permanently doubles the daily free Dungeon Pass regen (see
  // DUNGEON_PASS_DAILY_CAP_BONUS in battle/constants.js) and gates the
  // Store card from being purchased again.
  const [dungeonStarterPackPurchased, setDungeonStarterPackPurchased] = useState(() => initialSave?.dungeonStarterPackPurchased ?? false);
  // True once the "Dungeons" / "Daily Boss" progression-quest rewards have
  // been claimed -- replaces the old labyrinth-depth gates for these.
  const [dungeonsUnlocked, setDungeonsUnlocked] = useState(() => initialSave?.dungeonsUnlocked ?? false);
  const [dailyBossUnlocked, setDailyBossUnlocked] = useState(() => initialSave?.dailyBossUnlocked ?? false);
  // Same idea for "Arena" and "Treasure" -- both stay greyed out on the Play
  // page even after Play itself unlocks, until their own quest reward lands.
  const [arenaUnlocked, setArenaUnlocked] = useState(() => initialSave?.arenaUnlocked ?? false);
  const [treasureUnlocked, setTreasureUnlocked] = useState(() => initialSave?.treasureUnlocked ?? false);
  // Tracks which Play-page features the player has already opened at least
  // once since unlocking, so the "NEW" pill only shows for a feature between
  // the moment it unlocks and the moment it's first tapped. Defaults to
  // "already seen" for anything that was already unlocked before this save
  // was first loaded under this feature -- otherwise every existing player's
  // save would suddenly show "NEW" on features they unlocked long ago.
  const [newFeaturePillsSeen, setNewFeaturePillsSeen] = useState(() => initialSave?.newFeaturePillsSeen ?? {
    arena: initialSave?.arenaUnlocked ?? false,
    dungeon: initialSave?.dungeonsUnlocked ?? false,
    dailyBoss: initialSave?.dailyBossUnlocked ?? false,
    treasure: initialSave?.treasureUnlocked ?? false,
  });

  // ── Progression counters (feed quest predicates) ──────────────────────────
  const [eggsHatched, setEggsHatched] = useState(() => initialSave?.eggsHatched ?? 0);
  const [dungeonsCleared, setDungeonsCleared] = useState(() => initialSave?.dungeonsCleared ?? 0);
  const [dungeonAutoFights, setDungeonAutoFights] = useState(() => initialSave?.dungeonAutoFights ?? 0);
  const [arenaFights, setArenaFights] = useState(() => initialSave?.arenaFights ?? 0);
  const [labyrinthFights, setLabyrinthFights] = useState(() => initialSave?.labyrinthFights ?? 0);
  const [bananasUsed, setBananasUsed] = useState(() => initialSave?.bananasUsed ?? 0);
  const [candyUsed, setCandyUsed] = useState(() => initialSave?.candyUsed ?? 0);
  const [dailyBossFights, setDailyBossFights] = useState(() => initialSave?.dailyBossFights ?? 0);
  const [plotsGrown, setPlotsGrown] = useState(() => initialSave?.plotsGrown ?? 0);
  const [fieldHarvests, setFieldHarvests] = useState(() => initialSave?.fieldHarvests ?? 0);
  const [petLevelUps, setPetLevelUps] = useState(() => initialSave?.petLevelUps ?? 0);
  const [equipLevelUps, setEquipLevelUps] = useState(() => initialSave?.equipLevelUps ?? 0);
  const [fertilizerUsed, setFertilizerUsed] = useState(() => initialSave?.fertilizerUsed ?? 0);
  // True forever once the player has fully cleared a day's Daily Quests at
  // least once -- unlike dailyCompletionClaimed, this never resets.
  const [everCompletedDailyQuests, setEverCompletedDailyQuests] = useState(() => initialSave?.everCompletedDailyQuests ?? false);

  // ── Quests / daily missions ──────────────────────────────────────────────
  const [questBatchIdx, setQuestBatchIdx] = useState(() => initialSave?.questBatchIdx ?? {
    general: 0, creature: 0, gear: 0, dungeon: 0, arena: 0,
  });
  const [claimedQuests, setClaimedQuests] = useState(() => initialSave?.claimedQuests ?? new Set());
  const [dailyDay, setDailyDay] = useState(() => initialSave?.dailyDay ?? 0);
  const [dailyLastClaimed, setDailyLastClaimed] = useState(() => initialSave?.dailyLastClaimed ?? null);
  const [newPlayerGiftDay, setNewPlayerGiftDay] = useState(() => initialSave?.newPlayerGiftDay ?? 0);
  const [newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed] = useState(() => initialSave?.newPlayerGiftLastClaimed ?? null);
  const [newPlayerGiftDoubled, setNewPlayerGiftDoubled] = useState(() => initialSave?.newPlayerGiftDoubled ?? false);
  const [dailyMissionsDate, setDailyMissionsDate] = useState(() => initialSave?.dailyMissionsDate ?? null);
  const [dailyMissionsSnapshot, setDailyMissionsSnapshot] = useState(() => initialSave?.dailyMissionsSnapshot ?? {
    eggsHatched: 0, dungeonsCleared: 0, arenaFights: 0,
    bananasUsed: 0, dailyBossFights: 0, plotsGrown: 0,
    labyrinthFights: 0, fieldHarvests: 0, petLevelUps: 0, equipLevelUps: 0, currencies: {},
  });
  const [dailyMissionsDone, setDailyMissionsDone] = useState(() => initialSave?.dailyMissionsDone ?? new Set());
  const [dailyCompletionClaimed, setDailyCompletionClaimed] = useState(() => initialSave?.dailyCompletionClaimed ?? false);
  const [dailySelectedMissions, setDailySelectedMissions] = useState(() => initialSave?.dailySelectedMissions ?? []);
  // Eastern-noon day key of the last free Flair Banana feed -- the first
  // banana fed each day (any type) doesn't consume inventory.
  const [lastFreeBananaDate, setLastFreeBananaDate] = useState(() => initialSave?.lastFreeBananaDate ?? null);

  // ── Battle pass ──────────────────────────────────────────────────────────
  const [battlepassLastReset, setBattlepassLastReset] = useState(() => initialSave?.battlepassLastReset ?? null);
  const [battlepassClaimed, setBattlepassClaimed] = useState(() => initialSave?.battlepassClaimed ?? Array(30).fill(false));
  const [battlepassPaidClaimed, setBattlepassPaidClaimed] = useState(() => initialSave?.battlepassPaidClaimed ?? Array(30).fill(false));
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

  // Dungeon passes regenerate, and recharge counts reset, at noon Eastern
  // Time -- the same boundary every daily system in the game now uses.
  useEffect(() => {
    const check = () => {
      if (isPastEasternNoon(lastDungeonPassGain)) {
        const dailyCap = DUNGEON_PASS_DAILY_CAP + (dungeonStarterPackPurchased ? DUNGEON_PASS_DAILY_CAP_BONUS : 0);
        setCurrencies((c) =>
          (c.dungeonPass || 0) >= dailyCap * DUNGEON_PASS_OVERFLOW_MULT ? c : { ...c, dungeonPass: (c.dungeonPass || 0) + dailyCap }
        );
        setLastDungeonPassGain(easternNoonDayKey());
      }
      if (isPastEasternNoon(lastPassRechargeReset)) {
        setPassRechargeCount(0);
        setLastPassRechargeReset(easternNoonDayKey());
      }
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [lastDungeonPassGain, lastPassRechargeReset, dungeonStarterPackPurchased]);

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
    tab, gameMode,
    tutorialSeen, tutorialRestricted, tutorialStep, postTutorialPopupPending, showQuestsArrow, pendingDungeonReveal,
    tutorialPhase, tutorialLine, tutorialPostLine, tutorialPickedCreatureId, tutorialPlayerCell,
    username, profileEmoji, profileAvatarId, profileFrame, profileTitle,
    currencies, owned, unlockedSkins, skinShards, everOwnedCreatureIds,
    equipmentLevels, equipmentAscensions, equipmentCopies, equipFavorites,
    pity, arenaLevels, arenaProgress,
    labyrinthDepth, labyrinthBestDepth,
    arenaPlanGrid, dungeonPlanGrid, labyrinthPlanGrid, dailyBossPlanGrid,
    farmPlots, farmFieldLevel, farmFieldLastHarvest, farmFieldSeed, farmCrops, plotUpgrades, specialPurchased, plotsUnlocked, purchasedOneTimeBundles,
    dungeonBossLevels, passRechargeCount, lastDungeonPassGain, lastPassRechargeReset, dailyBossData, dailyBossLevel, dungeonsUnlocked, dailyBossUnlocked, arenaUnlocked, treasureUnlocked, dungeonStarterPackPurchased, newFeaturePillsSeen,
    eggsHatched, dungeonsCleared, dungeonAutoFights, arenaFights, labyrinthFights, bananasUsed, candyUsed, dailyBossFights, plotsGrown, fieldHarvests,
    petLevelUps, equipLevelUps, fertilizerUsed, everCompletedDailyQuests,
    questBatchIdx, claimedQuests, dailyDay, dailyLastClaimed, newPlayerGiftDay, newPlayerGiftLastClaimed, newPlayerGiftDoubled, dailyMissionsDate, dailyMissionsSnapshot,
    dailyMissionsDone, dailyCompletionClaimed, dailySelectedMissions, lastFreeBananaDate,
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

  /** True if a Store bundle's one-time reward has already been claimed. */
  function isBundleOwned(bundle) {
    if (bundle.id === "starter_pack") return specialPurchased;
    if (bundle.id === "dungeon_starter_pack") return dungeonStarterPackPurchased;
    return purchasedOneTimeBundles.has(bundle.id);
  }

  /**
   * Grants a Store bundle (data/store.js): its flat `grants` currencies, plus
   * whatever gameplay effect its id maps to (starter_pack unlocks Farm's
   * Plot 5/6 via specialPurchased; dungeon_starter_pack permanently doubles
   * the daily Dungeon Pass regen via dungeonStarterPackPurchased -- see that
   * flag's use in the regen effect above). No real payment provider is
   * wired in, so this is the entire "purchase" -- it just grants instantly.
   * No-ops on an already-owned one-time bundle, the real guard against a
   * double-grant (e.g. two rapid taps) since StoreScreen also disables the card.
   */
  function purchaseBundle(bundle) {
    if (bundle.oneTime && isBundleOwned(bundle)) return;
    if (bundle.grants) {
      setCurrencies((c) => {
        const next = { ...c };
        for (const [key, amount] of Object.entries(bundle.grants)) next[key] = (next[key] || 0) + amount;
        return next;
      });
    }
    if (bundle.id === "starter_pack") setSpecialPurchased(true);
    else if (bundle.id === "dungeon_starter_pack") setDungeonStarterPackPurchased(true);
    else if (bundle.oneTime) setPurchasedOneTimeBundles((prev) => new Set(prev).add(bundle.id));
  }

  /** Grants a Store gem pack (data/store.js): always repeatable, no ownership tracking. */
  function purchaseGemPack(pack) {
    setCurrencies((c) => ({ ...c, gems: (c.gems || 0) + pack.gems + (pack.bonus || 0) }));
  }

  /** The bag of state quest `check()`/`progress()` predicates read. */
  const questState = useMemo(
    () => ({
      owned, currencies, unlockedSkins, arenaProgress, arenaLevels, dungeonBossLevels,
      eggsHatched, dungeonsCleared, dungeonAutoFights, arenaFights, bananasUsed, candyUsed, dailyBossFights, plotsGrown,
      labyrinthDepth, labyrinthBestDepth, labyrinthFights, fieldHarvests,
      petLevelUps, equipLevelUps, fertilizerUsed, everCompletedDailyQuests, equipmentLevels, equipmentCopies,
    }),
    [owned, currencies, unlockedSkins, arenaProgress, arenaLevels, dungeonBossLevels,
     eggsHatched, dungeonsCleared, dungeonAutoFights, arenaFights, bananasUsed, candyUsed, dailyBossFights, plotsGrown,
     labyrinthDepth, labyrinthBestDepth, labyrinthFights, fieldHarvests,
     petLevelUps, equipLevelUps, fertilizerUsed, everCompletedDailyQuests, equipmentLevels, equipmentCopies]
  );

  const value = {
    // ui
    tab, setTab, gameMode, setGameMode,
    collectionDeepLink, setCollectionDeepLink,
    farmDeepLink, setFarmDeepLink,
    dungeonDeepLink, setDungeonDeepLink,
    arenaDeepLink, setArenaDeepLink,
    creatureOverlay, setCreatureOverlay,
    dexOverlay, setDexOverlay,
    flairGuideStep, setFlairGuideStep,
    farmGuideStep, setFarmGuideStep,
    equipmentDetailOpen, setEquipmentDetailOpen,
    candyGuideStep, setCandyGuideStep,
    featuredCreatureId, setFeaturedCreatureId,
    username, setUsername, profileEmoji, setProfileEmoji,
    profileAvatarId, setProfileAvatarId,
    profileFrame, setProfileFrame, profileTitle, setProfileTitle,
    settingsOpen, setSettingsOpen,
    tutorialSeen, setTutorialSeen,
    tutorialRestricted, setTutorialRestricted,
    tutorialStep, setTutorialStep,
    postTutorialPopupPending, setPostTutorialPopupPending,
    showQuestsArrow, setShowQuestsArrow,
    pendingDungeonReveal, setPendingDungeonReveal,
    tutorialPhase, setTutorialPhase, tutorialLine, setTutorialLine, tutorialPostLine, setTutorialPostLine,
    tutorialPickedCreatureId, setTutorialPickedCreatureId, tutorialPlayerCell, setTutorialPlayerCell,
    harvestPopup, setHarvestPopup, revealedCount, setRevealedCount,
    // currencies + collection
    currencies, setCurrencies, owned, setOwned,
    unlockedSkins, setUnlockedSkins, skinShards, setSkinShards,
    everOwnedCreatureIds, setEverOwnedCreatureIds,
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
    // battle planning grids
    arenaPlanGrid, setArenaPlanGrid,
    dungeonPlanGrid, setDungeonPlanGrid,
    labyrinthPlanGrid, setLabyrinthPlanGrid,
    dailyBossPlanGrid, setDailyBossPlanGrid,
    // farm
    farmPlots, setFarmPlots, farmFieldLevel, setFarmFieldLevel,
    farmFieldLastHarvest, setFarmFieldLastHarvest,
    farmFieldSeed, setFarmFieldSeed,
    farmCrops, setFarmCrops, plotUpgrades, setPlotUpgrades,
    specialPurchased, setSpecialPurchased,
    plotsUnlocked, setPlotsUnlocked,
    // store
    purchasedOneTimeBundles, setPurchasedOneTimeBundles, purchaseBundle, purchaseGemPack, isBundleOwned,
    // dungeon / daily boss
    dungeonBossLevels, setDungeonBossLevels,
    passRechargeCount, setPassRechargeCount,
    lastDungeonPassGain, setLastDungeonPassGain,
    lastPassRechargeReset, setLastPassRechargeReset,
    dailyBossData, setDailyBossData, dailyBossLevel, setDailyBossLevel,
    dungeonsUnlocked, setDungeonsUnlocked, dailyBossUnlocked, setDailyBossUnlocked,
    arenaUnlocked, setArenaUnlocked, treasureUnlocked, setTreasureUnlocked,
    dungeonStarterPackPurchased, setDungeonStarterPackPurchased,
    newFeaturePillsSeen, setNewFeaturePillsSeen,
    devTimeOffset, setDevTimeOffset, nowMs,
    // counters
    eggsHatched, setEggsHatched, dungeonsCleared, setDungeonsCleared, dungeonAutoFights, setDungeonAutoFights,
    arenaFights, setArenaFights, labyrinthFights, setLabyrinthFights, bananasUsed, setBananasUsed,
    candyUsed, setCandyUsed,
    dailyBossFights, setDailyBossFights, plotsGrown, setPlotsGrown,
    fieldHarvests, setFieldHarvests,
    petLevelUps, setPetLevelUps, equipLevelUps, setEquipLevelUps,
    fertilizerUsed, setFertilizerUsed,
    everCompletedDailyQuests, setEverCompletedDailyQuests,
    // quests
    questBatchIdx, setQuestBatchIdx, claimedQuests, setClaimedQuests,
    dailyDay, setDailyDay, dailyLastClaimed, setDailyLastClaimed,
    newPlayerGiftDay, setNewPlayerGiftDay, newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed,
    newPlayerGiftDoubled, setNewPlayerGiftDoubled,
    dailyMissionsDate, setDailyMissionsDate,
    dailyMissionsSnapshot, setDailyMissionsSnapshot,
    dailyMissionsDone, setDailyMissionsDone,
    dailyCompletionClaimed, setDailyCompletionClaimed,
    dailySelectedMissions, setDailySelectedMissions,
    lastFreeBananaDate, setLastFreeBananaDate,
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
