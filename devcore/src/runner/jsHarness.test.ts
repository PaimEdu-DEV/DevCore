import { describe, expect, it } from 'vitest';
import { runJs } from './jsHarness';
import { buildResult } from './compare';
import { ALL_CHALLENGES } from '../game/data/challenges';
import { SOLUTIONS } from '../game/data/challenges/solutions';

describe('executor de JavaScript', () => {
  it('captura console.log e devolve os valores', () => {
    const raw = runJs('function soma(a, b) {\n  console.log("somando", a, b);\n  return a + b;\n}', 'soma', [{ args: [1, 2], expected: 3 }]);
    expect(raw.error).toBeUndefined();
    expect(raw.stdout).toBe('somando 1 2\n');
    expect(raw.outcomes[0]).toEqual({ ok: true, value: 3 });
  });

  it('aponta a linha de um erro de sintaxe', () => {
    const raw = runJs('function f() {\n  return 1 +;\n}', 'f', []);
    expect(raw.error?.type).toBe('SyntaxError');
    expect(raw.error?.line).toBe(2);
  });

  it('aponta a linha de um erro em tempo de execução', () => {
    const raw = runJs('function f(x) {\n  const a = 1;\n  return x.nada.mais;\n}', 'f', [{ args: [{}], expected: 0 }]);
    expect(raw.outcomes[0].ok).toBe(false);
    expect(raw.outcomes[0].error?.type).toBe('TypeError');
    expect(raw.outcomes[0].error?.line).toBe(3);
  });

  it('acusa ReferenceError com a linha', () => {
    const raw = runJs('function f() {\n  return naoExiste;\n}', 'f', [{ args: [], expected: 1 }]);
    expect(raw.outcomes[0].error?.type).toBe('ReferenceError');
    expect(raw.outcomes[0].error?.line).toBe(2);
  });

  it('avisa quando a função não existe', () => {
    const raw = runJs('const x = 1;', 'soma', [{ args: [], expected: 1 }]);
    expect(raw.error?.type).toBe('FunctionNotFound');
  });

  it('não deixa o teste mutar os argumentos dos próximos', () => {
    const tests = [{ args: [[1]], expected: 2 }];
    runJs('function f(l) { l.push(9); return l.length; }', 'f', tests);
    expect(tests[0].args).toEqual([[1]]);
  });

  it('bloqueia o acesso à rede pelo nome global', () => {
    const raw = runJs('function f() { return typeof fetch; }', 'f', [{ args: [], expected: 'undefined' }]);
    expect(raw.outcomes[0]).toEqual({ ok: true, value: 'undefined' });
  });

  it('estouro de pilha vira RangeError', () => {
    const raw = runJs('function f(n) { return f(n + 1); }', 'f', [{ args: [0], expected: 0 }]);
    expect(raw.outcomes[0].error?.type).toBe('RangeError');
  });
});

describe('conteúdo pedagógico (JavaScript)', () => {
  for (const ch of ALL_CHALLENGES) {
    it(`${ch.id}: a solução passa em todos os testes`, () => {
      const sol = SOLUTIONS[ch.id];
      expect(sol, `falta solução para ${ch.id}`).toBeDefined();
      const raw = runJs(sol.javascript, ch.functionName.javascript, ch.tests);
      const r = buildResult(raw, ch.tests, ch.functionName.javascript, 'javascript', 0);
      expect(r.error).toBeUndefined();
      expect(r.tests.filter((t) => !t.ok).map((t) => `${t.name}: recebido ${JSON.stringify(t.received)}`)).toEqual([]);
    });

    it(`${ch.id}: o código inicial NÃO passa (há algo a fazer)`, () => {
      const raw = runJs(ch.starter.javascript, ch.functionName.javascript, ch.tests);
      const r = buildResult(raw, ch.tests, ch.functionName.javascript, 'javascript', 0);
      expect(r.passed).toBe(false);
    });
  }

  it('todo desafio tem dicas em 3 níveis, testes visíveis e ocultos', () => {
    for (const ch of ALL_CHALLENGES) {
      expect(ch.hints).toHaveLength(3);
      expect(ch.tests.some((t) => !t.hidden)).toBe(true);
      expect(ch.tests.some((t) => t.hidden)).toBe(true);
      expect(ch.starter.python.length).toBeGreaterThan(0);
    }
  });

  it('quantidade de desafios por vilão segue o plano', () => {
    const count = (v: string, k: string) => ALL_CHALLENGES.filter((c) => c.villain === v && c.kind === k).length;
    expect([count('aldric', 'lesson'), count('aldric', 'boss')]).toEqual([3, 2]);
    expect([count('veyr', 'lesson'), count('veyr', 'boss')]).toEqual([3, 2]);
    expect([count('seraphine', 'lesson'), count('seraphine', 'boss')]).toEqual([3, 2]);
    expect([count('entity', 'lesson'), count('entity', 'boss')]).toEqual([2, 3]);
    expect(ALL_CHALLENGES.filter((c) => c.kind === 'extra')).toHaveLength(10);
  });
});
