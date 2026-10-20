import { useEffect, useRef } from 'react';
import { getCharacter, loadImage } from '../assets/sprites';
import { drawCharacter, drawHero, type HeroLook } from '../engine/draw';
import { getCosmetic, MAGE_CLASS_HAT } from '../data/cosmetics';

interface Props {
  /** Sprite do manifest, ou um visual de herói completo. */
  sprite?: string;
  hero?: HeroLook;
  anim?: string;
  scale?: number;
  flip?: boolean;
  /** Margem extra (px de quadro) no topo para chapéus. */
  headroom?: number;
  className?: string;
  label?: string;
}

/** Canvas pequeno que toca uma animação em loop (prévia de personagem). */
export function SpritePreview({ sprite, hero, anim = 'idle', scale = 3, flip = false, headroom = 0, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const id = hero ? `hero_${hero.heroClass}_${hero.gender}` : sprite!;
  const ch = getCharacter(id);
  const w = ch.frameW;
  const h = ch.frameH + headroom;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const extra: string[] = [];
    if (hero) {
      const hat = getCosmetic(hero.hat);
      const aura = getCosmetic(hero.aura);
      if (hat && 'image' in hat) extra.push(hat.image);
      if (aura && 'image' in aura) extra.push(aura.image);
      if (hero.heroClass === 'mage') extra.push(MAGE_CLASS_HAT.image);
    }
    void Promise.allSettled([ch.image, ...extra].map(loadImage));
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      const fy = headroom + ch.feet.y;
      if (hero) drawHero(ctx, hero, anim, now - t0, ch.feet.x, fy, { flip });
      else drawCharacter(ctx, id, anim, now - t0, ch.feet.x, fy, { flip });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, anim, scale, flip, headroom, hero?.hat, hero?.aura]);

  return <canvas ref={ref} width={w * scale} height={h * scale} className={`px ${className ?? ''}`} role="img" aria-label={label ?? id} />;
}
