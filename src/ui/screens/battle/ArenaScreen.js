// Arena: symmetric minion-vs-minion stages, no boss unit.

import React, { useState, useEffect } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../../data/creatures.js";
import { TYPE_EMOJI } from "../../../data/types.js";
import { ARENA_TABS } from "../../../data/bosses.js";
import { REWARD_DESC } from "../../../data/quests.js";
import { applyRewards } from "../../../core/rewards.js";
import { ARENA_GRID_COLS, ARENA_GRID_ROWS, ARENA_PLAYER_START_ROW, ARENA_TILE, ARENA_MAX_DEPLOYED, MELEE_RANGE, RANGED_RANGE, COOLDOWN_TICKS_AT_SPD_1 } from "../../../battle/constants.js";
import { aChebDist, aCardinalDist, aBestStep, aEase } from "../../../battle/geometry.js";
import { makeArenaBattle } from "../../../battle/state.js";
import { tickSpecialCharge, specialChargeReady, consumeSpecialCharge } from "../../../battle/tick.js";
import DamageChart from "../../../ui/components/DamageChart.js";
import UnitInfoPanel, { debuffsFor } from "../../../ui/components/UnitInfoPanel.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import { ABILITY_TAG_DEFS, getAbilityTags } from "../../../core/abilityText.js";
import useTouchDragPlacement from "../../../ui/hooks/useTouchDragPlacement.js";
import { DEV_MODE } from "../../../config.js";

// Arena tab id -> creature type it restricts deployment to. "ice" is the arena tab id
// for the Water-type arena (ARENA_TABS labels it "Water" but keeps the legacy id).
const ARENA_TAB_TYPE={fire:"Fire",nature:"Nature",earth:"Earth",electric:"Electric",ice:"Water",light:"Light",dark:"Dark"};
const ARENA_UNLOCK_COUNT=6;
const ARENA_MAX_LEVEL=50;
const ARENA_STAGES_PER_LEVEL=10;
// Arena has ARENA_MAX_LEVEL(50) x ARENA_STAGES_PER_LEVEL(10) = 500 stages total,
// matching MAX_LEVEL in core/creatures.js -- stage 1 of level 1 is enemy level 1,
// stage 10 of level 50 is enemy level 500.
function arenaEnemyLevel(arenaLevel,stageNum){
  return Math.min(500,Math.max(1,(arenaLevel-1)*ARENA_STAGES_PER_LEVEL+(stageNum||1)));
}
const ARENA_STAGE_REWARDS={1:{eggs:5},2:{flairBanana:3},3:{mysteriousOre:3},4:{candy:5},5:{eggs:5},6:{mythicalFlairBanana:1},7:{deluxeOre:1},8:{candy:5},9:{ancientFlairBanana:1},10:{legendaryEggs:1}};
// The "all" tab's own label is already "Arena", so appending " Arena" again
// would read "Arena Arena" -- every other tab's label is just the type name
// (e.g. "Fire") and still needs the suffix.
function arenaTitle(tabDef){return tabDef.id==="all"?tabDef.label:tabDef.label+" Arena";}

