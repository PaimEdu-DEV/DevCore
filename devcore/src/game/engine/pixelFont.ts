// Fonte bitmap 3x5 para números de dano e rótulos curtos desenhados no canvas.
const GLYPHS: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
  '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001111', '+': '000010111010000', '-': '000000111000000',
  '!': '010010010000010', ' ': '000000000000000', '/': '001001010100100', ':': '000010000010000',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
};

const ACCENTS: Record<string, string> = { Á: 'A', À: 'A', Ã: 'A', Â: 'A', É: 'E', Ê: 'E', Í: 'I', Ó: 'O', Õ: 'O', Ô: 'O', Ú: 'U', Ç: 'C' };

export function pixelTextWidth(text: string, scale = 1): number {
  return Math.max(0, text.length * 4 - 1) * scale;
}

/** Desenha texto em pixel com contorno. (x, y) = canto superior esquerdo. */
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  opts: { scale?: number; outline?: string; align?: 'left' | 'center' } = {},
): void {
  const s = opts.scale ?? 1;
  const upper = text.toUpperCase();
  const cx = Math.round(opts.align === 'center' ? x - pixelTextWidth(upper, s) / 2 : x);
  const cy = Math.round(y);
  const pass = (fill: string, dx: number, dy: number) => {
    ctx.fillStyle = fill;
    let px = cx;
    for (const raw of upper) {
      const ch = ACCENTS[raw] ?? raw;
      const g = GLYPHS[ch] ?? GLYPHS[' '];
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') ctx.fillRect(px + (i % 3) * s + dx, cy + Math.floor(i / 3) * s + dy, s, s);
      }
      px += 4 * s;
    }
  };
  if (opts.outline) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]] as const) pass(opts.outline, dx * s, dy * s);
  }
  pass(color, 0, 0);
}
