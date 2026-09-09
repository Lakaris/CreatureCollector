// Flair tab: feed bananas to unlock titles, auras, backgrounds, and items.

import React, { useState, useEffect, useRef } from "../../../react.js";
import { useGame } from "../../../state/GameContext.js";
import { BUFF_STAT_LABEL, FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS, FLAIR_SHARD_VALUES, FLAIR_BANANAS, RARITY_COLORS_FLAIR } from "../../../data/flair.js";
import { rollFlairRarity, feedFlair } from "../../../core/gacha.js";
import { easternNoonDayKey } from "../../../core/dates.js";
import FlairRaritySection from "../../../ui/screens/CreatureDetail/FlairRaritySection.js";
import ScreenHeader from "../../../ui/components/ScreenHeader.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import AscStars, { ascStarTier } from "../../../ui/components/AscStars.js";
import StatStrip from "../../../ui/components/StatStrip.js";
import useFitContent from "../../../ui/hooks/useFitContent.js";
import AutoFitText from "../../../ui/components/AutoFitText.js";
import { STAT_CYCLE } from "../../../data/rarity.js";

/** Category presentation. The short labels are for the reveal grid's cards,
 * which are far too narrow for "Background". */
const CAT_LABEL={titles:"Title",aura:"Aura",background:"Background",item:"Item"};
const CAT_LABEL_SHORT={titles:"Title",aura:"Aura",background:"BG",item:"Item"};
const CAT_EMOJI={titles:"📛",aura:"✨",background:"🖼️",item:"🌿"};

/**
 * The category a result should be LABELLED with.
 *
 * A win is whatever category it was won from. A dupe's consolation item is
 * drawn from every category, so it carries its own `dupeCat` -- using the
 * result's `cat` there labels a Title as a Background about three times in four.
 */
function categoryOf(r){
  return r.won?r.cat:(r.dupeCat||r.cat);
}

