// New Player Welcome Gift: 10-day one-time login reward track. Does not repeat once finished.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { REWARD_LABELS, REWARD_DESC, NEW_PLAYER_GIFT_REWARDS } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import { easternNoonDayKey } from "../../core/dates.js";

function NewPlayerGiftScreen({onBack}){
  const { setCurrencies, newPlayerGiftDay, setNewPlayerGiftDay, newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed, newPlayerGiftDoubled, setNewPlayerGiftDoubled } = useGame();
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  const [rewardPopup,setRewardPopup]=React.useState(null);
  const today=easternNoonDayKey();
  const finished=newPlayerGiftDay>=NEW_PLAYER_GIFT_REWARDS.length;
  const canClaim=!finished&&newPlayerGiftLastClaimed!==today;
  React.useEffect(()=>{
    if(rewardItems&&visibleCount<rewardItems.length){
      const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
      return()=>clearTimeout(t);
    }
  },[rewardItems,visibleCount]);
  function claimDay(){
    if(!canClaim)return;
    const reward=NEW_PLAYER_GIFT_REWARDS[newPlayerGiftDay].reward;
    const entries=Object.entries(reward).map(([k,v])=>[k,newPlayerGiftDoubled?v*2:v]);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    setNewPlayerGiftLastClaimed(today);
    setNewPlayerGiftDay(prev=>prev+1);
    setRewardItems(entries);
    setVisibleCount(0);
  }
  function purchaseDouble(){
    if(newPlayerGiftDoubled)return;
    setNewPlayerGiftDoubled(true);
  }
  const popup=rewardPopup&&React.createElement("div",{onClick:()=>setRewardPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
      React.createElement("div",{style:{fontSize:52,lineHeight:1,marginBottom:12}},rewardPopup.emoji||REWARD_LABELS[rewardPopup.key]?.split(" ")[0]||"🎁"),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginBottom:8}},REWARD_LABELS[rewardPopup.key]?.split(" ").slice(1).join(" ")||rewardPopup.key),
      React.createElement("div",{style:{fontSize:14,color:"#666",lineHeight:1.5}},REWARD_DESC[rewardPopup.key]||""),
      React.createElement("button",{onClick:()=>setRewardPopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
    )
  );
  if(rewardItems){
    const allVisible=visibleCount>=rewardItems.length;
    return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#fff",zIndex:200}},
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",padding:"32px 24px 16px",flexShrink:0}},"Obtained"),
      React.createElement("div",{style:{flex:1,padding:"0 24px",display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",alignContent:"center"}},
        rewardItems.map(([k,v],i)=>{
          const visible=i<visibleCount;
          return React.createElement("div",{key:k,onClick:()=>setRewardPopup({key:k,qty:v,label:REWARD_LABELS[k]||k,emoji:REWARD_LABELS[k]?.split(" ")[0]||"🎁"}),style:{
            width:100,height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
            background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:16,cursor:"pointer",
            opacity:visible?1:0,transform:visible?"scale(1)":"scale(0.7)",transition:"opacity 0.3s, transform 0.3s",
          }},
            React.createElement("div",{style:{fontSize:34,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:"#534AB7"}},v)
          );
        })
      ),
      React.createElement("div",{style:{marginTop:"auto",padding:"16px 24px 32px",flexShrink:0}},
        allVisible&&React.createElement("button",{onClick:()=>setRewardItems(null),style:{width:"100%",padding:"14px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:14,cursor:"pointer"}},"Continue")
      ),
      popup
    );
  }
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f8f8ff",zIndex:200,animation:"screenSlideUp .22s ease-out"}},
    React.createElement("div",{style:{padding:"24px 20px 12px",flexShrink:0}},
      React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#111"}},"New Player Welcome Gift"),
    ),
    !finished&&React.createElement("div",{style:{padding:"0 16px 12px",flexShrink:0}},
      React.createElement("button",{
        onClick:purchaseDouble,
        disabled:newPlayerGiftDoubled,
        style:{width:"100%",padding:"12px 14px",borderRadius:14,border:"none",cursor:newPlayerGiftDoubled?"default":"pointer",
          background:newPlayerGiftDoubled?"#dcfce7":"linear-gradient(135deg,#f59e0b,#f97316)",
          color:newPlayerGiftDoubled?"#166534":"#fff",fontWeight:700,fontSize:14,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          boxShadow:newPlayerGiftDoubled?"none":"0 4px 16px rgba(249,115,22,0.3)"}
      },
        newPlayerGiftDoubled?"✓ Double Rewards Active":"✨ Double All Rewards — $4.99"
      )
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"0 16px 16px"}},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}},
        NEW_PLAYER_GIFT_REWARDS.map((r,i)=>{
          const isPast=i<newPlayerGiftDay;
          const isCurrent=i===newPlayerGiftDay;
          const rewardKey=Object.keys(r.reward)[0];
          const rewardQty=newPlayerGiftDoubled?r.reward[rewardKey]*2:r.reward[rewardKey];
          return React.createElement("div",{key:i,
            onClick:isCurrent&&canClaim?claimDay:()=>setRewardPopup({key:rewardKey,qty:rewardQty,label:r.label,emoji:r.emoji}),
            style:{
              borderRadius:14,padding:"6px 4px 4px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",height:94,
              background:isPast?"#f0f0f0":isCurrent?"#f0effe":"#fafafa",
              border:"2px solid "+(isPast?"#ddd":isCurrent?"#7c4dff":"#e8e8e8"),
              cursor:"pointer",
              boxShadow:isCurrent?"0 2px 12px rgba(124,77,255,0.2)":"none",
              transition:"transform 0.1s",
            }
          },
            React.createElement("div",{style:{fontSize:9,fontWeight:700,color:isPast?"#bbb":isCurrent?"#7c4dff":"#aaa",letterSpacing:0.3}},"DAY "+(i+1)),
            React.createElement("div",{style:{fontSize:26,lineHeight:1}},r.emoji),
            React.createElement("div",{style:{fontSize:10,fontWeight:800,color:isPast?"#bbb":"#534AB7"}},"x"+rewardQty),
            React.createElement("div",{style:{height:16,display:"flex",alignItems:"center",justifyContent:"center"}},
              isCurrent&&canClaim&&React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#fff",background:"#7c4dff",borderRadius:6,padding:"2px 6px"}},"CLAIM")
            )
          );
        })
      ),
      finished&&React.createElement("div",{style:{marginTop:16,textAlign:"center",fontSize:13,color:"#aaa",fontWeight:600}},"🏆 New player gift complete")
    ),
    React.createElement("div",{style:{display:"flex",justifyContent:"center",padding:"12px 0 28px",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{width:52,height:52,borderRadius:"50%",border:"none",background:"#534AB7",color:"#fff",fontSize:22,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(83,74,183,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}},"✕")
    ),
    popup
  );
}

export default NewPlayerGiftScreen;
