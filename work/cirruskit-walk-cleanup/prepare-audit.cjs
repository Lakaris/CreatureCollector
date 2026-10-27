const fs=require('fs');
let code=fs.readFileSync('work/cirruskit-walk-rebuild/audit.cjs','utf8')
 .replace("const root='work/cirruskit-walk-rebuild'","const root='work/cirruskit-walk-cleanup'")
 .replace('`${root}/protected-hashes.json`',"'work/cirruskit-walk-rebuild/protected-hashes.json'")
 .replace('const report={','const report={joins:JSON.parse(fs.readFileSync(`${root}/join-audit.json`)),cleanup:JSON.parse(fs.readFileSync(`${root}/layer-audit.json`)),')
 .replace("method:'New separate leg layers rotate at hip/shoulder pivots in synchronized diagonal pairs. Original face, mane and tail art retained. ImageGen supplied the hidden body backing plate.'","method:'Existing gait preserved exactly. Built-in image editing repaired the four isolated leg cutouts; colors matched to original limb palettes. Solid limbs with complete outlines move beneath a stationary belly/hip layer. Original face, mane and tail artwork retained.'");
fs.writeFileSync('work/cirruskit-walk-cleanup/audit.cjs',code);
