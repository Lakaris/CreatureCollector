// Daily login streak calendar.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { REWARD_LABELS, REWARD_DESC, DAILY_REWARDS, resolveDailyReward } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import { easternNoonDayKey } from "../../core/dates.js";
import { formatNum } from "../../core/format.js";
import { DEV_MODE } from "../../config.js";

function DailyScreen({onBack}){
  const {
    setCurrencies,
    dailyDay, setDailyDay,
    dailyLastClaimed, setDailyLastClaimed,
    dailyClaimed, setDailyClaimed,
    dailyClaimedCycle, setDailyClaimedCycle,
    farmFieldLevel,
  } = useGame();
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  const [rewardPopup,setRewardPopup]=React.useState(null);
  const today=easternNoonDayKey();
  const cycleSlot=dailyDay%30;
  /** Resets dailyClaimed for a fresh lap through the 30-day calendar once
   * the frontier crosses into a new cycle -- but only once every slot in
   * the CURRENT cycle has actually been claimed. Otherwise, once day 30
   * unlocks, further real-day rollovers (or debug presses) hold the
   * frontier at day 30 rather than rolling into day 31 and wiping out
   * whatever's still sitting unclaimed. */
  function advanceFrontierTo(nextDailyDay){
    const curCycleLastDay=dailyClaimedCycle*30+29;
    const fullyClaimed=dailyClaimed.every(Boolean);
    const target=fullyClaimed?nextDailyDay:Math.min(nextDailyDay,curCycleLastDay);
    const targetCycle=Math.floor(target/30);
    if(targetCycle!==dailyClaimedCycle){
      setDailyClaimed(Array(30).fill(false));
      setDailyClaimedCycle(targetCycle);
    }
    setDailyDay(target);
  }
  // Advances by exactly one real day per visit on a new calendar day (never
  // more -- absence doesn't bank multiple days in real play), tracked via
  // dailyLastClaimed as a "last day key checked" marker. On a brand-new save
  // (marker is null) this only records today without advancing.
  React.useEffect(()=>{
    if(dailyLastClaimed!==today){
      advanceFrontierTo(dailyDay+(dailyLastClaimed===null?0:1));
      setDailyLastClaimed(today);
    }
  },[]);
  React.useEffect(()=>{
    if(rewardItems&&visibleCount<rewardItems.length){
      const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
      return()=>clearTimeout(t);
    }
  },[rewardItems,visibleCount]);
  // A slot stays reachable, and independently claimable, for as long as it
  // takes once the frontier reaches it -- claiming one slot doesn't require
  // (or consume) any other, so several stacked unclaimed days can each be
  // claimed on their own, or swept up together via Collect All below.
  function claimSlot(i){
    if(i>cycleSlot||dailyClaimed[i])return;
    const reward=resolveDailyReward(DAILY_REWARDS[i],farmFieldLevel).reward;
    const entries=Object.entries(reward);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    setDailyClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
    setRewardItems(entries);
    setVisibleCount(0);
  }
  function claimAll(){
    const granted={};
    let any=false;
    for(let i=0;i<=cycleSlot;i++){
      if(!dailyClaimed[i]){
        Object.entries(resolveDailyReward(DAILY_REWARDS[i],farmFieldLevel).reward).forEach(([k,v])=>{granted[k]=(granted[k]||0)+v;});
        any=true;
      }
    }
    if(!any)return;
    applyRewards(setCurrencies,granted);
    setDailyClaimed(prev=>prev.map((c,i)=>i<=cycleSlot?true:c));
    setRewardItems(Object.entries(granted));
    setVisibleCount(0);
  }
  const claimableCount=Array.from({length:cycleSlot+1},(_,i)=>i).filter(i=>!dailyClaimed[i]).length;
  // Debug-only: directly advances the frontier, bypassing the real-day
  // check above entirely -- repeated presses genuinely stack, each one
  // revealing another day's reward as claimable.
  function debugAdvanceDay(){advanceFrontierTo(dailyDay+1);}
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
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:"#534AB7"}},formatNum(v))
          );
        })
      ),
      React.createElement("div",{style:{marginTop:"auto",padding:"16px 24px 32px",flexShrink:0}},
        // Rendered from the start (not conditionally) so this row's height
        // never changes as items step in -- otherwise the flex:1 area above
        // shrinks the instant Continue appears, visibly pushing the
        // already-centered boxes upward.
        React.createElement("button",{onClick:()=>setRewardItems(null),disabled:!allVisible,style:{width:"100%",padding:"14px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:14,cursor:allVisible?"pointer":"default",visibility:allVisible?"visible":"hidden"}},"Continue")
      ),
      popup
    );
  }
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f8f8ff",zIndex:200,animation:"screenSlideUp .22s ease-out"}},
    // White top bar with a back arrow, matching every other screen in the
    // game, instead of the round "✕" button that used to float at the
    // bottom of this one.
    React.createElement("div",{style:{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e0e0e0",background:"#fff",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{flex:1,fontSize:18,fontWeight:700,color:"#111"}},"Daily Rewards"),
      DEV_MODE&&React.createElement("button",{onClick:debugAdvanceDay,style:{fontSize:10,fontWeight:700,color:"#fff",background:"#555",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",whiteSpace:"nowrap"}},"🐞 +1 Day")
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"16px 16px"}},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}},
        DAILY_REWARDS.map((raw,i)=>{
          const r=resolveDailyReward(raw,farmFieldLevel);
          // A slot stays independently claimable once the frontier reaches
          // it (see claimSlot above), so several stacked days can show
          // "claimable" at once instead of only ever the single newest one.
          const reachable=i<=cycleSlot;
          const done=dailyClaimed[i];
          const claimable=reachable&&!done;
          const rewardKey=Object.keys(r.reward)[0];
          const rewardQty=r.reward[rewardKey];
          return React.createElement("div",{key:i,
            onClick:claimable?()=>claimSlot(i):()=>setRewardPopup({key:rewardKey,qty:rewardQty,label:r.label,emoji:r.emoji}),
            style:{
              borderRadius:14,padding:"6px 4px 4px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",height:80,
              background:done?"#f0f0f0":claimable?"#f0effe":"#fafafa",
              border:"2px solid "+(done?"#ddd":claimable?"#7c4dff":"#e8e8e8"),
              cursor:"pointer",
              boxShadow:claimable?"0 2px 12px rgba(124,77,255,0.2)":"none",
              transition:"transform 0.1s",
            }
          },
            React.createElement("div",{style:{fontSize:9,fontWeight:700,color:done?"#bbb":claimable?"#7c4dff":"#aaa",letterSpacing:0.3}},"DAY "+(i+1)),
            React.createElement("div",{style:{fontSize:26,lineHeight:1}},r.emoji),
            React.createElement("div",{style:{height:16,display:"flex",alignItems:"center",justifyContent:"center"}},
              claimable&&React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#fff",background:"#7c4dff",borderRadius:6,padding:"2px 6px"}},"CLAIM")
            )
          );
        })
      )
    ),
    // Only worth showing once it'd actually save a tap over just claiming
    // the one outstanding day directly -- pinned at the bottom rather than
    // scrolling with the grid, so it stays reachable without scrolling down.
    claimableCount>1&&React.createElement("div",{style:{padding:"12px 16px",flexShrink:0,borderTop:"1px solid #e0e0e0",background:"#fff"}},
      React.createElement("button",{onClick:claimAll,style:{width:"100%",padding:"10px 0",borderRadius:12,border:"none",cursor:"pointer",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:13}},"🎁 Collect All")
    ),
    popup
  );
}


export default DailyScreen;
