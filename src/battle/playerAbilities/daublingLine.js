// Daubling (mud wasp) line: Mud Pellet / Clay Rampart / Sealing Shell.
//
// Mud Pellet keeps the engine's default ranged attack flow (closest enemy)
// with per-level damage scaling; at max level every landed hit also inflicts
// an Attack Down stack.
//
// Clay Rampart finds the LOWEST-Health ally (anywhere -- range doesn't
// matter, like Pollen Veil) and Shields every ally standing in that ally's
// horizontal row, itself included if it stands there. A row of Shields is a
// lot of Shield, so each one is thin: 25-40% of this creature's Attack
// (Shields scale off Attack). It leads with a Shield, so it fires off
// cooldown rather than waiting for an enemy in reach. At max level the
// Shielded creatures deal 30% more damage while THIS Shield is still intact:
// each one it lands is stamped with its size and expiry, and the stamp only
// counts while that Shield is the one the creature still carries -- broken,
// dispelled, run out or replaced by someone else's, and the bonus is gone.
// The bonus is read through onDamageBonus (battle/hp.js), registered below.
//
// Sealing Shell: the first time each ally falls below 50% Health, it is
// Shielded for 50-100% of this creature's Attack -- wherever it stands, in
// range or not. Once per ally per battle (per Daubling: two of them each
// answer once). At max level it also dispels every debuff on them.

import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { applyStatMod, dispelDebuffs } from "../status.js";
import { applyShield, baseShield, onDamageBonus } from "../hp.js";
import { battleTick } from "../applier.js";
import { hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
/** Clay Rampart: each Shield, as a share of this creature's Attack. */
const RAMPART_PCT_OF_ATK = [25, 30, 35, 40, 40];
/** Clay Rampart max tier: damage bonus while the Shield persists. */
const RAMPART_DMG_PCT = 30;
/** Sealing Shell: the Shield, as a share of this creature's Attack. */
const SEAL_PCT_OF_ATK = [50, 65, 80, 100, 100];
const SEAL_BELOW = 0.5;
/** Mud Pellet lvl 5: Attack Down (standard first-stack value). */
const ATK_DOWN_PCT = 15;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** Lowest-Health living ally, the caster included. */
function lowestAlly(aliveP) {
  let best = null;
  for (const a of aliveP) {
    if (a.hp <= 0) continue;
    if (!best || a.hp < best.hp) best = a;
  }
  return best;
}

/** Is the max-tier Rampart Shield stamped on `u` still the one it carries? */
function rampartIntact(u) {
  const w = u._rampart;
  if (!w) return false;
  const shield = baseShield(u);
  // Damage only ever shrinks it, so a bigger ordinary Shield means someone
  // else's has taken its place; past its expiry, any Shield is a later one.
  return battleTick() < w.expires && shield > 0 && shield <= w.size;
}

onDamageBonus((attacker) => (rampartIntact(attacker) ? RAMPART_DMG_PCT : 0));

export function makeDaublingModule(cfg) {
  const { basicDmgByLevel, rampartPctOfAtk, sealPctOfAtk } = cfg;
  return {
    /** Mud Pellet: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Mud Pellet lvl 5: every landed hit lowers the victim's Attack. */
    onHit(unit, target) {
      if (target && !hasRule(target, "ignoresOnHitEffects") && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "atk", pct: -ATK_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /** Sealing Shell: answer each ally's first fall below 50% Health. */
    onTick(unit, ctx) {
      const sealed = unit._sealed || (unit._sealed = new Set());
      const idx = abilityIdx(unit, "unique");
      for (const a of ctx.aliveP) {
        if (a.hp <= 0 || sealed.has(a.uid) || a.hp >= a.maxHp * SEAL_BELOW) continue;
        sealed.add(a.uid);
        applyShield(a, (unit.atk * sealPctOfAtk[idx]) / 100, STATUS_TICKS);
        if (idx >= MAX_IDX) dispelDebuffs(a);
        ctx.newFx.push({ id: ctx.now + "ss" + unit.uid + a.uid, row: a.row, col: a.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },

    specialInRange() {
      return true;
    },

    /** Clay Rampart: Shield the Lowest ally's whole row. */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const low = lowestAlly(aliveP);
      if (!low) return;
      const amount = (unit.atk * rampartPctOfAtk[idx]) / 100;
      for (const a of aliveP) {
        if (a.hp <= 0 || a.row !== low.row) continue;
        const kept = applyShield(a, amount, STATUS_TICKS);
        if (idx >= MAX_IDX && kept) a._rampart = { size: baseShield(a), expires: battleTick() + (a.shieldTicks || 0) };
        newFx.push({ id: now + "cr" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  rampartPctOfAtk: RAMPART_PCT_OF_ATK,
  sealPctOfAtk: SEAL_PCT_OF_ATK,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const daubling = makeDaublingModule(CFG);
export const daubwasp = makeDaublingModule(CFG);
export const claymason = makeDaublingModule(CFG);
export const kilnwarden = makeDaublingModule(CFG);
