import type { VillainId } from '../state/save';

export type NpcId = 'orwin' | 'garrick' | 'maren' | 'isolde' | 'torvan' | 'elowen';
export type SpeakerId = NpcId | VillainId | 'hero' | 'narrator';

export interface SpeakerInfo {
  name: string;
  /** id do sprite (retrato em public/assets/portraits). */
  sprite: string | null;
  role?: string;
}

export const SPEAKERS: Record<Exclude<SpeakerId, 'hero'>, SpeakerInfo> = {
  narrator: { name: '', sprite: null },
  orwin: { name: 'Orwin', sprite: 'orwin', role: 'Arquivista' },
  garrick: { name: 'Garrick', sprite: 'garrick', role: 'Ferreiro' },
  maren: { name: 'Maren', sprite: 'maren', role: 'Escriba' },
  isolde: { name: 'Isolde', sprite: 'isolde', role: 'Estalajadeira' },
  torvan: { name: 'Torvan', sprite: 'torvan', role: 'Mestre da Arena' },
  elowen: { name: 'Elowen', sprite: 'elowen', role: 'Caçadora' },
  aldric: { name: 'Aldric', sprite: 'aldric', role: 'O General de Ferro' },
  veyr: { name: 'Veyr', sprite: 'veyr', role: 'A Lâmina Sem Sombra' },
  seraphine: { name: 'Seraphine', sprite: 'seraphine', role: 'A Arquimaga Caída' },
  entity: { name: 'A Entidade', sprite: 'entity', role: 'Aquilo que corrompeu o Core' },
};

export interface VillainInfo {
  id: VillainId;
  name: string;
  epithet: string;
  concept: string;
  background: string;
  phases: number;
  /** Mecânica temática exibida na batalha. */
  mechanic: string;
}

export const VILLAINS: VillainInfo[] = [
  {
    id: 'aldric',
    name: 'Aldric',
    epithet: 'O General de Ferro',
    concept: 'Somar, multiplicar e subtrair',
    background: 'assets/backgrounds/battle_aldric.png',
    phases: 2,
    mechanic: 'Alterna postura de DEFESA e ATAQUE. Na defesa, erros quase não causam dano.',
  },
  {
    id: 'veyr',
    name: 'Veyr',
    epithet: 'A Lâmina Sem Sombra',
    concept: 'if/else e comparações',
    background: 'assets/backgrounds/battle_veyr.png',
    phases: 2,
    mechanic: 'Ataca em sequências crescentes: 3, 5, 8 golpes.',
  },
  {
    id: 'seraphine',
    name: 'Seraphine',
    epithet: 'A Arquimaga Caída',
    concept: 'Textos e funções',
    background: 'assets/backgrounds/battle_seraphine.png',
    phases: 2,
    mechanic: 'Invoca cópias menores de si mesma.',
  },
  {
    id: 'entity',
    name: 'A Entidade',
    epithet: 'Aquilo que corrompeu o Core',
    concept: 'Tudo junto: contas, if e laço',
    background: 'assets/backgrounds/battle_entity.png',
    phases: 3,
    mechanic: 'Combina as táticas dos três generais.',
  },
];

export function villainInfo(id: VillainId): VillainInfo {
  return VILLAINS.find((v) => v.id === id)!;
}

export const VILLAIN_ORDER: VillainId[] = ['aldric', 'veyr', 'seraphine', 'entity'];
