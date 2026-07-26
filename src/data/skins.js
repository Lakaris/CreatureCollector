// Cosmetic skin sets. `chain` lists which creature ids in an evolution line a skin
// applies to; `appearances` maps creature id -> override emoji.

export const SKIN_SETS=[
  // Emberpup / Emberhound
  {id:"pup_arctic",name:"Arctic",tier:"rare",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🐩"},emberhound:{emoji:"🐺"}}},
  {id:"pup_shadow",name:"Shadow",tier:"epic",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🐕‍🦺"},emberhound:{emoji:"🦝"}}},
  {id:"pup_golden",name:"Golden",tier:"legendary",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🦊"},emberhound:{emoji:"🦁"}}},
  // Leafling / Canoparch
  {id:"leaf_blossom",name:"Blossom",tier:"common",chain:["leafling","canoparch"],appearances:{leafling:{emoji:"🌱"},canoparch:{emoji:"🌲"}}},
  {id:"leaf_autumn",name:"Autumn",tier:"rare",chain:["leafling","canoparch"],appearances:{leafling:{emoji:"🍂"},canoparch:{emoji:"🍁"}}},
  {id:"leaf_ancient",name:"Ancient",tier:"legendary",chain:["leafling","canoparch"],appearances:{leafling:{emoji:"☘️"},canoparch:{emoji:"🌾"}}},
  // Pebbit / Bouldrath
  {id:"rock_sandy",name:"Sandy",tier:"common",chain:["pebbit","bouldrath"],appearances:{pebbit:{emoji:"🐰"},bouldrath:{emoji:"🦛"}}},
  {id:"rock_crystal",name:"Crystal",tier:"epic",chain:["pebbit","bouldrath"],appearances:{pebbit:{emoji:"💎"},bouldrath:{emoji:"🗿"}}},
  {id:"rock_volcanic",name:"Volcanic",tier:"legendary",chain:["pebbit","bouldrath"],appearances:{pebbit:{emoji:"🌋"},bouldrath:{emoji:"🏔️"}}},
  // Breezekit / Galestride
  {id:"wind_storm",name:"Stormborn",tier:"rare",chain:["breezekit","galestride"],appearances:{breezekit:{emoji:"🍃"},galestride:{emoji:"🌀"}}},
  {id:"wind_arctic",name:"Frostwind",tier:"epic",chain:["breezekit","galestride"],appearances:{breezekit:{emoji:"🌬️"},galestride:{emoji:"🌨️"}}},
  {id:"wind_thunder",name:"Thunder",tier:"legendary",chain:["breezekit","galestride"],appearances:{breezekit:{emoji:"⚡"},galestride:{emoji:"🌩️"}}},
  // Frostfang / Glacierwulf
  {id:"frost_ember",name:"Ember",tier:"common",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🦊"},glacierwulf:{emoji:"🔥"},frostwyvern:{emoji:"🐊"}}},
  {id:"frost_shadow",name:"Nightfall",tier:"rare",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🌑"},glacierwulf:{emoji:"🌚"},frostwyvern:{emoji:"👻"}}},
  {id:"frost_blizzard",name:"Blizzard",tier:"legendary",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🌨️"},glacierwulf:{emoji:"🧊"},frostwyvern:{emoji:"❄️"}}},
  // Voltail / Stormclaw
  {id:"volt_ember",name:"Ember",tier:"common",chain:["voltail","stormclaw","arcstorm"],appearances:{voltail:{emoji:"🦎"},stormclaw:{emoji:"🦅"},arcstorm:{emoji:"🔥"}}},
  {id:"volt_neon",name:"Neon",tier:"epic",chain:["voltail","stormclaw","arcstorm"],appearances:{voltail:{emoji:"🔋"},stormclaw:{emoji:"💡"},arcstorm:{emoji:"✨"}}},
  {id:"volt_apex",name:"Apex",tier:"legendary",chain:["voltail","stormclaw","arcstorm"],appearances:{voltail:{emoji:"🌟"},stormclaw:{emoji:"☄️"},arcstorm:{emoji:"💫"}}},
  // Tideclaw
  {id:"tide_abyssal",name:"Abyssal",tier:"rare",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🦑"},tidalcrusher:{emoji:"🌊"},abyssking:{emoji:"🐙"}}},
  {id:"tide_coral",name:"Coral",tier:"epic",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🦀"},tidalcrusher:{emoji:"🌺"},abyssking:{emoji:"🐠"}}},
  {id:"tide_leviathan",name:"Leviathan",tier:"legendary",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🐙"},tidalcrusher:{emoji:"🦑"},abyssking:{emoji:"🐬"}}},
  // Magmavore / Cindercolosus
  {id:"mag_glacier",name:"Glacier",tier:"rare",chain:["magmavore","cindercolosus"],appearances:{magmavore:{emoji:"🏔️"},cindercolosus:{emoji:"🗻"}}},
  {id:"mag_shadow",name:"Obsidian",tier:"epic",chain:["magmavore","cindercolosus"],appearances:{magmavore:{emoji:"🐉"},cindercolosus:{emoji:"🦖"}}},
  {id:"mag_primordial",name:"Primordial",tier:"legendary",chain:["magmavore","cindercolosus"],appearances:{magmavore:{emoji:"🌋"},cindercolosus:{emoji:"💥"}}},
  // Shadowstrike
  {id:"shadow_siamese",name:"Siamese",tier:"common",chain:["shadowstrike","nightwraith"],appearances:{shadowstrike:{emoji:"🐱"},nightwraith:{emoji:"🐈"}}},
  {id:"shadow_phantom",name:"Phantom",tier:"rare",chain:["shadowstrike","nightwraith"],appearances:{shadowstrike:{emoji:"👻"},nightwraith:{emoji:"💀"}}},
  {id:"shadow_void",name:"Void",tier:"legendary",chain:["shadowstrike","nightwraith"],appearances:{shadowstrike:{emoji:"🌑"},nightwraith:{emoji:"🕳️"}}},
  // Stormwyvern
  {id:"storm_ember",name:"Ember Drake",tier:"rare",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🦕"}}},
  {id:"storm_void",name:"Void Wyvern",tier:"epic",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🌑"}}},
  {id:"storm_ancient",name:"Ancient",tier:"legendary",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🐲"}}},
  // Celestialux
  {id:"celest_lunar",name:"Lunar",tier:"rare",chain:["celestialux"],appearances:{celestialux:{emoji:"🌙"}}},
  {id:"celest_solar",name:"Solar",tier:"epic",chain:["celestialux"],appearances:{celestialux:{emoji:"☀️"}}},
  // ── RARE creature lines ──────────────────────────────────────────────────
  // seadrake / deepdrake / abyssdrake
  {id:"sea_crimson",name:"Crimson",tier:"rare",chain:["seadrake","deepdrake","abyssdrake"],appearances:{seadrake:{emoji:"🐍"},deepdrake:{emoji:"🦎"},abyssdrake:{emoji:"🐲"}}},
  {id:"sea_spectral",name:"Spectral",tier:"epic",chain:["seadrake","deepdrake","abyssdrake"],appearances:{seadrake:{emoji:"👻"},deepdrake:{emoji:"🌫️"},abyssdrake:{emoji:"💀"}}},
  {id:"sea_elder",name:"Elder",tier:"legendary",chain:["seadrake","deepdrake","abyssdrake"],appearances:{seadrake:{emoji:"🌊"},deepdrake:{emoji:"🌑"},abyssdrake:{emoji:"🌌"}}},
  // lavagator / magmadrake / cinderdrake
  {id:"lava_glacial",name:"Glacial",tier:"rare",chain:["lavagator","magmadrake","cinderdrake"],appearances:{lavagator:{emoji:"❄️"},magmadrake:{emoji:"🧊"},cinderdrake:{emoji:"💎"}}},
  {id:"lava_obsidian",name:"Obsidian",tier:"epic",chain:["lavagator","magmadrake","cinderdrake"],appearances:{lavagator:{emoji:"🌑"},magmadrake:{emoji:"💀"},cinderdrake:{emoji:"🕳️"}}},
  {id:"lava_solar",name:"Solar",tier:"legendary",chain:["lavagator","magmadrake","cinderdrake"],appearances:{lavagator:{emoji:"🌟"},magmadrake:{emoji:"⭐"},cinderdrake:{emoji:"☀️"}}},
  // blazemoth / scorchwing / infernosprite
  {id:"moth_lunar",name:"Lunar",tier:"rare",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"🌙"},scorchwing:{emoji:"🦋"},infernosprite:{emoji:"✨"}}},
  {id:"moth_void",name:"Void",tier:"epic",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"🌑"},scorchwing:{emoji:"🦇"},infernosprite:{emoji:"💀"}}},
  {id:"moth_solar",name:"Solar",tier:"legendary",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"☀️"},scorchwing:{emoji:"🌟"},infernosprite:{emoji:"💫"}}},
  // emberscorp / pyrescorp / magmascorp
  {id:"scorp_venom",name:"Venom",tier:"rare",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"🦂"},pyrescorp:{emoji:"🐍"},magmascorp:{emoji:"☠️"}}},
  {id:"scorp_crystal",name:"Crystal",tier:"epic",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"💎"},pyrescorp:{emoji:"🔮"},magmascorp:{emoji:"🪩"}}},
  {id:"scorp_ancient",name:"Ancient",tier:"legendary",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"🦕"},pyrescorp:{emoji:"🦖"},magmascorp:{emoji:"🐉"}}},
  // venomviper / toxicserpent / poisonwyrm
  {id:"viper_ghost",name:"Ghost",tier:"rare",chain:["venomviper","toxicserpent","poisonwyrm"],appearances:{venomviper:{emoji:"👻"},toxicserpent:{emoji:"🌫️"},poisonwyrm:{emoji:"💀"}}},
  {id:"viper_crystal",name:"Crystal",tier:"epic",chain:["venomviper","toxicserpent","poisonwyrm"],appearances:{venomviper:{emoji:"💚"},toxicserpent:{emoji:"💎"},poisonwyrm:{emoji:"🔮"}}},
  {id:"viper_primordial",name:"Primordial",tier:"legendary",chain:["venomviper","toxicserpent","poisonwyrm"],appearances:{venomviper:{emoji:"🌿"},toxicserpent:{emoji:"🌳"},poisonwyrm:{emoji:"🐲"}}},
  // mosskrab / jadekrab / crystalshell
  {id:"krab_sand",name:"Sandy",tier:"rare",chain:["mosskrab","jadekrab","crystalshell"],appearances:{mosskrab:{emoji:"🏖️"},jadekrab:{emoji:"🦀"},crystalshell:{emoji:"⭐"}}},
  {id:"krab_lava",name:"Magma",tier:"epic",chain:["mosskrab","jadekrab","crystalshell"],appearances:{mosskrab:{emoji:"🔥"},jadekrab:{emoji:"🌋"},crystalshell:{emoji:"🌊"}}},
  {id:"krab_ancient",name:"Ancient",tier:"legendary",chain:["mosskrab","jadekrab","crystalshell"],appearances:{mosskrab:{emoji:"🌊"},jadekrab:{emoji:"🏔️"},crystalshell:{emoji:"🌌"}}},
  // thornturtle / jadeshell / ancientshell
  {id:"turtle_sea",name:"Deep Sea",tier:"rare",chain:["thornturtle","jadeshell","ancientshell"],appearances:{thornturtle:{emoji:"🐢"},jadeshell:{emoji:"🌊"},ancientshell:{emoji:"🐬"}}},
  {id:"turtle_prism",name:"Prism",tier:"epic",chain:["thornturtle","jadeshell","ancientshell"],appearances:{thornturtle:{emoji:"💎"},jadeshell:{emoji:"🔮"},ancientshell:{emoji:"✨"}}},
  {id:"turtle_titan",name:"Titan",tier:"legendary",chain:["thornturtle","jadeshell","ancientshell"],appearances:{thornturtle:{emoji:"🗿"},jadeshell:{emoji:"🏔️"},ancientshell:{emoji:"🌍"}}},
  // ironmole / steelmole / titanmole
  {id:"mole_sand",name:"Desert",tier:"rare",chain:["ironmole","steelmole","titanmole"],appearances:{ironmole:{emoji:"🦔"},steelmole:{emoji:"🏜️"},titanmole:{emoji:"🌵"}}},
  {id:"mole_crystal",name:"Crystal",tier:"epic",chain:["ironmole","steelmole","titanmole"],appearances:{ironmole:{emoji:"💎"},steelmole:{emoji:"🔮"},titanmole:{emoji:"✨"}}},
  {id:"mole_volcanic",name:"Volcanic",tier:"legendary",chain:["ironmole","steelmole","titanmole"],appearances:{ironmole:{emoji:"🗿"},steelmole:{emoji:"🏔️"},titanmole:{emoji:"🌋"}}},
  // dustcrawler / sandcrawler / dunekraken
  {id:"dune_frost",name:"Frosted",tier:"rare",chain:["dustcrawler","sandcrawler","dunekraken"],appearances:{dustcrawler:{emoji:"❄️"},sandcrawler:{emoji:"🧊"},dunekraken:{emoji:"🌨️"}}},
  {id:"dune_void",name:"Void",tier:"epic",chain:["dustcrawler","sandcrawler","dunekraken"],appearances:{dustcrawler:{emoji:"🌑"},sandcrawler:{emoji:"💀"},dunekraken:{emoji:"🌌"}}},
  {id:"dune_relic",name:"Relic",tier:"legendary",chain:["dustcrawler","sandcrawler","dunekraken"],appearances:{dustcrawler:{emoji:"🏺"},sandcrawler:{emoji:"🗿"},dunekraken:{emoji:"🏛️"}}},
  // quakebeetle / stonebeetle / gemscrab
  {id:"beetle_gilded",name:"Gilded",tier:"rare",chain:["quakebeetle","stonebeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🪲"},stonebeetle:{emoji:"🏅"},gemscrab:{emoji:"🥇"}}},
  {id:"beetle_shadow",name:"Shadow",tier:"epic",chain:["quakebeetle","stonebeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🌑"},stonebeetle:{emoji:"💀"},gemscrab:{emoji:"🌌"}}},
  {id:"beetle_prism",name:"Prismatic",tier:"legendary",chain:["quakebeetle","stonebeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🌈"},stonebeetle:{emoji:"✨"},gemscrab:{emoji:"💎"}}},
  // skyeel / galeeel / stormeel
  {id:"eel_coral",name:"Coral",tier:"rare",chain:["skyeel","galeeel","stormeel"],appearances:{skyeel:{emoji:"🐠"},galeeel:{emoji:"🌊"},stormeel:{emoji:"🌀"}}},
  {id:"eel_lightning",name:"Lightning",tier:"epic",chain:["skyeel","galeeel","stormeel"],appearances:{skyeel:{emoji:"⚡"},galeeel:{emoji:"🌩️"},stormeel:{emoji:"💫"}}},
  {id:"eel_aurora",name:"Aurora",tier:"legendary",chain:["skyeel","galeeel","stormeel"],appearances:{skyeel:{emoji:"🌌"},galeeel:{emoji:"✨"},stormeel:{emoji:"🌠"}}},
  // squallhawk / galebeak / strikewing
  {id:"hawk_ember",name:"Ember",tier:"rare",chain:["squallhawk","galebeak","strikewing"],appearances:{squallhawk:{emoji:"🔥"},galebeak:{emoji:"🦅"},strikewing:{emoji:"🌟"}}},
  {id:"hawk_shadow",name:"Shadow",tier:"epic",chain:["squallhawk","galebeak","strikewing"],appearances:{squallhawk:{emoji:"🌑"},galebeak:{emoji:"🦇"},strikewing:{emoji:"💀"}}},
  {id:"hawk_arctic",name:"Arctic",tier:"legendary",chain:["squallhawk","galebeak","strikewing"],appearances:{squallhawk:{emoji:"❄️"},galebeak:{emoji:"🌨️"},strikewing:{emoji:"🧊"}}},
  // whirlbug / cyclonbug / vortexbug
  {id:"bug_electric",name:"Electric",tier:"rare",chain:["whirlbug","cyclonbug","vortexbug"],appearances:{whirlbug:{emoji:"⚡"},cyclonbug:{emoji:"🌩️"},vortexbug:{emoji:"🔋"}}},
  {id:"bug_phantom",name:"Phantom",tier:"epic",chain:["whirlbug","cyclonbug","vortexbug"],appearances:{whirlbug:{emoji:"🌑"},cyclonbug:{emoji:"💀"},vortexbug:{emoji:"🌌"}}},
  {id:"bug_gilded",name:"Gilded",tier:"legendary",chain:["whirlbug","cyclonbug","vortexbug"],appearances:{whirlbug:{emoji:"🌟"},cyclonbug:{emoji:"⭐"},vortexbug:{emoji:"☀️"}}},
  // zapfrog / voltfrog / stormtoad
  {id:"frog_verdant",name:"Verdant",tier:"rare",chain:["zapfrog","voltfrog","stormtoad"],appearances:{zapfrog:{emoji:"🐸"},voltfrog:{emoji:"🌿"},stormtoad:{emoji:"🌊"}}},
  {id:"frog_shadow",name:"Shadow",tier:"epic",chain:["zapfrog","voltfrog","stormtoad"],appearances:{zapfrog:{emoji:"🌑"},voltfrog:{emoji:"👻"},stormtoad:{emoji:"💀"}}},
  {id:"frog_gilded",name:"Gilded",tier:"legendary",chain:["zapfrog","voltfrog","stormtoad"],appearances:{zapfrog:{emoji:"🌟"},voltfrog:{emoji:"⭐"},stormtoad:{emoji:"☀️"}}},
  // shockbeetle / voltbeetle / arcbeetle
  {id:"arcbeetle_verdant",name:"Verdant",tier:"rare",chain:["shockbeetle","voltbeetle","arcbeetle"],appearances:{shockbeetle:{emoji:"🍀"},voltbeetle:{emoji:"🌿"},arcbeetle:{emoji:"🌱"}}},
  {id:"arcbeetle_prism",name:"Prismatic",tier:"epic",chain:["shockbeetle","voltbeetle","arcbeetle"],appearances:{shockbeetle:{emoji:"💎"},voltbeetle:{emoji:"🔮"},arcbeetle:{emoji:"✨"}}},
  {id:"arcbeetle_cosmic",name:"Cosmic",tier:"legendary",chain:["shockbeetle","voltbeetle","arcbeetle"],appearances:{shockbeetle:{emoji:"🌌"},voltbeetle:{emoji:"🌠"},arcbeetle:{emoji:"💫"}}},
  // aurorabird / radiancebird / celestbird
  {id:"abird_night",name:"Nightfall",tier:"rare",chain:["aurorabird","radiancebird","celestbird"],appearances:{aurorabird:{emoji:"🌙"},radiancebird:{emoji:"⭐"},celestbird:{emoji:"🌌"}}},
  {id:"abird_shadow",name:"Shadow",tier:"epic",chain:["aurorabird","radiancebird","celestbird"],appearances:{aurorabird:{emoji:"🌑"},radiancebird:{emoji:"💀"},celestbird:{emoji:"🕳️"}}},
  {id:"abird_solar",name:"Solar",tier:"legendary",chain:["aurorabird","radiancebird","celestbird"],appearances:{aurorabird:{emoji:"☀️"},radiancebird:{emoji:"🌟"},celestbird:{emoji:"💫"}}},
  // prismcrab / spectrumcrab / rainbowshell
  {id:"prism_gilded",name:"Gilded",tier:"rare",chain:["prismcrab","spectrumcrab","rainbowshell"],appearances:{prismcrab:{emoji:"🦀"},spectrumcrab:{emoji:"🥇"},rainbowshell:{emoji:"🌟"}}},
  {id:"prism_void",name:"Void",tier:"epic",chain:["prismcrab","spectrumcrab","rainbowshell"],appearances:{prismcrab:{emoji:"🌑"},spectrumcrab:{emoji:"💀"},rainbowshell:{emoji:"🌌"}}},
  {id:"prism_aurora",name:"Aurora",tier:"legendary",chain:["prismcrab","spectrumcrab","rainbowshell"],appearances:{prismcrab:{emoji:"🌈"},spectrumcrab:{emoji:"✨"},rainbowshell:{emoji:"🌠"}}},
  // holymoth / radiantmoth / celestimoth
  {id:"hmoth_night",name:"Nightfall",tier:"rare",chain:["holymoth","radiantmoth","celestimoth"],appearances:{holymoth:{emoji:"🌙"},radiantmoth:{emoji:"⭐"},celestimoth:{emoji:"🌌"}}},
  {id:"hmoth_shadow",name:"Shadow",tier:"epic",chain:["holymoth","radiantmoth","celestimoth"],appearances:{holymoth:{emoji:"🌑"},radiantmoth:{emoji:"💀"},celestimoth:{emoji:"🕳️"}}},
  {id:"hmoth_solar",name:"Solar",tier:"legendary",chain:["holymoth","radiantmoth","celestimoth"],appearances:{holymoth:{emoji:"☀️"},radiantmoth:{emoji:"🌟"},celestimoth:{emoji:"💫"}}},
  // voidspider / shadowspider / abyssspider
  {id:"spider_ember",name:"Ember",tier:"rare",chain:["voidspider","shadowspider","abyssspider"],appearances:{voidspider:{emoji:"🔥"},shadowspider:{emoji:"🦂"},abyssspider:{emoji:"🌋"}}},
  {id:"spider_crystal",name:"Crystal",tier:"epic",chain:["voidspider","shadowspider","abyssspider"],appearances:{voidspider:{emoji:"💎"},shadowspider:{emoji:"🔮"},abyssspider:{emoji:"✨"}}},
  {id:"spider_cosmic",name:"Cosmic",tier:"legendary",chain:["voidspider","shadowspider","abyssspider"],appearances:{voidspider:{emoji:"🌌"},shadowspider:{emoji:"🌑"},abyssspider:{emoji:"🕳️"}}},
  // gloomtoad / voidtoad / shadowtoad
  {id:"gtoad_ember",name:"Ember",tier:"rare",chain:["gloomtoad","voidtoad","shadowtoad"],appearances:{gloomtoad:{emoji:"🔥"},voidtoad:{emoji:"🌋"},shadowtoad:{emoji:"💀"}}},
  {id:"gtoad_crystal",name:"Crystal",tier:"epic",chain:["gloomtoad","voidtoad","shadowtoad"],appearances:{gloomtoad:{emoji:"💎"},voidtoad:{emoji:"🔮"},shadowtoad:{emoji:"✨"}}},
  {id:"gtoad_abyssal",name:"Abyssal",tier:"legendary",chain:["gloomtoad","voidtoad","shadowtoad"],appearances:{gloomtoad:{emoji:"🌌"},voidtoad:{emoji:"🌑"},shadowtoad:{emoji:"🕳️"}}},
  // wraithworm / phantomworm / voidwyrm
  {id:"wworm_verdant",name:"Verdant",tier:"rare",chain:["wraithworm","phantomworm","voidwyrm"],appearances:{wraithworm:{emoji:"🌿"},phantomworm:{emoji:"🍃"},voidwyrm:{emoji:"🌱"}}},
  {id:"wworm_crystal",name:"Crystal",tier:"epic",chain:["wraithworm","phantomworm","voidwyrm"],appearances:{wraithworm:{emoji:"💎"},phantomworm:{emoji:"🔮"},voidwyrm:{emoji:"✨"}}},
  {id:"wworm_cosmic",name:"Cosmic",tier:"legendary",chain:["wraithworm","phantomworm","voidwyrm"],appearances:{wraithworm:{emoji:"🌌"},phantomworm:{emoji:"🌑"},voidwyrm:{emoji:"🕳️"}}},
  // ── EPIC creature lines ───────────────────────────────────────────────────
  // salamagma / lavawyrm
  {id:"salama_glacial",name:"Glacial",tier:"rare",chain:["salamagma","lavawyrm"],appearances:{salamagma:{emoji:"❄️"},lavawyrm:{emoji:"🧊"}}},
  {id:"salama_obsidian",name:"Obsidian",tier:"epic",chain:["salamagma","lavawyrm"],appearances:{salamagma:{emoji:"🌑"},lavawyrm:{emoji:"💀"}}},
  {id:"salama_eternal",name:"Eternal",tier:"legendary",chain:["salamagma","lavawyrm"],appearances:{salamagma:{emoji:"🏛️"},lavawyrm:{emoji:"🌌"}}},
  // blazehornet / infernoswarm
  {id:"hornet_frost",name:"Frosted",tier:"rare",chain:["blazehornet","infernoswarm"],appearances:{blazehornet:{emoji:"❄️"},infernoswarm:{emoji:"🌨️"}}},
  {id:"hornet_void",name:"Void",tier:"epic",chain:["blazehornet","infernoswarm"],appearances:{blazehornet:{emoji:"🌑"},infernoswarm:{emoji:"💀"}}},
  {id:"hornet_solar",name:"Solar",tier:"legendary",chain:["blazehornet","infernoswarm"],appearances:{blazehornet:{emoji:"☀️"},infernoswarm:{emoji:"🌟"}}},
  // coralleviathan / tidelord
  {id:"coral_lava",name:"Magma",tier:"rare",chain:["coralleviathan","tidelord"],appearances:{coralleviathan:{emoji:"🌋"},tidelord:{emoji:"🔥"}}},
  {id:"coral_shadow",name:"Abyssal",tier:"epic",chain:["coralleviathan","tidelord"],appearances:{coralleviathan:{emoji:"🌑"},tidelord:{emoji:"💀"}}},
  {id:"coral_ancient",name:"Ancient",tier:"legendary",chain:["coralleviathan","tidelord"],appearances:{coralleviathan:{emoji:"🏛️"},tidelord:{emoji:"🌌"}}},
  // frostadder / glacialwyrm
  {id:"fadder_ember",name:"Ember",tier:"rare",chain:["frostadder","glacialwyrm"],appearances:{frostadder:{emoji:"🔥"},glacialwyrm:{emoji:"🌋"}}},
  {id:"fadder_shadow",name:"Shadow",tier:"epic",chain:["frostadder","glacialwyrm"],appearances:{frostadder:{emoji:"🌑"},glacialwyrm:{emoji:"💀"}}},
  {id:"fadder_cosmic",name:"Cosmic",tier:"legendary",chain:["frostadder","glacialwyrm"],appearances:{frostadder:{emoji:"🌌"},glacialwyrm:{emoji:"🌠"}}},
  // stormjelly / abyssjelly
  {id:"jelly_lava",name:"Magma",tier:"rare",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"🌋"},abyssjelly:{emoji:"🔥"}}},
  {id:"jelly_void",name:"Void",tier:"epic",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"🌑"},abyssjelly:{emoji:"💀"}}},
  {id:"jelly_solar",name:"Solar",tier:"legendary",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"☀️"},abyssjelly:{emoji:"🌟"}}},
  // verdantboa / rootlord
  {id:"vboa_frost",name:"Frosted",tier:"rare",chain:["verdantboa","rootlord"],appearances:{verdantboa:{emoji:"❄️"},rootlord:{emoji:"🌨️"}}},
  {id:"vboa_shadow",name:"Shadow",tier:"epic",chain:["verdantboa","rootlord"],appearances:{verdantboa:{emoji:"🌑"},rootlord:{emoji:"💀"}}},
  {id:"vboa_ancient",name:"Ancient",tier:"legendary",chain:["verdantboa","rootlord"],appearances:{verdantboa:{emoji:"🏛️"},rootlord:{emoji:"🌌"}}},
  // mossgolem / jadegiant
  {id:"mgolem_lava",name:"Magma",tier:"rare",chain:["mossgolem","jadegiant"],appearances:{mossgolem:{emoji:"🌋"},jadegiant:{emoji:"🔥"}}},
  {id:"mgolem_void",name:"Void",tier:"epic",chain:["mossgolem","jadegiant"],appearances:{mossgolem:{emoji:"🌑"},jadegiant:{emoji:"💀"}}},
  {id:"mgolem_crystal",name:"Crystal",tier:"legendary",chain:["mossgolem","jadegiant"],appearances:{mossgolem:{emoji:"💎"},jadegiant:{emoji:"✨"}}},
  // venomfiend / plaguefiend
  {id:"vfiend_crystal",name:"Crystal",tier:"rare",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"💎"},plaguefiend:{emoji:"🔮"}}},
  {id:"vfiend_shadow",name:"Shadow",tier:"epic",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"🌑"},plaguefiend:{emoji:"💀"}}},
  {id:"vfiend_ancient",name:"Ancient",tier:"legendary",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"🏛️"},plaguefiend:{emoji:"🌌"}}},
  // crystalcrab / gemtitan
  {id:"ccrab_lava",name:"Magma",tier:"rare",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌋"},gemtitan:{emoji:"🔥"}}},
  {id:"ccrab_void",name:"Void",tier:"epic",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌑"},gemtitan:{emoji:"💀"}}},
  {id:"ccrab_ancient",name:"Ancient",tier:"legendary",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🏛️"},gemtitan:{emoji:"🌌"}}},
  // terradrake / quartzdrake
  {id:"tdrake_frost",name:"Frosted",tier:"rare",chain:["terradrake","quartzdrake"],appearances:{terradrake:{emoji:"❄️"},quartzdrake:{emoji:"🧊"}}},
  {id:"tdrake_void",name:"Void",tier:"epic",chain:["terradrake","quartzdrake"],appearances:{terradrake:{emoji:"🌑"},quartzdrake:{emoji:"💀"}}},
  {id:"tdrake_solar",name:"Solar",tier:"legendary",chain:["terradrake","quartzdrake"],appearances:{terradrake:{emoji:"☀️"},quartzdrake:{emoji:"🌟"}}},
  // seismichog / tectohog
  {id:"hog_crystal",name:"Crystal",tier:"rare",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"💎"},tectohog:{emoji:"✨"}}},
  {id:"hog_void",name:"Void",tier:"epic",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"🌑"},tectohog:{emoji:"💀"}}},
  {id:"hog_ancient",name:"Ancient",tier:"legendary",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"🏛️"},tectohog:{emoji:"🌌"}}},
  // galeserpent / cyclonwyrm
  {id:"gserpent_ember",name:"Ember",tier:"rare",chain:["galeserpent","cyclonwyrm"],appearances:{galeserpent:{emoji:"🔥"},cyclonwyrm:{emoji:"🌋"}}},
  {id:"gserpent_void",name:"Void",tier:"epic",chain:["galeserpent","cyclonwyrm"],appearances:{galeserpent:{emoji:"🌑"},cyclonwyrm:{emoji:"💀"}}},
  {id:"gserpent_lightning",name:"Lightning",tier:"legendary",chain:["galeserpent","cyclonwyrm"],appearances:{galeserpent:{emoji:"⚡"},cyclonwyrm:{emoji:"🌩️"}}},
  // stormsurger / stormphoenix
  {id:"surger_ember",name:"Ember",tier:"rare",chain:["stormsurger","stormphoenix"],appearances:{stormsurger:{emoji:"🔥"},stormphoenix:{emoji:"🌟"}}},
  {id:"surger_void",name:"Void",tier:"epic",chain:["stormsurger","stormphoenix"],appearances:{stormsurger:{emoji:"🌑"},stormphoenix:{emoji:"💀"}}},
  {id:"surger_cosmic",name:"Cosmic",tier:"legendary",chain:["stormsurger","stormphoenix"],appearances:{stormsurger:{emoji:"🌌"},stormphoenix:{emoji:"🌠"}}},
  // galelocust / stormlocust
  {id:"locust_ember",name:"Ember",tier:"rare",chain:["galelocust","stormlocust"],appearances:{galelocust:{emoji:"🔥"},stormlocust:{emoji:"🌋"}}},
  {id:"locust_void",name:"Void",tier:"epic",chain:["galelocust","stormlocust"],appearances:{galelocust:{emoji:"🌑"},stormlocust:{emoji:"💀"}}},
  {id:"locust_solar",name:"Solar",tier:"legendary",chain:["galelocust","stormlocust"],appearances:{galelocust:{emoji:"☀️"},stormlocust:{emoji:"🌟"}}},
  // voltdrake / thunderdrake
  {id:"vdrake_frost",name:"Frosted",tier:"rare",chain:["voltdrake","thunderdrake"],appearances:{voltdrake:{emoji:"❄️"},thunderdrake:{emoji:"🧊"}}},
  {id:"vdrake_void",name:"Void",tier:"epic",chain:["voltdrake","thunderdrake"],appearances:{voltdrake:{emoji:"🌑"},thunderdrake:{emoji:"💀"}}},
  {id:"vdrake_solar",name:"Solar",tier:"legendary",chain:["voltdrake","thunderdrake"],appearances:{voltdrake:{emoji:"☀️"},thunderdrake:{emoji:"🌟"}}},
  // boltfly / zapdragon
  {id:"bfly_verdant",name:"Verdant",tier:"rare",chain:["boltfly","zapdragon"],appearances:{boltfly:{emoji:"🌿"},zapdragon:{emoji:"🍃"}}},
  {id:"bfly_void",name:"Void",tier:"epic",chain:["boltfly","zapdragon"],appearances:{boltfly:{emoji:"🌑"},zapdragon:{emoji:"💀"}}},
  {id:"bfly_solar",name:"Solar",tier:"legendary",chain:["boltfly","zapdragon"],appearances:{boltfly:{emoji:"☀️"},zapdragon:{emoji:"🌟"}}},
  // shockcrab / galvaniccrab
  {id:"gcrab_frost",name:"Frosted",tier:"rare",chain:["shockcrab","galvaniccrab"],appearances:{shockcrab:{emoji:"❄️"},galvaniccrab:{emoji:"🧊"}}},
  {id:"gcrab_void",name:"Void",tier:"epic",chain:["shockcrab","galvaniccrab"],appearances:{shockcrab:{emoji:"🌑"},galvaniccrab:{emoji:"💀"}}},
  {id:"gcrab_ancient",name:"Ancient",tier:"legendary",chain:["shockcrab","galvaniccrab"],appearances:{shockcrab:{emoji:"🏛️"},galvaniccrab:{emoji:"🌌"}}},
  // solardrake / celestidrake
  {id:"sdrake_night",name:"Nightfall",tier:"rare",chain:["solardrake","celestidrake"],appearances:{solardrake:{emoji:"🌙"},celestidrake:{emoji:"⭐"}}},
  {id:"sdrake_void",name:"Void",tier:"epic",chain:["solardrake","celestidrake"],appearances:{solardrake:{emoji:"🌑"},celestidrake:{emoji:"💀"}}},
  {id:"sdrake_cosmic",name:"Cosmic",tier:"legendary",chain:["solardrake","celestidrake"],appearances:{solardrake:{emoji:"🌌"},celestidrake:{emoji:"🌠"}}},
  // sacredwasp / holyswarm
  {id:"swasp_night",name:"Nightfall",tier:"rare",chain:["sacredwasp","holyswarm"],appearances:{sacredwasp:{emoji:"🌙"},holyswarm:{emoji:"⭐"}}},
  {id:"swasp_void",name:"Void",tier:"epic",chain:["sacredwasp","holyswarm"],appearances:{sacredwasp:{emoji:"🌑"},holyswarm:{emoji:"💀"}}},
  {id:"swasp_ancient",name:"Ancient",tier:"legendary",chain:["sacredwasp","holyswarm"],appearances:{sacredwasp:{emoji:"🏛️"},holyswarm:{emoji:"🌌"}}},
  // lumigator / radiantgator
  {id:"lgator_night",name:"Nightfall",tier:"rare",chain:["lumigator","radiantgator"],appearances:{lumigator:{emoji:"🌙"},radiantgator:{emoji:"⭐"}}},
  {id:"lgator_void",name:"Void",tier:"epic",chain:["lumigator","radiantgator"],appearances:{lumigator:{emoji:"🌑"},radiantgator:{emoji:"💀"}}},
  {id:"lgator_ancient",name:"Ancient",tier:"legendary",chain:["lumigator","radiantgator"],appearances:{lumigator:{emoji:"🏛️"},radiantgator:{emoji:"🌌"}}},
  // eclipseboa / darkhydra
  {id:"eboa_ember",name:"Ember",tier:"rare",chain:["eclipseboa","darkhydra"],appearances:{eclipseboa:{emoji:"🔥"},darkhydra:{emoji:"🌋"}}},
  {id:"eboa_crystal",name:"Crystal",tier:"epic",chain:["eclipseboa","darkhydra"],appearances:{eclipseboa:{emoji:"💎"},darkhydra:{emoji:"🔮"}}},
  {id:"eboa_cosmic",name:"Cosmic",tier:"legendary",chain:["eclipseboa","darkhydra"],appearances:{eclipseboa:{emoji:"🌌"},darkhydra:{emoji:"🌠"}}},
  // doomgrub / nihilwyrm
  {id:"dgrub_verdant",name:"Verdant",tier:"rare",chain:["doomgrub","nihilwyrm"],appearances:{doomgrub:{emoji:"🌿"},nihilwyrm:{emoji:"🍃"}}},
  {id:"dgrub_crystal",name:"Crystal",tier:"epic",chain:["doomgrub","nihilwyrm"],appearances:{doomgrub:{emoji:"💎"},nihilwyrm:{emoji:"🔮"}}},
  {id:"dgrub_ancient",name:"Ancient",tier:"legendary",chain:["doomgrub","nihilwyrm"],appearances:{doomgrub:{emoji:"🏛️"},nihilwyrm:{emoji:"🌌"}}},
  // ── LEGENDARY creature lines ──────────────────────────────────────────────
  // galephoenix / skyphoenix
  {id:"gphoenix_ember",name:"Ember",tier:"rare",chain:["galephoenix","skyphoenix"],appearances:{galephoenix:{emoji:"🔥"},skyphoenix:{emoji:"🌋"}}},
  {id:"gphoenix_void",name:"Void",tier:"epic",chain:["galephoenix","skyphoenix"],appearances:{galephoenix:{emoji:"🌑"},skyphoenix:{emoji:"💀"}}},
  {id:"gphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["galephoenix","skyphoenix"],appearances:{galephoenix:{emoji:"🌌"},skyphoenix:{emoji:"🌠"}}},
  // cyclonedrake / vortexwyrm
  {id:"cdrake_ember",name:"Ember",tier:"rare",chain:["cyclonedrake","vortexwyrm"],appearances:{cyclonedrake:{emoji:"🔥"},vortexwyrm:{emoji:"🌋"}}},
  {id:"cdrake_void",name:"Void",tier:"epic",chain:["cyclonedrake","vortexwyrm"],appearances:{cyclonedrake:{emoji:"🌑"},vortexwyrm:{emoji:"💀"}}},
  {id:"cdrake_solar",name:"Solar",tier:"legendary",chain:["cyclonedrake","vortexwyrm"],appearances:{cyclonedrake:{emoji:"☀️"},vortexwyrm:{emoji:"🌟"}}},
  // solarphoenix / divinephoenix
  {id:"sphoenix_night",name:"Nightfall",tier:"rare",chain:["solarphoenix","divinephoenix"],appearances:{solarphoenix:{emoji:"🌙"},divinephoenix:{emoji:"⭐"}}},
  {id:"sphoenix_void",name:"Void",tier:"epic",chain:["solarphoenix","divinephoenix"],appearances:{solarphoenix:{emoji:"🌑"},divinephoenix:{emoji:"💀"}}},
  {id:"sphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["solarphoenix","divinephoenix"],appearances:{solarphoenix:{emoji:"🌌"},divinephoenix:{emoji:"🌠"}}},
  // holydragon / celestialdragon
  {id:"hdragon_night",name:"Nightfall",tier:"rare",chain:["holydragon","celestialdragon"],appearances:{holydragon:{emoji:"🌙"},celestialdragon:{emoji:"⭐"}}},
  {id:"hdragon_void",name:"Void",tier:"epic",chain:["holydragon","celestialdragon"],appearances:{holydragon:{emoji:"🌑"},celestialdragon:{emoji:"💀"}}},
  {id:"hdragon_cosmic",name:"Cosmic",tier:"legendary",chain:["holydragon","celestialdragon"],appearances:{holydragon:{emoji:"🌌"},celestialdragon:{emoji:"🌠"}}},
  // blazephoenix / solarpyre
  {id:"bphoenix_frost",name:"Frosted",tier:"rare",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"❄️"},solarpyre:{emoji:"🧊"}}},
  {id:"bphoenix_void",name:"Void",tier:"epic",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"🌑"},solarpyre:{emoji:"💀"}}},
  {id:"bphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"🌌"},solarpyre:{emoji:"🌠"}}},
  // ignisdragon / pyredragon
  {id:"ignis_frost",name:"Frosted",tier:"rare",chain:["ignisdragon","pyredragon"],appearances:{ignisdragon:{emoji:"❄️"},pyredragon:{emoji:"🧊"}}},
  {id:"ignis_void",name:"Void",tier:"epic",chain:["ignisdragon","pyredragon"],appearances:{ignisdragon:{emoji:"🌑"},pyredragon:{emoji:"💀"}}},
  {id:"ignis_cosmic",name:"Cosmic",tier:"legendary",chain:["ignisdragon","pyredragon"],appearances:{ignisdragon:{emoji:"🌌"},pyredragon:{emoji:"🌠"}}},
  // magmatitan / infernocolossus
  {id:"mtitan_frost",name:"Frosted",tier:"rare",chain:["magmatitan","infernocolossus"],appearances:{magmatitan:{emoji:"❄️"},infernocolossus:{emoji:"🧊"}}},
  {id:"mtitan_void",name:"Void",tier:"epic",chain:["magmatitan","infernocolossus"],appearances:{magmatitan:{emoji:"🌑"},infernocolossus:{emoji:"💀"}}},
  {id:"mtitan_cosmic",name:"Cosmic",tier:"legendary",chain:["magmatitan","infernocolossus"],appearances:{magmatitan:{emoji:"🌌"},infernocolossus:{emoji:"🌠"}}},
  // frosthydra / glacialhydra
  {id:"fhydra_ember",name:"Ember",tier:"rare",chain:["frosthydra","glacialhydra"],appearances:{frosthydra:{emoji:"🔥"},glacialhydra:{emoji:"🌋"}}},
  {id:"fhydra_void",name:"Void",tier:"epic",chain:["frosthydra","glacialhydra"],appearances:{frosthydra:{emoji:"🌑"},glacialhydra:{emoji:"💀"}}},
  {id:"fhydra_solar",name:"Solar",tier:"legendary",chain:["frosthydra","glacialhydra"],appearances:{frosthydra:{emoji:"☀️"},glacialhydra:{emoji:"🌟"}}},
  // abyssraken / deepkraken
  {id:"raken_ember",name:"Ember",tier:"rare",chain:["abyssraken","deepkraken"],appearances:{abyssraken:{emoji:"🔥"},deepkraken:{emoji:"🌋"}}},
  {id:"raken_crystal",name:"Crystal",tier:"epic",chain:["abyssraken","deepkraken"],appearances:{abyssraken:{emoji:"💎"},deepkraken:{emoji:"🔮"}}},
  {id:"raken_ancient",name:"Ancient",tier:"legendary",chain:["abyssraken","deepkraken"],appearances:{abyssraken:{emoji:"🏛️"},deepkraken:{emoji:"🌌"}}},
  // oceanwyrm / tidaldragon
  {id:"owyrm_ember",name:"Ember",tier:"rare",chain:["oceanwyrm","tidaldragon"],appearances:{oceanwyrm:{emoji:"🔥"},tidaldragon:{emoji:"🌋"}}},
  {id:"owyrm_void",name:"Void",tier:"epic",chain:["oceanwyrm","tidaldragon"],appearances:{oceanwyrm:{emoji:"🌑"},tidaldragon:{emoji:"💀"}}},
  {id:"owyrm_ancient",name:"Ancient",tier:"legendary",chain:["oceanwyrm","tidaldragon"],appearances:{oceanwyrm:{emoji:"🏛️"},tidaldragon:{emoji:"🌌"}}},
  // morusk / ivormar
  {id:"morusk_obsidian",name:"Obsidian",tier:"rare",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🌑"},ivormar:{emoji:"💀"}}},
  {id:"morusk_ember",name:"Ember",tier:"epic",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🔥"},ivormar:{emoji:"🌋"}}},
  {id:"morusk_ancient",name:"Ancient",tier:"legendary",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🏛️"},ivormar:{emoji:"🌌"}}},
  // verdanthydra / roothydra
  {id:"vhydra_frost",name:"Frosted",tier:"rare",chain:["verdanthydra","roothydra"],appearances:{verdanthydra:{emoji:"❄️"},roothydra:{emoji:"🧊"}}},
  {id:"vhydra_void",name:"Void",tier:"epic",chain:["verdanthydra","roothydra"],appearances:{verdanthydra:{emoji:"🌑"},roothydra:{emoji:"💀"}}},
  {id:"vhydra_cosmic",name:"Cosmic",tier:"legendary",chain:["verdanthydra","roothydra"],appearances:{verdanthydra:{emoji:"🌌"},roothydra:{emoji:"🌠"}}},
  // sylvandragon / ancientdragon
  {id:"sdragon_frost",name:"Frosted",tier:"rare",chain:["sylvandragon","ancientdragon"],appearances:{sylvandragon:{emoji:"❄️"},ancientdragon:{emoji:"🧊"}}},
  {id:"sdragon_void",name:"Void",tier:"epic",chain:["sylvandragon","ancientdragon"],appearances:{sylvandragon:{emoji:"🌑"},ancientdragon:{emoji:"💀"}}},
  {id:"sdragon_cosmic",name:"Cosmic",tier:"legendary",chain:["sylvandragon","ancientdragon"],appearances:{sylvandragon:{emoji:"🌌"},ancientdragon:{emoji:"🌠"}}},
  // bloomphoenix / lifephoenix
  {id:"biphoenix_frost",name:"Frosted",tier:"rare",chain:["bloomphoenix","lifephoenix"],appearances:{bloomphoenix:{emoji:"❄️"},lifephoenix:{emoji:"🧊"}}},
  {id:"biphoenix_void",name:"Void",tier:"epic",chain:["bloomphoenix","lifephoenix"],appearances:{bloomphoenix:{emoji:"🌑"},lifephoenix:{emoji:"💀"}}},
  {id:"biphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["bloomphoenix","lifephoenix"],appearances:{bloomphoenix:{emoji:"🌌"},lifephoenix:{emoji:"🌠"}}},
  // earthgolem / titangolem
  {id:"egolem_crystal",name:"Crystal",tier:"rare",chain:["earthgolem","titangolem"],appearances:{earthgolem:{emoji:"💎"},titangolem:{emoji:"🔮"}}},
  {id:"egolem_void",name:"Void",tier:"epic",chain:["earthgolem","titangolem"],appearances:{earthgolem:{emoji:"🌑"},titangolem:{emoji:"💀"}}},
  {id:"egolem_solar",name:"Solar",tier:"legendary",chain:["earthgolem","titangolem"],appearances:{earthgolem:{emoji:"☀️"},titangolem:{emoji:"🌟"}}},
  // quartzhydra / gemhydra
  {id:"qhydra_ember",name:"Ember",tier:"rare",chain:["quartzhydra","gemhydra"],appearances:{quartzhydra:{emoji:"🔥"},gemhydra:{emoji:"🌋"}}},
  {id:"qhydra_void",name:"Void",tier:"epic",chain:["quartzhydra","gemhydra"],appearances:{quartzhydra:{emoji:"🌑"},gemhydra:{emoji:"💀"}}},
  {id:"qhydra_solar",name:"Solar",tier:"legendary",chain:["quartzhydra","gemhydra"],appearances:{quartzhydra:{emoji:"☀️"},gemhydra:{emoji:"🌟"}}},
  // seismicdrake / quakewyrm
  {id:"seis_crystal",name:"Crystal",tier:"rare",chain:["seismicdrake","quakewyrm"],appearances:{seismicdrake:{emoji:"💎"},quakewyrm:{emoji:"🔮"}}},
  {id:"seis_void",name:"Void",tier:"epic",chain:["seismicdrake","quakewyrm"],appearances:{seismicdrake:{emoji:"🌑"},quakewyrm:{emoji:"💀"}}},
  {id:"seis_solar",name:"Solar",tier:"legendary",chain:["seismicdrake","quakewyrm"],appearances:{seismicdrake:{emoji:"☀️"},quakewyrm:{emoji:"🌟"}}},
  // thunderhydra / stormhydra
  {id:"thydra_frost",name:"Frosted",tier:"rare",chain:["thunderhydra","stormhydra"],appearances:{thunderhydra:{emoji:"❄️"},stormhydra:{emoji:"🧊"}}},
  {id:"thydra_void",name:"Void",tier:"epic",chain:["thunderhydra","stormhydra"],appearances:{thunderhydra:{emoji:"🌑"},stormhydra:{emoji:"💀"}}},
  {id:"thydra_solar",name:"Solar",tier:"legendary",chain:["thunderhydra","stormhydra"],appearances:{thunderhydra:{emoji:"☀️"},stormhydra:{emoji:"🌟"}}},
  // voltphoenix / arcphoenix
  {id:"vphoenix_frost",name:"Frosted",tier:"rare",chain:["voltphoenix","arcphoenix"],appearances:{voltphoenix:{emoji:"❄️"},arcphoenix:{emoji:"🧊"}}},
  {id:"vphoenix_void",name:"Void",tier:"epic",chain:["voltphoenix","arcphoenix"],appearances:{voltphoenix:{emoji:"🌑"},arcphoenix:{emoji:"💀"}}},
  {id:"vphoenix_ancient",name:"Ancient",tier:"legendary",chain:["voltphoenix","arcphoenix"],appearances:{voltphoenix:{emoji:"🏛️"},arcphoenix:{emoji:"🌌"}}},
  // galvanigolem / staticgolem
  {id:"ggolem_frost",name:"Frosted",tier:"rare",chain:["galvanigolem","staticgolem"],appearances:{galvanigolem:{emoji:"❄️"},staticgolem:{emoji:"🧊"}}},
  {id:"ggolem_void",name:"Void",tier:"epic",chain:["galvanigolem","staticgolem"],appearances:{galvanigolem:{emoji:"🌑"},staticgolem:{emoji:"💀"}}},
  {id:"ggolem_solar",name:"Solar",tier:"legendary",chain:["galvanigolem","staticgolem"],appearances:{galvanigolem:{emoji:"☀️"},staticgolem:{emoji:"🌟"}}},
  // voidhydra / nihilhydra
  {id:"nhydra_ember",name:"Ember",tier:"rare",chain:["voidhydra","nihilhydra"],appearances:{voidhydra:{emoji:"🔥"},nihilhydra:{emoji:"🌋"}}},
  {id:"nhydra_crystal",name:"Crystal",tier:"epic",chain:["voidhydra","nihilhydra"],appearances:{voidhydra:{emoji:"💎"},nihilhydra:{emoji:"🔮"}}},
  {id:"nhydra_solar",name:"Solar",tier:"legendary",chain:["voidhydra","nihilhydra"],appearances:{voidhydra:{emoji:"☀️"},nihilhydra:{emoji:"🌟"}}},
  // darkphoenix / oblivionphoenix
  {id:"dphoenix_ember",name:"Ember",tier:"rare",chain:["darkphoenix","oblivionphoenix"],appearances:{darkphoenix:{emoji:"🔥"},oblivionphoenix:{emoji:"🌋"}}},
  {id:"dphoenix_crystal",name:"Crystal",tier:"epic",chain:["darkphoenix","oblivionphoenix"],appearances:{darkphoenix:{emoji:"💎"},oblivionphoenix:{emoji:"🔮"}}},
  {id:"dphoenix_ancient",name:"Ancient",tier:"legendary",chain:["darkphoenix","oblivionphoenix"],appearances:{darkphoenix:{emoji:"🏛️"},oblivionphoenix:{emoji:"🌌"}}},
  // abyssgolem / nihilgolem
  {id:"agolem_ember",name:"Ember",tier:"rare",chain:["abyssgolem","nihilgolem"],appearances:{abyssgolem:{emoji:"🔥"},nihilgolem:{emoji:"🌋"}}},
  {id:"agolem_crystal",name:"Crystal",tier:"epic",chain:["abyssgolem","nihilgolem"],appearances:{abyssgolem:{emoji:"💎"},nihilgolem:{emoji:"🔮"}}},
  {id:"agolem_ancient",name:"Ancient",tier:"legendary",chain:["abyssgolem","nihilgolem"],appearances:{abyssgolem:{emoji:"🏛️"},nihilgolem:{emoji:"🌌"}}},
  {id:"celest_supernova",name:"Supernova",tier:"legendary",chain:["celestialux"],appearances:{celestialux:{emoji:"💫"}}},
];
