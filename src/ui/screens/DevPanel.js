// Debug/cheat panel, gated by DEV_MODE.

import React, { useState } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION } from "../../data/equipment.js";
import { FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS } from "../../data/flair.js";
import { MELON_TYPES } from "../../data/types.js";
import { DAILY_MISSIONS } from "../../data/quests.js";
import { makeOwnedCreature, getChain, MAX_LEVEL, MAX_ASCENSION } from "../../core/creatures.js";
import { MAX_LABYRINTH_DEPTH } from "../../core/labyrinth.js";
import { FIELD_RATES } from "../../data/farm.js";
import { DEV_MODE } from "../../config.js";

const LABYRINTH_TIER_FLOORS=[1,1000,2000,3000,4000,5000];
const FARM_FIELD_MAX_LEVEL=FIELD_RATES.length-1;

function DevPanel(){
  const { currencies, setCurrencies, setOwned, setSkinShards, equipmentCopies, setEquipmentCopies, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, dailySelectedMissions, setDailyMissionsDone, dailyMissionsSnapshot, questState, labyrinthDepth, setLabyrinthDepth, setLabyrinthBestDepth, farmFieldLevel, setFarmFieldLevel, clearSave } = useGame();
  const [vals,setVals]=useState({gems:"1000",food:"200",candy:"50",eggs:"5",legendaryEggs:"1",melonFire:"5",melonWater:"5",melonNature:"5",melonEarth:"5",melonWind:"5",melonElectric:"5",melonLight:"5",melonDark:"5",melonRainbow:"2",ascensionMelon:"1",shardId:"emberpup",shardAmt:"5",skinShards:"100",flairBanana:"5",mythicalFlairBanana:"5",ancientFlairBanana:"5",labyrinthFloor:"1000",farmFieldLevel:"20"});
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
  function resetAll(){setOwned({});setCurrencies({gems:1500,food:100,candy:50,eggs:0,legendaryEggs:0,melonFire:5,melonWater:5,melonNature:5,melonEarth:5,melonWind:5,melonElectric:5,melonLight:5,melonDark:5,melonRainbow:2,flairBanana:500,mythicalFlairBanana:500,ancientFlairBanana:500,flairShard:0});setSkinShards(0);clearSave();}

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
      ...MELON_TYPES.map(m=>devRow(m.key,m.label))
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
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8,background:"#A32D2D"},onClick:resetAll},"Reset everything")
      )
    )
  );
}



export default DevPanel;
