// Grid of owned creatures with filters; opens detail or the dex.

import React, { useState, useMemo, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP, ALL_TYPES } from "../../data/creatures.js";
import { RARITY_CONFIG, STAT_CYCLE, STAT_LABELS, STAT_COLORS } from "../../data/rarity.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getDisplayEmoji } from "../../core/creatures.js";
import AscStars from "../../ui/components/AscStars.js";
import CreatureDetail from "../../ui/screens/CreatureDetail/index.js";
import DexScreen from "../../ui/screens/DexScreen.js";

function CollectionScreen({onBananaUsed,deepLinkId,onDeepLinkConsumed}){
  const { owned, currencies, setCurrencies, setOwned, unlockedSkins, setUnlockedSkins, skinShards, setSkinShards, equipmentLevels, setEquipmentLevels, equipmentAscensions, setEquipmentAscensions, equipmentCopies, setEquipmentCopies, equipFavorites, setEquipFavorites } = useGame();
  const [selected,setSelected]=useState(null);
  useEffect(()=>{if(deepLinkId){setSelected(deepLinkId);onDeepLinkConsumed&&onDeepLinkConsumed();}},[deepLinkId]);
  const [showDex,setShowDex]=useState(false);
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

  if(showDex)return React.createElement(DexScreen,{onBack:()=>setShowDex(false),unlockedSkins,owned});

  if(selected&&owned[selected])return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",overflowY:"auto",zIndex:50,padding:"0 0 80px"}},
    pendingEvo&&React.createElement("div",{className:"modal-overlay"},
      React.createElement("div",{className:"modal-box"},
        React.createElement("span",{className:"modal-emoji"},pendingEvo.toEmoji),
        React.createElement("div",{style:{fontSize:20,fontWeight:600,color:"#000",marginBottom:4}},pendingEvo.toName),
        React.createElement("p",{style:{fontSize:14,color:"#444",marginBottom:12,lineHeight:1.6}},
          pendingEvo.fromName+" has evolved into "+pendingEvo.toName+"!"
        ),
        pendingEvo.statsBefore&&pendingEvo.statsAfter&&React.createElement("div",{style:{textAlign:"left",marginBottom:16}},
          STAT_CYCLE.map(s=>React.createElement("div",{key:s,className:"stat-row"},
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
      onEvolve:(newId,fromName,toName,toEmoji,statsBefore,statsAfter)=>{setSelected(newId);setPendingEvo({fromName,toName,toEmoji,statsBefore,statsAfter});},
      onBananaUsed,
      currencies,setCurrencies,setOwned,
      unlockedSkins,setUnlockedSkins,skinShards,setSkinShards,
      equipmentLevels,setEquipmentLevels,
      equipmentAscensions,setEquipmentAscensions,equipmentCopies,setEquipmentCopies,
      equipFavorites,setEquipFavorites
    })
  );

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
      React.createElement("span",{style:{fontSize:16,fontWeight:500,color:"#000"}},"Collection"),
      React.createElement("button",{className:"btn btn-primary btn-sm",onClick:()=>setShowDex(true),style:{marginBottom:0}},"Dex")
    ),
    React.createElement("div",{style:{position:"relative",marginBottom:8}},
      React.createElement("i",{className:"ti ti-search",style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#aaa",fontSize:15,pointerEvents:"none"}}),
      React.createElement("input",{
        type:"text",value:search,onChange:e=>setSearch(e.target.value),
        placeholder:"Search creatures...",
        style:{width:"100%",padding:"8px 10px 8px 32px",border:"0.5px solid rgba(0,0,0,0.15)",borderRadius:8,fontSize:13,outline:"none",background:"#fff"}
      })
    ),
    React.createElement("div",{style:{marginBottom:10}},
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
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
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
      :React.createElement("div",{className:"creature-grid"},
          filtered.map(({owned:o,def:d})=>{
            const displayEmoji=getDisplayEmoji(d,o,unlockedSkins);
            return React.createElement("div",{key:o.id,className:"creature-card",onClick:()=>{setSelected(o.id);window.scrollTo(0,0);},style:{position:"relative",paddingTop:22}},
              React.createElement("span",{style:{position:"absolute",top:5,left:5,fontSize:12,lineHeight:1}},(TYPE_EMOJI[d.type]||d.type)),
              d.attackType&&React.createElement("span",{style:{position:"absolute",top:5,right:5,fontSize:11,lineHeight:1}},ATTACK_TYPE_CONFIG[d.attackType].emoji),
              React.createElement("div",{style:{textAlign:"center",marginBottom:2,height:16,lineHeight:"16px"}},o.ascensions>0&&React.createElement(AscStars,{n:o.ascensions})),
              React.createElement("div",{className:"creature-emoji"},displayEmoji),
              React.createElement("div",{className:"creature-name"},d.name),
              React.createElement("div",{style:{display:"flex",gap:3,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginBottom:2}},
                d.role&&React.createElement("span",{style:{fontSize:11,lineHeight:1}},ROLE_CONFIG[d.role].emoji)
              ),
              React.createElement("div",{style:{display:"flex",gap:4,justifyContent:"center",marginBottom:4,flexWrap:"wrap",alignItems:"center"}},
                React.createElement("span",{className:"lv-badge"},"Lv "+o.level)
              )
            );
          })
        )
  );
}


export default CollectionScreen;
