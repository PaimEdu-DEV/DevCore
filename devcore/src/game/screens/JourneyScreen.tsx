import { useEffect, useMemo, useRef, useState } from 'react';
import { PixelStage } from '../engine/PixelStage';
import { drawCharacter, drawHero } from '../engine/draw';
import { Effects } from '../engine/effects';
import { drawPixelText } from '../engine/pixelFont';
import { DialogBox } from '../ui/DialogBox';
import { typingInField, useKeys, isConfirm } from '../ui/hooks';
import { preloadImages, getCharacter, heroSpriteId } from '../assets/sprites';
import { minionsFor } from '../data/challenges';
import { villainInfo } from '../data/characters';
import { AREAS, AREA_W, BOSS_X, MINION_X, START_X } from '../journey/areas';
import { GROUND_Y, PALETTES, drawBug, drawLayer, getScenery } from '../journey/scenery';
import { game, useGame, reducedMotion } from '../state/store';
import { languageOf } from '../state/save';
import { grant } from '../state/rewards';
import { audio } from '../audio/AudioManager';
import { QuickFight } from '../../ide/QuickFight';
import './journey.css';

// Câmera aberta: personagens pequenos e muito cenário na tela.
const VW = 448;
const VH = 252;
const SPEED = 0.09; // px por ms
const STOP_GAP = 34; // distância em que o herói para diante de um bug
const BOSS_GAP = 64; // e diante do chefe (que é maior)

const LANG_FX = {
  python: { image: 'assets/fx/magic_python.png', colors: ['#2EC4B6', '#E8B84A', '#9AF0E8', '#FFE08A'] },
  javascript: { image: 'assets/fx/magic_js.png', colors: ['#FFB000', '#FFE08A', '#FFFFFF', '#C27A00'] },
};

type Mode = 'walk' | 'fight' | 'boss' | 'done';

