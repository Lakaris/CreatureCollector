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
import { MELEE_RANGE, RANGED_RANGE, BOSS_SIZE } from "./constants.js";
import {
  aChebDist, aCardinalDist, aBestStep,
  bossOccupies, distToBoss, nearestOpenBossAdj, nearestOpenCell,
  cellsOf, unitDist, unitCardinalDist,
} from "./geometry.js";
import { tickStatusEffects, isRooted, speedPenalty, tickTimedMods, isStunned, isIntangible, statModMultiplier } from "./status.js";
import { damageUnit } from "./hp.js";
import { tickMinionSpecials } from "./minions.js";
import { unitDamage, playerDamageToBoss, damageBoss, attackCooldown } from "./damage.js";
import { getBossModule } from "./bosses/registry.js";
import { makeBossContext } from "./bosses/context.js";
import { getPlayerAbilityModule } from "./playerAbilities/registry.js";

/** Rate applied to a player-inflicted Burn's stored source ATK, per tick. */
const PLAYER_BURN_RATE = 0.035;
/** Rate applied to a fire trail's stored source ATK, per tick (e.g. Blazehornet's Charging Pierce lvl 5). */
const FIRE_TRAIL_RATE = 0.03;

/**
 * Context passed to a creature's `special(unit, ctx)` / `basicAttack(unit, ctx)`
 * / `onTick(unit, ctx)` ability hooks. Modules are side-agnostic: `aliveP` is
 * always the acting unit's OWN side and `aliveE` its foes, so the same module
 * drives player and enemy creatures alike -- callers pass the lists swapped
 * (with `isEnemySide: true`) for enemy units. Enemy-side hooks never see a
 * boss (it's their ally) and never write to the player damage chart.
 */
function makePlayerAbilityContext({ unit, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, doStep, isEnemySide = false }) {
  return {
    aliveE, aliveP, boss, gridRows, gridCols, newFx, now, canMove,
    blocked,
    isEnemySide,
    addDamageDealt(amount) {
      if (isEnemySide) return;
      const dd = state.damageDealt || (state.damageDealt = {});
      dd[unit.creatureId] = (dd[unit.creatureId] || 0) + amount;
    },
    nearestOpenCell(r, c) {
      return nearestOpenCell(r, c, blocked, gridRows, gridCols);
    },
    relocate(nr, nc) {
      allOcc.delete(unit.row + "," + unit.col);
      unit.prevRow = unit.row;
      unit.prevCol = unit.col;
      unit.lastMoveTime = now;
      unit.row = nr;
      unit.col = nc;
      allOcc.add(nr + "," + nc);
    },
    addFireTrail(cells, ticks, sourceAtk) {
      (state.fireTrails || (state.fireTrails = [])).push({ cells: new Set(cells), ticksLeft: ticks, sourceAtk, enemySide: isEnemySide });
    },
    /** Take one BFS step toward (tr,tc); no-ops when rooted. */
    stepToward(tr, tc) {
      return canMove ? doStep(tr, tc) : false;
    },
  };
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
    u.abilCharge = 0;
    return;
  }
  // Stunned units don't work towards their special (see Overload Sting).
  if (isStunned(u)) return;
  // Haste Down/Up stacks scale the charge rate (statModMultiplier "haste").
  u.abilCharge = Math.min(u.abilChargeMax, (u.abilCharge || 0) + (u.abilitySpeed || 1) * statModMultiplier(u, "haste"));
}

