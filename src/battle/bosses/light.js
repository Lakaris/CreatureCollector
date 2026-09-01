// Light boss — Radiant Strike / Holy Radiance / Bulwark.
//
// Stationary; players must come to it. Holy Radiance stacks Power (permanent
// damage scaling) and Shield; Bulwark turns the second half of the fight into
// a race against the boss's own regeneration.

import { MELEE_RANGE, BOSS_SIZE } from "../constants.js";
import { damageUnit } from "../hp.js";

/**
 * Bulwark. At half Health the boss shields itself once, and for as long as ANY
 * Shield stands it regenerates.
 *
 * The threshold fires once, not once per tick below it -- "at 50% Health" is a
 * moment, and re-granting every tick under half would be an unbreakable wall.
 *
 * The regeneration is deliberately slow: at this rate, climbing the half of the
 * Health bar the passive opens on would take 100 uninterrupted ticks (~50s at
 * 1x), which no shield survives under fire. It is meant to punish a team that
 * stops pushing damage, not to out-heal one that keeps going. The two knobs to
 * turn if it lands wrong are SHIELD_PCT (how long the regen window is) and
 * REGEN_PCT (how much it is worth).
 *
 * The regen keys off any Shield, Holy Radiance's included, because the ability
 * text says "while it has a Shield" -- so a Radiance cast landing while the
 * Bulwark shield still holds extends the window rather than starting a new one.
 */
const BULWARK_HP_THRESHOLD = 0.5;
const BULWARK_SHIELD_PCT = 0.3;
const BULWARK_REGEN_PCT = 0.005;
/** Ticks between regen pulses on screen -- healing every tick reads as a flicker. */
const BULWARK_FX_INTERVAL = 4;

export default {
  key: "light",

  /** Opens on a longer cooldown so the fight doesn't start with a nuke. */
  onInit(ctx) {
    ctx.boss.specialCd = 22;
  },

  /** Bulwark: the half-Health shield, then regeneration for as long as it holds. */
  onStatusTick(ctx) {
    const { boss, newFx, now } = ctx;
    if (boss.hp <= 0) return;

    if (!boss._bulwarkUsed && boss.hp <= boss.maxHp * BULWARK_HP_THRESHOLD) {
      boss._bulwarkUsed = true;
      boss.shield = (boss.shield || 0) + Math.round(boss.maxHp * BULWARK_SHIELD_PCT);
      newFx.push({ id: now + "bulwark", row: boss.row + 0.5, col: boss.col + 0.5, t: now, isHeal: true });
    }

    if ((boss.shield || 0) > 0 && boss.hp < boss.maxHp) {
      // Minimum 1 so the regen never rounds away to nothing on a small boss.
      const heal = Math.max(1, Math.round(boss.maxHp * BULWARK_REGEN_PCT));
      boss.hp = Math.min(boss.maxHp, boss.hp + heal);
      boss._bulwarkFxTick = (boss._bulwarkFxTick || 0) + 1;
      if (boss._bulwarkFxTick % BULWARK_FX_INTERVAL === 0) {
        newFx.push({ id: now + "bulwarkregen", row: boss.row + 0.5, col: boss.col + 0.5, t: now, isHeal: true });
      }
    }
  },

  special(ctx) {
    const { boss, aliveP, newFx, now } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    const powerMult = 1 + 0.2 * (boss.powerStacks || 0);
    boss.shield = (boss.shield || 0) + Math.round(boss.maxHp * 0.15);
    boss.powerStacks = (boss.powerStacks || 0) + 1;

    for (const u of aliveP) {
      damageUnit(u, ctx.dmg(0.12 * powerMult));
      newFx.push({ id: now + "hrad" + u.uid, row: u.row, col: u.col, t: now, isPillar: true });
    }
    boss.specialCd = 20;
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    const adj = ctx.targetsWithin(MELEE_RANGE);
    if (!adj.length || boss.atkCd > 0) return;

    // A 4-wide swing along whichever face the nearest player stands on.
    const nearest = adj[0];
    const dr = nearest.row - (boss.row + 0.5);
    const dc = nearest.col - (boss.col + 0.5);
    let tiles;
    if (Math.abs(dr) >= Math.abs(dc)) {
      const r = dr > 0 ? boss.row + BOSS_SIZE : boss.row - 1;
      tiles = [[r, boss.col - 1], [r, boss.col], [r, boss.col + 1], [r, boss.col + 2]];
    } else {
      const c = dc > 0 ? boss.col + BOSS_SIZE : boss.col - 1;
      tiles = [[boss.row - 1, c], [boss.row, c], [boss.row + 1, c], [boss.row + 2, c]];
    }
    tiles = tiles.filter(([r, c]) => r >= 0 && r < gridRows && c >= 0 && c < gridCols);

    const hits = aliveP.filter((u) => tiles.some(([r, c]) => u.row === r && u.col === c));
    if (!hits.length) return;

    // Power stacks from Holy Radiance are the only multiplier here. The old
    // Bulwark added a 1.4x while shielded; that passive is gone (it is now the
    // half-Health shield and regen in onStatusTick), so the bonus went with it.
    const powerMult = 1 + 0.2 * (boss.powerStacks || 0);
    for (const [r, c] of tiles) {
      newFx.push({ id: now + "lgt" + r + "," + c, row: r, col: c, t: now, isPillar: true });
    }
    for (const tgt of hits) {
      damageUnit(tgt, ctx.dmg(0.15 * powerMult));
    }
    boss.atkCd = 9;
  },

  /** The four faces the 4-wide swing can land on. */
  basicTiles: (geo) => {
    const { boss, gridRows, gridCols } = geo;
    const out = new Set();
    const cols = [boss.col - 1, boss.col, boss.col + 1, boss.col + 2];
    const rows = [boss.row - 1, boss.row, boss.row + 1, boss.row + 2];
    for (const c of cols) {
      if (c < 0 || c >= gridCols) continue;
      if (boss.row + BOSS_SIZE < gridRows) out.add(boss.row + BOSS_SIZE + "," + c);
      if (boss.row - 1 >= 0) out.add(boss.row - 1 + "," + c);
    }
    for (const r of rows) {
      if (r < 0 || r >= gridRows) continue;
      if (boss.col - 1 >= 0) out.add(r + "," + (boss.col - 1));
      if (boss.col + BOSS_SIZE < gridCols) out.add(r + "," + (boss.col + BOSS_SIZE));
    }
    return out;
  },

  // Holy Radiance hits everyone.
  specialTiles: (geo) => geo.allCells(),
};
