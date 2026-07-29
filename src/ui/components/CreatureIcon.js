// Renders a creature's art if it has one, falling back to its emoji.

import React from "../../react.js";

function CreatureIcon({def,size,style}){
  if(!def)return null;
  if(def.image){
    return React.createElement("img",{src:def.image,style:{width:size,height:size,objectFit:"contain",display:"block",mixBlendMode:"multiply",...style}});
  }
  return React.createElement("span",{style:{fontSize:size,lineHeight:1,display:"block",...style}},def.emoji);
}

export default CreatureIcon;
