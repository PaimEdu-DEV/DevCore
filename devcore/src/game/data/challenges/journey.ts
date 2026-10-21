import { same, type Challenge, type LText } from './types';
import type { VillainId } from '../../state/save';

// Jornada (modo feira): desafios curtos de UMA linha de lógica.
// Capangas ("bugs") guardam o caminho até cada chefe; as fases dos chefes também são rápidas.

type Base = Omit<Challenge, 'kind' | 'villain' | 'xp' | 'coins' | 'mentor'> & { mentor?: Challenge['mentor'] };

const MINION_MENTOR = { success: 'Bug esmagado! Siga em frente.', failure: 'Quase! Olhe o esperado e o recebido nos testes.' };
const BOSS_MENTOR = { success: 'Golpe certeiro!', failure: 'Ele resistiu. Compare o esperado com o recebido e tente de novo.' };

const minion = (villain: VillainId, c: Base): Challenge => ({ kind: 'minion', villain, xp: 15, coins: 5, mentor: MINION_MENTOR, ...c });
const boss = (villain: VillainId, phase: number, c: Base): Challenge => ({ kind: 'boss', villain, phase, xp: 40, coins: 15, mentor: BOSS_MENTOR, ...c });

type Lang = 'python' | 'javascript';
type PerLang = string | Record<Lang, string>;
const at = (v: PerLang, lang: Lang) => (typeof v === 'string' ? v : v[lang]);
const BOOL = { True: { python: 'True', javascript: 'true' }, False: { python: 'False', javascript: 'false' } };

/** Código inicial com um if/else pronto; o jogador completa a condição ou os retornos. */
const ifElse = (fn: Record<Lang, string>, param: string, cond: PerLang, a: PerLang, b: PerLang): Record<Lang, string> => ({
  python: `def ${fn.python}(${param}):\n    if ${at(cond, 'python')}:\n        return ${at(a, 'python')}\n    else:\n        return ${at(b, 'python')}\n`,
  javascript: `function ${fn.javascript}(${param}) {\n  if (${at(cond, 'javascript')}) {\n    return ${at(a, 'javascript')};\n  } else {\n    return ${at(b, 'javascript')};\n  }\n}\n`,
});

const oneLiner = (fn: { python: string; javascript: string }, params: string, comment: LText, ret = '0'): Record<'python' | 'javascript', string> => {
  const c = (lang: 'python' | 'javascript') => (typeof comment === 'string' ? comment : comment[lang]);
  return {
    python: `def ${fn.python}(${params}):\n    # ${c('python')}\n    return ${ret}\n`,
    javascript: `function ${fn.javascript}(${params}) {\n  // ${c('javascript')}\n  return ${ret};\n}\n`,
  };
};

// ---------------- Área 1 · Estrada do Portão (Aldric): somar ----------------
const AREA1: Challenge[] = [
  minion('aldric', {
    id: 'bug-soma',
    concept: 'basics',
    title: 'Bug da Soma',
    statement: 'Este bug só cai se você **somar** dois números. Faça `{fn}(a, b)` devolver `a + b`.',
    functionName: same('soma'),
    starter: oneLiner(same('soma'), 'a, b', 'troque o 0 pela soma de a com b'),
    tests: [
      { args: [2, 3], expected: 5 },
      { args: [10, 5], expected: 15 },
      { args: [0, 7], expected: 7, hidden: true },
    ],
    hints: ['Somar é com o sinal +.', 'Escreva a + b no lugar do 0.', { python: 'return a + b', javascript: 'return a + b;' }],
  }),
  minion('aldric', {
    id: 'bug-cura',
    concept: 'basics',
    title: 'Bug da Poção',
    statement: 'O bug roubou sua poção! Faça `{fn}(vida, cura)` devolver a vida **mais** a cura.',
    functionName: same('curar'),
    starter: oneLiner(same('curar'), 'vida, cura', 'devolva vida + cura'),
    tests: [
      { args: [50, 20], expected: 70 },
      { args: [1, 99], expected: 100 },
      { args: [30, 0], expected: 30, hidden: true },
    ],
    hints: ['É uma soma de novo.', 'vida + cura', { python: 'return vida + cura', javascript: 'return vida + cura;' }],
  }),
];

