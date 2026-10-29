/** Composition and solid footprints share this source. Positions are tile units. */
export const BUILDINGS = [
  { x: 3, y: 4, w: 5, h: 2, kind: 'house' },
  { x: 2, y: 8, w: 5, h: 2, kind: 'house' },
  { x: 17, y: 6, w: 5, h: 2, kind: 'forge' },
] as const;
export const GATE = { x: 12, y: 3 };
export const PLAZA = { x: 12.5, y: 11, rx: 2.7, ry: 2.2 };
export const ROUTES = [
  { width: 15, points: [[12.5,4],[12.5,7],[12,9],[12.5,11],[12.5,14],[11.5,17],[12,19]] },
  { width: 10, points: [[5.5,6],[7,6.5],[9,7],[12.5,7],[16,8.5],[19,8]] },
  { width: 10, points: [[4.5,10],[6,11],[9,11.5],[12.5,11],[16,12],[19,13.5],[21,15]] },
  { width: 8, points: [[7,6.5],[8,8.5],[7,10],[8,15],[11.5,17]] },
] as const;
export const DECOR = [
  {x:10,y:9,kind:'bench'}, {x:14,y:12,kind:'bench'},
  {x:10,y:12,kind:'flowers'}, {x:14,y:10,kind:'flowers'},
  {x:17,y:11,kind:'stall'}, {x:18,y:11,kind:'stallEnd'},
  {x:20,y:12,kind:'barrel'}, {x:21,y:12,kind:'crate'},
  {x:20,y:14,kind:'cart'}, {x:21,y:14,kind:'cartEnd'},
  {x:17,y:8,kind:'barrel'}, {x:21,y:8,kind:'crate'},
  {x:3,y:6,kind:'flowers'}, {x:2,y:10,kind:'barrel'},
  {x:3,y:11,kind:'flowers'}, {x:6,y:6,kind:'bench'},
  {x:7,y:14,kind:'rock'}, {x:6,y:16,kind:'rock'},
  {x:18,y:15,kind:'flowers'}, {x:19,y:15,kind:'fence'},
  {x:20,y:15,kind:'fence'}, {x:21,y:15,kind:'fence'},
] as const;
// Irregular groves, with low undergrowth defining the rest of the boundary.
export const TREES = [
 {x:1,y:3},{x:2,y:2},{x:4,y:2},{x:8,y:3},
 {x:21,y:3},{x:22,y:4},{x:20,y:2},
 {x:1,y:12},{x:2,y:13},{x:1,y:15},
 {x:22,y:10},{x:23,y:12},{x:22,y:17},{x:20,y:18},
 {x:3,y:18},{x:5,y:19},{x:7,y:18},{x:16,y:19},
];
