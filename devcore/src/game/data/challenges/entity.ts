import type { Challenge } from './types';

// A Entidade: try/except (try/catch), validação e tudo junto. 2 lições (as fases do chefe ficam em journey.ts).
export const ENTITY_CHALLENGES: Challenge[] = [
  {
    id: 'entity-l1',
    concept: 'errors',
    villain: 'entity',
    kind: 'lesson',
    title: 'Tentar e tratar',
    statement: {
      python: `Alguns erros não são culpa do seu código, e sim dos dados que chegam. Para isso existe o \`try\`/\`except\`: **tente** algo e, se der erro, **trate**.

Os pergaminhos do reino guardam dados em formato JSON. Mas alguns foram corrompidos pela Entidade.

Escreva \`{fn}(texto)\`: devolva \`json.loads(texto)\`. Se o texto estiver corrompido, devolva \`None\` em vez de quebrar.

\`\`\`
import json

try:
    ...
except ValueError:
    ...
\`\`\``,
      javascript: `Alguns erros não são culpa do seu código, e sim dos dados que chegam. Para isso existe o \`try\`/\`catch\`: **tente** algo e, se der erro, **trate**.

Os pergaminhos do reino guardam dados em formato JSON. Mas alguns foram corrompidos pela Entidade.

Escreva \`{fn}(texto)\`: devolva \`JSON.parse(texto)\`. Se o texto estiver corrompido, devolva \`null\` em vez de quebrar.

\`\`\`
try {
  ...
} catch (erro) {
  ...
}
\`\`\``,
    },
    functionName: { python: 'ler_pergaminho', javascript: 'lerPergaminho' },
    starter: {
      python: `import json

def ler_pergaminho(texto):
    # tente ler o JSON; se der erro, devolva None
    return json.loads(texto)
`,
      javascript: `function lerPergaminho(texto) {
  // tente ler o JSON; se der erro, devolva null
  return JSON.parse(texto);
}
`,
    },
    tests: [
      { args: ['{"vida": 10}'], expected: { vida: 10 } },
      { args: ['[1, 2, 3]'], expected: [1, 2, 3] },
      { args: ['corrompido!'], expected: null },
      { args: [''], expected: null, hidden: true },
      { args: ['{"nome": "Core"'], expected: null, hidden: true },
    ],
    hints: [
      'A linha que pode falhar vai dentro do try.',
      { python: 'Use except ValueError: (o erro de JSON inválido é um tipo de ValueError) e devolva None ali.', javascript: 'No catch (erro) { ... } devolva null.' },
      'Estrutura: try → return da leitura; except/catch → return do valor vazio.',
    ],
    mentor: {
      success: 'Pergaminho corrompido? Sem pânico. Você tentou, tratou e seguiu em frente.',
      failure: 'O erro ainda está escapando. A leitura do JSON está mesmo dentro do try?',
    },
    xp: 70,
    coins: 30,
  },
  {
    id: 'entity-l2',
    concept: 'errors',
    villain: 'entity',
    kind: 'lesson',
    title: 'Validando antes de agir',
    statement: {
      python: `Melhor que tratar um erro é não deixar ele acontecer: **valide** os dados antes.

Escreva \`{fn}(nome, poder)\`:

- se \`nome\` não for texto (\`str\`) ou estiver vazio → devolva \`"nome inválido"\`;
- se \`poder\` não for número (\`int\` ou \`float\`) ou estiver fora de 1 a 100 → devolva \`"poder inválido"\`;
- se tudo estiver certo → devolva \`"ok"\`.

Use \`isinstance(valor, str)\` para checar o tipo. Atenção: em Python, \`True\` também conta como \`int\`; trate booleanos como poder inválido.`,
      javascript: `Melhor que tratar um erro é não deixar ele acontecer: **valide** os dados antes.

Escreva \`{fn}(nome, poder)\`:

- se \`nome\` não for texto (string) ou estiver vazio → devolva \`"nome inválido"\`;
- se \`poder\` não for número ou estiver fora de 1 a 100 → devolva \`"poder inválido"\`;
- se tudo estiver certo → devolva \`"ok"\`.

Use \`typeof valor === "string"\` para checar o tipo.`,
    },
    functionName: { python: 'validar_feitico', javascript: 'validarFeitico' },
    starter: {
      python: `def validar_feitico(nome, poder):
    # 1) valide o nome
    # 2) valide o poder
    return "ok"
`,
      javascript: `function validarFeitico(nome, poder) {
  // 1) valide o nome
  // 2) valide o poder
  return "ok";
}
`,
    },
    tests: [
      { args: ['Chama', 50], expected: 'ok' },
      { args: ['', 50], expected: 'nome inválido' },
      { args: ['Gelo', 0], expected: 'poder inválido' },
      { args: ['Raio', 101], expected: 'poder inválido' },
      { args: [42, 10], expected: 'nome inválido', hidden: true },
      { args: ['Luz', '10'], expected: 'poder inválido', hidden: true },
      { args: ['Luz', 1], expected: 'ok', hidden: true },
      { args: ['Luz', 100], expected: 'ok', hidden: true },
      { args: ['Sombra', true], expected: 'poder inválido', hidden: true },
    ],
    hints: [
      'Faça as verificações uma de cada vez, cada uma com seu if e seu return.',
      { python: 'Nome: if not isinstance(nome, str) or nome == "": ...', javascript: 'Nome: if (typeof nome !== "string" || nome === "") { ... }' },
      { python: 'Poder: confira isinstance(poder, bool), depois isinstance(poder, (int, float)) e o intervalo 1 <= poder <= 100.', javascript: 'Poder: confira typeof poder !== "number" e o intervalo poder < 1 || poder > 100.' },
    ],
    mentor: {
      success: 'Nada entra no Core sem passar por você. Validação impecável.',
      failure: 'Olhe os testes ocultos com imaginação: e se o poder vier como texto? E se o nome nem for texto?',
    },
    xp: 75,
    coins: 30,
  },
];
