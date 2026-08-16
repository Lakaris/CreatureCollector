// 30-node battle pass track with free and premium lanes, stacked top to
// bottom with free rewards on the left and premium rewards on the right.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { BP_PTS_PER_NODE, BATTLEPASS_REWARDS_FREE, BATTLEPASS_REWARDS_PAID, resolveReward, REWARD_LABELS, REWARD_DESC } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import { formatDuration, formatNum } from "../../core/format.js";
import { DEV_MODE } from "../../config.js";

function BattlepassScreen({onBack}){
  const { setCurrencies, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints, setBattlepassPoints, farmFieldLevel } = useGame();
  const now=Date.now();
  const [rewardPopup,setRewardPopup]=React.useState(null);
  // Claim reveal -- same "Obtained" full-screen pattern as Daily Rewards and
  // the New Player Welcome Gift (rewardItems holds the entries granted by
  // whichever claim just fired, stepped into view one at a time below).
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  React.useEffect(()=>{
    if(rewardItems&&visibleCount<rewardItems.length){
      const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
      return()=>clearTimeout(t);
    }
  },[rewardItems,visibleCount]);
  React.useEffect(()=>{
    const resetTime=battlepassLastReset?new Date(battlepassLastReset).getTime():0;
    if(!battlepassLastReset||(now-resetTime)>=30*86400000){
      setBattlepassLastReset(new Date().toISOString());
      setBattlepassClaimed(Array(30).fill(false));
      setBattlepassPaidClaimed(Array(30).fill(false));
    }
  },[]);
  const resetTime=battlepassLastReset?new Date(battlepassLastReset).getTime():now;
  const msUntilReset=Math.max(0,resetTime+30*86400000-now);
  const fmtCountdown=(ms)=>formatDuration(ms,{days:true});
  const pts=battlepassPoints||0;
  function nodeUnlocked(i){return pts>=(i+1)*BP_PTS_PER_NODE;}
  function claimFree(i){
    if(battlepassClaimed[i]||!nodeUnlocked(i))return;
    const reward=resolveReward(BATTLEPASS_REWARDS_FREE[i],farmFieldLevel);
    applyRewards(setCurrencies,reward);
    setBattlepassClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
    setRewardItems(Object.entries(reward));
    setVisibleCount(0);
  }
  function claimPaid(i){
    if(!battlepassPremium||battlepassPaidClaimed[i]||!nodeUnlocked(i))return;
    const reward=resolveReward(BATTLEPASS_REWARDS_PAID[i],farmFieldLevel);
    applyRewards(setCurrencies,reward);
    setBattlepassPaidClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
    setRewardItems(Object.entries(reward));
    setVisibleCount(0);
  }
  // Collect All can sweep up many nodes at once -- same-key rewards are
  // summed into one entry each (rather than showing one reveal card per
  // node) so claiming a long backlog doesn't turn into a minutes-long
  // step-through.
  function claimAll(){
    const granted={};
    let any=false;
    for(let i=0;i<30;i++){
      if(nodeUnlocked(i)&&!battlepassClaimed[i]){
        Object.entries(resolveReward(BATTLEPASS_REWARDS_FREE[i],farmFieldLevel)).forEach(([k,v])=>{granted[k]=(granted[k]||0)+v;});
        any=true;
      }
      if(nodeUnlocked(i)&&battlepassPremium&&!battlepassPaidClaimed[i]){
        Object.entries(resolveReward(BATTLEPASS_REWARDS_PAID[i],farmFieldLevel)).forEach(([k,v])=>{granted[k]=(granted[k]||0)+v;});
        any=true;
      }
    }
    if(!any)return;
    applyRewards(setCurrencies,granted);
    setBattlepassClaimed(prev=>prev.map((c,i)=>nodeUnlocked(i)?true:c));
    if(battlepassPremium)setBattlepassPaidClaimed(prev=>prev.map((c,i)=>nodeUnlocked(i)?true:c));
    setRewardItems(Object.entries(granted));
    setVisibleCount(0);
  }
  const anyClaimable=Array.from({length:30},(_,i)=>i).some(i=>(nodeUnlocked(i)&&!battlepassClaimed[i])||(nodeUnlocked(i)&&battlepassPremium&&!battlepassPaidClaimed[i]));
  // Debug-only: grants exactly one node's worth of points, simulating a
  // single level gained (mirrors however points are actually earned).
  function debugGainLevel(){setBattlepassPoints(p=>(p||0)+BP_PTS_PER_NODE);}
  const PURPLE="#534AB7";const GOLD="#d97706";const NODE_COL_W=64;const BOX_MAX=200;
  const level=Math.min(30,Math.floor(pts/BP_PTS_PER_NODE));
  const ptsIntoLevel=pts%BP_PTS_PER_NODE;
  function RewardBox({i,isPaid}){
    const claimed=isPaid?battlepassPaidClaimed[i]:battlepassClaimed[i];
    const done=nodeUnlocked(i);
    const canClaim=done&&!claimed&&(isPaid?battlepassPremium:true);
    const locked=isPaid&&!battlepassPremium;
    const bg=claimed?"#f0f0f0":locked?"#f7f7f7":isPaid?"#fffbeb":done?"#f0effe":"#f5f4ff";
    const border=claimed?"#ddd":locked?"#ddd":isPaid?"#fbbf24":done?"#c4b5fd":"#d8d3f5";
    const rawReward=(isPaid?BATTLEPASS_REWARDS_PAID:BATTLEPASS_REWARDS_FREE)[i];
    const resolved=resolveReward(rawReward,farmFieldLevel);
    const [rewardKey,rewardAmt]=Object.entries(resolved)[0];
    const rewardEmoji=REWARD_LABELS[rewardKey]?.split(" ")[0]||"🎁";
    const isTimed=rewardKey==="food"||rewardKey==="equipShards";
    const hoursMatch=isTimed&&typeof rawReward[rewardKey]==="string"?/^FIELD_(\d+)H$/.exec(rawReward[rewardKey]):null;
    const hours=hoursMatch?Number(hoursMatch[1]):null;
    return React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,aspectRatio:"1.6429",display:"flex",justifyContent:"center",alignItems:"center"}},
      React.createElement("div",{onClick:()=>setRewardPopup({key:rewardKey,emoji:rewardEmoji}),style:{width:"100%",height:"100%",boxSizing:"border-box",borderRadius:18,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,background:bg,border:"2px solid "+border,padding:8,cursor:"pointer"}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
          isTimed
            ?[
                React.createElement("span",{key:"hrs",style:{fontSize:22,fontWeight:800,color:locked?"#aaa":(isPaid?GOLD:PURPLE)}},hours+"h"),
                React.createElement("span",{key:"emoji",style:{fontSize:30,filter:locked?"grayscale(70%)":"none"}},rewardEmoji)
              ]
            :[
                React.createElement("span",{key:"amt",style:{fontSize:22,fontWeight:800,color:locked?"#aaa":(isPaid?GOLD:PURPLE)}},formatNum(rewardAmt)),
                React.createElement("span",{key:"emoji",style:{fontSize:30,filter:locked?"grayscale(70%)":"none"}},rewardEmoji)
              ]
        ),
        locked?React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#999",background:"#eaeaea",borderRadius:8,padding:"3px 10px",lineHeight:1.3,textAlign:"center"}},"🔒 Premium")
          :claimed?React.createElement("span",{style:{fontSize:16,color:"#aaa"}},"✓")
          :canClaim?React.createElement("button",{onClick:e=>{e.stopPropagation();isPaid?claimPaid(i):claimFree(i);},style:{fontSize:13,padding:"6px 16px",borderRadius:10,border:"none",background:PURPLE,color:"#fff",fontWeight:700,cursor:"pointer"}},"CLAIM")
          :React.createElement("span",{style:{fontSize:13,color:"#ccc"}},"Locked")
      )
    );
  }
  const popup=rewardPopup&&React.createElement("div",{onClick:()=>setRewardPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
      React.createElement("div",{style:{fontSize:52,lineHeight:1,marginBottom:12}},rewardPopup.emoji||REWARD_LABELS[rewardPopup.key]?.split(" ")[0]||"🎁"),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginBottom:8}},REWARD_LABELS[rewardPopup.key]?.split(" ").slice(1).join(" ")||rewardPopup.key),
      React.createElement("div",{style:{fontSize:14,color:"#666",lineHeight:1.5}},REWARD_DESC[rewardPopup.key]||""),
      React.createElement("button",{onClick:()=>setRewardPopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
    )
  );
  // Claim reveal screen -- identical pattern to Daily Rewards / New Player
  // Welcome Gift: whatever claimFree/claimPaid/claimAll just granted steps
  // into view one card at a time, then Continue returns to the track.
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
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f8f8ff",zIndex:200}},
    popup,
    // Header -- fixed above the scroll area, never scrolls with the track
    React.createElement("div",{style:{flexShrink:0,borderBottom:"1px solid #ede8ff"}},
      React.createElement("div",{style:{padding:"20px 20px 12px",display:"flex",alignItems:"center",gap:12}},
        React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},React.createElement("i",{className:"ti ti-arrow-left"})),
        React.createElement("div",{style:{flex:1,fontSize:20,fontWeight:800,color:"#111"}},"Battle Pass"),
        DEV_MODE&&React.createElement("button",{onClick:debugGainLevel,style:{fontSize:10,fontWeight:700,color:"#fff",background:"#555",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",whiteSpace:"nowrap"}},"🐞 +1 Level"),
        battlepassPremium
          ?React.createElement("div",{style:{padding:"6px 14px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:12}},"⭐ Premium")
          :React.createElement("button",{onClick:()=>setBattlepassPremium(true),style:{padding:"8px 12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}},
            "$9.99 — Premium")
      ),
      React.createElement("div",{style:{padding:"0 20px 14px",display:"flex",alignItems:"center",gap:8}},
        React.createElement("div",{style:{fontSize:12,fontWeight:800,color:PURPLE,whiteSpace:"nowrap"}},"Level "+level),
        React.createElement("div",{style:{flex:1,height:6,borderRadius:6,background:"#e8e8e8",overflow:"hidden"}},
          React.createElement("div",{style:{height:"100%",width:Math.min(100,ptsIntoLevel/BP_PTS_PER_NODE*100)+"%",background:"linear-gradient(90deg,#534AB7,#7c4dff)",borderRadius:6,transition:"width 0.4s"}})
        ),
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:PURPLE,whiteSpace:"nowrap"}},ptsIntoLevel+" / "+BP_PTS_PER_NODE+" pts")
      ),
      React.createElement("div",{style:{padding:"0 20px 14px"}},
        React.createElement("button",{onClick:claimAll,disabled:!anyClaimable,style:{width:"100%",padding:"10px 0",borderRadius:12,border:"none",cursor:anyClaimable?"pointer":"default",background:anyClaimable?PURPLE:"#e8e8e8",color:anyClaimable?"#fff":"#aaa",fontWeight:700,fontSize:13}},"🎁 Collect All")
      )
    ),
    // Column headers
    React.createElement("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",gap:14,padding:"10px 16px 4px",flexShrink:0}},
      React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,textAlign:"center",fontSize:16,fontWeight:800,color:PURPLE,letterSpacing:1}},"FREE 🎫"),
      React.createElement("div",{style:{width:NODE_COL_W}}),
      React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,textAlign:"center",fontSize:16,fontWeight:800,color:GOLD,letterSpacing:1}},"⭐ PREMIUM")
    ),
    // Scrollable track area -- tiers stacked top-to-bottom, free column on the
    // left and premium column on the right of each tier's row
    React.createElement("div",{style:{flex:1,overflowY:"auto",overflowX:"hidden"}},
      React.createElement("div",{style:{position:"relative",padding:"12px 16px 40px",display:"flex",flexDirection:"column",alignItems:"center",gap:14}},
        React.createElement("div",{style:{display:"flex",justifyContent:"center",position:"relative",zIndex:1,marginBottom:4}},
          React.createElement("div",{style:{width:NODE_COL_W,textAlign:"center",fontSize:11,fontWeight:800,color:"#888",letterSpacing:1}},"LEVEL")
        ),
        // Connecting line running down the center of the node column
        React.createElement("div",{style:{position:"absolute",top:38,bottom:40,left:"50%",width:4,background:"#e0d9ff",transform:"translateX(-50%)",borderRadius:3,zIndex:0}}),
        Array.from({length:30},(_,i)=>{
          const done=nodeUnlocked(i);
          const freeClaimed=battlepassClaimed[i];
          const paidClaimed=battlepassPaidClaimed[i];
          const fullyDone=freeClaimed&&(!battlepassPremium||paidClaimed);
          const nodeBg=fullyDone?"#e0e0e0":done?PURPLE:"#f0effe";
          const nodeBorder=fullyDone?"#ccc":done?"#3730a3":"#c4b5fd";
          const textColor=fullyDone?"#aaa":done?"#fff":"#c4b5fd";
          return React.createElement("div",{key:i,style:{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:14,position:"relative",zIndex:1}},
            React.createElement(RewardBox,{i,isPaid:false}),
            React.createElement("div",{style:{width:NODE_COL_W,flexShrink:0,display:"flex",justifyContent:"center"}},
              React.createElement("div",{style:{
                width:40,height:40,borderRadius:"50%",background:nodeBg,border:"2px solid "+nodeBorder,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:800,color:textColor,
                boxShadow:done&&!fullyDone?"0 2px 8px rgba(83,74,183,0.3)":"none"
              }},fullyDone?"✓":(i+1))
            ),
            React.createElement(RewardBox,{i,isPaid:true})
          );
        })
      )
    )
  );
}


export default BattlepassScreen;