const ALDRIC_BOSS: Challenge[] = [
  boss('aldric', 1, {
    id: 'aldric-b1',
    concept: 'basics',
    title: 'Força em dobro',
    statement: 'Aldric baixou a guarda! Faça `{fn}(forca)` devolver o **dobro** da força (multiplique por 2 com `*`).',
    functionName: same('dobro'),
    starter: oneLiner(same('dobro'), 'forca', 'devolva forca vezes 2'),
    tests: [
      { args: [5], expected: 10 },
      { args: [21], expected: 42 },
      { args: [0], expected: 0, hidden: true },
    ],
    hints: ['Multiplicar é com *.', 'forca * 2', { python: 'return forca * 2', javascript: 'return forca * 2;' }],
  }),
  boss('aldric', 2, {
    id: 'aldric-b2',
    concept: 'basics',
    title: 'Atravesse o escudo',
    statement: 'Agora ele levanta o escudo. Faça `{fn}(forca, escudo)` devolver a força **menos** o escudo.',
    functionName: same('dano'),
    starter: oneLiner(same('dano'), 'forca, escudo', 'devolva forca - escudo'),
    tests: [
      { args: [10, 4], expected: 6 },
      { args: [50, 20], expected: 30 },
      { args: [7, 7], expected: 0, hidden: true },
    ],
    hints: ['Subtrair é com -.', 'forca - escudo', { python: 'return forca - escudo', javascript: 'return forca - escudo;' }],
  }),
];

// ---------------- Área 2 · Floresta Sombria (Veyr): if/else e par ----------------
const AREA2: Challenge[] = [
  minion('veyr', {
    id: 'bug-par-impar',
    concept: 'basics',
    title: 'Bug Par ou Ímpar',
    statement: 'O `if` já está pronto: ele testa se `n` é par (resto da divisão por 2 igual a 0). Complete os dois `return`: devolva `"par"` no `if` e `"impar"` no `else`.',
    functionName: { python: 'par_ou_impar', javascript: 'parOuImpar' },
    starter: ifElse({ python: 'par_ou_impar', javascript: 'parOuImpar' }, 'n', { python: 'n % 2 == 0', javascript: 'n % 2 === 0' }, '""', '""'),
    tests: [
      { args: [4], expected: 'par' },
      { args: [7], expected: 'impar' },
      { args: [0], expected: 'par', hidden: true },
      { args: [13], expected: 'impar', hidden: true },
    ],
    hints: ['Escreva o texto dentro das aspas.', 'No primeiro return vai "par"; no segundo, "impar" (sem acento).', { python: 'return "par" ... else: return "impar"', javascript: 'return "par"; ... else { return "impar"; }' }],
  }),
  minion('veyr', {
    id: 'bug-eh-par',
    concept: 'basics',
    title: 'Bug do Resto',
    statement: 'Agora é você quem escreve a **condição** do `if`. Troque `{False}` pela pergunta "n é par?": `n % 2 == 0`.',
    functionName: { python: 'eh_par', javascript: 'ehPar' },
    starter: ifElse({ python: 'eh_par', javascript: 'ehPar' }, 'n', BOOL.False, BOOL.True, BOOL.False),
    tests: [
      { args: [8], expected: true },
      { args: [3], expected: false },
      { args: [10], expected: true, hidden: true },
    ],
    hints: ['% dá o resto da divisão.', 'Se n % 2 for 0, o número é par.', { python: 'if n % 2 == 0:', javascript: 'if (n % 2 === 0) {' }],
  }),
];

const VEYR_BOSS: Challenge[] = [
  boss('veyr', 1, {
    id: 'veyr-b1',
    concept: 'basics',
    title: 'Esquiva',
    statement: 'Veyr ataca alto ou baixo. Complete `{fn}(golpe)`: se o golpe for `"alto"`, devolva `"abaixar"`; senão, devolva `"pular"`.',
    functionName: same('esquivar'),
    starter: ifElse(same('esquivar'), 'golpe', { python: 'golpe == "alto"', javascript: 'golpe === "alto"' }, '""', '""'),
    tests: [
      { args: ['alto'], expected: 'abaixar' },
      { args: ['baixo'], expected: 'pular' },
      { args: ['alto'], expected: 'abaixar', hidden: true },
    ],
    hints: ['O if já pergunta se o golpe é "alto".', 'Golpe alto: abaixe. Senão: pule.', { python: 'return "abaixar" ... else: return "pular"', javascript: 'return "abaixar"; ... else { return "pular"; }' }],
  }),
  boss('veyr', 2, {
    id: 'veyr-b2',
    concept: 'basics',
    title: 'O maior golpe',
    statement: 'Escolha o golpe mais forte. Em `{fn}(a, b)`, troque `{False}` pela condição "a é maior que b?" (`a > b`).',
    functionName: same('maior'),
    starter: ifElse(same('maior'), 'a, b', BOOL.False, 'a', 'b'),
    tests: [
      { args: [9, 4], expected: 9 },
      { args: [2, 6], expected: 6 },
      { args: [15, 3], expected: 15, hidden: true },
    ],
    hints: ['Use o sinal >.', 'A condição é a > b.', { python: 'if a > b:', javascript: 'if (a > b) {' }],
  }),
];

