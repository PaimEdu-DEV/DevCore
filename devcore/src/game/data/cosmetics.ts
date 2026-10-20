// Cosméticos vendidos pelo Garrick. Para adicionar um item: inclua uma entrada aqui
// (e o PNG correspondente em public/assets/cosmetics ou public/assets/ui, se houver imagem).

export type CosmeticCategory = 'hat' | 'aura' | 'spell' | 'nameFrame' | 'title';
export type Rarity = 'common' | 'rare' | 'legendary';

interface Base {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
}

export interface HatCosmetic extends Base {
  category: 'hat';
  image: string;
  /** Onde a base da imagem encosta, em px abaixo do topo da cabeça (quadro de 48px). */
  anchorY: number;
  /** Deslocamento horizontal a partir do centro da cabeça. */
  anchorX?: number;
}

export interface AuraCosmetic extends Base {
  category: 'aura';
  image: string;
}

export interface SpellCosmetic extends Base {
  category: 'spell';
  /** Cores das partículas do ataque. */
  colors: string[];
  particle: 'orb' | 'spark' | 'star' | 'ember';
}

export interface NameFrameCosmetic extends Base {
  category: 'nameFrame';
  image: string;
  /** Cor do texto sobre a moldura. */
  textColor: string;
}

export interface TitleCosmetic extends Base {
  category: 'title';
  text: string;
}

export type Cosmetic = HatCosmetic | AuraCosmetic | SpellCosmetic | NameFrameCosmetic | TitleCosmetic;

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  legendary: 'Lendário',
};

export const CATEGORY_LABEL: Record<CosmeticCategory, string> = {
  hat: 'Chapéu/Acessório',
  aura: 'Aura',
  spell: 'Efeito de magia',
  nameFrame: 'Moldura de nome',
  title: 'Título',
};

