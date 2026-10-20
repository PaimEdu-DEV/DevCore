// Efeitos sonoros sintetizados com Web Audio (sem arquivos).
import { game } from '../state/store';

export type Sfx = 'blip' | 'select' | 'confirm' | 'cancel' | 'success' | 'error' | 'hit' | 'damage' | 'victory' | 'levelup' | 'coin' | 'step';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastBlip = 0;

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number): void {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(master);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function noise(start: number, dur: number, vol: number): void {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(master);
  src.start(start);
}

export const audio = {
  play(sfx: Sfx): void {
    const { volume, muted } = game.get().options;
    if (muted || volume <= 0) return;
    const c = ensure();
    if (!c || !master) return;
    master.gain.value = volume * 0.5;
    const t = c.currentTime;
    switch (sfx) {
      case 'blip': {
        const now = performance.now();
        if (now - lastBlip < 45) return;
        lastBlip = now;
        tone(880 + Math.random() * 60, t, 0.035, 'square', 0.08);
        break;
      }
      case 'select':
        tone(660, t, 0.05, 'square', 0.1);
        break;
      case 'confirm':
        tone(660, t, 0.06, 'square', 0.12);
        tone(990, t + 0.06, 0.08, 'square', 0.12);
        break;
      case 'cancel':
        tone(440, t, 0.06, 'square', 0.1);
        tone(330, t + 0.06, 0.08, 'square', 0.1);
        break;
      case 'success':
        [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.12, 'square', 0.12));
        break;
      case 'error':
        tone(220, t, 0.12, 'sawtooth', 0.12, 140);
        tone(180, t + 0.12, 0.18, 'sawtooth', 0.12, 110);
        break;
      case 'hit':
        noise(t, 0.12, 0.35);
        tone(200, t, 0.12, 'square', 0.15, 60);
        break;
      case 'damage':
        noise(t, 0.2, 0.3);
        tone(150, t, 0.25, 'triangle', 0.2, 50);
        break;
      case 'victory':
        [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.2, 'square', 0.12));
        tone(262, t, 0.7, 'triangle', 0.15);
        break;
      case 'levelup':
        [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.06, 0.12, 'square', 0.1));
        break;
      case 'coin':
        tone(988, t, 0.06, 'square', 0.1);
        tone(1319, t + 0.06, 0.2, 'square', 0.1);
        break;
      case 'step':
        noise(t, 0.03, 0.05);
        break;
    }
  },
  /** Gancho para trilha futura: hoje não toca nada. */
  playMusic(_track: string | null): void {
    void _track;
  },
  /** Precisa ser chamado num gesto do usuário (clique/tecla) para destravar o áudio. */
  unlock(): void {
    ensure();
  },
};
