import { getImage } from '../assets/sprites';
import { tileAt } from './map';
export function drawProp(c:CanvasRenderingContext2D,name:string,x:number,y:number,tx:number,ty:number) {
 const r=(a:number,b:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x+a,y+b,w,h);};

 if(name==='stallEnd'||name==='cartEnd')return;
 if(name==='bench') {
  r(2,19,21,4,'#283126');r(4,10,3,12,'#443626');r(19,10,3,12,'#443626');
  r(1,8,23,3,'#94734b');r(1,9,23,1,'#b99965');r(1,14,23,4,'#826341');r(2,14,21,1,'#b99965');return;
 }
 if(name==='barrel') {
  r(5,3,14,20,'#322b24');r(3,6,18,15,'#4a382b');r(5,4,13,18,'#846341');
  for(let a=7;a<19;a+=4)r(a,5,1,16,'#af8654');for(const b of [7,17]){r(3,b,18,3,'#343d38');r(4,b,15,1,'#768074');}
  r(6,3,11,2,'#b49768');return;
 }
 if(name==='flowers') {
  r(1,9,22,14,'#4e4431');r(2,9,20,2,'#8f8262');
  for(let i=0;i<5;i++){const a=3+i*4,b=8+(i%2)*4;r(a,b,2,10,'#344b2b');r(a-1,b,4,3,i%2?'#ba9d60':'#a36c73');r(a,b,1,1,'#dbbd83');}return;
 }
 if(name==='rock'){r(3,16,19,7,'#303b30');r(4,13,15,8,'#6c7160');r(7,11,10,5,'#93937c');r(6,13,8,1,'#b0aa8a');return;}
 if(name==='cart') {
  r(1,9,43,11,'#362d24');r(3,8,39,10,'#8b6943');for(let i=5;i<42;i+=6)r(i,9,1,9,'#4b3929');
  r(1,5,43,3,'#b2905b');r(1,18,43,2,'#c09b64');r(5,18,7,7,'#252b26');r(33,18,7,7,'#252b26');r(7,19,3,4,'#94794f');r(35,19,3,4,'#94794f');r(43,12,7,2,'#684e32');return;
 }
 if(name==='stall') {
  r(0,21,48,3,'#283126');r(2,-12,3,35,'#523b28');r(43,-12,3,35,'#523b28');
  r(0,-17,48,14,'#292e26');for(let i=0;i<6;i++){r(i*8,-16,8,12,i%2?'#b3a07b':'#596b55');r(i*8,-4,8,3,i%2?'#887956':'#384b39');}
  r(1,12,46,10,'#795b39');r(1,11,46,3,'#b19261');
  for(let i=0;i<8;i++){r(4+i*5,7,4,4,i%2?'#b88a4d':'#7d8c47');r(5+i*5,7,2,1,'#c8b16e');}return;
 }
 if(name==='well') {const img=getImage('assets/world-v2/well.png');if(img)c.drawImage(img,x-4,y+24-img.height);return;}
 if(name==='fence') {
  const vertical=tileAt(tx,ty-1).tile==='fence'||tileAt(tx,ty+1).tile==='fence';
  const horizontal=tileAt(tx-1,ty).tile==='fence'||tileAt(tx+1,ty).tile==='fence';
  r(1,21,23,3,'#33392a');
  if(horizontal)for(const yy of [7,15]) {r(0,yy,24,4,'#392c25');r(0,yy,24,1,'#ab8c60');r(0,yy+1,24,1,'#786144');}
  if(vertical) {r(10,-5,4,28,'#392c25');r(10,-5,1,28,'#9a8057');}
  r(8,1,6,23,'#302820');r(9,2,3,20,'#806646');r(9,2,1,20,'#b1986b');r(9,7,2,1,'#242825');r(9,16,2,1,'#242825');return;
 }
 if(name==='lamp') {r(10,-10,3,34,'#242b29');r(10,-10,1,33,'#7b7760');r(6,-20,11,12,'#292c25');r(8,-18,7,8,'#b5803f');r(9,-17,4,6,'#f3cd7b');r(6,-21,11,2,'#918367');r(8,22,8,2,'#30392b');return;}
 if(name==='sign') {r(11,4,3,20,'#49382a');r(2,0,21,13,'#352c25');r(3,1,19,10,'#92764f');r(4,2,17,1,'#c1a477');r(6,5,11,1,'#59452f');r(6,8,8,1,'#59452f');return;}
 if(name==='crate') {r(2,5,20,19,'#352e26');r(3,6,17,15,'#96744a');for(let i=4;i<20;i+=4)r(i,7,1,14,'#634a32');r(3,6,17,2,'#bb9862');r(3,20,18,2,'#bd9760');for(let i=0;i<15;i++)r(4+i,7+i,2,1,'#c09b65');return;}
 // Low bramble clusters keep southern boundary visible without hiding actors.
 for(let i=0;i<5;i++){const xx=i*5-1,yy=12+(i%2)*3;r(xx,yy,9,9,'#283c2a');r(xx,yy-2,7,7,'#455a32');r(xx+1,yy-2,4,2,'#7b8247');}
}
