// Cenários da Jornada: camadas de parallax desenhadas em pixel art por código
// (céu, fundo distante, meio e chão), uma paleta por área.

export type Theme = 'meadow' | 'forest' | 'crystal' | 'core';

export const GROUND_Y = 214;

interface Palette {
  sky: [string, string, string];
  far: string;
  farLight: string;
  mid: string;
  midDark: string;
  midLight: string;
  grass: string;
  grassLight: string;
  grassDark: string;
  dirt: string;
  dirtDark: string;
  path: string;
  pathLight: string;
  accent: string;
  /** Cor dos bugs desta área. */
  bug: [string, string, string];
}

export const PALETTES: Record<Theme, Palette> = {
  meadow: {
    sky: ['#5FB4E8', '#9AD4F2', '#D8F1FF'],
    far: '#7C9CC4', farLight: '#A9C2DE',
    mid: '#3F8F45', midDark: '#2C6B36', midLight: '#62B055',
    grass: '#5DBB4A', grassLight: '#8EDB5C', grassDark: '#3D8C3A',
    dirt: '#8A5A36', dirtDark: '#5E3B22', path: '#C9A06A', pathLight: '#E3C08B',
    accent: '#FFF3B0',
    bug: ['#E2483D', '#9E2B2B', '#FFB0A0'],
  },
  forest: {
    sky: ['#2B2F5E', '#8A4F7D', '#F2A65A'],
    far: '#3A3F6B', farLight: '#565B8A',
    mid: '#1E4D3A', midDark: '#123528', midLight: '#2F6E50',
    grass: '#2F7A4A', grassLight: '#4FA066', grassDark: '#1E5634',
    dirt: '#4A3426', dirtDark: '#2E2018', path: '#8A6A4A', pathLight: '#A88660',
    accent: '#FFD27A',
    bug: ['#8E5BD9', '#4E2F8A', '#D2B8FF'],
  },
  crystal: {
    sky: ['#140F2E', '#2E1F5C', '#5B3E8F'],
    far: '#2C2257', farLight: '#43357A',
    mid: '#3A2F6B', midDark: '#251D49', midLight: '#5A4C94',
    grass: '#4B4F86', grassLight: '#6F75B8', grassDark: '#33366A',
    dirt: '#2A2547', dirtDark: '#1A1630', path: '#6E6491', pathLight: '#8F86B5',
    accent: '#7FF3FF',
    bug: ['#2EC4B6', '#16786F', '#B6FFF6'],
  },
  core: {
    sky: ['#05070A', '#0B1610', '#16261A'],
    far: '#0E1A12', farLight: '#16281C',
    mid: '#151E1A', midDark: '#0B110E', midLight: '#22302A',
    grass: '#1F2A24', grassLight: '#2E3D34', grassDark: '#141B17',
    dirt: '#121614', dirtDark: '#0A0C0B', path: '#2A2F2C', pathLight: '#3A413D',
    accent: '#9BFF1A',
    bug: ['#9BFF1A', '#3E7A00', '#E4FFB0'],
  },
};

/** Gerador pseudoaleatório determinístico (o cenário é sempre o mesmo). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

/** Silhueta irregular (montanhas, copas) com largura que repete sem emenda. */
function ridge(w: number, base: number, amp: number, step: number, r: () => number): number[] {
  const n = Math.ceil(w / step);
  const pts = Array.from({ length: n }, () => base - r() * amp);
  const out: number[] = [];
  for (let x = 0; x < w; x++) {
    const i = Math.floor(x / step);
    const t = (x % step) / step;
    const a = pts[i % n];
    const b = pts[(i + 1) % n];
    out.push(Math.round(a + (b - a) * (t * t * (3 - 2 * t))));
  }
  return out;
}

export interface Scenery {
  theme: Theme;
  sky: HTMLCanvasElement;
  far: HTMLCanvasElement;
  mid: HTMLCanvasElement;
  ground: HTMLCanvasElement;
  front: HTMLCanvasElement;
}

