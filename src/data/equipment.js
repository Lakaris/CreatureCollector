// Equipment catalog. Item identity is per-creature (ownedData.equipped, a 4-slot array
// of ids), but item LEVEL/ASCENSION are global maps keyed by itemId in app state --
// upgrading an item upgrades it everywhere it is equipped.
//
// EXCLUSIVITY. An item may restrict who can wear it by carrying one of:
//   element:    "Fire"      -- Fire-type creatures only
//   role:       "Attacker"  -- Attackers only
//   attackType: "Melee"     -- Melee creatures only
//   creatureId: "emberpup"  -- that one species only (a CREATURES id)
// An item with none of these is universal. The catalog has no creature-exclusive
// items yet; the axis exists so one can be added by setting the field and
// nothing else -- every screen already reads it. See core/equipment.js, which
// owns the checks and the "X exclusive" captions for all four axes.
//
// EFFECT FILTERS. The Effect Filters page lists every effect an item's text
// names as a whole word ("Seeded", "Wind Hazard"), so an item that inflicts a
// status should name it.
//
// BATTLE EFFECTS. An item's in-battle behaviour is declared as
// `battle: { key: value }`. gearBattleBonus (core/equipment.js) merges the
// worn items' keys onto the unit as `unit.gear` -- the same effect from
// several items ADDS UP, durations included (booleans OR). Items with an
// interval (`...Every`) or a Health threshold (`...Below/Above...`) are kept
// apart in `unit.gearTriggers` and each fires on its own (see gearBattleBonus)
// -- and the engine reads `unit.gear?.<key>` at ONE place per key:
//   debuffTicks / buffTicks   extra ticks on debuffs/buffs this creature applies  (battle/applier.js)
//   extraDebuffStack /
//   extraBuffStack            +1 stack per stackable debuff/buff it applies       (battle/applier.js)
//   shieldPct                 Shields it grants are this % larger                 (battle/applier.js)
//   basicCritChargePct        Special charge % per Basic-ability crit             (battle/damage.js)
//   overhealLayerPct          stacking Overheal Layer cap, % of max Health        (battle/hp.js)
//   immobilizedDmgPct         +% damage to Immobilized targets                    (battle/hp.js)
//   killChargePct             Special charge % on defeating an enemy              (battle/hp.js)
//   lowHpIntangibleTicks      Intangible for N ticks on first drop below 50% HP   (battle/hp.js)
//   debuffImmunity            the first N debuffs inflicted are ignored           (battle/applier.js)
//   auraRange                 +N tiles on every aura it emits                     (battle/status.js)
//   multiHitDmgPct            +% damage from abilities TAGGED "multihit"          (battle/hp.js)
//                             -- the tag in core/abilityText.js is the classification
//   echoSpecialPct            recast the Special at this % effectiveness          (battle/tick.js)
//   sealSpecial               the Special never charges or casts                  (battle/charge.js)
//   spdPct                    +% Speed                                            (battle/damage.js)
//   basicDmgPct               +% damage from the Basic ability                    (battle/hp.js)
//   specialDmgPct             +% damage from the Special ability                  (battle/hp.js)
//   startStackShieldPct       stacking Shield, % of max Health, until broken      (battle/tick.js)
//   defeatAtkPct /
//   defeatAtkMaxPct           +% Attack per defeat on the field, up to a cap      (battle/hp.js, damage.js)
//   atkPerBuffPct             +% Attack per buff worn                             (battle/damage.js)
//   lowHpDefPct /
//   lowHpDefBelowPct          +% Defense while below that % of max Health         (battle/damage.js)
//   critShredPct /
//   critShredMaxPct           -% Defense per crit for the battle, up to a cap (not a debuff) (battle/status.js)
//   counterEvery              Counter every Nth hit taken                         (battle/damage.js)
//   cheatDeathImmortalTicks   negate the first fatal hit, then Immortal N ticks   (battle/hp.js)
//   reviveHpPct               revive once at this % of max Health                 (battle/hp.js)
//   lifestealPct              heal this % of damage dealt                         (battle/status.js)
//   healDonePct               +% healing done                                     (battle/hp.js)
//   healReceivedPct           +% healing received                                 (battle/hp.js)
//   regenPctPerTick           permanent regen, % of max Health per tick           (battle/status.js)
//   seedDrainPct /
//   seedHealPct               Seeded: drain % of victim / heal % of self per tick (battle/status.js)
//   slowOnHitChancePct        % chance per damaging hit to Slow                   (battle/status.js)
//   moveAtkSpdPct             +% Attack and Speed (a buff) on moving              (battle/status.js)
//   exposeWhenHitChancePct    % chance to Expose an enemy ability that hits it    (battle/status.js)
//   newDebuffHealPct          heal % of max Health per NEW debuff it inflicts     (battle/status.js)
//   vsLastAttackerDmgPct      +% damage to whoever last damaged it                (battle/hp.js)
//   lowHpTargetDmgPct /
//   lowHpTargetBelowPct       +% damage to targets below that % Health            (battle/hp.js)
//   defPerDebuffPct           +% Defense per debuff worn                          (battle/damage.js)
//   missingHpDmgRatio         +% damage per 1% of its own missing Health          (battle/hp.js)
//   besideAllyDmgReductionPct allies beside it take this % less damage            (battle/hp.js)
//   fullHpDmgReductionPct     takes this % less damage at full Health             (battle/hp.js)
//   rangedDmgReductionPct     takes this % less damage from Ranged attackers      (battle/hp.js)
//   meleeLifestealPct         heal % of damage dealt, if it fights in Melee       (battle/status.js)
//   afterMoveAttackDmgPct     +% on the first Basic attack after moving           (battle/hp.js)
//   focusEvery / focusDmgPct  +% on every Nth Basic attack                        (battle/hp.js)
//   moveHastePct              +% Haste (a buff) on moving                         (battle/status.js)
//   rangeBonus                +N attack range                                     (battle/geometry.js)
//   unmovable                 enemies can't push or pull it                       (battle/immobilize.js)
//   resist<Type>Pct           takes % less damage from that type's creatures      (battle/hp.js)
//   allDmgReductionPct        takes % less damage                                 (battle/hp.js)
//   protectDmgReductionPct    takes % less of the hits it guards via Protect      (battle/hp.js)
//   reduceEveryNthHit / ...Pct  every Nth hit taken deals % less                  (battle/hp.js)
//   firstHitsReduced / ...Pct   the first N instances of damage deal % less       (battle/hp.js)
//   dodgeEvery                Dodge every Nth ability hit (the Dodge tag)         (battle/hp.js)
//   shieldDmgPct              +% damage against Shields                           (battle/hp.js)
//   perBurnStackDmgPct        +% per Burn stack on the target                     (battle/hp.js)
//   vsSlowStunDmgPct          +% against Slowed or Stunned targets                (battle/hp.js)
//   farthestDmgPct            +% from abilities TAGGED "farthest"                 (battle/hp.js)
//   loneDmgPct / loneDefPct   +% damage / Defense with no ally Nearby             (battle/hp.js, damage.js)
//   duelPct                   +% Attack and Defense vs the first creature it hits (battle/damage.js)
//   alwaysCritBelowPct        always crit targets below that % Health             (battle/damage.js)
//   specialAtkPct / ...MaxPct +% Attack per Special cast, for the battle          (battle/damage.js)
//   specialSpdPct / ...MaxPct +% Speed per Special cast, for the battle           (battle/damage.js)
//   atkPerTenthSpdPct         +% Attack per 0.1 Speed                             (battle/damage.js)
//   thornsDefPct              hit it, take % of its Defense back                  (battle/damage.js)
//   dischargeEvery            every Nth hit taken, Basic damage to Nearby foes    (battle/damage.js)
//   displaceCooldownPct       -% cooldown on abilities TAGGED "displace"          (battle/tick.js, damage.js)
//   specialHitHealPct         heal % of max Health per enemy a Special damages    (battle/status.js)
//   struckHastePct            +% Haste (a buff) when hit by an enemy ability      (battle/status.js)
//   executeBelowPct           Execute non-boss targets below that % Health        (battle/status.js)
//   newDebuffShieldDefPct     Shield of % Defense per NEW debuff it receives      (battle/status.js)
//   healDispelDebuffs         dispel N debuffs from an ally it heals              (battle/status.js)
//   healedBuffPct             Attack Up and Critical Damage Up when healed        (battle/status.js)
//   seedPotencyPct            +% to the Seeded it inflicts                        (battle/status.js)
//   lifestealOverhealPct      lifesteal past max Health becomes a stacking Shield (battle/hp.js)
//   extraAllyTargets          its heals and buffs on an ally also reach N more    (battle/applier.js)
//   fireHazardPct / waterHazardPct  +% potency of hazards it lays                 (battle/tick.js)
//   startProtectAdjacent      N Protect stacks to Beside allies, first turn       (battle/tick.js)
//   adjacentEvery             every Nth Basic attack also hits enemies Beside it  (battle/tick.js)
//   stunEvery / stunEveryTicks  every Nth Basic attack Stuns the target           (battle/tick.js)
//   lineEvery                 every Nth Basic attack also hits in a Line          (battle/tick.js)
//   basicPierce               the Basic Pierces (and counts as tagged "pierce")   (battle/tick.js, abilityTags.js)
//   pierceDmgPct              +% from abilities TAGGED "pierce"                   (battle/hp.js)
//   pierceWindHazard          a pierce ability leaves a Wind Hazard               (battle/tick.js)
//   specialPush / impactMult / impactStunTicks
//                             damaging Specials Push (tagged "displace"); a push
//                             that hits a wall/creature deals boosted Impact + Stun (battle/tick.js, displace.js)
//   displacedEnemyChargePct   Special charge % whenever an enemy is Displaced     (battle/status.js)
//   specialStackShieldPct     stacking Shield, % of max Health, per Special cast  (battle/tick.js)
//   firstSpecialStunTicks     the first Special Stuns every enemy it hits         (battle/tick.js)
//   specialMaxHpDrainPct / specialMaxHpGainPct / specialMaxHpGainMaxPct
//                             Specials shrink a non-boss's max Health, grow its own (battle/tick.js)
//   teleportDodge / teleportNextDmgPct  after a teleport: Dodge the next hit, and
//                             the next damaging ability is stronger               (battle/status.js, hp.js)
//   sameTargetAtkPct / ...MaxPct  +% Attack per hit on the same enemy, resets on a switch (battle/status.js)
//   lifestealOnlyHeal         only lifesteal can heal it                          (battle/hp.js)
//   counterBonusDefPct        its Counters add this % of its Defense              (battle/damage.js)
//   shareNearbyDmgPct / shareAboveHpPct  takes this % of ability hits on Nearby
//                             allies while above that % Health                    (battle/hp.js)
//   rescueBelowPct / rescueHealPct  an ally's first drop below that % Health heals
//                             it for this % of the wearer's max Health            (battle/hp.js)
//   reviveAllyPct             once per battle, a defeated ally revives at this %  (battle/hp.js)
//   shareStatsPct             allies gain this % of its Health/Attack/Defense     (battle/tick.js, damage.js, hp.js)
//   healingHastePct           +% charge rate on a healing Special                 (battle/tick.js)
//   healedAllyChargePct       an ally it heals gains this % Special charge        (battle/status.js)
//   healCleanseAll            an ally it heals loses every debuff                 (battle/status.js)
//   specialShieldLowestAllyPct  per Special cast, the lowest-Health ally gets a
//                             Shield of this % of its max Health                  (battle/tick.js)
//   specialRefundPct          Special charge % back per Special cast              (battle/tick.js)
//   startTeamHasteSpdPct      Haste Up and Speed Up for its whole side, first turn (battle/tick.js)
//   hitDotBurn                every ability hit also inflicts Damage Over Time and Burn (battle/status.js)
//   specialTauntNearbyTicks   per Special cast, Taunt every Nearby enemy          (battle/tick.js)
//   burn/poison/dot/frostbite/stunDurationTicks  extra ticks on that one debuff
//                             it inflicts                                         (battle/applier.js, status.js)
//   burnTickHealPct           heal % of max Health per tick of its Burn           (battle/status.js tickBurn)
//   burnUndispellable / burnDmgPct  its Burn can't be dispelled / deals +%        (battle/status.js)
//   meleeHitBurn              hit by a Melee enemy's ability, Burn it             (battle/status.js)
//   fireHazardTargetDmgPct    +% to targets standing on a Fire Hazard             (battle/hp.js)
//   deathBlastAtkPct          on its defeat, % of its Attack to Nearby enemies    (battle/tick.js)
//   burnDeathSpread           a Burning enemy falls: Burn every enemy Nearby it   (battle/tick.js)
//   frostbiteTargetDmgPct     +% to targets with Frostbite                        (battle/hp.js)
//   pullEvery                 every Nth Basic attack Pulls the target 1 tile      (battle/tick.js)
//   fortifyExtraStack         +N Fortify whenever it gains Fortify                (battle/status.js)
//   splash/line/chain/weakestDmgPct  +% from abilities TAGGED that              (battle/hp.js)
//   frostbiteShatterStunTicks max Frostbite stacks shatter into a Stun            (battle/status.js)
//   waterHazardDefShredPct    enemies on a Water Hazard have -% Defense           (battle/damage.js)
//   dispelShieldPct / ...MaxPct  stacking Shield per debuff it dispels, capped    (battle/status.js, hp.js)
//   counterDmgPct / reflectDmgPct  +% on its Counters / Reflects                  (battle/hp.js, damage.js, tick.js)
//   restrainedTargetDmgPct    +% to targets it has Restrained                     (battle/hp.js)
//   poisonHealDown            its Poison also inflicts Healing Down               (battle/status.js)
//   rootedDefPct / rootedRegenPctPerTick  +% Defense and regen while Rooted       (battle/damage.js, status.js)
//   alwaysCritPoisoned        always crit Poisoned targets                        (battle/damage.js)
//   seededDefeatTeamHealPct   a Seeded enemy falls: its side heals % of max Health (battle/status.js)
//   chargeStealPct            gains % of the Special charge it removes            (battle/charge.js)
//   tauntHealPct              heal % of max Health when it Taunts (once a tick)   (battle/status.js)
//   tauntedDmgReductionPct    takes % less from Taunted enemies                   (battle/hp.js)
//   shieldBreakBlastDefPct    its Shield breaks: % of its Defense to Nearby foes  (battle/tick.js)
//   dodgeAtkPct / ...MaxPct   +% Attack per Dodge, for the battle                 (battle/hp.js, damage.js)
//   defToAtkPct               Attack + % of its Defense                           (battle/damage.js)
//   stunImmuneDmgPct          +% from a Stun ability against a boss               (battle/hp.js)
//   startChargePct            Special charge % on its first turn                  (battle/tick.js)
//   auraEnemyDmgPct           enemies inside its Aura take +%                     (battle/hp.js)
//   chargeOverflowPct         charge past full carries into the next bar, capped  (battle/charge.js, tick.js)
//   stunTakenLessPct          Stuns on it are % shorter                           (battle/status.js)
//   hasteUpShareBeside        a Haste Up it gains reaches allies Beside it        (battle/status.js)
//   redirectChargePct         Special charge % per attack redirected onto it      (battle/hp.js)
//   pierceEvery / pierceEveryDmgPct  every Nth Basic attack Pierces, +%           (battle/tick.js, hp.js)
//   markedTargetDmgPct        +% to Marked targets                                (battle/hp.js)
//   shieldedTargetDmgPct / shieldDownOnHit  +% to Shielded targets; hits inflict
//                             Shielding Down                                      (battle/hp.js, status.js)
//   anyDefeatHealPct          heal % of max Health on every defeat                (battle/status.js)
//   blindDefDown              its Blind also inflicts Defense Down                (battle/status.js)
//   summonStatPct             its summons gain +% Health, Defense, Attack         (battle/tick.js)
//   defeatDebuffTransfer      a fallen enemy's debuffs move to the closest enemy  (battle/tick.js, status.js)
//   mirrorDebuffs             copies debuffs enemies inflict back onto them       (battle/status.js)
//   guaranteedCritDmgPct      +% on guaranteed crits                              (battle/damage.js)
//   overhealGrantPct          +% Overheal from its heals                          (battle/hp.js)
//   auraAllyRegenPctPerTick   allies inside its Aura regen % of max Health        (battle/tick.js)
//   critBesideAtkUpPct        a crit gives allies Beside it Attack Up             (battle/status.js)
//   startTeamAtkDefPct        Attack Up and Defense Up for its side, first turn   (battle/tick.js)
//   shieldBreakHealPct        a Shield on its side breaks: heal its weakest ally  (battle/status.js)
//   auraDebuffImmunity        allies inside its Aura resist every debuff          (battle/applier.js)
//   killAtkPct / ...MaxPct    +% Attack per enemy it defeats, for the battle      (battle/hp.js, damage.js)
//   firstAbilityDmgPct        +% on the first ability it uses                     (battle/hp.js, tick.js)
//   lowHpSpdHastePct / ...BelowPct  +% Speed and Haste below that % Health        (battle/damage.js, tick.js)
//   critLowHpDmgPct / ...BelowPct   +% on crits vs targets below that % Health    (battle/hp.js)
//   dmgDealtPct / dmgTakenPct +% damage dealt / taken                             (battle/hp.js)
//   killBasicAgain            on a defeat, use its Basic on a random Closest foe  (battle/tick.js)
//   overkillCarry             a killing blow's excess hits a random Closest foe   (battle/tick.js)
// (Flat "Gain X% more STAT" effects -- Sigils, "Haste +X%" -- use `statBonus`
// instead, applied to the creature's stats before battle by core/stats.js.)
//   Per Basic ATTACK (a whole swing, however many hits) -- settleBasicAttack in battle/tick.js:
//   extraHitEvery             1 extra hit every Nth attack
//   chainTargets              Chain to N enemies beside the target
//   splashEvery /
//   splashLessPct             every Nth attack Splashes for that % less damage
//   stealBuffEvery            steal a buff every Nth attack
// A new effect = a new key here + the one engine line that reads it.

