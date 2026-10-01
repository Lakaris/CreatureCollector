// Flair tab: feed bananas to unlock titles, auras, backgrounds, and items.

import React, { useState, useEffect } from "../../../react.js";
import { iconText } from "../../components/IconText.js";
import { useGame } from "../../../state/GameContext.js";
import { BUFF_STAT_LABEL, FLAIR_TITLES, FLAIR_AURAS, FLAIR_BACKGROUNDS, FLAIR_ITEMS, FLAIR_SHARD_VALUES, FLAIR_BANANAS, RARITY_COLORS_FLAIR, FLAIR_TITLE_MAP, FLAIR_AURA_MAP, FLAIR_BG_MAP, FLAIR_ITEM_MAP, portraitBackdropStyle, PORTRAIT_FEET_BOTTOM, PORTRAIT_STAGE_STYLE } from "../../../data/flair.js";
import { rollFlairRarity, feedFlair } from "../../../core/gacha.js";
import { easternNoonDayKey } from "../../../core/dates.js";
import FlairRaritySection from "../../../ui/screens/CreatureDetail/FlairRaritySection.js";
import ScreenHeader from "../../../ui/components/ScreenHeader.js";
import CreatureIcon from "../../../ui/components/CreatureIcon.js";
import AutoFitText from "../../../ui/components/AutoFitText.js";

/** Category presentation. The short labels are for the reveal grid's cards,
 * which are far too narrow for "Background". */
const CAT_LABEL={titles:"Title",aura:"Aura",background:"Background",item:"Item"};
const CAT_LABEL_SHORT={titles:"Title",aura:"Aura",background:"BG",item:"Item"};
const CAT_EMOJI={titles:"📛",aura:"✨",background:"🖼️",item:"🌿"};
// Whether the Feed tab shows the "Equipped" row (hidden for now).
const SHOW_EQUIPPED_ROW=false;

/** A banana's icon: its art if it has any, else its emoji (at `emojiSize`
 * px). `style` sizes the art. */
function bananaIcon(banana,style,emojiSize){
  return banana.image
    ? React.createElement("img",{src:banana.image,alt:"",draggable:false,style:{objectFit:"contain",pointerEvents:"none",...style}})
    : React.createElement("span",{style:{fontSize:emojiSize,lineHeight:1,whiteSpace:"nowrap"}},iconText(banana.emoji));
}

// The Feed tab's "Equipped" row: per category, the tab it opens, the owned-
// creature field holding the equipped entry (a title's name, else an id), the
// lookup from that to the entry, and the rarity pools (to colour it).
const EQUIP_SLOTS=[
  {cat:"titles",key:"equippedTitle",map:FLAIR_TITLE_MAP,pool:FLAIR_TITLES},
  {cat:"aura",key:"equippedAura",map:FLAIR_AURA_MAP,pool:FLAIR_AURAS},
  {cat:"background",key:"equippedBackground",map:FLAIR_BG_MAP,pool:FLAIR_BACKGROUNDS},
  {cat:"item",key:"equippedItem",map:FLAIR_ITEM_MAP,pool:FLAIR_ITEMS},
];

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

