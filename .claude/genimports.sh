#!/bin/sh
# Generates the import block for an extracted module by scanning it for symbols
# that live in other modules. Refactor tooling -- not shipped with the game.
#
# Usage: genimports.sh <file.js> <relative-prefix-to-src>
#   e.g. genimports.sh src/ui/screens/FarmScreen.js ../..

FILE="$1"
PREFIX="$2"

# symbol -> module registry
REG="
data/creatures.js:CREATURES CREATURE_MAP FINAL_FORMS ALL_TYPES
data/skins.js:SKIN_SETS
data/rarity.js:RARITY_CONFIG SKIN_TIER_CONFIG SKIN_FAIL_SHARDS RARITY_STAT_MULT STAT_CYCLE STAT_LABELS STAT_COLORS
data/equipment.js:EQUIP_RARITY_CONFIG EQUIPMENT_DEFS EQUIPMENT_MAP EQUIP_MAX_LEVEL EQUIP_MAX_ASCENSION EQUIP_ASC_COSTS
data/banners.js:BANNERS
data/flair.js:FLAIR_RARITIES BUFF_STAT_LABEL FLAIR_TITLES FLAIR_TITLE_MAP FLAIR_AURAS FLAIR_BACKGROUNDS FLAIR_ITEMS FLAIR_AURA_MAP FLAIR_BG_MAP FLAIR_ITEM_MAP FLAIR_SHARD_COSTS FLAIR_SHARD_VALUES FLAIR_BANANAS RARITY_COLORS_FLAIR
data/types.js:TYPE_EMOJI MELON_TYPES ROLE_CONFIG ATTACK_TYPE_CONFIG TYPE_STRONG_AGAINST
data/bosses.js:getBossStats makeBoss DUNGEON_BOSSES ARENA_TABS
data/island.js:ISLAND_COLS ISLAND_ROWS ISLAND_TILE TILE_COLORS ISLAND_GRID GRASS_CELLS CHUNK_SIZE CHUNK_COLS CHUNK_ROWS_COUNT CHUNK_COST chunkKey chunkHasLand INITIAL_CHUNK_KEYS
data/farm.js:FARM_PLOT_COSTS PLOT_GROW_MS PLOT_CROPS FIELD_RATES FIELD_MONEY_RATES FIELD_SHARD_RATES FIELD_UPGRADE_COSTS FIELD_CAP_HOURS FIELD_MIN_HOURS
data/treasures.js:TREASURE_RARITIES TREASURE_SETS TREASURES TREASURE_MAP
data/quests.js:QUEST_TABS BP_PTS_PER_NODE DAILY_COMPLETION_REWARD DAILY_COMPLETION_BP DAILY_MISSIONS QUEST_DEFS REWARD_LABELS REWARD_DESC DAILY_REWARDS BATTLEPASS_MISSIONS DAILY_POOL
data/store.js:STORE_GEM_PACKS STORE_BUNDLES
core/random.js:weightedPick randomOf shuffle seededRand
core/rewards.js:mergeRewards applyRewards
core/format.js:formatDuration
core/dates.js:todayStr isNewDay isPastDailyHour nextResetAt
core/creatures.js:getRootDef getChain getSkinsForCreature makeOwnedCreature calcStats getDisplayEmoji energyCost
core/equipment.js:equipUpgradeCost equipBonus equipBonusStr totalEquipBonus
core/stats.js:computeCombatStats getFlairBuffs
core/gacha.js:rollGacha rollSkinForCreature rollFlairRarity rollTreasure rollDungeonRewards pickDailyMissions feedFlair
core/melons.js:getMelonKey getMelonLabel getMelonAvailable deductMelon
config.js:DEV_MODE
battle/constants.js:ARENA_GRID_COLS ARENA_GRID_ROWS ARENA_PLAYER_START_ROW ARENA_TILE ARENA_MAX_DEPLOYED DUNGEON_GRID_COLS DUNGEON_GRID_ROWS DUNGEON_PLAYER_START_ROW DUNGEON_TILE DUNGEON_MAX_DEPLOYED MELEE_RANGE RANGED_RANGE
battle/geometry.js:aChebDist aCardinalDist aStepToward aBestStep aEase
battle/state.js:makeArenaBattle makeDungeonEnemyGrid
"

# components/screens are default exports, so they need `import X from` form
DEFAULTS="
ui/components/AscStars.js:AscStars
ui/components/StatBar.js:StatBar
ui/components/PipRow.js:PipRow
ui/components/Notify.js:Notify
ui/screens/CreatureDetail/SkinSection.js:SkinSection
ui/screens/CreatureDetail/AscensionPopup.js:AscensionPopup
ui/screens/CreatureDetail/FlairRaritySection.js:FlairRaritySection
ui/screens/CreatureDetail/FlairSection.js:FlairSection
ui/screens/CreatureDetail/index.js:CreatureDetail
ui/screens/DexEntry.js:DexEntry
ui/screens/DexScreen.js:DexScreen
ui/screens/CollectionScreen.js:CollectionScreen
ui/screens/GachaScreen.js:GachaScreen
ui/screens/ProfileScreen.js:ProfileScreen
ui/screens/DevPanel.js:DevPanel
ui/screens/IslandScreen.js:IslandScreen
ui/screens/FarmScreen.js:FarmScreen
ui/screens/TreasureScreen.js:TreasureScreen
ui/screens/BattlepassScreen.js:BattlepassScreen
ui/screens/DailyTabContent.js:DailyTabContent
ui/screens/QuestsScreen.js:QuestsScreen
ui/screens/StoreScreen.js:StoreScreen
ui/screens/DailyScreen.js:DailyScreen
ui/screens/HomeScreen.js:HomeScreen
ui/screens/battle/DungeonScreen.js:DungeonScreen
ui/screens/battle/DailyBossScreen.js:DailyBossScreen
ui/screens/battle/ArenaScreen.js:ArenaScreen
"

# strip comments+strings so we don't match words inside them
BODY=$(sed 's://.*::' "$FILE" | tr -d "\"'\`")

echo "$REG" | while IFS=: read -r mod syms; do
  [ -z "$mod" ] && continue
  used=""
  for s in $syms; do
    # skip anything this file defines itself
    grep -qE "^(export )?(function|const) $s\b" "$FILE" && continue
    if echo "$BODY" | grep -qE "\b$s\b"; then used="$used, $s"; fi
  done
  if [ -n "$used" ]; then
    echo "import {${used#,} } from \"$PREFIX/$mod\";"
  fi
done

echo "$DEFAULTS" | while IFS=: read -r mod sym; do
  [ -z "$mod" ] && continue
  grep -qE "^(export )?function $sym\b" "$FILE" && continue
  if echo "$BODY" | grep -qE "\b$sym\b"; then
    echo "import $sym from \"$PREFIX/$mod\";"
  fi
done