// ---------------- Área 3 · Ruínas de Cristal (Seraphine): textos ----------------
const AREA3: Challenge[] = [
  minion('seraphine', {
    id: 'bug-saudacao',
    concept: 'basics',
    title: 'Bug Mal-educado',
    statement: 'Junte textos com `+`. Faça `{fn}(nome)` devolver `"Oi, "` seguido do nome. Ex.: `{fn}("Ana")` → `"Oi, Ana"`.',
    functionName: same('saudacao'),
    starter: oneLiner(same('saudacao'), 'nome', 'junte "Oi, " com o nome', '""'),
    tests: [
      { args: ['Ana'], expected: 'Oi, Ana' },
      { args: ['Orwin'], expected: 'Oi, Orwin' },
      { args: ['Core'], expected: 'Oi, Core', hidden: true },
    ],
    hints: ['Textos ficam entre aspas.', 'Junte com +: "Oi, " + nome', { python: 'return "Oi, " + nome', javascript: 'return "Oi, " + nome;' }],
  }),
  minion('seraphine', {
    id: 'bug-grito',
    concept: 'basics',
    title: 'Bug Sussurrante',
    statement: { python: 'Faça `{fn}(texto)` devolver o texto em MAIÚSCULAS com `texto.upper()`.', javascript: 'Faça `{fn}(texto)` devolver o texto em MAIÚSCULAS com `texto.toUpperCase()`.' },
    functionName: same('gritar'),
    starter: oneLiner(same('gritar'), 'texto', { python: 'use texto.upper()', javascript: 'use texto.toUpperCase()' }, 'texto'),
    tests: [
      { args: ['ola'], expected: 'OLA' },
      { args: ['core'], expected: 'CORE' },
      { args: ['bug'], expected: 'BUG', hidden: true },
    ],
    hints: ['Existe um comando pronto para isso.', { python: 'texto.upper()', javascript: 'texto.toUpperCase()' }, { python: 'return texto.upper()', javascript: 'return texto.toUpperCase();' }],
  }),
];

const SERAPHINE_BOSS: Challenge[] = [
  boss('seraphine', 1, {
    id: 'seraphine-b1',
    concept: 'basics',
    title: 'Conte as cópias',
    statement: 'Seraphine se divide! Cada cópia vira **duas**. Faça `{fn}(n)` devolver `n * 2`.',
    functionName: same('copias'),
    starter: oneLiner(same('copias'), 'n', 'cada cópia vira duas'),
    tests: [
      { args: [3], expected: 6 },
      { args: [1], expected: 2 },
      { args: [10], expected: 20, hidden: true },
    ],
    hints: ['Duas vezes n.', 'n * 2', { python: 'return n * 2', javascript: 'return n * 2;' }],
  }),
  boss('seraphine', 2, {
    id: 'seraphine-b2',
    concept: 'basics',
    title: 'O nome verdadeiro',
    statement: 'Diga o nome dela para quebrar o feitiço. Faça `{fn}(nome)` devolver `"Eu vejo você, "` + nome + `"!"`. Ex.: `{fn}("Seraphine")` → `"Eu vejo você, Seraphine!"`.',
    functionName: same('revelar'),
    starter: oneLiner(same('revelar'), 'nome', 'junte os três pedaços com +', '""'),
    tests: [
      { args: ['Seraphine'], expected: 'Eu vejo você, Seraphine!' },
      { args: ['Ana'], expected: 'Eu vejo você, Ana!' },
      { args: ['Core'], expected: 'Eu vejo você, Core!', hidden: true },
    ],
    hints: ['São três pedaços: o começo, o nome e a exclamação.', '"Eu vejo você, " + nome + "!"', { python: 'return "Eu vejo você, " + nome + "!"', javascript: 'return "Eu vejo você, " + nome + "!";' }],
  }),
];

