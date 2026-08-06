// Daily boss fights. Shares the dungeon's tick engine and state shape, but every
// Daily Boss runs the same generic kit (battle/bosses/daily.js) regardless of
// element -- never the dungeon's unique per-boss kits.

import React, { useState, useEffect } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURE_MAP } from "../../../data/creatures.js";
import { STAT_LABELS } from "../../../data/rarity.js";
import { EQUIP_RARITY_CONFIG } from "../../../data/equipment.js";
import { TYPE_EMOJI, TYPE_STRONG_AGAINST } from "../../../data/types.js";
import { getBossStats, DUNGEON_BOSSES } from "../../../data/bosses.js";
import { rollDungeonRewards } from "../../../core/gacha.js";
import { runBattleTick } from "../../../battle/tick.js";
import { makeArenaBattle } from "../../../battle/state.js";
import { aEase } from "../../../battle/geometry.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import UnitInfoPanel, { debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";

function DailyBossScreen({onBack,onViewCreature}){
  const { currencies, setCurrencies, equipmentLevels, equipmentAscensions, equipmentCopies, setEquipmentCopies, dailyBossData, setDailyBossData, dailyBossLevel, setDailyBossLevel, devTimeOffset, setDevTimeOffset, owned, unlockedSkins } = useGame();
  const GRID_ROWS=10,GRID_COLS=6,PLAYER_START_ROW=6,TILE=44,GAP=0;
  const today=new Date().toDateString();
  const boss=DUNGEON_BOSSES[((dailyBossLevel||1)-1)%DUNGEON_BOSSES.length];
  const emoji=TYPE_EMOJI[boss.type]||"👾";
  const [nowMs,setNowMs]=useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setNowMs(Date.now()),1000);return()=>clearInterval(t);},[]);
  const isToday=dailyBossData&&dailyBossData.date===today;
  const fightsToday=isToday?(dailyBossData.fights||0):0;
  const winsToday=isToday?(dailyBossData.wins||0):0;
  const rewardsCollectedToday=dailyBossData&&dailyBossData.rewardsCollectedDate===today;
  const BASE_ATTEMPTS=3;
  const MAX_ATTEMPTS=BASE_ATTEMPTS+winsToday; // each win grants a bonus attempt
  const attemptsLeft=Math.max(0,MAX_ATTEMPTS-fightsToday);
  const canFight=attemptsLeft>0;
  const completed=false; // completion is no longer a concept — resets daily anyway
  const level=dailyBossLevel||1;
  const [phase,setPhase]=useState("idle"); // idle | planning | battling | won | lost
  const [planGrid,setPlanGrid]=useState({}); // "r,c" -> creatureId
  const [foughtBoss,setFoughtBoss]=useState(null); // boss snapshot at fight time
  const [dragId,setDragId]=useState(null); // creatureId being dragged from list
  const [dragCell,setDragCell]=useState(null); // "r,c" being dragged from grid
  const [battleLog,setBattleLog]=useState([]);
  const [logStep,setLogStep]=useState(0);
  const [rewards,setRewards]=useState(null);
  const [previewItem,setPreviewItem]=useState(null);
  const ownedList=Object.values(owned||{}).sort((a,b)=>(b.level||1)-(a.level||1));
  const placedIds=new Set(Object.values(planGrid));
  const creatureListRef=React.useRef(null);
  const dragScroll=React.useRef({armed:false,on:false,x:0,y:0,sl:0,intentScroll:false});
  function onListMouseDown(e){
    dragScroll.current={armed:true,on:false,x:e.pageX,y:e.pageY,sl:creatureListRef.current.scrollLeft,intentScroll:false};
  }
  function onListMouseMove(e){
    const ds=dragScroll.current;if(!ds.armed)return;
    const dx=e.pageX-ds.x,dy=e.pageY-ds.y;
    if(!ds.on){
      if(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){ds.on=true;ds.intentScroll=true;endHold();}
      else if(Math.abs(dy)>6){ds.armed=false;return;}
      else return;
    }
    creatureListRef.current.scrollLeft=ds.sl-dx;
    e.preventDefault();
  }
  function onListMouseUp(){dragScroll.current={armed:false,on:false,x:0,y:0,sl:0,intentScroll:false};}
  const [holdId,setHoldId]=useState(null);
  const [holdPct,setHoldPct]=useState(0);
  const hs=React.useRef({delay:null,raf:null,id:null,fired:false});
  const HOLD_DELAY=350,HOLD_MS=700;
  const [gridInfoCreature,setGridInfoCreature]=useState(null);
  const [bossMinimized,setBossMinimized]=useState(false);
  const [creatureMinimized,setCreatureMinimized]=useState(false);
  const rightPanelRef=React.useRef(null);
  React.useLayoutEffect(()=>{
    if(!rightPanelRef.current)return;
    if(gridInfoCreature){
      setCreatureMinimized(false);
      const el=rightPanelRef.current;
      if(el.scrollHeight>el.clientHeight+4)setBossMinimized(true);
    } else {
      setBossMinimized(false);
      setCreatureMinimized(false);
    }
  },[gridInfoCreature]);
  // Whichever panel the player just expanded wins the space; if the two together
  // don't fit, the OTHER panel auto-minimizes to make room.
  function expandDailyPanel(which){
    requestAnimationFrame(()=>{
      const el=rightPanelRef.current;if(!el)return;
      if(el.scrollHeight>el.clientHeight+4){
        if(which==="boss")setCreatureMinimized(true);else setBossMinimized(true);
      }
    });
  }
  const ghs=React.useRef({timer:null,fired:false});
  const [bossPopupOpen,setBossPopupOpen]=useState(false);
  const bhs=React.useRef({timer:null,fired:false});
  // The boss popup only makes sense once the persistent boss panel is hidden
  // (see .daily-boss-panel's 700px breakpoint in components.css) -- on wide
  // screens there's already room for that panel, so the popup stays off.
  const [isNarrowScreen,setIsNarrowScreen]=useState(()=>typeof window!=="undefined"&&window.innerWidth<=700);
  useEffect(()=>{
    function onResize(){setIsNarrowScreen(window.innerWidth<=700);}
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);
  useEffect(()=>{if(!isNarrowScreen)setBossPopupOpen(false);},[isNarrowScreen]);
  function beginHold(creatureId,onComplete){
    endHold();
    hs.current.fired=false;
    hs.current.delay=setTimeout(()=>{
      hs.current.delay=null;
      hs.current.id=creatureId;
      setHoldId(creatureId);
      const t0=Date.now();
      function tick(){
        const pct=Math.min(100,(Date.now()-t0)/HOLD_MS*100);
        setHoldPct(pct);
        if(pct<100){hs.current.raf=requestAnimationFrame(tick);}
        else{hs.current.fired=true;hs.current.id=null;setTimeout(()=>{setHoldId(null);setHoldPct(0);if(onComplete)onComplete(creatureId);else onViewCreature&&onViewCreature(creatureId);},120);}
      }
      hs.current.raf=requestAnimationFrame(tick);
    },HOLD_DELAY);
  }
  function endHold(){
    if(hs.current.delay){clearTimeout(hs.current.delay);hs.current.delay=null;}
    if(hs.current.raf){cancelAnimationFrame(hs.current.raf);hs.current.raf=null;}
    hs.current.id=null;
    hs.current.fired=false;
    setHoldId(null);setHoldPct(0);
  }
  // ── autobattle engine ──────────────────────────────────────────
  const TICK_MS=500;
  const _savedSpeed=parseInt(localStorage.getItem("battleSpeed")||"1")||1;
  const speedRef=React.useRef(_savedSpeed);
  const moveAnimMsRef=React.useRef(Math.round(TICK_MS/_savedSpeed*0.84));
  const [battleSpeed,setBattleSpeed]=useState(_savedSpeed);
  const BOSS_START_ROW=1, BOSS_START_COL=2; // planning display only
  const bRef=React.useRef(null);
  const tickRef=React.useRef(null);
  const rafRef=React.useRef(null);
  const battleStartRef=React.useRef(0);
  const unitDomRefs=React.useRef(new Map()); // uid -> {el,hpEl}
  const bossDomRef=React.useRef(null);
  const [bSnap,setBSnap]=useState(null);
  const [atkEffects,setAtkEffects]=useState([]);
  const [battleSelected,setBattleSelected]=useState(null); // {type:"unit",uid} | {type:"boss"} | null
  const [bossTimeLeft,setBossTimeLeft]=useState(60);
  const easeInOut=aEase;
  // Player units come from the shared builder, so Daily Boss fights now respect
  // equipment, ascensions, and flair exactly like Dungeon and Arena do.
  function initBattle(grid){
    const bossStats=getBossStats(boss,level);
    const battle=makeArenaBattle(grid,{},owned,level,moveAnimMsRef.current,equipmentLevels,equipmentAscensions);
    battle.boss={row:BOSS_START_ROW,col:BOSS_START_COL,prevRow:BOSS_START_ROW,prevCol:BOSS_START_COL,
      lastMoveTime:Date.now()-moveAnimMsRef.current,
      hp:bossStats.hp,maxHp:bossStats.hp,atkCd:0,moveCd:0,specialCd:10,atk:bossStats.atk,
      // Daily Boss always runs the shared generic kit (daily.js), never the
      // dungeon's unique per-element boss modules -- same kit, different element.
      _bossKey:"daily"};
    battle.log=[];
    return battle;
  }
  // RAF loop — runs continuously, interpolates positions, updates DOM directly
  function startRenderLoop(){
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    function frame(){
      const s=bRef.current;
      if(!s){rafRef.current=null;return;}
      const now=Date.now();
      for(const u of s.playerUnits){
        const refs=unitDomRefs.current.get(u.uid);
        if(!refs)continue;
        const{el,hpEl}=refs;
        if(u.hp<=0){el.style.opacity="0";continue;}
        el.style.opacity="1";
        const t=easeInOut(Math.min(1,(now-u.lastMoveTime)/moveAnimMsRef.current));
        const dr=u.prevRow+(u.row-u.prevRow)*t;
        const dc=u.prevCol+(u.col-u.prevCol)*t;
        el.style.left=(dc*TILE)+"px";
        el.style.top=(dr*TILE)+"px";
        if(hpEl)hpEl.style.width=(Math.max(0,u.hp/u.maxHp)*100)+"%";
      }
      // boss position + HP
      if(s.boss&&bossDomRef.current){
        const bt=easeInOut(Math.min(1,(now-s.boss.lastMoveTime)/moveAnimMsRef.current));
        const bdr=s.boss.prevRow+(s.boss.row-s.boss.prevRow)*bt;
        const bdc=s.boss.prevCol+(s.boss.col-s.boss.prevCol)*bt;
        bossDomRef.current.style.left=(bdc*TILE)+"px";
        bossDomRef.current.style.top=(bdr*TILE)+"px";
        const pct=Math.max(0,s.boss.hp/s.boss.maxHp)*100;
        const bossHpEl=document.getElementById("battle-boss-hp");
        if(bossHpEl)bossHpEl.style.width=pct+"%";
        const bossHpMini=document.getElementById("battle-boss-hp-mini");
        if(bossHpMini)bossHpMini.style.width=pct+"%";
        const bossHpPct=document.getElementById("battle-boss-hp-pct");
        if(bossHpPct)bossHpPct.textContent=Math.ceil(pct)+"%";
      }
      rafRef.current=requestAnimationFrame(frame);
    }
    rafRef.current=requestAnimationFrame(frame);
  }
  function stopLoops(){
    if(tickRef.current){clearInterval(tickRef.current);tickRef.current=null;}
    if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=null;}
  }
  function runTick(){
    const s=bRef.current; if(!s)return;
    const {newFx,acted,now}=runBattleTick(s,{gridRows:GRID_ROWS,gridCols:GRID_COLS});
    if(!acted)return;
    // Per-effect expiry windows, matching Dungeon -- boss kits now emit the same
    // shock/splash/dark/slam effects here that they always did there.
    if(newFx.length)setAtkEffects(prev=>[...prev.filter(e=>(e.isShock?now-e.t<800:e.isSplash?now-e.t<1200:e.isDark?now-e.t<900:e.isEmpSlam?now-e.t<900:now-e.t<700)),...newFx]);
    // snapshot only for log + unit lifecycle (not positions — RAF handles those)
    setBSnap({playerUnits:s.playerUnits.map(u=>({uid:u.uid,creatureId:u.creatureId,hp:u.hp,maxHp:u.maxHp,row:u.row,col:u.col,
        burnTicks:u.burnTicks,poisonTicks:u.poisonTicks,dotTicks:u.dotTicks,rootTicks:u.rootTicks,weakTicks:u.weakTicks,slowTicks:u.slowTicks,shockTicks:u.shockTicks,healImmuneTicks:u.healImmuneTicks})),
      boss:{...s.boss},log:[...s.log],damageDealt:{...s.damageDealt}});
    const bGameElapsed=(Date.now()-battleStartRef.current)*speedRef.current;
    const bTL=Math.min(60,Math.ceil(Math.max(0,60000-bGameElapsed)/1000));
    setBossTimeLeft(bTL);
    if(bTL<=0){stopLoops();setDailyBossData(prev=>({...prev,date:today,fights:(isToday?(prev.fights||0):0)+1,wins:(isToday?(prev.wins||0):0)}));setTimeout(()=>setPhase("lost"),600);return;}
    const anyAlive=s.playerUnits.some(u=>u.hp>0);
    if(s.boss.hp<=0){
      stopLoops();
      const rolled=rollDungeonRewards(5,boss.type,level);
      setRewards(rolled);
      setDailyBossData(prev=>({...prev,date:today,fights:0,wins:0,rewardsCollectedDate:null}));
      setTimeout(()=>setPhase("won"),600);
    } else if(!anyAlive){
      stopLoops();
      setDailyBossData(prev=>({...prev,date:today,fights:(isToday?(prev.fights||0):0)+1,wins:(isToday?(prev.wins||0):0)}));
      if(!rewardsCollectedToday){
        const consolation=rollDungeonRewards(5,boss.type,level);
        setRewards(consolation);
      }
      setTimeout(()=>setPhase("lost"),600);
    }
  }
  function startBattle(){
    stopLoops();
    speedRef.current=speedRef.current; moveAnimMsRef.current=Math.round(TICK_MS/speedRef.current*0.84);
    setFoughtBoss(boss);
    bRef.current=initBattle(planGrid);
    setBSnap(null); setAtkEffects([]); setBattleLog([]); setBattleSelected(null);
    setPhase("battling");setBossTimeLeft(60);battleStartRef.current=Date.now();
    startRenderLoop();
    tickRef.current=setInterval(runTick,TICK_MS);
  }
  function cycleSpeed(){
    const next=battleSpeed===1?2:battleSpeed===2?4:1;
    speedRef.current=next;
    moveAnimMsRef.current=Math.round(TICK_MS/next*0.84);
    localStorage.setItem("battleSpeed",next);
    setBattleSpeed(next);
    if(tickRef.current){clearInterval(tickRef.current);tickRef.current=setInterval(runTick,Math.round(TICK_MS/next));}
  }
  function retry(){
    stopLoops(); bRef.current=null; setBSnap(null); setAtkEffects([]); setBattleSelected(null);
    setPhase("planning"); setBattleLog([]); setLogStep(0);
  }
  useEffect(()=>()=>stopLoops(),[]);
  function collectRewards(){
    setEquipmentCopies(prev=>{const n={...prev};for(const item of rewards)n[item.id]=(n[item.id]||0)+1;return n;});
    if(phase==="won"){setDailyBossLevel(l=>(l||1)+1);}
    if(phase==="lost") setDailyBossData(prev=>({...prev,rewardsCollectedDate:today}));
    setRewards(null);
    setPhase("idle");
  }
  const MAX_DEPLOYED=10;
  function handleCellDrop(r,c){
    const key=r+","+c;
    if(dragId){
      // from creature list — only allow if under limit or replacing an occupied cell
      const deployedCount=Object.keys(planGrid).length;
      if(!planGrid[key]&&deployedCount>=MAX_DEPLOYED)return;
      setPlanGrid(prev=>({...prev,[key]:dragId}));
    } else if(dragCell&&dragCell!==key){
      // from another grid cell — swap if target is occupied
      setPlanGrid(prev=>{
        const n={...prev};
        const moved=n[dragCell];
        const existing=n[key];
        if(existing)n[dragCell]=existing; else delete n[dragCell];
        if(moved)n[key]=moved;
        return n;
      });
    }
    setDragId(null);
    setDragCell(null);
  }
  function removeFromGrid(key){
    setPlanGrid(prev=>{const n={...prev};delete n[key];return n;});
  }
  function autoDeploy(){
    const bossType=boss.type;
    const weakType=TYPE_STRONG_AGAINST[bossType];
    const scored=Object.values(owned||{}).map(oc=>{
      const def=CREATURE_MAP[oc.id];
      if(!def||def.type===weakType)return null;
      const hasAdvantage=TYPE_STRONG_AGAINST[def.type]===bossType;
      return{id:oc.id,score:(oc.level||1)+(hasAdvantage?1000:0),attackType:def.attackType};
    }).filter(Boolean).sort((a,b)=>b.score-a.score);
    const melees=scored.filter(c=>c.attackType==="Melee");
    const ranged=scored.filter(c=>c.attackType==="Ranged");
    // Balanced split: aim for half each, fill gaps with the other type
    const half=Math.floor(MAX_DEPLOYED/2);
    const meleePick=Math.min(melees.length,half+Math.max(0,half-ranged.length));
    const rangedPick=Math.min(ranged.length,MAX_DEPLOYED-meleePick);
    const selectedMelees=melees.slice(0,meleePick);
    const selectedRanged=ranged.slice(0,rangedPick);
    // Melee → front row (row index PLAYER_START_ROW), Ranged → back row (GRID_ROWS-1)
    const grid={};
    selectedMelees.forEach((s,i)=>{if(i<GRID_COLS)grid[PLAYER_START_ROW+","+i]=s.id;});
    selectedRanged.forEach((s,i)=>{if(i<GRID_COLS)grid[(GRID_ROWS-1)+","+i]=s.id;});
    setPlanGrid(grid);
  }
  // Rewards screen
  if(rewards&&(phase==="won"||phase==="lost"))return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 0",flexShrink:0}},
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",marginBottom:4}},phase==="won"?"🎁 Victory Rewards":"🎁 Daily Boss Rewards"),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:16}},rewards.length+" items from "+(foughtBoss||boss).name)
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,alignContent:"start"}},
      rewards.map((item,i)=>{
        const rarCfg=EQUIP_RARITY_CONFIG[item.rarity]||EQUIP_RARITY_CONFIG.common;
        const stats=Object.entries(item.stats||{}).map(([s,v])=>"+"+v+" "+STAT_LABELS[s]).join(" · ");
        return React.createElement("div",{key:i,onClick:()=>setPreviewItem(item),style:{background:rarCfg.bg,border:"1.5px solid "+rarCfg.color+"66",borderRadius:14,padding:"14px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}},
          React.createElement("div",{style:{fontSize:36,lineHeight:1}},item.emoji),
          React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111",textAlign:"center",lineHeight:1.3}},item.name),
          React.createElement("div",{style:{fontSize:10,fontWeight:700,color:rarCfg.color,background:"rgba(255,255,255,0.55)",borderRadius:6,padding:"2px 8px",textTransform:"capitalize"}},rarCfg.label),
          stats&&React.createElement("div",{style:{fontSize:10,color:"#444",textAlign:"center"}},stats)
        );
      })
    ),
    previewItem&&React.createElement("div",{onClick:()=>setPreviewItem(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:320}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8,textAlign:"center"}},previewItem.emoji),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,color:"#111",marginBottom:4,textAlign:"center"}},previewItem.name),
        previewItem.effect&&React.createElement("div",{style:{fontSize:12,color:"#555",lineHeight:1.5,padding:"10px 12px",background:"#f7f7ff",borderRadius:10,border:"1px solid #e0deff",marginBottom:12}},"✦ "+previewItem.effect),
        React.createElement("button",{onClick:()=>setPreviewItem(null),style:{width:"100%",padding:"11px 0",fontSize:14,fontWeight:700,background:"#f0f0f0",color:"#555",border:"none",borderRadius:12,cursor:"pointer"}},"Close")
      )
    ),
    React.createElement("div",{style:{padding:"12px 16px 28px",flexShrink:0}},
      React.createElement("button",{onClick:collectRewards,style:{width:"100%",padding:"14px 0",fontSize:16,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:14,cursor:"pointer"}},"Collect All")
    )
  );
  // Lost with no rewards (already collected today)
  if(phase==="lost"&&!rewards)return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}},
    React.createElement("div",{style:{fontSize:48,lineHeight:1}},"💀"),
    React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#111"}},"Defeated"),
    React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:8}},"You've already collected today's rewards"),
    React.createElement("div",{style:{display:"flex",gap:10}},
      React.createElement("button",{onClick:()=>setPhase("idle"),style:{padding:"12px 28px",fontSize:15,fontWeight:700,background:"#eee",color:"#555",border:"none",borderRadius:12,cursor:"pointer"}},"Back"),
      React.createElement("button",{
        onClick:attemptsLeft>0?()=>setPhase("planning"):undefined,
        style:{padding:"12px 28px",fontSize:15,fontWeight:700,background:attemptsLeft>0?"#534AB7":"#ccc",color:"#fff",border:"none",borderRadius:12,cursor:attemptsLeft>0?"pointer":"default"}
      },"↩ Retry"+(attemptsLeft>0?" ("+attemptsLeft+" left)":"" )+" ")
    )
  );
  // Battle screen
  if(phase==="battling"||phase==="lost"){
    const snap=bSnap||{playerUnits:[],boss:{hp:0,maxHp:1,atk:0},log:[],damageDealt:{}};
    const bossMaxHp=snap.boss.maxHp||1;
    const now=Date.now();
    const selectedUnit=battleSelected?.type==="unit"?snap.playerUnits.find(u=>u.uid===battleSelected.uid):null;
    const selectedBoss=battleSelected?.type==="boss"?snap.boss:null;
    return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
      // header — boss HP updated via RAF (id="battle-boss-hp"), text via React
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:10,background:"#fff",borderBottom:"1px solid #e0e0e0",flexShrink:0}},
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:13,fontWeight:800,color:"#111"}},(foughtBoss||boss).name+" — Lv."+level),
          React.createElement("div",{style:{marginTop:4,height:20,background:"#eee",borderRadius:6,overflow:"hidden",width:"100%",position:"relative"}},
            React.createElement("div",{id:"battle-boss-hp",style:{height:"100%",width:(snap.boss.hp/bossMaxHp*100)+"%",background:"#ef4444",borderRadius:6}}),
            React.createElement("div",{id:"battle-boss-hp-pct",style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)",pointerEvents:"none"}},Math.ceil(snap.boss.hp/bossMaxHp*100)+"%")
          )
        ),
        React.createElement("button",{onClick:cycleSpeed,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},battleSpeed+"x ⚡")
      ),
      // battle grid
      React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center",padding:"12px",overflow:"hidden",gap:6}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:bossTimeLeft<=10?"#ef4444":"#534AB7"}},bossTimeLeft+"s ⏱"),
        React.createElement("div",{className:"battle-row",style:{display:"flex",flexDirection:"row",alignItems:"flex-start",justifyContent:"center",gap:10,width:"100%",maxWidth:"100%",overflowX:"auto",boxSizing:"border-box"}},
        React.createElement("div",{className:"battle-side-panel"},React.createElement(DamageChart,{damageDealt:snap.damageDealt})),
        React.createElement("div",{className:"battle-grid",style:{width:GRID_COLS*TILE,height:GRID_ROWS*TILE,borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0}},
          // boss overlay — position managed by RAF
          React.createElement("div",{
            ref:el=>{bossDomRef.current=el;if(el){el.style.left=(snap.boss.col*TILE)+"px";el.style.top=(snap.boss.row*TILE)+"px";}},
            onClick:()=>setBattleSelected({type:"boss"}),
            style:{position:"absolute",width:2*TILE,height:2*TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"auto",cursor:"pointer",zIndex:10}
          },
            React.createElement("div",{style:{position:"relative",lineHeight:1}},
              React.createElement("div",{style:{fontSize:36,lineHeight:1}},TYPE_EMOJI[boss.type]||"👾"),
              (snap.boss.burnTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:-4,right:-6,fontSize:14,lineHeight:1}},"🔥")
            ),
            React.createElement("div",{style:{width:TILE*1.6,height:5,background:"#fdd",borderRadius:3,marginTop:3,overflow:"hidden"}},
              React.createElement("div",{id:"battle-boss-hp-mini",style:{height:"100%",width:(snap.boss.hp/bossMaxHp*100)+"%",background:"#ef4444",borderRadius:3}})
            )
          ),
          // grid cells (background only)
          React.createElement("div",{style:{position:"absolute",top:0,left:0,display:"grid",gridTemplateColumns:`repeat(${GRID_COLS},${TILE}px)`,gridTemplateRows:`repeat(${GRID_ROWS},${TILE}px)`,gap:0}},
            Array.from({length:GRID_ROWS},(_,r)=>Array.from({length:GRID_COLS},(_,c)=>{
              const BORDER="1px solid #bbb";
              return React.createElement("div",{key:r+","+c,style:{
                width:TILE,height:TILE,
                background:"#fff",
                borderTop:r===0?"0":BORDER,
                borderLeft:c===0?"0":BORDER,
                borderRight:"0",borderBottom:"0",boxSizing:"border-box",
              }});
            })).flat()
          ),
          // attack effects — CSS animations handle smoothness independently of React renders
          atkEffects.map(e=>{
            const color=e.isBoss?"#ef4444":"#a78bfa";
            if(e.isShockwave){
              return React.createElement("div",{key:e.id,style:{
                position:"absolute",
                left:e.col*TILE,top:e.row*TILE,
                width:TILE*2,height:TILE*2,borderRadius:"50%",
                border:"3px solid #ef4444",
                boxShadow:"0 0 12px #ef4444",
                animation:"bossShockwave 0.6s ease-out forwards",
                pointerEvents:"none",zIndex:25,
              }});
            }
            if(e.isRanged){
              const dRow=e.row-e.fromRow, dCol=e.col-e.fromCol;
              const dist=Math.sqrt(dRow*dRow+dCol*dCol)||1;
              const dur=Math.round(300+dist*50);
              return React.createElement("div",{key:e.id,
                ref:el=>{
                  if(!el)return;
                  // force reflow so transition fires from the start position
                  el.getBoundingClientRect();
                  el.style.left=(e.col*TILE+TILE/2)+"px";
                  el.style.top=(e.row*TILE+TILE/2)+"px";
                  el.style.opacity="0";
                },
                style:{
                  position:"absolute",
                  left:e.fromCol*TILE+TILE/2,top:e.fromRow*TILE+TILE/2,
                  width:7,height:7,borderRadius:"50%",
                  background:color,boxShadow:`0 0 6px ${color}`,
                  transform:"translate(-50%,-50%)",
                  transition:`left ${dur}ms linear, top ${dur}ms linear, opacity ${dur*0.3}ms linear ${dur*0.7}ms`,
                  pointerEvents:"none",zIndex:20,
                }
              });
            }
            // melee/boss: impact flash at target
            return React.createElement("div",{key:e.id,style:{
              position:"absolute",
              left:e.col*TILE+TILE/2,top:e.row*TILE+TILE/2,
              width:TILE*0.85,height:TILE*0.85,borderRadius:"50%",
              background:color,
              animation:"atkImpact 0.55s ease-out forwards",
              pointerEvents:"none",zIndex:20,
            }});
          }),
          // units — positioned by RAF, React only manages lifecycle
          snap.playerUnits.map(u=>
            React.createElement("div",{
              key:"u"+u.uid,
              ref:el=>{
                if(el){
                  const hpEl=el.querySelector(".hp-fill");
                  unitDomRefs.current.set(u.uid,{el,hpEl});
                  // set initial position so there's no flash before RAF takes over
                  el.style.left=(u.col*TILE)+"px";
                  el.style.top=(u.row*TILE)+"px";
                }else{unitDomRefs.current.delete(u.uid);}
              },
              onClick:u.hp>0?()=>setBattleSelected({type:"unit",uid:u.uid}):undefined,
              style:{
                position:"absolute",
                width:TILE,height:TILE,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                opacity:u.hp>0?1:0,
                zIndex:5,pointerEvents:u.hp>0?"auto":"none",cursor:u.hp>0?"pointer":"default",
                // NO left/top — RAF manages those
              }
            },
              React.createElement("div",{style:{position:"relative",lineHeight:1}},
                React.createElement(CreatureIcon,{def:CREATURE_MAP[u.creatureId]||{emoji:"❓"},size:20}),
                (u.burnTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:-4,right:-6,fontSize:10,lineHeight:1}},"🔥")
              ),
              React.createElement("div",{style:{position:"absolute",bottom:3,left:3,right:3,height:3,background:"#ddd",borderRadius:2,overflow:"hidden"}},
                React.createElement("div",{className:"hp-fill",style:{height:"100%",width:(u.hp/u.maxHp*100)+"%",background:(u.burnTicks||0)>0?"#f97316":"#22c55e",borderRadius:2}})
              )
            )
          )
        ),
        React.createElement("div",{className:"battle-side-panel"},selectedUnit?React.createElement(UnitInfoPanel,{
          emoji:CREATURE_MAP[selectedUnit.creatureId]?.emoji||"❓",
          image:CREATURE_MAP[selectedUnit.creatureId]?.image,
          name:CREATURE_MAP[selectedUnit.creatureId]?.name||selectedUnit.creatureId,
          subtitle:"Ally",
          hp:selectedUnit.hp,maxHp:selectedUnit.maxHp,
          debuffs:debuffsFor(selectedUnit),
          onClose:()=>setBattleSelected(null)
        }):selectedBoss?React.createElement(UnitInfoPanel,{
          emoji:TYPE_EMOJI[boss.type]||"👾",
          name:(foughtBoss||boss).name,
          subtitle:"Boss",
          hp:selectedBoss.hp,maxHp:selectedBoss.maxHp,shield:selectedBoss.shield,
          debuffs:debuffsFor(selectedBoss),
          onClose:()=>setBattleSelected(null)
        }):React.createElement("div",{style:{width:150,flexShrink:0}}))
        )
      )
    );
  }
  // Planning screen
  if(phase==="planning")return React.createElement(React.Fragment,null,React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    // header
    React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:12,flexShrink:0,background:"#fff",borderBottom:"1px solid #e0e0e0"}},
      React.createElement("button",{onClick:()=>{setPhase("idle");setPlanGrid({});},style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{flex:1,textAlign:"center"}},
        React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},"Planning Phase")
      ),
      React.createElement("button",{onClick:Object.keys(planGrid).length>0?startBattle:undefined,style:{background:Object.keys(planGrid).length>0?"#534AB7":"#ccc",border:"none",borderRadius:10,padding:"6px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:Object.keys(planGrid).length>0?"pointer":"default"}},"Fight →")
    ),
    // grid
    React.createElement("div",{style:{flex:1,overflowY:"auto",display:"flex",justifyContent:"flex-start",alignItems:"flex-start",padding:"16px 0 16px 16px",gap:12}},
      React.createElement("div",{style:{borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative"}},
      React.createElement("div",{
        onMouseDown:isNarrowScreen?()=>{bhs.current.fired=false;bhs.current.timer=setTimeout(()=>{bhs.current.fired=true;setBossPopupOpen(true);},180);}:undefined,
        onMouseUp:isNarrowScreen?()=>{if(bhs.current.timer){clearTimeout(bhs.current.timer);bhs.current.timer=null;}}:undefined,
        onTouchStart:isNarrowScreen?(e)=>{e.preventDefault();bhs.current.fired=false;bhs.current.timer=setTimeout(()=>{bhs.current.fired=true;setBossPopupOpen(true);},180);}:undefined,
        onTouchEnd:isNarrowScreen?()=>{if(bhs.current.timer){clearTimeout(bhs.current.timer);bhs.current.timer=null;}}:undefined,
        style:{position:"absolute",left:2*TILE,top:1*TILE,width:2*TILE,height:2*TILE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,lineHeight:1,pointerEvents:isNarrowScreen?"auto":"none",cursor:isNarrowScreen?"pointer":"default",zIndex:10,userSelect:"none"}
      },TYPE_EMOJI[boss.type]||"👾"),
      React.createElement("div",{
        style:{
          display:"grid",
          gridTemplateColumns:`repeat(${GRID_COLS},${TILE}px)`,
          gridTemplateRows:`repeat(${GRID_ROWS},${TILE}px)`,
          gap:0,
        }
      },
        Array.from({length:GRID_ROWS},(_, r)=>
          Array.from({length:GRID_COLS},(_, c)=>{
            const isPlayerZone=r>=PLAYER_START_ROW;
            const key=r+","+c;
            const creatureId=planGrid[key];
            const def=creatureId?CREATURE_MAP[creatureId]:null;
            const isDivider=r===PLAYER_START_ROW;
            const BORDER="1px solid #bbb";
            return React.createElement("div",{
              key,
              draggable:!!(isPlayerZone&&creatureId),
              onDragStart:isPlayerZone&&creatureId?(e)=>{e.dataTransfer.effectAllowed="move";setDragCell(key);setDragId(null);}:undefined,
              onDragOver:isPlayerZone?(e)=>e.preventDefault():undefined,
              onDrop:isPlayerZone?(e)=>{e.preventDefault();handleCellDrop(r,c);}:undefined,
              onMouseDown:isPlayerZone&&creatureId?(()=>{ghs.current.fired=false;ghs.current.timer=setTimeout(()=>{ghs.current.fired=true;setGridInfoCreature(creatureId);},180);}):undefined,
              onMouseUp:isPlayerZone&&creatureId?(()=>{if(ghs.current.timer){clearTimeout(ghs.current.timer);ghs.current.timer=null;}if(!ghs.current.fired)removeFromGrid(key);}):undefined,
              onTouchStart:isPlayerZone&&creatureId?((e)=>{e.preventDefault();ghs.current.fired=false;ghs.current.timer=setTimeout(()=>{ghs.current.fired=true;setGridInfoCreature(creatureId);},180);}):undefined,
              onTouchEnd:isPlayerZone&&creatureId?(()=>{if(ghs.current.timer){clearTimeout(ghs.current.timer);ghs.current.timer=null;}if(!ghs.current.fired)removeFromGrid(key);}):undefined,
              style:{
                width:TILE,height:TILE,
                background:isPlayerZone?"#f0f0f0":"#fdf7f7",
                borderTop:isDivider?"2.5px solid #534AB7":r===0?"0":BORDER,
                borderLeft:c===0?"0":BORDER,
                borderRight:"0",
                borderBottom:"0",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:26,
                cursor:isPlayerZone?(creatureId?"grab":"default"):"default",
                boxSizing:"border-box",
                userSelect:"none",
              }
            },
            def?React.createElement("div",{style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("span",{style:{position:"absolute",top:1,left:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},TYPE_EMOJI[def.type]||""),React.createElement("span",{style:{position:"absolute",top:1,right:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},def.attackType==="Ranged"?"🏹":"⚔️"),React.createElement(CreatureIcon,{def,size:26})):"");
          })
        ).flat()
      )
      ),
      // right-side info panels
      React.createElement("div",{ref:rightPanelRef,style:{flex:1,alignSelf:"stretch",padding:"0 12px 0 0",minWidth:0,display:"flex",flexDirection:"column",gap:8,overflow:"hidden"}},
        // boss panel (always top 50%)
        (()=>{
          const abilityLabels={basic:"Basic",special:"Special",unique:"Unique"};
          const bossStats=getBossStats(boss,level);
          // Every Daily Boss runs the same generic kit (see battle/bosses/daily.js),
          // just re-flavored by element -- not the dungeon's unique per-boss kits.
          const dailyAbilities={
            basic:{name:boss.type+" Strike",description:"Deals "+boss.type+" damage to the nearest enemy"},
            special:{name:boss.type+" Nova",description:"Deals "+boss.type+" damage around itself, pushing nearby enemies back 1 tile"},
            unique:{name:"Rising Fury",description:"Gains increased attack over time"},
          };
          return React.createElement("div",{className:"daily-boss-panel",style:{flex:"0 0 50%",background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",overflowY:"auto",boxSizing:"border-box",position:"relative"}},
            React.createElement("button",{onClick:()=>setBossMinimized(p=>{const next=!p;if(!next)expandDailyPanel("boss");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},bossMinimized?"＋":"－"),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:bossMinimized?0:4}},
              React.createElement("div",{style:{fontSize:28,lineHeight:1}},TYPE_EMOJI[boss.type]||"👾"),
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},boss.name),
                React.createElement("div",{style:{fontSize:11,color:"#666",fontWeight:600}},boss.type+" · Lv."+level)
              )
            ),
            !bossMinimized&&Object.entries(dailyAbilities).map(([k,abl])=>{
              return React.createElement("div",{key:k,style:{marginBottom:10}},
                React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}},abilityLabels[k]||k),
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},abl.name),
                React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},abl.description)
              );
            })
          );
        })(),
        // creature panel (bottom 50%, shown when a creature is held)
        (()=>{
          if(!gridInfoCreature)return React.createElement("div",{style:{flex:"0 0 50%"}});
          const abilityLabels={basic:"Basic",special:"Special",unique:"Unique"};
          const def=CREATURE_MAP[gridInfoCreature];
          const oc=owned&&owned[gridInfoCreature];
          if(!def)return React.createElement("div",{style:{flex:"0 0 50%"}});
          return React.createElement("div",{style:{flex:"0 0 50%",background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",overflowY:"auto",boxSizing:"border-box",position:"relative"}},
            React.createElement("button",{onClick:()=>setCreatureMinimized(p=>{const next=!p;if(!next)expandDailyPanel("creature");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},creatureMinimized?"＋":"－"),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:creatureMinimized?0:12}},
              React.createElement(CreatureIcon,{def,size:28}),
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},def.name),
                React.createElement("div",{style:{fontSize:11,color:"#666",fontWeight:600}},def.type+" · "+(def.attackType||"Melee")+(oc?" · Lv."+oc.level:""))
              )
            ),
            !creatureMinimized&&def.abilities&&Object.entries(def.abilities).map(([k,abl])=>{
              if(!abl)return null;
              const lvl=oc&&oc.abilityLevels?oc.abilityLevels[k]||0:0;
              const desc=abl.upgrades?abl.upgrades[Math.min(lvl,abl.upgrades.length-1)]:"";
              return React.createElement("div",{key:k,style:{marginBottom:10}},
                React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}},abilityLabels[k]||k),
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},abl.name),
                desc&&React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},desc)
              );
            })
          );
        })()
      )
    ),
    // creature list
    React.createElement("div",{
      style:{background:"#fff",borderTop:"1px solid #e0e0e0",padding:"10px 12px 24px",flexShrink:0},
      onDragOver:e=>e.preventDefault(),
      onDrop:e=>{
        e.preventDefault();
        if(dragCell){removeFromGrid(dragCell);}
        setDragId(null);setDragCell(null);
      }
    },
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},
        React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
          React.createElement("span",{style:{fontSize:22,fontWeight:800,color:Object.keys(planGrid).length>=MAX_DEPLOYED?"#ef4444":"#111"}},Object.keys(planGrid).length),
          React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#aaa"}},"/"+MAX_DEPLOYED+" deployed")
        ),
        React.createElement("button",{onClick:autoDeploy,style:{padding:"8px 16px",fontSize:14,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:12,cursor:"pointer"}},"⚡ Auto Deploy")
      ),
      React.createElement("div",{
        ref:creatureListRef,
        onMouseDown:onListMouseDown,
        onMouseMove:onListMouseMove,
        onMouseUp:onListMouseUp,
        onMouseLeave:onListMouseUp,
        className:"creature-list",
        style:{display:"grid",gridAutoFlow:"column",gridTemplateRows:"repeat(2,58px)",gridAutoColumns:52,gap:6,overflowX:"auto",overflowY:"hidden",cursor:"grab",userSelect:"none"}},
        ownedList.map(oc=>{
          const def=CREATURE_MAP[oc.id];
          if(!def)return null;
          const isPlaced=placedIds.has(oc.id);
          const isHolding=holdId===oc.id&&holdPct>0;
          const CIRC=2*Math.PI*18;
          return React.createElement("div",{
            key:oc.id,
            "data-creature":oc.id,
            draggable:!isPlaced,
            onDragStart:!isPlaced?(e)=>{
              if(dragScroll.current.intentScroll){e.preventDefault();return;}
              if(hs.current.id===oc.id){e.preventDefault();return;}
              endHold();e.dataTransfer.effectAllowed="move";setDragId(oc.id);setDragCell(null);
            }:undefined,
            onMouseDown:()=>beginHold(oc.id),
            onMouseUp:endHold,
            onTouchStart:(e)=>{e.preventDefault();beginHold(oc.id);},
            onTouchEnd:endHold,
            style:{
              flexShrink:0,
              width:52,height:58,
              position:"relative",
              background:"none",
              border:"none",
              borderRadius:10,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
              cursor:isPlaced?"default":"grab",
              userSelect:"none",
            }
          },
            isHolding&&holdPct>15&&React.createElement("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"},viewBox:"0 0 52 58"},
              React.createElement("circle",{cx:26,cy:29,r:18,fill:"none",stroke:"#e8e8e8",strokeWidth:3}),
              React.createElement("circle",{cx:26,cy:29,r:18,fill:"none",stroke:"#a8a3d8",strokeWidth:3,
                strokeDasharray:CIRC,strokeDashoffset:CIRC*(1-holdPct/100),
                strokeLinecap:"round",transform:"rotate(-90 26 29)"})
            ),
            React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:1,opacity:isPlaced?0.35:1}},
              React.createElement("div",{style:{position:"relative",lineHeight:1}},
                React.createElement("div",{style:{position:"absolute",top:-2,left:-6,fontSize:10,lineHeight:1}},TYPE_EMOJI[def.type]||""),
              React.createElement("div",{style:{position:"absolute",top:-2,right:-6,fontSize:10,lineHeight:1}},def.attackType==="Ranged"?"🏹":"⚔️"),
                React.createElement(CreatureIcon,{def,size:24,style:{marginTop:6}})
              ),
              React.createElement("div",{style:{fontSize:8,color:"#333",fontWeight:600,textAlign:"center",lineHeight:1.2,maxWidth:48,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},def.name),
              React.createElement("div",{style:{fontSize:8,color:"#666",fontWeight:700}},"Lv."+oc.level)
            )
          );
        })
      )
    )
  ),
  bossPopupOpen&&isNarrowScreen&&(()=>{
    const abilityLabels={basic:"Basic",special:"Special",unique:"Unique"};
    const dailyAbilities={
      basic:{name:boss.type+" Strike",description:"Deals "+boss.type+" damage to the nearest enemy"},
      special:{name:boss.type+" Nova",description:"Deals "+boss.type+" damage around itself, pushing nearby enemies back 1 tile"},
      unique:{name:"Rising Fury",description:"Gains increased attack over time"},
    };
    return React.createElement("div",{onClick:()=>setBossPopupOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"18px",width:"100%",maxWidth:320,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",position:"relative"}},
        React.createElement("button",{onClick:()=>setBossPopupOpen(false),style:{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},"×"),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12}},
          React.createElement("div",{style:{fontSize:32,lineHeight:1}},TYPE_EMOJI[boss.type]||"👾"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:16,fontWeight:800,color:"#111"}},boss.name),
            React.createElement("div",{style:{fontSize:12,color:"#666",fontWeight:600}},boss.type+" · Lv."+level)
          )
        ),
        Object.entries(dailyAbilities).map(([k,abl])=>
          React.createElement("div",{key:k,style:{marginBottom:10}},
            React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}},abilityLabels[k]||k),
            React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},abl.name),
            React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},abl.description)
          )
        )
      )
    );
  })(),
  );
  // Main screen
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e0e0e0",background:"#fff",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700}},"👹 Daily Boss")
    ),
    React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",gap:8}},
      React.createElement("div",{style:{fontSize:100,lineHeight:1,marginBottom:8}},emoji),
      React.createElement("div",{style:{fontSize:24,fontWeight:800,color:"#111",marginBottom:2}},boss.name),
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",background:"#f0effe",borderRadius:20,padding:"3px 14px",marginBottom:4}},"Lv. "+level),
      completed
        ?React.createElement("div",{style:{background:"#e8f5e9",borderRadius:12,padding:"14px 24px",textAlign:"center"}},
            React.createElement("div",{style:{fontSize:20,marginBottom:4}},"✅"),
            React.createElement("div",{style:{fontSize:14,fontWeight:700,color:"#2e7d32"}},"Completed today"),
            React.createElement("div",{style:{fontSize:12,color:"#666",marginTop:4}},"Come back tomorrow for a new boss")
          )
        :(()=>{
            const noon=new Date(nowMs);noon.setDate(noon.getDate()+1);noon.setHours(12,0,0,0);
            const s=Math.max(0,Math.floor((noon-nowMs)/1000));
            const hh=String(Math.floor(s/3600)).padStart(2,"0");
            const mm=String(Math.floor(s%3600/60)).padStart(2,"0");
            const ss=String(s%60).padStart(2,"0");
            return React.createElement("div",{style:{width:"100%",maxWidth:300,textAlign:"center"}},
              rewardsCollectedToday&&React.createElement("div",{style:{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",marginBottom:12,textAlign:"center"}},
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#16a34a",marginBottom:2}},"✅ Rewards Collected Today"),
                React.createElement("div",{style:{fontSize:11,color:"#15803d"}},"Defeat the boss for more rewards")
              ),
              React.createElement("div",{style:{textAlign:"center",marginBottom:16}},
                React.createElement("div",{style:{fontWeight:700,fontSize:14,color:"#534AB7",marginBottom:3}},attemptsLeft+"/"+MAX_ATTEMPTS+" Attempts Left"),
                React.createElement("div",{style:{fontSize:12,color:"#aaa"}},
                  "Resets in ",
                  React.createElement("span",{style:{fontVariantNumeric:"tabular-nums",fontWeight:600,color:"#888"}},hh+":"+mm+":"+ss)
                )
              ),
              attemptsLeft>0
                ?React.createElement("button",{onClick:()=>setPhase("planning"),style:{width:"100%",padding:"15px 0",fontSize:16,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:14,cursor:"pointer"}},"⚔️ Fight")
                :React.createElement("div",{style:{background:"#fef2f2",borderRadius:12,padding:"12px",color:"#ef4444",fontSize:13,fontWeight:600}},"No attempts left · come back tomorrow")
            );
          })()
    )
  );
}

export default DailyBossScreen;
