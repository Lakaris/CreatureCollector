// Home tab: featured creature plus entries into quests, daily, and battle pass.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { QUEST_DEFS } from "../../data/quests.js";
import { getDisplayEmoji } from "../../core/creatures.js";
import BattlepassScreen from "../../ui/screens/BattlepassScreen.js";
import QuestsScreen from "../../ui/screens/QuestsScreen.js";
import DailyScreen from "../../ui/screens/DailyScreen.js";
import ScreenHeader, { CurrencyChip } from "../../ui/components/ScreenHeader.js";

function HomeScreen(){
  const { owned, unlockedSkins, featuredCreatureId, setFeaturedCreatureId, questState, questBatchIdx, setQuestBatchIdx, setCurrencies, claimedQuests, setClaimedQuests, dailyDay, setDailyDay, dailyLastClaimed, setDailyLastClaimed, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints, setBattlepassPoints, dailyMissionsDate, setDailyMissionsDate, dailyMissionsSnapshot, setDailyMissionsSnapshot, dailyMissionsDone, setDailyMissionsDone, dailyCompletionClaimed, setDailyCompletionClaimed, dailySelectedMissions, setDailySelectedMissions, setSettingsOpen, setTab, setGameMode, labyrinthDepth } = useGame();
  const [picking,setPicking]=React.useState(false);
  const [showQuests,setShowQuests]=React.useState(false);
  const [showDaily,setShowDaily]=React.useState(false);
  const [showBattlepass,setShowBattlepass]=React.useState(false);
  const ownedList=Object.values(owned);
  const ownedData=featuredCreatureId?owned[featuredCreatureId]:ownedList[0];
  const def=ownedData?CREATURE_MAP[ownedData.id]:null;
  const emoji=def?getDisplayEmoji(def,ownedData,unlockedSkins||[]):"🐣";
  const title=ownedData&&ownedData.equippedTitle?ownedData.equippedTitle:null;
  const aura=ownedData&&ownedData.equippedAura?ownedData.equippedAura:null;
  const bg=ownedData&&ownedData.equippedBackground?ownedData.equippedBackground:null;

  const hasReadyQuest=Object.keys(QUEST_DEFS).some(tab=>{
    const batchIdx=questBatchIdx[tab]||0;
    const batch=(QUEST_DEFS[tab]||[])[batchIdx];
    if(!batch)return false;
    return batch.quests.some(q=>q.check(questState)&&q.reward&&!claimedQuests.has(q.id));
  });
  if(showQuests) return React.createElement(QuestsScreen,{onBack:()=>setShowQuests(false),questState,questBatchIdx,setQuestBatchIdx,setCurrencies,claimedQuests,setClaimedQuests,dailyMissionsDate,setDailyMissionsDate,dailyMissionsSnapshot,setDailyMissionsSnapshot,dailyMissionsDone,setDailyMissionsDone,setBattlepassPoints,dailyCompletionClaimed,setDailyCompletionClaimed,dailySelectedMissions,setDailySelectedMissions});
  if(showDaily) return React.createElement(DailyScreen,{onBack:()=>setShowDaily(false),setCurrencies,dailyDay,setDailyDay,dailyLastClaimed,setDailyLastClaimed});
  if(showBattlepass) return React.createElement(BattlepassScreen,{onBack:()=>setShowBattlepass(false),setCurrencies,currencies,battlepassLastReset,setBattlepassLastReset,battlepassClaimed,setBattlepassClaimed,battlepassPaidClaimed,setBattlepassPaidClaimed,battlepassPremium,setBattlepassPremium,battlepassPoints});

  if(picking){
    return React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:0}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"16px 16px 12px",background:"#fff",borderBottom:"1px solid #e0e0e0"}},
        React.createElement("button",{onClick:()=>setPicking(false),style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},React.createElement("i",{className:"ti ti-arrow-left"})),
        React.createElement("div",{style:{fontSize:18,fontWeight:700}},"Featured Creature")
      ),
      React.createElement("div",{style:{flex:1,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:12}},
        ownedList.map(o=>{
          const d=CREATURE_MAP[o.id];
          if(!d)return null;
          const em=getDisplayEmoji(d,o,unlockedSkins||[]);
          const selected=o.id===(featuredCreatureId||ownedList[0]?.id);
          return React.createElement("button",{
            key:o.id,
            onClick:()=>{setFeaturedCreatureId(o.id);setPicking(false);},
            style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:10,border:selected?"2px solid #7c4dff":"2px solid #e8e8e8",background:selected?"#f3eeff":"#fafafa",cursor:"pointer"}
          },
            React.createElement("div",{style:{fontSize:36,lineHeight:1}},em),
            React.createElement("div",{style:{fontSize:10,fontWeight:600,color:"#333",textAlign:"center",lineHeight:1.2}},d.name)
          );
        })
      )
    );
  }

  return React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column"}},
    React.createElement(ScreenHeader,{title:React.createElement("button",{
      onClick:()=>setSettingsOpen(true),
      style:{width:34,height:34,margin:"-5px 0",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#f5f5f5",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}
    },"⚙️"),right:React.createElement(React.Fragment,null,
      React.createElement(CurrencyChip,{emoji:"💎",value:currencies.gems}),
      React.createElement(CurrencyChip,{emoji:"💰",value:currencies.money})
    )}),
    React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,position:"relative",padding:16}},
    bg&&React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:200,opacity:0.08,pointerEvents:"none",userSelect:"none"}},bg),
    aura&&React.createElement("div",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-60%)",fontSize:160,opacity:0.18,pointerEvents:"none",userSelect:"none",filter:"blur(8px)"}},aura),
    React.createElement("button",{
      onClick:()=>setShowQuests(true),
      style:{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:64,height:80,borderRadius:20,border:"2px solid #c4b5fd",background:"#f0effe",fontSize:28,fontWeight:700,color:"#534AB7",cursor:"pointer",boxShadow:"0 2px 12px rgba(83,74,183,0.15)"}
    },
      "📋",
      React.createElement("span",{style:{fontSize:11,fontWeight:700,color:"#534AB7"}},"Quests"),
      hasReadyQuest&&React.createElement("div",{style:{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#ef4444"}})
    ),
    React.createElement("div",{style:{fontSize:120,lineHeight:1,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.15))",position:"relative"}},emoji),
    title&&React.createElement("div",{style:{fontSize:11,fontWeight:600,color:"#7c4dff",letterSpacing:1,textTransform:"uppercase",marginTop:2}},title),
    def&&React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginTop:title?0:4}},def.name),
    def&&React.createElement("div",{style:{fontSize:13,color:"#888"}},def.type),
    React.createElement("button",{
      onClick:()=>setPicking(true),
      style:{marginTop:16,padding:"6px 18px",borderRadius:20,border:"1.5px solid #d0d0d0",background:"#f5f5f5",fontSize:13,fontWeight:600,color:"#555",cursor:"pointer"}
    },"Change"),
    React.createElement("button",{
      onClick:()=>setShowBattlepass(true),
      style:{position:"absolute",right:16,top:"calc(50% - 88px)",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:64,height:80,borderRadius:20,border:"2px solid #fbbf24",background:"#fffbeb",fontSize:28,fontWeight:700,color:"#d97706",cursor:"pointer",boxShadow:"0 2px 12px rgba(251,191,36,0.3)"}
    },
      "🎫",
      React.createElement("span",{style:{fontSize:11,fontWeight:700,color:"#d97706"}},"Battle Pass")
    ),
    React.createElement("button",{
      onClick:()=>setShowDaily(true),
      style:{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:64,height:80,borderRadius:20,border:"2px solid "+(new Date().toDateString()!==dailyLastClaimed?"#fbbf24":"#e0e0e0"),background:new Date().toDateString()!==dailyLastClaimed?"#fffbeb":"#f5f5f5",fontSize:28,fontWeight:700,color:"#d97706",cursor:"pointer",boxShadow:new Date().toDateString()!==dailyLastClaimed?"0 2px 12px rgba(251,191,36,0.3)":"none"}
    },
      "📅",
      React.createElement("span",{style:{fontSize:11,fontWeight:700,color:"#d97706"}},"Daily"),
      new Date().toDateString()!==dailyLastClaimed&&React.createElement("div",{style:{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#ef4444"}})
    ),
    React.createElement("button",{
      onClick:()=>{setGameMode("labyrinth");setTab("play");},
      style:{position:"fixed",left:"calc(75vw - 52px)",bottom:130,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,width:88,height:88,borderRadius:24,border:"2px solid #818cf8",background:"#eef2ff",fontSize:32,fontWeight:700,color:"#4f46e5",cursor:"pointer",boxShadow:"0 4px 16px rgba(99,102,241,0.25)",zIndex:5}
    },
      "🌀",
      React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#4f46e5"}},"Descend"),
      React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#6366f1"}},"Floor "+(labyrinthDepth||1))
    )
    )
  );
}

export default HomeScreen;
