// One rarity bucket within the flair tab.

import React, { useState } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { FLAIR_RARITIES, BUFF_STAT_LABEL, FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS, FLAIR_SHARD_COSTS, RARITY_COLORS_FLAIR } from "../../../data/flair.js";
import { formatNum } from "../../../core/format.js";

function FlairRaritySection({flairTab,ownedData}){
  const { setOwned, currencies, setCurrencies } = useGame();
  const [rarity,setRarity]=useState("common");
  const [purchaseModal,setPurchaseModal]=useState(null); // {emoji,name,rarity,key,equipKey?}
  const equippedTitle=ownedData.equippedTitle;
  function toggleTitle(title){
    setOwned(prev=>{
      const e={...prev[ownedData.id]};
      e.equippedTitle=e.equippedTitle===title.name?null:title.name;
      return{...prev,[e.id]:e};
    });
  }
  function openPurchase(item){setPurchaseModal(item);}
  function confirmPurchase(){
    const cost=FLAIR_SHARD_COSTS[purchaseModal.rarity];
    if((currencies.flairShard||0)<cost)return;
    setCurrencies(c=>({...c,flairShard:(c.flairShard||0)-cost}));
    setOwned(prev=>{const e={...prev[ownedData.id]};e.unlockedFlair=[...(e.unlockedFlair||[]),purchaseModal.key];return{...prev,[e.id]:e};});
    setPurchaseModal(null);
  }
  return React.createElement("div",{style:{display:"flex",flex:1,overflow:"hidden"}},
    React.createElement("div",{style:{display:"flex",flexDirection:"column",width:80,borderRight:"1px solid #e0e0e0",background:"#fff",flexShrink:0}},
      FLAIR_RARITIES.map(r=>React.createElement("button",{key:r.id,
        onClick:()=>setRarity(r.id),
        style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          flex:1,border:"none",borderTop:"1px solid #e0e0e0",borderRight:rarity===r.id?"3px solid #534AB7":"3px solid transparent",
          background:rarity===r.id?"#f0effe":"none",
          color:rarity===r.id?"#534AB7":"#555",
          fontSize:11,fontWeight:rarity===r.id?700:400,cursor:"pointer",transition:"background 0.15s"}
      },r.label))
    ),
    React.createElement("div",{style:{flex:1,padding:"12px",overflowY:"auto"}},
      flairTab==="titles"&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}},
        (()=>{const statOrder=["hp","atk","def","spd","abilitySpeed"];const groups=statOrder.map(s=>(FLAIR_TITLES[rarity]||[]).filter(t=>t.buff.stat===s));const out=[];const max=Math.max(...groups.map(g=>g.length));for(let i=0;i<max;i++)groups.forEach(g=>{if(g[i])out.push(g[i]);});return out;})().map(title=>{
          const unlocked=(ownedData.unlockedFlair||[]).includes(title.name);
          const isEquipped=equippedTitle===title.name;
          const buffLabel="+"+title.buff.pct+"% "+BUFF_STAT_LABEL[title.buff.stat];
          return React.createElement("div",{key:title.name,onClick:unlocked?()=>toggleTitle(title):()=>openPurchase({emoji:"📛",name:title.name,rarity,key:title.name,buff:title.buff}),style:{cursor:"pointer",
            fontSize:11,fontWeight:isEquipped?700:500,padding:"6px 4px",borderRadius:6,cursor:unlocked?"pointer":"default",
            textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            position:"relative",gap:3,minHeight:62,wordBreak:"break-word",lineHeight:1.3,
            background:!unlocked?"#f0f0f0":isEquipped?(rarity==="legendary"?"#ffe082":rarity==="epic"?"#ce93d8":rarity==="rare"?"#7986cb":"#534AB7")
              :(rarity==="legendary"?"#fff8e1":rarity==="epic"?"#f3e5f5":rarity==="rare"?"#e8eaf6":"#f5f5f5"),
            color:!unlocked?"#bbb":isEquipped?"#fff":(rarity==="legendary"?"#e65100":rarity==="epic"?"#6a1b9a":rarity==="rare"?"#283593":"#444"),
            border:"2px solid "+(!unlocked?"#e0e0e0":isEquipped?"#534AB7":rarity==="legendary"?"#ffcc02":rarity==="epic"?"#ce93d8":rarity==="rare"?"#9fa8da":"#e0e0e0"),
          }},
            !unlocked&&React.createElement("span",{style:{position:"absolute",top:3,right:4,fontSize:10,opacity:0.5}},"🔒"),
            React.createElement("span",null,title.name),
            React.createElement("span",{style:{fontSize:9,opacity:unlocked?(isEquipped?0.9:0.6):0.5,fontWeight:700}},buffLabel)
          );
        })
      ),
      (flairTab==="aura"||flairTab==="background"||flairTab==="item")&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}},
        (()=>{const statOrder=["hp","atk","def","spd","abilitySpeed"];const src=(flairTab==="aura"?FLAIR_AURAS:flairTab==="background"?FLAIR_BACKGROUNDS:FLAIR_ITEMS)[rarity]||[];const groups=statOrder.map(s=>src.filter(e=>e.buff&&e.buff.stat===s));const out=[];const max=Math.max(...groups.map(g=>g.length));for(let i=0;i<max;i++)groups.forEach(g=>{if(g[i])out.push(g[i]);});return out;})().map(entry=>{
          const equipKey=flairTab==="aura"?"equippedAura":flairTab==="background"?"equippedBackground":"equippedItem";
          const unlocked=(ownedData.unlockedFlair||[]).includes(entry.id);
          const isEquipped=ownedData[equipKey]===entry.id;
          const buffLabel=entry.buff?"+"+entry.buff.pct+"% "+BUFF_STAT_LABEL[entry.buff.stat]:"";
          return React.createElement("div",{key:entry.id,onClick:unlocked?()=>setOwned(prev=>{
            const e={...prev[ownedData.id]};
            e[equipKey]=e[equipKey]===entry.id?null:entry.id;
            return{...prev,[e.id]:e};
          }):()=>openPurchase({emoji:entry.emoji,name:entry.name,rarity,key:entry.id,buff:entry.buff}),style:{
            fontSize:11,fontWeight:isEquipped?700:500,padding:"6px 4px",borderRadius:6,cursor:"pointer",
            textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            position:"relative",gap:3,minHeight:62,wordBreak:"break-word",lineHeight:1.3,
            background:!unlocked?"#f0f0f0":isEquipped?(rarity==="legendary"?"#ffe082":rarity==="epic"?"#ce93d8":rarity==="rare"?"#7986cb":"#534AB7")
              :(rarity==="legendary"?"#fff8e1":rarity==="epic"?"#f3e5f5":rarity==="rare"?"#e8eaf6":"#f5f5f5"),
            color:!unlocked?"#bbb":isEquipped?"#fff":(rarity==="legendary"?"#e65100":rarity==="epic"?"#6a1b9a":rarity==="rare"?"#283593":"#444"),
            border:"2px solid "+(!unlocked?"#e0e0e0":isEquipped?"#534AB7":rarity==="legendary"?"#ffcc02":rarity==="epic"?"#ce93d8":rarity==="rare"?"#9fa8da":"#e0e0e0"),
          }},
            !unlocked&&React.createElement("span",{style:{position:"absolute",top:3,right:4,fontSize:10,opacity:0.5}},"🔒"),
            React.createElement("span",{style:{fontSize:18,lineHeight:1}},entry.emoji),
            React.createElement("span",null,entry.name),
            React.createElement("span",{style:{fontSize:9,opacity:unlocked?(isEquipped?0.9:0.6):0.5,fontWeight:700}},buffLabel)
          );
        })
      )
    ),
    purchaseModal&&React.createElement("div",{onClick:()=>setPurchaseModal(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
      React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,boxShadow:"0 8px 40px rgba(0,0,0,0.2)",textAlign:"center"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:8}},purchaseModal.emoji||"📛"),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:4,color:"#222"}},purchaseModal.name),
        React.createElement("div",{style:{fontSize:11,fontWeight:600,color:RARITY_COLORS_FLAIR[purchaseModal.rarity],textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}},purchaseModal.rarity),
        purchaseModal.buff&&React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#555",marginBottom:16}},"+"+purchaseModal.buff.pct+"% "+BUFF_STAT_LABEL[purchaseModal.buff.stat]),
        React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:15,fontWeight:700,color:"#534AB7",marginBottom:20}},
          React.createElement("span",null,"🔷 "+formatNum(FLAIR_SHARD_COSTS[purchaseModal.rarity])+" Flair Shards")
        ),
        React.createElement("div",{style:{fontSize:11,color:(currencies.flairShard||0)>=FLAIR_SHARD_COSTS[purchaseModal.rarity]?"#1b5e20":"#c62828",marginBottom:16,fontWeight:600}},
          "You have "+formatNum(currencies.flairShard||0)+" 🔷"
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement("button",{onClick:()=>setPurchaseModal(null),style:{flex:1,padding:"10px 0",border:"1px solid #e0e0e0",borderRadius:8,background:"#f5f5f5",fontWeight:600,fontSize:13,cursor:"pointer",color:"#555"}},"Cancel"),
          React.createElement("button",{onClick:confirmPurchase,disabled:(currencies.flairShard||0)<FLAIR_SHARD_COSTS[purchaseModal.rarity],style:{flex:1,padding:"10px 0",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:(currencies.flairShard||0)>=FLAIR_SHARD_COSTS[purchaseModal.rarity]?"pointer":"default",background:(currencies.flairShard||0)>=FLAIR_SHARD_COSTS[purchaseModal.rarity]?"#534AB7":"#e0e0e0",color:(currencies.flairShard||0)>=FLAIR_SHARD_COSTS[purchaseModal.rarity]?"#fff":"#aaa"}},"Purchase")
        )
      )
    )
  );
}


export default FlairRaritySection;
