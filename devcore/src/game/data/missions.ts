import type { SaveData } from '../state/save';

// Missões simples da Elowen. Sem prazo e sem punição: ficam disponíveis até serem resgatadas.
export interface Mission {
  id: string;
  title: string;
  description: string;
  coins: number;
  xp: number;
  /** Progresso atual e meta. */
  progress: (s: SaveData) => [number, number];
}

const lessons = (s: SaveData) => Object.values(s.lessons).filter((l) => l.done).length;
const defeated = (s: SaveData) => Object.values(s.bosses).filter((b) => b?.defeated).length;
const anyEquipped = (s: SaveData) => Object.values(s.cosmetics.equipped).some(Boolean);

export const MISSIONS: Mission[] = [
  { id: 'm_first_lesson', title: 'Primeira página', description: 'Conclua uma lição com o Orwin.', coins: 20, xp: 20, progress: (s) => [Math.min(1, lessons(s)), 1] },
  { id: 'm_three_lessons', title: 'Estudante dedicado', description: 'Conclua 3 lições.', coins: 40, xp: 30, progress: (s) => [Math.min(3, lessons(s)), 3] },
  { id: 'm_shop', title: 'Freguês do Garrick', description: 'Compre um item na loja do Garrick.', coins: 25, xp: 10, progress: (s) => [Math.min(1, s.cosmetics.owned.length), 1] },
  { id: 'm_equip', title: 'Herói elegante', description: 'Equipe um cosmético ou título.', coins: 15, xp: 10, progress: (s) => [anyEquipped(s) ? 1 : 0, 1] },
  { id: 'm_daily', title: 'Caçada do dia', description: 'Vença um desafio diário da Elowen.', coins: 30, xp: 20, progress: (s) => [Math.min(1, s.stats.dailyDone), 1] },
  { id: 'm_lightning', title: 'Rápido como um raio', description: 'Faça pelo menos 100 pontos no Desafio Relâmpago.', coins: 30, xp: 20, progress: (s) => [Math.min(100, s.stats.lightningBest), 100] },
  { id: 'm_aldric', title: 'A primeira muralha', description: 'Derrote Aldric.', coins: 60, xp: 40, progress: (s) => [s.bosses.aldric?.defeated ? 1 : 0, 1] },
  { id: 'm_flawless', title: 'Sem um arranhão', description: 'Vença uma fase de chefe sem dicas e sem erros.', coins: 50, xp: 40, progress: (s) => [Math.min(1, s.stats.flawlessPhases), 1] },
  { id: 'm_all', title: 'Salvador do Core', description: 'Derrote os quatro inimigos do reino.', coins: 200, xp: 150, progress: (s) => [defeated(s), 4] },
];

export function missionReady(m: Mission, s: SaveData): boolean {
  const [a, b] = m.progress(s);
  return a >= b && !s.missionsClaimed.includes(m.id);
}
