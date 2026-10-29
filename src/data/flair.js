// Flair: cosmetic titles, auras, backgrounds, and items -- each carrying a stat buff.
//
// IMPORTANT: every entry in a creature`s `unlockedFlair` list contributes its buff
// passively. The `equippedTitle`/`equippedAura`/`equippedBackground`/`equippedItem`
// fields are purely cosmetic and do NOT gate the stat bonus.

export const FLAIR_RARITIES=[{id:"common",label:"Common"},{id:"rare",label:"Rare"},{id:"epic",label:"Epic"},{id:"legendary",label:"Legendary"}];
// Short forms for the crit pair. A flair's buff line lives in a card barely
// 60px wide, and "+0.1% Crit Chance" does not fit even at the smallest size the
// auto-fitting label will go to -- it ellipsized. These match the abbreviations
// the creature page's stat pills already use.
export const BUFF_STAT_LABEL={hp:"Health",atk:"Attack",def:"Defense",spd:"Speed",abilitySpeed:"Haste",crit:"Crit",critDmg:"Crit Dmg"};
export const FLAIR_TITLES={
  common:[
    {name:"Bold",      buff:{stat:"hp",           pct:0.5}},
    {name:"Brave",     buff:{stat:"hp",           pct:0.5}},
    {name:"Sturdy",    buff:{stat:"hp",           pct:0.5}},
    {name:"Hardy",     buff:{stat:"hp",           pct:0.5}},
    {name:"Fierce",    buff:{stat:"atk",          pct:0.5}},
    {name:"Mighty",    buff:{stat:"atk",          pct:0.5}},
    {name:"Sharp",     buff:{stat:"atk",          pct:0.5}},
    {name:"Daring",    buff:{stat:"atk",          pct:0.5}},
    {name:"Strong",    buff:{stat:"def",          pct:0.5}},
    {name:"Noble",     buff:{stat:"def",          pct:0.5}},
    {name:"Steady",    buff:{stat:"def",          pct:0.5}},
    {name:"True",      buff:{stat:"def",          pct:0.5}},
    {name:"Swift",     buff:{stat:"spd",          pct:0.1}},
    {name:"Keen",      buff:{stat:"spd",          pct:0.1}},
    {name:"Quick",     buff:{stat:"spd",          pct:0.1}},
    {name:"Loyal",     buff:{stat:"crit",         pct:0.1}},
    {name:"Clever",    buff:{stat:"abilitySpeed", pct:0.1}},
    {name:"Proud",     buff:{stat:"abilitySpeed", pct:0.1}},
    {name:"Fair",      buff:{stat:"abilitySpeed", pct:0.1}},
    {name:"Wise",      buff:{stat:"critDmg",      pct:0.5}},
  ],
  rare:[
    {name:"Stone Guard",     buff:{stat:"hp",           pct:1}},
    {name:"Frost Touched",   buff:{stat:"hp",           pct:1}},
    {name:"Crest Bearer",    buff:{stat:"hp",           pct:1}},
    {name:"Storm-Born",      buff:{stat:"hp",           pct:1}},
    {name:"Iron-Willed",     buff:{stat:"atk",          pct:1}},
    {name:"Thunder Striker", buff:{stat:"atk",          pct:1}},
    {name:"Blade Dancer",    buff:{stat:"atk",          pct:1}},
    {name:"Claw Marked",     buff:{stat:"atk",          pct:1}},
    {name:"Shadow Walker",   buff:{stat:"def",          pct:1}},
    {name:"Night Prowler",   buff:{stat:"def",          pct:1}},
    {name:"Ember Bearer",    buff:{stat:"def",          pct:1}},
    {name:"Rune Keeper",     buff:{stat:"def",          pct:1}},
    {name:"Wind Chaser",     buff:{stat:"spd",          pct:0.3}},
    {name:"Wave Rider",      buff:{stat:"spd",          pct:0.3}},
    {name:"Dawn Breaker",    buff:{stat:"spd",          pct:0.3}},
    {name:"Tide Caller",     buff:{stat:"crit",         pct:0.2}},
    {name:"Star Gazer",      buff:{stat:"abilitySpeed", pct:0.3}},
    {name:"Void Seeker",     buff:{stat:"abilitySpeed", pct:0.3}},
    {name:"Soul Binder",     buff:{stat:"abilitySpeed", pct:0.3}},
    {name:"Flame Keeper",    buff:{stat:"critDmg",      pct:1}},
  ],
  epic:[
    {name:"Titan of the Frost",   buff:{stat:"hp",           pct:3}},
    {name:"Colossus of Light",    buff:{stat:"hp",           pct:3}},
    {name:"Guardian of Flame",    buff:{stat:"hp",           pct:3}},
    {name:"Champion of the Deep", buff:{stat:"hp",           pct:3}},
    {name:"Devourer of Storms",   buff:{stat:"atk",          pct:3}},
    {name:"Slayer of Shadows",    buff:{stat:"atk",          pct:3}},
    {name:"Breaker of Chains",    buff:{stat:"atk",          pct:3}},
    {name:"Conqueror of Dusk",    buff:{stat:"atk",          pct:3}},
    {name:"Warden of the Void",   buff:{stat:"def",          pct:3}},
    {name:"Celestial Warden",     buff:{stat:"def",          pct:3}},
    {name:"Undying Valor",        buff:{stat:"def",          pct:3}},
    {name:"Boundless Fury",       buff:{stat:"def",          pct:3}},
    {name:"Harbinger of Dawn",    buff:{stat:"spd",          pct:0.5}},
    {name:"Tempest Incarnate",    buff:{stat:"spd",          pct:0.5}},
    {name:"Ascendant Flame",      buff:{stat:"spd",          pct:0.5}},
    {name:"Herald of Thunder",    buff:{stat:"crit",         pct:0.25}},
    {name:"Sovereign of Tides",   buff:{stat:"abilitySpeed", pct:0.5}},
    {name:"Seeker of Eternity",   buff:{stat:"abilitySpeed", pct:0.5}},
    {name:"Emperor of Wind",      buff:{stat:"abilitySpeed", pct:0.5}},
    {name:"Oracle of Stars",      buff:{stat:"critDmg",      pct:2}},
  ],
  legendary:[
    {name:"Eternal Colossus",     buff:{stat:"hp",           pct:5}},
    {name:"Primordial",           buff:{stat:"hp",           pct:5}},
    {name:"Undying",              buff:{stat:"hp",           pct:5}},
    {name:"Inevitable",           buff:{stat:"hp",           pct:5}},
    {name:"Eater of Worlds",      buff:{stat:"atk",          pct:5}},
    {name:"Destroyer of Realms",  buff:{stat:"atk",          pct:5}},
    {name:"Annihilator of Ages",  buff:{stat:"atk",          pct:5}},
    {name:"Shatterer of Stars",   buff:{stat:"atk",          pct:5}},
    {name:"Immortal",             buff:{stat:"def",          pct:5}},
    {name:"Unbroken",             buff:{stat:"def",          pct:5}},
    {name:"Sovereign of All",     buff:{stat:"def",          pct:5}},
    {name:"Bearer of Eternity",   buff:{stat:"def",          pct:5}},
    {name:"Last Light",           buff:{stat:"spd",          pct:1}},
    {name:"First Born",           buff:{stat:"spd",          pct:1}},
    {name:"Architect of Fate",    buff:{stat:"spd",          pct:1}},
    {name:"Lord of the Void",     buff:{stat:"crit",         pct:0.5}},
    {name:"God of Ruin",          buff:{stat:"abilitySpeed", pct:1}},
    {name:"Bringer of the End",   buff:{stat:"abilitySpeed", pct:1}},
    {name:"Ruler of the Infinite",buff:{stat:"abilitySpeed", pct:1}},
    {name:"Ascendant God",        buff:{stat:"critDmg",      pct:5}},
  ],
};
export const FLAIR_TITLE_MAP=Object.fromEntries(Object.values(FLAIR_TITLES).flat().map(t=>[t.name,t]));
export const FLAIR_AURAS={
  common:[
    {id:"white_sparkles",name:"White Sparkles",emoji:"✨",desc:"Gentle white sparkles drift upward"},
    {id:"yellow_sparkles",name:"Yellow Sparkles",emoji:"💛",desc:"Soft yellow flecks catch the light"},
    {id:"pink_sparkles",name:"Pink Sparkles",emoji:"🌸",desc:"Delicate pink motes float around"},
    {id:"blue_sparkles",name:"Blue Sparkles",emoji:"💧",desc:"Calm blue glimmers shimmer softly"},
    {id:"green_sparkles",name:"Green Sparkles",emoji:"🌿",desc:"Tiny green sparks like fireflies"},
    {id:"orange_sparkles",name:"Orange Sparkles",emoji:"🔶",desc:"Warm orange flickers glow faintly"},
    {id:"leaf_fall",name:"Falling Leaves",emoji:"🍂",desc:"Small leaves drift down around the creature"},
    {id:"bubbles",name:"Bubbles",emoji:"🫧",desc:"Tiny soap bubbles float upward"},
    {id:"snowflakes",name:"Snowflakes",emoji:"❄️",desc:"Light snowflakes swirl gently"},
    {id:"petals",name:"Rose Petals",emoji:"🌹",desc:"Pink petals fall in a slow spiral"},
    {id:"dust_puff",name:"Dust Puff",emoji:"💨",desc:"A faint cloud of dust lingers at the feet"},
    {id:"dandelion",name:"Dandelion Seeds",emoji:"🌾",desc:"Fluffy seeds drift lazily in the breeze"},
    {id:"smoke_white",name:"White Smoke",emoji:"🌫️",desc:"A thin wisp of white smoke curls upward"},
    {id:"water_drip",name:"Water Drips",emoji:"💦",desc:"Small droplets fall from the creature"},
    {id:"clovers",name:"Clovers",emoji:"🍀",desc:"Lucky clovers tumble past the creature"},
    {id:"stars_tiny",name:"Tiny Stars",emoji:"⭐",desc:"Faint pinprick stars orbit slowly",buff:{stat:"crit",pct:0.1}},
    {id:"hearts_small",name:"Small Hearts",emoji:"🤍",desc:"Pale white hearts float upward"},
    {id:"wind_lines",name:"Wind Lines",emoji:"🌬️",desc:"Soft streaks of wind trail behind"},
    {id:"embers_cool",name:"Cool Embers",emoji:"🩶",desc:"Gray embers drift up and fade"},
    {id:"dew_drops",name:"Dew Drops",emoji:"🌊",desc:"Glistening droplets bead along the ground",buff:{stat:"critDmg",pct:0.5}},
  ],
  rare:[
    {id:"flame_blue",name:"Blue Flame",emoji:"🔵",desc:"Cool blue flames lick upward from the feet"},
    {id:"lightning_sparks",name:"Lightning Sparks",emoji:"⚡",desc:"Small electric arcs crackle around the body"},
    {id:"frost_ground",name:"Frost Ground",emoji:"🧊",desc:"A ring of frost spreads across the ground"},
    {id:"shadow_wisps",name:"Shadow Wisps",emoji:"🌑",desc:"Dark tendrils curl away from the creature"},
    {id:"wind_vortex",name:"Wind Vortex",emoji:"🌀",desc:"A small cyclone of air swirls at the feet"},
    {id:"gold_coins",name:"Gold Coins",emoji:"🪙",desc:"Coins rain down and vanish on impact"},
    {id:"fireflies",name:"Fireflies",emoji:"🟡",desc:"Glowing points of light orbit the creature"},
    {id:"purple_smoke",name:"Purple Smoke",emoji:"🟣",desc:"Violet smoke curls up from the ground"},
    {id:"tide_ripple",name:"Tide Ripple",emoji:"🌊",desc:"Rippling water spreads outward underfoot"},
    {id:"star_trail",name:"Star Trail",emoji:"🌟",desc:"A trail of stars follows each step"},
    {id:"iron_shards",name:"Iron Shards",emoji:"🔩",desc:"Metal fragments orbit in a tight ring"},
    {id:"pollen_cloud",name:"Pollen Cloud",emoji:"🌼",desc:"A golden pollen haze drifts around"},
    {id:"sand_swirl",name:"Sand Swirl",emoji:"🏜️",desc:"Fine sand spirals at ground level"},
    {id:"ink_drops",name:"Ink Drops",emoji:"🖤",desc:"Black droplets splash and fade underfoot"},
    {id:"crystal_shards",name:"Crystal Shards",emoji:"💎",desc:"Small crystals float and slowly rotate"},
    {id:"ember_orange",name:"Orange Embers",emoji:"🔥",desc:"Hot orange embers drift and flicker upward",buff:{stat:"crit",pct:0.2}},
    {id:"aurora_green",name:"Green Aurora",emoji:"💚",desc:"A faint green aurora ripples behind the creature"},
    {id:"thunder_ground",name:"Thunder Ground",emoji:"🌩️",desc:"Cracks of lightning branch across the floor"},
    {id:"vine_crawl",name:"Crawling Vines",emoji:"🌱",desc:"Thin vines creep outward from the feet"},
    {id:"snow_burst",name:"Snow Burst",emoji:"⛄",desc:"A burst of snowflakes radiates outward with each step",buff:{stat:"critDmg",pct:1}},
  ],
  epic:[
    {id:"lava_ground",name:"Lava Cracks",emoji:"🌋",desc:"Glowing lava seeps through cracks in the ground"},
    {id:"storm_halo",name:"Storm Halo",emoji:"🌪️",desc:"A ring of storm clouds encircles the creature"},
    {id:"void_tendrils",name:"Void Tendrils",emoji:"🌌",desc:"Shadowy tendrils reach from a rift beneath"},
    {id:"phoenix_trail",name:"Phoenix Trail",emoji:"🦅",desc:"Golden-red feathers erupt and burn away behind"},
    {id:"galaxy_ring",name:"Galaxy Ring",emoji:"🌠",desc:"A rotating band of stars orbits at waist height"},
    {id:"lightning_pillar",name:"Lightning Pillar",emoji:"⚡",desc:"A column of electricity surges from the feet upward"},
    {id:"ice_crown",name:"Ice Crown",emoji:"👑",desc:"Jagged ice shards orbit the creature's head"},
    {id:"blood_rain",name:"Crimson Rain",emoji:"🔴",desc:"Red droplets fall in a tight circle around the creature"},
    {id:"soul_orbs",name:"Soul Orbs",emoji:"🫀",desc:"Glowing orbs of light pulse and orbit slowly"},
    {id:"nature_bloom",name:"Nature Bloom",emoji:"🌺",desc:"Flowers bloom and wither rapidly underfoot"},
    {id:"dark_vortex",name:"Dark Vortex",emoji:"🕳️",desc:"A spinning void opens beneath with each step"},
    {id:"radiant_wings",name:"Radiant Wings",emoji:"🦋",desc:"Beams of light fan out like wings of pure energy"},
    {id:"tide_surge",name:"Tide Surge",emoji:"🌊",desc:"Crashing waves radiate outward along the ground"},
    {id:"time_shatter",name:"Time Shatter",emoji:"⏳",desc:"Hourglasses and clocks fragment and orbit the creature"},
    {id:"ember_vortex",name:"Ember Vortex",emoji:"🔥",desc:"A spinning column of fire wraps the creature's body"},
    {id:"crystal_bloom",name:"Crystal Bloom",emoji:"💜",desc:"Amethyst crystals bloom and shatter on the ground",buff:{stat:"crit",pct:0.25}},
    {id:"thunder_wings",name:"Thunder Wings",emoji:"🦅",desc:"Arcing electricity forms the silhouette of huge wings"},
    {id:"plague_mist",name:"Plague Mist",emoji:"☠️",desc:"Sickly green mist rolls across the ground"},
    {id:"starfall",name:"Starfall",emoji:"💫",desc:"Stars plummet in streams around the creature"},
    {id:"iron_fortress",name:"Iron Fortress",emoji:"🏰",desc:"Heavy metallic plates rotate in a slow defensive ring",buff:{stat:"critDmg",pct:2}},
  ],
  legendary:[
    {id:"cosmic_collapse",name:"Cosmic Collapse",emoji:"🌌",desc:"A miniature galaxy implodes and reforms around the creature"},
    {id:"sun_corona",name:"Solar Corona",emoji:"☀️",desc:"A blazing corona of white-hot plasma crowns the creature"},
    {id:"apocalypse_ground",name:"Apocalypse Ground",emoji:"💥",desc:"The ground fractures and crumbles with every step"},
    {id:"black_hole",name:"Black Hole",emoji:"🕳️",desc:"A swirling singularity pulls light inward at the creature's feet"},
    {id:"angel_descent",name:"Divine Descent",emoji:"😇",desc:"Beams of golden light pour down from above onto the creature"},
    {id:"oblivion_wings",name:"Oblivion Wings",emoji:"🦇",desc:"Massive void wings of pure darkness unfurl from the back"},
    {id:"eternal_flame",name:"Eternal Flame",emoji:"🔥",desc:"An undying pillar of white fire burns endlessly at the core"},
    {id:"time_rift",name:"Time Rift",emoji:"⌛",desc:"Reality tears open — past and future versions flicker around"},
    {id:"world_roots",name:"World Roots",emoji:"🌍",desc:"Massive ancient roots burst from the earth and encircle"},
    {id:"judgement_rays",name:"Judgement Rays",emoji:"⚡",desc:"Dozens of lightning bolts radiate outward in all directions"},
    {id:"supernova",name:"Supernova",emoji:"💥",desc:"A blinding explosion of energy constantly radiates outward"},
    {id:"void_sovereign",name:"Void Sovereign",emoji:"👁️",desc:"A massive eye opens in the void beneath the creature"},
    {id:"reaper_mist",name:"Reaper Mist",emoji:"💀",desc:"Skulls and dark smoke pour from the creature like a river"},
    {id:"celestial_armor",name:"Celestial Armor",emoji:"✨",desc:"Plate armor of pure starlight assembles and dissolves"},
    {id:"death_clock",name:"Death Clock",emoji:"🕰️",desc:"A colossal clock face emerges, ticking down ominously"},
    {id:"genesis_bloom",name:"Genesis Bloom",emoji:"🌸",desc:"A whole ecosystem blooms to life and dies with each step",buff:{stat:"crit",pct:0.5}},
    {id:"chaos_storm",name:"Chaos Storm",emoji:"🌪️",desc:"Every element erupts at once in a violent spiraling storm"},
    {id:"eternal_winter",name:"Eternal Winter",emoji:"❄️",desc:"A blizzard of absolute zero encases the surrounding ground"},
    {id:"eclipse_halo",name:"Eclipse Halo",emoji:"🌑",desc:"A permanent solar eclipse follows overhead, casting divine shadow"},
    {id:"omnipotent_glow",name:"Omnipotent Glow",emoji:"🌟",desc:"Pure blinding white light radiates from every inch of the body",buff:{stat:"critDmg",pct:5}},
  ],
};
// Replaced backgrounds keep their old id (bg_market is now Pine Forest, and so
// on) so saves that already unlocked or equipped them carry over. Each one also
// keeps its slot, since an entry's position picks its default buff below.
export const FLAIR_BACKGROUNDS={
  common:[
    {id:"bg_plains",name:"Open Plains",emoji:"🌾",image:"images/flair/backgrounds/OpenPlains.jpg",desc:"A simple stretch of flat grassy plains"},
    {id:"bg_beach",name:"Sandy Beach",emoji:"🏖️",image:"images/flair/backgrounds/SandyBeach.jpg",desc:"Warm sand with gentle waves in the distance"},
    {id:"bg_forest",name:"Forest Clearing",emoji:"🌲",image:"images/flair/backgrounds/ForestClearing.jpg",desc:"A quiet clearing surrounded by tall trees"},
    {id:"bg_cave",name:"Rocky Cave",emoji:"🪨",image:"images/flair/backgrounds/RockyCave.jpg",desc:"A dim cave with stone walls and a dirt floor"},
    {id:"bg_field",name:"Flower Field",emoji:"🌼",image:"images/flair/backgrounds/FlowerField.jpg",desc:"A colorful field dotted with wildflowers"},
    {id:"bg_pond",name:"Pond Side",emoji:"🐸",image:"images/flair/backgrounds/PondSide.jpg",desc:"A muddy bank beside a still pond"},
    {id:"bg_dusk",name:"Dusk Sky",emoji:"🌅",image:"images/flair/backgrounds/DuskSky.jpg",desc:"A warm orange and pink dusk horizon"},
    {id:"bg_night",name:"Starry Night",emoji:"🌙",image:"images/flair/backgrounds/StarryNight.jpg",desc:"A clear night sky with twinkling stars"},
    {id:"bg_barn",name:"Old Barn",emoji:"🏚️",image:"images/flair/backgrounds/OldBarn.jpg",desc:"A weathered barn with hay scattered around"},
    {id:"bg_hills",name:"Rolling Hills",emoji:"⛰️",image:"images/flair/backgrounds/RollingHills.jpg",desc:"Gentle hills rolling into the horizon"},
    {id:"bg_river",name:"River Bank",emoji:"🏞️",image:"images/flair/backgrounds/RiverBank.jpg",desc:"A calm river flowing past mossy rocks"},
    {id:"bg_fog",name:"Tide Pools",emoji:"🦀",image:"images/flair/backgrounds/TidePools.jpg",desc:"Wet rocks dotted with starfish and shallow pools"},
    {id:"bg_mud",name:"Muddy Swamp",emoji:"🟤",image:"images/flair/backgrounds/MuddySwamp.jpg",desc:"A boggy swamp with murky water patches"},
    {id:"bg_snow_plain",name:"Snowy Field",emoji:"🌨️",image:"images/flair/backgrounds/SnowyField.jpg",desc:"A flat field blanketed in fresh snow"},
    // Formerly "Village Road" -- the id stays bg_village so saves that
    // already unlocked or equipped it carry over.
    {id:"bg_village",name:"Secluded Cove",emoji:"🏝️",image:"images/flair/backgrounds/SecludedCove.jpg",desc:"A hidden sandy cove sheltered by towering sea rocks"},
    {id:"bg_market",name:"Pine Forest",emoji:"🌲",image:"images/flair/backgrounds/PineForest.jpg",desc:"Tall dark evergreens over a floor of needles",buff:{stat:"crit",pct:0.1}},
    {id:"bg_canyon",name:"Dry Canyon",emoji:"🏜️",image:"images/flair/backgrounds/DryCanyon.jpg",desc:"A cracked canyon floor under harsh sun"},
    {id:"bg_autumn",name:"Autumn Woods",emoji:"🍁",image:"images/flair/backgrounds/AutumnWoods.jpg",desc:"Trees blazing with red and gold autumn color"},
    {id:"bg_sunrise",name:"Sunrise Meadow",emoji:"🌄",image:"images/flair/backgrounds/SunriseMeadow.jpg",desc:"A dewy meadow glowing in soft sunrise light"},
    {id:"bg_dock",name:"Grassy Dunes",emoji:"🏖️",image:"images/flair/backgrounds/GrassyDunes.jpg",desc:"Sand hills held together by tall beach grass",buff:{stat:"critDmg",pct:0.5}},
  ],
  rare:[
    {id:"bg_volcano",name:"Volcanic Ridge",emoji:"🌋",image:"images/flair/backgrounds/VolcanicRidge.jpg",desc:"A smoking ridge overlooking a lava lake"},
    {id:"bg_glacier",name:"Glacier Cliffs",emoji:"🧊",image:"images/flair/backgrounds/GlacierCliffs.jpg",desc:"Towering blue-white ice cliffs in the arctic"},
    {id:"bg_storm",name:"Stormy Cliffs",emoji:"⛈️",image:"images/flair/backgrounds/StormyCliffs.jpg",desc:"Crashing waves and lightning-lit dark cliffs"},
    {id:"bg_jungle",name:"Dense Jungle",emoji:"🌴",image:"images/flair/backgrounds/DenseJungle.jpg",desc:"A thick jungle teeming with vines and ferns"},
    {id:"bg_ruins",name:"Ancient Ruins",emoji:"🏛️",image:"images/flair/backgrounds/AncientRuins.jpg",desc:"Crumbling stone pillars of a forgotten civilization"},
    {id:"bg_desert_night",name:"Desert Night",emoji:"🌃",image:"images/flair/backgrounds/DesertNight.jpg",desc:"A vast dark desert under a brilliant moon"},
    {id:"bg_waterfall",name:"Waterfall Grotto",emoji:"💧",image:"images/flair/backgrounds/WaterfallGrotto.jpg",desc:"A lush grotto hidden behind a cascading waterfall"},
    {id:"bg_tundra",name:"Frozen Tundra",emoji:"🐺",image:"images/flair/backgrounds/FrozenTundra.jpg",desc:"A windswept icy tundra under grey skies"},
    {id:"bg_mushroom",name:"Mushroom Forest",emoji:"🍄",image:"images/flair/backgrounds/MushroomForest.jpg",desc:"A forest of glowing oversized mushrooms"},
    {id:"bg_sky_islands",name:"Sky Islands",emoji:"☁️",image:"images/flair/backgrounds/SkyIslands.jpg",desc:"Floating islands drifting above the clouds"},
    {id:"bg_deep_sea",name:"Deep Sea Floor",emoji:"🐠",image:"images/flair/backgrounds/DeepSeaFloor.jpg",desc:"The glowing bioluminescent ocean floor"},
    {id:"bg_catacombs",name:"Catacombs",emoji:"💀",image:"images/flair/backgrounds/Catacombs.jpg",desc:"Ancient bone-lined tunnels lit by dim torches"},
    {id:"bg_crystal_cave",name:"Crystal Cave",emoji:"💎",image:"images/flair/backgrounds/CrystalCave.jpg",desc:"A cavern encrusted with glittering gemstone walls"},
    {id:"bg_arena",name:"Stone Bridge",emoji:"🌉",image:"images/flair/backgrounds/StoneBridge.jpg",desc:"An old arched stone bridge over a babbling creek"},
    {id:"bg_clocktower",name:"Cactus Flats",emoji:"🌵",image:"images/flair/backgrounds/CactusFlats.jpg",desc:"Saguaros and scrub on sun-baked red dirt"},
    {id:"bg_shipwreck",name:"Shipwreck",emoji:"⛵",image:"images/flair/backgrounds/Shipwreck.jpg",desc:"A sunken ship resting on the sea floor",buff:{stat:"crit",pct:0.2}},
    {id:"bg_bamboo",name:"Bamboo Grove",emoji:"🎋",image:"images/flair/backgrounds/BambooGrove.jpg",desc:"A serene grove of tall swaying bamboo"},
    {id:"bg_aurora",name:"Aurora Valley",emoji:"🌌",image:"images/flair/backgrounds/AuroraValley.jpg",desc:"A snowy valley under dancing aurora lights"},
    {id:"bg_savanna",name:"Savanna Dusk",emoji:"🦁",image:"images/flair/backgrounds/SavannaDusk.jpg",desc:"A wide savanna bathed in fiery dusk light"},
    {id:"bg_haunted",name:"Cloudy Skies",emoji:"☁️",image:"images/flair/backgrounds/CloudySkies.jpg",desc:"Soft white clouds drifting across a bright sky",buff:{stat:"critDmg",pct:1}},
  ],
  epic:[
    {id:"bg_sky_fortress",name:"Coral Reef",emoji:"🪸",image:"images/flair/backgrounds/CoralReef.jpg",desc:"Colorful coral with schools of fish swimming past"},
    {id:"bg_void_rift",name:"Redwood Grove",emoji:"🌲",image:"images/flair/backgrounds/RedwoodGrove.jpg",desc:"Towering red trunks with sunlight slanting between them"},
    {id:"bg_lava_sea",name:"Lava Sea",emoji:"🔥",image:"images/flair/backgrounds/LavaSea.jpg",desc:"A churning ocean of molten rock under red skies"},
    {id:"bg_storm_eye",name:"Hot Springs",emoji:"♨️",image:"images/flair/backgrounds/HotSprings.jpg",desc:"Steaming pools tucked among snowy rocks"},
    {id:"bg_ancient_god",name:"Mangrove Swamp",emoji:"🌿",image:"images/flair/backgrounds/MangroveSwamp.jpg",desc:"Twisted roots arching over dark, still water"},
    {id:"bg_astral",name:"Kelp Forest",emoji:"🌊",image:"images/flair/backgrounds/KelpForest.jpg",desc:"Tall swaying kelp with sunlight rippling from above"},
    {id:"bg_frozen_palace",name:"Alpine Lake",emoji:"🏔️",image:"images/flair/backgrounds/AlpineLake.jpg",desc:"A mirror-still lake ringed by snowy peaks"},
    {id:"bg_titan_bones",name:"Titan's Graveyard",emoji:"🦴",image:"images/flair/backgrounds/TitansGraveyard.jpg",desc:"A vast field of colossal creature bones jutting from the earth"},
    {id:"bg_eclipse",name:"Cloud Forest",emoji:"🌫️",image:"images/flair/backgrounds/CloudForest.jpg",desc:"Moss-draped trees wrapped in drifting mist"},
    {id:"bg_overgrown_city",name:"Seagrass Meadow",emoji:"🐢",image:"images/flair/backgrounds/SeagrassMeadow.jpg",desc:"An underwater field of waving grass lit by sunbeams"},
    {id:"bg_thunder_peaks",name:"Thunder Peaks",emoji:"⛰️",image:"images/flair/backgrounds/ThunderPeaks.jpg",desc:"Mountain peaks where continuous storms rage eternally"},
    {id:"bg_ocean_abyss",name:"Ocean Abyss",emoji:"🌊",image:"images/flair/backgrounds/OceanAbyss.jpg",desc:"The crushing darkness of the deepest ocean trench"},
    {id:"bg_dragon_nest",name:"Desert Oasis",emoji:"🌴",image:"images/flair/backgrounds/DesertOasis.jpg",desc:"Palms circling a clear pool among the dunes"},
    {id:"bg_time_ruins",name:"Lotus Lake",emoji:"🪷",image:"images/flair/backgrounds/LotusLake.jpg",desc:"Pink lotus flowers rising above calm green water"},
    {id:"bg_mirror_world",name:"Glass Beach",emoji:"🫧",image:"images/flair/backgrounds/GlassBeach.jpg",desc:"A shore of smooth, colorful sea glass"},
    {id:"bg_celestial_garden",name:"Celestial Garden",emoji:"🌸",image:"images/flair/backgrounds/CelestialGarden.jpg",desc:"A garden floating among the stars, blooming eternally",buff:{stat:"crit",pct:0.25}},
    {id:"bg_war_torn",name:"Winter Taiga",emoji:"🌨️",image:"images/flair/backgrounds/WinterTaiga.jpg",desc:"Snow-heavy spruce forest under a low winter sun"},
    {id:"bg_soul_river",name:"Rainbow Plains",emoji:"🌈",image:"images/flair/backgrounds/RainbowPlains.jpg",desc:"Open grassland under a bright arching rainbow"},
    {id:"bg_worldtree",name:"World Tree",emoji:"🌳",image:"images/flair/backgrounds/WorldTree.jpg",desc:"The roots and canopy of an impossibly large world tree"},
    {id:"bg_neon_city",name:"Starlit Meadow",emoji:"✨",image:"images/flair/backgrounds/StarlitMeadow.jpg",desc:"A grassy meadow under a sky full of stars",buff:{stat:"critDmg",pct:2}},
  ],
  legendary:[
    {id:"bg_genesis",name:"Erupting Caldera",emoji:"🌋",image:"images/flair/backgrounds/EruptingCaldera.jpg",desc:"A volcano mid-eruption, its ash cloud crackling with lightning"},
    {id:"bg_end_of_time",name:"Calving Glacier",emoji:"🧊",image:"images/flair/backgrounds/CalvingGlacier.jpg",desc:"A towering wall of ice collapsing into the sea"},
    {id:"bg_pantheon",name:"Tepui Falls",emoji:"🏞️",image:"images/flair/backgrounds/TepuiFalls.jpg",desc:"A flat-topped mountain pouring waterfalls off every side"},
    {id:"bg_infinite_void",name:"Infinite Void",emoji:"🕳️",image:"images/flair/backgrounds/InfiniteVoid.jpg",desc:"An endless, featureless void of absolute nothingness"},
    {id:"bg_heart_of_sun",name:"Nova Nebula",emoji:"🌌",image:"images/flair/backgrounds/NovaNebula.jpg",desc:"A glowing cloud of colorful gas left by an exploding star"},
    {id:"bg_shattered_world",name:"Shattered World",emoji:"💥",image:"images/flair/backgrounds/ShatteredWorld.jpg",desc:"A planet mid-explosion, chunks drifting through space"},
    {id:"bg_nightmare",name:"Living Nightmare",emoji:"😱",image:"images/flair/backgrounds/LivingNightmare.jpg",desc:"A shifting, screaming dreamscape of impossible geometry"},
    {id:"bg_rebirth",name:"Endless Space",emoji:"🪐",image:"images/flair/backgrounds/EndlessSpace.jpg",desc:"Deep space scattered with distant stars and planets"},
    {id:"bg_divine_throne",name:"Dragon's Hoard",emoji:"🐉",image:"images/flair/backgrounds/DragonsHoard.jpg",desc:"A vast cavern heaped with gold and jewels"},
    {id:"bg_oblivion",name:"Moonbow Falls",emoji:"🌙",image:"images/flair/backgrounds/MoonbowFalls.jpg",desc:"A waterfall at night crowned by a pale moonlit rainbow"},
    {id:"bg_war_of_gods",name:"Frozen Falls",emoji:"❄️",image:"images/flair/backgrounds/FrozenFalls.jpg",desc:"A great waterfall frozen solid mid-cascade"},
    {id:"bg_primordial_sea",name:"Primordial Sea",emoji:"🌊",image:"images/flair/backgrounds/PrimordialSea.jpg",desc:"The infinite ocean that existed before the world was born"},
    {id:"bg_omniscience",name:"Penitente Field",emoji:"🏔️",image:"images/flair/backgrounds/PenitenteField.jpg",desc:"Tall blade-like spikes of snow on a high plateau"},
    {id:"bg_singularity",name:"Bioluminescent Cavern",emoji:"🍄",image:"images/flair/backgrounds/BioluminescentCavern.jpg",desc:"Glowing mushrooms and blue pools deep underground"},
    {id:"bg_false_heaven",name:"Hanging Gardens",emoji:"🌺",image:"images/flair/backgrounds/HangingGardens.jpg",desc:"Terraced gardens with vines spilling over every edge"},
    {id:"bg_death_realm",name:"Sunken Temple",emoji:"🏛️",image:"images/flair/backgrounds/SunkenTemple.jpg",desc:"An underwater shrine of pillars lit by shafts of light",buff:{stat:"crit",pct:0.5}},
    {id:"bg_universe_forge",name:"Monarch Grove",emoji:"🦋",image:"images/flair/backgrounds/MonarchGrove.jpg",desc:"Trees blanketed in thousands of orange butterflies"},
    {id:"bg_eclipse_throne",name:"Colossal Whirlpool",emoji:"🌀",image:"images/flair/backgrounds/ColossalWhirlpool.jpg",desc:"A vast spiraling vortex in the open sea"},
    {id:"bg_firstlight",name:"Snow Ghost Ridge",emoji:"☃️",image:"images/flair/backgrounds/SnowGhostRidge.jpg",desc:"Trees buried in snow and rime until they look like giant figures"},
    {id:"bg_beyond",name:"Hydrothermal Vents",emoji:"♨️",image:"images/flair/backgrounds/HydrothermalVents.jpg",desc:"Smoking chimneys rising from the deep sea floor",buff:{stat:"critDmg",pct:5}},
  ],
};
export const FLAIR_ITEMS={
  common:[
    {id:"env_bush",name:"Bush",emoji:"🌿",desc:"A small leafy bush sitting beside the creature"},
    {id:"env_rock",name:"Rock",emoji:"🪨",desc:"A plain mossy rock resting on the ground"},
    {id:"env_daisy",name:"Daisy Patch",emoji:"🌼",desc:"A small cluster of daisies growing at the feet"},
    {id:"env_puddle",name:"Puddle",emoji:"💧",desc:"A shallow muddy puddle underfoot"},
    {id:"env_mushroom",name:"Mushroom",emoji:"🍄",desc:"A single mushroom sprouting from the ground"},
    {id:"env_log",name:"Mossy Log",emoji:"🪵",desc:"A fallen log covered in soft green moss"},
    {id:"env_grass_tuft",name:"Grass Tuft",emoji:"🌱",desc:"A thick tuft of tall grass swaying gently"},
    {id:"env_pebbles",name:"Pebble Pile",emoji:"⚪",desc:"A small scattered pile of smooth pebbles"},
    {id:"env_leaf_pile",name:"Leaf Pile",emoji:"🍂",desc:"A crunchy pile of dried autumn leaves"},
    {id:"env_flower",name:"Wildflower",emoji:"🌸",desc:"A single colorful wildflower in bloom"},
    {id:"env_acorns",name:"Acorns",emoji:"🌰",desc:"A few acorns scattered across the ground"},
    {id:"env_dirt_mound",name:"Dirt Mound",emoji:"🟤",desc:"A small mound of freshly dug earth"},
    {id:"env_cloud_low",name:"Low Cloud",emoji:"☁️",desc:"A small puffy cloud drifting at ground level"},
    {id:"env_breeze",name:"Gentle Breeze",emoji:"🌬️",desc:"Light wind lines flowing softly past"},
    {id:"env_anthill",name:"Anthill",emoji:"🐜",desc:"A small anthill with busy ants circling it"},
    {id:"env_reed",name:"Reed Stalks",emoji:"🎋",desc:"Thin reeds growing in a small cluster",buff:{stat:"crit",pct:0.1}},
    {id:"env_pinecone",name:"Pinecone",emoji:"🌲",desc:"A pinecone resting on a bed of needles"},
    {id:"env_snail",name:"Snail",emoji:"🐌",desc:"A slow snail making its way across the ground"},
    {id:"env_cobweb",name:"Cobweb",emoji:"🕸️",desc:"A small cobweb draped between two twigs"},
    {id:"env_clover",name:"Clover Patch",emoji:"🍀",desc:"A patch of bright green clover on the ground",buff:{stat:"critDmg",pct:0.5}},
  ],
  rare:[
    {id:"env_tree_branch",name:"Tree Branch",emoji:"🌳",desc:"A large gnarled branch arching overhead"},
    {id:"env_fireflies",name:"Fireflies",emoji:"✨",desc:"Glowing fireflies drifting lazily around"},
    {id:"env_waterfall_sm",name:"Small Waterfall",emoji:"💦",desc:"A thin stream of water cascading down nearby rocks"},
    {id:"env_cherry_blossom",name:"Cherry Blossoms",emoji:"🌸",desc:"Pink petals drifting down from an unseen tree"},
    {id:"env_lantern",name:"Paper Lantern",emoji:"🏮",desc:"A glowing paper lantern floating softly overhead"},
    {id:"env_fog_patch",name:"Fog Patch",emoji:"🌫️",desc:"A low rolling patch of dense fog at the feet"},
    {id:"env_campfire",name:"Campfire",emoji:"🔥",desc:"A warm crackling campfire burning nearby"},
    {id:"env_wind_strong",name:"Strong Wind",emoji:"💨",desc:"Powerful gusts that bend the grass flat"},
    {id:"env_snowfall",name:"Snowfall",emoji:"❄️",desc:"Light snow drifting quietly downward"},
    {id:"env_pond_lily",name:"Lily Pads",emoji:"🐸",desc:"A cluster of lily pads floating on still water"},
    {id:"env_rainbow",name:"Rainbow",emoji:"🌈",desc:"A vivid rainbow arcing behind the creature"},
    {id:"env_crow",name:"Perched Crow",emoji:"🐦‍⬛",desc:"A crow perched on a nearby branch watching silently"},
    {id:"env_ivy_wall",name:"Ivy Wall",emoji:"🌿",desc:"A crumbling wall thick with climbing ivy"},
    {id:"env_moonbeam",name:"Moonbeam",emoji:"🌙",desc:"A shaft of pale moonlight cutting through the scene"},
    {id:"env_crystal_cluster",name:"Crystal Cluster",emoji:"💎",desc:"A cluster of small translucent crystals growing from the ground"},
    {id:"env_falling_leaves",name:"Falling Leaves",emoji:"🍁",desc:"A constant swirl of red and gold leaves in the air",buff:{stat:"crit",pct:0.2}},
    {id:"env_rain",name:"Rain",emoji:"🌧️",desc:"A soft steady rain falling around the creature"},
    {id:"env_sunbeam",name:"Sunbeam",emoji:"🌤️",desc:"A warm shaft of golden sunlight breaking through clouds"},
    {id:"env_vine_hang",name:"Hanging Vines",emoji:"🎋",desc:"Long vines hanging down from above"},
    {id:"env_spiderweb_lg",name:"Giant Cobweb",emoji:"🕸️",desc:"A huge intricate cobweb glistening with dew",buff:{stat:"critDmg",pct:1}},
  ],
  epic:[
    {id:"env_moon",name:"Full Moon",emoji:"🌕",desc:"A huge glowing full moon hovering close behind"},
    {id:"env_northern_lights",name:"Northern Lights",emoji:"🌌",desc:"Vivid ribbons of aurora rippling across the sky"},
    {id:"env_tornado_sm",name:"Dust Devil",emoji:"🌪️",desc:"A small swirling column of wind and debris"},
    {id:"env_lightning_strike",name:"Lightning Strike",emoji:"⚡",desc:"A bolt of lightning frozen mid-strike nearby"},
    {id:"env_meteor_shower",name:"Meteor Shower",emoji:"☄️",desc:"Streaks of light blazing across the sky overhead"},
    {id:"env_lava_pool",name:"Lava Pool",emoji:"🌋",desc:"A bubbling pool of molten lava at the edge of the scene"},
    {id:"env_black_hole_sm",name:"Micro Black Hole",emoji:"🕳️",desc:"A tiny swirling black hole hovering beside the creature"},
    {id:"env_storm_clouds",name:"Storm Clouds",emoji:"⛈️",desc:"Dark churning storm clouds rolling in low overhead"},
    {id:"env_ancient_tree",name:"Ancient Tree",emoji:"🌳",desc:"A colossal ancient tree with roots spanning the entire ground"},
    {id:"env_floating_rocks",name:"Floating Rocks",emoji:"🪨",desc:"Chunks of rock drifting slowly through the air"},
    {id:"env_waterfall_lg",name:"Grand Waterfall",emoji:"🌊",desc:"A towering waterfall crashing into mist below"},
    {id:"env_eclipse",name:"Solar Eclipse",emoji:"🌑",desc:"The sun eclipsed overhead, casting an eerie ring of light"},
    {id:"env_frost_bloom",name:"Frost Bloom",emoji:"❄️",desc:"Giant flowers made entirely of ice blooming across the ground"},
    {id:"env_fire_pillar",name:"Fire Pillar",emoji:"🔥",desc:"A column of intense fire shooting up from the earth"},
    {id:"env_sand_storm",name:"Sandstorm",emoji:"🏜️",desc:"A wall of churning sand approaching from behind"},
    {id:"env_sky_whale",name:"Sky Whale",emoji:"🐋",desc:"The silhouette of a massive whale drifting through the clouds",buff:{stat:"crit",pct:0.25}},
    {id:"env_ice_spires",name:"Ice Spires",emoji:"🧊",desc:"Towering jagged spires of ice jutting from the ground"},
    {id:"env_spore_cloud",name:"Spore Cloud",emoji:"🍄",desc:"A billowing cloud of glowing mushroom spores"},
    {id:"env_gravity_lift",name:"Gravity Lift",emoji:"🌀",desc:"Rocks, leaves, and debris lifting silently into the air"},
    {id:"env_giant_moon",name:"Giant Moon",emoji:"🌕",desc:"A moon so close it fills the entire sky",buff:{stat:"critDmg",pct:2}},
  ],
  legendary:[
    {id:"env_sun",name:"The Sun",emoji:"☀️",desc:"The actual sun, burning brilliantly just overhead"},
    {id:"env_planet",name:"Ringed Planet",emoji:"🪐",desc:"A Saturn-like planet hanging enormous in the sky"},
    {id:"env_galaxy_bg",name:"Galaxy",emoji:"🌌",desc:"The full spiral of a galaxy sprawling behind the creature"},
    {id:"env_comet",name:"Comet",emoji:"☄️",desc:"A comet blazing past impossibly close, trailing ice and fire"},
    {id:"env_world_tree_lg",name:"World Tree",emoji:"🌳",desc:"The mythical world tree — roots in the earth, crown in the stars"},
    {id:"env_twin_suns",name:"Twin Suns",emoji:"🌟",desc:"Two suns in the sky casting double shadows"},
    {id:"env_shattered_moon",name:"Shattered Moon",emoji:"🌕",desc:"A moon split in half, both pieces drifting slowly apart"},
    {id:"env_falling_stars",name:"Falling Stars",emoji:"💫",desc:"A continuous rain of stars plunging from the heavens"},
    {id:"env_void_rift_lg",name:"Void Rift",emoji:"🕳️",desc:"A massive tear in the sky exposing infinite darkness"},
    {id:"env_creation_light",name:"Creation Light",emoji:"✨",desc:"The blinding light of a universe being born in the background"},
    {id:"env_eternal_storm",name:"Eternal Storm",emoji:"🌪️",desc:"A storm of infinite scale engulfing the entire horizon"},
    {id:"env_cosmic_ocean",name:"Cosmic Ocean",emoji:"🌊",desc:"An endless ocean of stars and nebulae stretching below"},
    {id:"env_titan_tree",name:"Titan's Tree",emoji:"🌲",desc:"A tree so large its roots are mountains and its leaves are clouds"},
    {id:"env_dying_star",name:"Dying Star",emoji:"💥",desc:"A star collapsing into a supernova right behind the creature"},
    {id:"env_time_streams",name:"Time Streams",emoji:"⌛",desc:"Visible rivers of time flowing through the air in all directions"},
    {id:"env_dead_gods",name:"Fallen Gods",emoji:"👁️",desc:"Enormous ancient statues of forgotten gods crumbling in the background",buff:{stat:"crit",pct:0.5}},
    {id:"env_inverse_sky",name:"Inverse Sky",emoji:"🌑",desc:"The sky and ground are flipped — stars below, void above"},
    {id:"env_endless_rain",name:"Endless Rain",emoji:"🌧️",desc:"Rain falling upward, sideways, and downward all at once"},
    {id:"env_omnipresent_sun",name:"Omnipresent Sun",emoji:"☀️",desc:"A sun that exists in every direction simultaneously"},
    {id:"env_birth_of_world",name:"Birth of a World",emoji:"🌍",desc:"A planet forming from cosmic dust right beside the creature",buff:{stat:"critDmg",pct:5}},
  ],
};

