import { useEffect, useMemo, useRef, useState } from 'react';
import { getImage, preloadImages, getCharacter, assetUrl, heroSpriteId } from '../assets/sprites';
import { drawCharacter, drawHero } from '../engine/draw';
import { PixelStage } from '../engine/PixelStage';
import { DialogBox } from '../ui/DialogBox';
import { PixelMenu } from '../ui/PixelMenu';
import { isCancel, isConfirm, typingInField, useKeys } from '../ui/hooks';
import { MAP_H, MAP_ROWS, MAP_W, NPCS, SPAWN, TILE, TILE_INDEX, findPath, isBlocked, propAt, tileAt, type PropId } from '../village/map';
import { chatLines, npcTalk, propTalk, randomTip, TUTORIAL_LINES, type Talk, type TalkAction } from '../village/npcTalk';
import { SPEAKERS, type NpcId } from '../data/characters';
import { todayKey } from '../data/challenges';
import { game, useGame, equippedTitle, playerLevel } from '../state/store';
import { grant } from '../state/rewards';
import { audio } from '../audio/AudioManager';
import { getBackend, syncProfile, TAB_LABEL } from '../../services/backend';
import tileset from '../assets/tileset.json';
import './village.css';

const STEP_MS = 170;
// Câmera mais aberta que a das batalhas: mostra mais da vila e deixa os personagens menores na tela.
const VW = 448;
const VH = 252;
const COLS = tileset.columns;

type Dir = 'up' | 'down' | 'left' | 'right';
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

interface Player {
  x: number;
  y: number;
  /** Interpolação entre tiles. */
  fromX: number;
  fromY: number;
  t0: number;
  moving: boolean;
  facing: Dir;
  flip: boolean;
  path: { x: number; y: number }[];
  /** Interagir ao terminar o caminho (clique num NPC). */
  pendingTalk: { x: number; y: number } | null;
  walkStart: number;
}

let staticLayer: HTMLCanvasElement | null = null;

function buildStaticLayer(): HTMLCanvasElement | null {
  const img = getImage(tileset.image);
  if (!img) return null;
  const c = document.createElement('canvas');
  c.width = MAP_W * TILE;
  c.height = MAP_H * TILE;
  const ctx = c.getContext('2d')!;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const name = tileAt(x, y).tile;
      if (name === 'water') continue;
      const i = TILE_INDEX[name];
      ctx.drawImage(img, (i % COLS) * TILE, Math.floor(i / COLS) * TILE, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
    }
  }
  return c;
}

