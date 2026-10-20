import { useEffect, useMemo, useRef, useState } from 'react';
import { IdePanel } from '../../ide/IdePanel';
import { ChallengeBrief } from '../../ide/ChallengeBrief';
import { DialogBox } from '../ui/DialogBox';
import { EXTRAS } from '../data/challenges';
import { mentorFeedback } from '../../runner/errorTranslator';
import { game, useGame, equippedTitle } from '../state/store';
import { languageOf } from '../state/save';
import { grant, recordRun, awardTitle } from '../state/rewards';
import { EARNED_TITLES } from '../state/progression';
import { audio } from '../audio/AudioManager';
import { getBackend, syncProfile } from '../../services/backend';
import { pythonRuntime, warmupPython } from '../../runner';
import type { RunResult } from '../../runner';
import './lesson.css';

export const LIGHTNING_SECONDS = 150;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Desafio Relâmpago do Torvan: resolva o máximo de desafios contra o relógio. */
export function LightningScreen() {
  const save = useGame((s) => s.save);
  const language = save ? languageOf(save.player.heroClass) : 'python';
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const order = useMemo(() => shuffle(EXTRAS), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [fails, setFails] = useState(0);
  const [left, setLeft] = useState(LIGHTNING_SECONDS);
  const [line, setLine] = useState('Três... dois... um... CODIFIQUE!');
  const endAt = useRef(0);
  const [record, setRecord] = useState(false);

  useEffect(() => {
    if (language === 'python') warmupPython();
  }, [language]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0) finish();
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const scoreRef = useRefValue(score);
  const phaseRef = useRefValue(phase);

  if (!save) return null;
  const challenge = order[idx % order.length];

  const start = () => {
    audio.play('confirm');
    endAt.current = Date.now() + LIGHTNING_SECONDS * 1000;
    setLeft(LIGHTNING_SECONDS);
    setPhase('play');
  };

  const finish = () => {
    if (phaseRef.current !== 'play') return;
    phaseRef.current = 'done';
    const finalScore = scoreRef.current;
    setRecord(finalScore > (game.get().save?.stats.lightningBest ?? 0));
    grant(Math.round(finalScore / 5), Math.floor(finalScore / 15), 'Relâmpago', (d) => {
      d.stats.lightningBest = Math.max(d.stats.lightningBest, finalScore);
    });
    if (finalScore >= 300) awardTitle('lightning', EARNED_TITLES.lightning);
    void (async () => {
      await syncProfile(game.get().save, equippedTitle(game.get().save));
      const b = await getBackend();
      await b.submitScore('lightning', finalScore);
    })();
    audio.play(finalScore > 0 ? 'victory' : 'cancel');
    setPhase('done');
  };

  const onResult = (r: RunResult) => {
    recordRun(r.tests.filter((t) => t.ok).length, !!r.error);
    if (r.passed) {
      const gained = 100 + (fails === 0 ? 30 : 0);
      setScore((x) => x + gained);
      setSolvedCount((x) => x + 1);
      setFails(0);
      setLine(fails === 0 ? `De primeira! +${gained}. PRÓXIMO!` : `+${gained}! Isso! Próximo!`);
      audio.play('success');
      setIdx((i) => i + 1);
    } else {
      setFails((f) => f + 1);
      audio.play('error');
      setLine(mentorFeedback(r, language));
    }
  };

  const pyLoading = language === 'python' && pythonRuntime.status() !== 'ready';

  return (
    <main className="screen lesson">
      <header className="lesson-head">
        <button className="btn small" onClick={() => (phase === 'play' ? finish() : game.navigate({ name: 'village' }))}>
          {phase === 'play' ? 'Encerrar' : '◀ Voltar'}
        </button>
        <h1 className="lesson-title">Desafio Relâmpago</h1>
        <span className="lightning-clock" aria-live="off" style={{ color: left <= 15 ? 'var(--red)' : 'var(--gold-l)', fontSize: 28 }}>
          ⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 26 }}>★ {score}</span>
      </header>
      {phase === 'intro' ? (
        <div className="center" style={{ flex: 1, padding: 16 }}>
          <div className="frame-panel col" style={{ maxWidth: 680, gap: 16 }}>
            <DialogBox
              variant="panel"
              speaker="Torvan"
              portrait="assets/portraits/torvan.png"
              text={`Regras da minha arena: ${LIGHTNING_SECONDS / 60 >= 1 ? `${Math.floor(LIGHTNING_SECONDS / 60)} minutos e ${LIGHTNING_SECONDS % 60} segundos` : `${LIGHTNING_SECONDS} segundos`}. Cada desafio resolvido vale 100 pontos, mais 30 se for de primeira. Pode pular os difíceis. Seu recorde: ${save.stats.lightningBest}. Pronto?`}
              active={false}
            />
            {pyLoading ? <p className="text-body muted">O Python ainda está carregando; o relógio só começa quando você apertar Começar.</p> : null}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => game.navigate({ name: 'village' })}>Agora não</button>
              <button className="btn primary" onClick={start} autoFocus>Começar!</button>
            </div>
          </div>
        </div>
      ) : null}
      {phase === 'play' ? (
        <div className="lesson-body">
          <div className="lesson-left">
            <ChallengeBrief challenge={challenge} language={language} className="lesson-brief" />
            <DialogBox variant="panel" speaker="Torvan" portrait="assets/portraits/torvan.png" text={line} active={false} />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>Resolvidos: {solvedCount}</span>
              <button
                className="btn small"
                onClick={() => {
                  setIdx((i) => i + 1);
                  setFails(0);
                  setLine('Pulou! Sem vergonha nenhuma. Próximo!');
                }}
              >
                Pular ⏭
              </button>
            </div>
          </div>
          <div className="lesson-right">
            <IdePanel key={`${challenge.id}-${idx}`} challenge={challenge} language={language} onResult={onResult} persistDraft={false} />
          </div>
        </div>
      ) : null}
      {phase === 'done' ? (
        <div className="center" style={{ flex: 1, padding: 16 }}>
          <div className="frame-panel col" style={{ maxWidth: 680, gap: 16, alignItems: 'stretch' }}>
            <h2 className="panel-title" style={{ fontFamily: 'var(--font-pixel)', color: 'var(--gold-l)', fontSize: 18 }}>
              Tempo! {score} pontos
            </h2>
            <DialogBox
              variant="panel"
              speaker="Torvan"
              portrait="assets/portraits/torvan.png"
              text={record ? `NOVO RECORDE! ${solvedCount} desafios resolvidos. A arena inteira está de pé!` : score > 0 ? `${solvedCount} desafio(s) resolvido(s). Nada mal! Seu recorde continua ${Math.max(save.stats.lightningBest, score)}.` : 'Zero pontos... Acontece com os melhores. Respira e tenta de novo!'}
              active={false}
            />
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => game.navigate({ name: 'scroll', back: { name: 'village' } })}>Ver o Pergaminho</button>
              <button className="btn primary" onClick={() => game.navigate({ name: 'village' })} autoFocus>Voltar à vila</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function useRefValue<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}
