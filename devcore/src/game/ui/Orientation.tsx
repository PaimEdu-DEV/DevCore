import { useEffect, useState } from 'react';
import './orientation.css';

// O jogo é horizontal. No celular, o primeiro toque entra em tela cheia e trava a tela
// deitada (Android/Chrome). Onde o navegador não deixa travar (iPhone/Safari), um aviso
// pede para girar o aparelho e some sozinho quando ele fica deitado.

const touchQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
const portraitQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(orientation: portrait)') : null;
const DISMISS_KEY = 'devcore.portraitOk';

type LockableOrientation = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> };

/** Tela cheia + travar na horizontal. Precisa ser chamada a partir de um toque do usuário. */
export async function enterLandscape(): Promise<void> {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
  } catch {
    /* navegador recusou a tela cheia: ainda tenta travar */
  }
  try {
    await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape');
  } catch {
    /* sem suporte (iPhone) ou fora da tela cheia: o aviso de girar cobre esse caso */
  }
}

function dismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Liga a tela cheia horizontal no primeiro toque e mostra o aviso de girar quando estiver em pé. */
export function OrientationGuard() {
  const [portrait, setPortrait] = useState(() => !!touchQuery?.matches && !!portraitQuery?.matches);
  const [skip, setSkip] = useState(dismissed);

  useEffect(() => {
    if (!touchQuery?.matches) return;
    const update = () => setPortrait(!!portraitQuery?.matches);
    portraitQuery?.addEventListener?.('change', update);
    // toque (pointerup) é o gesto que o navegador aceita para tela cheia
    const onTap = () => {
      if (!document.fullscreenElement) void enterLandscape();
    };
    window.addEventListener('pointerup', onTap);
    return () => {
      portraitQuery?.removeEventListener?.('change', update);
      window.removeEventListener('pointerup', onTap);
    };
  }, []);

  if (!portrait || skip) return null;
  return (
    <div className="rotate-guard" role="dialog" aria-label="Gire o celular">
      <div className="rotate-phone" aria-hidden="true" />
      <p className="rotate-title">Gire o celular</p>
      <p className="rotate-sub">O DevCore é jogado com a tela deitada.</p>
      <button className="btn primary" onClick={() => void enterLandscape()}>
        Girar e jogar
      </button>
      <button
        className="rotate-skip"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* ignora */
          }
          setSkip(true);
        }}
      >
        Jogar em pé mesmo
      </button>
    </div>
  );
}
