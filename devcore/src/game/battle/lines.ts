import type { VillainId } from '../state/save';

export interface VillainLines {
  /** Narração ao começar cada fase. */
  phaseIntro: string[];
  /** Reação do vilão ao levar dano. */
  hurt: string[];
  /** Provocação quando o código do herói falha. */
  taunt: string[];
  /** Nome do contra-ataque. */
  counter: string;
}

export const BATTLE_LINES: Record<VillainId, VillainLines> = {
  aldric: {
    phaseIntro: [
      'Fase 1 · Aldric baixou a guarda! Dobre a sua força.',
      'Fase 2 · Aldric ergue o escudo! Tire o escudo da sua força.',
    ],
    hurt: ['Isso foi sorte!', 'Meu escudo... rachou?', 'Você golpeia como um recruta. Um recruta irritante.'],
    taunt: ['Erro de cálculo, criança. Na guerra isso custa caro.', 'Regras mal escritas quebram. Como você.', 'Ha! Nem passou do meu escudo.'],
    counter: 'Golpe de Escudo',
  },
  veyr: {
    phaseIntro: [
      'Fase 1 · Veyr ataca alto ou baixo! Use o if/else para esquivar.',
      'Fase 2 · Veyr acelera! Escolha sempre o golpe mais forte.',
    ],
    hurt: ['Tsc! Esse eu não contei.', 'Rápido... mas não o bastante!', 'Você está aprendendo a contar, é?'],
    taunt: ['Seu laço tropeçou! Minha vez.', 'Errou a conta. Eu nunca erro a conta.', 'Sentiu? Foram três. Os próximos são cinco.'],
    counter: 'Sequência de Lâminas',
  },
  seraphine: {
    phaseIntro: [
      'Fase 1 · Seraphine se divide em cópias! Conte quantas são.',
      'Fase 2 · Diga o nome verdadeiro dela para quebrar o feitiço!',
    ],
    hurt: ['Uma cópia a menos. Ainda restam muitas.', 'Interessante... você leu algum livro, afinal.', 'Isso não estava no meu grimório!'],
    taunt: ['Sem caso-base, você afunda para sempre.', 'Recursão sem fim. Que poético. Que patético.', 'Você chama, chama, chama... e nada volta.'],
    counter: 'Eco Arcano',
  },
  entity: {
    phaseIntro: [
      'Fase 1 · A Entidade embaralha o Core! Some os três sinais.',
      'Fase 2 · Ela injeta números negativos! Corrija com um if.',
      'Fase 3 · O golpe final! Some a lista inteira com um laço.',
    ],
    hurt: ['...uma falha?', 'Impossível. Eu sou a exceção.', 'O Core... está respondendo a você?'],
    taunt: ['Exceção não tratada. Que pena.', 'Seu código quebrou. Tudo quebra diante de mim.', 'Você esqueceu do erro. Eu não.'],
    counter: 'Exceção Lançada',
  },
};

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