const LAYER_W = 512;

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, p: Palette, r: () => number) {
  // faixas de cor (degradê em degraus, estilo pixel art)
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const c = t < 0.5 ? mix(p.sky[0], p.sky[1], t * 2) : mix(p.sky[1], p.sky[2], (t - 0.5) * 2);
    ctx.fillStyle = c;
    ctx.fillRect(0, Math.floor((i * h) / bands), w, Math.ceil(h / bands) + 1);
  }
  if (theme === 'meadow') {
    disc(ctx, 380, 40, 14, '#FFF6C8');
    disc(ctx, 380, 40, 11, '#FFE680');
    for (let i = 0; i < 5; i++) cloud(ctx, Math.floor(r() * w), 20 + Math.floor(r() * 50), 0.7 + r() * 0.6);
  } else if (theme === 'forest') {
    disc(ctx, 120, 150, 26, '#FFB86B');
    disc(ctx, 120, 150, 20, '#FFD27A');
    for (let i = 0; i < 3; i++) cloud(ctx, Math.floor(r() * w), 30 + Math.floor(r() * 40), 0.8, '#B9729A', '#D891AF');
  } else {
    // estrelas
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = r() < 0.2 ? p.accent : '#FFFFFF';
      ctx.globalAlpha = 0.4 + r() * 0.6;
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h * 0.6), 1, 1);
    }
    ctx.globalAlpha = 1;
    if (theme === 'crystal') {
      disc(ctx, 330, 46, 12, '#E8E4FF');
      disc(ctx, 335, 42, 10, p.sky[1]);
    } else {
      // rasgo verde no céu da Entidade
      ctx.fillStyle = '#9BFF1A';
      for (let x = 60; x < 460; x += 2) {
        const y = 40 + Math.round(Math.sin(x / 23) * 6 + Math.sin(x / 7) * 2);
        ctx.globalAlpha = 0.15 + 0.25 * r();
        ctx.fillRect(x, y, 2, 2 + Math.floor(r() * 3));
      }
      ctx.globalAlpha = 1;
    }
  }
}

function drawFar(ctx: CanvasRenderingContext2D, w: number, theme: Theme, p: Palette, r: () => number) {
  if (theme === 'crystal' || theme === 'core') {
    // torres e ruínas distantes
    const tops = ridge(w, 170, 20, 64, r);
    ctx.fillStyle = p.far;
    for (let x = 0; x < w; x++) ctx.fillRect(x, tops[x], 1, 252 - tops[x]);
    for (let i = 0; i < 7; i++) {
      const x = Math.floor(r() * w);
      const tw = 10 + Math.floor(r() * 14);
      const th = 40 + Math.floor(r() * 50);
      ctx.fillStyle = p.far;
      ctx.fillRect(x, 170 - th, tw, th);
      ctx.fillRect(x - 2, 170 - th, tw + 4, 3);
      ctx.fillStyle = p.farLight;
      ctx.fillRect(x + 2, 170 - th + 6, 2, th - 10);
      if (theme === 'core' || r() < 0.5) {
        ctx.fillStyle = p.accent;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x + Math.floor(tw / 2), 170 - th + 10 + Math.floor(r() * 20), 2, 2);
        ctx.globalAlpha = 1;
      }
    }
    return;
  }
  // montanhas com neve
  const tops = ridge(w, 160, 70, 48, r);
  for (let x = 0; x < w; x++) {
    ctx.fillStyle = p.far;
    ctx.fillRect(x, tops[x], 1, 252 - tops[x]);
    // encosta iluminada: compara com alguns pixels à frente para não serrilhar nos platôs
    if (tops[(x + 4) % w] - tops[x] >= 2) {
      ctx.fillStyle = p.farLight;
      ctx.fillRect(x, tops[x], 1, 6);
    }
    if (theme === 'meadow' && tops[x] < 108) {
      ctx.fillStyle = '#F2F7FF';
      ctx.fillRect(x, tops[x], 1, Math.floor((108 - tops[x]) / 2) + 1);
    }
  }
}

