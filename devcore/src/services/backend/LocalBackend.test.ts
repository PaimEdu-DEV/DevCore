import { beforeEach, describe, expect, it } from 'vitest';
import { LocalBackend } from './LocalBackend';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}

const profile = { name: 'Ada', heroClass: 'mage' as const, xp: 300, level: 3, lightning: 0, bossesDefeated: 1, title: null };

describe('LocalBackend', () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
  });

  it('mostra só o registro local quando não há demo', async () => {
    const b = new LocalBackend(false);
    await b.saveProfile(profile);
    const list = await b.getLeaderboard('xp', 50);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: 'Ada', rank: 1, isMe: true });
    expect(await b.getPlayerRank('xp')).toBe(1);
  });

  it('separa as abas por classe e pelo Relâmpago', async () => {
    const b = new LocalBackend(false);
    await b.saveProfile(profile);
    expect(await b.getLeaderboard('python', 50)).toHaveLength(0);
    expect(await b.getLeaderboard('javascript', 50)).toHaveLength(1);
    expect(await b.getLeaderboard('lightning', 50)).toHaveLength(0);
    await b.submitScore('lightning', 260);
    expect((await b.getLeaderboard('lightning', 50))[0].lightning).toBe(260);
  });

  it('o recorde do Relâmpago nunca diminui', async () => {
    const b = new LocalBackend(false);
    await b.saveProfile(profile);
    await b.submitScore('lightning', 500);
    await b.submitScore('lightning', 100);
    await b.saveProfile({ ...profile, lightning: 0 });
    expect((await b.getLeaderboard('lightning', 5))[0].lightning).toBe(500);
  });

  it('com demo ativado, mistura exemplos rotulados e calcula a posição', async () => {
    const b = new LocalBackend(true);
    await b.saveProfile(profile);
    const list = await b.getLeaderboard('xp', 50);
    expect(list.some((e) => e.demo)).toBe(true);
    expect(list.filter((e) => !e.demo && !e.isMe)).toHaveLength(0);
    const rank = await b.getPlayerRank('xp');
    expect(rank).toBe(list.find((e) => e.isMe)!.rank);
    expect(rank).toBeGreaterThan(1);
  });
});
