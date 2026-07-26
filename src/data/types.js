// Elemental types, melon currencies, role/attack-type display config, and the single
// type-effectiveness table.
//
// NOTE: TYPE_EMOJI lists Electric, but no creature has type "Electric" -- it exists
// only for bosses, melons, and arena tabs. That is intentional, not a gap.

export const TYPE_EMOJI={Fire:"🔥",Water:"💧",Nature:"🌿",Earth:"🪨",Wind:"💨",Electric:"⚡",Light:"✨",Dark:"🌑"};
export const MELON_TYPES=Object.entries(TYPE_EMOJI).map(([type,emoji])=>({type,emoji,key:"melon"+type,label:emoji+" "+type+" Melon"}));
MELON_TYPES.push({type:null,emoji:"🌈",key:"melonRainbow",label:"🌈 Rainbow Melon"});
MELON_TYPES.push({type:null,emoji:"🍈",key:"ascensionMelon",label:"🍈 Ascension Melon"});

export const ROLE_CONFIG={
  Attacker:{emoji:"⚔️",color:"#9B2020",bg:"#FDEAEA"},
  Tank:{emoji:"🛡️",color:"#2A6DB5",bg:"#E6F0FB"},
  Support:{emoji:"💚",color:"#2E7D4F",bg:"#E6F6ED"},
};
export const ATTACK_TYPE_CONFIG={
  Melee:{emoji:"🗡️",color:"#7A3B00",bg:"#FFF0E0"},
  Ranged:{emoji:"🏹",color:"#1A5C3A",bg:"#E6F6ED"},
};

// type A is strong against type B means type B is weak to A.
// This is the single source of truth for type effectiveness; the old
// TYPE_STRENGTHS/TYPE_WEAKNESSES pair fed only the never-called typeMultiplier.
export const TYPE_STRONG_AGAINST={Fire:"Nature",Water:"Fire",Nature:"Earth",Earth:"Electric",Electric:"Water",Light:"Dark",Dark:"Light"};
