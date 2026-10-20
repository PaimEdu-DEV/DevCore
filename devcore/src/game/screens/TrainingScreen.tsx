import { game, useGame, type Route } from '../state/store';
import { lessonsFor, CONCEPT_LABEL } from '../data/challenges';
import { VILLAINS } from '../data/characters';
import { assetUrl } from '../assets/sprites';
import { isCancel, useKeys } from '../ui/hooks';
import './panels.css';

/** Lista de lições por conceito (o "Treino" do Orwin). */
export function TrainingScreen({ back }: { back: Route }) {
  const save = useGame((s) => s.save);
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace') game.navigate(back);
  });
  if (!save) return null;
  const self: Route = { name: 'training', back };

  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">Treino com Orwin</h1>
          <button className="btn small" onClick={() => game.navigate(back)}>Voltar</button>
        </div>
        <p className="text-body muted">Cada vilão é vencido com um conceito. Termine as lições de um conceito para destravar a luta no Portão do Reino.</p>
        {VILLAINS.map((v) => {
          const lessons = lessonsFor(v.id);
          const done = lessons.filter((l) => save.lessons[l.id]?.done).length;
          return (
            <section key={v.id}>
              <h2 className="panel-sub">
                {v.name}: {CONCEPT_LABEL[lessons[0].concept]} <span className="muted">({done}/{lessons.length})</span>
              </h2>
              <div className="card-grid">
                {lessons.map((l, i) => {
                  const p = save.lessons[l.id];
                  return (
                    <button key={l.id} className={`item-card ${p?.done ? 'equipped' : ''}`} onClick={() => game.navigate({ name: 'lesson', challengeId: l.id, back: self })} style={{ cursor: 'pointer' }}>
                      <span className="row">
                        <img src={assetUrl(p?.done ? 'assets/icons/check.png' : 'assets/icons/scroll.png')} alt={p?.done ? 'Concluída' : 'Pendente'} className="icon sm px" />
                        <strong>
                          Lição {i + 1}: {l.title}
                        </strong>
                      </span>
                      <span className="desc">
                        {p?.done ? (p.flawless ? 'Concluída sem tropeços ★' : 'Concluída') : 'Ainda não concluída'} · {l.xp} XP · {l.coins} moedas
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
