// Store catalog. Every bundle/pack below is a real (simulated) purchase --
// see GameContext's purchaseBundle/purchaseGemPack -- there's no actual
// payment provider wired in, so buying just grants the goods instantly.

export const STORE_GEM_PACKS=[
  {id:"gems_small",gems:80,bonus:0,price:"$0.99",badge:null},
  {id:"gems_medium",gems:500,bonus:50,price:"$4.99",badge:"Popular"},
  {id:"gems_large",gems:1200,bonus:200,price:"$9.99",badge:null},
  {id:"gems_xl",gems:2600,bonus:600,price:"$19.99",badge:"Best Value"},
  {id:"gems_xxl",gems:7000,bonus:2000,price:"$49.99",badge:null},
  {id:"gems_mega",gems:15000,bonus:5000,price:"$99.99",badge:null},
];
export const STORE_BUNDLES=[
  // Grants specialPurchased (see GameContext) -- the same flag Farm's Plot
  // 5/6 unlock already reads, so this is the one purchase path for it.
  {id:"starter_pack",name:"Starter Pack",emoji:"🌱",oneTime:true,
   items:["🌾 Unlocks Plot 5","🌾 Unlocks Plot 6","🥚 20 Eggs","🌟 3 Legendary Eggs","🍬 50 Candy","🍌 20 Flair Bananas"],
   grants:{eggs:20,legendaryEggs:3,candy:50,flairBanana:20},
   price:"$9.99",badge:"One-time"},
  // Permanently doubles the daily free Dungeon Pass regen (10 -> 20 -- see
  // DUNGEON_PASS_DAILY_CAP_BONUS in battle/constants.js); doesn't touch drop
  // odds, just how often you can fight. `grants` are the flat currency
  // amounts StoreScreen adds on purchase; the pass-cap bump itself is driven
  // directly by GameContext's dungeonStarterPackPurchased flag, not a currency.
  {id:"dungeon_starter_pack",name:"Dungeon Starter Pack",emoji:"🎫",oneTime:true,
   items:["🎫 +10 Daily Dungeon Pass Cap (10 → 20, permanent)","🥚 20 Eggs","🌟 3 Legendary Eggs","🍬 50 Candy","🍌 20 Flair Bananas"],
   grants:{eggs:20,legendaryEggs:3,candy:50,flairBanana:20},
   price:"$9.99",badge:"One-time"},
  {id:"starter",name:"Starter Bundle",emoji:"🎁",oneTime:true,
   items:["🥚 3 Eggs","🍖 200 Food","🍬 5 Candy"],
   grants:{eggs:3,food:200,candy:5},
   price:"$1.99",badge:"One-time"},
  {id:"adventurer",name:"Adventurer Pack",emoji:"⚔️",
   items:["⚔️ 50 Gear Shards","🎫 10 Dungeon Passes","🍖 300 Food"],
   grants:{equipShards:50,dungeonPass:10,food:300},
   price:"$4.99",badge:null},
  {id:"creature",name:"Creature Bundle",emoji:"🐾",
   items:["🥚 5 Eggs","🍬 10 Candy","🍌 1 Flair Banana"],
   grants:{eggs:5,candy:10,flairBanana:1},
   price:"$7.99",badge:null},
  {id:"legendary",name:"Legendary Bundle",emoji:"🌟",
   items:["🌟 1 Legendary Egg","🍖 500 Food","🍬 20 Candy"],
   grants:{legendaryEggs:1,food:500,candy:20},
   price:"$14.99",badge:"Limited"},
];
