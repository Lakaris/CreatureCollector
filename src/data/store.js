// Store catalog. Purchases are not wired to a payment provider.

export const STORE_GEM_PACKS=[
  {id:"gems_small",gems:80,bonus:0,price:"$0.99",badge:null},
  {id:"gems_medium",gems:500,bonus:50,price:"$4.99",badge:"Popular"},
  {id:"gems_large",gems:1200,bonus:200,price:"$9.99",badge:null},
  {id:"gems_xl",gems:2600,bonus:600,price:"$19.99",badge:"Best Value"},
  {id:"gems_xxl",gems:7000,bonus:2000,price:"$49.99",badge:null},
  {id:"gems_mega",gems:15000,bonus:5000,price:"$99.99",badge:null},
];
export const STORE_BUNDLES=[
  {id:"starter_pack",name:"Starter Pack",emoji:"🌱",items:["🌾 Unlocks Plot 5","🌾 Unlocks Plot 6","🥚 20 Eggs","🌟 3 Legendary Eggs","🍬 50 Candy","🍌 20 Flair Bananas"],price:"$9.99",badge:"One-time"},
  {id:"starter",name:"Starter Bundle",emoji:"🎁",items:["🥚 3 Eggs","🍖 200 Food","🍬 5 Candy"],price:"$1.99",badge:"One-time"},
  {id:"adventurer",name:"Adventurer Pack",emoji:"⚔️",items:["⚔️ 50 Gear Shards","🎫 10 Dungeon Passes","🍖 300 Food"],price:"$4.99",badge:null},
  {id:"creature",name:"Creature Bundle",emoji:"🐾",items:["🥚 5 Eggs","🍬 10 Candy","🍌 1 Flair Banana"],price:"$7.99",badge:null},
  {id:"legendary",name:"Legendary Bundle",emoji:"🌟",items:["🌟 1 Legendary Egg","🍖 500 Food","🍬 20 Candy"],price:"$14.99",badge:"Limited"},
];
