// Ore opening, treasure collection, and set-completion rewards.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { TREASURE_RARITIES, TREASURE_SETS, TREASURES } from "../../data/treasures.js";
import { applyRewards } from "../../core/rewards.js";
import { rollTreasure } from "../../core/gacha.js";
import { formatNum } from "../../core/format.js";

function TreasureScreen({onBack}){
  const { currencies, setCurrencies, collectedTreasures, setCollectedTreasures, completedTreasureSets, setCompletedTreasureSets } = useGame();
  const [openResult,setOpenResult]=React.useState(null);// {treasure, isDuplicate}
  const [openResults,setOpenResults]=React.useState(null);// [{treasure, isDuplicate}] for 10x
  const [multiVisible,setMultiVisible]=React.useState(0);
  const pendingSetRewards=new Set(TREASURE_SETS.filter(set=>!completedTreasureSets.has(set.id)&&TREASURES.filter(t=>t.setId===set.id).every(t=>collectedTreasures.has(t.id))).map(s=>s.id));
  const [setCompletePopup,setSetCompletePopup]=React.useState(null);// set object
  const [treasurePopup,setTreasurePopup]=React.useState(null);// treasure object
  const [oreTypeIndex,setOreTypeIndex]=React.useState(0);
  const [redeemOpen,setRedeemOpen]=React.useState(false);
  const oreCount=currencies.mysteriousOre||0;
  const deluxeOreCount=currencies.deluxeOre||0;
  const rainbowOreCount=currencies.rainbowOre||0;
  React.useEffect(()=>{
    if(!openResults||multiVisible>=openResults.length)return;
    const t=setTimeout(()=>setMultiVisible(v=>v+1),180);
    return()=>clearTimeout(t);
  },[openResults,multiVisible]);
  const treasurePopupEl=treasurePopup&&React.createElement("div",{onClick:()=>setTreasurePopup(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}},
      React.createElement("div",{style:{fontSize:52,lineHeight:1,marginBottom:12}},treasurePopup.emoji),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111",marginBottom:4}},treasurePopup.name),
      React.createElement("div",{style:{fontSize:12,fontWeight:700,color:TREASURE_RARITIES[treasurePopup.rarity].color,marginBottom:12,textTransform:"uppercase",letterSpacing:1}},TREASURE_RARITIES[treasurePopup.rarity].label),
      React.createElement("button",{onClick:()=>setTreasurePopup(null),style:{marginTop:20,padding:"10px 28px",borderRadius:12,border:"none",background:"#534AB7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}},"OK")
    )
  );
  const setCompletePopupEl=setCompletePopup&&React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
    React.createElement("div",{style:{background:"#fff",borderRadius:24,padding:"32px 24px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"0 12px 48px rgba(0,0,0,0.22)",position:"relative",overflow:"hidden"}},
      React.createElement("div",{style:{fontSize:48,marginBottom:4}},"🎉"),
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#d97706",marginBottom:2}},setCompletePopup.name),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:20,fontWeight:500}},"Set Complete!"),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:24}},
        React.createElement("div",{style:{fontSize:40,lineHeight:1}},setCompletePopup.rewardEmoji),
        React.createElement("div",{style:{fontSize:15,color:"#111",fontWeight:700}},setCompletePopup.rewardLabel),
        React.createElement("div",{style:{fontSize:13,color:"#888"}},"Set Reward")
      ),
      React.createElement("button",{onClick:()=>{claimSetReward(setCompletePopup);setSetCompletePopup(null);},style:{width:"100%",padding:"13px",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#fff",border:"none",borderRadius:14,fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 16px rgba(245,158,11,0.4)"}},"🏆 Claim Reward")
    )
  );
  const ORE_CURRENCY={normal:"mysteriousOre",deluxe:"deluxeOre",rainbow:"rainbowOre"};
  function doOpenOre(oreType){
    const key=ORE_CURRENCY[oreType];
    if((currencies[key]||0)<1)return;
    const t=rollTreasure(collectedTreasures,oreType);
    if(!t)return;
    const isDuplicate=collectedTreasures.has(t.id);
    setCurrencies(c=>({...c,[key]:(c[key]||0)-1}));
    if(!isDuplicate){
      const next=new Set([...collectedTreasures,t.id]);
      setCollectedTreasures(next);
      const set=TREASURE_SETS.find(s=>s.id===t.setId);
      if(set&&!completedTreasureSets.has(set.id)){
        const setTreasures=TREASURES.filter(tr=>tr.setId===set.id);
        // pendingSetRewards is derived — no update needed
      }
    } else {
      setCurrencies(c=>({...c,treasureShards:(c.treasureShards||0)+TREASURE_RARITIES[t.rarity].shards}));
    }
    setOpenResult({treasure:t,isDuplicate});
  }
  function doOpenOre10(oreType){
    const key=ORE_CURRENCY[oreType];
    const count=Math.min(10,currencies[key]||0);
    if(count<1)return;
    let collected=new Set([...collectedTreasures]);
    let newCompletedSet=null;
    const results=[];
    let shardsGained=0;
    let used=0;
    for(let i=0;i<count;i++){
      const t=rollTreasure(collected,oreType);
      if(!t)break;
      used++;
      const isDuplicate=collected.has(t.id);
      const shards=isDuplicate?TREASURE_RARITIES[t.rarity].shards:0;
      results.push({treasure:t,isDuplicate,shards});
      if(!isDuplicate){
        collected=new Set([...collected,t.id]);
        const set=TREASURE_SETS.find(s=>s.id===t.setId);
        if(set&&!completedTreasureSets.has(set.id)&&!newCompletedSet){
          const setTreasures=TREASURES.filter(tr=>tr.setId===set.id);
          if(setTreasures.every(tr=>collected.has(tr.id))) newCompletedSet=set;
        }
      } else {
        shardsGained+=shards;
      }
    }
    if(results.length===0)return;
    setCurrencies(c=>({...c,[key]:(c[key]||0)-used}));
    setCollectedTreasures(collected);
    // pendingSetRewards is derived — no update needed
    if(shardsGained>0) setCurrencies(c=>({...c,treasureShards:(c.treasureShards||0)+shardsGained}));
    setMultiVisible(0);
    setOpenResults(results);
  }
  function openOre(){doOpenOre("normal");}
  function openOre10(){doOpenOre10("normal");}
  function openDeluxe(){doOpenOre("deluxe");}
  function openDeluxe10(){doOpenOre10("deluxe");}
  function openRainbow(){doOpenOre("rainbow");}
  function openRainbow10(){doOpenOre10("rainbow");}
  function claimSetReward(set){
    const entries=Object.entries(set.reward);
    applyRewards(setCurrencies,Object.fromEntries(entries));
    setCompletedTreasureSets(prev=>new Set([...prev,set.id]));
    // pendingSetRewards is derived — removing from completedTreasureSets above is enough
  }
  // 10x open reveal
  if(openResults){
    const allVisible=multiVisible>=openResults.length;
    return React.createElement("div",{onClick:allVisible?()=>setOpenResults(null):undefined,style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#fff",zIndex:200,cursor:allVisible?"pointer":"default"}},
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#111",padding:"28px 24px 16px",flexShrink:0}},"Obtained"),
      React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexWrap:"wrap",gap:10,alignContent:"flex-start",justifyContent:"center"}},
        openResults.map(({treasure:t,isDuplicate,shards},i)=>{
          const rc=TREASURE_RARITIES[t.rarity];
          const visible=i<multiVisible;
          return React.createElement("div",{key:i,style:{
            width:86,display:"flex",flexDirection:"column",alignItems:"center",gap:6,
            opacity:visible?(isDuplicate?0.4:1):0,transform:visible?"scale(1)":"scale(0.7)",
            transition:"opacity 0.25s,transform 0.25s",
          }},
            React.createElement("div",{style:{
              width:72,height:72,borderRadius:14,background:rc.bg,border:"2px solid "+rc.border,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,
            }},t.emoji),
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:rc.color,textTransform:"uppercase",letterSpacing:0.5,textAlign:"center"}},rc.label),
            React.createElement("div",{style:{fontSize:11,color:"#555",textAlign:"center",lineHeight:1.3}},t.name),
            isDuplicate&&React.createElement("div",{style:{fontSize:10,color:"#7c3aed",fontWeight:700}},"+"+shards+" ✨")
          );
        })
      ),
      React.createElement("div",{style:{padding:"12px 24px 28px",textAlign:"center",flexShrink:0}},
        allVisible&&React.createElement("div",{style:{fontSize:13,color:"#aaa",fontWeight:500}},"Click anywhere to close")
      )
    );
  }
  // Open result overlay
  if(openResult){
    const {treasure:t,isDuplicate}=openResult;
    const rc=TREASURE_RARITIES[t.rarity];
    return React.createElement("div",{onClick:()=>setOpenResult(null),style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",zIndex:200,cursor:"pointer",gap:12}},
      React.createElement("div",{style:{fontSize:13,color:"#aaa",letterSpacing:2,textTransform:"uppercase"}},"Obtained"),
      React.createElement("div",{style:{width:140,height:140,borderRadius:24,background:rc.bg,border:"2px solid "+rc.border,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}},
        React.createElement("div",{style:{fontSize:60,lineHeight:1}},t.emoji),
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:rc.color,textTransform:"uppercase",letterSpacing:1}},rc.label)
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700,color:"#111"}},t.name),
      React.createElement("div",{style:{fontSize:13,color:"#888"}},TREASURE_SETS.find(s=>s.id===t.setId)?.name+" Set"),
      isDuplicate&&React.createElement("div",{style:{marginTop:4,padding:"4px 14px",background:"#f5f3ff",borderRadius:20,fontSize:12,color:"#7c3aed",fontWeight:600}},"Duplicate · +"+TREASURE_RARITIES[t.rarity].shards+" ✨ Shards"),
      React.createElement("div",{style:{fontSize:12,color:"#aaa",marginTop:8}},"Tap anywhere to close")
    );
  }
  const REDEEM_ITEMS=[
    {key:"mysteriousOre", label:"Mysterious Ore",        emoji:"🪨", cost:50,  color:"#111",   border:"#e8e8e8", btnBg:"linear-gradient(135deg,#f59e0b,#fbbf24)"},
    {key:"deluxeOre",     label:"Deluxe Mysterious Ore", emoji:"💎", cost:200, color:"#1d4ed8", border:"#93c5fd", btnBg:"linear-gradient(135deg,#2563eb,#60a5fa)"},
    {key:"rainbowOre",    label:"Rainbow Mysterious Ore",emoji:"🌈", cost:500, color:"#be185d", border:"#f9a8d4", btnBg:"linear-gradient(135deg,#ec4899,#a855f7)"},
  ];
  const shards=currencies.treasureShards||0;
  const redeemPopupEl=redeemOpen&&React.createElement("div",{onClick:()=>setRedeemOpen(false),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:22,padding:"24px 20px",width:"100%",maxWidth:340,boxShadow:"0 12px 48px rgba(0,0,0,0.2)"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}},
        React.createElement("div",{style:{fontSize:17,fontWeight:800,color:"#111"}},"Redeem Shards"),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4,background:"#f5f3ff",border:"1.5px solid #ddd6fe",borderRadius:20,padding:"3px 10px"}},
          React.createElement("span",{style:{fontSize:13}},"✨"),
          React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#7c3aed"}},formatNum(shards)),
          React.createElement("span",{style:{fontSize:11,color:"#a78bfa",fontWeight:500}},"Shards")
        )
      ),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        REDEEM_ITEMS.map(item=>{
          const canAfford=shards>=item.cost;
          return React.createElement("div",{key:item.key,style:{display:"flex",alignItems:"center",gap:12,background:"#fafafa",border:"1.5px solid "+item.border,borderRadius:14,padding:"12px 14px"}},
            React.createElement("div",{style:{fontSize:30,lineHeight:1,flexShrink:0}},item.emoji),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:item.color,marginBottom:2}},item.label),
              React.createElement("div",{style:{fontSize:12,color:"#888"}},"✨ "+item.cost+" Shards")
            ),
            React.createElement("button",{
              disabled:!canAfford,
              onClick:()=>{
                if(!canAfford)return;
                setCurrencies(c=>({...c,treasureShards:(c.treasureShards||0)-item.cost,[item.key]:(c[item.key]||0)+1}));
              },
              style:{flexShrink:0,padding:"7px 14px",background:canAfford?item.btnBg:"#e0e0e0",color:canAfford?"#fff":"#aaa",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:canAfford?"pointer":"default"}
            },"Buy")
          );
        })
      ),
      React.createElement("button",{onClick:()=>setRedeemOpen(false),style:{marginTop:18,width:"100%",padding:"11px",background:"#f5f5f5",border:"none",borderRadius:12,fontWeight:700,fontSize:14,color:"#555",cursor:"pointer"}},"Close")
    )
  );
  // Main screen
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#f5f5f5"}},
    treasurePopupEl,
    setCompletePopupEl,
    redeemPopupEl,
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"16px 16px 12px",background:"#fff",borderBottom:"1px solid #e0e0e0",flexShrink:0}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#555",padding:0,lineHeight:1}},
        React.createElement("i",{className:"ti ti-arrow-left"})
      ),
      React.createElement("div",{style:{fontSize:18,fontWeight:700}},"💰 Treasure"),
      React.createElement("button",{onClick:()=>setRedeemOpen(true),style:{marginLeft:"auto",padding:"6px 14px",background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}},"Redeem")
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"16px"}},
      (()=>{
        const ORE_TYPES=[
          {key:"mysteriousOre",  label:"Mysterious Ore",       emoji:"🪨", desc:"All rarities",                   color:"#111",   border:"#e8e8e8", btnBg:"linear-gradient(135deg,#f59e0b,#fbbf24)", btnIcon:"✨", shadow:"rgba(0,0,0,0.06)",   open:openOre,    open10:openOre10,    count:oreCount},
          {key:"deluxeOre",      label:"Deluxe Mysterious Ore",emoji:"💎", desc:"Rare, Epic & Legendary only",    color:"#1d4ed8",border:"#93c5fd", btnBg:"linear-gradient(135deg,#2563eb,#60a5fa)", btnIcon:"💎", shadow:"rgba(37,99,235,0.08)", open:openDeluxe, open10:openDeluxe10, count:deluxeOreCount},
          {key:"rainbowOre",     label:"Rainbow Mysterious Ore",emoji:"🌈",desc:"Guaranteed missing treasure",    color:"#be185d",border:"#f9a8d4", btnBg:"linear-gradient(135deg,#ec4899,#a855f7)", btnIcon:"🌈", shadow:"rgba(236,72,153,0.08)",open:openRainbow,open10:openRainbow10,count:rainbowOreCount},
        ];
        const ore=ORE_TYPES[oreTypeIndex];
        const allRainbowCollected=ore.key==="rainbowOre"&&TREASURES.every(t=>collectedTreasures.has(t.id));
        const canOpen=ore.count>=1&&!allRainbowCollected;
        const canOpen10=ore.count>=10&&!allRainbowCollected;
        const arrowBtn=(label,onClick)=>React.createElement("button",{onClick,style:{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:12,width:44,height:44,cursor:"pointer",fontSize:22,fontWeight:700,color:"#555",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}},label);
        return React.createElement("div",{style:{background:"#fff",borderRadius:16,padding:"12px 8px",marginBottom:20,border:"1.5px solid "+ore.border,boxShadow:"0 1px 4px "+ore.shadow,display:"flex",alignItems:"center",gap:8}},
          arrowBtn("‹",()=>setOreTypeIndex(i=>(i+2)%3)),
          // Center content
          React.createElement("div",{style:{flex:1,textAlign:"center"}},
            React.createElement("div",{style:{position:"relative",display:"inline-block",marginBottom:8}},
              React.createElement("div",{style:{fontSize:72,lineHeight:1}},ore.emoji),
              React.createElement("div",{style:{position:"absolute",bottom:0,right:-6,background:"#333",color:"#fff",fontWeight:800,fontSize:13,minWidth:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px",border:"2px solid #fff"}},formatNum(ore.count))
            ),
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:ore.color,marginBottom:2}},ore.label),
            React.createElement("div",{style:{fontSize:12,color:allRainbowCollected?"#10b981":"#aaa",marginBottom:14}},allRainbowCollected?"✅ All treasures collected!":ore.desc),
            React.createElement("div",{style:{display:"flex",gap:8,justifyContent:"center"}},
              React.createElement("button",{onClick:ore.open,disabled:!canOpen,style:{padding:"9px 22px",background:canOpen?ore.btnBg:"#e0e0e0",color:canOpen?"#fff":"#aaa",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:canOpen?"pointer":"default"}},ore.btnIcon+" Open"),
              React.createElement("button",{onClick:ore.open10,disabled:!canOpen10,style:{padding:"9px 22px",background:canOpen10?ore.btnBg:"#e0e0e0",color:canOpen10?"#fff":"#aaa",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:canOpen10?"pointer":"default"}},ore.btnIcon+" Open 10")
            )
          ),
          arrowBtn("›",()=>setOreTypeIndex(i=>(i+1)%3))
        );
      })(),
      React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#555",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}},"Treasure Sets"),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        TREASURE_SETS.map(set=>{
          const setTreasures=TREASURES.filter(t=>t.setId===set.id);
          const isComplete=completedTreasureSets.has(set.id);
          const isPending=pendingSetRewards.has(set.id);
          const cardBorder=isPending?"#fbbf24":isComplete?"#fbbf24":"#e8e8e8";
          const cardBg=isPending?"#fffbeb":isComplete?"#fffbeb":"#fff";
          return React.createElement("div",{key:set.id,style:{background:cardBg,borderRadius:12,padding:"10px 12px",border:"2px solid "+cardBorder,boxShadow:isPending?"0 0 0 3px rgba(251,191,36,0.3)":"0 1px 4px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:10}},
            React.createElement("div",{style:{flex:1,minWidth:0}},
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#111",marginBottom:5}},set.name),
              React.createElement("div",{style:{display:"flex",gap:4}},
                setTreasures.map(t=>{
                  const have=collectedTreasures.has(t.id);
                  const rc=TREASURE_RARITIES[t.rarity];
                  return React.createElement("div",{key:t.id,onClick:e=>{e.stopPropagation();setTreasurePopup(t);},style:{width:38,height:38,borderRadius:8,background:rc.bg,border:"2px solid "+rc.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",opacity:have?1:0.35}},
                    t.emoji
                  );
                })
              )
            ),
            React.createElement("div",{onClick:e=>e.stopPropagation(),style:{flexShrink:0,width:62,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,minHeight:87,cursor:"default"}},
              isPending
                ?React.createElement(React.Fragment,null,
                  React.createElement("div",{style:{width:54,height:54,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"#fffbeb",border:"2px solid #fbbf24",borderRadius:10}},
                    React.createElement("div",{style:{fontSize:20,lineHeight:1,textAlign:"center",width:"100%"}},set.rewardEmoji),
                    React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#d97706",textAlign:"center",lineHeight:1.2,maxWidth:48}},set.rewardLabel.split(" ")[0])
                  ),
                  React.createElement("button",{onClick:e=>{e.stopPropagation();setSetCompletePopup(set);},style:{width:"100%",padding:"5px 4px",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:10,cursor:"pointer",whiteSpace:"nowrap"}},"🎉 Claim!")
                )
                :isComplete
                ?React.createElement("div",{style:{width:54,height:54,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"#f5f5f5",border:"2px solid #ddd",borderRadius:10,position:"relative",opacity:0.6}},
                  React.createElement("div",{style:{fontSize:20,lineHeight:1,textAlign:"center",width:"100%"}},set.rewardEmoji),
                  React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#888",textAlign:"center",lineHeight:1.2,maxWidth:48}},set.rewardLabel.split(" ")[0]),
                  React.createElement("div",{style:{position:"absolute",top:-6,right:-6,fontSize:13}},"✅")
                )
                :React.createElement("div",{style:{width:54,height:54,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"#f5f3ff",border:"2px solid #ddd6fe",borderRadius:10}},
                  React.createElement("div",{style:{fontSize:20,lineHeight:1,textAlign:"center",width:"100%"}},set.rewardEmoji),
                  React.createElement("div",{style:{fontSize:9,fontWeight:800,color:"#534AB7",textAlign:"center",lineHeight:1.2,maxWidth:48}},set.rewardLabel.split(" ")[0])
                )
            )
          );
        })
      )
    )
  );
}


export default TreasureScreen;