// Auras, backgrounds, and items get their `buff` field injected here rather than
// being written out per entry: four of each stat, in array order. This MUTATES
// the three tables in place and must run at module init, before anything reads
// a `.buff`.
//
// An entry that declares its OWN `buff` above keeps it -- that is the escape
// hatch for the handful that step off the generated pattern (the Crit Chance
// and Crit Damage ones). Without the guard this pass would silently overwrite
// them, and the entry would read one way in the source and behave another.
{const _S=["hp","atk","def","spd","abilitySpeed"],_P={common:0.5,rare:1,epic:3,legendary:5},_P_SPD={common:0.1,rare:0.3,epic:0.5,legendary:1};[FLAIR_AURAS,FLAIR_BACKGROUNDS,FLAIR_ITEMS].forEach(data=>Object.entries(data).forEach(([r,arr])=>arr.forEach((x,i)=>{if(x.buff)return;const stat=_S[Math.floor(i/4)%5];x.buff={stat,pct:(stat==="spd"||stat==="abilitySpeed")?_P_SPD[r]:_P[r]};})));}
export const FLAIR_AURA_MAP=Object.fromEntries(Object.values(FLAIR_AURAS).flat().map(e=>[e.id,e]));
export const FLAIR_BG_MAP=Object.fromEntries(Object.values(FLAIR_BACKGROUNDS).flat().map(e=>[e.id,e]));
/** Style for a creature's portrait stage (creature page and Flair page) when
 * its equipped background flair has art. The stage bleeds to the card's top,
 * left and right edges (PORTRAIT_STAGE_STYLE) and ends where the stats begin.
 *
 * The art is never stretched: it's scaled uniformly to cover the stage and
 * anchored to the bottom, so the ground always shows and the overflow is
 * cropped -- off the top on the wide creature-page stage, off the sides on a
 * tall Flair Feed stage. Background art is SQUARE, which makes the drawn
 * image exactly max(stage width, stage height) tall; PORTRAIT_FEET_BOTTOM
 * relies on that. Null when the equipped background has no image yet (or
 * nothing is equipped). */
