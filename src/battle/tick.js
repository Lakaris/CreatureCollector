// The shared battle tick, used by both Dungeon and Daily Boss fights.
//
// Phase order matters and is deliberate:
//   1. bump tick, snapshot who is alive, build the occupancy set
//   2. player units act    (attack the boss if in range, else minions, else close in)
//   3. enemy minions act
//   4. minion specials
//   5. status effects      (DoT damage + debuff countdowns)
//   6. boss acts           (special THEN basic -- earth/electric/light have
//                           cooldown interplay that assumes this ordering)
//
// Per-screen differences travel in `config`, not in branches here. The caller
// owns React state, timers, rewards, and win/lose handling; this function only
// advances the simulation and reports what happened.

import { CREATURE_MAP } from "../data/creatures.js";
import { BOSS_SIZE, STATUS_TICKS } from "./constants.js";
import { displaceUnit, awayFrom, setDisplaceGrid } from "./displace.js";
import {
  aChebDist, aCardinalDist, aBestStep,
  bossOccupies, distToBoss, nearestOpenBossAdj, nearestOpenCell,
  cellsOf, unitDist, unitCardinalDist, attackRangeOf,
} from "./geometry.js";
import { tickStatusEffects, isRooted, speedPenalty, tickTimedMods, isStunned, isIntangible, statModMultiplier, tickOverTime, consumeBlind, tickRestrained, applyStatMod, isFeared, refreshAuraFields, stealBuff, onUnitMoved, applyTimedDebuff, onUnitTeleported, applyTaunt, tickBurn, isEnemyOf, applyBurn, transferDebuffs, healReceivedMultiplier } from "./status.js";
import { damageUnit, onHitLanded, addStackingShield, applyProtect, applyShield, isBossUnit, healUnit, setHazardLookup, onUnitDefeated, onShieldBroken, retaliationMultiplier } from "./hp.js";
import { abilityHasTag } from "./abilityTags.js";
import { setApplier, withApplier, setActiveAbility, withActiveAbility, asEcho, asPassive, effectiveness, shieldAmount, setBasicAttackEndHandler, setBattleRoster, setBattleTick, triggersOn } from "./applier.js";
import { isSpecialSealed, gainSpecialCharge, bankOverflowCharge } from "./charge.js";
import { tickMinionSpecials } from "./minions.js";
import { basicUnitDamage, basicDamageToBoss, damageBoss, attackCooldown, lowHpSpdHastePct, defenseOf } from "./damage.js";

/**
 * Cast a creature's Special. POLICY: the one place a Special fires, for both
 * sides, so Echo Conch's recast rides every Special in the game: when the
 * caster wears it, the Special runs a second time straight after, as an echo
 * (see asEcho in applier.js) -- same targeting, at the echo's effectiveness.
 */
function castSpecial(abilMod, u, ctx) {
  runCast(u, () => withActiveAbility(u, "special", () => abilMod.special(u, ctx)));
  // The echo is a use of the Special in its own right: the per-cast gear
  // below ("whenever this creature uses a Special ability") triggers again.
  if (u.gear?.echoSpecialPct && u.hp > 0) runCast(u, () => asEcho(u, () => abilMod.special(u, ctx)));
}

/** One cast of a Special, then its per-cast gear. Every enemy the cast
 * damages is collected (by the listener after afterSpecialCast) for it. */
function runCast(u, cast) {
  u._specialHits = new Set();
  try {
    cast();
  } finally {
    const hits = [...u._specialHits];
    u._specialHits = null;
    withApplier(u, () => withActiveAbility(u, "special", () => afterSpecialCast(u, hits)));
  }
}

/**
 * PER-CAST SPECIAL GEAR, after each cast of a Special -- an Echo Conch echo
 * is a second cast and triggers it all again. `hits` are the creatures and
 * bosses that cast damaged.
 *   - Jetstream Sigil / Galeforce Band: Attack / Speed for the rest of the
 *     battle, capped.
 *   - Seafoam Cloak: a stacking Shield, standard duration.
 *   - Petrified Core: the FIRST cast of the battle Stuns every non-boss it hit.
 *   - Voidheart: every non-boss it hit loses max Health for the battle, and
 *     the caster gains some (capped).
 *   - Tidal Grip: a damaging cast Pushes every creature it hit 1 tile straight
 *     away from the caster (Displace -- see displace.js; Impact is doubled
 *     and Stuns).
 *   - Tempest Blade: a cast tagged Pierce leaves a Wind Hazard under what it hit.
 *   - Shadow Shroud: a post-teleport strike spent by this cast is used up.
 */
function afterSpecialCast(u, hits) {
  const g = u.gear;
  if (!g || u.hp <= 0) return;
  if (g.specialAtkPct) u._specialAtkPct = Math.min(g.specialAtkMaxPct ?? Infinity, (u._specialAtkPct || 0) + g.specialAtkPct);
  if (g.specialSpdPct) u._specialSpdPct = Math.min(g.specialSpdMaxPct ?? Infinity, (u._specialSpdPct || 0) + g.specialSpdPct);
  if (g.specialStackShieldPct) asPassive(u, () => addStackingShield(u, shieldAmount((u.maxHp * g.specialStackShieldPct) / 100), STATUS_TICKS));
  // Overdrive Sigil: a share of the bar back (banked past the reset -- see
  // gainSpecialCharge).
  if (g.specialRefundPct && u.abilChargeMax) gainSpecialCharge(u, (u.abilChargeMax * g.specialRefundPct) / 100);
  // Sanctum Seal: the ally with the lowest current Health gets a Shield of a
  // share of this creature's max Health.
  if (g.specialShieldLowestAllyPct && tickCtx) {
    const side = tickCtx.state.playerUnits.includes(u) ? tickCtx.state.playerUnits : tickCtx.state.enemyUnits;
    let low = null;
    for (const a of side) if (a !== u && a.hp > 0 && (!low || a.hp < low.hp)) low = a;
    if (low) applyShield(low, (u.maxHp * g.specialShieldLowestAllyPct) / 100, STATUS_TICKS);
  }
  const creatures = hits.filter((t) => !isBossUnit(t));
  if (g.firstSpecialStunTicks && !u._firstSpecialDone) {
    u._firstSpecialDone = true;
    for (const t of creatures) if (t.hp > 0) applyTimedDebuff(t, "stunTicks", Math.max(t.stunTicks || 0, g.firstSpecialStunTicks));
  }
  if (g.specialMaxHpDrainPct) {
    for (const t of creatures) {
      if (t.hp <= 0) continue;
      t.maxHp = Math.max(1, Math.round(t.maxHp * (1 - g.specialMaxHpDrainPct / 100)));
      t.hp = Math.min(t.hp, t.maxHp);
      const base = u._baseMaxHp || (u._baseMaxHp = u.maxHp);
      const room = (base * (g.specialMaxHpGainMaxPct ?? Infinity)) / 100 - (u.maxHp - base);
      const gain = Math.min(Math.round((base * (g.specialMaxHpGainPct || 0)) / 100), Math.max(0, Math.floor(room)));
      if (gain > 0) { u.maxHp += gain; u.hp += gain; }
    }
  }
  if (g.specialPush) {
    for (const t of creatures) {
      if (t.hp <= 0) continue;
      const [dr, dc] = awayFrom(u.row, u.col, t.row, t.col);
      displaceUnit(t, dr, dc, { source: u });
    }
  }
  if (g.pierceWindHazard && abilityHasTag(u, "special", "pierce")) layWindHazard(u, hits);
  // Warlord's Insignia: every enemy Nearby (the 8 surrounding tiles; a boss
  // whose body touches them) is briefly Taunted onto this creature.
  if (g.specialTauntNearbyTicks && tickCtx) {
    const { state } = tickCtx;
    const playerSide = state.playerUnits.includes(u);
    for (const e of playerSide ? state.enemyUnits : state.playerUnits) {
      if (e.hp > 0 && aChebDist(e.row, e.col, u.row, u.col) <= 1) applyTaunt(e, u, g.specialTauntNearbyTicks);
    }
    const boss = playerSide && state.boss && state.boss.hp > 0 ? state.boss : null;
    if (boss && distToBoss(boss, u.row, u.col) <= 1) applyTaunt(boss, u, g.specialTauntNearbyTicks);
  }
  if (u._shadowStrikeUsed) u._shadowStrike = u._shadowStrikeUsed = false;
  // Ambush Fang: the first ability of the battle was this Special; spent.
  if (u._ambushUsed) u._ambushDone = true;
}

onHitLanded((attacker, target, info) => {
  if (info.ability === "special" && !info.effectDamage && attacker._specialHits) attacker._specialHits.add(target);
});

/**
 * DEFEAT GEAR that acts on the field (see onUnitDefeated in hp.js):
 *   - Inferno Heart: the fallen wearer blasts every enemy Nearby for a share
 *     of its Attack.
 *   - Wildfire Brand: a Burning enemy of the wearer falls, and every enemy
 *     Nearby it catches Burn from the wearer.
 *   - Reaper's Lantern: a fallen enemy's debuffs move to the enemy closest to
 *     it, their durations refreshed (transferDebuffs in status.js).
 *   - Warpath Greaves: the killing blow's excess damage carries on into a
 *     random Closest enemy of the killer, within its attack range.
 *   - Bloodrush Crown: the killer instantly uses its Basic ability on a random
 *     Closest enemy within its attack range.
 * Damage these deal is effect damage, dealt as their wearer -- the fallen one
 * included -- without switching the ability in use (which would end a Basic
 * attack still in progress).
 */
