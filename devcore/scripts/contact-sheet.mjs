// Ferramenta de conferência: junta vários PNGs ampliados numa folha só.
// Uso: node scripts/contact-sheet.mjs saida.png escala arquivo1.png arquivo2.png ...
import sharp from 'sharp';

const [, , outFile, scaleArg, ...files] = process.argv;
const scale = Number(scaleArg) || 2;
const maxW = 1400;
const tiles = [];
let x = 8, y = 8, rowH = 0;
for (const f of files) {
  const meta = await sharp(f).metadata();
  const w = meta.width * scale, h = meta.height * scale;
  if (x + w > maxW) { x = 8; y += rowH + 8; rowH = 0; }
  tiles.push({ input: await sharp(f).resize(w, h, { kernel: 'nearest' }).png().toBuffer(), left: x, top: y });
  x += w + 8; rowH = Math.max(rowH, h);
}
await sharp({ create: { width: maxW, height: y + rowH + 8, channels: 4, background: { r: 120, g: 128, b: 140, alpha: 1 } } })
  .composite(tiles).png().toFile(outFile);
