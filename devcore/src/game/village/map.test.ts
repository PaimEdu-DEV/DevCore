import { describe, it, expect } from 'vitest';
import { MAP_W, MAP_H, NPCS, SPAWN, TILE, isBlocked, findPath, propAt } from './map';

describe('colisão da vila (panorama)', () => {
  it('o mapa cobre exatamente a imagem de 576x408', () => {
    expect([MAP_W * TILE, MAP_H * TILE]).toEqual([576, 408]);
  });

  it('todo NPC e objeto interativo pode ser alcançado a partir da entrada', () => {
    expect(isBlocked(SPAWN.x, SPAWN.y, NPCS)).toBe(false);
    const reachable = (x: number, y: number) =>
      [[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => !isBlocked(x + dx, y + dy, NPCS) && findPath(SPAWN, { x: x + dx, y: y + dy }, NPCS) !== null);
    for (const n of NPCS) {
      expect(isBlocked(n.x, n.y), `${n.id} em cima de algo sólido`).toBe(false);
      expect(reachable(n.x, n.y), `${n.id} inalcançável`).toBe(true);
    }
    // cada objeto (portão, poço) precisa de pelo menos um tile alcançável
    const kinds = new Map<string, boolean>();
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      const p = propAt(x, y);
      if (p) kinds.set(p, (kinds.get(p) ?? false) || reachable(x, y));
    }
    for (const [kind, ok] of kinds) expect(ok, `${kind} inalcançável`).toBe(true);
  });

  it('construções, árvores e penhascos são sólidos', () => {
    const solid: [number, number, string][] = [
      [2, 3, 'casa dos livros'], [5, 4, 'banca de livros'], [2, 11, 'taverna'], [6, 10, 'barris da taverna'],
      [21, 4, 'forja'], [20, 6, 'bancada da forja'], [10, 1, 'torre do portão'], [12, 1, 'portão'],
      [7, 4, 'árvore'], [19, 10, 'barraca do mercado'], [17, 12, 'pilar do mercado'], [5, 16, 'penhasco'], [18, 15, 'penhasco'],
    ];
    for (const [x, y, what] of solid) expect(isBlocked(x, y), what).toBe(true);
  });

  it('caminhos de terra e pedra são livres', () => {
    const free: [number, number, string][] = [
      [12, 3, 'frente do portão'], [3, 7, 'estrada oeste'], [12, 7, 'estrada'], [22, 7, 'estrada leste'],
      [12, 11, 'praça'], [14, 14, 'caminho de baixo'], [4, 15, 'frente da taverna'], [12, 16, 'ponte'],
    ];
    for (const [x, y, what] of free) expect(isBlocked(x, y), what).toBe(false);
  });

  it('o portão é interativo logo acima da frente do portão', () => {
    expect(propAt(12, 2)).toBe('gate');
    expect(propAt(12, 8)).toBe('well');
  });
});