onUnitDefeated((target, killer, info) => {
  if (!tickCtx) return;
  const blast = target.uid != null ? target.gear?.deathBlastAtkPct || 0 : 0;
  if (blast) {
    const dmg = Math.max(1, Math.round(((target.atk || 0) * blast) / 100));
    withApplier(target, () => {
      for (const e of foesBeside(target, target, new Set([target]))) hitFoe(target, e, dmg);
    });
  }
  const burning = (target.burnTicks || 0) > 0;
  let transferred = false;
  for (const w of battleRosterOf(tickCtx.state)) {
    if (w.hp <= 0 || !isEnemyOf(w, target)) continue;
    if (burning && w.gear?.burnDeathSpread) {
      withApplier(w, () => {
        for (const e of foesBeside(w, target, new Set([target]))) applyBurn(e, w.atk);
      });
    }
    if (!transferred && w.gear?.defeatDebuffTransfer && target.uid != null) {
      const to = closestFoeOf(w, target);
      if (to) {
        transferred = true;
        withApplier(w, () => transferDebuffs(target, to));
      }
    }
  }
  if (!killer || killer.hp <= 0 || killer.uid == null || !isEnemyOf(killer, target)) return;
  const kg = killer.gear;
  if (kg?.overkillCarry && info.overkill > 0) {
    const e = randomClosestFoe(killer, attackRangeOf(killer), target);
    if (e) withApplier(killer, () => hitFoe(killer, e, info.overkill));
  }
  if (kg?.killBasicAgain) {
    const e = randomClosestFoe(killer, attackRangeOf(killer), target);
    if (e) bonusBasicHit(killer, e);
  }
});

/** Geode Heart: the wearer's own Shield breaks, and every enemy Nearby
 * takes damage from a share of its Defense. */
onShieldBroken((u) => {
  const pct = u.gear?.shieldBreakBlastDefPct || 0;
  if (!pct || !tickCtx || u.uid == null || u.hp <= 0) return;
  const dmg = Math.max(1, Math.round((defenseOf(u) * pct) / 100));
  withApplier(u, () => {
    for (const e of foesBeside(u, u, new Set([u]))) hitFoe(u, e, dmg);
  });
});

/** Every creature in the battle, both sides. */
function battleRosterOf(state) {
  return [...state.playerUnits, ...state.enemyUnits];
}

/** Effect damage from `u` to a foe (creature or boss), with its hit flash. */
function hitFoe(u, e, dmg) {
  const { state, newFx, now } = tickCtx;
  const dealt = e.uid == null ? damageBoss(e, dmg, { effectDamage: true }) : damageUnit(e, dmg, { effectDamage: true });
  if (state.playerUnits.includes(u)) creditDamage(state, u.creatureId, dealt, "passive");
  const size = e.size || (e.uid == null ? BOSS_SIZE : 1);
  newFx.push({ id: now + "gearhit" + u.uid + (e.uid || "boss") + Math.random(), row: e.row + (size - 1) / 2, col: e.col + (size - 1) / 2, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: !state.playerUnits.includes(u) });
}

/** Living, targetable foes of `u` (the boss included, on the player side),
 * each with its distance from (row, col) -- the boss by its body. */
function foesWithDist(u, row, col, exclude = null) {
  const { state } = tickCtx;
  const playerSide = state.playerUnits.includes(u);
  const out = [];
  for (const e of playerSide ? state.enemyUnits : state.playerUnits) {
    if (e.hp > 0 && e !== exclude && !isIntangible(e)) out.push({ e, d: aChebDist(row, col, e.row, e.col) });
  }
  const boss = playerSide && state.boss && state.boss.hp > 0 && state.boss !== exclude ? state.boss : null;
  if (boss) out.push({ e: boss, d: distToBoss(boss, row, col) });
  return out;
}

/** Reaper's Lantern: the foe of `u` standing closest to `center`. */
function closestFoeOf(u, center) {
  let best = null;
  for (const c of foesWithDist(u, center.row, center.col, center)) if (!best || c.d < best.d) best = c;
  return best ? best.e : null;
}

/** A random one of `u`'s Closest foes (the Closest tag: nearest to it), if
 * within `range`. */
function randomClosestFoe(u, range, exclude = null) {
  const near = foesWithDist(u, u.row, u.col, exclude).filter((c) => c.d <= range);
  if (!near.length) return null;
  const d = Math.min(...near.map((c) => c.d));
  const ties = near.filter((c) => c.d === d);
  return ties[Math.floor(Math.random() * ties.length)].e;
}

/**
 * Bloodrush Crown: one use of `u`'s Basic ability on `target`, outside its
 * normal attack -- a Basic hit with the Basic's on-hit effects, like the
 * per-attack riders (it does not count as another attack for every-Nth gear).
 */
function bonusBasicHit(u, target) {
  const { state } = tickCtx;
  const prev = u._attackRiders;
  u._attackRiders = true;
  try {
    withApplier(u, () => withActiveAbility(u, "basic", () => {
      const players = state.playerUnits.filter((p) => p.hp > 0);
      const dmg = target.uid == null ? basicDamageToBoss(u, target, players) : basicUnitDamage(u, target);
      riderHit(u, target, dmg, true);
    }));
  } finally {
    u._attackRiders = prev;
  }
}

/** Tempest Blade's Wind Hazard, laid under everything a Pierce ability hit.
 * Its damage is a share of the layer's Attack, like the other hazards. */
const WIND_HAZARD_TICKS = STATUS_TICKS;
const WIND_HAZARD_ATK_RATE = 0.04;
/** How often a Wind Hazard shoves whoever stands on it, in ticks. */
const WIND_PUSH_EVERY = 3;
function layWindHazard(u, targets) {
  const cells = [];
  for (const t of targets) for (const cell of cellsOf(t.uid == null ? { ...t, size: BOSS_SIZE } : t)) cells.push(cell);
  if (!cells.length || !tickCtx) return;
  const { state } = tickCtx;
  (state.hazards || (state.hazards = [])).push({
    cells: new Set(cells), ticksLeft: WIND_HAZARD_TICKS, dmg: Math.max(1, Math.round(u.atk * WIND_HAZARD_ATK_RATE)),
    kind: "wind", enemySide: !state.playerUnits.includes(u), age: 0,
  });
}

/** The running tick's state, for the per-attack pass below -- it runs from
 * applier.js's attack-end notification, outside runBattleTick's scope. */
let tickCtx = null;

/** Gear that fires once, the first time a creature acts in a battle:
 * Crest of Conquest's stacking Shield, which lasts until broken. */
function startOfBattleGear(u) {
  if (u._gearStarted) return;
  u._gearStarted = true;
  const pct = u.gear?.startStackShieldPct || 0;
  if (pct) asPassive(u, () => addStackingShield(u, shieldAmount((u.maxHp * pct) / 100), Infinity));
  // Bastion Plate: Protect stacks, with this creature as the guardian, on
  // every ally Adjacent to it (the 8 surrounding tiles) as the battle opens.
  const protect = u.gear?.startProtectAdjacent || 0;
  if (protect && tickCtx) {
    const side = tickCtx.state.playerUnits.includes(u) ? tickCtx.state.playerUnits : tickCtx.state.enemyUnits;
    for (const a of side) {
      if (a === u || a.hp <= 0 || aChebDist(a.row, a.col, u.row, u.col) > 1) continue;
      asPassive(u, () => applyProtect(a, u, protect));
    }
  }
  if (!tickCtx) return;
  const side = (tickCtx.state.playerUnits.includes(u) ? tickCtx.state.playerUnits : tickCtx.state.enemyUnits).filter((a) => a.hp > 0);
  // Blessing Mantle: every ally gains a share of this creature's max Health
  // (Attack and Defense are shared live -- sharedStat in damage.js); it is
  // taken back when this creature falls (onDefeated in hp.js).
  const share = u.gear?.shareStatsPct || 0;
  if (share) {
    const lent = Math.round((u.maxHp * share) / 100);
    for (const a of side) {
      if (a === u || lent <= 0) continue;
      (a._mantleHp || (a._mantleHp = {}))[u.uid] = lent;
      a.maxHp += lent;
      a.hp += lent;
    }
  }
  // Warcry Pendant: its whole side -- itself included -- gains a Haste Up and
  // a Speed Up for the standard duration.
  const cry = u.gear?.startTeamHasteSpdPct || 0;
  if (cry) {
    withApplier(u, () => {
      for (const a of side) {
        applyStatMod(a, { kind: "haste", pct: cry, src: u.uid + ":warcry", ticks: STATUS_TICKS });
        applyStatMod(a, { kind: "spd", pct: cry, src: u.uid + ":warcry", ticks: STATUS_TICKS });
      }
    });
  }
  // Dawn Chime: the same shape, with an Attack Up and a Defense Up.
  const chime = u.gear?.startTeamAtkDefPct || 0;
  if (chime) {
    withApplier(u, () => {
      for (const a of side) {
        applyStatMod(a, { kind: "atk", pct: chime, src: u.uid + ":chime", ticks: STATUS_TICKS });
        applyStatMod(a, { kind: "def", pct: chime, src: u.uid + ":chime", ticks: STATUS_TICKS });
      }
    });
  }
  // Dynamo Band: a head start on the Special.
  const charge = u.gear?.startChargePct || 0;
  if (charge && u.abilChargeMax) gainSpecialCharge(u, (u.abilChargeMax * charge) / 100);
}

/**
 * PER-ATTACK GEAR. A Basic ATTACK is one use of the Basic ability -- a whole
 * swing, however many hits it lands (Twin Barb's 4 are one attack). Its hits
 * are collected here as they land, from the default attack flow, a module's
 * own basicAttack hook, or an Assist alike; when the attack ends (applier.js
 * says so), settleBasicAttack counts it and runs the gear that acts per
 * attack. An attack that landed nothing (Blinded, dodged) doesn't count.
 */
