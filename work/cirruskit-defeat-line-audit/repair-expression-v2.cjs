const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'),root='work/cirruskit-defeat-line-audit',S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png');
function largest(p,box,test){const seen=new Uint8Array(S*S);let largest=[];for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){const k=y*S+x;if(seen[k]||!test(p.data,k*4))continue;const q=[k];seen[k]=1;for(let a=0;a<q.length;a++){const v=q[a],xx=v%S,yy=v>>9;for(const [nx,ny]of [[xx-1,yy],[xx+1,yy],[xx,yy-1],[xx,yy+1]]){if(nx<box[0]||nx>=box[2]||ny<box[1]||ny>=box[3])continue;const j=ny*S+nx;if(!seen[j]&&test(p.data,j*4)){seen[j]=1;q.push(j);}}}if(q.length>largest.length)largest=q;}return largest;}
function dilate(component,r){const mask=new Uint8Array(S*S);for(const k of component){const x=k%S,y=k>>9;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=(r+.5)**2)mask[(y+dy)*S+x+dx]=1;}return mask;}
const dark=(d,i)=>d[i]<70&&d[i+1]<50&&d[i+2]>d[i+1],oldMouth=dilate(largest(base,[360,257,448,291],dark),3),noseMask=dilate(largest(base,[382,231,432,269],(d,i)=>d[i]>d[i+1]*1.25&&d[i+1]>d[i+2]*1.25),1);
const gray=(i)=>!oldMouth[i/4]&&base.data[i]>108&&base.data[i]<150&&Math.abs(base.data[i]-base.data[i+1])<7&&base.data[i+2]-base.data[i]>8;
function background(x,y){const i=(y*S+x)*4;if(gray(i))return [...base.data.subarray(i,i+3)];let sum=[0,0,0],weight=0;for(let r=2;r<=24;r+=2){for(let dy=-r;dy<=r;dy+=r)for(let dx=-r;dx<=r;dx+=r){if(!dx&&!dy)continue;const j=((y+dy)*S+x+dx)*4;if(!gray(j))continue;const w=1/(dx*dx+dy*dy);for(let c=0;c<3;c++)sum[c]+=base.data[j+c]*w;weight+=w;}if(weight&&r>=10)break;}return weight?sum.map(v=>Math.round(v/weight)):[126,124,141];}
for(const name of ['dazed','defeat']){const p=read(`work/cirruskit-defeat/inputs/${name}.png`),original=Buffer.from(p.data),newEye=dilate(largest(p,[420,192,474,249],dark),2);let mouth=new Uint8Array(S*S);
 if(name==='defeat')mouth=dilate(largest(p,[366,263,449,304],(d,i)=>dark(d,i)||(d[i]>160&&d[i]>d[i+1]*1.25&&d[i+2]>65)),1);
 // Copy back the original muzzle, then remove just the connected old smile.
 if(name==='defeat')for(let y=252;y<307;y++)for(let x=360;x<452;x++){const i=(y*S+x)*4;base.data.copy(p.data,i,i,i+3);if(oldMouth[y*S+x])p.data.set(background(x,y),i);}
 for(let y=231;y<273;y++)for(let x=381;x<439;x++){const i=(y*S+x)*4;if(newEye[y*S+x])continue;const r=base.data[i],g=base.data[i+1],b=base.data[i+2],brown=r>g*1.35&&g>b*1.3;
  if(name==='defeat'&&oldMouth[y*S+x])p.data.set(background(x,y),i);else if(brown||gray(i)||y>=258)base.data.copy(p.data,i,i,i+3);else p.data.set(background(x,y),i);}
 if(name==='defeat')for(let k=0;k<mouth.length;k++)if(mouth[k])original.copy(p.data,k*4,k*4,k*4+3);
 for(let k=0;k<noseMask.length;k++)if(noseMask[k])base.data.copy(p.data,k*4,k*4,k*4+3);
 fs.writeFileSync(`${root}/inputs/${name}.png`,PNG.sync.write(p));
}
console.log('Restored the original muzzle and isolated the intended mouth shape.');