export function portraitBackdropStyle(ownedData){
  const image=backdropImage(ownedData);
  if(!image)return null;
  return {backgroundImage:'url("'+image+'")',backgroundSize:"cover",backgroundPosition:"center bottom",backgroundRepeat:"no-repeat"};
}
/** The equipped background flair's art path, or null (none equipped, or no
 * art for it yet). */
export function backdropImage(ownedData){
  const bg=ownedData&&ownedData.equippedBackground&&FLAIR_BG_MAP[ownedData.equippedBackground];
  return bg&&bg.image?bg.image:null;
}
/** Creature's feet above the stage bottom: 7% of the drawn backdrop's height
 * (max of the stage's width and height, for square art -- see
 * portraitBackdropStyle), so they land on the same spot of the art at any
 * stage size. cqw/cqh resolve against the stage, which PORTRAIT_STAGE_STYLE
 * makes a size container. */
export const PORTRAIT_FEET_BOTTOM="calc(0.07 * max(100cqw, 100cqh))";
/** The showcased creature's size, in px, on Home, the creature page and the
 * Flair stage -- shared so all three previews match. 512px art cells stay
 * fully sharp up to about this size on a 3x phone at the 1.15 app scale. */
export const PORTRAIT_CREATURE_PX=150;
/** The portrait stage's shared styling. Pulls it out over the card's 12px
 * padding on the top, left and right, so backdrop art runs to the card's
 * edges (its top corners matching the card's 12px radius) -- the stage's
 * height includes the 12px it reclaims from the top padding. Also makes it a
 * size container for PORTRAIT_FEET_BOTTOM; the stage always has an explicit
 * height (fixed, or flex-sized on the Flair Feed tab), so that's safe. */
