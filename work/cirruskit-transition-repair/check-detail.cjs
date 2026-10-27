const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
sharp('work/cirruskit-transition-repair/generated-cleanup.png').extract({left:185,top:240,width:300,height:185}).resize(1200,740,{kernel:'nearest'}).flatten({background:'#f3f1f7'}).png().toFile('work/cirruskit-transition-repair/generated-detail.png');