export function specialChargeReady(u) {
  return !!u.abilChargeMax && u.abilCharge >= u.abilChargeMax;
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
 * {aliveE, aliveP, boss})` (e.g. Blazehornet's dash is an engage tool that
 * deliberately fires from anywhere).
 */
export function specialTargetInRange(u, allies, enemies, boss) {
  const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
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
  return true;
}

/** The foe this unit is Taunt-forced onto (e.g. by Taunting Snap), or null. */
function tauntedFoe(u, foes) {
  if ((u.tauntTicks || 0) <= 0 || !u.tauntSourceUid) return null;
  return foes.find((f) => f.uid === u.tauntSourceUid && f.hp > 0 && !isIntangible(f)) || null;
}

/**
 * Marked (Loptrix's Scapegoat): the nearest marked foe ALREADY within this
 * unit's attack range, or null. Marked redirects targeting only -- it never
 * pulls anyone: units out of range keep doing whatever they were doing.
 */
function markedFoeInRange(u, foes) {
  const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
  let best = null, bestD = Infinity;
  for (const f of foes) {
    if ((f.markedTicks || 0) <= 0 || f.hp <= 0 || isIntangible(f)) continue;
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
        atkTgt: u.isRanged && unitCardinalDist(u, mk) <= RANGED_RANGE ? mk : null,
        moveTgt: mk,
      };
    }
  }
  let atkTgt = null;
  if (u.isRanged) {
    const inLine = foes.filter(
      (f) => unitCardinalDist(u, f) <= RANGED_RANGE
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
  const boss = state.boss;
  const newFx = [];
  if (!aliveP.length) return { newFx, now, acted: false };

  const allOcc = new Set();
  for (const u of [...aliveP, ...aliveE]) for (const cell of cellsOf(u)) allOcc.add(cell);
  const bossAlive = !!(boss && boss.hp > 0);
  const damageDealt = state.damageDealt || (state.damageDealt = {});

  /** Cells a unit may not path through. */
  const blocked = (r, c) =>
    r < 0 || r >= gridRows || c < 0 || c >= gridCols ||
    (bossAlive && bossOccupies(boss, r, c)) ||
    allOcc.has(r + "," + c);

  // ── 1. Player units ──────────────────────────────────────────────────────
  for (const u of aliveP) {
    u.atkCd = Math.max(0, u.atkCd - 1);
    tickSpecialCharge(u);
    tickTimedMods(u);
    // Stunned units can't attack: hold the cooldown above zero so every
    // attack branch below (including custom basicAttack hooks, which check
    // atkCd themselves) stays closed. Movement and passives still run.
    if (isStunned(u)) u.atkCd = Math.max(u.atkCd, 1);

    const canMove = !isRooted(u);
    const penalty = speedPenalty(u);
    const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;
    const distB = bossAlive ? distToBoss(boss, u.row, u.col) : Infinity;

    const abilMod = getPlayerAbilityModule(u.creatureId);
    const hits = abilMod?.hitsForAttack ? abilMod.hitsForAttack(u) : 1;
    // Recomputed per hit with the target in hand -- some passives scale off
    // the target's state (e.g. Ignissaur's Stoked Flames reads Burn stacks).
    const dmgMultVs = (target) => (abilMod?.dmgMultForAttack ? abilMod.dmgMultForAttack(u, target) : 1);

    // Always-on passives (e.g. Bloomibis's Guardian Grove aura) run every tick,
    // before the special/basic flow, independent of cooldowns and movement.
    if (abilMod?.onTick) {
      const tickCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
      abilMod.onTick(u, tickCtx);
    }

    // Special abilities run off the charge bar (see tickSpecialCharge),
    // independent of the basic-attack loop below. Implemented specials (e.g.
    // Blazehornet's Charging Pierce) can move the unit, so they run first and
    // everything after sees the new position. Creatures whose special isn't
    // implemented yet just flash the ready marker and start recharging.
    // Either way, a full bar HOLDS until there's actually something in range
    // to use it on (specialTargetInRange, or the module's own specialInRange),
    // then fires the moment a target closes in.
    // Chargeless specials (no `charge` in data, e.g. Overload Sting) skip the
    // bar entirely: they fire whenever their module's own gate passes.
    const chargelessReady = !u.abilChargeMax && !!(abilMod?.special && abilMod.specialInRange);
    if (specialChargeReady(u) || chargelessReady) {
      const rangeBoss = bossAlive ? boss : null;
      const inRange = abilMod?.specialInRange
        ? abilMod.specialInRange(u, { aliveE, aliveP, boss: rangeBoss, gridRows, gridCols })
        : specialTargetInRange(u, aliveP, aliveE, rangeBoss);
      if (abilMod?.special) {
        if (canMove && inRange) {
          const specialCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
          abilMod.special(u, specialCtx);
          consumeSpecialCharge(u);
        }
      } else if (inRange) {
        consumeSpecialCharge(u);
      }
    }

    // A custom basicAttack hook (e.g. Starlit's piercing beam) fully replaces
    // the default "attack the nearest thing" flow below -- it owns targeting,
    // damage/healing, and chase-movement for this unit's turn.
    if (abilMod?.basicAttack) {
      const basicCtx = makePlayerAbilityContext({ unit: u, aliveE, aliveP, boss, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });
      abilMod.basicAttack(u, basicCtx);
      continue;
    }

    // Boss takes priority when in range -- hold position even while on
    // cooldown. A Taunted unit ignores the boss (it is forced onto the
    // minion that taunted it); so does a ranged unit retaliating against a
    // melee attacker, or any unit with a Marked foe already in reach (the
    // minion-fight branch below).
    if (distB <= range && bossAlive && !tauntedFoe(u, aliveE) && !retaliationFoe(u, aliveE) && !markedFoeInRange(u, aliveE)) {
      if (u.atkCd <= 0) {
        let totalDmg = 0;
        for (let i = 0; i < hits && boss.hp > 0; i++) {
          const dmgToBoss = Math.max(1, Math.round(playerDamageToBoss(u, boss, aliveP) * dmgMultVs(boss)));
          damageBoss(boss, dmgToBoss);
          totalDmg += dmgToBoss;
          const bonus = abilMod?.onHit ? abilMod.onHit(u, boss) : 0;
          if (bonus) { damageBoss(boss, bonus); totalDmg += bonus; }
        }
        damageDealt[u.creatureId] = (damageDealt[u.creatureId] || 0) + totalDmg;
        u.atkCd = attackCooldown(u, penalty);
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
        if (dist <= range && u.atkCd <= 0) {
          let totalDmg = 0;
          const tgtMod = getPlayerAbilityModule(tgt.creatureId);
          for (let i = 0; i < hits && tgt.hp > 0; i++) {
            const dmg = Math.max(1, Math.round(unitDamage(u, tgt) * dmgMultVs(tgt)));
            totalDmg += damageUnit(tgt, dmg);
            const bonus = abilMod?.onHit ? abilMod.onHit(u, tgt) : 0;
            if (bonus) totalDmg += damageUnit(tgt, bonus);
            // Reflect passives (e.g. Crystalcrab's Prism Shell): the defender
            // returns a slice of the hit to the attacker. Reflected damage is
            // never itself reflected.
            const reflect = tgtMod?.onDamaged ? tgtMod.onDamaged(tgt, u, dmg + bonus) : 0;
            if (reflect) damageUnit(u, reflect);
          }
          damageDealt[u.creatureId] = (damageDealt[u.creatureId] || 0) + totalDmg;
          // A ranged victim of a melee hit turns to face its attacker (see retaliationFoe).
          if (!u.isRanged && tgt.isRanged && tgt.hp > 0) tgt._retaliateUid = u.uid;
          u.atkCd = attackCooldown(u, penalty);
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
    u.atkCd = Math.max(0, u.atkCd - 1);
    tickSpecialCharge(u);
    tickTimedMods(u);
    if (isStunned(u)) u.atkCd = Math.max(u.atkCd, 1);

    const canMove = !isRooted(u);
    const penalty = speedPenalty(u);
    const range = u.isRanged ? RANGED_RANGE : MELEE_RANGE;

    const abilMod = getPlayerAbilityModule(u.creatureId);
    const hits = abilMod?.hitsForAttack ? abilMod.hitsForAttack(u) : 1;
    const dmgMultVs = (target) => (abilMod?.dmgMultForAttack ? abilMod.dmgMultForAttack(u, target) : 1);
    const enemyCtx = () => makePlayerAbilityContext({ unit: u, aliveE: aliveP, aliveP: aliveE, boss: null, allOcc, newFx, now, gridRows, gridCols, state, blocked, canMove, isEnemySide: true, doStep: (tr, tc) => stepUnit(u, tr, tc, blocked, allOcc, now, state.tick) });

    if (abilMod?.onTick) abilMod.onTick(u, enemyCtx());

    const chargelessReady = !u.abilChargeMax && !!(abilMod?.special && abilMod.specialInRange);
    if (specialChargeReady(u) || chargelessReady) {
      const inRange = abilMod?.specialInRange
        ? abilMod.specialInRange(u, { aliveE: aliveP, aliveP: aliveE, boss: null, gridRows, gridCols })
        : specialTargetInRange(u, aliveE, aliveP, null);
      if (abilMod?.special) {
        if (canMove && inRange) {
          abilMod.special(u, enemyCtx());
          consumeSpecialCharge(u);
        }
      } else if (inRange) {
        consumeSpecialCharge(u);
      }
    }

    if (abilMod?.basicAttack) {
      abilMod.basicAttack(u, enemyCtx());
      continue;
    }

    const { atkTgt, moveTgt } = selectTarget(u, aliveP);
    const tgt = atkTgt || moveTgt;
    if (!tgt) continue;

    const dist = atkTgt ? unitCardinalDist(u, atkTgt) : unitDist(u, tgt);
    if (dist <= range && u.atkCd <= 0) {
      const tgtMod = getPlayerAbilityModule(tgt.creatureId);
      for (let i = 0; i < hits && tgt.hp > 0; i++) {
        const dmg = Math.max(1, Math.round(unitDamage(u, tgt) * dmgMultVs(tgt)));
        damageUnit(tgt, dmg);
        const bonus = abilMod?.onHit ? abilMod.onHit(u, tgt) : 0;
        if (bonus) damageUnit(tgt, bonus);
        // Reflect passives: a player-side defender's reflect counts toward
        // its damage chart.
        const reflect = tgtMod?.onDamaged ? tgtMod.onDamaged(tgt, u, dmg + bonus) : 0;
        if (reflect) {
          damageUnit(u, reflect);
          damageDealt[tgt.creatureId] = (damageDealt[tgt.creatureId] || 0) + reflect;
        }
      }
      // A ranged victim of a melee hit turns to face its attacker (see retaliationFoe).
      if (!u.isRanged && tgt.isRanged && tgt.hp > 0) tgt._retaliateUid = u.uid;
      u.atkCd = attackCooldown(u, penalty);
      newFx.push({ id: now + u.uid, row: tgt.row, col: tgt.col, t: now, isRanged: u.isRanged, fromRow: u.row + ((u.size || 1) - 1) / 2, fromCol: u.col + ((u.size || 1) - 1) / 2, isEnemy: true });
    } else if (canMove && dist > range) {
      stepUnit(u, tgt.row, tgt.col, blocked, allOcc, now, state.tick);
    }
  }

  // ── 3. Minion specials ───────────────────────────────────────────────────
  tickMinionSpecials(aliveE, aliveP, newFx, now);

  // ── 4. Status effects ────────────────────────────────────────────────────
  tickStatusEffects(aliveP, boss, newFx, now);

  // Player-inflicted Burn (e.g. Blazehornet's Burning Bond) on minions/boss.
  // Separate from tickStatusEffects above, which only handles boss->player DoT.
  for (const u of aliveE) {
    if ((u.burnTicks || 0) > 0) {
      const dmg = Math.max(1, Math.round((u.burnSourceAtk || 10) * PLAYER_BURN_RATE));
      damageUnit(u, dmg);
      u.burnTicks--;
      newFx.push({ id: now + "pbrn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
  }
  if (bossAlive && (boss.burnTicks || 0) > 0) {
    const dmg = Math.max(1, Math.round((boss.burnSourceAtk || 10) * PLAYER_BURN_RATE));
    damageBoss(boss, dmg);
    boss.burnTicks--;
    newFx.push({ id: now + "pbrn" + "boss", row: boss.row, col: boss.col, t: now, isBurn: true, fromRow: boss.row, fromCol: boss.col, isEnemy: true });
  }

  // Fire trails left behind by abilities (e.g. Blazehornet's Charging Pierce
  // lvl 5) damage anything from the OTHER side standing on them, then expire.
  if (state.fireTrails && state.fireTrails.length) {
    state.fireTrails = state.fireTrails.filter((trail) => {
      const victims = trail.enemySide ? aliveP : aliveE;
      for (const u of victims) {
        if (trail.cells.has(u.row + "," + u.col)) {
          const dmg = Math.max(1, Math.round(trail.sourceAtk * FIRE_TRAIL_RATE));
          damageUnit(u, dmg);
          newFx.push({ id: now + "trail" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
        }
      }
      if (bossAlive && !trail.enemySide) {
        let onTrail = false;
        for (let dr = 0; dr < BOSS_SIZE && !onTrail; dr++) {
          for (let dc = 0; dc < BOSS_SIZE && !onTrail; dc++) {
            if (trail.cells.has((boss.row + dr) + "," + (boss.col + dc))) onTrail = true;
          }
        }
        if (onTrail) {
          const dmg = Math.max(1, Math.round(trail.sourceAtk * FIRE_TRAIL_RATE));
          damageBoss(boss, dmg);
          newFx.push({ id: now + "trailboss", row: boss.row, col: boss.col, t: now, isBurn: true, fromRow: boss.row, fromCol: boss.col, isEnemy: true });
        }
      }
      trail.ticksLeft--;
      return trail.ticksLeft > 0;
    });
  }

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
      if (mod.special) mod.special(ctx);
      if (mod.basic) mod.basic(ctx);
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
