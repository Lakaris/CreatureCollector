// Dungeon boss fights: planning/deploy phase, the tick loop, per-boss AI, and FX.

import React, { useState, useEffect } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURE_MAP } from "../../../data/creatures.js";
import { STAT_LABELS } from "../../../data/rarity.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS } from "../../../data/equipment.js";
import { TYPE_EMOJI, TYPE_STRONG_AGAINST } from "../../../data/types.js";
import { getBossStats, DUNGEON_BOSSES } from "../../../data/bosses.js";
import { rollDungeonRewards } from "../../../core/gacha.js";
import { DUNGEON_GRID_COLS, DUNGEON_GRID_ROWS, DUNGEON_PLAYER_START_ROW, DUNGEON_TILE, DUNGEON_MAX_DEPLOYED } from "../../../battle/constants.js";
import { aEase } from "../../../battle/geometry.js";
import { getBossModule, getHighlightTiles } from "../../../battle/bosses/registry.js";
import { makeBossContext, makePlanGeometry } from "../../../battle/bosses/context.js";
import { makeArenaBattle } from "../../../battle/state.js";
import { runBattleTick } from "../../../battle/tick.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import UnitInfoPanel, { debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import { ABILITY_TAG_DEFS, getAbilityTags } from "../../../core/abilityText.js";