function pine(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, dark: string, light: string, trunk: string) {
  ctx.fillStyle = trunk;
  ctx.fillRect(x - 1, base - 6, 3, 6);
  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const top = base - h + Math.floor((l * h) / (layers + 1));
    const bottom = top + Math.floor(h / 2);
    for (let y = top; y < bottom; y++) {
      const half = Math.floor(((y - top) / (bottom - top)) * (h / 3)) + 1;
      ctx.fillStyle = dark;
      ctx.fillRect(x - half, y, half * 2 + 1, 1);
      ctx.fillStyle = light;
      ctx.fillRect(x - half, y, Math.max(1, Math.floor(half / 2)), 1);
    }
  }
}

function oak(ctx: CanvasRenderingContext2D, x: number, base: number, s: number, p: Palette) {
  ctx.fillStyle = p.dirtDark;
  ctx.fillRect(x - 2, base - s, 5, s);
  disc(ctx, x, base - s - 4, Math.floor(s * 0.75), p.midDark);
  disc(ctx, x - 3, base - s - 7, Math.floor(s * 0.55), p.mid);
  disc(ctx, x - 5, base - s - 9, Math.floor(s * 0.25), p.midLight);
}

function crystal(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, color: string, light: string) {
  for (let y = 0; y < h; y++) {
    const half = Math.max(1, Math.floor(((h - y) / h) * (h / 4)));
    ctx.fillStyle = color;
    ctx.fillRect(x - half, base - y, half * 2, 1);
    ctx.fillStyle = light;
    ctx.fillRect(x - half, base - y, 1, 1);
  }
}

function drawMid(ctx: CanvasRenderingContext2D, w: number, theme: Theme, p: Palette, r: () => number) {
  const tops = ridge(w, 196, 22, 40, r);
  ctx.fillStyle = p.midDark;
  for (let x = 0; x < w; x++) ctx.fillRect(x, tops[x], 1, 252 - tops[x]);
  if (theme === 'meadow') {
    for (let x = 10; x < w; x += 26 + Math.floor(r() * 30)) oak(ctx, x, tops[x % w] + 6, 12 + Math.floor(r() * 8), p);
  } else if (theme === 'forest') {
    for (let x = 6; x < w; x += 12 + Math.floor(r() * 14)) pine(ctx, x, tops[x % w] + 8, 34 + Math.floor(r() * 30), p.mid, p.midLight, p.dirtDark);
  } else if (theme === 'crystal') {
    for (let x = 12; x < w; x += 30 + Math.floor(r() * 40)) {
      crystal(ctx, x, tops[x % w] + 4, 16 + Math.floor(r() * 26), r() < 0.5 ? '#38C7D6' : '#C05BD9', '#E8FFFF');
    }
  } else {
    // pilares quebrados com rachaduras verdes
    for (let x = 20; x < w; x += 40 + Math.floor(r() * 40)) {
      const h = 20 + Math.floor(r() * 30);
      const base = tops[x % w] + 6;
      ctx.fillStyle = p.midLight;
      ctx.fillRect(x, base - h, 9, h);
      ctx.fillStyle = p.mid;
      ctx.fillRect(x + 6, base - h, 3, h);
      ctx.fillStyle = p.accent;
      let cy = base - h + 3;
      let cx = x + 3;
      while (cy < base - 2) {
        ctx.fillRect(cx, cy, 1, 2);
        cy += 2;
        cx += r() < 0.5 ? -1 : 1;
        cx = Math.max(x + 1, Math.min(x + 7, cx));
      }
    }
  }
}