function FlairSection({unlockedSkins,def,statsWithEquip,onStatClick,onBack,onBananaUsed,ownedData,flairGuideStep,setFlairGuideStep,hasFlairEffects,onShowFlairEffects}){
  const { setOwned, currencies, setCurrencies, lastFreeBananaDate, setLastFreeBananaDate } = useGame();
  const freeBananaAvailable = lastFreeBananaDate !== easternNoonDayKey();
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
    const useFree=freeBananaAvailable;
    const cost=useFree?times-1:times;
    const count=currencies[banana.id]||0;
    if(count<cost)return;
    if(useFree)setLastFreeBananaDate(easternNoonDayKey());
    if(times===1){
      const result=feedFlair(banana,ownedData,setOwned,setCurrencies,useFree);
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
        // Mirrors feedFlair's dupe branch, `dupeCat` included -- the
        // consolation item comes from any category, so it has to carry the one
        // it actually belongs to rather than the category rolled above.
        if(pool.length===0){
          const shards=FLAIR_SHARD_VALUES[rarity];totalShards+=shards;
          const allItems=Object.entries(pools).flatMap(([category,p])=>(p[rarity]||[]).map(entry=>({category,entry})));
          const picked=allItems[Math.floor(Math.random()*allItems.length)]||null;
          results.push({rarity,cat,won:null,dupeItem:picked?picked.entry:null,dupeCat:picked?picked.category:cat,shards});
          continue;
        }
        const won=pool[Math.floor(Math.random()*pool.length)];
        const key=getKey(usedCat,won);
        unlocked.add(key);newKeys.push(key);
        results.push({rarity,cat:usedCat,won,emoji:usedCat==="titles"?"📛":usedCat==="aura"?"✨":usedCat==="background"?"🖼️":"🌿"});
      }
      setCurrencies(c=>({...c,[banana.id]:Math.max(0,(c[banana.id]||0)-cost),flairShard:(c.flairShard||0)+totalShards}));
      setOwned(prev=>{const e={...prev[ownedData.id]};e.unlockedFlair=[...(e.unlockedFlair||[]),...newKeys];return{...prev,[e.id]:e};});
      onBananaUsed?.(times);
      setVisibleCount(0);
      setFeedResult({type:"multi",results});
    }
  }
  const selCount=currencies[selectedBanana.id]||0;

  // Flash any stat that just went up (a fed flair's buff landing), so the
  // player sees the gain the moment it happens. Clearing the set afterwards
  // is what lets the same stat re-flash on the next unlock -- toggling the
  // animation style off and on restarts it.
  const [statFlash,setStatFlash]=useState(()=>new Set());
  // Keeps the feed result inside its panel at any screen size -- see the
  // result area below.
  const [fitBoxRef,fitContentRef,fitScale]=useFitContent();
  const prevStatsRef=useRef(statsWithEquip);
  useEffect(()=>{
    const prev=prevStatsRef.current;
    prevStatsRef.current=statsWithEquip;
    const changed=STAT_CYCLE.filter(s=>statsWithEquip[s]>prev[s]);
    if(!changed.length)return;
    setStatFlash(new Set(changed));
    const t=setTimeout(()=>setStatFlash(new Set()),1600);
    return()=>clearTimeout(t);
  },[STAT_CYCLE.map(s=>statsWithEquip[s]).join(",")]);
  // overflowY auto + a stable scrollbar gutter keep this overlay's content
  // exactly as wide as the creature page's (which scrolls, so its content
  // sits a scrollbar-width narrower than the viewport) -- without both, the
  // header card and art shift sideways when entering/leaving this page.
  return React.createElement("div",{className:"screen-fade",style:{position:"fixed",inset:0,background:"#f5f5f5",zIndex:10,display:"flex",flexDirection:"column",overflowY:"auto",overflowX:"hidden",scrollbarGutter:"stable"}},
    // Header title carries the equipped flair title, matching the creature
    // page -- and it updates live when a title is equipped on this page.
    //
    // Flair Effects sits here rather than on the creature page, next to the
    // flair it summarises. With nothing unlocked there is nothing to summarise,
    // and the button is replaced by an invisible 26px spacer -- that keeps this
    // header exactly as tall as the creature page's, whose own right-slot
    // button is taller than a bare title line, so the art below does not shift
    // as you move between the two.
    React.createElement(ScreenHeader,{title:def.name+(ownedData.equippedTitle?" the "+ownedData.equippedTitle:""),onBack,edgeToEdge:false,
      right:hasFlairEffects&&onShowFlairEffects
        ? React.createElement("button",{
            onClick:onShowFlairEffects,
            style:{padding:"4px 10px",fontSize:12,fontWeight:600,border:"1px solid #534AB7",borderRadius:8,background:"#f0effe",color:"#534AB7",cursor:"pointer",whiteSpace:"nowrap"}
          },"✨ Flair Effects")
        : React.createElement("div",{style:{width:1,height:26}})}),
    // Header card mirrors the creature page's exactly: one white card
    // wrapping both the transparent 130px art (same position -- 12px gap
    // below the header + 12px card padding on both pages) and the stat row,
    // with no name text (the name is in the ScreenHeader). Keep in sync with
    // CreatureDetail/index.js. Stats come from index.js's statsWithEquip so
    // flair buffs land here live.
    React.createElement("div",{className:"card",style:{margin:"0 16px 12px",flexShrink:0}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:14}},
        // This page has no level readout to sit under, so the banded stars
        // stay above the art where the old gold count was.
        (()=>{
          const asc=ascStarTier(ownedData.ascensions);
          if(!asc.count)return null;
          return React.createElement("div",{style:{marginBottom:4}},
            React.createElement(AscStars,{n:asc.count,max:5,doubled:asc.doubled,colors:asc.colors,slotted:true,style:{fontSize:11,gap:1,...asc.style}}));
        })(),
        React.createElement(CreatureIcon,{def,ownedData,unlockedSkins,size:130,style:{margin:"0 auto"}})
      ),
      // Same click behavior as the creature page's stat pills: opens the
      // stat-info popup (base/equipment/flair breakdown).
      React.createElement(StatStrip,{values:statsWithEquip,onClick:onStatClick,isHighlighted:s=>statFlash.has(s)})
    ),
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:12,padding:"0 16px",flexShrink:0}},
      flairTabs.map(t=>React.createElement("button",{key:t.id,
        onClick:()=>setFlairTab(t.id),
        // minWidth:0 so all five tabs are exactly even. A flex item defaults to
        // refusing to shrink below its own text, which had "Background" holding
        // 64px while its neighbours gave up width to 62 -- and it makes the
        // width AutoFitText measures against depend on the size AutoFitText
        // picked, which is a loop. Even columns make it a plain one-way fit.
        style:{flex:1,minWidth:0,padding:"9px 0",fontWeight:600,border:"none",borderRadius:10,cursor:"pointer",
          background:flairTab===t.id?"#534AB7":"#e8e8e8",
          color:flairTab===t.id?"#fff":"#666"}
      },React.createElement(AutoFitText,{size:11},t.label)))
    ),
    React.createElement("div",{style:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}},
      flairTab==="feed"&&React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",padding:"0 16px 16px",position:"relative"}},
        // Result area. Whatever a feed turns up has to fit here -- this panel
        // is the one thing on a fixed-height page that changes size, and a
        // player mid-reveal should not have to scroll to see what they won.
        // So it never scrolls: the content is laid out at its natural size and
        // scaled down to fit (useFitContent), which also means it stays whole
        // on a short screen instead of the page growing a scrollbar.
        // The padding is the gap the fitted content keeps from the panel's
        // edges -- without it a single result's Equip button sits flush
        // against the banana selector below. useFitContent subtracts it from
        // the budget, so the content shrinks to leave the gap rather than
        // spilling into it. Symmetric because the content is centred in this
        // box: uneven padding would still produce even gaps, just a smaller
        // result, so it would only mislead.
        React.createElement("div",{ref:fitBoxRef,style:{flex:1,minHeight:0,overflow:"hidden",position:"relative",padding:"8px 0"}},
          React.createElement("div",{ref:fitContentRef,style:{
            position:"absolute",top:"50%",left:"50%",width:"100%",
            transform:"translate(-50%,-50%) scale("+fitScale+")",
            display:"flex",alignItems:"center",justifyContent:"center",
          }},
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
                    : (()=>{
                        // A duplicate still shows WHAT was pulled, in the same
                        // shape as a win -- just grey instead of rarity-coloured,
                        // with the shard payout where "Unlocked!" and the Equip
                        // button would be. Saying only "all of them are already
                        // unlocked" told the player the one thing they could
                        // already infer and hid the one thing they couldn't.
                        const r0=feedResult.results[0];
                        const cat=categoryOf(r0);
                        const item=r0.dupeItem;
                        return React.createElement("div",{style:{textAlign:"center"}},
                          React.createElement("div",{style:{fontSize:56,lineHeight:1,marginBottom:8,opacity:0.75}},(item&&item.emoji)||CAT_EMOJI[cat]),
                          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}},
                            r0.rarity+" · "+CAT_LABEL[cat]
                          ),
                          React.createElement("div",{style:{fontSize:17,fontWeight:700,color:"#6f6f6f",marginBottom:2}},(item&&item.name)||"Duplicate"),
                          React.createElement("div",{style:{fontSize:12,color:"#8a8a8a",fontWeight:600,marginBottom:10}},"Already unlocked"),
                          React.createElement("div",{style:{fontSize:13,color:"#7986cb",fontWeight:700}},"+"+r0.shards+" 🔷 Flair Shards")
                        );
                      })()
                  )
                : React.createElement("div",{style:{width:"100%"}},
                    (()=>{
                      // Card layout: category tucked in the top-left corner,
                      // artwork centred in the space that leaves, then name and
                      // effect along the bottom.
                      //
                      // The category sits OUT of the flow, so it costs no
                      // height, and name and effect are each held to one line by
                      // AutoFitText rather than being allowed to wrap. Both
                      // matter more than they look: the grid is scaled down to
                      // fit its panel, so height spent here comes straight off
                      // the size everything renders at. Single-lining the name
                      // instead of reserving two lines for it is what pays for
                      // the bigger type -- name 10 -> 12 and effect 8 -> 10 --
                      // while the card still gets SHORTER.
                      //
                      // Every card keeps identical dimensions whatever its
                      // contents, which is what stops the icons changing size
                      // as the second row turns over.
                      function renderCard(r,i){
                        const visible=i<visibleCount;
                        const item=r.won||r.dupeItem;
                        const cat=categoryOf(r);
                        const catLabel=CAT_LABEL_SHORT[cat];
                        const catEmoji=CAT_EMOJI[cat];
                        // A dupe's name and category are grey rather than
                        // rarity-coloured, but a readable grey: #bbb was chosen
                        // back when the card also faded to 30% opacity, and the
                        // two together made the text disappear.
                        const tint=r.won?RARITY_COLORS_FLAIR[r.rarity]:"#6f6f6f";
                        return React.createElement("div",{key:i,style:{
                          position:"relative",
                          textAlign:"center",borderRadius:10,padding:"14px 5px 6px",
                          background:visible?(r.won?(RARITY_COLORS_FLAIR[r.rarity]+"18"):"#f0f0f0"):"transparent",
                          border:visible?"1px solid "+(r.won?RARITY_COLORS_FLAIR[r.rarity]+"55":"#e0e0e0"):"1px solid transparent",
                          opacity:visible?undefined:0,
                          animation:visible?(r.won?"fadeIn .3s ease-out forwards":"dupeFade 1.4s ease-out forwards"):undefined,
                          display:"flex",flexDirection:"column",alignItems:"stretch",gap:2,
                          minHeight:64,
                        }},
                          // Top-left corner. Absolute so it does not push the
                          // artwork down; the card's top padding keeps clear of it.
                          React.createElement("div",{style:{position:"absolute",top:4,left:6,fontSize:8,fontWeight:700,lineHeight:1,letterSpacing:"0.04em",textTransform:"uppercase",color:tint,opacity:0.85}},catLabel),
                          // Artwork, centred in whatever height is left over --
                          // this is the slot a real icon drops into later.
                          React.createElement("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,lineHeight:1,minHeight:30}},
                            item?(item.emoji||catEmoji):"—"
                          ),
                          React.createElement(AutoFitText,{size:12,minSize:6,style:{fontWeight:700,color:tint,lineHeight:1.2}},
                            r.won?r.won.name:(r.dupeItem?r.dupeItem.name:"Dupe")
                          ),
                          React.createElement(AutoFitText,{size:10,minSize:6,style:{fontWeight:600,lineHeight:1.2,color:r.won?"#555":"#7986cb"}},
                            r.won?(r.won.buff?"+"+r.won.buff.pct+"% "+BUFF_STAT_LABEL[r.won.buff.stat]:"")
                                 :("+"+r.shards+" 🔷")
                          )
                        );
                      }
                      // 4 across, so a multi-feed's 8 results land in two rows.
                      // Three rows of three needed ~266px of natural height in
                      // a ~162px panel, which meant the whole grid rendered at
                      // 60% and the labels came out too small to read.
                      //
                      // minmax(0,1fr), NOT 1fr: a bare `1fr` is `minmax(auto,
                      // 1fr)`, so each column is floored at its own content's
                      // min-content width -- and the labels inside are
                      // single-line (AutoFitText), which makes that the full
                      // text width. The columns came out uneven and 386px wide
                      // inside a 343px box, pushing the fourth off the screen.
                      // A 0 minimum lets the columns stay equal and lets the
                      // labels do the giving way, which is their job.
                      return React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:6}},
                        feedResult.results.map((r,i)=>renderCard(r,i))
                      );
                    })()
                  )
              )
            : React.createElement("div",{style:{textAlign:"center",color:"#ccc"}},
                React.createElement("div",{style:{fontSize:32,marginBottom:8}},"🍌"),
                React.createElement("div",{style:{fontSize:13,fontWeight:600}},"Select a banana and feed!")
              )
          )
        ),
        // Skip button — fixed above rightmost banana, only during 9-pull reveal
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
            // The multi-feed is 8, not 9, so the reveal grid is 4x2 rather
            // than 3x3 -- two rows fit the result panel far better than three
            // (see the grid below). The free daily banana covers one of them.
            const need1=freeBananaAvailable?0:1;
            const need8=freeBananaAvailable?7:8;
            const dis1=selCount<need1||revealing;
            const dis8=selCount<need8||revealing;
            const showFeedGuideArrow=flairGuideStep==="feed";
            return React.createElement(React.Fragment,null,
              React.createElement("button",{
                "data-guide-target":"feed",
                onClick:()=>{doFeed(1);if(flairGuideStep==="feed")setFlairGuideStep(null);},
                disabled:dis1,
                style:{
                flex:1,padding:"12px 0",fontSize:14,fontWeight:700,border:"none",borderRadius:10,cursor:dis1?"default":"pointer",
                position:"relative",
                background:dis1?"#e0e0e0":selectedBanana.color,color:dis1?"#aaa":"#fff"}
              },
                showFeedGuideArrow&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-30,transform:"translate(-50%,0)",fontSize:22,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️"),
                freeBananaAvailable?"Feed ×1 (Free!)":"Feed ×1"
              ),
              React.createElement("button",{onClick:()=>doFeed(8),disabled:dis8,style:{
                flex:1,padding:"12px 0",fontSize:14,fontWeight:700,border:"none",borderRadius:10,cursor:dis8?"default":"pointer",
                background:dis8?"#e0e0e0":selectedBanana.color,color:dis8?"#aaa":"#fff"}
              },"Feed ×8")
            );
          })()
        )
      ),
      (flairTab==="titles"||flairTab==="aura"||flairTab==="background"||flairTab==="item")&&React.createElement(FlairRaritySection,{flairTab,ownedData,setOwned,currencies,setCurrencies})
    ),
  );
}


export default FlairSection;
