// Dark boss -- a dark panda shaman ("Dark Boss" is a working name) -- Ink Brush
// Sweep / Spirit Siphon / Ancestor Totems. Ranged and stationary.
//
// Ink Brush Sweep (Basic) picks the nearest player -- the Taunt holder, if any
// (ctx.byDistance) -- and hits every player in that Row, inflicting Defense
// Down and Healing Down (one stack each from the boss, per the per-ability
// stacking policy).
//
// Spirit Siphon (Special) hits every player and dispels all their buffs; each buff
// it strips gives the boss +1% Attack for the rest of the battle -- one exact,
// undispellable stat mod that grows (see `exact` / `undispellable` in
// applyStatMod), so ctx.dmg picks it up through the boss's Attack.
//
// Ancestor Totems (Passive): four Totems stand around the boss from the start
// (data/bosses.js lists them; DungeonScreen's dFight spawns them as the boss's
// summons, so they vanish when it falls). Every living Totem cuts the damage
// the boss takes by 15% -- every source, via onDamageTaken in hp.js. Each
// Totem's Basic buffs the boss (darkTotemModule below):
//   Totem 1 (above, left)  -- Haste Up
//   Totem 4 (above, right) -- Speed Up
//   Totem 2 (left edge)    -- Attack Up
//   Totem 3 (right edge)   -- Defense Up
// all undispellable. A boss runs on its kit's own clocks and takes damage
// unmitigated by Defense, so this kit gives those buffs their meaning itself:
// Speed shortens the Basic's cooldown, Haste the Special's, and Defense Up
// divides the damage it takes.

import { STATUS_TICKS } from "../constants.js";
import { damageUnit, onDamageTaken } from "../hp.js";
import { applyStatMod, countBuffs, dispelBuffs, isIntangible, statModMultiplier, speedPenalty } from "../status.js";
import { attackCooldown } from "../damage.js";
import { battleRoster } from "../applier.js";

const BASIC_CD = 10;
const BASIC_MULT = 0.2;
const SPECIAL_CD = 22;
const SPECIAL_MULT = 0.12;
/** Spirit Siphon: Attack gained per buff dispelled, for the rest of the battle. */
const ATK_PER_DISPEL_PCT = 1;
/** Ancestor Totems: damage the boss takes is cut this much per living Totem. */
const TOTEM_GUARD_PCT = 15;
/** Defense Down / Healing Down -- one stack each (the shared tables set totals). */
const DEF_DOWN_PCT = 15;
const HEAL_DOWN_PCT = 20;
/** The Totems' buffs: one standard stack each (ABILITY_TAG_DEFS magnitudes). */
const TOTEM_BUFFS = {
  haste: [["haste", 5]],
  speed: [["spd", 25]],
  attack: [["atk", 15]],
  defense: [["def", 15]],
};

const isDarkBoss = (u) => u?.creatureId === "__boss_dark";
const livingTotems = (boss) => battleRoster().filter((t) => t.hp > 0 && t.totemKind && t._summonOf === boss.uid);

/** A cooldown shortened by the boss's Speed or Haste buffs. */
function scaledCd(boss, base, kind) {
  return Math.max(1, Math.round(base / Math.max(0.25, statModMultiplier(boss, kind))));
}

// Ancestor Totems + Defense Up: what reaches the boss.
onDamageTaken((target) => {
  if (!isDarkBoss(target)) return 1;
  const guard = Math.max(0, 1 - (TOTEM_GUARD_PCT * livingTotems(target).length) / 100);
  return guard / Math.max(1, statModMultiplier(target, "def"));
});

export default {
  key: "dark",

  special(ctx) {
    const { boss, aliveP, newFx, now } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    let dispelled = 0;
    for (const u of aliveP) {
      damageUnit(u, ctx.dmg(SPECIAL_MULT));
      const before = countBuffs(u);
      dispelBuffs(u);
      dispelled += Math.max(0, before - countBuffs(u));
      newFx.push({ id: now + "unr" + u.uid, row: u.row, col: u.col, t: now, isDark: true });
    }
    if (dispelled) {
      boss._siphonAtkPct = (boss._siphonAtkPct || 0) + dispelled * ATK_PER_DISPEL_PCT;
      applyStatMod(boss, { kind: "atk", pct: boss._siphonAtkPct, src: boss.uid + ":siphon", ticks: 1e9, holdDuration: true, exact: true, undispellable: true });
    }
    boss.specialCd = scaledCd(boss, SPECIAL_CD, "haste");
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridCols } = ctx;
    if (boss.atkCd > 0 || !aliveP.length) return;
    const target = ctx.byDistance()[0];
    if (!target) return;
    const cd = scaledCd(boss, BASIC_CD, "spd");
    if (ctx.missesBlinded(cd, target)) return;

    const row = target.row;
    for (const u of aliveP) {
      if (u.row !== row || u.hp <= 0 || isIntangible(u)) continue;
      damageUnit(u, ctx.dmg(BASIC_MULT));
      applyStatMod(u, { kind: "def", pct: -DEF_DOWN_PCT, src: boss.uid, ticks: STATUS_TICKS });
      applyStatMod(u, { kind: "heal", pct: -HEAL_DOWN_PCT, src: boss.uid, ticks: STATUS_TICKS });
      newFx.push({ id: now + "ssw" + u.uid, row: u.row, col: u.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    }
    for (let c = 0; c < gridCols; c++) newFx.push({ id: now + "sswrow" + c, row, col: c, t: now, isDark: true });
    boss.atkCd = cd;
    boss.lastAttackTime = now;
  },

  /** Ink Brush Sweep picks a Row in the player zone, so preview the player zone. */
  basicTiles: (geo) => {
    const out = new Set();
    for (let r = geo.playerStartRow; r < geo.gridRows; r++) {
      for (let c = 0; c < geo.gridCols; c++) out.add(r + "," + c);
    }
    return out;
  },

  specialTiles: (geo) => geo.allCells(),
};

/**
 * The Totems' own kit ("__dark_totem"): they never move or attack. Each Basic
 * -- on its own cooldown, at the Totems' 0.5 Speed -- buffs the boss that
 * summoned it with its kind's buffs (TOTEM_BUFFS), undispellable, lasting
 * until its next Basic so the boss stays buffed for as long as the Totem
 * stands.
 */
export const darkTotemModule = {
  basicAttack(unit, ctx) {
    if (unit.atkCd > 0) return;
    const boss = ctx.aliveP.find((u) => u.uid === unit._summonOf && u.hp > 0);
    if (!boss) return;
    const cd = attackCooldown(unit, speedPenalty(unit));
    for (const [kind, pct] of TOTEM_BUFFS[unit.totemKind] || []) {
      applyStatMod(boss, { kind, pct, src: unit.uid, ticks: cd + 1, holdDuration: true, undispellable: true });
    }
    unit.atkCd = cd;
    unit.lastAttackTime = ctx.now;
    ctx.newFx.push({ id: ctx.now + "tot" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
  },
};
