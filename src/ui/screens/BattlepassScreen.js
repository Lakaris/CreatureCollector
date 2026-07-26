// 50-node battle pass track with free and premium lanes.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { BP_PTS_PER_NODE } from "../../data/quests.js";
import { formatDuration } from "../../core/format.js";

function BattlepassScreen({onBack}){
  const { setCurrencies, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints } = useGame();
  const now=Date.now();
  React.useEffect(()=>{
    const resetTime=battlepassLastReset?new Date(battlepassLastReset).getTime():0;
    if(!battlepassLastReset||(now-resetTime)>=30*86400000){
      setBattlepassLastReset(new Date().toISOString());
      setBattlepassClaimed(Array(50).fill(false));
      setBattlepassPaidClaimed(Array(50).fill(false));
    }
  },[]);
  const resetTime=battlepassLastReset?new Date(battlepassLastReset).getTime():now;
  const msUntilReset=Math.max(0,resetTime+30*86400000-now);
  const fmtCountdown=(ms)=>formatDuration(ms,{days:true});
  const pts=battlepassPoints||0;
  function nodeUnlocked(i){return pts>=(i+1)*BP_PTS_PER_NODE;}
  function claimFree(i){
    if(battlepassClaimed[i]||!nodeUnlocked(i))return;
    setCurrencies(c=>({...c,candy:(c.candy||0)+5}));
    setBattlepassClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
  }
  function claimPaid(i){
    if(!battlepassPremium||battlepassPaidClaimed[i]||!nodeUnlocked(i))return;
    setCurrencies(c=>({...c,candy:(c.candy||0)+15}));
    setBattlepassPaidClaimed(prev=>{const a=[...prev];a[i]=true;return a;});
  }
  function buyPremium(){
    if((currencies.gems||0)<200)return;
    setCurrencies(c=>({...c,gems:c.gems-200}));
    setBattlepassPremium(true);
  }
  const PURPLE="#534AB7";const GOLD="#d97706";const NW=96;
  function RewardBox({i,isPaid}){
    const claimed=isPaid?battlepassPaidClaimed[i]:battlepassClaimed[i];
    const done=nodeUnlocked(i);
    const canClaim=done&&!claimed&&(isPaid?battlepassPremium:true);
    const locked=isPaid&&!battlepassPremium;
    const bg=claimed?"#f0f0f0":done&&!locked?(isPaid?"#fffbeb":"#f0effe"):"#f5f4ff";
    const border=claimed?"#ddd":done&&!locked?(isPaid?"#fbbf24":"#c4b5fd"):"#d8d3f5";
    return React.createElement("div",{style:{width:NW,display:"flex",justifyContent:"center",paddingBottom:4}},
      React.createElement("div",{style:{width:NW-12,minHeight:46,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:bg,border:"1.5px solid "+border,padding:"4px 4px"}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:3}},
          React.createElement("span",{style:{fontSize:15}},"🍬"),
          React.createElement("span",{style:{fontSize:11,fontWeight:800,color:isPaid?GOLD:PURPLE}},isPaid?"+15":"+5")
        ),
        locked?React.createElement("span",{style:{fontSize:9,color:"#bbb",lineHeight:1}},"🔒 Premium")
          :claimed?React.createElement("span",{style:{fontSize:10,color:"#aaa"}},"✓")
          :canClaim?React.createElement("button",{onClick:()=>isPaid?claimPaid(i):claimFree(i),style:{fontSize:9,padding:"2px 8px",borderRadius:6,border:"none",background:isPaid?GOLD:PURPLE,color:"#fff",fontWeight:700,cursor:"pointer",marginTop:1}},"CLAIM")
          :React.createElement("span",{style:{fontSize:9,color:"#ccc"}},"Locked")
      )
    );
  }
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f8f8ff",zIndex:200}},
    // Header
    React.createElement("div",{style:{padding:"20px 20px 12px",flexShrink:0,borderBottom:"1px solid #ede8ff",display:"flex",alignItems:"center",gap:12}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",fontSize:22,cursor:"pointer",padding:0,lineHeight:1}},"←"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#111"}},"Battle Pass"),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:3}},
          React.createElement("div",{style:{flex:1,height:6,borderRadius:6,background:"#e8e8e8",overflow:"hidden"}},
            React.createElement("div",{style:{height:"100%",width:Math.min(100,(pts%(BP_PTS_PER_NODE)||0)/BP_PTS_PER_NODE*100)+"%",background:"linear-gradient(90deg,#534AB7,#7c4dff)",borderRadius:6,transition:"width 0.4s"}})
          ),
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#534AB7",whiteSpace:"nowrap"}},pts+" pts")
        )
      ),
      battlepassPremium
        ?React.createElement("div",{style:{padding:"6px 14px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:12}},"⭐ Premium")
        :React.createElement("button",{onClick:buyPremium,disabled:(currencies.gems||0)<200,style:{padding:"8px 12px",borderRadius:12,border:"none",background:(currencies.gems||0)>=200?"linear-gradient(135deg,#f59e0b,#d97706)":"#ddd",color:"#fff",fontWeight:700,fontSize:11,cursor:(currencies.gems||0)>=200?"pointer":"default"}},
          "💎 200 — Premium")
    ),
    // Track labels
    React.createElement("div",{style:{display:"flex",padding:"8px 20px 0",flexShrink:0,justifyContent:"space-between"}},
      React.createElement("div",{style:{fontSize:10,fontWeight:700,color:GOLD,letterSpacing:1}},"⭐ PREMIUM"),
      React.createElement("div",{style:{fontSize:10,fontWeight:700,color:PURPLE,letterSpacing:1}},"FREE 🎫")
    ),
    // Scrollable track area
    React.createElement("div",{style:{flex:1,overflowX:"auto",overflowY:"hidden"}},
      React.createElement("div",{style:{height:"100%",minWidth:NW*50+40,padding:"0 20px",display:"flex",flexDirection:"column",justifyContent:"center",gap:4}},
        // Paid rewards row
        React.createElement("div",{style:{display:"flex"}},
          Array.from({length:50},(_,i)=>React.createElement(RewardBox,{key:i,i,isPaid:true}))
        ),
        // Nodes + connecting line row
        React.createElement("div",{style:{display:"flex",alignItems:"center",position:"relative",height:48,marginBottom:2}},
          React.createElement("div",{style:{position:"absolute",left:NW/2,right:NW/2,top:"50%",height:4,background:"#e0d9ff",transform:"translateY(-50%)",borderRadius:3}}),
          Array.from({length:50},(_,i)=>{
            const done=nodeUnlocked(i);
            const freeClaimed=battlepassClaimed[i];
            const paidClaimed=battlepassPaidClaimed[i];
            const fullyDone=freeClaimed&&(!battlepassPremium||paidClaimed);
            const nodeBg=fullyDone?"#e0e0e0":done?PURPLE:"#f0effe";
            const nodeBorder=fullyDone?"#ccc":done?"#3730a3":"#c4b5fd";
            const textColor=fullyDone?"#aaa":done?"#fff":"#c4b5fd";
            return React.createElement("div",{key:i,style:{width:NW,display:"flex",justifyContent:"center",position:"relative",zIndex:1,flexShrink:0}},
              React.createElement("div",{style:{
                width:40,height:40,borderRadius:"50%",background:nodeBg,border:"2px solid "+nodeBorder,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:800,color:textColor,
                boxShadow:done&&!fullyDone?"0 2px 8px rgba(83,74,183,0.3)":"none"
              }},fullyDone?"✓":(i+1))
            );
          })
        ),
        // Free rewards row
        React.createElement("div",{style:{display:"flex"}},
          Array.from({length:50},(_,i)=>React.createElement(RewardBox,{key:i,i,isPaid:false}))
        ),
        // Point threshold labels row
        React.createElement("div",{style:{display:"flex",marginTop:4}},
          Array.from({length:50},(_,i)=>{
            const done=nodeUnlocked(i);
            const threshold=(i+1)*BP_PTS_PER_NODE;
            return React.createElement("div",{key:i,style:{width:NW,flexShrink:0,padding:"0 4px",textAlign:"center",fontSize:9,fontWeight:done?700:400,color:done?PURPLE:"#bbb"}},
              threshold+" pts"
            );
          })
        )
      )
    )
  );
}


export default BattlepassScreen;
