// Searchable index of all discovered final forms.

import React, { useState, useMemo } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP, FINAL_FORMS, ALL_TYPES } from "../../data/creatures.js";
import { RARITY_CONFIG } from "../../data/rarity.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getChain } from "../../core/creatures.js";
import DexEntry from "../../ui/screens/DexEntry.js";

function DexScreen({onBack}){
  const { unlockedSkins, owned } = useGame();
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [activeRarities,setActiveRarities]=useState(new Set());
  const [activeTypes,setActiveTypes]=useState(new Set());
  const [activeRoles,setActiveRoles]=useState(new Set());
  const [activeAttackTypes,setActiveAttackTypes]=useState(new Set());
  const [missingOnly,setMissingOnly]=useState(false);

  const collectedCount=useMemo(()=>FINAL_FORMS.filter(def=>getChain(def.id).some(id=>owned[id])).length,[owned]);

  const visibleForms=useMemo(()=>{
    let list=FINAL_FORMS;
    if(missingOnly)list=list.filter(def=>!getChain(def.id).some(id=>owned[id]));
    if(activeRarities.size>0)list=list.filter(def=>activeRarities.has(def.rarity));
    if(activeTypes.size>0)list=list.filter(def=>activeTypes.has(def.type));
    if(activeRoles.size>0)list=list.filter(def=>activeRoles.has(def.role));
    if(activeAttackTypes.size>0)list=list.filter(def=>activeAttackTypes.has(def.attackType));
    if(search.trim()){const q=search.trim().toLowerCase();list=list.filter(def=>getChain(def.id).some(id=>CREATURE_MAP[id].name.toLowerCase().includes(q)));}
    return list;
  },[activeRarities,activeTypes,activeRoles,activeAttackTypes,missingOnly,search,owned]);

  function toggleRarity(r){setActiveRarities(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleType(t){setActiveTypes(prev=>{const n=new Set(prev);n.has(t)?n.delete(t):n.add(t);return n;});}
  function toggleRole(r){setActiveRoles(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleAttackType(a){setActiveAttackTypes(prev=>{const n=new Set(prev);n.has(a)?n.delete(a):n.add(a);return n;});}

  if(selected)return React.createElement(DexEntry,{def:selected,onBack:()=>setSelected(null),onNavigate:(d)=>setSelected(d),unlockedSkins});

  return React.createElement("div",null,
    React.createElement("button",{className:"back-btn",onClick:onBack},
      React.createElement("i",{className:"ti ti-arrow-left"}),"Collection"
    ),
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
      React.createElement("span",{style:{fontSize:16,fontWeight:500,color:"#000"}},"Pokédex"),
      React.createElement("span",{style:{fontSize:12,color:"#666"}},collectedCount+"/"+FINAL_FORMS.length+" collected")
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
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Show"),
        React.createElement("button",{
          className:"filter-chip"+(missingOnly?" active":""),
          onClick:()=>setMissingOnly(p=>!p)
        },"Missing only")
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
    visibleForms.length===0
      ?React.createElement("div",{style:{textAlign:"center",padding:"40px 20px",color:"#666"}},
          React.createElement("p",{style:{fontSize:13}},"No creatures match your filters")
        )
      :React.createElement("div",{className:"creature-grid"},
          visibleForms.map(def=>{
            const chain=getChain(def.id);
            const isCollected=!!owned[def.id];
            const inProgress=!isCollected&&chain.some(id=>owned[id]);
            return React.createElement("div",{key:def.id,className:"creature-card",onClick:()=>{setSelected(def);const c=document.querySelector('.app-content');if(c)c.scrollTop=0;},style:{position:"relative",paddingBottom:30}},
              React.createElement("span",{style:{position:"absolute",top:7,left:8,fontSize:16,lineHeight:1}},(TYPE_EMOJI[def.type]||def.type)),
              def.attackType&&React.createElement("span",{style:{position:"absolute",top:7,right:6,fontSize:10,fontWeight:600,color:ATTACK_TYPE_CONFIG[def.attackType].color,background:ATTACK_TYPE_CONFIG[def.attackType].bg,borderRadius:8,padding:"1px 5px",lineHeight:1.4}},ATTACK_TYPE_CONFIG[def.attackType].emoji+" "+def.attackType),
              isCollected&&React.createElement("span",{style:{position:"absolute",top:24,right:8,fontSize:11,background:"#EAF3DE",color:"#173404",borderRadius:10,padding:"1px 6px",fontWeight:600}},"✓"),
              React.createElement("div",{className:"creature-emoji"},def.emoji),
              React.createElement("div",{className:"creature-name"},def.name),
              React.createElement("div",{style:{display:"flex",gap:4,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginBottom:2}},
                def.role&&React.createElement("span",{style:{fontSize:10,fontWeight:600,color:ROLE_CONFIG[def.role].color,background:ROLE_CONFIG[def.role].bg,borderRadius:8,padding:"1px 5px"}},ROLE_CONFIG[def.role].emoji+" "+def.role)
              ),
              React.createElement("span",{style:{position:"absolute",bottom:7,left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap"},className:"badge "+RARITY_CONFIG[def.rarity].color},RARITY_CONFIG[def.rarity].label)
            );
          })
        )
  );
}


export default DexScreen;
