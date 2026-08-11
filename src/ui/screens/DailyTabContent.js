// Daily missions widget: select, track, and claim.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { DAILY_COMPLETION_REWARD, DAILY_COMPLETION_BP, DAILY_MISSIONS, REWARD_LABELS, REWARD_DESC } from "../../data/quests.js";
import { applyRewards } from "../../core/rewards.js";
import { pickDailyMissions } from "../../core/gacha.js";
import { easternNoonDayKey } from "../../core/dates.js";
import { formatNum } from "../../core/format.js";

function DailyTabContent({setRewardPopup,onNavigate}){
  const { setCurrencies, questState, dailyMissionsDate, setDailyMissionsDate, dailyMissionsSnapshot, setDailyMissionsSnapshot, dailyMissionsDone, setDailyMissionsDone, setBattlepassPoints, dailyCompletionClaimed, setDailyCompletionClaimed, dailySelectedMissions, setDailySelectedMissions, plotsUnlocked, dungeonsUnlocked, dailyBossUnlocked, arenaUnlocked, setEverCompletedDailyQuests } = useGame();
  const today=easternNoonDayKey();
  const unlockedFeatures={dungeon:dungeonsUnlocked,plots:plotsUnlocked,boss:dailyBossUnlocked,arena:arenaUnlocked};
  const [rewardItems,setRewardItems]=React.useState(null);
  const [visibleCount,setVisibleCount]=React.useState(0);
  const [localRewardPopup,setLocalRewardPopup]=React.useState(null);
  React.useEffect(()=>{
    if(!rewardItems||visibleCount>=rewardItems.length)return;
    const t=setTimeout(()=>setVisibleCount(v=>v+1),400);
    return()=>clearTimeout(t);
  },[rewardItems,visibleCount]);
  React.useEffect(()=>{
    if(dailyMissionsDate!==today){
      setDailyMissionsDate(today);
      setDailyMissionsSnapshot({eggsHatched:questState.eggsHatched||0,dungeonsCleared:questState.dungeonsCleared||0,arenaFights:questState.arenaFights||0,bananasUsed:questState.bananasUsed||0,dailyBossFights:questState.dailyBossFights||0,plotsGrown:questState.plotsGrown||0,labyrinthFights:questState.labyrinthFights||0,fieldHarvests:questState.fieldHarvests||0,petLevelUps:questState.petLevelUps||0,equipLevelUps:questState.equipLevelUps||0,currencies:{...questState.currencies}});
      setDailyMissionsDone(new Set());
      setDailyCompletionClaimed(false);
      setDailySelectedMissions(pickDailyMissions(unlockedFeatures));
    } else if(!dailySelectedMissions||dailySelectedMissions.length===0){
      setDailySelectedMissions(pickDailyMissions(unlockedFeatures));
    }
  },[today]);
  // Prunes missions that were drawn before their feature unlocked -- or
  // before this gating existed at all -- so a locked one never lingers.
  React.useEffect(()=>{
    if(!dailySelectedMissions||dailySelectedMissions.length===0)return;
    const hasLocked=dailySelectedMissions.some(id=>(id==="dm_dung1"&&!unlockedFeatures.dungeon)||(id==="dm_farm"&&!unlockedFeatures.plots)||(id==="dm_boss"&&!unlockedFeatures.boss)||(id==="dm_arena"&&!unlockedFeatures.arena));
    if(hasLocked)setDailySelectedMissions(pickDailyMissions(unlockedFeatures));
  },[dailySelectedMissions,unlockedFeatures.dungeon,unlockedFeatures.plots,unlockedFeatures.boss,unlockedFeatures.arena]);
  // When today's snapshot hasn't been taken yet (brand new day, or the very
  // first visit ever), the effect above will reset it to current counters --
  // but that effect only runs after this first render commits. Rendering
  // with the stale (often many-days-old) snapshot in the meantime would
  // compute today's "progress so far" as ALL cumulative progress since that
  // stale baseline, i.e. bars would briefly show as mostly/fully complete
  // before snapping down to 0 a frame later. Computing the same fresh
  // baseline here, synchronously, means the first paint is already correct.
  const isFreshDay=dailyMissionsDate!==today;
  const freshSnap={eggsHatched:questState.eggsHatched||0,dungeonsCleared:questState.dungeonsCleared||0,arenaFights:questState.arenaFights||0,bananasUsed:questState.bananasUsed||0,dailyBossFights:questState.dailyBossFights||0,plotsGrown:questState.plotsGrown||0,labyrinthFights:questState.labyrinthFights||0,fieldHarvests:questState.fieldHarvests||0,petLevelUps:questState.petLevelUps||0,equipLevelUps:questState.equipLevelUps||0,currencies:{...questState.currencies}};
  const snap=isFreshDay?freshSnap:(dailyMissionsSnapshot||freshSnap);
  const qs=questState||{};
  function showReward(reward){
    const entries=Object.entries(reward);
    setRewardItems(entries);
    setVisibleCount(0);
  }
  function claimMission(m){
    if(dailyMissionsDone.has(m.id))return;
    const entries=Object.entries(m.reward);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    setDailyMissionsDone(prev=>new Set([...prev,m.id]));
    if(m.points&&setBattlepassPoints) setBattlepassPoints(p=>p+(m.points||0));
    showReward(m.reward);
  }
  function claimCompletion(){
    if(dailyCompletionClaimed)return;
    const allReward={...DAILY_COMPLETION_REWARD,battlepassPoints:DAILY_COMPLETION_BP};
    const entries=Object.entries(DAILY_COMPLETION_REWARD);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    if(setBattlepassPoints) setBattlepassPoints(p=>p+DAILY_COMPLETION_BP);
    setDailyCompletionClaimed(true);
    setEverCompletedDailyQuests(true);
    showReward(allReward);
  }
  const todaysMissions=dailySelectedMissions&&dailySelectedMissions.length>0
    ?DAILY_MISSIONS.filter(m=>dailySelectedMissions.includes(m.id))
    :DAILY_MISSIONS;
  // Same stale-until-the-effect-runs issue as snap above: yesterday's claimed
  // set (and completion flag) can otherwise flash "done" on today's missions
  // for a frame if the same mission id happened to be claimed yesterday too.
  const doneSet=isFreshDay?new Set():dailyMissionsDone;
  const completionClaimed=isFreshDay?false:dailyCompletionClaimed;
  const allDone=todaysMissions.every(m=>doneSet.has(m.id));
  const canClaimCompletion=allDone&&!completionClaimed;
  const completedCount=todaysMissions.filter(m=>doneSet.has(m.id)).length;
  if(rewardItems){
    const allVisible=visibleCount>=rewardItems.length;
    return React.createElement("div",{onClick:allVisible?()=>setRewardItems(null):undefined,style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#fff",zIndex:200,cursor:allVisible?"pointer":"default"}},
      localRewardPopup&&React.createElement("div",{onClick:()=>setLocalRewardPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}},
        React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:18,padding:"24px 28px",maxWidth:280,textAlign:"center"}},
          React.createElement("div",{style:{fontSize:36,marginBottom:8}},REWARD_LABELS[localRewardPopup]?.split(" ")[0]||"🎁"),
          React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:6}},REWARD_LABELS[localRewardPopup]||localRewardPopup),
          React.createElement("div",{style:{fontSize:13,color:"#555"}},REWARD_DESC[localRewardPopup]||""),
          React.createElement("button",{onClick:()=>setLocalRewardPopup(null),style:{marginTop:16,padding:"8px 24px",fontSize:13,fontWeight:700,background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:10,cursor:"pointer"}},"OK")
        )
      ),
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",padding:"32px 24px 16px",flexShrink:0}},"Obtained"),
      React.createElement("div",{style:{flex:1,padding:"0 24px",display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",alignContent:"center"}},
        rewardItems.map(([k,v],i)=>{
          const visible=i<visibleCount;
          return React.createElement("div",{key:k,onClick:()=>setLocalRewardPopup(k),style:{
            width:100,height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
            background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:16,cursor:"pointer",
            opacity:visible?1:0,transform:visible?"scale(1)":"scale(0.7)",
            transition:"opacity 0.3s, transform 0.3s",
          }},
            React.createElement("div",{style:{fontSize:34,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:"#534AB7"}},typeof v==="number"&&k==="battlepassPoints"?formatNum(v)+" pts":formatNum(v))
          );
        })
      ),
      React.createElement("div",{style:{marginTop:"auto",padding:"16px 24px 32px",flexShrink:0,textAlign:"center"}},
        allVisible&&React.createElement("div",{style:{fontSize:13,color:"#aaa",fontWeight:500}},"Click anywhere to close")
      )
    );
  }
  return React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}},
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}},
      React.createElement("div",{style:{padding:"4px 0 0"}},
        React.createElement("div",{style:{fontSize:11,color:"#7c3aed",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}},"Completion Reward"),
        React.createElement("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}},
          Object.entries(DAILY_COMPLETION_REWARD).map(([k,v])=>React.createElement("div",{key:k,onClick:()=>setRewardPopup?.(k),style:{
            width:72,height:72,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
            background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:14,cursor:"pointer",
          }},
            React.createElement("div",{style:{fontSize:26,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
            React.createElement("div",{style:{fontSize:12,fontWeight:800,color:"#534AB7"}},formatNum(v))
          )),
          React.createElement("div",{onClick:()=>setRewardPopup?.("battlepassPoints"),style:{
            width:72,height:72,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
            background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:14,cursor:"pointer",
          }},
            React.createElement("div",{style:{fontSize:26,lineHeight:1}},"🎫"),
            React.createElement("div",{style:{fontSize:12,fontWeight:800,color:"#534AB7"}},DAILY_COMPLETION_BP+" pts")
          )
        ),
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
          React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#534AB7"}},"Quest Progress"),
          React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#534AB7"}},Math.round((completedCount/todaysMissions.length)*100)+"%")
        ),
        React.createElement("div",{style:{height:8,borderRadius:8,background:"#e8e8e8",overflow:"hidden",marginBottom:canClaimCompletion?12:0}},
          React.createElement("div",{style:{height:"100%",width:Math.round((completedCount/todaysMissions.length)*100)+"%",background:"linear-gradient(90deg,#534AB7,#7c4dff)",borderRadius:8,transition:"width 0.4s"}})
        ),
        canClaimCompletion&&React.createElement("button",{
          onClick:claimCompletion,
          style:{width:"100%",padding:"14px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#534AB7,#7c4dff)",color:"#fff",border:"none",borderRadius:14,cursor:"pointer",boxShadow:"0 4px 16px rgba(83,74,183,0.35)"}
        },"🎁 Claim Completion Reward"),
      ),
      todaysMissions.map(m=>{
        const claimed=doneSet.has(m.id);
        let ready=false;
        let prog={cur:0,max:1};
        try{ready=m.check(qs,snap);prog=m.progress(qs,snap);}catch{}
        const pct=prog.max>0?Math.min(1,prog.cur/prog.max):0;
        const rewardEntries=Object.entries(m.reward);
        const clickAction=ready&&!claimed?()=>claimMission(m):(!ready&&!claimed&&m.nav&&onNavigate?()=>onNavigate(m.nav):undefined);
        return React.createElement("div",{key:m.id,
          onClick:clickAction,
          style:{background:ready&&!claimed?"#f0fff4":"#fafafa",border:"1.5px solid "+(ready&&!claimed?"#86efac":"#e8e8e8"),borderRadius:12,padding:"10px",display:"flex",gap:10,alignItems:"stretch",cursor:clickAction?"pointer":"default",opacity:claimed?0.45:1,transition:"opacity 0.2s"}
        },
          rewardEntries.length>0&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4,flexShrink:0}},
            rewardEntries.map(([k,v])=>React.createElement("div",{key:k,onClick:e=>{e.stopPropagation();setRewardPopup?.(k);},style:{
              width:60,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
              background:claimed?"#dcfce7":ready?"#ede9fe":"#f5f3ff",
              border:"2px solid "+(claimed?"#86efac":ready?"#c4b5fd":"#ddd6fe"),
              borderRadius:10,cursor:"pointer",
            }},
              React.createElement("div",{style:{fontSize:26,lineHeight:1}},REWARD_LABELS[k]?.split(" ")[0]||"🎁"),
              React.createElement("div",{style:{fontSize:12,fontWeight:800,color:claimed?"#166534":ready?"#534AB7":"#7c3aed"}},formatNum(v))
            ))
          ),
          React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:6}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
              React.createElement("div",{style:{fontSize:13,fontWeight:600,color:ready&&!claimed?"#166534":"#222",flex:1}},m.label),
              React.createElement("div",{style:{fontSize:12,color:claimed?"#22c55e":"#888",flexShrink:0}},claimed?"✓ Claimed":prog.cur+" / "+prog.max)
            ),
            React.createElement("div",{style:{height:6,borderRadius:6,background:"#e8e8e8",overflow:"hidden"}},
              React.createElement("div",{style:{height:"100%",width:(pct*100)+"%",background:ready?"#22c55e":"#534AB7",borderRadius:6,transition:"width 0.3s"}})
            )
          )
        );
      })
    )
  );
}

export default DailyTabContent;
