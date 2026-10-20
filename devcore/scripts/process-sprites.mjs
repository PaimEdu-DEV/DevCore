// Processa as folhas de sprite geradas por IA (fundo magenta) em folhas limpas
// de pixel art + sprite-manifest.json. Uso: node scripts/process-sprites.mjs
// Origem: art/source (cópia versionada dos originais). Nunca altera a origem.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.SPRITES_SRC ?? path.join(ROOT, 'art', 'source');
const OUT = path.join(ROOT, 'public', 'assets', 'sprites');
const PORTRAITS = path.join(ROOT, 'public', 'assets', 'portraits');
const MANIFEST = path.join(ROOT, 'src', 'game', 'assets', 'sprite-manifest.json');
const PREVIEW = process.env.SPRITES_PREVIEW; // opcional: caminho de um PNG de conferência

const LAYOUTS = {
  villain: [
    { name: 'idle', row: 0, cols: [0, 1, 2, 3], fps: 5, loop: true },
    { name: 'attack', row: 1, cols: [0, 1, 2, 3], fps: 8, loop: false },
    { name: 'hurt', row: 2, cols: [0, 1], fps: 6, loop: false },
    { name: 'defeat', row: 2, cols: [2, 3], fps: 3, loop: false },
  ],
  hero: [
    { name: 'idle', row: 0, cols: [0, 1, 2, 3], fps: 5, loop: true },
    { name: 'walk', row: 1, cols: [0, 1, 2, 3], fps: 8, loop: true },
    { name: 'attack', row: 2, cols: [0, 1, 2, 3], fps: 8, loop: false },
    { name: 'hurt', row: 3, cols: [0, 1], fps: 6, loop: false },
    { name: 'victory', row: 3, cols: [2, 3], fps: 4, loop: true },
  ],
  npc: [
    { name: 'idle', row: 0, cols: [0, 1, 2, 3], fps: 3, loop: true },
    { name: 'talk', row: 1, cols: [0, 1, 2, 3], fps: 5, loop: true },
  ],
};

