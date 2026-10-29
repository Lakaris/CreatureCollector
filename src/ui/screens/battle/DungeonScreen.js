// Dungeon boss fights: planning/deploy phase, the tick loop, per-boss AI, and FX.

import React, { useState, useEffect } from "../../../react.js";
import { iconText, gearIcon, typeIcon, rangeIcon, restrictionIcon } from "../../components/IconText.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURE_MAP } from "../../../data/creatures.js";
import { STAT_LABELS, formatStatBonus } from "../../../data/rarity.js";
import { EQUIP_RARITY_CONFIG, EQUIPMENT_DEFS } from "../../../data/equipment.js";
import { isExclusive, exclusivityChip } from "../../../core/equipment.js";
import { TYPE_EMOJI, TYPE_STRONG_AGAINST, TYPE_ORDER } from "../../../data/types.js";
import { getBossStats, DUNGEON_BOSSES } from "../../../data/bosses.js";
import { rollDungeonRewards } from "../../../core/gacha.js";
import { DUNGEON_GRID_COLS, DUNGEON_GRID_ROWS, DUNGEON_PLAYER_START_ROW, DUNGEON_TILE, DUNGEON_MAX_DEPLOYED, DUNGEON_PASS_DAILY_CAP, DUNGEON_PASS_DAILY_CAP_BONUS } from "../../../battle/constants.js";
import { boardArt, boardCellClass, battleBackdrop } from "../../boardArt.js";
import useBattlePause, { BATTLE_PAUSED_CLASS, DEV_PAUSE_BTN } from "../../hooks/useBattlePause.js";
import { DEV_MODE } from "../../../config.js";
import { aEase } from "../../../battle/geometry.js";
import { getBossModule, getHighlightTiles } from "../../../battle/bosses/registry.js";
import { makeBossContext, makePlanGeometry } from "../../../battle/bosses/context.js";
import { makeArenaBattle, makeBossUnit, addBossToBattle, bossOf } from "../../../battle/state.js";
import { runBattleTick } from "../../../battle/tick.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import GearRewardGrid from "../../../ui/components/GearRewardGrid.js";
import GearPreviewPopup from "../../../ui/components/GearPreviewPopup.js";
import { battleArtState, battleUnitOpacity, stampVictors, VICTORY_LINGER_MS } from "../../../ui/components/battleArtState.js";
import { renderTileFx, renderHazardField } from "../../../ui/components/battleTileFx.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import { UnitInfoPopup, debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import { PlanInfoSheet, SheetHeader, SheetAbilityRow, AllySheetBody, PLAN_INFO_HOLD_MS } from "../../../ui/components/PlanInfoSheet.js";
import { AbilityTagPopup } from "../../../ui/components/AbilityTagPills.js";
import { nextEasternNoon } from "../../../core/dates.js";
import useTouchDragPlacement from "../../../ui/hooks/useTouchDragPlacement.js";
import useRangePreview from "../../../ui/hooks/useRangePreview.js";
import useFitTile from "../../../ui/hooks/useFitTile.js";

// Each boss fights in its own scene, named "<key>-dungeon" -- except Electric,
// whose art is called "thunder".
const dungeonTheme=key=>(key==="electric"?"thunder":key)+"-dungeon";
const D_BOARD_ART=Object.fromEntries(DUNGEON_BOSSES.map(b=>[b.key,boardArt(DUNGEON_GRID_ROWS,DUNGEON_GRID_COLS,dungeonTheme(b.key))]));
const D_BACKDROP=Object.fromEntries(DUNGEON_BOSSES.map(b=>[b.key,battleBackdrop(dungeonTheme(b.key))]));

// Shared empty grid so a boss with no deployment yields a stable identity
// instead of a fresh {} every render.
const EMPTY_GRID={};

// The boss-select page wears its boss's element: a desaturated wash of the
// type's colour behind the white cards. Yellow (Electric) and gold (Light)
// are kept apart by warmth -- gold sits darker and browner. The container
// transitions between these when another boss is tapped.
// Boss bar display order only. DUNGEON_BOSSES itself must not be reordered:
// the Daily Boss rotation indexes into it by level, so shuffling the array
// would silently reassign which boss appears on which day.
// Boss keys are lowercased type names (see makeBoss in data/bosses.js), so the
// bar reads straight off the shared TYPE_ORDER -- the Collection and Dex type
// filters order themselves by the same constant.
const DUNGEON_BAR_ORDER=TYPE_ORDER.map(t=>t.toLowerCase());

const DUNGEON_BG_BY_TYPE={
  Fire:"#f0d4cf",     // red
  Nature:"#e2efe0",   // green
  Earth:"#ece2d5",    // brown
  Electric:"#f7f3d4", // yellow
  Water:"#dfeaf6",    // blue
  Light:"#f2e7c6",    // gold
  Dark:"#e9e2f3",     // purple
  Wind:"#e7e9ec",     // grey
};

