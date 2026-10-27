const {execFileSync}=require('child_process');
for(const name of ['prepare','build','seal-sampling-gaps','review','check-seams','check-preservation','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-chest-finish/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-chest-finish/audit.cjs'],{stdio:'inherit'});