onHitLanded((attacker, target, info) => {
  if (info.ability !== "basic" || info.effectDamage || attacker._attackRiders) return;
  (attacker._attackHits || (attacker._attackHits = [])).push({ target, baseDmg: info.baseDmg });
});
setBasicAttackEndHandler(settleBasicAttack);

/**
 * One finished Basic attack. Its first target is the attack's target:
 *   - Twin Fang: every Nth attack hits that target 1 more time (a repeat of
 *     the attack's last hit, with its on-hit effects).
 *   - Arrowsplit: every attack Chains to N enemies beside the target, with
 *     the same damage and on-hit effects (the Chain tag).
 *   - Shockwave Gauntlet: every Nth attack Splashes every enemy around the
 *     target for less damage (the Splash tag; damage only).
 *   - Magpie Brooch: every Nth attack steals a buff from the target.
 * Rider damage starts from the attack's damage BEFORE the attacker's damage
 * gear, which is then reapplied per new target (Snare reads its own target).
 * Riders are Basic hits themselves but never start or count another attack.
 */
function settleBasicAttack(u) {
  const hits = u._attackHits;
  u._attackHits = null;
  if (!hits || !hits.length || u._attackRiders) return;
  u._basicAttacks = (u._basicAttacks || 0) + 1;
  const gear = u.gear;
  if (!gear || u.hp <= 0 || !tickCtx) { u._movedSinceAttack = false; return; }
  const n = u._basicAttacks;
  const target = hits[0].target;
  const onTarget = hits.filter((h) => h.target === target);
  const attackDmg = onTarget.reduce((sum, h) => sum + h.baseDmg, 0);
  const lastHitDmg = onTarget[onTarget.length - 1].baseDmg;
  const struck = new Set(hits.map((h) => h.target));
  // COMBINING RIDERS. Several pieces of gear can ride one attack, so they
  // follow two rules:
  //   1. Every shape is traced from the attack's ORIGINAL target and the
  //      attacker's position -- never from a creature a rider hit. Chained or
  //      Line-hit enemies don't Pierce or Splash onward.
  //   2. Each enemy takes at most one rider hit per attack (`struck`), the
  //      full-damage shapes first: Chain, Quake, Line, Pierce, and only then
  //      Splash's reduced hit on whoever is left around the target. Twin Fang's
  //      extra hit is the one exception -- it is a repeat on the target itself.
  // Effects that change the target's state (a stolen buff, a Stun) come after
  // every hit, and Undertow's Pull comes last, so nothing is traced from a
  // tile the target was dragged to.
  u._attackRiders = true;
  try {
    withApplier(u, () => withActiveAbility(u, "basic", () => {
      // Every-Nth-attack items each fire on their own interval against this
      // attack's number: two "every 4th" items both fire on the 4th; an
      // every-3rd and an every-4th fire on the 3rd and 4th respectively.
      const due = (key) => triggersOn(u, key, n);
      const hitAll = (foes, dmg, withOnHit = true) => {
        for (const e of foes) {
          struck.add(e);
          riderHit(u, e, dmg, withOnHit);
        }
      };
      // Twin Fang: one extra hit per item due.
      for (const g of due("extraHitEvery")) if (target.hp > 0) riderHit(u, target, lastHitDmg, true);
      if (gear.chainTargets) hitAll(foesBeside(u, target, struck).slice(0, gear.chainTargets), attackDmg);
      // Quake Brand: every Nth attack also lands, with its effects, on every
      // enemy Beside the target.
      if (due("adjacentEvery").length) hitAll(foesBeside(u, target, struck), attackDmg);
      // The attack's direction: from the attacker toward its target.
      const [dr, dc] = [Math.sign(target.row - u.row), Math.sign(target.col - u.col)];
      // Tremor Edge: every Nth attack also hits in a Line -- every tile in the
      // attack's direction, to the arena's edge (the Line tag).
      if (due("lineEvery").length) hitAll(foesOnCells(u, walk(u.row, u.col, dr, dc, Infinity), struck), attackDmg);
      // Gust Anklets: the Basic Pierces -- it goes on through its target and
      // hits every enemy behind it, out to the attacker's range (Pierce).
      // Railgun Coil: every Nth attack does the same (its extra damage rides
      // the attack and these hits -- see attackerDamageMultiplier in hp.js).
      if (gear.basicPierce || due("pierceEvery").length) hitAll(foesOnCells(u, walk(target.row, target.col, dr, dc, attackRangeOf(u)), struck), attackDmg);
      // Shockwave Gauntlet: every Nth attack Splashes every enemy around the
      // target not already hit, for less damage (damage only).
      for (const g of due("splashEvery")) hitAll(foesBeside(u, target, struck), attackDmg * (1 - (g.splashLessPct || 0) / 100), false);
      // Magpie Brooch: one stolen buff per item due.
      for (const g of due("stealBuffEvery")) stealBuff(target, u);
      // Voltaic Fang: every Nth attack briefly Stuns its target (not a boss --
      // a boss obeys no control effect but Taunt). Items due together add
      // their Stun lengths into one Stun.
      const stun = due("stunEvery").reduce((t, g) => t + (g.stunEveryTicks || 2), 0);
      if (stun && target.uid != null && target.hp > 0) applyTimedDebuff(target, "stunTicks", Math.max(target.stunTicks || 0, stun));
      // Tempest Blade: a Basic tagged Pierce leaves a Wind Hazard under
      // everything it hit.
      if (gear.pierceWindHazard && abilityHasTag(u, "basic", "pierce")) layWindHazard(u, [...struck]);
      // Undertow Anchor: every Nth attack Pulls its target 1 tile toward the
      // attacker (a Displace -- see displace.js) per item due, stopping once
      // it is beside.
      for (const g of due("pullEvery")) {
        if (target.uid == null || target.hp <= 0 || aChebDist(u.row, u.col, target.row, target.col) <= 1) break;
        const [pr, pc] = awayFrom(target.row, target.col, u.row, u.col);
        displaceUnit(target, pr, pc, { source: u });
      }
    }));
  } finally {
    u._attackRiders = false;
    // Charger's Greaves' bonus rode this whole attack, riders included; spent.
    u._movedSinceAttack = false;
    // Shadow Shroud's post-teleport strike, likewise.
    if (u._shadowStrikeUsed) u._shadowStrike = u._shadowStrikeUsed = false;
    // Ambush Fang: the first ability of the battle was this attack; spent.
    if (u._ambushUsed) u._ambushDone = true;
  }
}

/** The cells stepped through from (row, col) along (dr, dc) -- not the start
 * -- for up to `max` steps, stopping at the arena's edge. */
function walk(row, col, dr, dc, max) {
  const out = [];
  if (!dr && !dc) return out;
  const { gridRows, gridCols } = tickCtx;
  for (let i = 1, r = row + dr, c = col + dc; i <= max && r >= 0 && r < gridRows && c >= 0 && c < gridCols; i++, r += dr, c += dc) {
    out.push(r + "," + c);
  }
  return out;
}

/** Living, targetable foes of `u` standing on any of `cells` (the boss
 * counts if its body covers one), in the order the cells were given. */
function foesOnCells(u, cells, exclude) {
  const { state } = tickCtx;
  const playerSide = state.playerUnits.includes(u);
  const foes = (playerSide ? state.enemyUnits : state.playerUnits).filter((e) => e.hp > 0 && !isIntangible(e) && !exclude.has(e));
  const boss = playerSide && state.boss && state.boss.hp > 0 && !exclude.has(state.boss) ? state.boss : null;
  const out = [];
  for (const cell of cells) {
    for (const e of foes) if (!out.includes(e) && cellsOf(e).includes(cell)) out.push(e);
    if (boss && !out.includes(boss)) {
      const [r, c] = cell.split(",").map(Number);
      if (bossOccupies(boss, r, c)) out.push(boss);
    }
  }
  return out;
}

/** Living, targetable foes of `u` beside `center` (Chebyshev 1; a boss's
 * whole 2x2 body counts), nearest first. `exclude` are skipped. */
function foesBeside(u, center, exclude) {
  const { state } = tickCtx;
  const playerSide = state.playerUnits.includes(u);
  const foes = (playerSide ? state.enemyUnits : state.playerUnits).filter((e) => e.hp > 0 && !isIntangible(e) && !exclude.has(e));
  const centerIsBoss = center.uid == null;
  const dist = (e) => (centerIsBoss ? distToBoss(center, e.row, e.col) : aChebDist(center.row, center.col, e.row, e.col));
  const out = foes.filter((e) => dist(e) <= 1).sort((a, b) => dist(a) - dist(b));
  const boss = playerSide && state.boss && state.boss.hp > 0 ? state.boss : null;
  if (boss && !centerIsBoss && !exclude.has(boss) && distToBoss(boss, center.row, center.col) <= 1) out.push(boss);
  return out;
}

/** One rider hit of a Basic attack (see settleBasicAttack). */
function riderHit(u, target, dmg, withOnHit) {
  const { state, newFx, now } = tickCtx;
  const isBoss = target.uid == null;
  dmg = Math.max(1, Math.round(dmg));
  const dealt = isBoss ? damageBoss(target, dmg) : damageUnit(target, dmg);
  const hit = isBoss ? target : target._redirectedTo || target;
  if (!isBoss && hit._dodgedHit) return;
  let bonus = 0;
  const mod = withOnHit ? getPlayerAbilityModule(u.creatureId) : null;
  if (mod?.onHit) {
    bonus = mod.onHit(u, hit, dealt) || 0;
    if (bonus) withActiveAbility(u, "unique", () => (isBoss ? damageBoss(hit, bonus) : damageUnit(hit, bonus)));
  }
  const playerSide = state.playerUnits.includes(u);
  if (playerSide) {
    creditDamage(state, u.creatureId, dealt, "basic");
    creditDamage(state, u.creatureId, bonus, "passive");
  }
  const size = hit.size || (isBoss ? 2 : 1);
  newFx.push({ id: now + "rider" + u.uid + (hit.uid || "boss") + Math.random(), row: hit.row + (size - 1) / 2, col: hit.col + (size - 1) / 2, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: !playerSide });
}
import { getBossModule } from "./bosses/registry.js";
import { makeBossContext } from "./bosses/context.js";
import { getPlayerAbilityModule } from "./playerAbilities/registry.js";