function DungeonScreen({onBack,onClear,onAutoFight,onViewCreature}){
  const { currencies, setCurrencies, equipmentLevels, equipmentAscensions, equipmentCopies, setEquipmentCopies, passRechargeCount, setPassRechargeCount, dungeonBossLevels, setDungeonBossLevels, owned, unlockedSkins, dungeonDeepLink, setDungeonDeepLink, dungeonPlanGrid: dPlanGrids, setDungeonPlanGrid: setDPlanGrids, tutorialRestricted, tutorialStep, setTutorialRestricted, setTutorialStep, dungeonStarterPackPurchased } = useGame();
  const PASS_COST=1;
  const dungeonPassDailyCap=DUNGEON_PASS_DAILY_CAP+(dungeonStarterPackPurchased?DUNGEON_PASS_DAILY_CAP_BONUS:0);
  const rechargeCost=100*Math.pow(2,passRechargeCount);
  // Tail end of the post-Set-1 Dungeon reveal (see App.js's Play hub): while
  // active, every button on the boss-select screen is inert except Fight --
  // tapping it is what finally clears the tutorial (see the Fight button below).
  const dungeonEnterActive=tutorialRestricted&&tutorialStep==="dungeonEnter";
  // Which boss tab is open. Declared up here (rather than beside the rest of
  // the boss-select state further down) because the deployment grid is stored
  // per boss and everything below reads through it.
  const [selected,setSelected]=useState("fire");
  // dPlanGrids is boss key -> {"r,c": creatureId}; dPlanGrid/setDPlanGrid are
  // the current boss's slice, so the rest of the screen keeps working with a
  // plain flat grid and each boss remembers its own team.
  const dPlanGrid=dPlanGrids?.[selected]||EMPTY_GRID;
  function setDPlanGrid(updater){
    setDPlanGrids(prev=>{
      const cur=prev?.[selected]||EMPTY_GRID;
      const next=typeof updater==="function"?updater(cur):updater;
      return {...prev,[selected]:next};
    });
  }
  // battle state
  const [dPlanning,setDPlanning]=useState(false);
  // The boss ability whose tiles are lit on the planning board (tap a row in
  // the boss sheet to toggle it).
  const [dPlanHighlight,setDPlanHighlight]=useState(null);
  // The planning info sheet shows one card at a time: "boss", a minion's
  // index, or (dGridInfoCreature, below) a pressed creature.
  const [dInfoSheet,setDInfoSheet]=useState(null);
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
  // Lit tiles belong to the boss sheet that toggled them, so they go out
  // whenever that sheet does.
  function openDSheet(which){setDInfoSheet(which);setDGridInfoCreature(null);if(which!=="boss")setDPlanHighlight(null);}
  function openDCreatureSheet(id){setDInfoSheet(null);setDPlanHighlight(null);setDGridInfoCreature(id);}
  function closeDSheet(){setDInfoSheet(null);setDGridInfoCreature(null);setDPlanHighlight(null);}
  // A different boss, or leaving planning, starts with no sheet open.
  React.useEffect(()=>{closeDSheet();},[selected,dPlanning]);
  const dhs=React.useRef({delay:null,raf:null,id:null,fired:false});
  const dCreatureListRef=React.useRef(null);
  const dDragScroll=React.useRef({armed:false,on:false,x:0,y:0,sl:0,intentScroll:false});
  const dWonBossRef=React.useRef(null);
  const ownedList=Object.values(owned||{}).sort((a,b)=>(b.level||1)-(a.level||1)).filter(o=>o&&CREATURE_MAP[o.id]);
  const dPlacedIds=new Set(Object.values(dPlanGrid));
  function stopDLoops(){if(dTickRef.current){clearInterval(dTickRef.current);dTickRef.current=null;}if(dRafRef.current){cancelAnimationFrame(dRafRef.current);dRafRef.current=null;}}
  React.useEffect(()=>()=>stopDLoops(),[]);
  const dPause=useBattlePause({tickRef:dTickRef,startRef:dBattleStartRef,startTicking:()=>{dTickRef.current=setInterval(runDTick,Math.round(500/dSpeedRef.current));}});
  function startDRenderLoop(){
    if(dRafRef.current)cancelAnimationFrame(dRafRef.current);
    function frame(){
      const s=dBRef.current;if(!s){dRafRef.current=null;return;}
      const now=Date.now();
      for(const u of[...s.playerUnits,...s.enemyUnits]){
        const refs=dUnitRefs.current.get(u.uid);if(!refs)continue;
        const{el,hpEl}=refs;
        // Defeated units keep their DOM node (only summons are pruned), so a
        // creature with defeat art lingers at its death tile while it plays.
        if(u.hp<=0){el.style.opacity=String(battleUnitOpacity(u,now,CREATURE_MAP[u.creatureId]));continue;}
        el.style.opacity="1";
        const t=aEase(Math.min(1,(now-u.lastMoveTime)/dAnimRef.current));
        el.style.left=((u.prevCol+(u.col-u.prevCol)*t)*DUNGEON_TILE)+"px";
        el.style.top=((u.prevRow+(u.row-u.prevRow)*t)*DUNGEON_TILE)+"px";
        if(hpEl)hpEl.style.width=(Math.max(0,u.hp/u.maxHp)*100)+"%";
      }
      const sb=bossOf(s);
      if(sb&&dBossDomRef.current){
        const b=sb;
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
    const b=bossOf(s);
    if(newFx.length)setDAtkFx(prev=>[...prev.filter(e=>(e.isShock?now-e.t<800:e.isSplash?now-e.t<1200:(e.isDark||e.isPoison)?now-e.t<900:e.isEmpSlam?now-e.t<900:now-e.t<700)),...newFx]);
    setDBSnap({playerUnits:s.playerUnits.map(u=>({...u})),enemyUnits:s.enemyUnits.filter(u=>u!==b).map(u=>({...u})),boss:b?{...b}:null,damageDealt:{...s.damageDealt}});
    const dGameElapsed=(Date.now()-dBattleStartRef.current)*dSpeedRef.current;
    const dTL=Math.min(60,Math.ceil(Math.max(0,60000-dGameElapsed)/1000));
    setDTimeLeft(dTL);
    if(dTL<=0){stopDLoops();setTimeout(()=>setDBattleOutcome("lost"),600);return;}
    const anyP=s.playerUnits.some(u=>u.hp>0);
    const bossAlive=b&&b.hp>0;
    const anyE=s.enemyUnits.some(u=>u.hp>0);
    // Winners hold a victory pose for a beat before the outcome overlay;
    // one more snapshot so React renders the stamped state.
    const victorySnap=()=>setDBSnap({playerUnits:s.playerUnits.map(u=>({...u})),enemyUnits:s.enemyUnits.filter(u=>u!==b).map(u=>({...u})),boss:b?{...b}:null,damageDealt:{...s.damageDealt}});
    if(!bossAlive&&!anyE){
      stopDLoops();
      const stamped=stampVictors(s.playerUnits,now);
      victorySnap();
      const bossLevel=dungeonBossLevels?.[selected]||1;
      dWonBossRef.current={boss:dBRef.current._boss,bossLevel};
      setDungeonBossLevels(p=>({...p,[selected]:Math.min(10,(p[selected]||1)+1)}));
      const rolled=rollDungeonRewards(1,dBRef.current._boss?.type,bossLevel);
      setCurrencies(c=>({...c,dungeonPass:(c.dungeonPass||0)-1}));
      setEquipmentCopies(prev=>{const n={...prev};for(const item of rolled)n[item.id]=(n[item.id]||0)+1;return n;});
      onClear&&onClear(1);
      setTimeout(()=>setDBattleOutcome("won"),stamped?VICTORY_LINGER_MS:600);
    } else if(!anyP){
      stopDLoops();
      const stamped=stampVictors(s.enemyUnits,now);
      victorySnap();
      setTimeout(()=>setDBattleOutcome("lost"),stamped?VICTORY_LINGER_MS:600);
    }
  }
  function dRestartFight(){
    // Ignored once the fight is decided (loop stopped, not just paused): the
    // reward is already granted and the outcome overlay is on a timer, which
    // would otherwise pop up over the planning screen.
    if(!dTickRef.current&&!dPause.paused)return;
    stopDLoops();dPause.reset();
    setDBattling(false);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDBattleSelected(null);
    setDPlanning(true);
  }
  function dFight(){
    stopDLoops();dPause.reset();
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const bossLevel=dungeonBossLevels?.[selected]||1;
    const enemyGrid={}; // dungeon boss fights have no regular minions (nature spawns vines separately)
    setDPlanning(false);setDBattling(true);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDBattleSelected(null);setDTimeLeft(60);dBattleStartRef.current=Date.now();
    const battle=makeArenaBattle(dPlanGrid,enemyGrid,owned,bossLevel,dAnimRef.current,equipmentLevels,equipmentAscensions);
    battle._boss=boss;
    // A boss stands at row 1 unless its data says otherwise (`spawnRow`).
    const bRow=boss.spawnRow??1,bCol=Math.floor((DUNGEON_GRID_COLS-2)/2);
    if(boss.minions){
      const vNow=Date.now();
      // Staggered opening cooldowns so minions don't act in lockstep.
      const OPENING_CDS=[[3,8],[5,12],[4,10],[6,14]];
      battle.enemyUnits.push(...boss.minions.map((m,i)=>{
        const [atkCd,specialCd]=OPENING_CDS[i%OPENING_CDS.length];
        // Each minion is its own creature (m.creatureId -- a Vine, a Totem); its
        // stat block comes off that CREATURE_MAP entry, so the info card and the
        // unit that fights can't disagree. HP/ATK scale with the boss's level;
        // crit is a chance, so it scales with nothing (see state.js's enemy
        // units). `m.unit` carries what makes it that kind of minion.
        const s=CREATURE_MAP[m.creatureId].stats;
        const hp=Math.round(s.hp*4*(1+bossLevel*0.15));
        return {uid:"vm"+i,creatureId:m.creatureId,row:m.row,col:m.col,prevRow:m.row,prevCol:m.col,lastMoveTime:vNow-dAnimRef.current,hp,maxHp:hp,atk:Math.round(s.atk*(1+bossLevel*0.1)),def:s.def,spd:s.spd,crit:s.crit??0,critDmg:s.critDmg??0,isRanged:CREATURE_MAP[m.creatureId].attackType==="Ranged",atkCd,specialCd,abilCharge:0,abilChargeMax:0,...(m.unit||{})};
      }));
    }
    // The boss joins after its minions (addBossToBattle); it fights as a creature.
    addBossToBattle(battle,makeBossUnit(boss,bossLevel,bRow,bCol,{now:Date.now()-dAnimRef.current}));
    dBRef.current=battle;
    startDRenderLoop();
    dTickRef.current=setInterval(runDTick,Math.round(500/dSpeedRef.current));
  }
  function cycleDSpeed(){
    const next=dSpeed===1?2:1;
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
  function dApplyDrop(r,c,{id,fromCell}){
    if(r<DUNGEON_PLAYER_START_ROW)return;
    const key=r+","+c;
    if(fromCell&&fromCell!==key){const cid=dPlanGrid[fromCell];setDPlanGrid(p=>{const n={...p};delete n[fromCell];if(cid&&r>=DUNGEON_PLAYER_START_ROW)n[key]=cid;return n;});}
    else if(id){if(!dPlacedIds.has(id)&&Object.keys(dPlanGrid).length<DUNGEON_MAX_DEPLOYED)setDPlanGrid(p=>({...p,[key]:id}));}
  }
  function handleDCellDrop(r,c){
    dApplyDrop(r,c,{id:dDragId,fromCell:dDragCell});
    setDDragId(null);setDDragCell(null);
  }
  // Attack-range preview: while a creature is being dragged over the grid, tint
  // every tile it would be able to reach from the cell under the pointer.
  const dRangePreview=useRangePreview(DUNGEON_GRID_ROWS,DUNGEON_GRID_COLS);
  // Planning board shrinks to its area rather than making it scroll.
  const [dPlanAreaRef,dPlanTile,dPlanClamped]=useFitTile(DUNGEON_GRID_ROWS,DUNGEON_GRID_COLS,DUNGEON_TILE);
  /** The creature a drag is carrying, from either origin (tray or grid cell). */
  function dDraggedCreature(){return dDragId||(dDragCell?dPlanGrid[dDragCell]:null);}
  function dPreviewAt(cid,r,c){if(!cid){dRangePreview.clear();return;}dRangePreview.show(cid,r,c,owned&&owned[cid]);}
  const dTouchDrag=useTouchDragPlacement({
    cellSelector:"[data-cell]",
    applyDrop:dApplyDrop,
    onCancelHold:()=>{dEndHold();if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}closeDSheet();},
    onCancelDrop:(fromCell)=>setDPlanGrid(p=>{const n={...p};delete n[fromCell];return n;}),
    onDragOverCell:(cellKey,d)=>{
      const cid=d.id||d.cellId;
      if(!cellKey||!cid){dRangePreview.clear();return;}
      const [r,c]=cellKey.split(",").map(Number);
      if(r<DUNGEON_PLAYER_START_ROW){dRangePreview.clear();return;}
      dPreviewAt(cid,r,c);
    },
  });
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
  // Jumps straight to a boss tab when navigated here from e.g. the "Defeat
  // the Level 1 Wind Boss" quest; consumed once then cleared, same pattern
  // as FarmScreen's farmDeepLink.
  useEffect(()=>{
    if(dungeonDeepLink){setSelected(dungeonDeepLink);setDungeonDeepLink(null);}
  },[dungeonDeepLink]);
  const [rewards,setRewards]=useState(null);
  const [previewItem,setPreviewItem]=useState(null);
  const [notify,setNotify]=useState(null);
  const [passPickerOpen,setPassPickerOpen]=useState(false);
  const [passCount,setPassCount]=useState(1);
  const [buyPassesOpen,setBuyPassesOpen]=useState(false);
  const [confirmBuyOpen,setConfirmBuyOpen]=useState(false);
  const [showRewards,setShowRewards]=useState(false);
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  function getTimeToNoon(){
    const diff=nextEasternNoon(now)-now;
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
    onAutoFight&&onAutoFight();
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
    return React.createElement("div",{key:"sfv338",className:"screen-fade",style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",zIndex:210,padding:24,textAlign:"center"}},
      React.createElement("div",{style:{fontSize:64,marginBottom:12}},won?iconText("✅"):"💀"),
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:won?"#534AB7":"#ef4444",marginBottom:4}},won?"Dungeon Cleared!":"Defeat!"),
      React.createElement("div",{style:{fontSize:14,color:"#888",marginBottom:20}},won?"Equipment rewards collected!":""),
      React.createElement("button",{onClick:()=>{stopDLoops();setDBattling(false);setDBattleOutcome(null);setDBSnap(null);setDAtkFx([]);setDBattleSelected(null);},style:{padding:"12px 36px",background:"#534AB7",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}},"Continue")
    );
  }
  if(dBattling){
    const snap=dBSnap||{playerUnits:[],enemyUnits:[],boss:null,damageDealt:{}};
    const allUnits=[...snap.playerUnits,...snap.enemyUnits];
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const snapBoss=snap.boss;
    const selectedUnit=dBattleSelected?.type==="unit"?allUnits.find(u=>u.uid===dBattleSelected.uid):null;
    const selectedBoss=dBattleSelected?.type==="boss"?snapBoss:null;
    const dBoardArt=D_BOARD_ART[selected];
    return React.createElement("div",{key:"sfv352",className:"screen-fade"+(dPause.paused?" "+BATTLE_PAUSED_CLASS:""),style:{position:"fixed",inset:0,...D_BACKDROP[selected],display:"flex",flexDirection:"column"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:10,background:"var(--bar-bg)",borderBottom:"1px solid var(--bar-line)",flexShrink:0}},
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
            React.createElement("span",{style:{fontSize:13,fontWeight:800,color:"#111"}},"🏰 "+boss?.name),
            snapBoss&&React.createElement("div",{style:{flex:1,height:20,background:"#fdd",borderRadius:6,overflow:"hidden",minWidth:60,position:"relative"}},
              React.createElement("div",{className:"dboss-hp-bar",style:{height:"100%",width:(snapBoss.hp/snapBoss.maxHp*100)+"%",background:"#ef4444",borderRadius:6}}),
              React.createElement("span",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)",pointerEvents:"none"}},Math.ceil(snapBoss.hp/snapBoss.maxHp*100)+"%")
            )
          )
        ),
        DEV_MODE&&React.createElement("button",{onClick:dPause.toggle,style:{...DEV_PAUSE_BTN,background:dPause.paused?"#16a34a":"#b45309"}},dPause.paused?"▶ Resume":"⏸ Pause"),
        React.createElement("button",{onClick:dRestartFight,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#eee",color:"#555",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},"↺ Restart"),
        React.createElement("button",{onClick:cycleDSpeed,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},dSpeed+"x ⚡")
      ),
      React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center",padding:"12px",overflow:"hidden",gap:6}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:dTimeLeft<=10?"#ef4444":"#534AB7"}},iconText(dTimeLeft+"s ⏱")),
        React.createElement("div",{className:"battle-row",style:{display:"flex",flexDirection:"row",alignItems:"flex-start",justifyContent:"center",gap:10,width:"100%",maxWidth:"100%",overflowX:"auto",boxSizing:"border-box"}},
        React.createElement("div",{className:"battle-side-panel"},React.createElement(DamageChart,{damageDealt:snap.damageDealt})),
        React.createElement("div",{className:"battle-grid "+dBoardArt.className,style:{width:DUNGEON_GRID_COLS*DUNGEON_TILE,height:DUNGEON_GRID_ROWS*DUNGEON_TILE,borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0,...dBoardArt.style}},
          React.createElement("div",{style:{position:"absolute",top:0,left:0,display:"grid",gridTemplateColumns:`repeat(${DUNGEON_GRID_COLS},${DUNGEON_TILE}px)`,gridTemplateRows:`repeat(${DUNGEON_GRID_ROWS},${DUNGEON_TILE}px)`,gap:0}},
            Array.from({length:DUNGEON_GRID_ROWS},(_,r)=>Array.from({length:DUNGEON_GRID_COLS},(_,c)=>{
              const BORDER="1px solid #bbb";
              return React.createElement("div",{key:r+","+c,className:boardCellClass(r),style:{width:DUNGEON_TILE,height:DUNGEON_TILE,boxSizing:"border-box",background:"#fff",borderTop:r===0?"0":BORDER,borderLeft:c===0?"0":BORDER,borderRight:"0",borderBottom:"0"}});
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
          renderHazardField(dBRef.current && dBRef.current.hazards, DUNGEON_TILE),
          dAtkFx.map(e=>{
            const color=e.isEnemy?"#ef4444":"#a78bfa";
            if(e.isEmpSlam)return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE*2,height:DUNGEON_TILE*2,borderRadius:"50%",border:"4px solid #92400e",boxShadow:"0 0 18px #a16207, inset 0 0 12px rgba(146,64,14,0.5)",animation:"earthEmpSlam 0.9s ease-out forwards",pointerEvents:"none",zIndex:26}});
            if(e.isShockwave)return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE*2,height:DUNGEON_TILE*2,borderRadius:"50%",border:"3px solid #ef4444",boxShadow:"0 0 12px #ef4444",animation:"bossShockwave 0.6s ease-out forwards",pointerEvents:"none",zIndex:25}});
            // Fire: Burn ticks, Fire Hazards, and cone breath (Dread Howl).
            if(e.isBurn){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(249,115,22,0.5)",boxShadow:"inset 0 0 8px rgba(234,88,12,0.9)",animation:"pillarFlame 0.7s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            // Water Hazard triggers and missed swings -- this screen renders
            // everything else itself, but never had these two.
            if(e.isFrost||e.isMiss)return renderTileFx(e,DUNGEON_TILE);
            if(e.isPillar){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(251,146,60,0.6)",boxShadow:"inset 0 0 8px rgba(239,68,68,0.8)",animation:"pillarFlame 0.7s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isShock){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(250,204,21,0.55)",boxShadow:"inset 0 0 8px rgba(234,179,8,0.9)",animation:"shockLine 0.8s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isSplash){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:e.isCenter?"rgba(56,189,248,0.65)":"rgba(56,189,248,0.35)",boxShadow:"inset 0 0 8px rgba(14,165,233,0.8)",animation:`splashWave ${e.isCenter?0.8:1.1}s ease-out forwards`,animationDelay:e.isCenter?"0ms":"80ms",pointerEvents:"none",zIndex:20}});}
            if(e.isDark){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(109,40,217,0.45)",boxShadow:"inset 0 0 8px rgba(139,92,246,0.9)",animation:"splashWave 0.9s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            // Poison is Damage Over Time under another name, so it gets the same
            // pulse as isDark above -- venom green instead of shadow purple.
            if(e.isPoison){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,background:"rgba(22,163,74,0.45)",boxShadow:"inset 0 0 8px rgba(74,222,128,0.9)",animation:"splashWave 0.9s ease-out forwards",pointerEvents:"none",zIndex:20}});}
            if(e.isHeal){return React.createElement("div",{key:e.id,style:{position:"absolute",left:e.col*DUNGEON_TILE,top:e.row*DUNGEON_TILE,width:DUNGEON_TILE,height:DUNGEON_TILE,borderRadius:"50%",background:"rgba(34,197,94,0.4)",boxShadow:"inset 0 0 8px rgba(22,163,74,0.9)",animation:"splashWave 0.7s ease-out forwards",pointerEvents:"none",zIndex:21}});}
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
          allUnits.map(u=>{const isBurned=(u.burnTicks||0)>0;const isDotted=u.uid[0]==="p"&&(u.dotTicks||0)>0;const isWeak=u.uid[0]==="p"&&(u.weakTicks||0)>0;return React.createElement("div",{key:"du"+u.uid,ref:el=>{if(el){const hpEl=el.querySelector(".hp-fill");dUnitRefs.current.set(u.uid,{el,hpEl});el.style.left=(u.col*DUNGEON_TILE)+"px";el.style.top=(u.row*DUNGEON_TILE)+"px";}else dUnitRefs.current.delete(u.uid);},onClick:u.hp>0?()=>setDBattleSelected({type:"unit",uid:u.uid}):undefined,style:{position:"absolute",width:DUNGEON_TILE,height:DUNGEON_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:battleUnitOpacity(u,Date.now(),CREATURE_MAP[u.creatureId]),zIndex:5,pointerEvents:u.hp>0?"auto":"none",cursor:u.hp>0?"pointer":"default"}},
            React.createElement("div",{style:{position:"relative",lineHeight:1}},
              React.createElement(CreatureIcon,{def:CREATURE_MAP[u.creatureId]||{emoji:"❓"},size:DUNGEON_TILE,contain:true,state:battleArtState(u,Date.now(),dAnimRef.current)}),
              isBurned&&React.createElement("div",{style:{position:"absolute",top:1,right:1,fontSize:10,lineHeight:1}},"🔥"),
              isDotted&&React.createElement("div",{style:{position:"absolute",top:1,left:1,fontSize:10,lineHeight:1}},"🟣"),
              isWeak&&React.createElement("div",{style:{position:"absolute",bottom:7,right:1,fontSize:10,lineHeight:1}},"⬇️"),
              (u.abilFlashTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:1,left:"50%",transform:"translateX(-50%)",fontSize:12,fontWeight:900,color:"#3b82f6",textShadow:"0 0 3px #fff, 0 0 3px #fff",lineHeight:1,pointerEvents:"none"}},"!")
            ),
            React.createElement("div",{style:{position:"absolute",bottom:3,left:3,right:3,height:3,background:"#ddd",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{className:"hp-fill",style:{height:"100%",width:(u.hp/u.maxHp*100)+"%",background:u.uid[0]==="e"?"#ef4444":isBurned?"#f97316":isDotted?"#7c3aed":"#22c55e",borderRadius:2}})
            ),
            (u.abilChargeMax||0)>0&&React.createElement("div",{style:{position:"absolute",bottom:0,left:3,right:3,height:2,background:"#dbeafe",borderRadius:2,overflow:"hidden"}},
              // No transition around the fire: the full-width frame and the
              // reset to 0 both snap, so the bar visibly hits 100% instead of
              // easing down from wherever the animation had reached.
              React.createElement("div",{style:{height:"100%",width:(Math.min(1,(u.abilCharge||0)/u.abilChargeMax)*100)+"%",background:"#3b82f6",borderRadius:2,transition:(u.abilFlashTicks||0)>0?"none":"width 0.35s linear"}})
            )
          );})
        ),
        selectedUnit?React.createElement(UnitInfoPopup,{
          def:CREATURE_MAP[selectedUnit.creatureId]||{emoji:selectedUnit.creatureId==="__vine_minion"?"🌱":"❓"},
          name:CREATURE_MAP[selectedUnit.creatureId]?.name||(selectedUnit.creatureId==="__vine_minion"?"Vine":selectedUnit.creatureId),
          subtitle:selectedUnit.uid[0]==="e"?"Enemy":"Ally",
          hp:selectedUnit.hp,maxHp:selectedUnit.maxHp,shield:selectedUnit.shield,
          abilityName:CREATURE_MAP[selectedUnit.creatureId]?.abilities?.special?.name,
          abilCharge:selectedUnit.abilCharge,abilChargeMax:selectedUnit.abilChargeMax,abilFlashTicks:selectedUnit.abilFlashTicks,
          debuffs:debuffsFor(selectedUnit),
          onClose:()=>setDBattleSelected(null)
        }):selectedBoss&&React.createElement(UnitInfoPopup,{
          emoji:TYPE_EMOJI[boss?.type]||"👾",
          name:boss?.name||"Boss",
          subtitle:"Boss",
          hp:selectedBoss.hp,maxHp:selectedBoss.maxHp,shield:selectedBoss.shield,
          debuffs:debuffsFor(selectedBoss),
          onClose:()=>setDBattleSelected(null)
        })
        )
      )
    );
  }
  if(dPlanning){
    const boss=DUNGEON_BOSSES.find(b=>b.key===selected);
    const bossLevel=dungeonBossLevels?.[selected]||1;
    const enemyGrid={}; // dungeon boss fights have no regular minions (nature spawns vines separately)
    const deployedCount=Object.keys(dPlanGrid).length;
    const PLAN_BOSS_ROW=boss?.spawnRow??1,PLAN_BOSS_COL=Math.floor((DUNGEON_GRID_COLS-2)/2);
    // Highlight tiles come from the same boss module that implements the ability,
    // built on the same geometry predicates the runtime uses -- so the preview and
    // the real hit area cannot drift apart the way the old duplicated copies did.
    const planGeo=makePlanGeometry(PLAN_BOSS_ROW,PLAN_BOSS_COL,DUNGEON_GRID_ROWS,DUNGEON_GRID_COLS,DUNGEON_PLAYER_START_ROW);
    const highlightCells=getHighlightTiles(boss.key,dPlanHighlight,planGeo);
    const dBoardArt=D_BOARD_ART[selected];
    return React.createElement("div",{key:"sfv472",className:"screen-fade",style:{position:"fixed",inset:0,...D_BACKDROP[selected],display:"flex",flexDirection:"column"}},
      dAbilityTagPopup&&React.createElement(AbilityTagPopup,{popup:dAbilityTagPopup,onClose:()=>setDAbilityTagPopup(null)}),
      React.createElement("div",{className:"plan-header",style:{padding:"16px 16px 12px",gap:12,flexShrink:0,background:"var(--bar-bg)",borderBottom:"1px solid var(--bar-line)"}},
        React.createElement("button",{onClick:()=>{setDPlanning(false);},style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},React.createElement("i",{className:"ti ti-arrow-left"})),
        React.createElement("div",{style:{textAlign:"center"}},
          React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},"Planning Phase")
        ),
        React.createElement("button",{onClick:deployedCount>0?dFight:undefined,style:{background:deployedCount>0?"#534AB7":"#ccc",border:"none",borderRadius:10,padding:"6px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:deployedCount>0?"pointer":"default"}},"Fight →")
      ),
      // Never scrolls -- dPlanTile shrinks the board to whatever height this
      // row ends up with (see useFitTile).
      React.createElement("div",{ref:dPlanAreaRef,style:{flex:1,minHeight:0,overflowX:"hidden",overflowY:dPlanClamped?"auto":"hidden",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:16}},
        React.createElement("div",{className:dBoardArt.className,style:{borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0,...dBoardArt.style}},
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:`repeat(${DUNGEON_GRID_COLS},${dPlanTile}px)`,gridTemplateRows:`repeat(${DUNGEON_GRID_ROWS},${dPlanTile}px)`,gap:0}},
            Array.from({length:DUNGEON_GRID_ROWS},(_,r)=>Array.from({length:DUNGEON_GRID_COLS},(_,c)=>{
              const isPlayerZone=r>=DUNGEON_PLAYER_START_ROW;const key=r+","+c;
              const creatureId=dPlanGrid[key];const def=creatureId?CREATURE_MAP[creatureId]:null;
              const enemyDef=!isPlayerZone?enemyGrid[key]:null;
              const isDivider=r===DUNGEON_PLAYER_START_ROW;const BORDER="1px solid #bbb";
              const onHS=isPlayerZone&&creatureId?(()=>{dhs.current.fired=false;dhs.current.timer=setTimeout(()=>{dhs.current.fired=true;openDCreatureSheet(creatureId);},PLAN_INFO_HOLD_MS);}):enemyDef?(()=>{dhs.current.fired=false;dhs.current.timer=setTimeout(()=>{dhs.current.fired=true;openDCreatureSheet(enemyDef.id);},PLAN_INFO_HOLD_MS);}):undefined;
              const onHE=isPlayerZone&&creatureId?(()=>{if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}if(!dhs.current.fired&&!dTouchDrag.dragRef.current.active){setDPlanGrid(p=>{const n={...p};delete n[key];return n;});}dEndHold();}):enemyDef?(()=>{if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}}):undefined;
              return React.createElement("div",{key,"data-cell":key,className:boardCellClass(r,DUNGEON_PLAYER_START_ROW),draggable:!!(isPlayerZone&&creatureId),
                onDragStart:isPlayerZone&&creatureId?(e)=>{e.dataTransfer.effectAllowed="move";if(dhs.current.timer){clearTimeout(dhs.current.timer);dhs.current.timer=null;}closeDSheet();setDDragCell(key);setDDragId(null);}:undefined,
                onDragEnd:isPlayerZone&&creatureId?()=>dRangePreview.clear():undefined,
                onDragOver:isPlayerZone?(e)=>{e.preventDefault();dPreviewAt(dDraggedCreature(),r,c);}:()=>dRangePreview.clear(),
                onDrop:isPlayerZone?(e)=>{e.preventDefault();dRangePreview.clear();handleDCellDrop(r,c);}:undefined,
                onMouseDown:onHS,onMouseUp:onHE,
                onTouchStart:onHS?(e)=>{e.preventDefault();onHS();if(isPlayerZone&&creatureId)dTouchDrag.start(e,{fromCell:key,cellId:creatureId});}:undefined,onTouchEnd:onHE,
                style:{width:dPlanTile,height:dPlanTile,background:isPlayerZone?"#f0f0f0":"#fdf7f7",
                // An image, not a colour, so it still shows over board art (which clears cell colours).
                ...(highlightCells.has(key)?{backgroundImage:"linear-gradient(rgba(239,68,68,0.18),rgba(239,68,68,0.18))"}:null),borderTop:isDivider?"2.5px solid #534AB7":r===0?"0":BORDER,borderLeft:c===0?"0":BORDER,borderRight:"0",borderBottom:"0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,cursor:isPlayerZone?(creatureId?"grab":"default"):enemyDef?"pointer":"default",boxSizing:"border-box",userSelect:"none",...(dRangePreview.cellStyle(key)||{})}
              },(()=>{const d=def||enemyDef;if(!d)return"";return React.createElement("div",{style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("span",{style:{position:"absolute",top:1,left:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},typeIcon(d.type)),React.createElement("span",{style:{position:"absolute",top:1,right:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},rangeIcon(d.attackType === "Ranged" ? "Ranged" : "Melee")),React.createElement(CreatureIcon,{def:d,size:dPlanTile,contain:true}));})());
            })).flat()
          ),
          // Boss and minion markers: tap one for its info sheet.
          React.createElement("div",{onClick:()=>openDSheet("boss"),style:{position:"absolute",left:Math.floor((DUNGEON_GRID_COLS-2)/2)*dPlanTile,top:(boss?.spawnRow??1)*dPlanTile,width:2*dPlanTile,height:2*dPlanTile,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.4)",borderRadius:6,cursor:"pointer",userSelect:"none",zIndex:10}},
            React.createElement("div",{style:{fontSize:Math.round(dPlanTile*0.78),lineHeight:1}},TYPE_EMOJI[boss?.type]||"👾"),
            React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#ef4444",marginTop:2}},boss?.name)
          ),
          boss?.minions&&boss.minions.map((m,i)=>
            React.createElement("div",{key:"minion"+i,onClick:()=>openDSheet(i),style:{position:"absolute",left:m.col*dPlanTile,top:m.row*dPlanTile,width:dPlanTile,height:dPlanTile,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(34,197,94,0.10)",border:"2px solid rgba(34,197,94,0.5)",borderRadius:6,cursor:"pointer",userSelect:"none",zIndex:10}},
              React.createElement("div",{style:{fontSize:Math.round(dPlanTile*0.48),lineHeight:1}},m.emoji),
              React.createElement("div",{style:{fontSize:8,fontWeight:800,color:"#16a34a",marginTop:1}},m.name)
            )
          )
        )
      ),
      React.createElement("div",{style:{background:"#fff",borderTop:"1px solid #e0e0e0",padding:"10px 12px 24px",flexShrink:0},
        onDragOver:e=>{e.preventDefault();dRangePreview.clear();},
        onDrop:e=>{e.preventDefault();dRangePreview.clear();if(dDragCell){setDPlanGrid(p=>{const n={...p};delete n[dDragCell];return n;});}setDDragId(null);setDDragCell(null);}
      },
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},
          React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
            React.createElement("span",{style:{fontSize:22,fontWeight:800,color:deployedCount>=DUNGEON_MAX_DEPLOYED?"#ef4444":"#111"}},deployedCount),
            React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#aaa"}}," / "+DUNGEON_MAX_DEPLOYED+" deployed")
          ),
          React.createElement("div",{style:{display:"flex",gap:8}},
            React.createElement("button",{onClick:()=>deployedCount>0&&setDPlanGrid({}),disabled:deployedCount===0,style:{padding:"8px 14px",fontSize:14,fontWeight:700,background:"#fff",color:deployedCount>0?"#534AB7":"#ccc",border:"1.5px solid "+(deployedCount>0?"#534AB7":"#ccc"),borderRadius:12,cursor:deployedCount>0?"pointer":"default"}},iconText("🗑 Clear All")),
            React.createElement("button",{onClick:dAutoDeploy,style:{padding:"8px 16px",fontSize:14,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:12,cursor:"pointer"}},"⚡ Auto Deploy")
          )
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
              onDragEnd:!isPlaced?()=>dRangePreview.clear():undefined,
              onMouseDown:()=>dBeginHold(oc.id),onMouseUp:dEndHold,
              onTouchStart:(e)=>{e.preventDefault();dBeginHold(oc.id);if(!isPlaced)dTouchDrag.start(e,{id:oc.id});},onTouchEnd:dEndHold,
              style:{flexShrink:0,width:52,height:58,position:"relative",background:isPlaced?"#f0f0f0":"#fff",border:"none",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,cursor:isPlaced?"default":"grab",userSelect:"none"}
            },
              isHolding&&dHoldPct>15&&React.createElement("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"},viewBox:"0 0 52 58"},React.createElement("circle",{cx:26,cy:29,r:18,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:CIRC,strokeDashoffset:CIRC*(1-dHoldPct/100),strokeLinecap:"round",transform:"rotate(-90 26 29)"})),
              React.createElement("div",{style:{opacity:isPlaced?0.4:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}},
                React.createElement("div",{style:{position:"relative",lineHeight:1}},
                  React.createElement("div",{style:{position:"absolute",top:-2,left:-6,fontSize:10,lineHeight:1}},typeIcon(def.type)),
                  React.createElement("div",{style:{position:"absolute",top:-2,right:-6,fontSize:10,lineHeight:1}},rangeIcon(def.attackType === "Ranged" ? "Ranged" : "Melee")),
                  React.createElement(CreatureIcon,{def,size:24,style:{marginTop:6}})
                ),
                React.createElement("div",{style:{fontSize:8,color:"#333",fontWeight:600,textAlign:"center",lineHeight:1.2,maxWidth:48,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},def.name),
                React.createElement("div",{style:{fontSize:8,color:"#666",fontWeight:700}},"Lv."+oc.level)
              )
            );
          })
        )
      ),
      // info sheet: the boss, one of its minions, or a pressed creature
      dInfoSheet==="boss"&&boss&&React.createElement(PlanInfoSheet,{onClose:closeDSheet},
        React.createElement(SheetHeader,{icon:TYPE_EMOJI[boss.type]||"👾",title:boss.name,subtitle:"Lv. "+bossLevel}),
        boss.abilities&&[["basic","Basic",boss.abilities.basic],["special","Special",boss.abilities.special],["unique","Passive",boss.abilities.unique]].map(([key,label,ab])=>{
          if(!ab)return null;
          // A row is only a toggle when it would actually light something: the
          // boss modules define tiles for their basic and special, never for a
          // passive like Burning Touch. Asking the same registry the highlight
          // itself uses means a module that later gains passive tiles turns
          // its row on with no change here.
          const canHighlight=getHighlightTiles(boss.key,key,planGeo).size>0;
          // Boss ability tags come from data/bosses.js; creature ones are
          // derived per creature by getAbilityTags.
          return React.createElement(SheetAbilityRow,{key:label,kind:key,icon:ab.icon,tags:ab.tags,name:ab.name,desc:ab.description,onTag:setDAbilityTagPopup,
            onClick:canHighlight?()=>setDPlanHighlight(p=>p===key?null:key):undefined,active:canHighlight&&dPlanHighlight===key});
        })
      ),
      // One sheet per minion, not one per KIND -- each is its own creature with
      // its own kit, so two Vines with different abilities read correctly with
      // no change here. No tile-highlight rows: the Vines walk at you from the
      // moment the fight starts, so any "these tiles" preview would stop being
      // true after their first step. Where each one SPROUTS is its marker.
      typeof dInfoSheet==="number"&&boss?.minions?.[dInfoSheet]&&(()=>{
        const m=boss.minions[dInfoSheet];
        return React.createElement(PlanInfoSheet,{onClose:closeDSheet},
          React.createElement(SheetHeader,{icon:m.emoji,title:m.name}),
          [["basic","Basic",m.abilities.basic],["special","Special",m.abilities.special],["unique","Passive",m.abilities.unique]].map(([key,label,ab])=>ab&&
            React.createElement(SheetAbilityRow,{key:label,kind:key,icon:ab.icon,tags:ab.tags,name:ab.name,desc:ab.description,onTag:setDAbilityTagPopup}))
        );
      })(),
      dGridInfoCreature&&CREATURE_MAP[dGridInfoCreature]&&React.createElement(PlanInfoSheet,{onClose:closeDSheet},
        React.createElement(AllySheetBody,{id:dGridInfoCreature,onTag:setDAbilityTagPopup})),
      dTouchDrag.ghost&&(()=>{const gdef=CREATURE_MAP[dTouchDrag.ghost.id];if(!gdef)return null;return React.createElement("div",{style:{position:"fixed",left:dTouchDrag.ghost.x-26,top:dTouchDrag.ghost.y-29,width:52,height:52,pointerEvents:"none",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.85,filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.35))"}},React.createElement(CreatureIcon,{def:gdef,size:36}));})()
    );
  }
  if(rewards)return React.createElement("div",{key:"sfv627",className:"screen-fade",style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 0",flexShrink:0}},
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",marginBottom:4}},"🎁 Dungeon Rewards"),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:16}},rewards.length+" items from "+boss.name)
    ),
    React.createElement(GearRewardGrid,{rewards,onPick:setPreviewItem,style:{flex:1,overflowY:"auto",padding:"0 16px 16px"}}),
    previewItem&&React.createElement(GearPreviewPopup,{item:previewItem,onClose:()=>setPreviewItem(null),zIndex:150}),
    React.createElement("div",{style:{padding:"12px 16px 28px",flexShrink:0}},
      React.createElement("button",{onClick:collectRewards,style:{width:"100%",padding:"14px 0",fontSize:16,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:14,cursor:"pointer"}},"Collect All")
    )
  );
  // Rewards page: this Dungeon's type-exclusive equipment -- every item of the
  // boss's type, which rollDungeonRewards (core/gacha.js) drops from this
  // Dungeon only -- split by rarity, each with its stats and effect. Read
  // from the catalog, so a new type item appears here on its own. The back
  // arrow returns to the Dungeon.
  if(showRewards&&boss)return React.createElement("div",{key:"sfvrewards",className:"screen-fade",style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid var(--bar-line)",background:"var(--bar-bg)",flexShrink:0}},
      React.createElement("button",{onClick:()=>setShowRewards(false),"aria-label":"Back",style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1,flexShrink:0}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,lineHeight:1.25,minWidth:0}},boss.type+" Dungeon Exclusive Rewards")
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:16}},
      ["rare","epic","legendary"].map(rarity=>{
        const items=EQUIPMENT_DEFS.filter(item=>item.element===boss.type&&item.rarity===rarity);
        if(!items.length)return null;
        const rarCfg=EQUIP_RARITY_CONFIG[rarity];
        return React.createElement("div",{key:rarity,style:{marginBottom:20}},
          React.createElement("div",{style:{fontSize:12,fontWeight:700,color:rarCfg.color,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}},rarCfg.label+" ("+items.length+")"),
          items.map(item=>React.createElement("div",{key:item.id,style:{display:"flex",gap:12,alignItems:"flex-start",background:"#fff",borderRadius:14,padding:12,border:"1.5px solid "+rarCfg.color+"55",marginBottom:8}},
            React.createElement("div",{style:{width:48,height:48,flexShrink:0,borderRadius:12,background:rarCfg.bg,border:"2px solid "+rarCfg.color+"88",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}},gearIcon(item)),
            React.createElement("div",{style:{flex:1,minWidth:0}},
              React.createElement("div",{style:{fontSize:14,fontWeight:700,color:"#111"}},item.name),
              item.stats&&React.createElement("div",{style:{fontSize:12,color:"#888",marginTop:2}},Object.entries(item.stats).map(([s,v])=>formatStatBonus(s,v)).join(" · ")),
              item.effect&&React.createElement("div",{style:{fontSize:12,color:"#555",lineHeight:1.45,marginTop:6}},iconText("✦ "+item.effect))
            )
          ))
        );
      })
    )
  );
  return React.createElement("div",{key:"sfv656",className:"screen-fade",style:{position:"fixed",inset:0,background:DUNGEON_BG_BY_TYPE[boss?.type]||"#f5f5f5",transition:"background 0.5s ease",display:"flex",flexDirection:"column"}},
    // Final beat of the post-Set-1 Dungeon reveal. Same box style/size as
    // every other tutorial text box in the game (see HomeScreen's) -- full
    // width, not sized to the Fight button. The arrow (near the Fight
    // button below) is what actually points at the target.
    dungeonEnterActive&&React.createElement("div",{
      style:{position:"fixed",left:16,right:16,bottom:280,background:"#fff",border:"2px solid #534AB7",borderRadius:16,padding:"14px 16px",fontSize:14,color:"#333",lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.14)",zIndex:6,pointerEvents:"none"}
    },'You see a plaque that says "Prove your worth to earn legendary rewards."'),
    notify&&React.createElement("div",{style:{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#333",color:"#fff",borderRadius:10,padding:"8px 18px",fontSize:13,fontWeight:600,zIndex:200,whiteSpace:"nowrap"}},notify),
    buyPassesOpen&&React.createElement("div",{onClick:()=>setBuyPassesOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{className:"ui-panel",onClick:e=>e.stopPropagation(),style:{padding:"12px 8px",width:"100%",maxWidth:320,textAlign:"center"}},
        React.createElement("div",{style:{fontSize:40,marginBottom:8}},"🎫"),
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:6}},"Pass Recharge"),
        React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20}},iconText("Buy 10 more passes for 💎 "+rechargeCost+" Gems?")),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setBuyPassesOpen(false),style:{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#555",fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:()=>{setBuyPassesOpen(false);setConfirmBuyOpen(true);},disabled:(currencies.gems||0)<rechargeCost,style:{flex:2,padding:"12px 0",borderRadius:12,border:"none",background:(currencies.gems||0)>=rechargeCost?"#534AB7":"#ccc",color:"#fff",fontWeight:700,fontSize:14,cursor:(currencies.gems||0)>=rechargeCost?"pointer":"default"}},iconText("Buy · 💎 "+rechargeCost))
        )
      )
    ),
    confirmBuyOpen&&React.createElement("div",{onClick:()=>setConfirmBuyOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:310,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{className:"ui-panel",onClick:e=>e.stopPropagation(),style:{padding:"12px 8px",width:"100%",maxWidth:320,textAlign:"center"}},
        React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#111",marginBottom:6}},"Confirm Purchase"),
        React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20}},iconText("Spend 💎 "+rechargeCost+" Gems for 10 Dungeon Passes?")),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setConfirmBuyOpen(false),style:{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#555",fontWeight:700,fontSize:14,cursor:"pointer"}},"Cancel"),
          React.createElement("button",{onClick:()=>{recharge();setConfirmBuyOpen(false);},style:{flex:2,padding:"12px 0",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"Confirm")
        )
      )
    ),
    passPickerOpen&&React.createElement("div",{onClick:()=>setPassPickerOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{className:"ui-panel",onClick:e=>e.stopPropagation(),style:{padding:"12px 8px",width:"100%",maxWidth:320,textAlign:"center"}},
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
      React.createElement("button",{onClick:()=>{if(dungeonEnterActive)return;onBack();},style:{background:"none",border:"none",cursor:dungeonEnterActive?"not-allowed":"pointer",fontSize:20,color:dungeonEnterActive?"#ccc":"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700}},"🏰 Dungeon"),
      boss&&React.createElement("button",{onClick:()=>{if(dungeonEnterActive)return;setShowRewards(true);},style:{marginLeft:"auto",padding:"5px 12px",fontSize:12,fontWeight:600,background:"#f0f0f0",border:"none",borderRadius:20,cursor:dungeonEnterActive?"not-allowed":"pointer",color:dungeonEnterActive?"#ccc":"#555"}},"Rewards")
    ),
    previewItem&&React.createElement(GearPreviewPopup,{item:previewItem,onClose:()=>setPreviewItem(null),zIndex:330}),
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
        React.createElement("div",{style:{fontSize:36,fontWeight:800,color:"#111"}},"🎫 "+passes+" / "+dungeonPassDailyCap),
        React.createElement("button",{onClick:()=>{if(dungeonEnterActive)return;setBuyPassesOpen(true);},style:{position:"absolute",top:-6,right:-24,width:20,height:20,borderRadius:"50%",background:dungeonEnterActive?"#ccc":"#534AB7",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:dungeonEnterActive?"not-allowed":"pointer",padding:0,lineHeight:"20px",textAlign:"center"}},"+")
      ),
      React.createElement("div",{style:{fontSize:11,color:"#bbb"}},"Refreshes in "+getTimeToNoon()),
      React.createElement("div",{style:{display:"flex",gap:10,marginTop:4}},
        React.createElement("div",{style:{position:"relative"}},
          // Final beat of the post-Set-1 Dungeon reveal: anchored to Fight's
          // own box (not the viewport center) so it's aligned with Fight
          // regardless of screen width. Sits to the left of the button --
          // the gap above Fight (between it and the ticket count) is too
          // tight for a full-size arrow, but the open space to the left
          // (screen padding, nothing else there) has plenty of room.
          dungeonEnterActive&&React.createElement("div",{
            style:{position:"absolute",right:"100%",top:"50%",transform:"translate(0,-50%)",marginRight:10,fontSize:24,lineHeight:1,color:"#534AB7",animation:"pointerBounceX 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}
          },iconText("➡️")),
          React.createElement("button",{
            onClick:()=>{
              if(!boss)return;
              if(passes<1){setBuyPassesOpen(true);return;}
              setDPlanning(true);
              if(dungeonEnterActive){setTutorialRestricted(false);setTutorialStep(null);}
            },
            disabled:!boss,
            style:{padding:"8px 28px",fontSize:14,fontWeight:700,
              background:boss?"#534AB7":"#ccc",
              color:"#fff",border:"none",borderRadius:20,
              cursor:boss?"pointer":"default"}
          },"⚔️ Fight")
        ),
        React.createElement("button",{
          onClick:()=>{if(dungeonEnterActive)return;openFight();},disabled:!boss||dungeonEnterActive,
          style:{padding:"8px 28px",fontSize:14,fontWeight:700,
            background:boss&&!dungeonEnterActive?"#7c3aed":"#ccc",
            color:"#fff",border:"none",borderRadius:20,
            cursor:boss&&!dungeonEnterActive?"pointer":"default"}
        },"⚡ Auto Fight")
      )
    ),
    React.createElement("div",{style:{background:"#fff",borderTop:"1px solid #e0e0e0",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom)"}},
      React.createElement("div",{style:{display:"flex",borderTop:"1px solid #e0e0e0"}},
        DUNGEON_BAR_ORDER.map(k=>DUNGEON_BOSSES.find(b=>b.key===k)).filter(Boolean).map(b=>React.createElement("button",{
          key:b.key,onClick:()=>{if(dungeonEnterActive)return;setSelected(b.key);},
          // Icon only -- the name is still there for screen readers / hover.
          title:b.type,"aria-label":b.type+" Dungeon",
          style:{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
            padding:"8px 2px",border:"none",
            borderTop:"3px solid "+(selected===b.key?"#534AB7":"transparent"),
            background:selected===b.key?"#f0effe":"#fff",
            cursor:dungeonEnterActive?"not-allowed":"pointer",transition:"all .15s",
            opacity:dungeonEnterActive?0.5:1,
          }
        },
          React.createElement("span",{style:{fontSize:22,lineHeight:1}},typeIcon(b.type))
        ))
      )
    )
  );
}

export default DungeonScreen;
