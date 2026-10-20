import { same, type Challenge } from './types';

// Aldric: variáveis, tipos, comparações e if/else. 3 lições + 2 fases.
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
  {
    id: 'aldric-b1',
    concept: 'basics',
    villain: 'aldric',
    kind: 'boss',
    phase: 1,
    title: 'Leia a postura',
    statement: `Aldric alterna entre duas posturas. Escreva \`{fn}(postura)\`:

- se a postura for \`"defesa"\`, devolva \`"atacar"\` (ele baixou a espada!);
- se a postura for \`"ataque"\`, devolva \`"defender"\`.

Use \`==\` para comparar textos.`,
    functionName: same('reagir'),
    starter: {
      python: `def reagir(postura):
    # compare a postura e devolva a reação certa
    pass
`,
      javascript: `function reagir(postura) {
  // compare a postura e devolva a reação certa
}
`,
    },
    tests: [
      { args: ['defesa'], expected: 'atacar' },
      { args: ['ataque'], expected: 'defender' },
      { args: ['defesa'], expected: 'atacar', hidden: true },
    ],
    hints: [
      'É um if com duas possibilidades.',
      'Pergunte se postura == "defesa". Se sim, return "atacar".',
      {
        python: 'Estrutura: if postura == "defesa": (return de um texto) e else: (return do outro).',
        javascript: 'Estrutura: if (postura === "defesa") { return ... } else { return ... }',
      },
    ],
    mentor: {
      success: 'Você leu a postura dele como quem lê um livro aberto.',
      failure: 'Aldric mudou de postura e você não acompanhou. Confira os textos: "atacar" e "defender", sem acento e em minúsculas.',
    },
    xp: 80,
    coins: 30,
  },
  {
    id: 'aldric-b2',
    concept: 'basics',
    villain: 'aldric',
    kind: 'boss',
    phase: 2,
    title: 'O golpe certo',
    statement: `Agora Aldric levanta o escudo de verdade. Escreva \`{fn}(postura, forca, escudo)\` para calcular o dano do seu golpe:

- postura \`"ataque"\` (guarda aberta): dano = \`forca * 2\`;
- postura \`"defesa"\`: dano = \`forca - escudo\`, mas **nunca menor que 0**.

Exemplos: \`{fn}("ataque", 10, 99)\` → \`20\` · \`{fn}("defesa", 10, 4)\` → \`6\` · \`{fn}("defesa", 3, 8)\` → \`0\``,
    functionName: same('golpe'),
    starter: {
      python: `def golpe(postura, forca, escudo):
    dano = 0
    # calcule o dano conforme a postura
    return dano
`,
      javascript: `function golpe(postura, forca, escudo) {
  let dano = 0;
  // calcule o dano conforme a postura
  return dano;
}
`,
    },
    tests: [
      { args: ['ataque', 10, 99], expected: 20 },
      { args: ['defesa', 10, 4], expected: 6 },
      { args: ['defesa', 3, 8], expected: 0 },
      { args: ['defesa', 7, 7], expected: 0, hidden: true },
      { args: ['ataque', 0, 5], expected: 0, hidden: true },
      { args: ['defesa', 50, 1], expected: 49, hidden: true },
    ],
    hints: [
      'Primeiro decida pela postura, depois calcule. São dois caminhos.',
      'No caminho da defesa, calcule forca - escudo e, se der negativo, troque por 0.',
      {
        python: 'Na defesa: calcule dano = forca - escudo e depois corrija com if dano < 0: dano = 0. (max(0, ...) também resolve.)',
        javascript: 'Na defesa: calcule dano = forca - escudo e depois corrija com if (dano < 0) dano = 0. (Math.max(0, ...) também resolve.)',
      },
    ],
    mentor: {
      success: 'Escudo, postura, limite. Você calculou tudo e o general ficou sem resposta.',
      failure: 'Pense no escudo maior que a força: dano negativo não existe.',
    },
    xp: 120,
    coins: 50,
  },
];