export function VillageScreen() {
  const save = useGame((s) => s.save);
  const [talk, setTalk] = useState<{ talk: Talk; idx: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const held = useRef<Dir[]>([]);
  const busy = talk !== null || menuOpen;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const player = useRef<Player>({
    x: save?.village.x ?? SPAWN.x,
    y: save?.village.y ?? SPAWN.y,
    fromX: save?.village.x ?? SPAWN.x,
    fromY: save?.village.y ?? SPAWN.y,
    t0: 0,
    moving: false,
    facing: 'down',
    flip: save?.village.facing === 'left',
    path: [],
    pendingTalk: null,
    walkStart: 0,
  });

  const npcBlockers = useMemo(() => NPCS.map((n) => ({ x: n.x, y: n.y })), []);

  // Garante que o herói não começa dentro de algo sólido.
  useEffect(() => {
    const p = player.current;
    if (isBlocked(p.x, p.y, npcBlockers)) Object.assign(p, { x: SPAWN.x, y: SPAWN.y, fromX: SPAWN.x, fromY: SPAWN.y });
  }, [npcBlockers]);

  useEffect(() => {
    const hero = save ? heroSpriteId(save.player.gender, save.player.heroClass) : 'hero_alchemist_m';
    void preloadImages([tileset.image, getCharacter(hero).image, ...NPCS.map((n) => getCharacter(n.id).image), 'assets/cosmetics/hat_mage.png']).then(() => {
      staticLayer = buildStaticLayer();
    });
    if (!staticLayer) staticLayer = buildStaticLayer();
    void syncProfile(save, equippedTitle(save));
    audio.playMusic('village');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva a posição na vila ao sair.
  useEffect(
    () => () => {
      const p = player.current;
      if (game.get().save) game.update((d) => void (d.village = { x: p.x, y: p.y, facing: p.flip ? 'left' : 'right' }));
    },
    [],
  );

  const today = todayKey();

  const facingTarget = (): { x: number; y: number } => {
    const p = player.current;
    const [dx, dy] = DELTA[p.facing];
    return { x: p.x + dx, y: p.y + dy };
  };

  const startTalkAt = (tx: number, ty: number): boolean => {
    if (!save) return false;
    const npc = NPCS.find((n) => n.x === tx && n.y === ty);
    if (npc) {
      audio.play('confirm');
      setTalk({ talk: npcTalk(npc.id, save, today), idx: 0 });
      if (npc.id === 'orwin' && !save.flags.met_orwin) game.update((d) => void (d.flags.met_orwin = true));
      return true;
    }
    const prop = propAt(tx, ty);
    if (prop) {
      audio.play('confirm');
      setTalk({ talk: propTalk(prop), idx: 0 });
      return true;
    }
    return false;
  };

  const interact = () => {
    const t = facingTarget();
    // o portão ocupa duas linhas; olhar para cima a partir do caminho abaixo dele também conta
    if (!startTalkAt(t.x, t.y)) {
      const p = player.current;
      if (propAt(p.x, p.y - 1) === 'gate') startTalkAt(p.x, p.y - 1);
    }
  };

  const tryStep = (dir: Dir, now: number) => {
    const p = player.current;
    p.facing = dir;
    if (dir === 'left') p.flip = true;
    if (dir === 'right') p.flip = false;
    const [dx, dy] = DELTA[dir];
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (isBlocked(nx, ny, npcBlockers)) return false;
    if (!p.moving) p.walkStart = now;
    p.fromX = p.x;
    p.fromY = p.y;
    p.x = nx;
    p.y = ny;
    p.t0 = now;
    p.moving = true;
    if (Math.random() < 0.5) audio.play('step');
    return true;
  };

  const handleAction = async (action: TalkAction, npc: NpcId | null) => {
    const s = game.get().save;
    if (!s) return;
    switch (action) {
      case 'close':
        setTalk(null);
        return;
      case 'training':
        game.navigate({ name: 'training', back: { name: 'village' } });
        return;
      case 'tutorial':
        setTalk({ talk: { speaker: 'orwin', lines: TUTORIAL_LINES, choices: [] }, idx: 0 });
        return;
      case 'tip':
        setTalk({ talk: { speaker: 'orwin', lines: [randomTip()], choices: [] }, idx: 0 });
        return;
      case 'shop':
        game.navigate({ name: 'shop' });
        return;
      case 'scroll':
        game.navigate({ name: 'scroll', back: { name: 'village' } });
        return;
      case 'profile':
        game.navigate({ name: 'profile', back: { name: 'village' } });
        return;
      case 'cosmetics':
        game.navigate({ name: 'cosmetics', back: { name: 'village' } });
        return;
      case 'missions':
        game.navigate({ name: 'missions', back: { name: 'village' } });
        return;
      case 'daily':
        game.navigate({ name: 'daily' });
        return;
      case 'lightning':
        game.navigate({ name: 'lightning' });
        return;
      case 'bossSelect':
        game.navigate({ name: 'bossSelect' });
        return;
      case 'journey':
        audio.play('success');
        game.navigate({ name: 'journey' });
        return;
      case 'save':
        game.update((d) => void (d.village = { x: player.current.x, y: player.current.y, facing: player.current.flip ? 'left' : 'right' }));
        game.saveNow();
        void syncProfile(game.get().save, equippedTitle(game.get().save));
        audio.play('success');
        setTalk({ talk: { speaker: 'isolde', lines: ['Prontinho! Anotei tudo no livro da estalagem. Seu progresso está salvo.'], choices: [] }, idx: 0 });
        return;
      case 'welcome':
        game.update((d) => void (d.daily.lastWelcomeBonus = today));
        grant(10, 25, 'Bônus do dia');
        setTalk({ talk: { speaker: 'isolde', lines: ['Aqui está: 25 moedas e um pão quentinho. Volte amanhã que tem mais!'], choices: [] }, idx: 0 });
        return;
      case 'duel':
        setTalk({
          talk: {
            speaker: 'torvan',
            lines: [
              'Duelos 1x1 contra outros heróis de verdade! Os dois recebem o mesmo desafio e vence quem resolver primeiro.',
              'Ainda estou construindo as arquibancadas. Em breve! Enquanto isso, treine no Relâmpago.',
            ],
            choices: [],
          },
          idx: 0,
        });
        return;
      case 'chat': {
        let rankText: string | null = null;
        if (npc === 'maren') {
          try {
            const b = await getBackend();
            await syncProfile(s, equippedTitle(s));
            const rank = await b.getPlayerRank('xp');
            if (rank) rankText = `Deixa eu ver... ${s.player.name}, nível ${playerLevel(s)}. Você está em ${rank}º lugar no ${TAB_LABEL.xp}${b.online ? '' : ' (ranking local; o ranking online chega em breve)'}.`;
          } catch {
            rankText = null;
          }
        }
        setTalk({ talk: { speaker: npc, lines: chatLines(npc ?? 'garrick', rankText), choices: [] }, idx: 0 });
        return;
      }
    }
  };

  useKeys((e, type) => {
    if (typingInField(e)) return;
    const dir = KEY_DIR[e.key];
    if (type === 'up') {
      if (dir) held.current = held.current.filter((d) => d !== dir);
      return;
    }
    if (busyRef.current) return;
    if (dir) {
      e.preventDefault();
      if (!held.current.includes(dir)) held.current.push(dir);
      player.current.path = [];
      return;
    }
    if (isConfirm(e) && !e.repeat) {
      e.preventDefault();
      interact();
    } else if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      audio.play('confirm');
      setMenuOpen(true);
    }
  });

  // Solta as teclas presas quando uma conversa abre.
  useEffect(() => {
    if (busy) held.current = [];
  }, [busy]);

  const lastHint = useRef<string | null>(null);

  const render = (ctx: CanvasRenderingContext2D, now: number) => {
    const p = player.current;
    // ---- movimento ----
    if (p.moving && now - p.t0 >= STEP_MS) {
      p.moving = false;
      p.fromX = p.x;
      p.fromY = p.y;
    }
    if (!p.moving && !busyRef.current) {
      const dir = held.current[held.current.length - 1];
      if (dir) tryStep(dir, now);
      else if (p.path.length) {
        const next = p.path[0];
        const d: Dir = next.x > p.x ? 'right' : next.x < p.x ? 'left' : next.y > p.y ? 'down' : 'up';
        if (tryStep(d, now)) p.path.shift();
        else p.path = [];
      } else if (p.pendingTalk) {
        const t = p.pendingTalk;
        p.pendingTalk = null;
        p.facing = t.x > p.x ? 'right' : t.x < p.x ? 'left' : t.y > p.y ? 'down' : 'up';
        if (t.x !== p.x) p.flip = t.x < p.x;
        startTalkAt(t.x, t.y);
      }
    }
    const k = p.moving ? Math.min(1, (now - p.t0) / STEP_MS) : 1;
    const px = (p.fromX + (p.x - p.fromX) * k) * TILE + TILE / 2;
    const py = (p.fromY + (p.y - p.fromY) * k) * TILE + TILE - 2;

    // ---- câmera ----
    const camX = Math.round(Math.max(0, Math.min(MAP_W * TILE - VW, px - VW / 2)));
    const camY = Math.round(Math.max(0, Math.min(MAP_H * TILE - VH, py - 24 - VH / 2)));

    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, VW, VH);
    staticLayer ??= buildStaticLayer();
    const tiles = getImage(tileset.image);
    if (tiles) {
      // água animada
      const wi = TILE_INDEX[Math.floor(now / 500) % 2 ? 'water2' : 'water'];
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (MAP_ROWS[y][x] !== '~') continue;
          ctx.drawImage(tiles, (wi % COLS) * TILE, Math.floor(wi / COLS) * TILE, TILE, TILE, x * TILE - camX, y * TILE - camY, TILE, TILE);
        }
      }
    }
    if (staticLayer) ctx.drawImage(staticLayer, -camX, -camY);

    // brilho verde do portão
    const glow = 0.25 + 0.2 * Math.sin(now / 400);
    ctx.fillStyle = `rgba(155,255,26,${glow})`;
    ctx.fillRect(10 * TILE - camX + 10, 1 * TILE - camY + 2, TILE * 2 - 20, TILE - 4);

    // ---- personagens ordenados por profundidade ----
    const actors: { y: number; draw: () => void }[] = NPCS.map((n) => ({
      y: n.y,
      draw: () => {
        const talking = talk?.talk.speaker === n.id;
        drawCharacter(ctx, n.id, talking ? 'talk' : 'idle', now + n.x * 137, n.x * TILE + TILE / 2 - camX, n.y * TILE + TILE - 2 - camY, { flip: n.flip });
      },
    }));
    if (save) {
      actors.push({
        y: p.fromY + (p.y - p.fromY) * k,
        draw: () =>
          drawHero(
            ctx,
            { gender: save.player.gender, heroClass: save.player.heroClass, hat: save.cosmetics.equipped.hat, aura: save.cosmetics.equipped.aura },
            p.moving || p.path.length ? 'walk' : 'idle',
            p.moving || p.path.length ? now - p.walkStart : now,
            Math.round(px - camX),
            Math.round(py - camY),
            { flip: p.flip },
          ),
      });
    }
    actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());

    // dica de interação
    let h: string | null = null;
    if (!busyRef.current && !p.moving) {
      const t = facingTarget();
      const npc = NPCS.find((n) => n.x === t.x && n.y === t.y);
      const prop: PropId | null = propAt(t.x, t.y) ?? (propAt(p.x, p.y - 1) === 'gate' && p.facing === 'up' ? 'gate' : null);
      if (npc) h = `Falar com ${SPEAKERS[npc.id].name}`;
      else if (prop === 'gate') h = 'Examinar o Portão do Reino';
      else if (prop === 'sign') h = 'Ler o quadro';
      else if (prop === 'well') h = 'Olhar o poço';
    }
    if (h !== lastHint.current) {
      lastHint.current = h;
      queueMicrotask(() => setHint(h));
    }
  };

  const onStageClick = (vx: number, vy: number) => {
    if (busyRef.current) return;
    audio.unlock();
    const p = player.current;
    const px = p.x * TILE + TILE / 2;
    const py = p.y * TILE + TILE - 2;
    const camX = Math.max(0, Math.min(MAP_W * TILE - VW, px - VW / 2));
    const camY = Math.max(0, Math.min(MAP_H * TILE - VH, py - 24 - VH / 2));
    const wx = vx + camX;
    const wy = vy + camY;
    // clique num NPC (área do corpo, acima do tile)
    const npc = NPCS.find((n) => wx >= n.x * TILE && wx < (n.x + 1) * TILE && wy >= n.y * TILE - 28 && wy < (n.y + 1) * TILE);
    const tx = npc ? npc.x : Math.floor(wx / TILE);
    const ty = npc ? npc.y : Math.floor(wy / TILE);
    const target = npc || propAt(tx, ty) ? { x: tx, y: ty } : null;
    if (target) {
      if (Math.abs(target.x - p.x) + Math.abs(target.y - p.y) === 1) {
        p.facing = target.x > p.x ? 'right' : target.x < p.x ? 'left' : target.y > p.y ? 'down' : 'up';
        if (target.x !== p.x) p.flip = target.x < p.x;
        startTalkAt(target.x, target.y);
        return;
      }
      // anda até o tile livre mais próximo ao lado do alvo
      const options = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const)
        .map(([dx, dy]) => ({ x: target.x + dx, y: target.y + dy }))
        .filter((c) => !isBlocked(c.x, c.y, npcBlockers))
        .map((c) => findPath({ x: p.x, y: p.y }, c, npcBlockers))
        .filter((path): path is { x: number; y: number }[] => !!path)
        .sort((a, b) => a.length - b.length);
      if (options[0]) {
        p.path = options[0];
        p.pendingTalk = target;
      }
      return;
    }
    const path = findPath({ x: p.x, y: p.y }, { x: tx, y: ty }, npcBlockers);
    if (path) {
      p.path = path;
      p.pendingTalk = null;
    }
  };

  if (!save) {
    return (
      <main className="screen center">
        <div className="frame-panel col" style={{ alignItems: 'center' }}>
          <p>Nenhuma jornada salva.</p>
          <button className="btn primary" onClick={() => game.navigate({ name: 'title' })} autoFocus>Voltar ao título</button>
        </div>
      </main>
    );
  }

  const current = talk ? talk.talk : null;
  const line = current && talk ? current.lines[talk.idx] : null;
  const isLast = !!current && !!talk && talk.idx >= current.lines.length - 1;
  const speaker = current?.speaker ?? null;
  const title = equippedTitle(save);

  const pressDir = (dir: Dir, down: boolean) => {
    if (down) {
      if (!held.current.includes(dir)) held.current.push(dir);
      player.current.path = [];
    } else held.current = held.current.filter((d) => d !== dir);
  };

  return (
    <main className="screen village" style={{ background: 'var(--black)' }}>
      <PixelStage render={render} onPointerDown={onStageClick} width={VW} height={VH} fractional>
        <div className="village-hud">
          <span className="village-name">{save.player.name}</span>
          <span>Nv {playerLevel(save)}</span>
          <span className="village-coins">
            <img src={assetUrl('assets/icons/coin.png')} alt="Moedas" className="px" /> {save.stats.coins}
          </span>
          {title ? <span className="village-title">« {title} »</span> : null}
        </div>
        <button className="village-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu (Esc)">
          ☰ Menu
        </button>
        {hint && !busy ? <div className="village-hint">Enter: {hint}</div> : null}
        {line ? (
          <DialogBox
            key={`${talk!.idx}-${line}`}
            speaker={speaker ? SPEAKERS[speaker].name : null}
            portrait={speaker ? `assets/portraits/${speaker}.png` : null}
            text={line}
            choices={isLast && current!.choices.length ? current!.choices.map((c) => ({ label: c.label })) : undefined}
            onDone={() => {
              if (!isLast) setTalk({ talk: current!, idx: talk!.idx + 1 });
              else setTalk(null);
            }}
            onChoose={(i) => void handleAction(current!.choices[i].action, speaker as NpcId | null)}
          />
        ) : null}
        {menuOpen ? <GameMenu onClose={() => setMenuOpen(false)} playerPos={player.current} /> : null}
      </PixelStage>
      <div className="dpad" aria-label="Controles de toque">
        {(['up', 'left', 'right', 'down'] as Dir[]).map((d) => (
          <button
            key={d}
            className={`dpad-btn dpad-${d}`}
            aria-label={{ up: 'Cima', down: 'Baixo', left: 'Esquerda', right: 'Direita' }[d]}
            onPointerDown={(e) => {
              e.preventDefault();
              pressDir(d, true);
            }}
            onPointerUp={() => pressDir(d, false)}
            onPointerLeave={() => pressDir(d, false)}
            onPointerCancel={() => pressDir(d, false)}
          >
            {{ up: '▲', down: '▼', left: '◀', right: '▶' }[d]}
          </button>
        ))}
        <button className="dpad-a" aria-label="Interagir" onClick={() => !busy && interact()}>
          A
        </button>
      </div>
    </main>
  );
}

