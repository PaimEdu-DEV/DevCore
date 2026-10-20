// Gera todos os assets procedurais (placeholders) que não vieram prontos.
// Uso: node scripts/generate-assets.mjs
// Cada PNG gerado aqui pode ser trocado por arte feita à mão mantendo nome e dimensões (ver docs/ASSETS.md).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Img, rng, mix, bayer, fromRows } from './lib/pixel.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = path.join(ROOT, 'public', 'assets');
const out = (...p) => path.join(A, ...p);

// ---------- paleta ----------
const C = {
  black: '#0A0A0F', black2: '#161A22', ink: '#232838',
  lime: '#9BFF1A', limeD: '#2F6B00', limeL: '#E4FFB0',
  gold: '#E8B84A', goldD: '#A87A1E', goldL: '#FFE08A', amber: '#FFB000', amberD: '#C27A00',
  brown: '#6B4423', brownD: '#3D2614', brownL: '#9A6A3A',
  cream: '#F3E9D2', creamD: '#D9C7A0', creamDD: '#B8A47A',
  navy: '#1E2A4A', navyL: '#33456E', navyD: '#121A30',
  teal: '#2EC4B6', tealD: '#17807A',
  red: '#B2332B', redD: '#6E1F1A',
  white: '#FFFFFF',
  grass: '#4A7A34', grassD: '#3B6329', grassL: '#5E8F3F', grassDD: '#2C4D1F',
  path: '#B08850', pathD: '#8A6A3C', pathL: '#CDA66A',
  water: '#1E3A5F', waterL: '#2B5584', waterH: '#7FB3D5',
  stone: '#5A5A66', stoneD: '#3E3E48', stoneL: '#7A7A88',
  roof: '#8C3B2E', roofD: '#6E2C22', roofL: '#A84C3A',
  plaster: '#E8D5B0', plasterD: '#CDB68A',
};

const generated = [];
const note = (file, desc) => generated.push({ file: path.relative(path.join(ROOT, 'public'), file).replaceAll('\\', '/'), desc });

// ================= TILESET (24x24) =================
const T = 24;
const TILE_NAMES = [
  'grass', 'grass2', 'flowers', 'path', 'water', 'water2', 'tree', 'bush',
  'fence', 'roof', 'eave', 'wall', 'window', 'door', 'stonewall', 'gate',
  'bridge', 'sign', 'well', 'plaza', 'crate', 'lamp', 'gatetop', 'pathgrass',
];

function grassBase(t, seed) {
  const r = rng(seed);
  t.fill(C.grass);
  t.speckle(0, 0, T, T, [C.grassD, C.grassL], 0.18, r);
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(r() * (T - 2)), y = Math.floor(r() * (T - 3)) + 2;
    t.px(x, y, C.grassDD); t.px(x + 1, y - 1, C.grassL); t.px(x, y - 1, C.grassD);
  }
}

