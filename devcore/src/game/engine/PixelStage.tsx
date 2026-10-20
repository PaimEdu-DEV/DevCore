import { useEffect, useRef, useState, type ReactNode } from 'react';

export const VW = 320;
export const VH = 180;

export type RenderFn = (ctx: CanvasRenderingContext2D, now: number, dt: number) => void;

interface Props {
  /** Chamado a cada quadro com o contexto na resolução virtual 320x180. */
  render: RenderFn;
  /** Elementos DOM sobrepostos, posicionados em px virtuais via var(--px). */
  children?: ReactNode;
  className?: string;
  /** Escala mínima permitida (fracionária só quando não cabe nem 1x). */
  maxScale?: number;
  onPointerDown?: (vx: number, vy: number) => void;
}

/**
 * Palco de pixel art: canvas 320x180 escalado em múltiplos inteiros, com
 * image-rendering: pixelated, e uma camada DOM do mesmo tamanho por cima.
 */
export function PixelStage({ render, children, className, maxScale, onPointerDown }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef(render);
  renderRef.current = render;
  // Começa pequeno: um palco grande demais pode alargar o contêiner antes da primeira medição.
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      let s = Math.floor(Math.min(w / VW, h / VH));
      if (s < 1) s = Math.min(w / VW, h / VH);
      if (maxScale) s = Math.min(s, maxScale);
      setScale(Math.max(0.5, s));
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [maxScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      renderRef.current(ctx, now, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className={`pixel-stage-wrap ${className ?? ''}`}>
      <div
        className="pixel-stage"
        style={{ width: VW * scale, height: VH * scale, ['--px' as string]: `${scale}px` }}
        onPointerDown={(e) => {
          if (!onPointerDown) return;
          const rect = e.currentTarget.getBoundingClientRect();
          onPointerDown(((e.clientX - rect.left) / rect.width) * VW, ((e.clientY - rect.top) / rect.height) * VH);
        }}
      >
        <canvas ref={canvasRef} width={VW} height={VH} className="pixel-canvas" />
        <div className="pixel-overlay">{children}</div>
      </div>
    </div>
  );
}
