import { same, type Challenge } from './types';

// Seraphine: funções, parâmetros, return e recursão com caso-base. 3 lições (as fases do chefe ficam em journey.ts).
export const SERAPHINE_CHALLENGES: Challenge[] = [
  {
    id: 'seraphine-l1',
    concept: 'functions',
    villain: 'seraphine',
    kind: 'lesson',
    title: 'Parâmetros e return',
    statement: `Uma **função** recebe valores (os **parâmetros**), faz um trabalho e **devolve** um resultado com \`return\`.

Escreva a função \`{fn}(a, b, c)\` inteira: ela devolve a média dos três números.

Exemplo: \`{fn}(2, 4, 9)\` → \`5\` (porque (2 + 4 + 9) / 3 = 5).

Cuidado com a ordem das contas: primeiro some, depois divida.`,
    functionName: same('media'),
    starter: {
      python: `# escreva a função media(a, b, c) aqui
`,
      javascript: `// escreva a função media(a, b, c) aqui
`,
    },
    tests: [
      { args: [2, 4, 9], expected: 5 },
      { args: [10, 0, 5], expected: 5 },
      { args: [1, 2, 2], expected: 5 / 3 },
      { args: [0, 0, 0], expected: 0, hidden: true },
      { args: [-3, 3, 6], expected: 2, hidden: true },
    ],
    hints: [
      { python: 'Comece com: def media(a, b, c):  e escreva o corpo recuado embaixo.', javascript: 'Comece com: function media(a, b, c) {  e feche com } no fim.' },
      'Parênteses mudam a ordem: (a + b + c) / 3 é diferente de a + b + c / 3.',
      'O corpo inteiro cabe numa linha: um return com a conta entre parênteses dividida por 3.',
    ],
    mentor: {
      success: 'Sua primeira função escrita do zero. Seraphine levou anos para admitir que funções são simples.',
      failure: 'A conta está na ordem certa? Primeiro a soma, depois a divisão.',
    },
    xp: 55,
    coins: 20,
  },
  {
    id: 'seraphine-l2',
    concept: 'functions',
    villain: 'seraphine',
    kind: 'lesson',
    title: 'Funções que usam funções',
    statement: `Funções podem chamar outras funções. É assim que feitiços grandes são montados com feitiços pequenos.

A função \`dobro(x)\` já está pronta. Escreva \`{fn}(x)\` **usando** \`dobro\`: o quádruplo é o dobro do dobro.

Exemplo: \`{fn}(3)\` → \`12\`.`,
    functionName: same('quadruplo'),
    starter: {
      python: `def dobro(x):
    return x * 2

def quadruplo(x):
    # use a função dobro aqui
    return x
`,
      javascript: `function dobro(x) {
  return x * 2;
}

function quadruplo(x) {
  // use a função dobro aqui
  return x;
}
`,
    },
    tests: [
      { args: [3], expected: 12 },
      { args: [0], expected: 0 },
      { args: [10], expected: 40 },
      { args: [-2], expected: -8, hidden: true },
      { args: [0.5], expected: 2, hidden: true },
    ],
    hints: [
      'Chamar uma função é escrever o nome dela com os valores entre parênteses: dobro(5).',
      'O resultado de uma chamada pode ir direto para dentro de outra.',
      'Algo como return dobro(dobro(...)).',
    ],
    mentor: {
      success: 'Composição! Uma função dentro da outra, como bonecas russas.',
      failure: 'Você chamou dobro duas vezes? Uma vez só dá o dobro, não o quádruplo.',
    },
    xp: 55,
    coins: 20,
  },
  {
    id: 'seraphine-l3',
    concept: 'functions',
    villain: 'seraphine',
    kind: 'lesson',
    title: 'Recursão e o caso-base',
    statement: `**Recursão** é quando uma função chama a si mesma com um problema menor.

Toda recursão precisa de um **caso-base**: o ponto em que ela para de se chamar.

O fatorial de n é n × (n−1) × ... × 1. Por definição, \`fatorial(0)\` = 1.

- caso-base: se n for 0, devolva 1;
- senão: devolva n × {fn}(n − 1).

Exemplo: \`{fn}(4)\` → 4 × 3 × 2 × 1 = \`24\`.`,
    functionName: same('fatorial'),
    starter: {
      python: `def fatorial(n):
    # caso-base primeiro!
    return 1
`,
      javascript: `function fatorial(n) {
  // caso-base primeiro!
  return 1;
}
`,
    },
    tests: [
      { args: [0], expected: 1 },
      { args: [1], expected: 1 },
      { args: [4], expected: 24 },
      { args: [5], expected: 120, hidden: true },
      { args: [10], expected: 3628800, hidden: true },
    ],
    hints: [
      'Dois casos: n == 0 (para) e todo o resto (chama de novo com n − 1).',
      'No caso geral, multiplique n pelo resultado de fatorial(n - 1).',
      'Se você esquecer o caso-base, a função nunca para: é o erro de recursão infinita.',
    ],
    mentor: {
      success: 'O caso-base salvou você da espiral infinita. Seraphine nunca aprendeu essa parte.',
      failure: 'Confira: o caso-base devolve 1? O caso geral chama fatorial com um número MENOR?',
    },
    xp: 65,
    coins: 25,
  },
];
