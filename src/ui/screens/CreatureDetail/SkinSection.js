// Skins tab: browse, roll for, and equip cosmetic skins.

import React, { useState } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { SKIN_TIER_CONFIG, SKIN_FAIL_SHARDS } from "../../../data/rarity.js";
import { getChain, getSkinsForCreature } from "../../../core/creatures.js";
import { rollSkinForCreature } from "../../../core/gacha.js";

function SkinSection({ownedData,def}){
  const { currencies, setCurrencies, setOwned, unlockedSkins, setUnlockedSkins, skinShards, setSkinShards } = useGame();
  const [skinNotify,setSkinNotify]=useState(null);
  const [previewSkin,setPreviewSkin]=useState(null);
  const [confirmSkin,setConfirmSkin]=useState(null);
  const [newSkinPopup,setNewSkinPopup]=useState(null);
  const [showSkinInfo,setShowSkinInfo]=useState(false);
  const holdRef=React.useRef(null);
  const notifyTimerRef=React.useRef(null);
  const chainSkins=getSkinsForCreature(def.id);
  const chain=getChain(def.id);

  function notify_(msg,dur=2500){
    if(notifyTimerRef.current)clearTimeout(notifyTimerRef.current);
    setSkinNotify(msg);
    notifyTimerRef.current=setTimeout(()=>setSkinNotify(null),dur);
  }

  function doRollSkin(){
    setCurrencies(c=>{
      if(c.candy<1) return c;
      const skin=rollSkinForCreature(def.id);
      const next={...c,candy:c.candy-1};
      if(!skin){
        setSkinShards(s=>s+SKIN_FAIL_SHARDS);
        notify_("No skin this time. +"+SKIN_FAIL_SHARDS+" Skin Shards");
      } else {
        setUnlockedSkins(prev=>{
          if(prev.includes(skin.id)){
            const val=SKIN_TIER_CONFIG[skin.tier].shardValue;
            setSkinShards(s=>s+val);
            setNewSkinPopup({skin,duplicate:true,shardValue:val});
            return prev;
          } else {
            setNewSkinPopup({skin,duplicate:false});
            return [...prev,skin.id];
          }
        });
      }
      return next;
    });
  }

  function startHold(){
    doRollSkin();
    holdRef.current=setTimeout(()=>{
      holdRef.current=setInterval(doRollSkin,200);
    },500);
  }

  function stopHold(){
    if(holdRef.current){clearTimeout(holdRef.current);clearInterval(holdRef.current);holdRef.current=null;}
  }

  function doUnlockWithShards(skin){
    const cost=SKIN_TIER_CONFIG[skin.tier].shardCost;
    setSkinShards(s=>s-cost);
    setUnlockedSkins(prev=>[...prev,skin.id]);
    setConfirmSkin(null);
    setPreviewSkin(null);
    notify_("Unlocked "+skin.name+"!");
  }

  function selectSkin(setId,variantId){
    setOwned(prev=>({...prev,[ownedData.id]:{...prev[ownedData.id],activeSkin:{setId,variantId}}}));
  }

  function clearSkin(){
    setOwned(prev=>({...prev,[ownedData.id]:{...prev[ownedData.id],activeSkin:null}}));
  }

  const activeSkinId=ownedData.activeSkin&&ownedData.activeSkin.setId;

  return React.createElement("div",{className:"card",style:{marginBottom:10}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
      React.createElement("div",{className:"section-label",style:{marginBottom:0}},"Skins"),
      React.createElement("button",{
        onClick:()=>setShowSkinInfo(v=>!v),
        style:{background:"none",border:"none",cursor:"pointer",padding:2,lineHeight:1,opacity:.6,color:"#333"}
      },React.createElement("i",{className:"ti ti-info-circle",style:{fontSize:18}}))
    ),
    showSkinInfo&&React.createElement("div",{className:"rates-table",style:{marginBottom:10}},
      React.createElement("div",{className:"rates-row",style:{paddingBottom:6,marginBottom:2}},
        React.createElement("span",{style:{fontSize:11,color:"#888",fontWeight:600}},"Tier"),
        React.createElement("div",{style:{display:"flex",gap:24}},
          React.createElement("span",{style:{fontSize:11,color:"#888",fontWeight:600}},"Chance"),
          React.createElement("span",{style:{fontSize:11,color:"#888",fontWeight:600}},"Dupe")
        )
      ),
      Object.entries(SKIN_TIER_CONFIG).map(([tier,cfg])=>
        React.createElement("div",{key:tier,className:"rates-row"},
          React.createElement("span",{className:"badge "+cfg.color},cfg.label),
          React.createElement("div",{style:{display:"flex",gap:24}},
            React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#000"}},cfg.rate+"%"),
            React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#555"}},"🔮 "+cfg.shardValue)
          )
        )
      ),
      React.createElement("div",{className:"rates-row",style:{marginTop:4}},
        React.createElement("span",{style:{fontSize:12,color:"#888"}},"No skin"),
        React.createElement("div",{style:{display:"flex",gap:24}},
          React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#000"}},(100-Object.values(SKIN_TIER_CONFIG).reduce((s,c)=>s+c.rate,0))+"%"),
          React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#555"}},"🔮 "+SKIN_FAIL_SHARDS)
        )
      )
    ),

    previewSkin&&React.createElement("div",{className:"modal-overlay",onClick:()=>setPreviewSkin(null)},
      React.createElement("div",{className:"modal-box",onClick:e=>e.stopPropagation()},
        React.createElement("div",{style:{fontSize:56,marginBottom:8,textAlign:"center"}},
          (previewSkin.skin.appearances[def.id]||previewSkin.skin.appearances[chain[chain.length-1]])?.emoji||"🎨"
        ),
        React.createElement("div",{style:{fontSize:16,fontWeight:600,color:"#000",marginBottom:4,textAlign:"center"}},previewSkin.skin.name),
        React.createElement("div",{style:{textAlign:"center",marginBottom:12}},
          React.createElement("span",{className:"badge "+SKIN_TIER_CONFIG[previewSkin.skin.tier].color},SKIN_TIER_CONFIG[previewSkin.skin.tier].label)
        ),
        !previewSkin.unlocked&&React.createElement(React.Fragment,null,
          React.createElement("div",{style:{fontSize:12,color:"#666",textAlign:"center",marginBottom:14}},
            "🔮 "+skinShards+" / "+SKIN_TIER_CONFIG[previewSkin.skin.tier].shardCost+" Shards"
          ),
          React.createElement("div",{style:{display:"flex",gap:8}},
            React.createElement("button",{className:"btn",style:{flex:1,marginBottom:0,background:"#e0e0e0",color:"#333"},onClick:()=>setPreviewSkin(null)},"Cancel"),
            React.createElement("button",{
              className:"btn btn-primary",
              style:{flex:1,marginBottom:0,opacity:skinShards>=SKIN_TIER_CONFIG[previewSkin.skin.tier].shardCost?1:0.45},
              disabled:skinShards<SKIN_TIER_CONFIG[previewSkin.skin.tier].shardCost,
              onClick:()=>skinShards>=SKIN_TIER_CONFIG[previewSkin.skin.tier].shardCost&&setConfirmSkin(previewSkin.skin)
            },"Purchase — 🔮 "+SKIN_TIER_CONFIG[previewSkin.skin.tier].shardCost)
          )
        ),
        previewSkin.unlocked&&React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{className:"btn",style:{flex:1,marginBottom:0,background:"#e0e0e0",color:"#333"},onClick:()=>setPreviewSkin(null)},"Close"),
          React.createElement("button",{className:"btn btn-primary",style:{flex:1,marginBottom:0},
            onClick:()=>{selectSkin(previewSkin.skin.id,def.id);setPreviewSkin(null);}
          },activeSkinId===previewSkin.skin.id?"Equipped ✓":"Equip")
        )
      )
    ),

    confirmSkin&&React.createElement("div",{className:"modal-overlay",onClick:()=>setConfirmSkin(null)},
      React.createElement("div",{className:"modal-box",onClick:e=>e.stopPropagation()},
        React.createElement("div",{style:{fontSize:18,fontWeight:600,color:"#000",marginBottom:6,textAlign:"center"}},"Purchase skin?"),
        React.createElement("p",{style:{fontSize:13,color:"#666",textAlign:"center",marginBottom:4}},confirmSkin.name),
        React.createElement("p",{style:{fontSize:13,color:"#444",textAlign:"center",marginBottom:18}},"This will cost 🔮 "+SKIN_TIER_CONFIG[confirmSkin.tier].shardCost+" Skin Shards."),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{className:"btn",style:{flex:1,marginBottom:0,background:"#e0e0e0",color:"#333"},onClick:()=>setConfirmSkin(null)},"Cancel"),
          React.createElement("button",{className:"btn btn-primary",style:{flex:1,marginBottom:0},onClick:()=>doUnlockWithShards(confirmSkin)},"Confirm")
        )
      )
    ),

    React.createElement("div",{style:{fontSize:12,color:"#666",marginBottom:10}},"🔮 "+skinShards+" Shards"),
    React.createElement("button",{
      className:"btn btn-primary",
      disabled:currencies.candy<1,
      style:{width:"100%",fontSize:15,padding:"12px 0",marginBottom:10,userSelect:"none"},
      onMouseDown:startHold,onMouseUp:stopHold,onMouseLeave:stopHold,
      onTouchStart:e=>{e.preventDefault();startHold();},onTouchEnd:stopHold
    },
      "Feed — 🍬 1  ("+currencies.candy+" left)"
    ),
    React.createElement("div",{className:"skin-grid"},
      React.createElement("div",{
        className:"skin-card"+(activeSkinId===null?" active-skin":""),
        onClick:clearSkin
      },
        React.createElement("div",{className:"skin-emoji"},def.emoji),
        React.createElement("div",{className:"skin-name"},"Default"),
        React.createElement("span",{className:"badge badge-common"},"Base")
      ),
      chainSkins.map(skin=>{
        const unlocked=unlockedSkins.includes(skin.id);
        const isActive=activeSkinId===skin.id;
        const cost=SKIN_TIER_CONFIG[skin.tier].shardCost;
        const previewEmoji=(skin.appearances[def.id]&&skin.appearances[def.id].emoji)||"?";
        return React.createElement("div",{
          key:skin.id,
          className:"skin-card"+(isActive?" active-skin":"")+(unlocked?"":" locked-skin"),
          onClick:()=>setPreviewSkin({skin,unlocked})
        },
          React.createElement("div",{className:"skin-emoji"},unlocked?previewEmoji:"🔒"),
          React.createElement("div",{className:"skin-name"},skin.name),
          React.createElement("span",{className:"badge "+SKIN_TIER_CONFIG[skin.tier].color},SKIN_TIER_CONFIG[skin.tier].label),
          !unlocked&&React.createElement("div",{style:{fontSize:10,color:"#888",marginTop:3}},"🔮 "+cost),
          isActive&&chain.length>1&&React.createElement("div",{className:"variant-row"},
            chain.filter(cid=>skin.appearances[cid]).map(cid=>
              React.createElement("button",{
                key:cid,
                className:"variant-btn"+(ownedData.activeSkin&&ownedData.activeSkin.variantId===cid?" active-var":""),
                onClick:e=>{e.stopPropagation();selectSkin(skin.id,cid);}
              },skin.appearances[cid].emoji)
            )
          )
        );
      })
    ),
    newSkinPopup&&React.createElement("div",{className:"modal-overlay",onClick:()=>setNewSkinPopup(null)},
      React.createElement("div",{className:"modal-box",style:{textAlign:"center"},onClick:e=>e.stopPropagation()},
        React.createElement("div",{style:{fontSize:13,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:1,color:newSkinPopup.duplicate?"#999":"#534AB7"}},
          newSkinPopup.duplicate?"Duplicate":"New Skin!"
        ),
        React.createElement("div",{style:{fontSize:64,marginBottom:8,filter:newSkinPopup.duplicate?"grayscale(80%) opacity(50%)":"none"}},
          (newSkinPopup.skin.appearances[def.id]||newSkinPopup.skin.appearances[chain[chain.length-1]])?.emoji||"🎨"
        ),
        React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#000",marginBottom:4}},newSkinPopup.skin.name),
        React.createElement("div",{style:{marginBottom:newSkinPopup.duplicate?8:16}},
          React.createElement("span",{className:"badge "+SKIN_TIER_CONFIG[newSkinPopup.skin.tier].color},SKIN_TIER_CONFIG[newSkinPopup.skin.tier].label)
        ),
        newSkinPopup.duplicate&&React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:16}},"+"+newSkinPopup.shardValue+" 🔮 Skin Shards"),
        React.createElement("button",{className:"btn btn-primary",style:{width:"100%",marginBottom:0},onClick:()=>setNewSkinPopup(null)},"OK")
      )
    ),
    React.createElement("div",{style:{height:20,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}},
      skinNotify&&React.createElement("span",{style:{fontSize:12,color:"#534AB7",fontWeight:500}},skinNotify)
    ),
  );
}


export default SkinSection;
