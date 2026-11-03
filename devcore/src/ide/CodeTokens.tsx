import type { PointerEvent, RefObject } from 'react';
import type { CodeEditorHandle, EditorCommand } from './CodeEditor';
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

/** Trechos prontos: o texto e onde o cursor fica depois de inserir. */
interface Snippet {
  label: string;
  text: string;
  caret: number;
}

function snippetsFor(language: Language): Snippet[] {
  if (language === 'python') {
    return [
      { label: 'return', text: 'return ', caret: 7 },
      { label: 'if', text: 'if :', caret: 3 },
      { label: 'else', text: 'else:', caret: 5 },
      { label: 'for', text: 'for n in :', caret: 9 },
    ];
  }
  return [
    { label: 'return', text: 'return ;', caret: 7 },
    { label: 'if', text: 'if () {', caret: 4 },
    { label: 'else', text: '} else {', caret: 8 },
    { label: 'for', text: 'for (const n of ) {', caret: 16 },
  ];
}

const MOVES: { cmd: EditorCommand; label: string; aria: string }[] = [
  { cmd: 'left', label: '◀', aria: 'Cursor para a esquerda' },
  { cmd: 'right', label: '▶', aria: 'Cursor para a direita' },
  { cmd: 'up', label: '▲', aria: 'Cursor para cima' },
  { cmd: 'down', label: '▼', aria: 'Cursor para baixo' },
  { cmd: 'newline', label: '↵', aria: 'Nova linha' },
  { cmd: 'tab', label: '⇥', aria: 'Indentar' },
];

/**
 * Teclas de código para o celular e para o estande: tocar insere o trecho no cursor
 * sem abrir o teclado do aparelho. Uma fileira para mover o cursor e inserir estruturas
 * (if, else, for, return), outra com os parâmetros, operadores e valores.
 */
export function CodeTokens({ editor, challenge, language }: { editor: RefObject<CodeEditorHandle | null>; challenge: Challenge; language: Language }) {
  const press = (t: string) => {
    if (t === '""') {
      editor.current?.insert('""', 1);
      return;
    }
    // operadores ganham espaços em volta para o código ficar legível
    editor.current?.insert(/^[+\-*/%<>=]+$/.test(t) ? ` ${t} ` : t);
  };
  // não roubar o foco do editor (e não abrir o teclado do celular)
  const keep = (e: PointerEvent) => e.preventDefault();
  return (
    <div className="code-tokens" role="toolbar" aria-label="Teclas de código">
      <div className="code-tokens-row">
        {MOVES.map((m) => (
          <button key={m.cmd} type="button" className="code-token move" aria-label={m.aria} onPointerDown={keep} onClick={() => editor.current?.command(m.cmd)}>
            {m.label}
          </button>
        ))}
        {snippetsFor(language).map((s) => (
          <button key={s.label} type="button" className="code-token kw" onPointerDown={keep} onClick={() => editor.current?.insert(s.text, s.caret)}>
            {s.label}
          </button>
        ))}
        <button type="button" className="code-token del" aria-label="Apagar" onPointerDown={keep} onClick={() => editor.current?.deleteBack()}>
          ⌫
        </button>
      </div>
      <div className="code-tokens-row">
        {tokensFor(challenge, language).map((t) => (
          <button key={t} type="button" className="code-token" onPointerDown={keep} onClick={() => press(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
