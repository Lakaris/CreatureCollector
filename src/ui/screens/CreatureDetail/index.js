// Creature detail screen: stats, levelling, evolution, equipment, and the skin/flair tabs.

import React, { useState, useEffect, useRef } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURE_MAP } from "../../../data/creatures.js";
import { RARITY_CONFIG, STAT_CYCLE, CORE_STAT_CYCLE, LEVEL_STAT_CYCLE, STAT_LABELS, STAT_DESCRIPTIONS } from "../../../data/rarity.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS, EQUIPMENT_MAP, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION, EQUIP_ASC_COSTS } from "../../../data/equipment.js";
import { BUFF_STAT_LABEL, FLAIR_TITLE_MAP, FLAIR_AURA_MAP, FLAIR_BG_MAP, FLAIR_ITEM_MAP } from "../../../data/flair.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../../data/types.js";
import { getRootDef, getChain, makeOwnedCreature, calcStats, getDisplayEmoji, energyCost, MAX_LEVEL, MAX_ASCENSION } from "../../../core/creatures.js";
import { equipUpgradeCost, equipBonus, equipBonusStr, itemAffectsStat } from "../../../core/equipment.js";
import { formatAbilityStep, extractHeal, ABILITY_TAG_DEFS, getAbilityTags, formatStarlitAbilityLevel, isStarlitAbilityLine, getAbilityStatBonus } from "../../../core/abilityText.js";
import { getMelonLabel, getMelonAvailable, deductMelon } from "../../../core/melons.js";
import AscStars from "../../../ui/components/AscStars.js";
import StatBar from "../../../ui/components/StatBar.js";
import PipRow from "../../../ui/components/PipRow.js";
import Notify from "../../../ui/components/Notify.js";
import SkinSection from "../../../ui/screens/CreatureDetail/SkinSection.js";
import AscensionPopup from "../../../ui/screens/CreatureDetail/AscensionPopup.js";
import FlairSection from "../../../ui/screens/CreatureDetail/FlairSection.js";
import ScreenHeader from "../../../ui/components/ScreenHeader.js";

// Must match TUTORIAL_ITEM_ID in TutorialOverlay.js -- the item the tutorial's
// guided walkthrough points the player at equipping.
const TUTORIAL_ITEM_ID="com_hp_atk";
// The level-up detour only requires a single level-up before advancing --
// the guided harvest's fixed food amount isn't guaranteed to afford more
// than that (it doesn't scale with the food-cost curve in core/creatures.js),
// so requiring more than one risks softlocking the tutorial.

/** Equipped-slot stat bonuses, one stat per line (unlike equipBonusStr's "·"-joined string). */
function equipBonusLines(bonuses){
  return Object.entries(bonuses).map(([s,v])=>"+"+v+" "+STAT_LABELS[s]);
}

/** Percent-of-base gain for a stat bonus (equip effect / flair / ability). Speed and Haste are
 * allowed to be fractional (e.g. 20% of a base-1 stat is 0.2, not rounded up to 1); every other
 * stat stays a whole number since they're discrete counts in the UI. */
function statPctGain(stat,base,pct){
  const raw=base*pct/100;
  if(stat==="spd"||stat==="abilitySpeed")return Math.round(raw*10)/10;
  return Math.ceil(raw);
}

/** Sums every flair buff's raw (unrounded) contribution to a stat before rounding once,
 * so a pile of small percentages (e.g. many 0.2% Speed flairs) doesn't get zeroed out by
 * rounding each source individually. */
function flairStatGain(stat,base,buffs){
  const raw=buffs.filter(b=>b.stat===stat).reduce((acc,b)=>acc+base*b.pct/100,0);
  if(stat==="spd"||stat==="abilitySpeed")return Math.round(raw*10)/10;
  return Math.ceil(raw);
}

