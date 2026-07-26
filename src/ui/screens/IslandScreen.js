// Pan/zoom island map showing owned creatures across unlockable chunks.

import React, { useState, useEffect, useRef } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { ISLAND_COLS, ISLAND_ROWS, ISLAND_TILE, TILE_COLORS, ISLAND_GRID, GRASS_CELLS, CHUNK_SIZE, CHUNK_COLS, CHUNK_ROWS_COUNT, CHUNK_COST, chunkKey, chunkHasLand } from "../../data/island.js";
import { getDisplayEmoji } from "../../core/creatures.js";

function IslandScreen(){
  const { owned, unlockedSkins, unlockedChunks, setUnlockedChunks, currencies, setCurrencies } = useGame();
  const creatures=Object.values(owned);
  const placements=GRASS_CELLS.slice(0,creatures.length).map((pos,i)=>({...pos,creature:creatures[i]}));
  const containerRef=useRef(null);
  const gestureRef=useRef(null);
  const[view,setView]=useState(()=>{
    const W=window.innerWidth,H=window.innerHeight;
    const scale=Math.min(W/(ISLAND_COLS*ISLAND_TILE),H/(ISLAND_ROWS*ISLAND_TILE),1);
    const gW=ISLAND_COLS*ISLAND_TILE*scale,gH=ISLAND_ROWS*ISLAND_TILE*scale;
    return{x:(W-gW)/2,y:(H-gH)/2,scale};
  });
  const[selectedChunk,setSelectedChunk]=useState(null); // {cc,cr}
  const[notify,setNotify]=useState(null);

  function isUnlocked(cc,cr){return unlockedChunks.has(chunkKey(cc,cr));}
  function isAdjacent(cc,cr){
    return[[0,1],[0,-1],[1,0],[-1,0]].some(([dc,dr])=>unlockedChunks.has(chunkKey(cc+dc,cr+dr)));
  }
  function unlockChunk(cc,cr){
    if((currencies.binoculars||0)<CHUNK_COST){setNotify("Not enough 🔭 Binoculars!");setTimeout(()=>setNotify(null),2000);return;}
    setUnlockedChunks(prev=>new Set([...prev,chunkKey(cc,cr)]));
    setCurrencies(c=>({...c,binoculars:(c.binoculars||0)-CHUNK_COST}));
    setSelectedChunk(null);
  }

  const MIN_SCALE=0.35,MAX_SCALE=2.5;
  function clamp(val,min,max){return Math.min(max,Math.max(min,val));}

  function clampPan(x,y,scale,W,H){
    const gW=ISLAND_COLS*ISLAND_TILE*scale,gH=ISLAND_ROWS*ISLAND_TILE*scale;
    return{
      x:gW<=W?( W-gW)/2:clamp(x,W-gW,0),
      y:gH<=H?(H-gH)/2:clamp(y,H-gH,0),
    };
  }

  function pinchDist(touches){
    const dx=touches[0].clientX-touches[1].clientX,dy=touches[0].clientY-touches[1].clientY;
    return Math.hypot(dx,dy);
  }
  function pinchMid(touches){
    return{x:(touches[0].clientX+touches[1].clientX)/2,y:(touches[0].clientY+touches[1].clientY)/2};
  }

  function onTouchStart(e){
    if(e.touches.length===2){
      gestureRef.current={mode:"pinch",startDist:pinchDist(e.touches),startMid:pinchMid(e.touches),startScale:view.scale,startPan:{x:view.x,y:view.y}};
    } else {
      gestureRef.current={mode:"pan",startX:e.touches[0].clientX,startY:e.touches[0].clientY,startPan:{x:view.x,y:view.y}};
    }
  }
  function onTouchMove(e){
    e.preventDefault();
    if(!gestureRef.current)return;
    const el=containerRef.current;
    const W=el?el.clientWidth:390,H=el?el.clientHeight:600;
    if(gestureRef.current.mode==="pinch"&&e.touches.length===2){
      const{startDist,startMid,startScale,startPan}=gestureRef.current;
      const newDist=pinchDist(e.touches);
      const newScale=clamp(startScale*(newDist/startDist),MIN_SCALE,MAX_SCALE);
      const mid=pinchMid(e.touches);
      const dx=mid.x-startMid.x,dy=mid.y-startMid.y;
      // zoom toward pinch midpoint
      const scaleDelta=newScale/startScale;
      const nx=mid.x+(startPan.x-mid.x)*scaleDelta+dx;
      const ny=mid.y+(startPan.y-mid.y)*scaleDelta+dy;
      const clamped=clampPan(nx,ny,newScale,W,H);
      setView({x:clamped.x,y:clamped.y,scale:newScale});
    } else if(gestureRef.current.mode==="pan"&&e.touches.length===1){
      const{startX,startY,startPan}=gestureRef.current;
      const dx=e.touches[0].clientX-startX,dy=e.touches[0].clientY-startY;
      const clamped=clampPan(startPan.x+dx,startPan.y+dy,view.scale,W,H);
      setView(v=>({...v,...clamped}));
    }
  }
  function onTouchEnd(e){
    if(e.touches.length<2&&gestureRef.current?.mode==="pinch"){
      if(e.touches.length===1){
        gestureRef.current={mode:"pan",startX:e.touches[0].clientX,startY:e.touches[0].clientY,startPan:{x:view.x,y:view.y}};
      } else {
        gestureRef.current=null;
      }
    } else if(e.touches.length===0){
      gestureRef.current=null;
    }
  }

  // Mouse drag
  function onMouseDown(e){
    gestureRef.current={mode:"pan",startX:e.clientX,startY:e.clientY,startPan:{x:view.x,y:view.y}};
  }
  function onMouseMove(e){
    if(!gestureRef.current||gestureRef.current.mode!=="pan")return;
    const el=containerRef.current;
    const W=el?el.clientWidth:390,H=el?el.clientHeight:600;
    const dx=e.clientX-gestureRef.current.startX,dy=e.clientY-gestureRef.current.startY;
    const clamped=clampPan(gestureRef.current.startPan.x+dx,gestureRef.current.startPan.y+dy,view.scale,W,H);
    setView(v=>({...v,...clamped}));
  }
  function onMouseUp(){gestureRef.current=null;}

  // Mouse wheel zoom
  function onWheel(e){
    e.preventDefault();
    const el=containerRef.current;
    const W=el?el.clientWidth:390,H=el?el.clientHeight:600;
    const factor=e.deltaY<0?1.1:0.91;
    const newScale=clamp(view.scale*factor,MIN_SCALE,MAX_SCALE);
    const rect=el.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const scaleDelta=newScale/view.scale;
    const nx=mx+(view.x-mx)*scaleDelta;
    const ny=my+(view.y-my)*scaleDelta;
    const clamped=clampPan(nx,ny,newScale,W,H);
    setView({x:clamped.x,y:clamped.y,scale:newScale});
  }

  useEffect(()=>{
    const el=containerRef.current;
    if(!el)return;
    el.addEventListener("wheel",onWheel,{passive:false});
    el.addEventListener("touchmove",onTouchMove,{passive:false});
    return()=>{el.removeEventListener("wheel",onWheel);el.removeEventListener("touchmove",onTouchMove);};
  });

  return React.createElement("div",{
    ref:containerRef,
    onMouseDown,onMouseMove,onMouseUp,onMouseLeave:onMouseUp,
    onTouchStart,onTouchEnd,
    style:{width:"100%",height:"100%",overflow:"hidden",cursor:"grab",background:TILE_COLORS.W,position:"relative",userSelect:"none",touchAction:"none"},
  },
    React.createElement("div",{style:{
      position:"absolute",
      transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`,
      transformOrigin:"0 0",
      display:"grid",
      gridTemplateColumns:`repeat(${ISLAND_COLS},${ISLAND_TILE}px)`,
      gridTemplateRows:`repeat(${ISLAND_ROWS},${ISLAND_TILE}px)`,
      width:ISLAND_COLS*ISLAND_TILE,
      willChange:"transform",
    }},
      ISLAND_GRID.flatMap((row,r)=>row.map((cell,c)=>{
        const cc=Math.floor(c/CHUNK_SIZE),cr=Math.floor(r/CHUNK_SIZE);
        const unlocked=isUnlocked(cc,cr);
        const placed=unlocked&&placements.find(p=>p.c===c&&p.r===r);
        const def=placed&&CREATURE_MAP[placed.creature.id];
        return React.createElement("div",{
          key:r+","+c,
          style:{
            width:ISLAND_TILE,height:ISLAND_TILE,
            background:unlocked?TILE_COLORS[cell]:cell==="W"?TILE_COLORS.W:"#2a7a2a",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:cell==="G"?26:20,
            boxSizing:"border-box",
            borderRight:cell==="G"?"1px solid rgba(0,0,0,0.05)":"none",
            borderBottom:cell==="G"?"1px solid rgba(0,0,0,0.05)":"none",
          }
        },
          unlocked&&cell==="W"&&React.createElement("span",{style:{opacity:0.2,fontSize:16}},"🌊"),
          def&&React.createElement("span",{style:{filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.3))"}},
            getDisplayEmoji(def,placed.creature,unlockedSkins||[]))
        );
      }))
    ),
    // Chunk lock overlays
    React.createElement("div",{style:{position:"absolute",top:0,left:0,transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`,pointerEvents:"none",width:ISLAND_COLS*ISLAND_TILE,height:ISLAND_ROWS*ISLAND_TILE}},
      Array.from({length:CHUNK_ROWS_COUNT},(_,cr)=>Array.from({length:CHUNK_COLS},(_,cc)=>{
        if(isUnlocked(cc,cr)||!chunkHasLand(cc,cr))return null;
        const adj=isAdjacent(cc,cr);
        const sel=selectedChunk&&selectedChunk.cc===cc&&selectedChunk.cr===cr;
        return React.createElement("div",{
          key:`ov_${cc}_${cr}`,
          style:{
            position:"absolute",
            left:cc*CHUNK_SIZE*ISLAND_TILE,top:cr*CHUNK_SIZE*ISLAND_TILE,
            width:CHUNK_SIZE*ISLAND_TILE,height:CHUNK_SIZE*ISLAND_TILE,
            background:sel?"rgba(255,200,0,0.25)":adj?"rgba(0,0,0,0.42)":"rgba(0,0,0,0.68)",
            border:sel?"2px solid rgba(255,200,0,0.8)":adj?"2px solid rgba(255,255,255,0.15)":"none",
            boxSizing:"border-box",
            display:"flex",alignItems:"center",justifyContent:"center",
            pointerEvents:"auto",cursor:adj?"pointer":"default",
            fontSize:ISLAND_TILE*0.7,
          },
          onClick:adj?()=>setSelectedChunk(sel?null:{cc,cr}):undefined,
        },
          adj?React.createElement("span",null,"🔒"):null
        );
      }))
    ),
    // Unlock popup
    selectedChunk&&React.createElement("div",{
      style:{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",
        background:"#fff",borderRadius:14,padding:"14px 20px",boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
        textAlign:"center",minWidth:200,zIndex:10},
      onMouseDown:e=>e.stopPropagation(),
      onTouchStart:e=>e.stopPropagation(),
    },
      React.createElement("div",{style:{fontSize:13,fontWeight:600,marginBottom:6}},"Unlock this area?"),
      React.createElement("div",{style:{fontSize:12,color:"#888",marginBottom:12}},"Cost: "+CHUNK_COST+" 🔭 Binoculars"),
      React.createElement("div",{style:{fontSize:12,color:"#555",marginBottom:12}},"You have: "+(currencies.binoculars||0)+" 🔭"),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("button",{
          onClick:()=>unlockChunk(selectedChunk.cc,selectedChunk.cr),
          style:{flex:1,padding:"8px 0",background:"#4caf50",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13},
        },"Unlock"),
        React.createElement("button",{
          onClick:()=>setSelectedChunk(null),
          style:{flex:1,padding:"8px 0",background:"#eee",color:"#333",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13},
        },"Cancel")
      )
    ),
    notify&&React.createElement("div",{style:{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",
      background:"rgba(0,0,0,0.75)",color:"#fff",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,pointerEvents:"none"
    }},notify),
  );
}


export default IslandScreen;