const tileDraw = {
  grass: (t) => grassBase(t, 11),
  grass2: (t) => { grassBase(t, 23); const r = rng(5); for (let i = 0; i < 3; i++) { const x = 3 + Math.floor(r() * 18), y = 4 + Math.floor(r() * 16); t.px(x, y, C.grassDD); t.px(x, y - 1, C.grassDD); t.px(x + 1, y - 2, C.grassL); } },
  flowers: (t) => {
    grassBase(t, 31);
    const r = rng(9);
    const cols = [C.cream, C.gold, '#D8584A', '#E8A0C0'];
    for (let i = 0; i < 6; i++) {
      const x = 2 + Math.floor(r() * 20), y = 2 + Math.floor(r() * 20), c = cols[i % cols.length];
      t.px(x, y, c); t.px(x - 1, y, c); t.px(x + 1, y, c); t.px(x, y - 1, c); t.px(x, y + 1, C.grassDD); t.px(x, y, C.goldL);
    }
  },
  path: (t) => {
    const r = rng(41);
    t.fill(C.path);
    t.speckle(0, 0, T, T, [C.pathD, C.pathL], 0.2, r);
    for (let i = 0; i < 4; i++) { const x = Math.floor(r() * 21), y = Math.floor(r() * 21); t.rect(x, y, 2, 2, C.pathD); t.px(x, y, C.pathL); }
  },
  pathgrass: (t) => {
    tileDraw.path(t);
    const r = rng(77);
    for (let x = 0; x < T; x++) { const h = 2 + Math.floor(r() * 3); t.rect(x, 0, 1, h, C.grass); if (r() < 0.4) t.px(x, h, C.grassD); }
  },
  plaza: (t) => {
    t.fill(C.stoneL);
    for (let y = 0; y < T; y += 8) {
      const off = (y / 8) % 2 ? 6 : 0;
      t.hline(0, y, T, C.stone);
      for (let x = off; x < T; x += 12) t.vline(x, y, 8, C.stone);
    }
    t.speckle(0, 0, T, T, [C.stone, '#8E8E9C'], 0.08, rng(3));
  },
  water: (t) => waterTile(t, 0),
  water2: (t) => waterTile(t, 1),
  tree: (t) => {
    grassBase(t, 51);
    t.rect(10, 16, 4, 7, C.brownD); t.rect(11, 16, 2, 7, C.brown);
    t.disc(12, 10, 10, C.grassDD);
    t.disc(12, 9, 9, '#2F5A22');
    t.disc(10, 7, 6, C.grassD);
    t.disc(9, 6, 3, C.grassL);
    const r = rng(8);
    for (let i = 0; i < 12; i++) t.px(4 + Math.floor(r() * 16), 2 + Math.floor(r() * 14), C.grassDD);
    t.hline(6, 22, 12, '#00000040');
  },
  bush: (t) => {
    grassBase(t, 61);
    t.disc(12, 14, 8, C.grassDD); t.disc(12, 13, 7, '#2F5A22'); t.disc(10, 11, 4, C.grassD); t.disc(9, 10, 2, C.grassL);
    t.px(15, 12, '#D8584A'); t.px(8, 15, '#D8584A'); t.px(13, 16, '#D8584A');
  },
  fence: (t) => {
    grassBase(t, 71);
    t.rect(0, 8, T, 3, C.brownD); t.hline(0, 8, T, C.brownL);
    t.rect(0, 15, T, 3, C.brownD); t.hline(0, 15, T, C.brownL);
    for (const x of [3, 19]) { t.rect(x, 5, 3, 16, C.brownD); t.vline(x, 5, 16, C.brownL); t.px(x + 1, 5, C.brownL); }
  },
  roof: (t) => {
    t.fill(C.roof);
    for (let y = 0; y < T; y += 6) {
      t.hline(0, y + 5, T, C.roofD);
      const off = (y / 6) % 2 ? 4 : 0;
      for (let x = off; x < T; x += 8) t.vline(x, y, 5, C.roofD);
      for (let x = off + 1; x < T; x += 8) t.hline(x, y, 5, C.roofL);
    }
  },
  eave: (t) => {
    tileDraw.roof(t);
    t.rect(0, 16, T, 4, C.brownD); t.hline(0, 16, T, C.brown);
    t.rect(0, 20, T, 4, C.plasterD);
  },
  wall: (t) => {
    t.fill(C.plaster);
    t.speckle(0, 0, T, T, [C.plasterD], 0.06, rng(4));
    t.rect(0, 0, T, 2, C.brown); t.rect(0, 0, 2, T, C.brown); t.rect(22, 0, 2, T, C.brown);
    t.line(2, 2, 21, 21, C.brownL); t.rect(0, 22, T, 2, C.brownD);
  },
  window: (t) => {
    tileDraw.wall(t);
    t.rect(6, 5, 12, 11, C.brownD);
    t.rect(7, 6, 10, 9, C.amber);
    t.rect(7, 6, 10, 4, C.goldL);
    t.vline(12, 6, 9, C.brownD); t.hline(7, 10, 10, C.brownD);
    t.rect(5, 16, 14, 2, C.brown);
  },
  door: (t) => {
    tileDraw.wall(t);
    t.rect(5, 4, 14, 20, C.brownD);
    t.rect(6, 5, 12, 19, C.brown);
    for (let x = 8; x < 18; x += 3) t.vline(x, 5, 19, C.brownD);
    t.rect(15, 14, 2, 2, C.gold);
    t.hline(5, 4, 14, C.brownL);
  },
  stonewall: (t) => {
    t.fill(C.stone);
    for (let y = 0; y < T; y += 6) {
      t.hline(0, y, T, C.stoneD);
      const off = (y / 6) % 2 ? 0 : 6;
      for (let x = off; x < T; x += 12) t.vline(x, y, 6, C.stoneD);
      for (let x = off + 1; x < T; x += 12) t.hline(x, y + 1, 10, C.stoneL);
    }
    t.speckle(0, 0, T, T, [C.stoneD], 0.05, rng(91));
  },
  gatetop: (t) => {
    tileDraw.stonewall(t);
    for (let x = 0; x < T; x += 8) { t.rect(x, 0, 5, 4, C.stoneL); t.rect(x, 4, 5, 1, C.stoneD); }
  },
  gate: (t) => {
    t.fill(C.black2);
    t.rect(1, 0, 22, T, C.brownD);
    for (let x = 3; x < 22; x += 4) t.vline(x, 0, T, C.black2);
    t.rect(1, 5, 22, 2, C.stoneD); t.rect(1, 16, 22, 2, C.stoneD);
    // fendas de corrupção (verde-limão é exclusivo da Entidade e seus vilões)
    t.line(12, 0, 10, 8, C.limeD); t.line(10, 8, 13, 15, C.limeD); t.line(13, 15, 11, 23, C.limeD);
    t.px(10, 8, C.lime); t.px(13, 15, C.lime); t.px(12, 2, C.lime);
  },
  bridge: (t) => {
    waterTile(t, 0);
    t.rect(2, 0, 20, T, C.brownD);
    for (let y = 0; y < T; y += 4) { t.rect(3, y, 18, 3, C.brownL); t.hline(3, y, 18, C.pathL); }
    t.vline(2, 0, T, C.brownD); t.vline(21, 0, T, C.brownD);
  },
  sign: (t) => {
    grassBase(t, 101);
    t.rect(11, 12, 2, 11, C.brownD);
    t.rect(4, 5, 16, 9, C.brownD); t.rect(5, 6, 14, 7, C.brownL);
    t.hline(7, 8, 10, C.brownD); t.hline(7, 10, 7, C.brownD);
  },
  well: (t) => {
    grassBase(t, 111);
    t.disc(12, 14, 9, C.stoneD); t.disc(12, 14, 8, C.stone); t.disc(12, 14, 5, C.water); t.disc(11, 13, 2, C.waterL);
    t.rect(3, 2, 2, 12, C.brownD); t.rect(19, 2, 2, 12, C.brownD); t.rect(2, 1, 20, 3, C.roof); t.hline(2, 1, 20, C.roofL);
  },
  crate: (t) => {
    tileDraw.path(t);
    t.rect(4, 4, 16, 16, C.brownD); t.rect(5, 5, 14, 14, C.brownL);
    t.line(5, 5, 18, 18, C.brownD); t.line(18, 5, 5, 18, C.brownD); t.rect(4, 19, 16, 2, '#00000055');
  },
  lamp: (t) => {
    tileDraw.path(t);
    t.rect(11, 6, 2, 17, C.black2);
    t.rect(8, 1, 8, 7, C.black2); t.rect(9, 2, 6, 5, C.amber); t.rect(10, 3, 4, 2, C.goldL);
    t.rect(9, 22, 6, 2, C.black2);
  },
};

function waterTile(t, frame) {
  t.fill(C.water);
  const r = rng(200 + frame);
  t.speckle(0, 0, T, T, [C.waterL], 0.12, r);
  for (let y = 3; y < T; y += 7) {
    const off = (frame * 3 + y) % 10;
    for (let x = off; x < T; x += 10) { t.hline(x, y, 4, C.waterH); t.hline(x + 1, y + 1, 3, C.waterL); }
  }
}

