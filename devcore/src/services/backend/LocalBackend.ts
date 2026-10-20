import { tabFilter, tabValue, type BackendService, type LeaderboardEntry, type LeaderboardTab, type PlayerProfile } from './types';
import { DEMO_PROFILES } from './demoData';

const KEY = 'devcore.local.profile';
const UID_KEY = 'devcore.local.uid';

function read(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayerProfile) : null;
  } catch {
    return null;
  }
}

function write(p: PlayerProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignora */
  }
}

/** Backend padrão, 100% offline: o ranking mostra só o seu registro (e exemplos, se ativados). */
export class LocalBackend implements BackendService {
  readonly kind = 'local' as const;
  readonly online = false;
  constructor(private readonly demo: boolean) {}

  async signInAnonymously() {
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
      uid = `local-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(UID_KEY, uid);
    }
    return { uid };
  }

  async saveProfile(profile: Omit<PlayerProfile, 'uid' | 'updatedAt'>) {
    const { uid } = await this.signInAnonymously();
    const prev = read();
    write({ ...profile, uid, lightning: Math.max(profile.lightning, prev?.lightning ?? 0), updatedAt: new Date().toISOString() });
  }

  async submitScore(tab: LeaderboardTab, value: number) {
    const prev = read();
    if (!prev) return;
    if (tab === 'lightning') write({ ...prev, lightning: Math.max(prev.lightning, value), updatedAt: new Date().toISOString() });
    else write({ ...prev, xp: Math.max(prev.xp, value), updatedAt: new Date().toISOString() });
  }

  async getLeaderboard(tab: LeaderboardTab, limit: number): Promise<LeaderboardEntry[]> {
    const me = read();
    const pool: (PlayerProfile & { demo?: boolean; isMe?: boolean })[] = [];
    if (me) pool.push({ ...me, isMe: true });
    if (this.demo) pool.push(...DEMO_PROFILES.map((p) => ({ ...p, demo: true })));
    return pool
      .filter((p) => tabFilter(p, tab))
      .sort((a, b) => tabValue(b, tab) - tabValue(a, tab))
      .slice(0, limit)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }

  async getPlayerRank(tab: LeaderboardTab) {
    const list = await this.getLeaderboard(tab, 1000);
    return list.find((e) => e.isMe)?.rank ?? null;
  }
}
