// Equipment catalog. Item identity is per-creature (ownedData.equipped, a 4-slot array
// of ids), but item LEVEL/ASCENSION are global maps keyed by itemId in app state --
// upgrading an item upgrades it everywhere it is equipped.

export const EQUIP_RARITY_CONFIG={
  common:   {label:"Common",    color:"#888",    bg:"#f0f0f0"},
  rare:     {label:"Rare",      color:"#378ADD", bg:"#ddeeff"},
  epic:     {label:"Epic",      color:"#7F77DD", bg:"#EEEDFE"},
  legendary:{label:"Legendary", color:"#d97706", bg:"#fef3c7"},
};
export const EQUIPMENT_DEFS=[
  // Common (base 5 per stat -- two-stat items nerfed to ~0.6x so their combined
  // total stays in line with same-rarity single-stat items)
  {id:"com_hp_atk",  name:"Iron Band",        emoji:"⚔️",  rarity:"common",    stats:{hp:5,  atk:5}},
  {id:"com_hp_atk2", name:"Leather Vambrace", emoji:"🧤",  rarity:"common",    stats:{hp:5,  atk:5}},
  {id:"com_hp_atk3", name:"Boarhide Wrap",    emoji:"🐗",  rarity:"common",    stats:{hp:5,  atk:5}},
  {id:"com_hp_def",  name:"Stone Brace",      emoji:"🪨",  rarity:"common",    stats:{hp:5,  def:5}},
  {id:"com_hp_def2", name:"Wooden Buckler",   emoji:"🪵",  rarity:"common",    stats:{hp:5,  def:5}},
  {id:"com_hp_def3", name:"Bone Guard",       emoji:"🦴",  rarity:"common",    stats:{hp:5,  def:5}},
  {id:"com_atk_def", name:"Iron Knuckles",    emoji:"🥊",  rarity:"common",    stats:{atk:5, def:5}},
  {id:"com_atk_def2",name:"Bronze Spikes",    emoji:"📌",  rarity:"common",    stats:{atk:5, def:5}},
  {id:"com_atk_def3",name:"Rawhide Wraps",    emoji:"🥋",  rarity:"common",    stats:{atk:5, def:5}},
  // Rare (base 7 per stat)
  {id:"rar_hp_atk",  name:"Silver Armlet",    emoji:"⚔️",  rarity:"rare",      stats:{hp:7,  atk:7}},
  {id:"rar_hp_atk2", name:"Falcon Bracer",    emoji:"🦅",  rarity:"rare",      stats:{hp:7,  atk:7}},
  {id:"rar_hp_def",  name:"Guardian Crest",   emoji:"🛡️",  rarity:"rare",      stats:{hp:7,  def:7}},
  {id:"rar_hp_def2", name:"Tortoise Shell",   emoji:"🐢",  rarity:"rare",      stats:{hp:7,  def:7}},
  {id:"rar_atk_def", name:"War Gauntlet",     emoji:"🥊",  rarity:"rare",      stats:{atk:7, def:7}},
  {id:"rar_atk_def2",name:"Wolf Fang Claw",   emoji:"🐺",  rarity:"rare",      stats:{atk:7, def:7}},
  // Stat Sigils — Rare single-stat (base 18), +10% that stat
  {id:"sig_hp",  name:"Life Sigil",   emoji:"❤️", rarity:"rare", stats:{hp:18},           effect:"Gain 10% more HP",    statBonus:{stat:"hp",  pct:10}},
  {id:"sig_atk", name:"Fury Sigil",   emoji:"⚔️", rarity:"rare", stats:{atk:18},          effect:"Gain 10% more ATK",   statBonus:{stat:"atk", pct:10}},
  {id:"sig_def", name:"Iron Sigil",   emoji:"🛡️", rarity:"rare", stats:{def:18},          effect:"Gain 10% more DEF",   statBonus:{stat:"def", pct:10}},
  // Rare effect items. Stats sit below plain rares (two-stat 5/6 vs 7/7,
  // single-stat 13 vs the Sigils' 18) to pay for the effect, mirroring how
  // Epic type-exclusives are costed vs plain Epics. Effects are deliberately
  // the weakest rung of each effect family -- the Epic/Legendary versions of
  // the same idea should always read as clear upgrades.
  // Rare type-exclusives (2 per element)
  {id:"rar_typ_fire_atk",    name:"Kindled Charm",   emoji:"🔥", rarity:"rare", element:"Fire",    stats:{atk:13},       effect:"Fire abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_fire_hp_atk", name:"Ashen Pendant",   emoji:"🪔", rarity:"rare", element:"Fire",    stats:{hp:5,atk:6},   effect:"Attacks have 10% chance to Burn for 1 turn"},
  {id:"rar_typ_water_hp",    name:"Dewdrop Charm",   emoji:"💧", rarity:"rare", element:"Water",   stats:{hp:13},        effect:"Restore 1% HP whenever a Water move hits"},
  {id:"rar_typ_water_hp_def",name:"Coral Band",      emoji:"🪸", rarity:"rare", element:"Water",   stats:{hp:6,def:5},   effect:"Water abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_nat_hp",      name:"Sprout Locket",   emoji:"🌱", rarity:"rare", element:"Nature",  stats:{hp:13},        effect:"Regenerate 1% HP each turn"},
  {id:"rar_typ_nat_def_atk", name:"Thorn Ring",      emoji:"🌵", rarity:"rare", element:"Nature",  stats:{def:6,atk:5},  effect:"Nature abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_ear_def",     name:"Pebble Talisman", emoji:"🪨", rarity:"rare", element:"Earth",   stats:{def:13},       effect:"Earth abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_ear_hp_def",  name:"Clay Bangle",     emoji:"🏺", rarity:"rare", element:"Earth",   stats:{hp:5,def:6},   effect:"Earth moves have 10% chance to Slow for 1 turn"},
  {id:"rar_typ_wind_atk",    name:"Breeze Feather",  emoji:"🪶", rarity:"rare", element:"Wind",    stats:{atk:13},       effect:"Wind moves deal 8% more damage"},
  {id:"rar_typ_wind_hp_atk", name:"Zephyr Knot",     emoji:"💨", rarity:"rare", element:"Wind",    stats:{hp:5,atk:6},   effect:"Abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_elec_def",    name:"Capacitor Charm", emoji:"🔋", rarity:"rare", element:"Electric",stats:{def:13},       effect:"When struck, 10% chance to Shock the attacker for 1 turn"},
  {id:"rar_typ_elec_atk_def",name:"Copper Coil",     emoji:"🧲", rarity:"rare", element:"Electric",stats:{atk:5,def:6},  effect:"Electric abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_light_hp",    name:"Sunbeam Locket",  emoji:"🌞", rarity:"rare", element:"Light",   stats:{hp:13},        effect:"Healing received is 10% stronger"},
  {id:"rar_typ_light_hp_def",name:"Glow Band",       emoji:"✨", rarity:"rare", element:"Light",   stats:{hp:6,def:5},   effect:"Light abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_dark_atk",    name:"Duskfang Charm",  emoji:"🦇", rarity:"rare", element:"Dark",    stats:{atk:13},       effect:"Dark abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_typ_dark_hp_atk", name:"Umbral Thread",   emoji:"🕸️", rarity:"rare", element:"Dark",    stats:{hp:6,atk:5},   effect:"Recover 1% HP each time you apply a debuff to an enemy"},
  // Rare role-exclusives (2 per role)
  {id:"rar_role_atk_edge",   name:"Duelist's Edge",  emoji:"🗡️", rarity:"rare", role:"Attacker", stats:{atk:6,def:5},  effect:"[Attacker] Abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_role_atk_hunter", name:"Hunter's Mark",   emoji:"🎯", rarity:"rare", role:"Attacker", stats:{atk:13},       effect:"[Attacker] Deal 8% more damage to enemies below 50% HP"},
  {id:"rar_role_tank_plate", name:"Squire's Plate",  emoji:"🛡️", rarity:"rare", role:"Tank",     stats:{hp:6,def:5},   effect:"[Tank] Abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_role_tank_grit",  name:"Grit Band",       emoji:"💪", rarity:"rare", role:"Tank",     stats:{def:13},       effect:"[Tank] Gain +8% DEF when below 50% HP"},
  {id:"rar_role_sup_charm",  name:"Mender's Charm",  emoji:"💚", rarity:"rare", role:"Support",  stats:{hp:13},        effect:"[Support] Healing applied by this creature is 10% stronger"},
  {id:"rar_role_sup_bell",   name:"Chorus Bell",     emoji:"🔔", rarity:"rare", role:"Support",  stats:{hp:5,def:6},   effect:"[Support] Adjacent allies take 4% less damage"},
  // Rare range-exclusives (2 per attack type)
  {id:"rar_rng_melee_grip",   name:"Brawler's Grip",   emoji:"🤜", rarity:"rare", attackType:"Melee",  stats:{hp:6,atk:5},  effect:"[Melee] Abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_rng_melee_greaves",name:"Charger's Greaves",emoji:"🥾", rarity:"rare", attackType:"Melee",  stats:{def:5,atk:6}, effect:"[Melee] After moving, your next attack deals 6% more damage"},
  {id:"rar_rng_ranged_scope", name:"Keen Scope",       emoji:"🔭", rarity:"rare", attackType:"Ranged", stats:{atk:13},      effect:"[Ranged] Abilities recharge 10% faster", hasteEffect:true},
  {id:"rar_rng_ranged_quiver",name:"Light Quiver",     emoji:"🏹", rarity:"rare", attackType:"Ranged", stats:{hp:5,atk:6},  effect:"[Ranged] Attacks have 10% chance to push the target back 1 tile"},
  // Rare general effect items (equippable by anyone)
  {id:"rar_gen_hp_shield",   name:"Vitality Bead",   emoji:"❤️", rarity:"rare", stats:{hp:13},        effect:"Start each battle with a shield equal to 5% of max HP"},
  {id:"rar_gen_atk_focus",   name:"Focus Band",      emoji:"🧿", rarity:"rare", stats:{atk:13},       effect:"Every 5th attack deals 25% bonus damage"},
  {id:"rar_gen_def_moss",    name:"Mossy Charm",     emoji:"🍀", rarity:"rare", stats:{def:13},       effect:"Reduce damage from adjacent enemies by 5%"},
  {id:"rar_gen_hp_atk_leech",name:"Leech Ring",      emoji:"🪱", rarity:"rare", stats:{hp:5,atk:6},   effect:"Recover 2% of all damage dealt as HP"},
  {id:"rar_gen_hp_def_cloak",name:"Traveler's Cloak",emoji:"🧣", rarity:"rare", stats:{hp:6,def:5},   effect:"Take 6% less damage while at full HP"},
  {id:"rar_gen_atk_def_spike",name:"Spiked Pauldron",emoji:"🦔", rarity:"rare", stats:{atk:5,def:6},  effect:"Counter-attack for 5% ATK when struck"},
  {id:"rar_gen_hp_coin",     name:"Lucky Coin",      emoji:"🪙", rarity:"rare", stats:{hp:13},        effect:"5% chance to take half damage from a hit"},
  {id:"rar_gen_def_sentry",  name:"Sentry Emblem",   emoji:"🗿", rarity:"rare", stats:{def:13},       effect:"Reduce incoming projectile damage by 6%"},
  {id:"rar_gen_def_anchor",  name:"Anchor Charm",    emoji:"⚓", rarity:"rare", stats:{def:13},       effect:"Cannot be pushed or pulled"},
  {id:"rar_gen_atk_def_haste",name:"Runner's Band",  emoji:"🏃", rarity:"rare", stats:{atk:5,def:5},  effect:"Abilities recharge 8% faster", hasteEffect:true},
  // Epic (base 11 per stat)
  {id:"epi_hp_atk",  name:"Warlord's Seal",   emoji:"🔥",  rarity:"epic",      stats:{hp:11, atk:11}},
  {id:"epi_hp_def",  name:"Citadel Core",     emoji:"🏰",  rarity:"epic",      stats:{hp:11, def:11}},
  {id:"epi_atk_def", name:"Infernal Glove",   emoji:"🌋",  rarity:"epic",      stats:{atk:11,def:11}},
  // Stat Crests — Epic single-stat (base 25), +15% that stat
  {id:"cre_hp",  name:"Life Crest",   emoji:"❤️", rarity:"epic",      stats:{hp:25},           effect:"Gain 15% more HP",    statBonus:{stat:"hp",          pct:15}},
  {id:"cre_atk", name:"Fury Crest",   emoji:"⚔️", rarity:"epic",      stats:{atk:25},          effect:"Gain 15% more ATK",   statBonus:{stat:"atk",         pct:15}},
  {id:"cre_def", name:"Iron Crest",   emoji:"🛡️", rarity:"epic",      stats:{def:25},          effect:"Gain 15% more DEF",   statBonus:{stat:"def",         pct:15}},
  // Element Epic items — HP+DEF base 11, element resistance
  {id:"res_fire",   name:"Cinder Ward",    emoji:"🛡️", rarity:"epic", stats:{hp:11,def:11}, effect:"Fire moves deal 20% less damage",   element:"Fire"},
  {id:"res_water",  name:"Tide Guard",     emoji:"🌊", rarity:"epic", stats:{hp:11,def:11}, effect:"Water moves deal 20% less damage",  element:"Water"},
  {id:"res_nature", name:"Bark Shield",    emoji:"🌿", rarity:"epic", stats:{hp:11,def:11}, effect:"Nature moves deal 20% less damage", element:"Nature"},
  {id:"res_earth",  name:"Stone Bulwark",  emoji:"⛰️", rarity:"epic", stats:{hp:11,def:11}, effect:"Earth moves deal 20% less damage",  element:"Earth"},
  {id:"res_wind",   name:"Gale Barrier",   emoji:"🌪️", rarity:"epic", stats:{hp:11,def:11}, effect:"Wind moves deal 20% less damage",   element:"Wind"},
  {id:"res_dark",   name:"Shadow Veil",    emoji:"🌑", rarity:"epic", stats:{hp:11,def:11}, effect:"Dark moves deal 20% less damage",   element:"Dark"},
  {id:"res_light",  name:"Radiant Aegis",  emoji:"☀️", rarity:"epic", stats:{hp:11,def:11}, effect:"Light moves deal 20% less damage",  element:"Light"},
  // Type-specific Epic items (non-Speed/Haste survivors)
  {id:"typ_fire_hp_atk",   name:"Scorchmantle",      emoji:"🧥", rarity:"epic", element:"Fire",    stats:{hp:9,atk:8},           effect:"Deal 5% bonus damage for each turn a Burn debuff is active on any enemy"},
  {id:"typ_water_hp_def",  name:"Tideweave Wrap",    emoji:"🌊", rarity:"epic", element:"Water",   stats:{hp:9,def:8},           effect:"Restore 3% HP whenever a Water move hits"},
  {id:"typ_water_atk_def", name:"Brineplate",        emoji:"🪸", rarity:"epic", element:"Water",   stats:{atk:8,def:9},          effect:"Counter-attack for 10% ATK when struck by a non-Water move"},
  {id:"typ_nat_hp_def",    name:"Thornback Vest",    emoji:"🌿", rarity:"epic", element:"Nature",  stats:{hp:8,def:9},           effect:"Gain +6% DEF for each ally still standing (Auto Battler)"},
  {id:"typ_ear_hp_def",    name:"Bedrock Slab",      emoji:"🪨", rarity:"epic", element:"Earth",   stats:{hp:9,def:9},           effect:"Reduce all damage taken by 5% when below 50% HP"},
  {id:"typ_ear_atk_def",   name:"Quake Brand",       emoji:"💥", rarity:"epic", element:"Earth",   stats:{atk:8,def:9},          effect:"Every 4th attack sends a shockwave dealing 15% ATK to all adjacent enemies"},
  {id:"typ_elec_def_atk",  name:"Capacitor Plate",   emoji:"🔌", rarity:"epic", element:"Electric",stats:{def:8,atk:9},          effect:"When struck, store charge; every 3 charges release a 20% ATK electric burst"},
  {id:"typ_elec_hp_def",   name:"Stormshell Mantle", emoji:"🌩️", rarity:"epic", element:"Electric",stats:{hp:8,def:8},           effect:"Electric attacks that hit shielded enemies deal 25% bonus damage, piercing 10% of defense"},
  {id:"typ_light_hp_def",  name:"Radiant Shroud",    emoji:"🛡️", rarity:"epic", element:"Light",   stats:{hp:8,def:8},           effect:"When healed, also cleanse 1 debuff"},
  {id:"typ_dark_hp_atk",   name:"Voidthread Cloak",  emoji:"🕷️", rarity:"epic", element:"Dark",    stats:{hp:8,atk:8},           effect:"Recover 4% HP each time you apply a debuff to an enemy"},
  {id:"typ_wind_atk_def",  name:"Galeforce Band",    emoji:"💨", rarity:"epic", element:"Wind",    stats:{atk:8,def:8},          effect:"Wind attacks increase SPD by 5% per hit, stacking up to +20%", speedEffect:true},
  {id:"typ_wind_hp_atk",   name:"Slipstream Blade",  emoji:"🌬️", rarity:"epic", element:"Wind",    stats:{hp:8,atk:9},           effect:"Attacks against Slowed or Stunned enemies deal 15% bonus damage"},
  {id:"typ_wind_hp_def",   name:"Featherweight Wrap",emoji:"🪶", rarity:"epic", element:"Wind",    stats:{hp:9,def:8},           effect:"Reduce incoming projectile damage by 10%"},
  {id:"typ_wind_def_atk",  name:"Cyclone Guard",     emoji:"🌀", rarity:"epic", element:"Wind",    stats:{def:8,atk:8},          effect:"After taking a hit, gain +10% SPD until your next turn", speedEffect:true},
  {id:"typ_wind_hp_atk2",  name:"Jetstream Sigil",   emoji:"⚡", rarity:"epic", element:"Wind",    stats:{hp:8,atk:8},           effect:"Using an ability grants +8% ATK until the end of the turn (Turn Based)"},
  // Epic effect items, second wave. Same costing as the type-exclusive Epics
  // above (two-stat 8/9 vs plain 11/11; single-stat 19 vs the Crests' 25).
  // Each effect is the middle rung of its family: stronger than the Rare
  // version, clearly weaker than the Legendary one.
  // Epic type-exclusives (1 per element)
  {id:"epi_typ_fire_atk",    name:"Flarebrand Ring",  emoji:"🔥", rarity:"epic", element:"Fire",    stats:{atk:19},       effect:"Fire moves deal 12% more damage"},
  {id:"epi_typ_water_hp",    name:"Springwell Charm", emoji:"⛲", rarity:"epic", element:"Water",   stats:{hp:19},        effect:"Recover 5% of damage dealt by Water moves as HP"},
  {id:"epi_typ_nat_hp_def",  name:"Verdant Weave",    emoji:"🌿", rarity:"epic", element:"Nature",  stats:{hp:9,def:8},   effect:"Regenerate 2% HP each turn"},
  {id:"epi_typ_ear_def",     name:"Basalt Ward",      emoji:"⛰️", rarity:"epic", element:"Earth",   stats:{def:19},       effect:"Reduce all damage taken by 4%"},
  {id:"epi_typ_wind_atk_def",name:"Tailwind Talon",   emoji:"🌬️", rarity:"epic", element:"Wind",    stats:{atk:9,def:8},  effect:"Abilities recharge 15% faster", hasteEffect:true},
  {id:"epi_typ_elec_atk",    name:"Voltaic Fang",     emoji:"⚡", rarity:"epic", element:"Electric",stats:{atk:19},       effect:"Attacks have 20% chance to Shock for 1 turn"},
  {id:"epi_typ_light_hp",    name:"Dawnlight Halo",   emoji:"😇", rarity:"epic", element:"Light",   stats:{hp:19},        effect:"Healing received is 20% stronger"},
  {id:"epi_typ_dark_hp_atk", name:"Gloomreaper Chain",emoji:"⛓️", rarity:"epic", element:"Dark",    stats:{hp:8,atk:9},   effect:"Deal 15% more damage to enemies below 40% HP"},
  // Epic role-exclusives (1 per role)
  {id:"epi_role_atk_slayer", name:"Slayer's Band",    emoji:"⚔️", rarity:"epic", role:"Attacker", stats:{atk:9,hp:8},   effect:"[Attacker] After defeating an enemy, gain +10% ATK until end of battle"},
  {id:"epi_role_tank_bastion",name:"Bastion Plate",   emoji:"🛡️", rarity:"epic", role:"Tank",     stats:{hp:9,def:8},   effect:"[Tank] At the start of each battle, gain a barrier equal to 12% of max HP"},
  {id:"epi_role_sup_cantor", name:"Cantor's Beads",   emoji:"📿", rarity:"epic", role:"Support",  stats:{hp:19},        effect:"[Support] All healing and buffs applied by this creature are 15% stronger"},
  // Epic range-exclusives (1 per attack type)
  {id:"epi_rng_melee_vanguard",name:"Vanguard Gauntlet",emoji:"🥊", rarity:"epic", attackType:"Melee",  stats:{atk:8,def:9}, effect:"[Melee] Deal 12% bonus damage while adjacent to 2 or more enemies"},
  {id:"epi_rng_ranged_lens",   name:"Longshot Lens",    emoji:"🔍", rarity:"epic", attackType:"Ranged", stats:{atk:19},      effect:"[Ranged] Deal 12% bonus damage to enemies 3 or more tiles away"},
  // Epic general effect items (equippable by anyone)
  {id:"epi_gen_hp_atk_vamp", name:"Vampiric Band",    emoji:"🧛", rarity:"epic", stats:{hp:8,atk:9},   effect:"Recover 4% of all damage dealt as HP"},
  {id:"epi_gen_atk_def_retort",name:"Retort Mail",    emoji:"⚙️", rarity:"epic", stats:{atk:8,def:9},  effect:"Counter-attack for 8% ATK when struck"},
  {id:"epi_gen_hp_def_aegis",name:"Aegis Charm",      emoji:"🔰", rarity:"epic", stats:{hp:9,def:8},   effect:"Start each battle with a shield equal to 10% of max HP"},
  {id:"epi_gen_atk_oath",    name:"Duelist's Oath",   emoji:"🤺", rarity:"epic", stats:{atk:19},       effect:"Your first attack each battle deals 40% bonus damage"},
  {id:"epi_gen_hp_idol",     name:"Guardian Idol",    emoji:"🪬", rarity:"epic", stats:{hp:19},        effect:"Take 10% less damage while below 30% HP"},
  {id:"epi_gen_def_bulwark", name:"Bulwark Sigil",    emoji:"🏛️", rarity:"epic", stats:{def:19},       effect:"Every 4th hit taken deals half damage"},
  {id:"epi_gen_def_nettle",  name:"Nettle Guard",     emoji:"🌾", rarity:"epic", stats:{def:19},       effect:"Enemies that strike you lose 3% ATK for the rest of the battle, up to -15%"},
  {id:"epi_gen_def_sentinel",name:"Sentinel Idol",    emoji:"🗿", rarity:"epic", stats:{def:19},       effect:"Gain +12% DEF for the first 3 turns of each battle"},
  // Stat Relics — Legendary single-stat (base 35), +25% that stat
  {id:"rel_hp",  name:"Life Relic",   emoji:"❤️", rarity:"legendary", stats:{hp:35},           effect:"Gain 25% more HP",    statBonus:{stat:"hp",          pct:25}},
  {id:"rel_atk", name:"Fury Relic",   emoji:"⚔️", rarity:"legendary", stats:{atk:35},          effect:"Gain 25% more ATK",   statBonus:{stat:"atk",         pct:25}},
  {id:"rel_def", name:"Iron Relic",   emoji:"🛡️", rarity:"legendary", stats:{def:35},          effect:"Gain 25% more DEF",   statBonus:{stat:"def",         pct:25}},
  // Legendary (base 17 per stat)
  {id:"leg_hp_atk",  name:"Divine Colossus",  emoji:"👑",  rarity:"legendary", stats:{hp:17, atk:17}},
  {id:"leg_hp_def",  name:"Eternal Fortress", emoji:"🏯",  rarity:"legendary", stats:{hp:17, def:17}},
  {id:"leg_atk_def", name:"Dragon's Claw",    emoji:"🐉",  rarity:"legendary", stats:{atk:17,def:17}},
  // Legendary effect items — user-specified (base 17 per stat)
  {id:"eff_atk_hp_berserk",  name:"Berserk Core",        emoji:"🔴", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Special attacks are sealed. Basic attacks deal 100% more damage"},
  {id:"eff_atk_def_double",  name:"Twin Fang",           emoji:"🗡️", rarity:"legendary", stats:{atk:17,def:17},          effect:"Basic attacks hit 1 additional time"},
  // Auto Battler focused (additional)
  {id:"eff_hp_def_barrier",  name:"Crest of Conquest",   emoji:"🏰", rarity:"legendary", stats:{hp:17, def:17},          effect:"Gain a barrier absorbing 15% of max HP at the start of each battle"},
  {id:"eff_hp_atk_shock",    name:"Shockwave Gauntlet",  emoji:"💥", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Every 5th attack releases a shockwave dealing 40% ATK to all enemies"},
  {id:"eff_atk_def_pierce",  name:"Arrowsplit",          emoji:"🏹", rarity:"legendary", stats:{atk:17,def:17},          effect:"Attacks hit a second random enemy for 40% of the original damage"},
  {id:"eff_atk_def_rampage", name:"Warlord's Trophy",    emoji:"🏆", rarity:"legendary", stats:{atk:17,def:17},          effect:"Gain +5% ATK permanently each time an enemy is defeated, up to +50%"},
  // Auto Battler focused
  {id:"eff_hp_atk_mourn",    name:"Mourning Band",       emoji:"🖤", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Gain +10% ATK permanently each time an ally is defeated"},
  {id:"eff_def_atk_counter", name:"Thornback Plate",     emoji:"🌵", rarity:"legendary", stats:{atk:17,def:17},          effect:"Counter-attack for 25% ATK when struck"},
  {id:"eff_hp_def_immune",   name:"Last Breath Core",    emoji:"💙", rarity:"legendary", stats:{hp:17, def:17},          effect:"When HP drops below 30%, negate the next hit entirely"},
  // Turn Based focused
  {id:"eff_def_hp_last",     name:"Last Stand Crown",    emoji:"👑", rarity:"legendary", stats:{hp:17, def:17},          effect:"When below 30% HP, reduce all incoming damage by 40%"},
  {id:"eff_atk_def_crit",    name:"Shattercrit Ring",    emoji:"💎", rarity:"legendary", stats:{atk:17,def:17},          effect:"Critical hits shatter the target's armor, reducing their DEF by 20% for 3s"},
  {id:"eff_hp_atk_heal",     name:"Lifebinder Pendant",  emoji:"💚", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Increase all healing received by 40%"},
  // General / Mixed
  {id:"eff_hp_def_revive",   name:"Phoenix Core",        emoji:"🔥", rarity:"legendary", stats:{hp:17, def:17},          effect:"Revive once per battle at 20% HP"},
  {id:"eff_atk_hp_lifesteal",name:"Bloodthirster",       emoji:"🩸", rarity:"legendary", stats:{hp:17, atk:17},          effect:"Recover 8% of all damage dealt as HP"},
  // Additional user-specified legendaries
  {id:"eff_hp_atk_bleed",    name:"Sanguine Fang",       emoji:"🩸", rarity:"legendary", stats:{hp:17, atk:17},                                    effect:"Whenever you inflict damage, also inflict Bleed and Burn"},
  {id:"eff_def_atk_buffstk", name:"Warbuff Plate",       emoji:"📈", rarity:"legendary", stats:{def:17,atk:17},                                     effect:"Gain +10% ATK and DEF when gaining a buff, up to +50%"},
  // Dungeon-exclusive elemental legendaries (non-Speed/Haste survivors)
  {id:"dng_fire_hp_atk",   name:"Ember Brand",       emoji:"🔥", rarity:"legendary", stats:{hp:17, atk:17},          element:"Fire",     effect:"Fire attacks inflict Burn on hit"},
  {id:"dng_fire_atk_def",  name:"Scorched Plates",   emoji:"♨️", rarity:"legendary", stats:{atk:17,def:17},          element:"Fire",     effect:"Burning enemies take 15% more damage from Fire attacks"},
  {id:"dng_water_hp_atk",  name:"Tidal Grip",        emoji:"🌊", rarity:"legendary", stats:{hp:17, atk:17},          element:"Water",    effect:"Water attacks reduce enemy ATK by 15% for 2 turns"},
  {id:"dng_water_hp_def",  name:"Seafoam Cloak",     emoji:"🧊", rarity:"legendary", stats:{hp:17, def:17},          element:"Water",    effect:"Water moves heal the user for 10% of damage dealt"},
  {id:"dng_nat_hp_def",    name:"Living Bark",       emoji:"🌿", rarity:"legendary", stats:{hp:17, def:17},          element:"Nature",   effect:"Nature attacks regenerate 5% HP each turn for 3 turns"},
  {id:"dng_earth_hp_def",  name:"Petrified Core",    emoji:"🪨", rarity:"legendary", stats:{hp:17, def:17},          element:"Earth",    effect:"Earth attacks have 30% chance to Stun the enemy for 1 turn"},
  {id:"dng_earth_atk_def", name:"Tremor Edge",       emoji:"🌍", rarity:"legendary", stats:{atk:17,def:17},          element:"Earth",    effect:"Earth attacks reduce enemy SPD by 20% for 2 turns"},
  {id:"dng_elec_atk_def",  name:"Chain Conductor",   emoji:"⚡", rarity:"legendary", stats:{atk:17,def:17},          element:"Electric", effect:"Electric attacks chain to 1 nearby enemy for 50% damage"},
  {id:"dng_light_hp_atk",  name:"Radiant Brand",     emoji:"☀️", rarity:"legendary", stats:{hp:17, atk:17},          element:"Light",    effect:"Light attacks have 25% chance to Blind, reducing enemy ATK by 30% for 1 turn"},
  {id:"dng_dark_hp_atk",   name:"Voidheart",         emoji:"🖤", rarity:"legendary", stats:{hp:17, atk:17},          element:"Dark",     effect:"Dark attacks drain 10% of enemy max HP and add it to your own"},
  {id:"dng_dark_hp_def",   name:"Shadow Shroud",     emoji:"🌑", rarity:"legendary", stats:{hp:17, def:17},          element:"Dark",     effect:"Dark moves apply Fear, causing enemies to miss 20% of attacks for 2 turns"},
  {id:"dng_dark_atk_def",  name:"Obliterator's Mark",emoji:"💀", rarity:"legendary", stats:{atk:17,def:17},          element:"Dark",     effect:"Dark abilities deal 30% more damage to enemies below 50% HP"},
  {id:"dng_wind_hp_atk",   name:"Gust Anklets",      emoji:"💨", rarity:"legendary", stats:{hp:17, atk:17},          element:"Wind",     effect:"Wind attacks increase SPD by 8% per hit, stacking up to +40%", speedEffect:true},
  {id:"dng_wind_atk_def",  name:"Tempest Blade",     emoji:"🌬️", rarity:"legendary", stats:{atk:17,def:17},          element:"Wind",     effect:"Wind moves deal 25% more damage to slowed or rooted enemies"},
  {id:"dng_wind_hp_def",   name:"Cyclone Ring",      emoji:"🌪️", rarity:"legendary", stats:{hp:17, def:17},          element:"Wind",     effect:"Swirling winds cause enemies to miss 15% of their attacks against this creature"},
  {id:"dng_wind_atk_def2", name:"Sirocco Plate",     emoji:"🌫️", rarity:"legendary", stats:{atk:17,def:17},          element:"Wind",     effect:"Wind attacks reduce enemy SPD by 15% while increasing your own SPD by 5%", speedEffect:true},
  {id:"dng_wind_hp_def2",  name:"Jetstream Band",    emoji:"⚡", rarity:"legendary", stats:{hp:17, def:17},          element:"Wind",     effect:"Wind abilities recharge 40% faster", hasteEffect:true},
  // Role-exclusive: Attacker (non-Speed/Haste survivors)
  {id:"role_atk_rampage",    name:"Rampage Shard",       emoji:"💢", rarity:"legendary", role:"Attacker", stats:{atk:21,hp:13},           effect:"[Attacker] After defeating an enemy, gain +25% ATK until end of battle"},
  {id:"role_atk_doubledown", name:"Gambler's Blade",     emoji:"🃏", rarity:"legendary", role:"Attacker", stats:{atk:21,def:13},          effect:"[Attacker] 50% chance to deal 100% bonus damage; 20% chance to deal 0 damage"},
  {id:"role_atk_lifesteal",  name:"Hungering Edge",      emoji:"🩸", rarity:"legendary", role:"Attacker", stats:{atk:17,hp:17},           effect:"[Attacker] Recover 15% of all damage dealt as HP"},
  // Role-exclusive: Tank (non-Speed/Haste survivors)
  {id:"role_tank_fortress",  name:"Ironwall Core",       emoji:"🏰", rarity:"legendary", role:"Tank", stats:{def:21,hp:13},           effect:"[Tank] Reduce all incoming damage by an additional 20%"},
  {id:"role_tank_taunt",     name:"Warlord's Insignia",  emoji:"📣", rarity:"legendary", role:"Tank", stats:{hp:21,def:13},           effect:"[Tank] All enemies are forced to target this creature for 2 turns after it uses any ability"},
  {id:"role_tank_barrier",   name:"Eternal Bulwark",     emoji:"🛡️", rarity:"legendary", role:"Tank", stats:{hp:17,def:17},           effect:"[Tank] At the start of each battle, gain a barrier equal to 30% of max HP"},
  {id:"role_tank_counter",   name:"Rebuke Gauntlet",     emoji:"👊", rarity:"legendary", role:"Tank", stats:{def:17,atk:17},          effect:"[Tank] Counter-attack for 40% ATK when struck, scaling with current DEF"},
  {id:"role_tank_thorns",    name:"Thornwall Aegis",     emoji:"🌵", rarity:"legendary", role:"Tank", stats:{def:17,hp:17},           effect:"[Tank] Enemies lose 10% of their ATK each time they hit this creature, up to -40%"},
  {id:"role_tank_guardian",  name:"Guardian's Oath",     emoji:"🤝", rarity:"legendary", role:"Tank", stats:{hp:17,def:17},           effect:"[Tank] Redirect 25% of damage dealt to allies to this creature instead"},
  // Role-exclusive: Support (non-Speed/Haste survivors)
  {id:"role_sup_amplify",    name:"Amplifier Prism",     emoji:"🔮", rarity:"legendary", role:"Support", stats:{hp:17,atk:17},           effect:"[Support] All healing and buffs applied by this creature are 30% stronger"},
  {id:"role_sup_haste",      name:"Swiftgrace Band",     emoji:"💨", rarity:"legendary", role:"Support", stats:{hp:17,def:17},           effect:"[Support] Allies gain +20% Haste for 2 turns after being healed by this creature", hasteEffect:true},
  {id:"role_sup_barrier",    name:"Sanctum Seal",        emoji:"✨", rarity:"legendary", role:"Support", stats:{hp:21,def:13},           effect:"[Support] After using a support ability, grant the lowest-HP ally a 15% HP shield"},
  {id:"role_sup_revive",     name:"Soul Lantern",        emoji:"🏮", rarity:"legendary", role:"Support", stats:{hp:21,atk:13},           effect:"[Support] Once per battle, revive a defeated ally at 30% HP"},
  {id:"role_sup_cleanse",    name:"Purifier's Chalice",  emoji:"🌸", rarity:"legendary", role:"Support", stats:{hp:17,def:17},           effect:"[Support] All healing also removes all debuffs from the target"},
  {id:"role_sup_chain",      name:"Resonance Loop",      emoji:"♾️", rarity:"legendary", role:"Support", stats:{hp:17,atk:17},           effect:"[Support] Support abilities chain to the next lowest-HP ally for 50% of their effect"},
  {id:"role_sup_aura",       name:"Blessing Mantle",     emoji:"🌟", rarity:"legendary", role:"Support", stats:{hp:21,atk:21,def:21},    effect:"[Support] All allies gain +10% to all stats while this creature is alive"},
  {id:"role_sup_overload",   name:"Overdrive Sigil",     emoji:"⚡", rarity:"legendary", role:"Support", stats:{atk:17,def:17},          effect:"[Support] Support abilities also grant the target 20% special charge"},
  {id:"role_sup_bond",       name:"Twin Soul Crest",     emoji:"💞", rarity:"legendary", role:"Support", stats:{hp:17,def:17},           effect:"[Support] When an ally drops below 20% HP, immediately heal them for 25% of their max HP"},
  {id:"role_sup_inspire",    name:"Warcry Pendant",      emoji:"📯", rarity:"legendary", role:"Support", stats:{atk:21,def:13},          effect:"[Support] At battle start, all allies gain +15% ATK and SPD for 3 turns", speedEffect:true},
];
export const EQUIPMENT_MAP=Object.fromEntries(EQUIPMENT_DEFS.map(e=>[e.id,e]));
// Absolute cap (legendary). Lower rarities cap earlier -- their upgrade steps
// are as chunky as a legendary's (min +2/level, see equipBonus), so they feel
// rewarding to level, but they retire sooner, preserving endgame ordering
// (maxed per-stat: common ~234 < rare ~380-410 < epic ~545-840 < legendary
// ~750-1500). Use core/equipment.js's equipMaxLevel(itemId) for an item's cap.
export const EQUIP_MAX_LEVEL=100;
export const EQUIP_MAX_LEVEL_BY_RARITY={common:40,rare:60,epic:80,legendary:100};
export const EQUIP_MAX_ASCENSION=10;
export const EQUIP_ASC_COSTS=[2,1,2,3,4,5,6,7,8,9];
