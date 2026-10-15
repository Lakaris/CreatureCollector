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
  // Sparkshell battery-tortoise chain.
  {id:"volt_ember",name:"Ember",tier:"common",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🐢"},capacitort:{emoji:"🐢"},dynashell:{emoji:"🔥"}}},
  {id:"volt_neon",name:"Neon",tier:"epic",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🔋"},capacitort:{emoji:"💡"},dynashell:{emoji:"✨"}}},
  {id:"volt_apex",name:"Apex",tier:"legendary",chain:["sparkshell","capacitort","dynashell"],appearances:{sparkshell:{emoji:"🌟"},capacitort:{emoji:"☄️"},dynashell:{emoji:"💫"}}},
  // Cinderbill fire-pelican chain. Only two of the four stages carry a
  // skin -- these predate Pyroclaw and Calderarch joining the line.
  {id:"mag_glacier",name:"Glacier",tier:"rare",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🐧"},kilnwing:{emoji:"❄️"}}},
  {id:"mag_shadow",name:"Obsidian",tier:"epic",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🐦‍⬛"},kilnwing:{emoji:"🐦‍⬛"}}},
  {id:"mag_primordial",name:"Primordial",tier:"legendary",chain:["cinderbill","kilnwing"],appearances:{cinderbill:{emoji:"🌋"},kilnwing:{emoji:"💥"}}},
  // Stormwyvern
  {id:"storm_ember",name:"Ember Drake",tier:"rare",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🦕"}}},
  {id:"storm_void",name:"Void Wyvern",tier:"epic",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🌑"}}},
  {id:"storm_ancient",name:"Ancient",tier:"legendary",chain:["stormwyvern"],appearances:{stormwyvern:{emoji:"🐲"}}},
  // frillet / bulwarden / aegiceras (Frillet / Bulwarden / Aegiceras)
  {id:"krab_sand",name:"Sandy",tier:"rare",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🏖️"},bulwarden:{emoji:"🦀"},aegiceras:{emoji:"⭐"}}},
  {id:"krab_lava",name:"Magma",tier:"epic",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🔥"},bulwarden:{emoji:"🌋"},aegiceras:{emoji:"🌊"}}},
  {id:"krab_ancient",name:"Ancient",tier:"legendary",chain:["frillet","bulwarden","aegiceras"],appearances:{frillet:{emoji:"🌊"},bulwarden:{emoji:"🏔️"},aegiceras:{emoji:"🌌"}}},
  // cragling / cragfist / cloudvault (Cragling / Cragfist / Cloudvault)
  {id:"mole_sand",name:"Desert",tier:"rare",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"🏜️"},cragfist:{emoji:"🌵"},cloudvault:{emoji:"🐪"}}},
  {id:"mole_crystal",name:"Crystal",tier:"epic",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"💎"},cragfist:{emoji:"🔮"},cloudvault:{emoji:"✨"}}},
  {id:"mole_volcanic",name:"Volcanic",tier:"legendary",chain:["cragling","cragfist","cloudvault"],appearances:{cragling:{emoji:"🗿"},cragfist:{emoji:"🏔️"},cloudvault:{emoji:"🌋"}}},
  // aurorion / lumileo / celestleo
  {id:"abird_night",name:"Nightfall",tier:"rare",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"🌙"},lumileo:{emoji:"⭐"},celestleo:{emoji:"🌌"}}},
  {id:"abird_shadow",name:"Shadow",tier:"epic",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"🌑"},lumileo:{emoji:"💀"},celestleo:{emoji:"🕳️"}}},
  {id:"abird_solar",name:"Solar",tier:"legendary",chain:["aurorion","lumileo","celestleo"],appearances:{aurorion:{emoji:"☀️"},lumileo:{emoji:"🌟"},celestleo:{emoji:"💫"}}},
  // Oathcub paladin-bear chain. Only three of the four stages carry a skin.
  {id:"prism_gilded",name:"Gilded",tier:"rare",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🐻"},vowbruin:{emoji:"🥇"},sanctursa:{emoji:"🌟"}}},
  {id:"prism_void",name:"Void",tier:"epic",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🌑"},vowbruin:{emoji:"💀"},sanctursa:{emoji:"🌌"}}},
  {id:"prism_aurora",name:"Aurora",tier:"legendary",chain:["oathcub","vowbruin","sanctursa"],appearances:{oathcub:{emoji:"🌈"},vowbruin:{emoji:"✨"},sanctursa:{emoji:"🌠"}}},
  // emberstar / blastar (Emberstar / Blastar)
  {id:"hornet_frost",name:"Frosted",tier:"rare",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"❄️"},blastar:{emoji:"🌨️"}}},
  {id:"hornet_void",name:"Void",tier:"epic",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"🌑"},blastar:{emoji:"💀"}}},
  {id:"hornet_solar",name:"Solar",tier:"legendary",chain:["emberstar","blastar"],appearances:{emberstar:{emoji:"☀️"},blastar:{emoji:"🌟"}}},
  // nessling / nessarch (Nessling / Nessarch)
  {id:"coral_lava",name:"Magma",tier:"rare",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🌋"},nessarch:{emoji:"🔥"}}},
  {id:"coral_shadow",name:"Abyssal",tier:"epic",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🌑"},nessarch:{emoji:"💀"}}},
  {id:"coral_ancient",name:"Ancient",tier:"legendary",chain:["nessling","nessarch"],appearances:{nessling:{emoji:"🏛️"},nessarch:{emoji:"🌌"}}},
  // sporolith / jadolith
  {id:"mgolem_lava",name:"Magma",tier:"rare",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"🌋"},jadolith:{emoji:"🔥"}}},
  {id:"mgolem_void",name:"Void",tier:"epic",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"🌑"},jadolith:{emoji:"💀"}}},
  {id:"mgolem_crystal",name:"Crystal",tier:"legendary",chain:["sporolith","jadolith"],appearances:{sporolith:{emoji:"💎"},jadolith:{emoji:"✨"}}},
  // crystalcrab / gemtitan
  {id:"ccrab_lava",name:"Magma",tier:"rare",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌋"},gemtitan:{emoji:"🔥"}}},
  {id:"ccrab_void",name:"Void",tier:"epic",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🌑"},gemtitan:{emoji:"💀"}}},
  {id:"ccrab_ancient",name:"Ancient",tier:"legendary",chain:["crystalcrab","gemtitan"],appearances:{crystalcrab:{emoji:"🏛️"},gemtitan:{emoji:"🌌"}}},
  // coatlet / quetzalis (Coatlet / Quetzalis)
  {id:"gserpent_ember",name:"Ember",tier:"rare",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"🔥"},quetzalis:{emoji:"🌋"}}},
  {id:"gserpent_void",name:"Void",tier:"epic",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"🌑"},quetzalis:{emoji:"💀"}}},
  {id:"gserpent_lightning",name:"Lightning",tier:"legendary",chain:["coatlet","quetzalis"],appearances:{coatlet:{emoji:"⚡"},quetzalis:{emoji:"🌩️"}}},
  // Frizzlamb static-fleece chain. Only the first and last stage carry a skin.
  {id:"vdrake_frost",name:"Frosted",tier:"rare",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"❄️"},thunderfleece:{emoji:"🧊"}}},
  {id:"vdrake_void",name:"Void",tier:"epic",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"🌑"},thunderfleece:{emoji:"💀"}}},
  {id:"vdrake_solar",name:"Solar",tier:"legendary",chain:["frizzlamb","thunderfleece"],appearances:{frizzlamb:{emoji:"☀️"},thunderfleece:{emoji:"🌟"}}},
  // shockstinger / galvascorpion
  {id:"gcrab_frost",name:"Frosted",tier:"rare",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"❄️"},galvascorpion:{emoji:"🧊"}}},
  {id:"gcrab_void",name:"Void",tier:"epic",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"🌑"},galvascorpion:{emoji:"💀"}}},
  {id:"gcrab_ancient",name:"Ancient",tier:"legendary",chain:["shockstinger","galvascorpion"],appearances:{shockstinger:{emoji:"🏛️"},galvascorpion:{emoji:"🌌"}}},
  // starlit / starburn
  {id:"swasp_night",name:"Nightfall",tier:"rare",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🌙"},starburn:{emoji:"⭐"}}},
  {id:"swasp_void",name:"Void",tier:"epic",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🌑"},starburn:{emoji:"💀"}}},
  {id:"swasp_ancient",name:"Ancient",tier:"legendary",chain:["starlit","starburn"],appearances:{starlit:{emoji:"🏛️"},starburn:{emoji:"🌌"}}},
  // doomshade / nihilgeist
  {id:"dgrub_verdant",name:"Verdant",tier:"rare",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"🌿"},nihilgeist:{emoji:"🍃"}}},
  {id:"dgrub_crystal",name:"Crystal",tier:"epic",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"💎"},nihilgeist:{emoji:"🔮"}}},
  {id:"dgrub_ancient",name:"Ancient",tier:"legendary",chain:["doomshade","nihilgeist"],appearances:{doomshade:{emoji:"🏛️"},nihilgeist:{emoji:"🌌"}}},
  // ── LEGENDARY creature lines ──────────────────────────────────────────────
  // sicklewing / galescythe
  {id:"gphoenix_ember",name:"Ember",tier:"rare",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🔥"},galescythe:{emoji:"🌋"}}},
  {id:"gphoenix_void",name:"Void",tier:"epic",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🌑"},galescythe:{emoji:"💀"}}},
  {id:"gphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["sicklewing","galescythe"],appearances:{sicklewing:{emoji:"🌌"},galescythe:{emoji:"🌠"}}},
  // auravast / lumimajor
  {id:"griffin_night",name:"Nightfall",tier:"rare",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌙"},lumimajor:{emoji:"⭐"}}},
  {id:"griffin_void",name:"Void",tier:"epic",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌑"},lumimajor:{emoji:"💀"}}},
  {id:"griffin_cosmic",name:"Cosmic",tier:"legendary",chain:["auravast","lumimajor"],appearances:{auravast:{emoji:"🌌"},lumimajor:{emoji:"🌠"}}},
  // emberant / formicinder
  {id:"fireant_frost",name:"Frosted",tier:"rare",chain:["emberant","formicinder"],appearances:{emberant:{emoji:"❄️"},formicinder:{emoji:"🧊"}}},
  {id:"fireant_void",name:"Void",tier:"epic",chain:["emberant","formicinder"],appearances:{emberant:{emoji:"🌑"},formicinder:{emoji:"💀"}}},
  {id:"fireant_cosmic",name:"Cosmic",tier:"legendary",chain:["emberant","formicinder"],appearances:{emberant:{emoji:"🌌"},formicinder:{emoji:"🌠"}}},
  // ignissaur / pyresaur
  {id:"ignis_frost",name:"Frosted",tier:"rare",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"❄️"},pyresaur:{emoji:"🧊"}}},
  {id:"ignis_void",name:"Void",tier:"epic",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"🌑"},pyresaur:{emoji:"💀"}}},
  {id:"ignis_cosmic",name:"Cosmic",tier:"legendary",chain:["ignissaur","pyresaur"],appearances:{ignissaur:{emoji:"🌌"},pyresaur:{emoji:"🌠"}}},
  // waddlepop / frostillery (Waddlepop / Frostillery)
  {id:"fhydra_ember",name:"Ember",tier:"rare",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"🔥"},frostillery:{emoji:"🌋"}}},
  {id:"fhydra_void",name:"Void",tier:"epic",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"🌑"},frostillery:{emoji:"💀"}}},
  {id:"fhydra_solar",name:"Solar",tier:"legendary",chain:["waddlepop","frostillery"],appearances:{waddlepop:{emoji:"☀️"},frostillery:{emoji:"🌟"}}},
  // morusk / ivormar
  {id:"morusk_obsidian",name:"Obsidian",tier:"rare",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🌑"},ivormar:{emoji:"💀"}}},
  {id:"morusk_ember",name:"Ember",tier:"epic",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🔥"},ivormar:{emoji:"🌋"}}},
  {id:"morusk_ancient",name:"Ancient",tier:"legendary",chain:["morusk","ivormar"],appearances:{morusk:{emoji:"🏛️"},ivormar:{emoji:"🌌"}}},
  // siegefin / siegespire
  {id:"sdragon_frost",name:"Frosted",tier:"rare",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"❄️"},siegespire:{emoji:"🧊"}}},
  {id:"sdragon_void",name:"Void",tier:"epic",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"🌑"},siegespire:{emoji:"💀"}}},
  {id:"sdragon_cosmic",name:"Cosmic",tier:"legendary",chain:["siegefin","siegespire"],appearances:{siegefin:{emoji:"🌌"},siegespire:{emoji:"🌠"}}},
  // bloomibis / animavis
  {id:"biphoenix_frost",name:"Frosted",tier:"rare",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"❄️"},animavis:{emoji:"🧊"}}},
  {id:"biphoenix_void",name:"Void",tier:"epic",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"🌑"},animavis:{emoji:"💀"}}},
  {id:"biphoenix_cosmic",name:"Cosmic",tier:"legendary",chain:["bloomibis","animavis"],appearances:{bloomibis:{emoji:"🌌"},animavis:{emoji:"🌠"}}},
  // clubtail / anvilback
  // Clubtail ankylosaur chain.
  {id:"seis_crystal",name:"Crystal",tier:"rare",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"💎"},anvilback:{emoji:"🔮"}}},
  {id:"seis_void",name:"Void",tier:"epic",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"🌑"},anvilback:{emoji:"💀"}}},
  {id:"seis_solar",name:"Solar",tier:"legendary",chain:["clubtail","anvilback"],appearances:{clubtail:{emoji:"☀️"},anvilback:{emoji:"🌟"}}},
  // voltravene / arcmajor
  {id:"thydra_frost",name:"Frosted",tier:"rare",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"❄️"},arcmajor:{emoji:"🧊"}}},
  {id:"thydra_void",name:"Void",tier:"epic",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"🌑"},arcmajor:{emoji:"💀"}}},
  {id:"thydra_solar",name:"Solar",tier:"legendary",chain:["voltravene","arcmajor"],appearances:{voltravene:{emoji:"☀️"},arcmajor:{emoji:"🌟"}}},
  // loptrix / ragnavix (Loptrix / Ragnavix)
  {id:"agolem_ember",name:"Ember",tier:"rare",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"🔥"},ragnavix:{emoji:"🌋"}}},
  {id:"agolem_crystal",name:"Crystal",tier:"epic",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"💎"},ragnavix:{emoji:"🔮"}}},
  {id:"agolem_ancient",name:"Ancient",tier:"legendary",chain:["loptrix","ragnavix"],appearances:{loptrix:{emoji:"🏛️"},ragnavix:{emoji:"🌌"}}},
];