// size = lado do quadro quadrado; fill = fração do quadro ocupada pela altura do idle.
const CHARACTERS = [
  { id: 'aldric', file: 'aldric.png', kind: 'villain', cols: 4, rows: 3, size: 96, fill: 0.92 },
  { id: 'veyr', file: 'veyr.png', kind: 'villain', cols: 4, rows: 3, size: 96, fill: 0.86 },
  { id: 'seraphine', file: 'seraphine.jpg', kind: 'villain', cols: 4, rows: 3, size: 96, fill: 0.92 },
  { id: 'entity', file: 'entity.jpg', kind: 'villain', cols: 4, rows: 3, size: 128, fill: 0.95 },
  { id: 'hero_alchemist_m', file: 'hero_alchemist_m.jpg', kind: 'hero', cols: 4, rows: 4, size: 48, fill: 0.9 },
  { id: 'hero_alchemist_f', file: 'hero_alchemist_f.jpg', kind: 'hero', cols: 4, rows: 4, size: 48, fill: 0.9 },
  { id: 'hero_mage_m', file: 'hero_alchemist_m.jpg', kind: 'hero', cols: 4, rows: 4, size: 48, fill: 0.9, recolor: 'mage', placeholder: 'Recolorido a partir do Alquimista; chapéu de mago desenhado em tempo de execução' },
  { id: 'hero_mage_f', file: 'hero_alchemist_f.jpg', kind: 'hero', cols: 4, rows: 4, size: 48, fill: 0.9, recolor: 'mage', placeholder: 'Recolorido a partir da Alquimista; chapéu de mago desenhado em tempo de execução' },
  { id: 'orwin', file: 'npc_orwin.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
  { id: 'garrick', file: 'npc_garrick.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
  { id: 'maren', file: 'npc_maren.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
  { id: 'isolde', file: 'npc_isolde.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
  { id: 'torvan', file: 'npc_torvan.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
  { id: 'elowen', file: 'npc_elowen.jpg', kind: 'npc', cols: 4, rows: 2, size: 48, fill: 0.92 },
];

// ---------- helpers de cor ----------
function isMagenta(r, g, b) {
  return r > 120 && b > 120 && (r + b) / 2 - g > 80 && Math.abs(r - b) < 110;
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}
function hsvToRgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// ---------- imagem de origem ----------
async function load(file) {
  const { data, info } = await sharp(path.join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const fg = new Uint8Array(w * h); // 1 = conteúdo
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    fg[i] = isMagenta(r, g, b) ? 0 : 1;
  }
  return { data, w, h, fg };
}

// Linhas de grade (separadores escuros que cruzam a folha inteira) são pintadas
// de volta: viram fundo, a não ser que haja conteúdo dos dois lados (aí herdam o vizinho).
function removeGridLines(img) {
  const { w, h, fg, data } = img;
  const lineRows = [];
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) c += fg[y * w + x];
    if (c > w * 0.88) lineRows.push(y);
  }
  const lineCols = [];
  for (let x = 0; x < w; x++) {
    let c = 0;
    for (let y = 0; y < h; y++) c += fg[y * w + x];
    if (c > h * 0.88) lineCols.push(x);
  }
  const bands = (list) => {
    const out = [];
    for (const v of list) {
      const last = out[out.length - 1];
      if (last && v === last[1] + 1) last[1] = v; else out.push([v, v]);
    }
    return out.filter(([a, b]) => b - a < 16);
  };
  const copy = (to, from) => {
    fg[to] = fg[from];
    for (let k = 0; k < 4; k++) data[to * 4 + k] = data[from * 4 + k];
  };
  const pad = 2;
  for (const [a, b] of bands(lineRows)) {
    const above = a - pad - 1, below = b + pad + 1;
    for (let x = 0; x < w; x++) {
      const up = above >= 0 ? fg[above * w + x] : 0;
      const dn = below < h ? fg[below * w + x] : 0;
      for (let y = Math.max(0, a - pad); y <= Math.min(h - 1, b + pad); y++) {
        if (up && dn) copy(y * w + x, (y < (a + b) / 2 ? above : below) * w + x);
        else fg[y * w + x] = 0;
      }
    }
  }
  for (const [a, b] of bands(lineCols)) {
    const left = a - pad - 1, right = b + pad + 1;
    for (let y = 0; y < h; y++) {
      const l = left >= 0 ? fg[y * w + left] : 0;
      const r = right < w ? fg[y * w + right] : 0;
      for (let x = Math.max(0, a - pad); x <= Math.min(w - 1, b + pad); x++) {
        if (l && r) copy(y * w + x, y * w + (x < (a + b) / 2 ? left : right));
        else fg[y * w + x] = 0;
      }
    }
  }
  // Moldura externa da folha (bordas escuras coladas no limite da imagem).
  const edge = 6;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x < edge || y < edge || x >= w - edge || y >= h - edge) {
      const i = y * w + x, r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      if (r + g + b < 200) fg[i] = 0;
    }
  }
  return { rows: bands(lineRows).length, cols: bands(lineCols).length };
}

// Recolore o Alquimista em Mago (casaco azul-marinho, frascos âmbar).
function recolorMage(img) {
  const { w, h, data, fg } = img;
  for (let i = 0; i < w * h; i++) {
    if (!fg[i]) continue;
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const [hh, s, v] = rgbToHsv(r, g, b);
    let out = null;
    if (hh >= 8 && hh <= 38 && s > 0.45 && v < 0.72 && v > 0.12) out = hsvToRgb(228, Math.min(0.75, s * 0.9), Math.min(1, v * 1.05));
    else if (hh >= 150 && hh <= 200 && s > 0.3) out = hsvToRgb(36, Math.min(1, s * 1.1), Math.min(1, v * 1.05));
    if (out) [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]] = out;
  }
}

