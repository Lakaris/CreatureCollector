// Ascension star display.

import React from "../../react.js";

// One star's worth of row. Every slot is the same 1em-wide box whether or not
// it is ringed, so a row of mixed slots stays evenly spaced and letter-spacing
// on the row widens the gaps uniformly.
//
// A ringed slot is worth two ascensions: the filled ★ with a larger hollow ☆
// around it. Both glyphs are absolutely centred in the box, which is what keeps
// them concentric -- laid out inline they would share a baseline and the small
// star would sit low rather than inside the ring. Centring on the box (rather
// than riding the text baseline) is also what keeps the tall ring off the
// bottom edge of whatever strip the row sits in.
function StarSlot({ringed,style}){
  const centred={position:"absolute",left:0,right:0,top:"50%",transform:"translateY(-50%)",lineHeight:1,textAlign:"center"};
  return React.createElement("span",{style:{position:"relative",display:"inline-block",width:"1em",height:"1em",verticalAlign:"middle",...style}},
    ringed&&React.createElement("span",{style:{...centred,fontSize:"1.28em"}},"☆"),
    React.createElement("span",{style:{...centred,fontSize:ringed?"0.72em":"1em"}},"★")
  );
}

// `max` is how many ascensions still draw as individual stars before the
// display collapses to "12★" -- callers with room for a wider row raise it.
// `doubled` is how many of those stars are worth two, drawn ringed from the
// left, so a five-slot row can read anywhere from 1 to 10.
// `colors` gives each slot its own colour (the rainbow band); without it the
// whole row inherits one colour from `style`. `slotted` draws even plain rows
// as fixed-width slots, so every row in a grid lines up the same way.
function AscStars({n,style,max=5,doubled=0,colors,slotted}){
  if(!n)return null;
  if(n>max)return React.createElement("span",{className:"asc-stars",style},n+"★");
  if(!doubled&&!colors&&!slotted)return React.createElement("span",{className:"asc-stars",style},"★".repeat(n));
  const slots=[];
  for(let i=0;i<n;i++){
    slots.push(React.createElement(StarSlot,{
      key:i,
      ringed:i<doubled,
      style:colors?{color:colors[i%colors.length]}:undefined,
    }));
  }
  // inline-flex rather than an inline run: it centres the slots on the row's
  // own box instead of a text baseline (a baseline leaves the row sitting low)
  // and makes `gap` the one knob for how far apart the stars sit.
  return React.createElement("span",{className:"asc-stars",style:{display:"inline-flex",alignItems:"center",...style}},slots);
}

// Ascensions run 1-50 as five bands of ten, and a band never shows more than
// five stars: the first five fill the slots one plain star at a time, and the
// second five ring those same slots left to right, each ring worth two. So 7
// is three plain stars with the leftmost two ringed. Colour says which band --
// black, bronze, silver, gold, rainbow.
//
// Rainbow colours each slot separately instead of sweeping one gradient across
// the row. A gradient has to be painted as a background clipped to the text,
// and that clip doesn't reach the ring's absolutely-positioned glyphs -- the
// whole row rendered invisible. Per-slot colours also stay put as the row
// grows, so a creature's third star is always the same green.
const ASC_TIERS=[
  {color:"#111827"},
  {color:"#B87333"},
  {color:"#7F868D"},
  {color:"#EF9F27"},
  {colors:["#E24B4A","#EF9F27","#63991F","#22B8CF","#7F77DD"]},
];

/** Splits an ascension count into stars to draw, how many of them are ringed
 *  (worth two), and the band's colouring. */
export function ascStarTier(n){
  const empty={count:0,doubled:0,style:undefined,colors:null};
  if(!(n>0))return empty;
  const band=Math.min(ASC_TIERS.length-1,Math.floor((n-1)/10));
  const within=n-band*10;
  const tier=ASC_TIERS[band];
  return {
    count:Math.min(5,within),
    doubled:Math.max(0,within-5),
    style:tier.color?{color:tier.color}:undefined,
    colors:tier.colors||null,
  };
}

export default AscStars;
