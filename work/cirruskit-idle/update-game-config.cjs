const fs=require('fs'),file='src/data/creatureArt.js';let s=fs.readFileSync(file,'utf8');
const old='idle: { src: "images/cirruskit/cirruskit_idle.png", frames: 8, columns: 4, durations: [300, 300, 300, 300, 300, 300, 300, 300] }';
const updated='idle: { src: "images/cirruskit/cirruskit_idle.png", frames: 30, columns: 6, durations: Array(30).fill(80) }';
if(!s.includes(old))throw Error('Idle configuration changed; inspect before editing.');
s=s.replace(old,updated).replace('Idle is a 4x2 grid breathing loop (2.4s)','Idle is a 6x5 grid breathing loop (30 frames at 80ms; 2.4s)');fs.writeFileSync(file,s);
