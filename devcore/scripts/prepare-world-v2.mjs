import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const assets=[['house',120],['forge',120],['oak',60],['well',32],['gate',168],['zombie',null,42],['valley',512]];
await mkdir('public/assets/world-v2',{recursive:true});
const inventory=[];
for(const [name,width,height] of assets){
 let pipeline=sharp(`art/world-v2/${name}-source.png`);
 if(name!=='valley')pipeline=pipeline.trim();
 await pipeline.resize({width:width??undefined,height:height??undefined,kernel:'nearest'}).png().toFile(`public/assets/world-v2/${name}.png`);
 const m=await sharp(`public/assets/world-v2/${name}.png`).metadata();
 const {data,info}=await sharp(`public/assets/world-v2/${name}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let transparent=0;for(let i=3;i<data.length;i+=4)if(data[i]===0)transparent++;
 if(name!=='valley'&&transparent===0)throw Error(`${name}: missing transparent background`);
 inventory.push({name,width:m.width,height:m.height,alpha:m.hasAlpha,transparentPixels:transparent,channels:info.channels});
}
await writeFile('art/world-v2/inventory.json',JSON.stringify(inventory,null,2)+'\n');
console.log(inventory);
