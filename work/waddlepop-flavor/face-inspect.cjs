const fs=require('fs');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='work/waddlepop-flavor';
(async()=>{
 await sharp('C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/exec-a5a8aecc-8242-4510-8afe-f534abc74d5e.png').resize(512,512).toFile(root+'/outlined-generated.png');
 const tiles=[];
 for(const [i,p] of ['base.png','outlined-generated.png'].entries())tiles.push({input:await sharp(root+'/'+p).extract({left:150,top:248,width:210,height:142}).resize(630,426).png().toBuffer(),left:i*630,top:0});
 await sharp({create:{width:1260,height:426,channels:4,background:'#ddd'}}).composite(tiles).png().toFile(root+'/face-compare.png');
})();
