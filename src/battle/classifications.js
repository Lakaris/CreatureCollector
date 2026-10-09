// Creature classifications: named sets of rules a creature can belong to.
//
// A classification is how the engine asks "what kind of creature is this?"
// without hard-coding the answer at every call site. A creature lists the
// classes it belongs to in `classes` (["boss"]), and every rule that treats it
// differently -- an immunity, a turn-order quirk -- reads it from here. So
// making bosses stunnable, say, is one word removed below rather than a hunt
// through the engine for every place that knew bosses were special.
//
// IMMUNITY KEYS name an EFFECT, not a creature: each is checked at the one
// place that effect is applied (applyFear checks "fear", canBeExecuted checks
// "execute", ...), so a key added here is enforced everywhere at once.
//   stun, root, fear, restrained -- the control family (Stun lands through
//     applyTimedDebuff's stunTicks, Root through applyRoot)
//   displace    -- pushes, pulls, knockbacks (displaceUnit)
//   swap        -- trading places (the Swap tag; Zephyrcoo's line). Whatever
//                  performs a Swap must check this before moving anyone.
//   hastedown   -- Haste lowered by a stat mod (Haste Down, Shock)
//   speeddown   -- Speed lowered by a stat mod (Speed Down, a Discharge aura)
//   slow        -- the Slow debuff (slowTicks)
//   marked      -- Marked (markedTicks; Scapegoat) -- no class uses it yet
//   blind       -- Blind -- no class uses it yet (a boss obeys it: see
//                  missesBlinded in bosses/context.js)
//   execute     -- instant defeats below a Health threshold
//   protect     -- an ally redirecting this creature's hits onto itself
//   shielddown  -- Shielding Down (Nightshade Bead)
//   critshred   -- Defense shredded by critical hits (Shattercrit Ring)

export const CLASSIFICATIONS = {
  boss: {
    label: "Boss",
    // TAUNT AND BLIND ARE THE CONTROL EFFECTS A BOSS OBEYS. The rest of the
    // control family stops a creature acting, and a boss that can be stopped
    // stops being a boss; Taunt only redirects attacks it was making anyway,
    // and Blind costs it one Basic swing. Marked lands on a boss too. The
    // other keys are the "doesn't affect bosses" rules the game already had.
    immune: ["stun", "root", "fear", "restrained", "displace", "swap", "hastedown", "speeddown", "slow", "execute", "protect", "shielddown", "critshred"],
    // Bosses take their turn after every other creature on the board, so the
    // order a tick resolves in is the one the boss fights were tuned against.
    actsLast: true,
    // A boss's Shield is a POOL rather than an ordinary Shield: a hit that
    // reaches it is spent on it entirely (nothing spills over to Health,
    // however small the pool), and Shield-bypassing attacks don't get past it.
    // That is how boss shields have always worked (the Light boss's Holy
    // Radiance and Bulwark); set false to make them ordinary Shields.
    shieldIsPool: true,
    // Takes the attacker's damage unmitigated -- bosses have never had a
    // Defense stat in the fight -- through the boss formula in battle/damage.js
    // (playerDamageToBoss), which also carries the Dark boss's Dark Shroud.
    unmitigatedDamage: true,
    // Shrugs off the effects creatures' Basic hits carry on-hit -- Lava
    // Spit's Expose, Frost Nip's Frostbite, Tusk Slam's chill and Healing
    // Down, Gust Swipe's shred, Static Zap's Chain, and the rest. It still
    // takes the hit itself. Bosses have always been immune to these (the
    // effects were written for creatures, and skipped the boss); set false to
    // let them land.
    ignoresOnHitEffects: true,
    // Counts as a boss wherever an effect excludes bosses (isBossUnit in
    // battle/hp.js -- Petrified Core's Stun, Voidheart's drain).
    countsAsBoss: true,
  },
  // The Labyrinth's Boss creature (every 10th floor): an ordinary enemy
  // creature on a 2x2 body, NOT a Dungeon boss -- it is Stunned, Rooted and
  // Feared like any creature. It only can not be pushed or executed, and
  // counts as a boss for the effects that exclude bosses.
  giant: {
    label: "Labyrinth Boss",
    immune: ["displace", "execute"],
    countsAsBoss: true,
  },
};

const IMMUNE = Object.fromEntries(
  Object.entries(CLASSIFICATIONS).map(([k, c]) => [k, new Set(c.immune || [])])
);

/** The classes `u` belongs to. */
function classesOf(u) {
  return u?.classes || [];
}

/** Does `u` belong to classification `c`? */
export function hasClass(u, c) {
  return classesOf(u).includes(c);
}

/** Is `u` a boss? Shorthand for the classification most rules care about. */
export function isBoss(u) {
  return hasClass(u, "boss");
}

/** Is `u` immune to `effect` (an IMMUNITY KEY above) by any of its classes? */
export function isImmune(u, effect) {
  for (const c of classesOf(u)) if (IMMUNE[c]?.has(effect)) return true;
  return false;
}

/** Does any of `u`'s classes switch on `rule` (actsLast, shieldIsPool, ...)? */
export function hasRule(u, rule) {
  return classesOf(u).some((c) => CLASSIFICATIONS[c]?.[rule]);
}

/** Does `u` take its turn after everyone else (see CLASSIFICATIONS.boss)? */
export function actsLast(u) {
  return hasRule(u, "actsLast");
}
