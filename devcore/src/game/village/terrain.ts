import { MAP_W, MAP_H, TILE, tileAt } from './map';
import { PLAZA, ROUTES, BUILDINGS } from './layout';
const hash = (x:number,y:number) => { let n=Math.imul(x+471,374761393)^Math.imul(y+91,668265263); n=Math.imul(n^(n>>>13),1274126177); return (n>>>0)/4294967296; };
function segmentDistance(x:number,y:number,a:readonly number[],b:readonly number[]) {
 const ax=a[0]*TILE,ay=a[1]*TILE,dx=(b[0]-a[0])*TILE,dy=(b[1]-a[1])*TILE;
 const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(x-ax-t*dx,y-ay-t*dy);
}
export function drawTerrain(c:CanvasRenderingContext2D) {
 const w=MAP_W*TILE,h=MAP_H*TILE,mask=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
  let distance=Infinity;
  for(const route of ROUTES)for(let i=1;i<route.points.length;i++)distance=Math.min(distance,segmentDistance(x,y,route.points[i-1],route.points[i])-route.width);
  const ellipse=Math.hypot((x-PLAZA.x*TILE)/(PLAZA.rx*TILE),(y-PLAZA.y*TILE)/(PLAZA.ry*TILE));
  const edge=Math.sin(x*.17)*1.5+Math.sin(y*.23)*1.1;
  const water=tileAt(Math.floor(x/TILE),Math.floor(y/TILE)).tile==='water';
  const foundation=BUILDINGS.some(b=>x>b.x*TILE-3&&x<(b.x+b.w)*TILE+3&&y>(b.y+b.h)*TILE-13&&y<(b.y+b.h)*TILE+7);
  const paved=ellipse<.88+edge*.005||foundation;
  const dirt=distance<edge||ellipse<1+edge*.008;
  const fringe=distance<edge+5||ellipse<1.08;
  const type=water?3:paved?2:dirt?1:fringe?4:0;mask[y*w+x]=type;
  c.fillStyle=['#3f4b35','#716047','#82765e','#30494a','#53543b'][type];c.fillRect(x,y,1,1);
 }
 for(let y=2;y<h-4;y+=4)for(let x=2;x<w-6;x+=5) {
  const n=hash(x,y),xx=x+Math.floor(n*3),yy=y+Math.floor(hash(y,x)*2),type=mask[yy*w+xx];
  if((type===2&&n>.13)||(type===1&&n>.66)) {
   c.fillStyle=n>.7?'#a3997c':'#91856a';c.fillRect(xx,yy,3+Math.floor(n*3),2);c.fillStyle='#514c3c';c.fillRect(xx+1,yy+2,3,1);
  }else if((type===0||type===4)&&n>.68) {
   c.fillStyle=type===4?'#6a6b45':n>.9?'#647049':'#4b593b';c.fillRect(xx,yy,3,1);c.fillRect(xx+1,yy-1,1,2);
  }else if(type===3&&n>.86){c.fillStyle='#59736d';c.fillRect(xx,yy,5,1);}
 }
 // Worn circular paving ties the well, benches and market frontage together.
 for(let angle=0;angle<Math.PI*2;angle+=.095) {
  const x=Math.round(PLAZA.x*TILE+Math.cos(angle)*PLAZA.rx*TILE*.92);
  const y=Math.round(PLAZA.y*TILE+Math.sin(angle)*PLAZA.ry*TILE*.92);
  c.fillStyle='#6b6851';c.fillRect(x,y,4,2);
 }
 for(let y=3;y<h-3;y+=5)for(let x=3;x<w-3;x+=5)if(mask[y*w+x]===3&&[mask[y*w+x+3],mask[y*w+x-3],mask[(y-3)*w+x],mask[(y+3)*w+x]].some(v=>v!==3)) {
  c.fillStyle='#363e32';c.fillRect(x-2,y-1,6,4);c.fillStyle='#85836b';c.fillRect(x-2,y-2,5,3);
 }
}