/** A minion's or boss's Burn with no stored source ATK: the old 10-ATK floor
 * at the Burn rate (see tickBurn in status.js). */
const UNSOURCED_BURN_DMG = Math.max(1, Math.round(10 * 0.035));
/** Rate applied to a fire trail's stored source ATK, per tick (e.g. Emberstar's Charging Pierce lvl 5). */
/** Water Hazard: Haste lost while standing in it, and how long that lasts
 * once you step off. Short, so it lapses a tick after leaving the tile. */
const HAZARD_HASTE_DOWN_PCT = 10;
const HAZARD_HASTE_TICKS = 2;

/**
 * Damage-chart buckets. Every point of player damage is credited to exactly one
 * of a creature's three abilities, so the chart can show where its output
 * actually came from:
 *
 *   basic    the ordinary attack swing, including a custom basicAttack hook
 *   special  the charged special
 *   passive  the unique/passive -- on-hit bonuses, per-tick effects, reflects
 *
 * Ability modules don't name their own source: the source is decided by which
 * hook tick.js is currently running (see makePlayerAbilityContext's
 * `damageSource`), so a module needs no changes to be charted correctly.
 */
function creditDamage(state, creatureId, amount, source) {
  if (!(amount > 0)) return;
  const dd = state.damageDealt || (state.damageDealt = {});
  const row = dd[creatureId] || (dd[creatureId] = { basic: 0, special: 0, passive: 0 });
  row[source] += amount;
}

/**
 * Context passed to a creature's `special(unit, ctx)` / `basicAttack(unit, ctx)`
 * / `onTick(unit, ctx)` ability hooks. Modules are side-agnostic: `aliveP` is
 * always the acting unit's OWN side and `aliveE` its foes, so the same module
 * drives player and enemy creatures alike -- callers pass the lists swapped
 * (with `isEnemySide: true`) for enemy units. Enemy-side hooks never see a
 * boss (it's their ally) and never write to the player damage chart.
 */
function makePlayerAbilityContext({ unit, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, doStep, isEnemySide = false, damageSource = "special" }) {
  return {
    aliveE, aliveP, boss, gridRows, gridCols, newFx, now, canMove,
    blocked,
    isEnemySide,
    addDamageDealt(amount) {
      if (isEnemySide) return;
      creditDamage(state, unit.creatureId, amount, damageSource);
    },
    nearestOpenCell(r, c) {
      return nearestOpenCell(r, c, blocked, gridRows, gridCols);
    },
    /** Teleport the unit outright (Zephyr Step, Scapegoat, Ghostly Step).
     * Refuses while Rooted -- Root stops movement by ANY means, not just
     * walking -- and returns whether the unit actually moved, so a special
     * that has to close the distance can bail instead of striking from afar. */
    relocate(nr, nc) {
      if (!canMove) return false;
      allOcc.delete(unit.row + "," + unit.col);
      unit.prevRow = unit.row;
      unit.prevCol = unit.col;
      unit.lastMoveTime = now;
      unit.row = nr;
      unit.col = nc;
      allOcc.add(nr + "," + nc);
      onUnitMoved(unit);
      onUnitTeleported(unit);
      return true;
    },
    /** Add a freshly-summoned unit (e.g. Doomshade's Wisp) to the acting
     * unit's own side. It joins the battle on the NEXT tick -- it is not in
     * this tick's alive lists -- but occupies its tile immediately so nothing
     * paths onto it. Summons carry `_summonOf` (the summoner's uid); the
     * end-of-tick pruning pass removes them once defeated or orphaned. */
    addSummon(su) {
      // Puppeteer's Strings: the summoner's summons arrive stronger.
      const boost = unit.gear?.summonStatPct || 0;
      if (boost) {
        for (const stat of ["maxHp", "hp", "atk", "def"]) {
          if (su[stat] > 0) su[stat] = Math.round(su[stat] * (1 + boost / 100));
        }
      }
      (isEnemySide ? state.enemyUnits : state.playerUnits).push(su);
      for (const cell of cellsOf(su)) allOcc.add(cell);
    },
    /** Ground Hazard. `kind` is "water" or "fire" -- see the Hazards pass in
     * runBattleTick for what each one does. `dmg` is per trigger. */
    addHazard(cells, ticks, dmg, kind) {
      // A hazard laid by an echoed Special hurts at the echo's effectiveness
      // (its later ticks run with no applier, so it is baked in here).
      // Flarebrand Ring / Springwell Ring: the layer's hazards of that kind are
      // more potent -- more damage, and (water) a deeper Haste Down.
      const potency = 1 + ((kind === "fire" ? unit.gear?.fireHazardPct : kind === "water" ? unit.gear?.waterHazardPct : 0) || 0) / 100;
      dmg = Math.max(1, Math.round(dmg * effectiveness() * potency));
      (state.hazards || (state.hazards = [])).push({ cells: new Set(cells), ticksLeft: ticks, dmg, kind, enemySide: isEnemySide, hasteDownPct: HAZARD_HASTE_DOWN_PCT * potency });
    },
    /** Is a Hazard of this kind covering (row,col)? For passives that read the
     * ground -- Cinder Scent hunts whatever is standing in fire. */
    hazardsOn(row, col, kind) {
      return (state.hazards || []).some((h) => h.kind === kind && h.cells.has(row + "," + col));
    },
    /** Take one BFS step toward (tr,tc); no-ops when rooted. */
    stepToward(tr, tc) {
      return canMove ? doStep(tr, tc) : false;
    },
  };
}

/**
 * Blind (Pollen Veil): a blinded creature still takes its swing and still
 * pays the cooldown -- it just misses, landing no damage and none of the
 * on-hit effects. Returns true when the caller should end this unit's turn.
 *
 * Called at each basic-attack site rather than inside damageUnit, because
 * only the attack sites know who is swinging. Specials are unaffected by
 * design: Blind stops attacks, not abilities.
 */
function missBlindedSwing(u, row, col, penalty, newFx, now, isEnemySide) {
  if (!consumeBlind(u)) return false;
  u.atkCd = attackCooldown(u, penalty);
  u.lastAttackTime = now;
  newFx.push({ id: now + "miss" + u.uid, row, col, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: isEnemySide, isMiss: true });
  return true;
}

/**
 * The damage a defender's onDamaged hook returns to its attacker, scaled by
 * the defender's gear for what that hook is: a Counter (Bramble Cuff) when
 * its Unique is tagged Counter, a Reflect (Quartz Chip) when tagged Reflect.
 * The tag is the classification, so any such kit is covered.
 */
function scaleRetaliation(defender, amount) {
  if (!(amount > 0)) return amount;
  const kind = abilityHasTag(defender, "unique", "counter") ? "counter" : abilityHasTag(defender, "unique", "reflect") ? "reflect" : null;
  return kind ? Math.max(1, Math.round(amount * retaliationMultiplier(defender, kind))) : amount;
}

/** How far past itself a fleeing creature aims -- far enough that the normal
 * pathfinder just walks it away, without needing its own flee-planner. */
const FLEE_REACH = 4;

/**
 * Fear's movement: step AWAY from `src`. Aims at a point on the far side of
 * the fleeing unit and lets stepUnit path there, so it inherits the ordinary
 * movement rules (occupancy, the no-backtrack guard, the boss's body). A
 * Rooted or source-less creature simply holds still.
 */
function fleeFrom(u, src, canMove, blocked, allOcc, now, tick, gridRows, gridCols) {
  if (!canMove || !src) return;
  const fr = Math.max(0, Math.min(gridRows - 1, u.row + (u.row - src.row) * FLEE_REACH));
  const fc = Math.max(0, Math.min(gridCols - 1, u.col + (u.col - src.col) * FLEE_REACH));
  if (fr === u.row && fc === u.col) return;
  stepUnit(u, fr, fc, blocked, allOcc, now, tick);
}

/** How long the "!" ability-ready marker stays visible, in ticks. */
const ABILITY_FLASH_TICKS = 3;

/**
 * Advance a unit's special-ability charge by its Haste (abilitySpeed, base 1)
 * per tick, holding at full until the special actually fires. Units without a
 * chargeable special (abilChargeMax unset, e.g. vine minions) are skipped.
 * Also counts down the "!" ready-flash marker set by consumeSpecialCharge.
 *
 * Exported (with specialChargeReady/consumeSpecialCharge) for Arena and
 * Labyrinth, whose lighter minion-only tick loops live in their screens.
 */
