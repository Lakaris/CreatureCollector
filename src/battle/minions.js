// Enemy minions: their per-type specials, and the factory that spawns them.
//
// Minion AI is kept separate from boss AI because it belongs to the minion type,
// not to whichever boss happened to summon it.

import { CREATURE_MAP } from "../data/creatures.js";
import { damageUnit } from "./hp.js";

/** Vine minions: Entangle hits all 8 surrounding tiles every 15 ticks. */
export function tickMinionSpecials(aliveE, aliveP, newFx, now) {
  for (const u of aliveE) {
    if (!u.isVineMinion) continue;
    u.specialCd = Math.max(0, (u.specialCd || 0) - 1);
    if (u.specialCd > 0) continue;

    const adj = aliveP.filter(
      (p) => Math.abs(p.row - u.row) <= 1 && Math.abs(p.col - u.col) <= 1
    );
    for (const p of adj) {
      const dmg = Math.max(1, Math.round(u.atk * (0.7 + Math.random() * 0.3) * 0.5));
      damageUnit(p, dmg);
      newFx.push({ id: now + "ve" + u.uid + p.uid, row: p.row, col: p.col, t: now, isRanged: false, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    u.specialCd = 15;
  }
}

