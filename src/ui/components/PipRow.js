// Ability upgrade pips.

import React from "../../react.js";

function PipRow({filled,total=5,isMax,onPipClick,selectedPip}){
  return React.createElement("div",{className:"pip-row"},
    Array.from({length:total}).map((_,i)=>
      React.createElement("div",{key:i,
        className:"pip"+(i<filled?(isMax?" max":" filled"):""),
        onClick:onPipClick?()=>onPipClick(i):undefined,
        style:onPipClick?{cursor:"pointer",outline:selectedPip===i?"2px solid #534AB7":"none",outlineOffset:2,borderRadius:3}:undefined
      })
    )
  );
}

export default PipRow;
