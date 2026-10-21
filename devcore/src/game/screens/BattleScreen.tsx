import { useEffect, useMemo, useRef, useState } from 'react';
import { IdePanel } from '../../ide/IdePanel';
import { ChallengeBrief } from '../../ide/ChallengeBrief';
import { PixelStage, VW, VH } from '../engine/PixelStage';
import { drawCharacter, drawHero, animDuration } from '../engine/draw';
import { Effects } from '../engine/effects';
import { drawPixelText } from '../engine/pixelFont';
import { DialogBox } from '../ui/DialogBox';
import { fillText, isConfirm, useKeys } from '../ui/hooks';
import { getImage, preloadImages, getCharacter, heroSpriteId, assetUrl } from '../assets/sprites';
import { bossPhases, localize } from '../data/challenges';
import { villainInfo } from '../data/characters';
import { getCosmetic } from '../data/cosmetics';
import { BATTLE_LINES, pick } from '../battle/lines';
import { mentorFeedback } from '../../runner/errorTranslator';
import { game, useGame, reducedMotion, equippedTitle } from '../state/store';
import { languageOf, type VillainId } from '../state/save';
import { grant, recordRun, spendCoins, awardTitle, HINT_COSTS } from '../state/rewards';
import { EARNED_TITLES, levelFromXp } from '../state/progression';
import { syncProfile } from '../../services/backend';
import { audio } from '../audio/AudioManager';
import { AREAS } from '../journey/areas';
import type { RunResult } from '../../runner';
import './battle.css';

const HERO = { x: 84, y: 138 };
const FOE = { x: 236, y: 138 };
const SLICE = 100;
const HERO_MAX = 100;

type Stage = 'versus' | 'stripes' | 'fight' | 'victory' | 'defeat';

interface Anim {
  name: string;
  t0: number;
}

const LANG_FX = {
  python: { image: 'assets/fx/magic_python.png', colors: ['#2EC4B6', '#E8B84A', '#9AF0E8', '#FFE08A'] },
  javascript: { image: 'assets/fx/magic_js.png', colors: ['#FFB000', '#FFE08A', '#FFFFFF', '#C27A00'] },
};
const LIME = ['#9BFF1A', '#2F6B00', '#E4FFB0'];

