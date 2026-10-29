const fs=require('fs'),crypto=require('crypto');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',S=512,N=30;
// Most of the gesture comes from the body and bomb. Keep the local arm reach
// below 1.5px so the source flipper silhouettes and white tips stay consistent.
const ARM_FOLLOW=.06;
const read=p=>PNG.sync.read(fs.readFileSync(p)),save=(p,im)=>fs.writeFileSync(p,PNG.sync.write(im));
const base=read(root+'/base.png');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// The entire head has one rigid transform. These bounds include both cheek
// contours and the tuft; flipper motion falls to zero before reaching them.
const headBounds=[[190,218,307],[215,211,304],[240,205,315],[260,195,328],[275,181,337],[290,175,342],[310,169,348],[330,168,353],[350,173,353],[365,184,343],[378,212,317],[390,215,315]];
function cheekBounds(y){let j=0;while(j<headBounds.length-2&&y>headBounds[j+1][0])j++;const u=clamp((y-headBounds[j][0])/(headBounds[j+1][0]-headBounds[j][0]),0,1);return[1,2].map(i=>headBounds[j][i]+(headBounds[j+1][i]-headBounds[j][i])*u);}
function rigidHead(x,y){const [left,right]=cheekBounds(y);return y>=190&&y<=388&&x>=left-7&&x<=right+7;}
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;let o=[0,0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){const xx=ix+i,yy=iy+j;if(xx<0||yy<0||xx>=S||yy>=S)continue;const k=(yy*S+xx)*4,a=im.data[k+3]/255,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<3;c++)o[c]+=im.data[k+c]*a*w;o[3]+=a*w;}return o;}
function over(out,k,p){const a=p[3];if(a<.001)return;const da=out.data[k+3]/255,oa=a+da*(1-a);for(let c=0;c<3;c++)out.data[k+c]=Math.round((p[c]+out.data[k+c]*da*(1-a))/oa);out.data[k+3]=Math.round(oa*255);}
function rot(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
function inv(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y)];}
const keys=[
 [0,0,0,0,0,0,0,0,0],
 [.12,-3,-3,2,-7,7,-2,0,0],
 [.26,4,4,4,16,13,5,0,0],
 [.39,2,4,5,24,20,8,10,0],
 [.49,-4,-3,6,3,20,-2,6,0],
 [.59,-5,-5,8,-25,33,-9,0,12],
 [.67,-3,-4,11,-15,32,-5,0,4],
 [.78,2,2,5,9,13,3,0,0],
 [.90,-1,-1,2,-3,6,-1,0,0],
 [1,0,0,0,0,0,0,0,0]
];
function pose(t){let j=0;while(j<keys.length-2&&t>keys[j+1][0])j++;const u=sm(keys[j][0],keys[j+1][0],t),v=keys[j].map((a,i)=>a+(keys[j+1][i]-a)*u);return{body:{a:v[1],x:v[2],y:v[3],cx:256,cy:462},bomb:{a:v[6],x:v[4],y:v[5],cx:250,cy:143},releaseL:v[7],releaseR:v[8]};}
(async()=>{
const character=new PNG({width:S,height:S});
const fill=PNG.sync.read(await sharp('work/waddlepop-flavor/bomb-reconstructed-source.png').resize(S,S).png().toBuffer());
const bomb=PNG.sync.read(PNG.sync.write(fill));
for(let y=0;y<192;y++)for(let x=0;x<S;x++){const k=(y*S+x)*4,w=sm(178,192,y);for(let c=0;c<4;c++)bomb.data[k+c]=Math.round(base.data[k+c]*(1-w)+fill.data[k+c]*w);}
// Use the clean reconstructed exterior only; retain original interior artwork.
const isolated=PNG.sync.read(await sharp('work/waddlepop-flavor/character-isolated-source.png').resize(S,S).png().toBuffer());
for(let y=0;y<S;y++)for(let x=0;x<S;x++){const k=(y*S+x)*4;if(y>=300){base.data.copy(character.data,k,k,k+4);continue;}let interior=isolated.data[k+3]>240&&isolated.data[k]>70;for(let dy=-4;dy<=4&&interior;dy++)for(let dx=-4;dx<=4;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=S||yy<0||yy>=S||isolated.data[(yy*S+xx)*4+3]<240){interior=false;break;}}for(let c=0;c<3;c++)character.data[k+c]=interior?base.data[k+c]:isolated.data[k+c];character.data[k+3]=isolated.data[k+3];if(!character.data[k+3])character.data.fill(0,k,k+4);}
// The face itself comes directly from the corrected base, including the added
// left contour. Its original colors and eye/beak spacing are never re-painted.
for(let y=270;y<=388;y++)for(let x=155;x<365;x++)if(rigidHead(x,y)){const k=(y*S+x)*4;base.data.copy(character.data,k,k,k+4);}
save(root+'/character.png',character);save(root+'/bomb.png',bomb);
const poses=[],frames=[],headAudit=[];
for(let n=0;n<N;n++){
 const t=n/(N-1),p=pose(t);poses.push(p);
 if(n===0||n===N-1){frames.push(PNG.sync.read(PNG.sync.write(base)));continue;}
 const out=new PNG({width:S,height:S});
 // Preserve the complete spark inside the frame even at the largest wobble.
 let minY=S;for(let y=0;y<290;y++)for(let x=90;x<440;x++)if(bomb.data[(y*S+x)*4+3]>16)minY=Math.min(minY,rot(x,y,p.bomb)[1]);if(minY<3)p.bomb.y+=3-minY;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const q=inv(x,y,p.bomb);over(out,(y*S+x)*4,sample(bomb,...q));}
 const targets=[[153,243],[357,249]],deltas=targets.map((v,i)=>{const b=rot(...v,p.body),q=rot(...v,p.bomb),r=i?p.releaseR:p.releaseL;return[clamp(q[0]-b[0]+(i?1:-1)*r*.6,-13,13)*ARM_FOLLOW,clamp(q[1]-b[1]+r,-20,24)*ARM_FOLLOW];});
 const kick=Math.sin(t*Math.PI*5)*Math.sin(t*Math.PI),feet=[[-3*kick,-Math.max(0,kick)*5],[3*kick,-Math.max(0,-kick)*5]];
 function map(x,y){const b=rot(x,y,p.body);if(rigidHead(x,y))return b;const [left,right]=cheekBounds(y);const wl=sm(10,55,left-x)*(1-sm(265,390,y)),wr=sm(10,55,x-right)*(1-sm(275,390,y));let dx=wl*deltas[0][0]+wr*deltas[1][0],dy=wl*deltas[0][1]+wr*deltas[1][1];const fw=sm(427,465,y),side=sm(230,290,x);dx+=fw*((1-side)*feet[0][0]+side*feet[1][0]);dy+=fw*((1-side)*feet[0][1]+side*feet[1][1]);return[b[0]+dx,b[1]+dy];}
 let facePixels=0,faceError=0;
 for(let y=180;y<S;y++)for(let x=75;x<440;x++){
 let [sx,sy]=inv(x,y,p.body);const pinned=rigidHead(sx,sy);if(!pinned)for(let pass=0;pass<20;pass++){const q=map(sx,sy);const a=p.body.a*Math.PI/180,ex=x-q[0],ey=y-q[1];sx+=(Math.cos(a)*ex+Math.sin(a)*ey)*.7;sy+=(-Math.sin(a)*ex+Math.cos(a)*ey)*.7;}const k=(y*S+x)*4,under=[...out.data.subarray(k,k+4)];over(out,k,sample(character,sx,sy));
 // Independently compare the rendered face to the corrected base under a
 // single rotation/translation, with no flipper deformation or cross-fade.
 if(pinned&&sy>=280&&sy<=377){const [l,r]=cheekBounds(sy);if(sx>=l-3&&sx<=r-2){const expected=sample(base,sx,sy);if(expected[3]>.98){facePixels++;const da=under[3]/255,ea=expected[3]+da*(1-expected[3]);for(let c=0;c<3;c++){const color=Math.round((expected[c]+under[c]*da*(1-expected[3]))/ea);faceError=Math.max(faceError,Math.abs(out.data[k+c]-color));}}}}
 }
 if(facePixels<10000||faceError!==0)throw new Error('Face preservation check failed in frame '+(n+1)+': '+facePixels+' checked, '+faceError+' error');headAudit.push({frame:n+1,pixelsChecked:facePixels,maxColorChannelError:faceError});
 frames.push(out);
}
const sheet=new PNG({width:3072,height:2560});for(let n=0;n<N;n++){save(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`,frames[n]);PNG.bitblt(frames[n],sheet,0,0,S,S,n%6*S,Math.floor(n/6)*S);}
save(root+'/waddlepop_flavor.png',sheet);fs.writeFileSync(root+'/poses.json',JSON.stringify(poses,null,2));
fs.writeFileSync(root+'/rigid-face-audit.json',JSON.stringify({headMotion:'rotation and translation only',flipperDeformationOnFace:false,baseFacePixelsPreserved:true,frames:headAudit},null,2));
const durations=Array(N).fill(60);durations[0]=300;durations[N-1]=360;
const meta={image:'waddlepop_flavor.png',frameWidth:S,frameHeight:S,columns:6,rows:5,loop:false,totalDurationMs:durations.reduce((a,b)=>a+b),frames:durations.map((durationMs,index)=>({index,x:index%6*S,y:Math.floor(index/6)*S,width:S,height:S,durationMs})),notes:'Stumble, fumble the snow bomb left and right, catch and settle. First and last frames are pixel-identical to waddlepop_idle.png. The corrected base face remains rigid, including both dark cheek contours. Flippers retain the base silhouette with very slight local movement (at most 0.78px horizontal and 1.44px vertical), while the original body sway and bomb wobble carry the action. Original artwork supplies the face and character interiors. Reconstructed exterior edges and bomb underside allow independent movement.'};fs.writeFileSync(root+'/waddlepop_flavor.json',JSON.stringify(meta,null,2));
const tiles=[];for(let n=0;n<N;n++)tiles.push({input:await sharp(PNG.sync.write(frames[n])).resize(256,256).flatten({background:n%2?'#322b39':'#e7e3ed'}).png().toBuffer(),left:n%6*256,top:Math.floor(n/6)*280});
// Keep inspected contact sheets immutable because desktop image viewers may
// hold their files open on Windows. A changed sheet gets a fresh review file.
const contactPath=root+'/contact-'+crypto.createHash('sha256').update(sheet.data).digest('hex').slice(0,12)+'.png';
if(!fs.existsSync(contactPath))fs.writeFileSync(contactPath,await sharp({create:{width:1536,height:1400,channels:4,background:'#eceaf0'}}).composite(tiles).png().toBuffer());
fs.writeFileSync(root+'/latest-contact.json',JSON.stringify({path:contactPath}));
console.log(JSON.stringify({frames:N,duration:meta.totalDurationMs,endpointsExact:frames[0].data.equals(base.data)&&frames[N-1].data.equals(base.data),baseSha:crypto.createHash('sha256').update(fs.readFileSync(root+'/base.png')).digest('hex')}));
})();
