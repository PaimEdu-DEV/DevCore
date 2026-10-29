import { BUILDINGS } from './layout';
import { getImage } from '../assets/sprites';
import { TILE } from './map';
export const WORLD_ASSETS = ['assets/world-v2/house.png', 'assets/world-v2/oak.png', 'assets/world-v2/well.png', 'assets/world-v2/gate.png', 'assets/world-v2/forge.png'];
export const HOUSES = BUILDINGS;
export const isHouseTile = (x: number, y: number) => HOUSES.some(h => x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h);
export function drawHouse(c: CanvasRenderingContext2D, x: number, y: number, width: number, forge = false) {
  const img=getImage(forge ? 'assets/world-v2/forge.png' : WORLD_ASSETS[0]);
  if(!img) return;
  // Native 120x128 bitmap; door clearance 27px against 30px village actors.
  const left=Math.round(x+(width*TILE-img.width)/2), base=y+2*TILE;
  c.fillStyle='#263329'; c.fillRect(left+14,base-4,img.width-22,5);
  c.drawImage(img,left,base-img.height);
}
export function drawOak(c:CanvasRenderingContext2D,x:number,feet:number) {
  const img=getImage(WORLD_ASSETS[1]); if(img)c.drawImage(img,Math.round(x-img.width/2),Math.round(feet-img.height));
}