function CreatureDetail({ownedData,onBack,onEvolve,onBananaUsed}){
  const { owned, currencies, setCurrencies, setOwned, unlockedSkins, setUnlockedSkins, skinShards, setSkinShards, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, equipmentCopies, setEquipmentCopies, equipFavorites, setEquipFavorites, setDexOverlay, tutorialRestricted, tutorialStep, setTutorialStep, setPetLevelUps, setEquipLevelUps, flairGuideStep, setFlairGuideStep } = useGame();
  // "slot"/"item" cover the whole guided equip flow (creature page -> slot
  // picker); "item" narrows further to the picker itself, where only the
  // Iron Band tile should respond so the pointer arrow isn't a red herring.
  // "farm" is the hand-off step after equipping -- the player's meant to
  // follow the arrow to the Farm tab, so everything here stays locked down
  // (the Iron Band tile included, since it's already equipped by then).
  // "levelupCreature" is the later level-up detour -- Back/tabs lock down
  // the same way, and (see levelupLock below) so does Gear entirely.
  // "toEquipment" is the hand-off step right after that single level-up --
  // same full lockdown as "farm", so Level Up can't be tapped again and the
  // only way forward is the NavBar arrow to Equipment.
  const equipTutorialLock = tutorialRestricted && (tutorialStep === "slot" || tutorialStep === "item" || tutorialStep === "farm" || tutorialStep === "levelupCreature" || tutorialStep === "toEquipment");
  const pickerTutorialLock = tutorialRestricted && (tutorialStep === "item" || tutorialStep === "farm");
  // Stricter than equipTutorialLock: also blocks the forward-path controls
  // (Gear card, Level Up, Ascend) that stay open during "slot"/"item".
  const postEquipLock = tutorialRestricted && (tutorialStep === "farm" || tutorialStep === "toEquipment");
  // During the level-up detour, Gear is fully off-limits (all 4 slots, not
  // just 2-4 like slotStepLock below) -- the only thing tappable is Level Up.
  const levelupLock = tutorialRestricted && tutorialStep === "levelupCreature";
  // During "slot" specifically, only Slot 1 itself should be tappable --
  // the Gear card header and Slots 2-4 are blocked (see slotBlocked below).
  const slotStepLock = tutorialRestricted && tutorialStep === "slot";
  // Level Up and Ascend must also stay greyed out during "slot" -- the
  // player hasn't been asked to touch either yet, so leaving them live is
  // just a distraction from Slot 1. Ascend additionally stays locked all the
  // way through "levelupCreature" (only Level Up itself should be tappable
  // during that detour).
  const levelUpButtonLock = postEquipLock || slotStepLock;
  const ascendButtonLock = postEquipLock || slotStepLock || levelupLock;
  const [notify,setNotify]=useState(null);
  const [lastLeveledStat,setLastLeveledStat]=useState(null);
  const [ascPopup,setAscPopup]=useState(null);
  const [confirmMelon,setConfirmMelon]=useState(null);
  const [statInfoPopup,setStatInfoPopup]=useState(null);
  const [abilityTagPopup,setAbilityTagPopup]=useState(null);
  const def=CREATURE_MAP[ownedData.id];
  const stats=calcStats(def,ownedData);
  const equipBonusStats={hp:0,atk:0,def:0,spd:0,abilitySpeed:0};
  (ownedData.equipped||[null,null,null,null]).forEach(itemId=>{
    if(!itemId)return;
    const item=EQUIPMENT_MAP[itemId];
    if(!item||!item.stats)return;
    const lvl=equipmentLevels?.[itemId]||1;
    const asc=equipmentAscensions?.[itemId]||0;
    const mult=(1+lvl+lvl*lvl*0.0125)*(1+asc*0.15);
    for(const stat in item.stats){
      equipBonusStats[stat]=(equipBonusStats[stat]||0)+Math.round(item.stats[stat]*mult);
    }
  });
  (ownedData.equipped||[null,null,null,null]).forEach(itemId=>{
    if(!itemId)return;
    const item=EQUIPMENT_MAP[itemId];
    if(!item||!item.statBonus)return;
    const{stat,pct}=item.statBonus;
    equipBonusStats[stat]=(equipBonusStats[stat]||0)+statPctGain(stat,stats[stat],pct);
  });
  const abilityStatBonus=getAbilityStatBonus(def.id,ownedData.abilityLevels);
  if(abilityStatBonus){
    equipBonusStats[abilityStatBonus.stat]=(equipBonusStats[abilityStatBonus.stat]||0)+statPctGain(abilityStatBonus.stat,stats[abilityStatBonus.stat],abilityStatBonus.pct);
  }
  const flairBuffs=(ownedData.unlockedFlair||[]).map(key=>{
    const t=FLAIR_TITLE_MAP[key];if(t)return t.buff;
    const a=FLAIR_AURA_MAP[key];if(a)return a.buff;
    const b=FLAIR_BG_MAP[key];if(b)return b.buff;
    const i=FLAIR_ITEM_MAP[key];if(i)return i.buff;
    return null;
  }).filter(Boolean);
  const statsWithEquip=Object.fromEntries(STAT_CYCLE.map(s=>{
    const base=stats[s]+(equipBonusStats[s]||0);
    const fb=flairStatGain(s,stats[s],flairBuffs);
    return[s,Math.round((base+fb)*10)/10];
  }));
  const isMaxLevel=ownedData.level>=MAX_LEVEL;
  const cost=energyCost(ownedData.level);
  const hasFood=!isMaxLevel&&currencies.food>=cost;
  const displayEmoji=getDisplayEmoji(def,ownedData,unlockedSkins);
  const [showFlairEffects,setShowFlairEffects]=useState(false);
  const [showEquipPage,setShowEquipPage]=useState(false);
  const [equipDetailPage,setEquipDetailPage]=useState(null);
  const [equipSortFavorites,setEquipSortFavorites]=useState(new Set());
  useEffect(()=>{if(showEquipPage)setEquipSortFavorites(new Set(equipFavorites));},[showEquipPage]);
  function toggleEquipFavorite(id,e){e.stopPropagation();setEquipFavorites(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});}
  const [equipFiltersOpen,setEquipFiltersOpen]=useState(false);
  const [equipFilterRarities,setEquipFilterRarities]=useState(new Set());
  const [equipFilterStats,setEquipFilterStats]=useState(new Set());
  const [equipFilterHasEffect,setEquipFilterHasEffect]=useState(false);
  const [equipFilterFavorites,setEquipFilterFavorites]=useState(false);
  const [equipFilterHideIncompatible,setEquipFilterHideIncompatible]=useState(false);
  const [equipFilterElements,setEquipFilterElements]=useState(new Set());
  const [equipFilterRoles,setEquipFilterRoles]=useState(new Set());
  function toggleEquipRarity(r){setEquipFilterRarities(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleEquipStat(s){setEquipFilterStats(prev=>{const n=new Set(prev);n.has(s)?n.delete(s):n.add(s);return n;});}
  function toggleEquipElement(e){setEquipFilterElements(prev=>{const n=new Set(prev);n.has(e)?n.delete(e):n.add(e);return n;});}
  function toggleEquipRole(r){setEquipFilterRoles(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  const longPressTimer=useRef(null);
  const didLongPress=useRef(false);

  function notify_(msg,dur=2200){setNotify(msg);setTimeout(()=>setNotify(null),dur);}

  function doLevelUp(){
    if(!hasFood||isMaxLevel)return;
    const gainedStat=LEVEL_STAT_CYCLE[ownedData.nextStatIdx%LEVEL_STAT_CYCLE.length];
    setCurrencies(c=>({...c,food:c.food-cost}));
    setOwned(prev=>{
      const e={...prev[ownedData.id]};
      if(e.level>=MAX_LEVEL)return prev;
      e.level=e.level+1;e.nextStatIdx=(e.nextStatIdx+1)%LEVEL_STAT_CYCLE.length;
      return{...prev,[e.id]:e};
    });
    setLastLeveledStat(gainedStat);
    setTimeout(()=>setLastLeveledStat(null),1500);
    setPetLevelUps(c=>c+1);
    // Advances once the player's leveled up as far as a single harvest's
    // food allows -- with the fixed food/shard drops from the tutorial's
    // guided harvest, that's level 6. Further level-ups after this stay
    // fully available, they just no longer move the tutorial forward.
    if(tutorialStep==="levelupCreature")setTutorialStep("toEquipment");
  }

  function doFeed(){
    if(getMelonAvailable(currencies,def.type)<1){notify_("Not enough "+getMelonLabel(def.type)+"s!");return;}
    const eligible=["basic","special","unique"].filter(k=>ownedData.abilityLevels[k]<5);
    if(!eligible.length){notify_("All abilities maxed!");return;}
    const chosen=eligible[Math.floor(Math.random()*eligible.length)];
    const newLevel=ownedData.abilityLevels[chosen]+1;
    setCurrencies(c=>deductMelon(c,def.type));
    setOwned(prev=>{
      const e={...prev[ownedData.id]};
      e.abilityLevels={...e.abilityLevels,[chosen]:newLevel};
      return{...prev,[e.id]:e};
    });
    setPreviewPip(p=>({...p,[chosen]:Math.min(newLevel,4)}));
  }

  const rootDef=getRootDef(def.id);
  const isMaxAscension=ownedData.ascensions>=MAX_ASCENSION;
  function doAscend(){
    if(isMaxAscension)return;
    const needed=rootDef.shardsToAscend;
    const melons=currencies.ascensionMelon||0;
    const shardsUsed=Math.min(ownedData.shards,needed);
    const melonsUsed=needed-shardsUsed;
    if(shardsUsed+melons<needed){notify_("Need "+needed+" shards/melons (have "+ownedData.shards+" shards + "+melons+" 🍈)");return;}
    if(melonsUsed>0){setConfirmMelon({shardsUsed,melonsUsed});return;}
    performAscend(shardsUsed,0);
  }
  function performAscend(shardsUsed,melonsUsed){
    const newAsc=ownedData.ascensions+1;
    const willEvolve=!!(def.evolutionId&&newAsc>=def.ascensionsToEvolve);
    if(melonsUsed>0) setCurrencies(c=>({...c,ascensionMelon:(c.ascensionMelon||0)-melonsUsed}));
    setOwned(prev=>{
      const e={...prev[ownedData.id]};
      if(e.ascensions>=MAX_ASCENSION)return prev;
      e.shards=e.shards-shardsUsed;e.ascensions=newAsc;
      if(willEvolve){
        const evoDef=CREATURE_MAP[def.evolutionId];
        const evo={...makeOwnedCreature(evoDef),level:e.level,ascensions:e.ascensions,shards:e.shards,
          abilityLevels:{...e.abilityLevels},nextStatIdx:e.nextStatIdx,activeSkin:e.activeSkin};
        const next={...prev};delete next[e.id];next[evoDef.id]=evo;
        return next;
      }
      return{...prev,[e.id]:e};
    });
    if(willEvolve){
      const evoDef=CREATURE_MAP[def.evolutionId];
      const statsBefore=calcStats(def,{...ownedData,ascensions:newAsc});
      const statsAfter=calcStats(evoDef,{...ownedData,ascensions:newAsc});
      onEvolve(evoDef.id,def.name,evoDef.name,evoDef.emoji,statsBefore,statsAfter);
    } else {
      setAscPopup(newAsc);
    }
  }

  const [tab,setTab]=useState("levelup");
  const [previewPip,setPreviewPip]=useState({});
  const [holdEquip,setHoldEquip]=useState(null);
  const [equipSlotPicker,setEquipSlotPicker]=useState(null); // slot index being picked
  // Resuming mid-tutorial after a reload: "item" step expects the Slot 1
  // picker already open (see the Gear-slot onClick below for the normal path
  // there), but that's local state that doesn't survive a reload.
  useEffect(()=>{
    if(tutorialStep==="item"){setShowEquipPage(true);setEquipSlotPicker(0);}
  },[]);
  const [equipConflict,setEquipConflict]=useState(null); // {itemId,slotIdx,otherPetId,otherPetName}
  const abilityKeys=["basic","special","unique"];
  const allMaxed=abilityKeys.every(k=>ownedData.abilityLevels[k]>=5);
  const shardsProgress=Math.min(1,ownedData.shards/rootDef.shardsToAscend);
  const canEvolve=def.evolutionId&&ownedData.ascensions>=def.ascensionsToEvolve;
  const nextAscendWillEvolve=def.evolutionId&&(ownedData.ascensions+1)>=def.ascensionsToEvolve;

  const chainDefs=getChain(def.id).map(id=>CREATURE_MAP[id]);

  const equipped=(ownedData.equipped||[null,null,null,null]);

  function getStatSources(stat){
    const sources=[];
    equipped.forEach(itemId=>{
      if(!itemId)return;
      const item=EQUIPMENT_MAP[itemId];
      if(!item||!item.stats||!(stat in item.stats))return;
      const lvl=equipmentLevels?.[itemId]||1;
      const asc=equipmentAscensions?.[itemId]||0;
      const value=equipBonus(itemId,lvl,asc)[stat]||0;
      if(value)sources.push({type:"equip",emoji:item.emoji,label:item.name,value});
    });
    equipped.forEach(itemId=>{
      if(!itemId)return;
      const item=EQUIPMENT_MAP[itemId];
      if(!item||!item.statBonus||item.statBonus.stat!==stat)return;
      const value=statPctGain(stat,stats[stat],item.statBonus.pct);
      if(value)sources.push({type:"equip-effect",emoji:item.emoji,label:item.name+" (Effect)",value,pct:item.statBonus.pct});
    });
    const flairValue=flairStatGain(stat,stats[stat],flairBuffs);
    if(flairValue)sources.push({type:"flair",emoji:"✨",label:"Flair bonus ("+STAT_LABELS[stat]+")",value:flairValue});
    const abilityBonus=getAbilityStatBonus(def.id,ownedData.abilityLevels);
    if(abilityBonus&&abilityBonus.stat===stat){
      const value=statPctGain(stat,stats[stat],abilityBonus.pct);
      const abilityName=def.abilities?.unique?.name||"Ability";
      if(value)sources.push({type:"ability",emoji:"✦",label:abilityName+" (Ability)",value,pct:abilityBonus.pct});
    }
    return sources;
  }

  function setSlot(slotIdx,itemId,force=false){
    if(itemId&&!force){
      // check if another pet already has this item equipped
      const allOwned=Object.values(window.__ownedRef||{});
      // we read from setOwned's closure via a scan; use a dummy setter to get current state
      let conflict=null;
      setOwned(prev=>{
        for(const pet of Object.values(prev)){
          if(pet.id===ownedData.id)continue;
          const slots=pet.equipped||[null,null,null,null];
          if(slots.includes(itemId)){
            conflict={itemId,slotIdx,otherPetId:pet.id,otherPetName:CREATURE_MAP[pet.id]?.name||pet.id};
            return prev; // no change yet
          }
        }
        // no conflict, apply directly
        const e={...prev[ownedData.id]};
        const s=[...(e.equipped||[null,null,null,null])];
        s[slotIdx]=itemId;
        e.equipped=s;
        return{...prev,[e.id]:e};
      });
      if(conflict){setEquipConflict(conflict);}
      return;
    }
    setOwned(prev=>{
      const next={...prev};
      // if force, remove from any other pet first
      if(itemId&&force){
        for(const pet of Object.values(prev)){
          if(pet.id===ownedData.id)continue;
          const slots=pet.equipped||[null,null,null,null];
          if(slots.includes(itemId)){
            const e={...pet,equipped:slots.map(s=>s===itemId?null:s)};
            next[pet.id]=e;
          }
        }
      }
      const e={...prev[ownedData.id]};
      const s=[...(e.equipped||[null,null,null,null])];
      s[slotIdx]=itemId;
      e.equipped=s;
      next[e.id]=e;
      return next;
    });
  }

  function doUpgrade(itemId){
    const lvl=equipmentLevels[itemId]||1;
    if(lvl>=EQUIP_MAX_LEVEL)return;
    const cost=equipUpgradeCost(lvl);
    if((currencies.equipShards||0)<cost){notify_("Not enough 🔧 Gear Shards!");return;}
    setCurrencies(c=>({...c,equipShards:(c.equipShards||0)-cost}));
    setEquipmentLevels(prev=>({...prev,[itemId]:(prev[itemId]||1)+1}));
    setEquipLevelUps(c=>c+1);
  }

  function doAscendEquip(itemId){
    const asc=equipmentAscensions[itemId]||0;
    if(asc>=EQUIP_MAX_ASCENSION)return;
    const need=EQUIP_ASC_COSTS[asc];
    const copies=equipmentCopies[itemId]||0;
    if(copies<need){notify_("Not enough copies!");return;}
    setEquipmentCopies(prev=>({...prev,[itemId]:(prev[itemId]||0)-need}));
    setEquipmentAscensions(prev=>({...prev,[itemId]:(prev[itemId]||0)+1}));
  }

  const tabs=[{id:"levelup",label:"Level Up"},{id:"abilities",label:"Abilities"},{id:"flair",label:"Flair"},{id:"skins",label:"Skins"}];

  const statInfoPopupEl=statInfoPopup&&(()=>{
    const sources=getStatSources(statInfoPopup);
    const base=stats[statInfoPopup];
    const total=statsWithEquip[statInfoPopup];
    const bonusTotal=Math.round((total-base)*10)/10;
    return React.createElement("div",{onClick:()=>setStatInfoPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"20px 18px",width:280,maxHeight:"70vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:8}},STAT_LABELS[statInfoPopup]),
        React.createElement("div",{style:{fontSize:13,color:"#555",lineHeight:1.4,marginBottom:16}},STAT_DESCRIPTIONS[statInfoPopup]),
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid #eee"}},
          React.createElement("span",{style:{fontSize:12,color:"#888"}},"Base"),
          React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#222"}},base)
        ),
        sources.map((s,i)=>React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid #eee"}},
          React.createElement("span",{style:{fontSize:12,color:"#555",display:"flex",alignItems:"center",gap:5}},
            React.createElement("span",null,s.emoji),
            React.createElement("span",null,s.label),
            s.pct&&React.createElement("span",{style:{fontSize:10,color:"#aaa"}},"("+(s.pct>0?"+":"")+s.pct+"%)")
          ),
          React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#2e7d32"}},"+"+s.value)
        )),
        sources.length===0&&React.createElement("div",{style:{padding:"10px 0",fontSize:12,color:"#bbb",textAlign:"center",borderTop:"1px solid #eee"}},"No equipment or flair boosting this stat"),
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderTop:"2px solid #ddd",marginTop:4,marginBottom:16}},
          React.createElement("span",{style:{fontSize:12,fontWeight:700,color:"#111"}},"Total"),
          React.createElement("span",{style:{fontSize:14,fontWeight:800,color:"#111"}},total+(bonusTotal>0?" (+"+bonusTotal+")":""))
        ),
        React.createElement("button",{onClick:()=>setStatInfoPopup(null),style:{width:"100%",padding:"9px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
      )
    );
  })();

  const abilityTagPopupEl=abilityTagPopup&&React.createElement("div",{onClick:()=>setAbilityTagPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"20px 18px",width:260,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
      React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:8}},ABILITY_TAG_DEFS[abilityTagPopup].label),
      React.createElement("div",{style:{fontSize:13,color:"#555",lineHeight:1.4,marginBottom:16}},ABILITY_TAG_DEFS[abilityTagPopup].description),
      React.createElement("button",{onClick:()=>setAbilityTagPopup(null),style:{width:"100%",padding:"9px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
    )
  );

  if(equipDetailPage){
    const pi=EQUIPMENT_MAP[equipDetailPage];
    if(!pi) {setEquipDetailPage(null);}
    else {
      const lvl=equipmentLevels[pi.id]||1;
      const asc=equipmentAscensions[pi.id]||0;
      const copies=equipmentCopies[pi.id]||0;
      const bonuses=equipBonus(pi.id,lvl,asc);
      const nextUpgradeBonuses=lvl<EQUIP_MAX_LEVEL?equipBonus(pi.id,lvl+1,asc):null;
      const rarCfg=EQUIP_RARITY_CONFIG[pi.rarity];
      const upgradeCost=lvl<EQUIP_MAX_LEVEL?equipUpgradeCost(lvl):null;
      const canAffordUpgrade=upgradeCost!==null&&(currencies.equipShards||0)>=upgradeCost;
      const ascCost=asc<EQUIP_MAX_ASCENSION?EQUIP_ASC_COSTS[asc]:null;
      const canAffordAsc=ascCost!==null&&copies>=ascCost;
      const starStr="★".repeat(asc);
      return React.createElement("div",{style:{minHeight:"100vh",background:"#f5f5f5",padding:"16px"}},
        notify&&React.createElement(Notify,{msg:notify}),
        React.createElement("button",{className:"back-btn",onClick:()=>setEquipDetailPage(null)},
          React.createElement("i",{className:"ti ti-arrow-left"}),"Back"
        ),
        React.createElement("div",{className:"card",style:{marginTop:8,padding:"24px 20px",position:"relative",display:"flex",flexDirection:"column",minHeight:"calc(100vh - 90px)"}},
          rarCfg&&React.createElement("div",{style:{position:"absolute",top:10,left:12,fontSize:10,fontWeight:700,color:rarCfg.color,background:rarCfg.bg,borderRadius:4,padding:"2px 7px"}},rarCfg.label),
          (pi.element||pi.role)&&React.createElement("div",{style:{position:"absolute",top:34,left:12,fontSize:10,fontWeight:700,color:"#7F77DD"}},
            [pi.element,pi.role].filter(Boolean).join(" · ")+" exclusive"
          ),
          React.createElement("div",{style:{textAlign:"center",marginBottom:16}},
            React.createElement("div",{style:{fontSize:64,marginBottom:4}},pi.emoji),
            React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#000",marginBottom:2}},pi.name),
            asc>0&&React.createElement("div",{style:{fontSize:14,color:"#f59e0b",letterSpacing:2,marginBottom:4}},starStr),
            React.createElement("div",{style:{fontSize:16,fontWeight:700,color:lvl>=EQUIP_MAX_LEVEL?"#d97706":"#444",marginBottom:6}},lvl>=EQUIP_MAX_LEVEL?"MAX":"Lv "+lvl),
            React.createElement("div",{style:{fontSize:13,color:"#666",marginBottom:pi.effect?6:0}},equipBonusStr(bonuses)),
            pi.effect&&React.createElement("div",{style:{fontSize:12,color:"#7F77DD",fontWeight:600}},"✦ "+pi.effect)
          ),
          React.createElement("div",{style:{borderTop:"1px solid #eee",paddingTop:14,marginTop:"auto",display:"flex",flexDirection:"column",gap:10}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#666",marginBottom:6}},"UPGRADE"),
              lvl<EQUIP_MAX_LEVEL
                ? React.createElement("div",null,
                    React.createElement("div",{style:{fontSize:12,color:"#534AB7",marginBottom:8}},"Lv "+(lvl+1)+": "+equipBonusStr(nextUpgradeBonuses)),
                    React.createElement("button",{onClick:()=>doUpgrade(pi.id),disabled:!canAffordUpgrade,style:{width:"100%",padding:"10px 0",fontSize:13,fontWeight:700,border:"none",borderRadius:9,cursor:canAffordUpgrade?"pointer":"default",background:canAffordUpgrade?"#534AB7":"#e0e0e0",color:canAffordUpgrade?"#fff":"#aaa"}},"🔧 Upgrade "+(currencies.equipShards||0)+"/"+upgradeCost)
                  )
                : React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#f59e0b"}},"✦ Max Level")
            ),
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#666",marginBottom:6}},"ASCENSION"),
              asc<EQUIP_MAX_ASCENSION
                ? React.createElement("button",{onClick:()=>doAscendEquip(pi.id),disabled:!canAffordAsc,style:{width:"100%",padding:"10px 0",fontSize:13,fontWeight:700,border:"none",borderRadius:9,cursor:canAffordAsc?"pointer":"default",background:canAffordAsc?"#f59e0b":"#e0e0e0",color:canAffordAsc?"#fff":"#aaa"}},"✦ Ascend "+copies+"/"+ascCost)
                : React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#f59e0b"}},"✦ Max Ascension")
            )
          )
        )
      );
    }
  }

  if(showEquipPage){
    const equipped=ownedData.equipped||[null,null,null,null];
    return React.createElement("div",null,
      statInfoPopupEl,
      notify&&React.createElement(Notify,{msg:notify}),
      equipConflict&&React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
        React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:290,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
          React.createElement("div",{style:{fontSize:32,marginBottom:8}},EQUIPMENT_MAP[equipConflict.itemId]?.emoji),
          React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:8}},"Item Already Equipped"),
          React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:16}},(EQUIPMENT_MAP[equipConflict.itemId]?.name||"This item")+" is already equipped on "+equipConflict.otherPetName+". Unequip it from there and equip it here?"),
          React.createElement("div",{style:{display:"flex",gap:8}},
            React.createElement("button",{onClick:()=>setEquipConflict(null),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel"),
            React.createElement("button",{onClick:()=>{const ec=equipConflict;setEquipConflict(null);setSlot(ec.slotIdx,ec.itemId,true);setEquipSlotPicker(null);},style:{flex:1,padding:"10px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Move Here")
          )
        )
      ),
      React.createElement(ScreenHeader,{title:def.name,onBack:()=>{setShowEquipPage(false);setEquipSlotPicker(null);},backDisabled:pickerTutorialLock,right:chainDefs.length>1&&setDexOverlay&&React.createElement("button",{
        disabled:pickerTutorialLock,
        onClick:()=>{if(pickerTutorialLock)return;setDexOverlay(def.id);},
        style:{padding:"4px 10px",fontSize:12,fontWeight:600,border:"1px solid "+(pickerTutorialLock?"#ccc":"#534AB7"),borderRadius:8,background:pickerTutorialLock?"#f5f5f5":"#f0effe",color:pickerTutorialLock?"#bbb":"#534AB7",cursor:pickerTutorialLock?"not-allowed":"pointer",whiteSpace:"nowrap"}
      },"Evolutions")}),
      React.createElement("div",{className:"card",style:{marginBottom:12}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:12}},
          React.createElement("span",{style:{fontSize:52,lineHeight:1}},displayEmoji),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:16,fontWeight:700,color:"#000"}},def.name+(ownedData.equippedTitle?" the "+ownedData.equippedTitle:"")),
            React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#666",marginBottom:6}},"Lv "+ownedData.level),
            React.createElement("div",{style:{display:"flex",gap:5,flexWrap:"wrap"}},
              def.type&&React.createElement("span",{style:{fontSize:11,fontWeight:600,background:"#f0f0f0",color:"#444",borderRadius:8,padding:"2px 7px"}},(TYPE_EMOJI[def.type]||"")+" "+def.type),
              def.role&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ROLE_CONFIG[def.role].color,background:ROLE_CONFIG[def.role].bg,borderRadius:8,padding:"2px 7px"}},ROLE_CONFIG[def.role].emoji+" "+def.role),
              def.attackType&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ATTACK_TYPE_CONFIG[def.attackType].color,background:ATTACK_TYPE_CONFIG[def.attackType].bg,borderRadius:8,padding:"2px 7px"}},ATTACK_TYPE_CONFIG[def.attackType].emoji+" "+def.attackType)
            )
          )
        ),
        React.createElement("div",{style:{display:"flex",gap:4}},
          STAT_CYCLE.map(s=>React.createElement(StatBar,{key:s,stat:s,value:statsWithEquip[s],highlight:lastLeveledStat===s,onClick:setStatInfoPopup}))
        )
      ),
      React.createElement("div",{className:"card",style:{marginBottom:12}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#666",marginBottom:10}},"Equipped"),
        React.createElement("div",{style:{display:"flex",gap:8}},
          [0,1,2,3].map(slotIdx=>{
            const itemId=equipped[slotIdx];
            const item=itemId?EQUIPMENT_MAP[itemId]:null;
            const lvl=item?(equipmentLevels[itemId]||1):0;
            const asc=item?(equipmentAscensions[itemId]||0):0;
            const bonuses=item?equipBonus(itemId,lvl,asc):{};
            const rarCfg=item?EQUIP_RARITY_CONFIG[item.rarity]:null;
            const isPickingThis=equipSlotPicker===slotIdx;
            const slotKey="slot-"+slotIdx;
            const slotPressStart=e=>{if(pickerTutorialLock)return;e.preventDefault();if(item)setHoldEquip(slotKey);longPressTimer.current=setTimeout(()=>{didLongPress.current=true;setHoldEquip(null);if(item)setEquipDetailPage(itemId);},500);};
            const slotPressEnd=()=>{clearTimeout(longPressTimer.current);setHoldEquip(null);};
            return React.createElement("div",{key:slotIdx,
              onClick:()=>{if(pickerTutorialLock)return;if(didLongPress.current){didLongPress.current=false;return;}setEquipSlotPicker(slotIdx);},
              onMouseDown:slotPressStart,onMouseUp:slotPressEnd,onMouseLeave:slotPressEnd,
              onTouchStart:slotPressStart,onTouchEnd:slotPressEnd,onTouchCancel:slotPressEnd,
              style:{flex:1,height:128,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:isPickingThis?"#e0f7fa":rarCfg?rarCfg.bg:"#f5f5f5",border:"2px solid "+(isPickingThis?"#00acc1":rarCfg?rarCfg.color:"#e0e0e0"),borderRadius:10,padding:"8px 6px",cursor:pickerTutorialLock?"not-allowed":"pointer",textAlign:"center",userSelect:"none",boxSizing:"border-box",opacity:pickerTutorialLock&&!isPickingThis?0.5:1}},
              item
                ? React.createElement("div",{style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}},
                    React.createElement("div",{style:{position:"absolute",top:0,left:2,fontSize:12,fontWeight:700,color:lvl>=EQUIP_MAX_LEVEL?"#f59e0b":"#888",lineHeight:"16px"}},lvl>=EQUIP_MAX_LEVEL?"MAX":"Lv "+lvl),
                    React.createElement("div",{style:{position:"relative",display:"inline-block",marginTop:8}},
                      React.createElement("div",{style:{fontSize:24}},item.emoji),
                      holdEquip===slotKey&&React.createElement("svg",{width:36,height:36,style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}},
                        React.createElement("circle",{cx:18,cy:18,r:16,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:100,strokeDashoffset:100,strokeLinecap:"round",
                          style:{animation:"holdRing 0.5s linear forwards",transformOrigin:"18px 18px",transform:"rotate(-90deg)"}})
                      )
                    ),
                    React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#000",marginTop:2}},item.name),
                    React.createElement("div",{style:{fontSize:11,color:"#534AB7",fontWeight:600}},equipBonusLines(bonuses).map((line,i)=>React.createElement("div",{key:i},line)))
                  )
                : React.createElement("div",{style:{fontSize:11,color:"#aaa"}},
                    React.createElement("div",{style:{fontSize:22,marginBottom:4}},"＋"),
                    "Slot "+(slotIdx+1)
                  )
            );
          })
        ),
      ),
      React.createElement("div",{className:"card"},
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}},
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#666"}},equipSlotPicker!==null?"Slot "+(equipSlotPicker+1)+" — choose gear:":"All Gear"),
          React.createElement("button",{disabled:pickerTutorialLock,onClick:()=>{if(pickerTutorialLock)return;setEquipFiltersOpen(p=>!p);},style:{fontSize:11,color:pickerTutorialLock?"#bbb":"#534AB7",fontWeight:600,background:"none",border:"none",cursor:pickerTutorialLock?"not-allowed":"pointer",padding:"2px 4px"}},equipFiltersOpen?"Hide Filters ▲":"Filter ▼")
        ),
        !pickerTutorialLock&&(()=>{
          const anyReady=EQUIPMENT_DEFS.some(item=>{
            const asc=equipmentAscensions[item.id]||0;
            const copies=equipmentCopies[item.id]||0;
            return asc<EQUIP_MAX_ASCENSION&&copies>=EQUIP_ASC_COSTS[asc];
          });
          if(!anyReady)return null;
          return React.createElement("button",{
            onClick:()=>{
              const newCopies={...equipmentCopies};
              const newAsc={...equipmentAscensions};
              EQUIPMENT_DEFS.forEach(item=>{
                let asc=newAsc[item.id]||0;
                let copies=newCopies[item.id]||0;
                while(asc<EQUIP_MAX_ASCENSION&&copies>=EQUIP_ASC_COSTS[asc]){
                  copies-=EQUIP_ASC_COSTS[asc];
                  asc++;
                }
                newAsc[item.id]=asc;
                newCopies[item.id]=copies;
              });
              setEquipmentCopies(newCopies);
              setEquipmentAscensions(newAsc);
            },
            style:{width:"100%",marginBottom:6,fontSize:12,fontWeight:800,color:"#fff",background:"#f59e0b",border:"none",borderRadius:9,cursor:"pointer",padding:"8px 0",letterSpacing:".03em"}
          },"✦ Ascend All");
        })(),
        equipFiltersOpen&&React.createElement("div",null,
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
            React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Rarity"),
            React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
              Object.entries(EQUIP_RARITY_CONFIG).map(([r,cfg])=>
                React.createElement("button",{key:r,className:"filter-chip"+(equipFilterRarities.has(r)?" active":""),onClick:()=>toggleEquipRarity(r)},cfg.label)
              )
            )
          ),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
            React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Stat"),
            React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
              [...CORE_STAT_CYCLE,"spd","abilitySpeed"].map(s=>
                React.createElement("button",{key:s,className:"filter-chip"+(equipFilterStats.has(s)?" active":""),onClick:()=>toggleEquipStat(s)},STAT_LABELS[s])
              )
            )
          ),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
            React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Type"),
            React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
              Object.entries(TYPE_EMOJI).map(([t,em])=>
                React.createElement("button",{key:t,className:"filter-chip"+(equipFilterElements.has(t)?" active":""),onClick:()=>toggleEquipElement(t)},em+" "+t)
              )
            )
          ),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
            React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Role"),
            React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
              ["Attacker","Tank","Support"].map(r=>
                React.createElement("button",{key:r,className:"filter-chip"+(equipFilterRoles.has(r)?" active":""),onClick:()=>toggleEquipRole(r)},ROLE_CONFIG[r].emoji+" "+r)
              )
            )
          ),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:10}},
            React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Show"),
            React.createElement("button",{className:"filter-chip"+(equipFilterFavorites?" active":""),onClick:()=>setEquipFilterFavorites(p=>!p)},"★ Favorites"),
            React.createElement("button",{className:"filter-chip"+(equipFilterHasEffect?" active":""),onClick:()=>setEquipFilterHasEffect(p=>!p)},"Has Effect"),
            React.createElement("button",{className:"filter-chip"+(equipFilterHideIncompatible?" active":""),onClick:()=>setEquipFilterHideIncompatible(p=>!p)},"Hide Incompatible")
          )
        ),
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:8,marginTop:tutorialStep==="item"?42:12}},
          (()=>{
            const RARITY_RANK={legendary:3,epic:2,rare:1,common:0};
            return[...EQUIPMENT_DEFS]
              .filter(item=>{
                if(!(equipmentCopies[item.id]>0)&&!(equipmentAscensions[item.id]>0)&&!equipped.includes(item.id))return false;
                if(equipFilterRarities.size>0&&!equipFilterRarities.has(item.rarity))return false;
                if(equipFilterStats.size>0&&![...equipFilterStats].every(s=>itemAffectsStat(item,s)))return false;
                if(equipFilterFavorites&&!equipFavorites.has(item.id))return false;
                if(equipFilterHasEffect&&!item.effect)return false;
                if(equipFilterElements.size>0&&!equipFilterElements.has(item.element))return false;
                if(equipFilterRoles.size>0&&!equipFilterRoles.has(item.role))return false;
                if(equipFilterHideIncompatible&&!equipped.includes(item.id)&&((item.element&&def.type!==item.element)||(item.role&&def.role!==item.role)))return false;
                return true;
              })
              .sort((a,b)=>{
  const ea=equipped.includes(a.id)?1:0,eb=equipped.includes(b.id)?1:0;if(eb!==ea)return eb-ea;
  const dA=((a.element&&def.type!==a.element)||(a.role&&def.role!==a.role))?1:0;
  const dB=((b.element&&def.type!==b.element)||(b.role&&def.role!==b.role))?1:0;
  if(dA!==dB)return dA-dB;
  const ascA=equipmentAscensions[a.id]||0,ascB=equipmentAscensions[b.id]||0;
  const copA=equipmentCopies[a.id]||0,copB=equipmentCopies[b.id]||0;
  const canAscA=(ascA<EQUIP_MAX_ASCENSION&&copA>=EQUIP_ASC_COSTS[ascA])?1:0;
  const canAscB=(ascB<EQUIP_MAX_ASCENSION&&copB>=EQUIP_ASC_COSTS[ascB])?1:0;
  if(canAscB!==canAscA)return canAscB-canAscA;
  const fa=equipSortFavorites.has(a.id)?1:0,fb=equipSortFavorites.has(b.id)?1:0;if(fb!==fa)return fb-fa;
  const la=equipmentLevels[a.id]||0,lb=equipmentLevels[b.id]||0;if(lb!==la)return lb-la;
  return RARITY_RANK[b.rarity]-RARITY_RANK[a.rarity];
});
          })().map(item=>{
            const lvl=equipmentLevels[item.id]||1;
            const asc=equipmentAscensions[item.id]||0;
            const copies=equipmentCopies[item.id]||0;
            const bonuses=equipBonus(item.id,lvl,asc);
            const rarCfg=EQUIP_RARITY_CONFIG[item.rarity];
            const isEquippedHere=equipSlotPicker!==null&&equipped[equipSlotPicker]===item.id;
            const isEquippedOtherSlot=equipSlotPicker!==null&&equipped.some((id,i)=>i!==equipSlotPicker&&id===item.id);
            const isEquippedSlot0=equipped[0]===item.id;
            const isEquippedSlot1=equipped[1]===item.id;
            const equippedByPet=owned&&Object.values(owned).find(p=>p.id!==ownedData.id&&(p.equipped||[]).includes(item.id));
            const equippedByDef=equippedByPet?CREATURE_MAP[equippedByPet.id]:null;
            const disabled=(item.element&&def.type!==item.element)||(item.role&&def.role!==item.role);
            // During the guided "choose gear" step, only the Iron Band tile
            // the pointer arrow highlights should respond to a tap.
            const tutorialBlocked=pickerTutorialLock&&!(tutorialStep==="item"&&item.id===TUTORIAL_ITEM_ID);
            const onTapClick=equipSlotPicker!==null
              ? ()=>{if(didLongPress.current){didLongPress.current=false;return;}
                  if(tutorialBlocked)return;
                  if(disabled&&!isEquippedHere)return;
                  if(isEquippedHere){setSlot(equipSlotPicker,null);}
                  else if(isEquippedOtherSlot){
                    // swap: find which slot has this item and swap with the picker slot
                    const otherSlot=equipped.findIndex((id,i)=>i!==equipSlotPicker&&id===item.id);
                    setOwned(prev=>{const pets={...prev};const pet={...pets[ownedData.id]};const s=[...(pet.equipped||[null,null,null,null])];const tmp=s[equipSlotPicker];s[equipSlotPicker]=s[otherSlot];s[otherSlot]=tmp;pet.equipped=s;pets[ownedData.id]=pet;return pets;});
                  }
                  else{setSlot(equipSlotPicker,item.id);}
                  if(tutorialStep==="item"&&item.id===TUTORIAL_ITEM_ID){setTutorialStep("farm");}
                }
              : ()=>{if(didLongPress.current){didLongPress.current=false;}};
            const cardKey="card-"+item.id;
            const onPressStart=e=>{if(tutorialBlocked)return;e.preventDefault();setHoldEquip(cardKey);longPressTimer.current=setTimeout(()=>{didLongPress.current=true;setHoldEquip(null);setEquipDetailPage(item.id);},500);};
            const onPressEnd=()=>{clearTimeout(longPressTimer.current);setHoldEquip(null);};
            const highlight=isEquippedSlot0||isEquippedSlot1;
            const canAscendItem=asc<EQUIP_MAX_ASCENSION&&copies>=EQUIP_ASC_COSTS[asc];
            const showItemPointer=tutorialStep==="item"&&item.id===TUTORIAL_ITEM_ID;
            return React.createElement("div",{key:item.id,
              onClick:onTapClick,
              onMouseDown:onPressStart,onMouseUp:onPressEnd,onMouseLeave:onPressEnd,
              onTouchStart:onPressStart,onTouchEnd:onPressEnd,onTouchCancel:onPressEnd,
              style:{position:"relative",background:isEquippedHere?"#ede9ff":highlight?"#f0eeff":(rarCfg?rarCfg.bg:"#fff"),borderRadius:10,padding:"10px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:tutorialBlocked?0.35:disabled?0.4:1,cursor:(equipSlotPicker!==null&&!disabled&&!tutorialBlocked)?"pointer":"default",width:"calc(50% - 4px)",boxSizing:"border-box",textAlign:"center",border:"1.5px solid "+(isEquippedHere?"#534AB7":highlight?"#d0ccf7":(rarCfg?rarCfg.color+"44":"#eee")),userSelect:"none"}},
              showItemPointer&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-34,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
              React.createElement("div",{style:{position:"absolute",top:6,left:8,textAlign:"left"}},
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:lvl>=EQUIP_MAX_LEVEL?"#f59e0b":"#888",lineHeight:"16px"}},lvl>=EQUIP_MAX_LEVEL?"MAX":"Lv "+lvl),
                (item.element||item.role)&&React.createElement("div",{style:{fontSize:10,fontWeight:700,color:"#7F77DD",marginTop:2,whiteSpace:"nowrap"}},
                  [item.element,item.role].filter(Boolean).join(" · ")+" exclusive"
                )
              ),
              !tutorialBlocked&&React.createElement("div",{style:{position:"absolute",top:6,right:8,fontSize:16,cursor:"pointer",color:equipFavorites.has(item.id)?"#f59e0b":"#ccc",lineHeight:1},onClick:e=>toggleEquipFavorite(item.id,e)},equipFavorites.has(item.id)?"★":"☆"),
              asc>0&&React.createElement("div",{style:{position:"absolute",top:4,left:0,right:0,textAlign:"center",fontSize:10,fontWeight:700,color:"#f59e0b",lineHeight:"14px",pointerEvents:"none"}},asc>=EQUIP_MAX_ASCENSION?"✦".repeat(10):(asc<=5?"★".repeat(asc):"★".repeat(5)+"★".repeat(asc-5))),
              React.createElement("div",{style:{position:"relative",display:"inline-block",marginTop:4}},
                React.createElement("span",{style:{fontSize:22}},item.emoji),
                holdEquip===cardKey&&React.createElement("svg",{width:36,height:36,style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}},
                  React.createElement("circle",{cx:18,cy:18,r:16,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:100,strokeDashoffset:100,strokeLinecap:"round",
                    style:{animation:"holdRing 0.5s linear forwards",transformOrigin:"18px 18px",transform:"rotate(-90deg)"}})
                )
              ),
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#000"}},item.name),
                React.createElement("div",{style:{fontSize:11,color:"#666"}},equipBonusStr(bonuses)),
                item.effect&&React.createElement("div",{style:{fontSize:10,color:"#7F77DD",fontWeight:600,marginTop:2}},"✦ "+item.effect),
                canAscendItem&&React.createElement("div",{style:{marginTop:3}},
                  React.createElement("span",{style:{fontSize:9,fontWeight:800,color:"#fff",background:"#f59e0b",borderRadius:6,padding:"2px 6px",letterSpacing:".04em"}},"ASCEND READY")
                ),
              ),
              React.createElement("div",{style:{fontSize:9,color:"#e65100",fontWeight:600,lineHeight:1.2,minHeight:18,display:"flex",alignItems:"center",justifyContent:"center",gap:3}},
                equippedByPet
                  ? [React.createElement("span",{key:"e",style:{fontSize:12}},equippedByDef?.emoji||"❓"),
                     React.createElement("span",{key:"n"},equippedByDef?.name||equippedByPet.id)]
                  : null
              )
            );
          })
        )
      ),
    );
  }

  return React.createElement("div",null,
    statInfoPopupEl,
    abilityTagPopupEl,
    ascPopup&&React.createElement(AscensionPopup,{def,displayEmoji,ascPopup,ownedData,onClose:()=>setAscPopup(null)}),
    React.createElement(ScreenHeader,{title:def.name,onBack,backDisabled:equipTutorialLock,right:chainDefs.length>1&&setDexOverlay&&React.createElement("button",{
      disabled:equipTutorialLock,
      onClick:()=>{if(equipTutorialLock)return;setDexOverlay(def.id);},
      style:{padding:"4px 10px",fontSize:12,fontWeight:600,border:"1px solid "+(equipTutorialLock?"#ccc":"#534AB7"),borderRadius:8,background:equipTutorialLock?"#f5f5f5":"#f0effe",color:equipTutorialLock?"#bbb":"#534AB7",cursor:equipTutorialLock?"not-allowed":"pointer",whiteSpace:"nowrap"}
    },"Evolutions")}),
    notify&&React.createElement(Notify,{msg:notify}),
    equipConflict&&React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:290,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:32,marginBottom:8}},EQUIPMENT_MAP[equipConflict.itemId]?.emoji),
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:8}},"Item Already Equipped"),
        React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:16}},
          (EQUIPMENT_MAP[equipConflict.itemId]?.name||"This item")+" is already equipped on "+equipConflict.otherPetName+". Unequip it from there and equip it here?"
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setEquipConflict(null),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel"),
          React.createElement("button",{onClick:()=>{const ec=equipConflict;setEquipConflict(null);setSlot(ec.slotIdx,ec.itemId,true);setEquipSlotPicker(null);},style:{flex:1,padding:"10px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Move Here")
        )
      )
    ),
    confirmMelon&&React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:32,marginBottom:8}},"🍈"),
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:8}},"Use Ascension Melons?"),
        React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:4}},
          "You have "+ownedData.shards+" shards."
        ),
        React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:16}},
          confirmMelon.shardsUsed>0
            ?"This will use 🔶 "+confirmMelon.shardsUsed+" shards + 🍈 "+confirmMelon.melonsUsed+" melon"+(confirmMelon.melonsUsed>1?"s":"")+"."
            :"🍈 "+confirmMelon.melonsUsed+" melon"+(confirmMelon.melonsUsed>1?"s":"")+" will be used."
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setConfirmMelon(null),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel"),
          React.createElement("button",{onClick:()=>{const cm=confirmMelon;setConfirmMelon(null);performAscend(cm.shardsUsed,cm.melonsUsed);},style:{flex:1,padding:"10px 0",background:"#2e7d32",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Confirm")
        )
      )
    ),
    React.createElement("div",{className:"card",style:{marginBottom:12}},
      React.createElement("div",{style:{position:"relative",marginBottom:14}},
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4,position:"absolute",top:0,left:0,alignItems:"flex-start"}},
          React.createElement("span",{className:"badge "+RARITY_CONFIG[def.rarity].color},RARITY_CONFIG[def.rarity].label),
          React.createElement("span",{style:{fontSize:11,fontWeight:600,color:"#444",background:"#f0f0f0",borderRadius:8,padding:"2px 7px"}},TYPE_EMOJI[def.type]+" "+def.type),
          def.role&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ROLE_CONFIG[def.role].color,background:ROLE_CONFIG[def.role].bg,borderRadius:8,padding:"2px 7px"}},ROLE_CONFIG[def.role].emoji+" "+def.role),
          def.attackType&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ATTACK_TYPE_CONFIG[def.attackType].color,background:ATTACK_TYPE_CONFIG[def.attackType].bg,borderRadius:8,padding:"2px 7px"}},ATTACK_TYPE_CONFIG[def.attackType].emoji+" "+def.attackType)
        ),
        React.createElement("div",{style:{textAlign:"center"}},
          ownedData.ascensions>0&&React.createElement("div",{style:{marginBottom:4}},React.createElement(AscStars,{n:ownedData.ascensions})),
          def.image
            ?React.createElement("div",{style:{width:100,height:100,margin:"0 auto 8px",borderRadius:16,overflow:"hidden",background:"#fff"}},
                React.createElement("img",{src:def.image,style:{width:"100%",height:"100%",objectFit:"contain",display:"block",mixBlendMode:"multiply"}}))
            :React.createElement("span",{style:{fontSize:100,lineHeight:1,display:"block",marginBottom:8}},displayEmoji),
          React.createElement("div",{style:{fontSize:20,fontWeight:600,color:"#000",marginBottom:6}},def.name+(ownedData.equippedTitle?" the "+ownedData.equippedTitle:"")),
          React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center",justifyContent:"center"}},
            React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#666"}},"Lv "+ownedData.level)
          )
        ),
        flairBuffs.length>0&&React.createElement("button",{onClick:()=>setShowFlairEffects(true),style:{position:"absolute",top:0,right:0,padding:"4px 10px",fontSize:11,fontWeight:600,border:"1px solid #534AB7",borderRadius:8,background:"#f0effe",color:"#534AB7",cursor:"pointer"}},"✨ Flair Effects")
      ),
      React.createElement("div",{style:{display:"flex",gap:4}},
        STAT_CYCLE.map(s=>React.createElement(StatBar,{key:s,stat:s,value:statsWithEquip[s],highlight:lastLeveledStat===s,onClick:setStatInfoPopup}))
      )
    ),
    showFlairEffects&&(()=>{
      const totals=Object.fromEntries(Object.keys(BUFF_STAT_LABEL).map(s=>[s,0]));
      flairBuffs.forEach(b=>{totals[b.stat]=(totals[b.stat]||0)+b.pct;});
      Object.keys(totals).forEach(s=>{totals[s]=Math.round(totals[s]*100)/100;});
      return React.createElement("div",{onClick:()=>setShowFlairEffects(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
        React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
          React.createElement("div",{style:{fontSize:15,fontWeight:700,textAlign:"center",marginBottom:4}},"✨ Flair Effects"),
          React.createElement("div",{style:{fontSize:11,color:"#888",textAlign:"center",marginBottom:16}},"Stat boosts from all unlocked flair"),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
            Object.entries(BUFF_STAT_LABEL).map(([stat,label])=>{
              const pct=totals[stat]||0;
              const gain=flairStatGain(stat,stats[stat],flairBuffs);
              return React.createElement("div",{key:stat,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:pct>0?"#f0effe":"#f5f5f5"}},
                React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#444"}},label),
                pct>0
                  ? React.createElement("div",{style:{textAlign:"right"}},
                      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7"}},"+"+gain+" ("+pct+"%)"),
                    )
                  : React.createElement("span",{style:{fontSize:13,color:"#bbb"}},"—")
              );
            })
          ),
          React.createElement("button",{onClick:()=>setShowFlairEffects(false),style:{marginTop:16,width:"100%",padding:"10px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
        )
      );
    })(),
    React.createElement("div",{className:"card",style:{marginBottom:12,cursor:(postEquipLock||slotStepLock||levelupLock)?"not-allowed":"pointer",opacity:(postEquipLock||levelupLock)?0.5:1},onClick:()=>{if(postEquipLock||slotStepLock||levelupLock)return;setShowEquipPage(true);}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#666"}},"Gear"),
        React.createElement("span",{style:{fontSize:13,color:"#aaa"}},"›")
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        [0,1,2,3].map(slotIdx=>{
          const itemId=equipped[slotIdx];
          const item=itemId?EQUIPMENT_MAP[itemId]:null;
          const lvl=item?(equipmentLevels[itemId]||1):0;
          const asc=item?(equipmentAscensions[itemId]||0):0;
          const bonuses=item?equipBonus(itemId,lvl,asc):{};
          const rarCfg=item?EQUIP_RARITY_CONFIG[item.rarity]:null;
          const cSlotKey="cslot-"+slotIdx;
          // During the guided "slot" step, only Slot 1 (index 0) -- the one
          // the pointer arrow highlights -- should respond to taps.
          const slotBlocked=postEquipLock||levelupLock||(slotStepLock&&slotIdx!==0);
          const cSlotPressStart=e=>{if(slotBlocked)return;e.preventDefault();if(item)setHoldEquip(cSlotKey);longPressTimer.current=setTimeout(()=>{didLongPress.current=true;setHoldEquip(null);if(item){setEquipDetailPage(itemId);setShowEquipPage(true);}},500);};
          const cSlotPressEnd=()=>{clearTimeout(longPressTimer.current);setHoldEquip(null);};
          const showSlotPointer=tutorialStep==="slot"&&slotIdx===0;
          return React.createElement("div",{key:slotIdx,
            onClick:e=>{e.stopPropagation();if(slotBlocked)return;if(didLongPress.current){didLongPress.current=false;return;}setEquipSlotPicker(slotIdx);setShowEquipPage(true);if(tutorialStep==="slot"&&slotIdx===0)setTutorialStep("item");},
            onMouseDown:cSlotPressStart,onMouseUp:cSlotPressEnd,onMouseLeave:cSlotPressEnd,
            onTouchStart:cSlotPressStart,onTouchEnd:cSlotPressEnd,onTouchCancel:cSlotPressEnd,
            style:{position:"relative",flex:1,background:item?"#f7f7ff":"#f5f5f5",border:"1.5px solid "+(item?"#d0ccf7":"#e0e0e0"),borderRadius:10,padding:"8px 10px",textAlign:"center",cursor:slotBlocked?"not-allowed":"pointer",userSelect:"none",opacity:(slotBlocked&&!levelupLock&&!(tutorialStep==="slot"&&slotIdx===0))?0.5:1}},
            showSlotPointer&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-34,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
            item
              ? React.createElement("div",null,
                  React.createElement("div",{style:{position:"relative",display:"inline-block"}},
                    React.createElement("div",{style:{fontSize:22}},item.emoji),
                    holdEquip===cSlotKey&&React.createElement("svg",{width:36,height:36,style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}},
                      React.createElement("circle",{cx:18,cy:18,r:16,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:100,strokeDashoffset:100,strokeLinecap:"round",
                        style:{animation:"holdRing 0.5s linear forwards",transformOrigin:"18px 18px",transform:"rotate(-90deg)"}})
                    )
                  ),
                  React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#000",marginTop:2}},item.name),
                  rarCfg&&React.createElement("div",{style:{fontSize:10,fontWeight:700,color:rarCfg.color,background:rarCfg.bg,borderRadius:4,padding:"1px 5px",display:"inline-block",marginBottom:1}},rarCfg.label),
                  React.createElement("div",{style:{fontSize:11,color:"#534AB7",fontWeight:600}},equipBonusLines(bonuses).map((line,i)=>React.createElement("div",{key:i},line))),
                  lvl>0&&React.createElement("div",{style:{fontSize:10,color:"#888"}},"Lv "+lvl)
                )
              : React.createElement("div",{style:{fontSize:11,color:"#aaa",padding:"8px 0"}},
                  React.createElement("div",{style:{fontSize:20,marginBottom:4}},"＋"),
                  "Slot "+(slotIdx+1)
                )
          );
        })
      )
    ),
    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:12,background:"#ebebeb",borderRadius:10,padding:4}},
      tabs.map(t=>{
        const tabLocked=equipTutorialLock&&t.id!=="levelup";
        const showFlairGuideArrow=flairGuideStep==="flair"&&t.id==="flair";
        return React.createElement("button",{
          key:t.id,
          disabled:tabLocked,
          "data-guide-target":t.id==="flair"?"flair":undefined,
          onClick:()=>{if(tabLocked)return;setTab(t.id);if(flairGuideStep==="flair"&&t.id==="flair")setFlairGuideStep("feed");},
          style:{flex:1,padding:"7px 0",fontSize:13,fontWeight:600,border:"none",borderRadius:7,cursor:tabLocked?"not-allowed":"pointer",
            position:"relative",
            background:tab===t.id?"#fff":"transparent",
            color:tabLocked?"#bbb":(tab===t.id?"#534AB7":"#666"),
            boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,.12)":"none",
            opacity:tabLocked?0.6:1,
            transition:"all .15s"}
        },
          showFlairGuideArrow&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-30,transform:"translate(-50%,0)",fontSize:22,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
          t.label
        );
      })
    ),
    tab==="levelup"&&React.createElement(React.Fragment,null,
      React.createElement("div",{className:"card",style:{marginBottom:10,position:"relative"}},
        tutorialStep==="levelupCreature"&&React.createElement("div",{style:{position:"absolute",left:"50%",bottom:74,transform:"translate(-50%,0)",fontSize:28,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
        React.createElement("div",{className:"section-label"},"Level Up"),
        isMaxLevel
          ? React.createElement("div",{style:{fontSize:12,color:"#888",marginBottom:8}},"Lv "+ownedData.level+" — Max level reached")
          : React.createElement(React.Fragment,null,
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666",marginBottom:6}},
                React.createElement("span",null,"Lv "+ownedData.level+" → "+(ownedData.level+1)),
                React.createElement("span",{style:{color:hasFood?"#666":"#e53935"}},"🍖 "+(currencies.food||0)+" available")
              ),
              React.createElement("div",{style:{fontSize:11,color:"#888",marginBottom:8}},"Next stat: "+STAT_LABELS[LEVEL_STAT_CYCLE[ownedData.nextStatIdx%LEVEL_STAT_CYCLE.length]])
            ),
        React.createElement("button",{className:"btn btn-primary",onClick:doLevelUp,disabled:!hasFood||levelUpButtonLock,style:{marginBottom:0,opacity:levelUpButtonLock?0.5:1}},
          isMaxLevel?"Lv "+ownedData.level:"Level Up — 🍖 "+cost
        )
      ),
      React.createElement("div",{className:"card",style:{marginBottom:10}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}},
          React.createElement("div",{className:"section-label",style:{marginBottom:0}},"Ascension"),
          React.createElement("span",{style:{fontSize:12,color:"#2e7d32",fontWeight:600}},"🍈 "+(currencies.ascensionMelon||0))
        ),
        def.evolutionId&&React.createElement("div",{style:{fontSize:11,color:"#666",marginBottom:6}},
          "Evolves to "+CREATURE_MAP[def.evolutionId].name+" after "+def.ascensionsToEvolve+" ascensions ("+ownedData.ascensions+"/"+def.ascensionsToEvolve+")"
        ),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:6}},
          React.createElement("span",{style:{fontSize:12,color:ownedData.shards>=rootDef.shardsToAscend?"#378ADD":"#666",fontWeight:ownedData.shards>=rootDef.shardsToAscend?700:400}},"Shards: "+ownedData.shards+"/"+rootDef.shardsToAscend),
          React.createElement("div",{className:"shard-bar-bg"},
            React.createElement("div",{className:"shard-bar-fill",style:{width:Math.round(shardsProgress*100)+"%",background:ownedData.shards>=rootDef.shardsToAscend?"#378ADD":"#EF9F27"}})
          ),
          ownedData.shards>=rootDef.shardsToAscend&&React.createElement("span",{style:{fontSize:11,fontWeight:700,color:"#378ADD",whiteSpace:"nowrap"}},"Ready!")
        ),
        canEvolve&&React.createElement("div",{style:{fontSize:11,background:"#FAECE7",color:"#4A1B0C",borderRadius:6,padding:"4px 8px",marginBottom:8}},
          "✨ Ready to evolve into "+CREATURE_MAP[def.evolutionId].name+"!"
        ),
        (()=>{
          if(isMaxAscension)return React.createElement("button",{className:"btn btn-primary",disabled:true,style:{marginBottom:0}},"MAX ASCENSION");
          const needed=rootDef.shardsToAscend;
          const melons=currencies.ascensionMelon||0;
          const shardsUsed=Math.min(ownedData.shards,needed);
          const melonsUsed=needed-shardsUsed;
          const canAscend=ownedData.shards+melons>=needed;
          const action=nextAscendWillEvolve?"Evolve":"Ascend";
          const label=melonsUsed>0
            ?action+" — 🔶 "+shardsUsed+(melonsUsed>0?" + 🍈 "+melonsUsed:"")
            :action+" — 🔶 "+needed+" Shards";
          return React.createElement("button",{className:"btn btn-primary",onClick:doAscend,disabled:!canAscend||ascendButtonLock,style:{marginBottom:0,opacity:ascendButtonLock?0.5:1}},label);
        })()
      )
    ),
    tab==="abilities"&&React.createElement(React.Fragment,null,
      React.createElement("button",{className:"btn btn-primary",onClick:doFeed,disabled:allMaxed||getMelonAvailable(currencies,def.type)<1,style:{marginBottom:10}},
        allMaxed?"All maxed":"Feed — "+getMelonLabel(def.type)+"  ("+getMelonAvailable(currencies,def.type)+" available)"
      ),
      ...abilityKeys.map(k=>{
        const abl=def.abilities[k];
        const lvl=ownedData.abilityLevels[k];
        const isMax=lvl>=5;
        const unlocked=isMax?5:lvl+1;
        const sel=previewPip[k];
        const hasSel=sel!=null;
        const selLocked=hasSel&&sel>=unlocked;
        const displayIdx=hasSel?sel:(isMax?4:lvl);
        const displayText=hasSel?abl.upgrades[sel]:(isMax?abl.upgrades[4]:abl.upgrades[lvl]||abl.upgrades[0]);
        const abilityColors={basic:{bg:"#EAF3DE",color:"#173404"},special:{bg:"#EEEDFE",color:"#26215C"},unique:{bg:"#FFF3CD",color:"#5A3E00"}};
        const ac=abilityColors[k];
        const isStarlitLine=isStarlitAbilityLine(def.id);
        const starlitFmt=formatStarlitAbilityLevel(def.id,k,abl.upgrades,displayIdx);
        const displayFmt=starlitFmt
          ? {isPercent:false, label:starlitFmt.label, amount:starlitFmt.amount}
          : formatAbilityStep(displayText,displayIdx>0?abl.upgrades[displayIdx-1]:null);
        let healAmt=starlitFmt?starlitFmt.healAmt:null;
        if(!starlitFmt){
          for(let i=displayIdx;i>=0;i--){healAmt=extractHeal(abl.upgrades[i]);if(healAmt!=null)break;}
        }
        const abilityTags=getAbilityTags(def.id,k);
        return React.createElement("div",{key:k,className:"ability-card"},
          React.createElement("div",{className:"ability-header",style:{alignItems:"center"}},
            React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}},
              React.createElement("span",{style:{fontSize:8,fontWeight:800,color:"#555",background:"#e8e8e8",borderRadius:20,padding:"2px 7px",textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap"}},k),
              React.createElement("div",{style:{width:40,height:40,borderRadius:8,background:ac.bg,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}},
                abl.icon
                  ? React.createElement("img",{src:abl.icon,style:{width:"100%",height:"100%",objectFit:"cover"}})
                  : React.createElement("span",{style:{fontSize:9,fontWeight:700,color:ac.color,opacity:0.5,userSelect:"none"}},"No img")
              )
            ),
            React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}},
                React.createElement("span",{className:"ability-name"},abl.name),
                React.createElement("div",{style:{display:"flex",flexDirection:"row-reverse",alignItems:"center",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}},
                  ...abilityTags.map(tag=>React.createElement("button",{
                    key:tag,
                    onClick:(e)=>{e.stopPropagation();setAbilityTagPopup(tag);},
                    style:{fontSize:9,fontWeight:800,color:"#534AB7",background:"#EEEDFE",border:"1px solid rgba(83,74,183,0.4)",borderRadius:10,padding:"1px 8px",cursor:"pointer",lineHeight:1.5,flexShrink:0,whiteSpace:"nowrap"}
                  },ABILITY_TAG_DEFS[tag].label))
                )
              ),
              React.createElement(PipRow,{filled:unlocked,total:5,isMax,
                selectedPip:hasSel?sel:undefined,
                onPipClick:(i)=>setPreviewPip(p=>({...p,[k]:p[k]===i?null:i}))
              })
            )
          ),
          React.createElement("p",{className:"ability-desc",style:{color:selLocked?"#aaa":"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}},
            React.createElement("span",null,displayFmt.isPercent?displayFmt.text:displayFmt.label),
            React.createElement("span",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0}},
              (!selLocked||(isStarlitLine&&(k==="basic"||k==="special")))&&displayFmt.amount!=null&&React.createElement("span",{style:{fontWeight:800,color:"#534AB7"}},displayFmt.amount+" DMG"),
              (!selLocked||(isStarlitLine&&(k==="basic"||k==="special")))&&healAmt!=null&&React.createElement("span",{style:{fontWeight:800,color:"#2E8B57"}},healAmt+" HEAL")
            )
          )
        );
      })
    ),
    tab==="flair"&&React.createElement(FlairSection,{displayEmoji,def,onBack:()=>setTab("abilities"),onBananaUsed,ownedData,setOwned,currencies,setCurrencies,flairGuideStep,setFlairGuideStep}),
    tab==="skins"&&React.createElement(SkinSection,{
      ownedData,def,currencies,setCurrencies,setOwned,
      unlockedSkins,setUnlockedSkins,skinShards,setSkinShards
    })
  );
}



export default CreatureDetail;