async function genTileset() {
  const cols = 8, rows = Math.ceil(TILE_NAMES.length / cols);
  const sheet = new Img(cols * T, rows * T);
  TILE_NAMES.forEach((name, i) => {
    const t = new Img(T, T);
    tileDraw[name](t);
    sheet.blit(t, (i % cols) * T, Math.floor(i / cols) * T);
  });
  const file = out('tiles', 'village.png');
  await sheet.save(file);
  note(file, `Tileset da vila ${T}x${T} (${TILE_NAMES.join(', ')})`);
  fs.writeFileSync(path.join(ROOT, 'src', 'game', 'assets', 'tileset.json'), JSON.stringify({ tileSize: T, columns: cols, image: 'assets/tiles/village.png', tiles: TILE_NAMES }, null, 2) + '\n');
}

// ================= FUNDOS (320x180) =================
const W = 320, H = 180;

function stars(img, r, count, colors, maxY) {
  for (let i = 0; i < count; i++) img.px(Math.floor(r() * W), Math.floor(r() * maxY), colors[Math.floor(r() * colors.length)]);
}

function crack(img, r, x, y, len, color, glow) {
  let cx = x, cy = y;
  for (let i = 0; i < len; i++) {
    const nx = cx + (r() - 0.5) * 6, ny = cy + 2 + r() * 3;
    img.line(cx, cy, nx, ny, color);
    if (glow && r() < 0.3) img.px(nx, ny, glow);
    if (r() < 0.15) crack(img, r, nx, ny, Math.floor(len / 3), color, null);
    cx = nx; cy = ny;
  }
}

function floorBands(img, y0, colors) {
  for (let y = y0; y < H; y++) {
    const t = (y - y0) / (H - y0);
    for (let x = 0; x < W; x++) {
      const idx = Math.min(colors.length - 1, Math.floor(t * colors.length + bayer(x, y) * 0.9));
      img.px(x, y, colors[idx]);
    }
  }
  // linhas de perspectiva
  for (let i = -10; i <= 10; i++) img.line(W / 2 + i * 6, y0, W / 2 + i * 40, H, '#00000030');
}

async function bgAldric() {
  const img = new Img(W, H), r = rng(1);
  img.vgrad(0, 0, W, 130, [C.black, C.black2, '#1E2230']);
  // pilares
  for (const px of [20, 90, 230, 300]) {
    img.rect(px - 10, 10, 20, 120, '#2A2E3C'); img.rect(px - 10, 10, 3, 120, '#353A4A'); img.rect(px + 7, 10, 3, 120, '#1A1D27');
    img.rect(px - 13, 8, 26, 6, '#353A4A'); img.rect(px - 13, 124, 26, 6, '#353A4A');
  }
  // estandartes rasgados com fendas verdes
  for (const bx of [55, 265]) {
    img.rect(bx - 9, 14, 18, 60, C.redD);
    for (let x = 0; x < 18; x += 3) img.rect(bx - 9 + x, 74, 3, 3 + Math.floor(r() * 8), C.redD);
    img.rect(bx - 9, 14, 18, 2, C.black2);
    crack(img, r, bx, 20, 10, C.limeD, C.lime);
  }
  // trono ao fundo
  img.rect(140, 50, 40, 70, '#14161E'); img.rect(146, 40, 28, 14, '#14161E'); img.rect(150, 60, 20, 30, '#0F1118');
  img.px(160, 48, C.lime); img.px(159, 48, C.limeD); img.px(161, 48, C.limeD);
  floorBands(img, 130, ['#262A36', '#1E2230', '#171A24', C.black2]);
  crack(img, r, 160, 132, 14, C.limeD, C.lime);
  crack(img, r, 60, 140, 8, C.limeD, null);
  const file = out('backgrounds', 'battle_aldric.png'); await img.save(file); note(file, 'Fundo de batalha de Aldric (salão da guarda corrompido)');
}

async function bgVeyr() {
  const img = new Img(W, H), r = rng(2);
  img.vgrad(0, 0, W, 140, [C.black, '#10131C', '#1A1F2E', '#232A3D']);
  stars(img, r, 60, ['#3A4258', '#6A7290', C.creamD], 90);
  img.disc(255, 38, 16, '#C9C2A8'); img.disc(250, 34, 14, '#DDD6BC'); img.disc(262, 44, 3, '#B5AE94');
  // telhados
  let x = 0;
  while (x < W) {
    const w = 30 + Math.floor(r() * 40), h = 40 + Math.floor(r() * 40);
    img.rect(x, 140 - h, w, h, '#0E1018');
    for (let i = 0; i < w / 2 + 2; i++) img.hline(x - 2 + i, 140 - h - (w / 2 + 2 - i) * 0.6, w + 4 - i * 2, '#0E1018');
    if (r() < 0.6) { img.rect(x + 6, 140 - h + 12, 4, 5, C.amberD); img.px(x + 7, 140 - h + 13, C.amber); }
    x += w + 4;
  }
  // olhos verdes na escuridão
  for (let i = 0; i < 4; i++) { const ex = 20 + Math.floor(r() * 280), ey = 100 + Math.floor(r() * 30); img.px(ex, ey, C.lime); img.px(ex + 3, ey, C.lime); }
  floorBands(img, 140, ['#1C1E28', '#161821', C.black2, C.black]);
  const file = out('backgrounds', 'battle_veyr.png'); await img.save(file); note(file, 'Fundo de batalha de Veyr (telhados à noite)');
}

