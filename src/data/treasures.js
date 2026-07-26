// Treasure catalog: rarities, collectible sets, and the items themselves.

export const TREASURE_RARITIES={
  common:   {label:"Common",   color:"#555",   bg:"#f5f5f5", border:"#ddd",    rate:60, shards:5},
  rare:     {label:"Rare",     color:"#2563eb",bg:"#eff6ff", border:"#93c5fd", rate:30, shards:15},
  epic:     {label:"Epic",     color:"#7c3aed",bg:"#f5f3ff", border:"#c4b5fd", rate:8,  shards:50},
  legendary:{label:"Legendary",color:"#d97706",bg:"#fffbeb", border:"#fbbf24", rate:2,  shards:150},
};
export const TREASURE_SETS=[
  {id:"ember",  name:"Kitchen Haul",       emoji:"🥫",reward:{melonFire:5},    rewardEmoji:"🍈🔥",rewardLabel:"5 Fire Melons"},
  {id:"ocean",  name:"Tech Salvage",       emoji:"📱",reward:{melonWater:5},   rewardEmoji:"🍈💧",rewardLabel:"5 Water Melons"},
  {id:"forest", name:"Record Collection",  emoji:"💿",reward:{melonNature:5},  rewardEmoji:"🍈🌿",rewardLabel:"5 Nature Melons"},
  {id:"storm",  name:"Medical Cache",      emoji:"🩹",reward:{melonElectric:5},rewardEmoji:"🍈⚡",rewardLabel:"5 Electric Melons"},
  {id:"ancient",name:"The Library",        emoji:"📚",reward:{candy:200},      rewardEmoji:"🍬", rewardLabel:"200 Candy"},
  {id:"royal",  name:"Fashion Vault",      emoji:"👗",reward:{gems:500},       rewardEmoji:"💎", rewardLabel:"500 Gems"},
  // Commons-only sets
  {id:"junk",   name:"Scrap Heap",         emoji:"⚙️",reward:{candy:50},       rewardEmoji:"🍬", rewardLabel:"50 Candy"},
  {id:"pebble", name:"Pocket Finds",       emoji:"🪙",reward:{food:50},        rewardEmoji:"🍖", rewardLabel:"50 Food"},
  {id:"dust",   name:"Paper Trail",        emoji:"📄",reward:{candy:75},       rewardEmoji:"🍬", rewardLabel:"75 Candy"},
  // Legendaries-only sets
  {id:"divine", name:"The Vault",          emoji:"💍",reward:{gems:1000},      rewardEmoji:"💎", rewardLabel:"1000 Gems"},
  {id:"cosmos", name:"The Museum",         emoji:"🏛️",reward:{gems:1500},      rewardEmoji:"💎", rewardLabel:"1500 Gems"},
  {id:"void",   name:"The Lab",            emoji:"🧪",reward:{gems:2000},      rewardEmoji:"💎", rewardLabel:"2000 Gems"},
];
export const TREASURES=[
  // Kitchen Haul — mixed rarities
  {id:"t_ember_1", name:"Sealed Metal Drum",      emoji:"🥫",rarity:"common",   setId:"ember"},
  {id:"t_ember_2", name:"Picture-Food Book",       emoji:"📖",rarity:"rare",     setId:"ember"},
  {id:"t_ember_3", name:"Lid-Prying Claw",         emoji:"🔧",rarity:"epic",     setId:"ember"},
  {id:"t_ember_4", name:"Amber Goop Vessel",       emoji:"🍯",rarity:"legendary",setId:"ember"},
  {id:"t_ember_5", name:"Tiny Round Seal",         emoji:"🪙",rarity:"common",   setId:"ember"},
  {id:"t_ember_6", name:"Scented Dust Pouch",      emoji:"🫙",rarity:"rare",     setId:"ember"},
  // Tech Salvage — mixed rarities
  {id:"t_ocean_1", name:"Drained Power Brick",     emoji:"🔋",rarity:"common",   setId:"ocean"},
  {id:"t_ocean_2", name:"Shattered Black Mirror",  emoji:"📱",rarity:"rare",     setId:"ocean"},
  {id:"t_ocean_3", name:"Humming Voice Box",       emoji:"📻",rarity:"epic",     setId:"ocean"},
  {id:"t_ocean_4", name:"Glowing Folding Slab",    emoji:"💻",rarity:"legendary",setId:"ocean"},
  {id:"t_ocean_5", name:"Knotted Ear Worms",       emoji:"🎧",rarity:"common",   setId:"ocean"},
  {id:"t_ocean_6", name:"Bent Thumb Peg",          emoji:"💾",rarity:"rare",     setId:"ocean"},
  // Record Collection — mixed rarities
  {id:"t_forest_1",name:"Scratched Shiny Disc",    emoji:"💿",rarity:"common",   setId:"forest"},
  {id:"t_forest_2",name:"Grooved Black Circle",    emoji:"🎵",rarity:"rare",     setId:"forest"},
  {id:"t_forest_3",name:"Plastic Memory Brick",    emoji:"🎮",rarity:"epic",     setId:"forest"},
  {id:"t_forest_4",name:"Tiny Song Box",           emoji:"🎶",rarity:"legendary",setId:"forest"},
  {id:"t_forest_5",name:"Faded Crowd Portrait",    emoji:"🖼️",rarity:"common",   setId:"forest"},
  {id:"t_forest_6",name:"Cracked Jewel Case",      emoji:"📀",rarity:"rare",     setId:"forest"},
  // Medical Cache — mixed rarities
  {id:"t_storm_1", name:"Empty Rattle Jar",        emoji:"💊",rarity:"common",   setId:"storm"},
  {id:"t_storm_2", name:"Wrapped Cloth Strip",     emoji:"🩹",rarity:"rare",     setId:"storm"},
  {id:"t_storm_3", name:"Pointy Liquid Stick",     emoji:"💉",rarity:"epic",     setId:"storm"},
  {id:"t_storm_4", name:"Red Cross Supply Box",    emoji:"🧰",rarity:"legendary",setId:"storm"},
  {id:"t_storm_5", name:"Crumpled Soft Square",    emoji:"🧻",rarity:"common",   setId:"storm"},
  {id:"t_storm_6", name:"Stinging Wet Cloth",      emoji:"🧴",rarity:"rare",     setId:"storm"},
  // The Library — mixed rarities
  {id:"t_ancient_1",name:"Torn Word Sheet",        emoji:"📄",rarity:"common",   setId:"ancient"},
  {id:"t_ancient_2",name:"Thick Word Bundle",      emoji:"📚",rarity:"rare",     setId:"ancient"},
  {id:"t_ancient_3",name:"Heavy Knowledge Block",  emoji:"📖",rarity:"epic",     setId:"ancient"},
  {id:"t_ancient_4",name:"Land Drawing Book",      emoji:"🗺️",rarity:"legendary",setId:"ancient"},
  {id:"t_ancient_5",name:"Short Mark Stick",       emoji:"✏️",rarity:"common",   setId:"ancient"},
  {id:"t_ancient_6",name:"Blank Lined Book",       emoji:"📓",rarity:"rare",     setId:"ancient"},
  // Fashion Vault — mixed rarities
  {id:"t_royal_1", name:"Frayed Foot String",      emoji:"👟",rarity:"common",   setId:"royal"},
  {id:"t_royal_2", name:"Ticking Wrist Circle",    emoji:"⌚",rarity:"rare",     setId:"royal"},
  {id:"t_royal_3", name:"Tinted Eye Shields",      emoji:"🕶️",rarity:"epic",     setId:"royal"},
  {id:"t_royal_4", name:"Hinged Portrait Pendant", emoji:"📿",rarity:"legendary",setId:"royal"},
  {id:"t_royal_5", name:"Locking Poke Pin",        emoji:"🪡",rarity:"common",   setId:"royal"},
  {id:"t_royal_6", name:"Hide Waist Strip",        emoji:"👜",rarity:"rare",     setId:"royal"},
  // Scrap Heap — commons only
  {id:"t_junk_1", name:"Bent Iron Spike",          emoji:"🔩",rarity:"common",   setId:"junk"},
  {id:"t_junk_2", name:"Threaded Rust Stick",      emoji:"⚙️",rarity:"common",   setId:"junk"},
  {id:"t_junk_3", name:"Glass Splinter Chunk",     emoji:"🪟",rarity:"common",   setId:"junk"},
  {id:"t_junk_4", name:"Stripped Copper String",   emoji:"🔌",rarity:"common",   setId:"junk"},
  {id:"t_junk_5", name:"Snapped Swivel Joint",     emoji:"🚪",rarity:"common",   setId:"junk"},
  {id:"t_junk_6", name:"Painted Floor Chip",       emoji:"🧱",rarity:"common",   setId:"junk"},
  // Pocket Finds — commons only
  {id:"t_pebble_1",name:"Worn Stamped Disc",       emoji:"🪙",rarity:"common",   setId:"pebble"},
  {id:"t_pebble_2",name:"Punched Paper Strip",     emoji:"🎫",rarity:"common",   setId:"pebble"},
  {id:"t_pebble_3",name:"Foil Candy Sleeve",       emoji:"🍬",rarity:"common",   setId:"pebble"},
  {id:"t_pebble_4",name:"Stretchy Loop Ring",      emoji:"⭕",rarity:"common",   setId:"pebble"},
  {id:"t_pebble_5",name:"Bent Wire Clasp",         emoji:"📎",rarity:"common",   setId:"pebble"},
  {id:"t_pebble_6",name:"Holed Shirt Disc",        emoji:"🔘",rarity:"common",   setId:"pebble"},
  // Paper Trail — commons only
  {id:"t_dust_1", name:"Long Number Strip",        emoji:"🧾",rarity:"common",   setId:"dust"},
  {id:"t_dust_2", name:"Faded Route Sheet",        emoji:"🗺️",rarity:"common",   setId:"dust"},
  {id:"t_dust_3", name:"Yellow Sticky Square",     emoji:"🗒️",rarity:"common",   setId:"dust"},
  {id:"t_dust_4", name:"Sealed Paper Pouch",       emoji:"✉️",rarity:"common",   setId:"dust"},
  {id:"t_dust_5", name:"Faded Face Print",         emoji:"📷",rarity:"common",   setId:"dust"},
  {id:"t_dust_6", name:"Crumpled Picture Paper",   emoji:"💵",rarity:"common",   setId:"dust"},
  // The Vault — legendaries only
  {id:"t_divine_1",name:"Heavy Yellow Brick",      emoji:"🟨",rarity:"legendary",setId:"divine"},
  {id:"t_divine_2",name:"Sparkle Loop",            emoji:"💍",rarity:"legendary",setId:"divine"},
  {id:"t_divine_3",name:"Raw Glinting Rock",       emoji:"💎",rarity:"legendary",setId:"divine"},
  {id:"t_divine_4",name:"Silver Ticking Band",     emoji:"⌚",rarity:"legendary",setId:"divine"},
  {id:"t_divine_5",name:"Strange Minted Disc",     emoji:"🪙",rarity:"legendary",setId:"divine"},
  {id:"t_divine_6",name:"Dark Corked Bottle",      emoji:"🍷",rarity:"legendary",setId:"divine"},
  // The Museum — legendaries only
  {id:"t_cosmos_1",name:"Stone Carved Figure",     emoji:"🗿",rarity:"legendary",setId:"cosmos"},
  {id:"t_cosmos_2",name:"Framed Color Portrait",   emoji:"🖼️",rarity:"legendary",setId:"cosmos"},
  {id:"t_cosmos_3",name:"Wax-Sealed Official Paper",emoji:"📜",rarity:"legendary",setId:"cosmos"},
  {id:"t_cosmos_4",name:"Rock-Trapped Bone Print", emoji:"🦴",rarity:"legendary",setId:"cosmos"},
  {id:"t_cosmos_5",name:"Sky Rock Splinter",       emoji:"☄️",rarity:"legendary",setId:"cosmos"},
  {id:"t_cosmos_6",name:"Jeweled Head Ring",       emoji:"👑",rarity:"legendary",setId:"cosmos"},
  // The Lab — legendaries only
  {id:"t_void_1", name:"Stoppered Glass Tube",     emoji:"🧪",rarity:"legendary",setId:"void"},
  {id:"t_void_2", name:"Clicking Danger Wand",     emoji:"☢️",rarity:"legendary",setId:"void"},
  {id:"t_void_3", name:"Eye-Magnifying Machine",   emoji:"🔬",rarity:"legendary",setId:"void"},
  {id:"t_void_4", name:"Scrawled Data Pages",      emoji:"📋",rarity:"legendary",setId:"void"},
  {id:"t_void_5", name:"Glowing Sample Jar",       emoji:"⚗️",rarity:"legendary",setId:"void"},
  {id:"t_void_6", name:"Tiny Circuit Wafer",       emoji:"💡",rarity:"legendary",setId:"void"},
];
export const TREASURE_MAP=Object.fromEntries(TREASURES.map(t=>[t.id,t]));
