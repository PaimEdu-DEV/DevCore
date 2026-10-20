import { useEffect, useRef, useState } from 'react';
import { audio } from '../audio/AudioManager';
import { isCancel, typingInField, useKeys } from './hooks';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  hint?: string;
  icon?: string;
}

interface Props {
  items: MenuItem[];
  onCancel?: () => void;
  active?: boolean;
  /** Foca o primeiro item ao montar (para teclado). */
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Lista vertical navegável por setas/WASD, Enter e mouse/toque. */
export function PixelMenu({ items, onCancel, active = true, autoFocus = true, className, ariaLabel }: Props) {
  const firstEnabled = Math.max(0, items.findIndex((i) => !i.disabled));
  const [idx, setIdx] = useState(firstEnabled);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && active) refs.current[idx]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, autoFocus]);

  const move = (d: number) => {
    let n = idx;
    for (let k = 0; k < items.length; k++) {
      n = (n + d + items.length) % items.length;
      if (!items[n].disabled) break;
    }
    setIdx(n);
    refs.current[n]?.focus({ preventScroll: true });
    audio.play('select');
  };

  useKeys((e, type) => {
    if (type !== 'down' || typingInField(e)) return;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      move(-1);
    } else if (isCancel(e) && onCancel) {
      e.preventDefault();
      audio.play('cancel');
      onCancel();
    }
  }, active);

  return (
    <ul className={`menu-list ${className ?? ''}`} aria-label={ariaLabel}>
      {items.map((it, i) => (
        <li key={it.label}>
          <button
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="menu-item"
            aria-current={i === idx}
            disabled={it.disabled}
            onFocus={() => setIdx(i)}
            onMouseEnter={() => !it.disabled && setIdx(i)}
            onClick={() => {
              audio.unlock();
              audio.play('confirm');
              it.onSelect();
            }}
          >
            {it.icon ? <img src={it.icon} alt="" className="icon sm px" /> : null}
            <span>{it.label}</span>
            {it.hint ? <span className="hint">{it.hint}</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
