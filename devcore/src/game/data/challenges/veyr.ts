import type { Challenge } from './types';

// Veyr: for/while, acumuladores, break e condição de parada. 3 lições (as fases do chefe ficam em journey.ts).
export const VEYR_CHALLENGES: Challenge[] = [
  {
    id: 'veyr-l1',
    concept: 'loops',
    villain: 'veyr',
    kind: 'lesson',
    title: 'Repetindo com for',
    statement: {
      python: `Um **laço** repete um bloco de código. \`for i in range(1, n + 1):\` passa por 1, 2, 3, ..., n.

Complete \`{fn}(n)\` para devolver a soma de todos os números de 1 até n.

Exemplo: \`{fn}(4)\` → 1 + 2 + 3 + 4 = \`10\`.

Dica de ouro: comece um **acumulador** em 0 e some a cada volta.`,
      javascript: `Um **laço** repete um bloco de código. \`for (let i = 1; i <= n; i++)\` passa por 1, 2, 3, ..., n.

Complete \`{fn}(n)\` para devolver a soma de todos os números de 1 até n.

Exemplo: \`{fn}(4)\` → 1 + 2 + 3 + 4 = \`10\`.

Dica de ouro: comece um **acumulador** em 0 e some a cada volta.`,
    },
    functionName: { python: 'somar_ate', javascript: 'somarAte' },
    starter: {
      python: `def somar_ate(n):
    total = 0
    for i in range(1, n + 1):
        # some i ao total
        pass
    return total
`,
      javascript: `function somarAte(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    // some i ao total
  }
  return total;
}
`,
    },
    tests: [
      { args: [4], expected: 10 },
      { args: [1], expected: 1 },
      { args: [5], expected: 15 },
      { args: [0], expected: 0, hidden: true },
      { args: [100], expected: 5050, hidden: true },
    ],
    hints: [
      'A cada volta do laço, o total precisa crescer com o valor de i.',
      { python: 'Use total = total + i (ou total += i) dentro do for.', javascript: 'Use total = total + i (ou total += i) dentro do for.' },
      'Confira a indentação: a soma precisa estar DENTRO do laço; o return, FORA.',
    ],
    mentor: {
      success: 'Um acumulador que cresce a cada volta. Veyr conta golpes; você agora conta melhor.',
      failure: 'Coloque um print dentro do laço e veja o total crescendo. Ele cresce?',
    },
    xp: 50,
    coins: 20,
  },
  {
    id: 'veyr-l2',
    concept: 'loops',
    villain: 'veyr',
    kind: 'lesson',
    title: 'Contando com condição',
    statement: `Laços também percorrem listas, um item por vez.

Complete \`{fn}(numeros)\` para devolver **quantos** números da lista são pares.

Um número é par quando o resto da divisão por 2 é zero: \`n % 2 == 0\`.

Exemplo: \`{fn}([1, 2, 3, 4])\` → \`2\`.`,
    functionName: { python: 'contar_pares', javascript: 'contarPares' },
    starter: {
      python: `def contar_pares(numeros):
    quantidade = 0
    for n in numeros:
        # se n for par, aumente a quantidade
        pass
    return quantidade
`,
      javascript: `function contarPares(numeros) {
  let quantidade = 0;
  for (const n of numeros) {
    // se n for par, aumente a quantidade
  }
  return quantidade;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4]], expected: 2 },
      { args: [[2, 4, 6]], expected: 3 },
      { args: [[1, 3, 5]], expected: 0 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[0, -2, 7]], expected: 2, hidden: true },
    ],
    hints: [
      'Dentro do laço vai um if.',
      { python: 'if n % 2 == 0: e, dentro dele, quantidade += 1', javascript: 'if (n % 2 === 0) { ... } e, dentro dele, quantidade += 1' },
      'Some 1 (não o próprio n): você está contando, não somando.',
    ],
    mentor: {
      success: 'Laço mais condição: a dupla mais útil do reino.',
      failure: 'Você está contando ou somando? O esperado é QUANTOS pares.',
    },
    xp: 55,
    coins: 20,
  },
  {
    id: 'veyr-l3',
    concept: 'loops',
    villain: 'veyr',
    kind: 'lesson',
    title: 'Sabendo a hora de parar',
    statement: {
      python: `Às vezes não precisamos ver a lista inteira. Quando achamos o que procurávamos, paramos: com \`break\` ou com \`return\` direto.

Complete \`{fn}(numeros, limite)\` para devolver o **primeiro** número maior que \`limite\`. Se nenhum for, devolva \`-1\`.

Exemplo: \`{fn}([3, 8, 12, 20], 10)\` → \`12\`.

Use um \`while\` com índice, ou um \`for\` que pare cedo.`,
      javascript: `Às vezes não precisamos ver a lista inteira. Quando achamos o que procurávamos, paramos: com \`break\` ou com \`return\` direto.

Complete \`{fn}(numeros, limite)\` para devolver o **primeiro** número maior que \`limite\`. Se nenhum for, devolva \`-1\`.

Exemplo: \`{fn}([3, 8, 12, 20], 10)\` → \`12\`.

Use um \`while\` com índice, ou um \`for\` que pare cedo.`,
    },
    functionName: { python: 'primeiro_acima', javascript: 'primeiroAcima' },
    starter: {
      python: `def primeiro_acima(numeros, limite):
    i = 0
    while i < len(numeros):
        # se numeros[i] for maior que limite, devolva-o
        i += 1
    return -1
`,
      javascript: `function primeiroAcima(numeros, limite) {
  let i = 0;
  while (i < numeros.length) {
    // se numeros[i] for maior que limite, devolva-o
    i++;
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[3, 8, 12, 20], 10], expected: 12 },
      { args: [[1, 2, 3], 5], expected: -1 },
      { args: [[50, 1], 0], expected: 50 },
      { args: [[], 0], expected: -1, hidden: true },
      { args: [[5, 5, 6], 5], expected: 6, hidden: true },
    ],
    hints: [
      'O while já anda pela lista. Falta perguntar algo a cada volta.',
      'Dentro do laço: se numeros[i] > limite, devolva numeros[i] na hora (o return encerra o laço).',
      'Atenção: "maior que" não inclui o igual. 5 não é maior que 5.',
    ],
    mentor: {
      success: 'Parar na hora certa é metade da sabedoria. A outra metade é saber o que procurar.',
      failure: 'Seu laço para? Lembre: maior estrito, e -1 só quando ninguém passa do limite.',
    },
    xp: 60,
    coins: 25,
  },
];

