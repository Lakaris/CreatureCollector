// Ascension star display.

import React from "../../react.js";

// One star slot: a 1em picture, the band's filled star for a slot worth two
// ascensions, its hollow star otherwise. Every slot is the same box, so a row
// stays evenly spaced and `gap` on the row is the one spacing knob.
function StarSlot({filled,images}){
  return React.createElement("img",{src:filled?images.filled:images.hollow,alt:"",draggable:false,
    style:{display:"inline-block",width:"1em",height:"1em",objectFit:"contain",verticalAlign:"middle",flexShrink:0}});
}

// `n` stars (at most five, see ascStarTier), the first `doubled` of them
// filled. `images` ({hollow, filled}) is the band's star art. Star size is
// the row's font-size, set through `style`.
function AscStars({n,doubled=0,images,style}){
  if(!n||!images)return null;
  const slots=[];
  for(let i=0;i<n;i++)slots.push(React.createElement(StarSlot,{key:i,filled:i<doubled,images}));
  // inline-flex rather than an inline run: it centres the slots on the row's
  // own box instead of a text baseline (a baseline leaves the row sitting low).
  return React.createElement("span",{style:{display:"inline-flex",alignItems:"center",...style}},slots);
}

// Ascensions run 1-50 as five bands of ten, and a band never shows more than
// five stars: the first five add hollow stars one at a time, and the second
// five fill those same slots in left to right, each filled star worth two. So
// 6 is one filled star and four hollow; 10 is five filled. The band's metal
// says which ten -- grey, bronze, silver, platinum, gold (art in
// images/item_icons/ascensions).
const STAR_ART="images/item_icons/ascensions/";
const ASC_TIERS=["grey","bronze","silver","platinum","gold"].map((metal)=>({
  hollow:STAR_ART+"hollow"+metal+"star.png",filled:STAR_ART+metal+"star.png",
}));

/** Splits an ascension count into stars to draw, how many of them are filled
 *  (worth two), and the band's star art. */
export function ascStarTier(n){
  if(!(n>0))return {count:0,doubled:0,images:null};
  const band=Math.min(ASC_TIERS.length-1,Math.floor((n-1)/10));
  const within=n-band*10;
  return {count:Math.min(5,within),doubled:Math.max(0,within-5),images:ASC_TIERS[band]};
}

/** A creature's ascension row: ascStarTier straight into AscStars. `size` is
 *  the star size -- px, or any CSS length. */
export function CreatureAscStars({asc,size=12,style}){
  const t=ascStarTier(asc);
  return React.createElement(AscStars,{n:t.count,doubled:t.doubled,images:t.images,style:{fontSize:size,gap:1,...style}});
}

/** Gear's ascension row. Gear ascends 0-10, which is exactly the first band
 *  of the creature scheme -- five hollow stars, then filling in -- so it
 *  reuses ascStarTier and the same star art. Fully ascended gear (10) shows
 *  five gold stars instead of grey, so maxed gear stands out. `size` is the
 *  star size in px. */
export function GearAscStars({asc,size=12,style}){
  const t=ascStarTier(asc);
  const images=asc>=10?ASC_TIERS[ASC_TIERS.length-1]:t.images;
  return React.createElement(AscStars,{n:t.count,doubled:t.doubled,images,style:{fontSize:size,gap:1,...style}});
}

export default AscStars;
