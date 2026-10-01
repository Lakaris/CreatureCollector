// Home tab: featured creature plus entries into quests, daily, and battle pass.

import React from "../../react.js";
import { iconText } from "../components/IconText.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { FLAIR_AURA_MAP, backdropImage } from "../../data/flair.js";
import { QUEST_DEFS, NEW_PLAYER_GIFT_REWARDS } from "../../data/quests.js";
import CreatureIcon from "../../ui/components/CreatureIcon.js";
import BattlepassScreen from "../../ui/screens/BattlepassScreen.js";
import QuestsScreen from "../../ui/screens/QuestsScreen.js";
import DailyScreen from "../../ui/screens/DailyScreen.js";
import NewPlayerGiftScreen from "../../ui/screens/NewPlayerGiftScreen.js";
import ScreenHeader, { CurrencyChip } from "../../ui/components/ScreenHeader.js";
import { getDepthReward, nextRewardDepth, formatLabyrinthReward } from "../../core/labyrinth.js";
import { easternNoonDayKey } from "../../core/dates.js";
import { TABS } from "../../ui/components/NavBar.js";

// Percent, not vw: these overlays are position:fixed inside the scaled app
// (see ui/uiScale.js), so a percentage tracks the nav bar they point at while
// a viewport unit would drift away from it as the screen changes.
const COLLECTION_TAB_LEFT_PCT = ((TABS.findIndex(t=>t.id==="collection")+0.5)/TABS.length)*100+"%";

// Hides Home's Labyrinth entry -- the Descend button and its Victory Reward
// bubble -- for now. The tutorial's "descend" step still shows Descend,
// since it walks the player through that button.
const SHOW_LABYRINTH_ENTRY = false;


// The height the bottom panel is guaranteed, so its 96px-min tiles always fit.
// The art gives way to this, never the other way round: the panel is positioned
// at top:HOME_ART with bottom:0, so any art taller than the scene minus this
// leaves the panel zero height and its tiles spill out under the nav bar.
const HOME_PANEL_MIN = 120;
// Edge length of the Home scene's square background art: the scene's full
// width -- its content box (100cqw) plus the 16px side padding either side --
// or whatever height is left once the panel has taken its share, if that's
// smaller (a wide or short window), so the whole image always fits.
const HOME_ART = "min(100cqw + 32px, 100cqh + 32px - " + HOME_PANEL_MIN + "px)";
// Where the creature's feet sit, measured down from the scene's top: 7% up
// from the bottom of the art, as on the creature and Flair pages.
const HOME_FEET_TOP = "calc(0.93 * " + HOME_ART + ")";

