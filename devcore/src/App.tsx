import { useEffect } from 'react';
import { game, useGame, useReducedMotion } from './game/state/store';
import { TitleScreen } from './game/screens/TitleScreen';
import { CreationScreen } from './game/screens/CreationScreen';
import { CutsceneScreen } from './game/screens/CutsceneScreen';
import { OptionsScreen } from './game/screens/OptionsScreen';
import { CreditsScreen } from './game/screens/CreditsScreen';
import { LessonScreen } from './game/screens/LessonScreen';
import { TrainingScreen } from './game/screens/TrainingScreen';
import { assetUrl } from './game/assets/sprites';
import { audio } from './game/audio/AudioManager';

function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          {t.kind === 'reward' ? <img src={assetUrl('assets/icons/star.png')} alt="" className="icon sm px" /> : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main className="screen center">
      <div className="frame-panel col" style={{ alignItems: 'center' }}>
        <p>{title}: em construção.</p>
        <button className="btn primary" onClick={() => game.navigate({ name: 'title' })} autoFocus>Voltar ao título</button>
      </div>
    </main>
  );
}

export function App() {
  const route = useGame((s) => s.route);
  const reduce = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduce);
  }, [reduce]);

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    // contador de tempo de jogo (salvo junto com o progresso)
    const id = window.setInterval(() => {
      if (game.get().save && document.visibilityState === 'visible') game.update((s) => void (s.stats.playTimeSec += 30), false);
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  let screen: React.ReactNode;
  switch (route.name) {
    case 'title':
      screen = <TitleScreen />;
      break;
    case 'creation':
      screen = <CreationScreen />;
      break;
    case 'cutscene':
      screen = <CutsceneScreen key={route.id} id={route.id} next={route.next} />;
      break;
    case 'options':
      screen = <OptionsScreen back={route.back} />;
      break;
    case 'credits':
      screen = <CreditsScreen />;
      break;
    case 'lesson':
      screen = <LessonScreen key={route.challengeId} challengeId={route.challengeId} back={route.back} />;
      break;
    case 'training':
      screen = <TrainingScreen back={route.back} />;
      break;
    default:
      screen = <Placeholder title={route.name} />;
  }

  return (
    <>
      {screen}
      <Toasts />
    </>
  );
}
