// Mini biblioteca de desenho em pixel para gerar PNGs procedurais (placeholders).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

export function hex(c) {
  if (Array.isArray(c)) return c.length === 4 ? c : [...c, 255];
  const s = c.replace('#', '');
  const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) : 255;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), a];
}

export function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return [0, 1, 2, 3].map((i) => Math.round(A[i] + (B[i] - A[i]) * t));
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
export const bayer = (x, y) => (BAYER4[y & 3][x & 3] + 0.5) / 16;

export class Img {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.d = Buffer.alloc(w * h * 4);
  }
  px(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const [r, g, b, a] = hex(c);
    const o = (y * this.w + x) * 4;
    if (a === 255 || this.d[o + 3] === 0) {
      this.d[o] = r; this.d[o + 1] = g; this.d[o + 2] = b; this.d[o + 3] = a;
    } else {
      const t = a / 255;
      this.d[o] = Math.round(this.d[o] * (1 - t) + r * t);
      this.d[o + 1] = Math.round(this.d[o + 1] * (1 - t) + g * t);
      this.d[o + 2] = Math.round(this.d[o + 2] * (1 - t) + b * t);
      this.d[o + 3] = Math.max(this.d[o + 3], a);
    }
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0];
    const o = (y * this.w + x) * 4;
    return [this.d[o], this.d[o + 1], this.d[o + 2], this.d[o + 3]];
  }
  clear(x, y) {
    const o = (y * this.w + x) * 4;
    this.d[o + 3] = 0;
  }
  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c);
  }
  fill(c) { this.rect(0, 0, this.w, this.h, c); }
  hline(x, y, w, c) { this.rect(x, y, w, 1, c); }
  vline(x, y, h, c) { this.rect(x, y, 1, h, c); }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  disc(cx, cy, r, c) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.px(x, y, c);
  }
  ring(cx, cy, r, c, thick = 1) {
    for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
      for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (d <= r && d > r - thick) this.px(x, y, c);
      }
  }
  // gradiente vertical com dithering ordenado entre uma lista de cores
  vgrad(x, y, w, h, colors) {
    const n = colors.length - 1;
    for (let j = 0; j < h; j++) {
      const t = (j / Math.max(1, h - 1)) * n;
      const i0 = Math.min(n - 1, Math.floor(t));
      const f = t - i0;
      for (let i = 0; i < w; i++) this.px(x + i, y + j, f > bayer(x + i, y + j) ? colors[i0 + 1] : colors[i0]);
    }
  }
  speckle(x, y, w, h, colors, density, rand) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++)
      if (rand() < density) this.px(i, j, colors[Math.floor(rand() * colors.length)]);
  }
  blit(src, dx, dy, opts = {}) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.get(opts.flip ? src.w - 1 - x : x, y);
      if (c[3]) this.px(dx + x, dy + y, c);
    }
  }
  // contorno de 1px em volta do conteúdo opaco
  outline(c) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)[3]) continue;
      if (this.get(x + 1, y)[3] || this.get(x - 1, y)[3] || this.get(x, y + 1)[3] || this.get(x, y - 1)[3]) add.push([x, y]);
    }
    for (const [x, y] of add) this.px(x, y, c);
  }
  async save(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await sharp(this.d, { raw: { width: this.w, height: this.h, channels: 4 } }).png().toFile(file);
  }
}

// Desenha um mapa de caracteres -> cores (sprites pequenos escritos à mão em código).
export function fromRows(rows, palette) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const img = new Img(w, h);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.' && ch !== ' ' && palette[ch]) img.px(x, y, palette[ch]);
  }));
  return img;
}
