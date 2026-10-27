const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='work/cirruskit-walk-cleanup';
(async()=>{
  for(const [region,left,top,width,height] of [['rear',95,345,125,100],['front',360,335,100,110]]){
    const files=[`${root}/frames/frame-28.png`,`${root}/layers/body.png`,`${root}/layers/hip-cover.png`,`${root}/layers/${region==='rear'?'nearHind':'farFront'}.png`,`${root}/layers/${region==='rear'?'tail':'foreground'}.png`,'images/cirruskit/cirruskit_base.png'];
    const tiles=await Promise.all(files.map(async (file,n)=>({input:await sharp(file).extract({left,top,width,height}).resize(width*3,height*3,{kernel:'nearest'}).flatten({background:'#eeedf3'}).png().toBuffer(),left:n%3*width*3,top:Math.floor(n/3)*(height*3+24)+24})));
    const labels=Buffer.from(`<svg width="${width*9}" height="${height*6+48}">${['Frame 29','Body layer','Joint cover','Leg','Tail / mane','Base image'].map((s,n)=>`<text x="${n%3*width*3+8}" y="${Math.floor(n/3)*(height*3+24)+18}" fill="black" font-size="16">${s}</text>`).join('')}</svg>`);
    await sharp({create:{width:width*9,height:height*6+48,channels:4,background:'#eeedf3'}}).composite([...tiles,{input:labels,left:0,top:0}]).png().toFile(`${root}/${region}-joins.png`);
  }
})();
