import { useMemo } from 'react';
import { CutscenePlayer } from '../cutscenes/CutscenePlayer';
import { getCutscene } from '../cutscenes/scripts';
import { game, type Route } from '../state/store';

export function CutsceneScreen({ id, next }: { id: string; next: Route }) {
  const cutscene = useMemo(() => getCutscene(id), [id]);
  return (
    <main className="screen" style={{ background: 'var(--black)' }}>
      <CutscenePlayer
        key={id}
        cutscene={cutscene}
        onFinish={(r) => {
          if (r.battle) game.navigate({ name: 'battle', villain: r.battle });
          else game.navigate(next);
        }}
      />
    </main>
  );
}
