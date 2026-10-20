import { useState } from 'react';
import { assetUrl, getImage } from '../assets/sprites';
import { PixelStage, VW } from '../engine/PixelStage';
import { PixelMenu } from '../ui/PixelMenu';
import { DialogBox } from '../ui/DialogBox';
import { isConfirm, useKeys } from '../ui/hooks';
import { game, useGame } from '../state/store';
import { audio } from '../audio/AudioManager';
import { deleteSave } from '../state/save';
import './title.css';

const STARS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 97) % VW, y: (i * 53) % 110, p: i * 0.7 }));

export function TitleScreen() {
  const save = useGame((s) => s.save);
  const [stage, setStage] = useState<'press' | 'menu' | 'confirmNew'>('press');

  useKeys((e, type) => {
    if (type === 'down' && stage === 'press' && (isConfirm(e) || e.key.length === 1)) {
      e.preventDefault();
      audio.unlock();
      audio.play('confirm');
      setStage('menu');
    }
  }, stage === 'press');

  const startNew = () => {
    deleteSave();
    game.setSave(null, false);
    game.navigate({ name: 'cutscene', id: 'opening', next: { name: 'creation' } });
  };

  const render = (ctx: CanvasRenderingContext2D, now: number) => {
    const bg = getImage('assets/backgrounds/title.png');
    if (bg) ctx.drawImage(bg, 0, 0);
    for (const s of STARS) {
      const a = 0.5 + 0.5 * Math.sin(now / 500 + s.p);
      ctx.fillStyle = a > 0.8 ? '#FFE08A' : '#33456E';
      ctx.fillRect(s.x, s.y, 1, 1);
    }
    // pulso do Core no alto da torre
    const pulse = 1 + Math.sin(now / 300);
    ctx.fillStyle = '#9BFF1A';
    ctx.globalAlpha = 0.25 + 0.15 * pulse;
    ctx.fillRect(160 - 3 - pulse, 72 - 3 - pulse, 6 + pulse * 2, 6 + pulse * 2);
    ctx.globalAlpha = 1;
  };

  return (
    <PixelStage render={render}>
      <img className="title-logo px" src={assetUrl('assets/ui/logo.png')} alt="DevCore" />
      <p className="title-sub">Um RPG onde o seu código é a sua magia</p>
      {stage === 'press' ? (
        <button className="title-press" onClick={() => { audio.unlock(); setStage('menu'); }}>
          Pressione Enter
        </button>
      ) : null}
      {stage === 'menu' ? (
        <div className="title-menu frame-panel thin">
          <PixelMenu
            ariaLabel="Menu principal"
            items={[
              { label: 'Novo Jogo', onSelect: () => (save ? setStage('confirmNew') : startNew()) },
              { label: 'Continuar', disabled: !save, hint: save ? save.player.name : undefined, onSelect: () => game.navigate({ name: 'village' }) },
              { label: 'Pergaminho', onSelect: () => game.navigate({ name: 'scroll', back: { name: 'title' } }) },
              { label: 'Opções', onSelect: () => game.navigate({ name: 'options', back: { name: 'title' } }) },
              { label: 'Créditos', onSelect: () => game.navigate({ name: 'credits' }) },
            ]}
          />
        </div>
      ) : null}
      {stage === 'confirmNew' ? (
        <DialogBox
          speaker="Orwin"
          portrait="assets/portraits/orwin.png"
          text={`Já existe uma jornada salva (${save?.player.name}). Começar de novo apaga esse progresso. Tem certeza?`}
          choices={[{ label: 'Começar do zero' }, { label: 'Voltar' }]}
          onChoose={(i) => (i === 0 ? startNew() : setStage('menu'))}
        />
      ) : null}
      <p className="title-footer">v1.0 · Projeto de Engenharia de Software</p>
    </PixelStage>
  );
}
