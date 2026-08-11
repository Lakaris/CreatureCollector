// Dungeon and arena boss definitions plus their level-scaling helper.
// makeBoss is a factory invoked at module init to build DUNGEON_BOSSES, so it
// lives with the data it produces.

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
      basic:{name:type+" Strike",description:"Deals "+type+" damage to the strongest nearest enemy"},
      special:{name:type+" Nova",description:"Deals "+type+" damage around itself, pushing nearby enemies back 1 tile"},
      unique:{name:"Rising Fury",description:"Gains increased attack over time"},
    },
    baseStats:{hp:800,atk:100,def:60},
  };
}
export const DUNGEON_BOSSES=[
  {...makeBoss("fire","Fire Boss","Fire"),abilities:{
    basic:{name:"Ember Strike",description:"Melee attacks the nearest enemy"},
    special:{name:"Pillar of Flame",description:"Blasts all enemies in its two columns and two rows"},
    unique:{name:"Burning Touch",description:"All attacks inflict Burn, dealing damage over time"},
  }},
  {...makeBoss("nature","Nature Boss","Nature"),abilities:{
    basic:{name:"Life Drain",description:"Ranged attack that grows stronger each hit on the same target, resetting when switching enemies"},
    special:{name:"Overgrowth",description:"Knocks all enemies back 1 tile, then Roots and Poisons them"},
    unique:{name:"Ancient Stride",description:"Gain infinite range and increased Speed"},
  }},
  {...makeBoss("earth","Earth Boss","Earth"),abilities:{
    basic:{name:"Tremor Slam",description:"Attacks all adjacent enemies at once"},
    special:{name:"Earthen Charge",description:"Charges to the end of the grid, knocking back and damaging everything in its path"},
    unique:{name:"Crushing Weight",description:"All attacks inflict Slow; gains Haste each time Earthen Charge is used"},
  }},
  {...makeBoss("electric","Electric Boss","Electric"),abilities:{
    basic:{name:"Volt Strike",description:"Attacks an enemy, inflicting Shock which lowers their Haste until it wears off"},
    special:{name:"Arc Burst",description:"Attacks 3 nearby enemies in rapid succession (targets chosen randomly)"},
    unique:{name:"Piercing Current",description:"Can only attack in cardinal directions, but all attacks pierce through every enemy in the line"},
  }},
  {...makeBoss("water","Water Boss","Water"),abilities:{
    basic:{name:"Tidal Shot",description:"Attacks 3 random enemies"},
    special:{name:"Riptide",description:"Pushes all enemies toward the bottom of the grid, dealing damage; enemies stop if blocked by a wall or another unit"},
    unique:{name:"Floodwater",description:"All attacks deal equal splash damage to the 8 surrounding tiles; splash cannot hit the boss"},
  }},
  {...makeBoss("light","Light Boss","Light"),abilities:{
    basic:{name:"Radiant Strike",description:"Attacks 4 tiles wide — the 2 tiles directly in front and 1 tile to each side. Deals bonus damage while shielded"},
    special:{name:"Holy Radiance",description:"Deals damage to all enemies, then gains Power (attack buff) and Shield (absorbs damage until depleted, stackable)"},
    unique:{name:"Bulwark",description:"Deals increased damage to all enemies while shielded"},
  }},
  {...makeBoss("dark","Dark Boss","Dark"),abilities:{
    basic:{name:"Shadow Row",description:"Cloaks the entire grid in shadow, dealing damage and inflicting Damage Over Time (stackable) on all enemies"},
    special:{name:"Cursed Veil",description:"Deals damage to all enemies and inflicts Weak (reduces attack) and Heal Immunity (blocks healing)"},
    unique:{name:"Dark Shroud",description:"Receives reduced damage for each debuffed enemy on the field"},
  }},
  {...makeBoss("wind","Wind Boss","Wind"),abilities:{
    basic:{name:"Gust Strike",description:"Melee attack that knocks the target back 1 tile"},
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

