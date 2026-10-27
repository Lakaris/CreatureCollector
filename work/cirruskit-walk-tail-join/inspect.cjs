const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='work/cirruskit-walk-tail-join';
(async()=>{
 const files=['images/cirruskit/cirruskit_base.png','work/cirruskit-walk-ink-finish/frames/frame-0.png','work/cirruskit-walk-ink-finish/frames/frame-15.png',...['tail','body','nearHind'].map(n=>`${root}/layers/${n}.png`)];
 const tiles=[];for(let n=0;n<6;n++)tiles.push({input:await sharp(files[n]).extract({left:100,top:345,width:85,height:90}).resize(340,360,{kernel:'nearest'}).flatten({background:'#ede9f0'}).png().toBuffer(),left:n%3*340,top:Math.floor(n/3)*384+24});
 const labels=Buffer.from(`<svg width="1020" height="768">${['Original base','Current frame 1','Current frame 16','Tail','Body backing','Rear leg'].map((s,n)=>`<text x="${n%3*340+8}" y="${Math.floor(n/3)*384+18}" font-size="16">${s}</text>`).join('')}</svg>`);
 await sharp({create:{width:1020,height:768,channels:4,background:'#ede9f0'}}).composite([...tiles,{input:labels,left:0,top:0}]).png().toFile(`${root}/join-inspection.png`);
})();
