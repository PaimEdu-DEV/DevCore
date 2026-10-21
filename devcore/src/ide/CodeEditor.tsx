import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { EditorState, Compartment, StateEffect, StateField, type Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  Decoration,
  type DecorationSet,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap, completeFromList, type Completion } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { darkPlusHighlight, darkPlusTheme } from './theme';
import type { Language } from '../runner/types';

export interface CodeEditorHandle {
  setDoc(text: string): void;
  getDoc(): string;
  focus(): void;
  /** Insere texto no cursor sem focar o editor (não abre o teclado do celular). */
  insert(text: string): void;
  /** Apaga o caractere antes do cursor (ou a seleção). */
  deleteBack(): void;
}

interface Props {
  language: Language;
  initialDoc: string;
  fontSize: number;
  /** Linha (1-based) com erro a destacar, e a mensagem do diagnóstico. */
  error?: { line: number; message: string } | null;
  onChange?: (doc: string) => void;
  onRun?: () => void;
  onCursor?: (line: number, col: number) => void;
  ariaLabel?: string;
  /** Quebra linhas longas (telas estreitas). */
  wrap?: boolean;
  ref?: Ref<CodeEditorHandle>;
}

const PY_WORDS: Completion[] = [
  ...['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'in', 'not', 'and', 'or', 'try', 'except', 'finally', 'raise', 'import', 'pass', 'None', 'True', 'False', 'lambda', 'is'].map((label) => ({ label, type: 'keyword' })),
  ...['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'abs', 'max', 'min', 'sum', 'sorted', 'isinstance', 'enumerate', 'round', 'type'].map((label) => ({ label, type: 'function', apply: `${label}(` })),
  ...['ValueError', 'TypeError', 'ZeroDivisionError', 'IndexError', 'KeyError', 'Exception'].map((label) => ({ label, type: 'class' })),
];

const JS_WORDS: Completion[] = [
  ...['function', 'return', 'if', 'else', 'for', 'while', 'break', 'continue', 'const', 'let', 'of', 'in', 'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'null', 'undefined', 'true', 'false'].map((label) => ({ label, type: 'keyword' })),
  { label: 'console.log', type: 'function', apply: 'console.log(' },
  ...['Math.max', 'Math.min', 'Math.floor', 'Math.abs', 'Math.round', 'Number', 'String', 'Array.isArray', 'Number.isInteger', 'JSON.parse', 'JSON.stringify', 'parseInt'].map((label) => ({ label, type: 'function', apply: `${label}(` })),
  ...['.length', '.push(', '.map(', '.filter(', '.includes(', '.toLowerCase()', '.toUpperCase()', '.split(', '.join(', '.trim()'].map((label) => ({ label: label.replace(/^\./, '').replace(/\($/, '').replace(/\(\)$/, ''), type: 'method', apply: label.slice(1) })),
];

const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value === null || e.value < 1 || e.value > tr.state.doc.lines) return Decoration.none;
        const line = tr.state.doc.line(e.value);
        return Decoration.set([Decoration.line({ class: 'cm-error-line' }).range(line.from)]);
      }
    }
    return tr.docChanged ? Decoration.none : deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

function languageExt(lang: Language): Extension[] {
  return lang === 'python'
    ? [python(), indentUnit.of('    '), EditorState.tabSize.of(4), pythonLanguage.data.of({ autocomplete: completeFromList(PY_WORDS) })]
    : [javascript(), indentUnit.of('  '), EditorState.tabSize.of(2), javascriptLanguage.data.of({ autocomplete: completeFromList(JS_WORDS) })];
}

const fontTheme = (size: number) => EditorView.theme({ '&': { fontSize: `${size}px` }, '.cm-gutters': { fontSize: `${size}px` } });

/** Editor de código de verdade (CodeMirror 6): numeração, realce, autocompletar, busca e erros. */
export function CodeEditor({ language, initialDoc, fontSize, error, onChange, onRun, onCursor, ariaLabel, wrap, ref }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const fontComp = useRef(new Compartment());
  const cb = useRef({ onChange, onRun, onCursor });
  cb.current = { onChange, onRun, onCursor };

  useImperativeHandle(ref, () => ({
    setDoc(text: string) {
      const v = view.current;
      if (!v) return;
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text }, effects: setErrorLine.of(null) });
      v.dispatch(setDiagnostics(v.state, []));
    },
    getDoc: () => view.current?.state.doc.toString() ?? '',
    focus: () => view.current?.focus(),
    insert(text: string) {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      v.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, scrollIntoView: true });
    },
    deleteBack() {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      const start = from === to ? Math.max(0, from - 1) : from;
      if (start === to) return;
      v.dispatch({ changes: { from: start, to }, selection: { anchor: start }, scrollIntoView: true });
    },
  }));

  useEffect(() => {
    if (!host.current) return;
    const runKey = { key: 'Mod-Enter', preventDefault: true, run: () => (cb.current.onRun?.(), true) };
    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ activateOnTyping: true, icons: true }),
        highlightActiveLine(),
        highlightSelectionMatches(),
        lintGutter(),
        errorLineField,
        keymap.of([runKey, ...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
        ...languageExt(language),
        ...(wrap ? [EditorView.lineWrapping] : []),
        darkPlusTheme,
        darkPlusHighlight,
        fontComp.current.of(fontTheme(fontSize)),
        EditorView.contentAttributes.of({ 'aria-label': ariaLabel ?? `Editor de código ${language === 'python' ? 'Python' : 'JavaScript'}`, spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off' }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cb.current.onChange?.(u.state.doc.toString());
          if (u.selectionSet || u.docChanged) {
            const pos = u.state.selection.main.head;
            const line = u.state.doc.lineAt(pos);
            cb.current.onCursor?.(line.number, pos - line.from + 1);
          }
        }),
      ],
    });
    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // O editor é recriado só quando muda a linguagem; o texto é trocado via setDoc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    view.current?.dispatch({ effects: fontComp.current.reconfigure(fontTheme(fontSize)) });
  }, [fontSize]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    if (!error || error.line < 1 || error.line > v.state.doc.lines) {
      v.dispatch({ effects: setErrorLine.of(null) });
      v.dispatch(setDiagnostics(v.state, []));
      return;
    }
    const line = v.state.doc.line(error.line);
    v.dispatch({ effects: setErrorLine.of(error.line) });
    v.dispatch(setDiagnostics(v.state, [{ from: line.from, to: Math.max(line.from, line.to), severity: 'error', message: error.message }]));
  }, [error]);

  return <div ref={host} className="code-editor" />;
}