function GameMenu({ onClose, playerPos }: { onClose: () => void; playerPos: { x: number; y: number; flip: boolean } }) {
  const back = { name: 'village' } as const;
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace') {
      e.preventDefault();
      audio.play('cancel');
      onClose();
    }
  });
  return (
    <div className="game-menu frame-panel thin" role="dialog" aria-label="Menu">
      <PixelMenu
        ariaLabel="Menu do jogo"
        items={[
          { label: 'Perfil', onSelect: () => game.navigate({ name: 'profile', back }) },
          { label: 'Cosméticos', onSelect: () => game.navigate({ name: 'cosmetics', back }) },
          { label: 'Missões', onSelect: () => game.navigate({ name: 'missions', back }) },
          { label: 'Treino', onSelect: () => game.navigate({ name: 'training', back }) },
          { label: 'Pergaminho', onSelect: () => game.navigate({ name: 'scroll', back }) },
          { label: 'Opções', onSelect: () => game.navigate({ name: 'options', back }) },
          {
            label: 'Salvar',
            onSelect: () => {
              game.update((d) => void (d.village = { x: playerPos.x, y: playerPos.y, facing: playerPos.flip ? 'left' : 'right' }));
              game.saveNow();
              void syncProfile(game.get().save, equippedTitle(game.get().save));
              game.toast('Jogo salvo.');
              onClose();
            },
          },
          {
            label: 'Voltar ao título',
            onSelect: () => {
              game.saveNow();
              game.navigate({ name: 'title' });
            },
          },
          { label: 'Fechar', onSelect: onClose },
        ]}
      />
    </div>
  );
}
