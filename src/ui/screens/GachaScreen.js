// Egg hatching: banners, pulls, pity, and reveal animations.

import React, { useState, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { RARITY_CONFIG } from "../../data/rarity.js";
import { BANNERS } from "../../data/banners.js";
import { TYPE_EMOJI } from "../../data/types.js";
import { makeOwnedCreature } from "../../core/creatures.js";
import { rollGacha } from "../../core/gacha.js";
import { formatNum } from "../../core/format.js";
import ScreenHeader, { CurrencyChip } from "../components/ScreenHeader.js";
import CreatureAbilitySummary from "../components/CreatureAbilitySummary.js";

function GachaScreen({onHatch}){
  const { owned, setOwned, currencies, setCurrencies, pity, setPity } = useGame();
  const [result,setResult]=useState(null);
  const [multiResults,setMultiResults]=useState(null);
  const [visibleCount,setVisibleCount]=useState(0);
  const [showInfo,setShowInfo]=useState(false);
  const [bannerIdx,setBannerIdx]=useState(0);
  const [pendingHatch,setPendingHatch]=useState(null);
  const [detailItem,setDetailItem]=useState(null);
  const banner=BANNERS[bannerIdx];
  // Only the Storm banner shows blurb text, but every banner reserves the
  // same space for it (see the gacha-sub render below) -- reusing Storm's
  // own text as the hidden placeholder guarantees identical line-wrapping,
  // so the box beneath is always the same height regardless of banner.
  const stormSub=BANNERS.find(b=>b.id==="stormwyvern")?.sub||"";
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
      setDetailItem(null);
    }
  }

  return React.createElement("div",{style:{height:"100%",display:"flex",flexDirection:"column"}},
    React.createElement(ScreenHeader,{title:"Hatch",right:React.createElement(React.Fragment,null,
      React.createElement(CurrencyChip,{emoji:"🥚",value:currencies.eggs}),
      React.createElement(CurrencyChip,{emoji:"🥚✨",value:currencies.legendaryEggs||0}),
      React.createElement(CurrencyChip,{emoji:"💎",value:currencies.gems})
    )}),
    // Title (and, only for the Storm banner, its blurb) live above the
    // colored box now rather than inside it -- banner-switch arrows flank
    // the title+blurb column directly instead of a separate "1 / 3 • Name"
    // row. alignItems:"center" on this outer row is what centers the arrows
    // against the full two-line block (title+blurb) rather than just the
    // title line, so they sit centered in the gap above the box instead of
    // hugging the top next to the title alone. space-between (instead of a
    // centered gap) also pins them to fixed positions at the row's edges --
    // they no longer drift inward/outward as the title text's width changes
    // between banners.
    React.createElement("div",{style:{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 8px",marginBottom:14}},
      React.createElement("button",{onClick:()=>{setBannerIdx(i=>(i-1+BANNERS.length)%BANNERS.length);setShowInfo(false);},
        style:{background:"none",border:"1px solid #ddd",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:26,color:"#555",lineHeight:1,flexShrink:0}},"‹"),
      React.createElement("div",{style:{flex:1,textAlign:"center"}},
        React.createElement("div",{className:"gacha-title",style:{color:banner.titleColor,marginBottom:0}},banner.name),
        // Always rendered (blank when there's no blurb) so this block is the
        // same height for every banner -- otherwise the box below, which
        // fills whatever space is left, would be shorter on the one banner
        // with a blurb line.
        React.createElement("div",{className:"gacha-sub",style:{marginBottom:0,visibility:banner.id==="stormwyvern"?"visible":"hidden"}},stormSub)
      ),
      React.createElement("button",{onClick:()=>{setBannerIdx(i=>(i+1)%BANNERS.length);setShowInfo(false);},
        style:{background:"none",border:"1px solid #ddd",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:26,color:"#555",lineHeight:1,flexShrink:0}},"›")
    ),
    // flex:1 + centered content so this box absorbs whatever vertical space
    // is left between the header above and the banner-nav/hatch buttons
    // below, instead of the page overflowing on tall screens or leaving a
    // big empty gap on short ones.
    React.createElement("div",{className:"gacha-banner",style:{position:"relative",background:banner.color,borderColor:banner.border,flex:1,minHeight:0,display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden"}},
      React.createElement("button",{
        onClick:()=>setShowInfo(true),
        style:{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",color:banner.titleColor,padding:2,lineHeight:1,opacity:.7}
      },React.createElement("i",{className:"ti ti-info-circle",style:{fontSize:18}})),
      React.createElement("span",{className:"egg-tap",style:{flexShrink:0},onClick:()=>canAfford(1)&&doHatch(1)},
        banner.featured?CREATURE_MAP[banner.featured].emoji:"🥚")
    ),
    // Pity + rates are opt-in detail, bundled into one popup behind the (i)
    // button instead of a bar that's always on the page or an inline
    // expansion that grows the box.
    showInfo&&(()=>{
      const threshold=PITY_THRESHOLD[banner.id]||200;
      const cur=pity[banner.id]||0;
      const pct=Math.round(cur/threshold*100);
      return React.createElement("div",{className:"modal-overlay",onClick:()=>setShowInfo(false)},
        React.createElement("div",{className:"modal-box",onClick:e=>e.stopPropagation()},
          React.createElement("div",{style:{fontSize:16,fontWeight:600,color:"#000",marginBottom:14}},banner.name),
          React.createElement("div",{style:{marginBottom:16}},
            cur>=threshold
              ? React.createElement("div",{style:{fontSize:12,fontWeight:700,color:banner.titleColor,marginBottom:4,textAlign:"center"}},
                  "⭐ Next hatch guaranteed Legendary!")
              : React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666",marginBottom:4}},
                  React.createElement("span",null,"⭐ Pity"),
                  React.createElement("span",null,cur+" / "+threshold)
                ),
            React.createElement("div",{style:{height:5,borderRadius:4,background:"#e0e0e0",overflow:"hidden"}},
              React.createElement("div",{style:{height:"100%",width:pct+"%",background:banner.titleColor,opacity:.7,borderRadius:4,transition:"width .3s"}})
            )
          ),
          React.createElement("div",{className:"rates-table",style:{marginTop:0,marginBottom:16,textAlign:"left",maxHeight:"50vh",overflowY:"auto"}},
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
          ),
          React.createElement("button",{className:"btn",style:{marginBottom:0,background:"#e0e0e0",color:"#333"},onClick:()=>setShowInfo(false)},"Close")
        )
      );
    })(),
    React.createElement("div",{style:{flexShrink:0,paddingTop:10}},
      React.createElement("button",{className:"btn btn-primary",style:{marginBottom:8},onClick:()=>canAfford(1)&&setPendingHatch(1),disabled:!canAfford(1)},"Hatch ×1  —  "+costLabel(1)),
      React.createElement("button",{className:"btn",style:{background:"#3C3489",color:"#fff",borderColor:"#3C3489",marginBottom:12},onClick:()=>canAfford(10)&&setPendingHatch(10),disabled:!canAfford(10)},"Hatch ×10  —  "+costLabel(10))
    ),
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
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},eggIcon+" "+formatNum(currencies[eggKey]||0)),
          !isLegBanner&&React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},"💎 "+formatNum(currencies.gems))
        ),
        React.createElement("div",{style:{textAlign:"center",flex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",overflowY:"auto"}},
          React.createElement("span",{style:{fontSize:96,display:"block",marginBottom:12,animation:"revealPop .4s cubic-bezier(.34,1.56,.64,1)"}},c.emoji),
          isNew&&React.createElement("span",{style:{display:"inline-block",fontSize:11,fontWeight:700,background:"#534AB7",color:"#fff",borderRadius:6,padding:"2px 10px",marginBottom:8,letterSpacing:".04em"}},"NEW"),
          React.createElement("span",{className:"badge "+RARITY_CONFIG[c.rarity].color,style:{display:"inline-block",marginBottom:10}},RARITY_CONFIG[c.rarity].label),
          React.createElement("div",{style:{fontSize:26,fontWeight:600,marginBottom:4,color:"#000"}},c.name),
          React.createElement("div",{style:{fontSize:14,color:"#666",marginBottom:isNew?16:20}},(TYPE_EMOJI[c.type]||"")+" "+c.type),
          !isNew&&React.createElement("div",{style:{width:220,marginBottom:16}},
            React.createElement("div",{style:{height:6,background:"#e0e0e0",borderRadius:3,overflow:"hidden",marginBottom:5}},
              React.createElement("div",{style:{height:"100%",width:shardPct+"%",background:shards>=c.shardsToAscend?"#378ADD":"#EF9F27",borderRadius:3,transition:"width .3s"}})
            ),
            React.createElement("div",{style:{fontSize:12,color:shards>=c.shardsToAscend?"#378ADD":"#555",fontWeight:shards>=c.shardsToAscend?700:400}},shards>=c.shardsToAscend?"Ready to ascend! ("+shards+" / "+c.shardsToAscend+")":shards+" / "+c.shardsToAscend+" shards to next ascension")
          ),
          React.createElement(CreatureAbilitySummary,{def:c})
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
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},eggIcon+" "+formatNum(currencies[eggKey]||0)),
          !isLegBanner&&React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#444",background:"#e8e8e8",borderRadius:20,padding:"4px 12px"}},"💎 "+formatNum(currencies.gems))
        )
      ),
      React.createElement("div",{className:"reveal-summary-grid"},
      React.createElement("div",{className:"multi-grid",style:{maxHeight:"none"}},
        multiResults.map((item,i)=>{
          const {def:c,isNew,shards}=item;
          const shardPct=Math.min(100,Math.round((shards/c.shardsToAscend)*100));
          const visible=i<visibleCount;
          const allRevealed=visibleCount>=multiResults.length;
          return React.createElement("div",{key:i,className:"multi-item",onClick:()=>allRevealed&&visible&&setDetailItem(item),style:{
            position:"relative",
            opacity:visible?(isNew?1:0.45):0,
            animation:visible?"fadeIn .35s ease-out forwards":undefined,
            transition:"opacity .1s",
            cursor:allRevealed&&visible?"pointer":"default"
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
            React.createElement("button",{className:"btn",style:{marginBottom:0,fontSize:15,padding:12,background:"#e0e0e0",color:"#333"},onClick:()=>{setMultiResults(null);setDetailItem(null);}},"Collect All")
          )
      )
    ),
    detailItem&&(()=>{
      const c=detailItem.def;const isNew=detailItem.isNew;const shards=detailItem.shards;
      const shardPct=Math.min(100,Math.round((shards/c.shardsToAscend)*100));
      return React.createElement("div",{className:"modal-overlay",style:{zIndex:400},onClick:()=>setDetailItem(null)},
        React.createElement("div",{className:"modal-box",style:{maxWidth:460,maxHeight:"85vh",overflowY:"auto"},onClick:e=>e.stopPropagation()},
          React.createElement("span",{style:{fontSize:72,display:"block",marginBottom:8}},c.emoji),
          isNew&&React.createElement("span",{style:{display:"inline-block",fontSize:11,fontWeight:700,background:"#534AB7",color:"#fff",borderRadius:6,padding:"2px 10px",marginBottom:8,letterSpacing:".04em"}},"NEW"),
          React.createElement("span",{className:"badge "+RARITY_CONFIG[c.rarity].color,style:{display:"inline-block",marginBottom:10}},RARITY_CONFIG[c.rarity].label),
          React.createElement("div",{style:{fontSize:22,fontWeight:600,marginBottom:4,color:"#000"}},c.name),
          React.createElement("div",{style:{fontSize:14,color:"#666",marginBottom:16}},(TYPE_EMOJI[c.type]||"")+" "+c.type),
          !isNew&&React.createElement("div",{style:{width:"100%",marginBottom:16}},
            React.createElement("div",{style:{height:6,background:"#e0e0e0",borderRadius:3,overflow:"hidden",marginBottom:5}},
              React.createElement("div",{style:{height:"100%",width:shardPct+"%",background:shards>=c.shardsToAscend?"#378ADD":"#EF9F27",borderRadius:3,transition:"width .3s"}})
            ),
            React.createElement("div",{style:{fontSize:12,color:shards>=c.shardsToAscend?"#378ADD":"#555",fontWeight:shards>=c.shardsToAscend?700:400}},shards>=c.shardsToAscend?"Ready to ascend! ("+shards+" / "+c.shardsToAscend+")":shards+" / "+c.shardsToAscend+" shards to next ascension")
          ),
          React.createElement(CreatureAbilitySummary,{def:c,maxWidth:420}),
          React.createElement("button",{className:"btn",style:{marginTop:16,marginBottom:0,fontSize:15,padding:12,background:"#e0e0e0",color:"#333",width:"100%"},onClick:()=>setDetailItem(null)},"Close")
        )
      );
    })()
  );
}


export default GachaScreen;