export function tickSpecialCharge(u) {
  if (u.abilFlashTicks) u.abilFlashTicks--;
  if (!u.abilChargeMax) return;
  // The tick after the special fired: the bar got its one full-width frame
  // (see consumeSpecialCharge), now the recharge actually starts over.
  if (u.abilJustFired) {
    u.abilJustFired = false;
    // Bonus charge earned on the tick the special fired (see
    // gainSpecialCharge in charge.js) survives the reset instead of being
    // wiped by it.
    // Overcharge Cell: charge banked past the last full bar pays in too.
    u.abilCharge = Math.min(u.abilChargeMax, (u._pendingCharge || 0) + (u._overflowCharge || 0));
    u._pendingCharge = 0;
    u._overflowCharge = 0;
    return;
  }
  // Stunned units don't work towards their special (see Overload Sting).
  if (isStunned(u)) return;
  // A sealed Special (Berserk Core) never charges: the bar stays empty.
  if (isSpecialSealed(u)) { u.abilCharge = 0; return; }
  // Haste Down/Up stacks scale the charge rate (statModMultiplier "haste"),
  // and so does any aura the unit is standing in (a flat percentage, summed
  // across auras -- see refreshAuraFields). Floored so a stacked drain can
  // slow a charge to a crawl but never run it backwards.
  const auraHaste = Math.max(0, 1 + (u._auraHastePct || 0) / 100);
  // Brineplate: a Special tagged Displace has a shorter cooldown -- the bar
  // fills that much faster (20% less time = 1 / 0.8 the rate).
  const displace = u.gear?.displaceCooldownPct && abilityHasTag(u, "special", "displace") ? 1 / (1 - u.gear.displaceCooldownPct / 100) : 1;
  // Amplifier Prism: a healing Special gains Haste.
  const healing = u.gear?.healingHastePct && abilityHasTag(u, "special", "heal") ? 1 + u.gear.healingHastePct / 100 : 1;
  // Adrenal Gland: Haste while below its Health threshold.
  const adrenal = 1 + lowHpSpdHastePct(u) / 100;
  const add = (u.abilitySpeed || 1) * statModMultiplier(u, "haste") * auraHaste * displace * healing * adrenal;
  const room = u.abilChargeMax - (u.abilCharge || 0);
  u.abilCharge = Math.min(u.abilChargeMax, (u.abilCharge || 0) + add);
  // Overcharge Cell: filling past a full bar (while the Special holds for a
  // target) banks the excess for the next one -- see bankOverflowCharge.
  if (add > room) bankOverflowCharge(u, add - Math.max(0, room));
}

export function specialChargeReady(u) {
  return !!u.abilChargeMax && u.abilCharge >= u.abilChargeMax && !isSpecialSealed(u);
}

/**
 * Generic "is there something to use the special on" gate: a full charge bar
 * HOLDS (stays at 100%, no fire) until this passes, then fires immediately.
 * "In range" means an enemy within the unit's own attack range (Chebyshev;
 * the boss counts via its 2x2 body), or -- for Support creatures, whose
 * specials usually target allies -- another ally within that same range.
 *
 * This is the default for creatures whose special isn't implemented yet;
 * implemented abilities can override it per-module via `specialInRange(u,
 * {aliveE, aliveP, boss})` (e.g. Emberstar's dash is an engage tool that
 * deliberately fires from anywhere).
 */
export function specialTargetInRange(u, allies, enemies, boss) {
  const range = attackRangeOf(u);
  for (const e of enemies) {
    if (unitDist(u, e) <= range) return true;
  }
  if (boss && boss.hp > 0 && distToBoss(boss, u.row, u.col) <= range) return true;
  if (CREATURE_MAP[u.creatureId]?.role === "Support") {
    for (const a of allies) {
      if (a !== u && a.hp > 0 && unitDist(u, a) <= range) return true;
    }
  }
  return false;
}

/**
 * The special fired (or placeholder-triggered): flash the "!" marker and mark
 * the charge as spent. The charge value itself deliberately stays at max for
 * the rest of this tick -- snapshots are taken after the tick runs, so
 * zeroing here would mean the bar never renders full: it would visually
 * reset from the previous tick's ~90% (worse at 2x/4x, where the bar's CSS
 * transition also lags behind). tickSpecialCharge does the real reset at the
 * start of the next tick, giving the UI exactly one full-width frame.
 */
export function consumeSpecialCharge(u) {
  u.abilJustFired = true;
  u.abilFlashTicks = ABILITY_FLASH_TICKS;
}

/** Move a unit one BFS step toward (tr,tc), keeping the occupancy set in sync.
 * Multi-cell units (Labyrinth Boss creatures, size 2) path with their whole
 * body: a step is legal only when every body cell at the new anchor is free
 * (their own current cells excepted). */
function stepUnit(u, tr, tc, blocked, allOcc, now, tick) {
  // If the unit moved on the immediately-previous tick, forbid stepping
  // straight back onto the cell it came from -- stateless BFS re-planning
  // each tick flip-flops between equal-cost routes otherwise (units visibly
  // pacing left-right against a full front line). After one stationary tick
  // the restriction lifts, so backing out of a genuine dead end still works.
  const avoid = tick != null && u._lastStepTick === tick - 1;
  const size = u.size || 1;
  let bodyBlocked = blocked;
  if (size > 1) {
    const own = new Set(cellsOf(u));
    bodyBlocked = (r, c) => {
      for (let dr = 0; dr < size; dr++) {
        for (let dc = 0; dc < size; dc++) {
          const key = r + dr + "," + (c + dc);
          if (own.has(key)) continue;
          if (blocked(r + dr, c + dc)) return true;
        }
      }
      return false;
    };
  }
  const [nr, nc] = aBestStep(u.row, u.col, tr, tc, bodyBlocked, avoid ? u.prevRow : undefined, avoid ? u.prevCol : undefined);
  if (nr === u.row && nc === u.col) return false;
  for (const cell of cellsOf(u)) allOcc.delete(cell);
  u.prevRow = u.row;
  u.prevCol = u.col;
  u.lastMoveTime = now;
  u.row = nr;
  u.col = nc;
  for (const cell of cellsOf(u)) allOcc.add(cell);
  u._lastStepTick = tick;
  onUnitMoved(u);
  return true;
}

/** The foe this unit is Taunt-forced onto (e.g. by Taunting Snap), or null. */
function tauntedFoe(u, foes) {
  // Bypass Taunt (Unfettered): the Taunt still lands and still ticks -- the
  // creature simply refuses to let it pick its target. Flag is set by the
  // creature's own module each tick.
  if (u._ignoreTaunt) return null;
  if ((u.tauntTicks || 0) <= 0 || !u.tauntSourceUid) return null;
  return foes.find((f) => f.uid === u.tauntSourceUid && f.hp > 0 && !isIntangible(f)) || null;
}

/**
 * Marked (Loptrix's Scapegoat): the nearest marked foe ALREADY within this
 * unit's attack range, or null. Marked redirects targeting only -- it never
 * pulls anyone: units out of range keep doing whatever they were doing.
 */
function markedFoeInRange(u, foes) {
  const range = attackRangeOf(u);
  let best = null, bestD = Infinity;
  for (const f of foes) {
    if ((f.markedTicks || 0) <= 0 || f.hp <= 0 || isIntangible(f)) continue;
    const d = unitDist(u, f);
    if (d <= range && d < bestD) { bestD = d; best = f; }
  }
  return best;
}

/**
 * Death Feast (Bonebeak line): the nearest foe ALREADY within this unit's
 * attack range that is carrying a Damage Over Time, or null. Like Marked,
 * this redirects the attack only -- it never pulls the vulture toward a
 * rotting target it cannot already reach.
 */
function dotFoeInRange(u, foes) {
  const range = attackRangeOf(u);
  let best = null, bestD = Infinity;
  for (const f of foes) {
    if ((f.dotTicks || 0) <= 0 || f.hp <= 0 || isIntangible(f)) continue;
    const d = unitDist(u, f);
    if (d <= range && d < bestD) { bestD = d; best = f; }
  }
  return best;
}

/**
 * Retaliation: a RANGED creature that takes an attack hit from a MELEE enemy
 * switches targets onto that attacker (set in the attack loops via
 * `_retaliateUid`) until the attacker dies or becomes untargetable. Softer
 * than Taunt -- Taunt still wins when both apply -- and refreshed by every
 * new melee hit, so the most recent attacker holds the focus.
 */
function retaliationFoe(u, foes) {
  if (!u.isRanged || u._retaliateUid == null) return null;
  const f = foes.find((f) => f.uid === u._retaliateUid && f.hp > 0 && !isIntangible(f));
  if (!f) { u._retaliateUid = null; return null; }
  return f;
}

/**
 * Pick what a unit should shoot at and what it should walk toward.
 * Ranged units need a clear cardinal line to fire; everyone falls back to
 * walking at the nearest foe by Chebyshev distance.
 *
 * A Taunted unit is forced onto its taunter: the candidate list collapses to
 * that single foe while the debuff lasts (falling back to normal targeting
 * if the taunter dies).
 *
 * Chase targeting has hysteresis: the unit keeps walking at its current
 * chase target unless some other foe is STRICTLY closer. Retargeting to
 * whichever foe is momentarily nearest made units caught behind a full
 * front line flip between two equidistant foes and pace endlessly between
 * the two approach routes.
 */
function selectTarget(u, foes) {
  // Intangible foes (Deep Submerge) can not be targeted: anyone aiming at
  // one re-picks from the rest, chase hysteresis included.
  foes = foes.filter((f) => !isIntangible(f));
  const forced = tauntedFoe(u, foes) || retaliationFoe(u, foes);
  if (forced) foes = [forced];
  let nearest = null, nearestD = Infinity;
  for (const f of foes) {
    const d = unitDist(u, f);
    if (d < nearestD) { nearestD = d; nearest = f; }
  }
  if (u._chaseUid != null) {
    const cur = foes.find((f) => f.uid === u._chaseUid);
    if (cur && unitDist(u, cur) <= nearestD) nearest = cur;
  }
  u._chaseUid = nearest ? nearest.uid : null;
  // Marked preference: switch the ATTACK onto a marked foe already in range
  // (Taunt/retaliation collapsed the list above and still win). Movement is
  // deliberately left pointing at the normal chase target -- since the
  // marked foe is in range no step happens now, and when the mark ends the
  // unit resumes its old plan.
  if (!forced) {
    const mk = markedFoeInRange(u, foes);
    if (mk) {
      return {
        atkTgt: u.isRanged && unitCardinalDist(u, mk) <= attackRangeOf(u) ? mk : null,
        moveTgt: mk,
      };
    }
    // Death Feast's preference, same shape as Marked and ranked below it:
    // switch onto a rotting foe already in reach, without moving for it.
    if (u.prefersDotTargets) {
      const rotting = dotFoeInRange(u, foes);
      if (rotting) {
        return {
          atkTgt: u.isRanged && unitCardinalDist(u, rotting) <= attackRangeOf(u) ? rotting : null,
          moveTgt: rotting,
        };
      }
    }
  }
  let atkTgt = null;
  if (u.isRanged) {
    const inLine = foes.filter(
      (f) => unitCardinalDist(u, f) <= attackRangeOf(u)
    );
    if (inLine.length) {
      atkTgt = inLine.sort(
        (a, z) => unitCardinalDist(u, a) - unitCardinalDist(u, z)
      )[0];
    }
  }
  return { atkTgt, moveTgt: nearest };
}