export const PORTRAIT_STAGE_STYLE={margin:"-12px -12px 0",borderRadius:"12px 12px 0 0",containerType:"size"};
export const FLAIR_ITEM_MAP=Object.fromEntries(Object.values(FLAIR_ITEMS).flat().map(e=>[e.id,e]));
export const FLAIR_SHARD_COSTS={common:30,rare:75,epic:150,legendary:500};

export const FLAIR_SHARD_VALUES={common:5,rare:10,epic:25,legendary:50};
export const FLAIR_BANANAS=[
  {id:"flairBanana",      name:"Flair Banana",         emoji:"🍌",  image:"images/item_icons/flairbanana.png", weights:{common:85,rare:10,epic:4.5,legendary:0.5}, color:"#f9a825", bg:"#fffde7"},
  {id:"mythicalFlairBanana", name:"Mythical Flair Banana",emoji:"🍌✨", image:"images/item_icons/mythicalflairbanana.png", weights:{common:0, rare:70,epic:28, legendary:2},   color:"#7b1fa2", bg:"#f3e5f5"},
  {id:"ancientFlairBanana",  name:"Ancient Flair Banana", emoji:"🍌🏺", image:"images/item_icons/ancientflairbanana.png", weights:{common:0, rare:0, epic:90, legendary:10},  color:"#bf360c", bg:"#fbe9e7"},
];
export const RARITY_COLORS_FLAIR={common:"#888",rare:"#283593",epic:"#6a1b9a",legendary:"#e65100"};

