import { assetUrl } from './game/assets/sprites';

export function App() {
  return (
    <main className="screen center" style={{ background: 'var(--black)' }}>
      <div className="col" style={{ alignItems: 'center' }}>
        <img src={assetUrl('assets/ui/logo.png')} alt="DevCore" className="px" style={{ width: 'min(90vw, 540px)' }} />
        <p>O reino está sendo forjado. Volte em breve, herói.</p>
      </div>
    </main>
  );
}
