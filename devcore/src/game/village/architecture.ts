import { TILE } from './map';

// Complete three-quarter buildings. Footprints retain the navigation grid.
export const HOUSES = [{ x: 1, y: 1, w: 4 }, { x: 16, y: 1, w: 3 }, { x: 2, y: 6, w: 4 }];
export const isHouseTile = (x: number, y: number) => HOUSES.some(h => x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + 3);
export function drawHouse(c: CanvasRenderingContext2D, x: number, y: number, width: number) {
  const r = (a: number,b: number,w: number,h: number,color: string) => { c.fillStyle=color; const top = b < 33 ? b - 18 : b < 62 ? 15 + (b-33)*1.62 : b; const height = b >= 33 && b < 62 ? h*1.62 : h; c.fillRect(x+a,Math.round(y+top),w,Math.round(height)); };
  const w = width * TILE;
  r(5,65,w-6,7,'#233027');
  r(4,30,w-8,39,'#211f24');
  r(7,33,w-22,31,'#b09b72');
  r(w-15,32,11,33,'#645b4c');
  r(7,62,w-11,7,'#585c56');
  for(let a=9;a<w-12;a+=13) { r(a,63,10,2,'#919084'); r(a+3,67,9,1,'#343d3a'); }
  for(const a of [8,Math.floor(w/2)-5,w-20]) r(a,33,3,29,'#493b31');
  r(7,47,w-22,3,'#493b31');
  r(19,38,19,29,'#302a27'); r(21,39,15,28,'#67503b');
  r(23,46,2,20,'#91704b'); r(31,57,2,2,'#d7b875'); r(18,68,20,3,'#999485');
  r(w-39,39,13,15,'#403832'); r(w-37,41,9,11,'#d0ac65');
  r(w-34,41,2,11,'#63523d'); r(w-37,46,9,2,'#63523d');
  // Sloped roof in horizontal pixel clusters; dark right return gives volume.
  for(let row=0;row<30;row++) {
    const inset=Math.max(0,14-Math.floor(row/2));
    r(inset,3+row,w-inset*2,1,row<4?'#ad8865':row%7===0?'#4c3c38':'#76564b');
    r(w-inset-12,3+row,12,1,'#493d3c');
  }
  for(let row=10;row<30;row+=7) for(let a=16+(row%2)*5;a<w-16;a+=12) r(a,row,8,1,'#977361');
  r(0,33,w,4,'#292b2a'); r(1,33,w-13,1,'#c19b70');
  r(w-28,0,9,13,'#565852'); r(w-30,0,13,3,'#959184');
}
