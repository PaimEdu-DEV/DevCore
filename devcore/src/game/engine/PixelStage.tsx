import { useEffect, useRef, useState, type ReactNode } from 'react';

export const VW = 320;
export const VH = 180;

/** Tamanho atual da resolução virtual (muda com a tela quando o palco usa `fill`). */
export interface View {
  w: number;
  h: number;
}

export type RenderFn = (ctx: CanvasRenderingContext2D, now: number, dt: number, view: View) => void;

interface Props {
  /** Chamado a cada quadro com o contexto na resolução virtual (320x180 por padrão). */
  render: RenderFn;
  /** Elementos DOM sobrepostos, posicionados em px virtuais via var(--px). */
  children?: ReactNode;
  className?: string;
  /** Escala mínima permitida (fracionária só quando não cabe nem 1x). */
  maxScale?: number;
  onPointerDown?: (vx: number, vy: number) => void;
  /** Resolução virtual (padrão 320x180). Telas de exploração usam uma câmera mais aberta. */
  width?: number;
  height?: number;
  /** Permite escala fracionária para ocupar a tela inteira (câmeras mais abertas). */
  fractional?: boolean;
  /**
   * Câmera que se adapta à tela: a altura virtual é fixa (`height`) e a largura varia
   * entre `minWidth` e `maxWidth` para encher o espaço. No celular em pé a câmera fica
   * estreita e os personagens grandes; deitado ou no PC, ela abre para os lados.
   */
  fill?: { minWidth: number; maxWidth: number };
}

/**
 * Palco de pixel art: canvas em resolução virtual escalado com image-rendering: pixelated,
 * e uma camada DOM do mesmo tamanho por cima.
 */
export function PixelStage({ render, children, className, maxScale, onPointerDown, width = VW, height = VH, fractional, fill }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef(render);
  renderRef.current = render;
  // Começa pequeno: um palco grande demais pode alargar o contêiner antes da primeira medição.
  const [scale, setScale] = useState(1);
  const [viewW, setViewW] = useState(width);
  const viewRef = useRef<View>({ w: width, h: height });
  viewRef.current = { w: fill ? viewW : width, h: height };
  const minW = fill?.minWidth;
  const maxW = fill?.maxWidth;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (minW !== undefined && maxW !== undefined) {
        let s = h / height;
        let vw = w / s;
        if (vw < minW) {
          vw = minW;
          s = w / minW;
        } else if (vw > maxW) {
          vw = maxW;
          s = Math.min(h / height, w / maxW);
        }
        setViewW(Math.round(vw));
        setScale(Math.max(0.5, s));
        return;
      }
      const fit = Math.min(w / width, h / height);
      let s = fractional ? fit : Math.floor(fit);
      if (s < 1) s = fit;
      if (maxScale) s = Math.min(s, maxScale);
      setScale(Math.max(0.5, s));
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [maxScale, width, height, fractional, minW, maxW]);

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
      renderRef.current(ctx, now, dt, viewRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const vw = viewRef.current.w;
  return (
    <div ref={wrapRef} className={`pixel-stage-wrap ${className ?? ''}`}>
      <div
        className="pixel-stage"
        style={{ width: Math.floor(vw * scale), height: Math.floor(height * scale), ['--px' as string]: `${scale}px` }}
        onPointerDown={(e) => {
          if (!onPointerDown) return;
          const rect = e.currentTarget.getBoundingClientRect();
          onPointerDown(((e.clientX - rect.left) / rect.width) * vw, ((e.clientY - rect.top) / rect.height) * height);
        }}
      >
        <canvas ref={canvasRef} width={vw} height={height} className="pixel-canvas" />
        <div className="pixel-overlay">{children}</div>
      </div>
    </div>
  );
}