function FlairSection({unlockedSkins,def,onBack,onBananaUsed,ownedData,flairGuideStep,setFlairGuideStep,hasFlairEffects,onShowFlairEffects}){
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
    // The portrait stage -- just the creature on its background, no stats
    // (feeding happens on its own results page, so there's nothing to watch
    // change here). Edge to edge and flush with the top bar, like the creature
    // page, and the SAME size on every tab so switching tabs never moves it: a
    // full-width square, like the creature page's (the whole square background
    // shows) with no height cap, so the art is never trimmed; the controls
    // below are kept compact instead, and on a phone too short for them the
    // page scrolls (the tab bar stays pinned). The art covers it,
    // bottom-anchored and never stretched; the creature stands
    // PORTRAIT_FEET_BOTTOM up, the same spot on the art as elsewhere.
    React.createElement("div",{style:{position:"relative",...PORTRAIT_STAGE_STYLE,margin:"-12px 0 12px",borderRadius:0,width:"100%",aspectRatio:"1 / 1",flexShrink:0,background:"#fff",...portraitBackdropStyle(ownedData)}},
      React.createElement(CreatureIcon,{def,ownedData,unlockedSkins,size:130,style:{position:"absolute",bottom:PORTRAIT_FEET_BOTTOM,left:"50%",transform:"translateX(-50%)"}})
    ),
    React.createElement("div",{style:{flex:flairTab==="feed"?"1 0 auto":1,minHeight:0,overflow:flairTab==="feed"?"visible":"hidden",display:"flex",flexDirection:"column"}},
      // Feed tab: the equipped-flair row fills the space under the portrait,
      // with the banana selector and Feed buttons at the bottom, just above
      // the tab bar.
      flairTab==="feed"&&React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",padding:"0 16px 8px",position:"relative"}},
        // Equipped flair: one tile per category showing what's on the
        // creature now (rarity-coloured name, or "None"). Tapping a tile opens
        // that category's tab to change it. Centred in its space, with a
        // 8px floor under it so it never sits right on the banana selector.
        // Kept compact (no heading) so the Feed tab fits without scrolling.
        // Hidden for now (SHOW_EQUIPPED_ROW) -- flip it to bring the row back.
        SHOW_EQUIPPED_ROW&&React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",justifyContent:"center",paddingBottom:8}},
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}},
            EQUIP_SLOTS.map(({cat,key,map,pool})=>{
              const id=ownedData[key];
              const entry=id?map[id]:null;
              const rarity=entry?Object.keys(pool).find(r=>(pool[r]||[]).includes(entry)):null;
              // Six-digit form, so an alpha suffix can be appended ("#888"
              // would otherwise become the invalid "#88844").
              const c=rarity?RARITY_COLORS_FLAIR[rarity]:"#aaaaaa";
              const tint=c.length===4?"#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:c;
              return React.createElement("button",{key:cat,onClick:()=>setFlairTab(cat),style:{
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:0,padding:"3px 4px 4px",
                border:"1.5px solid "+(entry?tint+"99":"#cfcfcf"),borderRadius:14,background:entry?tint+"12":"#fff",
                boxShadow:"0 1px 4px rgba(0,0,0,0.08)",fontFamily:"inherit",cursor:"pointer"}},
                React.createElement("div",{style:{fontSize:8,fontWeight:700,color:"#999",letterSpacing:".05em",textTransform:"uppercase"}},CAT_LABEL[cat]),
                React.createElement("div",{style:{fontSize:18,lineHeight:1,opacity:entry?1:0.3}},(entry&&entry.emoji)||CAT_EMOJI[cat]),
                React.createElement(AutoFitText,{size:10,minSize:7,style:{width:"100%",textAlign:"center",fontWeight:700,color:entry?tint:"#bbb",lineHeight:1.2}},entry?(entry.name||id):"None")
              );
            })
          )
        ),
        // Feed results page, layered over the Flair page. Bare on purpose --
        // no header, no card -- just the results and one button at the
        // bottom: Skip during a multi-feed's staggered reveal, then Done,
        // which returns to Flair.
        feedResult&&React.createElement("div",{className:"screen-fade",style:{position:"fixed",inset:0,background:"#f5f5f5",zIndex:20,display:"flex",flexDirection:"column",overflow:"hidden"}},
          React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px 16px 0"}},
            (feedResult.type==="single"&&feedResult.results[0]
                ? (feedResult.results[0].won
                    ? (()=>{
                        const r0=feedResult.results[0];
                        return React.createElement("div",{style:{textAlign:"center"}},
                          React.createElement("div",{style:{fontSize:72,lineHeight:1,marginBottom:12}},r0.won.emoji||r0.emoji),
                          React.createElement("div",{style:{fontSize:12,fontWeight:700,color:RARITY_COLORS_FLAIR[r0.rarity],textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}},
                            r0.rarity+" · "+(r0.cat==="titles"?"Title":r0.cat==="aura"?"Aura":r0.cat==="background"?"Background":"Item")
                          ),
                          React.createElement("div",{style:{fontSize:20,fontWeight:700,color:"#222",marginBottom:2}},r0.won.name),
                          r0.won.buff&&React.createElement("div",{style:{fontSize:13,color:"#555",fontWeight:600,marginBottom:2}},"+"+r0.won.buff.pct+"% "+BUFF_STAT_LABEL[r0.won.buff.stat]),
                          React.createElement("div",{style:{fontSize:13,color:"#1b5e20",fontWeight:600}},"Unlocked!")
                        );
                      })()
                    : (()=>{
                        // A duplicate still shows WHAT was pulled, in the same
                        // shape as a win -- just grey instead of rarity-coloured,
                        // with the shard payout where "Unlocked!" would be. Saying only "all of them are already
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
                : React.createElement("div",{style:{width:"100%",height:"100%"}},
                    (()=>{
                      // Card layout: category tucked in the top-left corner,
                      // artwork centred in the space that leaves, then name and
                      // effect along the bottom. The category sits out of the
                      // flow, and name and effect are each held to one line by
                      // AutoFitText rather than being allowed to wrap.
                      //
                      // Every card is one equal grid cell whatever its
                      // contents, which is what stops the icons changing size
                      // as later cards turn over.
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
                          textAlign:"center",borderRadius:12,padding:"18px 6px 10px",minWidth:0,minHeight:0,
                          background:visible?(r.won?(RARITY_COLORS_FLAIR[r.rarity]+"18"):"#f0f0f0"):"transparent",
                          border:visible?"1px solid "+(r.won?RARITY_COLORS_FLAIR[r.rarity]+"55":"#e0e0e0"):"1px solid transparent",
                          opacity:visible?undefined:0,
                          animation:visible?(r.won?"fadeIn .3s ease-out forwards":"dupeFade 1.4s ease-out forwards"):undefined,
                          display:"flex",flexDirection:"column",alignItems:"stretch",gap:3,
                        }},
                          // Top-left corner. Absolute so it does not push the
                          // artwork down; the card's top padding keeps clear of it.
                          React.createElement("div",{style:{position:"absolute",top:6,left:8,fontSize:9,fontWeight:700,lineHeight:1,letterSpacing:"0.04em",textTransform:"uppercase",color:tint,opacity:0.85}},catLabel),
                          // Artwork, centred in whatever height is left over --
                          // this is the slot a real icon drops into later.
                          React.createElement("div",{style:{flex:1,minHeight:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,lineHeight:1}},
                            item?(item.emoji||catEmoji):"—"
                          ),
                          React.createElement(AutoFitText,{size:14,minSize:7,style:{fontWeight:700,color:tint,lineHeight:1.2}},
                            r.won?r.won.name:(r.dupeItem?r.dupeItem.name:"Dupe")
                          ),
                          React.createElement(AutoFitText,{size:11,minSize:7,style:{fontWeight:600,lineHeight:1.2,color:r.won?"#555":"#7986cb"}},
                            r.won?(r.won.buff?"+"+r.won.buff.pct+"% "+BUFF_STAT_LABEL[r.won.buff.stat]:"")
                                 :("+"+r.shards+" 🔷")
                          )
                        );
                      }
                      // 3x3 for the nine results, stretched to fill the page:
                      // equal rows share the height, equal columns the width.
                      //
                      // minmax(0,1fr), NOT 1fr: a bare `1fr` is `minmax(auto,
                      // 1fr)`, so each column is floored at its own content's
                      // min-content width -- and the labels inside are
                      // single-line (AutoFitText), which makes that the full
                      // text width. The columns came out uneven and 386px wide
                      // inside a 343px box, pushing the last off the screen.
                      // A 0 minimum lets the columns stay equal and lets the
                      // labels do the giving way, which is their job. Same
                      // reasoning for the rows.
                      return React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gridTemplateRows:"repeat(3,minmax(0,1fr))",gap:10,height:"100%"}},
                        feedResult.results.map((r,i)=>renderCard(r,i))
                      );
                    })()
                  )
              )
          ),
          (()=>{
            const revealing=feedResult.type==="multi"&&visibleCount<feedResult.results.length;
            return React.createElement("div",{style:{padding:"16px 16px 24px"}},
              React.createElement("button",{
                onClick:()=>revealing?setVisibleCount(feedResult.results.length):setFeedResult(null),
                // Both states keep a 1px border (transparent on Done) so the
                // button doesn't change height when Skip turns into Done.
                style:{width:"100%",padding:"12px 0",border:"1px solid "+(revealing?"#ccc":"transparent"),borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",
                  background:revealing?"#fff":"#534AB7",color:revealing?"#666":"#fff"}
              },revealing?"Skip":"Done")
            );
          })()
        ),
        // Banana info modal
        bananaInfo&&React.createElement("div",{onClick:()=>setBananaInfo(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}},
          React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"#fff",borderRadius:16,padding:"24px 20px",width:280,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}},
            bananaInfo.image
              ? React.createElement("img",{src:bananaInfo.image,alt:bananaInfo.name,draggable:false,style:{display:"block",width:88,height:88,objectFit:"contain",margin:"0 auto 8px"}})
              : React.createElement("div",{style:{fontSize:32,textAlign:"center",marginBottom:6}},iconText(bananaInfo.emoji)),
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
        // Banana + feed controls: a row of square banana tiles (count badge on
        // the corner), the selected banana's name with its ⓘ, then Feed ×1 /
        // Feed ×9 buttons showing the banana and what each costs. Centred in
        // the space while the Equipped row is hidden.
        React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",...(SHOW_EQUIPPED_ROW?null:{margin:"auto 0"})}},
          // Tile size and the gap under the row shrink a little on short
          // screens only (--vh, see uiScale.js), so older 16:9 phones fit the
          // Feed tab without scrolling; everywhere else they're 74px / 16px.
          React.createElement("div",{style:{display:"flex",justifyContent:"center",gap:16,marginBottom:"min(16px, calc(var(--vh) * 1.9))"}},
            FLAIR_BANANAS.map(banana=>{
              const cnt=currencies[banana.id]||0;
              const isSel=selectedBanana.id===banana.id;
              return React.createElement("button",{key:banana.id,onClick:()=>setSelectedBanana(banana),"aria-label":banana.name,style:{
                position:"relative",width:"min(74px, calc(var(--vh) * 9.5))",height:"min(74px, calc(var(--vh) * 9.5))",padding:6,borderRadius:18,cursor:"pointer",fontFamily:"inherit",
                background:isSel?banana.bg:"#fff",border:"3px solid "+(isSel?banana.color:"#e6e6e6"),
                boxShadow:isSel?"0 2px 10px "+banana.color+"44":"0 1px 4px rgba(0,0,0,0.06)",
                display:"flex",alignItems:"center",justifyContent:"center",opacity:isSel?1:0.85}},
                bananaIcon(banana,{width:"100%",height:"100%"},24),
                // Count badge on the bottom-right corner: red when you have
                // some, grey at zero.
                React.createElement("div",{style:{position:"absolute",right:-8,bottom:-8,minWidth:26,height:26,padding:"0 6px",boxSizing:"border-box",borderRadius:13,
                  background:cnt>0?"#ef4444":"#9e9e9e",border:"2px solid #fff",color:"#fff",fontSize:13,fontWeight:800,
                  display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}},cnt)
              );
            })
          ),
          // Selected banana's name, with the ⓘ that opens its rates.
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:8}},
            React.createElement("div",{style:{fontSize:15,fontWeight:800,color:"#2a2640",letterSpacing:".04em",textTransform:"uppercase"}},selectedBanana.name),
            React.createElement("button",{onClick:()=>setBananaInfo(selectedBanana),"aria-label":"Show "+selectedBanana.name+" rates",style:{
              width:18,height:18,borderRadius:"50%",border:"none",background:"#2a2640",color:"#fff",fontSize:11,fontWeight:800,fontFamily:"Georgia, serif",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0}},"i")
          ),
          // Feed buttons, each labelled "Feed ×N" with its cost (banana +
          // count) beside it. The free daily banana makes Feed ×1 "FREE" and
          // takes one off Feed ×9.
          (()=>{
            const revealing=feedResult&&feedResult.type==="multi"&&visibleCount<feedResult.results.length;
            // The multi-feed is 9, revealed as a full-page 3x3 grid. The free
            // daily banana covers one of them.
            const need1=freeBananaAvailable?0:1;
            const need9=freeBananaAvailable?8:9;
            const dis1=selCount<need1||revealing;
            const dis9=selCount<need9||revealing;
            const showFeedGuideArrow=flairGuideStep==="feed";
            // Each button reads "Feed ×N" on the left, with its cost -- the
            // banana and how many, or FREE -- in a pill on the right.
            const feedBtn=(label,cost,dis,onClick,extra)=>React.createElement("button",{...extra,onClick,disabled:dis,style:{
                position:"relative",flex:1,maxWidth:170,height:46,padding:"0 8px 0 14px",borderRadius:14,cursor:dis?"default":"pointer",fontFamily:"inherit",
                border:"2px solid "+(dis?"#dcdcdc":"#3d3854"),background:dis?"#ececec":"#2a2640",color:dis?"#b0b0b0":"#fff",
                display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}},
                React.createElement("span",{style:{fontSize:15,fontWeight:800,whiteSpace:"nowrap"}},label),
                React.createElement("span",{style:{display:"flex",alignItems:"center",gap:4,height:32,padding:"0 9px 0 6px",borderRadius:10,
                  background:dis?"rgba(0,0,0,0.05)":"rgba(255,255,255,0.12)"}},
                  cost===0
                    ? React.createElement("span",{style:{fontSize:13,fontWeight:800,letterSpacing:".04em",padding:"0 3px"}},"FREE")
                    : React.createElement(React.Fragment,null,
                        React.createElement("span",{style:{display:"flex",alignItems:"center",height:24,minWidth:24,filter:dis?"grayscale(1)":"none",opacity:dis?0.6:1}},bananaIcon(selectedBanana,{width:24,height:24},15)),
                        React.createElement("span",{style:{fontSize:16,fontWeight:800}},cost)
                      )
                ),
                showFeedGuideArrow&&label==="Feed ×1"&&React.createElement("div",{style:{position:"absolute",left:"50%",top:-30,transform:"translate(-50%,0)",fontSize:22,color:"#534AB7",animation:"pointerBounce 1s ease-in-out infinite",zIndex:6,pointerEvents:"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}},"⬇️")
              );
            return React.createElement("div",{style:{display:"flex",justifyContent:"center",gap:14,width:"100%"}},
              feedBtn("Feed ×1",need1,dis1,()=>{doFeed(1);if(flairGuideStep==="feed")setFlairGuideStep(null);},{"data-guide-target":"feed"}),
              feedBtn("Feed ×9",need9,dis9,()=>doFeed(9))
            );
          })()
        )
      ),
      (flairTab==="titles"||flairTab==="aura"||flairTab==="background"||flairTab==="item")&&React.createElement(FlairRaritySection,{flairTab,ownedData,setOwned,currencies,setCurrencies})
    ),
    // Tab bar, pinned to the bottom of the screen like a nav bar, so it
    // stays put whichever tab is open (the portrait card grows on Feed and
    // shrinks on the others, which used to push the tabs up and down).
    React.createElement("div",{style:{display:"flex",gap:8,padding:"8px 16px 8px",flexShrink:0,marginTop:"auto",position:"sticky",bottom:0,zIndex:2,background:"#fff",borderTop:"1px solid #e8e8e8"}},
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
  );
}


export default FlairSection;