// "Random": an `equipped*` field set to RANDOM_FLAIR shows a different one of
// the creature's unlocked flair from that category each time the creature is
// shown (see ui/hooks/useShownFlair.js). Cosmetic like any equip -- buffs come
// from `unlockedFlair` regardless.
export const RANDOM_FLAIR="random";
/** Per flair tab: the owned-creature field it equips, and the lookup that says
 * whether an unlocked key (a title's name, else an id) belongs to it. */
export const FLAIR_SLOTS={
  titles:{field:"equippedTitle",map:FLAIR_TITLE_MAP},
  aura:{field:"equippedAura",map:FLAIR_AURA_MAP},
  background:{field:"equippedBackground",map:FLAIR_BG_MAP},
  item:{field:"equippedItem",map:FLAIR_ITEM_MAP},
};
/** The creature's unlocked keys in one flair tab -- what Random picks from. */
export function ownedFlairKeys(ownedData,tab){
  const {map}=FLAIR_SLOTS[tab];
  return (ownedData?.unlockedFlair||[]).filter(k=>map[k]);
}
/** One fresh pick for every slot set to Random, as {field: key}. Slots that
 * aren't Random are left out, so spreading the result over the owned data
 * only replaces the Random ones. `avoid` ({field: key}) is the pick shown
 * last time: it's skipped whenever there's anything else to choose, so two
 * views in a row never show the same one. */
export function rollRandomFlair(ownedData,avoid={}){
  const picks={};
  for(const tab in FLAIR_SLOTS){
    const {field}=FLAIR_SLOTS[tab];
    if(ownedData?.[field]!==RANDOM_FLAIR)continue;
    const owned=ownedFlairKeys(ownedData,tab);
    const keys=owned.length>1?owned.filter(k=>k!==avoid[field]):owned;
    picks[field]=keys.length?keys[Math.floor(Math.random()*keys.length)]:null;
  }
  return picks;
}
