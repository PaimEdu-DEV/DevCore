import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { run, pythonRuntime, warmupPython, type RunResult } from '../runner';
import { formatValue } from '../runner/compare';
import type { Language } from '../runner/types';
import type { Challenge } from '../game/data/challenges/types';
import { useGame } from '../game/state/store';
import { assetUrl } from '../game/assets/sprites';
import './ide.css';

interface Props {
  challenge: Challenge;
  language: Language;
  onResult: (result: RunResult, code: string) => void;
  onHint?: () => void;
  hintLabel?: string;
  hintDisabled?: boolean;
  /** Bloqueia executar (ex.: durante animações da batalha). */
  locked?: boolean;
  /** Guarda o rascunho do código por desafio. */
  persistDraft?: boolean;
  /** Elemento extra na barra (ex.: cronômetro). */
  toolbarExtra?: React.ReactNode;
}

const draftKey = (id: string, lang: Language) => `devcore.draft.${id}.${lang}`;

function readDraft(id: string, lang: Language): string | null {
  try {
    return localStorage.getItem(draftKey(id, lang));
  } catch {
    return null;
  }
}

function PythonLoading() {
  const status = useSyncExternalStore(pythonRuntime.subscribe, pythonRuntime.status);
  const stage = useSyncExternalStore(pythonRuntime.subscribe, pythonRuntime.stage);
  const error = useSyncExternalStore(pythonRuntime.subscribe, pythonRuntime.error);
  if (status === 'ready' || status === 'idle') return null;
  return (
    <div className="ide-loading" role="status" aria-live="polite">
      <img src={assetUrl('assets/icons/flask.png')} alt="" className="px ide-loading-flask" />
      {status === 'error' ? (
        <>
          <strong>O caldeirão do Alquimista apagou.</strong>
          <span>{error}</span>
          <button className="btn small" onClick={() => warmupPython()}>Tentar de novo</button>
        </>
      ) : (
        <>
          <strong>O Alquimista está acendendo o caldeirão do Python...</strong>
          <span>{stage === 'boot' ? 'Misturando os ingredientes (iniciando o interpretador)' : 'Buscando os ingredientes (baixando o Python, só na primeira vez)'}</span>
          <div className="ide-loading-bar" aria-hidden="true"><div className={stage === 'boot' ? 'boot' : ''} /></div>
        </>
      )}
    </div>
  );
}

