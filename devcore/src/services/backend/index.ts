// Escolhe o backend automaticamente: Firebase se as variáveis VITE_FIREBASE_* existirem, senão Local.
import { LocalBackend } from './LocalBackend';
import type { BackendService, DuelService } from './types';
import { levelFromXp } from '../../game/state/progression';
import type { SaveData } from '../../game/state/save';

export * from './types';

const env = import.meta.env;

export function firebaseConfigured(): boolean {
  return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
}

export const demoRanking = env.VITE_DEMO_RANKING === 'true';

let backend: Promise<BackendService> | null = null;

export function getBackend(): Promise<BackendService> {
  backend ??= (async () => {
    if (firebaseConfigured()) {
      try {
        const { FirebaseBackend } = await import('./FirebaseBackend');
        const fb = new FirebaseBackend({
          apiKey: env.VITE_FIREBASE_API_KEY!,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
          projectId: env.VITE_FIREBASE_PROJECT_ID!,
          appId: env.VITE_FIREBASE_APP_ID!,
          storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        });
        await fb.signInAnonymously();
        return fb;
      } catch (e) {
        console.warn('[DevCore] Firebase indisponível, usando ranking local.', e);
      }
    }
    return new LocalBackend(demoRanking);
  })();
  return backend;
}

/** Publica o perfil atual (XP, nível, recorde) no ranking. Falhas são silenciosas: o jogo segue offline. */
export async function syncProfile(save: SaveData | null, title: string | null = null): Promise<void> {
  if (!save) return;
  try {
    const b = await getBackend();
    await b.saveProfile({
      name: save.player.name,
      heroClass: save.player.heroClass,
      xp: save.stats.xp,
      level: levelFromXp(save.stats.xp),
      lightning: save.stats.lightningBest,
      bossesDefeated: Object.values(save.bosses).filter((x) => x?.defeated).length,
      title,
    });
  } catch (e) {
    console.warn('[DevCore] Não foi possível sincronizar o perfil.', e);
  }
}

/** Duelo 1x1 online: interface pronta, ainda sem implementação. */
export const duelService: DuelService = {
  available: false,
  findOpponent: () => Promise.reject(new Error('Duelo online em breve.')),
};
