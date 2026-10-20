import type { SpeakerId } from '../data/characters';
import type { VillainId } from '../state/save';

/** Fundos estáticos de cena (public/assets/backgrounds). */
export type SceneBackground =
  | 'black'
  | 'title'
  | 'kingdom'
  | 'core'
  | 'archive'
  | 'village'
  | 'battle_aldric'
  | 'battle_veyr'
  | 'battle_seraphine'
  | 'battle_entity';

/** Personagem de cena: um sprite do manifest, ou 'hero' (o herói do jogador). */
export type SceneCharacter = string;

export type Step =
  | { t: 'say'; speaker: SpeakerId; text: string; portrait?: boolean }
  | { t: 'narrate'; text: string }
  | { t: 'background'; bg: SceneBackground }
  /** ms > 0 faz o sprite surgir com fade-in. */
  | { t: 'showSprite'; id: string; character: SceneCharacter; x: number; y: number; anim?: string; flip?: boolean; alpha?: number; scale?: number; ms?: number }
  | { t: 'hideSprite'; id: string; ms?: number }
  | { t: 'anim'; id: string; anim: string; wait?: boolean }
  | { t: 'move'; id: string; x: number; y: number; ms: number; wait?: boolean }
  | { t: 'fade'; to: 'black' | 'white' | 'clear'; ms: number }
  | { t: 'flash'; color?: string; ms?: number }
  | { t: 'shake'; ms: number; intensity?: number }
  | { t: 'wait'; ms: number }
  | { t: 'choice'; speaker?: SpeakerId; text: string; options: { label: string; goto?: string; setFlag?: [string, boolean | number | string] }[] }
  | { t: 'label'; name: string }
  | { t: 'goto'; label: string }
  | { t: 'ifFlag'; flag: string; goto: string }
  | { t: 'setFlag'; flag: string; value: boolean | number | string }
  | { t: 'giveItem'; item: 'coins' | 'xp' | 'cosmetic' | 'title'; amount?: number; id?: string; silent?: boolean }
  | { t: 'startBattle'; villain: VillainId };

export interface Cutscene {
  id: string;
  /** Música futura (gancho). */
  music?: string;
  steps: Step[];
}
