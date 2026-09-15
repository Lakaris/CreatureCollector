// Sparkshell line: Static Zap / Discharge / Battery Shell.
//
// A ranged Electric tank built around one number: Charge. Everything that
// happens to it feeds Charge, and everything it does reads Charge -- so the
// more the fight leans on it, the more it gives back.
//
// Battery Shell is the intake. Every hit it takes and every buff it gains adds
// Charge (capped at 60), and every stack it holds is a little more Attack and
// Defense -- so a battered, well-supported tortoise is a stronger one. At max
// level, sitting at full Charge also grants Haste Up.
//
// Static Zap is the ordinary output: a ranged hit that Chains to one enemy
// beside its target with the same effects. At max level Charge widens the
// arc -- one extra target for every 10 stacks -- so a full battery zaps a
// whole cluster.
//
// Discharge is the big spend. It dumps half the current Charge and raises an
// Aura that hastens and quickens allies inside it while draining and slowing
// enemies -- the first aura with an enemy face (see status.js). It starts one
// tile wide; at max level every 10 Charge consumed adds a tile, so a full
// battery discharges across most of the board.
//
// "Charge" here is the kit's own resource, not the ability-charge meter that
// fires the Special -- the two share a word and nothing else.

import { aChebDist, distToBoss } from "../geometry.js";
import { basicUnitDamage, basicDamageToBoss, damageBoss } from "../damage.js";
import { ENDURING_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyStatMod, applyAura, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced, the flattened curve the rest of the tank cohort uses.
const BASIC_DMG_BY_LEVEL = [12, 13, 15, 17, 17];
/** Static Zap always Chains to this many extra enemies beside its target. */
const CHAIN_BASE = 1;
/** Static Zap lvl 5 / Discharge lvl 5: Charge per extra chain target / aura tile. */
const CHARGE_PER_STEP = 10;
/** The most Charge the shell can hold. */
const CHARGE_CAP = 60;
/** Battery Shell: Charge gained per hit taken or buff gained, by unique level. */
const CHARGE_GAIN_BY_LEVEL = [1, 2, 3, 3, 3];
/** Battery Shell: Attack and Defense % per stack of Charge, by unique level. */
const STAT_PER_CHARGE_BY_LEVEL = [0.5, 0.5, 0.5, 1, 1];
/** Battery Shell lvl 5: Haste Up while at full Charge (first-stack value). */
const HASTE_UP_PCT = 5;
/** Discharge: Haste granted to allies inside the aura, by special level. */
const AURA_ALLY_HASTE_BY_LEVEL = [5, 10, 15, 15, 15];
/** Discharge: Haste stripped from enemies inside the aura, by special level. */
const AURA_ENEMY_HASTE_BY_LEVEL = [5, 5, 5, 15, 15];
/** Discharge: the Speed Up / Speed Down stack the aura holds on those inside. */
const AURA_SPEED_UP_PCT = 25;
const AURA_SPEED_DOWN_PCT = 5;
/** Discharge starts one tile wide; max level grows it per Charge consumed. */
const AURA_BASE_RANGE = 1;
/** Fraction of current Charge Discharge consumes. */
const DISCHARGE_FRACTION = 0.5;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

function gainCharge(unit, n) {
  unit.charge = Math.min(CHARGE_CAP, (unit.charge || 0) + n);
}

/**
 * How many buffs the unit is wearing, for Battery Shell's "gains a buff"
 * trigger. Counted rather than hooked: there is no engine-wide "buff applied"
 * event, and a per-tick count that went UP is the same thing observed from
 * the other end. Refreshing a buff already held does not count.
 */
function buffCount(u) {
  let n = 0;
  if (u.statMods) for (const m of u.statMods) if (m.pct > 0) n++;
  if ((u.shield || 0) > 0) n++;
  if ((u.fortifyStacks || 0) > 0) n++;
  if (u.protect && u.protect.stacks > 0) n++;
  if (u.aura) n++;
  if ((u.immortalTicks || 0) > 0) n++;
  if ((u.intangibleTicks || 0) > 0) n++;
  if ((u.windbreakTicks || 0) > 0) n++;
  return n;
}

export function makeSparkshellModule(cfg) {
  const { basicDmgByLevel, chargeGainByLevel, statPerChargeByLevel, allyHasteByLevel, enemyHasteByLevel } = cfg;
  return {
    onBattleStart(unit) {
      unit.charge = 0;
      unit._hpSeen = unit.hp;
      unit._buffsSeen = buffCount(unit);
    },

    /** Static Zap: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /**
     * Battery Shell, the per-hit half: every attack that lands is a stack.
     * onDamaged fires after the hit has been applied, so the Health snapshot
     * is moved past it here and the tick-side check below cannot count the
     * same hit twice.
     */
    onDamaged(unit, attacker, dmg) {
      if (dmg <= 0 || unit.hp <= 0) return 0;
      gainCharge(unit, chargeGainByLevel[abilityIdx(unit, "unique")]);
      unit._hpSeen = unit.hp;
      return 0;
    },

    /**
     * Battery Shell, the rest of it, plus the housekeeping Static Zap's chain
     * needs. Runs before the unit's attack each tick.
     */
    onTick(unit, ctx) {
      const uIdx = abilityIdx(unit, "unique");
      const gain = chargeGainByLevel[uIdx];

      // Damage that did not come through an attack (Burn, Hazards, specials)
      // shows up as Health lost since the last look.
      if (unit.hp < (unit._hpSeen ?? unit.hp)) gainCharge(unit, gain);
      unit._hpSeen = unit.hp;

      // A NEW buff, not a refreshed one.
      const buffs = buffCount(unit);
      if (buffs > (unit._buffsSeen || 0)) gainCharge(unit, gain);
      unit._buffsSeen = buffs;

      // Every stack held is Attack and Defense, recomputed as Charge moves.
      const pct = (unit.charge || 0) * statPerChargeByLevel[uIdx];
      unit._passiveAtkPct = pct;
      unit._passiveDefPct = pct;

      // Max level: a full battery hums. Re-stamped each tick it stays full, so
      // the stack expires on its own once Charge is spent.
      if (uIdx >= MAX_IDX && (unit.charge || 0) >= CHARGE_CAP) {
        applyStatMod(unit, { kind: "haste", pct: HASTE_UP_PCT, src: unit.uid, ticks: 2 });
      }

      // Static Zap's chain fires from onHit, which sees no context -- stash
      // what it needs here (the same pattern Cinder Scent uses for hazards).
      unit._foes = ctx.aliveE;
      unit._allies = ctx.aliveP;
      unit._boss = ctx.boss;
      unit._fx = ctx.newFx;
      unit._now = ctx.now;
      unit._credit = ctx.addDamageDealt;
      unit._enemySide = !!ctx.isEnemySide;
    },

    /**
     * Static Zap's Chain: after the main hit lands, strike the enemies beside
     * its target too -- one by default, one more per 10 Charge at max level.
     * Chained hits are ordinary ability damage through damageUnit, so Shields,
     * Protect and Dodge all apply to them as they would to the first hit.
     */
    onHit(unit, target) {
      if (!target || target.uid == null || !unit._foes) return 0;
      let count = CHAIN_BASE;
      if (abilityIdx(unit, "basic") >= MAX_IDX) count += Math.floor((unit.charge || 0) / CHARGE_PER_STEP);
      const mult = basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
      const now = unit._now, fx = unit._fx, credit = unit._credit || (() => {});

      // Enemies beside the target, nearest to the target first.
      const beside = [];
      for (const e of unit._foes) {
        if (e === target || e.hp <= 0 || isIntangible(e)) continue;
        const d = aChebDist(target.row, target.col, e.row, e.col);
        if (d <= 1) beside.push({ e, d });
      }
      beside.sort((a, b) => a.d - b.d);

      let left = count;
      for (const { e } of beside) {
        if (left <= 0) break;
        const dmg = Math.max(1, Math.round(basicUnitDamage(unit, e) * mult));
        credit(damageUnit(e, dmg));
        if (fx) fx.push({ id: now + "szc" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isShock: true, fromRow: target.row, fromCol: target.col, isEnemy: unit._enemySide });
        left--;
      }
      // A boss standing against the target is a chain target too.
      const boss = unit._boss;
      if (left > 0 && boss && boss.hp > 0 && distToBoss(boss, target.row, target.col) <= 1) {
        const dmg = Math.max(1, Math.round(basicDamageToBoss(unit, boss, unit._allies || []) * mult));
        damageBoss(boss, dmg);
        credit(dmg);
        if (fx) fx.push({ id: now + "szcb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isShock: true, fromRow: target.row, fromCol: target.col, isEnemy: unit._enemySide });
      }
      return 0;
    },

    /**
     * Discharge: spend half the Charge, raise the aura. Uses the default
     * in-range special gate (Ranged), so it goes off once something is close
     * enough to be inside the field it is about to raise.
     */
    special(unit, ctx) {
      const idx = abilityIdx(unit, "special");
      const consumed = Math.floor((unit.charge || 0) * DISCHARGE_FRACTION);
      unit.charge = (unit.charge || 0) - consumed;
      const range = AURA_BASE_RANGE + (idx >= MAX_IDX ? Math.floor(consumed / CHARGE_PER_STEP) : 0);

      applyAura(unit, {
        range,
        ticks: ENDURING_TICKS,
        ally: { hastePct: allyHasteByLevel[idx], spdPct: AURA_SPEED_UP_PCT },
        enemy: { hastePct: enemyHasteByLevel[idx], spdPct: AURA_SPEED_DOWN_PCT },
      });
      ctx.newFx.push({ id: ctx.now + "dis" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isShock: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  chargeGainByLevel: CHARGE_GAIN_BY_LEVEL,
  statPerChargeByLevel: STAT_PER_CHARGE_BY_LEVEL,
  allyHasteByLevel: AURA_ALLY_HASTE_BY_LEVEL,
  enemyHasteByLevel: AURA_ENEMY_HASTE_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage. The ids
// are inherited from the retired Monovolt dragons; see the note in data/skins.js.
export const voltail = makeSparkshellModule(CFG);
export const stormclaw = makeSparkshellModule(CFG);
export const arcstorm = makeSparkshellModule(CFG);
export const ionarch = makeSparkshellModule(CFG);
