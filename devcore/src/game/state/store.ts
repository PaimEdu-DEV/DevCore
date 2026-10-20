import { useSyncExternalStore } from 'react';
import { loadOptions, loadSave, writeOptions, writeSave, type Options, type SaveData, type VillainId } from './save';
import { levelFromXp, titleLabel } from './progression';
import { getCosmetic } from '../data/cosmetics';

export type Route =
  | { name: 'title' }
  | { name: 'options'; back: Route }
  | { name: 'credits' }
  | { name: 'scroll'; back: Route }
  | { name: 'creation' }
  | { name: 'cutscene'; id: string; next: Route }
  | { name: 'village' }
  | { name: 'battle'; villain: VillainId }
  | { name: 'lesson'; challengeId: string; back: Route }
  | { name: 'training'; back: Route }
  | { name: 'shop' }
  | { name: 'profile'; back: Route }
  | { name: 'cosmetics'; back: Route }
  | { name: 'missions'; back: Route }
  | { name: 'bossSelect' }
  | { name: 'lightning' }
  | { name: 'daily' };

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'reward' | 'error';
}

interface State {
  route: Route;
  save: SaveData | null;
  options: Options;
  toasts: Toast[];
  /** Sistema prefere menos movimento. */
  systemReducedMotion: boolean;
}

const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

let state: State = {
  route: { name: 'title' },
  save: typeof window !== 'undefined' ? loadSave() : null,
  options: typeof window !== 'undefined' ? loadOptions() : loadOptionsFallback(),
  toasts: [],
  systemReducedMotion: mq?.matches ?? false,
};

function loadOptionsFallback(): Options {
  return { textSpeed: 'normal', volume: 0.6, muted: false, editorFontSize: 15, reducedMotion: 'system' };
}

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

mq?.addEventListener?.('change', (e) => {
  state = { ...state, systemReducedMotion: e.matches };
  emit();
});

export const game = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  navigate(route: Route) {
    state = { ...state, route };
    emit();
  },
  setSave(save: SaveData | null, persist = true) {
    state = { ...state, save };
    if (save && persist) writeSave(save);
    emit();
  },
  /** Altera o save atual (cópia rasa) e persiste. */
  update(fn: (s: SaveData) => void, persist = true) {
    if (!state.save) return;
    const next = structuredClone(state.save);
    fn(next);
    state = { ...state, save: next };
    if (persist) writeSave(next);
    emit();
  },
  saveNow() {
    if (state.save) writeSave(state.save);
  },
  setOptions(patch: Partial<Options>) {
    const options = { ...state.options, ...patch };
    state = { ...state, options };
    writeOptions(options);
    emit();
  },
  toast(text: string, kind: Toast['kind'] = 'info') {
    const t: Toast = { id: Date.now() + Math.random(), text, kind };
    state = { ...state, toasts: [...state.toasts, t] };
    emit();
    setTimeout(() => {
      state = { ...state, toasts: state.toasts.filter((x) => x.id !== t.id) };
      emit();
    }, 3200);
  },
};

export function useGame<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(game.subscribe, () => selector(state), () => selector(state));
}

export function reducedMotion(s: State = state): boolean {
  return s.options.reducedMotion === 'on' || (s.options.reducedMotion === 'system' && s.systemReducedMotion);
}

export function useReducedMotion(): boolean {
  return useGame((s) => reducedMotion(s));
}

export const TEXT_CPS: Record<Options['textSpeed'], number> = { slow: 22, normal: 45, fast: 90, instant: Infinity };

export function playerLevel(save: SaveData | null): number {
  return save ? levelFromXp(save.stats.xp) : 1;
}

export function equippedTitle(save: SaveData | null): string | null {
  const id = save?.cosmetics.equipped.title;
  if (!id) return null;
  const c = getCosmetic(id);
  return titleLabel(id, c && c.category === 'title' ? c.text : undefined);
}
