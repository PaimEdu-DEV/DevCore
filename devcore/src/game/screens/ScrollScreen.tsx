import { useEffect, useState } from 'react';
import { getBackend, syncProfile, TAB_LABEL, type LeaderboardEntry, type LeaderboardTab, demoRanking } from '../../services/backend';
import { game, useGame, equippedTitle, type Route } from '../state/store';
import { assetUrl } from '../assets/sprites';
import { isCancel, useKeys } from '../ui/hooks';
import { audio } from '../audio/AudioManager';
import './scroll.css';

const TABS: LeaderboardTab[] = ['xp', 'python', 'javascript', 'lightning'];
const MEDALS = ['assets/icons/medal_gold.png', 'assets/icons/medal_silver.png', 'assets/icons/medal_bronze.png'];

/** O Pergaminho da Maren: ranking com abas, Top 50 e a sua posição destacada. */
export function ScrollScreen({ back }: { back: Route }) {
  const save = useGame((s) => s.save);
  const [tab, setTab] = useState<LeaderboardTab>('xp');
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [online, setOnline] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useKeys((e, type) => {
    if (type !== 'down') return;
    if (isCancel(e) && e.key !== 'Backspace') game.navigate(back);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const i = TABS.indexOf(tab);
      setTab(TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]);
      audio.play('select');
    }
  });

  useEffect(() => {
    let alive = true;
    setRows(null);
    setError(null);
    void (async () => {
      try {
        const b = await getBackend();
        if (save) await syncProfile(save, equippedTitle(save));
        const [list, rank] = await Promise.all([b.getLeaderboard(tab, 50), b.getPlayerRank(tab)]);
        if (!alive) return;
        setOnline(b.online);
        setRows(list);
        setMyRank(rank);
      } catch (e) {
        if (alive) setError('Não foi possível ler o Pergaminho agora. Tente de novo mais tarde.');
        console.warn(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, save]);

  const value = (r: LeaderboardEntry) => (tab === 'lightning' ? `${r.lightning} pts` : `${r.xp} XP`);

  return (
    <main className="screen scroll-screen">
      <div className="scroll">
        <img src={assetUrl('assets/ui/scroll_roll.png')} alt="" className="scroll-roll px" />
        <div className="scroll-body frame-parchment">
          <h1 className="scroll-title">O Pergaminho</h1>
          <p className="scroll-sub">Registrado pela escriba Maren</p>
          <div className="scroll-tabs" role="tablist" aria-label="Rankings">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
          {!online ? (
            <p className="scroll-notice" role="note">
              Ranking online em breve. Por enquanto, o Pergaminho mostra só o seu registro neste aparelho{demoRanking ? ' e alguns registros de EXEMPLO (fictícios)' : ''}.
            </p>
          ) : null}
          {error ? <p className="scroll-notice">{error}</p> : null}
          {!rows && !error ? <p className="scroll-empty">Desenrolando o pergaminho...</p> : null}
          {rows && rows.length === 0 ? <p className="scroll-empty">{tab === 'lightning' ? 'Ninguém encarou o Relâmpago do Torvan ainda.' : 'Nenhum registro ainda. Conclua uma lição para entrar no Pergaminho.'}</p> : null}
          {rows && rows.length > 0 ? (
            <ol className="scroll-list">
              {rows.map((r) => (
                <li key={r.uid} className={`${r.isMe ? 'me' : ''} ${r.demo ? 'demo' : ''}`} aria-current={r.isMe ? 'true' : undefined}>
                  <span className="scroll-rank">{r.rank <= 3 ? <img src={assetUrl(MEDALS[r.rank - 1])} alt={`${r.rank}º lugar`} className="px" /> : `${r.rank}º`}</span>
                  <img
                    src={assetUrl(r.heroClass === 'alchemist' ? 'assets/icons/flask.png' : 'assets/icons/bolt.png')}
                    alt={r.heroClass === 'alchemist' ? 'Alquimista (Python)' : 'Mago (JavaScript)'}
                    title={r.heroClass === 'alchemist' ? 'Alquimista (Python)' : 'Mago (JavaScript)'}
                    className="px scroll-class"
                  />
                  <span className="scroll-name">
                    {r.name}
                    {r.isMe ? <em> (você)</em> : null}
                    {r.demo ? <em> · exemplo</em> : null}
                  </span>
                  <span className="scroll-level">Nv {r.level}</span>
                  <span className="scroll-value">{value(r)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {myRank && rows && !rows.some((r) => r.isMe) ? <p className="scroll-me">Sua posição: {myRank}º</p> : null}
          {!save ? <p className="scroll-me">Comece uma jornada para ter seu nome no Pergaminho.</p> : null}
        </div>
        <img src={assetUrl('assets/ui/scroll_roll.png')} alt="" className="scroll-roll px" />
        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <button className="btn primary" onClick={() => game.navigate(back)}>
            Voltar
          </button>
        </div>
      </div>
    </main>
  );
}