async function bgSeraphine() {
  const img = new Img(W, H), r = rng(3);
  img.vgrad(0, 0, W, 135, [C.black, '#141020', '#1E1830']);
  // estantes
  for (let sx = 0; sx < W; sx += 64) {
    img.rect(sx + 2, 10, 58, 122, '#1A1420'); img.rect(sx + 2, 10, 58, 3, '#2A2232');
    for (let sy = 18; sy < 128; sy += 22) {
      img.hline(sx + 2, sy + 18, 58, '#2A2232');
      let bx = sx + 5;
      while (bx < sx + 56) {
        const bw = 2 + Math.floor(r() * 3), bh = 10 + Math.floor(r() * 7);
        const col = ['#3A2830', '#2A3040', '#40341E', '#2E2236'][Math.floor(r() * 4)];
        img.rect(bx, sy + 18 - bh, bw, bh, col);
        if (r() < 0.08) img.rect(bx, sy + 18 - bh, bw, bh, C.limeD);
        bx += bw + 1;
      }
    }
  }
  // runas flutuantes
  for (let i = 0; i < 14; i++) {
    const gx = Math.floor(r() * W), gy = 20 + Math.floor(r() * 100);
    img.px(gx, gy, C.lime); img.px(gx + 1, gy + 1, C.lime); img.px(gx - 1, gy + 1, C.limeD); img.px(gx, gy + 2, C.lime);
  }
  floorBands(img, 135, ['#221A2A', '#1A1420', '#130F18', C.black]);
  img.ring(160, 160, 40, C.limeD); img.ring(160, 160, 30, '#1F4A00');
  const file = out('backgrounds', 'battle_seraphine.png'); await img.save(file); note(file, 'Fundo de batalha de Seraphine (biblioteca proibida)');
}

async function bgEntity() {
  const img = new Img(W, H), r = rng(4);
  img.fill(C.black);
  // brilho do Core
  for (let rad = 90; rad > 0; rad -= 6) {
    const t = 1 - rad / 90;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - 160, (y - 70) * 1.3);
      if (d < rad && d >= rad - 6 && bayer(x, y) < t * 0.5) img.px(x, y, t > 0.7 ? C.limeD : '#14260A');
    }
  }
  img.ring(160, 70, 70, C.limeD); img.ring(160, 70, 62, '#1F4A00');
  for (let a = 0; a < 24; a++) {
    const ang = (a / 24) * Math.PI * 2, rx = 160 + Math.cos(ang) * 66, ry = 70 + Math.sin(ang) * 66;
    img.rect(rx - 1, ry - 1, 2, 3, C.lime);
  }
  // ilhas de pedra flutuando
  for (let i = 0; i < 7; i++) {
    const ix = Math.floor(r() * W), iy = 100 + Math.floor(r() * 60), iw = 10 + Math.floor(r() * 20);
    img.rect(ix, iy, iw, 3, '#2A2E3C'); img.rect(ix + 2, iy + 3, iw - 4, 3, '#1A1D27'); img.px(ix + iw / 2, iy + 6, '#1A1D27');
  }
  stars(img, r, 80, [C.limeD, '#1F4A00', C.lime], H);
  floorBands(img, 150, ['#14161E', '#0F1118', C.black]);
  crack(img, r, 160, 150, 12, C.limeD, C.lime);
  const file = out('backgrounds', 'battle_entity.png'); await img.save(file); note(file, 'Fundo de batalha da Entidade (o vazio do Core)');
}

async function bgKingdom() {
  const img = new Img(W, H), r = rng(5);
  img.vgrad(0, 0, W, H, [C.black, '#101A0A', '#1B2A10', '#24301A']);
  stars(img, r, 40, [C.limeD, C.creamDD], 80);
  // castelo
  const base = 150;
  img.rect(80, 70, 160, 80, C.black2);
  for (const [tx, th] of [[80, 50], [125, 70], [160, 105], [195, 70], [230, 50]]) {
    img.rect(tx - 9, base - th - 30, 18, th + 30, C.black2);
    for (let i = 0; i < 4; i++) img.rect(tx - 9 + i * 5, base - th - 34, 3, 4, C.black2);
  }
  img.rect(150, 15, 20, 30, C.black2); img.disc(160, 22, 5, C.lime); img.disc(160, 22, 3, C.limeL);
  crack(img, r, 160, 26, 14, C.limeD, C.lime);
  for (let i = 0; i < 18; i++) { const wx = 90 + Math.floor(r() * 140), wy = 80 + Math.floor(r() * 60); img.rect(wx, wy, 2, 3, r() < 0.5 ? C.limeD : C.amberD); }
  // raios de corrupção no céu
  for (let i = 0; i < 3; i++) { let lx = 160, ly = 20; for (let s = 0; s < 8; s++) { const nx = lx + (r() - 0.5) * 50, ny = ly - 3 + r() * 4; img.line(lx, ly, nx, ny, C.limeD); lx = nx; ly = ny; } }
  img.vgrad(0, base, W, H - base, ['#141A0E', C.black]);
  const file = out('backgrounds', 'scene_kingdom.png'); await img.save(file); note(file, 'Cena: o reino e o castelo corrompido');
}

async function bgCore() {
  const img = new Img(W, H), r = rng(6);
  img.vgrad(0, 0, W, H, [C.black, C.navyD, C.black]);
  stars(img, r, 70, [C.navyL, C.creamDD, C.gold], H);
  // cristal do Core (dourado, rachado em verde)
  const pts = [[160, 30], [195, 90], [160, 150], [125, 90]];
  for (let y = 30; y <= 150; y++) {
    const half = y < 90 ? ((y - 30) / 60) * 35 : ((150 - y) / 60) * 35;
    for (let x = 160 - half; x <= 160 + half; x++) {
      const t = (x - (160 - half)) / Math.max(1, half * 2);
      img.px(x, y, t < 0.35 ? C.goldL : t < 0.7 ? C.gold : C.goldD);
    }
  }
  void pts;
  img.line(160, 30, 160, 150, C.goldD);
  crack(img, r, 168, 50, 16, C.limeD, C.lime);
  crack(img, r, 150, 80, 10, C.limeD, C.lime);
  img.ring(160, 90, 75, C.navyL); img.ring(160, 90, 82, '#22305A');
  const file = out('backgrounds', 'scene_core.png'); await img.save(file); note(file, 'Cena: o Core, coração do reino');
}