export function JourneyScreen() {
  const save = useGame((s) => s.save);
  const areaIdx = Math.min(save?.journey.area ?? 0, AREAS.length);
  const finished = areaIdx >= AREAS.length;
  const area = AREAS[Math.min(areaIdx, AREAS.length - 1)];
  const minions = useMemo(() => minionsFor(area.villain), [area.villain]);
  const language = save ? languageOf(save.player.heroClass) : 'python';
  const rm = reducedMotion();
  const palette = PALETTES[area.theme];

  const [mode, setMode] = useState<Mode>(finished ? 'done' : 'walk');
  const [fightIdx, setFightIdx] = useState<number | null>(null);
  const [intro, setIntro] = useState<string | null>(finished ? null : area.intro);
  const [, rerender] = useState(0);

  const beaten = save?.journey.beaten ?? [];
  const alive = (i: number) => !beaten.includes(minions[i]?.id);

  const hero = useRef({ x: START_X, flip: false, moving: false, walkStart: 0, targetX: null as number | null, anim: 'idle', animT0: 0 });
  const held = useRef<('left' | 'right')[]>([]);
  const dying = useRef<Record<number, number>>({});
  const bugHurt = useRef<Record<number, number>>({});
  const fx = useMemo(() => {
    const e = new Effects();
    e.density = rm ? 0.35 : 1;
    return e;
  }, [rm]);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const introRef = useRef(intro);
  introRef.current = intro;

  useEffect(() => {
    if (!save) return;
    const heroId = heroSpriteId(save.player.gender, save.player.heroClass);
    void preloadImages([getCharacter(heroId).image, ...AREAS.map((a) => getCharacter(a.villain).image), LANG_FX[language].image, 'assets/fx/impact.png', 'assets/cosmetics/hat_mage.png', 'assets/portraits/orwin.png']);
    audio.playMusic('journey');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao trocar de área (volta da batalha), recomeça do início do caminho.
  useEffect(() => {
    hero.current.x = START_X;
    hero.current.targetX = null;
  }, [areaIdx]);

  const blockX = (): { x: number; kind: 'minion' | 'boss'; idx: number } => {
    for (let i = 0; i < MINION_X.length; i++) if (alive(i) && minions[i]) return { x: MINION_X[i], kind: 'minion', idx: i };
    return { x: BOSS_X, kind: 'boss', idx: -1 };
  };

  const startFight = (idx: number) => {
    if (modeRef.current !== 'walk') return;
    modeRef.current = 'fight';
    held.current = [];
    hero.current.targetX = null;
    setFightIdx(idx);
    setMode('fight');
    audio.play('confirm');
  };

  const onWin = async (idx: number) => {
    const h = hero.current;
    const bx = MINION_X[idx];
    h.anim = 'attack';
    h.animT0 = performance.now();
    audio.play('select');
    await fx.shoot(h.x + 10, GROUND_Y - 24, bx, GROUND_Y - 12, LANG_FX[language].image, LANG_FX[language].colors, rm ? 200 : 380);
    fx.playSprite('assets/fx/impact.png', bx, GROUND_Y - 12);
    fx.burst(bx, GROUND_Y - 12, [...palette.bug, '#9BFF1A'], 30, 70);
    fx.float(bx, GROUND_Y - 34, 'CORRIGIDO!', '#9BFF1A', true);
    audio.play('hit');
    dying.current[idx] = performance.now();
    const ch = minions[idx];
    grant(ch.xp, ch.coins, ch.title, (d) => {
      if (!d.journey.beaten.includes(ch.id)) d.journey.beaten.push(ch.id);
    });
    await new Promise((r) => setTimeout(r, rm ? 400 : 900));
    h.anim = 'idle';
    setFightIdx(null);
    setMode('walk');
  };

  const onMiss = (idx: number) => {
    bugHurt.current[idx] = performance.now();
    const h = hero.current;
    h.anim = 'hurt';
    h.animT0 = performance.now();
    fx.burst(h.x, GROUND_Y - 20, ['#9BFF1A', palette.bug[0]], 10, 40);
    audio.play('error');
    window.setTimeout(() => (hero.current.anim = 'idle'), 500);
  };

  const goBoss = () => {
    audio.play('confirm');
    game.navigate({ name: 'battle', villain: area.villain });
  };

  useKeys((e, type) => {
    if (typingInField(e)) return;
    const dir = e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ? 'left' : e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ? 'right' : null;
    if (type === 'up') {
      if (dir) held.current = held.current.filter((d) => d !== dir);
      return;
    }
    if (introRef.current) return;
    if (dir && modeRef.current === 'walk') {
      e.preventDefault();
      if (!held.current.includes(dir)) held.current.push(dir);
      hero.current.targetX = null;
    } else if (isConfirm(e) && modeRef.current === 'boss') {
      e.preventDefault();
      goBoss();
    } else if (e.key === 'Escape' && modeRef.current !== 'fight') {
      game.navigate({ name: 'village' });
    }
  });

  if (!save) return null;
  const look = { gender: save.player.gender, heroClass: save.player.heroClass, hat: save.cosmetics.equipped.hat, aura: save.cosmetics.equipped.aura };
  const villain = villainInfo(area.villain);

  const render = (ctx: CanvasRenderingContext2D, now: number, dt: number) => {
    fx.update(dt, now);
    const h = hero.current;
    // ---- movimento ----
    if (modeRef.current === 'walk' && !introRef.current) {
      const dir = held.current[held.current.length - 1];
      let vx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
      if (!dir && h.targetX !== null) {
        const d = h.targetX - h.x;
        if (Math.abs(d) < 2) h.targetX = null;
        else vx = Math.sign(d);
      }
      if (vx) {
        if (!h.moving) h.walkStart = now;
        h.moving = true;
        h.flip = vx < 0;
        const block = blockX();
        const gap = block.kind === 'boss' ? BOSS_GAP : STOP_GAP;
        h.x = Math.max(16, Math.min(block.x - gap, h.x + vx * SPEED * dt));
        if (Math.random() < dt / 300) audio.play('step');
        if (h.x >= block.x - gap - 0.5 && vx > 0) {
          h.moving = false;
          held.current = [];
          h.targetX = null;
          if (block.kind === 'minion') queueMicrotask(() => startFight(block.idx));
          else {
            modeRef.current = 'boss';
            queueMicrotask(() => setMode('boss'));
          }
        }
      } else h.moving = false;
    } else h.moving = false;

    const camX = Math.round(Math.max(0, Math.min(AREA_W - VW, h.x - VW * 0.35)));
    const sc = getScenery(area.theme);
    drawLayer(ctx, sc.sky, camX, 0.05, VW);
    drawLayer(ctx, sc.far, camX, 0.2, VW);
    drawLayer(ctx, sc.mid, camX, 0.5, VW);
    drawLayer(ctx, sc.ground, camX, 1, VW);

    // placa no começo e marcadores
    signpost(ctx, START_X - 30 - camX, GROUND_Y - 8, palette.dirtDark, palette.pathLight);

    // capangas
    minions.forEach((_, i) => {
      const x = MINION_X[i] - camX;
      if (x < -40 || x > VW + 40) return;
      const died = dying.current[i];
      if (!alive(i) && !died) return;
      const t = died ? Math.min(1, (now - died) / 700) : 0;
      if (t >= 1) return;
      const hurt = bugHurt.current[i] && now - bugHurt.current[i] < 300;
      drawBug(ctx, x + (hurt ? Math.round(Math.sin(now / 20) * 2) : 0), GROUND_Y + 2 - Math.round(t * 10), now + i * 333, palette.bug, h.x < MINION_X[i] ? -1 : 1, t);
      if (!died) drawPixelText(ctx, 'BUG', x, GROUND_Y - 30 + Math.round(Math.sin(now / 300) * 1), '#F3E9D2', { outline: '#0A0A0F', align: 'center' });
    });

    // chefe
    const bx = BOSS_X - camX;
    if (bx < VW + 80) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(bx - 24, GROUND_Y, 48, 3);
      drawCharacter(ctx, area.villain, 'idle', now, bx, GROUND_Y + 2, { flip: true, scale: area.villain === 'entity' ? 0.6 : 0.75 });
      if (Math.random() < 0.25) fx.drift(bx, GROUND_Y - 4, 30, ['#9BFF1A', '#2F6B00'], 1);
    }

    // herói
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(Math.round(h.x - camX) - 10, GROUND_Y, 20, 3);
    const anim = h.anim !== 'idle' ? h.anim : h.moving ? 'walk' : 'idle';
    drawHero(ctx, look, anim, anim === 'walk' ? now - h.walkStart : h.anim !== 'idle' ? now - h.animT0 : now, Math.round(h.x - camX), GROUND_Y + 2, { flip: h.flip });

    ctx.save();
    ctx.translate(-camX, 0);
    fx.draw(ctx, now);
    ctx.restore();
    drawLayer(ctx, sc.front, camX, 1.25, VW);

    if (area.theme === 'core' || area.theme === 'crystal') {
      // vinheta escura nas bordas
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, VW, 6);
      ctx.fillRect(0, VH - 6, VW, 6);
    }
  };

  const onStageClick = (vx: number) => {
    if (mode !== 'walk' || intro) return;
    audio.unlock();
    const camX = Math.max(0, Math.min(AREA_W - VW, hero.current.x - VW * 0.35));
    hero.current.targetX = vx + camX;
    held.current = [];
  };

  const press = (dir: 'left' | 'right', down: boolean) => {
    if (down) {
      if (mode !== 'walk' || intro) return;
      if (!held.current.includes(dir)) held.current.push(dir);
      hero.current.targetX = null;
    } else held.current = held.current.filter((d) => d !== dir);
  };

  const restart = () => {
    game.update((d) => void (d.journey = { area: 0, beaten: [] }));
    setMode('walk');
    setIntro(AREAS[0].intro);
    rerender((x) => x + 1);
  };

  const fight = fightIdx !== null ? minions[fightIdx] : null;
  const steps = [...minions.map((m, i) => ({ id: m.id, done: !alive(i), label: 'Bug' })), { id: 'boss', done: false, label: villain.name }];

  return (
    <main className={`screen journey ${mode === 'fight' ? 'is-fighting' : ''}`}>
      <div className="journey-stage">
        <PixelStage render={render} onPointerDown={onStageClick} width={VW} height={VH} fractional>
          <div className="journey-hud">
            <span className="journey-area">
              Área {Math.min(areaIdx + 1, AREAS.length)}/{AREAS.length} · {finished ? 'Core salvo!' : area.name}
            </span>
            {!finished ? (
              <span className="journey-steps" aria-label="Progresso da área">
                {steps.map((s) => (
                  <span key={s.id} className={`journey-step ${s.done ? 'done' : ''}`} title={s.label}>
                    {s.done ? '✓' : s.id === 'boss' ? '☠' : '•'}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
          <button className="journey-exit" onClick={() => game.navigate({ name: 'village' })} aria-label="Voltar à vila">
            ⌂ Vila
          </button>
          {intro ? (
            <DialogBox speaker="Orwin" portrait="assets/portraits/orwin.png" text={intro} onDone={() => setIntro(null)} />
          ) : null}
          {mode === 'boss' && !intro ? (
            <div className="journey-boss frame-panel thin" role="dialog" aria-label={`${villain.name} bloqueia o caminho`}>
              <p>
                <strong>{villain.name}</strong> bloqueia o caminho!
              </p>
              <button className="btn primary" onClick={goBoss} autoFocus>
                ⚔ Lutar
              </button>
            </div>
          ) : null}
          {mode === 'done' ? (
            <div className="journey-boss frame-panel thin" role="dialog" aria-label="Jornada concluída">
              <p>
                <strong>Você salvou o Core!</strong> Os quatro inimigos foram derrotados.
              </p>
              <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                <button className="btn primary" onClick={restart} autoFocus>
                  Jogar de novo
                </button>
                <button className="btn" onClick={() => game.navigate({ name: 'village' })}>
                  Voltar à vila
                </button>
              </div>
            </div>
          ) : null}
        </PixelStage>
      </div>

      {fight && fightIdx !== null ? (
        <aside className="journey-fight">
          <QuickFight key={fight.id} challenge={fight} language={language} onWin={() => void onWin(fightIdx)} onMiss={() => onMiss(fightIdx)} />
        </aside>
      ) : null}

      {mode === 'walk' && !intro ? (
        <div className="journey-pad" aria-label="Controles de toque">
          {(['left', 'right'] as const).map((d) => (
            <button
              key={d}
              className="journey-pad-btn"
              aria-label={d === 'left' ? 'Andar para a esquerda' : 'Andar para a direita'}
              onPointerDown={(e) => {
                e.preventDefault();
                press(d, true);
              }}
              onPointerUp={() => press(d, false)}
              onPointerLeave={() => press(d, false)}
              onPointerCancel={() => press(d, false)}
            >
              {d === 'left' ? '◀' : '▶'}
            </button>
          ))}
        </div>
      ) : null}
    </main>
  );
}

function signpost(ctx: CanvasRenderingContext2D, x: number, y: number, wood: string, light: string) {
  ctx.fillStyle = wood;
  ctx.fillRect(x - 1, y - 18, 3, 20);
  ctx.fillRect(x - 10, y - 20, 22, 9);
  ctx.fillStyle = light;
  ctx.fillRect(x - 9, y - 19, 20, 7);
  ctx.fillStyle = wood;
  ctx.fillRect(x - 6, y - 16, 12, 1);
  ctx.fillRect(x + 7, y - 17, 2, 3);
}
