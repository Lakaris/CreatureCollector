const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),body=read('work/cirruskit-transition-repair/fixed-body.png'),headMask=read('work/cirruskit-transition-repair/fixed-head-mane.png'),variants=Object.fromEntries(['normal','focused','half','attack'].map(n=>[n,read(`${root}/inputs/${n}.png`)]));
// The mane and face move together as original pixels. All transforms are
// whole-pixel translations, so the outlines and swirl artwork stay crisp.
const headDown=[0,2,5,9,14,19,22,17,9,0,0,0,0,0,0,8,16,20,17,13,9,5,2,1,0];
const lift=[0,0,0,0,0,0,0,8,22,32,34,32,26,18,9,0,0,0,0,0,0,0,0,0,0];
const reach=[0,0,0,0,0,0,0,1,2,4,5,5,4,3,1,0,0,0,0,0,0,0,0,0,0];
function composite(out,layer,dx,dy,color=layer){for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,a=layer.data[i+3]/255;if(!a)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)throw Error(`Sprite clipped at ${xx},${yy}`);const j=(yy*512+xx)*4,da=out.data[j+3]/255;if(a>=245/255||!da){for(let c=0;c<3;c++)out.data[j+c]=color.data[i+c];out.data[j+3]=layer.data[i+3];}else{const total=a+da*(1-a);for(let c=0;c<3;c++)out.data[j+c]=Math.round((color.data[i+c]*a+out.data[j+c]*da*(1-a))/total);out.data[j+3]=Math.round(total*255);}}}
const plan=[];
for(let n=0;n<25;n++){
 const expression=n<2||n>=22?'normal':n<4||n>=19?'focused':'attack',source=variants[expression],posed=new PNG({width:512,height:512});
 if(headDown[n]===0)source.data.copy(posed.data);else{body.data.copy(posed.data);composite(posed,headMask,0,headDown[n],source);}
 const out=new PNG({width:512,height:512});composite(out,posed,reach[n],-lift[n]);
 if(n===0||n===24)base.data.copy(out.data);
 fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));
 plan.push({index:n,durationMs:16,expression,headDown:headDown[n],lift:lift[n],reach:reach[n],phase:n<7?'wind-up':n<15?'pounce':n<19?'landing':'recover'});
}
fs.writeFileSync(`${root}/frame-plan.json`,JSON.stringify({frames:plan,columns:5,rows:5,totalDurationMs:400},null,2)+'\n');
(async()=>{for(let page=0;page<5;page++){const c=[];for(let k=0;k<5;k++){const n=page*5+k;const p=await sharp(`${root}/frames/frame-${n}.png`).resize(256,256).flatten({background:page%2?'#302c38':'#f1edf4'}).png().toBuffer();c.push({input:p,left:k*256,top:28});c.push({input:Buffer.from(`<svg width="256" height="28"><text x="10" y="20" font-family="Arial" font-size="17" fill="#493552">${n+1} · ${plan[n].phase}</text></svg>`),left:k*256,top:0});}await sharp({create:{width:1280,height:284,channels:4,background:'#f1edf4'}}).composite(c).png().toFile(`${root}/review-${page+1}.png`);}const mini=await Promise.all(plan.map(f=>sharp(`${root}/frames/frame-${f.index}.png`).resize(130,130).flatten({background:'#efedf3'}).png().toBuffer()));await sharp({create:{width:650,height:650,channels:4,background:'#efedf3'}}).composite(mini.map((input,i)=>({input,left:i%5*130,top:Math.floor(i/5)*130}))).png().toFile(`${root}/game-size-check.png`);})();
