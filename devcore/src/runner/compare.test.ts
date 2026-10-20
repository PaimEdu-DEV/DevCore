import { describe, expect, it } from 'vitest';
import { buildResult, deepEqual, formatValue, normalizeValue } from './compare';

describe('deepEqual', () => {
  it('compara primitivos e tolera erro de ponto flutuante', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(deepEqual(5 / 3, 1.6666666666666667)).toBe(true);
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(1, true)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('compara listas e objetos em profundidade', () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual({ a: 1, b: [1] }, { b: [1], a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual([], {})).toBe(false);
  });
});

describe('normalizeValue', () => {
  it('converte estruturas não-JSON', () => {
    expect(normalizeValue(new Set([1, 2]))).toEqual([1, 2]);
    expect(normalizeValue(new Map([['a', 1]]))).toEqual({ a: 1 });
    expect(normalizeValue(-0)).toBe(0);
    expect(normalizeValue(() => 1)).toBe('<função>');
    expect(normalizeValue(undefined)).toBeUndefined();
  });

  it('não entra em loop com referências circulares', () => {
    const a: Record<string, unknown> = { x: 1 };
    a.self = a;
    expect(normalizeValue(a)).toEqual({ x: 1, self: '<ciclo>' });
  });
});

describe('formatValue', () => {
  it('usa a sintaxe de cada linguagem', () => {
    expect(formatValue(true, 'python')).toBe('True');
    expect(formatValue(true, 'javascript')).toBe('true');
    expect(formatValue(null, 'python')).toBe('None');
    expect(formatValue(undefined, 'javascript')).toBe('undefined');
    expect(formatValue('oi', 'python')).toBe("'oi'");
    expect(formatValue('oi', 'javascript')).toBe('"oi"');
    expect(formatValue({ vida: 10 }, 'python')).toBe("{'vida': 10}");
    expect(formatValue({ vida: 10 }, 'javascript')).toBe('{vida: 10}');
    expect(formatValue([1, 'a'], 'javascript')).toBe('[1, "a"]');
  });
});

describe('buildResult', () => {
  const tests = [
    { args: [1], expected: 2 },
    { args: [2], expected: 4, hidden: true },
  ];

  it('marca aprovado quando todos os testes passam', () => {
    const r = buildResult({ stdout: 'x\n', stderr: '', outcomes: [{ ok: true, value: 2 }, { ok: true, value: 4 }] }, tests, 'dobro', 'python', 3);
    expect(r.passed).toBe(true);
    expect(r.tests[0]).toMatchObject({ name: 'dobro(1)', ok: true, hidden: false });
    expect(r.tests[1]).toMatchObject({ name: 'teste oculto #2', ok: true, hidden: true });
    expect(r.stdout).toBe('x\n');
  });

  it('propaga o erro de um teste como erro principal', () => {
    const r = buildResult({ stdout: '', stderr: '', outcomes: [{ ok: true, value: 3 }, { ok: false, error: { type: 'ZeroDivisionError', message: 'division by zero', line: 2 } }] }, tests, 'dobro', 'python', 1);
    expect(r.passed).toBe(false);
    expect(r.tests[0].ok).toBe(false);
    expect(r.tests[1].error).toContain('ZeroDivisionError');
    expect(r.error).toEqual({ type: 'ZeroDivisionError', message: 'division by zero', line: 2 });
  });

  it('erro de compilação reprova todos os testes', () => {
    const r = buildResult({ stdout: '', stderr: '', error: { type: 'SyntaxError', message: 'x', line: 1 }, outcomes: [] }, tests, 'dobro', 'javascript', 1);
    expect(r.passed).toBe(false);
    expect(r.tests.every((t) => !t.ok)).toBe(true);
  });
});
