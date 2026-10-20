export type LeaderboardTab = 'xp' | 'python' | 'javascript' | 'lightning';

/** Perfil público de um jogador (o que vai para o ranking). */
export interface PlayerProfile {
  uid: string;
  name: string;
  heroClass: 'alchemist' | 'mage';
  xp: number;
  level: number;
  /** Melhor pontuação no Desafio Relâmpago. */
  lightning: number;
  bossesDefeated: number;
  title: string | null;
  updatedAt: string;
}

export interface LeaderboardEntry extends PlayerProfile {
  rank: number;
  /** Registro fictício (só com VITE_DEMO_RANKING=true). */
  demo?: boolean;
  isMe?: boolean;
}

export interface BackendService {
  readonly kind: 'local' | 'firebase';
  /** true quando o ranking é compartilhado entre jogadores. */
  readonly online: boolean;
  signInAnonymously(): Promise<{ uid: string }>;
  saveProfile(profile: Omit<PlayerProfile, 'uid' | 'updatedAt'>): Promise<void>;
  /** Atualiza uma pontuação específica (ex.: recorde do Relâmpago). Só sobe, nunca desce. */
  submitScore(tab: LeaderboardTab, value: number): Promise<void>;
  getLeaderboard(tab: LeaderboardTab, limit: number): Promise<LeaderboardEntry[]>;
  getPlayerRank(tab: LeaderboardTab): Promise<number | null>;
}

/** Interface do duelo 1x1 online (ainda não implementado: aparece como "Em breve"). */
export interface DuelService {
  readonly available: false;
  findOpponent(): Promise<never>;
}

export const TAB_LABEL: Record<LeaderboardTab, string> = {
  xp: 'Hall dos Heróis',
  python: 'Alquimistas',
  javascript: 'Magos',
  lightning: 'Relâmpago',
};

export function tabValue(p: PlayerProfile, tab: LeaderboardTab): number {
  return tab === 'lightning' ? p.lightning : p.xp;
}

export function tabFilter(p: PlayerProfile, tab: LeaderboardTab): boolean {
  if (tab === 'python') return p.heroClass === 'alchemist';
  if (tab === 'javascript') return p.heroClass === 'mage';
  if (tab === 'lightning') return p.lightning > 0;
  return true;
}