function cellBox(img, cx0, cy0, cw, ch) {
  const { w, fg } = img;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, count = 0;
  const xs = [];
  for (let y = cy0; y < cy0 + ch; y++) {
    let rowCount = 0;
    for (let x = cx0; x < cx0 + cw; x++) rowCount += fg[y * w + x];
    if (rowCount < 2) continue;
    for (let x = cx0; x < cx0 + cw; x++) {
      if (!fg[y * w + x]) continue;
      count++;
      xs.push(x);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (count < 200) return null;
  xs.sort((a, b) => a - b);
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, medianX: xs[xs.length >> 1], count };
}

function bodyCenter(img, box) {
  // Centro horizontal do "corpo": mediana das colunas na faixa dos pés/pernas (60%–100% da altura),
  // menos sensível a armas e efeitos que se estendem para os lados.
  const { w, fg } = img;
  const xs = [];
  const yStart = Math.round(box.y0 + box.h * 0.35);
  for (let y = yStart; y <= box.y1; y++) for (let x = box.x0; x <= box.x1; x++) if (fg[y * w + x]) xs.push(x);
  if (!xs.length) return box.medianX;
  xs.sort((a, b) => a - b);
  return Math.round((xs[xs.length >> 1] + box.medianX) / 2);
}

// Reamostragem "vizinho mais próximo robusta": cada pixel de destino olha o bloco de origem,
// decide transparência por maioria e pega a mediana das cores do miolo do bloco (remove ruído JPEG).
function sampleFrame(img, opts) {
  const { size, scale, srcCenterX, srcFeetY, clip } = opts;
  const out = Buffer.alloc(size * size * 4);
  const { w, data, fg } = img;
  const step = 1 / scale;
  const feetRow = size - 2;
  for (let ty = 0; ty < size; ty++) {
    for (let tx = 0; tx < size; tx++) {
      const sx0 = srcCenterX + (tx - size / 2) * step;
      const sy0 = srcFeetY - (feetRow - ty) * step - step;
      let total = 0, fgc = 0;
      const rs = [], gs = [], bs = [];
      const m = step * 0.2;
      for (let sy = Math.floor(sy0); sy < Math.ceil(sy0 + step); sy++) {
        for (let sx = Math.floor(sx0); sx < Math.ceil(sx0 + step); sx++) {
          if (sx < clip.x0 || sy < clip.y0 || sx >= clip.x1 || sy >= clip.y1) { total++; continue; }
          total++;
          const i = sy * w + sx;
          if (!fg[i]) continue;
          fgc++;
          if (sx >= sx0 + m && sx < sx0 + step - m && sy >= sy0 + m && sy < sy0 + step - m) {
            rs.push(data[i * 4]); gs.push(data[i * 4 + 1]); bs.push(data[i * 4 + 2]);
          }
        }
      }
      if (!total || fgc / total < 0.5) continue;
      if (!rs.length) continue;
      const med = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; };
      const o = (ty * size + tx) * 4;
      out[o] = med(rs); out[o + 1] = med(gs); out[o + 2] = med(bs); out[o + 3] = 255;
    }
  }
  despill(out, size);
  return out;
}

function despill(buf, size) {
  // Duas passadas: remove a franja rosada/arroxeada deixada pelo chroma key nas bordas.
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      if (!buf[o + 3]) continue;
      const r = buf[o], g = buf[o + 1], b = buf[o + 2];
      const pinkish = r > 55 && b > 45 && r >= b * 0.8 && r > g * 1.45 && b > g * 1.45 && (r + b) / 2 - g > 30;
      if (!pinkish) continue;
      let edge = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || !buf[(ny * size + nx) * 4 + 3]) edge = true;
      }
      if (edge) kill.push(o);
    }
    for (const o of kill) buf[o + 3] = 0;
  }
  // pixels soltos (sem vizinho opaco) viram transparentes
  const lonely = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4;
    if (!buf[o + 3]) continue;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < size && ny < size && buf[(ny * size + nx) * 4 + 3]) n++;
    }
    if (n === 0) lonely.push(o);
  }
  for (const o of lonely) buf[o + 3] = 0;
}

