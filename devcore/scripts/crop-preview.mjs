// Ferramenta de conferência: recorta (e opcionalmente amplia) um PNG.
// Uso: node scripts/crop-preview.mjs entrada.png saida.png left top width height [escala]
import sharp from 'sharp';

const [, , input, out, l, t, w, h, s] = process.argv;
let img = sharp(input).extract({ left: +l, top: +t, width: +w, height: +h });
if (s) img = sharp(await img.png().toBuffer()).resize(Math.round(+w * +s), Math.round(+h * +s), { kernel: 'nearest' });
await img.png().toFile(out);
