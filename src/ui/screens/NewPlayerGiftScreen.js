// New Player Welcome Gift: 10-day one-time login reward track. Does not repeat once finished.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { REWARD_LABELS, REWARD_DESC, NEW_PLAYER_GIFT_REWARDS } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import { easternNoonDayKey } from "../../core/dates.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";
import { DEV_MODE } from "../../config.js";

const PURPLE="#534AB7";const GOLD="#d97706";const NODE_COL_W=56;const BOX_MAX=200;

function NewPlayerGiftScreen({onBack}){
  const {
    setCurrencies,
    newPlayerGiftDay, setNewPlayerGiftDay,
    newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed,
    newPlayerGiftDoubled, setNewPlayerGiftDoubled,
    newPlayerGiftClaimed, setNewPlayerGiftClaimed,
    newPlayerGiftPaidClaimed, setNewPlayerGiftPaidClaimed,
  } = useGame();
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  const [rewardPopup,setRewardPopup]=React.useState(null);
  const today=easternNoonDayKey();
  const LEN=NEW_PLAYER_GIFT_REWARDS.length;
  // newPlayerGiftDay is the FRONTIER: how many days have unlocked so far.
  // Advances by exactly one real day per visit on a new calendar day (never
  // more, matching the old single-claim-per-visit pacing -- absence doesn't
  // bank multiple days), tracked via newPlayerGiftLastClaimed as a "last day
  // key checked" marker. On a brand-new save (marker is null) this only
  // records today without advancing, so day 1 starts unlocked rather than
  // being skipped immediately.
  React.useEffect(()=>{
    if(newPlayerGiftLastClaimed!==today){
      setNewPlayerGiftDay(d=>Math.min(LEN,d+(newPlayerGiftLastClaimed===null?0:1)));
      setNewPlayerGiftLastClaimed(today);
    }
  },[]);
  React.useEffect(()=>{
    if(rewardItems&&visibleCount<rewardItems.length){
      const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
      return()=>clearTimeout(t);
    }
  },[rewardItems,visibleCount]);
  // Normal and Premium are independent claims (same pattern as the Battle
  // Pass's free/paid lanes) -- a day stays reachable, and each side stays
  // separately claimable, for as long as it takes, even once the frontier
  // has moved on to later days. That's what lets Collect All (and the debug
  // "+1 Day" button below) sweep up several stacked, still-unclaimed days at
  // once instead of only ever offering the single newest one.
  function claimNormal(i){
    if(i>newPlayerGiftDay||newPlayerGiftClaimed[i])return;
    const reward=NEW_PLAYER_GIFT_REWARDS[i].reward;
    applyRewards(setCurrencies,reward);
    setNewPlayerGiftClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
    setRewardItems(Object.entries(reward));
    setVisibleCount(0);
  }
  // Premium pays DOUBLE the base reward -- exactly the x2 amount its tile
  // displays (so with Normal's 1x, a fully-claimed day pays 3x base).
  function claimPremium(i){
    if(!newPlayerGiftDoubled||i>newPlayerGiftDay||newPlayerGiftPaidClaimed[i])return;
    const reward=Object.fromEntries(Object.entries(NEW_PLAYER_GIFT_REWARDS[i].reward).map(([k,v])=>[k,v*2]));
    applyRewards(setCurrencies,reward);
    setNewPlayerGiftPaidClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
    setRewardItems(Object.entries(reward));
    setVisibleCount(0);
  }
  function claimAll(){
    const granted={};
    let any=false;
    NEW_PLAYER_GIFT_REWARDS.forEach((r,i)=>{
      if(i>newPlayerGiftDay)return;
      if(!newPlayerGiftClaimed[i]){
        Object.entries(r.reward).forEach(([k,v])=>{granted[k]=(granted[k]||0)+v;});
        any=true;
      }
      if(newPlayerGiftDoubled&&!newPlayerGiftPaidClaimed[i]){
        Object.entries(r.reward).forEach(([k,v])=>{granted[k]=(granted[k]||0)+v*2;});
        any=true;
      }
    });
    if(!any)return;
    applyRewards(setCurrencies,granted);
    setNewPlayerGiftClaimed(prev=>prev.map((c,i)=>i<=newPlayerGiftDay?true:c));
    if(newPlayerGiftDoubled)setNewPlayerGiftPaidClaimed(prev=>prev.map((c,i)=>i<=newPlayerGiftDay?true:c));
    setRewardItems(Object.entries(granted));
    setVisibleCount(0);
  }
  const anyClaimable=NEW_PLAYER_GIFT_REWARDS.some((r,i)=>i<=newPlayerGiftDay&&(!newPlayerGiftClaimed[i]||(newPlayerGiftDoubled&&!newPlayerGiftPaidClaimed[i])));
  const finished=newPlayerGiftDay>=LEN&&newPlayerGiftClaimed.every(Boolean)&&(!newPlayerGiftDoubled||newPlayerGiftPaidClaimed.every(Boolean));
  function purchaseDouble(){
    if(newPlayerGiftDoubled)return;
    setNewPlayerGiftDoubled(true);
  }
  // Debug-only: directly advances the frontier, bypassing the real-day
  // check above entirely -- unlike that check (capped at +1 per visit),
  // repeated presses genuinely stack, each one revealing another day's
  // rewards as claimable so bulk-testing Collect All is possible.
  function debugAdvanceDay(){setNewPlayerGiftDay(d=>Math.min(LEN,d+1));}
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
    // Header -- same shared bar every other screen uses (fixed above the
    // scroll area, uniform height), not stretched to also hold the action
    // buttons below.
    React.createElement(ScreenHeader,{
      title:"New Player Welcome Gift",onBack,edgeToEdge:false,
      right:React.createElement(React.Fragment,null,
        DEV_MODE&&React.createElement("button",{onClick:debugAdvanceDay,style:{fontSize:10,fontWeight:700,color:"#fff",background:"#555",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",whiteSpace:"nowrap"}},"🐞 +1 Day"),
        newPlayerGiftDoubled&&React.createElement("div",{style:{fontSize:11,fontWeight:800,color:GOLD,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"4px 8px",whiteSpace:"nowrap"}},"✨ Double Rewards Enabled")
      )
    }),
    // Action buttons live below the header bar now, in their own row --
    // Double All Rewards (when purchasable) sits above Collect All.
    React.createElement("div",{style:{padding:"12px 16px 0",flexShrink:0,display:"flex",flexDirection:"column",gap:10}},
      !newPlayerGiftDoubled&&React.createElement("button",{
        onClick:purchaseDouble,
        style:{width:"100%",padding:"12px 14px",borderRadius:14,border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#f59e0b,#f97316)",
          color:"#fff",fontWeight:700,fontSize:14,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          boxShadow:"0 4px 16px rgba(249,115,22,0.3)"}
      },
        "✨ Double All Rewards — $4.99"
      ),
      React.createElement("button",{onClick:claimAll,disabled:!anyClaimable,style:{width:"100%",padding:"10px 0",borderRadius:12,border:"none",cursor:anyClaimable?"pointer":"default",background:anyClaimable?PURPLE:"#e8e8e8",color:anyClaimable?"#fff":"#aaa",fontWeight:700,fontSize:13}},"🎁 Collect All")
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"0 16px 16px"}},
      // Column headers -- normal reward on the left, doubled reward on the right.
      // Lives inside the same scrolling box as the rows below (sticky, not a
      // separate element) so it shares the scrollbar's width and stays aligned.
      React.createElement("div",{style:{position:"sticky",top:0,zIndex:2,background:"#f8f8ff",display:"flex",justifyContent:"center",alignItems:"center",gap:14,padding:"8px 0"}},
        React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,textAlign:"center",fontSize:16,fontWeight:800,color:PURPLE,letterSpacing:1}},"🎁 NORMAL"),
        React.createElement("div",{style:{width:NODE_COL_W}}),
        React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,textAlign:"center",fontSize:16,fontWeight:800,color:GOLD,letterSpacing:1}},"✨ PREMIUM")
      ),
      React.createElement("div",{style:{position:"relative",display:"flex",flexDirection:"column",gap:12,padding:"4px 0"}},
        React.createElement("div",{style:{display:"flex",justifyContent:"center",position:"relative",zIndex:1,marginBottom:4}},
          React.createElement("div",{style:{width:NODE_COL_W,textAlign:"center",fontSize:11,fontWeight:800,color:"#888",letterSpacing:1}},"DAY")
        ),
        React.createElement("div",{style:{position:"absolute",top:38,bottom:22,left:"50%",width:4,background:"#e0d9ff",transform:"translateX(-50%)",borderRadius:3,zIndex:0}}),
        NEW_PLAYER_GIFT_REWARDS.map((r,i)=>{
          // Normal and Premium are independent per-day claims (see
          // claimNormal/claimPremium above) -- a day stays reachable, and
          // each side stays separately claimable, once the frontier reaches
          // it, even after the frontier moves further ahead. The Premium
          // column displays baseQty*2 and claiming it grants exactly that,
          // so a fully-claimed day pays 3x base across both sides.
          const reachable=i<=newPlayerGiftDay;
          const normalDone=newPlayerGiftClaimed[i];
          const premiumDone=newPlayerGiftPaidClaimed[i];
          const normalClaimable=reachable&&!normalDone;
          const premiumClaimable=reachable&&newPlayerGiftDoubled&&!premiumDone;
          const fullyDone=normalDone&&(!newPlayerGiftDoubled||premiumDone);
          const rewardKey=Object.keys(r.reward)[0];
          const baseQty=r.reward[rewardKey];
          const badgeBase={fontSize:10,fontWeight:800,borderRadius:8,padding:"3px 10px",marginTop:2};
          const rightLocked=!newPlayerGiftDoubled;
          return React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",justifyContent:"center",gap:14,position:"relative",zIndex:1}},
            // Normal reward (left)
            React.createElement("div",{
              onClick:normalClaimable?()=>claimNormal(i):()=>setRewardPopup({key:rewardKey,qty:baseQty,label:r.label,emoji:r.emoji}),
              style:{
                flex:1,maxWidth:BOX_MAX,borderRadius:16,padding:"10px 12px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                background:normalDone?"#f0f0f0":normalClaimable?"#f0effe":"#fafafa",
                border:"2px solid "+(normalDone?"#ddd":normalClaimable?"#7c4dff":"#e8e8e8"),
                cursor:"pointer",
                boxShadow:normalClaimable?"0 2px 12px rgba(124,77,255,0.2)":"none",
              }
            },
              React.createElement("div",{style:{fontSize:28,lineHeight:1}},r.emoji),
              React.createElement("div",{style:{fontSize:14,fontWeight:800,color:normalDone?"#bbb":PURPLE}},"x"+baseQty),
              React.createElement("div",{style:{...badgeBase,color:"#fff",background:PURPLE,visibility:normalClaimable?"visible":"hidden"}},"CLAIM")
            ),
            // Center: day node
            React.createElement("div",{style:{width:NODE_COL_W,flexShrink:0,display:"flex",justifyContent:"center"}},
              React.createElement("div",{style:{
                width:44,height:44,borderRadius:"50%",
                background:fullyDone?"#e0e0e0":reachable?"#7c4dff":"#f0effe",
                border:"2px solid "+(fullyDone?"#ccc":reachable?"#3730a3":"#c4b5fd"),
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:800,color:fullyDone?"#aaa":reachable?"#fff":"#c4b5fd",
                boxShadow:reachable&&!fullyDone?"0 2px 8px rgba(83,74,183,0.3)":"none"
              }},fullyDone?"✓":(i+1))
            ),
            // Premium reward (right) -- locked until purchased
            React.createElement("div",{
              onClick:premiumClaimable?()=>claimPremium(i):()=>setRewardPopup({key:rewardKey,qty:baseQty,label:r.label,emoji:r.emoji}),
              style:{
                flex:1,maxWidth:BOX_MAX,borderRadius:16,padding:"10px 12px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                background:premiumDone?"#f0f0f0":rightLocked?"#f7f7f7":premiumClaimable?"#fffbeb":"#fafafa",
                border:"2px solid "+(premiumDone?"#ddd":rightLocked?"#ddd":premiumClaimable?"#fbbf24":"#e8e8e8"),
                cursor:"pointer",
                boxShadow:premiumClaimable?"0 2px 12px rgba(251,191,36,0.25)":"none",
                opacity:premiumDone?1:rightLocked?0.65:1,
              }
            },
              React.createElement("div",{style:{fontSize:28,lineHeight:1,filter:!premiumDone&&rightLocked?"grayscale(70%)":"none"}},r.emoji),
              React.createElement("div",{style:{fontSize:14,fontWeight:800,color:premiumDone?"#bbb":rightLocked?"#aaa":GOLD}},"x"+(baseQty*2)),
              React.createElement("div",{style:{...badgeBase,color:rightLocked?"#999":"#fff",background:rightLocked?"#eaeaea":GOLD,visibility:(rightLocked||premiumClaimable)?"visible":"hidden"}},rightLocked?"🔒 Locked":"CLAIM")
            )
          );
        })
      ),
      finished&&React.createElement("div",{style:{marginTop:16,textAlign:"center",fontSize:13,color:"#aaa",fontWeight:600}},"🏆 New player gift complete")
    ),
    popup
  );
}

export default NewPlayerGiftScreen;
