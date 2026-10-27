const {execFileSync}=require('child_process');
for(const name of ['prepare','build','seal-sampling-gaps','review','check-ownership','check-seams','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-tail-join/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-tail-join/audit.cjs'],{stdio:'inherit'});
