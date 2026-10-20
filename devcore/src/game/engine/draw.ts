import { getCharacter, getImage, heroSpriteId, type AnimationDef, type CharacterSprite } from '../assets/sprites';
import { getCosmetic, MAGE_CLASS_HAT, type HatCosmetic } from '../data/cosmetics';

export interface DrawOpts {
  flip?: boolean;
  alpha?: number;
  /** Pinta o sprite inteiro de uma cor (ex.: flash branco ao receber dano). */
  tint?: string;
  scale?: number;
}

export function frameIndex(anim: AnimationDef, elapsedMs: number): number {
  const f = Math.floor((Math.max(0, elapsedMs) / 1000) * anim.fps);
  return anim.loop ? f % anim.frames : Math.min(anim.frames - 1, f);
}

export function animDuration(anim: AnimationDef): number {
  return (anim.frames / anim.fps) * 1000;
}

let tintCanvas: HTMLCanvasElement | null = null;

function blitFrame(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  opts: DrawOpts,
): void {
  const scale = opts.scale ?? 1;
  const dw = sw * scale;
  const dh = sh * scale;
  let source: CanvasImageSource = img;
  let ssx = sx;
  let ssy = sy;
  if (opts.tint) {
    tintCanvas ??= document.createElement('canvas');
    tintCanvas.width = sw;
    tintCanvas.height = sh;
    const t = tintCanvas.getContext('2d')!;
    t.clearRect(0, 0, sw, sh);
    t.globalCompositeOperation = 'source-over';
    t.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    t.globalCompositeOperation = 'source-atop';
    t.fillStyle = opts.tint;
    t.fillRect(0, 0, sw, sh);
    source = tintCanvas;
    ssx = 0;
    ssy = 0;
  }
  ctx.save();
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  if (opts.flip) {
    ctx.translate(Math.round(dx + dw), Math.round(dy));
    ctx.scale(-1, 1);
    ctx.drawImage(source, ssx, ssy, sw, sh, 0, 0, dw, dh);
  } else {
    ctx.drawImage(source, ssx, ssy, sw, sh, Math.round(dx), Math.round(dy), dw, dh);
  }
  ctx.restore();
}

/** Desenha um quadro de personagem com os pés em (feetX, feetY). Retorna a posição da cabeça na tela. */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  spriteId: string,
  animName: string,
  elapsedMs: number,
  feetX: number,
  feetY: number,
  opts: DrawOpts = {},
): { headX: number; headY: number; sprite: CharacterSprite } | null {
  const sprite = getCharacter(spriteId);
  const anim = sprite.animations[animName] ?? sprite.animations.idle;
  const img = getImage(sprite.image);
  if (!img) return null;
  const f = frameIndex(anim, elapsedMs);
  const scale = opts.scale ?? 1;
  const dx = feetX - sprite.feet.x * scale;
  const dy = feetY - sprite.feet.y * scale;
  blitFrame(ctx, img, f * sprite.frameW, anim.row * sprite.frameH, sprite.frameW, sprite.frameH, opts.flip ? feetX - (sprite.frameW - sprite.feet.x) * scale : dx, dy, opts);
  const head = anim.head[f] ?? anim.head[0];
  const rel = (head.x - sprite.feet.x) * scale;
  return { headX: feetX + (opts.flip ? -rel : rel), headY: dy + head.y * scale, sprite };
}

export interface HeroLook {
  gender: 'm' | 'f';
  heroClass: 'alchemist' | 'mage';
  hat?: string | null;
  aura?: string | null;
}

/** Herói completo: aura atrás, sprite, chapéu (cosmético ou de classe) na âncora da cabeça. */
export function drawHero(
  ctx: CanvasRenderingContext2D,
  look: HeroLook,
  animName: string,
  elapsedMs: number,
  feetX: number,
  feetY: number,
  opts: DrawOpts = {},
): void {
  const scale = opts.scale ?? 1;
  const aura = getCosmetic(look.aura);
  if (aura && aura.category === 'aura' && !opts.tint) {
    const img = getImage(aura.image);
    if (img) {
      const pulse = 0.75 + Math.sin(elapsedMs / 300) * 0.15;
      ctx.save();
      ctx.globalAlpha *= pulse * (opts.alpha ?? 1);
      ctx.drawImage(img, Math.round(feetX - (img.width * scale) / 2), Math.round(feetY - img.height * scale + 6 * scale), img.width * scale, img.height * scale);
      ctx.restore();
    }
  }
  const res = drawCharacter(ctx, heroSpriteId(look.gender, look.heroClass), animName, elapsedMs, feetX, feetY, opts);
  if (!res) return;
  const cos = getCosmetic(look.hat);
  const hat: HatCosmetic | null = cos && cos.category === 'hat' ? cos : look.heroClass === 'mage' ? MAGE_CLASS_HAT : null;
  if (!hat) return;
  const img = getImage(hat.image);
  if (!img) return;
  const k = (res.sprite.frameH / 48) * scale;
  const ax = (hat.anchorX ?? 0) * k * (opts.flip ? -1 : 1);
  const w = img.width * scale;
  const h = img.height * scale;
  blitFrame(ctx, img, 0, 0, img.width, img.height, res.headX + ax - w / 2, res.headY + hat.anchorY * k - h, { ...opts, scale });
}
