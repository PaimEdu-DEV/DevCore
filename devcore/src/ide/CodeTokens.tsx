import type { RefObject } from 'react';
import type { CodeEditorHandle } from './CodeEditor';
import type { Language } from '../runner/types';
import type { Challenge } from '../game/data/challenges/types';

/** Parâmetros da função do código inicial, ex.: "def soma(a, b):" → ["a", "b"]. */
function params(challenge: Challenge, language: Language): string[] {
  const m = challenge.starter[language].match(/\(([^)]*)\)/);
  return m ? m[1].split(',').map((p) => p.trim()).filter(Boolean) : [];
}

export function tokensFor(challenge: Challenge, language: Language): string[] {
  const py = language === 'python';
  return [...params(challenge, language), '+', '-', '*', '/', '%', py ? '==' : '===', '>', '<', '""', '0', '1', '2', py ? 'True' : 'true', py ? 'False' : 'false', '(', ')'];
}

/**
 * Teclas de código para o celular e para o estande: tocar insere o trecho no cursor
 * sem abrir o teclado do aparelho.
 */
export function CodeTokens({ editor, challenge, language }: { editor: RefObject<CodeEditorHandle | null>; challenge: Challenge; language: Language }) {
  const press = (t: string) => {
    if (t === '""') {
      editor.current?.insert('""');
      return;
    }
    // operadores ganham espaços em volta para o código ficar legível
    editor.current?.insert(/^[+\-*/%<>=]+$/.test(t) ? ` ${t} ` : t);
  };
  return (
    <div className="code-tokens" role="toolbar" aria-label="Teclas de código">
      {tokensFor(challenge, language).map((t) => (
        <button key={t} type="button" className="code-token" onPointerDown={(e) => e.preventDefault()} onClick={() => press(t)}>
          {t}
        </button>
      ))}
      <button type="button" className="code-token del" aria-label="Apagar" onPointerDown={(e) => e.preventDefault()} onClick={() => editor.current?.deleteBack()}>
        ⌫
      </button>
    </div>
  );
}
