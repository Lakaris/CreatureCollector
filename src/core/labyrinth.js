// Labyrinth reward schedule and difficulty curve -- shared between the
// planning/battle screen and the home entry point.

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

/**
 * Enemy HP/ATK/DEF multiplier curve, calibrated at each 1000-floor tier
 * boundary against the game's real level/ascension/equipment stat math (see
 * plan notes) so a team at roughly that tier's target investment can clear
 * it. Interpolated linearly between breakpoints -- retune these values after
 * playtesting via the Dev Panel's Labyrinth floor-jump buttons.
 */
export const DIFFICULTY_BREAKPOINTS = [
  { depth: 0, hpMult: -0.94, atkMult: -0.59, defMult: -0.45 },
  { depth: 1000, hpMult: 1, atkMult: 14, defMult: 20 },
  { depth: 2000, hpMult: 7.5, atkMult: 64, defMult: 90 },
  { depth: 3000, hpMult: 26, atkMult: 205, defMult: 294 },
  { depth: 4000, hpMult: 71, atkMult: 555, defMult: 798 },
  { depth: 5000, hpMult: 115, atkMult: 900, defMult: 1300 },
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
  const d = Math.min(MAX_LABYRINTH_DEPTH, Math.max(0, depth));
  const pts = DIFFICULTY_BREAKPOINTS;
  let lo = pts[0], hi = pts[pts.length - 1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (d >= pts[i].depth && d <= pts[i + 1].depth) { lo = pts[i]; hi = pts[i + 1]; break; }
  }
  const span = hi.depth - lo.depth;
  const t = span > 0 ? (d - lo.depth) / span : 0;
  return {
    hpMult: lo.hpMult + (hi.hpMult - lo.hpMult) * t,
    atkMult: lo.atkMult + (hi.atkMult - lo.atkMult) * t,
    defMult: lo.defMult + (hi.defMult - lo.defMult) * t,
  };
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

/** Ability levels run 0-5 (matching the player creature cap in CreatureDetail).
 * Enemy ability level climbs one step every 200 floors and is fully maxed
 * (5) by floor 1000, staying maxed the rest of the way to floor 5000 --
 * abilities ramp up much faster than evolution stage does. */
export const MAX_ENEMY_ABILITY_LEVEL = 5;
export function getEnemyAbilityLevelForDepth(depth) {
  return Math.min(MAX_ENEMY_ABILITY_LEVEL, Math.floor(depth / 200));
}

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
