// Debug/cheat panel, gated by DEV_MODE.

import React, { useState } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS } from "../../data/equipment.js";
import { FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS } from "../../data/flair.js";
import { MELON_TYPES } from "../../data/types.js";
import { DAILY_MISSIONS } from "../../data/quests.js";
import { makeOwnedCreature } from "../../core/creatures.js";
import { DEV_MODE } from "../../config.js";

function DevPanel(){
  const { currencies, setCurrencies, setOwned, setSkinShards, equipmentCopies, setEquipmentCopies, dailySelectedMissions, setDailyMissionsDone, dailyMissionsSnapshot, questState } = useGame();
  const [vals,setVals]=useState({gems:"1000",money:"500",food:"200",candy:"50",eggs:"5",legendaryEggs:"1",melonFire:"5",melonWater:"5",melonNature:"5",melonEarth:"5",melonWind:"5",melonElectric:"5",melonLight:"5",melonDark:"5",melonRainbow:"2",ascensionMelon:"1",shardId:"emberpup",shardAmt:"5",skinShards:"100",flairBanana:"5",mythicalFlairBanana:"5",ancientFlairBanana:"5"});
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
  function resetAll(){setOwned({});setCurrencies({gems:1500,food:100,candy:50,money:0,eggs:0,legendaryEggs:0,melonFire:5,melonWater:5,melonNature:5,melonEarth:5,melonWind:5,melonElectric:5,melonLight:5,melonDark:5,melonRainbow:2,flairBanana:500,mythicalFlairBanana:500,ancientFlairBanana:500,flairShard:0});setSkinShards(0);}

  function devRow(key,label){
    return React.createElement("div",{key,className:"dev-row"},
      React.createElement("span",{className:"dev-label"},label),
      React.createElement("input",{className:"dev-input",type:"number",value:vals[key]??""  ,onChange:e=>sv(key,e.target.value)}),
      React.createElement("button",{className:"dev-btn",onClick:()=>applySet(key)},"Set"),
      React.createElement("button",{className:"dev-btn",style:{background:"#3C3489"},onClick:()=>applyAdd(key)},"+Add")
    );
  }

  const devTabs=[{id:"general",label:"General"},{id:"eggs",label:"Eggs"},{id:"melons",label:"Melons"},{id:"bananas",label:"Bananas"},{id:"equipment",label:"Equip"},{id:"actions",label:"Actions"},{id:"daily",label:"Daily"},{id:"treasure",label:"Treasure"}];

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
      devRow("money","💰 Money"),
      devRow("equipShards","🔧 Gear Shards"),
      devRow("dungeonPass","🎟️ Dungeon Pass"),
      devRow("food","🍖 Food"),
      devRow("candy","🍬 Candy"),
      devRow("skinShards","🔮 Skin Shards"),
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
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8},onClick:()=>{
          const allFlairIds=[
            ...Object.values(FLAIR_TITLES).flat().map(t=>t.name),
            ...Object.values(FLAIR_AURAS).flat().map(e=>e.id),
            ...Object.values(FLAIR_BACKGROUNDS).flat().map(e=>e.id),
            ...Object.values(FLAIR_ITEMS).flat().map(e=>e.id),
          ];
          setOwned(prev=>Object.fromEntries(Object.entries(prev).map(([id,c])=>[id,{...c,unlockedFlair:allFlairIds}])));
        }},"Unlock all flair")
      ),
      React.createElement("div",{className:"dev-row"},
        React.createElement("button",{className:"dev-btn",style:{width:"100%",padding:8,background:"#A32D2D"},onClick:resetAll},"Reset everything")
      )
    )
  );
}



export default DevPanel;
