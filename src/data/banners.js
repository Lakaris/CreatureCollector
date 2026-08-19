// Gacha banners. `rates:null` falls back to RARITY_CONFIG rates.

export const BANNERS=[
  {
    id:"standard",
    name:"Standard Banner",
    sub:"Hatch eggs to discover new creatures",
    color:"#EEEDFE",border:"#CECBF6",titleColor:"#26215C",
    featured:null,
  },
  {
    id:"legendary",
    name:"Legendary Banner",
    sub:"Epic & Legendary creatures only — use Legendary Eggs 🥚✨",
    color:"#FFF8E7",border:"#F5C842",titleColor:"#7A4F00",
    featured:null,
    currency:"legendaryEggs",
    rates:[
      {type:"rarity",rarity:"epic",rate:92},
      {type:"rarity",rarity:"legendary",rate:8},
    ],
  },
  {
    id:"stormwyvern",
    name:"Storm Banner",
    sub:"Boosted odds for Stormwyvern! ⚡",
    color:"#E6F0FB",border:"#A8CEEE",titleColor:"#1A3A5C",
    featured:"stormwyvern",
    rates:[
      {type:"rarity",rarity:"common",rate:90},
      {type:"rarity",rarity:"epic",rate:9.5},
      {type:"creature",id:"stormwyvern",rate:0.25},
      {type:"rarity_excl",rarity:"legendary",exclude:"stormwyvern",rate:0.25},
    ],
  },
];
