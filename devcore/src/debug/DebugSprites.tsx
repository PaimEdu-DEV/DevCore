import { useEffect, useMemo, useState } from 'react';
import { preloadImages, spriteManifest, assetUrl, type CharacterSprite } from '../game/assets/sprites';
import { drawCharacter, drawHero } from '../game/engine/draw';
import { COSMETICS } from '../game/data/cosmetics';

const SCALE = 2;

function AnimCanvas({ sprite, anim, flip, anchors, bg, hat, aura }: { sprite: CharacterSprite; anim: string; flip: boolean; anchors: boolean; bg: boolean; hat: string; aura: string }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bg) {
        ctx.fillStyle = '#5a6070';
        ctx.fillRect(0, 0, sprite.frameW, sprite.frameH);
      }
      const fx = sprite.feet.x;
      const fy = sprite.feet.y;
      const el = now - t0;
      if (sprite.kind === 'hero') {
        const [, heroClass, gender] = sprite.id.split('_') as [string, 'alchemist' | 'mage', 'm' | 'f'];
        drawHero(ctx, { gender, heroClass, hat: hat || null, aura: aura || null }, anim, el, fx, fy, { flip });
      } else {
        drawCharacter(ctx, sprite.id, anim, el, fx, fy, { flip });
      }
      if (anchors) {
        const a = sprite.animations[anim];
        const f = Math.floor((el / 1000) * a.fps);
        const idx = a.loop ? f % a.frames : Math.min(a.frames - 1, f);
        const head = a.head[idx];
        ctx.fillStyle = '#ff3b3b';
        ctx.fillRect(fx - 2, fy, 5, 1);
        ctx.fillStyle = '#3bd1ff';
        const hx = flip ? 2 * fx - head.x : head.x;
        ctx.fillRect(hx - 1, head.y - 1, 3, 3);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [canvas, sprite, anim, flip, anchors, bg, hat, aura]);
  return <canvas ref={setCanvas} width={sprite.frameW * SCALE} height={sprite.frameH * SCALE} className="px" data-anim={anim} />;
}

export function DebugSprites() {
  const [ready, setReady] = useState(false);
  const [flip, setFlip] = useState(false);
  const [anchors, setAnchors] = useState(false);
  const [bg, setBg] = useState(true);
  const [hat, setHat] = useState('');
  const [aura, setAura] = useState('');
  const chars = useMemo(() => Object.values(spriteManifest.characters), []);

  useEffect(() => {
    void preloadImages([
      ...chars.map((c) => c.image),
      ...COSMETICS.flatMap((c) => ('image' in c ? [c.image] : [])),
      'assets/cosmetics/hat_mage.png',
    ]).then(() => setReady(true));
    document.body.style.overflow = 'auto';
  }, [chars]);

  return (
    <div style={{ padding: 16, fontFamily: 'var(--font-text)', fontSize: 14, color: 'var(--cream)' }}>
      <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 16 }}>Debug · Sprites</h1>
      <div className="row" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        <label><input type="checkbox" checked={flip} onChange={(e) => setFlip(e.target.checked)} /> Espelhar</label>
        <label><input type="checkbox" checked={anchors} onChange={(e) => setAnchors(e.target.checked)} /> Âncoras (pés/cabeça)</label>
        <label><input type="checkbox" checked={bg} onChange={(e) => setBg(e.target.checked)} /> Fundo</label>
        <label>
          Chapéu:{' '}
          <select value={hat} onChange={(e) => setHat(e.target.value)}>
            <option value="">(nenhum)</option>
            {COSMETICS.filter((c) => c.category === 'hat').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          Aura:{' '}
          <select value={aura} onChange={(e) => setAura(e.target.value)}>
            <option value="">(nenhuma)</option>
            {COSMETICS.filter((c) => c.category === 'aura').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <span>{ready ? 'Imagens carregadas' : 'Carregando...'}</span>
      </div>
      {chars.map((c) => (
        <section key={c.id} style={{ marginBottom: 18 }} data-character={c.id}>
          <h2 style={{ fontSize: 15, margin: '4px 0' }}>
            {c.id} <small className="muted">({c.kind}, {c.frameW}px{c.placeholder ? ` · placeholder: ${c.placeholder}` : ''})</small>
          </h2>
          <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
            <figure style={{ margin: 0, textAlign: 'center' }}>
              <img src={assetUrl(c.portrait)} width={96} height={96} className="px" alt={`retrato ${c.id}`} style={{ background: '#5a6070' }} />
              <figcaption>retrato</figcaption>
            </figure>
            {ready && Object.keys(c.animations).map((a) => (
              <figure key={a} style={{ margin: 0, textAlign: 'center' }}>
                <AnimCanvas sprite={c} anim={a} flip={flip} anchors={anchors} bg={bg} hat={hat} aura={aura} />
                <figcaption>{a}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