async function bgArchive() {
  const img = new Img(W, H), r = rng(7);
  img.vgrad(0, 0, W, 130, ['#2A1A0E', '#3A2614', '#4A3018']);
  // janela com luar
  img.rect(140, 20, 40, 50, C.brownD); img.rect(143, 23, 34, 44, C.navy); img.vline(160, 23, 44, C.brownD); img.hline(143, 44, 34, C.brownD);
  stars(img, r, 0, [], 0);
  for (let i = 0; i < 6; i++) img.px(146 + Math.floor(r() * 28), 26 + Math.floor(r() * 16), C.cream);
  // estantes quentes
  for (const sx of [10, 70, 200, 260]) {
    img.rect(sx, 15, 50, 115, C.brownD);
    for (let sy = 22; sy < 125; sy += 20) {
      img.hline(sx, sy + 16, 50, C.brown);
      let bx = sx + 3;
      while (bx < sx + 47) {
        const bw = 2 + Math.floor(r() * 3), bh = 9 + Math.floor(r() * 6);
        img.rect(bx, sy + 16 - bh, bw, bh, [C.red, C.navyL, C.goldD, C.tealD, C.creamDD][Math.floor(r() * 5)]);
        bx += bw + 1;
      }
    }
  }
  // velas
  for (const cx of [120, 200]) { img.rect(cx, 100, 3, 10, C.cream); img.px(cx + 1, 98, C.amber); img.px(cx + 1, 97, C.goldL); }
  floorBands(img, 130, ['#5A3A1E', '#4A3018', '#3A2614', '#2A1A0E']);
  img.rect(100, 120, 120, 8, C.brown); img.rect(105, 128, 6, 20, C.brownD); img.rect(209, 128, 6, 20, C.brownD);
  img.rect(130, 114, 20, 6, C.cream); img.rect(165, 116, 14, 4, C.creamD);
  const file = out('backgrounds', 'scene_archive.png'); await img.save(file); note(file, 'Cena: o Arquivo de Orwin (interior aconchegante)');
}

async function bgVillage() {
  const img = new Img(W, H), r = rng(8);
  img.vgrad(0, 0, W, 110, ['#2A3A5A', '#5A6A8A', '#D9A86A', '#E8C080']);
  // colinas
  for (let x = 0; x < W; x++) { const h = 95 + Math.sin(x / 30) * 8 + Math.sin(x / 11) * 3; img.vline(x, h, H - h, C.grassD); }
  for (let x = 0; x < W; x++) { const h = 115 + Math.sin(x / 22 + 2) * 6; img.vline(x, h, H - h, C.grass); }
  // casinhas
  for (const hx of [40, 110, 210, 270]) {
    img.rect(hx, 100, 28, 22, C.plaster); img.rect(hx, 120, 28, 2, C.brownD);
    for (let i = 0; i < 16; i++) img.hline(hx - 3 + i, 100 - (16 - i) * 0.9, 34 - i * 2, C.roof);
    img.rect(hx + 11, 110, 6, 12, C.brown); img.rect(hx + 3, 105, 5, 5, C.amber);
  }
  img.speckle(0, 125, W, 55, [C.grassL, C.grassDD], 0.08, r);
  const file = out('backgrounds', 'scene_village.png'); await img.save(file); note(file, 'Cena: a vila ao entardecer');
}

async function bgTitle() {
  const img = new Img(W, H), r = rng(9);
  img.vgrad(0, 0, W, H, [C.black, C.navyD, '#1A1430', C.black2]);
  stars(img, r, 120, [C.navyL, C.creamDD, C.gold, '#3A4258'], H);
  // silhueta do castelo com o Core
  for (const [tx, tw, th] of [[60, 30, 50], [100, 20, 70], [160, 30, 100], [220, 20, 70], [260, 30, 50]]) img.rect(tx - tw / 2, H - th, tw, th, C.black);
  img.rect(40, H - 30, 240, 30, C.black);
  img.disc(160, H - 108, 4, C.lime); img.disc(160, H - 108, 2, C.limeL);
  const file = out('backgrounds', 'title.png'); await img.save(file); note(file, 'Fundo da tela de título');
}

