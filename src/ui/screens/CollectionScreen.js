// Grid of owned creatures with filters; opens detail or the dex.

import React, { useState, useMemo, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP, ALL_TYPES } from "../../data/creatures.js";
import { RARITY_CONFIG, CORE_STAT_CYCLE, STAT_LABELS, STAT_COLORS } from "../../data/rarity.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getDisplayEmoji } from "../../core/creatures.js";
import AscStars from "../../ui/components/AscStars.js";
import CreatureDetail from "../../ui/screens/CreatureDetail/index.js";
import DexScreen from "../../ui/screens/DexScreen.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";
import NavBar from "../../ui/components/NavBar.js";

function CollectionScreen({onBananaUsed,onCandyUsed,deepLinkId,onDeepLinkConsumed}){
  const { owned, currencies, setCurrencies, setOwned, unlockedSkins, setUnlockedSkins, skinShards, setSkinShards, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, equipmentCopies, setEquipmentCopies, equipFavorites, setEquipFavorites, tutorialStep, setTutorialStep, tutorialRestricted, tab, setTab, flairGuideStep, setFlairGuideStep, candyGuideStep, setCandyGuideStep } = useGame();
  const [selected,setSelected]=useState(null);
  useEffect(()=>{if(deepLinkId){setSelected(deepLinkId);onDeepLinkConsumed&&onDeepLinkConsumed();}},[deepLinkId]);
  // Resuming mid-tutorial after a reload: these steps expect a creature's
  // detail page already open, but `selected` is local state that doesn't
  // survive a reload. There's only ever the one starter creature owned at
  // this point in the tutorial, so it's safe to just re-open it.
  useEffect(()=>{
    if(selected||!tutorialRestricted)return;
    if(tutorialStep==="slot"||tutorialStep==="item"||tutorialStep==="levelupCreature"){
      const ids=Object.keys(owned);
      if(ids.length)setSelected(ids[0]);
    }
  },[]);
  const [showDex,setShowDex]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [pendingEvo,setPendingEvo]=useState(null);
  const [search,setSearch]=useState("");
  const [activeRarities,setActiveRarities]=useState(new Set());
  const [activeTypes,setActiveTypes]=useState(new Set());
  const [activeRoles,setActiveRoles]=useState(new Set());
  const [activeAttackTypes,setActiveAttackTypes]=useState(new Set());

  function toggleRarity(r){setActiveRarities(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleType(t){setActiveTypes(prev=>{const n=new Set(prev);n.has(t)?n.delete(t):n.add(t);return n;});}
  function toggleRole(r){setActiveRoles(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleAttackType(a){setActiveAttackTypes(prev=>{const n=new Set(prev);n.has(a)?n.delete(a):n.add(a);return n;});}

  const ownedDefs=useMemo(()=>Object.values(owned).map(o=>({owned:o,def:CREATURE_MAP[o.id]})),[owned]);

  const filtered=useMemo(()=>{
    let list=[...ownedDefs];
    if(activeRarities.size>0)list=list.filter(({def})=>activeRarities.has(def.rarity));
    if(activeTypes.size>0)list=list.filter(({def})=>activeTypes.has(def.type));
    if(activeRoles.size>0)list=list.filter(({def})=>activeRoles.has(def.role));
    if(activeAttackTypes.size>0)list=list.filter(({def})=>activeAttackTypes.has(def.attackType));
    if(search.trim()){const q=search.trim().toLowerCase();list=list.filter(({def})=>def.name.toLowerCase().includes(q));}
    list.sort((a,b)=>{
      if(b.owned.level!==a.owned.level)return b.owned.level-a.owned.level;
      if(b.owned.ascensions!==a.owned.ascensions)return b.owned.ascensions-a.owned.ascensions;
      return a.def.name.localeCompare(b.def.name);
    });
    return list;
  },[ownedDefs,activeRarities,activeTypes,activeRoles,search]);

  // Swipe-nav order, frozen for as long as a detail view stays open. The
  // grid's live sort is level-first, so levelling a creature inside the
  // detail view used to reshuffle `filtered` mid-browse and swipes would
  // jump around the reordered list. The snapshot is taken when the detail
  // opens and cleared when it closes -- the grid itself re-sorts as normal
  // once the player exits back out to it.
  const [frozenNavIds,setFrozenNavIds]=useState(null);
  useEffect(()=>{
    if(selected==null){setFrozenNavIds(null);return;}
    setFrozenNavIds(prev=>prev??filtered.map(f=>f.owned.id));
  },[selected]);

  if(showDex)return React.createElement(DexScreen,{onBack:()=>setShowDex(false),unlockedSkins,owned});

  if(selected&&owned[selected])return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",overflowY:"auto",overflowX:"hidden",overscrollBehavior:"none",zIndex:50,padding:"0 16px 80px"}},
    pendingEvo&&React.createElement("div",{className:"modal-overlay"},
      React.createElement("div",{className:"modal-box"},
        React.createElement("span",{className:"modal-emoji"},pendingEvo.toEmoji),
        React.createElement("div",{style:{fontSize:20,fontWeight:600,color:"#000",marginBottom:4}},pendingEvo.toName),
        React.createElement("p",{style:{fontSize:14,color:"#444",marginBottom:12,lineHeight:1.6}},
          pendingEvo.fromName+" has evolved into "+pendingEvo.toName+"!"
        ),
        pendingEvo.statsBefore&&pendingEvo.statsAfter&&React.createElement("div",{style:{textAlign:"left",marginBottom:16}},
          CORE_STAT_CYCLE.map(s=>React.createElement("div",{key:s,className:"stat-row"},
            React.createElement("span",{className:"stat-label"},STAT_LABELS[s]),
            React.createElement("div",{className:"stat-bar-bg"},
              React.createElement("div",{className:"stat-bar-fill",style:{width:Math.min(100,Math.round((pendingEvo.statsAfter[s]/150)*100))+"%",background:STAT_COLORS[s]}})
            ),
            React.createElement("span",{className:"stat-val"},
              React.createElement("span",{style:{color:"#666"}},pendingEvo.statsBefore[s]),
              React.createElement("span",{style:{color:"#aaa",margin:"0 3px"}},"→"),
              React.createElement("span",{style:{color:"#2e7d32",fontWeight:700}},pendingEvo.statsAfter[s])
            )
          ))
        ),
        React.createElement("button",{className:"hatch-close",onClick:()=>setPendingEvo(null)},"Continue")
      )
    ),
    React.createElement(CreatureDetail,{
      ownedData:owned[selected],owned,onBack:()=>setSelected(null),
      onEvolve:(newId,fromName,toName,toEmoji,statsBefore,statsAfter)=>{
        // Evolution replaces the owned id, so patch it in place in the frozen
        // swipe order too or the evolved creature would fall out of the list
        // (indexOf -1) and swiping would dead-end until the detail is closed.
        setFrozenNavIds(prev=>prev?prev.map(id=>id===selected?newId:id):prev);
        setSelected(newId);setPendingEvo({fromName,toName,toEmoji,statsBefore,statsAfter});
      },
      onBananaUsed,
      onCandyUsed,
      currencies,setCurrencies,setOwned,
      unlockedSkins,setUnlockedSkins,skinShards,setSkinShards,
      equipmentLevels,setEquipmentLevels,
      equipmentAscensions,setEquipmentAscensions,equipmentCopies,setEquipmentCopies,
      equipFavorites,setEquipFavorites,
      // Swipe left/right pages through the same filtered/sorted list shown
      // in the grid behind this detail view -- "if able" means it's simply
      // a no-op at either end of the list.
      onSwipeNav:(dir)=>{
        // Swipes walk the order frozen when the detail view opened (see
        // frozenNavIds above), not the live level-sorted list.
        const order=frozenNavIds||filtered.map(f=>f.owned.id);
        const idx=order.indexOf(selected);
        if(idx<0)return;
        const nextIdx=dir==="next"?idx+1:idx-1;
        if(nextIdx<0||nextIdx>=order.length)return;
        if(!owned[order[nextIdx]])return;
        setSelected(order[nextIdx]);
      }
    }),
    React.createElement(NavBar,{tab,setTab,style:{position:"fixed",bottom:0,left:0,right:0,background:"rgba(245,245,245,0.95)",backdropFilter:"blur(8px)"}})
  );

  return React.createElement("div",null,
    React.createElement(ScreenHeader,{title:"Collection",right:
      // Locked for the whole tutorial regardless of step -- the Dex isn't
      // part of any guided flow, so there's no step where tapping into it
      // would be safe.
      React.createElement("button",{className:"btn btn-primary btn-sm",onClick:()=>{if(tutorialRestricted)return;setShowDex(true);},disabled:tutorialRestricted,style:{marginBottom:0,padding:"4px 12px",border:"none",lineHeight:1.2,opacity:tutorialRestricted?0.5:1,cursor:tutorialRestricted?"not-allowed":"pointer"}},"Dex")
    }),
    // Hidden for the whole tutorial -- there's nothing to search yet, and it
    // would otherwise sit right above the card the tutorial points the
    // player at.
    !tutorialRestricted&&React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:6}},
      React.createElement("button",{onClick:()=>setFiltersOpen(p=>!p),style:{fontSize:11,color:"#534AB7",fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}},filtersOpen?"Hide Filters ▲":"Filter ▼")
    ),
    !tutorialRestricted&&filtersOpen&&React.createElement("div",{style:{marginBottom:10}},
      React.createElement("div",{style:{position:"relative",marginBottom:8}},
        React.createElement("i",{className:"ti ti-search",style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#aaa",fontSize:15,pointerEvents:"none"}}),
        React.createElement("input",{
          type:"text",value:search,onChange:e=>setSearch(e.target.value),
          placeholder:"Search creatures...",
          style:{width:"100%",padding:"8px 10px 8px 32px",border:"0.5px solid rgba(0,0,0,0.15)",borderRadius:8,fontSize:13,outline:"none",background:"#fff"}
        })
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Rarity"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          Object.entries(RARITY_CONFIG).map(([r,cfg])=>
            React.createElement("button",{key:r,className:"filter-chip"+(activeRarities.has(r)?" active":""),onClick:()=>toggleRarity(r)},cfg.label)
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Type"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          ALL_TYPES.map(t=>
            React.createElement("button",{key:t,className:"filter-chip"+(activeTypes.has(t)?" active":""),onClick:()=>toggleType(t)},t)
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Role"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          Object.keys(ROLE_CONFIG).map(r=>
            React.createElement("button",{key:r,className:"filter-chip"+(activeRoles.has(r)?" active":""),onClick:()=>toggleRole(r)},ROLE_CONFIG[r].emoji+" "+r)
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Range"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          Object.keys(ATTACK_TYPE_CONFIG).map(a=>
            React.createElement("button",{key:a,className:"filter-chip"+(activeAttackTypes.has(a)?" active":""),onClick:()=>toggleAttackType(a)},ATTACK_TYPE_CONFIG[a].emoji+" "+a)
          )
        )
      )
    ),
    filtered.length===0
      ?React.createElement("div",{style:{textAlign:"center",padding:"40px 20px",color:"#666"}},
          React.createElement("i",{className:"ti ti-egg",style:{fontSize:40,display:"block",marginBottom:8,opacity:.3}}),
          React.createElement("p",{style:{fontSize:13}},(activeRarities.size===0&&activeTypes.size===0&&!search.trim())?"No creatures yet — hatch some eggs!":"No creatures match your filters")
        )
      :React.createElement("div",{className:"creature-grid",style:(tutorialStep==="collection"||tutorialStep==="levelupPick"||flairGuideStep==="collection"||candyGuideStep==="candyCollection")?{marginTop:34}:undefined},
          filtered.map(({owned:o,def:d},idx)=>{
            const displayEmoji=getDisplayEmoji(d,o,unlockedSkins);
            const showPointer=(tutorialStep==="collection"||tutorialStep==="levelupPick"||flairGuideStep==="collection"||candyGuideStep==="candyCollection")&&idx===0;
            return React.createElement("div",{key:o.id,className:"creature-card","data-guide-target":(flairGuideStep==="collection"&&idx===0)?"collection":(candyGuideStep==="candyCollection"&&idx===0)?"candyCollection":undefined,onClick:()=>{setSelected(o.id);window.scrollTo(0,0);if(tutorialStep==="collection")setTutorialStep("slot");if(tutorialStep==="levelupPick")setTutorialStep("levelupCreature");if(flairGuideStep==="collection"&&idx===0)setFlairGuideStep("flair");if(candyGuideStep==="candyCollection"&&idx===0)setCandyGuideStep("candySkins");},style:{position:"relative",paddingTop:30}},
              showPointer&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-38,transform:"translate(-50%,0)",fontSize:28,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
              React.createElement("span",{style:{position:"absolute",top:5,left:5,fontSize:14,lineHeight:1}},(TYPE_EMOJI[d.type]||d.type)),
              d.attackType&&React.createElement("span",{style:{position:"absolute",top:5,right:5,fontSize:13,lineHeight:1}},ATTACK_TYPE_CONFIG[d.attackType].emoji),
              d.role&&React.createElement("span",{style:{position:"absolute",top:20,right:5,fontSize:13,lineHeight:1}},ROLE_CONFIG[d.role].emoji),
              o.ascensions>0&&React.createElement("div",{style:{position:"absolute",top:5,left:0,right:0,textAlign:"center",lineHeight:1}},React.createElement(AscStars,{n:o.ascensions})),
              d.image
                ?React.createElement("div",{style:{position:"relative",height:72,borderRadius:8,overflow:"hidden"}},
                    React.createElement("img",{src:d.image,style:{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 75%",display:"block"}}),
                    React.createElement("div",{style:{position:"absolute",left:0,right:0,bottom:0,padding:"10px 4px 4px",background:"linear-gradient(to top,rgba(255,255,255,0.92),rgba(255,255,255,0))"}},
                      React.createElement("div",{className:"creature-name",style:{marginBottom:2}},d.name),
                      React.createElement("div",{style:{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",alignItems:"center"}},
                        React.createElement("span",{className:"lv-badge"},"Lv "+o.level)
                      )
                    )
                  )
                :[
                    React.createElement("div",{key:"e",className:"creature-emoji"},displayEmoji),
                    React.createElement("div",{key:"n",className:"creature-name"},d.name),
                    React.createElement("div",{key:"l",style:{display:"flex",gap:4,justifyContent:"center",marginBottom:4,flexWrap:"wrap",alignItems:"center"}},
                      React.createElement("span",{className:"lv-badge"},"Lv "+o.level)
                    )
                  ]
            );
          })
        )
  );
}


export default CollectionScreen;
