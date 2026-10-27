const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const {pose}=require('./rig.cjs'),root='work/cirruskit-flavor-crisp',read=n=>PNG.sync.read(fs.readFileSync(`work/cirruskit-flavor-smooth/source/frame-${n}.png`));
const base=read(0),anticipation=read(1);for(let i=3;i<anticipation.data.length;i+=4){if(anticipation.data[i]>=245)anticipation.data[i]=255;else if(anticipation.data[i]<3)anticipation.data.fill(0,i-3,i+1);}const frames=[base,anticipation],plan=[{pose:'standing',durationMs:160},{pose:'quick-crouch',durationMs:48}];
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
for(let n=0;n<32;n++){let lift=0;if(n>=6&&n<=10)lift=14*smooth((n-6)/4);else if(n>10&&n<=12)lift=14*(1-smooth((n-10)/2));else if(n>=18&&n<=21)lift=10*smooth((n-18)/3);else if(n>21&&n<=22)lift=10*(1-smooth(n-21));
const pawY=-Math.round(lift),pawX=Math.round(lift*.75),tailX=Math.round(6*Math.sin(2*Math.PI*n/31)**2);frames.push(pose(tailX,pawX,pawY));plan.push({pose:'crouched',tailX,pawX,pawY,durationMs:64});}
frames.push(anticipation,base);plan.push({pose:'rise',durationMs:80},{pose:'standing',durationMs:96});
const total=plan.reduce((sum,f)=>sum+f.durationMs,0);if(frames.length!==36||total!==2432)throw Error('Incorrect frame count/timing');
for(let n=0;n<36;n++)fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(frames[n]));fs.writeFileSync(`${root}/frame-plan.json`,JSON.stringify({frames:plan,totalDurationMs:total,columns:6,rows:6},null,2));
(async()=>{const small=await Promise.all(frames.map((_,i)=>sharp(`${root}/frames/frame-${i}.png`).resize(130,130).png().toBuffer()));await sharp({create:{width:780,height:780,channels:4,background:'#f3f1f7'}}).composite(small.map((input,i)=>({input,left:i%6*130,top:Math.floor(i/6)*130}))).png().toFile(`${root}/contact-130.png`);console.log(JSON.stringify({frames:frames.length,totalMs:total,crouchTransitionMs:48,technique:'Rigid whole-pixel layer movement; no frame blending, warping or resampling.'}));})();