// ---------------- Área 4 · O Núcleo (Entidade): tudo junto ----------------
const AREA4: Challenge[] = [
  minion('entity', {
    id: 'bug-media',
    concept: 'mixed',
    title: 'Bug da Média',
    statement: 'Faça `{fn}(a, b)` devolver a **média**: some os dois e divida por 2. Use parênteses: `(a + b) / 2`.',
    functionName: same('media'),
    starter: oneLiner(same('media'), 'a, b', 'some e divida por 2'),
    tests: [
      { args: [4, 6], expected: 5 },
      { args: [10, 20], expected: 15 },
      { args: [3, 4], expected: 3.5, hidden: true },
    ],
    hints: ['Primeiro some, depois divida.', 'Os parênteses fazem a soma acontecer antes.', { python: 'return (a + b) / 2', javascript: 'return (a + b) / 2;' }],
  }),
  minion('entity', {
    id: 'bug-senha',
    concept: 'mixed',
    title: 'Bug Porteiro',
    statement: 'Complete `{fn}(senha)`: se a senha for `"core"`, devolva `"entrar"`; senão, devolva `"bloqueado"`.',
    functionName: same('portao'),
    starter: ifElse(same('portao'), 'senha', { python: 'senha == ""', javascript: 'senha === ""' }, '"entrar"', '"bloqueado"'),
    tests: [
      { args: ['core'], expected: 'entrar' },
      { args: ['1234'], expected: 'bloqueado' },
      { args: ['Core'], expected: 'bloqueado', hidden: true },
    ],
    hints: ['Os dois return já estão prontos.', 'Falta escrever a senha certa dentro das aspas do if.', { python: 'if senha == "core":', javascript: 'if (senha === "core") {' }],
  }),
];

const ENTITY_BOSS: Challenge[] = [
  boss('entity', 1, {
    id: 'entity-b1',
    concept: 'mixed',
    title: 'Três sinais',
    statement: 'A Entidade embaralha o Core. Faça `{fn}(a, b, c)` devolver a soma dos três.',
    functionName: { python: 'somar_tres', javascript: 'somarTres' },
    starter: oneLiner({ python: 'somar_tres', javascript: 'somarTres' }, 'a, b, c', 'some os três'),
    tests: [
      { args: [1, 2, 3], expected: 6 },
      { args: [10, 0, 5], expected: 15 },
      { args: [7, 7, 7], expected: 21, hidden: true },
    ],
    hints: ['Igual à soma de dois, com mais um +.', 'a + b + c', { python: 'return a + b + c', javascript: 'return a + b + c;' }],
  }),
  boss('entity', 2, {
    id: 'entity-b2',
    concept: 'mixed',
    title: 'Sem números negativos',
    statement: 'Ela injeta valores negativos! Em `{fn}(n)`, troque `{False}` pela condição "n é menor que 0?" (`n < 0`). Assim negativos viram 0.',
    functionName: same('corrigir'),
    starter: ifElse(same('corrigir'), 'n', BOOL.False, '0', 'n'),
    tests: [
      { args: [-5], expected: 0 },
      { args: [8], expected: 8 },
      { args: [-1], expected: 0, hidden: true },
      { args: [0], expected: 0, hidden: true },
    ],
    hints: ['Use o sinal <.', 'A condição é n < 0.', { python: 'if n < 0:', javascript: 'if (n < 0) {' }],
  }),
  boss('entity', 3, {
    id: 'entity-b3',
    concept: 'mixed',
    title: 'O golpe final',
    statement: 'O laço já percorre a lista. Dentro dele, some cada número `n` ao `total`. É só uma linha!',
    functionName: { python: 'somar_lista', javascript: 'somarLista' },
    starter: {
      python: 'def somar_lista(numeros):\n    total = 0\n    for n in numeros:\n        # some n ao total\n        pass\n    return total\n',
      javascript: 'function somarLista(numeros) {\n  let total = 0;\n  for (const n of numeros) {\n    // some n ao total\n  }\n  return total;\n}\n',
    },
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[10, 20]], expected: 30 },
      { args: [[5]], expected: 5, hidden: true },
    ],
    hints: ['Some n ao total a cada volta.', 'total = total + n', { python: 'total += n  (no lugar do pass)', javascript: 'total += n;' }],
  }),
];

export const JOURNEY_CHALLENGES: Challenge[] = [...AREA1, ...ALDRIC_BOSS, ...AREA2, ...VEYR_BOSS, ...AREA3, ...SERAPHINE_BOSS, ...AREA4, ...ENTITY_BOSS];
