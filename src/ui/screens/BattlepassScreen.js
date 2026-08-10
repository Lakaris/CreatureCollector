// 50-node battle pass track with free and premium lanes, stacked top to
// bottom with free rewards on the left and premium rewards on the right.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { BP_PTS_PER_NODE } from "../../data/quests.js";
import { formatDuration } from "../../core/format.js";

function BattlepassScreen({onBack}){
  const { setCurrencies, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints } = useGame();
  const now=Date.now();
  const [showComingSoon,setShowComingSoon]=React.useState(false);
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
  const PURPLE="#534AB7";const GOLD="#d97706";const NODE_COL_W=64;const BOX_MAX=200;
  const level=Math.min(50,Math.floor(pts/BP_PTS_PER_NODE));
  const ptsIntoLevel=pts%BP_PTS_PER_NODE;
  function RewardBox({i,isPaid}){
    const claimed=isPaid?battlepassPaidClaimed[i]:battlepassClaimed[i];
    const done=nodeUnlocked(i);
    const canClaim=done&&!claimed&&(isPaid?battlepassPremium:true);
    const locked=isPaid&&!battlepassPremium;
    const bg=claimed?"#f0f0f0":locked?"#f7f7f7":done?(isPaid?"#fffbeb":"#f0effe"):"#f5f4ff";
    const border=claimed?"#ddd":locked?"#ddd":done?(isPaid?"#fbbf24":"#c4b5fd"):"#d8d3f5";
    return React.createElement("div",{style:{flex:1,maxWidth:BOX_MAX,aspectRatio:"1.6429",display:"flex",justifyContent:"center",alignItems:"center"}},
      React.createElement("div",{style:{width:"100%",height:"100%",boxSizing:"border-box",borderRadius:18,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,background:bg,border:"2px solid "+border,padding:8}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
          React.createElement("span",{style:{fontSize:30,filter:locked?"grayscale(70%)":"none"}},"🍬"),
          React.createElement("span",{style:{fontSize:22,fontWeight:800,color:locked?"#aaa":(isPaid?GOLD:PURPLE)}},isPaid?"+15":"+5")
        ),
        locked?React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#999",background:"#eaeaea",borderRadius:8,padding:"3px 10px",lineHeight:1.3,textAlign:"center"}},"🔒 Premium")
          :claimed?React.createElement("span",{style:{fontSize:16,color:"#aaa"}},"✓")
          :canClaim?React.createElement("button",{onClick:()=>isPaid?claimPaid(i):claimFree(i),style:{fontSize:13,padding:"6px 16px",borderRadius:10,border:"none",background:isPaid?GOLD:PURPLE,color:"#fff",fontWeight:700,cursor:"pointer"}},"CLAIM")
          :React.createElement("span",{style:{fontSize:13,color:"#ccc"}},"Locked")
      )
    );
  }
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f8f8ff",zIndex:200}},
    showComingSoon&&React.createElement("div",{onClick:()=>setShowComingSoon(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8}},"🚧"),
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:8}},"Coming Soon"),
        React.createElement("div",{style:{fontSize:14,color:"#666",lineHeight:1.5}},"Payments aren't set up yet. Check back later!"),
        React.createElement("button",{onClick:()=>setShowComingSoon(false),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
      )
    ),
    // Header -- fixed above the scroll area, never scrolls with the track
    React.createElement("div",{style:{flexShrink:0,borderBottom:"1px solid #ede8ff"}},
      React.createElement("div",{style:{padding:"20px 20px 12px",display:"flex",alignItems:"center",gap:12}},
        React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},React.createElement("i",{className:"ti ti-arrow-left"})),
        React.createElement("div",{style:{flex:1,fontSize:20,fontWeight:800,color:"#111"}},"Battle Pass"),
        battlepassPremium
          ?React.createElement("div",{style:{padding:"6px 14px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:12}},"⭐ Premium")
          :React.createElement("button",{onClick:()=>setShowComingSoon(true),style:{padding:"8px 12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}},
            "$9.99 — Premium")
      ),
      React.createElement("div",{style:{padding:"0 20px 14px",display:"flex",alignItems:"center",gap:8}},
        React.createElement("div",{style:{fontSize:12,fontWeight:800,color:PURPLE,whiteSpace:"nowrap"}},"Level "+level),
        React.createElement("div",{style:{flex:1,height:6,borderRadius:6,background:"#e8e8e8",overflow:"hidden"}},
          React.createElement("div",{style:{height:"100%",width:Math.min(100,ptsIntoLevel/BP_PTS_PER_NODE*100)+"%",background:"linear-gradient(90deg,#534AB7,#7c4dff)",borderRadius:6,transition:"width 0.4s"}})
        ),
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:PURPLE,whiteSpace:"nowrap"}},ptsIntoLevel+"/"+BP_PTS_PER_NODE+" pts")
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
        // Connecting line running down the center of the node column
        React.createElement("div",{style:{position:"absolute",top:12,bottom:40,left:"50%",width:4,background:"#e0d9ff",transform:"translateX(-50%)",borderRadius:3,zIndex:0}}),
        Array.from({length:50},(_,i)=>{
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