// ================= UI =================
async function genUI() {
  // Caixa de diálogo 9-slice (24x24, bordas de 8px): creme com moldura grossa azul-marinho/dourada.
  const dlg = new Img(24, 24);
  dlg.fill(C.cream);
  dlg.rect(0, 0, 24, 24, C.navyD);
  dlg.rect(1, 1, 22, 22, C.navy);
  dlg.rect(3, 3, 18, 18, C.gold);
  dlg.rect(4, 4, 16, 16, C.goldD);
  dlg.rect(5, 5, 14, 14, C.cream);
  for (const [x, y] of [[0, 0], [23, 0], [0, 23], [23, 23]]) dlg.clear(x, y); // cantos em pixel
  dlg.px(1, 1, C.navyD); dlg.px(22, 1, C.navyD); dlg.px(1, 22, C.navyD); dlg.px(22, 22, C.navyD);
  dlg.px(3, 3, C.goldL); dlg.px(20, 3, C.goldL); dlg.px(3, 20, C.goldL); dlg.px(20, 20, C.goldL);
  let f = out('ui', 'frame_dialog.png'); await dlg.save(f); note(f, 'Moldura 9-slice da caixa de diálogo (24x24, borda 8px)');

  // Painel escuro (menus, HUD).
  const pnl = new Img(24, 24);
  pnl.rect(0, 0, 24, 24, C.black);
  pnl.rect(1, 1, 22, 22, C.goldD);
  pnl.rect(2, 2, 20, 20, C.gold);
  pnl.rect(3, 3, 18, 18, C.brownD);
  pnl.rect(4, 4, 16, 16, C.black2);
  pnl.rect(5, 5, 14, 14, '#1C2130');
  for (const [x, y] of [[0, 0], [23, 0], [0, 23], [23, 23]]) pnl.clear(x, y);
  pnl.px(2, 2, C.goldL); pnl.px(21, 2, C.goldL);
  f = out('ui', 'frame_panel.png'); await pnl.save(f); note(f, 'Moldura 9-slice de painel escuro (24x24, borda 8px)');

  // Pergaminho (corpo 9-slice).
  const par = new Img(24, 24);
  par.fill(C.cream);
  par.vline(0, 0, 24, C.creamDD); par.vline(1, 0, 24, C.creamD); par.vline(23, 0, 24, C.creamDD); par.vline(22, 0, 24, C.creamD);
  par.speckle(2, 0, 20, 24, [C.creamD], 0.05, rng(12));
  f = out('ui', 'frame_parchment.png'); await par.save(f); note(f, 'Corpo 9-slice do pergaminho (ranking)');

  // Rolos do pergaminho (topo e base).
  const roll = new Img(200, 14);
  roll.rect(4, 2, 192, 10, C.creamDD); roll.rect(4, 3, 192, 7, C.creamD); roll.hline(4, 4, 192, C.cream);
  roll.rect(0, 1, 8, 12, C.brown); roll.rect(192, 1, 8, 12, C.brown); roll.rect(1, 2, 6, 10, C.brownL); roll.rect(193, 2, 6, 10, C.brownL);
  roll.rect(2, 0, 4, 14, C.gold); roll.rect(194, 0, 4, 14, C.gold);
  f = out('ui', 'scroll_roll.png'); await roll.save(f); note(f, 'Rolo do pergaminho (topo/base)');

  // Seta ▼ e cursor ►
  const arrow = fromRows(['XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], { X: C.navy });
  f = out('ui', 'arrow_down.png'); await arrow.save(f); note(f, 'Seta ▼ da caixa de diálogo');
  const cursor = fromRows(['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'], { X: C.gold });
  f = out('ui', 'cursor.png'); await cursor.save(f); note(f, 'Cursor ► dos menus');

  // Molduras de nome (cosméticos): madeira, prata, ouro real, rúnica.
  const nameFrames = {
    frame_wood: [C.brownD, C.brown, C.brownL, '#2A1A0E'],
    frame_silver: ['#3A3E4A', '#8E96A8', '#D0D6E2', '#1C2130'],
    frame_gold: [C.goldD, C.gold, C.goldL, '#2A1A0E'],
    frame_ember: [C.redD, C.amberD, C.amber, '#2A1208'],
    frame_star: [C.navyD, C.navyL, C.cream, '#0E1428'],
  };
  for (const [name, [o, m, l, fillC]] of Object.entries(nameFrames)) {
    const img = new Img(24, 24);
    img.rect(0, 0, 24, 24, o); img.rect(1, 1, 22, 22, m); img.rect(2, 2, 20, 2, l); img.rect(2, 2, 2, 20, l);
    img.rect(4, 4, 16, 16, o); img.rect(5, 5, 14, 14, fillC);
    for (const [x, y] of [[0, 0], [23, 0], [0, 23], [23, 23]]) img.clear(x, y);
    if (name === 'frame_gold' || name === 'frame_star') for (const [x, y] of [[2, 2], [21, 2], [2, 21], [21, 21]]) img.px(x, y, C.white);
    f = out('ui', `${name}.png`); await img.save(f); note(f, `Moldura de nome (cosmético) ${name}`);
  }
}

// ================= LOGO =================
const GLYPHS = {
  D: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  e: ['.....', '.....', '.XXX.', 'X...X', 'XXXXX', 'X....', '.XXXX'],
  v: ['.....', '.....', 'X...X', 'X...X', 'X...X', '.X.X.', '..X..'],
  C: ['.XXXX', 'X....', 'X....', 'X....', 'X....', 'X....', '.XXXX'],
  o: ['.....', '.....', '.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  r: ['.....', '.....', 'X.XX.', 'XX..X', 'X....', 'X....', 'X....'],
};
async function genLogo() {
  const word = 'DevCore', S = 4, gap = 1;
  const w = word.length * (5 + gap) * S + 12, h = 7 * S + 14;
  const img = new Img(w, h);
  let x0 = 6;
  [...word].forEach((ch, idx) => {
    const isCore = idx >= 3; // "Dev" em creme, "Core" em dourado
    GLYPHS[ch].forEach((row, y) => [...row].forEach((p, x) => {
      if (p !== 'X') return;
      for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const t = (y * S + j) / (7 * S);
        const col = isCore ? (t < 0.45 ? C.goldL : t < 0.8 ? C.gold : C.goldD) : (t < 0.45 ? C.cream : t < 0.8 ? C.creamD : C.creamDD);
        img.px(x0 + x * S + i, 6 + y * S + j, col);
      }
    }));
    x0 += (5 + gap) * S;
  });
  img.outline(C.brownD);
  img.outline(C.black);
  const f = out('ui', 'logo.png'); await img.save(f); note(f, 'Logo "DevCore" em pixel');
}

// ================= ÍCONES (16x16) =================
async function genIcons() {
  const icons = {
    coin: [['...XXXXXX...', '..XYYYYYYX..', '.XYGGGGGGdX.', 'XYGGGddGGGdX', 'XYGGdGGGGGdX', 'XYGGdGGGGGdX', 'XYGGdGGGGGdX', 'XYGGGddGGGdX', '.XGGGGGGGdX.', '..XddddddX..', '...XXXXXX...'], { X: C.brownD, Y: C.goldL, G: C.gold, d: C.goldD }],
    heart: [['.XXX...XXX.', 'XrrrX.XrrrX', 'XrWrrXrrrrX', 'XrrrrrrrrrX', 'XrrrrrrrrrX', '.XrrrrrrrX.', '..XrrrrrX..', '...XrrrX...', '....XrX....', '.....X.....'], { X: C.redD, r: '#D8443A', W: C.cream }],
    xp: [['.....X.....', '....XYX....', '....XYX....', '.XXXXYXXXX.', 'XYYYYYYYYYX', '.XYYYYYYYX.', '..XYYYYYX..', '..XYYXYYX..', '.XYYX.XYYX.', '.XXX...XXX.'], { X: C.amberD, Y: C.goldL }],
    scroll: [['.XXXXXXXXXX.', 'XcCCCCCCCCcX', 'XcXXXXXXXXcX', '.XcccccccX..', '.XcXXXXXcX..', '.XcccccccX..', '.XcXXXXcX...', '.XcccccccX..', 'XcXXXXXXXXcX', 'XcCCCCCCCCcX', '.XXXXXXXXXX.'], { X: C.brownD, c: C.cream, C: C.creamD }],
    sword: [['.........XX', '........XWX', '.......XWX.', '......XWX..', '.....XWX...', '.X..XWX....', '.XXXWX.....', '..XGX......', '.XGXXX.....', 'XGX..X.....', 'XX.........'], { X: C.black2, W: '#D0D6E2', G: C.gold }],
    shield: [['XXXXXXXXXX', 'XNNNGGNNNX', 'XNNNGGNNNX', 'XNNNGGNNNX', 'XGGGGGGGGX', 'XNNNGGNNNX', '.XNNGGNNX.', '.XNNGGNNX.', '..XNGGNX..', '...XGGX...', '....XX....'], { X: C.black2, N: C.navyL, G: C.gold }],
    flask: [['...XXXX...', '...XccX...', '...XccX...', '..XtccX...', '..XttttX..', '.XttTtttX.', 'XttTtttttX', 'XtttttgttX', 'XttgtttttX', '.XttttttX.', '..XXXXXX..'], { X: C.black2, c: C.creamD, t: C.teal, T: '#9AF0E8', g: C.gold }],
    bolt: [['.....XXXX', '....XAAX.', '...XAAX..', '..XAAXXX.', '.XAAAAAX.', 'XXXXAAX..', '...XAX...', '..XAX....', '.XAX.....', 'XX.......'], { X: C.amberD, A: C.amber }],
    lock: [['..XXXX..', '.X....X.', '.X....X.', 'XXXXXXXX', 'XGGGGGGX', 'XGGXXGGX', 'XGGXXGGX', 'XGGGGGGX', 'XXXXXXXX'], { X: C.black2, G: C.gold }],
    check: [['.......XX', '......XGX', '.....XGX.', 'XX..XGX..', 'XGXXGX...', '.XGGX....', '..XX.....'], { X: C.black2, G: '#6FCF6F' }],
    cross: [['XX...XX', 'XRX.XRX', '.XRXRX.', '..XRX..', '.XRXRX.', 'XRX.XRX', 'XX...XX'], { X: C.black2, R: '#E0584A' }],
    medal_gold: medal(C.gold, C.goldL, C.goldD),
    medal_silver: medal('#AEB6C8', '#E2E8F2', '#6E7688'),
    medal_bronze: medal('#C07A3A', '#E8A66A', '#7A4A1E'),
    star: [['....X....', '...XGX...', 'XXXXGXXXX', '.XGGGGGX.', '..XGGGX..', '.XGGXGGX.', '.XX...XX.'], { X: C.goldD, G: C.goldL }],
    chest: [['.XXXXXXXXXX.', 'XBBBBBBBBBBX', 'XBbbbbbbbbBX', 'XGGGGGGGGGGX', 'XBbbbGGbbbBX', 'XBbbbGGbbbBX', 'XBbbbbbbbbBX', 'XXXXXXXXXXXX'], { X: C.black2, B: C.brown, b: C.brownL, G: C.gold }],
    daily: [['XXXXXXXXXX', 'XRRRRRRRRX', 'XccccccccX', 'XcXcXcXccX', 'XccccccccX', 'XcXcXcXccX', 'XccccccccX', 'XXXXXXXXXX'], { X: C.black2, R: C.red, c: C.cream }],
  };
  function medal(main, light, dark) {
    return [['.RR..RR.', '.RR..RR.', '..RRRR..', '..XXXX..', '.XmLLmX.', 'XmLmmmmX', 'XmmmmmmX', 'XmmmmdmX', '.XmddmX.', '..XXXX..'], { X: C.black2, R: C.red, m: main, L: light, d: dark }];
  }
  for (const [name, [rows, pal]] of Object.entries(icons)) {
    const src = fromRows(rows, pal);
    const img = new Img(16, 16);
    img.blit(src, Math.floor((16 - src.w) / 2), Math.floor((16 - src.h) / 2));
    const f = out('icons', `${name}.png`); await img.save(f); note(f, `Ícone ${name} (16x16)`);
  }
}

// ================= EFEITOS (tiras de 4 quadros 32x32) =================
async function genEffects() {
  const strip = async (name, desc, draw) => {
    const img = new Img(32 * 4, 32);
    for (let f = 0; f < 4; f++) { const fr = new Img(32, 32); draw(fr, f); img.blit(fr, f * 32, 0); }
    const file = out('fx', `${name}.png`); await img.save(file); note(file, desc);
  };
  await strip('impact', 'Efeito de impacto (4 quadros 32x32)', (img, f) => {
    const rad = 4 + f * 4;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2 + f * 0.2;
      img.line(16 + Math.cos(ang) * (rad - 4), 16 + Math.sin(ang) * (rad - 4), 16 + Math.cos(ang) * rad, 16 + Math.sin(ang) * rad, f < 3 ? C.white : C.creamD);
    }
    if (f < 2) img.disc(16, 16, 5 - f * 2, C.cream);
    if (f === 0) img.disc(16, 16, 2, C.white);
  });
  await strip('magic_python', 'Magia do Alquimista (Python): orbes teal e dourado (4 quadros)', (img, f) => {
    const r = rng(10 + f);
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2 + f * 0.7, d = 4 + f * 3 + r() * 3;
      const x = 16 + Math.cos(ang) * d, y = 16 + Math.sin(ang) * d;
      img.disc(x, y, 2 - (f > 2 ? 1 : 0), i % 2 ? C.teal : C.gold);
      img.px(x - 1, y - 1, i % 2 ? '#9AF0E8' : C.goldL);
    }
    img.disc(16, 16, 4 - f, C.teal); img.disc(15, 15, Math.max(1, 2 - f), '#9AF0E8');
  });
  await strip('magic_js', 'Magia do Mago (JavaScript): raios âmbar (4 quadros)', (img, f) => {
    const r = rng(20 + f);
    for (let b = 0; b < 3; b++) {
      let x = 16, y = 16;
      const ang = r() * Math.PI * 2;
      for (let s = 0; s < 4 + f; s++) {
        const nx = x + Math.cos(ang) * 3 + (r() - 0.5) * 5, ny = y + Math.sin(ang) * 3 + (r() - 0.5) * 5;
        img.line(x, y, nx, ny, s % 2 ? C.amber : C.goldL);
        x = nx; y = ny;
      }
    }
    img.disc(16, 16, 3, C.amber); img.disc(16, 16, 1.5, C.white);
  });
  await strip('corruption', 'Partículas de corrupção verde-limão dos vilões (4 quadros)', (img, f) => {
    const r = rng(30);
    for (let i = 0; i < 14; i++) {
      const x = r() * 32, y0 = r() * 32, y = (y0 - f * 4 + 32) % 32, s = r() < 0.3 ? 2 : 1;
      img.rect(x, y, s, s, [C.lime, C.limeD, C.limeL][i % 3]);
    }
  });
  await strip('heal', 'Brilho de cura/vitória dourado (4 quadros)', (img, f) => {
    const r = rng(40);
    for (let i = 0; i < 10; i++) {
      const x = 4 + r() * 24, y = 28 - ((r() * 24 + f * 6) % 26);
      img.px(x, y, C.goldL); img.px(x, y + 1, C.gold);
    }
  });
}

