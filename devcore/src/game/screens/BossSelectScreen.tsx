import { useState } from 'react';
import { VILLAINS, VILLAIN_ORDER, type VillainInfo } from '../data/characters';
import { lessonsFor } from '../data/challenges';
import { game, useGame } from '../state/store';
import { assetUrl } from '../assets/sprites';
import { DialogBox } from '../ui/DialogBox';
import { isCancel, useKeys } from '../ui/hooks';
import { audio } from '../audio/AudioManager';
import type { SaveData, VillainId } from '../state/save';
import './panels.css';
import './bossselect.css';

export function bossStatus(save: SaveData, id: VillainId): { order: boolean; lessonsDone: number; lessonsTotal: number; defeated: boolean } {
  const i = VILLAIN_ORDER.indexOf(id);
  const prev = VILLAIN_ORDER[i - 1];
  const lessons = lessonsFor(id);
  return {
    order: !prev || !!save.bosses[prev]?.defeated,
    lessonsDone: lessons.filter((l) => save.lessons[l.id]?.done).length,
    lessonsTotal: lessons.length,
    defeated: !!save.bosses[id]?.defeated,
  };
}

export function startBossFight(save: SaveData, id: VillainId) {
  const seen = !!save.flags[`seen_intro_${id}`];
  game.update((d) => void (d.flags[`seen_intro_${id}`] = true));
  if (seen) game.navigate({ name: 'battle', villain: id });
  else game.navigate({ name: 'cutscene', id: `${id}_intro`, next: { name: 'battle', villain: id } });
}

/** Portão do Reino: seleção dos chefes, em ordem. */
export function BossSelectScreen() {
  const save = useGame((s) => s.save);
  const [warn, setWarn] = useState<VillainInfo | null>(null);
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace' && !warn) game.navigate({ name: 'village' });
  });
  if (!save) return null;

  const pick = (v: VillainInfo) => {
    const st = bossStatus(save, v.id);
    if (!st.order) {
      audio.play('error');
      return;
    }
    audio.play('confirm');
    if (st.lessonsDone < st.lessonsTotal) setWarn(v);
    else startBossFight(save, v.id);
  };

  return (
    <main className="screen panel-screen boss-select">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">O Portão do Reino</h1>
          <button className="btn small" onClick={() => game.navigate({ name: 'village' })}>Voltar à vila</button>
        </div>
        <p className="text-body muted">Os traidores guardam as muralhas em ordem. Derrote um para alcançar o próximo.</p>
        <div className="boss-grid">
          {VILLAINS.map((v, i) => {
            const st = bossStatus(save, v.id);
            const locked = !st.order;
            return (
              <button key={v.id} className={`boss-card ${locked ? 'locked' : ''} ${st.defeated ? 'defeated' : ''}`} onClick={() => pick(v)} disabled={locked} aria-label={`${v.name}: ${locked ? 'bloqueado' : st.defeated ? 'derrotado' : 'disponível'}`}>
                <span className="boss-num">{i + 1}</span>
                <img src={assetUrl(`assets/portraits/${v.id}.png`)} alt="" className="px boss-portrait" />
                <span className="boss-name">{locked ? '???' : v.name}</span>
                <span className="boss-epithet">{locked ? 'Derrote o anterior para revelar' : v.epithet}</span>
                {!locked ? <span className="boss-concept">{v.concept}</span> : null}
                <span className="boss-status">
                  {locked ? (
                    <>
                      <img src={assetUrl('assets/icons/lock.png')} alt="" className="icon sm px" /> Bloqueado
                    </>
                  ) : st.defeated ? (
                    <>✓ Derrotado · lutar de novo</>
                  ) : (
                    <>
                      Treino: {st.lessonsDone}/{st.lessonsTotal} {st.lessonsDone >= st.lessonsTotal ? '✓' : ''}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {warn ? (
          <div className="boss-warn">
            <DialogBox
              variant="panel"
              speaker="Orwin"
              portrait="assets/portraits/orwin.png"
              text={`Você ainda não terminou o treino de ${warn.concept.toLowerCase()}. Ir agora é corajoso... ou só pressa. Às vezes é a mesma coisa. Tem certeza?`}
              choices={[{ label: 'Treinar primeiro' }, { label: 'Lutar mesmo assim' }, { label: 'Voltar' }]}
              onChoose={(i) => {
                if (i === 0) game.navigate({ name: 'training', back: { name: 'bossSelect' } });
                else if (i === 1) startBossFight(save, warn.id);
                else setWarn(null);
              }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
