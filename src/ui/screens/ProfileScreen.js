// Currency summary card.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";

function ProfileScreen(){
  const { currencies, skinShards } = useGame();
  return React.createElement("div",null,
    React.createElement("div",{className:"card"},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14,marginBottom:14}},
        React.createElement("div",{style:{width:56,height:56,borderRadius:"50%",background:"#EEEDFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}},"🧑‍✈️"),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:20,fontWeight:500,color:"#000"}},"Player")
        )
      ),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}},
        [["💎","Gems",currencies.gems],["💰","Money",currencies.money],["🍖","Food",currencies.food],["🍬","Candy",currencies.candy],["🔶","Shards","(per creature)"],["🔮","Skin Shards",skinShards]].map(([ico,lbl,val])=>
          React.createElement("div",{key:lbl,style:{background:"#f5f5f5",borderRadius:8,padding:"10px 12px"}},
            React.createElement("div",{style:{fontSize:11,color:"#666",marginBottom:3}},ico+" "+lbl),
            React.createElement("div",{style:{fontSize:18,fontWeight:500,color:"#000"}},typeof val==="number"?val.toLocaleString():val)
          )
        )
      )
    )
  );
}


export default ProfileScreen;