// ================= COSMÉTICOS =================
async function genCosmetics() {
  const hats = {
    hat_mage: [['.......XX..', '......XNNX.', '.....XNNX..', '....XNNNX..', '....XNSNX..', '...XNNNNNX.', '...XNNNNNX.', '..XAAAAAAAX', 'XXNNNNNNNNNXX', 'XNNNNNNNNNNNX', '.XXXXXXXXXXX.'], { X: C.navyD, N: C.navyL, A: C.amber, S: C.goldL }],
    hat_feather: [['.........WW', '........WWW', '.......WWX.', '..XXXXXWX..', '.XRRRRRRX..', 'XRRRRRRRRX.', 'XRRGGGGRRX.', 'XXXXXXXXXXX'], { X: C.redD, R: C.red, G: C.gold, W: C.cream }],
    hat_hood: [['...XXXXX...', '..XBBBBBX..', '.XBBbbbBBX.', 'XBBb...bBBX', 'XBb.....bBX', 'XB.......BX'], { X: C.brownD, B: C.brown, b: C.brownL }],
    hat_crown: [['X...X...X', 'XG.XGX.GX', 'XGGGRGGGX', 'XGGGGGGGX', 'XYYYYYYYX', 'XXXXXXXXX'], { X: C.goldD, G: C.gold, Y: C.goldL, R: C.red }],
    hat_glasses: [['.XXXX..XXXX.', 'XWccX XWccX', 'XccWXXXccWX', '.XXXX..XXXX.'], { X: C.black2, c: '#9AC8E8', W: C.white }],
    hat_laurel: [['.L.L...L.L.', 'LgL.....LgL', '.LgL...LgL.', '..LgLLLgL..', '...LLLLL...'], { L: '#6E9A3A', g: C.goldL }],
  };
  for (const [name, [rows, pal]] of Object.entries(hats)) {
    const img = fromRows(rows, pal);
    const f = out('cosmetics', `${name}.png`); await img.save(f); note(f, `Cosmético de cabeça ${name} (âncora: centro-inferior na cabeça)`);
  }
  // Auras 64x64: brilho dithered radial
  const auras = {
    aura_ember: [C.amber, C.amberD, C.red],
    aura_starlight: [C.cream, C.navyL, C.navy],
    aura_golden: [C.goldL, C.gold, C.goldD],
    aura_tide: ['#9AF0E8', C.teal, C.tealD],
  };
  for (const [name, cols] of Object.entries(auras)) {
    const img = new Img(64, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const d = Math.hypot(x - 32, (y - 36) * 0.85) / 30;
      if (d > 1) continue;
      const t = 1 - d;
      if (bayer(x, y) < t * 0.75) img.px(x, y, t > 0.6 ? cols[0] : t > 0.35 ? cols[1] : cols[2]);
    }
    const f = out('cosmetics', `${name}.png`); await img.save(f); note(f, `Aura ${name} (64x64, desenhada atrás do herói)`);
  }
}

