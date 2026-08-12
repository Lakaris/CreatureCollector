// Searchable index of every creature form, including pre-evolutions -- each
// evolution stage is its own entry, grouped by family (see ALL_DEX_FORMS).

import React, { useState, useMemo } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { ALL_DEX_FORMS, ALL_TYPES } from "../../data/creatures.js";
import { RARITY_CONFIG } from "../../data/rarity.js";
import { EQUIP_RARITY_CONFIG } from "../../data/equipment.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getEvolutionStage } from "../../core/creatures.js";
import DexEntry from "../../ui/screens/DexEntry.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";

const STAGE_LABELS={1:"1st",2:"2nd",3:"3rd",4:"4th"};

function DexScreen({onBack}){
  const { unlockedSkins, owned } = useGame();
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [activeRarities,setActiveRarities]=useState(new Set());
  const [activeTypes,setActiveTypes]=useState(new Set());
  const [activeRoles,setActiveRoles]=useState(new Set());
  const [activeAttackTypes,setActiveAttackTypes]=useState(new Set());
  const [activeStages,setActiveStages]=useState(new Set());
  const [missingOnly,setMissingOnly]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(false);

  // Every stage is its own dex entry now (pre-evolutions included), so
  // "collected" is per-form -- own that exact stage, not just any stage in
  // its family.
  const collectedCount=useMemo(()=>ALL_DEX_FORMS.filter(def=>owned[def.id]).length,[owned]);

  const visibleForms=useMemo(()=>{
    let list=ALL_DEX_FORMS;
    if(missingOnly)list=list.filter(def=>!owned[def.id]);
    if(activeRarities.size>0)list=list.filter(def=>activeRarities.has(def.rarity));
    if(activeTypes.size>0)list=list.filter(def=>activeTypes.has(def.type));
    if(activeRoles.size>0)list=list.filter(def=>activeRoles.has(def.role));
    if(activeAttackTypes.size>0)list=list.filter(def=>activeAttackTypes.has(def.attackType));
    if(activeStages.size>0)list=list.filter(def=>activeStages.has(getEvolutionStage(def.id)));
    if(search.trim()){const q=search.trim().toLowerCase();list=list.filter(def=>def.name.toLowerCase().includes(q));}
    return list;
  },[activeRarities,activeTypes,activeRoles,activeAttackTypes,activeStages,missingOnly,search,owned]);

  function toggleRarity(r){setActiveRarities(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleType(t){setActiveTypes(prev=>{const n=new Set(prev);n.has(t)?n.delete(t):n.add(t);return n;});}
  function toggleRole(r){setActiveRoles(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});}
  function toggleAttackType(a){setActiveAttackTypes(prev=>{const n=new Set(prev);n.has(a)?n.delete(a):n.add(a);return n;});}
  function toggleStage(s){setActiveStages(prev=>{const n=new Set(prev);n.has(s)?n.delete(s):n.add(s);return n;});}

  if(selected)return React.createElement(DexEntry,{def:selected,onBack:()=>setSelected(null),onNavigate:(d)=>setSelected(d),unlockedSkins,navList:visibleForms});

  return React.createElement("div",null,
    React.createElement(ScreenHeader,{title:"Creature Dex",onBack,right:
      React.createElement("span",{style:{fontSize:12,color:"#666"}},collectedCount+" / "+ALL_DEX_FORMS.length+" collected")
    }),
    React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:6}},
      React.createElement("button",{onClick:()=>setFiltersOpen(p=>!p),style:{fontSize:11,color:"#534AB7",fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}},filtersOpen?"Hide Filters ▲":"Filter ▼")
    ),
    filtersOpen&&React.createElement("div",{style:{marginBottom:10}},
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
          ),
          React.createElement("button",{
            className:"filter-chip"+(missingOnly?" active":""),
            onClick:()=>setMissingOnly(p=>!p)
          },"Missing only")
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
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Range"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          Object.keys(ATTACK_TYPE_CONFIG).map(a=>
            React.createElement("button",{key:a,className:"filter-chip"+(activeAttackTypes.has(a)?" active":""),onClick:()=>toggleAttackType(a)},ATTACK_TYPE_CONFIG[a].emoji+" "+a)
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
        React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}},"Evolution"),
        React.createElement("div",{className:"filter-row",style:{margin:0,padding:0,flex:1}},
          [1,2,3,4].map(s=>
            React.createElement("button",{key:s,className:"filter-chip"+(activeStages.has(s)?" active":""),onClick:()=>toggleStage(s)},STAGE_LABELS[s])
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
            const isCollected=!!owned[def.id];
            const rarCfg=EQUIP_RARITY_CONFIG[def.rarity];
            return React.createElement("div",{key:def.id,className:"creature-card",onClick:()=>{setSelected(def);const c=document.querySelector('.app-content');if(c)c.scrollTop=0;},style:{position:"relative",paddingTop:30,background:rarCfg.bg,border:"1px solid "+rarCfg.color+"44"}},
              React.createElement("span",{style:{position:"absolute",top:5,left:5,fontSize:14,lineHeight:1}},(TYPE_EMOJI[def.type]||def.type)),
              def.attackType&&React.createElement("span",{style:{position:"absolute",top:5,right:5,fontSize:13,lineHeight:1}},ATTACK_TYPE_CONFIG[def.attackType].emoji),
              def.role&&React.createElement("span",{style:{position:"absolute",top:20,right:5,fontSize:13,lineHeight:1}},ROLE_CONFIG[def.role].emoji),
              React.createElement("div",{className:"creature-emoji"},def.emoji),
              React.createElement("div",{className:"creature-name"},def.name),
              // Fills the same slot Collection's Lv badge occupies -- a green
              // checkmark if collected, otherwise the badge stays invisible
              // (not unrendered) so every dex card keeps the exact same
              // height as a collection card, collected or not.
              React.createElement("div",{style:{display:"flex",gap:4,justifyContent:"center",marginBottom:4,flexWrap:"wrap",alignItems:"center"}},
                React.createElement("span",{className:"lv-badge",style:{visibility:isCollected?"visible":"hidden"}},"✓")
              )
            );
          })
        )
  );
}


export default DexScreen;
