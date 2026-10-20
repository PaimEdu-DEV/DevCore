import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles/global.css';
import { App } from './App';

const DebugSprites = lazy(() => import('./debug/DebugSprites').then((m) => ({ default: m.DebugSprites })));

function Root() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/debug/sprites') {
    return (
      <Suspense fallback={null}>
        <DebugSprites />
      </Suspense>
    );
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