const opaque = (buf, size, x, y) => x >= 0 && y >= 0 && x < size && y < size && buf[(y * size + x) * 4 + 3] > 0;

function frameMeta(buf, size, refX) {
  let top = size, bottom = -1, left = size, right = -1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!opaque(buf, size, x, y)) continue;
    if (y < top) top = y; if (y > bottom) bottom = y;
    if (x < left) left = x; if (x > right) right = x;
  }
  if (bottom < 0) return { empty: true, head: { x: size >> 1, y: 0 } };
  let hx;
  if (refX === undefined) {
    // referência: média das colunas opacas no topo do conteúdo, restrita ao miolo
    const xs = [];
    const band = Math.max(3, Math.round((bottom - top) * 0.12));
    for (let y = top; y < top + band; y++) for (let x = Math.round(size * 0.2); x < Math.round(size * 0.8); x++) {
      if (opaque(buf, size, x, y)) xs.push(x);
    }
    hx = xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : size >> 1;
  } else hx = refX;
  // topo da cabeça: primeira linha com massa (>= 4 px) perto da coluna de referência,
  // o que ignora cajados e lâminas finos acima da cabeça.
  const win = Math.round(size / 8);
  for (let y = top; y < bottom; y++) {
    const xs = [];
    for (let x = hx - win; x <= hx + win; x++) if (opaque(buf, size, x, y)) xs.push(x);
    if (xs.length >= Math.max(3, Math.round(size / 12))) {
      return { empty: false, bbox: { x: left, y: top, w: right - left + 1, h: bottom - top + 1 }, head: { x: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), y } };
    }
  }
  return { empty: false, bbox: { x: left, y: top, w: right - left + 1, h: bottom - top + 1 }, head: { x: hx, y: top } };
}

