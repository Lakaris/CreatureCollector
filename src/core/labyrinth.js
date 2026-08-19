// Labyrinth reward schedule and difficulty curve -- shared between the
// planning/battle screen and the home entry point.

import { CREATURES } from "../data/creatures.js";
import { equipBonus } from "./equipment.js";

export const MAX_LABYRINTH_DEPTH = 5000;

/**
 * Display-only "enemy level" shown in the planning UI. Depth 1 -> level 1,
 * depth 1000 -> level 100, depth 5000 -> level 500 (matches the creature
 * level cap). Purely cosmetic -- actual enemy stats are driven by
 * getDifficultyMultipliers, not this number.
 */
export function getEnemyLevelForDepth(depth) {
  return Math.min(500, Math.max(1, Math.ceil(depth / 10)));
}

// ── Difficulty model ────────────────────────────────────────────────────
// Enemy multipliers are computed at EVERY depth (not interpolated between
// hand-tuned breakpoints) as
//
//   mult(depth) = targetRatio(depth) * playerPower(depth) / enemyBase(depth) - 1
//
// so each 10-floor progression step stays balanced against the investment a
// player on-curve actually has there: creature level depth/10 (ascension
// level/10) funded by the Field loop, gear level depth/50 (ascension
// level/10). `targetRatio` encodes the intended difficulty ramp -- its
// anchors reproduce the original hand-tuned curve's enemy:player stat ratios
// at each 1000-floor boundary, translated through the 2026-08 stat rebalance
// (flat RARITY_STAT_MULT, legendary finals at stage-1 x1.2, equipment curve
// capped at ~30x). Retune difficulty by editing the anchors, not the model.

const CORE_STATS = ["hp", "atk", "def"];

// Average base stats of each evolution-stage enemy pool, computed from the
// live roster so creature rebalances feed straight into the curve.
const POOL_AVG = (() => {
  const groups = {
    base: CREATURES.filter((c) => !c.evolutionOf),
    mid: CREATURES.filter((c) => c.evolutionOf && c.evolutionId),
    final: CREATURES.filter((c) => c.evolutionOf && !c.evolutionId),
  };
  const out = {};
  for (const g in groups) {
    out[g] = { hp: 0, atk: 0, def: 0 };
    for (const c of groups[g]) for (const k of CORE_STATS) out[g][k] += c.stats[k] / groups[g].length;
  }
  return out;
})();

// Modeled on-curve player: average of a final-form common/epic/legendary
// (Ashmonarch / Thunderdrake / Glacialhydra) wearing 4 two-stat legendary
// items -- the same benchmark the ratio anchors were derived with. Creature
// growth mirrors calcStats (level bumps of 5% base across 3 stats, +8% per
// ascension) smoothed to real-valued levels; gear goes through the REAL
// equipBonus on a 17-base legendary item (8 stat rolls spread over 3 stats),
// so equipment-curve changes recalibrate the difficulty automatically.
const PLAYER_BENCH = { hp: 118.7, atk: 146, def: 90 };

function playerPowerAt(depth) {
  const L = Math.max(1, depth / 10), A = depth / 100;
  const G = Math.max(1, depth / 50), ga = G / 10;
  const gear = (8 / 3) * equipBonus("leg_hp_atk", G, ga).hp;
  const out = {};
  for (const k of CORE_STATS) out[k] = PLAYER_BENCH[k] * (1 + ((L - 1) / 3) * 0.05) * (1 + A * 0.08) + gear;
  return out;
}

/** Target enemy-stat : player-stat ratios -- the difficulty ramp itself.
 * Piecewise-linear between anchors; values reproduce the pre-rebalance
 * curve's difficulty at each 1000-floor boundary. */
export const DIFFICULTY_RATIO_ANCHORS = [
  { depth: 0, hp: 0.02, atk: 0.117, def: 0.189 },
  { depth: 1000, hp: 0.071, atk: 0.464, def: 0.703 },
  { depth: 2000, hp: 0.134, atk: 0.913, def: 1.358 },
  { depth: 3000, hp: 0.259, atk: 1.756, def: 2.652 },
  { depth: 4000, hp: 0.462, atk: 3.216, def: 4.823 },
  { depth: 5000, hp: 0.477, atk: 3.352, def: 5.012 },
];

// Floor 1 is most players' first real fight, right out of the tutorial --
// hand-tuned (rather than read off the generic curve, which is calibrated
// for a 6-enemy roster at all depths and would make a fixed 2-enemy floor
// either a 1-hit throwaway or, worse, a real threat) so a level-1 starter
// with just the tutorial's Iron Band needs a few hits per enemy but is
// never at real risk. See getEnemyLayoutForDepth's depth===1 case for the
// matching 2-enemy layout (Duskling + Sparkit) these multipliers are
// calibrated against.
const FLOOR_1_DIFFICULTY = { hpMult: -0.25, atkMult: -0.83, defMult: -0.32 };