/**
 * `color` must stay a SIX-digit hex. Card and slot borders across the app build
 * a translucent tint by appending an alpha pair to it ("#7F77DD" + "44"), and a
 * three-digit value silently produces an invalid five-digit colour -- the
 * browser drops the whole border declaration and the card falls back to the
 * default hairline, tint gone with no error anywhere.
 */
export const EQUIP_RARITY_CONFIG={
  common:   {label:"Common",    color:"#888888", bg:"#f0f0f0"},
  rare:     {label:"Rare",      color:"#378ADD", bg:"#ddeeff"},
  epic:     {label:"Epic",      color:"#7F77DD", bg:"#EEEDFE"},
  legendary:{label:"Legendary", color:"#d97706", bg:"#fef3c7"},
};
export const EQUIPMENT_DEFS=[
  // Common (base 5 per stat -- two-stat items nerfed to ~0.6x so their combined
  // total stays in line with same-rarity single-stat items)
  {id:"com_hp_atk",  name:"Iron Band",        emoji:"⚔️",  rarity:"common",    stats:{hp:5,crit:8}},
  {id:"com_hp_atk2", name:"Leather Vambrace", emoji:"🧤",  rarity:"common",    stats:{hp:5,critDmg:8}},
  {id:"com_hp_atk3", name:"Boarhide Wrap",    emoji:"🐗",  rarity:"common",    stats:{atk:5,crit:8}},
  {id:"com_hp_def",  name:"Stone Brace",      emoji:"🪨",  rarity:"common",    stats:{def:5,crit:8}},
  {id:"com_hp_def2", name:"Wooden Buckler",   emoji:"🪵",  rarity:"common",    stats:{def:5,critDmg:8}},
  {id:"com_hp_def3", name:"Bone Guard",       emoji:"🦴",  rarity:"common",    stats:{hp:5,  def:5}},
  {id:"com_atk_def", name:"Iron Knuckles",    emoji:"🥊",  rarity:"common",    stats:{atk:5,critDmg:8}},
  {id:"com_atk_def2",name:"Bronze Spikes",    emoji:"📌",  rarity:"common",    stats:{atk:5, def:5}},
  {id:"com_atk_def3",name:"Rawhide Wraps",    emoji:"🥋",  rarity:"common",    stats:{atk:5, def:5}},
  // Rare (base 7 per stat)
  {id:"rar_hp_atk",  name:"Silver Armlet",    emoji:"⚔️",  rarity:"rare",      stats:{hp:7,crit:14}},
  {id:"rar_hp_atk2", name:"Falcon Bracer",    emoji:"🦅",  rarity:"rare",      stats:{hp:7,critDmg:14}},
  {id:"rar_hp_def",  name:"Guardian Crest",   emoji:"🛡️",  rarity:"rare",      stats:{def:7,crit:14}},
  {id:"rar_hp_def2", name:"Tortoise Shell",   emoji:"🐢",  rarity:"rare",      stats:{def:7,critDmg:14}},
  {id:"rar_atk_def", name:"War Gauntlet",     emoji:"🥊",  rarity:"rare",      stats:{atk:7,crit:14}},
  {id:"rar_atk_def2",name:"Wolf Fang Claw",   emoji:"🐺",  rarity:"rare",      stats:{atk:7,critDmg:14}},
  // Stat Sigils — Rare single-stat (base 18), +10% that stat
  {id:"sig_hp",  name:"Life Sigil",   emoji:"❤️", rarity:"rare", stats:{hp:18},           effect:"Gain 10% more Health",    statBonus:{stat:"hp",  pct:10}},
  {id:"sig_atk", name:"Fury Sigil",   emoji:"⚔️", rarity:"rare", stats:{atk:18},          effect:"Gain 10% more Attack",   statBonus:{stat:"atk", pct:10}},
  {id:"sig_def", name:"Iron Sigil",   emoji:"🛡️", rarity:"rare", stats:{def:18},          effect:"Gain 10% more Defense",   statBonus:{stat:"def", pct:10}},
  // Rare effect items. Stats sit below plain rares (two-stat 5/6 vs 7/7,
  // single-stat 13 vs the Sigils' 18) to pay for the effect, mirroring how
  // Epic type-exclusives are costed vs plain Epics. Effects are deliberately
  // the weakest rung of each effect family -- the Epic/Legendary versions of
  // the same idea should always read as clear upgrades.
  // Rare type-exclusives (2 per element)
  // "Haste +X%" items grant X% of the creature's base Haste through
  // `statBonus` -- the same percent-of-base path as the Sigils, shown on the
  // creature page and rounded by the shared rule in core/stats.js.
  {id:"rar_typ_fire_atk",    name:"Kindled Charm",   emoji:"🔥", rarity:"rare", element:"Fire",    stats:{atk:13},       effect:"Haste +5%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:5}},
  // 0.2% of max Health per tick = 0.4% per second.
  {id:"rar_typ_water_hp",    name:"Dewdrop Charm",   emoji:"💧", rarity:"rare", element:"Water",   stats:{hp:13},        effect:"Gain a small Heal Over Time that lasts forever (0.4% of Max Health per second)", battle:{regenPctPerTick:0.2}},
  {id:"rar_typ_water_hp_def",name:"Coral Band",      emoji:"🪸", rarity:"rare", element:"Water",   stats:{hp:6,def:5},   effect:"Haste +5%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:5}},
  {id:"rar_typ_nat_def_atk", name:"Thorn Ring",      emoji:"🌵", rarity:"rare", element:"Nature",  stats:{def:6,atk:5},  effect:"Haste +5%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:5}},
  {id:"rar_typ_ear_def",     name:"Pebble Talisman", emoji:"🪨", rarity:"rare", element:"Earth",   stats:{def:13},       effect:"Haste +10%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:10}},
  {id:"rar_typ_ear_hp_def",  name:"Clay Bangle",     emoji:"🏺", rarity:"rare", element:"Earth",   stats:{hp:5,def:6},   effect:"Damaging abilities have a 10% chance to Slow", battle:{slowOnHitChancePct:10}},
  {id:"rar_typ_wind_atk",    name:"Breeze Feather",  emoji:"🪶", rarity:"rare", element:"Wind",    stats:{atk:13},       effect:"Temporarily gain 10% Attack and Speed after moving", speedEffect:true, battle:{moveAtkSpdPct:10}},
  {id:"rar_typ_wind_hp_atk", name:"Zephyr Knot",     emoji:"💨", rarity:"rare", element:"Wind",    stats:{hp:5,atk:6},   effect:"Haste +10%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:10}},
  {id:"rar_typ_elec_def",    name:"Capacitor Charm", emoji:"🔋", rarity:"rare", element:"Electric",stats:{def:13},       effect:"10% chance to inflict Expose whenever this creature is damaged by an enemy ability", battle:{exposeWhenHitChancePct:10}},
  {id:"rar_typ_elec_atk_def",name:"Copper Coil",     emoji:"🧲", rarity:"rare", element:"Electric",stats:{atk:5,def:6},  effect:"Haste +10%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:10}},
  {id:"rar_typ_light_hp",    name:"Sunbeam Locket",  emoji:"🌞", rarity:"rare", element:"Light",   stats:{hp:13},        effect:"Healing received is 10% stronger", battle:{healReceivedPct:10}},
  {id:"rar_typ_light_hp_def",name:"Glow Band",       emoji:"✨", rarity:"rare", element:"Light",   stats:{hp:6,def:5},   effect:"Haste +10%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:10}},
  {id:"rar_typ_dark_atk",    name:"Duskfang Charm",  emoji:"🦇", rarity:"rare", element:"Dark",    stats:{atk:13},       effect:"Haste +10%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:10}},
  {id:"rar_typ_dark_hp_atk", name:"Umbral Thread",   emoji:"🕸️", rarity:"rare", element:"Dark",    stats:{hp:6,atk:5},   effect:"Recover 3% Health whenever this creature inflicts a new debuff onto an enemy", battle:{newDebuffHealPct:3}},
  // Rare role-exclusives (2 per role)
  {id:"rar_role_atk_edge",   name:"Duelist's Edge",  emoji:"🗡️", rarity:"rare", role:"Attacker", stats:{atk:6,def:5},  effect:"Deal 10% more damage to the enemy that last damaged this creature", battle:{vsLastAttackerDmgPct:10}},
  {id:"rar_role_atk_hunter", name:"Hunter's Mark",   emoji:"🎯", rarity:"rare", role:"Attacker", stats:{atk:13},       effect:"Deal 10% more damage to enemies below 50% Health", battle:{lowHpTargetDmgPct:10, lowHpTargetBelowPct:50}},
  {id:"rar_role_tank_plate", name:"Squire's Plate",  emoji:"🛡️", rarity:"rare", role:"Tank",     stats:{hp:6,def:5},   effect:"Gain 3% Defense for each debuff on this creature", battle:{defPerDebuffPct:3}},
  {id:"rar_role_tank_grit",  name:"Grit Band",       emoji:"💪", rarity:"rare", role:"Tank",     stats:{def:13},       effect:"Deal 0.5% more damage for each 1% of missing Health (up to 50%)", battle:{missingHpDmgRatio:0.5}},
  {id:"rar_role_sup_charm",  name:"Mender's Charm",  emoji:"💚", rarity:"rare", role:"Support",  stats:{hp:13},        effect:"Healing received and done is 10% stronger", battle:{healDonePct:10, healReceivedPct:10}},
  {id:"rar_role_sup_bell",   name:"Chorus Bell",     emoji:"🔔", rarity:"rare", role:"Support",  stats:{hp:5,def:6},   effect:"Beside allies receive 5% less damage", battle:{besideAllyDmgReductionPct:5}},
  // Rare range-exclusives (2 per attack type)
  {id:"rar_rng_melee_grip",   name:"Brawler's Grip",   emoji:"🤜", rarity:"rare", attackType:"Melee",  stats:{hp:6,atk:5},  effect:"Gain 10% Lifesteal on Melee abilities", battle:{meleeLifestealPct:10}},
  {id:"rar_rng_melee_greaves",name:"Charger's Greaves",emoji:"🥾", rarity:"rare", attackType:"Melee",  stats:{def:5,atk:6}, effect:"After moving, this creature's next Basic attack deals 15% more damage", battle:{afterMoveAttackDmgPct:15}},
  {id:"rar_rng_ranged_scope", name:"Keen Scope",       emoji:"🔭", rarity:"rare", attackType:"Ranged", stats:{atk:13},      effect:"Range +1", battle:{rangeBonus:1}},
  {id:"rar_rng_ranged_quiver",name:"Light Quiver",     emoji:"🏹", rarity:"rare", attackType:"Ranged", stats:{hp:5,atk:6},  effect:"+10% Speed", speedEffect:true, statBonus:{stat:"spd", pct:10}},
  // Rare general effect items (equippable by anyone)
  {id:"rar_gen_atk_focus",   name:"Focus Band",      emoji:"🧿", rarity:"rare", stats:{atk:13},       effect:"Every 5th Basic attack deals 20% bonus damage", battle:{focusEvery:5, focusDmgPct:20}},
  {id:"rar_gen_hp_atk_leech",name:"Leech Ring",      emoji:"🪱", rarity:"rare", stats:{hp:5,atk:6},   effect:"Gain 5% Lifesteal", battle:{lifestealPct:5}},
  {id:"rar_gen_hp_def_cloak",name:"Traveler's Cloak",emoji:"🧣", rarity:"rare", stats:{hp:6,def:5},   effect:"Receive 20% less damage while at full Health", battle:{fullHpDmgReductionPct:20}},
  // +20% of the creature's base Critical Chance (percent-of-base, like "Haste +X%").
  {id:"rar_gen_hp_coin",     name:"Lucky Coin",      emoji:"🪙", rarity:"rare", stats:{atk:13},       effect:"+20% Critical Chance", statBonus:{stat:"crit", pct:20}},
  {id:"rar_gen_def_sentry",  name:"Sentry Emblem",   emoji:"🗿", rarity:"rare", stats:{def:13},       effect:"Receive 10% less damage from Ranged enemies", battle:{rangedDmgReductionPct:10}},
  {id:"rar_gen_def_anchor",  name:"Anchor Charm",    emoji:"⚓", rarity:"rare", stats:{hp:6,def:5},   effect:"Can not be moved by enemies", battle:{unmovable:true}},
  {id:"rar_gen_atk_def_haste",name:"Runner's Band",  emoji:"🏃", rarity:"rare", stats:{atk:5,def:5},  effect:"Temporarily gain 10% Haste after moving", hasteEffect:true, battle:{moveHastePct:10}},
  // Rare battle-effect gear (see BATTLE EFFECTS at the top of this file). Same
  // costing as the other Rare effect items: 5/6 two-stat, 13 single-stat, and
  // a crit stat at 8 in place of a 6. Epic rungs of these families are below.
  {id:"rar_gen_atk_def_tar",  name:"Tar Droplet",    emoji:"🍯", rarity:"rare", stats:{def:6,atk:5},  effect:"Debuffs this creature applies last longer",  battle:{debuffTicks:1}},
  {id:"rar_gen_hp_def_amber", name:"Amber Bead",     emoji:"🔶", rarity:"rare", stats:{hp:6,def:5},   effect:"Buffs this creature applies last longer",    battle:{buffTicks:1}},
  {id:"rar_gen_hp_atk_wax",   name:"Wax Cell",       emoji:"🐝", rarity:"rare", stats:{hp:6,atk:5},   effect:"Healing past Max Health becomes a Shield (up to 5% of Max Health, stacking)",  battle:{overhealLayerPct:5}},
  {id:"rar_gen_atk_crit_chirp",name:"Cricket Chirp", emoji:"🦗", rarity:"rare", stats:{atk:5,crit:8},  effect:"Gain 2% Special charge whenever a Basic ability critically hits",  battle:{basicCritChargePct:2}},
  {id:"rar_gen_hp_molt",      name:"Molted Skin",    emoji:"🐍", rarity:"rare", stats:{hp:13},        effect:"Immune to the first debuff inflicted",  battle:{debuffImmunity:1}},
  {id:"rar_gen_atk_cdmg_hydra",name:"Hydra Tooth",   emoji:"🐉", rarity:"rare", stats:{atk:5,critDmg:8}, effect:"Multi-hit abilities deal 10% more damage",  battle:{multiHitDmgPct:10}},
  // Formerly a Legendary (id kept for saves). Gained on the wearer's first
  // turn of each battle; lasts until broken.
  {id:"eff_hp_def_barrier",   name:"Crest of Conquest",emoji:"🏰", rarity:"rare", stats:{hp:6,def:5},   effect:"At the start of battle, gain a Shield (stacking) equal to 10% of Max Health", battle:{startStackShieldPct:10}},
  // Epic (base 11 per stat)
  {id:"epi_hp_atk",  name:"Warlord's Seal",   emoji:"🔥",  rarity:"epic",      stats:{hp:11,crit:21}},
  {id:"epi_hp_def",  name:"Citadel Core",     emoji:"🏰",  rarity:"epic",      stats:{hp:11,critDmg:21}},
  {id:"epi_atk_def", name:"Infernal Glove",   emoji:"🌋",  rarity:"epic",      stats:{atk:11,crit:21}},
  // Stat Crests — Epic single-stat (base 25), +15% that stat
  {id:"cre_hp",  name:"Life Crest",   emoji:"❤️", rarity:"epic",      stats:{hp:25},           effect:"Gain 15% more Health",    statBonus:{stat:"hp",          pct:15}},
  {id:"cre_atk", name:"Fury Crest",   emoji:"⚔️", rarity:"epic",      stats:{atk:25},          effect:"Gain 15% more Attack",   statBonus:{stat:"atk",         pct:15}},
  {id:"cre_def", name:"Iron Crest",   emoji:"🛡️", rarity:"epic",      stats:{def:25},          effect:"Gain 15% more Defense",   statBonus:{stat:"def",         pct:15}},
  // Element Epic items — HP+DEF base 11, element resistance
  // Element wards: universal (anyone can wear them). "X moves" are the
  // abilities of X-type creatures, the matching boss included.
  {id:"res_fire",   name:"Cinder Ward",    emoji:"🛡️", rarity:"epic", stats:{def:11,crit:21}, effect:"Receive 20% less damage from Fire enemies",   battle:{resistFirePct:20}},
  {id:"res_water",  name:"Tide Guard",     emoji:"🌊", rarity:"epic", stats:{def:11,critDmg:21}, effect:"Receive 20% less damage from Water enemies",  battle:{resistWaterPct:20}},
  {id:"res_nature", name:"Bark Shield",    emoji:"🌿", rarity:"epic", stats:{hp:11,def:11}, effect:"Receive 20% less damage from Nature enemies", battle:{resistNaturePct:20}},
  {id:"res_earth",  name:"Stone Bulwark",  emoji:"⛰️", rarity:"epic", stats:{hp:11,def:11}, effect:"Receive 20% less damage from Earth enemies",  battle:{resistEarthPct:20}},
  {id:"res_wind",   name:"Gale Barrier",   emoji:"🌪️", rarity:"epic", stats:{hp:11,def:11}, effect:"Receive 20% less damage from Wind enemies",   battle:{resistWindPct:20}},
  {id:"res_dark",   name:"Shadow Veil",    emoji:"🌑", rarity:"epic", stats:{hp:11,def:11}, effect:"Receive 20% less damage from Dark enemies",   battle:{resistDarkPct:20}},
  {id:"res_light",  name:"Radiant Aegis",  emoji:"☀️", rarity:"epic", stats:{hp:11,def:11}, effect:"Receive 20% less damage from Light enemies",  battle:{resistLightPct:20}},
  // Type-specific Epic items (non-Speed/Haste survivors)
  {id:"typ_fire_hp_atk",   name:"Scorchmantle",      emoji:"🧥", rarity:"epic", element:"Fire",    stats:{atk:8,critDmg:21},           effect:"Deal 5% more damage for each stack of Burn on an enemy", battle:{perBurnStackDmgPct:5}},
  {id:"typ_water_hp_def",  name:"Tideweave Wrap",    emoji:"🌊", rarity:"epic", element:"Water",   stats:{hp:9,def:8},           effect:"Recover 4% Health whenever a Special ability damages an enemy", battle:{specialHitHealPct:4}},
  {id:"typ_water_atk_def", name:"Brineplate",        emoji:"🪸", rarity:"epic", element:"Water",   stats:{atk:8,def:9},          effect:"Moves that Displace enemies have a 20% reduced cooldown", battle:{displaceCooldownPct:20}},
  // 15% of this creature's Defense, as effect damage to whoever hit it.
  {id:"typ_nat_hp_def",    name:"Thornback Vest",    emoji:"🌿", rarity:"epic", element:"Nature",  stats:{hp:8,def:9},           effect:"Whenever this creature is damaged, deal damage based off of this creature's Defense", battle:{thornsDefPct:15}},
  // A Shield of 20% of this creature's Defense, standard duration.
  {id:"typ_ear_hp_def",    name:"Bedrock Slab",      emoji:"🪨", rarity:"epic", element:"Earth",   stats:{def:19},               effect:"Gain a Shield based off of this creature's Defense whenever a new debuff is inflicted onto this creature", battle:{newDebuffShieldDefPct:20}},
  {id:"typ_ear_atk_def",   name:"Quake Brand",       emoji:"💥", rarity:"epic", element:"Earth",   stats:{atk:8,def:9},          effect:"Every 4th Basic attack also affects Beside enemies", battle:{adjacentEvery:4}},
  // The discharge is this creature's Basic damage, to each Nearby enemy.
  {id:"typ_elec_def_atk",  name:"Capacitor Plate",   emoji:"🔌", rarity:"epic", element:"Electric",stats:{def:8,atk:9},          effect:"Every 3rd hit taken, deal damage to all Nearby enemies", battle:{dischargeEvery:3}},
  {id:"typ_elec_hp_def",   name:"Stormshell Mantle", emoji:"🌩️", rarity:"epic", element:"Electric",stats:{hp:8,def:8},           effect:"Deal 30% more damage to Shields", battle:{shieldDmgPct:30}},
  {id:"typ_light_hp_def",  name:"Radiant Shroud",    emoji:"🛡️", rarity:"epic", element:"Light",   stats:{hp:8,def:8},           effect:"Whenever this creature heals an ally, dispel 1 debuff", battle:{healDispelDebuffs:1}},
  {id:"typ_dark_hp_atk",   name:"Voidthread Cloak",  emoji:"🕷️", rarity:"epic", element:"Dark",    stats:{hp:8,atk:8},           effect:"Recover 5% Health whenever this creature inflicts a new debuff onto an enemy", battle:{newDebuffHealPct:5}},
  {id:"typ_wind_atk_def",  name:"Galeforce Band",    emoji:"💨", rarity:"epic", element:"Wind",    stats:{atk:8,crit:14},        effect:"Gain 3% Speed whenever this creature uses a Special ability, for the rest of the battle (max 30%)", speedEffect:true, battle:{specialSpdPct:3, specialSpdMaxPct:30}},
  {id:"typ_wind_hp_atk",   name:"Slipstream Blade",  emoji:"🌬️", rarity:"epic", element:"Wind",    stats:{hp:8,atk:9},           effect:"Deal 20% increased damage to Slowed or Stunned enemies", battle:{vsSlowStunDmgPct:20}},
  {id:"typ_wind_hp_def",   name:"Featherweight Wrap",emoji:"🪶", rarity:"epic", element:"Wind",    stats:{atk:9,def:8},          effect:"Dodge every 6th hit taken", battle:{dodgeEvery:6}},
  {id:"typ_wind_def_atk",  name:"Cyclone Guard",     emoji:"🌀", rarity:"epic", element:"Wind",    stats:{def:8,atk:8},          effect:"Whenever this creature is damaged by an enemy ability, temporarily gain 10% Haste", hasteEffect:true, battle:{struckHastePct:10}},
  {id:"typ_wind_hp_atk2",  name:"Jetstream Sigil",   emoji:"⚡", rarity:"epic", element:"Wind",    stats:{hp:8,atk:8},           effect:"Gain 3% Attack whenever this creature uses a Special ability, for the rest of the battle (max 30%)", battle:{specialAtkPct:3, specialAtkMaxPct:30}},
  // Epic effect items, second wave. Same costing as the type-exclusive Epics
  // above (two-stat 8/9 vs plain 11/11; single-stat 19 vs the Crests' 25).
  // Each effect is the middle rung of its family: stronger than the Rare
  // version, clearly weaker than the Legendary one.
  // Epic type-exclusives (1 per element)
  // Formerly a Rare (id kept for saves); Epic single-stat budget.
  {id:"rar_typ_nat_hp",      name:"Sprout Locket",    emoji:"🌱", rarity:"epic", element:"Nature",  stats:{hp:19},        effect:"Inflict Seeded on the first enemy damaged by this creature. Only 1 creature can be Seeded by this equipment at any time", battle:{seedDrainPct:0.5, seedHealPct:0.5}},
  // Hazard potency: +25% to the hazards this creature lays -- a Fire
  // Hazard's damage, a Water Hazard's damage and its Haste Down.
  {id:"epi_typ_fire_atk",    name:"Flarebrand Ring",  emoji:"🔥", rarity:"epic", element:"Fire",    stats:{atk:19},       effect:"Fire Hazards are more potent", battle:{fireHazardPct:25}},
  {id:"epi_typ_water_hp",    name:"Springwell Ring",  emoji:"⛲", rarity:"epic", element:"Water",   stats:{atk:19},       effect:"Water Hazards are more potent", battle:{waterHazardPct:25}},
  {id:"epi_typ_nat_hp_def",  name:"Verdant Weave",    emoji:"🌿", rarity:"epic", element:"Nature",  stats:{hp:9,def:8},   effect:"Seeded effects are 50% stronger", battle:{seedPotencyPct:50}},
  {id:"epi_typ_ear_def",     name:"Basalt Ward",      emoji:"⛰️", rarity:"epic", element:"Earth",   stats:{def:19},       effect:"Receive 5% less damage", battle:{allDmgReductionPct:5}},
  {id:"epi_typ_wind_atk_def",name:"Tailwind Talon",   emoji:"🌬️", rarity:"epic", element:"Wind",    stats:{atk:9,def:8},  effect:"Gain 1% Attack for each 0.1 Speed on this creature", battle:{atkPerTenthSpdPct:1}},
  // "Briefly" = 2 ticks (1 second).
  {id:"epi_typ_elec_atk",    name:"Voltaic Fang",     emoji:"⚡", rarity:"epic", element:"Electric",stats:{atk:19},       effect:"Every 10th Basic attack briefly Stuns", battle:{stunEvery:10, stunEveryTicks:2}},
  // A +10% Attack Up and a +10 Critical Damage Up, standard duration.
  {id:"epi_typ_light_hp",    name:"Dawnlight Halo",   emoji:"😇", rarity:"epic", element:"Light",   stats:{hp:19},        effect:"Gain Attack Up and Critical Damage Up whenever this creature is healed", battle:{healedBuffPct:10}},
  {id:"epi_typ_dark_hp_atk", name:"Gloomreaper Chain",emoji:"⛓️", rarity:"epic", element:"Dark",    stats:{critDmg:14,atk:9}, effect:"Execute enemies below 15% Health", battle:{executeBelowPct:15}},
  // Epic role-exclusives (1 per role)
  {id:"epi_role_atk_slayer", name:"Slayer's Band",    emoji:"⚔️", rarity:"epic", role:"Attacker", stats:{atk:9,hp:8},   effect:"Attacks against enemies below 40% Health always critically hit", battle:{alwaysCritBelowPct:40}},
  // Granted on the wearer's first turn of each battle.
  {id:"epi_role_tank_bastion",name:"Bastion Plate",   emoji:"🛡️", rarity:"epic", role:"Tank",     stats:{hp:9,def:8},   effect:"Beside allies gain 2 stacks of Protect", battle:{startProtectAdjacent:2}},
  {id:"epi_role_sup_cantor", name:"Cantor's Beads",   emoji:"📿", rarity:"epic", role:"Support",  stats:{hp:19},        effect:"This creature's Healing and Buffs affect 1 additional ally", battle:{extraAllyTargets:1}},
  // Epic range-exclusives (Melee twins: one for damage, one for Defense)
  {id:"epi_rng_melee_vanguard",name:"Vanguard Gauntlet",emoji:"🥊", rarity:"epic", attackType:"Melee",  stats:{atk:8,def:9}, effect:"Deal 30% more damage when there is no allied creature Nearby", battle:{loneDmgPct:30}},
  {id:"epi_rng_melee_vanguard_def",name:"Vanguard Pauldron",emoji:"🦾", rarity:"epic", attackType:"Melee", stats:{hp:8,def:9}, effect:"Gain 30% Defense when there is no allied creature Nearby", battle:{loneDefPct:30}},
  {id:"epi_rng_ranged_lens",   name:"Longshot Lens",    emoji:"🔍", rarity:"epic", attackType:"Ranged", stats:{atk:19},      effect:"Deal 20% more damage when targeting Farthest enemies", battle:{farthestDmgPct:20}},
  // Epic general effect items (equippable by anyone)
  {id:"epi_gen_hp_atk_vamp", name:"Vampiric Band",    emoji:"🧛", rarity:"epic", stats:{hp:8,atk:9},   effect:"Lifesteal effects Overheal (max 20%)", battle:{lifestealOverhealPct:20}},
  {id:"epi_gen_atk_oath",    name:"Duelist's Oath",   emoji:"🤺", rarity:"epic", stats:{atk:8,crit:14}, effect:"Gain 20% Attack and Defense against the first targeted creature", battle:{duelPct:20}},
  {id:"epi_gen_hp_idol",     name:"Guardian Idol",    emoji:"🪬", rarity:"epic", stats:{hp:19},        effect:"Receive 30% less damage when receiving damage from Protect", battle:{protectDmgReductionPct:30}},
  {id:"epi_gen_def_bulwark", name:"Bulwark Sigil",    emoji:"🏛️", rarity:"epic", stats:{def:19},       effect:"Every 5th hit taken, receive 50% less damage", battle:{reduceEveryNthHit:5, reduceEveryNthHitPct:50}},
  {id:"epi_gen_def_sentinel",name:"Sentinel Idol",    emoji:"🗿", rarity:"epic", stats:{def:19},       effect:"Receive 50% less damage from the first 3 instances of damage", battle:{firstHitsReduced:3, firstHitsReducedPct:50}},
  // Epic battle-effect gear (see BATTLE EFFECTS at the top of this file).
  // Costed like the Epic effect items above: 8/9 two-stat, a crit stat at 14.
  // Pearl Lacquer's `shieldPct` also feeds kits that scale off their own
  // Shield (Radiant Smite), since they read the Shield after raising it.
  {id:"epi_gen_hp_atk_silk",  name:"Spider Silk Spool",emoji:"🕸️", rarity:"epic", stats:{hp:8,atk:9},   effect:"Debuffs this creature applies last even longer", battle:{debuffTicks:2}},
  {id:"epi_gen_hp_def_cocoon",name:"Cocoon Wrap",      emoji:"🐛", rarity:"epic", stats:{hp:9,def:8},   effect:"Buffs this creature applies last even longer",   battle:{buffTicks:2}},
  {id:"epi_gen_hp_atk_honey",  name:"Honeycomb Flask", emoji:"🍯", rarity:"epic", stats:{hp:9,atk:8},   effect:"Healing past Max Health becomes a Shield (up to 10% of Max Health, stacking)", battle:{overhealLayerPct:10}},
  {id:"epi_gen_hp_crit_fork",  name:"Tuning Fork",     emoji:"🎐", rarity:"epic", stats:{hp:8,crit:14},  effect:"Gain 4% Special charge whenever a Basic ability critically hits", battle:{basicCritChargePct:4}},
  {id:"epi_gen_hp_def_lacquer",name:"Pearl Lacquer",   emoji:"🪞", rarity:"epic", stats:{hp:9,def:8},   effect:"Shields this creature grants are 20% stronger", battle:{shieldPct:20}},
  {id:"epi_gen_atk_cdmg_snare",name:"Hunter's Snare",  emoji:"🪤", rarity:"epic", stats:{atk:9,critDmg:14}, effect:"Deal 15% more damage to enemies that are Immobilized", battle:{immobilizedDmgPct:15}},
  {id:"epi_gen_hp_crit_antler",name:"Beacon Antler",   emoji:"🦌", rarity:"epic", stats:{hp:9,crit:14},  effect:"Aura +1 range", battle:{auraRange:1}},
  // "Briefly" = 2 ticks (1 second).
  // Formerly Legendaries (ids kept for saves).
  {id:"eff_atk_def_rampage",  name:"Warlord's Trophy", emoji:"🏆", rarity:"epic", stats:{atk:9,def:8},   effect:"Gain 5% Attack whenever an ally or enemy is defeated, for the rest of the battle (max 50%)", battle:{defeatAtkPct:5, defeatAtkMaxPct:50}},
  {id:"eff_def_hp_last",      name:"Last Stand Crown", emoji:"👑", rarity:"epic", stats:{hp:9,def:8},    effect:"While below 30% Health, increase Defense by 50%", battle:{lowHpDefPct:50, lowHpDefBelowPct:30}},
  {id:"eff_hp_atk_heal",      name:"Lifebinder Pendant",emoji:"💚", rarity:"epic", stats:{hp:9,atk:8},   effect:"Healing done is 30% stronger", battle:{healDonePct:30}},
  {id:"epi_gen_atk_crit_cicada",name:"Cicada Husk",    emoji:"🦗", rarity:"epic", stats:{atk:9,crit:14}, effect:"The first time this creature falls below 50% Health, briefly become Intangible", battle:{lowHpIntangibleTicks:2}},
  // Stat Relics — Legendary single-stat (base 35), +25% that stat
  {id:"rel_hp",  name:"Life Relic",   emoji:"❤️", rarity:"legendary", stats:{hp:35},           effect:"Gain 25% more Health",    statBonus:{stat:"hp",          pct:25}},
  {id:"rel_atk", name:"Fury Relic",   emoji:"⚔️", rarity:"legendary", stats:{atk:35},          effect:"Gain 25% more Attack",   statBonus:{stat:"atk",         pct:25}},
  {id:"rel_def", name:"Iron Relic",   emoji:"🛡️", rarity:"legendary", stats:{def:35},          effect:"Gain 25% more Defense",   statBonus:{stat:"def",         pct:25}},
  // Legendary (base 17 per stat)
  {id:"leg_hp_atk",  name:"Divine Colossus",  emoji:"👑",  rarity:"legendary", stats:{hp:17,crit:30}},
  {id:"leg_hp_def",  name:"Eternal Fortress", emoji:"🏯",  rarity:"legendary", stats:{def:17,critDmg:30}},
  {id:"leg_atk_def", name:"Dragon's Claw",    emoji:"🐉",  rarity:"legendary", stats:{atk:17,crit:30}},
  // Legendary effect items (base 17 per stat; a crit stat at 30). Their
  // battle effects are declared under `battle` (see BATTLE EFFECTS above).
  // Ids are kept from earlier versions of these items so saves carry over.
  {id:"eff_atk_hp_berserk",  name:"Berserk Core",        emoji:"🔴", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Special abilities are sealed. Gain 30% Speed and Basic attacks deal 30% more damage", speedEffect:true, battle:{sealSpecial:true, spdPct:30, basicDmgPct:30}},
  {id:"eff_atk_def_double",  name:"Twin Fang",           emoji:"🗡️", rarity:"legendary", stats:{atk:17,def:17},          effect:"Every 3rd Basic attack hits 1 additional time", battle:{extraHitEvery:3}},
  {id:"eff_hp_atk_shock",    name:"Shockwave Gauntlet",  emoji:"💥", rarity:"legendary", stats:{hp:17, critDmg:30},      effect:"Every 5th Basic attack Splashes, dealing 50% less damage", battle:{splashEvery:5, splashLessPct:50}},
  {id:"eff_atk_def_pierce",  name:"Arrowsplit",          emoji:"🏹", rarity:"legendary", stats:{hp:17, def:17},          effect:"Basic attacks Chain 1", battle:{chainTargets:1}},
  {id:"eff_def_atk_counter", name:"Thornback Plate",     emoji:"🌵", rarity:"legendary", stats:{crit:30,def:17},         effect:"Every 4th hit taken, Counter-attack", battle:{counterEvery:4}},
  // "Briefly" = 2 ticks (1 second).
  {id:"eff_hp_def_immune",   name:"Last Breath Core",    emoji:"💙", rarity:"legendary", stats:{hp:17, def:17},          effect:"Negate the next fatal instance of damage and briefly gain Immortal", battle:{cheatDeathImmortalTicks:2}},
  {id:"eff_atk_def_crit",    name:"Shattercrit Ring",    emoji:"💎", rarity:"legendary", stats:{hp:17, crit:30},         effect:"Critical hits reduce the enemy's Defense by 0.5% (stacking, max 25%)", battle:{critShredPct:0.5, critShredMaxPct:25}},
  {id:"eff_hp_def_revive",   name:"Phoenix Core",        emoji:"🔥", rarity:"legendary", stats:{atk:17, def:17},         effect:"Revive once per battle at 50% Health", battle:{reviveHpPct:50}},
  {id:"eff_atk_hp_lifesteal",name:"Bloodthirster",       emoji:"🩸", rarity:"legendary", stats:{crit:30, atk:17},        effect:"Gain 20% Lifesteal", battle:{lifestealPct:20}},
  // Legendary battle-effect gear (see BATTLE EFFECTS at the top of this file).
  // 17/17 two-stat, a crit stat at 30. The chalices put the whole 34-point
  // budget in Health; their extra stack is the one exception to a stat mod's
  // "one stack per source" rule, and non-stacking effects are untouched.
  {id:"eff_hp_wyrmblood",    name:"Wyrmblood Chalice",   emoji:"🍷", rarity:"legendary", stats:{hp:34},                  effect:"Stackable debuffs are extra effective", battle:{extraDebuffStack:true}},
  {id:"eff_hp_ambrosia",     name:"Ambrosia Chalice",    emoji:"🥂", rarity:"legendary", stats:{hp:34},                  effect:"Stackable buffs are extra effective",   battle:{extraBuffStack:true}},
  {id:"eff_hp_atk_magpie",   name:"Magpie Brooch",       emoji:"🐦‍⬛", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Every 5th Basic attack steals 1 buff", battle:{stealBuffEvery:5}},
  {id:"eff_hp_crit_echo",    name:"Echo Conch",          emoji:"🐚", rarity:"legendary", stats:{hp:17, crit:30},         effect:"This creature's Special ability is cast again at 50% effectiveness", battle:{echoSpecialPct:50}},
  {id:"eff_atk_cdmg_mantis", name:"Mantis Scythe",       emoji:"🪲", rarity:"legendary", stats:{atk:17,critDmg:30},      effect:"Gain 30% Special charge whenever this creature defeats an enemy", battle:{killChargePct:30}},
  // Additional user-specified legendaries
  {id:"eff_hp_atk_bleed",    name:"Sanguine Fang",       emoji:"🩸", rarity:"legendary", stats:{atk:17,hp:17},                                         effect:"Whenever this creature inflicts damage, also inflict Damage Over Time and Burn", battle:{hitDotBurn:true}},
  {id:"eff_def_atk_buffstk", name:"Warbuff Plate",       emoji:"📈", rarity:"legendary", stats:{critDmg:30,atk:17},                                    effect:"Gain 5% Attack for each buff on this creature", battle:{atkPerBuffPct:5}},
  // Dungeon-exclusive elemental legendaries
  // A stacking Shield of 10% of max Health per Special cast, standard duration.
  {id:"dng_water_hp_def",  name:"Seafoam Cloak",     emoji:"🧊", rarity:"legendary", stats:{hp:17, def:17},          element:"Water",    effect:"Whenever this creature uses a Special ability, gain a Shield (stacking) equal to 10% of Max Health", battle:{specialStackShieldPct:10}},
  // The push is 1 tile, straight away from the caster (see battle/displace.js).
  {id:"dng_water_hp_atk",  name:"Tidal Grip",        emoji:"🌊", rarity:"legendary", stats:{hp:17, atk:17},          element:"Water",    effect:"Damaging Special abilities Push enemies back. Impact damage is doubled and briefly Stuns", battle:{specialPush:true, impactMult:2, impactStunTicks:2}},
  // "Briefly" = 2 ticks (1 second), on every enemy that first Special hits.
  {id:"dng_earth_hp_def",  name:"Petrified Core",    emoji:"🪨", rarity:"legendary", stats:{hp:17, def:17},          element:"Earth",    effect:"The first Special ability used briefly Stuns enemies", battle:{firstSpecialStunTicks:2}},
  {id:"dng_earth_atk_def", name:"Tremor Edge",       emoji:"🌍", rarity:"legendary", stats:{atk:17,def:17},          element:"Earth",    effect:"Every 5th Basic attack hits in a Line", battle:{lineEvery:5}},
  {id:"dng_elec_atk_def",  name:"Chain Conductor",   emoji:"⚡", rarity:"legendary", stats:{atk:17,def:17},          element:"Electric", effect:"Basic attacks Chain 2", battle:{chainTargets:2}},
  {id:"dng_dark_hp_atk",   name:"Voidheart",         emoji:"🖤", rarity:"legendary", stats:{hp:17, atk:17},          element:"Dark",     effect:"Special abilities reduce the enemy's Max Health by 10% (excluding bosses) for the rest of the battle and this creature gains 10% Max Health for the rest of the battle (max 100%)", battle:{specialMaxHpDrainPct:10, specialMaxHpGainPct:10, specialMaxHpGainMaxPct:100}},
  {id:"dng_dark_hp_def",   name:"Shadow Shroud",     emoji:"🌑", rarity:"legendary", stats:{hp:17, def:17},          element:"Dark",     effect:"After Teleporting, gain Dodge and the next damaging ability deals 50% extra damage", battle:{teleportDodge:true, teleportNextDmgPct:50}},
  {id:"dng_wind_hp_atk",   name:"Gust Anklets",      emoji:"💨", rarity:"legendary", stats:{hp:17, atk:17},          element:"Wind",     effect:"Basic abilities Pierce", battle:{basicPierce:true}},
  {id:"dng_wind_atk_def",  name:"Tempest Blade",     emoji:"🌬️", rarity:"legendary", stats:{atk:17,def:17},          element:"Wind",     effect:"Pierce abilities deal 20% more damage and leave a Wind Hazard", battle:{pierceDmgPct:20, pierceWindHazard:true}},
  {id:"dng_wind_hp_def",   name:"Cyclone Ring",      emoji:"🌪️", rarity:"legendary", stats:{crit:30, def:17},        element:"Wind",     effect:"Gain 5% Special charge whenever an enemy is Displaced", battle:{displacedEnemyChargePct:5}},
  {id:"dng_wind_atk_def2", name:"Sirocco Plate",     emoji:"🌫️", rarity:"legendary", stats:{atk:17,def:17},          element:"Wind",     effect:"+25% Speed", speedEffect:true, statBonus:{stat:"spd", pct:25}},
  // Role-exclusive: Attacker
  {id:"role_atk_rampage",    name:"Rampage Shard",       emoji:"💢", rarity:"legendary", role:"Attacker", stats:{atk:21,crit:23},         effect:"Gain 1% Attack whenever this creature damages the same enemy, for the rest of the battle (max 100%). Resets when damaging another creature", battle:{sameTargetAtkPct:1, sameTargetAtkMaxPct:100}},
  // `statBonus` may be a list: several percent-of-base stats on one item.
  {id:"role_atk_lifesteal",  name:"Hungering Edge",      emoji:"🩸", rarity:"legendary", role:"Attacker", stats:{atk:17,hp:17},           effect:"This creature can only be healed from Lifesteal. Gain 30% Lifesteal and 20% Max Health, Defense, Attack, Speed, and Haste", speedEffect:true, hasteEffect:true,
    statBonus:[{stat:"hp",pct:20},{stat:"def",pct:20},{stat:"atk",pct:20},{stat:"spd",pct:20},{stat:"abilitySpeed",pct:20}], battle:{lifestealOnlyHeal:true, lifestealPct:30}},
  // Role-exclusive: Tank
  {id:"role_tank_fortress",  name:"Ironwall Core",       emoji:"🏰", rarity:"legendary", role:"Tank", stats:{def:21,hp:13},           effect:"Receive 20% less damage", battle:{allDmgReductionPct:20}},
  // "Briefly" = 2 ticks (1 second); a boss whose body is Nearby is Taunted too.
  {id:"role_tank_taunt",     name:"Warlord's Insignia",  emoji:"📣", rarity:"legendary", role:"Tank", stats:{hp:21,def:13},           effect:"Whenever this creature uses a Special ability, briefly Taunt all Nearby enemies", battle:{specialTauntNearbyTicks:2}},
  // Gained on the wearer's first turn; lasts until broken (like Crest of Conquest).
  {id:"role_tank_barrier",   name:"Eternal Bulwark",     emoji:"🛡️", rarity:"legendary", role:"Tank", stats:{hp:17,def:17},           effect:"At the start of battle, gain a Shield (stacking) equal to 20% of Max Health", battle:{startStackShieldPct:20}},
  // The counter is its Basic damage plus 50% of its Defense.
  {id:"role_tank_counter",   name:"Rebuke Gauntlet",     emoji:"👊", rarity:"legendary", role:"Tank", stats:{def:17,critDmg:30},      effect:"Every 4th hit taken, Counter-attack, dealing 50% extra damage based off of Defense", battle:{counterEvery:4, counterBonusDefPct:50}},
  {id:"role_tank_guardian",  name:"Guardian's Oath",     emoji:"🤝", rarity:"legendary", role:"Tank", stats:{hp:17,def:17},           effect:"While above 30% Health, redirect 20% of the damage dealt to Nearby allies to this creature instead", battle:{shareNearbyDmgPct:20, shareAboveHpPct:30}},
  {id:"role_sup_bond",       name:"Twin Soul Crest",     emoji:"💞", rarity:"legendary", role:"Tank", stats:{hp:17,def:17},           effect:"The first time a creature falls below 30% Health, they recover Health equal to 20% of this creature's Max Health", battle:{rescueBelowPct:30, rescueHealPct:20}},
  // Role-exclusive: Support (non-Speed/Haste survivors)
  // A healing Special (the "heal" classification -- see battle/abilityTags.js)
  // charges 50% faster. Haste only drives the Special's charge.
  {id:"role_sup_amplify",    name:"Amplifier Prism",     emoji:"🔮", rarity:"legendary", role:"Support", stats:{hp:17,critDmg:30},           effect:"Healing abilities gain 50% Haste", hasteEffect:true, battle:{healingHastePct:50}},
  {id:"role_sup_haste",      name:"Swiftgrace Band",     emoji:"💨", rarity:"legendary", role:"Support", stats:{hp:17,def:17},           effect:"Whenever this creature heals an ally, they gain 0.5% Special charge", battle:{healedAllyChargePct:0.5}},
  {id:"role_sup_barrier",    name:"Sanctum Seal",        emoji:"✨", rarity:"legendary", role:"Support", stats:{hp:21,atk:13},           effect:"Whenever this creature uses a Special ability, the lowest current Health ally gains a Shield equal to 15% of this creature's Max Health", battle:{specialShieldLowestAllyPct:15}},
  {id:"role_sup_revive",     name:"Soul Lantern",        emoji:"🏮", rarity:"legendary", role:"Support", stats:{hp:21,atk:13},           effect:"Whenever an ally is defeated, Revive them with 30% Health (once per battle)", battle:{reviveAllyPct:30}},
  {id:"role_sup_cleanse",    name:"Purifier's Chalice",  emoji:"🌸", rarity:"legendary", role:"Support", stats:{hp:17,def:17},           effect:"Whenever this creature heals an ally, dispel all debuffs", battle:{healCleanseAll:true}},
  {id:"role_sup_aura",       name:"Blessing Mantle",     emoji:"🌟", rarity:"legendary", role:"Support", stats:{hp:21,atk:21,def:21},    effect:"All allies gain 10% of this creature's Health, Attack, and Defense while this creature is alive", battle:{shareStatsPct:10}},
  {id:"role_sup_overload",   name:"Overdrive Sigil",     emoji:"⚡", rarity:"legendary", stats:{atk:17,def:17},          effect:"Gain 20% Special charge whenever this creature uses a Special ability", battle:{specialRefundPct:20}},
  // "Temporarily" = the standard duration.
  {id:"role_sup_inspire",    name:"Warcry Pendant",      emoji:"📯", rarity:"legendary", stats:{atk:21,def:13},          effect:"At the start of battle, all allies temporarily gain 20% Haste and Speed", speedEffect:true, hasteEffect:true, battle:{startTeamHasteSpdPct:20}},

  // ── Third wave: type and Attacker exclusives (plus the universals that
  // came out of the same batch). Costed like the waves above: Rare 13 or 6/5
  // (a crit stat at 8), Epic 19 or 9/8 (a crit stat at 14), Legendary 35 or
  // 17/17 (a crit stat at 30). "Longer" on a single debuff = +2 ticks (+1 for
  // Stun, which is short); "briefly" = 2 ticks.
  // Fire
  {id:"rar_typ_fire_ember",      name:"Ember Chip",        emoji:"🔸", rarity:"rare",      element:"Fire",     stats:{atk:13},         effect:"Burn inflicted by this creature lasts longer", battle:{burnDurationTicks:2}},
  // 1% of max Health per Burn tick (2% per second), per Burning enemy.
  {id:"rar_typ_fire_ashen",      name:"Ashen Locket",      emoji:"⚱️", rarity:"rare",      element:"Fire",     stats:{hp:6,atk:5},     effect:"Recover 1% Health whenever a Burn inflicted by this creature deals damage", battle:{burnTickHealPct:1}},
  {id:"epi_typ_fire_kiln",       name:"Kiln Heart",        emoji:"🧱", rarity:"epic",      element:"Fire",     stats:{hp:9,def:8},     effect:"Whenever this creature is damaged by a Melee enemy, inflict Burn on them", battle:{meleeHitBurn:true}},
  {id:"epi_typ_fire_flashpoint", name:"Flashpoint Ring",   emoji:"💍", rarity:"epic",      element:"Fire",     stats:{atk:9,crit:14},  effect:"Deal 25% more damage to enemies standing on a Fire Hazard", battle:{fireHazardTargetDmgPct:25}},
  {id:"leg_typ_fire_everflame",  name:"Everflame Crown",   emoji:"👑", rarity:"legendary", element:"Fire",     stats:{atk:17,hp:17},   effect:"Burn inflicted by this creature can not be dispelled and deals 30% more damage", battle:{burnUndispellable:true, burnDmgPct:30}},
  {id:"leg_typ_fire_inferno",    name:"Inferno Heart",     emoji:"❤️‍🔥", rarity:"legendary", element:"Fire",     stats:{atk:35},         effect:"When this creature is defeated, deal damage equal to 100% of its Attack to all Nearby enemies", battle:{deathBlastAtkPct:100}},
  {id:"leg_typ_fire_wildfire",   name:"Wildfire Brand",    emoji:"🔥", rarity:"legendary", element:"Fire",     stats:{atk:17,def:17},  effect:"Whenever an enemy with Burn is defeated, all Nearby enemies are inflicted with Burn", battle:{burnDeathSpread:true}},
  // Water
  {id:"rar_typ_water_frost",     name:"Frost Pearl",       emoji:"🦪", rarity:"rare",      element:"Water",    stats:{atk:13},         effect:"Frostbite inflicted by this creature lasts longer", battle:{frostbiteDurationTicks:2}},
  {id:"rar_typ_water_rime",      name:"Rime Shard",        emoji:"❄️", rarity:"rare",      element:"Water",    stats:{atk:5,crit:8},   effect:"Deal 10% more damage to enemies with Frostbite", battle:{frostbiteTargetDmgPct:10}},
  {id:"epi_typ_water_undertow",  name:"Undertow Anchor",   emoji:"⚓", rarity:"epic",      element:"Water",    stats:{hp:9,atk:8},     effect:"Every 5th Basic attack Pulls the target 1 tile toward this creature", battle:{pullEvery:5}},
  {id:"epi_typ_water_tidecaller",name:"Tidecaller Shell",  emoji:"🐚", rarity:"epic",      element:"Water",    stats:{atk:9,crit:14},  effect:"Splash abilities deal 20% more damage", battle:{splashDmgPct:20}},
  {id:"leg_typ_water_zero",      name:"Absolute Zero",     emoji:"🥶", rarity:"legendary", element:"Water",    stats:{atk:17,crit:30}, effect:"Whenever an enemy reaches max Frostbite stacks, consume them all and briefly Stun that enemy", battle:{frostbiteShatterStunTicks:2}},
  {id:"leg_typ_water_maelstrom", name:"Maelstrom Core",    emoji:"🌀", rarity:"legendary", element:"Water",    stats:{hp:17,atk:17},   effect:"Enemies on a Water Hazard have -20% Defense", battle:{waterHazardDefShredPct:20}},
  {id:"leg_typ_water_leviathan", name:"Leviathan Scale",   emoji:"🐋", rarity:"legendary", element:"Water",    stats:{hp:17,def:17},   effect:"Whenever this creature dispels a debuff, gain a Shield (stacking, max 10%) equal to 2% of Max Health", battle:{dispelShieldPct:2, dispelShieldMaxPct:10}},
  // Nature
  {id:"rar_typ_nat_nettle",      name:"Nettle Pin",        emoji:"📌", rarity:"rare",      element:"Nature",   stats:{atk:13},         effect:"Poison inflicted by this creature lasts longer", battle:{poisonDurationTicks:2}},
  {id:"epi_typ_nat_strangler",   name:"Strangler Vine",    emoji:"🪢", rarity:"epic",      element:"Nature",   stats:{atk:9,def:8},    effect:"Deal 15% more damage to enemies Restrained by this creature", battle:{restrainedTargetDmgPct:15}},
  // 0.5% of max Health per tick (1% per second) while Rooted.
  {id:"epi_typ_nat_rootbound",   name:"Rootbound Idol",    emoji:"🪵", rarity:"epic",      element:"Nature",   stats:{def:19},         effect:"While Rooted, gain 30% Defense and Heal Over Time", battle:{rootedDefPct:30, rootedRegenPctPerTick:0.5}},
  {id:"epi_typ_nat_worldtree",   name:"Worldtree Seed",    emoji:"🌳", rarity:"epic",      element:"Nature",   stats:{hp:9,def:8},     effect:"Whenever a Seeded enemy is defeated, all allies recover Health equal to 10% of their Max Health", battle:{seededDefeatTeamHealPct:10}},
  {id:"leg_typ_nat_pollen",      name:"Pollen Pouch",      emoji:"🌼", rarity:"legendary", element:"Nature",   stats:{hp:17,atk:17},   effect:"Whenever this creature inflicts Poison, also inflict Healing Down", battle:{poisonHealDown:true}},
  {id:"leg_typ_nat_toxin",       name:"Toxin Gland",       emoji:"🐸", rarity:"legendary", element:"Nature",   stats:{atk:17,critDmg:30}, effect:"Attacks against Poisoned creatures always critically hit", battle:{alwaysCritPoisoned:true}},
  // Earth
  {id:"rar_typ_ear_sandstone",   name:"Sandstone Charm",   emoji:"🟫", rarity:"rare",      element:"Earth",    stats:{def:13},         effect:"Stuns inflicted by this creature last longer", battle:{stunDurationTicks:1}},
  {id:"epi_typ_ear_monolith",    name:"Monolith Shard",    emoji:"🗿", rarity:"epic",      element:"Earth",    stats:{def:9,hp:8},     effect:"Receive 10% less damage from Taunted enemies", battle:{tauntedDmgReductionPct:10}},
  // 30% of this creature's Defense, as effect damage to each.
  {id:"leg_typ_ear_geode",       name:"Geode Heart",       emoji:"💠", rarity:"legendary", element:"Earth",    stats:{def:17,crit:30}, effect:"Whenever this creature's Shield breaks, deal damage based off of its Defense to all Nearby enemies", battle:{shieldBreakBlastDefPct:30}},
  {id:"leg_typ_ear_keystone",    name:"Titan's Keystone",  emoji:"🏛️", rarity:"legendary", element:"Earth",    stats:{def:35},         effect:"Gain Attack equal to 30% of this creature's Defense", battle:{defToAtkPct:30}},
  {id:"leg_typ_ear_seismic",     name:"Seismic Heart",     emoji:"🌋", rarity:"legendary", element:"Earth",    stats:{hp:17,def:17},   effect:"When using an ability that Stuns against an enemy that can not be Stunned, it deals 100% more damage", battle:{stunImmuneDmgPct:100}},
  // Electric
  {id:"rar_typ_elec_static",     name:"Static Pin",        emoji:"📍", rarity:"rare",      element:"Electric", stats:{atk:13},         effect:"Chain abilities deal 10% more damage", battle:{chainDmgPct:10}},
  {id:"epi_typ_elec_tesla",      name:"Tesla Coil",        emoji:"🗼", rarity:"epic",      element:"Electric", stats:{atk:9,hp:8},     effect:"Enemies inside this creature's Auras receive 10% more damage", battle:{auraEnemyDmgPct:10}},
  {id:"leg_typ_elec_overcharge", name:"Overcharge Cell",   emoji:"🪫", rarity:"legendary", element:"Electric", stats:{atk:17,crit:30}, effect:"Special charge gained past full is kept for the next Special ability (max 25%)", battle:{chargeOverflowPct:25}},
  {id:"leg_typ_elec_rod",        name:"Lightning Rod",     emoji:"⚡", rarity:"legendary", element:"Electric", stats:{hp:17,def:17},   effect:"Gain 3% Special charge whenever an attack is redirected to this creature", battle:{redirectChargePct:3}},
  {id:"leg_typ_elec_railgun",    name:"Railgun Coil",      emoji:"🔫", rarity:"legendary", element:"Electric", stats:{atk:35},         effect:"Every 4th Basic attack Pierces and deals 50% more damage", battle:{pierceEvery:4, pierceEveryDmgPct:50}},
  // Dark
  {id:"rar_typ_dark_hex",        name:"Hex Nail",          emoji:"🪡", rarity:"rare",      element:"Dark",     stats:{atk:13},         effect:"Damage Over Time inflicted by this creature lasts longer", battle:{dotDurationTicks:2}},
  {id:"rar_typ_dark_grave",      name:"Grave Lily",        emoji:"🪦", rarity:"rare",      element:"Dark",     stats:{hp:6,atk:5},     effect:"Deal 10% more damage to Marked enemies", battle:{markedTargetDmgPct:10}},
  {id:"epi_typ_dark_souljar",    name:"Soul Jar",          emoji:"🫙", rarity:"epic",      element:"Dark",     stats:{hp:19},          effect:"Recover 5% Health whenever any creature is defeated", battle:{anyDefeatHealPct:5}},
  // A Defense Down stack from this source, standard duration.
  {id:"epi_typ_dark_curse",      name:"Curse Tablet",      emoji:"📜", rarity:"epic",      element:"Dark",     stats:{atk:9,def:8},    effect:"Whenever this creature inflicts Blind, also inflict Defense Down", battle:{blindDefDown:true}},
  // The debuffs land at the standard duration on the enemy nearest the fallen one.
  {id:"leg_typ_dark_reaper",     name:"Reaper's Lantern",  emoji:"🏮", rarity:"legendary", element:"Dark",     stats:{atk:17,def:17},  effect:"Whenever an enemy is defeated, their debuffs transfer to the closest enemy", battle:{defeatDebuffTransfer:true}},
  {id:"leg_typ_dark_eclipse",    name:"Eclipse Mirror",    emoji:"🪞", rarity:"legendary", element:"Dark",     stats:{def:17,crit:30}, effect:"Whenever an enemy inflicts a debuff onto this creature, inflict a copy of it onto them", battle:{mirrorDebuffs:true}},
  // Light
  {id:"rar_typ_light_prism",     name:"Prism Shard",       emoji:"🔷", rarity:"rare",      element:"Light",    stats:{atk:13},         effect:"Guaranteed critical hits deal 15% more damage", battle:{guaranteedCritDmgPct:15}},
  {id:"rar_typ_light_halo",      name:"Halo Pin",          emoji:"😇", rarity:"rare",      element:"Light",    stats:{hp:6,def:5},     effect:"Overheal granted by this creature is 20% larger", battle:{overhealGrantPct:20}},
  // 0.25% of max Health per tick (0.5% per second), the wearer included.
  {id:"epi_typ_light_sanctuary", name:"Sanctuary Lamp",    emoji:"🪔", rarity:"epic",      element:"Light",    stats:{hp:19},          effect:"Allies inside this creature's Aura recover Health over time", battle:{auraAllyRegenPctPerTick:0.25}},
  // A +10% Attack Up, standard duration.
  {id:"epi_typ_light_solar",     name:"Solar Lens",        emoji:"🔆", rarity:"epic",      element:"Light",    stats:{atk:9,def:8},    effect:"Whenever this creature critically hits, Beside allies temporarily gain Attack Up", battle:{critBesideAtkUpPct:10}},
  // +10% Attack Up and Defense Up, standard duration.
  {id:"epi_typ_light_dawnchime", name:"Dawn Chime",        emoji:"🔔", rarity:"epic",      element:"Light",    stats:{hp:9,atk:8},     effect:"At the start of battle, all allies temporarily gain Attack Up and Defense Up", battle:{startTeamAtkDefPct:10}},
  // "The Shield" = that Shield at its largest.
  {id:"leg_typ_light_aegis",     name:"Aegis Feather",     emoji:"🪶", rarity:"legendary", element:"Light",    stats:{def:17,hp:17},   effect:"Whenever a Shield breaks, the weakest ally recovers Health equal to 20% of the Shield", battle:{shieldBreakHealPct:20}},
  {id:"leg_typ_light_sunforge",  name:"Sunforge Crown",    emoji:"🌞", rarity:"legendary", element:"Light",    stats:{hp:17,crit:30},  effect:"Allies are immune to debuffs while inside this creature's Aura", battle:{auraDebuffImmunity:true}},
  // Attacker
  {id:"rar_role_atk_whetstone",  name:"Whetstone",         emoji:"🪨", rarity:"rare",      role:"Attacker",    stats:{atk:13},         effect:"Gain 3% Attack whenever this creature defeats an enemy, for the rest of the battle (max 15%)", battle:{killAtkPct:3, killAtkMaxPct:15}},
  {id:"rar_role_atk_ambush",     name:"Ambush Fang",       emoji:"🦷", rarity:"rare",      role:"Attacker",    stats:{atk:5,crit:8},   effect:"The first ability this creature uses in battle deals 15% more damage", battle:{firstAbilityDmgPct:15}},
  {id:"epi_role_atk_finisher",   name:"Finisher's Coin",   emoji:"🪙", rarity:"epic",      role:"Attacker",    stats:{atk:9,critDmg:14}, effect:"Critical hits deal 20% more damage to enemies below 50% Health", battle:{critLowHpDmgPct:20, critLowHpBelowPct:50}},
  {id:"epi_role_atk_glass",      name:"Glass Blade",       emoji:"🗡️", rarity:"epic",      role:"Attacker",    stats:{atk:19},         effect:"Deal 20% more damage and receive 20% more damage", battle:{dmgDealtPct:20, dmgTakenPct:20}},
  // Within its attack range.
  {id:"leg_role_atk_bloodrush",  name:"Bloodrush Crown",   emoji:"🩸", rarity:"legendary", role:"Attacker",    stats:{atk:17,crit:30}, effect:"Whenever this creature defeats an enemy, instantly use its Basic ability on a random Closest enemy", battle:{killBasicAgain:true}},
  {id:"leg_role_atk_warpath",    name:"Warpath Greaves",   emoji:"🥾", rarity:"legendary", role:"Attacker",    stats:{atk:17,hp:17},   effect:"Excess damage from defeating an enemy is dealt to a random Closest enemy", battle:{overkillCarry:true}},
  // Universal (equippable by anyone)
  {id:"rar_gen_def_atk_bramble", name:"Bramble Cuff",      emoji:"🥀", rarity:"rare",      stats:{def:6,atk:5},    effect:"Counter-attacks deal 20% more damage", battle:{counterDmgPct:20}},
  {id:"rar_gen_hp_def_quartz",   name:"Quartz Chip",       emoji:"🔹", rarity:"rare",      stats:{hp:6,def:5},     effect:"Reflect deals 20% more damage", battle:{reflectDmgPct:20}},
  {id:"rar_gen_def_hp_burrow",   name:"Burrow Band",       emoji:"🦡", rarity:"rare",      stats:{def:6,hp:5},     effect:"Recover 10% Health whenever this creature inflicts Taunt", battle:{tauntHealPct:10}},
  {id:"rar_gen_hp_atk_dynamo",   name:"Dynamo Band",       emoji:"🔋", rarity:"rare",      stats:{hp:6,atk:5},     effect:"At the start of battle, gain 10% Special charge", battle:{startChargePct:10}},
  {id:"rar_gen_def_hp_grounding",name:"Grounding Rod",     emoji:"🦯", rarity:"rare",      stats:{def:6,hp:5},     effect:"Stuns inflicted on this creature are 50% shorter", battle:{stunTakenLessPct:50}},
  {id:"rar_gen_hp_atk_ion",      name:"Ion Thread",        emoji:"🧵", rarity:"rare",      stats:{hp:6,atk:5},     effect:"Whenever this creature gains Haste Up, Beside allies gain it too", hasteEffect:true, battle:{hasteUpShareBeside:true}},
  {id:"epi_gen_def_carapace",    name:"Beetle Carapace",   emoji:"🪲", rarity:"epic",      stats:{def:19},         effect:"Whenever this creature gains Fortify, gain 1 additional stack", battle:{fortifyExtraStack:1}},
  {id:"epi_gen_atk_def_faultline",name:"Fault Line Gauntlet",emoji:"🧤", rarity:"epic",    stats:{atk:9,def:8},    effect:"Line abilities deal 10% more damage", battle:{lineDmgPct:10}},
  {id:"epi_gen_atk_hp_shale",    name:"Shale Anklet",      emoji:"🦶", rarity:"epic",      stats:{atk:9,hp:8},     effect:"Gain 10% Attack whenever this creature Dodges, for the rest of the battle (max 30%)", battle:{dodgeAtkPct:10, dodgeAtkMaxPct:30}},
  {id:"epi_gen_atk_crit_hollow", name:"Hollow Mask",       emoji:"🎃", rarity:"epic",      stats:{atk:9,crit:14},  effect:"Abilities that target the Weakest enemy deal 20% more damage", battle:{weakestDmgPct:20}},
  {id:"epi_gen_hp_atk_adrenal",  name:"Adrenal Gland",     emoji:"💓", rarity:"epic",      stats:{hp:9,atk:8},     effect:"While below 50% Health, gain 10% Speed and Haste", speedEffect:true, hasteEffect:true, battle:{lowHpSpdHastePct:10, lowHpSpdHasteBelowPct:50}},
  {id:"leg_gen_hp_atk_hourglass",name:"Thief's Hourglass", emoji:"⏳", rarity:"legendary", stats:{hp:17,atk:17},   effect:"Whenever this creature removes an enemy's Special ability charge, gain 50% of the amount removed", battle:{chargeStealPct:50}},
  // Shielding Down: 20% per stack, one stack from this source, standard duration.
  {id:"leg_gen_atk_cdmg_nightshade",name:"Nightshade Bead",emoji:"🟣", rarity:"legendary", stats:{atk:17,critDmg:30}, effect:"Attacks deal 50% more damage to Shielded enemies and inflict Shielding Down", battle:{shieldedTargetDmgPct:50, shieldDownOnHit:true}},
  // Trade-off items: a stat penalty (a negative `statBonus`) paid for with
  // stronger stats (Sloth Claw: 20 vs the Sigils' 18) or a battle effect.
  {id:"rar_gen_atk_sloth",       name:"Sloth Claw",        emoji:"🦥", rarity:"rare",      stats:{atk:20},         effect:"Haste -15%", hasteEffect:true, statBonus:{stat:"abilitySpeed", pct:-15}},
  {id:"epi_gen_atk_hp_snail",    name:"Snail Shell",       emoji:"🐌", rarity:"epic",      stats:{atk:9,hp:8},     effect:"-20% Speed. Special attacks are 20% stronger", speedEffect:true, statBonus:{stat:"spd", pct:-20}, battle:{specialDmgPct:20}},
  {id:"leg_gen_atk_hp_puppeteer",name:"Puppeteer's Strings",emoji:"🎭", rarity:"legendary", stats:{atk:17,hp:17},  effect:"Summons created by this creature gain 20% more Health, Defense, and Attack", battle:{summonStatPct:20}},
];
export const EQUIPMENT_MAP=Object.fromEntries(EQUIPMENT_DEFS.map(e=>[e.id,e]));
// Every item levels to 100 regardless of rarity, with an upgrade every level
// (equipBonus guarantees a minimum step). Rarity ordering at equal level comes
// from the base stats alone.
export const EQUIP_MAX_LEVEL=100;
export const EQUIP_MAX_ASCENSION=10;
export const EQUIP_ASC_COSTS=[2,1,2,3,4,5,6,7,8,9];