/** IDE: aba do arquivo, botões, editor, painel inferior (Terminal/Testes) e barra de status. */
export function IdePanel({ challenge, language, onResult, onHint, hintLabel, hintDisabled, locked, persistDraft = true, toolbarExtra }: Props) {
  const fontSize = useGame((s) => s.options.editorFontSize);
  const editor = useRef<CodeEditorHandle>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<'terminal' | 'tests'>('tests');
  const [running, setRunning] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [dirty, setDirty] = useState(false);
  const pyStatus = useSyncExternalStore(pythonRuntime.subscribe, pythonRuntime.status);
  const initial = (persistDraft && readDraft(challenge.id, language)) || challenge.starter[language];
  const fileName = language === 'python' ? 'main.py' : 'main.js';

  useEffect(() => {
    if (language === 'python') warmupPython();
  }, [language]);

  useEffect(() => {
    editor.current?.setDoc((persistDraft && readDraft(challenge.id, language)) || challenge.starter[language]);
    setResult(null);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id, language]);

  const execute = async () => {
    if (running || locked) return;
    const code = editor.current?.getDoc() ?? '';
    setRunning(true);
    const r = await run({ language, code, challenge });
    setRunning(false);
    setResult(r);
    setTab(r.error && !r.tests.some((t) => t.ok) ? 'terminal' : 'tests');
    onResult(r, code);
  };

  const reset = () => {
    editor.current?.setDoc(challenge.starter[language]);
    setResult(null);
    setDirty(false);
    try {
      localStorage.removeItem(draftKey(challenge.id, language));
    } catch {
      /* ignora */
    }
  };

  const passedCount = result?.tests.filter((t) => t.ok).length ?? 0;
  const loadingPy = language === 'python' && pyStatus !== 'ready';

  return (
    <section className="ide" aria-label="Editor de código">
      <div className="ide-toolbar">
        <div className="ide-tabs" role="tablist" aria-label="Arquivos">
          <span className="ide-file-tab" role="tab" aria-selected="true">
            <span className={`ide-lang-dot ${language}`} aria-hidden="true" />
            {fileName}
            {dirty ? <span className="ide-dirty" title="modificado">●</span> : null}
          </span>
        </div>
        <div className="ide-actions">
          {toolbarExtra}
          {onHint ? (
            <button className="ide-btn" onClick={onHint} disabled={hintDisabled} title="Pedir uma dica ao Orwin">
              💡 {hintLabel ?? 'Dica'}
            </button>
          ) : null}
          <button className="ide-btn" onClick={reset} title="Voltar ao código inicial (Ctrl+Z desfaz)">
            ↺ Resetar
          </button>
          <button className="ide-btn ide-run" onClick={() => void execute()} disabled={running || locked} title="Executar (Ctrl+Enter)">
            {running ? '⏳ Executando...' : '▶ Executar'}
            <kbd>Ctrl+Enter</kbd>
          </button>
        </div>
      </div>

      <div className="ide-editor-wrap">
        <CodeEditor
          ref={editor}
          language={language}
          initialDoc={initial}
          fontSize={fontSize}
          error={result?.error?.line ? { line: result.error.line, message: `${result.error.type}: ${result.error.message}` } : null}
          onRun={() => void execute()}
          onCursor={(line, col) => setCursor({ line, col })}
          onChange={(doc) => {
            setDirty(doc !== challenge.starter[language]);
            if (persistDraft) {
              try {
                localStorage.setItem(draftKey(challenge.id, language), doc);
              } catch {
                /* ignora */
              }
            }
          }}
        />
        {loadingPy ? <PythonLoading /> : null}
      </div>

      <div className="ide-bottom">
        <div className="ide-bottom-tabs" role="tablist" aria-label="Saída">
          <button role="tab" aria-selected={tab === 'terminal'} onClick={() => setTab('terminal')}>
            Terminal {result && (result.stderr || result.error) ? <span className="ide-badge err">!</span> : null}
          </button>
          <button role="tab" aria-selected={tab === 'tests'} onClick={() => setTab('tests')}>
            Testes {result ? <span className={`ide-badge ${result.passed ? 'ok' : 'err'}`}>{passedCount}/{result.tests.length}</span> : null}
          </button>
        </div>
        <div className="ide-bottom-body" role="tabpanel">
          {tab === 'terminal' ? <Terminal result={result} fileName={fileName} running={running} /> : <Tests result={result} language={language} running={running} />}
        </div>
      </div>

      <footer className="ide-status">
        <span>Ln {cursor.line}, Col {cursor.col}</span>
        <span>{language === 'python' ? 'Espaços: 4' : 'Espaços: 2'}</span>
        <span>UTF-8</span>
        <span>{language === 'python' ? 'Python' : 'JavaScript'}</span>
        {result ? <span>{Math.round(result.timeMs)} ms</span> : null}
        {language === 'python' ? <span className={`ide-py ${pyStatus}`}>{pyStatus === 'ready' ? '● Python pronto' : pyStatus === 'error' ? '● Python indisponível' : '● carregando Python'}</span> : null}
      </footer>
    </section>
  );
}

function Terminal({ result, fileName, running }: { result: RunResult | null; fileName: string; running: boolean }) {
  if (running) return <pre className="ide-term muted">Executando {fileName}...</pre>;
  if (!result) return <pre className="ide-term muted">A saída do seu código (print / console.log) aparece aqui.</pre>;
  return (
    <pre className="ide-term">
      <span className="muted">$ executar {fileName}</span>
      {'\n'}
      {result.stdout}
      {result.stderr ? <span className="ide-stderr">{result.stderr}</span> : null}
      {result.error && !result.stderr ? (
        <span className="ide-stderr">
          {result.error.type}: {result.error.message}
          {result.error.line ? ` (linha ${result.error.line})` : ''}
          {'\n'}
        </span>
      ) : null}
      <span className="muted">
        {result.passed ? '✓ processo concluído' : '✗ processo concluído com falhas'} em {Math.round(result.timeMs)} ms
      </span>
    </pre>
  );
}

function Tests({ result, language, running }: { result: RunResult | null; language: Language; running: boolean }) {
  if (running) return <p className="ide-tests-empty muted">Rodando os testes...</p>;
  if (!result) return <p className="ide-tests-empty muted">Clique em ▶ Executar (ou Ctrl+Enter) para rodar os testes.</p>;
  return (
    <ul className="ide-tests">
      {result.tests.map((t, i) => (
        <li key={i} className={t.ok ? 'ok' : 'fail'}>
          <span className="ide-test-icon" aria-hidden="true">{t.ok ? '✓' : '✗'}</span>
          <span className="sr-only">{t.ok ? 'passou' : 'falhou'}</span>
          <span className="ide-test-name">{t.name}</span>
          {!t.hidden && !t.ok ? (
            <span className="ide-test-diff">
              {t.error ? (
                <>
                  <span className="lbl">erro</span> <code>{t.error}</code>
                </>
              ) : (
                <>
                  <span className="lbl">esperado</span> <code>{formatValue(t.expected, language)}</code>
                  <span className="lbl">recebido</span> <code>{formatValue(t.received, language)}</code>
                </>
              )}
            </span>
          ) : null}
          {t.hidden && !t.ok ? <span className="ide-test-diff muted">valores escondidos: pense nos casos extremos</span> : null}
        </li>
      ))}
    </ul>
  );
}
