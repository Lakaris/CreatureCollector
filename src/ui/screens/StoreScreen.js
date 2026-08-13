// Store: bundles and gem packs. No real payment provider is wired in -- every
// purchase below is simulated (see GameContext's purchaseBundle/purchaseGemPack):
// tapping Buy grants the goods instantly, no payment step in between.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { STORE_GEM_PACKS, STORE_BUNDLES } from "../../data/store.js";
import ScreenHeader, { CurrencyChip } from "../../ui/components/ScreenHeader.js";
import { formatNum } from "../../core/format.js";

function StoreScreen(){
  const { currencies, plotsUnlocked, dungeonsUnlocked, isBundleOwned, purchaseBundle, purchaseGemPack } = useGame();
  // Holds whichever card (a bundle OR a gem pack -- distinguished by
  // `gems != null`) is showing its confirm-then-grant dialog.
  const [confirmItem,setConfirmItem]=React.useState(null);
  const [purchaseToast,setPurchaseToast]=React.useState(null);
  function handleBundleClick(b){
    if(b.oneTime&&isBundleOwned(b))return;
    setConfirmItem(b);
  }
  function confirmPurchase(){
    const item=confirmItem;
    const isGemPack=item.gems!=null;
    if(isGemPack)purchaseGemPack(item);
    else purchaseBundle(item);
    setConfirmItem(null);
    setPurchaseToast((isGemPack?formatNum(item.gems)+" 💎":item.name)+" purchased!");
    setTimeout(()=>setPurchaseToast(null),2200);
  }
  // The Starter Pack sells Plot 5/6 unlocks -- showing it before the Farm's
  // Plots feature itself is unlocked would advertise a deal for a mechanic
  // the player hasn't reached yet, so it stays hidden until plotsUnlocked.
  // Same idea for the Dungeon Starter Pack and dungeonsUnlocked.
  const visibleBundles=STORE_BUNDLES.filter(b=>(b.id!=="starter_pack"||plotsUnlocked)&&(b.id!=="dungeon_starter_pack"||dungeonsUnlocked));
  return React.createElement("div",{style:{background:"#f8f8ff",minHeight:"100%"}},
    purchaseToast&&React.createElement("div",{style:{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.8)",color:"#fff",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,whiteSpace:"nowrap",zIndex:320,pointerEvents:"none",animation:"toastFade 2.2s ease-in-out"}},"✅ "+purchaseToast),
    confirmItem&&React.createElement("div",{onClick:()=>setConfirmItem(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8}},confirmItem.emoji||"💎"),
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:12}},
          confirmItem.name||(formatNum(confirmItem.gems)+" Gems"+(confirmItem.bonus>0?" +"+formatNum(confirmItem.bonus)+" bonus":""))
        ),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:16,textAlign:"left"}},
          confirmItem.items
            ? confirmItem.items.map((item,i)=>React.createElement("div",{key:i,style:{fontSize:12,color:"#555"}},item))
            : React.createElement("div",{style:{fontSize:12,color:"#555"}},"💎 "+formatNum(confirmItem.gems)+(confirmItem.bonus>0?" + "+formatNum(confirmItem.bonus)+" bonus":""))
        ),
        React.createElement("div",{style:{fontSize:12,color:"#999",marginBottom:18}},
          confirmItem.oneTime?"One-time purchase — can't be bought again":"Simulated purchase — no real payment"
        ),
        React.createElement("div",{style:{display:"flex",gap:10}},
          React.createElement("button",{onClick:()=>setConfirmItem(null),style:{flex:1,padding:"11px 0",background:"#f0f0f0",color:"#555",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:confirmPurchase,style:{flex:1,padding:"11px 0",background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer"}},"Buy "+confirmItem.price)
        )
      )
    ),
    React.createElement(ScreenHeader,{title:"Store",right:React.createElement(CurrencyChip,{emoji:"💎",value:currencies.gems})}),
    React.createElement("div",{style:{padding:"0 16px 8px"}},
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}},"🎁 Bundles"),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        visibleBundles.map(b=>{
          const owned=b.oneTime&&isBundleOwned(b);
          return React.createElement("div",{key:b.id,onClick:owned?undefined:()=>handleBundleClick(b),style:{background:"#fff",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",cursor:owned?"default":"pointer",position:"relative",border:"1.5px solid #e8e8e8",opacity:owned?0.6:1}},
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
          owned
            ? React.createElement("div",{style:{padding:"6px 14px",background:"#e8f5e9",color:"#2e7d32",borderRadius:10,fontSize:13,fontWeight:700,flexShrink:0}},"✓ Owned")
            : React.createElement("div",{style:{padding:"6px 14px",background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",borderRadius:10,fontSize:13,fontWeight:700,flexShrink:0}},b.price)
        );})
      )
    ),
    React.createElement("div",{style:{padding:"12px 16px 24px"}},
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}},"💎 Gem Packs"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}},
        STORE_GEM_PACKS.map(p=>React.createElement("div",{key:p.id,onClick:()=>setConfirmItem(p),style:{background:"#fff",borderRadius:16,padding:"14px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",cursor:"pointer",position:"relative",border:"1.5px solid #e8e8e8"}},
          p.badge&&React.createElement("div",{style:{position:"absolute",top:-8,right:8,background:p.badge==="Best Value"?"#f59e0b":"#534AB7",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:8}},p.badge),
          React.createElement("div",{style:{fontSize:32,lineHeight:1}},"💎"),
          React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111"}},formatNum(p.gems)),
          p.bonus>0&&React.createElement("div",{style:{fontSize:10,fontWeight:700,color:"#22c55e"}},"+"+p.bonus+" bonus"),
          React.createElement("div",{style:{marginTop:4,padding:"5px 14px",background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",borderRadius:10,fontSize:12,fontWeight:700}},p.price)
        ))
      )
    )
  );
}


export default StoreScreen;
