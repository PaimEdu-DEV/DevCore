import { useMemo, useState } from 'react';
import { IdePanel } from '../../ide/IdePanel';
import { ChallengeBrief } from '../../ide/ChallengeBrief';
import { DialogBox } from '../ui/DialogBox';
import { fillText } from '../ui/hooks';
import { getChallenge, lessonsFor, localize, todayKey } from '../data/challenges';
import { mentorFeedback } from '../../runner/errorTranslator';
import { game, useGame, type Route } from '../state/store';
import { languageOf } from '../state/save';
import { grant, HINT_COSTS, recordRun, spendCoins, awardTitle } from '../state/rewards';
import { EARNED_TITLES } from '../state/progression';
import { audio } from '../audio/AudioManager';
import { assetUrl } from '../assets/sprites';
import type { RunResult } from '../../runner';
import './lesson.css';

/** Treino com o Orwin: enunciado + IDE + mentor que comenta cada execução. */
export function LessonScreen({ challengeId, back, mode = 'lesson' }: { challengeId: string; back: Route; mode?: 'lesson' | 'daily' }) {
  const save = useGame((s) => s.save);
  const challenge = useMemo(() => getChallenge(challengeId), [challengeId]);
  const language = save ? languageOf(save.player.heroClass) : 'python';
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [solved, setSolved] = useState(false);
  const [mentor, setMentor] = useState<string>(() =>
    mode === 'daily'
      ? 'A Elowen pendurou este no quadro hoje. Sem pressa: vale o dia inteiro, e amanhã tem outro.'
      : 'Leia o enunciado com calma. Quando quiser testar, aperte ▶ Executar. Errar aqui não custa nada.',
  );
  const vars = { name: save?.player.name, heroClass: save?.player.heroClass ?? null };

  if (!save) return null;

  const siblings = challenge.villain && mode === 'lesson' ? lessonsFor(challenge.villain) : [];
  const next = siblings[siblings.findIndex((c) => c.id === challenge.id) + 1];
  const today = todayKey();

  const onResult = (r: RunResult) => {
    recordRun(r.tests.filter((t) => t.ok).length, !!r.error);
    if (r.passed && solved) {
      setMentor('Continua certo. Pode seguir em frente!');
      return;
    }
    if (r.passed && mode === 'daily') {
      audio.play('success');
      setSolved(true);
      const first = !save.daily.completed[today];
      setMentor(first ? 'Caçada do dia concluída! A Elowen vai ficar orgulhosa. Volte amanhã para o próximo.' : 'Já tinha caçado este hoje, mas treino nunca é demais.');
      if (first) {
        grant(challenge.xp * 1.5, challenge.coins * 2, 'Desafio diário', (d) => {
          d.daily.completed[today] = challenge.id;
          d.stats.dailyDone += 1;
        });
        if (save.stats.dailyDone + 1 >= 3) awardTitle('daily', EARNED_TITLES.daily);
      }
      return;
    }
    if (r.passed) {
      audio.play('success');
      setSolved(true);
      const first = !save.lessons[challenge.id]?.done;
      const flawless = hintsUsed === 0 && errors === 0;
      setMentor(fillText(localize(challenge.mentor.success, challenge, language), vars) + (flawless ? ' E sem nenhum tropeço!' : ''));
      const mult = first ? 1 : 0.25;
      grant(challenge.xp * mult * (flawless ? 1.2 : 1), challenge.coins * mult, first ? 'Lição concluída' : 'Treino repetido', (d) => {
        const prev = d.lessons[challenge.id];
        d.lessons[challenge.id] = { done: true, flawless: (prev?.flawless ?? false) || flawless };
        if (first) d.stats.lessonsDone += 1;
      });
      awardTitle('first_steps', EARNED_TITLES.first_steps);
    } else {
      audio.play('error');
      setErrors((e) => e + 1);
      setMentor(mentorFeedback(r, language));
    }
  };

  const hint = () => {
    if (hintsUsed >= 3) return;
    const cost = HINT_COSTS[hintsUsed];
    if (!spendCoins(cost)) {
      setMentor(`Uma dica custa ${cost} moedas e você não tem o suficiente. Tente mais um pouco: leia a mensagem de erro, ela já é uma dica.`);
      audio.play('error');
      return;
    }
    game.update((d) => void (d.stats.hintsUsed += 1));
    setMentor(`Dica ${hintsUsed + 1}/3: ${localize(challenge.hints[hintsUsed], challenge, language)}`);
    setHintsUsed((h) => h + 1);
  };

  return (
    <main className="screen lesson">
      <header className="lesson-head">
        <button className="btn small" onClick={() => game.navigate(back)}>◀ Voltar</button>
        <h1 className="lesson-title">{mode === 'daily' ? 'Desafio diário da Elowen' : challenge.kind === 'extra' ? 'Desafio' : 'Treino com Orwin'}</h1>
        <span className="lesson-coins">
          <img src={assetUrl('assets/icons/coin.png')} alt="Moedas" className="icon sm px" /> {save.stats.coins}
        </span>
      </header>
      <div className="lesson-body">
        <div className="lesson-left">
          <ChallengeBrief challenge={challenge} language={language} className="lesson-brief" />
          <DialogBox variant="panel" speaker="Orwin" portrait="assets/portraits/orwin.png" text={mentor} active={false} />
          {solved ? (
            <div className="row lesson-next">
              {next ? (
                <button className="btn primary" onClick={() => game.navigate({ name: 'lesson', challengeId: next.id, back })} autoFocus>
                  Próxima lição ▶
                </button>
              ) : null}
              <button className={`btn ${next ? '' : 'primary'}`} onClick={() => game.navigate(back)} autoFocus={!next}>
                Voltar
              </button>
            </div>
          ) : null}
        </div>
        <div className="lesson-right">
          <IdePanel
            key={challenge.id}
            challenge={challenge}
            language={language}
            onResult={onResult}
            onHint={hint}
            hintDisabled={hintsUsed >= 3}
            hintLabel={hintsUsed >= 3 ? 'Sem dicas' : `Dica ${hintsUsed + 1}/3 (${HINT_COSTS[hintsUsed]} moedas)`}
          />
        </div>
      </div>
    </main>
  );
}
