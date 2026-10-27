const {execFileSync}=require('child_process');
for(const name of ['prepare','build','seal-sampling-gaps','review','check-ink','check-seams','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-ink-finish/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-ink-finish/audit.cjs'],{stdio:'inherit'});
