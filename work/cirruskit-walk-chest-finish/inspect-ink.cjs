const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{const root='work/cirruskit-walk-chest-finish';for(const [name,left,top,width,height]of [['rear',185,375,80,70],['front',337,375,80,80]]){
 const names=['frames/frame-3.png','layers/'+(name==='rear'?'nearHind':'farFront')+'.png','layers/body.png'],tiles=[];
 for(let n=0;n<3;n++)tiles.push({input:await sharp(`${root}/${names[n]}`).extract({left,top,width,height}).resize(width*5,height*5,{kernel:'nearest'}).flatten({background:'#ece8f1'}).png().toBuffer(),left:n*width*5,top:24});
 const labels=Buffer.from(`<svg width="${width*15}" height="24">${['Frame 4','Moving leg source','Stationary body'].map((s,n)=>`<text x="${n*width*5+8}" y="18" font-size="16">${s}</text>`).join('')}</svg>`);
 await sharp({create:{width:width*15,height:height*5+24,channels:4,background:'#ece8f1'}}).composite([...tiles,{input:labels,left:0,top:0}]).png().toFile(`${root}/${name}-ink.png`);
}})();
