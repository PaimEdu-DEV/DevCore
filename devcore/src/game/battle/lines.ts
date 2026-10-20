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
      'Fase 1 · Aldric alterna entre DEFESA e ATAQUE. Escreva o código que lê a postura dele.',
      'Fase 2 · Aldric ergue o escudo de verdade! Calcule o dano certo para cada postura.',
    ],
    hurt: ['Isso foi sorte!', 'Meu escudo... rachou?', 'Você golpeia como um recruta. Um recruta irritante.'],
    taunt: ['Erro de cálculo, criança. Na guerra isso custa caro.', 'Regras mal escritas quebram. Como você.', 'Ha! Nem passou do meu escudo.'],
    counter: 'Golpe de Escudo',
  },
  veyr: {
    phaseIntro: [
      'Fase 1 · Veyr ataca em sequência! Monte a lista de esquivas, golpe a golpe.',
      'Fase 2 · Veyr acelera: 3, 5, 8... Descubra o padrão antes que ele descubra você.',
    ],
    hurt: ['Tsc! Esse eu não contei.', 'Rápido... mas não o bastante!', 'Você está aprendendo a contar, é?'],
    taunt: ['Seu laço tropeçou! Minha vez.', 'Errou a conta. Eu nunca erro a conta.', 'Sentiu? Foram três. Os próximos são cinco.'],
    counter: 'Sequência de Lâminas',
  },
  seraphine: {
    phaseIntro: [
      'Fase 1 · Seraphine se divide em cópias cada vez menores. Conte-as com recursão.',
      'Fase 2 · O grimório aninhado se abre: listas dentro de listas. Achate tudo!',
    ],
    hurt: ['Uma cópia a menos. Ainda restam muitas.', 'Interessante... você leu algum livro, afinal.', 'Isso não estava no meu grimório!'],
    taunt: ['Sem caso-base, você afunda para sempre.', 'Recursão sem fim. Que poético. Que patético.', 'Você chama, chama, chama... e nada volta.'],
    counter: 'Eco Arcano',
  },
  entity: {
    phaseIntro: [
      'Fase 1 · A Entidade envia comandos misturados com ruído. Filtre o que presta.',
      'Fase 2 · A Entidade embaralha o Core. Nada de acessar o que não existe!',
      'Fase 3 · O golpe final. Tudo o que você aprendeu, num único relatório.',
    ],
    hurt: ['...uma falha?', 'Impossível. Eu sou a exceção.', 'O Core... está respondendo a você?'],
    taunt: ['Exceção não tratada. Que pena.', 'Seu código quebrou. Tudo quebra diante de mim.', 'Você esqueceu do erro. Eu não.'],
    counter: 'Exceção Lançada',
  },
};

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
