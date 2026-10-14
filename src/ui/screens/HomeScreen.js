// Home tab: featured creature plus entries into quests, daily, and battle pass.

import React from "../../react.js";
import { iconText } from "../components/IconText.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { FLAIR_AURA_MAP, backdropImage } from "../../data/flair.js";
import { QUEST_DEFS } from "../../data/quests.js";
import CreatureIcon from "../../ui/components/CreatureIcon.js";
import BattlepassScreen from "../../ui/screens/BattlepassScreen.js";
import QuestsScreen from "../../ui/screens/QuestsScreen.js";
import DailyScreen, { dailyRewardWaiting } from "../../ui/screens/DailyScreen.js";
import NewPlayerGiftScreen, { newPlayerGiftGone } from "../../ui/screens/NewPlayerGiftScreen.js";
import ScreenHeader, { CurrencyChip } from "../../ui/components/ScreenHeader.js";
import { getDepthReward, nextRewardDepth, formatLabyrinthReward } from "../../core/labyrinth.js";
import { easternNoonDayKey } from "../../core/dates.js";
import { TABS } from "../../ui/components/NavBar.js";

// Percent, not vw: these overlays are position:fixed inside the scaled app
// (see ui/uiScale.js), so a percentage tracks the nav bar they point at while
// a viewport unit would drift away from it as the screen changes.
const COLLECTION_TAB_LEFT_PCT = ((TABS.findIndex(t=>t.id==="collection")+0.5)/TABS.length)*100+"%";


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
  const { owned, unlockedSkins, featuredCreatureId, setFeaturedCreatureId, questState, questBatchIdx, setQuestBatchIdx, setCurrencies, claimedQuests, setClaimedQuests, dailyDay, setDailyDay, dailyLastClaimed, setDailyLastClaimed, dailyClaimed, newPlayerGiftDay, setNewPlayerGiftDay, newPlayerGiftLastClaimed, setNewPlayerGiftLastClaimed, newPlayerGiftEndsAt, currencies, battlepassLastReset, setBattlepassLastReset, battlepassClaimed, setBattlepassClaimed, battlepassPaidClaimed, setBattlepassPaidClaimed, battlepassPremium, setBattlepassPremium, battlepassPoints, setBattlepassPoints, dailyMissionsDate, setDailyMissionsDate, dailyMissionsSnapshot, setDailyMissionsSnapshot, dailyMissionsDone, setDailyMissionsDone, dailyCompletionClaimed, setDailyCompletionClaimed, dailySelectedMissions, setDailySelectedMissions, setSettingsOpen, setTab, setGameMode, labyrinthDepth, tutorialRestricted, setTutorialRestricted, tutorialStep, setTutorialStep, postTutorialPopupPending, setPostTutorialPopupPending, showQuestsArrow, setShowQuestsArrow, pendingDungeonReveal, setPendingDungeonReveal } = useGame();
  const [showQuests,setShowQuests]=React.useState(false);
  const [showDaily,setShowDaily]=React.useState(false);
  const [showNewPlayerGift,setShowNewPlayerGift]=React.useState(false);
  const [showBattlepass,setShowBattlepass]=React.useState(false);
  // Ticks once a second while the Welcome Gift's 24-hour countdown is running,
  // for the timer above its button (and to take the button away at zero).
  const [now,setNow]=React.useState(()=>Date.now());
  const giftCountingDown=newPlayerGiftEndsAt!=null&&now<newPlayerGiftEndsAt;
  React.useEffect(()=>{
    if(!giftCountingDown)return;
    const t=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(t);
  },[giftCountingDown]);
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
  // `sub` is a small second line under the label (Descend's floor); `active`
  // overrides the tutorial lock for the one tile a tutorial step points at.
  const homeTile=(emoji,label,tint,dot,onClick,extra,{sub=null,active=!tutorialRestricted}={})=>React.createElement("button",{
    key:label,
    onClick:()=>{if(!active)return;onClick();},
    style:{position:"relative",flex:1,maxWidth:86,minHeight:96,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",gap:7,padding:"12px 4px 10px",border:"none",borderRadius:18,background:"#fff",boxShadow:"0 2px 10px rgba(83,74,183,0.10)",fontFamily:"inherit",cursor:active?"pointer":"not-allowed",opacity:active?1:0.4}
  },
    React.createElement("span",{style:{width:44,height:44,borderRadius:"50%",background:tint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,lineHeight:1,flexShrink:0}},emoji),
    React.createElement("span",{style:{fontSize:10.5,fontWeight:700,color:"#3f3a78",textAlign:"center",lineHeight:1.15}},label,
      sub&&React.createElement("span",{style:{display:"block",fontSize:9.5,fontWeight:600,color:"#6366f1",marginTop:2}},sub)),
    dot&&React.createElement("div",{style:{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:"#ef4444",border:"2px solid #fff",boxSizing:"border-box"}}),
    extra
  );
  // A small round button in the top bar (Settings, Daily). Dimmed and inert
  // while the tutorial restricts Home. The red dot sits on its corner.
  const topBarButton=(emoji,label,dot,onClick)=>React.createElement("button",{
    key:label,"aria-label":label,title:label,
    onClick:()=>{if(!tutorialRestricted)onClick();},
    style:{position:"relative",width:34,height:34,margin:"-5px 0",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#f5f5f5",fontSize:17,cursor:tutorialRestricted?"not-allowed":"pointer",opacity:tutorialRestricted?0.4:1,display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1,flexShrink:0}
  },
    emoji,
    dot&&React.createElement("div",{style:{position:"absolute",top:-2,right:-2,width:11,height:11,borderRadius:"50%",background:"#ef4444",border:"2px solid #fff",boxSizing:"border-box"}})
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
  // Descend: the way into the Labyrinth, with the floor the player is on.
  // Live during the tutorial's "descend" step (and carrying its guide arrow),
  // dimmed like its neighbours through the rest of the tutorial.
  const descendStep=tutorialStep==="descend";
  // The Labyrinth's next Victory Reward, as a small card perched on top of the
  // Descend tile and never wider than it: this floor's reward if it pays one,
  // otherwise the next floor that does. Each reward stays whole on its own
  // line-break unit, so a two-item reward wraps between items, not inside one.
  // Hidden through the whole tutorial.
  const descendReward=(()=>{
    if(tutorialRestricted)return null;
    const depth=labyrinthDepth||1;
    const here=getDepthReward(depth);
    const onCurrent=Object.keys(here).length>0;
    const next=onCurrent?null:nextRewardDepth(depth);
    const reward=onCurrent?here:next?.reward;
    if(!reward)return null;
    return React.createElement("div",{style:{position:"absolute",left:0,right:0,bottom:"calc(100% + 6px)",boxSizing:"border-box",textAlign:"center",background:"#fffbeb",border:"1.5px solid #fbbf24",borderRadius:10,padding:"3px 4px 4px",boxShadow:"0 2px 6px rgba(217,119,6,0.15)",lineHeight:1.25}},
      React.createElement("div",{style:{fontSize:9,fontWeight:700,color:"#b45309"}},onCurrent?"Victory Reward":"Floor "+next.depth+" Reward"),
      React.createElement("div",{style:{fontSize:11.5,fontWeight:700,color:"#d97706"}},
        formatLabyrinthReward(reward).split(/ (?=\S+ \d)/).map((item,i)=>React.createElement("span",{key:i,style:{display:"inline-block",whiteSpace:"nowrap",margin:"0 2px"}},iconText(item))))
    );
  })();
  // The Welcome Gift leaves Home for good 24 hours after its 10th day's reward
  // is claimed; until then a small timer card perches on its button, the same
  // shape as Descend's reward card and never wider than the button.
  const giftGone=newPlayerGiftGone(newPlayerGiftEndsAt,now);
  const giftCountdown=giftCountingDown&&!tutorialRestricted&&(()=>{
    const s=Math.max(0,Math.ceil((newPlayerGiftEndsAt-now)/1000));
    const pad=n=>String(n).padStart(2,"0");
    return React.createElement("div",{style:{position:"absolute",left:0,right:0,bottom:"calc(100% + 6px)",boxSizing:"border-box",textAlign:"center",background:"#fff1f2",border:"1.5px solid #fda4af",borderRadius:10,padding:"3px 4px 4px",boxShadow:"0 2px 6px rgba(225,29,72,0.15)",lineHeight:1.25}},
      React.createElement("div",{style:{fontSize:9,fontWeight:700,color:"#be123c"}},"Ends in"),
      React.createElement("div",{style:{fontSize:11.5,fontWeight:800,color:"#e11d48",fontVariantNumeric:"tabular-nums"}},pad(Math.floor(s/3600))+":"+pad(Math.floor(s%3600/60))+":"+pad(s%60))
    );
  })();
  const descendTile=homeTile("🌀","Descend","#EEF2FF",false,
    ()=>{setGameMode("labyrinth");setTab("play");if(descendStep)setTutorialStep("labyrinth");},
    React.createElement(React.Fragment,null,
      descendStep&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-36,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
      descendReward),
    {sub:"Floor "+(labyrinthDepth||1),active:!tutorialRestricted||descendStep});
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
    React.createElement(ScreenHeader,{title:"",left:React.createElement(React.Fragment,null,
      topBarButton("⚙️","Settings",false,()=>setSettingsOpen(true)),
      // The Daily reward sits up here as a small button rather than a tile in
      // the menu row (Descend took its place there); its red dot still shows
      // while a reward is waiting to be claimed (see dailyRewardWaiting).
      topBarButton("📅","Daily",dailyRewardWaiting({dailyDay,dailyLastClaimed,dailyClaimed}),()=>setShowDaily(true))
    ),right:React.createElement(React.Fragment,null,
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
    // Descend and the New Player Welcome Gift -- centred in it.
    React.createElement("div",{style:{position:"absolute",top:HOME_ART,left:0,right:0,bottom:0,background:"linear-gradient(180deg, #f6f4ff 0%, #f5f5f5 70%)",boxShadow:"0 -6px 18px rgba(0,0,0,0.10)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"0 16px"}},
      // The tutorial's "descend" step shows Descend alone, live, with the
      // guide arrow on it -- the step walks the player through that button.
      tutorialStep==="descend"&&descendTile,
      // Its message sits above the tile, clear of the arrow bouncing on it:
      // the tile is centred in this panel, 96px tall, its arrow 36px above it.
      tutorialRestricted&&tutorialStep==="descend"&&React.createElement("div",{style:{position:"absolute",left:16,right:16,bottom:"calc(50% + 48px + 46px)",background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:6}},
        "You see a mysterious cave entrance that you didn't see before."
      ),
      (!tutorialRestricted||dungeonRevealActive)&&tutorialStep!=="descend"&&React.createElement(React.Fragment,null,
        homeTile("📋","Quests","#EEEDFE",hasReadyQuest,()=>{setShowQuests(true);setShowQuestsArrow(false);},
          // Points down at Quests after the player finishes a Daily/New
          // Player Gift popup -- unlike the tutorial's arrows, this doesn't
          // lock anything else; it just sticks around until Quests itself is
          // tapped.
          !tutorialRestricted&&showQuestsArrow&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-36,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️")),
        homeTile("🎫","Battle Pass","#FFF3D6",false,()=>setShowBattlepass(true)),
        descendTile,
        !giftGone&&homeTile("🎁","New Player Welcome Gift","#FDE7EC",easternNoonDayKey()!==newPlayerGiftLastClaimed,()=>setShowNewPlayerGift(true),giftCountdown)
      )
    ),
    tutorialRestricted&&tutorialStep==="collection"&&React.createElement("div",{style:{position:"fixed",left:16,right:16,bottom:150,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:6}},
      "Let's equip "+(def?def.name:"your creature")+" with the Iron Band you just got."
    ),
    tutorialRestricted&&tutorialStep==="collection"&&React.createElement("div",{style:{position:"fixed",left:COLLECTION_TAB_LEFT_PCT,bottom:80,transform:"translate(-50%,0)",fontSize:32,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️")
    )
  );
}

export default HomeScreen;
