import { describe, expect, it } from 'vitest';
import { mentorFeedback, translateError } from './errorTranslator';
import type { RunResult } from './types';

const t = (type: string, message = '', line: number | null = 3) => ({ type, message, line });

describe('translateError', () => {
  it('traduz erros comuns de Python para português, com a linha', () => {
    expect(translateError(t('IndentationError', 'expected an indented block'), 'python')).toMatch(/recuo \(linha 3\)/);
    expect(translateError(t('SyntaxError', "expected ':'"), 'python')).toMatch(/dois-pontos/);
    expect(translateError(t('NameError', "name 'totl' is not defined"), 'python')).toMatch(/"totl" não existe/);
    expect(translateError(t('TypeError', 'can only concatenate str (not "int") to str'), 'python')).toMatch(/Tipos misturados/);
    expect(translateError(t('ZeroDivisionError', 'division by zero'), 'python')).toMatch(/Divisão por zero/);
    expect(translateError(t('IndexError', 'list index out of range'), 'python')).toMatch(/posição que não existe/);
    expect(translateError(t('KeyError', "'vida'"), 'python')).toMatch(/chave 'vida'/);
    expect(translateError(t('RecursionError', 'maximum recursion depth exceeded'), 'python')).toMatch(/caso-base/);
  });

  it('traduz erros comuns de JavaScript', () => {
    expect(translateError(t('ReferenceError', 'totl is not defined'), 'javascript')).toMatch(/"totl" não existe/);
    expect(translateError(t('TypeError', 'x.map is not a function'), 'javascript')).toMatch(/não é função/);
    expect(translateError(t('TypeError', "Cannot read properties of undefined (reading 'a')"), 'javascript')).toMatch(/undefined ou null/);
    expect(translateError(t('SyntaxError', 'Unexpected end of input', 5), 'javascript')).toMatch(/linha 5/);
    expect(translateError(t('RangeError', 'Maximum call stack size exceeded', null), 'javascript')).toMatch(/caso-base/);
    expect(translateError(t('TimeoutError', 'x', null), 'javascript')).toMatch(/laço/);
  });

  it('nunca devolve texto vazio, mesmo para erros desconhecidos', () => {
    expect(translateError(t('WeirdError', '???'), 'python').length).toBeGreaterThan(10);
  });
});

describe('mentorFeedback', () => {
  const base: RunResult = { passed: false, tests: [], stdout: '', stderr: '', timeMs: 1 };

  it('detecta return esquecido', () => {
    const r = { ...base, tests: [{ name: 'f(1)', ok: false, expected: 2, received: undefined, hidden: false }] };
    expect(mentorFeedback(r, 'javascript')).toMatch(/return/);
  });

  it('menciona testes ocultos quando só eles falham', () => {
    const r = {
      ...base,
      tests: [
        { name: 'f(1)', ok: true, expected: 2, received: 2, hidden: false },
        { name: 'teste oculto #2', ok: false, expected: 0, received: 1, hidden: true },
      ],
    };
    expect(mentorFeedback(r, 'python')).toMatch(/oculto/);
  });
});