function ArenaScreen({onBack,onFight,onViewCreature}){
  const { equipmentLevels, equipmentAscensions, arenaLevels, setArenaLevels, arenaProgress, setArenaProgress, currencies, setCurrencies, owned, unlockedSkins, skinShards, setSkinShards, arenaPlanGrid: planGrid, setArenaPlanGrid: setPlanGrid, arenaDeepLink, setArenaDeepLink } = useGame();
  const [arenaTab,setArenaTab]=useState("all");
  // Jumps straight to a tab when navigated here from e.g. the "Complete
  // Stage 10 Level 2 of the Wind Arena"-style quests; consumed once then
  // cleared, same pattern as FarmScreen's farmDeepLink.
  useEffect(()=>{
    if(arenaDeepLink){setArenaTab(arenaDeepLink);setArenaDeepLink(null);}
  },[arenaDeepLink]);
  const [rewardPopup,setRewardPopup]=useState(null);
  const [arenaLockMsg,setArenaLockMsg]=useState(null);
  function showArenaLockToast(t){
    const reqType=ARENA_TAB_TYPE[t.id];
    const count=arenaTypeCounts[reqType]||0;
    setArenaLockMsg("Collect "+ARENA_UNLOCK_COUNT+" "+t.label+"-type creatures to unlock ("+count+" / "+ARENA_UNLOCK_COUNT+")");
    setTimeout(()=>setArenaLockMsg(null),2200);
  }
  const [arenaAbilityTagPopup,setArenaAbilityTagPopup]=useState(null);
  const ARENA_STAGE_REWARDS_DISPLAY=[
    {emoji:"🥚",label:"5 Eggs",key:"eggs",qty:5},
    {emoji:"🍌",label:"3 Flair Bananas",key:"flairBanana",qty:3},
    {emoji:"🪨",label:"3 Mysterious Ore",key:"mysteriousOre",qty:3},
    {emoji:"🍬",label:"5 Candy",key:"candy",qty:5},
    {emoji:"🥚",label:"5 Eggs",key:"eggs",qty:5},
    {emoji:"🍌✨",label:"1 Mythical Flair Banana",key:"mythicalFlairBanana",qty:1},
    {emoji:"💎",label:"1 Deluxe Ore",key:"deluxeOre",qty:1},
    {emoji:"🍬",label:"5 Candy",key:"candy",qty:5},
    {emoji:"🍌🏺",label:"1 Ancient Flair Banana",key:"ancientFlairBanana",qty:1},
    {emoji:"🥚✨",label:"1 Legendary Egg",key:"legendaryEggs",qty:1},
  ];
  const [battling,setBattling]=useState(false);
  const [battleOutcome,setBattleOutcome]=useState(null); // null|"won"|"lost"
  const [arenaBSnap,setArenaBSnap]=useState(null);
  const [arenaAtkEffects,setArenaAtkEffects]=useState([]);
  const [battleSelectedUid,setBattleSelectedUid]=useState(null);
  const _aSpd=parseInt(localStorage.getItem("battleSpeed")||"1")||1;
  const aSpeedRef=React.useRef(_aSpd);
  const aMoveAnimRef=React.useRef(Math.round(500/_aSpd*0.84));
  const [arenaBattleSpeed,setArenaBattleSpeed]=useState(_aSpd);
  const arenaBRef=React.useRef(null);
  const arenaTickRef=React.useRef(null);
  const arenaRafRef=React.useRef(null);
  const arenaBattleStartRef=React.useRef(0);
  const [arenaTimeLeft,setArenaTimeLeft]=useState(60);
  const arenaUnitDomRefs=React.useRef(new Map());
  const savedPlanGridRef=React.useRef({});
  const wonStageRef=React.useRef(1);
  const [planning,setPlanning]=useState(false);
  const [dragId,setDragId]=useState(null);
  const [dragCell,setDragCell]=useState(null);
  const [arenaEnemyInfo,setArenaEnemyInfo]=useState(null);
  const [arenaEnemyMinimized,setArenaEnemyMinimized]=useState(false);
  const [gridInfoCreature,setGridInfoCreature]=useState(null);
  const [arenaAllyMinimized,setArenaAllyMinimized]=useState(false);
  const arenaRightPanelRef=React.useRef(null);
  React.useLayoutEffect(()=>{
    if(!arenaRightPanelRef.current)return;
    if(gridInfoCreature){
      setArenaAllyMinimized(false);
      const el=arenaRightPanelRef.current;
      if(el.scrollHeight>el.clientHeight+4)setArenaEnemyMinimized(true);
    } else {
      setArenaEnemyMinimized(false);
      setArenaAllyMinimized(false);
    }
  },[gridInfoCreature]);
  // Whichever panel the player just expanded wins the space; if the two together
  // don't fit, the OTHER panel (not the one they just asked to see) auto-minimizes.
  function expandArenaPanel(which){
    requestAnimationFrame(()=>{
      const el=arenaRightPanelRef.current;if(!el)return;
      if(el.scrollHeight>el.clientHeight+4){
        if(which==="enemy")setArenaAllyMinimized(true);else setArenaEnemyMinimized(true);
      }
    });
  }
  const [holdId,setHoldId]=useState(null);
  const [holdPct,setHoldPct]=useState(0);
  const hs=React.useRef({delay:null,raf:null,id:null,fired:false});
  const ghs=React.useRef({timer:null,fired:false});
  const creatureListRef=React.useRef(null);
  const dragScroll=React.useRef({armed:false,on:false,x:0,y:0,sl:0,intentScroll:false});
  const HOLD_DELAY=350,HOLD_MS=700;
  const tabDef=ARENA_TABS.find(t=>t.id===arenaTab);
  const level=arenaLevels?.[arenaTab]||1;
  const stage=arenaProgress?.[arenaTab]||1;
  const isBoss=stage===10;
  const arenaRequiredType=ARENA_TAB_TYPE[arenaTab]||null;
  const ownedList=Object.values(owned||{}).sort((a,b)=>(b.level||1)-(a.level||1)).filter(o=>o&&CREATURE_MAP[o.id]&&(!arenaRequiredType||CREATURE_MAP[o.id].type===arenaRequiredType));
  const arenaTypeCounts=React.useMemo(()=>{
    const counts={};
    Object.values(owned||{}).forEach(o=>{
      const def=o&&CREATURE_MAP[o.id];
      if(def)counts[def.type]=(counts[def.type]||0)+1;
    });
    return counts;
  },[owned]);
  const placedIds=new Set(Object.values(planGrid));

  function onListMouseDown(e){dragScroll.current={armed:true,on:false,x:e.pageX,y:e.pageY,sl:creatureListRef.current.scrollLeft,intentScroll:false};}
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
  function beginHold(creatureId){
    endHold();
    hs.current.fired=false;
    hs.current.delay=setTimeout(()=>{
      hs.current.delay=null;hs.current.id=creatureId;setHoldId(creatureId);
      const t0=Date.now();
      function tick(){
        const pct=Math.min(100,(Date.now()-t0)/HOLD_MS*100);
        setHoldPct(pct);
        if(pct<100){hs.current.raf=requestAnimationFrame(tick);}
        else{hs.current.fired=true;hs.current.id=null;setTimeout(()=>{setHoldId(null);setHoldPct(0);onViewCreature&&onViewCreature(creatureId);},120);}
      }
      hs.current.raf=requestAnimationFrame(tick);
    },HOLD_DELAY);
  }
  function endHold(){
    if(hs.current.delay){clearTimeout(hs.current.delay);hs.current.delay=null;}
    if(hs.current.raf){cancelAnimationFrame(hs.current.raf);hs.current.raf=null;}
    hs.current.id=null;hs.current.fired=false;setHoldId(null);setHoldPct(0);
  }

  function getWinChance(lv,st){
    const base=0.90-(st-1)*0.06;
    const penalty=Math.min((lv-1)*0.015,0.25);
    return Math.max(0.15,base-penalty);
  }

  function arenaAutoDeploy(){
    const scored=Object.values(owned||{}).map(oc=>{
      const def=CREATURE_MAP[oc.id];
      if(!def)return null;
      if(arenaRequiredType&&def.type!==arenaRequiredType)return null;
      return{id:oc.id,score:(oc.level||1),attackType:def.attackType};
    }).filter(Boolean).sort((a,b)=>b.score-a.score);
    const melees=scored.filter(c=>c.attackType==="Melee");
    const ranged=scored.filter(c=>c.attackType==="Ranged");
    const half=Math.floor(ARENA_MAX_DEPLOYED/2);
    const meleePick=Math.min(melees.length,half+Math.max(0,half-ranged.length));
    const rangedPick=Math.min(ranged.length,ARENA_MAX_DEPLOYED-meleePick);
    const grid={};
    melees.slice(0,meleePick).forEach((s,i)=>{if(i<ARENA_GRID_COLS)grid[ARENA_PLAYER_START_ROW+","+i]=s.id;});
    ranged.slice(0,rangedPick).forEach((s,i)=>{if(i<ARENA_GRID_COLS)grid[(ARENA_GRID_ROWS-1)+","+i]=s.id;});
    setPlanGrid(grid);
  }

  function arenaApplyDrop(r,c,{id,fromCell}){
    const key=r+","+c;
    if(fromCell&&fromCell!==key){
      const cid=planGrid[fromCell];
      setPlanGrid(p=>{const n={...p};delete n[fromCell];if(cid)n[key]=cid;return n;});
    } else if(id){
      if(!placedIds.has(id)&&Object.keys(planGrid).length<ARENA_MAX_DEPLOYED){
        setPlanGrid(p=>({...p,[key]:id}));
      }
    }
  }
  function handleArenaCellDrop(r,c){
    arenaApplyDrop(r,c,{id:dragId,fromCell:dragCell});
    setDragId(null);setDragCell(null);
  }
  const arenaTouchDrag=useTouchDragPlacement({
    cellSelector:"[data-cell]",
    applyDrop:arenaApplyDrop,
    onCancelHold:()=>{endHold();if(ghs.current.timer){clearTimeout(ghs.current.timer);ghs.current.timer=null;}},
    onCancelDrop:(fromCell)=>setPlanGrid(p=>{const n={...p};delete n[fromCell];return n;}),
  });

  function stopArenaLoops(){
    if(arenaTickRef.current){clearInterval(arenaTickRef.current);arenaTickRef.current=null;}
    if(arenaRafRef.current){cancelAnimationFrame(arenaRafRef.current);arenaRafRef.current=null;}
  }
  function initArenaBattle(playerGrid,enemyGrid){
    return makeArenaBattle(playerGrid,enemyGrid,owned,level,aMoveAnimRef.current,equipmentLevels,equipmentAscensions,null,arenaEnemyLevel(level,stage));
  }
  function startArenaRenderLoop(){
    if(arenaRafRef.current)cancelAnimationFrame(arenaRafRef.current);
    function frame(){
      const s=arenaBRef.current;if(!s){arenaRafRef.current=null;return;}
      const now=Date.now();
      for(const u of [...s.playerUnits,...s.enemyUnits]){
        const refs=arenaUnitDomRefs.current.get(u.uid);if(!refs)continue;
        const{el,hpEl}=refs;
        if(u.hp<=0){el.style.opacity="0";continue;}
        el.style.opacity="1";
        const t=aEase(Math.min(1,(now-u.lastMoveTime)/aMoveAnimRef.current));
        el.style.left=((u.prevCol+(u.col-u.prevCol)*t)*ARENA_TILE)+"px";
        el.style.top=((u.prevRow+(u.row-u.prevRow)*t)*ARENA_TILE)+"px";
        if(hpEl)hpEl.style.width=(Math.max(0,u.hp/u.maxHp)*100)+"%";
      }
      arenaRafRef.current=requestAnimationFrame(frame);
    }
    arenaRafRef.current=requestAnimationFrame(frame);
  }
  function runArenaTick(){
    const s=arenaBRef.current;if(!s)return;
    s.tick++;
    const now=Date.now();
    const damageDealt=s.damageDealt||(s.damageDealt={});
    const MELEE_RANGE=1,RANGED_RANGE=3;
    const aliveP=s.playerUnits.filter(u=>u.hp>0);
    const aliveE=s.enemyUnits.filter(u=>u.hp>0);
    if(!aliveP.length||!aliveE.length)return;
    const allOcc=new Set([...aliveP,...aliveE].map(u=>u.row+","+u.col));
    const newFx=[];
    function actUnit(u,foes){
      u.atkCd=Math.max(0,u.atkCd-1);
      // Special-ability charge; no arena specials are implemented yet, so a
      // full bar just flashes the "!" ready marker and starts recharging.
      tickSpecialCharge(u);
      if(specialChargeReady(u))consumeSpecialCharge(u);
      const range=u.isRanged?RANGED_RANGE:MELEE_RANGE;
      const byCheb=[...foes].sort((a,b)=>aChebDist(u.row,u.col,a.row,a.col)-aChebDist(u.row,u.col,b.row,b.col));
      // Ranged: prefer any enemy already in cardinal range over nearest-by-cheb
      let atkTgt=null,moveTgt=byCheb[0];
      if(u.isRanged){
        const inRange=foes.filter(f=>aCardinalDist(u.row,u.col,f.row,f.col)<=RANGED_RANGE);
        if(inRange.length)atkTgt=inRange.sort((a,b)=>aCardinalDist(u.row,u.col,a.row,a.col)-aCardinalDist(u.row,u.col,b.row,b.col))[0];
      }
      const tgt=atkTgt||moveTgt;if(!tgt)return;
      const dist=atkTgt?aCardinalDist(u.row,u.col,atkTgt.row,atkTgt.col):aChebDist(u.row,u.col,tgt.row,tgt.col);
      if(dist<=range&&u.atkCd<=0){
        const rawDmg=u.atk*(0.8+Math.random()*0.4);
        const dmg=Math.max(1,Math.round(Math.max(1,rawDmg-(tgt.def||20)*0.35)));
        tgt.hp=Math.max(0,tgt.hp-dmg);
        if(u.uid[0]==="p")damageDealt[u.creatureId]=(damageDealt[u.creatureId]||0)+dmg;
        u.atkCd=Math.max(3,Math.round(COOLDOWN_TICKS_AT_SPD_1/u.spd));
        newFx.push({id:now+u.uid,row:tgt.row,col:tgt.col,t:now,isRanged:u.isRanged,fromRow:u.row,fromCol:u.col,isEnemy:u.uid[0]==="e"});
      } else if(dist>range){
        const aBlk=(r2,c2)=>allOcc.has(r2+","+c2)||r2<0||r2>=ARENA_GRID_ROWS||c2<0||c2>=ARENA_GRID_COLS;
        const[nr,nc]=aBestStep(u.row,u.col,tgt.row,tgt.col,aBlk,u.prevRow,u.prevCol);
        if(nr!==u.row||nc!==u.col){const newKey=nr+","+nc;allOcc.delete(u.row+","+u.col);u.prevRow=u.row;u.prevCol=u.col;u.lastMoveTime=now;u.row=nr;u.col=nc;allOcc.add(newKey);}
      }
    }
    for(const u of aliveP)actUnit(u,aliveE);
    for(const u of aliveE)actUnit(u,aliveP);
    if(newFx.length)setArenaAtkEffects(prev=>[...prev.filter(e=>now-e.t<700),...newFx]);
    setArenaBSnap({
      playerUnits:s.playerUnits.map(u=>({...u})),
      enemyUnits:s.enemyUnits.map(u=>({...u})),
      damageDealt:{...s.damageDealt}
    });
    const aGameElapsed=(Date.now()-arenaBattleStartRef.current)*aSpeedRef.current;
    const aTL=Math.min(60,Math.ceil(Math.max(0,60000-aGameElapsed)/1000));
    setArenaTimeLeft(aTL);
    if(aTL<=0){stopArenaLoops();onFight&&onFight();setTimeout(()=>setBattleOutcome("lost"),600);return;}
    const anyP=s.playerUnits.some(u=>u.hp>0);
    const anyE=s.enemyUnits.some(u=>u.hp>0);
    if(!anyE){
      winStage();
    } else if(!anyP){
      stopArenaLoops();
      onFight&&onFight();
      setTimeout(()=>setBattleOutcome("lost"),600);
    }
  }
  /** Wins the current stage: advances progress/level and grants the stage reward.
   * Shared by the normal "all enemies dead" tick outcome and the dev cheat button. */
  function winStage(){
    stopArenaLoops();
    if(isBoss){setArenaLevels(p=>({...p,[arenaTab]:Math.min(ARENA_MAX_LEVEL,(p[arenaTab]||1)+1)}));setArenaProgress(p=>({...p,[arenaTab]:1}));}
    else setArenaProgress(p=>({...p,[arenaTab]:(p[arenaTab]||1)+1}));
    wonStageRef.current=stage;
    const stageReward=ARENA_STAGE_REWARDS[stage]||{eggs:1};
    applyRewards(setCurrencies,stageReward);
    onFight&&onFight();
    setTimeout(()=>setBattleOutcome("won"),600);
  }
  function restartFight(){
    stopArenaLoops();
    setBattling(false);setBattleOutcome(null);setArenaBSnap(null);setArenaAtkEffects([]);setBattleSelectedUid(null);
    setPlanning(true);
  }
  function fight(){
    stopArenaLoops();
    savedPlanGridRef.current={...planGrid};
    const enemyGrid=getEnemyLayout(arenaTab,stage,level);
    setPlanning(false);
    setBattling(true);
    setBattleOutcome(null);
    setArenaBSnap(null);
    setArenaAtkEffects([]);
    setBattleSelectedUid(null);
    setArenaTimeLeft(60);arenaBattleStartRef.current=Date.now();
    arenaBRef.current=initArenaBattle(planGrid,enemyGrid);
    startArenaRenderLoop();
    arenaTickRef.current=setInterval(runArenaTick,Math.round(500/aSpeedRef.current));
  }
  function cycleArenaSpeed(){
    const next=arenaBattleSpeed===1?2:arenaBattleSpeed===2?4:1;
    aSpeedRef.current=next;aMoveAnimRef.current=Math.round(500/next*0.84);
    localStorage.setItem("battleSpeed",next);setArenaBattleSpeed(next);
    if(arenaTickRef.current){clearInterval(arenaTickRef.current);arenaTickRef.current=setInterval(runArenaTick,Math.round(500/next));}
  }
  React.useEffect(()=>()=>stopArenaLoops(),[]);

  const TYPE_MAP={fire:"Fire",water:"Water",earth:"Earth",electric:"Electric",dark:"Dark",light:"Light",ice:"Water",nature:"Nature",all:null};
  function getEnemiesForStage(tabId,stageNum,arenaLevel){
    const type=TYPE_MAP[tabId];
    const firstEvos=type?CREATURES.filter(c=>c.type===type&&!c.evolutionOf):CREATURES.filter(c=>!c.evolutionOf);
    const secondEvos=type?CREATURES.filter(c=>c.type===type&&c.evolutionOf&&c.evolutionId):CREATURES.filter(c=>c.evolutionOf&&c.evolutionId);
    if(!firstEvos.length)return[];
    const seed=tabId.split("").reduce((a,c)=>a+c.charCodeAt(0),0)*31+stageNum*17;
    // how many 2nd evos to sprinkle in
    let n2=0;
    if(arenaLevel<=2) n2=stageNum>=9?1:0;
    else n2=stageNum>=8?3:stageNum>=5?2:stageNum>=3?1:0;
    const enemies=[];
    for(let i=0;i<n2&&secondEvos.length;i++) enemies.push(secondEvos[Math.abs(seed+i*19)%secondEvos.length]);
    for(let i=enemies.length;i<6;i++) enemies.push(firstEvos[Math.abs(seed+i*13)%firstEvos.length]);
    return enemies;
  }
  function getStageEnemies(tabId,stageNum,arenaLevel){
    const enemies=getEnemiesForStage(tabId,stageNum,arenaLevel||1);
    return enemies.length?enemies.map(c=>c.emoji):["❓"];
  }
  function getEnemyLayout(tabId,stageNum,arenaLevel){
    const enemies=getEnemiesForStage(tabId,stageNum,arenaLevel||1);
    if(!enemies.length)return{};
    const baseSeed=tabId.split("").reduce((a,c)=>a+c.charCodeAt(0),0)*31+stageNum*17;
    const ranged=enemies.filter(c=>c.attackType==="Ranged");
    const melee=enemies.filter(c=>c.attackType!=="Ranged");
    const COLS=ARENA_GRID_COLS;
    const grid={};const used=new Set();
    function seedCol(n){return((baseSeed*1664525+n*1013904223)>>>0)%COLS;}
    function place(creature,rows,idx){
      const startCol=seedCol(idx*7+rows[0]*3);
      for(const row of rows)for(let dc=0;dc<COLS;dc++){const col=(startCol+dc)%COLS,key=row+","+col;if(!used.has(key)){grid[key]=creature;used.add(key);return;}}
    }
    ranged.forEach((c,i)=>place(c,i%2===0?[0,1]:[1,0],i));
    melee.forEach((c,i)=>place(c,i%2===0?[2,1]:[1,2],i+10));
    return grid;
  }

  if(battleOutcome){
    const won=battleOutcome==="won";
    return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",zIndex:210,padding:24,textAlign:"center"}},
      React.createElement("div",{style:{fontSize:64,marginBottom:12}},won?"✅":"💀"),
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:won?"#534AB7":"#ef4444",marginBottom:20}},won?(isBoss?"Boss Defeated!":"Victory!"):"Defeat!"),
      won&&(()=>{const REWARD_DISPLAY={eggs:["🥚","Egg","Eggs"],flairBanana:["🍌","Flair Banana","Flair Bananas"],mysteriousOre:["🪨","Mysterious Ore","Mysterious Ore"],candy:["🍬","Candy","Candy"],mythicalFlairBanana:["🍌✨","Mythical Flair Banana","Mythical Flair Bananas"],deluxeOre:["💎","Deluxe Ore","Deluxe Ore"],ancientFlairBanana:["🍌🏺","Ancient Flair Banana","Ancient Flair Bananas"],legendaryEggs:["🥚✨","Legendary Egg","Legendary Eggs"]};const r=ARENA_STAGE_REWARDS[wonStageRef.current]||{eggs:1};return React.createElement("div",{style:{background:"#f5f3ff",border:"2px solid #c4b5fd",borderRadius:14,padding:"12px 24px",marginBottom:20,display:"flex",flexDirection:"column",alignItems:"center",gap:6}},React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:1}},"Reward"),Object.entries(r).map(([k,v])=>{const d=REWARD_DISPLAY[k]||["🎁",k,k];return React.createElement("div",{key:k,style:{fontSize:16,fontWeight:700,color:"#534AB7"}},d[0]+" "+v+" "+(v===1?d[1]:d[2]));}));})(),
      React.createElement("button",{onClick:()=>{setBattling(false);setBattleOutcome(null);setArenaBSnap(null);setArenaAtkEffects([]);setPlanGrid({});setBattleSelectedUid(null);},style:{padding:"12px 36px",background:"#534AB7",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}},"Continue")
    );
  }
  if(battling){
    const snap=arenaBSnap||{playerUnits:[],enemyUnits:[],damageDealt:{}};
    const allUnits=[...snap.playerUnits,...snap.enemyUnits];
    const selectedUnit=battleSelectedUid?allUnits.find(u=>u.uid===battleSelectedUid):null;
    return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:10,background:"#fff",borderBottom:"1px solid #e0e0e0",flexShrink:0}},
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:13,fontWeight:800,color:"#111"}},tabDef.emoji+" "+arenaTitle(tabDef)+" — Lv."+arenaEnemyLevel(level,stage)+(isBoss?" (Boss)":""))
        ),
        DEV_MODE&&React.createElement("button",{onClick:winStage,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#1e1e2e",color:"#4ade80",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},"🏆 Win (Dev)"),
        React.createElement("button",{onClick:restartFight,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#eee",color:"#555",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},"↺ Restart"),
        React.createElement("button",{onClick:cycleArenaSpeed,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}},arenaBattleSpeed+"x ⚡")
      ),
      React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center",padding:"12px",overflow:"hidden",gap:6}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:arenaTimeLeft<=10?"#ef4444":"#534AB7"}},arenaTimeLeft+"s ⏱"),
        React.createElement("div",{className:"battle-row",style:{display:"flex",flexDirection:"row",alignItems:"flex-start",justifyContent:"center",gap:10,width:"100%",maxWidth:"100%",overflowX:"auto",boxSizing:"border-box"}},
        React.createElement("div",{className:"battle-side-panel"},React.createElement(DamageChart,{damageDealt:snap.damageDealt})),
        React.createElement("div",{className:"battle-grid",style:{width:ARENA_GRID_COLS*ARENA_TILE,height:ARENA_GRID_ROWS*ARENA_TILE,borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0}},
          React.createElement("div",{style:{position:"absolute",top:0,left:0,display:"grid",gridTemplateColumns:`repeat(${ARENA_GRID_COLS},${ARENA_TILE}px)`,gridTemplateRows:`repeat(${ARENA_GRID_ROWS},${ARENA_TILE}px)`,gap:0}},
            Array.from({length:ARENA_GRID_ROWS},(_,r)=>Array.from({length:ARENA_GRID_COLS},(_,c)=>{
              const BORDER="1px solid #bbb";
              return React.createElement("div",{key:r+","+c,style:{
                width:ARENA_TILE,height:ARENA_TILE,boxSizing:"border-box",
                background:"#fff",
                borderTop:r===0?"0":BORDER,
                borderLeft:c===0?"0":BORDER,borderRight:"0",borderBottom:"0",
              }});
            })).flat()
          ),
          arenaAtkEffects.map(e=>{
            const color=e.isEnemy?"#ef4444":"#a78bfa";
            if(e.isRanged){
              const dRow=e.row-e.fromRow,dCol=e.col-e.fromCol;
              const dist=Math.sqrt(dRow*dRow+dCol*dCol)||1;
              const dur=Math.round(300+dist*50);
              return React.createElement("div",{key:e.id,
                ref:el=>{if(!el)return;el.getBoundingClientRect();el.style.left=(e.col*ARENA_TILE+ARENA_TILE/2)+"px";el.style.top=(e.row*ARENA_TILE+ARENA_TILE/2)+"px";el.style.opacity="0";},
                style:{position:"absolute",left:e.fromCol*ARENA_TILE+ARENA_TILE/2,top:e.fromRow*ARENA_TILE+ARENA_TILE/2,
                  width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,
                  transform:"translate(-50%,-50%)",transition:`left ${dur}ms linear,top ${dur}ms linear,opacity ${dur*0.3}ms linear ${dur*0.7}ms`,
                  pointerEvents:"none",zIndex:20}});
            }
            return React.createElement(React.Fragment,{key:e.id},
              React.createElement("div",{style:{
                position:"absolute",left:e.fromCol*ARENA_TILE+ARENA_TILE/2,top:e.fromRow*ARENA_TILE+ARENA_TILE/2,
                width:ARENA_TILE*1.1,height:ARENA_TILE*1.1,borderRadius:"50%",
                background:e.isEnemy?"rgba(239,68,68,0.35)":"rgba(99,102,241,0.35)",
                border:`2px solid ${e.isEnemy?"#ef4444":"#6366f1"}`,
                animation:"meleeSwing 0.4s ease-out forwards",pointerEvents:"none",zIndex:19,transform:"translate(-50%,-50%)"}},null),
              React.createElement("div",{style:{
                position:"absolute",left:e.col*ARENA_TILE+ARENA_TILE/2,top:e.row*ARENA_TILE+ARENA_TILE/2,
                width:ARENA_TILE*0.85,height:ARENA_TILE*0.85,borderRadius:"50%",background:color,
                animation:"atkImpact 0.55s ease-out forwards",pointerEvents:"none",zIndex:20,transform:"translate(-50%,-50%)"}},null)
            );
          }),
          allUnits.map(u=>React.createElement("div",{
            key:"au"+u.uid,
            ref:el=>{
              if(el){const hpEl=el.querySelector(".hp-fill");arenaUnitDomRefs.current.set(u.uid,{el,hpEl});el.style.left=(u.col*ARENA_TILE)+"px";el.style.top=(u.row*ARENA_TILE)+"px";}
              else arenaUnitDomRefs.current.delete(u.uid);
            },
            onClick:u.hp>0?()=>setBattleSelectedUid(u.uid):undefined,
            style:{position:"absolute",width:ARENA_TILE,height:ARENA_TILE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:u.hp>0?1:0,zIndex:5,pointerEvents:u.hp>0?"auto":"none",cursor:u.hp>0?"pointer":"default"}
          },
            React.createElement("div",{style:{position:"relative",lineHeight:1}},
              React.createElement(CreatureIcon,{def:CREATURE_MAP[u.creatureId]||{emoji:"❓"},size:20}),
              (u.burnTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:-4,right:-6,fontSize:10,lineHeight:1}},"🔥"),
              (u.abilFlashTicks||0)>0&&React.createElement("div",{style:{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",fontSize:12,fontWeight:900,color:"#3b82f6",textShadow:"0 0 3px #fff, 0 0 3px #fff",lineHeight:1,pointerEvents:"none"}},"!")
            ),
            React.createElement("div",{style:{position:"absolute",bottom:3,left:3,right:3,height:3,background:"#ddd",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{className:"hp-fill",style:{height:"100%",width:(u.hp/u.maxHp*100)+"%",background:u.uid[0]==="e"?"#ef4444":(u.burnTicks||0)>0?"#f97316":"#22c55e",borderRadius:2}})
            ),
            (u.abilChargeMax||0)>0&&React.createElement("div",{style:{position:"absolute",bottom:0,left:3,right:3,height:2,background:"#dbeafe",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{style:{height:"100%",width:(Math.min(1,(u.abilCharge||0)/u.abilChargeMax)*100)+"%",background:"#3b82f6",borderRadius:2,transition:"width 0.35s linear"}})
            )
          ))
        ),
        React.createElement("div",{className:"battle-side-panel"},selectedUnit?React.createElement(UnitInfoPanel,{
          emoji:CREATURE_MAP[selectedUnit.creatureId]?.emoji||"❓",
          image:CREATURE_MAP[selectedUnit.creatureId]?.image,
          name:CREATURE_MAP[selectedUnit.creatureId]?.name||selectedUnit.creatureId,
          subtitle:selectedUnit.uid[0]==="e"?"Enemy":"Ally",
          hp:selectedUnit.hp,maxHp:selectedUnit.maxHp,
          abilityName:CREATURE_MAP[selectedUnit.creatureId]?.abilities?.special?.name,
          abilCharge:selectedUnit.abilCharge,abilChargeMax:selectedUnit.abilChargeMax,
          debuffs:debuffsFor(selectedUnit),
          onClose:()=>setBattleSelectedUid(null)
        }):React.createElement("div",{style:{width:150,flexShrink:0}}))
        )
      )
    );
  }
  if(planning){
    const deployedCount=Object.keys(planGrid).length;
    const enemyGrid=getEnemyLayout(arenaTab,stage,level);
    const abilityLabels={basic:"Basic",special:"Special",unique:"Unique"};
    return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",display:"flex",flexDirection:"column"}},
      arenaAbilityTagPopup&&React.createElement("div",{onClick:()=>setArenaAbilityTagPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
        React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"20px 18px",width:260,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
          React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:8}},ABILITY_TAG_DEFS[arenaAbilityTagPopup].label),
          React.createElement("div",{style:{fontSize:13,color:"#555",lineHeight:1.4,marginBottom:16}},ABILITY_TAG_DEFS[arenaAbilityTagPopup].description),
          React.createElement("button",{onClick:()=>setArenaAbilityTagPopup(null),style:{width:"100%",padding:"9px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
        )
      ),
      // header
      React.createElement("div",{style:{display:"flex",alignItems:"center",padding:"16px 16px 12px",gap:12,flexShrink:0,background:"#fff",borderBottom:"1px solid #e0e0e0"}},
        React.createElement("button",{onClick:()=>{setPlanning(false);setGridInfoCreature(null);endHold();},style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
          React.createElement("i",{className:"ti ti-arrow-left"})
        ),
        React.createElement("div",{style:{flex:1,textAlign:"center"}},
          React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},"Planning Phase")
        ),
        DEV_MODE&&React.createElement("button",{onClick:winStage,style:{padding:"6px 12px",fontSize:12,fontWeight:700,background:"#1e1e2e",color:"#4ade80",border:"none",borderRadius:8,cursor:"pointer",flexShrink:0,marginRight:8}},"🏆 Win (Dev)"),
        React.createElement("button",{
          onClick:deployedCount>0?fight:undefined,
          style:{background:deployedCount>0?"#534AB7":"#ccc",border:"none",borderRadius:10,padding:"6px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:deployedCount>0?"pointer":"default"}
        },"Fight →")
      ),
      // grid + info panel row
      React.createElement("div",{style:{flex:1,overflowY:"auto",display:"flex",justifyContent:"flex-start",alignItems:"flex-start",padding:"16px 0 16px 16px",gap:12}},
        // grid
        React.createElement("div",{style:{borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #bbb",position:"relative",flexShrink:0}},
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:`repeat(${ARENA_GRID_COLS},${ARENA_TILE}px)`,gridTemplateRows:`repeat(${ARENA_GRID_ROWS},${ARENA_TILE}px)`,gap:0}},
            Array.from({length:ARENA_GRID_ROWS},(_,r)=>Array.from({length:ARENA_GRID_COLS},(_,c)=>{
              const isPlayerZone=r>=ARENA_PLAYER_START_ROW;
              const key=r+","+c;
              const creatureId=planGrid[key];
              const def=creatureId?CREATURE_MAP[creatureId]:null;
              const enemyDef=!isPlayerZone?enemyGrid[key]:null;
              const isDivider=r===ARENA_PLAYER_START_ROW;
              const BORDER="1px solid #bbb";
              const onHoldStart=isPlayerZone&&creatureId
                ?(()=>{ghs.current.fired=false;ghs.current.timer=setTimeout(()=>{ghs.current.fired=true;setGridInfoCreature(creatureId);},180);})
                :enemyDef
                  ?(()=>{ghs.current.fired=false;ghs.current.timer=setTimeout(()=>{ghs.current.fired=true;setArenaEnemyMinimized(false);setArenaEnemyInfo(enemyDef.id);expandArenaPanel("enemy");},180);})
                  :undefined;
              const onHoldEnd=isPlayerZone&&creatureId
                ?(()=>{if(ghs.current.timer){clearTimeout(ghs.current.timer);ghs.current.timer=null;}if(!ghs.current.fired&&!arenaTouchDrag.dragRef.current.active){setPlanGrid(p=>{const n={...p};delete n[key];return n;});}})
                :enemyDef
                  ?(()=>{if(ghs.current.timer){clearTimeout(ghs.current.timer);ghs.current.timer=null;}})
                  :undefined;
              return React.createElement("div",{
                key,"data-cell":key,
                draggable:!!(isPlayerZone&&creatureId),
                onDragStart:isPlayerZone&&creatureId?(e)=>{e.dataTransfer.effectAllowed="move";setDragCell(key);setDragId(null);}:undefined,
                onDragOver:isPlayerZone?(e)=>e.preventDefault():undefined,
                onDrop:isPlayerZone?(e)=>{e.preventDefault();handleArenaCellDrop(r,c);}:undefined,
                onMouseDown:onHoldStart,
                onMouseUp:onHoldEnd,
                onTouchStart:onHoldStart?(e)=>{e.preventDefault();onHoldStart();if(isPlayerZone&&creatureId)arenaTouchDrag.start(e,{fromCell:key,cellId:creatureId});}:undefined,
                onTouchEnd:onHoldEnd,
                style:{
                  width:ARENA_TILE,height:ARENA_TILE,
                  background:isPlayerZone?"#f0f0f0":"#fdf7f7",
                  borderTop:isDivider?"2.5px solid #534AB7":r===0?"0":BORDER,
                  borderLeft:c===0?"0":BORDER,
                  borderRight:"0",borderBottom:"0",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,cursor:isPlayerZone?(creatureId?"grab":"default"):"default",
                  boxSizing:"border-box",userSelect:"none",
                }
              },(()=>{const d=def||enemyDef;if(!d)return"";return React.createElement("div",{style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("span",{style:{position:"absolute",top:1,left:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},TYPE_EMOJI[d.type]||""),React.createElement("span",{style:{position:"absolute",top:1,right:2,fontSize:8,lineHeight:1,pointerEvents:"none"}},d.attackType==="Ranged"?"🏹":"⚔️"),React.createElement(CreatureIcon,{def:d,size:26}));})());
            })).flat()
          )
        ),
        // right info panels
        React.createElement("div",{ref:arenaRightPanelRef,style:{flex:1,alignSelf:"stretch",padding:"0 12px 0 0",minWidth:0,display:"flex",flexDirection:"column",gap:8,overflow:"hidden"}},
          // enemy panel
          arenaEnemyInfo&&(()=>{
            const def=CREATURE_MAP[arenaEnemyInfo];
            if(!def)return null;
            return React.createElement("div",{style:{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",position:"relative"}},
              React.createElement("button",{onClick:()=>setArenaEnemyMinimized(p=>{const next=!p;if(!next)expandArenaPanel("enemy");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},arenaEnemyMinimized?"＋":"－"),
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:arenaEnemyMinimized?0:12}},
                React.createElement(CreatureIcon,{def,size:28}),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},def.name),
                  React.createElement("div",{style:{fontSize:11,color:"#666",fontWeight:600}},def.type+" · "+(def.attackType||"Melee")+" · Lv."+arenaEnemyLevel(level,stage)+" · Enemy")
                )
              ),
              !arenaEnemyMinimized&&def.abilities&&Object.entries(def.abilities).map(([k,abl])=>{
                if(!abl)return null;
                const abilityTags=getAbilityTags(def.id,k);
                return React.createElement("div",{key:k,style:{marginBottom:10}},
                  React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:2}},
                    React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:0.5}},abilityLabels[k]||k),
                    abilityTags.length>0&&React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}},
                      ...abilityTags.map(tag=>React.createElement("button",{
                        key:tag,
                        onClick:(e)=>{e.stopPropagation();setArenaAbilityTagPopup(tag);},
                        style:{fontSize:9,fontWeight:800,color:"#534AB7",background:"#EEEDFE",border:"1px solid rgba(83,74,183,0.4)",borderRadius:10,padding:"1px 8px",cursor:"pointer",lineHeight:1.5,flexShrink:0,whiteSpace:"nowrap"}
                      },ABILITY_TAG_DEFS[tag].label))
                    )
                  ),
                  React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#111"}},abl.name),
                  React.createElement("div",{style:{fontSize:10,color:"#555",marginTop:2}},abl.upgrades?abl.upgrades[0]:"")
                );
              })
            );
          })(),
          // ally creature panel
          gridInfoCreature&&(()=>{
            const def=CREATURE_MAP[gridInfoCreature];
            const oc=owned&&owned[gridInfoCreature];
            if(!def)return null;
            return React.createElement("div",{style:{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",position:"relative"}},
              React.createElement("button",{onClick:()=>setArenaAllyMinimized(p=>{const next=!p;if(!next)expandArenaPanel("ally");return next;}),style:{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#888",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}},arenaAllyMinimized?"＋":"－"),
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:arenaAllyMinimized?0:12}},
                React.createElement(CreatureIcon,{def,size:28}),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:14,fontWeight:800,color:"#111"}},def.name),
                  React.createElement("div",{style:{fontSize:11,color:"#666",fontWeight:600}},def.type+" · "+(def.attackType||"Melee")+(oc?" · Lv."+oc.level:""))
                )
              ),
              !arenaAllyMinimized&&def.abilities&&Object.entries(def.abilities).map(([k,abl])=>{
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
                        onClick:(e)=>{e.stopPropagation();setArenaAbilityTagPopup(tag);},
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
      // creature list
      React.createElement("div",{
        style:{background:"#fff",borderTop:"1px solid #e0e0e0",padding:"10px 12px 24px",flexShrink:0},
        onDragOver:e=>e.preventDefault(),
        onDrop:e=>{e.preventDefault();if(dragCell){setPlanGrid(p=>{const n={...p};delete n[dragCell];return n;});}setDragId(null);setDragCell(null);}
      },
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},
          React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
            React.createElement("span",{style:{fontSize:22,fontWeight:800,color:deployedCount>=ARENA_MAX_DEPLOYED?"#ef4444":"#111"}},deployedCount),
            React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"#aaa"}}," / "+ARENA_MAX_DEPLOYED+" deployed")
          ),
          React.createElement("div",{style:{display:"flex",gap:8}},
            React.createElement("button",{onClick:()=>deployedCount>0&&setPlanGrid({}),disabled:deployedCount===0,style:{padding:"8px 14px",fontSize:14,fontWeight:700,background:"#fff",color:deployedCount>0?"#534AB7":"#ccc",border:"1.5px solid "+(deployedCount>0?"#534AB7":"#ccc"),borderRadius:12,cursor:deployedCount>0?"pointer":"default"}},"🗑 Clear All"),
            React.createElement("button",{onClick:arenaAutoDeploy,style:{padding:"8px 16px",fontSize:14,fontWeight:700,background:"#534AB7",color:"#fff",border:"none",borderRadius:12,cursor:"pointer"}},"⚡ Auto Deploy")
          )
        ),
        ownedList.length===0
          ?React.createElement("div",{style:{fontSize:12,color:"#999",padding:"10px 2px"}},"No "+arenaRequiredType+"-type creatures to deploy.")
          :React.createElement("div",{
          ref:creatureListRef,
          onMouseDown:onListMouseDown,
          onMouseMove:onListMouseMove,
          onMouseUp:onListMouseUp,
          onMouseLeave:onListMouseUp,
          style:{display:"grid",gridAutoFlow:"column",gridTemplateRows:"repeat(2,58px)",gridAutoColumns:52,gap:6,overflowX:"auto",overflowY:"hidden",cursor:"grab",paddingBottom:4,userSelect:"none"}
        },
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
              onDragStart:!isPlaced?(e)=>{if(dragScroll.current.intentScroll){e.preventDefault();return;}if(hs.current.id===oc.id){e.preventDefault();return;}endHold();e.dataTransfer.effectAllowed="move";setDragId(oc.id);setDragCell(null);}:undefined,
              onMouseDown:()=>beginHold(oc.id),
              onMouseUp:endHold,
              onTouchStart:(e)=>{e.preventDefault();beginHold(oc.id);if(!isPlaced)arenaTouchDrag.start(e,{id:oc.id});},
              onTouchEnd:endHold,
              style:{
                flexShrink:0,width:52,height:58,position:"relative",
                background:isPlaced?"#f0f0f0":"#fff",
                border:"none",
                borderRadius:10,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:1,
                cursor:isPlaced?"default":"grab",userSelect:"none",
              }
            },
              isHolding&&holdPct>15&&React.createElement("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"},viewBox:"0 0 52 58"},
                React.createElement("circle",{cx:26,cy:29,r:18,fill:"none",stroke:"#534AB7",strokeWidth:3,strokeDasharray:CIRC,strokeDashoffset:CIRC*(1-holdPct/100),strokeLinecap:"round",transform:"rotate(-90 26 29)"})
              ),
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
      ),
      arenaTouchDrag.ghost&&(()=>{const gdef=CREATURE_MAP[arenaTouchDrag.ghost.id];if(!gdef)return null;return React.createElement("div",{style:{position:"fixed",left:arenaTouchDrag.ghost.x-26,top:arenaTouchDrag.ghost.y-29,width:52,height:52,pointerEvents:"none",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.85,filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.35))"}},React.createElement(CreatureIcon,{def:gdef,size:36}));})()
    );
  }


  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f5f5f5"}},
    rewardPopup!==null&&(()=>{const rd=ARENA_STAGE_REWARDS_DISPLAY[rewardPopup];return React.createElement("div",{onClick:()=>setRewardPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
        React.createElement("div",{style:{fontSize:52,lineHeight:1,marginBottom:12}},rd.emoji),
        React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginBottom:8}},rd.label),
        React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:4}},REWARD_DESC[rd.key]||""),
        React.createElement("button",{onClick:()=>setRewardPopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
      )
    );})(),
    arenaLockMsg&&React.createElement("div",{style:{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.8)",color:"#fff",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,whiteSpace:"nowrap",zIndex:300,pointerEvents:"none",animation:"toastFade 2.2s ease-in-out"}},arenaLockMsg),
    React.createElement("div",{style:{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e0e0e0",background:"#fff",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,flex:1}},tabDef.emoji+" "+arenaTitle(tabDef)),
      React.createElement("div",{style:{background:"#534AB7",color:"#fff",borderRadius:20,padding:"3px 14px",fontSize:13,fontWeight:700,flexShrink:0}},"Rank "+level)
    ),
    React.createElement("div",{style:{display:"flex",flex:1,overflow:"hidden"}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",width:72,borderRight:"1px solid #e0e0e0",background:"#fff",flexShrink:0,justifyContent:"space-evenly"}},
        ARENA_TABS.map(t=>{
          const reqType=ARENA_TAB_TYPE[t.id];
          const isLocked=reqType&&(arenaTypeCounts[reqType]||0)<ARENA_UNLOCK_COUNT;
          return React.createElement("button",{key:t.id,onClick:()=>{if(isLocked){showArenaLockToast(t);return;}setArenaTab(t.id);},style:{
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
            flex:1,padding:"4px",border:"none",
            borderRight:arenaTab===t.id?"3px solid #534AB7":"3px solid transparent",
            background:arenaTab===t.id?"#f0effe":"none",
            color:isLocked?"#bbb":(arenaTab===t.id?"#534AB7":"#555"),
            fontSize:10,fontWeight:arenaTab===t.id?700:400,cursor:"pointer",transition:"background 0.15s",
            opacity:isLocked?0.6:1,
          }},React.createElement("span",{style:{fontSize:20}},isLocked?"🔒":t.emoji),t.label);
        })
      ),
      React.createElement("div",{style:{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}},
        React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:5}},
          Array.from({length:10},(_,i)=>{
            const stageNum=i+1;
            const isPast=stageNum<stage;
            const isCurrent=stageNum===stage;
            const isFutureStage=stageNum>stage;
            const isThisBoss=stageNum===10;
            const enemies=getStageEnemies(arenaTab,stageNum,level);
            const bg=isPast?"#f0effe":isCurrent?(isThisBoss?"#fff3e0":"#f0effe"):"#fff";
            const border=isPast?"#c4b5fd":isCurrent?(isThisBoss?"#ff9800":"#534AB7"):"#e0e0e0";
            return React.createElement("div",{
              key:i,
              onClick:isCurrent?()=>setPlanning(true):undefined,
              style:{
                display:"flex",alignItems:"center",gap:12,flex:1,
                padding:"0 14px",borderRadius:12,
                background:bg,border:"2px solid "+border,
                opacity:isFutureStage?0.45:1,
                cursor:isCurrent?"pointer":"default",
                transition:"opacity .15s",
                boxShadow:isCurrent?"0 2px 12px rgba(83,74,183,0.15)":"none",
              }
            },
              React.createElement("div",{style:{flexShrink:0,minWidth:32,textAlign:"center",lineHeight:1.05,marginRight:8}},
                React.createElement("div",{style:{fontSize:8,fontWeight:700,color:"#aaa",letterSpacing:0.3}},"LV"),
                React.createElement("div",{style:{fontSize:17,fontWeight:800,color:isThisBoss?"#ff9800":isCurrent?"#534AB7":"#999"}},arenaEnemyLevel(level,stageNum))
              ),
              React.createElement("div",{style:{flex:1,minWidth:0}},
                isPast&&React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:3}},"COMPLETE"),
                React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center",opacity:isPast?0.3:1,overflow:"hidden"}},
                  enemies.map((e,ei)=>React.createElement("span",{key:ei,style:{fontSize:22,lineHeight:1,flexShrink:0}},e))
                )
              ),
              (()=>{const rd=ARENA_STAGE_REWARDS_DISPLAY[i];return React.createElement("div",{onClick:!isPast?(e=>{e.stopPropagation();setRewardPopup(i);}):undefined,style:{flexShrink:0,textAlign:"center",cursor:isPast?"default":"pointer",opacity:isPast?0.35:1}},
                React.createElement("div",{style:{fontSize:24,lineHeight:1}},rd.emoji),
                React.createElement("div",{style:{fontSize:12,fontWeight:800,color:"#555",marginTop:2}},rd.qty)
              );})()
            );
          })
        )
      )
    ),
  );
}


export default ArenaScreen;
