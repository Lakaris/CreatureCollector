// Doomshade line: Spectral Rake / Grave Lantern / Lantern Keeper -- and the
// Wisp, the game's first summoned creature (its player-facing kit lives on
// the Wisp tag in core/abilityText.js; its battle-only def in CREATURE_MAP).
//
// Spectral Rake keeps the engine's default melee flow (closest enemy) with
// per-level damage scaling; at max level every landed hit also inflicts
// Damage Over Time -- dotTicks + dotSourceAtk, ticked beside player Burn in
// tick.js / status.js at 3.5% of Doomshade's ATK per tick, boss included.
//
// Grave Lantern summons one Wisp beside Doomshade when fewer than two of ITS
// OWN Wisps are up -- the charge bar HOLDS at full otherwise -- and at max
// level the new Wisp arrives with a full charge bar. Lantern Keeper summons
// one Wisp (two at max level) with full charge on the first tick of battle;
// it uses onTick rather than onBattleStart because placement needs the grid
// (bounds + occupancy), which only the tick context carries.
//
// The Wisp is a real unit on its summoner's side, linked by _summonOf:
//   - Beckon: Taunts the closest enemy in melee reach (Taunt has no effect
//     on bosses, so with only the boss left it just bodyblocks).
//   - Ghostly Step: teleports beside a random enemy when its own special
//     charges -- always to an EMPTY tile (teleports never trigger Hazards).
//   - Grave Grudge: the enemy that lands the killing hit takes 10% of the
//     summoner's max Health, via the engine's onDamaged reflect hook, so it
//     fires the instant the kill lands and routes through damageUnit.
//     Deaths with no attacker (DoTs, Hazards, boss-module hits) don't
//     detonate -- there is nobody holding the blame.
// The engine prunes dead and orphaned summons at the end of every tick
// (runBattleTick's Summons pass): a defeated Wisp leaves no body, and all of
// a summoner's Wisps vanish when the summoner is defeated.

import { attackCooldown } from "../damage.js";
import { unitDist } from "../geometry.js";
import { MELEE_RANGE, STATUS_TICKS } from "../constants.js";
import { isIntangible, isStunned, speedPenalty } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
/** Displayed Wisp Health by summoning-ability level (both abilities share the
 * curve), multiplied by the battle HP scale like every creature's Health. */
const WISP_HP_BY_LEVEL = [25, 32, 40, 50, 50];
const WISP_HP_SCALE = 4; // matches state.js's HP_SCALE
/** Grave Lantern holds while this many of its summoner's Wisps are alive. */
const WISP_CAP = 2;
/** Ghostly Step's charge cost. */
const WISP_CHARGE = 10;
/** Grave Grudge: fraction of the summoner's max Health dealt to the killer. */
const GRUDGE_FRAC = 0.1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

function livingWispsOf(unit, allies) {
  return allies.filter((a) => a._summonOf === unit.uid && a.hp > 0).length;
}

