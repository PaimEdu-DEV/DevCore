// Save em localStorage com versão e migração. Opções ficam numa chave separada
// para valerem antes mesmo de existir um save.

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'devcore.save';
export const OPTIONS_KEY = 'devcore.options';

export type Gender = 'm' | 'f';
export type HeroClass = 'alchemist' | 'mage';
export type Language = 'python' | 'javascript';
export type VillainId = 'aldric' | 'veyr' | 'seraphine' | 'entity';
export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export interface Options {
  textSpeed: TextSpeed;
  volume: number;
  muted: boolean;
  editorFontSize: number;
  /** 'system' segue prefers-reduced-motion. */
  reducedMotion: 'system' | 'on' | 'off';
}

export interface Player {
  name: string;
  gender: Gender;
  heroClass: HeroClass;
}

export interface Stats {
  xp: number;
  coins: number;
  runs: number;
  testsPassed: number;
  errors: number;
  hintsUsed: number;
  lessonsDone: number;
  bossesDefeated: number;
  flawlessPhases: number;
  defeats: number;
  lightningBest: number;
  dailyDone: number;
  coinsSpent: number;
  playTimeSec: number;
}

export interface LessonProgress {
  done: boolean;
  /** Melhor resultado: sem dicas e sem erros. */
  flawless: boolean;
}

export interface BossProgress {
  defeated: boolean;
  bestScore: number;
  attempts: number;
}

export interface SaveData {
  version: number;
  createdAt: string;
  updatedAt: string;
  player: Player;
  stats: Stats;
  lessons: Record<string, LessonProgress>;
  bosses: Partial<Record<VillainId, BossProgress>>;
  flags: Record<string, boolean | number | string>;
  cosmetics: {
    owned: string[];
    equipped: { hat: string | null; aura: string | null; spell: string | null; nameFrame: string | null; title: string | null };
  };
  /** Títulos conquistados (ids de src/game/data/titles.ts) ou comprados (ids de cosmético). */
  titles: string[];
  daily: { lastWelcomeBonus: string | null; completed: Record<string, string> };
  missionsClaimed: string[];
  village: { x: number; y: number; facing: 'left' | 'right' };
  /** Jornada depois do portão: área atual (0 a 3; 4 = concluída) e capangas já derrotados nela. */
  journey: { area: number; beaten: string[] };
}

export const DEFAULT_OPTIONS: Options = {
  textSpeed: 'normal',
  volume: 0.6,
  muted: false,
  editorFontSize: 15,
  reducedMotion: 'system',
};

export function emptyStats(): Stats {
  return {
    xp: 0, coins: 50, runs: 0, testsPassed: 0, errors: 0, hintsUsed: 0, lessonsDone: 0,
    bossesDefeated: 0, flawlessPhases: 0, defeats: 0, lightningBest: 0, dailyDone: 0, coinsSpent: 0, playTimeSec: 0,
  };
}

export function newSave(player: Player): SaveData {
  const now = new Date().toISOString();
  return {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    player,
    stats: emptyStats(),
    lessons: {},
    bosses: {},
    flags: {},
    cosmetics: { owned: [], equipped: { hat: null, aura: null, spell: null, nameFrame: null, title: null } },
    titles: [],
    daily: { lastWelcomeBonus: null, completed: {} },
    missionsClaimed: [],
    village: { x: 10, y: 12, facing: 'right' },
    journey: { area: 0, beaten: [] },
  };
}

export function languageOf(heroClass: HeroClass): Language {
  return heroClass === 'alchemist' ? 'python' : 'javascript';
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Converte qualquer versão anterior para a atual. Lança erro se o dado não for um save.
 * v1 (protótipo): { version: 1, name, gender, heroClass, xp, coins, completed: string[] }
 */
export function migrate(raw: unknown): SaveData {
  if (!isObj(raw)) throw new Error('Arquivo de save inválido.');
  const version = typeof raw.version === 'number' ? raw.version : 0;
  if (version > SAVE_VERSION) throw new Error('Este save é de uma versão mais nova do jogo.');
  let data: Record<string, unknown> = raw;
  if (version <= 1) {
    if (typeof raw.name !== 'string') throw new Error('Arquivo de save inválido.');
    const s = newSave({
      name: String(raw.name).slice(0, 16),
      gender: raw.gender === 'f' ? 'f' : 'm',
      heroClass: raw.heroClass === 'mage' ? 'mage' : 'alchemist',
    });
    s.stats.xp = Number(raw.xp) || 0;
    s.stats.coins = Number(raw.coins) || 0;
    if (Array.isArray(raw.completed)) for (const id of raw.completed) s.lessons[String(id)] = { done: true, flawless: false };
    data = s as unknown as Record<string, unknown>;
  }
  if (!isObj(data.player) || typeof data.player.name !== 'string') throw new Error('Arquivo de save inválido.');
  // Preenche campos que versões futuras possam ter adicionado com padrões.
  const base = newSave(data.player as unknown as Player);
  const merged: SaveData = {
    ...base,
    ...(data as unknown as SaveData),
    stats: { ...base.stats, ...(isObj(data.stats) ? (data.stats as Partial<Stats>) : {}) },
    cosmetics: {
      owned: isObj(data.cosmetics) && Array.isArray(data.cosmetics.owned) ? (data.cosmetics.owned as string[]) : [],
      equipped: { ...base.cosmetics.equipped, ...(isObj(data.cosmetics) && isObj(data.cosmetics.equipped) ? data.cosmetics.equipped : {}) },
    },
    daily: { ...base.daily, ...(isObj(data.daily) ? (data.daily as SaveData['daily']) : {}) },
    village: { ...base.village, ...(isObj(data.village) ? (data.village as SaveData['village']) : {}) },
    journey: { ...base.journey, ...(isObj(data.journey) ? (data.journey as SaveData['journey']) : {}) },
    version: SAVE_VERSION,
  };
  return merged;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSave(): SaveData | null {
  const raw = storage()?.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData): void {
  data.updatedAt = new Date().toISOString();
  try {
    storage()?.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* armazenamento cheio ou bloqueado: o jogo segue em memória */
  }
}

export function deleteSave(): void {
  storage()?.removeItem(SAVE_KEY);
}

export function loadOptions(): Options {
  try {
    const raw = storage()?.getItem(OPTIONS_KEY);
    return raw ? { ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<Options>) } : { ...DEFAULT_OPTIONS };
  } catch {
    return { ...DEFAULT_OPTIONS };
  }
}

export function writeOptions(o: Options): void {
  try {
    storage()?.setItem(OPTIONS_KEY, JSON.stringify(o));
  } catch {
    /* ignora */
  }
}

export function exportSave(data: SaveData): string {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
}

export function importSave(json: string): SaveData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  return migrate(parsed);
}
