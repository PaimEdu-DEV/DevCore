import tileset from '../assets/tileset.json';
import type { NpcId } from '../data/characters';

export const TILE = tileset.tileSize;

// Legenda: cada caractere vira um tile do tileset (src/game/assets/tileset.json).
const LEGEND: Record<string, { tile: string; solid: boolean }> = {
  '.': { tile: 'grass', solid: false },
  ',': { tile: 'grass2', solid: false },
  '*': { tile: 'flowers', solid: false },
  '=': { tile: 'path', solid: false },
  _: { tile: 'pathgrass', solid: false },
  p: { tile: 'plaza', solid: false },
  '~': { tile: 'water', solid: true },
  T: { tile: 'tree', solid: true },
  b: { tile: 'bush', solid: true },
  f: { tile: 'fence', solid: true },
  R: { tile: 'roof', solid: true },
  E: { tile: 'eave', solid: true },
  W: { tile: 'wall', solid: true },
  w: { tile: 'window', solid: true },
  D: { tile: 'door', solid: true },
  S: { tile: 'stonewall', solid: true },
  g: { tile: 'gatetop', solid: true },
  G: { tile: 'gate', solid: true },
  s: { tile: 'sign', solid: true },
  o: { tile: 'well', solid: true },
  c: { tile: 'crate', solid: true },
  l: { tile: 'lamp', solid: true },
};

// Vila do Portão: colisão traçada sobre o panorama (public/assets/world-v3/village.png,
// 576x408 = 24x17 tiles de 24px). # = sólido (casas, telhados, árvores, cercas, lampiões,
// penhascos), . = chão livre, G = portão do reino, o = poço.
// Ao trocar a imagem, refaça este desenho tile por tile sobre ela.
export const MAP_ROWS = [
  '########################', // 0  muralha, árvores e telhados
  '############GG##########', // 1  portão
  '############GG##########', // 2  escadaria do portão
  '##########.....#...#####', // 3  frente do portão
  '##########.....#..######', // 4
  '###########...##.#######', // 5
  '#...##.###......##..##.#', // 6  frente da casa dos livros e da forja
  '##......................', // 7  estrada principal
  '#..........#o#...#......', // 8  praça e poço
  '#########.##o#..########', // 9  telhado da taverna, canteiros, cerca do mercado
  '#########..###..########', // 10
  '##########.....#########', // 11
  '#########......#########', // 12 banco e mercado (barracas e bonecos de treino)
  '############.....#######', // 13
  '#########........#######', // 14 caminho de baixo
  '##............##########', // 15 frente da taverna, ponte
  '##..########..##########', // 16 trilha e ponte saindo do mapa
];

export const MAP_W = MAP_ROWS[0].length;
export const MAP_H = MAP_ROWS.length;

for (const [i, r] of MAP_ROWS.entries()) {
  if (r.length !== MAP_W) throw new Error(`Linha ${i} do mapa tem ${r.length} colunas (esperado ${MAP_W}).`);
}

export const TILE_INDEX: Record<string, number> = Object.fromEntries(tileset.tiles.map((name, i) => [name, i]));

export function tileAt(x: number, y: number): { tile: string; solid: boolean } {
  const ch = MAP_ROWS[y]?.[x];
  return (ch && LEGEND[ch]) || { tile: 'tree', solid: true };
}

export interface NpcPlacement {
  id: NpcId;
  x: number;
  y: number;
  flip?: boolean;
}

export const NPCS: NpcPlacement[] = [
  { id: 'orwin', x: 3, y: 6 }, // casa dos livros
  { id: 'isolde', x: 3, y: 15, flip: true }, // porta da taverna
  { id: 'garrick', x: 22, y: 6, flip: true }, // forja
  { id: 'maren', x: 15, y: 13 }, // ao lado do banco, perto do mercado
  { id: 'torvan', x: 15, y: 6 }, // perto do portão
  { id: 'elowen', x: 11, y: 15 }, // perto da ponte
];

/** Objetos com que dá para interagir (além dos NPCs). */
export type PropId = 'gate' | 'sign' | 'well';

export function propAt(x: number, y: number): PropId | null {
  const ch = MAP_ROWS[y]?.[x];
  if (ch === 'G' || ch === 'g') return 'gate';
  if (ch === 's') return 'sign';
  if (ch === 'o') return 'well';
  return null;
}

export const SPAWN = { x: 12, y: 12 };

export function isBlocked(x: number, y: number, extra: { x: number; y: number }[] = []): boolean {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  if (tileAt(x, y).solid) return true;
  return extra.some((o) => o.x === x && o.y === y);
}

/** Caminho mais curto (BFS) até um tile livre; usado no clique/toque para andar. */
export function findPath(from: { x: number; y: number }, to: { x: number; y: number }, blockers: { x: number; y: number }[]): { x: number; y: number }[] | null {
  const key = (x: number, y: number) => y * MAP_W + x;
  const prev = new Map<number, number>();
  const q: [number, number][] = [[from.x, from.y]];
  prev.set(key(from.x, from.y), -1);
  while (q.length) {
    const [x, y] = q.shift()!;
    if (x === to.x && y === to.y) {
      const path: { x: number; y: number }[] = [];
      let k = key(x, y);
      while (k !== key(from.x, from.y)) {
        path.unshift({ x: k % MAP_W, y: Math.floor(k / MAP_W) });
        k = prev.get(k)!;
      }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (prev.has(key(nx, ny)) || isBlocked(nx, ny, blockers)) continue;
      prev.set(key(nx, ny), key(x, y));
      q.push([nx, ny]);
    }
  }
  return null;
}
