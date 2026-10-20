import type { VillainId } from '../../state/save';
import { ALDRIC_CHALLENGES } from './aldric';
import { VEYR_CHALLENGES } from './veyr';
import { SERAPHINE_CHALLENGES } from './seraphine';
import { ENTITY_CHALLENGES } from './entity';
import { EXTRA_CHALLENGES } from './extras';
import type { Challenge } from './types';

export * from './types';

export const ALL_CHALLENGES: Challenge[] = [...ALDRIC_CHALLENGES, ...VEYR_CHALLENGES, ...SERAPHINE_CHALLENGES, ...ENTITY_CHALLENGES, ...EXTRA_CHALLENGES];

export const EXTRAS = EXTRA_CHALLENGES;

export function getChallenge(id: string): Challenge {
  const c = ALL_CHALLENGES.find((x) => x.id === id);
  if (!c) throw new Error(`Desafio desconhecido: ${id}`);
  return c;
}

export function lessonsFor(villain: VillainId): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.villain === villain && c.kind === 'lesson');
}

export function bossPhases(villain: VillainId): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.villain === villain && c.kind === 'boss').sort((a, b) => (a.phase ?? 0) - (b.phase ?? 0));
}

/** Desafio diário: escolhido de forma determinística pela data (AAAA-MM-DD). */
export function dailyChallenge(date: string): Challenge {
  let h = 2166136261;
  for (const ch of date) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return EXTRA_CHALLENGES[h % EXTRA_CHALLENGES.length];
}

export function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
