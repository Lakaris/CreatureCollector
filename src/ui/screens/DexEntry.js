// Read-only dex page for one evolution chain.

import React, { useState } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { RARITY_CONFIG, SKIN_TIER_CONFIG } from "../../data/rarity.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../../data/types.js";
import { getChain, getSkinsForCreature, getSpecialCharge, getSpecialChargeAt } from "../../core/creatures.js";
import { formatAbilityDisplay, formatUpgradeStep, ABILITY_TAG_DEFS, getAbilityTags, formatStarlitAbilityLevel, formatPlainAbilityLevel } from "../../core/abilityText.js";
import ScreenHeader from "../../ui/components/ScreenHeader.js";
import useSwipeNav from "../../ui/hooks/useSwipeNav.js";

function DexEntry({def,onBack,onNavigate,navList}){
  const { unlockedSkins } = useGame();
  const [skinPreview,setSkinPreview]=useState(null);
  const [abilityTagPopup,setAbilityTagPopup]=useState(null);
  const [tab,setTab]=useState("abilities");
  const chain=getChain(def.id);
  const chainDefs=chain.map(id=>CREATURE_MAP[id]);
  const abilityKeys=["basic","special","unique"];
  const chainSkins=getSkinsForCreature(def.id);

  // Swipe left/right pages through navList (whatever ordered set of final
  // forms the caller is browsing -- DexScreen's filtered grid, or the full
  // dex when opened out-of-context via CreatureOverlayHost's Evolutions
  // button). "if able" means it's simply a no-op at either end of the list.
  const swipeBlocked=!!(abilityTagPopup||skinPreview);
  const navIdx=navList?navList.findIndex(d=>d.id===def.id):-1;
  const swipeHandlers=useSwipeNav({
    onSwipeLeft:()=>{
      if(swipeBlocked||navIdx<0)return;
      const next=navList[navIdx+1];
      if(next)onNavigate(next);
    },
    onSwipeRight:()=>{
      if(swipeBlocked||navIdx<0)return;
      const prev=navList[navIdx-1];
      if(prev)onNavigate(prev);
    },
  });

  return React.createElement("div",swipeHandlers,
    abilityTagPopup&&React.createElement("div",{onClick:()=>setAbilityTagPopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"20px 18px",width:260,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#111",marginBottom:8}},ABILITY_TAG_DEFS[abilityTagPopup].label),
        React.createElement("div",{style:{fontSize:13,color:"#555",lineHeight:1.4,marginBottom:16}},ABILITY_TAG_DEFS[abilityTagPopup].description),
        React.createElement("button",{onClick:()=>setAbilityTagPopup(null),style:{width:"100%",padding:"9px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
      )
    ),
    skinPreview&&React.createElement("div",{className:"modal-overlay",onClick:()=>setSkinPreview(null)},
      React.createElement("div",{className:"modal-box",onClick:e=>e.stopPropagation()},
        React.createElement("div",{style:{fontSize:16,fontWeight:600,color:"#000",marginBottom:4}},skinPreview.name),
        React.createElement("span",{className:"badge "+SKIN_TIER_CONFIG[skinPreview.tier].color,style:{display:"inline-block",marginBottom:14}},SKIN_TIER_CONFIG[skinPreview.tier].label),
        React.createElement("div",{style:{display:"flex",justifyContent:"center",gap:20,marginBottom:16,flexWrap:"wrap"}},
          chain.filter(cid=>skinPreview.appearances[cid]).map(cid=>
            React.createElement("div",{key:cid,style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4}},
              React.createElement("span",{style:{fontSize:52,lineHeight:1}},skinPreview.appearances[cid].emoji),
              React.createElement("span",{style:{fontSize:11,color:"#666"}},CREATURE_MAP[cid].name)
            )
          )
        ),
        !unlockedSkins.includes(skinPreview.id)&&React.createElement("p",{style:{fontSize:12,color:"#aaa",marginBottom:12}},"Unlock this skin to use it in-game"),
        React.createElement("button",{className:"hatch-close",onClick:()=>setSkinPreview(null)},"Close")
      )
    ),

    React.createElement(ScreenHeader,{title:def.name,onBack}),
    React.createElement("div",{className:"card",style:{marginBottom:12}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:12}},
        React.createElement("span",{style:{fontSize:100,lineHeight:1,display:"block",marginBottom:10}},def.emoji),
        React.createElement("div",{style:{fontSize:20,fontWeight:600,color:"#000",marginBottom:3}},def.name),
        React.createElement("div",{style:{fontSize:13,color:"#666",marginBottom:8}},TYPE_EMOJI[def.type]||def.type," ",def.type),
        React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}},
          React.createElement("span",{className:"badge "+RARITY_CONFIG[def.rarity].color},RARITY_CONFIG[def.rarity].label),
          def.role&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ROLE_CONFIG[def.role].color,background:ROLE_CONFIG[def.role].bg,borderRadius:8,padding:"2px 7px"}},ROLE_CONFIG[def.role].emoji+" "+def.role),
          def.attackType&&React.createElement("span",{style:{fontSize:11,fontWeight:600,color:ATTACK_TYPE_CONFIG[def.attackType].color,background:ATTACK_TYPE_CONFIG[def.attackType].bg,borderRadius:8,padding:"2px 7px"}},ATTACK_TYPE_CONFIG[def.attackType].emoji+" "+def.attackType)
        )
      ),
      // minHeight reserves room for the longest description in the roster
      // (3 lines at this font/width, e.g. Skyeel's) so the card is sized for
      // the worst case up front instead of growing when a longer one loads --
      // most descriptions are 2 lines and just leave a little breathing room.
      React.createElement("p",{style:{fontSize:12,color:"#666",lineHeight:1.6,textAlign:"center",minHeight:"57.6px"}},def.description)
    ),

    chainDefs.length>1&&React.createElement("div",{className:"card",style:{marginBottom:12}},
      React.createElement("div",{className:"section-label"},"Evolution Line"),
      React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:4,flexWrap:"wrap"}},
        chainDefs.map((d,i)=>React.createElement(React.Fragment,{key:d.id},
          i>0&&React.createElement("span",{style:{color:"#aaa",fontSize:16,margin:"0 2px",lineHeight:"30px"}},"→"),
          React.createElement("div",{
            style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",borderRadius:8,
              background:d.id===def.id?"#EEEDFE":"transparent",
              cursor:d.id!==def.id?"pointer":"default",
              border:d.id===def.id?"1px solid #CECBF6":"1px solid transparent"},
            onClick:d.id!==def.id?()=>onNavigate(d):undefined
          },
            React.createElement("span",{style:{fontSize:30,lineHeight:1}},d.emoji),
            React.createElement("span",{style:{fontSize:10,color:d.id===def.id?"#534AB7":"#666",fontWeight:500}},d.name),
            d.ascensionsToEvolve&&React.createElement("span",{style:{fontSize:10,color:"#aaa"}},"×"+d.ascensionsToEvolve+" asc.")
          )
        ))
      )
    ),

    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:12,background:"#ebebeb",borderRadius:10,padding:4}},
      [{id:"abilities",label:"Abilities"},{id:"skins",label:"Skins"}].map(t=>React.createElement("button",{
        key:t.id,
        onClick:()=>setTab(t.id),
        style:{flex:1,padding:"7px 0",fontSize:13,fontWeight:600,border:"none",borderRadius:7,cursor:"pointer",
          background:tab===t.id?"#fff":"transparent",
          color:tab===t.id?"#534AB7":"#666",
          boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,.12)":"none",
          transition:"all .15s"}
      },t.label))
    ),

    tab==="abilities"&&React.createElement(React.Fragment,null,
      ...abilityKeys.map(k=>{
        const abl=def.abilities[k];
        const abilityColors={basic:{bg:"#EAF3DE",color:"#173404"},special:{bg:"#EEEDFE",color:"#26215C"},unique:{bg:"#FFF3CD",color:"#5A3E00"}};
        const ac=abilityColors[k];
        const abilityTags=getAbilityTags(def.id,k);
        return React.createElement("div",{key:k,className:"ability-card"},
          React.createElement("div",{className:"ability-header"},
            React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}},
              React.createElement("span",{style:{fontSize:8,fontWeight:800,color:"#555",background:"#e8e8e8",borderRadius:20,padding:"2px 7px",textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap"}},k),
              React.createElement("div",{style:{width:40,height:40,borderRadius:8,background:ac.bg,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}},
                abl.icon
                  ? React.createElement("img",{src:abl.icon,style:{width:"100%",height:"100%",objectFit:"cover"}})
                  : React.createElement("span",{style:{fontSize:9,fontWeight:700,color:ac.color,opacity:0.5,userSelect:"none"}},"No img")
              )
            ),
            React.createElement("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}},
              React.createElement("span",{className:"ability-name"},abl.name),
              React.createElement("div",{style:{display:"flex",flexDirection:"row-reverse",alignItems:"center",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}},
                k==="special"&&React.createElement("button",{
                  onClick:(e)=>{e.stopPropagation();setAbilityTagPopup("energy");},
                  style:{fontSize:9,fontWeight:800,color:"#2563eb",background:"#DBEAFE",border:"1px solid rgba(59,130,246,0.4)",borderRadius:10,padding:"1px 8px",cursor:"pointer",lineHeight:1.5,flexShrink:0,whiteSpace:"nowrap"}
                // The dex shows the whole kit, so a cost that drops at the
                // final upgrade reads as "10→9".
                },(()=>{const base=getSpecialCharge(def);const maxed=getSpecialChargeAt(def,4);return "⚡ "+(maxed===base?base:base+"→"+maxed);})()),
                ...abilityTags.map(tag=>React.createElement("button",{
                  key:tag,
                  onClick:(e)=>{e.stopPropagation();setAbilityTagPopup(tag);},
                  style:{fontSize:9,fontWeight:800,color:"#534AB7",background:"#EEEDFE",border:"1px solid rgba(83,74,183,0.4)",borderRadius:10,padding:"1px 8px",cursor:"pointer",lineHeight:1.5,flexShrink:0,whiteSpace:"nowrap"}
                },ABILITY_TAG_DEFS[tag].label))
              )
            )
          ),
          React.createElement("div",null,
            abl.upgrades.map((u,i)=>{
              const isFirst=i===0;
              const starlitFmt=formatStarlitAbilityLevel(def.id,k,abl.upgrades,i);
              const plainFmt=formatPlainAbilityLevel(def.id,k,u);
              const fmt=starlitFmt||plainFmt||(isFirst?formatAbilityDisplay(u):null);
              const step=fmt?null:formatUpgradeStep(u,abl.upgrades[i-1]);
              const numBits=[
                fmt&&fmt.shieldAmt!=null?fmt.shieldAmt+" shield":null,
                fmt&&fmt.amount!=null?fmt.amount+" dmg":null,
                fmt&&fmt.healAmt!=null?fmt.healAmt+" heal":null,
              ].filter(Boolean).join(" · ");
              return React.createElement("div",{key:i,style:{display:"flex",gap:8,marginBottom:4,alignItems:"baseline"}},
                React.createElement("span",{style:{fontSize:10,fontWeight:600,color:"#7F77DD",minWidth:14,flexShrink:0}},(i+1)),
                React.createElement("span",{style:{fontSize:12,color:"#555",lineHeight:1.5,flex:1}},fmt?fmt.label:step),
                numBits&&React.createElement("span",{style:{fontSize:10,fontWeight:700,color:"#999",flexShrink:0,whiteSpace:"nowrap"}},numBits)
              );
            })
          )
        );
      })
    ),

    tab==="skins"&&React.createElement("div",{className:"card",style:{marginBottom:10}},
      chainSkins.length===0
        ?React.createElement("p",{style:{fontSize:13,color:"#999",textAlign:"center",margin:0}},"No skins available")
        :React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
          chainSkins.map(skin=>{
            const unlocked=unlockedSkins.includes(skin.id);
            return React.createElement("div",{key:skin.id,
              style:{display:"flex",alignItems:"center",gap:10,padding:"8px",background:"#f5f5f5",borderRadius:8,cursor:"pointer"},
              onClick:()=>setSkinPreview(skin)
            },
              React.createElement("span",{style:{fontSize:28,width:36,textAlign:"center"}},
                unlocked?(skin.appearances[def.id]||skin.appearances[chain[chain.length-1]])?.emoji||"🎨":"🔒"
              ),
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{fontSize:13,fontWeight:500,color:"#000",marginBottom:2}},skin.name),
                React.createElement("span",{className:"badge "+SKIN_TIER_CONFIG[skin.tier].color},SKIN_TIER_CONFIG[skin.tier].label)
              ),
              React.createElement("i",{className:"ti ti-chevron-right",style:{color:"#aaa",fontSize:14}})
            );
          })
        )
    )
  );
}


export default DexEntry;
