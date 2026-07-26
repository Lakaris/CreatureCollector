// Store: bundles and gem packs. Purchases are not wired to a payment provider.

import React from "../../react.js";
import { STORE_GEM_PACKS, STORE_BUNDLES } from "../../data/store.js";

function StoreScreen(){
  const [popup,setPopup]=React.useState(null);
  function buy(item){setPopup(item);}
  return React.createElement("div",{style:{background:"#f8f8ff",minHeight:"100%"}},
    popup&&React.createElement("div",{onClick:()=>setPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8}},"🚧"),
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:8}},"Coming Soon"),
        React.createElement("div",{style:{fontSize:14,color:"#666",lineHeight:1.5}},"Payments aren't set up yet. Check back later!"),
        React.createElement("button",{onClick:()=>setPopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
      )
    ),
    React.createElement("div",{style:{padding:"20px 16px 0"}},
      React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#111",marginBottom:4}},"Store"),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20}},"Support the game and get exclusive items")
    ),
    React.createElement("div",{style:{padding:"0 16px 8px"}},
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}},"🎁 Bundles"),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        STORE_BUNDLES.map(b=>React.createElement("div",{key:b.id,onClick:()=>buy(b),style:{background:"#fff",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",cursor:"pointer",position:"relative",border:"1.5px solid #e8e8e8"}},
          b.badge&&React.createElement("div",{style:{position:"absolute",top:-8,left:14,background:b.badge==="One-time"?"#22c55e":b.badge==="Limited"?"#ef4444":"#534AB7",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:8}},b.badge),
          React.createElement("div",{style:{fontSize:38,lineHeight:1,flexShrink:0}},b.emoji),
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontSize:14,fontWeight:700,color:"#111",marginBottom:2}},b.name),
            React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:2,marginTop:2}},
              b.items.map((item,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:"#666",display:"flex",alignItems:"center",gap:4}},
                item
              ))
            )
          ),
          React.createElement("div",{style:{padding:"6px 14px",background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",borderRadius:10,fontSize:13,fontWeight:700,flexShrink:0}},b.price)
        ))
      )
    ),
    React.createElement("div",{style:{padding:"12px 16px 24px"}},
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}},"💎 Gem Packs"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}},
        STORE_GEM_PACKS.map(p=>React.createElement("div",{key:p.id,onClick:()=>buy(p),style:{background:"#fff",borderRadius:16,padding:"14px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",cursor:"pointer",position:"relative",border:"1.5px solid #e8e8e8"}},
          p.badge&&React.createElement("div",{style:{position:"absolute",top:-8,right:8,background:p.badge==="Best Value"?"#f59e0b":"#534AB7",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:8}},p.badge),
          React.createElement("div",{style:{fontSize:32,lineHeight:1}},"💎"),
          React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111"}},p.gems.toLocaleString()),
          p.bonus>0&&React.createElement("div",{style:{fontSize:10,fontWeight:700,color:"#22c55e"}},"+"+p.bonus+" bonus"),
          React.createElement("div",{style:{marginTop:4,padding:"5px 14px",background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",borderRadius:10,fontSize:12,fontWeight:700}},p.price)
        ))
      )
    )
  );
}


export default StoreScreen;
