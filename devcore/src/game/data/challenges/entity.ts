import { same, type Challenge } from './types';

// A Entidade: try/except (try/catch), validação e tudo junto. 2 lições + 3 fases.
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
  {
    id: 'entity-b1',
    concept: 'errors',
    villain: 'entity',
    kind: 'boss',
    phase: 1,
    title: 'Comandos corrompidos',
    statement: {
      python: `A Entidade envia comandos ao Core, mas mistura ruído entre eles. Cada comando é um **texto** que deveria ser um número inteiro: \`"10"\`, \`"-3"\`, \`"abc"\`, \`""\`...

Escreva \`{fn}(entradas)\` que soma só os comandos válidos e ignora o resto.

Exemplo: \`{fn}(["10", "x", "5"])\` → \`15\`.

Dica: \`int("abc")\` lança \`ValueError\`. Trate isso dentro do laço.`,
      javascript: `A Entidade envia comandos ao Core, mas mistura ruído entre eles. Cada comando é um **texto** que deveria ser um número inteiro: \`"10"\`, \`"-3"\`, \`"abc"\`, \`""\`...

Escreva \`{fn}(entradas)\` que soma só os comandos válidos e ignora o resto.

Exemplo: \`{fn}(["10", "x", "5"])\` → \`15\`.

Dica: \`Number("abc")\` dá \`NaN\` e \`Number("")\` dá \`0\` (!). Valide com \`Number.isInteger\` e confira se o texto não está vazio.`,
    },
    functionName: { python: 'somar_validos', javascript: 'somarValidos' },
    starter: {
      python: `def somar_validos(entradas):
    total = 0
    for texto in entradas:
        # tente converter com int(); se falhar, ignore
        pass
    return total
`,
      javascript: `function somarValidos(entradas) {
  let total = 0;
  for (const texto of entradas) {
    // converta e some só se for um inteiro válido
  }
  return total;
}
`,
    },
    tests: [
      { args: [['10', 'x', '5']], expected: 15 },
      { args: [['-3', '3', 'abc']], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [['', ' ', '7']], expected: 7, hidden: true },
      { args: [['100', '2.5', 'dez', '1']], expected: 101, hidden: true },
    ],
    hints: [
      'Um laço pelos textos; para cada um, uma tentativa de conversão.',
      { python: 'Dentro do for: try: total += int(texto) / except ValueError: pass', javascript: 'Dentro do for: const n = Number(texto); some só se texto.trim() !== "" e Number.isInteger(n).' },
      { python: 'Repare que "2.5" não é inteiro: int("2.5") também dá ValueError, então é ignorado.', javascript: 'Repare que "2.5" não é inteiro: Number.isInteger(2.5) é false, então é ignorado.' },
    ],
    mentor: {
      success: 'Ruído filtrado. A Entidade não engana você com lixo.',
      failure: 'Algum lixo passou pela peneira, ou algum número bom ficou de fora. Teste "" e "2.5".',
    },
    xp: 130,
    coins: 50,
  },
  {
    id: 'entity-b2',
    concept: 'errors',
    villain: 'entity',
    kind: 'boss',
    phase: 2,
    title: 'Fora do alcance',
    statement: {
      python: `A Entidade embaralha o Core: você recebe uma lista e uma posição (\`indice\`).

Escreva \`{fn}(lista, indice)\`:

- devolva o **dobro** do valor naquela posição;
- se a posição não existir → \`"fora do alcance"\`;
- se o valor não for número (\`int\` ou \`float\`) → \`"valor corrompido"\`.

Posições negativas também valem em Python (\`-1\` é o último). Use \`try\`/\`except IndexError\`.`,
      javascript: `A Entidade embaralha o Core: você recebe uma lista e uma posição (\`indice\`).

Escreva \`{fn}(lista, indice)\`:

- devolva o **dobro** do valor naquela posição;
- se a posição não existir → \`"fora do alcance"\`;
- se o valor não for número → \`"valor corrompido"\`.

Em JavaScript, ler uma posição que não existe não lança erro: devolve \`undefined\`. Para aceitar posições negativas (\`-1\` é o último), use \`lista.at(indice)\`.`,
    },
    functionName: same('executar'),
    starter: {
      python: `def executar(lista, indice):
    # pegue o valor com segurança e valide antes de dobrar
    return lista[indice] * 2
`,
      javascript: `function executar(lista, indice) {
  // pegue o valor com segurança e valide antes de dobrar
  return lista[indice] * 2;
}
`,
    },
    tests: [
      { args: [[1, 2, 3], 1], expected: 4 },
      { args: [[1, 2, 3], 5], expected: 'fora do alcance' },
      { args: [[1, 'x', 3], 1], expected: 'valor corrompido' },
      { args: [[10, 20], -1], expected: 40, hidden: true },
      { args: [[], 0], expected: 'fora do alcance', hidden: true },
      { args: [[null, 2], 0], expected: 'valor corrompido', hidden: true },
      { args: [[1.5], 0], expected: 3, hidden: true },
    ],
    hints: [
      'São dois perigos: posição inexistente e valor que não é número. Trate cada um.',
      { python: 'try: valor = lista[indice] / except IndexError: return "fora do alcance"', javascript: 'const valor = lista.at(indice); se valor === undefined, a posição não existe.' },
      { python: 'Depois: if not isinstance(valor, (int, float)) or isinstance(valor, bool): return "valor corrompido"', javascript: 'Depois: if (typeof valor !== "number") return "valor corrompido";' },
    ],
    mentor: {
      success: 'Você não acessou nada que não existia e não confiou em nada que não era número.',
      failure: 'Algum caso escapou. Teste uma lista vazia e uma posição negativa.',
    },
    xp: 150,
    coins: 55,
  },
  {
    id: 'entity-b3',
    concept: 'mixed',
    villain: 'entity',
    kind: 'boss',
    phase: 3,
    title: 'O relatório final',
    statement: `Último golpe. O Core registra cada ação da batalha como um dicionário (objeto) com \`"tipo"\` e \`"valor"\`. A Entidade corrompeu alguns registros.

Escreva \`{fn}(registros)\` que devolve um dicionário \`{"total": ..., "erros": ...}\`:

- tipo \`"ataque"\` → soma o valor ao total;
- tipo \`"defesa"\` → subtrai **metade** do valor (divisão inteira) do total;
- qualquer registro inválido (sem \`"tipo"\`, tipo desconhecido, sem \`"valor"\` ou valor que não é número) → não mexe no total e conta **1 erro**.

Exemplo: \`[{"tipo": "ataque", "valor": 10}, {"tipo": "defesa", "valor": 5}, {"tipo": "???"}]\` → \`{"total": 8, "erros": 1}\`

Tudo o que você aprendeu cabe aqui: laço, if, funções, validação.`,
    functionName: same('relatorio'),
    starter: {
      python: `def relatorio(registros):
    total = 0
    erros = 0
    for r in registros:
        # valide o registro e aplique o efeito
        pass
    return {"total": total, "erros": erros}
`,
      javascript: `function relatorio(registros) {
  let total = 0;
  let erros = 0;
  for (const r of registros) {
    // valide o registro e aplique o efeito
  }
  return { total: total, erros: erros };
}
`,
    },
    tests: [
      { args: [[{ tipo: 'ataque', valor: 10 }, { tipo: 'defesa', valor: 5 }, { tipo: '???' }]], expected: { total: 8, erros: 1 } },
      { args: [[]], expected: { total: 0, erros: 0 } },
      { args: [[{ tipo: 'ataque', valor: 3 }, { tipo: 'ataque', valor: 4 }]], expected: { total: 7, erros: 0 } },
      { args: [[{ valor: 9 }, { tipo: 'ataque' }, { tipo: 'ataque', valor: 'muito' }]], expected: { total: 0, erros: 3 }, hidden: true },
      { args: [[{ tipo: 'defesa', valor: 7 }, { tipo: 'ataque', valor: 1 }]], expected: { total: -2, erros: 0 }, hidden: true },
      { args: [[{ tipo: 'ataque', valor: 50 }, { tipo: 'cura', valor: 10 }, { tipo: 'defesa', valor: 20 }]], expected: { total: 40, erros: 1 }, hidden: true },
    ],
    hints: [
      'Para cada registro, primeiro descubra se ele é válido. Só depois aplique o efeito.',
      {
        python: 'Leia com segurança: tipo = r.get("tipo") e valor = r.get("valor"). Válido = tipo em ("ataque", "defesa") e valor é int/float (e não bool).',
        javascript: 'Leia: const tipo = r.tipo; const valor = r.valor. Válido = (tipo === "ataque" || tipo === "defesa") && typeof valor === "number".',
      },
      {
        python: 'Metade inteira: valor // 2. Inválido? erros += 1 e continue para o próximo.',
        javascript: 'Metade inteira: Math.floor(valor / 2). Inválido? erros += 1 e continue para o próximo.',
      },
    ],
    mentor: {
      success: 'Relatório limpo, Core livre. Isso, {nome}, é programar de verdade.',
      failure: 'Algum registro corrompido passou. Para cada teste oculto, pense: o que pode faltar num registro?',
    },
    xp: 220,
    coins: 90,
  },
];
