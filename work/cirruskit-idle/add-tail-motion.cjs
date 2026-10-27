const fs=require('fs');
let p='work/cirruskit-idle/make-breath.cjs',s=fs.readFileSync(p,'utf8');
s=s.replace('C:/Users/Annie/Documents/Codex/2026-10-26/can-you-create-a-512-512/outputs/cirruskit-critters-512-v3.png','images/cirruskit/cirruskit_base.png');
s=s.replace('function offset(x,y,t){let body=smooth(155,245,x),foot=1-smooth(350,425,y);return [t*(x-335)*.008*Math.exp(-Math.pow((y-325)/90,2))*body*foot,-t*4*body*foot];}',`function offset(x,y,t,phase){let body=smooth(155,245,x),foot=1-smooth(350,425,y);const tail=(1-smooth(205,220,x))*(1-smooth(175,310,y));return [t*(x-335)*.008*Math.exp(-Math.pow((y-325)/90,2))*body*foot+7*phase*tail,-t*4*body*foot+0.8*phase*tail];}`);
s=s.replace('offset(sx,sy,amounts[n])','offset(sx,sy,amounts[n],Math.sin(2*Math.PI*n/7))');
s=s.replace('Maximum head movement 4px; feet remain planted.','Maximum head movement 4px; tail tip sways up to 7px sideways; feet remain planted.');
fs.writeFileSync(p,s);
let a='work/cirruskit-idle/assemble-idle.cjs',v=fs.readFileSync(a,'utf8');v=v.replace('gentle idle breathing','breathing and gentle tail swish').replace('Cirruskit standing with a gentle breathing motion','Cirruskit breathing gently with a slight tail swish').replace('src="cirruskit_idle_preview.png"','src="cirruskit_idle_preview.png?tail-swish=1"');fs.writeFileSync(a,v);