/** Build and place one Wisp beside its summoner; no-op when the grid is full. */
function summonWisp(unit, ctx, hpIdx, charged) {
  const spot = ctx.nearestOpenCell(unit.row, unit.col);
  if (!spot) return;
  const hp = WISP_HP_BY_LEVEL[hpIdx] * WISP_HP_SCALE;
  const wisp = {
    uid: unit.uid + "w" + (unit._wispN = (unit._wispN || 0) + 1),
    creatureId: "__wisp",
    row: spot[0], col: spot[1], prevRow: spot[0], prevCol: spot[1],
    lastMoveTime: ctx.now,
    hp, maxHp: hp,
    // Never attacks for damage (Beckon only Taunts); borrows its summoner's
    // DEF -- a Tank spun from the summoner's own substance, no new numbers.
    atk: 0, def: unit.def, spd: 1,
    isRanged: false,
    atkCd: 0,
    abilitySpeed: 1,
    abilCharge: charged ? WISP_CHARGE : 0,
    abilChargeMax: WISP_CHARGE,
    abilityLevels: { basic: 0, special: 0, unique: 0 },
    _summonOf: unit.uid,
    _grudgeDmg: Math.max(1, Math.round(unit.maxHp * GRUDGE_FRAC)),
  };
  ctx.addSummon(wisp);
  ctx.newFx.push({ id: ctx.now + "gl" + wisp.uid, row: wisp.row, col: wisp.col, t: ctx.now, isDark: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
}

export function makeDoomshadeModule(cfg) {
  const { basicDmgByLevel } = cfg;
  return {
    /** Spectral Rake: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Spectral Rake at max level: every landed hit refreshes the DoT. */
    onHit(unit, target) {
      if (target && abilityIdx(unit, "basic") >= MAX_IDX) {
        target.dotTicks = STATUS_TICKS;
        target.dotSourceAtk = unit.atk;
      }
      return 0;
    },

    /** Lantern Keeper: the opening Wisps, placed on the first tick. */
    onTick(unit, ctx) {
      if (unit._lanternDone) return;
      unit._lanternDone = true;
      const idx = abilityIdx(unit, "unique");
      const count = idx >= MAX_IDX ? 2 : 1;
      for (let i = 0; i < count; i++) summonWisp(unit, ctx, idx, true);
    },

    /**
     * Grave Lantern's gate: HOLD the full bar while two of this summoner's
     * Wisps are up; otherwise fire as soon as there is any foe to haunt --
     * the Wisp walks (or teleports) there on its own, so no range gate.
     */
    specialInRange(unit, { aliveE, aliveP, boss }) {
      if (livingWispsOf(unit, aliveP) >= WISP_CAP) return false;
      return aliveE.some((e) => e.hp > 0) || !!(boss && boss.hp > 0);
    },

    special(unit, ctx) {
      if (livingWispsOf(unit, ctx.aliveP) >= WISP_CAP) return;
      const idx = abilityIdx(unit, "special");
      summonWisp(unit, ctx, idx, idx >= MAX_IDX);
    },
  };
}

/** The Wisp's own behavior module (registered as "__wisp"). */
export const wispModule = {
  /**
   * Beckon: walk at the closest targetable enemy and Taunt it (tauntTicks +
   * tauntSourceUid, replace-on-reapply per policy). Owns targeting and
   * movement like other basicAttack overrides -- the Wisp never deals
   * attack damage. With no minions left it walks at the boss and soaks.
   */
  basicAttack(unit, ctx) {
    const { aliveE, boss, newFx, now } = ctx;
    let best = null, bestD = Infinity;
    for (const e of aliveE) {
      if (e.hp <= 0 || isIntangible(e)) continue;
      const d = unitDist(unit, e);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (!best) {
      if (boss && boss.hp > 0) ctx.stepToward(boss.row, boss.col);
      return;
    }
    if (bestD > MELEE_RANGE) { ctx.stepToward(best.row, best.col); return; }
    if (unit.atkCd > 0 || isStunned(unit)) return;
    best.tauntTicks = STATUS_TICKS;
    best.tauntSourceUid = unit.uid;
    unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    newFx.push({ id: now + "bk" + unit.uid, row: best.row, col: best.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
  },

  /** Ghostly Step is an engage tool: any foe on the field opens the gate. */
  specialInRange(unit, { aliveE }) {
    return aliveE.some((e) => e.hp > 0 && !isIntangible(e));
  },

  /**
   * Ghostly Step: teleport to an empty tile beside a RANDOM enemy (never
   * onto an occupied one; the ring accounts for 2x2 bodies). relocate is a
   * blink, so it never triggers ground Hazards. Falls back to the nearest
   * open cell around the target when its whole ring is occupied.
   */
  special(unit, ctx) {
    const { aliveE, newFx, now } = ctx;
    const foes = aliveE.filter((e) => e.hp > 0 && !isIntangible(e));
    if (!foes.length) return;
    const tgt = foes[Math.floor(Math.random() * foes.length)];
    const size = tgt.size || 1;
    const ring = [];
    for (let r = tgt.row - 1; r <= tgt.row + size; r++) {
      for (let c = tgt.col - 1; c <= tgt.col + size; c++) {
        const inBody = r >= tgt.row && r < tgt.row + size && c >= tgt.col && c < tgt.col + size;
        if (!inBody && !ctx.blocked(r, c)) ring.push([r, c]);
      }
    }
    const spot = ring.length
      ? ring[Math.floor(Math.random() * ring.length)]
      : ctx.nearestOpenCell(tgt.row, tgt.col);
    if (!spot) return;
    ctx.relocate(spot[0], spot[1]);
    newFx.push({ id: now + "gs" + unit.uid, row: spot[0], col: spot[1], t: now, isDark: true, fromRow: unit.prevRow, fromCol: unit.prevCol, isEnemy: !!ctx.isEnemySide });
  },

  /**
   * Grave Grudge: the killing attacker takes 10% of the summoner's max
   * Health, snapshotted at summon time. Runs through the reflect path, so
   * it lands immediately and (player side) credits the damage chart's
   * "Wisp" row.
   */
  onDamaged(unit) {
    if (unit.hp <= 0 && !unit._grudgeFired) {
      unit._grudgeFired = true;
      return unit._grudgeDmg || 0;
    }
    return 0;
  },
};

const CFG = { basicDmgByLevel: BASIC_DMG_BY_LEVEL };
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const doomgrub = makeDoomshadeModule(CFG);
export const nihilwyrm = makeDoomshadeModule(CFG);
