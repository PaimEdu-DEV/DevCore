import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../assets/sprites';
import { audio } from '../audio/AudioManager';
import { TEXT_CPS, useGame } from '../state/store';
import { isConfirm, typingInField, useKeys } from './hooks';
import './dialog.css';

export interface DialogChoice {
  label: string;
}

interface Props {
  speaker?: string | null;
  /** Caminho do retrato (assets/portraits/x.png). */
  portrait?: string | null;
  /** Retrato composto (ex.: herói com chapéu) no lugar da imagem. */
  portraitNode?: React.ReactNode;
  text: string;
  /** Chamado quando o texto terminou e o jogador avançou. */
  onDone?: () => void;
  choices?: DialogChoice[];
  onChoose?: (index: number) => void;
  /** 'stage' = dentro do palco 320x180 (escala por --px); 'panel' = caixa responsiva normal. */
  variant?: 'stage' | 'panel';
  active?: boolean;
}

/** Caixa de diálogo estilo Pokémon antigo: máquina de escrever, ▼ piscando, aba com o nome. */
export function DialogBox({ speaker, portrait, portraitNode, text, onDone, choices, onChoose, variant = 'stage', active = true }: Props) {
  const speed = useGame((s) => s.options.textSpeed);
  const cps = TEXT_CPS[speed];
  const [shown, setShown] = useState(cps === Infinity ? text.length : 0);
  const [choiceIdx, setChoiceIdx] = useState(0);
  const fast = useRef(false);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const done = shown >= text.length;

  useEffect(() => {
    setShown(cps === Infinity ? text.length : 0);
    setChoiceIdx(0);
  }, [text, cps]);

  useEffect(() => {
    if (done) return;
    let raf = 0;
    let last = performance.now();
    let acc = shownRef.current;
    let blipCount = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      acc += dt * cps * (fast.current ? 6 : 1);
      const n = Math.min(text.length, Math.floor(acc));
      if (n !== shownRef.current) {
        if (n - blipCount >= 2 && text[n - 1] !== ' ') {
          audio.play('blip');
          blipCount = n;
        }
        setShown(n);
      }
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, cps, done]);

  const advance = () => {
    if (!done) {
      setShown(text.length);
      return;
    }
    if (choices?.length) {
      audio.play('confirm');
      onChoose?.(choiceIdx);
      return;
    }
    audio.play('select');
    onDone?.();
  };

  useKeys((e, type) => {
    if (typingInField(e)) return;
    if (type === 'up') {
      if (isConfirm(e)) fast.current = false;
      return;
    }
    if (choices?.length && done) {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setChoiceIdx((i) => (i + 1) % choices.length);
        audio.play('select');
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setChoiceIdx((i) => (i - 1 + choices.length) % choices.length);
        audio.play('select');
        e.preventDefault();
        return;
      }
    }
    if (!isConfirm(e)) return;
    e.preventDefault();
    if (e.repeat) {
      fast.current = true;
      return;
    }
    if (!done) {
      fast.current = true;
      return;
    }
    advance();
  }, active);

  return (
    <div className={`dialog dialog-${variant}`} role="dialog" aria-live="polite" aria-label={speaker ? `Fala de ${speaker}` : 'Narração'}>
      {speaker ? <div className="dialog-name">{speaker}</div> : null}
      <div
        className="dialog-box frame-dialog"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('.dialog-choices')) return;
          e.preventDefault();
          advance();
        }}
      >
        {portraitNode ?? (portrait ? <img className="dialog-portrait px" src={assetUrl(portrait)} alt="" /> : null)}
        <p className="dialog-text">
          <span>{text.slice(0, shown)}</span>
          <span className="dialog-ghost" aria-hidden="true">{text.slice(shown)}</span>
        </p>
        {done && !choices?.length ? <img className="dialog-arrow px" src={assetUrl('assets/ui/arrow_down.png')} alt="" /> : null}
        <span className="sr-only">{text}</span>
      </div>
      {done && choices?.length ? (
        <ul className="dialog-choices frame-dialog menu-list" role="listbox">
          {choices.map((c, i) => (
            <li key={c.label}>
              <button
                className="menu-item"
                role="option"
                aria-selected={i === choiceIdx}
                aria-current={i === choiceIdx}
                onMouseEnter={() => setChoiceIdx(i)}
                onClick={() => {
                  audio.play('confirm');
                  onChoose?.(i);
                }}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
