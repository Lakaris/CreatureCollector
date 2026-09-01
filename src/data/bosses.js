// Dungeon and arena boss definitions plus their level-scaling helper.
// makeBoss is a factory invoked at module init to build DUNGEON_BOSSES, so it
// lives with the data it produces.
//
// ABILITY TAGS. `tags` on an ability are keys into ABILITY_TAG_DEFS
// (core/abilityText.js) and render as the pills the planning panel shows; the
// popup they open is the same one creature abilities use. Two rules keep them
// honest:
//
//  - Only tag what the boss module actually does. These are read off
//    battle/bosses/*.js, not off the description, so a tag never promises an
//    effect the code doesn't apply.
//  - Avoid tags whose definition carries a `stacking` table of CREATURE
//    ability magnitudes (attackup, speedup, attackdown, hastedown, ...). Those
//    numbers are per-creature-ability and would be plain wrong quoted against
//    a boss. Tags whose numbers are engine-wide (Poison, Damage Over Time) are
//    fine -- those are percentages of the victim's own Health either way.
//
// Effects with neither a matching definition nor engine-wide numbers (Power,
// knockback, pull, the charge) are left untagged rather than mislabelled; the
// description still describes them.

export function getBossStats(boss,level){
  const t=(level-1)/9;
  return {
    hp:Math.round(boss.baseStats.hp*(1+1.5*t)),
    atk:Math.round(boss.baseStats.atk*(1+t)),
    def:Math.round(boss.baseStats.def*(1+0.5*t)),
  };
}
export function makeBoss(key,name,type){
  return {key,name,type,
    abilities:{
      basic:{name:type+" Strike",description:"Deals "+type+" damage to the strongest nearest enemy",tags:["closest"]},
      special:{name:type+" Nova",description:"Deals "+type+" damage around itself, pushing nearby enemies back 1 tile",tags:["nearby"]},
      unique:{name:"Rising Fury",description:"Gains increased attack over time"},
    },
    baseStats:{hp:800,atk:100,def:60},
  };
}
/**
 * One Vine, at the tile it sprouts on.
 *
 * A boss's `minions` is a list of INDIVIDUAL creatures, not a count of one
 * kind: each entry owns its own position and its own `abilities`, and the
 * planning phase gives each its own info card. The Nature boss's two happen to
 * share a kit today, which is all this factory is -- a way to say that twice
 * without pasting the text twice. Give one of them a different ability and it
 * simply stops using the factory; nothing else has to change.
 */
function makeVine(row,col){
  return {
    name:"Vine",emoji:"🌱",row,col,
    abilities:{
      basic:{name:"Lash",description:"Melee attacks the nearest enemy, moving toward it when out of reach",tags:["closest"]},
      special:{name:"Entangle",description:"Every few seconds, damages every enemy in the 8 surrounding tiles",tags:["nearby"]},
    },
  };
}

