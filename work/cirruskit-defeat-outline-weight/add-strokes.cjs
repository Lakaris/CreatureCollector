const fs=require('fs'),p='work/cirruskit-defeat-outline-weight/build.cjs';let s=fs.readFileSync(p,'utf8');const code=`
// Restore the original stroke weight after deformation, in final frame pixels.
// Open attachment cuts are excluded; only actual silhouette edges are inked.
function reinkPart(buf,name,sx,sy){
 const settings={nearHind:[0,10,399],nearFront:[4,11,382],farFront:[5,10,382],farHind:[4,9,398],body:[1,6,0]};
 if(!settings[name])return;const [outset,total,start]=settings[name],old=Buffer.from(buf.data),field=new Float32Array(S*S);field.fill(1000);
 const physical=(x,y,k)=>{if(name==='body'){const xx=sx[k],yy=sy[k];return (yy>365&&xx>200&&yy>(underside[Math.round(xx)]||420)-10)||(yy>350&&xx<155&&xx<(backEdge[Math.round(yy)]||0)+10);}if(sy[k]<start)return false;return true;};
 for(let y=1;y<S-1;y++)for(let x=1;x<S-1;x++){const k=y*S+x;if(old[k*4+3]<128||![k-1,k+1,k-S,k+S].some(j=>old[j*4+3]<128)||!physical(x,y,k))continue;
  const r=Math.ceil(Math.max(outset,total-outset)+1);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=S||yy<0||yy>=S)continue;const j=yy*S+xx,d=Math.hypot(dx,dy);if(d<field[j])field[j]=d;}
 }
 for(let k=0;k<field.length;k++){const i=k*4,a=old[i+3]/255,d=field[k];if(d===1000)continue;
  if(a>=.5){const coverage=Math.max(0,Math.min(1,total-outset-.5-d));if(!coverage)continue;for(let c=0;c<3;c++)buf.data[i+c]=Math.round(old[i+c]*(1-coverage)+[30,2,12][c]*coverage);}
  else if(outset){const coverage=Math.max(0,Math.min(1,outset+.5-d));if(!coverage)continue;const oa=a+coverage*(1-a);for(let c=0;c<3;c++)buf.data[i+c]=Math.round((old[i+c]*a+[30,2,12][c]*coverage*(1-a))/oa);buf.data[i+3]=Math.round(oa*255);}
 }
}
`;
s=s.replace('function seal(out)',code+'\nfunction seal(out)');fs.writeFileSync(p,s);
