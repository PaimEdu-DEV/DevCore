import { useEffect, useRef, useState } from 'react';
import { getImage, heroSpriteId, preloadImages, getCharacter } from '../assets/sprites';
import { drawCharacter, drawHero, animDuration, type HeroLook } from '../engine/draw';
import { PixelStage, VW, VH } from '../engine/PixelStage';
import { DialogBox } from '../ui/DialogBox';
import { fillText, isCancel, useKeys } from '../ui/hooks';
import { SPEAKERS, type SpeakerId } from '../data/characters';
import { game, reducedMotion } from '../state/store';
import { audio } from '../audio/AudioManager';
import type { VillainId } from '../state/save';
import type { Cutscene, SceneBackground, Step } from './types';
import './cutscene.css';

export const BACKGROUNDS: Record<Exclude<SceneBackground, 'black'>, string> = {
  title: 'assets/backgrounds/title.png',
  kingdom: 'assets/backgrounds/scene_kingdom.png',
  core: 'assets/backgrounds/scene_core.png',
  archive: 'assets/backgrounds/scene_archive.png',
  village: 'assets/backgrounds/scene_village.png',
  battle_aldric: 'assets/backgrounds/battle_aldric.png',
  battle_veyr: 'assets/backgrounds/battle_veyr.png',
  battle_seraphine: 'assets/backgrounds/battle_seraphine.png',
  battle_entity: 'assets/backgrounds/battle_entity.png',
};

interface SceneSprite {
  character: string;
  x: number;
  y: number;
  anim: string;
  animStart: number;
  flip: boolean;
  alpha: number;
  scale: number;
  move?: { fx: number; fy: number; tx: number; ty: number; start: number; ms: number };
  fade?: { from: number; to: number; start: number; ms: number; remove: boolean };
}

interface Scene {
  bg: SceneBackground;
  sprites: Map<string, SceneSprite>;
  fade: { color: string; from: number; to: number; start: number; ms: number };
  flash: { color: string; start: number; ms: number } | null;
  shake: { start: number; ms: number; intensity: number } | null;
}

interface DialogState {
  speaker: SpeakerId | 'narrator';
  text: string;
  choices?: string[];
}

export interface CutsceneResult {
  battle?: VillainId;
}