export function BattleScreen({ villain }: { villain: VillainId }) {
  const save = useGame((s) => s.save);
  const info = villainInfo(villain);
  const phases = useMemo(() => bossPhases(villain), [villain]);
  const lines = BATTLE_LINES[villain];
  const language = save ? languageOf(save.player.heroClass) : 'python';
  const heroId = save ? heroSpriteId(save.player.gender, save.player.heroClass) : 'hero_alchemist_m';
  const rm = reducedMotion();

  const [stage, setStage] = useState<Stage>('versus');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [heroHp, setHeroHp] = useState(HERO_MAX);
  const [bossHp, setBossHp] = useState(SLICE * phases.length);
  const [locked, setLocked] = useState(false);
  const [narration, setNarration] = useState<{ speaker: string | null; portrait: string | null; text: string }>({ speaker: null, portrait: null, text: lines.phaseIntro[0] });
  const [bubble, setBubble] = useState<string | null>(null);
  const [stance, setStance] = useState<'defesa' | 'ataque'>('defesa');
  const [confirmFlee, setConfirmFlee] = useState(false);
  const [, forceRender] = useState(0);

  const hp = useRef({ hero: HERO_MAX, boss: SLICE * phases.length });
  const phaseStats = useRef({ hints: 0, errors: 0 });
  const totals = useRef({ hints: 0, errors: 0, flawless: 0, counters: 0 });
  const heroAnim = useRef<Anim>({ name: 'idle', t0: 0 });
  const bossAnim = useRef<Anim>({ name: 'idle', t0: 0 });
  const tint = useRef({ hero: 0, boss: 0 });
  const shakeUntil = useRef(0);
  const flash = useRef<{ color: string; t0: number; ms: number } | null>(null);
  const stripesT0 = useRef(0);
  const fx = useMemo(() => {
    const e = new Effects();
    e.density = rm ? 0.35 : 1;
    return e;
  }, [rm]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void preloadImages([
      info.background,
      getCharacter(villain).image,
      getCharacter(heroId).image,
      LANG_FX.python.image,
      LANG_FX.javascript.image,
      'assets/fx/impact.png',
      'assets/fx/corruption.png',
      'assets/fx/heal.png',
      'assets/icons/shield.png',
      'assets/icons/sword.png',
      'assets/cosmetics/hat_mage.png',
    ]);
    game.update((d) => {
      const b = d.bosses[villain] ?? { defeated: false, bestScore: 0, attempts: 0 };
      d.bosses[villain] = { ...b, attempts: b.attempts + 1 };
    });
    const t = window.setTimeout(() => startStripes(), rm ? 900 : 2600);
    return () => {
      mounted.current = false;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, rm ? ms * 0.6 : ms));

  const startStripes = () => {
    setStage((s) => {
      if (s !== 'versus') return s;
      stripesT0.current = performance.now();
      window.setTimeout(() => mounted.current && setStage('fight'), rm ? 250 : 650);
      audio.play('confirm');
      return 'stripes';
    });
  };

  useKeys((e, type) => {
    if (type === 'down' && stage === 'versus' && isConfirm(e)) {
      e.preventDefault();
      startStripes();
    }
  }, stage === 'versus');

  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(null), 2600);
    return () => window.clearTimeout(t);
  }, [bubble]);
  if (!save) return null;
  const challenge = phases[Math.min(phaseIdx, phases.length - 1)];
  const spell = getCosmetic(save.cosmetics.equipped.spell);
  const spellColors = spell && spell.category === 'spell' ? spell.colors : LANG_FX[language].colors;
  const vars = { name: save.player.name, heroClass: save.player.heroClass };

  const setAnim = (who: 'hero' | 'boss', name: string) => {
    (who === 'hero' ? heroAnim : bossAnim).current = { name, t0: performance.now() };
  };

  const shake = (ms: number) => {
    if (!rm) shakeUntil.current = performance.now() + ms;
  };

  const foeY = villain === 'entity' ? FOE.y + 6 : FOE.y;
  const foeChest = { x: FOE.x - 4, y: foeY - (villain === 'entity' ? 64 : 44) };

  const heroAttack = async (dmg: number, crit: boolean) => {
    setAnim('hero', 'attack');
    audio.play('select');
    await sleep(260);
    await fx.shoot(HERO.x + 14, HERO.y - 28, foeChest.x, foeChest.y, LANG_FX[language].image, spellColors, rm ? 250 : 450);
    fx.playSprite('assets/fx/impact.png', foeChest.x, foeChest.y);
    fx.burst(foeChest.x, foeChest.y, spellColors, crit ? 40 : 22, crit ? 90 : 60, { shape: spell?.category === 'spell' && spell.particle === 'star' ? 'star' : 'square' });
    audio.play('hit');
    tint.current.boss = performance.now() + 140;
    setAnim('boss', 'hurt');
    shake(crit ? 380 : 220);
    if (crit) flash.current = { color: '#FFFFFF', t0: performance.now(), ms: rm ? 100 : 220 };
    fx.float(foeChest.x, foeChest.y - 30, crit ? `CRITICO ${dmg}` : `-${dmg}`, crit ? '#FFB000' : '#F3E9D2', crit);
    hp.current.boss = Math.max(0, hp.current.boss - dmg);
    setBossHp(hp.current.boss);
    await sleep(550);
    setAnim('boss', 'idle');
    setAnim('hero', 'idle');
  };

  const bossCounter = async (total: number) => {
    const hits = villain === 'veyr' ? [3, 5, 8][totals.current.counters % 3] : 1;
    totals.current.counters += 1;
    setAnim('boss', 'attack');
    const atk = getCharacter(villain).animations.attack;
    await sleep(Math.min(500, animDuration(atk) * 0.6));
    // Divide o dano total entre os golpes sem perder nem sobrar pontos.
    const base = Math.floor(total / hits);
    const extra = total % hits;
    for (let i = 0; i < hits; i++) {
      const d = base + (i < extra ? 1 : 0);
      fx.burst(HERO.x, HERO.y - 26, LIME, hits > 1 ? 8 : 20, 50);
      fx.float(HERO.x + (hits > 1 ? (i % 3) * 8 - 8 : 0), HERO.y - 50 - (hits > 1 ? (i % 2) * 6 : 0), `-${d}`, '#9BFF1A', hits === 1);
      tint.current.hero = performance.now() + 120;
      setAnim('hero', 'hurt');
      audio.play('damage');
      shake(160);
      hp.current.hero = Math.max(0, hp.current.hero - d);
      setHeroHp(hp.current.hero);
      if (hits > 1) await sleep(140);
    }
    await sleep(450);
    setAnim('boss', 'idle');
    setAnim('hero', 'idle');
  };

  const victory = async () => {
    setStage('victory');
    setAnim('boss', 'defeat');
    fx.burst(foeChest.x, foeChest.y, LIME, 60, 90, { life: 900 });
    audio.play('victory');
    setAnim('hero', 'victory');
    const prev = game.get().save!.bosses[villain];
    const first = !prev?.defeated;
    const mult = first ? 1 : 0.3;
    const xp = phases.reduce((a, c) => a + c.xp, 0) * mult + totals.current.flawless * 25;
    const coins = phases.reduce((a, c) => a + c.coins, 0) * mult;
    const score = Math.max(100, 1000 * phases.length - 120 * totals.current.hints - 60 * totals.current.errors - (HERO_MAX - hp.current.hero) * 2);
    setNarration({ speaker: null, portrait: null, text: `${info.name} foi derrotado! Pontuação: ${score}.` });
    grant(xp, coins, first ? `Vitória sobre ${info.name}` : 'Revanche vencida', (d) => {
      const b = d.bosses[villain] ?? { defeated: false, bestScore: 0, attempts: 1 };
      d.bosses[villain] = { ...b, defeated: true, bestScore: Math.max(b.bestScore, score) };
      if (first) d.stats.bossesDefeated += 1;
    });
    awardTitle(`breaker_${villain}`, EARNED_TITLES[`breaker_${villain}`]);
    void syncProfile(game.get().save, equippedTitle(game.get().save));
    await sleep(2600);
    if (!mounted.current) return;
    // Na Jornada, vencer o chefe da área atual libera a próxima.
    game.update((d) => {
      if (AREAS[d.journey.area]?.villain === villain) d.journey = { area: d.journey.area + 1, beaten: [] };
    });
    const next = villain === 'entity' ? ({ name: 'cutscene', id: 'epilogue', next: { name: 'journey' } } as const) : ({ name: 'journey' } as const);
    game.navigate({ name: 'cutscene', id: `${villain}_defeat`, next });
  };

  const defeat = async () => {
    setStage('defeat');
    setNarration({ speaker: null, portrait: null, text: `${save.player.name} caiu... mas nenhum aprendizado se perde.` });
    game.update((d) => void (d.stats.defeats += 1));
    audio.play('cancel');
    await sleep(2000);
    if (!mounted.current) return;
    game.navigate({ name: 'cutscene', id: 'defeat_consolation', next: { name: 'journey' } });
  };

  const onResult = async (r: RunResult) => {
    if (locked || stage !== 'fight') return;
    setLocked(true);
    recordRun(r.tests.filter((t) => t.ok).length, !!r.error);
    const floor = SLICE * (phases.length - phaseIdx - 1);
    if (r.passed) {
      const flawless = phaseStats.current.hints === 0 && phaseStats.current.errors === 0;
      if (flawless) {
        totals.current.flawless += 1;
        game.update((d) => void (d.stats.flawlessPhases += 1));
      }
      setNarration({ speaker: 'Orwin', portrait: 'assets/portraits/orwin.png', text: fillText(localize(challenge.mentor.success, challenge, language), vars) });
      await heroAttack(hp.current.boss - floor, flawless);
      setBubble(pick(lines.hurt));
      if (phaseIdx >= phases.length - 1) {
        await victory();
        return;
      }
      const nextIdx = phaseIdx + 1;
      phaseStats.current = { hints: 0, errors: 0 };
      setPhaseIdx(nextIdx);
      setNarration({ speaker: null, portrait: null, text: lines.phaseIntro[nextIdx] });
      flash.current = { color: '#9BFF1A', t0: performance.now(), ms: 300 };
      shake(400);
      setLocked(false);
      return;
    }
    phaseStats.current.errors += 1;
    totals.current.errors += 1;
    audio.play('error');
    setNarration({ speaker: 'Orwin', portrait: 'assets/portraits/orwin.png', text: mentorFeedback(r, language) });
    const passRatio = r.tests.length ? r.tests.filter((t) => t.ok).length / r.tests.length : 0;
    // Aldric na defesa reduz o dano parcial; no ataque, bate mais forte.
    const stanceMult = villain === 'aldric' ? (stance === 'defesa' ? 0.5 : 1) : 1;
    const partial = Math.min(hp.current.boss - floor - 1, Math.round(SLICE * 0.4 * passRatio * stanceMult));
    if (partial > 0) await heroAttack(partial, false);
    setBubble(pick(lines.taunt));
    const dmg = 12 + 4 * phaseIdx + (villain === 'entity' ? 4 : 0) + (villain === 'aldric' && stance === 'ataque' ? 4 : 0);
    await bossCounter(dmg);
    if (villain === 'aldric') setStance((s) => (s === 'defesa' ? 'ataque' : 'defesa'));
    if (hp.current.hero <= 0) {
      await defeat();
      return;
    }
    setLocked(false);
  };

  const hint = () => {
    const used = phaseStats.current.hints;
    if (used >= 3) return;
    const cost = HINT_COSTS[used];
    if (!spendCoins(cost)) {
      setNarration({ speaker: 'Orwin', portrait: 'assets/portraits/orwin.png', text: `Uma dica custa ${cost} moedas e você não tem o suficiente. Leia o erro com calma: ele já é uma pista.` });
      audio.play('error');
      return;
    }
    phaseStats.current.hints += 1;
    totals.current.hints += 1;
    game.update((d) => void (d.stats.hintsUsed += 1));
    setNarration({ speaker: 'Orwin', portrait: 'assets/portraits/orwin.png', text: `Dica ${used + 1}/3: ${localize(challenge.hints[used], challenge, language)}` });
    forceRender((x) => x + 1);
  };


  // ---------- canvas ----------
  const look = { gender: save.player.gender, heroClass: save.player.heroClass, hat: save.cosmetics.equipped.hat, aura: save.cosmetics.equipped.aura };
  const render = (ctx: CanvasRenderingContext2D, now: number, dt: number) => {
    fx.update(dt, now);
    const sx = now < shakeUntil.current ? Math.round((Math.random() * 2 - 1) * 3) : 0;
    const sy = now < shakeUntil.current ? Math.round((Math.random() * 2 - 1) * 2) : 0;
    ctx.translate(sx, sy);
    const bg = getImage(info.background);
    if (bg) ctx.drawImage(bg, 0, 0);
    else {
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, VW, VH);
    }
    // sombras no chão
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(HERO.x, HERO.y, 16, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(FOE.x, foeY, villain === 'entity' ? 34 : 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // corrupção subindo do vilão
    if (stage !== 'victory' && Math.random() < 0.35) fx.drift(FOE.x, foeY - 4, 40, LIME, 1);

    // cópias da Seraphine (recursão)
    if (villain === 'seraphine' && stage !== 'victory') {
      const floor = SLICE * (phases.length - phaseIdx - 1);
      const base = phaseIdx === 0 ? 2 : 3;
      const remaining = Math.max(0, hp.current.boss - floor) / SLICE;
      const copies = Math.ceil(remaining * base);
      for (let i = 0; i < copies; i++) {
        const scale = i === 0 ? 0.5 : 0.25 * (i === 1 ? 1 : 0.75);
        const ox = FOE.x - 50 + i * 16 + Math.sin(now / 400 + i) * 3;
        drawCharacter(ctx, 'seraphine', 'idle', now + i * 300, Math.round(ox), foeY - 2, { flip: true, alpha: 0.55 + 0.25 * Math.sin(now / 250 + i), scale: Math.max(0.25, scale) });
      }
    }

    drawHero(ctx, look, heroAnim.current.name, now - heroAnim.current.t0, HERO.x, HERO.y, { tint: now < tint.current.hero ? '#FFFFFF' : undefined });
    const bossName = bossAnim.current.name;
    drawCharacter(ctx, villain, bossName, now - bossAnim.current.t0, FOE.x, foeY, {
      flip: true,
      tint: now < tint.current.boss ? '#FFFFFF' : undefined,
      alpha: stage === 'victory' ? Math.max(0, 1 - (now - bossAnim.current.t0 - 900) / 1500) : 1,
    });

    // postura do Aldric
    if (villain === 'aldric' && stage === 'fight') {
      const icon = getImage(stance === 'defesa' ? 'assets/icons/shield.png' : 'assets/icons/sword.png');
      const y = foeY - 104 + Math.round(Math.sin(now / 300) * 2);
      if (icon) ctx.drawImage(icon, FOE.x - 8, y);
      drawPixelText(ctx, stance === 'defesa' ? 'DEFESA' : 'ATAQUE', FOE.x, y + 18, stance === 'defesa' ? '#7FB3FF' : '#FF8A7A', { outline: '#0A0A0F', align: 'center' });
    }

    fx.draw(ctx, now);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (flash.current) {
      const t = (now - flash.current.t0) / flash.current.ms;
      if (t >= 1) flash.current = null;
      else {
        ctx.globalAlpha = (1 - t) * 0.7;
        ctx.fillStyle = flash.current.color;
        ctx.fillRect(0, 0, VW, VH);
        ctx.globalAlpha = 1;
      }
    }

    // transição de listras horizontais
    if (stage === 'stripes' || stage === 'versus') {
      const t = stage === 'versus' ? 0 : Math.min(1, (now - stripesT0.current) / (rm ? 250 : 650));
      const bars = 12;
      const h = VH / bars;
      ctx.fillStyle = '#0A0A0F';
      for (let i = 0; i < bars; i++) {
        const w = VW * (1 - t);
        const x = i % 2 ? 0 : VW - w;
        ctx.fillRect(x, i * h, w, h + 1);
      }
    }
  };

  const heroPct = Math.round((heroHp / HERO_MAX) * 100);
  const bossTotal = SLICE * phases.length;
  const bossPct = Math.round((bossHp / bossTotal) * 100);
  const level = levelFromXp(save.stats.xp);

  return (
    <main className="screen battle">
      <div className="battle-left">
        <div className="battle-stage">
          <PixelStage render={render}>
            {stage !== 'versus' && stage !== 'stripes' ? (
              <>
                <div className="hpbox hpbox-foe" aria-label={`${info.name}: ${bossHp} de ${bossTotal} pontos de vida`}>
                  <div className="hpbox-name">
                    {info.name}
                    <span className="hpbox-sub">
                      Fase {Math.min(phaseIdx + 1, phases.length)}/{phases.length}
                    </span>
                  </div>
                  <div className="hpbar">
                    <span className="hpbar-label">PV</span>
                    <div className="hpbar-track">
                      <div className={`hpbar-fill ${bossPct < 25 ? 'low' : bossPct < 50 ? 'mid' : ''}`} style={{ width: `${bossPct}%` }} />
                      {phases.slice(1).map((_, i) => (
                        <span key={i} className="hpbar-mark" style={{ left: `${((i + 1) / phases.length) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hpbox hpbox-hero" aria-label={`${save.player.name}: ${heroHp} de ${HERO_MAX} pontos de vida`}>
                  <div className="hpbox-name">
                    {save.player.name}
                    <span className="hpbox-sub">Nv {level}</span>
                  </div>
                  <div className="hpbar">
                    <span className="hpbar-label">PV</span>
                    <div className="hpbar-track">
                      <div className={`hpbar-fill ${heroPct < 25 ? 'low' : heroPct < 50 ? 'mid' : ''}`} style={{ width: `${heroPct}%` }} />
                    </div>
                  </div>
                  <div className="hpbox-num">
                    {heroHp}/{HERO_MAX}
                  </div>
                </div>
                {bubble ? <div className="battle-bubble">{bubble}</div> : null}
              </>
            ) : null}
            {stage === 'versus' ? (
              <button className="versus" onClick={startStripes} aria-label="Pular apresentação">
                <div className="versus-band" />
                <img className="versus-hero px" src={assetUrl(getCharacter(heroId).portrait)} alt="" />
                <img className="versus-foe px" src={assetUrl(getCharacter(villain).portrait)} alt="" />
                <div className="versus-text">
                  <span className="versus-name hero">{save.player.name}</span>
                  <span className="versus-vs">VS</span>
                  <span className="versus-name foe">{info.name}</span>
                </div>
                <div className="versus-epithet">{info.epithet}</div>
              </button>
            ) : null}
          </PixelStage>
        </div>
        <DialogBox variant="panel" speaker={narration.speaker} portrait={narration.portrait} text={narration.text} active={false} />
        <div className="battle-mechanic">
          <strong>Mecânica:</strong> {info.mechanic}
        </div>
        <ChallengeBrief challenge={challenge} language={language} className="battle-brief" />
      </div>
      <div className="battle-right">
        <IdePanel
          key={challenge.id}
          challenge={challenge}
          language={language}
          onResult={(r) => void onResult(r)}
          locked={locked || stage !== 'fight'}
          onHint={hint}
          hintDisabled={phaseStats.current.hints >= 3 || stage !== 'fight'}
          hintLabel={phaseStats.current.hints >= 3 ? 'Sem dicas' : `Dica ${phaseStats.current.hints + 1}/3 (${HINT_COSTS[phaseStats.current.hints]} moedas)`}
          toolbarExtra={
            confirmFlee ? (
              <span className="row" style={{ gap: 4 }}>
                <span>Fugir?</span>
                <button className="ide-btn" onClick={() => game.navigate({ name: 'journey' })}>Sim</button>
                <button className="ide-btn" onClick={() => setConfirmFlee(false)}>Não</button>
              </span>
            ) : (
              <button className="ide-btn" onClick={() => setConfirmFlee(true)} disabled={stage === 'victory'}>
                🏃 Fugir
              </button>
            )
          }
        />
      </div>
    </main>
  );
}