export function getDifficultyMultipliers(depth) {
  if (depth === 1) return FLOOR_1_DIFFICULTY;
  const d = Math.min(MAX_LABYRINTH_DEPTH, Math.max(2, depth));
  const pts = DIFFICULTY_RATIO_ANCHORS;
  let lo = pts[0], hi = pts[pts.length - 1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (d >= pts[i].depth && d <= pts[i + 1].depth) { lo = pts[i]; hi = pts[i + 1]; break; }
  }
  const span = hi.depth - lo.depth;
  const t = span > 0 ? (d - lo.depth) / span : 0;
  const mix = getEnemyEvolutionMixForDepth(d);
  const player = playerPowerAt(d);
  const out = {};
  for (const k of CORE_STATS) {
    const ratio = lo[k] + (hi[k] - lo[k]) * t;
    const enemyBase = (mix.base * POOL_AVG.base[k] + mix.mid * POOL_AVG.mid[k] + mix.final * POOL_AVG.final[k]) / 6;
    out[k + "Mult"] = ratio * player[k] / enemyBase - 1;
  }
  return out;
}

/**
 * How many of the 6 Labyrinth enemy slots should be base-form / mid-evolution
 * / final-evolution creatures at a given depth. Floors 1-1000 are almost
 * entirely unevolved (base) forms, with a couple of mid-evolution forms
 * mixed in by floor 1000; from there the mix shifts steadily toward final
 * forms, reaching an all-final-evolution roster by floor 4000 and staying
 * that way through floor 5000.
 */
export function getEnemyEvolutionMixForDepth(depth) {
  if (depth <= 1000) {
    const t = (depth - 1) / 999;
    const mid = Math.min(2, Math.floor(t * 3));
    return { base: 6 - mid, mid, final: 0 };
  }
  const t = Math.min(1, (depth - 1000) / 3000);
  const final = Math.round(6 * t);
  const mid = Math.round(2 * (1 - t));
  const base = Math.max(0, 6 - final - mid);
  return { base, mid, final };
}

// Enemy ability level used to ramp with depth here; it no longer does --
// every enemy in the game fights with a maxed kit (MAX_ABILITY_LEVEL, see
// battle/state.js), so depth only scales stats.

export const LABYRINTH_REWARD_DISPLAY = {
  gems: ["💎", "Gem", "Gems"],
  candy: ["🍬", "Candy", "Candy"],
  mysteriousOre: ["🪨", "Mysterious Ore", "Mysterious Ore"],
  flairBanana: ["🍌", "Flair Banana", "Flair Bananas"],
  mythicalFlairBanana: ["🍌✨", "Mythical Flair Banana", "Mythical Flair Bananas"],
  legendaryEggs: ["🥚✨", "Legendary Egg", "Legendary Eggs"],
  eggs: ["🥚", "Egg", "Eggs"],
  dungeonPass: ["🎫", "Dungeon Pass", "Dungeon Passes"],
  ancientFertilizer: ["🪴", "Ancient Fertilizer", "Ancient Fertilizer"],
};

/** Reward for clearing a given depth -- repeats on a 50-floor cycle.
 * Ancient Fertilizer drops on every 10th floor (500 total over 5000 floors),
 * matching the Field's 500 levels at 1 fertilizer each -- see the design
 * note in data/farm.js. */
export function getDepthReward(depth) {
  if (depth === 1) return { eggs: 5 };
  const m = depth % 50;
  if (m === 0) return { legendaryEggs: 1, ancientFertilizer: 1 };
  if (m === 10 || m === 20 || m === 30 || m === 40) return { eggs: 1, ancientFertilizer: 1 };
  if (m === 5 || m === 15 || m === 25 || m === 45) return { dungeonPass: 10 };
  if (m === 3 || m === 13 || m === 23 || m === 33 || m === 43) return { flairBanana: 1 };
  if (m === 7 || m === 17 || m === 27 || m === 37 || m === 47) return { mysteriousOre: 1 };
  return {};
}

/** Nearest upcoming depth (after the given one) that pays out a reward. */
export function nextRewardDepth(depth) {
  const end = Math.min(depth + 50, MAX_LABYRINTH_DEPTH);
  for (let d = depth + 1; d <= end; d++) {
    const r = getDepthReward(d);
    if (Object.keys(r).length) return { depth: d, reward: r };
  }
  return null;
}

export function formatLabyrinthReward(reward) {
  return Object.entries(reward).map(([k, v]) => {
    const d = LABYRINTH_REWARD_DISPLAY[k] || ["🎁", k, k];
    return d[0] + " " + v;
  }).join(" ");
}
