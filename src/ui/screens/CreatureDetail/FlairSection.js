// Flair tab: feed bananas to unlock titles, auras, backgrounds, and items.

import React, { useState, useEffect } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { BUFF_STAT_LABEL, FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS, FLAIR_SHARD_VALUES, FLAIR_BANANAS, RARITY_COLORS_FLAIR } from "../../../data/flair.js";
import { rollFlairRarity, feedFlair } from "../../../core/gacha.js";
import FlairRaritySection from "../../../ui/screens/CreatureDetail/FlairRaritySection.js";
import ScreenHeader from "../../../ui/components/ScreenHeader.js";

function FlairSection({displayEmoji,def,onBack,onBananaUsed,ownedData}){
  const { setOwned, currencies, setCurrencies } = useGame();
  const [flairTab,setFlairTab]=useState("feed");
  const [feedResult,setFeedResult]=useState(null);
  const [selectedBanana,setSelectedBanana]=useState(FLAIR_BANANAS[0]);
  const [bananaInfo,setBananaInfo]=useState(null);
  const [visibleCount,setVisibleCount]=useState(0);
  useEffect(()=>{
    if(!feedResult||feedResult.type!=="multi"||visibleCount>=feedResult.results.length)return;
    const t=setTimeout(()=>setVisibleCount(v=>v+1),500);
    return()=>clearTimeout(t);
  },[feedResult,visibleCount]);
  const flairTabs=[{id:"feed",label:"Feed"},{id:"titles",label:"Titles"},{id:"aura",label:"Aura"},{id:"background",label:"Background"},{id:"item",label:"Item"}];
  function doFeed(times){
    const banana=selectedBanana;
    const count=currencies[banana.id]||0;
    if(count<times)return;
    if(times===1){
      const result=feedFlair(banana,ownedData,setOwned,setCurrencies);
      setFeedResult({type:"single",results:[result]});
      onBananaUsed?.(1);
    } else {
      const results=[];
      let totalShards=0;
      // feedFlair mutates currencies via setCurrencies each call — batch instead
      const unlocked=new Set(ownedData.unlockedFlair||[]);
      const categories=["titles","aura","background","item"];
      const pools={titles:FLAIR_TITLES,aura:FLAIR_AURAS,background:FLAIR_BACKGROUNDS,item:FLAIR_ITEMS};
      const getKey=(cat,entry)=>cat==="titles"?entry.name:entry.id;
      const newKeys=[];
      for(let i=0;i<times;i++){
        const rarity=rollFlairRarity(banana.weights);
        const cat=categories[Math.floor(Math.random()*4)];
        let pool=(pools[cat][rarity]||[]).filter(e=>!unlocked.has(getKey(cat,e)));
        let usedCat=cat;
        if(pool.length===0){
          for(const ac of categories.filter(c=>c!==cat).sort(()=>Math.random()-0.5)){
            const ap=(pools[ac][rarity]||[]).filter(e=>!unlocked.has(getKey(ac,e)));
            if(ap.length>0){pool=ap;usedCat=ac;break;}
          }
        }
        if(pool.length===0){const shards=FLAIR_SHARD_VALUES[rarity];totalShards+=shards;const allItems=Object.values(pools).flatMap(p=>p[rarity]||[]);const dupeItem=allItems[Math.floor(Math.random()*allItems.length)]||null;results.push({rarity,cat,won:null,dupeItem,shards});continue;}
        const won=pool[Math.floor(Math.random()*pool.length)];
        const key=getKey(usedCat,won);
        unlocked.add(key);newKeys.push(key);
        results.push({rarity,cat:usedCat,won,emoji:usedCat==="titles"?"📛":usedCat==="aura"?"✨":usedCat==="background"?"🖼️":"🌿"});
      }
      setCurrencies(c=>({...c,[banana.id]:Math.max(0,(c[banana.id]||0)-times),flairShard:(c.flairShard||0)+totalShards}));
      setOwned(prev=>{const e={...prev[ownedData.id]};e.unlockedFlair=[...(e.unlockedFlair||[]),...newKeys];return{...prev,[e.id]:e};});
      onBananaUsed?.(times);
      setVisibleCount(0);
      setFeedResult({type:"multi",results});
    }
  }
  const selCount=currencies[selectedBanana.id]||0;
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"#f5f5f5",zIndex:10,display:"flex",flexDirection:"column",overflow:"hidden"}},
    React.createElement(ScreenHeader,{title:def.name,onBack,edgeToEdge:false}),
    React.createElement("div",{style:{textAlign:"center",padding:"12px 0 12px",flexShrink:0,position:"relative"}},
      React.createElement("span",{style:{fontSize:64,lineHeight:1,display:"block",marginBottom:6}},displayEmoji),
      React.createElement("div",{style:{fontSize:18,fontWeight:600,color:"#000"}},def.name+(ownedData.equippedTitle?" the "+ownedData.equippedTitle:"")),
    ),
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:12,padding:"0 16px",flexShrink:0}},
      flairTabs.map(t=>React.createElement("button",{key:t.id,
        onClick:()=>setFlairTab(t.id),
        style:{flex:1,padding:"9px 0",fontSize:11,fontWeight:600,border:"none",borderRadius:10,cursor:"pointer",
          background:flairTab===t.id?"#534AB7":"#e8e8e8",
          color:flairTab===t.id?"#fff":"#666"}
      },t.label))
    ),
    React.createElement("div",{style:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}},
      flairTab==="feed"&&React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",padding:"0 16px 16px",position:"relative"}},
        // Result area
        React.createElement("div",{style:{flex:1,display:"flex",alignItems:(feedResult&&feedResult.type==="multi")?"flex-start":"center",justifyContent:"center",paddingTop:(feedResult&&feedResult.type==="multi")?4:0}},
          feedResult
            ? (feedResult.type==="single"&&feedResult.results[0]
                ? (feedResult.results[0].won
                    ? (()=>{
                        const r0=feedResult.results[0];
                        const equipKey=r0.cat==="titles"?"equippedTitle":r0.cat==="aura"?"equippedAura":r0.cat==="background"?"equippedBackground":"equippedItem";
                        const itemKey=r0.cat==="titles"?r0.won.name:r0.won.id;
                        const isEquipped=ownedData[equipKey]===itemKey;
                        function toggleEquip(){
                          setOwned(prev=>{
                            const e={...prev[ownedData.id]};
                            e[equipKey]=e[equipKey]===itemKey?null:itemKey;
                            return{...prev,[e.id]:e};
                          });
                        }
                        return React.createElement("div",{style:{textAlign:"center"}},
                          React.createElement("div",{style:{fontSize:56,lineHeight:1,marginBottom:8}},r0.won.emoji||r0.emoji),
                          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:RARITY_COLORS_FLAIR[r0.rarity],textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}},
                            r0.rarity+" · "+(r0.cat==="titles"?"Title":r0.cat==="aura"?"Aura":r0.cat==="background"?"Background":"Item")
                          ),
                          React.createElement("div",{style:{fontSize:17,fontWeight:700,color:"#222",marginBottom:2}},r0.won.name),
                          React.createElement("div",{style:{fontSize:12,color:"#1b5e20",fontWeight:600,marginBottom:14}},"Unlocked!"),
                          React.createElement("button",{onClick:toggleEquip,style:{
                            padding:"9px 24px",fontSize:13,fontWeight:700,border:"none",borderRadius:10,cursor:"pointer",
                            background:isEquipped?"#e8e8e8":"#534AB7",color:isEquipped?"#555":"#fff"
                          }},isEquipped?"Unequip":"Equip")
                        );
                      })()
                    : React.createElement("div",{style:{textAlign:"center"}},
                        React.createElement("div",{style:{fontSize:32,marginBottom:8}},"😔"),
                        React.createElement("div",{style:{fontSize:13,color:"#888"}},"All "+feedResult.results[0].rarity+" flairs already unlocked!"),
                        React.createElement("div",{style:{fontSize:12,color:"#7986cb",fontWeight:700,marginTop:6}},"+"+feedResult.results[0].shards+" 🔷 Flair Shards")
                      )
                  )
                : React.createElement("div",{style:{width:"100%"}},
                    (()=>{
                      function renderCard(r,i){
                        const visible=i<visibleCount;
                        return React.createElement("div",{key:i,style:{
                          textAlign:"center",borderRadius:10,padding:"8px 6px",
                          background:visible?(r.won?(RARITY_COLORS_FLAIR[r.rarity]+"18"):"#f0f0f0"):"transparent",
                          border:visible?"1px solid "+(r.won?RARITY_COLORS_FLAIR[r.rarity]+"55":"#e0e0e0"):"1px solid transparent",
                          opacity:visible?undefined:0,
                          animation:visible?(r.won?"fadeIn .3s ease-out forwards":"dupeFade 1.4s ease-out forwards"):undefined,
                          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
                          minHeight:90,
                        }},
                          visible&&React.createElement("div",{style:{fontSize:36,lineHeight:1,marginBottom:3}},(()=>{const item=r.won||r.dupeItem;const catEmoji=r.cat==="titles"?"📛":r.cat==="aura"?"✨":r.cat==="background"?"🖼️":"🌿";return item?(item.emoji||catEmoji):"—";})()),
                          visible&&React.createElement("div",{style:{fontSize:10,fontWeight:700,color:r.won?RARITY_COLORS_FLAIR[r.rarity]:"#bbb",lineHeight:1.3,wordBreak:"break-word"}},
                            r.won?r.won.name:(r.dupeItem?r.dupeItem.name:"Dupe")
                          ),
                          visible&&r.won&&React.createElement("div",{style:{fontSize:9,color:RARITY_COLORS_FLAIR[r.rarity],opacity:0.8,fontWeight:600}},
                            r.cat==="titles"?"Title":r.cat==="aura"?"Aura":r.cat==="background"?"BG":"Item"
                          ),
                          visible&&r.won&&r.won.buff&&React.createElement("div",{style:{fontSize:8,color:"#555",fontWeight:600,marginTop:1}},
                            "+"+r.won.buff.pct+"% "+BUFF_STAT_LABEL[r.won.buff.stat]
                          ),
                          visible&&!r.won&&React.createElement("div",{style:{fontSize:8,color:"#7986cb",fontWeight:700,marginTop:1}},"+"+r.shards+" 🔷")
                        );
                      }
                      return React.createElement(React.Fragment,null,
                        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:6}},
                          feedResult.results.slice(0,9).map((r,i)=>renderCard(r,i))
                        ),
                        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}},
                          React.createElement("div",null),
                          renderCard(feedResult.results[9],9),
                          React.createElement("div",null)
                        )
                      );
                    })()
                  )
              )
            : React.createElement("div",{style:{textAlign:"center",color:"#ccc"}},
                React.createElement("div",{style:{fontSize:32,marginBottom:8}},"🍌"),
                React.createElement("div",{style:{fontSize:13,fontWeight:600}},"Select a banana and feed!")
              )
        ),
        // Skip button — fixed above rightmost banana, only during 10-pull reveal
        feedResult&&feedResult.type==="multi"&&visibleCount<feedResult.results.length&&React.createElement("button",{
          onClick:()=>setVisibleCount(feedResult.results.length),
          style:{position:"absolute",bottom:158,right:16,fontSize:13,fontWeight:600,padding:"7px 18px",border:"1px solid #ccc",borderRadius:20,background:"#fff",cursor:"pointer",color:"#666",zIndex:5}
        },"Skip"),
        // Banana info modal
        bananaInfo&&React.createElement("div",{onClick:()=>setBananaInfo(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
          React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
            React.createElement("div",{style:{fontSize:32,textAlign:"center",marginBottom:6}},bananaInfo.emoji),
            React.createElement("div",{style:{fontSize:15,fontWeight:700,textAlign:"center",marginBottom:4}},bananaInfo.name),
            React.createElement("div",{style:{fontSize:11,color:"#888",textAlign:"center",marginBottom:14}},"¼ chance for each category: Title, Aura, Background, Item"),
            React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
              Object.entries(bananaInfo.weights).filter(([,w])=>w>0).map(([rarity,w])=>
                React.createElement("div",{key:rarity,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:8,
                  background:rarity==="legendary"?"#fff8e1":rarity==="epic"?"#f3e5f5":rarity==="rare"?"#e8eaf6":"#f5f5f5",
                  border:"1px solid "+(rarity==="legendary"?"#ffcc02":rarity==="epic"?"#ce93d8":rarity==="rare"?"#9fa8da":"#e0e0e0")}},
                  React.createElement("span",{style:{fontSize:12,fontWeight:600,color:RARITY_COLORS_FLAIR[rarity]}},rarity.charAt(0).toUpperCase()+rarity.slice(1)),
                  React.createElement("span",{style:{fontSize:13,fontWeight:700,color:RARITY_COLORS_FLAIR[rarity]}},w+"%")
                )
              )
            ),
            React.createElement("button",{onClick:()=>setBananaInfo(null),style:{marginTop:16,width:"100%",padding:"10px 0",background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}},"Close")
          )
        ),
        // Banana selector
        React.createElement("div",{style:{display:"flex",gap:8,marginBottom:10}},
          FLAIR_BANANAS.map(banana=>{
            const cnt=currencies[banana.id]||0;
            const isSel=selectedBanana.id===banana.id;
            return React.createElement("div",{key:banana.id,onClick:()=>setSelectedBanana(banana),style:{
              flex:1,background:isSel?banana.bg:"#fff",border:"2px solid "+(isSel?banana.color:"#e0e0e0"),
              borderRadius:12,padding:"10px 6px",textAlign:"center",cursor:"pointer",position:"relative",
            }},
              React.createElement("button",{onClick:e=>{e.stopPropagation();setBananaInfo(banana);},style:{
                position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",border:"none",
                background:"rgba(0,0,0,0.12)",color:"#555",fontSize:9,fontWeight:700,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0
              }},"ⓘ"),
              React.createElement("div",{style:{fontSize:24,marginBottom:4}},banana.emoji),
              React.createElement("div",{style:{fontSize:9,fontWeight:700,color:isSel?banana.color:"#555",lineHeight:1.3,marginBottom:3}},banana.name),
              React.createElement("div",{style:{fontSize:11,fontWeight:700,color:cnt>0?"#222":"#bbb"}},"×"+cnt)
            );
          })
        ),
        // Feed buttons
        React.createElement("div",{style:{display:"flex",gap:8}},
          (()=>{
            const revealing=feedResult&&feedResult.type==="multi"&&visibleCount<feedResult.results.length;
            const dis1=selCount<1||revealing;
            const dis10=selCount<10||revealing;
            return React.createElement(React.Fragment,null,
              React.createElement("button",{onClick:()=>doFeed(1),disabled:dis1,style:{
                flex:1,padding:"12px 0",fontSize:14,fontWeight:700,border:"none",borderRadius:10,cursor:dis1?"default":"pointer",
                background:dis1?"#e0e0e0":selectedBanana.color,color:dis1?"#aaa":"#fff"}
              },"Feed ×1"),
              React.createElement("button",{onClick:()=>doFeed(10),disabled:dis10,style:{
                flex:1,padding:"12px 0",fontSize:14,fontWeight:700,border:"none",borderRadius:10,cursor:dis10?"default":"pointer",
                background:dis10?"#e0e0e0":selectedBanana.color,color:dis10?"#aaa":"#fff"}
              },"Feed ×10")
            );
          })()
        )
      ),
      (flairTab==="titles"||flairTab==="aura"||flairTab==="background"||flairTab==="item")&&React.createElement(FlairRaritySection,{flairTab,ownedData,setOwned,currencies,setCurrencies})
    ),
  );
}


export default FlairSection;
