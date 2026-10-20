import { same, type Challenge } from './types';

// Seraphine: funções, parâmetros, return e recursão com caso-base. 3 lições + 2 fases.
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
  {
    id: 'seraphine-b1',
    concept: 'functions',
    villain: 'seraphine',
    kind: 'boss',
    phase: 1,
    title: 'Cópias menores',
    statement: `Seraphine invoca cópias de si mesma. Cada cópia tem **metade** do tamanho da anterior (divisão inteira), até o tamanho chegar a menos de 1.

Escreva \`{fn}(tamanho)\` de forma **recursiva**: ela devolve quantas Seraphines aparecem no total.

- \`{fn}(8)\` → 8, 4, 2, 1 → \`4\`
- \`{fn}(1)\` → \`1\`
- \`{fn}(0)\` → \`0\` (caso-base: nada aparece)`,
    functionName: same('copias'),
    starter: {
      python: `def copias(tamanho):
    # caso-base: tamanho menor que 1
    # senão: 1 (esta cópia) + as cópias da metade
    return 0
`,
      javascript: `function copias(tamanho) {
  // caso-base: tamanho menor que 1
  // senão: 1 (esta cópia) + as cópias da metade
  return 0;
}
`,
    },
    tests: [
      { args: [8], expected: 4 },
      { args: [1], expected: 1 },
      { args: [0], expected: 0 },
      { args: [10], expected: 4, hidden: true },
      { args: [100], expected: 7, hidden: true },
    ],
    hints: [
      'Caso-base: se tamanho < 1, nenhuma cópia, devolva 0.',
      { python: 'A metade inteira em Python é tamanho // 2.', javascript: 'A metade inteira em JavaScript é Math.floor(tamanho / 2).' },
      'No caso geral: devolva 1 + copias(metade).',
    ],
    mentor: {
      success: 'Você encontrou o caso-base e as cópias se desfizeram uma a uma.',
      failure: 'Conte no papel: 8, 4, 2, 1. Quantas são? Sua função para no lugar certo?',
    },
    xp: 110,
    coins: 45,
  },
  {
    id: 'seraphine-b2',
    concept: 'functions',
    villain: 'seraphine',
    kind: 'boss',
    phase: 2,
    title: 'O grimório aninhado',
    statement: {
      python: `O grimório de Seraphine esconde listas dentro de listas, dentro de listas...

Escreva \`{fn}(lista)\` que devolve todos os números numa lista **plana**, na mesma ordem.

- \`{fn}([1, [2, [3, 4]], 5])\` → \`[1, 2, 3, 4, 5]\`
- \`{fn}([])\` → \`[]\`

Para cada item: se for uma lista (\`isinstance(item, list)\`), achate-a com a própria função e junte o resultado; se for número, adicione direto.`,
      javascript: `O grimório de Seraphine esconde listas dentro de listas, dentro de listas...

Escreva \`{fn}(lista)\` que devolve todos os números numa lista **plana**, na mesma ordem.

- \`{fn}([1, [2, [3, 4]], 5])\` → \`[1, 2, 3, 4, 5]\`
- \`{fn}([])\` → \`[]\`

Para cada item: se for uma lista (\`Array.isArray(item)\`), achate-a com a própria função e junte o resultado; se for número, adicione direto. (Sem usar .flat(), combinado?)`,
    },
    functionName: same('achatar'),
    starter: {
      python: `def achatar(lista):
    resultado = []
    for item in lista:
        # lista? achate e junte. número? adicione.
        pass
    return resultado
`,
      javascript: `function achatar(lista) {
  const resultado = [];
  for (const item of lista) {
    // lista? achate e junte. número? adicione.
  }
  return resultado;
}
`,
    },
    tests: [
      { args: [[1, [2, [3, 4]], 5]], expected: [1, 2, 3, 4, 5] },
      { args: [[]], expected: [] },
      { args: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { args: [[[[[7]]]]], expected: [7], hidden: true },
      { args: [[1, [], [2, [], [3, [4, [5]]]]]], expected: [1, 2, 3, 4, 5], hidden: true },
    ],
    hints: [
      'O caso-base aqui é o item que é número: ele vai direto para o resultado.',
      { python: 'Se isinstance(item, list), chame achatar(item) e junte com resultado.extend(...).', javascript: 'Se Array.isArray(item), chame achatar(item) e junte com resultado.push(...achatar(item)).' },
      'Uma lista vazia não adiciona nada, e tudo bem: o laço simplesmente não roda.',
    ],
    mentor: {
      success: 'Camada por camada, o grimório se abriu. Recursão de verdade.',
      failure: 'Teste com [[7]]: sua função entra na lista de dentro? E na de dentro dela?',
    },
    xp: 160,
    coins: 60,
  },
];
