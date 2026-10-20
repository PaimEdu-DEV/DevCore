import { getImage } from '../assets/sprites';
import { drawPixelText } from './pixelFont';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  shape: 'square' | 'star';
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  t0: number;
  big: boolean;
}

interface Sprite {
  image: string;
  x: number;
  y: number;
  t0: number;
  frameMs: number;
  frames: number;
  size: number;
  loop: boolean;
  until: number;
}

interface Projectile {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  t0: number;
  dur: number;
  image: string;
  colors: string[];
  onHit?: () => void;
  hit: boolean;
}

/** Sistema de efeitos do canvas: partículas, textos flutuantes, sprites de efeito e projéteis. */
export class Effects {
  particles: Particle[] = [];
  texts: FloatText[] = [];
  sprites: Sprite[] = [];
  projectiles: Projectile[] = [];
  /** Multiplicador de quantidade (reduzido com prefers-reduced-motion). */
  density = 1;

  burst(x: number, y: number, colors: string[], count = 18, speed = 60, opts: { gravity?: number; life?: number; shape?: Particle['shape'] } = {}): void {
    const n = Math.max(3, Math.round(count * this.density));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      const life = (opts.life ?? 600) * (0.6 + Math.random() * 0.6);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - speed * 0.3,
        life,
        max: life,
        color: colors[i % colors.length],
        size: Math.random() < 0.3 ? 2 : 1,
        gravity: opts.gravity ?? 80,
        shape: opts.shape ?? 'square',
      });
    }
  }

  /** Partículas subindo devagar (aura de corrupção, brilho de vitória). */
  drift(x: number, y: number, w: number, colors: string[], count = 1): void {
    for (let i = 0; i < Math.round(count * this.density); i++) {
      const life = 900 + Math.random() * 700;
      this.particles.push({ x: x + (Math.random() - 0.5) * w, y, vx: (Math.random() - 0.5) * 6, vy: -12 - Math.random() * 14, life, max: life, color: colors[Math.floor(Math.random() * colors.length)], size: 1, gravity: 0, shape: 'square' });
    }
  }

  float(x: number, y: number, text: string, color: string, big = false): void {
    this.texts.push({ x, y, text, color, t0: performance.now(), big });
  }

  playSprite(image: string, x: number, y: number, opts: { frames?: number; frameMs?: number; size?: number; loopMs?: number } = {}): void {
    const now = performance.now();
    const frames = opts.frames ?? 4;
    const frameMs = opts.frameMs ?? 70;
    this.sprites.push({ image, x, y, t0: now, frameMs, frames, size: opts.size ?? 32, loop: !!opts.loopMs, until: now + (opts.loopMs ?? frames * frameMs) });
  }

  shoot(fx: number, fy: number, tx: number, ty: number, image: string, colors: string[], dur = 450): Promise<void> {
    return new Promise((resolve) => {
      this.projectiles.push({ fx, fy, tx, ty, t0: performance.now(), dur, image, colors, hit: false, onHit: resolve });
    });
  }

  update(dt: number, now: number): void {
    const s = dt / 1000;
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * s;
      p.x += p.vx * s;
      p.y += p.vy * s;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    this.texts = this.texts.filter((t) => now - t.t0 < 1200);
    this.sprites = this.sprites.filter((sp) => now < sp.until);
    for (const pr of this.projectiles) {
      const t = (now - pr.t0) / pr.dur;
      if (t >= 1 && !pr.hit) {
        pr.hit = true;
        pr.onHit?.();
      } else if (!pr.hit && Math.random() < 0.8) {
        const x = pr.fx + (pr.tx - pr.fx) * t;
        const y = pr.fy + (pr.ty - pr.fy) * t - Math.sin(t * Math.PI) * 18;
        this.particles.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, life: 300, max: 300, color: pr.colors[Math.floor(Math.random() * pr.colors.length)], size: 1, gravity: 0, shape: 'square' });
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.hit);
  }

  draw(ctx: CanvasRenderingContext2D, now: number): void {
    for (const sp of this.sprites) {
      const img = getImage(sp.image);
      if (!img) continue;
      const f = Math.floor((now - sp.t0) / sp.frameMs);
      const frame = sp.loop ? f % sp.frames : Math.min(sp.frames - 1, f);
      ctx.drawImage(img, frame * sp.size, 0, sp.size, sp.size, Math.round(sp.x - sp.size / 2), Math.round(sp.y - sp.size / 2), sp.size, sp.size);
    }
    for (const pr of this.projectiles) {
      const t = Math.min(1, (now - pr.t0) / pr.dur);
      const x = pr.fx + (pr.tx - pr.fx) * t;
      const y = pr.fy + (pr.ty - pr.fy) * t - Math.sin(t * Math.PI) * 18;
      const img = getImage(pr.image);
      if (img) {
        const frame = Math.floor(now / 70) % 4;
        ctx.drawImage(img, frame * 32, 0, 32, 32, Math.round(x - 16), Math.round(y - 16), 32, 32);
      }
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max + 0.2));
      ctx.fillStyle = p.color;
      if (p.shape === 'star' && p.size > 1) {
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1);
        ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3);
      } else ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      const k = (now - t.t0) / 1200;
      const y = t.y - 20 * Math.min(1, k * 2) + (k > 0.8 ? (k - 0.8) * 10 : 0);
      ctx.globalAlpha = k > 0.75 ? 1 - (k - 0.75) * 4 : 1;
      drawPixelText(ctx, t.text, t.x, y, t.color, { scale: t.big ? 2 : 1, outline: '#0A0A0F', align: 'center' });
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.particles = [];
    this.texts = [];
    this.sprites = [];
    this.projectiles = [];
  }
}
