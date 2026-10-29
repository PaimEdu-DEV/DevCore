import sharp from 'sharp';
const names=['hooded','necromancer','glitch'];
for(const name of names){
 const input=`art/enemies-v3/${name==='hooded'?'hooded-alpha':name}.png`;
 const meta=await sharp(input).metadata();
 if(!meta.hasAlpha)throw Error(`${name}: alpha required`);
 const pieces=[];
 for(let row=0;row<5;row++)for(let col=0;col<4;col++){
  const left=Math.round(col*meta.width/4),top=Math.round(row*meta.height/5);
  const width=Math.round((col+1)*meta.width/4)-left,height=Math.round((row+1)*meta.height/5)-top;
  const frame=await sharp(input).extract({left,top,width,height}).resize({width:48,kernel:'nearest'}).toBuffer();
  pieces.push({input:frame,left:col*64+8,top:row*52+2});
 }
 await sharp({create:{width:256,height:260,channels:4,background:'#00000000'}}).composite(pieces).png().toFile(`public/assets/enemies-v3/${name}.png`);
}
