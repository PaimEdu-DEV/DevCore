import { lazy, Suspense, useEffect } from 'react';
import { game, useGame, useReducedMotion } from './game/state/store';
import { TitleScreen } from './game/screens/TitleScreen';
import { CreationScreen } from './game/screens/CreationScreen';
import { CutsceneScreen } from './game/screens/CutsceneScreen';
import { OptionsScreen } from './game/screens/OptionsScreen';
import { CreditsScreen } from './game/screens/CreditsScreen';
import { TrainingScreen } from './game/screens/TrainingScreen';
import { VillageScreen } from './game/screens/VillageScreen';
import { ShopScreen, CosmeticsScreen } from './game/screens/ShopScreen';
import { ProfileScreen, MissionsScreen } from './game/screens/ProfileScreen';
import { ScrollScreen } from './game/screens/ScrollScreen';
import { BossSelectScreen } from './game/screens/BossSelectScreen';
import { dailyChallenge, todayKey } from './game/data/challenges';
import { assetUrl } from './game/assets/sprites';
import { audio } from './game/audio/AudioManager';

// Telas com editor de código (CodeMirror) são carregadas sob demanda.
const LessonScreen = lazy(() => import('./game/screens/LessonScreen').then((m) => ({ default: m.LessonScreen })));
const LightningScreen = lazy(() => import('./game/screens/LightningScreen').then((m) => ({ default: m.LightningScreen })));
const JourneyScreen = lazy(() => import('./game/screens/JourneyScreen').then((m) => ({ default: m.JourneyScreen })));
const BattleScreen = lazy(() => import('./game/screens/BattleScreen').then((m) => ({ default: m.BattleScreen })));

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

function Loading() {
  return (
    <main className="screen center">
      <p className="muted">Carregando...</p>
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
    case 'village':
      screen = <VillageScreen />;
      break;
    case 'lesson':
      screen = <LessonScreen key={route.challengeId} challengeId={route.challengeId} back={route.back} />;
      break;
    case 'daily':
      screen = <LessonScreen key="daily" challengeId={dailyChallenge(todayKey()).id} back={{ name: 'village' }} mode="daily" />;
      break;
    case 'training':
      screen = <TrainingScreen back={route.back} />;
      break;
    case 'shop':
      screen = <ShopScreen />;
      break;
    case 'cosmetics':
      screen = <CosmeticsScreen back={route.back} />;
      break;
    case 'profile':
      screen = <ProfileScreen back={route.back} />;
      break;
    case 'missions':
      screen = <MissionsScreen back={route.back} />;
      break;
    case 'scroll':
      screen = <ScrollScreen back={route.back} />;
      break;
    case 'bossSelect':
      screen = <BossSelectScreen />;
      break;
    case 'lightning':
      screen = <LightningScreen />;
      break;
    case 'journey':
      screen = <JourneyScreen />;
      break;
    case 'battle':
      screen = <BattleScreen key={route.villain} villain={route.villain} />;
      break;
  }

  return (
    <>
      <Suspense fallback={<Loading />}>{screen}</Suspense>
      <Toasts />
    </>
  );
}
