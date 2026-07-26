// Egg hatching: banners, pulls, pity, and reveal animations.

import React, { useState, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { RARITY_CONFIG } from "../../data/rarity.js";
import { BANNERS } from "../../data/banners.js";
import { makeOwnedCreature } from "../../core/creatures.js";
import { rollGacha } from "../../core/gacha.js";

function GachaScreen({onHatch}){
  const { owned, setOwned, currencies, setCurrencies, pity, setPity } = useGame();
  const [result,setResult]=useState(null);
  const [multiResults,setMultiResults]=useState(null);
  const [visibleCount,setVisibleCount]=useState(0);
  const [showRates,setShowRates]=useState(false);
  const [bannerIdx,setBannerIdx]=useState(0);
  const [pendingHatch,setPendingHatch]=useState(null);
  const banner=BANNERS[bannerIdx];
  const SINGLE=100,MULTI=900;

  useEffect(()=>{
    if(!multiResults||visibleCount>=multiResults.length)return;
    const t=setTimeout(()=>setVisibleCount(v=>v+1),350);
    return()=>clearTimeout(t);
  },[multiResults,visibleCount]);

  function addCreature(def){
    setOwned(prev=>{
      if(prev[def.id])return{...prev,[def.id]:{...prev[def.id],shards:prev[def.id].shards+1}};
      return{...prev,[def.id]:makeOwnedCreature(def)};
    });
  }

  const isLegBanner=banner.currency==="legendaryEggs";
  const eggKey=isLegBanner?"legendaryEggs":"eggs";
  const eggIcon=isLegBanner?"🥚✨":"🥚";

  function calcCost(count){
    const eggs=currencies[eggKey]||0;
    const eggUse=Math.min(eggs,count);
    const remainPulls=count-eggUse;
    const gemCost=isLegBanner?0:count===10&&remainPulls===10?MULTI:remainPulls*100;
    return{eggUse,gemCost};
  }
  function canAfford(count){
    const{eggUse,gemCost}=calcCost(count);
    if(isLegBanner) return(currencies[eggKey]||0)>=count;
    return(currencies[eggKey]||0)>=eggUse&&currencies.gems>=gemCost;
  }
  function costLabel(count){
    const{eggUse,gemCost}=calcCost(count);
    if(isLegBanner)return eggIcon+" "+count+(count>1?" Legendary Eggs":" Legendary Egg");
    if(eggUse>0&&gemCost>0)return"🥚 "+eggUse+"  +  💎 "+gemCost;
    if(eggUse>0)return"🥚 "+eggUse+(count>1?" Eggs":" Egg");
    return"💎 "+gemCost+(count===10?" (save 100!)":"");
  }

  const PITY_THRESHOLD={standard:200,stormwyvern:200,legendary:15};
  function forceLegendary(){
    const pool=CREATURES.filter(c=>c.rarity==="legendary"&&!c.evolutionOf);
    return pool[Math.floor(Math.random()*pool.length)]||CREATURES.find(c=>c.rarity==="legendary"&&!c.evolutionOf);
  }
  function rollWithPity(localPity){
    const threshold=PITY_THRESHOLD[banner.id]||200;
    localPity++;
    if(localPity>threshold){
      return{creature:forceLegendary(),pity:0};
    }
    const c=rollGacha(banner);
    return{creature:c,pity:c.rarity==="legendary"?0:localPity};
  }

  function doHatch(count=1){
    const{eggUse,gemCost}=calcCost(count);
    if(!canAfford(count))return;
    setCurrencies(c=>({...c,[eggKey]:Math.max(0,(c[eggKey]||0)-eggUse),gems:c.gems-gemCost}));
    if(onHatch)onHatch(count);
    let localPity=pity[banner.id]||0;
    if(count===1){
      const{creature:c,pity:newPity}=rollWithPity(localPity);
      setPity(p=>({...p,[banner.id]:newPity}));
      const isNew=!owned[c.id];addCreature(c);setResult({def:c,isNew});
    } else {
      const preOwned=new Set(Object.keys(owned));
      const shardTracker={};
      const rs=Array.from({length:10},()=>{
        const{creature:c,pity:newPity}=rollWithPity(localPity);
        localPity=newPity;
        let shards;
        if(shardTracker[c.id]!==undefined){
          shardTracker[c.id]++;
          shards=shardTracker[c.id];
        } else if(preOwned.has(c.id)){
          shardTracker[c.id]=(owned[c.id]?.shards||0)+1;
          shards=shardTracker[c.id];
        } else {
          shardTracker[c.id]=0;
          shards=0;
        }
        const isNew=!preOwned.has(c.id)&&shards===0;
        return{def:c,isNew,shards};
      });
      setPity(p=>({...p,[banner.id]:localPity}));
      rs.forEach(({def})=>addCreature(def));
      setMultiResults(rs);
      setVisibleCount(0);
    }
  }

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10}},
      React.createElement("button",{onClick:()=>{setBannerIdx(i=>(i-1+BANNERS.length)%BANNERS.length);setShowRates(false);},
        style:{background:"none",border:"1px solid #ddd",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:18,color:"#555",lineHeight:1}},"‹"),
      React.createElement("div",{style:{flex:1,textAlign:"center",fontSize:12,color:"#666",fontWeight:500}},
        (bannerIdx+1)+" / "+BANNERS.length+"  •  "+banner.name),
      React.createElement("button",{onClick:()=>{setBannerIdx(i=>(i+1)%BANNERS.length);setShowRates(false);},
        style:{background:"none",border:"1px solid #ddd",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:18,color:"#555",lineHeight:1}},"›")
    ),
    React.createElement("div",{className:"gacha-banner",style:{position:"relative",background:banner.color,borderColor:banner.border}},
      React.createElement("button",{
        onClick:()=>setShowRates(r=>!r),
        style:{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",color:banner.titleColor,padding:2,lineHeight:1,opacity:.7}
      },React.createElement("i",{className:"ti ti-info-circle",style:{fontSize:18}})),
      React.createElement("div",{className:"gacha-title",style:{color:banner.titleColor}},banner.name),
      React.createElement("div",{className:"gacha-sub"},banner.sub),
      React.createElement("span",{className:"egg-tap",onClick:()=>canAfford(1)&&doHatch(1)},
        banner.featured?CREATURE_MAP[banner.featured].emoji:"🥚"),
      (()=>{
        const threshold=PITY_THRESHOLD[banner.id]||200;
        const cur=pity[banner.id]||0;
        const pct=Math.round(cur/threshold*100);
        return React.createElement("div",{style:{marginTop:8,marginBottom:2}},
          cur>=threshold
            ? React.createElement("div",{style:{fontSize:11,fontWeight:700,color:banner.titleColor,marginBottom:3,textAlign:"center"}},
                "⭐ Next hatch guaranteed Legendary!")
            : React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:banner.titleColor,opacity:.75,marginBottom:3}},
                React.createElement("span",null,"⭐ Pity"),
                React.createElement("span",null,cur+" / "+threshold)
              ),
          React.createElement("div",{style:{height:5,borderRadius:4,background:"rgba(0,0,0,0.12)",overflow:"hidden"}},
            React.createElement("div",{style:{height:"100%",width:pct+"%",background:banner.titleColor,opacity:.7,borderRadius:4,transition:"width .3s"}})
          )
        );
      })(),
      showRates&&React.createElement("div",{className:"rates-table",style:{marginTop:12,marginBottom:0,background:"#fff",borderRadius:8}},
        banner.rates
          ? banner.rates.map((entry,i)=>{
              const label=entry.type==="creature"
                ? CREATURE_MAP[entry.id].name+" ⭐"
                : entry.type==="rarity_excl"
                  ? RARITY_CONFIG[entry.rarity].label+" (other)"
                  : RARITY_CONFIG[entry.rarity].label;
              const badgeColor=entry.type==="creature"||entry.type==="rarity_excl"
                ? RARITY_CONFIG[entry.rarity||"legendary"].color
                : RARITY_CONFIG[entry.rarity].color;
              return React.createElement("div",{key:i,className:"rates-row"},
                React.createElement("span",{className:"badge "+badgeColor},label),
                React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#000"}},entry.rate+"%")
              );
            })
          : Object.entries(RARITY_CONFIG).map(([r,cfg])=>
              React.createElement("div",{key:r,className:"rates-row"},
                React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                  React.createElement("span",{className:"badge "+cfg.color},cfg.label),
                  React.createElement("span",{style:{fontSize:11,color:"#666"}},"("+CREATURES.filter(c=>c.rarity===r&&!c.evolutionOf).length+" creatures)")
                ),
                React.createElement("span",{style:{fontSize:13,fontWeight:500,color:"#000"}},cfg.rate+"%")
              )
            )
      )
    ),
    React.createElement("button",{className:"btn btn-primary",onClick:()=>canAfford(1)&&setPendingHatch(1),disabled:!canAfford(1)},"Hatch ×1  —  "+costLabel(1)),
    React.createElement("button",{className:"btn",style:{background:"#3C3489",color:"#fff",borderColor:"#3C3489"},onClick:()=>canAfford(10)&&setPendingHatch(10),disabled:!canAfford(10)},"Hatch ×10  —  "+costLabel(10)),
    pendingHatch&&React.createElement("div",{className:"modal-overlay",onClick:()=>setPendingHatch(null)},
      React.createElement("div",{className:"modal-box",onClick:e=>e.stopPropagation()},
        React.createElement("div",{style:{fontSize:40,marginBottom:8}},banner.featured?CREATURE_MAP[banner.featured].emoji:"🥚"),
        React.createElement("div",{style:{fontSize:16,fontWeight:600,color:"#000",marginBottom:6}},
          "Hatch ×"+pendingHatch+"?"),
        React.createElement("p",{style:{fontSize:13,color:"#666",marginBottom:4}},banner.name),
        React.createElement("p",{style:{fontSize:13,color:"#444",marginBottom:18}},
          "This will cost "+costLabel(pendingHatch)+"."),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{className:"btn",style:{flex:1,marginBottom:0,background:"#e0e0e0",color:"#333"},onClick:()=>setPendingHatch(null)},"Cancel"),
          React.createElement("button",{className:"btn btn-primary",style:{flex:1,marginBottom:0},onClick:()=>{const c=pendingHatch;setPendingHatch(null);doHatch(c);}},
            "Confirm")
        )
      )
    ),
    result&&(()=>{
      const c=result.def;const isNew=result.isNew;
      const ownedData=owned[c.id];
      const shards=ownedData?ownedData.shards:0;
      const shardPct=Math.min(100,Math.round((shards/c.shardsToAscend)*100));
      return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}},
        React.createElement("div",{style:{alignSelf:"flex-end",marginBottom:8,display:"flex",gap:6}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},eggIcon+" "+(currencies[eggKey]||0).toLocaleString()),
          !isLegBanner&&React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},"💎 "+currencies.gems.toLocaleString())
        ),
        React.createElement("div",{style:{textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}},
          React.createElement("span",{style:{fontSize:96,display:"block",marginBottom:12,animation:"revealPop .4s cubic-bezier(.34,1.56,.64,1)"}},c.emoji),
          isNew&&React.createElement("span",{style:{display:"inline-block",fontSize:11,fontWeight:700,background:"#534AB7",color:"#fff",borderRadius:6,padding:"2px 10px",marginBottom:8,letterSpacing:".04em"}},"NEW"),
          React.createElement("span",{className:"badge "+RARITY_CONFIG[c.rarity].color,style:{display:"inline-block",marginBottom:10}},RARITY_CONFIG[c.rarity].label),
          React.createElement("div",{style:{fontSize:26,fontWeight:600,marginBottom:4,color:"#000"}},c.name),
          React.createElement("div",{style:{fontSize:14,color:"#666",marginBottom:isNew?0:20}},c.type),
          !isNew&&React.createElement("div",{style:{width:220,marginTop:16}},
            React.createElement("div",{style:{height:6,background:"#e0e0e0",borderRadius:3,overflow:"hidden",marginBottom:5}},
              React.createElement("div",{style:{height:"100%",width:shardPct+"%",background:shards>=c.shardsToAscend?"#378ADD":"#EF9F27",borderRadius:3,transition:"width .3s"}})
            ),
            React.createElement("div",{style:{fontSize:12,color:shards>=c.shardsToAscend?"#378ADD":"#555",fontWeight:shards>=c.shardsToAscend?700:400}},shards>=c.shardsToAscend?"Ready to ascend! ("+shards+" / "+c.shardsToAscend+")":shards+" / "+c.shardsToAscend+" shards to next ascension")
          )
        ),
        React.createElement("div",{style:{width:"100%",paddingBottom:8,display:"flex",flexDirection:"column",gap:10}},
          (()=>{
            const threshold=PITY_THRESHOLD[banner.id]||200;
            const cur=pity[banner.id]||0;
            const pct=Math.round(cur/threshold*100);
            return React.createElement("div",{style:{background:"#fff",borderRadius:12,padding:"10px 14px"}},
              cur>=threshold
                ? React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#534AB7",textAlign:"center"}},
                    "⭐ Next hatch guaranteed Legendary!")
                : React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"#666",marginBottom:4}},
                    React.createElement("span",null,"⭐ Pity"),
                    React.createElement("span",null,cur+" / "+threshold)
                  ),
              React.createElement("div",{style:{height:5,borderRadius:4,background:"#e0e0e0",overflow:"hidden",marginTop:cur>=threshold?6:0}},
                React.createElement("div",{style:{height:"100%",width:pct+"%",background:"#534AB7",borderRadius:4,transition:"width .3s"}})
              )
            );
          })(),
          React.createElement("button",{
            className:"btn btn-primary",
            style:{marginBottom:0,fontSize:16,padding:14,opacity:canAfford(1)?1:0.45},
            disabled:!canAfford(1),
            onClick:()=>{if(canAfford(1))doHatch(1);}
          },"Hatch Again — "+costLabel(1)),
          React.createElement("button",{className:"btn",style:{marginBottom:0,fontSize:15,padding:12,background:"#e0e0e0",color:"#333"},onClick:()=>setResult(null)},isNew?"Nice!":"Got it")
        )
      );
    })(),
    multiResults&&React.createElement("div",{className:"reveal-summary"},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}},
        React.createElement("div",{style:{fontSize:16,fontWeight:500,color:"#000"}},"Hatch Results"),
        React.createElement("div",{style:{display:"flex",gap:6}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},eggIcon+" "+(currencies[eggKey]||0).toLocaleString()),
          !isLegBanner&&React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},"💎 "+currencies.gems.toLocaleString())
        )
      ),
      React.createElement("div",{className:"reveal-summary-grid"},
      React.createElement("div",{className:"multi-grid",style:{maxHeight:"none"}},
        multiResults.map(({def:c,isNew,shards},i)=>{
          const shardPct=Math.min(100,Math.round((shards/c.shardsToAscend)*100));
          const visible=i<visibleCount;
          return React.createElement("div",{key:i,className:"multi-item",style:{
            position:"relative",
            opacity:visible?(isNew?1:0.45):0,
            animation:visible?"fadeIn .35s ease-out forwards":undefined,
            transition:"opacity .1s"
          }},
            visible&&isNew&&React.createElement("span",{style:{position:"absolute",top:4,right:4,fontSize:9,fontWeight:700,background:"#534AB7",color:"#fff",borderRadius:6,padding:"1px 5px",letterSpacing:".04em"}},"NEW"),
            React.createElement("span",{className:"me"},visible?c.emoji:""),
            React.createElement("div",{className:"mn"},visible?c.name:""),
            visible&&React.createElement("span",{className:"badge "+RARITY_CONFIG[c.rarity].color},RARITY_CONFIG[c.rarity].label),
            visible&&!isNew&&React.createElement("div",{style:{marginTop:5}},
              React.createElement("div",{style:{height:4,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:2}},
                React.createElement("div",{style:{height:"100%",width:shardPct+"%",background:shards>=c.shardsToAscend?"#378ADD":"#EF9F27",borderRadius:2}})
              ),
              React.createElement("div",{style:{fontSize:9,color:shards>=c.shardsToAscend?"#378ADD":"#555",fontWeight:shards>=c.shardsToAscend?700:400}},shards>=c.shardsToAscend?"Ready!":shards+" / "+c.shardsToAscend+" shards")
            )
          );
        })
      )
      ),
      React.createElement("div",{className:"reveal-summary-footer"},
        visibleCount<multiResults.length
          ?React.createElement("button",{className:"btn btn-primary",style:{marginBottom:0,fontSize:16,padding:14},onClick:()=>setVisibleCount(multiResults.length)},"Skip")
          :React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
            React.createElement("button",{
              className:"btn btn-primary",
              style:{marginBottom:0,fontSize:16,padding:14,opacity:canAfford(10)?1:0.45},
              disabled:!canAfford(10),
              onClick:()=>{if(canAfford(10))doHatch(10);}
            },"Hatch Again x10 — "+costLabel(10)),
            React.createElement("button",{className:"btn",style:{marginBottom:0,fontSize:15,padding:12,background:"#e0e0e0",color:"#333"},onClick:()=>setMultiResults(null)},"Collect All")
          )
      )
    )
  );
}


export default GachaScreen;