export const DUNGEON_BOSSES=[
  {...makeBoss("fire","Fire Boss","Fire"),abilities:{
    basic:{name:"Ember Strike",description:"Melee attacks the nearest enemy",tags:["closest","burn"]},
    special:{name:"Pillar of Flame",description:"Blasts all enemies in its two columns and two rows",tags:["burn"]},
    unique:{name:"Burning Touch",description:"All attacks inflict Burn, dealing damage over time",tags:["burn"]},
  }},
  {...makeBoss("nature","Nature Boss","Nature"),abilities:{
    basic:{name:"Life Drain",description:"Ranged attack that grows stronger each hit on the same target, resetting when switching enemies",tags:["closest"]},
    special:{name:"Overgrowth",description:"Knocks all enemies back 1 tile, then Roots and Poisons them",tags:["root","poison"]},
    // Infinite range and the Speed gain have no definitions of their own, and
    // Speed Up's stacking table is creature-ability magnitudes -- untagged.
    unique:{name:"Ancient Stride",description:"Gain infinite range and increased Speed"},
  },
  // The Nature boss is the only one that brings help: these Vines sprout at the
  // start of the fight and fight as ordinary enemy units (the generic enemy
  // flow in battle/tick.js drives their attack and chase; Entangle comes from
  // tickMinionSpecials in battle/minions.js).
  //
  // This list is the one source for where they start -- the planning board's
  // markers, its per-Vine info cards, and the actual spawn in DungeonScreen's
  // dFight all read it, so the preview can't promise a tile or a kit the fight
  // doesn't use.
  minions:[makeVine(4,1),makeVine(4,4)]},
  {...makeBoss("earth","Earth Boss","Earth"),abilities:{
    basic:{name:"Tremor Slam",description:"Attacks all adjacent enemies at once",tags:["nearby","slow"]},
    special:{name:"Earthen Charge",description:"Charges to the end of the grid, knocking back and damaging everything in its path",tags:["slow"]},
    unique:{name:"Crushing Weight",description:"All attacks inflict Slow; gains Haste each time Earthen Charge is used",tags:["slow"]},
  }},
  {...makeBoss("electric","Electric Boss","Electric"),abilities:{
    basic:{name:"Volt Strike",description:"Attacks an enemy, inflicting Shock which lowers their Haste until it wears off",tags:["line","pierce","shock"]},
    special:{name:"Arc Burst",description:"Attacks 3 nearby enemies in rapid succession (targets chosen randomly)",tags:["shock"]},
    unique:{name:"Piercing Current",description:"Can only attack in cardinal directions, but all attacks pierce through every enemy in the line",tags:["line","pierce"]},
  }},
  {...makeBoss("water","Water Boss","Water"),abilities:{
    basic:{name:"Tidal Shot",description:"Attacks 3 random enemies",tags:["splash"]},
    special:{name:"Riptide",description:"Pushes all enemies toward the bottom of the grid, dealing damage; enemies stop if blocked by a wall or another unit"},
    unique:{name:"Floodwater",description:"All attacks deal equal splash damage to the 8 surrounding tiles; splash cannot hit the boss",tags:["splash"]},
  }},
  {...makeBoss("light","Light Boss","Light"),abilities:{
    basic:{name:"Radiant Strike",description:"Attacks 4 tiles wide — the 2 tiles directly in front and 1 tile to each side"},
    // Power is an attack buff, but Attack Up's stacking table is creature
    // magnitudes and Power is +20% a stack -- Shield is the tag it can keep.
    special:{name:"Holy Radiance",description:"Deals damage to all enemies, then gains Power (attack buff) and Shield (absorbs damage until depleted, stackable)",tags:["shield"]},
    unique:{name:"Bulwark",description:"At 50% Health, gains a Shield equal to 30% of its max Health. While it has a Shield, slowly heals until the Shield breaks or its Health is full",tags:["shield","healovertime"]},
  }},
  {...makeBoss("dark","Dark Boss","Dark"),abilities:{
    basic:{name:"Shadow Row",description:"Cloaks the entire grid in shadow, dealing damage and inflicting Damage Over Time (stackable) on all enemies",tags:["damageovertime"]},
    // Weak is a flat 30% Attack cut, not Attack Down's per-level ladder.
    special:{name:"Cursed Veil",description:"Deals damage to all enemies and inflicts Weak (reduces attack) and Heal Immunity (blocks healing)",tags:["healimmunity"]},
    unique:{name:"Dark Shroud",description:"Receives reduced damage for each debuffed enemy on the field"},
  }},
  {...makeBoss("wind","Wind Boss","Wind"),abilities:{
    basic:{name:"Gust Strike",description:"Melee attack that knocks the target back 1 tile",tags:["closest"]},
    special:{name:"Cyclone",description:"Deals damage to all enemies and pulls them 2 tiles closer"},
    unique:{name:"Turbulence",description:"Enemies take bonus damage when a knockback or pull slams them into a wall or another unit"},
  }},
];

export const ARENA_TABS=[
  {id:"all",label:"Arena",emoji:"🏟️"},
  {id:"fire",label:"Fire",emoji:"🔥"},
  {id:"nature",label:"Nature",emoji:"🌿"},
  {id:"earth",label:"Earth",emoji:"🪨"},
  {id:"electric",label:"Electric",emoji:"⚡"},
  {id:"ice",label:"Water",emoji:"💧"},
  {id:"light",label:"Light",emoji:"✨"},
  {id:"dark",label:"Dark",emoji:"🌑"},
];

// Arena tab id -> creature type it restricts deployment to ("all" has no
// restriction and is absent). "ice" is the arena tab id for the Water-type
// arena (ARENA_TABS labels it "Water" but keeps the legacy id). Lives here
// beside ARENA_TABS because GameContext needs it too, for the per-tab
// deployment migration.
export const ARENA_TAB_TYPE={fire:"Fire",nature:"Nature",earth:"Earth",electric:"Electric",ice:"Water",light:"Light",dark:"Dark"};

