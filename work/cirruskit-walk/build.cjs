const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk',N=24,S=512,base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png')),seam=JSON.parse(fs.readFileSync('work/cirruskit-walk/tail-seam.json'));
const smooth=(a,b,t)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
const tail=(x,y)=>x<seam[y];
function sample(x,y,isTail){const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=S||yy>=S||tail(xx,yy)!==isTail)continue;const i=(yy*S+xx)*4,a=base.data[i+3]/255;o[3]+=w*a;for(let c=0;c<3;c++)o[c]+=w*a*base.data[i+c];}return o;}
function legValues(p,phase,side,amplitude){const u=(p-phase+1)%1,lift=u<.25?Math.sin(Math.PI*u/.25)**2*amplitude:0;return [side*8*Math.sin(2*Math.PI*p),-lift];}
function offset(x,y,pose){const [bob,legs]=pose,a=smooth(208,244,x),b=smooth(259,279,x),c=smooth(344,388,x),weights=[1-a,a*(1-b),b*(1-c),c],flex=[smooth(365,421,y),smooth(405,430,y),smooth(391,432,y),smooth(395,431,y)];let dx=0,dy=bob;for(let i=0;i<4;i++){const w=weights[i]*flex[i];dx+=w*legs[i][0];dy+=w*(legs[i][1]-bob);}const join=1-smooth(295,315,y)*(1-smooth(0,26,x-seam[Math.max(0,Math.min(511,Math.round(y)))]));return [dx*join,dy*join];}
const poses=[];
for(let n=0;n<N;n++){const p=n/N,angle=2*Math.PI*p,bob=-Math.round(3*Math.sin(angle)**2),legs=[legValues(p,.75,-1,13),legValues(p,.25,1,10),legValues(p,0,1,14),legValues(p,.5,-1,12)],pose=[bob,legs];poses.push({frame:n,bob,legs});const out=new PNG({width:S,height:S});
if(n===0)base.data.copy(out.data);else for(let y=0;y<S;y++)for(let x=0;x<S;x++){const tx=x-6*Math.sin(angle)*(1-smooth(175,310,y)),t=sample(tx,y,true);let sx=x,sy=y;for(let k=0;k<18;k++){const d=offset(sx,sy,pose);sx=x-d[0];sy=y-d[1];}const b=sample(sx,sy,false),i=(y*S+x)*4,a=b[3]+t[3]*(1-b[3]);if(a){for(let c=0;c<3;c++)out.data[i+c]=Math.round((b[c]+t[c]*(1-b[3]))/a);out.data[i+3]=Math.round(a*255);}}
fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));}
fs.writeFileSync(`${root}/poses.json`,JSON.stringify(poses,null,2));
(async()=>{const selected=[0,3,6,9,12,15,18,21],tiles=await Promise.all(selected.map(n=>sharp(`${root}/frames/frame-${n}.png`).resize(256,256).flatten({background:'#f3f1f7'}).png().toBuffer()));await sharp({create:{width:1024,height:512,channels:4,background:'#f3f1f7'}}).composite(tiles.map((input,n)=>({input,left:n%4*256,top:Math.floor(n/4)*256}))).png().toFile(`${root}/contact.png`);})();console.log('Rendered 24 frames from the original art.');



