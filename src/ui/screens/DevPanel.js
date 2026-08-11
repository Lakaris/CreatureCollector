// Debug/cheat panel, gated by DEV_MODE.

import React, { useState } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION } from "../../data/equipment.js";
import { FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS } from "../../data/flair.js";
import { MELON_TYPES } from "../../data/types.js";
import { DAILY_MISSIONS, QUEST_DEFS } from "../../data/quests.js";
import { makeOwnedCreature, getChain, MAX_LEVEL, MAX_ASCENSION } from "../../core/creatures.js";
import { MAX_LABYRINTH_DEPTH } from "../../core/labyrinth.js";
import { FIELD_RATES } from "../../data/farm.js";
import { ARENA_TABS } from "../../data/bosses.js";
import { DEV_MODE } from "../../config.js";

const LABYRINTH_TIER_FLOORS=[1,1000,2000,3000,4000,5000];
const FARM_FIELD_MAX_LEVEL=FIELD_RATES.length-1;

function DevPanel(){
  const { currencies, setCurrencies, setOwned, setSkinShards, equipmentCopies, setEquipmentCopies, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, dailySelectedMissions, setDailyMissionsDone, dailyMissionsSnapshot, questState, labyrinthDepth, setLabyrinthDepth, setLabyrinthBestDepth, farmFieldLevel, setFarmFieldLevel, clearSave, setTutorialSeen, setTutorialRestricted, setTutorialStep, setTutorialPhase, setTutorialLine, setTutorialPostLine, setTutorialPickedCreatureId, setTutorialPlayerCell, setTab, setGameMode, setNewPlayerGiftDay, setNewPlayerGiftLastClaimed, setNewPlayerGiftDoubled, setDailyDay, setDailyLastClaimed, setDailyMissionsDate, setDailyMissionsSnapshot, setDailyCompletionClaimed, setDailySelectedMissions, setLastFreeBananaDate, setQuestBatchIdx, setClaimedQuests, questBatchIdx, claimedQuests, setFarmPlots, setFarmFieldLastHarvest, setFarmFieldSeed, setFarmCrops, setPlotUpgrades, setSpecialPurchased, setUnlockedSkins, setArenaLevels, setArenaProgress, setEggsHatched, setDungeonsCleared, setDungeonAutoFights, setArenaFights, setLabyrinthFights, setBananasUsed, setDailyBossFights, setPlotsGrown, setFieldHarvests, setPetLevelUps, setEquipLevelUps, setEverCompletedDailyQuests, setPlotsUnlocked, setDungeonsUnlocked, setDailyBossUnlocked, setArenaUnlocked, setTreasureUnlocked } = useGame();
  const [vals,setVals]=useState({gems:"1000",food:"200",candy:"50",eggs:"5",legendaryEggs:"1",melonFire:"5",melonWater:"5",melonNature:"5",melonEarth:"5",melonWind:"5",melonElectric:"5",melonLight:"5",melonDark:"5",melonRainbow:"2",ascensionMelon:"1",shardId:"emberpup",shardAmt:"5",skinShards:"100",flairBanana:"5",mythicalFlairBanana:"5",ancientFlairBanana:"5",labyrinthFloor:"1000",farmFieldLevel:"20",questSet:"1"});
  const [devTab,setDevTab]=useState("general");
  const [equipSubTab,setEquipSubTab]=useState("common");
  function sv(k,v){setVals(p=>({...p,[k]:v}));}
  function applyAdd(key){
    const n=parseInt(vals[key],10);if(isNaN(n))return;
    if(key==="skinShards"){setSkinShards(s=>Math.max(0,s+n));return;}
    setCurrencies(c=>({...c,[key]:Math.max(0,(c[key]||0)+n)}));
  }
  function applySet(key){
    const n=parseInt(vals[key],10);if(isNaN(n))return;
    if(key==="skinShards"){setSkinShards(Math.max(0,n));return;}
    setCurrencies(c=>({...c,[key]:Math.max(0,n)}));
  }
  function addShards(){
    const n=parseInt(vals.shardAmt,10)||1;
    const id=vals.shardId.trim();
    if(!CREATURE_MAP[id]){alert("Unknown creature ID: "+id);return;}
    setOwned(prev=>{
      if(!prev[id]){const e=makeOwnedCreature(CREATURE_MAP[id]);e.shards=n;return{...prev,[id]:e};}
      return{...prev,[id]:{...prev[id],shards:prev[id].shards+n}};
    });
  }
  function giveAll(){
    const all={};
    CREATURES.filter(c=>!c.evolutionOf).forEach(c=>{all[c.id]=makeOwnedCreature(c);});
    setOwned(all);
  }
  function skipTutorial(){setTutorialRestricted(false);setTutorialStep(null);setTutorialSeen(true);setTab("home");setLabyrinthBestDepth(d=>Math.max(d||1,21));setPlotsUnlocked(true);setDungeonsUnlocked(true);setDailyBossUnlocked(true);setArenaUnlocked(true);setTreasureUnlocked(true);}
  function triggerTutorial(){setTutorialRestricted(false);setTutorialStep(null);setTutorialSeen(false);setTutorialPhase("text");setTutorialLine(0);setTutorialPostLine(0);setTutorialPickedCreatureId(null);setTutorialPlayerCell(null);setTab("home");}
  // Jumps straight to the post-Set-1 "Dungeon reveal" hand-off (arrow at
  // Play, then at the Dungeon card) without replaying the intro narrative or
  // Progression Set 1 itself -- assumes Set 1 just completed, so it also
  // marks that set claimed and unlocks Dungeon + Daily Boss to match.
  function triggerTutorial2(){
    // Reaching Progression Set 1 in a real playthrough requires Play (and so
    // Dungeon/Arena) to already be unlocked, which is its own permanent gate
    // on Labyrinth depth, separate from the tutorial lock -- clear it too or
    // the "arrow at Play" hand-off dead-ends on that tab's own lock toast.
    setLabyrinthBestDepth(d=>Math.max(d||1,21));
    setQuestBatchIdx(prev=>({...prev,general:Math.max(prev.general||0,1)}));
    setDungeonsUnlocked(true);
    setDailyBossUnlocked(true);
    setTutorialSeen(true);
    setTutorialRestricted(true);
    setTutorialStep("dungeonReveal");
    setGameMode(null);
    setTab("home");
  }
  function resetAll(){setOwned({});setCurrencies({gems:0,food:0,candy:0,eggs:0,legendaryEggs:0,melonFire:0,melonWater:0,melonNature:0,melonEarth:0,melonWind:0,melonElectric:0,melonLight:0,melonDark:0,melonRainbow:0,flairBanana:0,mythicalFlairBanana:0,ancientFlairBanana:0,flairShard:0});setSkinShards(0);setEquipmentCopies({});setEquipmentLevels({});setEquipmentAscensions({});setTutorialSeen(false);setTutorialRestricted(false);setTutorialStep(null);setTutorialPhase("text");setTutorialLine(0);setTutorialPostLine(0);setTutorialPickedCreatureId(null);setTutorialPlayerCell(null);setTab("home");setLabyrinthDepth(1);setLabyrinthBestDepth(1);setNewPlayerGiftDay(0);setNewPlayerGiftLastClaimed(null);setNewPlayerGiftDoubled(false);setDailyDay(0);setDailyLastClaimed(null);setDailyMissionsDate(null);setDailyMissionsSnapshot({eggsHatched:0,dungeonsCleared:0,arenaFights:0,bananasUsed:0,dailyBossFights:0,plotsGrown:0,labyrinthFights:0,fieldHarvests:0,currencies:{}});setDailyMissionsDone(new Set());setDailyCompletionClaimed(false);setDailySelectedMissions([]);setLastFreeBananaDate(null);setQuestBatchIdx({general:0,creature:0,gear:0,dungeon:0,arena:0});setClaimedQuests(new Set());setFarmFieldLevel(1);setFarmPlots(1);setFarmFieldLastHarvest(Date.now());setFarmFieldSeed((Math.random()*1e9)|0);setFarmCrops(Array(6).fill(null));setPlotUpgrades(Array(6).fill(0));setSpecialPurchased(false);
    // Quest batchIdx/claimed alone aren't enough -- every check()/progress()
    // in data/quests.js reads these live counters, so they have to reset too
    // or a "completed" quest stays completed even after its set rewinds.
    setUnlockedSkins([]);setArenaLevels(Object.fromEntries(ARENA_TABS.map(t=>[t.id,1])));setArenaProgress(Object.fromEntries(ARENA_TABS.map(t=>[t.id,1])));
    setEggsHatched(0);setDungeonsCleared(0);setDungeonAutoFights(0);setArenaFights(0);setLabyrinthFights(0);setBananasUsed(0);setDailyBossFights(0);setPlotsGrown(0);setFieldHarvests(0);setPetLevelUps(0);setEquipLevelUps(0);setEverCompletedDailyQuests(false);
    setPlotsUnlocked(false);setDungeonsUnlocked(false);setDailyBossUnlocked(false);setArenaUnlocked(false);setTreasureUnlocked(false);
    clearSave();}

  function giveMaxInvestedCreatures(){
    const all={};
    CREATURES.filter(c=>!c.evolutionOf).forEach(c=>{
      const chain=getChain(c.id);
      const finalDef=CREATURE_MAP[chain[chain.length-1]];
      const e=makeOwnedCreature(finalDef);
      e.level=MAX_LEVEL;
      e.ascensions=MAX_ASCENSION;
      e.abilityLevels={basic:5,special:5,unique:5};
      e.unlockedFlair=[];
      all[finalDef.id]=e;
    });
    setOwned(all);
  }
  // Satisfies every quest check() across every QUEST_DEFS category's current
  // batch (general/creature/gear/dungeon/arena) -- generous creatures,
  // currencies, and counters -- WITHOUT touching claimedQuests or granting
  // any reward, so quests show as ready-to-claim but stay unclaimed.
  function completeCurrentQuests(){
    giveMaxInvestedCreatures();
    const legendaryDef=CREATURES.find(c=>c.rarity==="legendary");
    setOwned(prev=>{
      const next={...prev};
      if(legendaryDef&&!next[legendaryDef.id]){
        next[legendaryDef.id]=makeOwnedCreature(legendaryDef);
        next[legendaryDef.id].level=MAX_LEVEL;
      }
      Object.keys(next).slice(0,5).forEach(id=>{next[id]={...next[id],equipped:["com_hp_atk",null,null,null]};});
      return next;
    });
    setEquipmentCopies(prev=>({...prev,com_hp_atk:Math.max(prev.com_hp_atk||0,5)}));
    setCurrencies(c=>({...c,gems:Math.max(c.gems||0,999999),equipShards:Math.max(c.equipShards||0,999999),dungeonPass:Math.max(c.dungeonPass||0,999)}));
    setEggsHatched(c=>Math.max(c,999));
    setBananasUsed(c=>Math.max(c,999));
    setEquipLevelUps(c=>Math.max(c,999));
    setPetLevelUps(c=>Math.max(c,999));
    setDungeonsCleared(c=>Math.max(c,999));
    setDungeonAutoFights(c=>Math.max(c,999));
    setLabyrinthBestDepth(c=>Math.max(c||1,999));
    setEverCompletedDailyQuests(true);
    setUnlockedSkins(prev=>prev&&prev.length?prev:["dev_dummy_skin"]);
    setArenaProgress(Object.fromEntries(ARENA_TABS.map(t=>[t.id,999])));
    setArenaLevels(Object.fromEntries(ARENA_TABS.map(t=>[t.id,999])));
  }
  function giveMaxGear(){
    const lvl={},asc={};
    EQUIPMENT_DEFS.forEach(item=>{lvl[item.id]=EQUIP_MAX_LEVEL;asc[item.id]=EQUIP_MAX_ASCENSION;});
    setEquipmentLevels(prev=>({...prev,...lvl}));
    setEquipmentAscensions(prev=>({...prev,...asc}));
    setEquipmentCopies(prev=>{const n={...prev};EQUIPMENT_DEFS.forEach(item=>{if(!(n[item.id]>0))n[item.id]=1;});return n;});
  }
  function jumpToFloor(n){
    const d=Math.max(1,Math.min(MAX_LABYRINTH_DEPTH,n));
    setLabyrinthDepth(d);
    setLabyrinthBestDepth(b=>Math.max(b||1,d));
  }
  function jumpToQuestSet(n){
    const target=Math.max(1,Math.min(QUEST_DEFS.general.length,n))-1;
    const current=questBatchIdx.general||0;
    if(target<current){
      // Going back to an earlier set resets progress: unclaim every quest
      // from that set onward so it plays through fresh again.
      const idsToClear=new Set();
      for(let i=target;i<QUEST_DEFS.general.length;i++){
        QUEST_DEFS.general[i].quests.forEach(q=>idsToClear.add(q.id));
      }
      setClaimedQuests(prev=>new Set([...prev].filter(id=>!idsToClear.has(id))));
    }
    setQuestBatchIdx(prev=>({...prev,general:target}));
  }
  function giveMaxFlair(){
    const allFlairIds=[
      ...Object.values(FLAIR_TITLES).flat().map(t=>t.name),
      ...Object.values(FLAIR_AURAS).flat().map(e=>e.id),
      ...Object.values(FLAIR_BACKGROUNDS).flat().map(e=>e.id),
      ...Object.values(FLAIR_ITEMS).flat().map(e=>e.id),
    ];
    setOwned(prev=>Object.fromEntries(Object.entries(prev).map(([id,c])=>[id,{...c,unlockedFlair:allFlairIds}])));
  }

  function devRow(key,label){
    return React.createElement("div",{key,className:"dev-row"},
      React.createElement("span",{className:"dev-label"},label),
      React.createElement("input",{className:"dev-input",type:"number",value:vals[key]??""  ,onChange:e=>sv(key,e.target.value)}),
      React.createElement("button",{className:"dev-btn",onClick:()=>applySet(key)},"Set"),
      React.createElement("button",{className:"dev-btn",style:{background:"#3C3489"},onClick:()=>applyAdd(key)},"+Add")
    );
  }

  const devTabs=[{id:"general",label:"General"},{id:"eggs",label:"Eggs"},{id:"melons",label:"Melons"},{id:"bananas",label:"Bananas"},{id:"equipment",label:"Equip"},{id:"labyrinth",label:"Labyrinth"},{id:"actions",label:"Actions"},{id:"daily",label:"Daily"},{id:"treasure",label:"Treasure"}];

  return React.createElement("div",{className:"dev-panel"},
    React.createElement("div",{className:"dev-title"},
      React.createElement("i",{className:"ti ti-terminal",style:{fontSize:16}}),"Dev tools — set DEV_MODE=false to hide"
    ),
    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:10,background:"#2a2a3e",borderRadius:8,padding:4}},
      devTabs.map(t=>React.createElement("button",{key:t.id,onClick:()=>setDevTab(t.id),style:{
        flex:1,padding:"5px 0",fontSize:11,fontWeight:700,border:"none",borderRadius:6,cursor:"pointer",
        background:devTab===t.id?"#534AB7":"transparent",color:devTab===t.id?"#fff":"#aaa"
      }},t.label))
    ),
    devTab==="general"&&React.createElement(React.Fragment,null,
      devRow("gems","💎 Gems"),
      devRow("equipShards","🔧 Gear Shards"),
      devRow("dungeonPass","🎟️ Dungeon Pass"),
      devRow("food","🍖 Food"),
      devRow("candy","🍬 Candy"),
      devRow("skinShards","🔮 Skin Shards"),
      devRow("ancientFertilizer","🪴 Ancient Fertilizer"),
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{className:"dev-label"},"🔶 Shards"),
        React.createElement("input",{className:"dev-input",type:"text",value:vals.shardId,onChange:e=>sv("shardId",e.target.value),placeholder:"creature id"}),
        React.createElement("input",{className:"dev-input",type:"number",value:vals.shardAmt,onChange:e=>sv("shardAmt",e.target.value),style:{width:50}}),
        React.createElement("button",{className:"dev-btn",onClick:addShards},"Add")
      )
    ),
    devTab==="eggs"&&React.createElement(React.Fragment,null,
      devRow("eggs","🥚 Eggs"),
      devRow("legendaryEggs","🥚✨ Leg. Eggs")
    ),
    devTab==="melons"&&React.createElement(React.Fragment,null,
      ...MELON_TYPES.map(m=>devRow(m.key,m.emoji+" "+m.label))
    ),
    devTab==="bananas"&&React.createElement(React.Fragment,null,
      devRow("flairBanana","🍌 Flair Banana"),
      devRow("mythicalFlairBanana","🍌✨ Mythical Flair Banana"),
      devRow("ancientFlairBanana","🍌🏺 Ancient Flair Banana"),
      devRow("flairShard","🔷 Flair Shard")
    ),
    devTab==="equipment"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:()=>{
          setEquipmentCopies(prev=>{const n={...prev};EQUIPMENT_DEFS.forEach(item=>{if(!(n[item.id]>0))n[item.id]=1;});return n;});
        }},"Unlock all equipment (1 copy each)")
      ),
      React.createElement("div",{style:{display:"flex",gap:3,margin:"6px 0 8px",background:"#2a2a3e",borderRadius:8,padding:3}},
        ["common","rare","epic","legendary"].map(r=>
          React.createElement("button",{key:r,onClick:()=>setEquipSubTab(r),style:{
            flex:1,padding:"4px 0",fontSize:10,fontWeight:700,border:"none",borderRadius:6,cursor:"pointer",textTransform:"capitalize",
            background:equipSubTab===r?EQUIP_RARITY_CONFIG[r].bg:"transparent",
            color:equipSubTab===r?EQUIP_RARITY_CONFIG[r].color:"#aaa"
          }},r)
        )
      ),
      EQUIPMENT_DEFS.filter(item=>item.rarity===equipSubTab).map(item=>
        React.createElement("div",{key:item.id,className:"dev-row"},
          React.createElement("span",{className:"dev-label"},item.emoji+" "+item.name),
          React.createElement("span",{style:{fontSize:11,color:"#aaa",marginRight:4}},(equipmentCopies[item.id]||0)+" copies"),
          React.createElement("button",{className:"dev-btn",onClick:()=>setEquipmentCopies(prev=>({...prev,[item.id]:(prev[item.id]||0)+1}))},"+1"),
          React.createElement("button",{className:"dev-btn",onClick:()=>setEquipmentCopies(prev=>({...prev,[item.id]:(prev[item.id]||0)+5}))},"+5")
        )
      )
    ),
    devTab==="labyrinth"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{className:"dev-label"},"Current: Floor "+(labyrinthDepth||1))
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{className:"dev-label"},"🌀 Jump to Floor"),
        React.createElement("input",{className:"dev-input",type:"number",value:vals.labyrinthFloor,onChange:e=>sv("labyrinthFloor",e.target.value),style:{width:70}}),
        React.createElement("button",{className:"dev-btn",onClick:()=>{const n=parseInt(vals.labyrinthFloor,10);if(!isNaN(n))jumpToFloor(n);}},"Jump")
      ),
      React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}},
        LABYRINTH_TIER_FLOORS.map(f=>React.createElement("button",{key:f,className:"dev-btn",onClick:()=>jumpToFloor(f)},"Floor "+f))
      ),
      React.createElement("div",{className:"dev-row",style:{marginTop:10}},
        React.createElement("span",{className:"dev-label"},"🌾 Set Field Level (current "+(farmFieldLevel||1)+"/"+FARM_FIELD_MAX_LEVEL+")"),
        React.createElement("input",{className:"dev-input",type:"number",value:vals.farmFieldLevel,onChange:e=>sv("farmFieldLevel",e.target.value),style:{width:60}}),
        React.createElement("button",{className:"dev-btn",onClick:()=>{const n=parseInt(vals.farmFieldLevel,10);if(!isNaN(n))setFarmFieldLevel(Math.max(0,Math.min(FARM_FIELD_MAX_LEVEL,n)));}},"Set")
      )
    ),
    devTab==="daily"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:()=>{
          const snap=dailyMissionsSnapshot||{};
          const qs=questState||{};
          const ids=(dailySelectedMissions&&dailySelectedMissions.length>0?dailySelectedMissions:DAILY_MISSIONS.map(m=>m.id));
          const missions=DAILY_MISSIONS.filter(m=>ids.includes(m.id));
          setDailyMissionsDone(new Set(missions.map(m=>m.id)));
        }},"Complete all daily missions")
      ),
      React.createElement("div",{className:"dev-row",style:{marginTop:10}},
        React.createElement("span",{className:"dev-label"},"📋 Progression Set (current "+((questBatchIdx.general||0)+1)+"/"+QUEST_DEFS.general.length+")"),
        React.createElement("input",{className:"dev-input",type:"number",value:vals.questSet,onChange:e=>sv("questSet",e.target.value),style:{width:60}}),
        React.createElement("button",{className:"dev-btn",onClick:()=>{const n=parseInt(vals.questSet,10);if(!isNaN(n))jumpToQuestSet(n);}},"Jump")
      )
    ),
    devTab==="treasure"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{style:{color:"#aaa",fontSize:12}},"Mysterious Ore"),
        React.createElement("div",{style:{display:"flex",gap:4}},
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,mysteriousOre:(c.mysteriousOre||0)+1}))},"+1"),
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,mysteriousOre:(c.mysteriousOre||0)+10}))},"+10")
        )
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{style:{color:"#aaa",fontSize:12}},"Deluxe Ore"),
        React.createElement("div",{style:{display:"flex",gap:4}},
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,deluxeOre:(c.deluxeOre||0)+1}))},"+1"),
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,deluxeOre:(c.deluxeOre||0)+10}))},"+10")
        )
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("span",{style:{color:"#aaa",fontSize:12}},"Rainbow Ore"),
        React.createElement("div",{style:{display:"flex",gap:4}},
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,rainbowOre:(c.rainbowOre||0)+1}))},"+1"),
          React.createElement("button",{className:"dev-btn",onClick:()=>setCurrencies(c=>({...c,rainbowOre:(c.rainbowOre||0)+10}))},"+10")
        )
      )
    ),
    devTab==="actions"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:giveAll},"Give all base creatures")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:giveMaxInvestedCreatures},
          "Give all creatures max invested (Lv "+MAX_LEVEL+", abilities Lv 5, "+MAX_ASCENSION+" ascensions, no flair)")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:giveMaxGear},
          "Max all gear (Lv "+EQUIP_MAX_LEVEL+", "+EQUIP_MAX_ASCENSION+" ascensions)")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:giveMaxFlair},"Unlock all flair (max flair)")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:completeCurrentQuests},
          "Complete current quests in every tab (doesn't claim rewards)")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:skipTutorial},"Skip tutorial")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:triggerTutorial},"Trigger tutorial")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:triggerTutorial2},"Trigger tutorial 2 (Dungeon reveal)")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8,background:"#A32D2D"},onClick:resetAll},"Reset everything")
      )
    )
  );
}



export default DevPanel;
