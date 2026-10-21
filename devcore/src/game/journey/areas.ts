import type { VillainId } from '../state/save';
import type { Theme } from './scenery';

export interface Area {
  villain: VillainId;
  name: string;
  theme: Theme;
  /** Fala do Orwin ao entrar na área. */
  intro: string;
}

export const AREAS: Area[] = [
  { villain: 'aldric', name: 'Estrada do Portão', theme: 'meadow', intro: 'Bugs na estrada! Cada um cai com uma linha de código. Lá no fim, Aldric espera.' },
  { villain: 'veyr', name: 'Floresta Sombria', theme: 'forest', intro: 'Estes bugs só caem com if e else. Pense: o número é par ou ímpar?' },
  { villain: 'seraphine', name: 'Ruínas de Cristal', theme: 'crystal', intro: 'Aqui a magia é feita de textos. Junte palavras com + e derrote os bugs.' },
  { villain: 'entity', name: 'O Núcleo', theme: 'core', intro: 'O coração do Core. Use tudo o que aprendeu: contas, if e um laço.' },
];

/** Posições no mundo (px): início, capangas e chefe. */
export const START_X = 48;
export const MINION_X = [330, 600];
export const BOSS_X = 900;
export const AREA_W = 1000;
