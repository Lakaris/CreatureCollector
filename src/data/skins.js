// Cosmetic skin sets. `chain` lists which creature ids in an evolution line a skin
// applies to; `appearances` maps creature id -> override emoji.

export const SKIN_SETS=[
  // Emberpup / Emberhound
  {id:"pup_arctic",name:"Arctic",tier:"rare",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🐩"},emberhound:{emoji:"🐺"}}},
  {id:"pup_shadow",name:"Shadow",tier:"epic",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🐕‍🦺"},emberhound:{emoji:"🦝"}}},
  {id:"pup_golden",name:"Golden",tier:"legendary",chain:["emberpup","emberhound"],appearances:{emberpup:{emoji:"🦊"},emberhound:{emoji:"🦁"}}},
  // venomcoil / mirewreathe (Venomcoil / Mirewreathe)
  {id:"leaf_blossom",name:"Blossom",tier:"common",chain:["venomcoil","mirewreathe"],appearances:{venomcoil:{emoji:"🌱"},mirewreathe:{emoji:"🌸"}}},
  {id:"leaf_autumn",name:"Autumn",tier:"rare",chain:["venomcoil","mirewreathe"],appearances:{venomcoil:{emoji:"🍂"},mirewreathe:{emoji:"🍁"}}},
  {id:"leaf_ancient",name:"Ancient",tier:"legendary",chain:["venomcoil","mirewreathe"],appearances:{venomcoil:{emoji:"🦴"},mirewreathe:{emoji:"🗿"}}},
  // Pebbit / Bouldroad
  {id:"rock_sandy",name:"Sandy",tier:"common",chain:["pebbit","bouldroad"],appearances:{pebbit:{emoji:"🦎"},bouldroad:{emoji:"🐢"}}},
  {id:"rock_crystal",name:"Crystal",tier:"epic",chain:["pebbit","bouldroad"],appearances:{pebbit:{emoji:"💎"},bouldroad:{emoji:"🗿"}}},
  {id:"rock_volcanic",name:"Volcanic",tier:"legendary",chain:["pebbit","bouldroad"],appearances:{pebbit:{emoji:"🌋"},bouldroad:{emoji:"🏔️"}}},
  // cirruskit / cumulynx (Cirruskit / Cumulynx)
  {id:"wind_storm",name:"Stormborn",tier:"rare",chain:["cirruskit","cumulynx"],appearances:{cirruskit:{emoji:"🍃"},cumulynx:{emoji:"🌀"}}},
  {id:"wind_arctic",name:"Frostwind",tier:"epic",chain:["cirruskit","cumulynx"],appearances:{cirruskit:{emoji:"🌬️"},cumulynx:{emoji:"🌨️"}}},
  {id:"wind_thunder",name:"Thunder",tier:"legendary",chain:["cirruskit","cumulynx"],appearances:{cirruskit:{emoji:"⚡"},cumulynx:{emoji:"🌩️"}}},
  // Frostfang / Glacierwulf
  {id:"frost_ember",name:"Ember",tier:"common",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🦊"},glacierwulf:{emoji:"🔥"},frostwyvern:{emoji:"🐊"}}},
  {id:"frost_shadow",name:"Nightfall",tier:"rare",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🌑"},glacierwulf:{emoji:"🌚"},frostwyvern:{emoji:"👻"}}},
  {id:"frost_blizzard",name:"Blizzard",tier:"legendary",chain:["frostfang","glacierwulf","frostwyvern"],appearances:{frostfang:{emoji:"🌨️"},glacierwulf:{emoji:"🧊"},frostwyvern:{emoji:"❄️"}}},
  // Sparkshell battery-tortoise chain.
  {id:"volt_ember",name:"Ember",tier:"common",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🐢"},capacitort:{emoji:"🐢"},dynashell:{emoji:"🔥"}}},
  {id:"volt_neon",name:"Neon",tier:"epic",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🔋"},capacitort:{emoji:"💡"},dynashell:{emoji:"✨"}}},
  {id:"volt_apex",name:"Apex",tier:"legendary",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🌟"},capacitort:{emoji:"☄️"},dynashell:{emoji:"💫"}}},
  // Tideclaw
  {id:"tide_abyssal",name:"Abyssal",tier:"rare",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🦑"},tidalcrusher:{emoji:"🌊"},abyssking:{emoji:"🐙"}}},
  {id:"tide_coral",name:"Coral",tier:"epic",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🦀"},tidalcrusher:{emoji:"🌺"},abyssking:{emoji:"🐠"}}},
  {id:"tide_leviathan",name:"Leviathan",tier:"legendary",chain:["tideclaw","tidalcrusher","abyssking"],appearances:{tideclaw:{emoji:"🐙"},tidalcrusher:{emoji:"🦑"},abyssking:{emoji:"🐬"}}},
  // Cinderbill fire-pelican chain. Only two of the four stages carry a
  // skin -- these predate Pyroclaw and Calderarch joining the line.
  {id:"mag_glacier",name:"Glacier",tier:"rare",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🐧"},kilnwing:{emoji:"❄️"}}},
  {id:"mag_shadow",name:"Obsidian",tier:"epic",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🐦‍⬛"},kilnwing:{emoji:"🐦‍⬛"}}},
  {id:"mag_primordial",name:"Primordial",tier:"legendary",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🌋"},kilnwing:{emoji:"💥"}}},
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
  // seadrake / bathydrake / abyssaur
  {id:"sea_crimson",name:"Crimson",tier:"rare",chain:["seadrake","bathydrake","abyssaur"],appearances:{seadrake:{emoji:"🐍"},bathydrake:{emoji:"🦎"},abyssaur:{emoji:"🐲"}}},
  {id:"sea_spectral",name:"Spectral",tier:"epic",chain:["seadrake","bathydrake","abyssaur"],appearances:{seadrake:{emoji:"👻"},bathydrake:{emoji:"🌫️"},abyssaur:{emoji:"💀"}}},
  {id:"sea_elder",name:"Elder",tier:"legendary",chain:["seadrake","bathydrake","abyssaur"],appearances:{seadrake:{emoji:"🌊"},bathydrake:{emoji:"🌑"},abyssaur:{emoji:"🌌"}}},
  // lavagator / magmadrake / pyrotegu
  {id:"lava_glacial",name:"Glacial",tier:"rare",chain:["lavagator","magmadrake","pyrotegu"],appearances:{lavagator:{emoji:"❄️"},magmadrake:{emoji:"🧊"},pyrotegu:{emoji:"💎"}}},
  {id:"lava_obsidian",name:"Obsidian",tier:"epic",chain:["lavagator","magmadrake","pyrotegu"],appearances:{lavagator:{emoji:"🌑"},magmadrake:{emoji:"💀"},pyrotegu:{emoji:"🕳️"}}},
  {id:"lava_solar",name:"Solar",tier:"legendary",chain:["lavagator","magmadrake","pyrotegu"],appearances:{lavagator:{emoji:"🌟"},magmadrake:{emoji:"⭐"},pyrotegu:{emoji:"☀️"}}},
  // blazemoth / scorchwing / infernosprite
  {id:"moth_lunar",name:"Lunar",tier:"rare",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"🌙"},scorchwing:{emoji:"🦋"},infernosprite:{emoji:"✨"}}},
  {id:"moth_void",name:"Void",tier:"epic",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"🌑"},scorchwing:{emoji:"🦇"},infernosprite:{emoji:"💀"}}},
  {id:"moth_solar",name:"Solar",tier:"legendary",chain:["blazemoth","scorchwing","infernosprite"],appearances:{blazemoth:{emoji:"☀️"},scorchwing:{emoji:"🌟"},infernosprite:{emoji:"💫"}}},
  // emberscorp / pyrescorp / magmascorp
  {id:"scorp_venom",name:"Venom",tier:"rare",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"🦂"},pyrescorp:{emoji:"🐍"},magmascorp:{emoji:"☠️"}}},
  {id:"scorp_crystal",name:"Crystal",tier:"epic",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"💎"},pyrescorp:{emoji:"🔮"},magmascorp:{emoji:"🪩"}}},
  {id:"scorp_ancient",name:"Ancient",tier:"legendary",chain:["emberscorp","pyrescorp","magmascorp"],appearances:{emberscorp:{emoji:"🦕"},pyrescorp:{emoji:"🦖"},magmascorp:{emoji:"🐉"}}},
  // frillet / bulwarden / aegiceras (Frillet / Bulwarden / Aegiceras)
  {id:"krab_sand",name:"Sandy",tier:"rare",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🏖️"},bulwarden:{emoji:"🦀"},aegiceras:{emoji:"⭐"}}},
  {id:"krab_lava",name:"Magma",tier:"epic",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🔥"},bulwarden:{emoji:"🌋"},aegiceras:{emoji:"🌊"}}},
  {id:"krab_ancient",name:"Ancient",tier:"legendary",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🌊"},bulwarden:{emoji:"🏔️"},aegiceras:{emoji:"🌌"}}},
  // thornturtle / jadeshell / shellith
  {id:"turtle_sea",name:"Deep Sea",tier:"rare",chain:["thornturtle","jadeshell","shellith"],appearances:{thornturtle:{emoji:"🐢"},jadeshell:{emoji:"🌊"},shellith:{emoji:"🐬"}}},
  {id:"turtle_prism",name:"Prism",tier:"epic",chain:["thornturtle","jadeshell","shellith"],appearances:{thornturtle:{emoji:"💎"},jadeshell:{emoji:"🔮"},shellith:{emoji:"✨"}}},
  {id:"turtle_titan",name:"Titan",tier:"legendary",chain:["thornturtle","jadeshell","shellith"],appearances:{thornturtle:{emoji:"🗿"},jadeshell:{emoji:"🏔️"},shellith:{emoji:"🌍"}}},
  // cragling / cragfist / cloudvault (Cragling / Cragfist / Cloudvault)
  {id:"mole_sand",name:"Desert",tier:"rare",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"🏜️"},cragfist:{emoji:"🌵"},cloudvault:{emoji:"🐪"}}},
  {id:"mole_crystal",name:"Crystal",tier:"epic",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"💎"},cragfist:{emoji:"🔮"},cloudvault:{emoji:"✨"}}},
  {id:"mole_volcanic",name:"Volcanic",tier:"legendary",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"🗿"},cragfist:{emoji:"🏔️"},cloudvault:{emoji:"🌋"}}},
  // quakebeetle / lithbeetle / gemscrab
  {id:"beetle_gilded",name:"Gilded",tier:"rare",chain:["quakebeetle","lithbeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🪲"},lithbeetle:{emoji:"🏅"},gemscrab:{emoji:"🥇"}}},
  {id:"beetle_shadow",name:"Shadow",tier:"epic",chain:["quakebeetle","lithbeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🌑"},lithbeetle:{emoji:"💀"},gemscrab:{emoji:"🌌"}}},
  {id:"beetle_prism",name:"Prismatic",tier:"legendary",chain:["quakebeetle","lithbeetle","gemscrab"],appearances:{quakebeetle:{emoji:"🌈"},lithbeetle:{emoji:"✨"},gemscrab:{emoji:"💎"}}},
  // skyeel / vorteel / stormeel
  {id:"eel_coral",name:"Coral",tier:"rare",chain:["skyeel","vorteel","stormeel"],appearances:{skyeel:{emoji:"🐠"},vorteel:{emoji:"🌊"},stormeel:{emoji:"🌀"}}},
  {id:"eel_lightning",name:"Lightning",tier:"epic",chain:["skyeel","vorteel","stormeel"],appearances:{skyeel:{emoji:"⚡"},vorteel:{emoji:"🌩️"},stormeel:{emoji:"💫"}}},
  {id:"eel_aurora",name:"Aurora",tier:"legendary",chain:["skyeel","vorteel","stormeel"],appearances:{skyeel:{emoji:"🌌"},vorteel:{emoji:"✨"},stormeel:{emoji:"🌠"}}},
  // zapfrog / voltfrog / fulgutoad
  {id:"frog_verdant",name:"Verdant",tier:"rare",chain:["zapfrog","voltfrog","fulgutoad"],appearances:{zapfrog:{emoji:"🐸"},voltfrog:{emoji:"🌿"},fulgutoad:{emoji:"🌊"}}},
  {id:"frog_shadow",name:"Shadow",tier:"epic",chain:["zapfrog","voltfrog","fulgutoad"],appearances:{zapfrog:{emoji:"🌑"},voltfrog:{emoji:"👻"},fulgutoad:{emoji:"💀"}}},
  {id:"frog_gilded",name:"Gilded",tier:"legendary",chain:["zapfrog","voltfrog","fulgutoad"],appearances:{zapfrog:{emoji:"🌟"},voltfrog:{emoji:"⭐"},fulgutoad:{emoji:"☀️"}}},
  // aurorion / lumileo / celestleo
  {id:"abird_night",name:"Nightfall",tier:"rare",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"🌙"},lumileo:{emoji:"⭐"},celestleo:{emoji:"🌌"}}},
  {id:"abird_shadow",name:"Shadow",tier:"epic",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"🌑"},lumileo:{emoji:"💀"},celestleo:{emoji:"🕳️"}}},
  {id:"abird_solar",name:"Solar",tier:"legendary",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"☀️"},lumileo:{emoji:"🌟"},celestleo:{emoji:"💫"}}},
  // Oathcub paladin-bear chain. Only three of the four stages carry a skin.
  {id:"prism_gilded",name:"Gilded",tier:"rare",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🐻"},vowbruin:{emoji:"🥇"},sanctursa:{emoji:"🌟"}}},
  {id:"prism_void",name:"Void",tier:"epic",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🌑"},vowbruin:{emoji:"💀"},sanctursa:{emoji:"🌌"}}},
  {id:"prism_aurora",name:"Aurora",tier:"legendary",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🌈"},vowbruin:{emoji:"✨"},sanctursa:{emoji:"🌠"}}},
  // sacramoth / lumimoth / celestimoth
  {id:"hmoth_night",name:"Nightfall",tier:"rare",chain:["sacramoth","lumimoth","celestimoth"],appearances:{sacramoth:{emoji:"🌙"},lumimoth:{emoji:"⭐"},celestimoth:{emoji:"🌌"}}},
  {id:"hmoth_shadow",name:"Shadow",tier:"epic",chain:["sacramoth","lumimoth","celestimoth"],appearances:{sacramoth:{emoji:"🌑"},lumimoth:{emoji:"💀"},celestimoth:{emoji:"🕳️"}}},
  {id:"hmoth_solar",name:"Solar",tier:"legendary",chain:["sacramoth","lumimoth","celestimoth"],appearances:{sacramoth:{emoji:"☀️"},lumimoth:{emoji:"🌟"},celestimoth:{emoji:"💫"}}},
  // vacurach / umbrachnid / abyrach
  {id:"spider_ember",name:"Ember",tier:"rare",chain:["vacurach","umbrachnid","abyrach"],appearances:{vacurach:{emoji:"🔥"},umbrachnid:{emoji:"🦂"},abyrach:{emoji:"🌋"}}},
  {id:"spider_crystal",name:"Crystal",tier:"epic",chain:["vacurach","umbrachnid","abyrach"],appearances:{vacurach:{emoji:"💎"},umbrachnid:{emoji:"🔮"},abyrach:{emoji:"✨"}}},
  {id:"spider_cosmic",name:"Cosmic",tier:"legendary",chain:["vacurach","umbrachnid","abyrach"],appearances:{vacurach:{emoji:"🌌"},umbrachnid:{emoji:"🌑"},abyrach:{emoji:"🕳️"}}},
  // ── EPIC creature lines ───────────────────────────────────────────────────
  // salamagma / molochvast
  {id:"salama_glacial",name:"Glacial",tier:"rare",chain:["salamagma","molochvast"],appearances:{salamagma:{emoji:"❄️"},molochvast:{emoji:"🧊"}}},
  {id:"salama_obsidian",name:"Obsidian",tier:"epic",chain:["salamagma","molochvast"],appearances:{salamagma:{emoji:"🌑"},molochvast:{emoji:"💀"}}},
  {id:"salama_eternal",name:"Eternal",tier:"legendary",chain:["salamagma","molochvast"],appearances:{salamagma:{emoji:"🏛️"},molochvast:{emoji:"🌌"}}},
  // emberstar / blastar (Emberstar / Blastar)
  {id:"hornet_frost",name:"Frosted",tier:"rare",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"❄️"},blastar:{emoji:"🌨️"}}},
  {id:"hornet_void",name:"Void",tier:"epic",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"🌑"},blastar:{emoji:"💀"}}},
  {id:"hornet_solar",name:"Solar",tier:"legendary",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"☀️"},blastar:{emoji:"🌟"}}},
  // nessling / nessarch (Nessling / Nessarch)
  {id:"coral_lava",name:"Magma",tier:"rare",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🌋"},nessarch:{emoji:"🔥"}}},
  {id:"coral_shadow",name:"Abyssal",tier:"epic",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🌑"},nessarch:{emoji:"💀"}}},
  {id:"coral_ancient",name:"Ancient",tier:"legendary",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🏛️"},nessarch:{emoji:"🌌"}}},
  // frostadder / glacivern
  {id:"fadder_ember",name:"Ember",tier:"rare",chain:["frostadder","glacivern"],appearances:{frostadder:{emoji:"🔥"},glacivern:{emoji:"🌋"}}},
  {id:"fadder_shadow",name:"Shadow",tier:"epic",chain:["frostadder","glacivern"],appearances:{frostadder:{emoji:"🌑"},glacivern:{emoji:"💀"}}},
  {id:"fadder_cosmic",name:"Cosmic",tier:"legendary",chain:["frostadder","glacivern"],appearances:{frostadder:{emoji:"🌌"},glacivern:{emoji:"🌠"}}},
  // stormjelly / abyssjelly
  {id:"jelly_lava",name:"Magma",tier:"rare",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"🌋"},abyssjelly:{emoji:"🔥"}}},
  {id:"jelly_void",name:"Void",tier:"epic",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"🌑"},abyssjelly:{emoji:"💀"}}},
  {id:"jelly_solar",name:"Solar",tier:"legendary",chain:["stormjelly","abyssjelly"],appearances:{stormjelly:{emoji:"☀️"},abyssjelly:{emoji:"🌟"}}},
  // viriboa / rootlord
  {id:"vboa_frost",name:"Frosted",tier:"rare",chain:["viriboa","rootlord"],appearances:{viriboa:{emoji:"❄️"},rootlord:{emoji:"🌨️"}}},
  {id:"vboa_shadow",name:"Shadow",tier:"epic",chain:["viriboa","rootlord"],appearances:{viriboa:{emoji:"🌑"},rootlord:{emoji:"💀"}}},
  {id:"vboa_ancient",name:"Ancient",tier:"legendary",chain:["viriboa","rootlord"],appearances:{viriboa:{emoji:"🏛️"},rootlord:{emoji:"🌌"}}},
  // sporolith / jadolith
  {id:"mgolem_lava",name:"Magma",tier:"rare",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"🌋"},jadolith:{emoji:"🔥"}}},
  {id:"mgolem_void",name:"Void",tier:"epic",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"🌑"},jadolith:{emoji:"💀"}}},
  {id:"mgolem_crystal",name:"Crystal",tier:"legendary",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"💎"},jadolith:{emoji:"✨"}}},
  // venomfiend / plaguefiend
  {id:"vfiend_crystal",name:"Crystal",tier:"rare",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"💎"},plaguefiend:{emoji:"🔮"}}},
  {id:"vfiend_shadow",name:"Shadow",tier:"epic",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"🌑"},plaguefiend:{emoji:"💀"}}},
  {id:"vfiend_ancient",name:"Ancient",tier:"legendary",chain:["venomfiend","plaguefiend"],appearances:{venomfiend:{emoji:"🏛️"},plaguefiend:{emoji:"🌌"}}},
  // crystalcrab / gemtitan
  {id:"ccrab_lava",name:"Magma",tier:"rare",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌋"},gemtitan:{emoji:"🔥"}}},
  {id:"ccrab_void",name:"Void",tier:"epic",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌑"},gemtitan:{emoji:"💀"}}},
  {id:"ccrab_ancient",name:"Ancient",tier:"legendary",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🏛️"},gemtitan:{emoji:"🌌"}}},
  // terrauana / quartzlisk
  {id:"tdrake_frost",name:"Frosted",tier:"rare",chain:["terrauana","quartzlisk"],appearances:{terrauana:{emoji:"❄️"},quartzlisk:{emoji:"🧊"}}},
  {id:"tdrake_void",name:"Void",tier:"epic",chain:["terrauana","quartzlisk"],appearances:{terrauana:{emoji:"🌑"},quartzlisk:{emoji:"💀"}}},
  {id:"tdrake_solar",name:"Solar",tier:"legendary",chain:["terrauana","quartzlisk"],appearances:{terrauana:{emoji:"☀️"},quartzlisk:{emoji:"🌟"}}},
  // seismichog / tectohog
  {id:"hog_crystal",name:"Crystal",tier:"rare",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"💎"},tectohog:{emoji:"✨"}}},
  {id:"hog_void",name:"Void",tier:"epic",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"🌑"},tectohog:{emoji:"💀"}}},
  {id:"hog_ancient",name:"Ancient",tier:"legendary",chain:["seismichog","tectohog"],appearances:{seismichog:{emoji:"🏛️"},tectohog:{emoji:"🌌"}}},
  // coatlet / quetzalis (Coatlet / Quetzalis)
  {id:"gserpent_ember",name:"Ember",tier:"rare",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"🔥"},quetzalis:{emoji:"🌋"}}},
  {id:"gserpent_void",name:"Void",tier:"epic",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"🌑"},quetzalis:{emoji:"💀"}}},
  {id:"gserpent_lightning",name:"Lightning",tier:"legendary",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"⚡"},quetzalis:{emoji:"🌩️"}}},
  // tempesthawk / tempestrel
  {id:"surger_ember",name:"Ember",tier:"rare",chain:["tempesthawk","tempestrel"],appearances:{tempesthawk:{emoji:"🔥"},tempestrel:{emoji:"🌟"}}},
  {id:"surger_void",name:"Void",tier:"epic",chain:["tempesthawk","tempestrel"],appearances:{tempesthawk:{emoji:"🌑"},tempestrel:{emoji:"💀"}}},
  {id:"surger_cosmic",name:"Cosmic",tier:"legendary",chain:["tempesthawk","tempestrel"],appearances:{tempesthawk:{emoji:"🌌"},tempestrel:{emoji:"🌠"}}},
  // galelocust / cyclocus
  {id:"locust_ember",name:"Ember",tier:"rare",chain:["galelocust","cyclocus"],appearances:{galelocust:{emoji:"🔥"},cyclocus:{emoji:"🌋"}}},
  {id:"locust_void",name:"Void",tier:"epic",chain:["galelocust","cyclocus"],appearances:{galelocust:{emoji:"🌑"},cyclocus:{emoji:"💀"}}},
  {id:"locust_solar",name:"Solar",tier:"legendary",chain:["galelocust","cyclocus"],appearances:{galelocust:{emoji:"☀️"},cyclocus:{emoji:"🌟"}}},
  // Frizzlamb static-fleece chain. Only the first and last stage carry a skin.
  {id:"vdrake_frost",name:"Frosted",tier:"rare",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"❄️"},thunderfleece:{emoji:"🧊"}}},
  {id:"vdrake_void",name:"Void",tier:"epic",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"🌑"},thunderfleece:{emoji:"💀"}}},
  {id:"vdrake_solar",name:"Solar",tier:"legendary",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"☀️"},thunderfleece:{emoji:"🌟"}}},
  // shockstinger / galvascorpion
  {id:"gcrab_frost",name:"Frosted",tier:"rare",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"❄️"},galvascorpion:{emoji:"🧊"}}},
  {id:"gcrab_void",name:"Void",tier:"epic",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"🌑"},galvascorpion:{emoji:"💀"}}},
  {id:"gcrab_ancient",name:"Ancient",tier:"legendary",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"🏛️"},galvascorpion:{emoji:"🌌"}}},
  // solardrake / lumiskink
  {id:"sdrake_night",name:"Nightfall",tier:"rare",chain:["solardrake","lumiskink"],appearances:{solardrake:{emoji:"🌙"},lumiskink:{emoji:"⭐"}}},
  {id:"sdrake_void",name:"Void",tier:"epic",chain:["solardrake","lumiskink"],appearances:{solardrake:{emoji:"🌑"},lumiskink:{emoji:"💀"}}},
  {id:"sdrake_cosmic",name:"Cosmic",tier:"legendary",chain:["solardrake","lumiskink"],appearances:{solardrake:{emoji:"🌌"},lumiskink:{emoji:"🌠"}}},
  // starlit / starburn
  {id:"swasp_night",name:"Nightfall",tier:"rare",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🌙"},starburn:{emoji:"⭐"}}},
  {id:"swasp_void",name:"Void",tier:"epic",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🌑"},starburn:{emoji:"💀"}}},
  {id:"swasp_ancient",name:"Ancient",tier:"legendary",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🏛️"},starburn:{emoji:"🌌"}}},
  // lumigator / lumicator
  {id:"lgator_night",name:"Nightfall",tier:"rare",chain:["lumigator","lumicator"],appearances:{lumigator:{emoji:"🌙"},lumicator:{emoji:"⭐"}}},
  {id:"lgator_void",name:"Void",tier:"epic",chain:["lumigator","lumicator"],appearances:{lumigator:{emoji:"🌑"},lumicator:{emoji:"💀"}}},
  {id:"lgator_ancient",name:"Ancient",tier:"legendary",chain:["lumigator","lumicator"],appearances:{lumigator:{emoji:"🏛️"},lumicator:{emoji:"🌌"}}},
  // doomshade / nihilgeist
  {id:"dgrub_verdant",name:"Verdant",tier:"rare",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"🌿"},nihilgeist:{emoji:"🍃"}}},
  {id:"dgrub_crystal",name:"Crystal",tier:"epic",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"💎"},nihilgeist:{emoji:"🔮"}}},
  {id:"dgrub_ancient",name:"Ancient",tier:"legendary",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"🏛️"},nihilgeist:{emoji:"🌌"}}},
  // ── LEGENDARY creature lines ──────────────────────────────────────────────
  // sicklewing / galescythe
  {id:"gphoenix_ember",name:"Ember",tier:"rare",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🔥"},galescythe:{emoji:"🌋"}}},
  {id:"gphoenix_void",name:"Void",tier:"epic",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🌑"},galescythe:{emoji:"💀"}}},
  {id:"gphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🌌"},galescythe:{emoji:"🌠"}}},
  // maelstrake / maelstrix
  {id:"cdrake_ember",name:"Ember",tier:"rare",chain:["maelstrake","maelstrix"],appearances:{maelstrake:{emoji:"🔥"},maelstrix:{emoji:"🌋"}}},
  {id:"cdrake_void",name:"Void",tier:"epic",chain:["maelstrake","maelstrix"],appearances:{maelstrake:{emoji:"🌑"},maelstrix:{emoji:"💀"}}},
  {id:"cdrake_solar",name:"Solar",tier:"legendary",chain:["maelstrake","maelstrix"],appearances:{maelstrake:{emoji:"☀️"},maelstrix:{emoji:"🌟"}}},
  // dawnwing / celestialis
  {id:"sphoenix_night",name:"Nightfall",tier:"rare",chain:["dawnwing","celestialis"],appearances:{dawnwing:{emoji:"🌙"},celestialis:{emoji:"⭐"}}},
  {id:"sphoenix_void",name:"Void",tier:"epic",chain:["dawnwing","celestialis"],appearances:{dawnwing:{emoji:"🌑"},celestialis:{emoji:"💀"}}},
  {id:"sphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["dawnwing","celestialis"],appearances:{dawnwing:{emoji:"🌌"},celestialis:{emoji:"🌠"}}},
  // auravast / lumimajor
  {id:"griffin_night",name:"Nightfall",tier:"rare",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌙"},lumimajor:{emoji:"⭐"}}},
  {id:"griffin_void",name:"Void",tier:"epic",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌑"},lumimajor:{emoji:"💀"}}},
  {id:"griffin_cosmic",name:"Cosmic",tier:"legendary",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌌"},lumimajor:{emoji:"🌠"}}},
  // blazephoenix / solarpyre
  {id:"bphoenix_frost",name:"Frosted",tier:"rare",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"❄️"},solarpyre:{emoji:"🧊"}}},
  {id:"bphoenix_void",name:"Void",tier:"epic",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"🌑"},solarpyre:{emoji:"💀"}}},
  {id:"bphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["blazephoenix","solarpyre"],appearances:{blazephoenix:{emoji:"🌌"},solarpyre:{emoji:"🌠"}}},
  // ignissaur / pyresaur
  {id:"ignis_frost",name:"Frosted",tier:"rare",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"❄️"},pyresaur:{emoji:"🧊"}}},
  {id:"ignis_void",name:"Void",tier:"epic",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"🌑"},pyresaur:{emoji:"💀"}}},
  {id:"ignis_cosmic",name:"Cosmic",tier:"legendary",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"🌌"},pyresaur:{emoji:"🌠"}}},
  // magmaur / infernocolossus
  {id:"mtitan_frost",name:"Frosted",tier:"rare",chain:["magmaur","infernocolossus"],appearances:{magmaur:{emoji:"❄️"},infernocolossus:{emoji:"🧊"}}},
  {id:"mtitan_void",name:"Void",tier:"epic",chain:["magmaur","infernocolossus"],appearances:{magmaur:{emoji:"🌑"},infernocolossus:{emoji:"💀"}}},
  {id:"mtitan_cosmic",name:"Cosmic",tier:"legendary",chain:["magmaur","infernocolossus"],appearances:{magmaur:{emoji:"🌌"},infernocolossus:{emoji:"🌠"}}},
  // waddlepop / frostillery (Waddlepop / Frostillery)
  {id:"fhydra_ember",name:"Ember",tier:"rare",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"🔥"},frostillery:{emoji:"🌋"}}},
  {id:"fhydra_void",name:"Void",tier:"epic",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"🌑"},frostillery:{emoji:"💀"}}},
  {id:"fhydra_solar",name:"Solar",tier:"legendary",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"☀️"},frostillery:{emoji:"🌟"}}},
  // abyssraken / bathykraken
  {id:"raken_ember",name:"Ember",tier:"rare",chain:["abyssraken","bathykraken"],appearances:{abyssraken:{emoji:"🔥"},bathykraken:{emoji:"🌋"}}},
  {id:"raken_crystal",name:"Crystal",tier:"epic",chain:["abyssraken","bathykraken"],appearances:{abyssraken:{emoji:"💎"},bathykraken:{emoji:"🔮"}}},
  {id:"raken_ancient",name:"Ancient",tier:"legendary",chain:["abyssraken","bathykraken"],appearances:{abyssraken:{emoji:"🏛️"},bathykraken:{emoji:"🌌"}}},
  // tidalwarden / tidalorca
  {id:"owyrm_ember",name:"Ember",tier:"rare",chain:["tidalwarden","tidalorca"],appearances:{tidalwarden:{emoji:"🔥"},tidalorca:{emoji:"🌋"}}},
  {id:"owyrm_void",name:"Void",tier:"epic",chain:["tidalwarden","tidalorca"],appearances:{tidalwarden:{emoji:"🌑"},tidalorca:{emoji:"💀"}}},
  {id:"owyrm_ancient",name:"Ancient",tier:"legendary",chain:["tidalwarden","tidalorca"],appearances:{tidalwarden:{emoji:"🏛️"},tidalorca:{emoji:"🌌"}}},
  // morusk / ivormar
  {id:"morusk_obsidian",name:"Obsidian",tier:"rare",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🌑"},ivormar:{emoji:"💀"}}},
  {id:"morusk_ember",name:"Ember",tier:"epic",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🔥"},ivormar:{emoji:"🌋"}}},
  {id:"morusk_ancient",name:"Ancient",tier:"legendary",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🏛️"},ivormar:{emoji:"🌌"}}},
  // thornwarden / worldthorn
  {id:"vhydra_frost",name:"Frosted",tier:"rare",chain:["thornwarden","worldthorn"],appearances:{thornwarden:{emoji:"❄️"},worldthorn:{emoji:"🧊"}}},
  {id:"vhydra_void",name:"Void",tier:"epic",chain:["thornwarden","worldthorn"],appearances:{thornwarden:{emoji:"🌑"},worldthorn:{emoji:"💀"}}},
  {id:"vhydra_cosmic",name:"Cosmic",tier:"legendary",chain:["thornwarden","worldthorn"],appearances:{thornwarden:{emoji:"🌌"},worldthorn:{emoji:"🌠"}}},
  // siegefin / siegespire
  {id:"sdragon_frost",name:"Frosted",tier:"rare",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"❄️"},siegespire:{emoji:"🧊"}}},
  {id:"sdragon_void",name:"Void",tier:"epic",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"🌑"},siegespire:{emoji:"💀"}}},
  {id:"sdragon_cosmic",name:"Cosmic",tier:"legendary",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"🌌"},siegespire:{emoji:"🌠"}}},
  // bloomibis / animavis
  {id:"biphoenix_frost",name:"Frosted",tier:"rare",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"❄️"},animavis:{emoji:"🧊"}}},
  {id:"biphoenix_void",name:"Void",tier:"epic",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"🌑"},animavis:{emoji:"💀"}}},
  {id:"biphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"🌌"},animavis:{emoji:"🌠"}}},
  // terravast / terralith
  {id:"egolem_crystal",name:"Crystal",tier:"rare",chain:["terravast","terralith"],appearances:{terravast:{emoji:"💎"},terralith:{emoji:"🔮"}}},
  {id:"egolem_void",name:"Void",tier:"epic",chain:["terravast","terralith"],appearances:{terravast:{emoji:"🌑"},terralith:{emoji:"💀"}}},
  {id:"egolem_solar",name:"Solar",tier:"legendary",chain:["terravast","terralith"],appearances:{terravast:{emoji:"☀️"},terralith:{emoji:"🌟"}}},
  // geoloch / prismarex
  {id:"qhydra_ember",name:"Ember",tier:"rare",chain:["geoloch","prismarex"],appearances:{geoloch:{emoji:"🔥"},prismarex:{emoji:"🌋"}}},
  {id:"qhydra_void",name:"Void",tier:"epic",chain:["geoloch","prismarex"],appearances:{geoloch:{emoji:"🌑"},prismarex:{emoji:"💀"}}},
  {id:"qhydra_solar",name:"Solar",tier:"legendary",chain:["geoloch","prismarex"],appearances:{geoloch:{emoji:"☀️"},prismarex:{emoji:"🌟"}}},
  // clubtail / anvilback
  // Clubtail ankylosaur chain.
  {id:"seis_crystal",name:"Crystal",tier:"rare",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"💎"},anvilback:{emoji:"🔮"}}},
  {id:"seis_void",name:"Void",tier:"epic",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"🌑"},anvilback:{emoji:"💀"}}},
  {id:"seis_solar",name:"Solar",tier:"legendary",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"☀️"},anvilback:{emoji:"🌟"}}},
  // voltravene / arcmajor
  {id:"thydra_frost",name:"Frosted",tier:"rare",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"❄️"},arcmajor:{emoji:"🧊"}}},
  {id:"thydra_void",name:"Void",tier:"epic",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"🌑"},arcmajor:{emoji:"💀"}}},
  {id:"thydra_solar",name:"Solar",tier:"legendary",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"☀️"},arcmajor:{emoji:"🌟"}}},
  // arcsurge / arcondor
  {id:"vphoenix_frost",name:"Frosted",tier:"rare",chain:["arcsurge","arcondor"],appearances:{arcsurge:{emoji:"❄️"},arcondor:{emoji:"🧊"}}},
  {id:"vphoenix_void",name:"Void",tier:"epic",chain:["arcsurge","arcondor"],appearances:{arcsurge:{emoji:"🌑"},arcondor:{emoji:"💀"}}},
  {id:"vphoenix_ancient",name:"Ancient",tier:"legendary",chain:["arcsurge","arcondor"],appearances:{arcsurge:{emoji:"🏛️"},arcondor:{emoji:"🌌"}}},
  // galvatus / arcvast
  {id:"ggolem_frost",name:"Frosted",tier:"rare",chain:["galvatus","arcvast"],appearances:{galvatus:{emoji:"❄️"},arcvast:{emoji:"🧊"}}},
  {id:"ggolem_void",name:"Void",tier:"epic",chain:["galvatus","arcvast"],appearances:{galvatus:{emoji:"🌑"},arcvast:{emoji:"💀"}}},
  {id:"ggolem_solar",name:"Solar",tier:"legendary",chain:["galvatus","arcvast"],appearances:{galvatus:{emoji:"☀️"},arcvast:{emoji:"🌟"}}},
  // abyssmaw / nullravene
  {id:"nhydra_ember",name:"Ember",tier:"rare",chain:["abyssmaw","nullravene"],appearances:{abyssmaw:{emoji:"🔥"},nullravene:{emoji:"🌋"}}},
  {id:"nhydra_crystal",name:"Crystal",tier:"epic",chain:["abyssmaw","nullravene"],appearances:{abyssmaw:{emoji:"💎"},nullravene:{emoji:"🔮"}}},
  {id:"nhydra_solar",name:"Solar",tier:"legendary",chain:["abyssmaw","nullravene"],appearances:{abyssmaw:{emoji:"☀️"},nullravene:{emoji:"🌟"}}},
  // umbravex / nihilvour
  {id:"dphoenix_ember",name:"Ember",tier:"rare",chain:["umbravex","nihilvour"],appearances:{umbravex:{emoji:"🔥"},nihilvour:{emoji:"🌋"}}},
  {id:"dphoenix_crystal",name:"Crystal",tier:"epic",chain:["umbravex","nihilvour"],appearances:{umbravex:{emoji:"💎"},nihilvour:{emoji:"🔮"}}},
  {id:"dphoenix_ancient",name:"Ancient",tier:"legendary",chain:["umbravex","nihilvour"],appearances:{umbravex:{emoji:"🏛️"},nihilvour:{emoji:"🌌"}}},
  // loptrix / ragnavix (Loptrix / Ragnavix)
  {id:"agolem_ember",name:"Ember",tier:"rare",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"🔥"},ragnavix:{emoji:"🌋"}}},
  {id:"agolem_crystal",name:"Crystal",tier:"epic",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"💎"},ragnavix:{emoji:"🔮"}}},
  {id:"agolem_ancient",name:"Ancient",tier:"legendary",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"🏛️"},ragnavix:{emoji:"🌌"}}},
  {id:"celest_supernova",name:"Supernova",tier:"legendary",chain:["celestialux"],appearances:{celestialux:{emoji:"💫"}}},
];