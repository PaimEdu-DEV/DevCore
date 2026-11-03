import { useState } from 'react';
import { assetUrl } from '../assets/sprites';
import { isCancel, isConfirm, useKeys } from '../ui/hooks';
import { game, useGame } from '../state/store';
import { audio } from '../audio/AudioManager';
import { deleteSave } from '../state/save';
import './title.css';

// Arte do menu (art/source/title-menu.png). Os botões já estão desenhados na imagem;
// as áreas clicáveis abaixo ficam exatamente em cima deles, em % do tamanho da imagem.
const ART = 'assets/ui/title-menu.webp';
const BUTTONS = [
  { id: 'new', label: 'Novo Jogo', top: 52.6 },
  { id: 'continue', label: 'Continuar', top: 60.6 },
  { id: 'options', label: 'Configurações', top: 68.6 },
  { id: 'exit', label: 'Sair', top: 76.6 },
] as const;
type ButtonId = (typeof BUTTONS)[number]['id'];

export function TitleScreen() {
  const save = useGame((s) => s.save);
  const [stage, setStage] = useState<'menu' | 'confirmNew' | 'bye'>('menu');
  const enabled = (id: ButtonId) => id !== 'continue' || !!save;
  const [sel, setSel] = useState(save ? 1 : 0);

  const startNew = () => {
    deleteSave();
    game.setSave(null, false);
    game.navigate({ name: 'cutscene', id: 'opening', next: { name: 'creation' } });
  };

  const choose = (id: ButtonId) => {
    if (!enabled(id)) return;
    audio.unlock();
    audio.play('confirm');
    switch (id) {
      case 'new':
        if (save) setStage('confirmNew');
        else startNew();
        return;
      case 'continue':
        game.navigate({ name: 'village' });
        return;
      case 'options':
        game.navigate({ name: 'options', back: { name: 'title' } });
        return;
      case 'exit':
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
        setStage('bye');
        return;
    }
  };

  const move = (d: number) => {
    let i = sel;
    do i = (i + d + BUTTONS.length) % BUTTONS.length;
    while (!enabled(BUTTONS[i].id));
    setSel(i);
    audio.play('blip');
  };

  useKeys((e, type) => {
    if (type !== 'down') return;
    if (stage === 'menu') {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        move(-1);
      } else if (isConfirm(e) && !e.repeat && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        choose(BUTTONS[sel].id);
      }
    } else if (isCancel(e)) {
      e.preventDefault();
      setStage('menu');
    }
  });

  return (
    <main className="title-screen" style={{ ['--art' as string]: `url(${assetUrl(ART)})` }}>
      <div className="title-art">
        <img className="title-img" src={assetUrl(ART)} alt="DevCore — menu principal" draggable={false} />
        <nav className="title-buttons" aria-label="Menu principal">
          {BUTTONS.map((b, i) => (
            <button
              key={b.id}
              className={`title-hit ${i === sel ? 'is-selected' : ''}`}
              style={{ top: `${b.top}%` }}
              disabled={!enabled(b.id)}
              aria-label={b.label}
              title={b.id === 'continue' && save ? `Continuar com ${save.player.name}` : undefined}
              onPointerEnter={() => enabled(b.id) && i !== sel && (setSel(i), audio.play('blip'))}
              onFocus={() => setSel(i)}
              onClick={() => choose(b.id)}
            />
          ))}
        </nav>
        {save ? <span className="title-save">Jornada salva: {save.player.name}</span> : null}
      </div>
      <div className="title-links">
        <button onClick={() => game.navigate({ name: 'scroll', back: { name: 'title' } })}>Pergaminho</button>
        <span aria-hidden="true">·</span>
        <button onClick={() => game.navigate({ name: 'credits' })}>Créditos</button>
      </div>

      {stage === 'confirmNew' ? (
        <div className="title-modal" role="dialog" aria-label="Começar de novo?">
          <div className="frame-panel thin title-modal-box">
            <p>
              Já existe uma jornada salva ({save?.player.name}). Começar de novo apaga esse progresso. Tem certeza?
            </p>
            <div className="row title-modal-actions">
              <button className="btn primary" onClick={startNew} autoFocus>
                Começar do zero
              </button>
              <button className="btn" onClick={() => setStage('menu')}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {stage === 'bye' ? (
        <div className="title-modal" role="dialog" aria-label="Até a próxima">
          <div className="frame-panel thin title-modal-box">
            <p>Até a próxima, herói! O Core estará esperando.</p>
            <div className="row title-modal-actions">
              <button className="btn primary" onClick={() => setStage('menu')} autoFocus>
                Voltar ao menu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
