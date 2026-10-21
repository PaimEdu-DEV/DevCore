import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { CodeTokens } from './CodeTokens';
import { PythonLoading } from './IdePanel';
import { RichText } from './RichText';
import { run, pythonRuntime, warmupPython, type RunResult } from '../runner';
import { formatValue } from '../runner/compare';
import { mentorFeedback } from '../runner/errorTranslator';
import type { Language } from '../runner/types';
import { localize, type Challenge } from '../game/data/challenges/types';
import { useGame } from '../game/state/store';
import './ide.css';

interface Props {
  challenge: Challenge;
  language: Language;
  /** Chamado quando todos os testes passam. */
  onWin: () => void;
  /** Chamado a cada tentativa errada (para a animação do bug). */
  onMiss?: (r: RunResult) => void;
  /** Trava o botão (ex.: durante a animação de vitória). */
  locked?: boolean;
}

/** Luta rápida contra um capanga: enunciado curto, editor pequeno, teclas de código e um botão. */
export function QuickFight({ challenge, language, onWin, onMiss, locked }: Props) {
  const fontSize = useGame((s) => s.options.editorFontSize);
  const editor = useRef<CodeEditorHandle>(null);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hints, setHints] = useState(0);
  const pyStatus = useSyncExternalStore(pythonRuntime.subscribe, pythonRuntime.status);

  useEffect(() => {
    if (language === 'python') warmupPython();
  }, [language]);

  useEffect(() => {
    editor.current?.setDoc(challenge.starter[language]);
    setFeedback(null);
    setHints(0);
  }, [challenge, language]);

  const attack = async () => {
    if (running || locked) return;
    setRunning(true);
    const r = await run({ language, code: editor.current?.getDoc() ?? '', challenge });
    setRunning(false);
    if (r.passed) {
      setFeedback({ ok: true, text: 'Acertou! O bug foi corrigido.' });
      onWin();
      return;
    }
    const firstFail = r.tests.find((t) => !t.ok && !t.hidden && !t.error);
    const text = firstFail && !r.error
      ? `Quase! Em ${firstFail.name} o esperado era ${formatValue(firstFail.expected, language)}, mas veio ${formatValue(firstFail.received, language)}.`
      : mentorFeedback(r, language);
    setFeedback({ ok: false, text });
    onMiss?.(r);
  };

  const loadingPy = language === 'python' && pyStatus !== 'ready';

  return (
    <section className="qf" aria-label={`Luta contra ${challenge.title}`}>
      <header className="qf-head">
        <span className="qf-badge">BUG</span>
        <h2 className="qf-title">{challenge.title}</h2>
      </header>
      <RichText className="qf-statement" text={localize(challenge.statement, challenge, language)} />
      <CodeTokens editor={editor} challenge={challenge} language={language} />
      <div className="qf-editor">
        <CodeEditor ref={editor} language={language} initialDoc={challenge.starter[language]} fontSize={Math.max(16, fontSize)} onRun={() => void attack()} wrap />
        {loadingPy ? <PythonLoading /> : null}
      </div>
      {feedback ? (
        <p className={`qf-feedback ${feedback.ok ? 'ok' : 'fail'}`} role="status">
          {feedback.text}
        </p>
      ) : null}
      {hints > 0 ? (
        <p className="qf-hint">
          💡 {localize(challenge.hints[hints - 1], challenge, language)}
        </p>
      ) : null}
      <div className="qf-actions">
        <button className="ide-btn" onClick={() => setHints((h) => Math.min(3, h + 1))} disabled={hints >= 3}>
          💡 Dica {hints < 3 ? `${hints + 1}/3` : ''}
        </button>
        <button className="ide-btn ide-run qf-run" onClick={() => void attack()} disabled={running || locked || loadingPy}>
          {running ? '⏳ ...' : '⚔ Atacar!'}
        </button>
      </div>
    </section>
  );
}
