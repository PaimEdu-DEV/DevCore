import { game, useGame, equippedTitle, type Route } from '../state/store';
import { levelProgress, EARNED_TITLES } from '../state/progression';
import { VILLAINS } from '../data/characters';
import { MISSIONS, missionReady } from '../data/missions';
import { grant } from '../state/rewards';
import { getCosmetic } from '../data/cosmetics';
import { SpritePreview } from '../ui/SpritePreview';
import { NameTag } from '../ui/NameTag';
import { isCancel, useKeys } from '../ui/hooks';
import { assetUrl } from '../assets/sprites';
import './panels.css';

function useBack(back: Route) {
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace') game.navigate(back);
  });
}

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${m}min` : `${m}min`;
}

export function ProfileScreen({ back }: { back: Route }) {
  const save = useGame((s) => s.save);
  useBack(back);
  if (!save) return null;
  const lp = levelProgress(save.stats.xp);
  const titles = [
    ...save.titles.filter((t) => EARNED_TITLES[t]).map((t) => EARNED_TITLES[t]),
    ...save.cosmetics.owned.map(getCosmetic).flatMap((c) => (c && c.category === 'title' ? [c.text] : [])),
  ];
  const s = save.stats;
  const stats: [string, string | number][] = [
    ['Moedas', s.coins],
    ['Lições concluídas', Object.values(save.lessons).filter((l) => l.done).length],
    ['Vilões derrotados', Object.values(save.bosses).filter((b) => b?.defeated).length],
    ['Execuções de código', s.runs],
    ['Testes aprovados', s.testsPassed],
    ['Execuções com erro', s.errors],
    ['Dicas usadas', s.hintsUsed],
    ['Fases impecáveis', s.flawlessPhases],
    ['Recorde Relâmpago', s.lightningBest],
    ['Desafios diários', s.dailyDone],
    ['Tempo de jogo', fmtTime(s.playTimeSec)],
  ];
  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">Perfil</h1>
          <button className="btn small" onClick={() => game.navigate(back)}>Voltar</button>
        </div>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <SpritePreview hero={{ gender: save.player.gender, heroClass: save.player.heroClass, hat: save.cosmetics.equipped.hat, aura: save.cosmetics.equipped.aura }} scale={3} headroom={10} />
          <div className="col" style={{ flex: 1, minWidth: 240 }}>
            <NameTag name={save.player.name} frameId={save.cosmetics.equipped.nameFrame} title={equippedTitle(save)} size="lg" />
            <span>
              {save.player.heroClass === 'alchemist' ? 'Alquimista · Python' : 'Mago · JavaScript'} · Nível {lp.level}
            </span>
            <div className="row">
              <img src={assetUrl('assets/icons/xp.png')} alt="XP" className="icon sm px" />
              <div className="xpbar" style={{ flex: 1 }} role="progressbar" aria-valuemin={0} aria-valuemax={lp.needed} aria-valuenow={lp.current} aria-label="Experiência até o próximo nível">
                <div style={{ width: `${Math.round(lp.ratio * 100)}%` }} />
              </div>
              <span>
                {lp.current}/{lp.needed} XP
              </span>
            </div>
          </div>
        </div>
        <h2 className="panel-sub">Estatísticas</h2>
        <div className="stat-grid">
          {stats.map(([label, value]) => (
            <div key={label} className="stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <h2 className="panel-sub">Jornada</h2>
        <div className="stat-grid">
          {VILLAINS.map((v) => {
            const b = save.bosses[v.id];
            return (
              <div key={v.id} className="stat">
                <strong style={{ color: b?.defeated ? 'var(--green-ok)' : 'var(--cream-d)' }}>{b?.defeated ? '✓ Derrotado' : '— Pendente'}</strong>
                <span>
                  {v.name}, {v.epithet}
                  {b?.bestScore ? ` · melhor: ${b.bestScore} pts` : ''}
                </span>
              </div>
            );
          })}
        </div>
        <h2 className="panel-sub">Títulos</h2>
        <p className="text-body">{titles.length ? titles.map((t) => `« ${t} »`).join('  ') : 'Nenhum título ainda. Eles vêm com as vitórias (e da loja do Garrick).'}</p>
      </div>
    </main>
  );
}

export function MissionsScreen({ back }: { back: Route }) {
  const save = useGame((s) => s.save);
  useBack(back);
  if (!save) return null;
  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">Missões da Elowen</h1>
          <button className="btn small" onClick={() => game.navigate(back)}>Voltar</button>
        </div>
        <p className="text-body muted">Sem prazo, sem pressa. Cumpriu? É só resgatar a recompensa.</p>
        <div className="card-grid">
          {MISSIONS.map((m) => {
            const [a, b] = m.progress(save);
            const claimed = save.missionsClaimed.includes(m.id);
            const ready = missionReady(m, save);
            return (
              <div key={m.id} className={`item-card ${claimed ? 'equipped' : ''}`}>
                <strong>{m.title}</strong>
                <span className="desc">{m.description}</span>
                <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={b} aria-valuenow={a} aria-label={`Progresso: ${a} de ${b}`}>
                  <div style={{ width: `${Math.round((Math.min(a, b) / b) * 100)}%` }} />
                </div>
                <span className="desc">
                  {Math.min(a, b)}/{b} · Recompensa: {m.coins} moedas, {m.xp} XP
                </span>
                {claimed ? (
                  <span style={{ color: 'var(--green-ok)' }}>✓ Resgatada</span>
                ) : (
                  <button
                    className="btn small primary"
                    disabled={!ready}
                    onClick={() => {
                      grant(m.xp, m.coins, m.title, (d) => void d.missionsClaimed.push(m.id));
                    }}
                  >
                    {ready ? 'Resgatar' : 'Em andamento'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
