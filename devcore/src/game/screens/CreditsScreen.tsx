import { game } from '../state/store';
import { isCancel, useKeys } from '../ui/hooks';
import './panels.css';

export function CreditsScreen() {
  useKeys((e, type) => {
    if (type === 'down' && (isCancel(e) || e.key === 'Enter')) game.navigate({ name: 'title' });
  });
  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel credits">
        <h1 className="panel-title">Créditos</h1>
        <p>
          <strong>DevCore</strong> é um projeto de Engenharia de Software feito para atrair pessoas para a área de tecnologia:
          um RPG medieval em pixel art em que você aprende Python ou JavaScript derrotando vilões com código de verdade.
        </p>
        <h2>Equipe</h2>
        <p>Game design, roteiro e direção: equipe do projeto DevCore.</p>
        <p>Programação e arte procedural: desenvolvido com apoio do Claude Code.</p>
        <h2>Arte</h2>
        <p>Sprites dos personagens: folhas geradas por IA e processadas pelo script do projeto. Cenários, ícones, interface e efeitos: placeholders procedurais, que serão trocados por arte feita à mão.</p>
        <h2>Tecnologia</h2>
        <p>React, TypeScript, Vite, CodeMirror 6, Pyodide (Python no navegador), Web Workers e Web Audio.</p>
        <p>Fontes: Press Start 2P, VT323 e JetBrains Mono (licença OFL).</p>
        <h2>Obrigado por jogar!</h2>
        <p>Se você nunca tinha programado e escreveu sua primeira função aqui, você já é um(a) programador(a).</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn primary" onClick={() => game.navigate({ name: 'title' })} autoFocus>Voltar</button>
        </div>
      </div>
    </main>
  );
}
