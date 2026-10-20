import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0A0A0F',
        color: '#E8C872',
        fontFamily: 'monospace',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>DevCore</h1>
        <p style={{ color: '#F3E9D2' }}>O reino está sendo forjado. Volte em breve, herói.</p>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