/** Chão: grama, terra e a trilha (repete a cada LAYER_W). */
function drawGround(ctx: CanvasRenderingContext2D, w: number, theme: Theme, p: Palette, r: () => number) {
  const top = GROUND_Y - 14;
  ctx.fillStyle = p.grass;
  ctx.fillRect(0, top, w, 252 - top);
  // tufos na borda da grama
  for (let x = 0; x < w; x++) {
    const h = 1 + Math.floor(r() * 3);
    ctx.fillStyle = r() < 0.5 ? p.grassLight : p.grass;
    ctx.fillRect(x, top - h + 1, 1, h);
  }
  // trilha
  ctx.fillStyle = p.path;
  ctx.fillRect(0, GROUND_Y - 6, w, 14);
  ctx.fillStyle = p.pathLight;
  ctx.fillRect(0, GROUND_Y - 6, w, 1);
  ctx.fillStyle = p.dirtDark;
  ctx.fillRect(0, GROUND_Y + 8, w, 1);
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(r() * w);
    const y = GROUND_Y - 4 + Math.floor(r() * 10);
    ctx.fillStyle = r() < 0.5 ? p.pathLight : p.dirt;
    ctx.fillRect(x, y, 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
  }
  // terra embaixo
  ctx.fillStyle = p.dirt;
  ctx.fillRect(0, GROUND_Y + 9, w, 252 - GROUND_Y);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = r() < 0.5 ? p.dirtDark : p.grassDark;
    ctx.fillRect(Math.floor(r() * w), GROUND_Y + 11 + Math.floor(r() * 26), 2, 2);
  }
  // detalhes na grama acima da trilha
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(r() * w);
    const y = top + 2 + Math.floor(r() * 4);
    if (theme === 'meadow') {
      ctx.fillStyle = ['#FFF3B0', '#FF8FB1', '#FFFFFF', '#9AD4F2'][Math.floor(r() * 4)];
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = p.grassDark;
      ctx.fillRect(x, y + 2, 1, 2);
    } else if (theme === 'forest') {
      ctx.fillStyle = '#C94F3B';
      ctx.fillRect(x, y, 3, 2);
      ctx.fillStyle = '#F3E9D2';
      ctx.fillRect(x + 1, y + 2, 1, 2);
    } else {
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, 1, 2);
      ctx.globalAlpha = 1;
    }
  }
}

/** Primeiro plano: folhagem escura passando na frente (dá profundidade). */
function drawFront(ctx: CanvasRenderingContext2D, w: number, theme: Theme, p: Palette, r: () => number) {
  for (let x = 0; x < w; x += 60 + Math.floor(r() * 90)) {
    const h = 6 + Math.floor(r() * 8);
    for (let i = -8; i <= 8; i++) {
      const hh = Math.max(1, h - Math.abs(i) + Math.floor(r() * 3));
      ctx.fillStyle = theme === 'core' ? '#0A0F0C' : p.grassDark;
      ctx.fillRect(x + i, 252 - hh, 1, hh);
    }
  }
}

const cache = new Map<Theme, Scenery>();

export function getScenery(theme: Theme): Scenery {
  const hit = cache.get(theme);
  if (hit) return hit;
  const p = PALETTES[theme];
  const seed = { meadow: 11, forest: 23, crystal: 37, core: 51 }[theme];
  const [sky, sctx] = canvas(LAYER_W, 252);
  drawSky(sctx, LAYER_W, 252, theme, p, rng(seed));
  const [far, fctx] = canvas(LAYER_W, 252);
  drawFar(fctx, LAYER_W, theme, p, rng(seed + 1));
  const [mid, mctx] = canvas(LAYER_W, 252);
  drawMid(mctx, LAYER_W, theme, p, rng(seed + 2));
  const [ground, gctx] = canvas(LAYER_W, 252);
  drawGround(gctx, LAYER_W, theme, p, rng(seed + 3));
  const [front, frctx] = canvas(LAYER_W, 252);
  drawFront(frctx, LAYER_W, theme, p, rng(seed + 4));
  const s = { theme, sky, far, mid, ground, front };
  cache.set(theme, s);
  return s;
}