interface Props {
  cutscene: Cutscene;
  onFinish: (result: CutsceneResult) => void;
  /** Permite pular a cena com Esc ou botão. */
  skippable?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function heroLook(): HeroLook {
  const s = game.get().save;
  return {
    gender: s?.player.gender ?? 'm',
    heroClass: s?.player.heroClass ?? 'alchemist',
    hat: s?.cosmetics.equipped.hat ?? null,
    aura: s?.cosmetics.equipped.aura ?? null,
  };
}

export function speakerName(id: SpeakerId | 'narrator'): string {
  if (id === 'hero') return game.get().save?.player.name ?? 'Herói';
  return SPEAKERS[id].name;
}

export function speakerPortrait(id: SpeakerId | 'narrator'): string | null {
  if (id === 'hero') {
    const s = game.get().save;
    return s ? getCharacter(heroSpriteId(s.player.gender, s.player.heroClass)).portrait : null;
  }
  const sprite = SPEAKERS[id].sprite;
  return sprite ? `assets/portraits/${sprite}.png` : null;
}

/** Executa um roteiro de cutscene (motor data-driven). */
export function CutscenePlayer({ cutscene, onFinish, skippable = true }: Props) {
  const scene = useRef<Scene>({
    bg: 'black',
    sprites: new Map(),
    fade: { color: '#000', from: 0, to: 0, start: 0, ms: 0 },
    flash: null,
    shake: null,
  });
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolver = useRef<((v: number) => void) | null>(null);
  const skipping = useRef(false);
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const skip = () => {
    if (skipping.current || finished.current) return;
    skipping.current = true;
    audio.play('cancel');
    resolver.current?.(0);
  };

  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && skippable) {
      e.preventDefault();
      skip();
    }
  }, skippable);

  useEffect(() => {
    let cancelled = false;
    const s = scene.current;
    const save = game.get().save;
    const vars = { name: save?.player.name, heroClass: save?.player.heroClass ?? null };
    const rm = reducedMotion();

    // pré-carrega tudo o que a cena usa
    const paths = new Set<string>(['assets/ui/arrow_down.png']);
    for (const st of cutscene.steps) {
      if (st.t === 'background' && st.bg !== 'black') paths.add(BACKGROUNDS[st.bg]);
      if (st.t === 'showSprite') {
        const look = heroLook();
        paths.add(getCharacter(st.character === 'hero' ? heroSpriteId(look.gender, look.heroClass) : st.character).image);
      }
    }
    void preloadImages([...paths]);

    const sleep = (ms: number) =>
      new Promise<void>((res) => {
        if (skipping.current || ms <= 0) return res();
        const id = window.setTimeout(() => {
          resolver.current = null;
          res();
        }, ms);
        resolver.current = () => {
          window.clearTimeout(id);
          res();
        };
      });

    const ask = (d: DialogState) =>
      new Promise<number>((res) => {
        if (skipping.current) return res(0);
        resolver.current = (v) => {
          resolver.current = null;
          setDialog(null);
          res(v);
        };
        setDialog(d);
      });

    const labels = new Map<string, number>();
    cutscene.steps.forEach((st, i) => st.t === 'label' && labels.set(st.name, i));

    const exec = async (st: Step): Promise<'battle' | number | void> => {
      const now = performance.now();
      const fast = skipping.current;
      switch (st.t) {
        case 'say':
          if (!fast) await ask({ speaker: st.speaker, text: fillText(st.text, vars) });
          break;
        case 'narrate':
          if (!fast) await ask({ speaker: 'narrator', text: fillText(st.text, vars) });
          break;
        case 'background':
          s.bg = st.bg;
          break;
        case 'showSprite': {
          const fadeMs = fast ? 0 : st.ms ?? 0;
          s.sprites.set(st.id, {
            character: st.character,
            x: st.x,
            y: st.y,
            anim: st.anim ?? 'idle',
            animStart: now,
            flip: st.flip ?? false,
            alpha: fadeMs ? 0 : st.alpha ?? 1,
            scale: st.scale ?? 1,
            fade: fadeMs ? { from: 0, to: st.alpha ?? 1, start: now, ms: fadeMs, remove: false } : undefined,
          });
          if (fadeMs) await sleep(fadeMs);
          break;
        }
        case 'hideSprite': {
          const sp = s.sprites.get(st.id);
          if (!sp) break;
          if (!st.ms || fast) s.sprites.delete(st.id);
          else {
            sp.fade = { from: sp.alpha, to: 0, start: now, ms: st.ms, remove: true };
            await sleep(st.ms);
          }
          break;
        }
        case 'anim': {
          const sp = s.sprites.get(st.id);
          if (!sp) break;
          sp.anim = st.anim;
          sp.animStart = now;
          if (st.wait && !fast) {
            const ch = getCharacter(sp.character === 'hero' ? heroSpriteId(heroLook().gender, heroLook().heroClass) : sp.character);
            const a = ch.animations[st.anim];
            if (a) await sleep(animDuration(a) + 150);
          }
          break;
        }
        case 'move': {
          const sp = s.sprites.get(st.id);
          if (!sp) break;
          if (fast || rm) {
            sp.x = st.x;
            sp.y = st.y;
            break;
          }
          sp.move = { fx: sp.x, fy: sp.y, tx: st.x, ty: st.y, start: now, ms: st.ms };
          if (st.wait) await sleep(st.ms);
          break;
        }
        case 'fade': {
          const color = st.to === 'white' ? '#FFFFFF' : '#000000';
          const current = currentFade(s, now);
          const target = st.to === 'clear' ? 0 : 1;
          s.fade = { color: st.to === 'clear' ? s.fade.color : color, from: current, to: target, start: now, ms: fast ? 0 : st.ms };
          await sleep(st.ms);
          break;
        }
        case 'flash':
          if (!fast) {
            s.flash = { color: st.color ?? '#FFFFFF', start: now, ms: rm ? 120 : st.ms ?? 250 };
            audio.play('hit');
          }
          break;
        case 'shake':
          if (!fast && !rm) s.shake = { start: now, ms: st.ms, intensity: st.intensity ?? 2 };
          break;
        case 'wait':
          await sleep(st.ms);
          break;
        case 'choice': {
          const idx = await ask({ speaker: st.speaker ?? 'narrator', text: fillText(st.text, vars), choices: st.options.map((o) => o.label) });
          const opt = st.options[idx] ?? st.options[0];
          if (opt.setFlag) game.update((d) => void (d.flags[opt.setFlag![0]] = opt.setFlag![1]));
          if (opt.goto) return labels.get(opt.goto);
          break;
        }
        case 'label':
          break;
        case 'goto':
          return labels.get(st.label);
        case 'ifFlag':
          if (game.get().save?.flags[st.flag]) return labels.get(st.goto);
          break;
        case 'setFlag':
          game.update((d) => void (d.flags[st.flag] = st.value));
          break;
        case 'giveItem':
          game.update((d) => {
            if (st.item === 'coins') d.stats.coins += st.amount ?? 0;
            if (st.item === 'xp') d.stats.xp += st.amount ?? 0;
            if (st.item === 'cosmetic' && st.id && !d.cosmetics.owned.includes(st.id)) d.cosmetics.owned.push(st.id);
            if (st.item === 'title' && st.id && !d.titles.includes(st.id)) d.titles.push(st.id);
          });
          if (!st.silent) game.toast(st.item === 'coins' ? `+${st.amount} moedas` : st.item === 'xp' ? `+${st.amount} XP` : 'Novo item!', 'reward');
          break;
        case 'startBattle':
          return 'battle';
      }
    };

    void (async () => {
      let pc = 0;
      let battle: VillainId | undefined;
      while (pc < cutscene.steps.length && !cancelled) {
        const st = cutscene.steps[pc];
        const r = await exec(st);
        if (cancelled) return;
        if (r === 'battle' && st.t === 'startBattle') {
          battle = st.villain;
          break;
        }
        pc = typeof r === 'number' ? r : pc + 1;
      }
      if (cancelled) return;
      finished.current = true;
      onFinishRef.current({ battle });
    })();

    return () => {
      cancelled = true;
      resolver.current?.(0);
    };
  }, [cutscene]);

  const render = (ctx: CanvasRenderingContext2D, now: number) => {
    const s = scene.current;
    let ox = 0;
    let oy = 0;
    if (s.shake) {
      const t = (now - s.shake.start) / s.shake.ms;
      if (t >= 1) s.shake = null;
      else {
        const k = s.shake.intensity * (1 - t);
        ox = Math.round((Math.random() * 2 - 1) * k);
        oy = Math.round((Math.random() * 2 - 1) * k);
      }
    }
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, VW, VH);
    ctx.translate(ox, oy);
    if (s.bg !== 'black') {
      const img = getImage(BACKGROUNDS[s.bg]);
      if (img) ctx.drawImage(img, 0, 0);
    }
    const ordered = [...s.sprites.entries()].sort((a, b) => a[1].y - b[1].y);
    for (const [id, sp] of ordered) {
      if (sp.move) {
        const t = Math.min(1, (now - sp.move.start) / sp.move.ms);
        sp.x = lerp(sp.move.fx, sp.move.tx, ease(t));
        sp.y = lerp(sp.move.fy, sp.move.ty, ease(t));
        if (t >= 1) sp.move = undefined;
      }
      if (sp.fade) {
        const t = sp.fade.ms ? Math.min(1, (now - sp.fade.start) / sp.fade.ms) : 1;
        sp.alpha = lerp(sp.fade.from, sp.fade.to, t);
        if (t >= 1) {
          if (sp.fade.remove) s.sprites.delete(id);
          sp.fade = undefined;
        }
      }
      if (sp.alpha <= 0) continue;
      const walking = !!sp.move && sp.character === 'hero';
      const anim = walking ? 'walk' : sp.anim;
      const opts = { flip: sp.flip, alpha: sp.alpha, scale: sp.scale };
      if (sp.character === 'hero') drawHero(ctx, heroLook(), anim, now - sp.animStart, Math.round(sp.x), Math.round(sp.y), opts);
      else drawCharacter(ctx, sp.character, anim, now - sp.animStart, Math.round(sp.x), Math.round(sp.y), opts);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (s.flash) {
      const t = (now - s.flash.start) / s.flash.ms;
      if (t >= 1) s.flash = null;
      else {
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.fillStyle = s.flash.color;
        ctx.fillRect(0, 0, VW, VH);
        ctx.globalAlpha = 1;
      }
    }
    const fa = currentFade(s, now);
    if (fa > 0) {
      ctx.globalAlpha = fa;
      ctx.fillStyle = s.fade.color;
      ctx.fillRect(0, 0, VW, VH);
      ctx.globalAlpha = 1;
    }
  };

  return (
    <PixelStage render={render}>
      {dialog ? (
        <DialogBox
          key={dialog.text}
          speaker={dialog.speaker === 'narrator' ? null : speakerName(dialog.speaker)}
          portrait={dialog.speaker === 'narrator' ? null : speakerPortrait(dialog.speaker)}
          text={dialog.text}
          choices={dialog.choices?.map((label) => ({ label }))}
          onDone={() => resolver.current?.(0)}
          onChoose={(i) => resolver.current?.(i)}
        />
      ) : null}
      {skippable ? (
        <button className="cutscene-skip" onClick={skip} aria-label="Pular cena (Esc)">
          Pular ▶▶
        </button>
      ) : null}
    </PixelStage>
  );
}

function currentFade(s: Scene, now: number): number {
  const f = s.fade;
  if (!f.ms) return f.to;
  const t = Math.min(1, (now - f.start) / f.ms);
  return lerp(f.from, f.to, t);
}
