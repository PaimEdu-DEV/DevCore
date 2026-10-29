import { describe, it, expect } from 'vitest';
import { MAP_W, MAP_H, NPCS, SPAWN, isBlocked, findPath, propAt } from './map';
import { BUILDINGS, DECOR } from './layout';
describe('village composition navigation',()=>{
 it('keeps every NPC and interactive prop reachable from the entrance',()=>{
  const targets=[...NPCS];
  expect(isBlocked(SPAWN.x,SPAWN.y,NPCS)).toBe(false);
  const check=(x:number,y:number)=>expect([[0,1],[1,0],[-1,0],[0,-1]].some(([dx,dy])=>!isBlocked(x+dx,y+dy,NPCS)&&findPath(SPAWN,{x:x+dx,y:y+dy},NPCS)!==null),`unreachable ${x},${y}`).toBe(true);
  for(const n of targets){expect(isBlocked(n.x,n.y)).toBe(false);check(n.x,n.y);}
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++)if(propAt(x,y))check(x,y);
 });
 it('uses solid foundations and decor footprints without occupying NPCs',()=>{
  for(const h of BUILDINGS)for(let y=h.y;y<h.y+h.h;y++)for(let x=h.x;x<h.x+h.w;x++)expect(isBlocked(x,y)).toBe(true);
  for(const d of DECOR){expect(isBlocked(d.x,d.y)).toBe(true);expect(NPCS.some(n=>n.x===d.x&&n.y===d.y)).toBe(false);}
 });
});
