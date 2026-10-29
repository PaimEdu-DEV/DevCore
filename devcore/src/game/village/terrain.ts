import { MAP_W, MAP_H, TILE, tileAt } from './map';
// Stable world-space texture: never repeated rectangular tile patches.
const hash=(x:number,y:number)=>{let n=Math.imul(x+471,374761393)^Math.imul(y+91,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967296;};
const road=(x:number,y:number)=>['path','pathgrass','plaza'].includes(tileAt(x,y).tile);
export function drawTerrain(c:CanvasRenderingContext2D) {
 const w=MAP_W*TILE,h=MAP_H*TILE;
 const mask=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
  const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE),name=tileAt(tx,ty).tile;
  const noise=Math.sin(x*.19)*1.8+Math.sin(y*.27)*1.4;
  let path=road(tx,ty);
  if(!path)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
   if(!road(tx+dx,ty+dy))continue;
   const edge=dx===1?TILE-x%TILE:dx===-1?x%TILE:dy===1?TILE-y%TILE:y%TILE;
   if(edge<3+noise)path=true;
  }
  const bank=name==='water' && (x > 134 + Math.sin(y*.09)*5 || y < 271 + Math.sin(x*.08)*5 || y > 330 + Math.sin(x*.07)*4);
  const water=name==='water'&&!bank; mask[y*w+x]=bank?3:water?2:path?1:0;
  c.fillStyle=bank?'#5c6448':water?'#304b4d':path?'#897458':'#46513a';c.fillRect(x,y,1,1);
 }
 // Grouped stones with top light and lower mortar. Space between clusters stays calm.
 for(let y=2;y<h-4;y+=4)for(let x=2;x<w-5;x+=5) {
  const n=hash(x,y),xx=x+Math.floor(n*3),yy=y+Math.floor(hash(y,x)*2),m=mask[yy*w+xx];
  if(m===1&&n>.16) {
   c.fillStyle=n>.7?'#b1a184':'#9b896d';c.fillRect(xx,yy,3+Math.floor(n*3),2);
   c.fillStyle='#695d49';c.fillRect(xx+1,yy+2,3,1);
   if(n>.65){c.fillStyle='#c0b18f';c.fillRect(xx+1,yy,2,1);}
  } else if(m===3) { c.fillStyle=n>.5?'#929079':'#70725c';c.fillRect(xx,yy,4,3);c.fillStyle='#3a4437';c.fillRect(xx+1,yy+3,4,1);
  } else if(m===0&&n>.65) {
   c.fillStyle=n>.87?'#63714a':'#505e3e';c.fillRect(xx,yy,3,1);c.fillRect(xx+1,yy-1,1,2);
  } else if(m===2&&n>.8) {c.fillStyle='#69847a';c.fillRect(xx,yy,5,1);}
 }
 // Natural bank stones follow water boundaries, making the blocked shore legible.
 for(let y=3;y<h-3;y+=5)for(let x=3;x<w-3;x+=5)if(mask[y*w+x]===2&&[mask[y*w+x+3],mask[(y-3)*w+x],mask[(y+3)*w+x]].some(v=>v!==2)) {
  c.fillStyle='#3a4237';c.fillRect(x-2,y-1,6,4);c.fillStyle='#81806a';c.fillRect(x-2,y-2,5,3);c.fillStyle='#a09a7a';c.fillRect(x-1,y-2,3,1);
 }
}
