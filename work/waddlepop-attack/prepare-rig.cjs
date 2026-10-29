const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',S=512,read=p=>PNG.sync.read(fs.readFileSync(p));
const save=(p,im)=>{const tmp=p+'.building-'+process.pid;fs.writeFileSync(tmp,PNG.sync.write(im));fs.renameSync(tmp,p);};
async function svg(path,stroke=false){return PNG.sync.read(await sharp(Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="${stroke?'none':'white'}" stroke="${stroke?'#120101':'none'}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/></svg>`)).png().toBuffer());}
(async()=>{
 const source=read('work/waddlepop-flavor/character.png'),gen=read(root+'/body-underlay-512.png'),body=new PNG({width:S,height:S});
 // The generated body supplies the newly exposed shoulder outline. All
 // established face, belly, tuft and feet pixels are copied from the source.
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const k=(y*S+x)*4,a=gen.data[k+3];if(!a)continue;
  let edge=false;for(let dy=-5;dy<=5&&!edge;dy++)for(let dx=-5;dx<=5;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=S||yy>=S||gen.data[(yy*S+xx)*4+3]<200){edge=true;break;}}
  const faceInterior=x>=185&&x<=342&&y>=280&&y<=373;
  const preserve=(y>=390||faceInterior||!edge)&&source.data[k+3]>200;
  for(let c=0;c<3;c++)body.data[k+c]=preserve?source.data[k+c]:gen.data[k+c];
  body.data[k+3]=y>=390?source.data[k+3]:a;
 }
 // Keep the entire torso and feet exactly still, including their original
 // outer antialiasing. Arms are above this seam and pivot at the shoulders.
 for(let y=390;y<S;y++)source.data.copy(body.data,y*S*4,y*S*4,(y+1)*S*4);
 for(let y=375;y<390;y++){
  const u=(y-375)/15,w=u*u*(3-2*u);
  for(let x=140;x<375;x++){
   const sx=x<256?x+3*w:x-3*w,ix=Math.floor(sx),f=sx-ix,k=(y*S+x)*4;
   const a=gen.data[(y*S+ix)*4+3]*(1-f)+gen.data[(y*S+ix+1)*4+3]*f;
   let edge=false;for(let dx=-6;dx<=6;dx++)if(gen.data[(y*S+ix+dx)*4+3]<200)edge=true;
   for(let c=0;c<3;c++)body.data[k+c]=edge?Math.round(gen.data[(y*S+ix)*4+c]*(1-f)+gen.data[(y*S+ix+1)*4+c]*f):source.data[k+c];
   body.data[k+3]=Math.round(a);
  }
 }
 require('./prepare-full-arms.cjs')();
 for(let y=190;y<390;y++)for(let x=0;x<S;x++){const k=(y*S+x)*4;if(body.data[k+3]>=250)body.data[k+3]=255;}
 save(root+'/body.png',body);
 const inputs=[];for(const [i,name]of ['body','arm-1','arm-2'].entries())inputs.push({input:await sharp(root+'/'+name+'.png').flatten({background:'#eae7ef'}).png().toBuffer(),left:i*512,top:0});
 await sharp({create:{width:1536,height:512,channels:4,background:'#eae7ef'}}).composite(inputs).png().toFile(root+'/rig-review.png');
})();
