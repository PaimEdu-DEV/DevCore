import type { PlayerProfile } from './types';

// Registros FICTÍCIOS, exibidos só com VITE_DEMO_RANKING=true e sempre rotulados como exemplo.
const names: [string, 'alchemist' | 'mage', number, number][] = [
  ['Exemplo Ada', 'alchemist', 2450, 820],
  ['Exemplo Grace', 'mage', 2210, 910],
  ['Exemplo Alan', 'alchemist', 1880, 450],
  ['Exemplo Linus', 'mage', 1500, 0],
  ['Exemplo Hedy', 'mage', 1320, 640],
  ['Exemplo Guido', 'alchemist', 990, 300],
  ['Exemplo Brendan', 'mage', 760, 210],
  ['Exemplo Katherine', 'alchemist', 540, 120],
];

export const DEMO_PROFILES: PlayerProfile[] = names.map(([name, heroClass, xp, lightning], i) => ({
  uid: `demo-${i}`,
  name,
  heroClass,
  xp,
  level: Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * xp) / 100)) / 2)),
  lightning,
  bossesDefeated: Math.min(4, Math.floor(xp / 600)),
  title: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
}));
