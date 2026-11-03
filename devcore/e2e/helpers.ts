import type { Page } from '@playwright/test';
import fs from 'node:fs';

export const SHOTS = process.env.SHOTS_DIR ?? 'test-results/shots';

/** Cria um save pronto no localStorage antes de abrir a página. */
export async function seedSave(page: Page, opts: { heroClass: 'alchemist' | 'mage'; gender?: 'm' | 'f'; name?: string; extra?: Record<string, unknown> }) {
  await page.addInitScript((o) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const now = new Date().toISOString();
    const save = {
      version: 2,
      createdAt: now,
      updatedAt: now,
      player: { name: o.name ?? 'Teste', gender: o.gender ?? 'm', heroClass: o.heroClass },
      stats: { xp: 0, coins: 200, runs: 0, testsPassed: 0, errors: 0, hintsUsed: 0, lessonsDone: 0, bossesDefeated: 0, flawlessPhases: 0, defeats: 0, lightningBest: 0, dailyDone: 0, coinsSpent: 0, playTimeSec: 0 },
      lessons: {},
      bosses: {},
      flags: { intro_done: true },
      cosmetics: { owned: [], equipped: { hat: null, aura: null, spell: null, nameFrame: null, title: null } },
      titles: [],
      daily: { lastWelcomeBonus: null, completed: {} },
      missionsClaimed: [],
      village: { x: 12, y: 12, facing: 'right' },
      ...o.extra,
    };
    localStorage.setItem('devcore.save', JSON.stringify(save));
    localStorage.setItem('devcore.options', JSON.stringify({ textSpeed: 'instant', volume: 0, muted: true, editorFontSize: 15, reducedMotion: 'off' }));
    for (const k of Object.keys(localStorage)) if (k.startsWith('devcore.draft.')) localStorage.removeItem(k);
  }, opts);
}

/** Substitui o conteúdo do editor CodeMirror. */
export async function setCode(page: Page, code: string) {
  const content = page.locator('.cm-content').first();
  await content.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
}

// Grid de colisão e NPCs lidos do próprio map.ts (o Playwright não importa o módulo por causa do JSON do tileset).
const MAP_SRC = fs.readFileSync(new URL('../src/game/village/map.ts', import.meta.url), 'utf8');
const ROWS = [...MAP_SRC.matchAll(/^  '([^']+)',/gm)].map((m) => m[1]);
const NPC_TILES = [...MAP_SRC.matchAll(/\{ id: '\w+', x: (\d+), y: (\d+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
const free = (x: number, y: number) => ROWS[y]?.[x] === '.' && !NPC_TILES.some((n) => n.x === x && n.y === y);

function findPath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] | null {
  const key = (x: number, y: number) => `${x},${y}`;
  const prev = new Map<string, string | null>([[key(from.x, from.y), null]]);
  const q = [from];
  while (q.length) {
    const c = q.shift()!;
    if (c.x === to.x && c.y === to.y) {
      const path: { x: number; y: number }[] = [];
      let k: string | null = key(c.x, c.y);
      while (k && k !== key(from.x, from.y)) {
        const [x, y] = k.split(',').map(Number);
        path.unshift({ x, y });
        k = prev.get(k) ?? null;
      }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: c.x + dx, y: c.y + dy };
      if (prev.has(key(n.x, n.y)) || !free(n.x, n.y)) continue;
      prev.set(key(n.x, n.y), key(c.x, c.y));
      q.push(n);
    }
  }
  return null;
}

/** Tile atual do herói na vila (exposto em data-tile pela VillageScreen). */
export async function villageTile(page: Page): Promise<[number, number]> {
  const t = await page.locator('main.village').getAttribute('data-tile');
  if (!t) throw new Error('vila sem data-tile');
  const [x, y] = t.split(',').map(Number);
  return [x, y];
}

/** Anda pela vila até (x, y) com o teclado, seguindo o caminho calculado pela própria colisão do jogo. */
export async function walkTo(page: Page, x: number, y: number) {
  for (let guard = 0; guard < 120; guard++) {
    const [cx, cy] = await villageTile(page);
    if (cx === x && cy === y) return;
    const path = findPath({ x: cx, y: cy }, { x, y });
    if (!path) throw new Error(`sem caminho de ${cx},${cy} até ${x},${y}`);
    const n = path[0];
    const key = n.x > cx ? 'ArrowRight' : n.x < cx ? 'ArrowLeft' : n.y > cy ? 'ArrowDown' : 'ArrowUp';
    await page.keyboard.down(key);
    await page.waitForFunction((t) => document.querySelector('main.village')?.getAttribute('data-tile') !== t, `${cx},${cy}`, { timeout: 3000 });
    await page.keyboard.up(key);
  }
  throw new Error(`não chegou em ${x},${y}`);
}

/** Vira o herói para uma direção (encostado em algo, ele só vira). */
export async function face(page: Page, key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
  await page.waitForTimeout(250); // termina o passo em andamento (o jogo só lê direções com o herói parado)
  await page.keyboard.down(key);
  await page.waitForTimeout(120);
  await page.keyboard.up(key);
  await page.waitForTimeout(200);
}