function HomeScreen(){
  const { owned, unlockedSkins, featuredCreatureId, setFeaturedCreatureId, questState, questBatchIdx, setQuestBatchIdx, setCurrencies, claimedQuests, setClaimedQuests, dailyDay, setDailyDay, dailyLastClaimed, setDailyLastClaimed, newPlayerGiftDay, setNewPlayerGiftDay, newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints, setBattlepassPoints, dailyMissionsDate, setDailyMissionsDate, dailyMissionsSnapshot, setDailyMissionsSnapshot, dailyMissionsDone, setDailyMissionsDone, dailyCompletionClaimed, setDailyCompletionClaimed, dailySelectedMissions, setDailySelectedMissions, setSettingsOpen, setTab, setGameMode, labyrinthDepth, tutorialRestricted, setTutorialRestricted, tutorialStep, setTutorialStep, postTutorialPopupPending, setPostTutorialPopupPending, showQuestsArrow, setShowQuestsArrow, pendingDungeonReveal, setPendingDungeonReveal } = useGame();
  const [showQuests,setShowQuests]=React.useState(false);
  const [showDaily,setShowDaily]=React.useState(false);
  const [showNewPlayerGift,setShowNewPlayerGift]=React.useState(false);
  const [showBattlepass,setShowBattlepass]=React.useState(false);
  // Right after the tutorial finishes, the player's first Home landing
  // auto-opens the New Player Gift, then (once they back out of that) the
  // Daily screen behind it -- a one-time welcome-back chain, not something
  // that should fire again on later visits.
  const [autoChainToDaily,setAutoChainToDaily]=React.useState(false);
  React.useEffect(()=>{
    if(postTutorialPopupPending){
      setPostTutorialPopupPending(false);
      setShowNewPlayerGift(true);
      setAutoChainToDaily(true);
    }
  },[postTutorialPopupPending]);
  const ownedList=Object.values(owned);
  const ownedData=(featuredCreatureId&&owned[featuredCreatureId])||ownedList[0];
  const def=ownedData?CREATURE_MAP[ownedData.id]:null;
  const auraDef=ownedData&&ownedData.equippedAura?FLAIR_AURA_MAP[ownedData.equippedAura]:null;
  const homeBackdrop=backdropImage(ownedData);
  // One tile in Home's menu row: the emoji in a round badge tinted with the
  // tile's own colour, its label below, a red notification badge on the
  // corner when something is waiting, and room for an extra overlay (the
  // Quests pointer). Dimmed and inert while the tutorial restricts Home.
  const homeTile=(emoji,label,tint,dot,onClick,extra)=>React.createElement("button",{
    key:label,
    onClick:()=>{if(tutorialRestricted)return;onClick();},
    style:{position:"relative",flex:1,maxWidth:86,minHeight:96,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",gap:7,padding:"12px 4px 10px",border:"none",borderRadius:18,background:"#fff",boxShadow:"0 2px 10px rgba(83,74,183,0.10)",fontFamily:"inherit",cursor:tutorialRestricted?"not-allowed":"pointer",opacity:tutorialRestricted?0.4:1}
  },
    React.createElement("span",{style:{width:44,height:44,borderRadius:"50%",background:tint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,lineHeight:1,flexShrink:0}},emoji),
    React.createElement("span",{style:{fontSize:10.5,fontWeight:700,color:"#3f3a78",textAlign:"center",lineHeight:1.15}},label),
    dot&&React.createElement("div",{style:{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:"#ef4444",border:"2px solid #fff",boxSizing:"border-box"}}),
    extra
  );

  // Tutorial 2 (post-Set-1 Dungeon reveal): unlike the original tutorial's
  // Home steps, which hide every other button to keep a brand-new player
  // from getting lost, this step just needs the player unable to wander off
  // -- everything stays visible (dimmed) so the screen doesn't look broken.
  const dungeonRevealActive=tutorialRestricted&&tutorialStep==="dungeonReveal";
  const hasReadyQuest=Object.keys(QUEST_DEFS).some(tab=>{
    const batchIdx=questBatchIdx[tab]||0;
    const batch=(QUEST_DEFS[tab]||[])[batchIdx];
    if(!batch)return false;
    return batch.quests.some(q=>q.check(questState)&&q.reward&&!claimedQuests.has(q.id));
  });
  if(showQuests) return React.createElement(QuestsScreen,{onBack:()=>{
    setShowQuests(false);
    // The Dungeon reveal hand-off waits for the player to actually land back
    // on Home (rather than firing the instant the Set 1 reward is claimed,
    // which would interrupt the reward-popup animation still on screen).
    if(pendingDungeonReveal){setPendingDungeonReveal(false);setTutorialRestricted(true);setTutorialStep("dungeonReveal");}
  },questState,questBatchIdx,setQuestBatchIdx,setCurrencies,claimedQuests,setClaimedQuests,dailyMissionsDate,setDailyMissionsDate,dailyMissionsSnapshot,setDailyMissionsSnapshot,dailyMissionsDone,setDailyMissionsDone,setBattlepassPoints,dailyCompletionClaimed,setDailyCompletionClaimed,dailySelectedMissions,setDailySelectedMissions});
  if(showDaily) return React.createElement(DailyScreen,{onBack:()=>{setShowDaily(false);setShowQuestsArrow(true);},setCurrencies,dailyDay,setDailyDay,dailyLastClaimed,setDailyLastClaimed});
  if(showNewPlayerGift) return React.createElement(NewPlayerGiftScreen,{onBack:()=>{
    setShowNewPlayerGift(false);
    if(autoChainToDaily){setAutoChainToDaily(false);setShowDaily(true);}
    else{setShowQuestsArrow(true);}
  }});
  if(showBattlepass) return React.createElement(BattlepassScreen,{onBack:()=>setShowBattlepass(false),setCurrencies,currencies,battlepassLastReset,setBattlepassLastReset,battlepassClaimed,setBattlepassClaimed,battlepassPaidClaimed,setBattlepassPaidClaimed,battlepassPremium,setBattlepassPremium,battlepassPoints});

  // height:100% -- .app-content is a plain block, so flex:1 alone never
  // stretched Home; the background scene below needs the full height.
  return React.createElement("div",{style:{flex:1,height:"100%",display:"flex",flexDirection:"column"}},
    React.createElement(ScreenHeader,{title:React.createElement("button",{
      onClick:()=>{if(!tutorialRestricted)setSettingsOpen(true);},
      style:{width:34,height:34,margin:"-5px 0",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#f5f5f5",fontSize:17,cursor:tutorialRestricted?"not-allowed":"pointer",opacity:tutorialRestricted?0.4:1,display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}
    },"⚙️"),right:React.createElement(React.Fragment,null,
      React.createElement(CurrencyChip,{emoji:"⚔️",value:currencies.equipShards}),
      React.createElement(CurrencyChip,{emoji:"🍖",value:currencies.food}),
      React.createElement(CurrencyChip,{emoji:"💎",value:currencies.gems})
    )}),
    // The Home scene: the whole area between the header and the nav bar. The
    // featured creature's equipped background art is shown WHOLE at the top
    // -- a HOME_ART square, never stretched -- with plain page below it. The
    // creature stands at HOME_FEET_TOP, the same spot on the art as on the
    // creature and Flair pages. A size container so those offsets resolve
    // against this area. The negative margins cancel the header's 12px bottom
    // margin (so the art meets the top bar) and .app-content's 16px side
    // padding (so it runs edge to edge).
    React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,position:"relative",margin:"-12px -16px 0",padding:16,overflow:"hidden",containerType:"size"}},
    homeBackdrop&&React.createElement("div",{style:{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:HOME_ART,height:HOME_ART,backgroundImage:'url("'+homeBackdrop+'")',backgroundSize:"100% 100%",pointerEvents:"none"}}),
    // The creature, with its equipped aura glowing behind it. No name, type,
    // flair title or Change button -- the display creature is picked in
    // Settings.
    // Each anchored by its bottom edge at HOME_FEET_TOP (translate -100%).
    auraDef&&React.createElement("div",{style:{position:"absolute",left:"50%",top:HOME_FEET_TOP,transform:"translate(-50%,-100%)",fontSize:160,lineHeight:1,opacity:0.18,pointerEvents:"none",userSelect:"none",filter:"blur(8px)"}},auraDef.emoji),
    React.createElement("div",{style:{position:"absolute",left:"50%",top:HOME_FEET_TOP,transform:"translate(-50%,-100%)",lineHeight:1,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.15))"}},
      def?React.createElement(CreatureIcon,{def,ownedData,unlockedSkins:unlockedSkins||[],size:120}):React.createElement("span",{style:{fontSize:120,lineHeight:1}},"🐣")),
    // The bottom panel: a soft lavender area starting exactly where the art
    // ends (never over it), holding the menu row -- Quests, Battle Pass,
    // Daily and the New Player Welcome Gift -- centred in it.
    React.createElement("div",{style:{position:"absolute",top:HOME_ART,left:0,right:0,bottom:0,background:"linear-gradient(180deg, #f6f4ff 0%, #f5f5f5 70%)",boxShadow:"0 -6px 18px rgba(0,0,0,0.10)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"0 16px"}},
      (!tutorialRestricted||dungeonRevealActive)&&React.createElement(React.Fragment,null,
        homeTile("📋","Quests","#EEEDFE",hasReadyQuest,()=>{setShowQuests(true);setShowQuestsArrow(false);},
          // Points down at Quests after the player finishes a Daily/New
          // Player Gift popup -- unlike the tutorial's arrows, this doesn't
          // lock anything else; it just sticks around until Quests itself is
          // tapped.
          !tutorialRestricted&&showQuestsArrow&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-36,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️")),
        homeTile("🎫","Battle Pass","#FFF3D6",false,()=>setShowBattlepass(true)),
        homeTile("📅","Daily","#E3F0FD",easternNoonDayKey()!==dailyLastClaimed,()=>setShowDaily(true)),
        newPlayerGiftDay<NEW_PLAYER_GIFT_REWARDS.length&&homeTile("🎁","New Player Welcome Gift","#FDE7EC",easternNoonDayKey()!==newPlayerGiftLastClaimed,()=>setShowNewPlayerGift(true))
      )
    ),
    // Stays hidden through the whole tutorial (not just before the "descend"
    // step) -- the Descend button itself is still shown/usable during that
    // step below, but the reward preview doesn't appear until the guided
    // walkthrough is fully over.
    SHOW_LABYRINTH_ENTRY&&!tutorialRestricted&&(()=>{
      const depth=labyrinthDepth||1;
      const reward=getDepthReward(depth);
      const onCurrent=Object.keys(reward).length>0;
      const next=onCurrent?null:nextRewardDepth(depth);
      const rewardEmoji=onCurrent?formatLabyrinthReward(reward):(next?formatLabyrinthReward(next.reward):null);
      if(!rewardEmoji)return null;
      const label=onCurrent?"Victory Reward:":"Floor "+next.depth+" Victory Reward:";
      return React.createElement("div",{style:{position:"fixed",left:"calc(75% - 8px)",transform:"translateX(-50%)",bottom:222,textAlign:"center",fontSize:13,fontWeight:700,color:"#d97706",background:"#fffbeb",border:"2px solid #fbbf24",borderRadius:12,padding:"6px 12px",boxShadow:"0 2px 8px rgba(217,119,6,0.15)",zIndex:5,lineHeight:1.35}},
        React.createElement("div",{style:{whiteSpace:"nowrap"}},label),
        React.createElement("div",{style:{whiteSpace:"nowrap"}},iconText(rewardEmoji))
      );
    })(),
    ((SHOW_LABYRINTH_ENTRY&&!tutorialRestricted)||tutorialStep==="descend")&&React.createElement("button",{
      onClick:()=>{setGameMode("labyrinth");setTab("play");if(tutorialStep==="descend")setTutorialStep("labyrinth");},
      style:{position:"fixed",left:"calc(75% - 52px)",bottom:130,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,width:88,height:88,borderRadius:24,border:"2px solid #818cf8",background:"#eef2ff",fontSize:32,fontWeight:700,color:"#4f46e5",cursor:"pointer",boxShadow:"0 4px 16px rgba(99,102,241,0.25)",zIndex:5}
    },
      "🌀",
      React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#4f46e5"}},"Descend"),
      React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#6366f1"}},"Floor "+(labyrinthDepth||1))
    ),
    tutorialRestricted&&tutorialStep==="collection"&&React.createElement("div",{style:{position:"fixed",left:16,right:16,bottom:150,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:6}},
      "Let's equip "+(def?def.name:"your creature")+" with the Iron Band you just got."
    ),
    tutorialRestricted&&tutorialStep==="collection"&&React.createElement("div",{style:{position:"fixed",left:COLLECTION_TAB_LEFT_PCT,bottom:80,transform:"translate(-50%,0)",fontSize:32,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
    tutorialRestricted&&tutorialStep==="descend"&&React.createElement("div",{style:{position:"fixed",left:16,right:16,bottom:300,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:6}},
      "You see a mysterious cave entrance that you didn't see before."
    ),
    tutorialRestricted&&tutorialStep==="descend"&&React.createElement("div",{style:{position:"fixed",left:"calc(75% - 8px)",bottom:226,transform:"translate(-50%,0)",fontSize:32,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️")
    )
  );
}

export default HomeScreen;