async function processCharacter(c, log) {
  const img = await load(c.file);
  const lines = removeGridLines(img);
  if (c.recolor === 'mage') recolorMage(img);
  const cw = Math.floor(img.w / c.cols), ch = Math.floor(img.h / c.rows);
  const layout = LAYOUTS[c.kind];
  const boxes = {};
  for (const anim of layout) for (const col of anim.cols) {
    const key = `${anim.row},${col}`;
    const box = cellBox(img, col * cw + 3, anim.row * ch + 3, cw - 6, ch - 6);
    boxes[key] = box;
    if (!box) log.push(`${c.id}: célula vazia/ilegível (linha ${anim.row}, coluna ${col}) — usando fallback do quadro idle`);
  }
  const idle = layout[0];
  const idleBoxes = idle.cols.map((col) => boxes[`${idle.row},${col}`]).filter(Boolean);
  const idleH = idleBoxes.reduce((a, b) => a + b.h, 0) / idleBoxes.length;
  const maxW = Math.max(...Object.values(boxes).filter(Boolean).map((b) => b.w));

  const result = { id: c.id, kind: c.kind, placeholder: c.placeholder ?? null };
  const size = c.size;
  const scale = Math.min((size * c.fill) / idleH, (size - 2) / maxW);
  const animsOut = {};
  const sheetW = size * 4, sheetH = size * layout.length;
  const sheet = Buffer.alloc(sheetW * sheetH * 4);
  let refX;
  layout.forEach((anim, ai) => {
    const heads = [];
    anim.cols.forEach((col, fi) => {
      let box = boxes[`${anim.row},${col}`];
      let cellCol = col, cellRow = anim.row;
      if (!box) { box = idleBoxes[0]; cellCol = idle.cols[0]; cellRow = idle.row; }
      const clip = { x0: cellCol * cw + 3, y0: cellRow * ch + 3, x1: (cellCol + 1) * cw - 3, y1: (cellRow + 1) * ch - 3 };
      const buf = sampleFrame(img, { size, scale, srcCenterX: bodyCenter(img, box), srcFeetY: box.y1 + 1, clip });
      const meta = frameMeta(buf, size, refX);
      if (refX === undefined) refX = meta.head.x;
      for (let y = 0; y < size; y++) {
        buf.copy(sheet, ((ai * size + y) * sheetW + fi * size) * 4, y * size * 4, (y + 1) * size * 4);
      }
      heads.push(meta.head);
    });
    animsOut[anim.name] = { row: ai, frames: anim.cols.length, fps: anim.fps, loop: anim.loop, head: heads };
  });
  const file = `${c.id}.png`;
  await sharp(sheet, { raw: { width: sheetW, height: sheetH, channels: 4 } }).png().toFile(path.join(OUT, file));
  Object.assign(result, {
    image: `assets/sprites/${file}`,
    frameW: size, frameH: size,
    feet: { x: size >> 1, y: size - 2 },
    animations: animsOut,
  });

  // Retrato: cabeça e ombros a partir do primeiro quadro idle, em escala maior.
  const pBox = idleBoxes[0];
  const pSize = 48;
  const portionH = pBox.h * (c.kind === 'villain' ? (c.id === 'entity' ? 0.42 : 0.36) : 0.4);
  const pScale = pSize / portionH;
  // centro horizontal da cabeça: mediana das colunas no topo do quadro
  const xs = [];
  for (let y = pBox.y0; y < pBox.y0 + portionH * 0.5; y++) for (let x = pBox.x0; x <= pBox.x1; x++) if (img.fg[y * img.w + x]) xs.push(x);
  xs.sort((a, b) => a - b);
  const pcx = xs.length ? xs[xs.length >> 1] : pBox.medianX;
  const col0 = idle.cols[0];
  const pbuf = sampleFrame(img, {
    size: pSize, scale: pScale, srcCenterX: pcx, srcFeetY: pBox.y0 + portionH + (2 / pScale) - (portionH * 0.04),
    clip: { x0: col0 * cw + 3, y0: idle.row * ch + 3, x1: (col0 + 1) * cw - 3, y1: (idle.row + 1) * ch - 3 },
  });
  await sharp(pbuf, { raw: { width: pSize, height: pSize, channels: 4 } }).png().toFile(path.join(PORTRAITS, `${c.id}.png`));
  result.portrait = `assets/portraits/${c.id}.png`;
  log.push(`${c.id}: ${img.w}x${img.h}, células ${cw}x${ch}, linhas de grade removidas ${lines.rows}h/${lines.cols}v, idleH=${idleH.toFixed(0)}`);
  return result;
}

async function writePreview(entries) {
  // Folha de conferência: todas as variantes ampliadas 3x sobre fundo cinza.
  const tiles = [];
  let y = 0;
  const W = 1600;
  for (const e of entries) {
    const meta = await sharp(path.join(ROOT, 'public', e.image)).metadata();
    const s = 3;
    const buf = await sharp(path.join(ROOT, 'public', e.image)).resize(meta.width * s, meta.height * s, { kernel: 'nearest' }).png().toBuffer();
    tiles.push({ input: buf, left: 10, top: y });
    y += meta.height * s + 10;
  }
  await sharp({ create: { width: W, height: y, channels: 4, background: { r: 90, g: 96, b: 110, alpha: 1 } } })
    .composite(tiles).png().toFile(PREVIEW);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(PORTRAITS, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  const only = process.argv[2];
  const log = [];
  const characters = {};
  for (const c of CHARACTERS) {
    if (only && c.id !== only) continue;
    characters[c.id] = await processCharacter(c, log);
  }
  if (!only) {
    const manifest = { version: 1, generatedBy: 'scripts/process-sprites.mjs', characters };
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  }
  if (PREVIEW) await writePreview(Object.values(characters));
  console.log(log.join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