/** Desenha uma camada repetida horizontalmente, com deslocamento de parallax. */
export function drawLayer(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, camX: number, factor: number, viewW: number): void {
  const off = Math.floor(camX * factor) % layer.width;
  for (let x = -off; x < viewW; x += layer.width) ctx.drawImage(layer, x, 0);
}

// ---------- utilidades de desenho ----------

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, rad: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -rad; y <= rad; y++) {
    const half = Math.floor(Math.sqrt(rad * rad - y * y));
    ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, shade = '#CFE6F5', light = '#FFFFFF') {
  const parts: [number, number, number][] = [[0, 4, 8], [9, 0, 10], [20, 3, 8], [28, 6, 6]];
  for (const [dx, dy, rad] of parts) disc(ctx, x + Math.round(dx * s), y + Math.round(dy * s) + 2, Math.round(rad * s), shade);
  for (const [dx, dy, rad] of parts) disc(ctx, x + Math.round(dx * s), y + Math.round(dy * s), Math.round(rad * s), light);
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// ---------- capanga: o "bug" ----------

/**
 * Desenha um bug (inseto glitchado) com os pés em (x, feetY).
 * `look` é -1 (olhando para a esquerda) ou 1. `dying` vai de 0 a 1.
 */
export function drawBug(ctx: CanvasRenderingContext2D, x: number, feetY: number, now: number, colors: [string, string, string], look: -1 | 1, dying = 0): void {
  const [body, dark, light] = colors;
  const bob = Math.round(Math.sin(now / 180) * 1.5);
  const y = feetY - 12 + bob;
  ctx.save();
  if (dying > 0) ctx.globalAlpha = Math.max(0, 1 - dying);
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 9, feetY - 1, 18, 2);
  // pernas (3 de cada lado, mexendo)
  ctx.fillStyle = dark;
  for (let i = 0; i < 3; i++) {
    const k = Math.sin(now / 90 + i * 2) > 0 ? 1 : 0;
    ctx.fillRect(x - 10 + i * 3, y + 9 + k, 2, 3 - k);
    ctx.fillRect(x + 4 + i * 3, y + 9 + (1 - k), 2, 2 + k);
  }
  // corpo (elipse em pixels)
  for (let dy = -7; dy <= 7; dy++) {
    const half = Math.floor(Math.sqrt(1 - (dy / 7.5) ** 2) * 10);
    ctx.fillStyle = dark;
    ctx.fillRect(x - half - 1, y + dy, half * 2 + 3, 1);
    ctx.fillStyle = dy < -3 ? light : body;
    ctx.fillRect(x - half, y + dy, half * 2 + 1, 1);
  }
  // listra das costas
  ctx.fillStyle = dark;
  ctx.fillRect(x - 1, y - 6, 2, 12);
  // olhos grandes
  const ex = x + look * 4;
  for (const o of [-3, 3]) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ex + o - 2, y - 3, 4, 4);
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(ex + o - (look < 0 ? 2 : 0), y - 2, 2, 2);
  }
  // antenas
  ctx.fillStyle = dark;
  const wig = Math.round(Math.sin(now / 150) * 1);
  ctx.fillRect(ex - 4, y - 10, 1, 4);
  ctx.fillRect(ex + 4, y - 10, 1, 4);
  ctx.fillStyle = light;
  ctx.fillRect(ex - 5 + wig, y - 11, 2, 2);
  ctx.fillRect(ex + 4 - wig, y - 11, 2, 2);
  // glitch: pixels soltos piscando
  if (Math.floor(now / 120) % 3 === 0) {
    ctx.fillStyle = '#9BFF1A';
    ctx.fillRect(x - 12 + (Math.floor(now / 40) % 24), y - 8 + (Math.floor(now / 70) % 16), 2, 1);
    ctx.fillRect(x + 8 - (Math.floor(now / 55) % 18), y + 4 - (Math.floor(now / 90) % 10), 1, 1);
  }
  ctx.restore();
}
