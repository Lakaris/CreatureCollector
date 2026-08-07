// Tabbed quest board with per-quest and per-batch claiming.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { QUEST_TABS, DAILY_MISSIONS, QUEST_DEFS, REWARD_LABELS, REWARD_DESC } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import DailyTabContent from "../../ui/screens/DailyTabContent.js";

function QuestsScreen({onBack}){
  const { questState, questBatchIdx, setQuestBatchIdx, setCurrencies, claimedQuests, setClaimedQuests, dailyMissionsDate, setDailyMissionsDate, dailyMissionsSnapshot, setDailyMissionsSnapshot, dailyMissionsDone, setDailyMissionsDone, setBattlepassPoints, dailyCompletionClaimed, setDailyCompletionClaimed, dailySelectedMissions, setDailySelectedMissions } = useGame();
  const [questTab,setQuestTab]=React.useState("daily");
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  const [rewardPopup,setRewardPopup]=React.useState(null);
  const batchIdx=questBatchIdx[questTab]||0;
  const batches=QUEST_DEFS[questTab]||[];
  const batch=batches[batchIdx];
  const allDone=batch&&batch.quests.every(q=>q.check(questState));
  const allIndividualClaimed=batch&&batch.quests.every(q=>!q.reward||claimedQuests.has(q.id));
  const canClaimBatch=allDone&&allIndividualClaimed;

  React.useEffect(()=>{
    if(!rewardItems||visibleCount>=rewardItems.length)return;
    const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
    return()=>clearTimeout(t);
  },[rewardItems,visibleCount]);

  function showReward(reward,items){
    const entries=Object.entries(reward);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    setRewardItems(entries);
    setVisibleCount(0);
  }

  function claimBatchReward(){
    if(!canClaimBatch)return;
    setQuestBatchIdx(prev=>({...prev,[questTab]:batchIdx+1}));
    showReward(batch.reward);
  }

  function claimQuestReward(q){
    setClaimedQuests(prev=>new Set([...prev,q.id]));
    showReward(q.reward);
  }

  const questRewardPopupEl=rewardPopup&&React.createElement("div",{onClick:()=>setRewardPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
      React.createElement("div",{style:{fontSize:52,lineHeight:1,marginBottom:12}},REWARD_LABELS[rewardPopup]?.split(" ")[0]||"🎁"),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginBottom:8}},REWARD_LABELS[rewardPopup]?.split(" ").slice(1).join(" ")||rewardPopup),
      React.createElement("div",{style:{fontSize:14,color:"#666",lineHeight:1.5}},REWARD_DESC[rewardPopup]||""),
      React.createElement("button",{onClick:()=>setRewardPopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
    )
  );

  if(rewardItems){
    const allVisible=visibleCount>=rewardItems.length;
    return React.createElement("div",{onClick:allVisible?()=>setRewardItems(null):undefined,style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#fff",zIndex:200,cursor:allVisible?"pointer":"default"}},
      questRewardPopupEl,
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",padding:"32px 24px 16px",flexShrink:0}},"Obtained"),
      React.createElement("div",{style:{flex:1,padding:"0 24px",display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",alignContent:"center"}},
        rewardItems.map(([k,v],i)=>{
          const visible=i<visibleCount;
          return React.createElement("div",{key:k,onClick:e=>{e.stopPropagation();setRewardPopup(k);},style:{
            width:100,height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
            background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:16,cursor:"pointer",
            opacity:visible?1:0,transform:visible?"scale(1)":"scale(0.7)",
            transition:"opacity 0.3s, transform 0.3s",
          }},
            React.createElement("div",{style:{fontSize:34,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:"#534AB7"}},v)
          );
        })
      ),
      React.createElement("div",{style:{marginTop:"auto",padding:"16px 24px 32px",flexShrink:0,textAlign:"center"}},
        allVisible&&React.createElement("div",{style:{fontSize:13,color:"#aaa",fontWeight:500}},"Click anywhere to close")
      )
    );
  }

  const questTabDef=QUEST_TABS.find(t=>t.id===questTab);
  const headerTitle=questTab==="daily"?"📅 Daily Missions":(questTabDef?.emoji+" "+questTabDef?.label+" Quests");
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#fff",zIndex:200}},
    questRewardPopupEl,
    React.createElement("div",{style:{padding:"16px 16px 12px",borderBottom:"1px solid #e0e0e0",flexShrink:0,background:"#fff"}},
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111"}},headerTitle)
    ),
    React.createElement("div",{style:{display:"flex",flex:1,overflow:"hidden"}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",width:72,borderRight:"1px solid #e0e0e0",background:"#fff",flexShrink:0,alignSelf:"stretch",overflowY:"auto"}},
        QUEST_TABS.map(t=>{
          const tBatchIdx=questBatchIdx[t.id]||0;
          const tBatches=QUEST_DEFS[t.id]||[];
          const tBatch=tBatches[tBatchIdx];
          const activeDailyMissions=dailySelectedMissions&&dailySelectedMissions.length>0?DAILY_MISSIONS.filter(m=>dailySelectedMissions.includes(m.id)):DAILY_MISSIONS;
          const tDone=t.id==="daily"?activeDailyMissions.some(m=>!dailyMissionsDone.has(m.id)&&(()=>{try{return m.check(questState,dailyMissionsSnapshot);}catch{return false;}})()):(tBatch&&tBatch.quests.some(q=>q.check(questState)&&q.reward&&!claimedQuests.has(q.id)));
          return React.createElement("button",{key:t.id,
            onClick:()=>setQuestTab(t.id),
            style:{
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              flex:1,gap:3,padding:"4px",border:"none",position:"relative",
              borderRight:questTab===t.id?"3px solid #534AB7":"3px solid transparent",
              background:questTab===t.id?"#f0effe":"none",
              color:questTab===t.id?"#534AB7":"#555",
              fontSize:10,fontWeight:questTab===t.id?700:400,cursor:"pointer",
              transition:"background 0.15s",
            }
          },
            React.createElement("span",{style:{fontSize:20}},t.emoji),
            t.label,
            tDone&&(t.id==="daily"||tBatchIdx<tBatches.length)&&React.createElement("span",{style:{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#ef4444"}})
          );
        })
      ),
      React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}},
        questTab==="daily"?React.createElement(DailyTabContent,{setCurrencies,questState,dailyMissionsDate,setDailyMissionsDate,dailyMissionsSnapshot,setDailyMissionsSnapshot,dailyMissionsDone,setDailyMissionsDone,setBattlepassPoints,dailyCompletionClaimed,setDailyCompletionClaimed,dailySelectedMissions,setDailySelectedMissions,setRewardPopup}):
        batch?React.createElement(React.Fragment,null,
          React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}},
            React.createElement("div",{style:{padding:"4px 0 0"}},
              React.createElement("div",{style:{fontSize:11,color:"#7c3aed",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}},"Completion Reward"),
              React.createElement("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}},
                Object.entries(batch.reward).map(([k,v])=>React.createElement("div",{key:k,onClick:()=>setRewardPopup(k),style:{
                  width:72,height:72,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                  background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:14,cursor:"pointer",
                }},
                  React.createElement("div",{style:{fontSize:26,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
                  React.createElement("div",{style:{fontSize:12,fontWeight:800,color:"#534AB7"}},v)
                ))
              ),
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
                React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#534AB7"}},"Quest Progress"),
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#534AB7"}},
                  Math.round((batch.quests.filter(q=>q.reward?claimedQuests.has(q.id):q.check(questState)).length/batch.quests.length)*100)+"%"
                )
              ),
              React.createElement("div",{style:{height:8,borderRadius:8,background:"#e8e8e8",overflow:"hidden",marginBottom:canClaimBatch?12:0}},
                React.createElement("div",{style:{
                  height:"100%",
                  width:Math.round((batch.quests.filter(q=>q.reward?claimedQuests.has(q.id):q.check(questState)).length/batch.quests.length)*100)+"%",
                  background:"linear-gradient(90deg,#534AB7,#7c4dff)",
                  borderRadius:8,transition:"width 0.4s",
                }})
              ),
              canClaimBatch&&React.createElement("button",{
                onClick:claimBatchReward,
                style:{width:"100%",padding:"14px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:14,cursor:"pointer",boxShadow:"0 4px 16px rgba(83,74,183,0.35)"}
              },"🎁 Claim Completion Reward")
            ),
            [...batch.quests].sort((a,b)=>{const ac=claimedQuests.has(a.id)?1:0,bc=claimedQuests.has(b.id)?1:0;return ac-bc;}).map(q=>{
              const done=q.check(questState);
              const claimed=claimedQuests.has(q.id);
              const prog=q.progress(questState);
              const pct=prog.max>0?Math.min(1,prog.cur/prog.max):0;
              const rewardEntries=q.reward?Object.entries(q.reward):[];
              return React.createElement("div",{key:q.id,onClick:done&&!claimed?()=>claimQuestReward(q):undefined,style:{background:done&&!claimed?"#f0fff4":"#fafafa",border:"1.5px solid "+(done&&!claimed?"#86efac":"#e8e8e8"),borderRadius:12,padding:"10px",display:"flex",gap:10,alignItems:"stretch",cursor:done&&!claimed?"pointer":"default",opacity:claimed?0.45:1,transition:"opacity 0.2s"}},
                rewardEntries.length>0&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4,flexShrink:0}},
                  rewardEntries.map(([k,v])=>React.createElement("div",{key:k,onClick:e=>{e.stopPropagation();setRewardPopup(k);},style:{
                    width:60,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
                    background:claimed?"#dcfce7":done?"#ede9fe":"#f5f3ff",
                    border:"2px solid "+(claimed?"#86efac":done?"#c4b5fd":"#ddd6fe"),
                    borderRadius:10,cursor:"pointer",
                  }},
                    React.createElement("div",{style:{fontSize:26,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
                    React.createElement("div",{style:{fontSize:12,fontWeight:800,color:claimed?"#166534":done?"#534AB7":"#7c3aed"}},v)
                  ))
                ),
                React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:6}},
                  React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                    React.createElement("div",{style:{fontSize:13,fontWeight:600,color:done?"#166534":"#222",flex:1}},q.label),
                    React.createElement("div",{style:{fontSize:12,color:claimed?"#22c55e":"#888",flexShrink:0}},claimed?"✓ Claimed":prog.cur+"/"+prog.max)
                  ),
                  React.createElement("div",{style:{height:6,borderRadius:6,background:"#e8e8e8",overflow:"hidden"}},
                    React.createElement("div",{style:{height:"100%",width:(pct*100)+"%",background:done?"#22c55e":"#534AB7",borderRadius:6,transition:"width 0.3s"}})
                  )
                )
              );
            })
          ),
        ):React.createElement("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:"#aaa"}},
          React.createElement("div",{style:{fontSize:40}},"🏆"),
          React.createElement("div",{style:{fontSize:14,fontWeight:600}},"All quests complete!"),
        )
      )
    ),
    React.createElement("div",{style:{display:"flex",justifyContent:"center",padding:"16px 0 28px",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{width:52,height:52,borderRadius:"50%",border:"none",background:"#534AB7",color:"#fff",fontSize:22,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(83,74,183,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}},"✕")
    )
  );
}

export default QuestsScreen;
