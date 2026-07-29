// One labelled stat bar, optionally showing an equipment bonus.

import React from "../../react.js";
import { STAT_LABELS } from "../../data/rarity.js";

function StatBar({stat,value,bonus=0,highlight=false,onClick}){
  return React.createElement("div",{className:"stat-row",onClick:onClick?()=>onClick(stat):undefined,style:{...(onClick?{cursor:"pointer"}:{}),...(highlight?{animation:"statLevelUp 1.5s ease-out forwards",outline:"2px solid #2e7d32",outlineOffset:"-2px",borderRadius:6}:{})}},
    React.createElement("span",{className:"stat-label"},STAT_LABELS[stat]),
    React.createElement("span",{className:"stat-val",style:highlight?{color:"#2e7d32",animation:"statLevelUp 1.5s ease-out forwards"}:{}},
      value
    )
  );
}

export default StatBar;
