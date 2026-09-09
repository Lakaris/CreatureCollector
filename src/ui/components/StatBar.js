// One labelled stat bar, optionally showing an equipment bonus.

import React from "../../react.js";
import { STAT_LABELS, shortStatLabel, formatStat } from "../../data/rarity.js";

/** @param {boolean} [short] Use the abbreviated name where there is one -- for
 * the small pills, which are too narrow for "Critical Chance" on one line. */
function StatBar({stat,value,highlight=false,onClick,short=false}){
  const label=short?shortStatLabel(stat):STAT_LABELS[stat];
  return React.createElement("div",{className:"stat-row",onClick:onClick?()=>onClick(stat):undefined,style:{...(onClick?{cursor:"pointer"}:{}),...(highlight?{animation:"statLevelUp 1.5s ease-out forwards",outline:"2px solid #2e7d32",outlineOffset:"-2px",borderRadius:6}:{})}},
    React.createElement("span",{className:"stat-label"},label),
    React.createElement("span",{className:"stat-val",style:highlight?{color:"#2e7d32",animation:"statLevelUp 1.5s ease-out forwards"}:{}},
      // Percentage stats read as "7.00%"; everything else is a bare number.
      // Both the suffix and the decimal places are display only -- the stored
      // value is already the percentage, so nothing downstream has to unpick it.
      formatStat(stat,value)
    )
  );
}

export default StatBar;
