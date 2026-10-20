import { game } from './store';
import { levelFromXp } from './progression';
import { audio } from '../audio/AudioManager';
import type { SaveData } from './save';

export const HINT_COSTS = [5, 10, 15] as const;

/** Concede XP e moedas, detecta subida de nível e avisa o jogador. */
export function grant(xp: number, coins: number, reason?: string, mutate?: (s: SaveData) => void): { leveledUp: boolean; level: number } {
  const before = game.get().save;
  if (!before) return { leveledUp: false, level: 1 };
  const oldLevel = levelFromXp(before.stats.xp);
  game.update((s) => {
    s.stats.xp += Math.max(0, Math.round(xp));
    s.stats.coins += Math.max(0, Math.round(coins));
    mutate?.(s);
  });
  const level = levelFromXp(game.get().save!.stats.xp);
  const parts = [xp > 0 ? `+${Math.round(xp)} XP` : '', coins > 0 ? `+${Math.round(coins)} moedas` : ''].filter(Boolean).join(' · ');
  if (parts) game.toast(reason ? `${reason}: ${parts}` : parts, 'reward');
  if (coins > 0) audio.play('coin');
  if (level > oldLevel) {
    setTimeout(() => {
      audio.play('levelup');
      game.toast(`Subiu para o nível ${level}!`, 'reward');
    }, 450);
  }
  return { leveledUp: level > oldLevel, level };
}

export function spendCoins(amount: number): boolean {
  const s = game.get().save;
  if (!s || s.stats.coins < amount) return false;
  game.update((d) => {
    d.stats.coins -= amount;
    d.stats.coinsSpent += amount;
  });
  audio.play('coin');
  return true;
}

export function awardTitle(id: string, label: string): void {
  const s = game.get().save;
  if (!s || s.titles.includes(id)) return;
  game.update((d) => void d.titles.push(id));
  game.toast(`Novo título: ${label}`, 'reward');
}

/** Registra uma execução de código nas estatísticas. */
export function recordRun(passedTests: number, hadError: boolean): void {
  game.update((d) => {
    d.stats.runs += 1;
    d.stats.testsPassed += passedTests;
    if (hadError) d.stats.errors += 1;
  });
}
