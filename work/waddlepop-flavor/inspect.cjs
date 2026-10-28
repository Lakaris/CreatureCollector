const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{await sharp('work/waddlepop-flavor/base.png').extract({left:110,top:190,width:290,height:200}).resize(870,600,{kernel:'nearest'}).flatten({background:'#dddde4'}).toFile('work/waddlepop-flavor/join-review.png');})();
