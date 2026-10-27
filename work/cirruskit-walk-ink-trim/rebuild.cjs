const {execFileSync}=require('child_process');
for(const name of ['prepare','build','check','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-ink-trim/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
