import { same, type Challenge } from './types';

// Aldric: variáveis, tipos, comparações e if/else. 3 lições (as fases do chefe ficam em journey.ts).
export const ALDRIC_CHALLENGES: Challenge[] = [
  {
    id: 'aldric-l1',
    concept: 'basics',
    villain: 'aldric',
    kind: 'lesson',
    title: 'Guardando valores',
    statement: `Uma **variável** é uma caixinha com nome onde guardamos um valor.

A armadura de um soldado tem uma defesa **base** e um **bônus**. Complete a função \`{fn}\` para:

1. criar a variável \`total\` com a soma de \`base\` e \`bonus\`;
2. devolver \`total\` com \`return\`.

Exemplo: \`{fn}(10, 5)\` deve devolver \`15\`.`,
    functionName: same('armadura'),
    starter: {
      python: `def armadura(base, bonus):
    # guarde em total a soma de base com bonus
    total = 0
    return total
`,
      javascript: `function armadura(base, bonus) {
  // guarde em total a soma de base com bonus
  let total = 0;
  return total;
}
`,
    },
    tests: [
      { args: [10, 5], expected: 15 },
      { args: [0, 0], expected: 0 },
      { args: [7, 3], expected: 10 },
      { args: [100, -20], expected: 80, hidden: true },
    ],
    hints: [
      'O sinal de soma é o mesmo da matemática: +.',
      'Troque o 0 da linha do total por uma conta que use base e bonus.',
      'A linha do total fica parecida com: total = base + ... (complete com o outro parâmetro).',
    ],
    mentor: {
      success: 'Uma variável, uma soma, um return. Todo feitiço grande começa assim.',
      failure: 'Quase. Olhe o valor esperado e pense: que conta com base e bonus chega nele?',
    },
    xp: 40,
    coins: 15,
  },
  {
    id: 'aldric-l2',
    concept: 'basics',
    villain: 'aldric',
    kind: 'lesson',
    title: 'Textos e números',
    statement: `Valores têm **tipos**: \`"Ada"\` é texto (string) e \`3\` é número.

Para juntar texto com número, primeiro transforme o número em texto.

Complete \`{fn}(nome, nivel)\` para devolver o crachá do soldado no formato:

\`Ada (nível 3)\`

Repare nos espaços e nos parênteses: o texto precisa ser **exatamente** igual.`,
    functionName: same('cracha'),
    starter: {
      python: `def cracha(nome, nivel):
    # junte o nome, o texto " (nível ", o nivel convertido com str() e ")"
    return nome
`,
      javascript: `function cracha(nome, nivel) {
  // junte o nome, o texto " (nível ", o nivel e ")"
  return nome;
}
`,
    },
    tests: [
      { args: ['Ada', 3], expected: 'Ada (nível 3)' },
      { args: ['Garrick', 10], expected: 'Garrick (nível 10)' },
      { args: ['Lin', 1], expected: 'Lin (nível 1)' },
      { args: ['X', 0], expected: 'X (nível 0)', hidden: true },
    ],
    hints: [
      'Textos são juntados com + (concatenação).',
      {
        python: 'Em Python, str(nivel) transforma o número em texto: "a" + str(3) dá "a3".',
        javascript: 'Em JavaScript, texto + número já vira texto: "a" + 3 dá "a3". Template com crases também funciona.',
      },
      'Monte em partes: nome, depois " (nível ", depois o nível, depois ")".',
    ],
    mentor: {
      success: 'Texto é texto, número é número, e você fez os dois conversarem.',
      failure: 'Compare letra por letra com o esperado. Um espaço a mais ou a menos já muda tudo.',
    },
    xp: 45,
    coins: 15,
  },
  {
    id: 'aldric-l3',
    concept: 'basics',
    villain: 'aldric',
    kind: 'lesson',
    title: 'Decidindo com if/else',
    statement: `Com \`if\` o código escolhe um caminho. Comparamos com \`<\`, \`>\`, \`<=\`, \`>=\`, \`==\` (igual) e \`!=\` (diferente).

Complete \`{fn}(forca)\` para classificar um soldado:

- força menor que 10 → \`"fraco"\`
- força menor que 50 → \`"médio"\`
- caso contrário → \`"forte"\`

A ordem das perguntas importa!`,
    functionName: same('classificar'),
    starter: {
      python: `def classificar(forca):
    if forca < 10:
        return "fraco"
    # use elif para o próximo caso e else para o último
    return "?"
`,
      javascript: `function classificar(forca) {
  if (forca < 10) {
    return "fraco";
  }
  // use else if para o próximo caso e else para o último
  return "?";
}
`,
    },
    tests: [
      { args: [5], expected: 'fraco' },
      { args: [30], expected: 'médio' },
      { args: [80], expected: 'forte' },
      { args: [10], expected: 'médio', hidden: true },
      { args: [50], expected: 'forte', hidden: true },
    ],
    hints: [
      'Você já tem o primeiro caso. Falta perguntar "e se for menor que 50?".',
      {
        python: 'Em Python: elif forca < 50: (com o return recuado embaixo) e depois else:.',
        javascript: 'Em JavaScript: } else if (forca < 50) { ... } else { ... }',
      },
      'Cuidado com os limites: 10 já não é fraco, e 50 já é forte.',
    ],
    mentor: {
      success: 'Três caminhos, nenhuma dúvida. Aldric adora regras. Você acabou de aprender a usá-las melhor que ele.',
      failure: 'Teste os limites de cabeça: o que acontece com 10? E com 50?',
    },
    xp: 55,
    coins: 20,
  },
];