function DungeonScreen({onBack,onClear,onViewCreature}){
  const { currencies, setCurrencies, equipmentLevels, equipmentAscensions, equipmentCopies, setEquipmentCopies, passRechargeCount, setPassRechargeCount, dungeonBossLevels, setDungeonBossLevels, owned, unlockedSkins } = useGame();
  const PASS_COST=1;
  const rechargeCost=100*Math.pow(2,passRechargeCount);
  // battle state
  const [dPlanning,setDPlanning]=useState(false);
  const [dPlanGrid,setDPlanGrid]=useState({});
  const [dPlanHighlight,setDPlanHighlight]=useState(null);
  const [dBossMinimized,setDBossMinimized]=useState(false);
  const [dCreatureMinimized,setDCreatureMinimized]=useState(false);
  const [dAbilityTagPopup,setDAbilityTagPopup]=useState(null);
  const [dBattling,setDBattling]=useState(false);
  const [dBattleOutcome,setDBattleOutcome]=useState(null);
  const [dBSnap,setDBSnap]=useState(null);
  const [dAtkFx,setDAtkFx]=useState([]);
  const [dBattleSelected,setDBattleSelected]=useState(null); // {type:"unit",uid} | {type:"boss"} | null
  const [dSpeed,setDSpeed]=useState(1);
  const [dTimeLeft,setDTimeLeft]=useState(60);
  const dSpeedRef=React.useRef(1);
  const dAnimRef=React.useRef(Math.round(500*0.84));
  const dBRef=React.useRef(null);
  const dTickRef=React.useRef(null);
  const dRafRef=React.useRef(null);
  const dBattleStartRef=React.useRef(0);
  const dUnitRefs=React.useRef(new Map());
  const dBossDomRef=React.useRef(null);
  const [dDragId,setDDragId]=useState(null);
  const [dDragCell,setDDragCell]=useState(null);
  const [dHoldId,setDHoldId]=useState(null);
  const [dHoldPct,setDHoldPct]=useState(0);
  const [dGridInfoCreature,setDGridInfoCreature]=useState(null);
  const dRightPanelRef=React.useRef(null);
  React.useLayoutEffect(()=>{
    if(!dRightPanelRef.current)return;
    if(dGridInfoCreature){
      setDCreatureMinimized(false);
      const el=dRightPanelRef.current;
      if(el.scrollHeight>el.clientHeight+4)setDBossMinimized(true);
    } else {
      setDBossMinimized(false);
      setDCreatureMinimized(false);
    }
  },[dGridInfoCreature]);
  // Whichever panel the player just expanded wins the space; if the two together
  // don't fit, the OTHER panel auto-minimizes to make room.
  function expandDPanel(which){
    requestAnimationFrame(()=>{
      const el=dRightPanelRef.current;if(!el)return;
      if(el.scrollHeight>el.clientHeight+4){
        if(which==="boss")setDCreatureMinimized(true);else setDBossMinimized(true);
      }
    });
  }
  const dhs=React.useRef({delay:null,raf:null,id:null,fired:false});
  const dCreatureListRef=React.useRef(null);
  const dDragScroll=React.useRef({armed:false,on:false,x:0,y:0,sl:0,intentScroll:false});
  const dWonBossRef=React.useRef(null);
  const ownedList=Object.values(owned||{}).sort((a,b)=>(b.level||1)-(a.level||1)).filter(o=>o&&CREATURE_MAP[o.id]);
  const dPlacedIds=new Set(Object.values(dPlanGrid));
  function stopDLoops(){if(dTickRef.current){clearInterval(dTickRef.current);dTickRef.current=null;}if(dRafRef.current){cancelAnimationFrame(dRafRef.current);dRafRef.current=null;}}
  React.useEffect(()=>()=>stopDLoops(),[]);
  function startDRenderLoop(){
    if(dRafRef.current)cancelAnimationFrame(dRafRef.current);
    function frame(){
      const s=dBRef.current;if(!s){dRafRef.current=null;return;}
      const now=Date.now();
      for(const u of[...s.playerUnits,...s.enemyUnits]){
        const refs=dUnitRefs.current.get(u.uid);if(!refs)continue;
        const{el,hpEl}=refs;
        if(u.hp<=0){el.style.opacity="0";continue;}
        el.style.opacity="1";
        const t=aEase(Math.min(1,(now-u.lastMoveTime)/dAnimRef.current));
        el.style.left=((u.prevCol+(u.col-u.prevCol)*t)*DUNGEON_TILE)+"px";
        el.style.top=((u.prevRow+(u.row-u.prevRow)*t)*DUNGEON_TILE)+"px";
        if(hpEl)hpEl.style.width=(Math.max(0,u.hp/u.maxHp)*100)+"%";
      }
      if(s.boss&&dBossDomRef.current){
        const b=s.boss;
        const bt=aEase(Math.min(1,(now-b.lastMoveTime)/dAnimRef.current));
        dBossDomRef.current.style.left=((b.prevCol+(b.col-b.prevCol)*bt)*DUNGEON_TILE)+"px";
        dBossDomRef.current.style.top=((b.prevRow+(b.row-b.prevRow)*bt)*DUNGEON_TILE)+"px";
        const hpFill=dBossDomRef.current.querySelector(".dboss-hp");
        if(hpFill)hpFill.style.width=(Math.max(0,b.hp/b.maxHp)*100)+"%";
        const shFill=dBossDomRef.current.querySelector(".dboss-shield");
        if(shFill){shFill.style.width=(b.shield&&b.maxHp?(Math.min(1,b.shield/b.maxHp)*100):0)+"%";}
      }
      dRafRef.current=requestAnimationFrame(frame);
    }
    dRafRef.current=requestAnimationFrame(frame);
  }
  function runDTick(){
    const s=dBRef.current;if(!s)return;
    const {newFx,acted,now}=runBattleTick(s,{gridRows:DUNGEON_GRID_ROWS,gridCols:DUNGEON_GRID_COLS});
    if(!acted)return;
    const b=s.boss;
    if(newFx.length)setDAtkFx(prev=>[...prev.filter(e=>(e.isShock?now-e.t<800:e.isSplash?now-e.t<1200:e.isDark?now-e.t<900:e.isEmpSlam?now-e.t<900:now-e.t<700)),...newFx]);
    setDBSnap({playerUnits:s.playerUnits.map(u=>({...u})),enemyUnits:s.enemyUnits.map(u=>({...u})),boss:b?{...b}:null,damageDealt:{...s.damageDealt}});
    const dGameElapsed=(Date.now()-dBattleStartRef.current)*dSpeedRef.current;
    const dTL=Math.min(60,Math.ceil(Math.max(0,60000-dGameElapsed)/1000));
    setDTimeLeft(dTL);
    if(dTL<=0){stopDLoops();setTimeout(()=>setDBattleOutcome("lost"),600);return;}
    const anyP=s.playerUnits.some(u=>u.hp>0);
    const bossAlive=b&&b.hp>0;
    const anyE=s.enemyUnits.some(u=>u.hp>0);
    if(!bossAlive&&!anyE){
      stopDLoops();
      const bossLevel=dungeonBossLevels?.[selected]||1;
      dWonBossRef.current={boss:dBRef.current._boss,bossLevel};
      setDungeonBossLevels(p=>({...p,[selected]:Math.min(10,(p[selected]||1)+1)}));
      const rolled=rollDungeonRewards(1,dBRef.current._boss?.type,bossLevel);
      setCurrencies(c=>({...c,dungeonPass:(c.dungeonPass||0)-1}));
      setEquipmentCopies(prev=>{const n={...prev};for(const item of rolled)n[item.id]=(n[item.id]||0)+1;return n;});
      onClear&&onClear(1);
      setTimeout(()=>setDBattleOutcome("won"),600);
    } else if(!anyP){
      stopDLoops();
      setTimeout(()=>setDBattleOutcome("lost"),600);
    }
  }
  function dRestartFight(){
    stopDLoops();
    setDBattling(false);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDBattleSelected(null);
    setDPlanning(true);
  }
  function dFight(){
    stopDLoops();
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const bossLevel=dungeonBossLevels?.[selected]||1;
    const enemyGrid={}; // dungeon boss fights have no regular minions (nature spawns vines separately)
    setDPlanning(false);setDBattling(true);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDBattleSelected(null);setDTimeLeft(60);dBattleStartRef.current=Date.now();
    const battle=makeArenaBattle(dPlanGrid,enemyGrid,owned,bossLevel,dAnimRef.current,equipmentLevels,equipmentAscensions);
    battle._boss=boss;
    const bStats=getBossStats(boss,bossLevel);
    const bRow=1,bCol=Math.floor((DUNGEON_GRID_COLS-2)/2);
    battle.boss={row:bRow,col:bCol,prevRow:bRow,prevCol:bCol,lastMoveTime:Date.now()-dAnimRef.current,hp:bStats.hp,maxHp:bStats.hp,atk:bStats.atk,atkCd:0,moveCd:0,specialCd:10,_bossKey:boss.key};
    if(boss.key==='nature'){
      const vNow=Date.now();const vHP=Math.round(80*4*(1+bossLevel*0.15));const vATK=Math.round(25*(1+bossLevel*0.1));
      battle.enemyUnits.push(
        {uid:"vm0",creatureId:"__vine_minion",row:4,col:1,prevRow:4,prevCol:1,lastMoveTime:vNow-dAnimRef.current,hp:vHP,maxHp:vHP,atk:vATK,def:15,spd:1,isRanged:false,atkCd:3,specialCd:8,isVineMinion:true},
        {uid:"vm1",creatureId:"__vine_minion",row:4,col:4,prevRow:4,prevCol:4,lastMoveTime:vNow-dAnimRef.current,hp:vHP,maxHp:vHP,atk:vATK,def:15,spd:1,isRanged:false,atkCd:5,specialCd:12,isVineMinion:true}
      );
    }
    dBRef.current=battle;
    startDRenderLoop();
    dTickRef.current=setInterval(runDTick,Math.round(500/dSpeedRef.current));
  }
  function cycleDSpeed(){
    const next=dSpeed===1?2:dSpeed===2?4:1;
    dSpeedRef.current=next;dAnimRef.current=Math.round(500/next*0.84);setDSpeed(next);
    if(dTickRef.current){clearInterval(dTickRef.current);dTickRef.current=setInterval(runDTick,Math.round(500/next));}
  }
  function dAutoDeploy(){
    const bossType=boss?.type;
    const weakType=bossType&&TYPE_STRONG_AGAINST[bossType];
    const scored=Object.values(owned||{}).map(oc=>{
      const def=CREATURE_MAP[oc.id];
      if(!def||def.type===weakType)return null;
      const hasAdvantage=bossType&&TYPE_STRONG_AGAINST[def.type]===bossType;
      return{id:oc.id,score:(oc.level||1)+(hasAdvantage?1000:0),attackType:def.attackType};
    }).filter(Boolean).sort((a,b)=>b.score-a.score);
    const melees=scored.filter(c=>c.attackType==="Melee");const ranged=scored.filter(c=>c.attackType==="Ranged");
    const half=Math.floor(DUNGEON_MAX_DEPLOYED/2);const meleePick=Math.min(melees.length,half+Math.max(0,half-ranged.length));const rangedPick=Math.min(ranged.length,DUNGEON_MAX_DEPLOYED-meleePick);
    const grid={};
    melees.slice(0,meleePick).forEach((s,i)=>{if(i<DUNGEON_GRID_COLS)grid[DUNGEON_PLAYER_START_ROW+","+i]=s.id;});
    ranged.slice(0,rangedPick).forEach((s,i)=>{if(i<DUNGEON_GRID_COLS)grid[(DUNGEON_GRID_ROWS-1)+","+i]=s.id;});
    setDPlanGrid(grid);
  }
  function handleDCellDrop(r,c){
    if(r<DUNGEON_PLAYER_START_ROW)return;
    const key=r+","+c;
    if(dDragCell&&dDragCell!==key){const cid=dPlanGrid[dDragCell];setDPlanGrid(p=>{const n={...p};delete n[dDragCell];if(cid&&r>=DUNGEON_PLAYER_START_ROW)n[key]=cid;return n;});}
    else if(dDragId){if(!dPlacedIds.has(dDragId)&&Object.keys(dPlanGrid).length<DUNGEON_MAX_DEPLOYED)setDPlanGrid(p=>({...p,[key]:dDragId}));}
    setDDragId(null);setDDragCell(null);
  }
  function dEndHoldDoc(){dEndHold();document.removeEventListener('mouseup',dEndHoldDoc);document.removeEventListener('touchend',dEndHoldDoc);}
  function dBeginHold(id){
    if(dhs.current.delay)clearTimeout(dhs.current.delay);
    if(dhs.current.navTimer){clearTimeout(dhs.current.navTimer);dhs.current.navTimer=null;}
    dhs.current.fired=false;
    document.addEventListener('mouseup',dEndHoldDoc);
    document.addEventListener('touchend',dEndHoldDoc);
    dhs.current.delay=setTimeout(()=>{dhs.current.delay=null;dhs.current.id=id;setDHoldId(id);
      let start=null;
      const heldId=id;
      function raf(ts){if(!start)start=ts;const pct=Math.min(100,(ts-start)/700*100);setDHoldPct(pct);
        if(pct<100)dhs.current.raf=requestAnimationFrame(raf);
        else{dhs.current.fired=true;dhs.current.id=null;
          dhs.current.navTimer=setTimeout(()=>{dhs.current.navTimer=null;setDHoldId(null);setDHoldPct(0);onViewCreature&&onViewCreature(heldId);},200);}}
      dhs.current.raf=requestAnimationFrame(raf);
    },350);
  }
  function dEndHold(){
    if(dhs.current.delay){clearTimeout(dhs.current.delay);dhs.current.delay=null;}
    if(dhs.current.raf){cancelAnimationFrame(dhs.current.raf);dhs.current.raf=null;}
    if(dhs.current.navTimer){clearTimeout(dhs.current.navTimer);dhs.current.navTimer=null;}
    dhs.current.id=null;dhs.current.fired=false;setDHoldId(null);setDHoldPct(0);
    document.removeEventListener('mouseup',dEndHoldDoc);
    document.removeEventListener('touchend',dEndHoldDoc);
  }
  const [selected,setSelected]=useState("fire");
  const [rewards,setRewards]=useState(null);
  const [previewItem,setPreviewItem]=useState(null);
  const [notify,setNotify]=useState(null);
  const [passPickerOpen,setPassPickerOpen]=useState(false);
  const [passCount,setPassCount]=useState(1);
  const [buyPassesOpen,setBuyPassesOpen]=useState(false);
  const [confirmBuyOpen,setConfirmBuyOpen]=useState(false);
  const [showDrops,setShowDrops]=useState(false);
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  function getTimeToNoon(){
    const d=new Date();
    const noon=new Date();noon.setHours(12,0,0,0);
    if(d>=noon)noon.setDate(noon.getDate()+1);
    const diff=noon-d;
    const h=Math.floor(diff/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    return h+"h "+m+"m "+s+"s";
  }
  function showNotify(msg){setNotify(msg);setTimeout(()=>setNotify(null),2000);}
  const passes=currencies.dungeonPass||0;
  const boss=selected?DUNGEON_BOSSES.find(b=>b.key===selected):null;
  function openFight(){
    if(!boss)return;
    if(passes<1){setBuyPassesOpen(true);return;}
    setPassCount(Math.min(passes,passCount||1));
    setPassPickerOpen(true);
  }
  function fight(){
    setPassPickerOpen(false);
    setCurrencies(c=>({...c,dungeonPass:(c.dungeonPass||0)-passCount}));
    const bossLevel=dungeonBossLevels?.[selected]||1;
    const rolled=rollDungeonRewards(passCount,boss.type,bossLevel);
    setRewards(rolled);
    onClear&&onClear(1);
  }
  function recharge(){
    if((currencies.gems||0)<rechargeCost){showNotify("Not enough 💎 Gems!");return;}
    setCurrencies(c=>({...c,gems:(c.gems||0)-rechargeCost,dungeonPass:(c.dungeonPass||0)+10}));
    setPassRechargeCount(p=>p+1);
  }
  function collectRewards(){
    setEquipmentCopies(prev=>{const n={...prev};for(const item of rewards)n[item.id]=(n[item.id]||0)+1;return n;});
    setRewards(null);
  }
  if(dBattleOutcome){
    const won=dBattleOutcome==="won";
    return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",zIndex:210,padding:24,textAlign:"center"}},
      React.createElement("div",{style:{fontSize:64,marginBottom:12}},won?"✅":"💀"),
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:won?"#534AB7":"#ef4444",marginBottom:4}},won?"Dungeon Cleared!":"Defeat!"),
      React.createElement("div",{style:{fontSize:14,color:"#888",marginBottom:20}},won?"Equipment rewards collected!":""),
      React.createElement("button",{onClick:()=>{stopDLoops();setDBattling(false);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDPlanGrid({});setDBattleSelected(null);},style:{padding:"12px 36px",background:"#534AB7",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}},"Continue")
    );
  }
  if(dBattling){
    const snap=dBSnap||{playerUnits:[],enemyUnits:[],boss:null,damageDealt:{}};
    const allUnits=[...snap.playerUnits,...snap.enemyUnits];
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const snapBoss=snap.boss;
    const selectedUnit=dBattleSelected?.type==="unit"?allUnits.find(u=>u.uid===dBattleSelected.uid):null;
    const selectedBoss=dBattleSelected?.type==="boss"?snapBoss:null;
    return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:10,background:"#fff",borderBottom:"1px solid #e0e0e0",flexShrink:0}},
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
            React.createElement("span",{style:{fontSize:13,fontWeight:800,color:"#111"}},"🏰 "+boss?.name),
            snapBoss&&React.createElement("div",{style:{flex:1,height:20,background:"#fdd",borderRadius:6,overflow:"hidden",minWidth:60,position:"relative"}},
              React.createElement("div",{className:"dboss-hp-bar",style:{height:"100%",width:(snapBoss.hp/snapBoss.maxHp*100)+"%",background:"#ef4444",borderRadius:6}}),
              React.createElement("span",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)",pointerEvents:"none"}},Math.ceil(snapBoss.hp/snapBoss.maxHp*100)+"%")
            )
          )
        ),
        React.createElement("button",{onClick:dRestartFight,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#eee",color:"#555",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},"↺ Restart"),
        React.createElement("button",{onClick:cycleDSpeed,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},dSpeed+"x ⚡")
      ),
      React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center",padding:"12px",overflow:"hidden",gap:6}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:dTimeLeft<=10?"#ef4444":"#534AB7"}},dTimeLeft+"s ⏱"),
        React.createElement("div",{className:"battle-row",style:{display:"flex",flexDirection:"row",alignItems:"flex-start",justifyContent:"center",gap:10,width:"100%",maxWidth:"100%",overflowX:"auto",boxSizing:"border-box"}},
        React.createElement("div",{className:"battle-side-panel"},React.createElement(DamageChart,{damageDealt:snap.damageDealt})),
        React.createElement("div",{className:"battle-grid",style:{width:DUNGEON_GRID_COLS*DUNGEON_TILE,height:DUNGEON_GRID_ROWS*DUNGEON_TILE,borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0}},
          React.createElement("div",{style:{position:"absolute",top:0,left:0,display:"grid",gridTemplateColumns:`repeat(${DUNGEON_GRID_COLS},${DUNGEON_TILE}px)`,gridTemplateRows:`repeat(${DUNGEON_GRID_ROWS},${DUNGEON_TILE}px)`,gap:0}},
            Array.from({length:DUNGEON_GRID_ROWS},(_,r)=>Array.from({length:DUNGEON_GRID_COLS},(_,c)=>{
              const BORDER="1px solid #bbb";
              return React.createElement("div",{key:r+","+c,style:{width:DUNGEON_TILE,height:DUNGEON_TILE,boxSizing:"border-box",background:"#fff",borderTop:r===0?"0":BORDER,borderLeft:c===0?"0":BORDER,borderRight:"0",borderBottom:"0"}});
            })).flat()
          ),
          snapBoss&&snapBoss.hp>0&&React.createElement("div",{
            ref:el=>{dBossDomRef.current=el;if(el){el.style.left=(snapBoss.col*DUNGEON_TILE)+"px";el.style.top=(snapBoss.row*DUNGEON_TILE)+"px";}},
            onClick:()=>setDBattleSelected({type:"boss"}),
            style:{position:"absolute",width:2*DUNGEON_TILE,height:2*DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"auto",cursor:"pointer",zIndex:10}
          },
            React.createElement("div",{style:{position:"relative",lineHeight:1}},
              React.createElement("div",{style:{fontSize:36,lineHeight:1}},TYPE_EMOJI[boss?.type]||"👾"),
              (snapBoss.burnTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:-4,right:-6,fontSize:14,lineHeight:1}},"🔥")
            ),
            React.createElement("div",{style:{width:DUNGEON_TILE*1.6,height:5,background:"#fdd",borderRadius:3,marginTop:3,overflow:"hidden"}},
              React.createElement("div",{className:"dboss-hp",style:{height:"100%",width:(snapBoss.hp/snapBoss.maxHp*100)+"%",background:"#ef4444",borderRadius:3}})
            ),
            snapBoss.shield>0&&React.createElement("div",{style:{width:DUNGEON_TILE*1.6,height:4,background:"#dbeafe",borderRadius:3,marginTop:2,overflow:"hidden"}},
              React.createElement("div",{className:"dboss-shield",style:{height:"100%",width:(Math.min(1,(snapBoss.shield||0)/snapBoss.maxHp)*100)+"%",background:"#60a5fa",borderRadius:3}})
            )
          ),
          dAtkFx.map(e=>{
            const color=e.isEnemy?"#ef4444":"#a78bfa";
            if(e.isEmpSlam)return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE*2,height:DUNGEON_TILE*2,borderRadius:"50%",border:"4px solid #92400e",boxShadow:"0 0 18px #a16207, inset 0 0 12px rgba(146,64,14,0.5)",animation:"earthEmpSlam 0.9s ease-out forwards",pointerEvents:"none",zIndex:26}});
            if(e.isShockwave)return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE*2,height:DUNGEON_TILE*2,borderRadius:"50%",border:"3px solid #ef4444",boxShadow:"0 0 12px #ef4444",animation:"bossShockwave 0.6s ease-out forwards",pointerEvents:"none",zIndex:25}});
            if(e.isPillar){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(251,146,60,0.6)",boxShadow:"inset 0 0 8px rgba(239,68,68,0.8)",animation:"pillarFlame 0.7s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isShock){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(250,204,21,0.55)",boxShadow:"inset 0 0 8px rgba(234,179,8,0.9)",animation:"shockLine 0.8s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isSplash){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:e.isCenter?"rgba(56,189,248,0.65)":"rgba(56,189,248,0.35)",boxShadow:"inset 0 0 8px rgba(14,165,233,0.8)",animation:`splashWave ${e.isCenter?0.8:1.1}s ease-out forwards`,animationDelay:e.isCenter?"0ms":"80ms",pointerEvents:"none",zIndex:20}});}
            if(e.isDark){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(109,40,217,0.45)",boxShadow:"inset 0 0 8px rgba(139,92,246,0.9)",animation:"splashWave 0.9s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isGust){
              const dRow=e.row-e.fromRow,dCol=e.col-e.fromCol;
              const dist=Math.sqrt(dRow*dRow+dCol*dCol)||1;
              const angle=Math.atan2(dRow,dCol)*180/Math.PI;
              const midRow=(e.row+e.fromRow)/2,midCol=(e.col+e.fromCol)/2;
              return React.createElement("div",{key:e.id,style:{position:"absolute",left:midCol*DUNGEON_TILE+DUNGEON_TILE/2,top:midRow*DUNGEON_TILE+DUNGEON_TILE/2,width:dist*DUNGEON_TILE*0.95,height:8,transform:`translate(-50%,-50%) rotate(${angle}deg)`,pointerEvents:"none",zIndex:18}},
                React.createElement("div",{style:{width:"100%",height:"100%",borderRadius:4,background:"linear-gradient(90deg, rgba(191,219,254,0) 0%, rgba(191,219,254,0.95) 50%, rgba(191,219,254,0) 100%)",animation:"windGust 0.45s ease-out forwards"}})
              );
            }
            if(e.isCollision){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE+DUNGEON_TILE/2,top:e.row*DUNGEON_TILE+DUNGEON_TILE/2,fontSize:26,lineHeight:1,animation:"windCollision 0.5s ease-out forwards",pointerEvents:"none",zIndex:24}},"💥");}
            if(e.isRanged){const dRow=e.row-e.fromRow,dCol=e.col-e.fromCol;const dist=Math.sqrt(dRow*dRow+dCol*dCol)||1;const dur=Math.round(300+dist*50);return React.createElement("div",{key:e.id,ref:el=>{if(!el)return;el.getBoundingClientRect();el.style.left=(e.col*DUNGEON_TILE+DUNGEON_TILE/2)+"px";el.style.top=(e.row*DUNGEON_TILE+DUNGEON_TILE/2)+"px";el.style.opacity="0";},style:{position:"absolute",left:e.fromCol*DUNGEON_TILE+DUNGEON_TILE/2,top:e.fromRow*DUNGEON_TILE+DUNGEON_TILE/2,width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,transform:"translate(-50%,-50%)",transition:`left ${dur}ms linear,top ${dur}ms linear,opacity ${dur*0.3}ms linear ${dur*0.7}ms`,pointerEvents:"none",zIndex:20}});}
            return React.createElement(React.Fragment,{key:e.id},
              React.createElement("div",{style:{position:"absolute",left:e.fromCol*DUNGEON_TILE+DUNGEON_TILE/2,top:e.fromRow*DUNGEON_TILE+DUNGEON_TILE/2,width:DUNGEON_TILE*1.1,height:DUNGEON_TILE*1.1,borderRadius:"50%",background:e.isEnemy?"rgba(239,68,68,0.35)":"rgba(99,102,241,0.35)",border:`2px solid ${e.isEnemy?"#ef4444":"#6366f1"}`,animation:"meleeSwing 0.4s ease-out forwards",pointerEvents:"none",zIndex:19,transform:"translate(-50%,-50%)"}},null),
              React.createElement("div",{style:{position:"absolute",left:e.col*DUNGEON_TILE+DUNGEON_TILE/2,top:e.row*DUNGEON_TILE+DUNGEON_TILE/2,width:DUNGEON_TILE*0.85,height:DUNGEON_TILE*0.85,borderRadius:"50%",background:color,animation:"atkImpact 0.55s ease-out forwards",pointerEvents:"none",zIndex:20,transform:"translate(-50%,-50%)"}},null)
            );
          }),
          allUnits.map(u=>{const isBurned=(u.burnTicks||0)>0;const isDotted=u.uid[0]==="p"&&(u.dotTicks||0)>0;const isWeak=u.uid[0]==="p"&&(u.weakTicks||0)>0;return React.createElement("div",{key:"du"+u.uid,ref:el=>{if(el){const hpEl=el.querySelector(".hp-fill");dUnitRefs.current.set(u.uid,{el,hpEl});el.style.left=(u.col*DUNGEON_TILE)+"px";el.style.top=(u.row*DUNGEON_TILE)+"px";}else dUnitRefs.current.delete(u.uid);},onClick:u.hp>0?()=>setDBattleSelected({type:"unit",uid:u.uid}):undefined,style:{position:"absolute",width:DUNGEON_TILE,height:DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:u.hp>0?1:0,zIndex:5,pointerEvents:u.hp>0?"auto":"none",cursor:u.hp>0?"pointer":"default"}},
            React.createElement("div",{style:{position:"relative",lineHeight:1}},
              React.createElement(CreatureIcon,{def:CREATURE_MAP[u.creatureId]||{emoji:"❓"},size:20}),
              isBurned&&React.createElement("div",{style:{position:"absolute",top:-4,right:-6,fontSize:10,lineHeight:1}},"🔥"),
              isDotted&&React.createElement("div",{style:{position:"absolute",top:-4,left:-6,fontSize:10,lineHeight:1}},"🟣"),
              isWeak&&React.createElement("div",{style:{position:"absolute",bottom:-4,right:-6,fontSize:10,lineHeight:1}},"⬇️")
            ),
            React.createElement("div",{style:{position:"absolute",bottom:3,left:3,right:3,height:3,background:"#ddd",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{className:"hp-fill",style:{height:"100%",width:(u.hp/u.maxHp*100)+"%",background:u.uid[0]==="e"?"#ef4444":isBurned?"#f97316":isDotted?"#7c3aed":"#22c55e",borderRadius:2}})
            )
          );})
        ),
        React.createElement("div",{className:"battle-side-panel"},selectedUnit?React.createElement(UnitInfoPanel,{
          emoji:CREATURE_MAP[selectedUnit.creatureId]?.emoji||(selectedUnit.creatureId==="__vine_minion"?"🌱":"❓"),
          image:CREATURE_MAP[selectedUnit.creatureId]?.image,
          name:CREATURE_MAP[selectedUnit.creatureId]?.name||(selectedUnit.creatureId==="__vine_minion"?"Vine":selectedUnit.creatureId),
          subtitle:selectedUnit.uid[0]==="e"?"Enemy":"Ally",
          hp:selectedUnit.hp,maxHp:selectedUnit.maxHp,
          debuffs:debuffsFor(selectedUnit),
          onClose:()=>setDBattleSelected(null)
        }):selectedBoss?React.createElement(UnitInfoPanel,{
          emoji:TYPE_EMOJI[boss?.type]||"👾",
          name:boss?.name||"Boss",
          subtitle:"Boss",
          hp:selectedBoss.hp,maxHp:selectedBoss.maxHp,shield:selectedBoss.shield,
          debuffs:debuffsFor(selectedBoss),
          onClose:()=>setDBattleSelected(null)
        }):React.createElement("div",{style:{width:150,flexShrink:0}}))
        )
      )
    );
  }
  if(dPlanning){
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const bossLevel=dungeonBossLevels?.[selected]||1;
    const enemyGrid={}; // dungeon boss fights have no regular minions (nature spawns vines separately)
    const deployedCount=Object.keys(dPlanGrid).length;
    const PLAN_BOSS_ROW=1,PLAN_BOSS_COL=Math.floor((DUNGEON_GRID_COLS-2)/2);
    // Highlight tiles come from the same boss module that implements the ability,
    // built on the same geometry predicates the runtime uses -- so the preview and
    // the real hit area cannot drift apart the way the old duplicated copies did.
    const planGeo=makePlanGeometry(PLAN_BOSS_ROW,PLAN_BOSS_COL,DUNGEON_GRID_ROWS,DUNGEON_GRID_COLS,DUNGEON_PLAYER_START_ROW);
    const highlightCells=getHighlightTiles(boss.key,dPlanHighlight,planGeo);
    return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
      dAbilityTagPopup&&React.createElement("div",{onClick:()=>setDAbilityTagPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
        React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"20px 18px",width:260,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
          React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:8}},ABILITY_TAG_DEFS[dAbilityTagPopup].label),
          React.createElement("div",{style:{fontSize:13,color:"#555",lineHeight:1.4,marginBottom:16}},ABILITY_TAG_DEFS[dAbilityTagPopup].description),
          React.createElement("button",{onClick:()=>setDAbilityTagPopup(null),style:{width:"100%",padding:"9px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:12,flexShrink:0,background:"#fff",borderBottom:"1px solid #e0e0e0"}},
        React.createElement("button",{onClick:()=>{setDPlanning(false);setDPlanGrid({});},style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},React.createElement("i",{className:"ti ti-arrow-left"})),
        React.createElement("div",{style:{flex:1,textAlign:"center"}},
          React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},"Planning Phase")
        ),
        React.createElement("button",{onClick:deployedCount>0?dFight:undefined,style:{background:deployedCount>0?"#534AB7":"#ccc",border:"none",borderRadius:10,padding:"6px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:deployedCount>0?"pointer":"default"}},"Fight →")
      ),
      React.createElement("div",{style:{flex:1,overflowY:"auto",display:"flex",justifyContent:"flex-start",alignItems:"flex-start",padding:"16px 0 16px 16px",gap:12}},
        React.createElement("div",{style:{borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0}},
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:`repeat(${DUNGEON_GRID_COLS},${DUNGEON_TILE}px)`,gridTemplateRows:`repeat(${DUNGEON_GRID_ROWS},${DUNGEON_TILE}px)`,gap:0}},
            Array.from({length:DUNGEON_GRID_ROWS},(_,r)=>Array.from({length:DUNGEON_GRID_COLS},(_,c)=>{
              const isPlayerZone=r>=DUNGEON_PLAYER_START_ROW;const key=r+","+c;
              const creatureId=dPlanGrid[key];const def=creatureId?CREATURE_MAP[creatureId]:null;
              const enemyDef=!isPlayerZone?enemyGrid[key]:null;
              const isDivider=r===DUNGEON_PLAYER_START_ROW;const BORDER="1px solid #bbb";
              const onHS=isPlayerZone&&creatureId?(()=>{dhs.current.fired=false;dhs.current.timer=setTimeout(()=>{dhs.current.fired=true;setDGridInfoCreature(creatureId);},180);}):enemyDef?(()=>{dhs.current.fired=false;dhs.current.timer=setTimeout(()=>{dhs.current.fired=true;setDGridInfoCreature(enemyDef.id);},180);}):undefined;
              const onHE=isPlayerZone&&creatureId?(()=>{if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}if(!dhs.current.fired){setDPlanGrid(p=>{const n={...p};delete n[key];return n;});}dEndHold();}):enemyDef?(()=>{if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}}):undefined;
              return React.createElement("div",{key,draggable:!!(isPlayerZone&&creatureId),
                onDragStart:isPlayerZone&&creatureId?(e)=>{e.dataTransfer.effectAllowed="move";setDDragCell(key);setDDragId(null);}:undefined,
                onDragOver:isPlayerZone?(e)=>e.preventDefault():undefined,
                onDrop:isPlayerZone?(e)=>{e.preventDefault();handleDCellDrop(r,c);}:undefined,
                onMouseDown:onHS,onMouseUp:onHE,
                onTouchStart:onHS?(e)=>{e.preventDefault();onHS();}:undefined,onTouchEnd:onHE,
                style:{width:DUNGEON_TILE,height:DUNGEON_TILE,background:highlightCells.has(key)?"rgba(239,68,68,0.18)":isPlayerZone?"#f0f0f0":"#fdf7f7",borderTop:isDivider?"2.5px solid #534AB7":r===0?"0":BORDER,borderLeft:c===0?"0":BORDER,borderRight:"0",borderBottom:"0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,cursor:isPlayerZone?(creatureId?"grab":"default"):enemyDef?"pointer":"default",boxSizing:"border-box",userSelect:"none"}
              },(()=>{const d=def||enemyDef;if(!d)return"";return React.createElement("div",{style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("span",{style:{position:"absolute",top:1,left:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},TYPE_EMOJI[d.type]||""),React.createElement("span",{style:{position:"absolute",top:1,right:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},d.attackType==="Ranged"?"🏹":"⚔️"),React.createElement(CreatureIcon,{def:d,size:26}));})());
            })).flat()
          ),
          React.createElement("div",{style:{position:"absolute",left:Math.floor((DUNGEON_GRID_COLS-2)/2)*DUNGEON_TILE,top:1*DUNGEON_TILE,width:2*DUNGEON_TILE,height:2*DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.4)",borderRadius:6,pointerEvents:"none",zIndex:10}},
            React.createElement("div",{style:{fontSize:36,lineHeight:1}},TYPE_EMOJI[boss?.type]||"👾"),
            React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#ef4444",marginTop:2}},boss?.name)
          ),
          boss?.key==='nature'&&React.createElement(React.Fragment,null,
            React.createElement("div",{style:{position:"absolute",left:1*DUNGEON_TILE,top:4*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(34,197,94,0.10)",border:"2px solid rgba(34,197,94,0.5)",borderRadius:6,pointerEvents:"none",zIndex:10}},
              React.createElement("div",{style:{fontSize:22,lineHeight:1}},"🌱"),
              React.createElement("div",{style:{fontSize:8,fontWeight:800,color:"#16a34a",marginTop:1}},"Vine")
            ),
            React.createElement("div",{style:{position:"absolute",left:4*DUNGEON_TILE,top:4*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(34,197,94,0.10)",border:"2px solid rgba(34,197,94,0.5)",borderRadius:6,pointerEvents:"none",zIndex:10}},
              React.createElement("div",{style:{fontSize:22,lineHeight:1}},"🌱"),
              React.createElement("div",{style:{fontSize:8,fontWeight:800,color:"#16a34a",marginTop:1}},"Vine")
            )
          )
        ),
        React.createElement("div",{ref:dRightPanelRef,style:{flex:1,alignSelf:"stretch",padding:"0 12px 0 0",minWidth:0,display:"flex",flexDirection:"column",gap:8,overflow:"hidden"}},
          React.createElement("div",{style:{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",position:"relative"}},
            React.createElement("button",{onClick:()=>setDBossMinimized(p=>{const next=!p;if(!next)expandDPanel("boss");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},dBossMinimized?"＋":"－"),
            React.createElement("div",{style:{fontSize:28,lineHeight:1,marginBottom:6}},TYPE_EMOJI[boss?.type]||"👾"),
            React.createElement("div",{style:{fontSize:13,fontWeight:800,color:"#111",marginBottom:2}},boss?.name),
            React.createElement("div",{style:{fontSize:11,color:"#534AB7",fontWeight:700,marginBottom:dBossMinimized?0:12}},"Lv. "+bossLevel),
            !dBossMinimized&&boss?.abilities&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
              [["basic","Basic",boss.abilities.basic],["special","Special",boss.abilities.special],["unique","Unique",boss.abilities.unique]].map(([key,label,ab])=>ab&&
                React.createElement("div",{key:label,onClick:()=>setDPlanHighlight(p=>p===key?null:key),style:{background:dPlanHighlight===key?"rgba(239,68,68,0.10)":"transparent",borderRadius:8,padding:"8px 10px",margin:"0 -10px",border:dPlanHighlight===key?"1.5px solid rgba(239,68,68,0.5)":"1px solid transparent",cursor:"pointer"}},
                  React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}},label),
                  React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},ab.name),
                  React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},ab.description)
                )
              )
            )
          ),
          dGridInfoCreature&&(()=>{
            const def=CREATURE_MAP[dGridInfoCreature];
            const oc=owned&&owned[dGridInfoCreature];
            if(!def)return null;
            const abilityLabels={basic:"Basic",special:"Special",unique:"Unique"};
            return React.createElement("div",{style:{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",position:"relative"}},
              React.createElement("button",{onClick:()=>setDCreatureMinimized(p=>{const next=!p;if(!next)expandDPanel("creature");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},dCreatureMinimized?"＋":"－"),
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:dCreatureMinimized?0:12}},
                React.createElement(CreatureIcon,{def,size:28}),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:13,fontWeight:800,color:"#111"}},def.name),
                  React.createElement("div",{style:{fontSize:11,color:"#666",fontWeight:600}},def.type+" · "+(def.attackType||"Melee")+(oc?" · Lv."+oc.level:""))
                )
              ),
              !dCreatureMinimized&&def.abilities&&Object.entries(def.abilities).map(([k,abl])=>{
                if(!abl)return null;
                const lvl=oc&&oc.abilityLevels?oc.abilityLevels[k]||0:0;
                const desc=abl.upgrades?abl.upgrades[Math.min(lvl,abl.upgrades.length-1)]:"";
                const abilityTags=getAbilityTags(def.id,k);
                return React.createElement("div",{key:k,style:{marginBottom:10}},
                  React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:2}},
                    React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5}},abilityLabels[k]||k),
                    abilityTags.length>0&&React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}},
                      ...abilityTags.map(tag=>React.createElement("button",{
                        key:tag,
                        onClick:(e)=>{e.stopPropagation();setDAbilityTagPopup(tag);},
                        style:{fontSize:9,fontWeight:800,color:"#534AB7",background:"#EEEDFE",border:"1px solid rgba(83,74,183,0.4)",borderRadius:10,padding:"1px 8px",cursor:"pointer",lineHeight:1.5,flexShrink:0,whiteSpace:"nowrap"}
                      },ABILITY_TAG_DEFS[tag].label))
                    )
                  ),
                  React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},abl.name),
                  desc&&React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},desc)
                );
              })
            );
          })()
        )
      ),
      React.createElement("div",{style:{background:"#fff",borderTop:"1px solid #e0e0e0",padding:"10px 12px 24px",flexShrink:0},
        onDragOver:e=>e.preventDefault(),
        onDrop:e=>{e.preventDefault();if(dDragCell){setDPlanGrid(p=>{const n={...p};delete n[dDragCell];return n;});}setDDragId(null);setDDragCell(null);}
      },
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},
          React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
            React.createElement("span",{style:{fontSize:22,fontWeight:800,color:deployedCount>=DUNGEON_MAX_DEPLOYED?"#ef4444":"#111"}},deployedCount),
            React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#aaa"}},"/"+DUNGEON_MAX_DEPLOYED+" deployed")
          ),
          React.createElement("button",{onClick:dAutoDeploy,style:{padding:"8px 16px",fontSize:14,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:12,cursor:"pointer"}},"⚡ Auto Deploy")
        ),
        React.createElement("div",{ref:dCreatureListRef,
          onMouseDown:e=>{dDragScroll.current={armed:true,on:false,x:e.pageX,y:e.pageY,sl:dCreatureListRef.current.scrollLeft,intentScroll:false};},
          onMouseMove:e=>{
            const ds=dDragScroll.current;if(!ds.armed)return;
            const dx=e.pageX-ds.x,dy=e.pageY-ds.y;
            if(!ds.on){
              // Horizontal drag on the row = scroll intent; vertical drag = the user is
              // lifting a creature toward the grid above, so hand off to native DnD untouched.
              if(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){ds.on=true;ds.intentScroll=true;dEndHold();}
              else if(Math.abs(dy)>6){ds.armed=false;return;}
              else return;
            }
            dCreatureListRef.current.scrollLeft=ds.sl-dx;
            e.preventDefault();
          },
          onMouseUp:()=>{dDragScroll.current={armed:false,on:false,x:0,y:0,sl:0,intentScroll:false};},
          onMouseLeave:()=>{dDragScroll.current={armed:false,on:false,x:0,y:0,sl:0,intentScroll:false};},
          className:"creature-list",
          style:{display:"grid",gridAutoFlow:"column",gridTemplateRows:"repeat(2,58px)",gridAutoColumns:52,gap:6,overflowX:"auto",overflowY:"hidden",cursor:"grab",userSelect:"none"}
        },
          ownedList.map(oc=>{
            const def=CREATURE_MAP[oc.id];if(!def)return null;
            const isPlaced=dPlacedIds.has(oc.id);
            const isHolding=dHoldId===oc.id&&dHoldPct>0;
            const CIRC=2*Math.PI*18;
            return React.createElement("div",{key:oc.id,"data-creature":oc.id,draggable:!isPlaced,
              onDragStart:!isPlaced?(e)=>{if(dDragScroll.current.intentScroll){e.preventDefault();return;}if(dhs.current.id===oc.id){e.preventDefault();return;}dEndHold();e.dataTransfer.effectAllowed="move";setDDragId(oc.id);setDDragCell(null);}:undefined,
              onMouseDown:()=>dBeginHold(oc.id),onMouseUp:dEndHold,
              onTouchStart:(e)=>{e.preventDefault();dBeginHold(oc.id);},onTouchEnd:dEndHold,
              style:{flexShrink:0,width:52,height:58,position:"relative",background:isPlaced?"#f0f0f0":"#fff",border:"none",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,cursor:isPlaced?"default":"grab",userSelect:"none"}
            },
              isHolding&&dHoldPct>15&&React.createElement("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"},viewBox:"0 0 52 58"},React.createElement("circle",{cx:26,cy:29,r:18,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:CIRC,strokeDashoffset:CIRC*(1-dHoldPct/100),strokeLinecap:"round",transform:"rotate(-90 26 29)"})),
              React.createElement("div",{style:{opacity:isPlaced?0.4:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}},
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
    );
  }
  if(rewards)return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 0",flexShrink:0}},
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",marginBottom:4}},"🎁 Dungeon Rewards"),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:16}},rewards.length+" items from "+boss.name)
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
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    notify&&React.createElement("div",{style:{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#333",color:"#fff",borderRadius:10,padding:"8px 18px",fontSize:13,fontWeight:600,zIndex:200,whiteSpace:"nowrap"}},notify),
    buyPassesOpen&&React.createElement("div",{onClick:()=>setBuyPassesOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:40,marginBottom:8}},"🎫"),
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:6}},"Pass Recharge"),
        React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20}},"Buy 10 more passes for 💎 "+rechargeCost+" Gems?"),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setBuyPassesOpen(false),style:{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#555",fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:()=>{setBuyPassesOpen(false);setConfirmBuyOpen(true);},disabled:(currencies.gems||0)<rechargeCost,style:{flex:2,padding:"12px 0",borderRadius:12,border:"none",background:(currencies.gems||0)>=rechargeCost?"#534AB7":"#ccc",color:"#fff",fontWeight:700,fontSize:14,cursor:(currencies.gems||0)>=rechargeCost?"pointer":"default"}},"Buy · 💎 "+rechargeCost)
        )
      )
    ),
    confirmBuyOpen&&React.createElement("div",{onClick:()=>setConfirmBuyOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:310,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:6}},"Confirm Purchase"),
        React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20}},"Spend 💎 "+rechargeCost+" Gems for 10 Dungeon Passes?"),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setConfirmBuyOpen(false),style:{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#555",fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:()=>{recharge();setConfirmBuyOpen(false);},style:{flex:2,padding:"12px 0",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"Confirm")
        )
      )
    ),
    passPickerOpen&&React.createElement("div",{onClick:()=>setPassPickerOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",marginBottom:(dungeonBossLevels?.[selected]||1)<10?6:20}},"How many?"),
        (dungeonBossLevels?.[selected]||1)<10&&React.createElement("div",{style:{fontSize:11,color:"#aaa",marginBottom:16}},"Auto Fight does not increase boss level"),
        React.createElement("div",{style:{fontSize:36,fontWeight:800,color:"#534AB7",marginBottom:16}},passCount),
        React.createElement("input",{
          type:"range",min:1,max:passes,value:passCount,
          onChange:e=>setPassCount(Number(e.target.value)),
          style:{width:"100%",marginBottom:24,accentColor:"#534AB7"}
        }),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setPassPickerOpen(false),style:{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#555",fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:fight,style:{flex:2,padding:"12px 0",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"Fight · "+passCount+" 🎫")
        )
      )
    ),
    React.createElement("div",{style:{padding:"16px 16px 0",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e0e0e0",paddingBottom:12,background:"#fff",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700}},"🏰 Dungeon"),
      boss&&React.createElement("button",{onClick:()=>setShowDrops(true),style:{marginLeft:"auto",padding:"5px 12px",fontSize:12,fontWeight:600,background:"#f0f0f0",border:"none",borderRadius:20,cursor:"pointer",color:"#555"}},"Drops")
    ),
    showDrops&&boss&&React.createElement("div",{onClick:()=>setShowDrops(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:320,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:340}},
        React.createElement("div",{style:{fontSize:16,fontWeight:800,color:"#111",marginBottom:16,textAlign:"center"}},"Exclusive Drops"),
        ...(["epic","legendary"]).map(rarity=>{
          const items=EQUIPMENT_DEFS.filter(item=>item.element===boss.type&&item.rarity===rarity);
          if(!items.length)return null;
          const rarCfg=EQUIP_RARITY_CONFIG[rarity];
          return React.createElement("div",{key:rarity,style:{marginBottom:16}},
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:rarCfg.color,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}},rarCfg.label),
            React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
              items.map(item=>{
                const ROLE_EMOJI={Attacker:"⚔️",Tank:"🛡️",Support:"💚"};
                const indicator=item.element?(TYPE_EMOJI[item.element]||""):item.role?(ROLE_EMOJI[item.role]||""):"";
                return React.createElement("div",{key:item.id,onClick:()=>setPreviewItem(item),style:{
                  width:52,height:52,borderRadius:12,background:rarCfg.bg,
                  border:"2px solid "+rarCfg.color+"88",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,cursor:"pointer",position:"relative",
                }},
                  item.emoji,
                  indicator&&React.createElement("span",{style:{position:"absolute",top:1,left:3,fontSize:10,lineHeight:1,pointerEvents:"none"}},indicator)
                );
              })
            )
          );
        }),
        React.createElement("button",{onClick:()=>setShowDrops(false),style:{width:"100%",padding:"11px 0",fontSize:14,fontWeight:700,background:"#f0f0f0",color:"#555",border:"none",borderRadius:12,cursor:"pointer",marginTop:4}},"Close")
      )
    ),
    previewItem&&React.createElement("div",{onClick:()=>setPreviewItem(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:330,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:320}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8,textAlign:"center"}},previewItem.emoji),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,color:"#111",marginBottom:4,textAlign:"center"}},previewItem.name),
        (previewItem.element||previewItem.role)&&React.createElement("div",{style:{textAlign:"center",marginBottom:8}},
          React.createElement("span",{style:{fontSize:11,fontWeight:600,color:"#7c5cf6",background:"#f0effe",borderRadius:20,padding:"3px 12px",display:"inline-block"}},
            previewItem.element?(TYPE_EMOJI[previewItem.element]||"")+" "+previewItem.element+" type exclusive"
            :{Attacker:"⚔️",Tank:"🛡️",Support:"💚"}[previewItem.role]+" "+previewItem.role+" role exclusive"
          )
        ),
        previewItem.stats&&React.createElement("div",{style:{fontSize:12,color:"#888",textAlign:"center",marginBottom:8}},Object.entries(previewItem.stats).map(([s,v])=>"+"+v+" "+STAT_LABELS[s]).join(" · ")),
        previewItem.effect&&React.createElement("div",{style:{fontSize:12,color:"#555",lineHeight:1.5,padding:"10px 12px",background:"#f7f7ff",borderRadius:10,border:"1px solid #e0deff",marginBottom:12}},"✦ "+previewItem.effect),
        React.createElement("button",{onClick:()=>setPreviewItem(null),style:{width:"100%",padding:"11px 0",fontSize:14,fontWeight:700,background:"#f0f0f0",color:"#555",border:"none",borderRadius:12,cursor:"pointer"}},"Close")
      )
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"24px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:16}},
      boss
        ? React.createElement(React.Fragment,null,
            React.createElement("div",{style:{fontSize:90,lineHeight:1}},TYPE_EMOJI[boss.type]||"👾"),
            React.createElement("div",{style:{fontSize:24,fontWeight:800,color:"#111"}},boss.name),
            React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#534AB7",background:"#f0effe",borderRadius:20,padding:"3px 14px",marginTop:2}},"Lv. "+(dungeonBossLevels?.[selected]||1))
          )
        : React.createElement(React.Fragment,null,
            React.createElement("div",{style:{fontSize:56}},"🏰"),
            React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#333"}},"Choose a Boss"),
            React.createElement("div",{style:{fontSize:13,color:"#aaa"}},"Select a dungeon below to begin")
          )
    ),
    React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"0 24px 40px",flexShrink:0}},
      React.createElement("div",{style:{position:"relative",display:"inline-block"}},
        React.createElement("div",{style:{fontSize:36,fontWeight:800,color:"#111"}},"🎫 "+passes+"/10"),
        React.createElement("button",{onClick:()=>setBuyPassesOpen(true),style:{position:"absolute",top:-6,right:-24,width:20,height:20,borderRadius:"50%",background:"#534AB7",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",padding:0,lineHeight:"20px",textAlign:"center"}},"+")
      ),
      React.createElement("div",{style:{fontSize:11,color:"#bbb"}},"Refreshes in "+getTimeToNoon()),
      React.createElement("div",{style:{display:"flex",gap:10,marginTop:4}},
        React.createElement("button",{
          onClick:()=>{
            if(!boss)return;
            if(passes<1){setBuyPassesOpen(true);return;}
            setDPlanGrid({});setDPlanning(true);
          },
          disabled:!boss,
          style:{padding:"8px 28px",fontSize:14,fontWeight:700,
            background:boss?"#534AB7":"#ccc",
            color:"#fff",border:"none",borderRadius:20,
            cursor:boss?"pointer":"default"}
        },"⚔️ Fight"),
        React.createElement("button",{
          onClick:openFight,disabled:!boss,
          style:{padding:"8px 28px",fontSize:14,fontWeight:700,
            background:boss?"#7c3aed":"#ccc",
            color:"#fff",border:"none",borderRadius:20,
            cursor:boss?"pointer":"default"}
        },"⚡ Auto Fight")
      )
    ),
    React.createElement("div",{style:{background:"#fff",borderTop:"1px solid #e0e0e0",flexShrink:0}},
      React.createElement("div",{style:{display:"flex",borderTop:"1px solid #e0e0e0"}},
        DUNGEON_BOSSES.map(b=>React.createElement("button",{
          key:b.key,onClick:()=>setSelected(b.key),
          style:{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
            padding:"8px 2px",border:"none",
            borderTop:"3px solid "+(selected===b.key?"#534AB7":"transparent"),
            background:selected===b.key?"#f0effe":"#fff",
            cursor:"pointer",transition:"all .15s",
          }
        },
          React.createElement("span",{style:{fontSize:20}},TYPE_EMOJI[b.type]||"👾"),
          React.createElement("span",{style:{fontSize:8,fontWeight:700,color:selected===b.key?"#534AB7":"#888"}},b.type)
        ))
      )
    )
  );
}

export default DungeonScreen;