export const COSMETICS: Cosmetic[] = [
  // Chapéus e acessórios
  { id: 'hat_hood', category: 'hat', name: 'Capuz de Viajante', description: 'Couro gasto de quem já andou muito.', price: 60, rarity: 'common', image: 'assets/cosmetics/hat_hood.png', anchorY: 6 },
  { id: 'hat_feather', category: 'hat', name: 'Chapéu de Pena', description: 'Elegante, levemente exagerado.', price: 90, rarity: 'common', image: 'assets/cosmetics/hat_feather.png', anchorY: 4 },
  { id: 'hat_glasses', category: 'hat', name: 'Óculos de Arquivista', description: 'Iguaizinhos aos do Orwin. Quase.', price: 180, rarity: 'rare', image: 'assets/cosmetics/hat_glasses.png', anchorY: 11, anchorX: 2 },
  { id: 'hat_laurel', category: 'hat', name: 'Coroa de Louros', description: 'Para quem passa em todos os testes.', price: 240, rarity: 'rare', image: 'assets/cosmetics/hat_laurel.png', anchorY: 4 },
  { id: 'hat_crown', category: 'hat', name: 'Coroa Real', description: 'Forjada com o ouro do antigo tesouro do reino.', price: 650, rarity: 'legendary', image: 'assets/cosmetics/hat_crown.png', anchorY: 3 },
  // Auras
  { id: 'aura_ember', category: 'aura', name: 'Aura de Brasa', description: 'Um calor que acompanha seus passos.', price: 110, rarity: 'common', image: 'assets/cosmetics/aura_ember.png' },
  { id: 'aura_tide', category: 'aura', name: 'Aura da Maré', description: 'Calma como o lago da vila.', price: 260, rarity: 'rare', image: 'assets/cosmetics/aura_tide.png' },
  { id: 'aura_starlight', category: 'aura', name: 'Luz Estelar', description: 'Brilha mais quando o código compila.', price: 300, rarity: 'rare', image: 'assets/cosmetics/aura_starlight.png' },
  { id: 'aura_golden', category: 'aura', name: 'Aura Dourada', description: 'O brilho original do Core.', price: 720, rarity: 'legendary', image: 'assets/cosmetics/aura_golden.png' },
  // Efeitos de magia
  { id: 'spell_gold', category: 'spell', name: 'Faíscas Douradas', description: 'Seu ataque solta faíscas de ouro.', price: 90, rarity: 'common', colors: ['#FFE08A', '#E8B84A', '#A87A1E'], particle: 'spark' },
  { id: 'spell_ember', category: 'spell', name: 'Brasas Rubras', description: 'Brasas vermelhas a cada acerto.', price: 210, rarity: 'rare', colors: ['#FFB000', '#D8443A', '#6E1F1A'], particle: 'ember' },
  { id: 'spell_star', category: 'spell', name: 'Poeira Estelar', description: 'Estrelinhas creme e azul-marinho.', price: 250, rarity: 'rare', colors: ['#F3E9D2', '#33456E', '#FFE08A'], particle: 'star' },
  { id: 'spell_comet', category: 'spell', name: 'Cometa Real', description: 'Orbes dourados que cruzam a arena.', price: 680, rarity: 'legendary', colors: ['#FFFFFF', '#FFE08A', '#FFB000'], particle: 'orb' },
  // Molduras de nome
  { id: 'frame_wood', category: 'nameFrame', name: 'Moldura de Madeira', description: 'Simples e honesta, como a forja do Garrick.', price: 50, rarity: 'common', image: 'assets/ui/frame_wood.png', textColor: '#F3E9D2' },
  { id: 'frame_silver', category: 'nameFrame', name: 'Moldura de Prata', description: 'Polida até refletir o seu nome.', price: 160, rarity: 'rare', image: 'assets/ui/frame_silver.png', textColor: '#E2E8F2' },
  { id: 'frame_ember', category: 'nameFrame', name: 'Moldura de Brasa', description: 'Ainda quente da bigorna.', price: 200, rarity: 'rare', image: 'assets/ui/frame_ember.png', textColor: '#FFE08A' },
  { id: 'frame_gold', category: 'nameFrame', name: 'Moldura de Ouro Real', description: 'Digna dos heróis do Pergaminho.', price: 520, rarity: 'legendary', image: 'assets/ui/frame_gold.png', textColor: '#FFE08A' },
  { id: 'frame_star', category: 'nameFrame', name: 'Moldura do Céu Estrelado', description: 'Azul-marinho e estrelas, como a noite antes da batalha.', price: 560, rarity: 'legendary', image: 'assets/ui/frame_star.png', textColor: '#F3E9D2' },
  // Títulos
  { id: 'title_apprentice', category: 'title', name: 'Aprendiz do Código', description: 'Todo mundo começa em algum lugar.', price: 40, rarity: 'common', text: 'Aprendiz do Código' },
  { id: 'title_bughunter', category: 'title', name: 'Caçador de Bugs', description: 'Nenhum erro escapa.', price: 170, rarity: 'rare', text: 'Caçador de Bugs' },
  { id: 'title_looptamer', category: 'title', name: 'Domador de Loops', description: 'Sabe a hora certa de parar.', price: 190, rarity: 'rare', text: 'Domador de Loops' },
  { id: 'title_legend', category: 'title', name: 'Lenda do Core', description: 'Seu nome ecoa no coração do reino.', price: 800, rarity: 'legendary', text: 'Lenda do Core' },
];

export function getCosmetic(id: string | undefined | null): Cosmetic | undefined {
  return id ? COSMETICS.find((c) => c.id === id) : undefined;
}

/** Chapéu de classe do Mago: aparece quando nenhum chapéu cosmético está equipado. */
export const MAGE_CLASS_HAT: HatCosmetic = {
  id: 'class_mage_hat',
  category: 'hat',
  name: 'Chapéu de Mago',
  description: 'Parte do traje do Mago.',
  price: 0,
  rarity: 'common',
  image: 'assets/cosmetics/hat_mage.png',
  anchorY: 5,
};
