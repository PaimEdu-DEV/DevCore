import { useRef, useState } from 'react';
import { game, useGame, type Route } from '../state/store';
import { exportSave, importSave, type TextSpeed } from '../state/save';
import { audio } from '../audio/AudioManager';
import { isCancel, useKeys, typingInField } from '../ui/hooks';
import './panels.css';

const SPEEDS: { id: TextSpeed; label: string }[] = [
  { id: 'slow', label: 'Lenta' },
  { id: 'normal', label: 'Normal' },
  { id: 'fast', label: 'Rápida' },
  { id: 'instant', label: 'Instantânea' },
];

export function OptionsPanel() {
  const options = useGame((s) => s.options);
  const save = useGame((s) => s.save);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const doExport = () => {
    if (!save) return;
    const blob = new Blob([exportSave(save)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `devcore-${save.player.name.replace(/\W+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Save exportado.');
  };

  const doImport = async (file: File) => {
    try {
      const data = importSave(await file.text());
      game.setSave(data);
      setMsg(`Save de ${data.player.name} importado com sucesso.`);
      audio.play('success');
    } catch (e) {
      setMsg((e as Error).message);
      audio.play('error');
    }
  };

  return (
    <div className="options-grid">
      <fieldset>
        <legend>Velocidade do texto</legend>
        <div className="seg" role="radiogroup" aria-label="Velocidade do texto">
          {SPEEDS.map((s) => (
            <button key={s.id} role="radio" aria-checked={options.textSpeed === s.id} className={`btn small ${options.textSpeed === s.id ? 'primary' : ''}`} onClick={() => game.setOptions({ textSpeed: s.id })}>
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Som</legend>
        <div className="row">
          <label htmlFor="opt-volume">Volume</label>
          <input
            id="opt-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={options.volume}
            onChange={(e) => game.setOptions({ volume: Number(e.target.value) })}
            onMouseUp={() => audio.play('select')}
            onKeyUp={() => audio.play('select')}
          />
          <span>{Math.round(options.volume * 100)}%</span>
        </div>
        <label className="row">
          <input type="checkbox" checked={options.muted} onChange={(e) => game.setOptions({ muted: e.target.checked })} /> Mudo
        </label>
      </fieldset>

      <fieldset>
        <legend>Editor de código</legend>
        <div className="row">
          <label htmlFor="opt-font">Tamanho da fonte</label>
          <input id="opt-font" type="range" min={12} max={22} step={1} value={options.editorFontSize} onChange={(e) => game.setOptions({ editorFontSize: Number(e.target.value) })} />
          <span style={{ fontFamily: 'var(--font-code)', fontSize: options.editorFontSize }}>{options.editorFontSize}px</span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Acessibilidade</legend>
        <div className="seg" role="radiogroup" aria-label="Reduzir movimento">
          {([['system', 'Seguir o sistema'], ['on', 'Reduzir movimento'], ['off', 'Movimento completo']] as const).map(([id, label]) => (
            <button key={id} role="radio" aria-checked={options.reducedMotion === id} className={`btn small ${options.reducedMotion === id ? 'primary' : ''}`} onClick={() => game.setOptions({ reducedMotion: id })}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Save</legend>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn small" onClick={doExport} disabled={!save}>Exportar save (.json)</button>
          <button className="btn small" onClick={() => fileRef.current?.click()}>Importar save</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = '';
            }}
          />
        </div>
        {msg ? <p role="status">{msg}</p> : null}
      </fieldset>
    </div>
  );
}

export function OptionsScreen({ back }: { back: Route }) {
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && !typingInField(e) && e.key !== 'Backspace') game.navigate(back);
  });
  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <h1 className="panel-title">Opções</h1>
        <OptionsPanel />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn primary" onClick={() => game.navigate(back)}>Voltar</button>
        </div>
      </div>
    </main>
  );
}