/**
 * Advance one tick.
 *
 * @param {object} state {tick, playerUnits, enemyUnits, boss}
 * @param {object} config {gridRows, gridCols}
 * @returns {{newFx: Array, now: number, acted: boolean}}
 */
export function runBattleTick(state, config) {
  const { gridRows, gridCols } = config;
  const now = Date.now();
  state.tick++;

  const aliveP = state.playerUnits.filter((u) => u.hp > 0);
  const aliveE = state.enemyUnits.filter((u) => u.hp > 0);
  /** Resolve a uid against BOTH sides -- effects that remember who inflicted
   * them (Fear, Restrained) always point at the opposite roster. */
  const unitByUid = (uid) =>
    state.playerUnits.find((u) => u.uid === uid) || state.enemyUnits.find((u) => u.uid === uid);
  const boss = state.boss;
  const newFx = [];
  if (!aliveP.length) return { newFx, now, acted: false };
  setBattleRoster([...state.playerUnits, ...state.enemyUnits]);

  const allOcc = new Set();
  for (const u of [...aliveP, ...aliveE]) for (const cell of cellsOf(u)) allOcc.add(cell);
  const bossAlive = !!(boss && boss.hp > 0);
  const bossOcc = (r, c) => !!(boss && boss.hp > 0 && bossOccupies(boss, r, c));
  tickCtx = { state, newFx, now, allOcc, gridRows, gridCols, bossOcc };
  setDisplaceGrid({ allOcc, gridRows, gridCols, bossOcc, tick: state.tick, now });
  setBattleTick(state.tick);
  // Is a creature (or the boss, by its body) on a Hazard of this kind? For
  // gear that reads the ground (see setHazardLookup in hp.js).
  setHazardLookup((u, kind) => {
    const hz = state.hazards;
    if (!hz || !hz.length) return false;
    const cells = cellsOf(u.uid == null ? { ...u, size: BOSS_SIZE } : u);
    return hz.some((h) => h.kind === kind && cells.some((c) => h.cells.has(c)));
  });

  /** Cells a unit may not path through. */
  const blocked = (r, c) =>
    r < 0 || r >= gridRows || c < 0 || c >= gridCols ||
    (bossAlive && bossOccupies(boss, r, c)) ||
    allOcc.has(r + "," + c);

  // ── 1. Player units ──────────────────────────────────────────────────────
  for (const u of aliveP) {
    // The previous creature's turn is over (this also closes its Basic
    // attack -- see settleBasicAttack). Nobody is acting while this one's
    // timers tick, so a Heal Over Time tick is nobody's heal.
    setActiveAbility(null);
    setApplier(null);
    u.atkCd = Math.max(0, u.atkCd - 1);
    tickSpecialCharge(u);
    tickTimedMods(u);
    // Everything this creature applies from here to the end of its turn is
    // its own, for duration gear (see battle/applier.js). Set AFTER its own
    // timers tick so that expiry is never mistaken for an application.
    setApplier(u);
    // Which ability is in use, section by section (see setActiveAbility in
    // applier.js): the always-on passive first; the Special and the Basic
    // re-mark it below.
    setActiveAbility(u, "unique");
    startOfBattleGear(u);
    // Stunned units can't attack: hold the cooldown above zero so every
    // attack branch below (including custom basicAttack hooks, which check
    // atkCd themselves) stays closed. Movement and passives still run.
    if (isStunned(u)) u.atkCd = Math.max(u.atkCd, 1);

    const canMove = !isRooted(u);
    const penalty = speedPenalty(u);
    const range = attackRangeOf(u);
    const distB = bossAlive ? distToBoss(boss, u.row, u.col) : Infinity;

    const abilMod = getPlayerAbilityModule(u.creatureId);
    // Multi-hit basics (e.g. Twin Barb) SPLIT one swing's damage across their
    // hits -- each hit still triggers onHit (so Burn stacks per hit), but a
    // swing's total stays ~1x unitDamage like every other creature's basic.
    const hits = abilMod?.hitsForAttack ? abilMod.hitsForAttack(u) : 1;
    // Recomputed per hit with the target in hand -- some passives scale off
    // the target's state (e.g. Ignissaur's Stoked Flames reads Burn stacks).
    const dmgMultVs = (target) => (abilMod?.dmgMultForAttack ? abilMod.dmgMultForAttack(u, target) : 1);

    // Always-on passives (e.g. Bloomibis's Guardian Grove aura) run every tick,
    // before the special/basic flow, independent of cooldowns and movement.
    if (abilMod?.onTick) {
      const tickCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, damageSource: "passive", doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
      abilMod.onTick(u, tickCtx);
    }

    // Fear: spend the turn fleeing whoever inflicted it. Neither attacks nor
    // specials happen while it lasts; the always-on passive above still runs.
    // Rooted-and-feared just cowers. See applyFear in status.js.
    if (isFeared(u)) {
      fleeFrom(u, unitByUid(u.fearSourceUid), canMove, blocked, allOcc, now, state.tick, gridRows, gridCols);
      continue;
    }

    // Special abilities run off the charge bar (see tickSpecialCharge),
    // independent of the basic-attack loop below. Implemented specials (e.g.
    // Emberstar's Charging Pierce) can move the unit, so they run first and
    // everything after sees the new position. Creatures whose special isn't
    // implemented yet just flash the ready marker and start recharging.
    // Either way, a full bar HOLDS until there's actually something in range
    // to use it on (specialTargetInRange, or the module's own specialInRange),
    // then fires the moment a target closes in.
    // Chargeless specials (no `charge` in data, e.g. Overload Sting) skip the
    // bar entirely: they fire whenever their module's own gate passes.
    const chargelessReady = !u.abilChargeMax && !!(abilMod?.special && abilMod.specialInRange) && !isSpecialSealed(u);
    if (specialChargeReady(u) || chargelessReady) {
      const rangeBoss = bossAlive ? boss : null;
      const inRange = abilMod?.specialInRange
        ? abilMod.specialInRange(u, { aliveE, aliveP, boss: rangeBoss, gridRows, gridCols })
        : specialTargetInRange(u, aliveP, aliveE, rangeBoss);
      if (abilMod?.special) {
        // Rooted units still cast: Root holds a creature in place, it does not
        // silence it (see isRooted in status.js). Repositioning specials are
        // held back inside the context instead -- ctx.relocate refuses while
        // Rooted -- so the creature acts without ever leaving its tile.
        if (inRange) {
          const specialCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, damageSource: "special", doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
          // Spent BEFORE the cast, so charge gained during or right after
          // it (a defeat it lands, Overdrive Sigil) is banked past the reset
          // rather than added to a full bar about to be wiped.
          consumeSpecialCharge(u);
          castSpecial(abilMod, u, specialCtx);
        }
      } else if (inRange) {
        consumeSpecialCharge(u);
      }
    }

    // Everything from here to the end of the turn is the Basic ability (the
    // hook or the default flow), for gear keyed on which ability hit.
    setActiveAbility(u, "basic");

    // A custom basicAttack hook (e.g. Starlit's piercing beam) fully replaces
    // the default "attack the nearest thing" flow below -- it owns targeting,
    // damage/healing, and chase-movement for this unit's turn.
    if (abilMod?.basicAttack) {
      const basicCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, damageSource: "basic", doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
      abilMod.basicAttack(u, basicCtx);
      continue;
    }

    // Boss takes priority when in range -- hold position even while on
    // cooldown. A Taunted unit ignores the boss (it is forced onto the
    // minion that taunted it); so does a ranged unit retaliating against a
    // melee attacker, or any unit with a Marked foe already in reach (the
    // minion-fight branch below).
    if (distB <= range && bossAlive && !tauntedFoe(u, aliveE) && !retaliationFoe(u, aliveE) && !markedFoeInRange(u, aliveE)) {
      if (u.atkCd <= 0 && missBlindedSwing(u, boss.row + 0.5, boss.col + 0.5, penalty, newFx, now, false)) continue;
      if (u.atkCd <= 0) {
        // The swing itself is basic damage; an onHit bonus rides along with it
        // but belongs to the passive that granted it.
        let basicDmg = 0, passiveDmg = 0;
        for (let i = 0; i < hits && boss.hp > 0; i++) {
          const dmgToBoss = Math.max(1, Math.round(basicDamageToBoss(u, boss, aliveP) * dmgMultVs(boss) / hits));
          damageBoss(boss, dmgToBoss);
          basicDmg += dmgToBoss;
          const bonus = abilMod?.onHit ? abilMod.onHit(u, boss, dmgToBoss) : 0;
          // An on-hit rider is the Unique's damage (charted "passive"), not
          // another Basic hit -- Basic- and tag-keyed gear leave it alone.
          if (bonus) { withActiveAbility(u, "unique", () => damageBoss(boss, bonus)); passiveDmg += bonus; }
        }
        creditDamage(state, u.creatureId, basicDmg, "basic");
        creditDamage(state, u.creatureId, passiveDmg, "passive");
        u.atkCd = attackCooldown(u, penalty);
        u.lastAttackTime = now;
        newFx.push({ id: now + u.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: false });
      }
      continue;
    }

    // Otherwise fight the minions.
    if (aliveE.length) {
      const { atkTgt, moveTgt } = selectTarget(u, aliveE);
      const tgt = atkTgt || moveTgt;
      if (tgt) {
        const dist = atkTgt ? unitCardinalDist(u, atkTgt) : unitDist(u, tgt);
        if (dist <= range && u.atkCd <= 0 && missBlindedSwing(u, tgt.row, tgt.col, penalty, newFx, now, false)) continue;
        if (dist <= range && u.atkCd <= 0) {
          let basicDmg = 0, passiveDmg = 0;
          for (let i = 0; i < hits && tgt.hp > 0; i++) {
            const dmg = Math.max(1, Math.round(basicUnitDamage(u, tgt) * dmgMultVs(tgt) / hits));
            // Bypass Shield (Unfettered): a creature whose module sets the flag
        // swings straight through to Health. Per the policy in hp.js, the
        // ability's card text says so.
        const dealt = damageUnit(tgt, dmg, { pierceShield: !!u._pierceShield });
            basicDmg += dealt;
            // Protect may have handed this hit to a guardian: the on-hit
            // effects, the dodge check, and the defender's reflect all belong
            // to whoever actually took it (see Protect in hp.js).
            const hit = tgt._redirectedTo || tgt;
            // A dodged swing lands nothing: no damage, no on-hit effects, and
            // nothing for the defender to reflect (see Dodge in hp.js).
            if (hit._dodgedHit) continue;
            const hitMod = getPlayerAbilityModule(hit.creatureId);
            const bonus = abilMod?.onHit ? abilMod.onHit(u, hit, dealt) : 0;
            if (bonus) passiveDmg += withActiveAbility(u, "unique", () => damageUnit(hit, bonus));
            // Reflect passives (e.g. Crystalcrab's Prism Shell): the defender
            // returns a slice of the hit to the attacker. Reflected damage is
            // never itself reflected, and counts as effect damage.
            // The defender's hook: anything it applies is the defender's.
            const reflect = scaleRetaliation(hit, hitMod?.onDamaged ? withApplier(hit, () => hitMod.onDamaged(hit, u, dmg + bonus)) : 0);
            // The reflect is the DEFENDER's damage (a defeat credits it).
            if (reflect) withApplier(hit, () => damageUnit(u, reflect, { effectDamage: true }));
          }
          creditDamage(state, u.creatureId, basicDmg, "basic");
          creditDamage(state, u.creatureId, passiveDmg, "passive");
          // Who last swung at this creature, and when. Stamped for passives
          // that watch their ALLIES rather than themselves (Sworn Guard) --
          // onDamaged only ever tells a creature about its own wounds.
          tgt._lastHitByUid = u.uid;
          tgt._lastHitAt = now;
          // A ranged victim of a melee hit turns to face its attacker (see retaliationFoe).
          if (!u.isRanged && tgt.isRanged && tgt.hp > 0) tgt._retaliateUid = u.uid;
          u.atkCd = attackCooldown(u, penalty);
          u.lastAttackTime = now;
          // 2x2 targets (Labyrinth Boss creatures) get the hit flash at their body center.
          newFx.push({ id: now + u.uid, row: tgt.row + ((tgt.size || 1) - 1) / 2, col: tgt.col + ((tgt.size || 1) - 1) / 2, t: now, isRanged: u.isRanged, fromRow: u.row, fromCol: u.col, isEnemy: false });
        } else if (canMove && dist > range) {
          stepUnit(u, tgt.row, tgt.col, blocked, allOcc, now, state.tick);
        }
        continue;
      }
    }

    // No minions left: close on the boss, but only if not already in range.
    if (bossAlive && canMove && distB > range) {
      const dest = nearestOpenBossAdj(boss, u.row, u.col, allOcc, gridRows, gridCols);
      if (dest) stepUnit(u, dest[0], dest[1], blocked, allOcc, now, state.tick);
    }
  }

  // ── 2. Enemy minions ─────────────────────────────────────────────────────
  // Enemy creatures run the same ability modules as player ones (most
  // creatures have no module yet -- those keep the placeholder behavior of
  // flashing the ready marker and recharging). Their context is built with
  // the sides swapped: a module's `aliveP` is always the acting unit's own
  // side. Enemies never target their own boss, so hooks see `boss: null`.
  for (const u of aliveE) {
    setActiveAbility(null);
    setApplier(null);
    u.atkCd = Math.max(0, u.atkCd - 1);
    tickSpecialCharge(u);
    tickTimedMods(u);
    setApplier(u);
    setActiveAbility(u, "unique");
    startOfBattleGear(u);
    if (isStunned(u)) u.atkCd = Math.max(u.atkCd, 1);

    const canMove = !isRooted(u);
    const penalty = speedPenalty(u);
    const range = attackRangeOf(u);

    const abilMod = getPlayerAbilityModule(u.creatureId);
    const hits = abilMod?.hitsForAttack ? abilMod.hitsForAttack(u) : 1;
    const dmgMultVs = (target) => (abilMod?.dmgMultForAttack ? abilMod.dmgMultForAttack(u, target) : 1);
    const enemyCtx = () => makePlayerAbilityContext({ unit: u, aliveE: aliveP, aliveP: aliveE, boss: null, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, isEnemySide: true, doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });

    if (abilMod?.onTick) abilMod.onTick(u, enemyCtx());

    // Same Fear rule on this side (see the player loop above).
    if (isFeared(u)) {
      fleeFrom(u, unitByUid(u.fearSourceUid), canMove, blocked, allOcc, now, state.tick, gridRows, gridCols);
      continue;
    }

    const chargelessReady = !u.abilChargeMax && !!(abilMod?.special && abilMod.specialInRange) && !isSpecialSealed(u);
    if (specialChargeReady(u) || chargelessReady) {
      const inRange = abilMod?.specialInRange
        ? abilMod.specialInRange(u, { aliveE: aliveP, aliveP: aliveE, boss: null, gridRows, gridCols })
        : specialTargetInRange(u, aliveE, aliveP, null);
      if (abilMod?.special) {
        // Same as the player side: Rooted casts, it just can not relocate.
        if (inRange) {
          consumeSpecialCharge(u);
          castSpecial(abilMod, u, enemyCtx());
        }
      } else if (inRange) {
        consumeSpecialCharge(u);
      }
    }

    setActiveAbility(u, "basic");
    if (abilMod?.basicAttack) {
      abilMod.basicAttack(u, enemyCtx());
      continue;
    }

    const { atkTgt, moveTgt } = selectTarget(u, aliveP);
    const tgt = atkTgt || moveTgt;
    if (!tgt) continue;

    const dist = atkTgt ? unitCardinalDist(u, atkTgt) : unitDist(u, tgt);
    if (dist <= range && u.atkCd <= 0 && missBlindedSwing(u, tgt.row, tgt.col, penalty, newFx, now, true)) continue;
    if (dist <= range && u.atkCd <= 0) {
      for (let i = 0; i < hits && tgt.hp > 0; i++) {
        const dmg = Math.max(1, Math.round(basicUnitDamage(u, tgt) * dmgMultVs(tgt) / hits));
        // Bypass Shield (Unfettered): a creature whose module sets the flag
        // swings straight through to Health. Per the policy in hp.js, the
        // ability's card text says so.
        const dealt = damageUnit(tgt, dmg, { pierceShield: !!u._pierceShield });
        // Protect may have handed this hit to a guardian: the on-hit effects,
        // the dodge check, and the defender's reflect all belong to whoever
        // actually took it (see Protect in hp.js).
        const hit = tgt._redirectedTo || tgt;
        // A dodged swing lands nothing (see Dodge in hp.js).
        if (hit._dodgedHit) continue;
        const hitMod = getPlayerAbilityModule(hit.creatureId);
        const bonus = abilMod?.onHit ? abilMod.onHit(u, hit, dealt) : 0;
        if (bonus) withActiveAbility(u, "unique", () => damageUnit(hit, bonus));
        // Reflect passives: a player-side defender's reflect counts toward
        // its damage chart, and counts as effect damage.
        const reflect = scaleRetaliation(hit, hitMod?.onDamaged ? withApplier(hit, () => hitMod.onDamaged(hit, u, dmg + bonus)) : 0);
        if (reflect) {
          withApplier(hit, () => damageUnit(u, reflect, { effectDamage: true }));
          creditDamage(state, hit.creatureId, reflect, "passive");
        }
      }
      // Same stamp as the player loop above -- and this is the side that
      // matters for a player-side Sworn Guard, since this is where an ally
      // of its own actually gets hit.
      tgt._lastHitByUid = u.uid;
      tgt._lastHitAt = now;
      // A ranged victim of a melee hit turns to face its attacker (see retaliationFoe).
      if (!u.isRanged && tgt.isRanged && tgt.hp > 0) tgt._retaliateUid = u.uid;
      u.atkCd = attackCooldown(u, penalty);
      u.lastAttackTime = now;
      newFx.push({ id: now + u.uid, row: tgt.row, col: tgt.col, t: now, isRanged: u.isRanged, fromRow: u.row + ((u.size || 1) - 1) / 2, fromCol: u.col + ((u.size || 1) - 1) / 2, isEnemy: true });
    } else if (canMove && dist > range) {
      stepUnit(u, tgt.row, tgt.col, blocked, allOcc, now, state.tick);
    }
  }

  // Nobody's turn from here on: minion specials, auras, hazards, and the boss
  // apply effects on no creature's behalf.
  setApplier(null);
  setActiveAbility(null);

  // ── 3. Minion specials ───────────────────────────────────────────────────
  tickMinionSpecials(aliveE, aliveP, newFx, now);

  // ── 4. Status effects ────────────────────────────────────────────────────
  // Auras are fields, not buffs written onto the units they help, so what each
  // creature is standing in is recomputed here rather than tracked as anyone
  // moves. Each side is lifted by its own emitters and hindered by the other
  // side's (see the two faces of an aura in status.js).
  refreshAuraFields(aliveP, aliveE);
  refreshAuraFields(aliveE, aliveP);
  // Sanctuary Lamp: every ally inside the wearer's active Aura (the wearer
  // included) recovers a share of its own max Health -- the wearer's heal.
  for (const [side, src] of [...aliveP.map((s) => [aliveP, s]), ...aliveE.map((s) => [aliveE, s])]) {
    const pct = src.gear?.auraAllyRegenPctPerTick || 0;
    if (!pct || src.hp <= 0 || !src.aura || !((src.aura.ticks || 0) > 0)) continue;
    for (const a of side) {
      if (a.hp <= 0 || a.hp >= a.maxHp || (a.healImmuneTicks || 0) > 0 || aChebDist(a.row, a.col, src.row, src.col) > src.aura.range) continue;
      const amt = Math.max(1, Math.round(((a.maxHp * pct) / 100) * healReceivedMultiplier(a)));
      asPassive(src, () => healUnit(a, amt));
    }
  }

  tickStatusEffects(aliveP, boss, newFx, now);

  // Player-inflicted Burn (e.g. Emberstar's Burning Bond) on minions/boss.
  // Separate from tickStatusEffects above, which only handles boss->player DoT.
  for (const u of aliveE) {
    // Expiry takes every stack with it (see tickBurn in status.js).
    if (tickBurn(u, (dmg) => damageUnit(u, dmg, { effectDamage: true }), UNSOURCED_BURN_DMG)) {
      newFx.push({ id: now + "pbrn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    // Player-inflicted Damage Over Time (Carrion Rip, Spectral Rake) and
    // Poison on minions -- scaled off the victim's own max Health, like every
    // over-time effect. Enemy-inflicted ones on players tick in
    // tickStatusEffects instead.
    const hurt = (dmg) => damageUnit(u, dmg, { effectDamage: true });
    tickOverTime(u, "dot", hurt, newFx, now, "p");
    tickOverTime(u, "poison", hurt, newFx, now, "p");
  }
  if (bossAlive && tickBurn(boss, (dmg) => damageBoss(boss, dmg), UNSOURCED_BURN_DMG)) {
    newFx.push({ id: now + "pbrn" + "boss", row: boss.row, col: boss.col, t: now, isBurn: true, fromRow: boss.row, fromCol: boss.col, isEnemy: true });
  }
  if (bossAlive) {
    // Boss damage skips damageUnit (it has its own shield pool), and it has
    // no uid of its own, so both are passed in explicitly.
    const hurtBoss = (dmg) => damageBoss(boss, dmg);
    tickOverTime(boss, "dot", hurtBoss, newFx, now, "p", "boss");
    tickOverTime(boss, "poison", hurtBoss, newFx, now, "p", "boss");
  }

  // ── Ground Hazards ───────────────────────────────────────────────────────
  // Both flavors punish MOVING across them: a foe that stepped this tick from
  // a hazard cell takes the damage -- the check reads the cell it stepped
  // FROM. Teleports never trigger a hazard (a blink is not a step). One
  // move-trigger per unit per tick even when hazards overlap.
  //
  // What each flavor adds while a creature simply STANDS on it:
  //   water (Cryo Bomb's ice) -- 10% less Haste, on EVERY creature on the
  //     tile, friend or foe: slick ground does not take sides. Refreshed each
  //     tick under one shared source, so overlapping fields never stack past
  //     10% and it lapses a tick after stepping off. Bosses are skipped --
  //     their cast timers do not read unit Haste (same policy as Haste Down).
  //   fire (Charging Pierce's trail) -- damage to enemies standing on it,
  //     boss included, every tick.
  if (state.hazards && state.hazards.length) {
    const stepped = new Set();
    state.hazards = state.hazards.filter((hz) => {
      const victims = hz.enemySide ? aliveP : aliveE;
      // Wind (Tempest Blade's gusts): every few ticks it shoves the foes
      // standing on it one tile back toward their own side -- a Displace
      // (Anchor Charm holds; Cyclone Ring counts it). The shove is a move off
      // the hazard, so the move check just below makes it hurt.
      if (hz.kind === "wind" && (hz.age = (hz.age || 0) + 1) % WIND_PUSH_EVERY === 0) {
        const back = hz.enemySide ? 1 : -1;
        for (const u of victims) if (u.hp > 0 && hz.cells.has(u.row + "," + u.col)) displaceUnit(u, back, 0);
      }
      for (const u of victims) {
        // Moving across any hazard hurts.
        if (!stepped.has(u.uid) && u._lastStepTick === state.tick && hz.cells.has(u.prevRow + "," + u.prevCol)) {
          stepped.add(u.uid);
          damageUnit(u, hz.dmg, { effectDamage: true });
          newFx.push({ id: now + "hzrd" + u.uid, row: u.row, col: u.col, t: now, isBurn: hz.kind === "fire", isFrost: hz.kind === "water", isGust: hz.kind === "wind", fromRow: u.prevRow, fromCol: u.prevCol, isEnemy: !hz.enemySide });
        }
        // Fire also burns whoever is standing in it.
        if (hz.kind === "fire" && hz.cells.has(u.row + "," + u.col)) {
          damageUnit(u, hz.dmg, { effectDamage: true });
          newFx.push({ id: now + "hzstand" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
        }
      }
      if (hz.kind === "water") {
        for (const u of [...aliveP, ...aliveE]) {
          if (hz.cells.has(u.row + "," + u.col)) {
            // Terrain, not an inflicted debuff: debuff immunity lets it by.
            applyStatMod(u, { kind: "haste", pct: -(hz.hasteDownPct || HAZARD_HASTE_DOWN_PCT), src: "hazard", ticks: HAZARD_HASTE_TICKS, environmental: true });
          }
        }
      }
      if (hz.kind === "fire" && bossAlive && !hz.enemySide) {
        let onIt = false;
        for (let dr = 0; dr < BOSS_SIZE && !onIt; dr++) {
          for (let dc = 0; dc < BOSS_SIZE && !onIt; dc++) {
            if (hz.cells.has((boss.row + dr) + "," + (boss.col + dc))) onIt = true;
          }
        }
        if (onIt) {
          damageBoss(boss, hz.dmg);
          newFx.push({ id: now + "hzboss", row: boss.row, col: boss.col, t: now, isBurn: true, fromRow: boss.row, fromCol: boss.col, isEnemy: true });
        }
      }
      hz.ticksLeft--;
      return hz.ticksLeft > 0;
    });
  }

  // ── Restrained upkeep ────────────────────────────────────────────────────
  // Restrained is a leash, not a timer: it falls off the moment the carrier is
  // outside the reach of whoever applied it. Runs here, after every unit has
  // finished moving, so it reads the positions the tick actually ended on.
  {
    const findUnit = (uid) =>
      state.playerUnits.find((u) => u.uid === uid) || state.enemyUnits.find((u) => u.uid === uid);
    tickRestrained(aliveP, findUnit);
    tickRestrained(aliveE, findUnit);
  }

  // ── Summons ──────────────────────────────────────────────────────────────
  // Summoned units (`_summonOf`, e.g. Doomshade's Wisps) leave no body: a
  // defeated summon is removed from the battle outright, and every summon
  // vanishes when its own summoner is defeated ("goes away" -- no death
  // effect). This runs after all combat so same-tick death effects (Grave
  // Grudge fires from the onDamaged hook the moment the killing hit lands)
  // are already resolved; the occupancy set rebuilds next tick.
  const pruneSummons = (arr) =>
    arr.filter((u) => {
      if (u._summonOf == null) return true;
      if (u.hp <= 0) return false;
      return arr.some((s) => s.uid === u._summonOf && s.hp > 0);
    });
  if (state.playerUnits.some((u) => u._summonOf != null)) state.playerUnits = pruneSummons(state.playerUnits);
  if (state.enemyUnits.some((u) => u._summonOf != null)) state.enemyUnits = pruneSummons(state.enemyUnits);

  // ── 5. Boss ──────────────────────────────────────────────────────────────
  if (bossAlive) {
    boss.atkCd = Math.max(0, boss.atkCd - 1);
    boss.moveCd = Math.max(0, boss.moveCd - 1);
    boss.specialCd = Math.max(0, boss.specialCd - 1);
    tickTimedMods(boss);

    const mod = getBossModule(boss._bossKey);
    if (mod) {
      const ctx = makeBossContext({ boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols });
      if (mod.onInit && !boss._initDone) {
        mod.onInit(ctx);
        boss._initDone = true;
      }
      if (mod.onStatusTick) mod.onStatusTick(ctx);
      // The boss is the one acting now: hits it lands name it as the
      // attacker (Thornback Plate counters it). It wears no gear, so nothing
      // else about its turn changes.
      withApplier(boss, () => {
        if (mod.special) mod.special(ctx);
        if (mod.basic) mod.basic(ctx);
      });
    }
  }

  return { newFx, now, acted: true };
}

/**
 * Win/lose check. Returns "won" when the boss and all minions are down,
 * "lost" when the party is wiped, otherwise null.
 */
export function battleOutcome(state) {
  const bossAlive = !!(state.boss && state.boss.hp > 0);
  const anyEnemy = state.enemyUnits.some((u) => u.hp > 0);
  const anyPlayer = state.playerUnits.some((u) => u.hp > 0);
  if (!bossAlive && !anyEnemy) return "won";
  if (!anyPlayer) return "lost";
  return null;
}
