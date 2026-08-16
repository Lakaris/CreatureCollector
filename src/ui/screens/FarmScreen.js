// Farm: idle field generation plus plantable crop plots.

import React, { useState, useMemo, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { MELON_TYPES } from "../../data/types.js";
import { PLOT_GROW_MS, PLOT_CROPS, FIELD_RATES, FIELD_SHARD_RATES, FIELD_CAP_HOURS, FIELD_MIN_HOURS, getPlotYield } from "../../data/farm.js";
import { REWARD_DESC } from "../../data/quests.js";
import { seededRand } from "../../core/random.js";
import { formatDuration, formatNum } from "../../core/format.js";
import { DEV_MODE } from "../../config.js";

function FarmScreen({onBack,onPlant,onGoToStore}){
  const { farmPlots, setFarmPlots, currencies, setCurrencies, farmFieldLevel, setFarmFieldLevel, farmFieldLastHarvest, setFarmFieldLastHarvest, farmFieldSeed, setFarmFieldSeed, farmCrops, setFarmCrops, plotUpgrades, specialPurchased, setHarvestPopup, setRevealedCount, setFieldHarvests, setFertilizerUsed, tutorialRestricted, setTutorialRestricted, tutorialStep, setTutorialStep, plotsUnlocked, farmDeepLink, setFarmDeepLink, farmGuideStep, setFarmGuideStep } = useGame();
  // The tutorial's field visit is scripted: storage always reads as full and
  // only Food/Gear Shards drop, so the guided harvest is guaranteed and
  // doesn't hand out melons/candy the player hasn't been introduced to yet.
  const harvestTutorialLock = tutorialRestricted && tutorialStep === "harvest";
  // Floor 10's Ancient Fertilizer hand-off (see fertilizerRevealPointer in
  // App.js): once the player taps into Farm, everything is locked except the
  // Upgrade Field flow itself ("fertilizerUpgrade"); after a successful
  // upgrade the screen stays locked one more beat ("fertilizerDone") to show
  // the closing message below. Split into two flags because only the first
  // one still has an interactive target (Upgrade Field/its confirm modal) --
  // the second locks everything, full stop.
  const fertilizerUpgradeLock = tutorialRestricted && tutorialStep === "fertilizerUpgrade";
  const fertilizerDoneLock = tutorialRestricted && tutorialStep === "fertilizerDone";
  // Once harvested, the tutorial hands the player off to Collection (see
  // levelupNavPointer in App.js) -- interaction on this screen needs to stay
  // locked through that hand-off too, not just during the harvest itself, or
  // Speed Up / Upgrade Field are still sitting right there to tempt a
  // distracted tap. Kept separate from harvestTutorialLock, which also drives
  // the scripted-harvest-state overrides just below (elapsedHours/canHarvest/
  // fieldBonuses) that should stay scoped to the "harvest" step only.
  const farmInteractionLocked = tutorialRestricted && (tutorialStep === "harvest" || tutorialStep === "levelupNav" || fertilizerUpgradeLock || fertilizerDoneLock);
  // Plots stay locked until the "Plots" Progression-quest reward (Set 1) is claimed.
  const plotsLocked=!plotsUnlocked;
  const MAX_PLOTS=6;
  const MAX_MONEY_PLOTS=4;
  const [confirm,setConfirm]=useState(false);
  const [notify,setNotify]=useState(null);
  const [farmTab,setFarmTab]=useState("field");
  const [picking,setPicking]=useState(null); // index of plot being picked for, or null
  const [cancelling,setCancelling]=useState(null); // index of plot being cancelled
  const [showFieldInfo,setShowFieldInfo]=useState(false);
  const [descPopup,setDescPopup]=useState(null); // {emoji,label,desc} for the Accumulated section's item-info popup
  const [showFieldUpgrade,setShowFieldUpgrade]=useState(false);
  const [speedUpConfirm,setSpeedUpConfirm]=useState(null);
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),10000);return()=>clearInterval(t);},[]);
  // The Farm tab renders full-bleed (this screen fills the whole viewport;
  // App.js floats NavBar on top as its own translucent overlay, not a flex
  // sibling that reserves space -- see App.js's "Farm tab" comment). That's
  // fine for scrollable content, but the no-scroll Field layout below needs
  // to know NavBar's real height (padding + safe-area-inset-bottom, so this
  // can't be a hardcoded constant) to reserve room for it, or its last
  // button ends up hidden underneath the overlay. Measured rather than
  // assumed so it stays correct if NavBar's own styling ever changes.
  const [navH,setNavH]=useState(0);
  useEffect(()=>{
    const measure=()=>{const el=document.querySelector(".nav");if(el)setNavH(el.getBoundingClientRect().height);};
    measure();
    window.addEventListener("resize",measure);
    return()=>window.removeEventListener("resize",measure);
  },[]);
  // Jumps straight to a sub-tab when navigated here from e.g. the "Grow a
  // Plot" daily mission; consumed once then cleared, same pattern as
  // CollectionScreen's deepLinkId.
  useEffect(()=>{
    if(farmDeepLink){setFarmTab(farmDeepLink);setFarmDeepLink(null);}
  },[farmDeepLink]);
  function showNotify(msg){setNotify(msg);setTimeout(()=>setNotify(null),2000);}

  const rate=FIELD_RATES[farmFieldLevel]||2;
  const shardRate=FIELD_SHARD_RATES[farmFieldLevel]||1;
  const elapsedMs=now-farmFieldLastHarvest;
  const elapsedHours=harvestTutorialLock?FIELD_CAP_HOURS:elapsedMs/3600000;
  const accumulated=Math.floor(Math.min(elapsedHours,FIELD_CAP_HOURS)*rate);
  const accumulatedShards=Math.floor(Math.min(elapsedHours,FIELD_CAP_HOURS)*shardRate);
  const canHarvest=harvestTutorialLock||(elapsedHours>=FIELD_MIN_HOURS&&accumulated>=1);
  const atCap=elapsedHours>=FIELD_CAP_HOURS;
  const completedHours=Math.floor(Math.min(elapsedHours,FIELD_CAP_HOURS));

  const rawFieldBonuses=useMemo(()=>{
    const bonuses={};
    for(let h=0;h<completedHours;h++){
      const s=farmFieldSeed+h*999983;
      MELON_TYPES.forEach((m,mi)=>{if(seededRand(s+mi*7919)<m.fieldRate)bonuses[m.key]=(bonuses[m.key]||0)+m.fieldAmount;});
      if(seededRand(s+500000)<0.005)bonuses.candy=(bonuses.candy||0)+2;
    }
    return bonuses;
  },[completedHours,farmFieldSeed]);
  const fieldBonuses=harvestTutorialLock?{}:rawFieldBonuses;

  function harvest(){
    if(!canHarvest)return;
    setCurrencies(c=>{
      const n={...c,food:(c.food||0)+accumulated,equipShards:(c.equipShards||0)+accumulatedShards};
      Object.entries(fieldBonuses).forEach(([k,v])=>n[k]=(n[k]||0)+v);
      return n;
    });
    setFarmFieldLastHarvest(Date.now());
    setFarmFieldSeed(Math.random()*1e9|0);
    setFieldHarvests(c=>c+1);
    setNow(Date.now());
    const items=[
      {emoji:"🍖",label:"Food",amount:accumulated},
      {emoji:"🔧",label:"Gear Shards",amount:accumulatedShards},
      ...Object.entries(fieldBonuses).map(([k,v])=>{
        const m=MELON_TYPES.find(m=>m.key===k);
        return {emoji:m?m.emoji:"🍬",label:m?m.label:"Candy",amount:v};
      })
    ];
    setHarvestPopup(items);
    setRevealedCount(0);
    if(harvestTutorialLock)setTutorialStep("levelupNav");
  }

  const fmtTime=(ms)=>formatDuration(ms);

  const maxLevel=FIELD_RATES.length-1;
  const upgradeFertilizerCost=1;
  const canUpgrade=farmFieldLevel<maxLevel&&(currencies.ancientFertilizer||0)>=upgradeFertilizerCost;

  function upgrade(){
    if(!canUpgrade)return;
    setCurrencies(c=>({...c,ancientFertilizer:(c.ancientFertilizer||0)-upgradeFertilizerCost}));
    setFarmFieldLevel(l=>l+1);
    setFertilizerUsed(c=>c+upgradeFertilizerCost);
    showNotify("Field upgraded to Level "+(farmFieldLevel+1)+"!");
  }

  function unlockPlot(){
    setFarmPlots(p=>p+1);
    setConfirm(false);
  }

  return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 0",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e0e0e0",paddingBottom:12,background:"#fff"}},
      onBack&&React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700}},"🌾 Farm"),
      // Dev time-skip buttons live in the header now, swapping which state
      // they poke based on the active tab -- kept out of the scrollable
      // content so they don't shift as the player switches tabs.
      DEV_MODE&&React.createElement("div",{style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}},
        ...(farmTab==="field"?[1,6,12,24]:[1,6,12]).map(h=>React.createElement("button",{key:h,
          onClick:()=>farmTab==="field"
            ?setFarmFieldLastHarvest(t=>t-h*3600000)
            :setFarmCrops(fc=>fc.map(c=>c?{...c,plantedAt:c.plantedAt-h*3600000}:c)),
          style:{padding:"4px 8px",fontSize:11,fontWeight:700,background:"#3C3489",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}},
          "+"+h+"h"
        )),
        React.createElement("button",{
          onClick:()=>farmTab==="field"
            ?setFarmFieldLastHarvest(Date.now())
            :setFarmCrops(fc=>fc.map(c=>c?{...c,plantedAt:Date.now()}:c)),
          style:{padding:"4px 8px",fontSize:11,fontWeight:700,background:"#555",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}},
          "Reset"
        )
      )
    ),
    React.createElement("div",{style:{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}},
      [{id:"field",label:"Field"},{id:"plots",label:"Plots"}].map(t=>{
        const tabLocked=farmInteractionLocked||(t.id==="plots"&&plotsLocked);
        // Disabling the button outright (native `disabled`) would also
        // swallow the click, so the Plots progress-gate stays clickable --
        // that's how its "not yet" toast gets a chance to fire.
        return React.createElement("button",{key:t.id,disabled:farmInteractionLocked,onClick:()=>{
          if(farmInteractionLocked)return;
          if(t.id==="plots"&&plotsLocked){showNotify("Unlocks via progression quest");return;}
          setFarmTab(t.id);
        },style:{
          flex:1,padding:"10px 0",border:"none",background:"none",cursor:tabLocked?"not-allowed":"pointer",
          fontSize:13,fontWeight:600,
          color:tabLocked?"#ccc":(farmTab===t.id?"#534AB7":"#888"),
          borderBottom:farmTab===t.id?"2px solid "+(tabLocked?"#ccc":"#534AB7"):"2px solid transparent",
          transition:"all .15s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:4,
        }},
          t.id==="plots"&&plotsLocked&&React.createElement("i",{className:"ti ti-lock",style:{fontSize:12}}),
          t.label
        );
      })
    ),
    React.createElement("div",{style:{flex:1,minHeight:0,overflowY:"hidden",padding:16,paddingBottom:16+navH,display:"flex",flexDirection:"column"}},
    farmTab==="field"&&React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",gap:12}},
      React.createElement("div",{style:{
        background:"#e8f5e9",border:"3px solid #66bb6a",borderRadius:20,
        padding:"24px 16px",textAlign:"center",position:"relative",flexShrink:0,
      }},
        React.createElement("button",{
          disabled:farmInteractionLocked,
          onClick:e=>{e.stopPropagation();if(farmInteractionLocked)return;setShowFieldInfo(v=>!v);},
          style:{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:farmInteractionLocked?"not-allowed":"pointer",color:"#555",padding:2,lineHeight:1,opacity:farmInteractionLocked?.3:.7}
        },React.createElement("i",{className:"ti ti-info-circle",style:{fontSize:18}})),
        React.createElement("div",{style:{position:"absolute",top:10,left:0,right:0,textAlign:"center",fontSize:14,fontWeight:700,color:"#555",pointerEvents:"none"}},"Lv."+farmFieldLevel),
        React.createElement("div",{style:{fontSize:56,marginBottom:6}},"🌾"),
        React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:2}},accumulated>0?"Ready to harvest":"Growing...")
      ),
      // flex:1 + a spacer just above the action buttons (below) absorbs
      // whatever vertical space is left, pinning Harvest/Upgrade to the
      // bottom of the card instead of the page overflowing on tall screens
      // or leaving a big empty gap on short ones -- same treatment as Hatch.
      React.createElement("div",{style:{background:"#fff",borderRadius:14,padding:"14px 16px",flex:1,minHeight:0,display:"flex",flexDirection:"column",overflow:"hidden"}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,marginBottom:8,color:"#333"}},"Accumulated"),
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,color:"#888",marginBottom:4}},
          React.createElement("span",null,atCap?"⚠️ Storage full! Harvest now":"Time since last harvest: "+fmtTime(elapsedMs)),
          React.createElement("span",null,Math.min(Math.round(elapsedHours/FIELD_CAP_HOURS*100),100)+"%")
        ),
        React.createElement("div",{style:{height:8,background:"#e0e0e0",borderRadius:4,overflow:"hidden",marginBottom:10}},
          React.createElement("div",{style:{
            height:"100%",borderRadius:4,
            width:Math.min(elapsedHours/FIELD_CAP_HOURS*100,100)+"%",
            background:atCap?"#e53935":elapsedHours>=1?"#534AB7":"#aaa",
            transition:"width 1s linear",
          }})
        ),
        (accumulated>0||Object.keys(fieldBonuses).length>0)
          ?React.createElement("div",{style:{marginBottom:10}},
            accumulated>0&&React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("span",{style:{fontSize:20,cursor:"pointer"},onClick:e=>{e.stopPropagation();if(farmInteractionLocked)return;setDescPopup({emoji:"🍖",label:"Food",desc:REWARD_DESC.food||""});}},"🍖"),
                React.createElement("span",{style:{fontSize:13,fontWeight:600}},"Food")
              ),
              React.createElement("span",{style:{fontSize:16,fontWeight:800,color:"#333"}},"+"+formatNum(accumulated))
            ),
            accumulatedShards>0&&React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("span",{style:{fontSize:20,cursor:"pointer"},onClick:e=>{e.stopPropagation();if(farmInteractionLocked)return;setDescPopup({emoji:"🔧",label:"Gear Shards",desc:REWARD_DESC.equipShards||""});}},"🔧"),
                React.createElement("span",{style:{fontSize:13,fontWeight:600}},"Gear Shards")
              ),
              React.createElement("span",{style:{fontSize:16,fontWeight:800,color:"#333"}},"+"+formatNum(accumulatedShards))
            ),
            ...Object.entries(fieldBonuses).map(([k,v])=>{
              const m=MELON_TYPES.find(m=>m.key===k);
              const emoji=m?m.emoji:"🍬";
              const label=m?m.label:"Candy";
              return React.createElement("div",{key:k,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}},
                React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                  React.createElement("span",{style:{fontSize:20,cursor:"pointer"},onClick:e=>{e.stopPropagation();if(farmInteractionLocked)return;setDescPopup({emoji,label,desc:REWARD_DESC[k]||""});}},emoji),
                  React.createElement("span",{style:{fontSize:13,fontWeight:600}},label)
                ),
                React.createElement("span",{style:{fontSize:16,fontWeight:800,color:"#333"}},v)
              );
            })
          )
          :React.createElement("div",{style:{fontSize:12,color:"#aaa",textAlign:"center",padding:"6px 0",marginBottom:10}},"Nothing yet — check back soon"),
        React.createElement("div",{style:{flex:1,minHeight:0}}),
        // "Available in" lives at the bottom of the card, directly above the
        // Harvest button, instead of floating mid-card. The rate itself
        // isn't duplicated here -- it's already in the (i) info popup.
        !canHarvest&&!atCap&&React.createElement("div",{style:{fontSize:12,color:"#888",textAlign:"center",marginBottom:8,flexShrink:0}},
          "Harvest available in "+fmtTime(Math.max(0,farmFieldLastHarvest+3600000-now))
        ),
        React.createElement("div",{style:{display:"flex",gap:8,marginBottom:0,position:"relative",flexShrink:0}},
          harvestTutorialLock&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-40,transform:"translate(-50%,0)",fontSize:28,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
          React.createElement("button",{
            onClick:harvest,
            disabled:!canHarvest||fertilizerUpgradeLock||fertilizerDoneLock,
            style:{flex:1,padding:"12px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:(canHarvest&&!fertilizerUpgradeLock&&!fertilizerDoneLock)?"pointer":"default",
              background:(canHarvest&&!fertilizerUpgradeLock&&!fertilizerDoneLock)?"#4caf50":"#ccc",color:"#fff",transition:"background .2s"},
          },"Harvest"),
          !atCap&&React.createElement("button",{
            disabled:farmInteractionLocked,
            onClick:()=>{
              if(farmInteractionLocked)return;
              const msLeft=Math.max(0,FIELD_CAP_HOURS*3600000-elapsedMs);
              const speedCost=Math.ceil(500*msLeft/(FIELD_CAP_HOURS*3600000));
              if((currencies.gems||0)<speedCost){showNotify("Not enough 💎 Gems!");return;}
              setSpeedUpConfirm({cost:speedCost,onConfirm:()=>{
                const t=Date.now();
                setFarmFieldLastHarvest(h=>h-msLeft);
                setNow(t);
              }});
            },
            style:{padding:"12px 10px",border:"none",borderRadius:10,fontWeight:700,fontSize:13,
              cursor:farmInteractionLocked?"not-allowed":"pointer",background:farmInteractionLocked?"#ccc":"#534AB7",color:"#fff",whiteSpace:"nowrap"}
          },"⚡ "+Math.ceil(500*Math.max(0,FIELD_CAP_HOURS*3600000-elapsedMs)/(FIELD_CAP_HOURS*3600000))+" 💎")
        ),
        React.createElement("div",{style:{marginTop:10}}),
        farmFieldLevel>=maxLevel
          ?React.createElement("div",{style:{textAlign:"center",fontSize:13,color:"#888",padding:"4px 0"}},"Field max level ✅")
          :React.createElement(React.Fragment,null,
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
              React.createElement("div",null)
            ),
            React.createElement("div",{style:{position:"relative"}},
              (farmGuideStep==="upgradeField"||(fertilizerUpgradeLock&&!showFieldUpgrade))&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-32,transform:"translate(-50%,0)",fontSize:26,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
              React.createElement("button",{
                "data-guide-target":"upgradeField",
                disabled:farmInteractionLocked&&!fertilizerUpgradeLock,
                onClick:()=>{if(farmInteractionLocked&&!fertilizerUpgradeLock)return;setShowFieldUpgrade(true);if(farmGuideStep==="upgradeField")setFarmGuideStep(null);},
                style:{width:"100%",padding:"8px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:14,
                  cursor:(farmInteractionLocked&&!fertilizerUpgradeLock)?"not-allowed":"pointer",background:(farmInteractionLocked&&!fertilizerUpgradeLock)?"#ccc":"#534AB7",color:"#fff",transition:"background .2s",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:1},
              },
                React.createElement("span",null,"Upgrade Field"),
                React.createElement("span",{style:{fontSize:11,fontWeight:600,opacity:0.85,color:(currencies.ancientFertilizer||0)>=upgradeFertilizerCost?undefined:"#ffcdd2"}},"🪴 "+(currencies.ancientFertilizer||0)+" / "+upgradeFertilizerCost)
              )
            )
          )
      ),
    ),
    // flex:1 grid with 3 even rows fills the screen edge-to-edge instead of
    // fixed-height cards that leave the page free to scroll -- same
    // no-scroll treatment as Field/Hatch.
    farmTab==="plots"&&React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",gap:12}},

      React.createElement("div",{style:{flex:1,minHeight:0,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"repeat(3,1fr)",gap:12}},
        Array.from({length:MAX_PLOTS},(_,i)=>{
          const isStorePlot=i>=MAX_MONEY_PLOTS;
          const unlocked=isStorePlot?specialPurchased:i<farmPlots;
          const isNext=!isStorePlot&&i===farmPlots&&farmPlots<MAX_MONEY_PLOTS;
          const crop=farmCrops[i];
          const cropDef=crop?PLOT_CROPS.find(c=>c.key===crop.cropKey):null;
          const elapsed=crop?(now-crop.plantedAt):0;
          const ready=crop&&elapsed>=PLOT_GROW_MS;
          const pct=crop?Math.max(0,Math.min(elapsed/PLOT_GROW_MS,1)):0;
          const msLeft=crop?Math.min(Math.max(PLOT_GROW_MS-elapsed,0),PLOT_GROW_MS):0;
          const hLeft=Math.floor(msLeft/3600000);
          const mLeft=Math.floor((msLeft%3600000)/60000);
          const upgradeLevel=plotUpgrades[i]||0;
          const effectiveYield=crop?getPlotYield(cropDef,upgradeLevel,farmFieldLevel):0;
          function harvestPlot(){
            setCurrencies(c=>({...c,[cropDef.key]:(c[cropDef.key]||0)+effectiveYield}));
            setFarmCrops(fc=>{const a=[...fc];a[i]=null;return a;});
          }
          return React.createElement("div",{
            key:i,
            onClick:isStorePlot&&!unlocked?()=>onGoToStore():isNext?()=>setConfirm(true):undefined,
            style:{
              position:"relative",
              background:unlocked?(ready?"#fff9c4":crop?"#e3f2fd":"#e8f5e9"):isNext?"#fff":isStorePlot?"#f3e8ff":"#f0f0f0",
              border:unlocked?(ready?"2px solid #f9a825":crop?"2px solid #42a5f5":"2px solid #66bb6a"):isNext?"2px dashed #aaa":isStorePlot?"2px dashed #9c27b0":"2px dashed #ccc",
              borderRadius:14,padding:"12px",textAlign:"center",
              cursor:(isNext||isStorePlot&&!unlocked)?"pointer":"default",
              opacity:!unlocked&&!isNext&&!isStorePlot?0.5:1,
              transition:"all .15s",
              height:"100%",boxSizing:"border-box",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            }
          },
            // zIndex needed: the growing-crop block just below is also
            // position:absolute,inset:0 (covers the whole tile) and comes
            // later in the DOM, so without it that block paints on top and
            // silently eats every click meant for this button.
            unlocked&&crop&&!ready&&React.createElement("button",{
              onClick:e=>{e.stopPropagation();setCancelling(i);},
              style:{position:"absolute",top:4,left:6,zIndex:1,background:"none",border:"none",fontSize:26,color:"#aaa",cursor:"pointer",lineHeight:1,padding:4}
            },"×"),
            // Growing crops get their own full-height layout: emoji+name stay
            // centered in the middle of the box, while progress/time/speed-up
            // move down to sit just above the bottom edge, instead of the
            // whole group being centered together.
            !(unlocked&&crop&&!ready)&&React.createElement("div",{style:{fontSize:36,marginBottom:8}},unlocked?(cropDef?cropDef.emoji:"🌱"):"🔒"),
            unlocked&&!crop&&React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:6}},
              React.createElement("button",{
                onClick:e=>{e.stopPropagation();setPicking(i);},
                style:{padding:"10px 28px",background:"#4caf50",color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:15}
              },"Grow")
            ),
            unlocked&&crop&&!ready&&React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",padding:12,boxSizing:"border-box"}},
              React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}},
                React.createElement("div",{style:{fontSize:36,marginBottom:8,cursor:"pointer"},onClick:e=>{e.stopPropagation();setDescPopup({emoji:cropDef.emoji,label:cropDef.label,desc:REWARD_DESC[cropDef.key]||""});}},cropDef.emoji),
                React.createElement("div",{style:{fontSize:11,color:"#1565c0",fontWeight:600}},cropDef.label+" × "+formatNum(effectiveYield))
              ),
              React.createElement("div",{style:{width:"100%",flexShrink:0}},
                React.createElement("div",{style:{background:"#e0e0e0",borderRadius:4,height:6,margin:"0 4px 6px",overflow:"hidden",width:"100%",boxSizing:"border-box"}},
                  React.createElement("div",{style:{width:(pct*100)+"%",height:"100%",background:"#534AB7",transition:"width .5s"}})
                ),
                React.createElement("div",{style:{fontSize:11,color:"#888",marginBottom:6}},hLeft+"h "+mLeft+"m left"),
                React.createElement("button",{
                  onClick:e=>{
                    e.stopPropagation();
                    const speedCost=Math.ceil(500*msLeft/PLOT_GROW_MS);
                    if((currencies.gems||0)<speedCost){showNotify("Not enough 💎 Gems!");return;}
                    setSpeedUpConfirm({cost:speedCost,onConfirm:()=>{
                      setCurrencies(c=>({...c,gems:(c.gems||0)-speedCost}));
                      const t=Date.now();
                      setFarmCrops(fc=>{const a=[...fc];a[i]={...a[i],plantedAt:t-PLOT_GROW_MS};return a;});
                      setNow(t);
                    }});
                  },
                  style:{padding:"4px 10px",background:"#7b1fa2",color:"#fff",border:"none",borderRadius:7,fontWeight:700,cursor:"pointer",fontSize:11}
                },"⚡ "+Math.ceil(500*msLeft/PLOT_GROW_MS)+" 💎")
              )
            ),
            unlocked&&crop&&ready&&React.createElement(React.Fragment,null,
              React.createElement("div",{style:{fontSize:11,color:"#e65100",fontWeight:600,marginBottom:6}},"Ready!"),
              React.createElement("button",{
                onClick:e=>{e.stopPropagation();harvestPlot();},
                style:{padding:"6px 14px",background:"#ff9800",color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12}
              },"Harvest")
            ),
            isNext&&React.createElement(React.Fragment,null,
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#555",marginBottom:4}},"Plot "+(i+1)),
              React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#888"}},"Tap to unlock")
            ),
            !unlocked&&!isNext&&React.createElement(React.Fragment,null,
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:isStorePlot?"#7b1fa2":"#aaa",marginBottom:4}},"Plot "+(i+1)),
              isStorePlot
                ?React.createElement("div",{style:{fontSize:11,color:"#7b1fa2",fontWeight:600,textAlign:"center"}},React.createElement("i",{className:"ti ti-shopping-cart",style:{marginRight:3}}),"Starter Pack Exclusive")
                :React.createElement("div",{style:{fontSize:11,color:"#bbb"}},"Locked")
            )
          );
        })
      ),
      farmPlots>=MAX_MONEY_PLOTS&&specialPurchased&&React.createElement("div",{style:{textAlign:"center",fontSize:14,fontWeight:600,color:"#2e7d32",padding:20,flexShrink:0}},"All plots unlocked! 🎉")
    )
    ),
    descPopup&&React.createElement("div",{onClick:()=>setDescPopup(null),style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:260,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:40,marginBottom:8}},descPopup.emoji),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:8,color:"#111"}},descPopup.label),
        React.createElement("div",{style:{fontSize:13,color:"#666",lineHeight:1.5}},descPopup.desc),
        React.createElement("button",{onClick:()=>setDescPopup(null),style:{marginTop:16,padding:"10px 28px",borderRadius:10,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
      )
    ),
    speedUpConfirm&&React.createElement("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:270,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:32,marginBottom:8}},"⚡"),
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:8}},"Speed Up?"),
        React.createElement("div",{style:{fontSize:13,color:"#555",marginBottom:16}},"This will use 💎 "+speedUpConfirm.cost+" Gems."),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setSpeedUpConfirm(null),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel"),
          React.createElement("button",{onClick:()=>{const cb=speedUpConfirm.onConfirm;setSpeedUpConfirm(null);cb();},style:{flex:1,padding:"10px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Confirm")
        )
      )
    ),
    showFieldInfo&&React.createElement("div",{
      onClick:()=>setShowFieldInfo(false),
      style:{position:"absolute",inset:0,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"160px 16px 0",zIndex:10}
    },
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{
        background:"#fff",borderRadius:12,padding:"12px 14px",
        boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
        width:230,textAlign:"left",animation:"fadeIn .15s ease",
      }},
        React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#555",marginBottom:6,paddingBottom:4,borderBottom:"0.5px solid rgba(0,0,0,0.08)"}},"Drops per hour"),
        React.createElement("div",{className:"rates-row"},
          React.createElement("span",{style:{fontSize:12}},React.createElement("b",null,formatNum(rate))," 🍖 Food"),
          React.createElement("span",{style:{fontSize:12,fontWeight:600}},"100%")
        ),
        React.createElement("div",{className:"rates-row"},
          React.createElement("span",{style:{fontSize:12}},React.createElement("b",null,formatNum(shardRate))," 🔧 Gear Shards"),
          React.createElement("span",{style:{fontSize:12,fontWeight:600}},"100%")
        ),
        React.createElement("div",{className:"rates-row"},
          React.createElement("span",{style:{fontSize:12}},React.createElement("b",null,"2")," 🍬 Candy"),
          React.createElement("span",{style:{fontSize:12,fontWeight:600}},"0.5%")
        ),
        ...MELON_TYPES.map(m=>React.createElement("div",{key:m.key,className:"rates-row"},
          React.createElement("span",{style:{fontSize:12}},React.createElement("b",null,m.fieldAmount)," "+m.emoji+" "+m.label),
          React.createElement("span",{style:{fontSize:12,fontWeight:600}},parseFloat((m.fieldRate*100).toFixed(2))+"%")
        ))
      )
    ),
    showFieldUpgrade&&React.createElement("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:290,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:4}},"⬆️ Upgrade Field"),
        React.createElement("div",{style:{fontSize:12,color:"#888",marginBottom:16}},"Level "+farmFieldLevel+" → "+(farmFieldLevel+1)),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6,marginBottom:16,textAlign:"left"}},
          React.createElement("div",{className:"rates-row"},
            React.createElement("span",{style:{fontSize:13}},"🍖 Food rate"),
            React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#2e7d32"}},formatNum(rate)+" → "+(FIELD_RATES[farmFieldLevel+1]?formatNum(FIELD_RATES[farmFieldLevel+1]):"?")+"/hr")
          ),
          React.createElement("div",{className:"rates-row"},
            React.createElement("span",{style:{fontSize:13}},"🔧 Gear Shards rate"),
            React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#2e7d32"}},formatNum(shardRate)+" → "+(FIELD_SHARD_RATES[farmFieldLevel+1]?formatNum(FIELD_SHARD_RATES[farmFieldLevel+1]):"?")+"/hr")
          )
        ),
        React.createElement("div",{style:{fontSize:13,color:(currencies.ancientFertilizer||0)>=upgradeFertilizerCost?"#333":"#e53935",marginBottom:4,fontWeight:600}},"Cost: 🪴 "+(currencies.ancientFertilizer||0)+" / "+upgradeFertilizerCost+" Ancient Fertilizer"),
        React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
          React.createElement("button",{
            disabled:fertilizerUpgradeLock,
            onClick:()=>{if(fertilizerUpgradeLock)return;setShowFieldUpgrade(false);},
            style:{flex:1,padding:"10px 0",background:"#eee",color:fertilizerUpgradeLock?"#bbb":"#333",border:"none",borderRadius:8,fontWeight:600,cursor:fertilizerUpgradeLock?"not-allowed":"pointer",fontSize:13}
          },"Close"),
          React.createElement("div",{style:{position:"relative",flex:1}},
            // Sits just right of the button pointing left into it (not
            // above it) so it doesn't cover the "Cost: ..." line right
            // above the button row -- same convention as DungeonScreen's
            // Fight-button arrow, mirrored.
            fertilizerUpgradeLock&&React.createElement("div",{style:{position:"absolute",left:"100%",top:"50%",transform:"translate(0,-50%)",marginLeft:8,fontSize:24,color:"#534AB7",animation:"pointerBounceXLeft 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬅️"),
            React.createElement("button",{
              disabled:!canUpgrade,
              onClick:()=>{
                upgrade();
                setShowFieldUpgrade(false);
                if(fertilizerUpgradeLock)setTutorialStep("fertilizerDone");
              },
              style:{width:"100%",padding:"10px 0",background:canUpgrade?"#534AB7":"#ccc",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:canUpgrade?"pointer":"default",fontSize:13}
            },"Upgrade")
          )
        )
      )
    ),
    cancelling!==null&&React.createElement("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:36,marginBottom:8}},"⚠️"),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:8}},"Cancel Growth?"),
        React.createElement("div",{style:{fontSize:13,color:"#666",marginBottom:16}},"All progress on this crop will be lost."),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setCancelling(null),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Keep Growing"),
          React.createElement("button",{onClick:()=>{setFarmCrops(fc=>{const a=[...fc];a[cancelling]=null;return a;});setCancelling(null);},style:{flex:1,padding:"10px 0",background:"#e53935",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel")
        )
      )
    ),
    picking!==null&&React.createElement("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"14px 12px",width:300,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:14,fontWeight:700,marginBottom:2,textAlign:"center"}},"🌱 What to grow?"),
        React.createElement("div",{style:{fontSize:11,color:"#888",textAlign:"center",marginBottom:8}},"Time to grow: "+(PLOT_GROW_MS/3600000)+"h"),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}},
          PLOT_CROPS.map(crop=>React.createElement("button",{
            key:crop.key,
            onClick:()=>{
              setFarmCrops(fc=>{const a=[...fc];a[picking]={cropKey:crop.key,plantedAt:Date.now()};return a;});
              onPlant?.();
              setPicking(null);
            },
            style:{display:"flex",flexDirection:"column",alignItems:"center",padding:"7px 4px",background:"#f5f5f5",border:"2px solid #e0e0e0",borderRadius:10,cursor:"pointer",gap:2}
          },
            React.createElement("span",{style:{fontSize:20}},crop.emoji),
            React.createElement("span",{style:{fontSize:10,fontWeight:700,textAlign:"center",lineHeight:1.2}},crop.label),
            React.createElement("span",{style:{fontSize:9,color:"#888"}},"x"+formatNum(getPlotYield(crop,plotUpgrades[picking]||0,farmFieldLevel)))
          ))
        ),
        React.createElement("button",{onClick:()=>setPicking(null),style:{width:"100%",marginTop:8,padding:"8px 0",background:"#eee",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12}},"Cancel")
      )
    ),
    notify&&React.createElement("div",{style:{position:"absolute",top:70,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.75)",color:"#fff",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,pointerEvents:"none",whiteSpace:"nowrap",zIndex:20,animation:"toastFade 2s ease-in-out"}},notify),
    confirm&&React.createElement("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}},
      React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:36,marginBottom:8}},"🔓"),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:16}},"Unlock Plot "+(farmPlots+1)+"?"),
        React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
          React.createElement("button",{onClick:()=>setConfirm(false),style:{flex:1,padding:"10px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Cancel"),
          React.createElement("button",{onClick:unlockPlot,style:{flex:1,padding:"10px 0",background:"#4caf50",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}},"Unlock")
        )
      )
    ),
    harvestTutorialLock&&React.createElement("div",{style:{position:"fixed",left:16,right:16,bottom:96,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:15}},
      "You see a large field filled with food and strange shards, and no one in sight."
    ),
    // Closing beat of the fertilizerReveal/fertilizerUpgrade flow -- it's the
    // very last step, so nothing else advances it, and unlike the harvest
    // text box above it needs an explicit dismiss. Tap-to-close on the box
    // itself (no separate Close button), matching every other narrative text
    // box in the game (TutorialOverlay's own beats, Treasure's reveal card).
    fertilizerDoneLock&&React.createElement("div",{
      onClick:()=>{setTutorialRestricted(false);setTutorialStep(null);},
      style:{position:"fixed",left:16,right:16,bottom:96,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:15,cursor:"pointer"}
    },
      React.createElement("div",{style:{fontSize:14,lineHeight:1.5,color:"#333"}},"You sprinkle the fertilizer and suddenly your field looks healthier than ever! Crops are produced at a faster rate now."),
      React.createElement("div",{style:{fontSize:11,color:"#aaa",textAlign:"right",marginTop:8}},"Tap to close")
    )
  );
}

// ── Treasure ────────────────────────────────────────────────────────────────

export default FarmScreen;
