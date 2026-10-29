// Celebration popup shown after an ascension.

import React, { useState, useEffect } from "../../../react.js";
import { CORE_STAT_CYCLE, STAT_LABELS, STAT_COLORS } from "../../../data/rarity.js";
import { calcStats } from "../../../core/creatures.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import { CreatureAscStars } from "../../../ui/components/AscStars.js";

function AscensionPopup({def,unlockedSkins,ascPopup,ownedData,onClose}){
  const statsBefore=calcStats(def,{...ownedData,ascensions:ascPopup-1});
  const statsAfter=calcStats(def,{...ownedData,ascensions:ascPopup});
  const[showNew,setShowNew]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setShowNew(true),80);return()=>clearTimeout(t);},[]);
  const displayed=showNew?statsAfter:statsBefore;
  return React.createElement("div",{
    onClick:onClose,
    style:{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}
  },
    React.createElement("div",{
      className:"ui-panel",
      onClick:e=>e.stopPropagation(),
      style:{padding:"12px 8px",textAlign:"center",maxWidth:300,width:"90%"}
    },
      React.createElement(CreatureIcon,{def,ownedData,unlockedSkins,size:60,style:{margin:"0 auto 6px"}}),
      React.createElement("div",{style:{fontSize:20,fontWeight:700,marginBottom:4}},def.name),
      React.createElement("div",{style:{marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}},
        React.createElement(CreatureAscStars,{asc:ascPopup,size:24}),
        React.createElement("span",{style:{fontSize:26,fontWeight:700,color:"#EF9F27"}},"Ascension")
      ),
      React.createElement("div",{style:{textAlign:"left"}},
        CORE_STAT_CYCLE.map(s=>React.createElement("div",{key:s,className:"stat-row"},
          React.createElement("span",{className:"stat-label"},STAT_LABELS[s]),
          React.createElement("div",{className:"stat-bar-bg"},
            React.createElement("div",{className:"stat-bar-fill",style:{width:Math.min(100,Math.round((statsAfter[s]/150)*100))+"%",background:STAT_COLORS[s]}})
          ),
          React.createElement("span",{className:"stat-val"},
            React.createElement("span",{style:{color:"#666"}},statsBefore[s]),
            React.createElement("span",{style:{color:"#aaa",margin:"0 3px"}},"→"),
            React.createElement("span",{style:{color:"#2e7d32",fontWeight:700}},statsAfter[s])
          )
        ))
      ),
      React.createElement("button",{className:"btn btn-primary",style:{width:"100%",marginTop:20,marginBottom:0},onClick:onClose},"Continue")
    )
  );
}


export default AscensionPopup;
