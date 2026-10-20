// Backend online com Firebase (Auth anônimo + Firestore, SDK modular).
// Carregado por import dinâmico SÓ quando as variáveis VITE_FIREBASE_* existem;
// sem elas, este arquivo nem é baixado. Veja docs/FIREBASE_SETUP.md.
import { tabValue, type BackendService, type LeaderboardEntry, type LeaderboardTab, type PlayerProfile } from './types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

type FirestoreMod = typeof import('firebase/firestore');
type AuthMod = typeof import('firebase/auth');

const COLLECTION = 'players';

export class FirebaseBackend implements BackendService {
  readonly kind = 'firebase' as const;
  readonly online = true;
  private ready: Promise<{ fs: FirestoreMod; db: import('firebase/firestore').Firestore; auth: import('firebase/auth').Auth; authMod: AuthMod }>;
  private uid: string | null = null;
  private last: PlayerProfile | null = null;

  constructor(config: FirebaseConfig) {
    this.ready = (async () => {
      const [{ initializeApp }, fs, authMod] = await Promise.all([import('firebase/app'), import('firebase/firestore'), import('firebase/auth')]);
      const app = initializeApp(config);
      return { fs, db: fs.getFirestore(app), auth: authMod.getAuth(app), authMod };
    })();
  }

  async signInAnonymously() {
    const { auth, authMod } = await this.ready;
    if (!auth.currentUser) await authMod.signInAnonymously(auth);
    this.uid = auth.currentUser!.uid;
    return { uid: this.uid };
  }

  async saveProfile(profile: Omit<PlayerProfile, 'uid' | 'updatedAt'>) {
    const { fs, db } = await this.ready;
    const { uid } = await this.signInAnonymously();
    const ref = fs.doc(db, COLLECTION, uid);
    const snap = await fs.getDoc(ref);
    const prev = snap.exists() ? (snap.data() as PlayerProfile) : null;
    // As regras do Firestore exigem que XP e recordes só cresçam (com teto de incremento).
    const data: PlayerProfile = {
      ...profile,
      uid,
      xp: Math.max(profile.xp, prev?.xp ?? 0),
      lightning: Math.max(profile.lightning, prev?.lightning ?? 0),
      updatedAt: new Date().toISOString(),
    };
    await fs.setDoc(ref, { ...data, updatedAt: fs.serverTimestamp() });
    this.last = data;
  }

  async submitScore(tab: LeaderboardTab, value: number) {
    if (!this.last) return;
    if (tab === 'lightning') await this.saveProfile({ ...this.last, lightning: value });
    else await this.saveProfile({ ...this.last, xp: value });
  }

  private query(fs: FirestoreMod, db: import('firebase/firestore').Firestore, tab: LeaderboardTab, limit: number) {
    const col = fs.collection(db, COLLECTION);
    switch (tab) {
      case 'python':
        return fs.query(col, fs.where('heroClass', '==', 'alchemist'), fs.orderBy('xp', 'desc'), fs.limit(limit));
      case 'javascript':
        return fs.query(col, fs.where('heroClass', '==', 'mage'), fs.orderBy('xp', 'desc'), fs.limit(limit));
      case 'lightning':
        return fs.query(col, fs.where('lightning', '>', 0), fs.orderBy('lightning', 'desc'), fs.limit(limit));
      default:
        return fs.query(col, fs.orderBy('xp', 'desc'), fs.limit(limit));
    }
  }

  async getLeaderboard(tab: LeaderboardTab, limit: number): Promise<LeaderboardEntry[]> {
    const { fs, db } = await this.ready;
    const { uid } = await this.signInAnonymously();
    const snap = await fs.getDocs(this.query(fs, db, tab, limit));
    return snap.docs.map((d, i) => {
      const p = d.data() as PlayerProfile;
      return { ...p, uid: d.id, updatedAt: String(p.updatedAt ?? ''), rank: i + 1, isMe: d.id === uid };
    });
  }

  async getPlayerRank(tab: LeaderboardTab) {
    const { fs, db } = await this.ready;
    const { uid } = await this.signInAnonymously();
    const me = await fs.getDoc(fs.doc(db, COLLECTION, uid));
    if (!me.exists()) return null;
    const p = me.data() as PlayerProfile;
    if (tab === 'python' && p.heroClass !== 'alchemist') return null;
    if (tab === 'javascript' && p.heroClass !== 'mage') return null;
    const field = tab === 'lightning' ? 'lightning' : 'xp';
    const value = tabValue(p, tab);
    const col = fs.collection(db, COLLECTION);
    const filters = [fs.where(field, '>', value)];
    if (tab === 'python') filters.push(fs.where('heroClass', '==', 'alchemist'));
    if (tab === 'javascript') filters.push(fs.where('heroClass', '==', 'mage'));
    const count = await fs.getCountFromServer(fs.query(col, ...filters));
    return count.data().count + 1;
  }
}