function writeAssetsDoc() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'game', 'assets', 'sprite-manifest.json'), 'utf8'));
  const PH = '**placeholder procedural, substituir por arte feita à mão**';
  const lines = [
    '# Assets do DevCore',
    '',
    'Este arquivo é gerado por `npm run assets` (scripts/generate-assets.mjs). Não edite à mão.',
    '',
    '## Como trocar um asset',
    '',
    '- **PNG procedural**: substitua o arquivo em `public/assets/...` mantendo o mesmo nome e as mesmas dimensões. Nada no código muda.',
    '- **Sprite de personagem**: coloque a folha nova em `art/source/` e rode `npm run sprites`, ou edite direto o PNG em `public/assets/sprites/` e ajuste `src/game/assets/sprite-manifest.json` (quadros, fps, âncoras dos pés e da cabeça).',
    '- **Tileset**: a ordem dos tiles está em `src/game/assets/tileset.json`; mantenha a grade de 24x24.',
    '',
    '## Sprites de personagens (processados de art/source)',
    '',
    '| Personagem | Arquivo | Quadro | Animações | Origem |',
    '|---|---|---|---|---|',
    ...Object.values(manifest.characters).map((c) => `| ${c.id} | public/${c.image} | ${c.frameW}x${c.frameH} | ${Object.keys(c.animations).join(', ')} | ${c.placeholder ? `${PH} (${c.placeholder})` : 'arte original fatiada por scripts/process-sprites.mjs'} |`),
    '',
    'Retratos de diálogo (48x48) em `public/assets/portraits/`, recortados do primeiro quadro idle de cada folha.',
    '',
    '## Assets gerados proceduralmente',
    '',
    '| Arquivo | Descrição | Status |',
    '|---|---|---|',
    ...generated.map((g) => `| public/${g.file} | ${g.desc} | ${PH} |`),
    '',
  ];
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'ASSETS.md'), lines.join('\n'));
}

async function main() {
  fs.mkdirSync(path.join(ROOT, 'src', 'game', 'assets'), { recursive: true });
  await genTileset();
  await bgAldric(); await bgVeyr(); await bgSeraphine(); await bgEntity();
  await bgKingdom(); await bgCore(); await bgArchive(); await bgVillage(); await bgTitle();
  await genUI(); await genLogo(); await genIcons(); await genEffects(); await genCosmetics();
  fs.writeFileSync(path.join(ROOT, 'scripts', 'generated-assets.json'), JSON.stringify(generated, null, 2) + '\n');
  writeAssetsDoc();
  console.log(`${generated.length} assets gerados.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
