// Núcleo do executor de JavaScript. Roda dentro do Web Worker, mas não depende dele
// (os testes unitários o chamam diretamente no Node).
import { parse } from 'acorn';
import { normalizeValue } from './compare';
import type { RawRun, RunError, TestCase } from './types';

const SHADOWED = ['self', 'globalThis', 'window', 'postMessage', 'close', 'onmessage', 'importScripts', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker'];
const MAX_OUT = 20_000;

function fmt(v: unknown): string {
  if (typeof v === 'string') return v;
  try {
    const n = normalizeValue(v);
    if (n === undefined) return 'undefined';
    return typeof n === 'object' ? JSON.stringify(n) : String(n);
  } catch {
    return String(v);
  }
}

let lineOffset: number | null = null;

function stackLine(err: unknown): number | null {
  const stack = (err as Error)?.stack ?? '';
  // V8 (Chrome/Edge/Node): "... <anonymous>:5:1)"; Firefox: "... > Function:5:1"
  const m = stack.match(/<anonymous>:(\d+):(\d+)/) ?? stack.match(/Function:(\d+):(\d+)/);
  return m ? Number(m[1]) : null;
}

function wrap(code: string, fnName: string): string {
  return `"use strict";\n${code}\n;return (typeof ${fnName} === "function") ? ${fnName} : undefined;`;
}

/** Descobre quantas linhas o motor JS soma ao código dentro de new Function. */
function getLineOffset(): number {
  if (lineOffset !== null) return lineOffset;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(...SHADOWED, 'console', wrap('throw new Error("probe")', 'x'))();
  } catch (e) {
    const l = stackLine(e);
    lineOffset = l !== null ? l - 1 : 2;
  }
  return lineOffset ?? 2;
}

function toRunError(e: unknown, code: string): RunError {
  const err = e as Error;
  const type = err?.name ?? 'Error';
  let message = err?.message ?? String(e);
  let line: number | null = null;
  if (type === 'SyntaxError') {
    try {
      parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
    } catch (pe) {
      const p = pe as { loc?: { line: number }; message: string };
      if (p.loc) line = p.loc.line;
      if (!message) message = p.message;
    }
  } else if (type === 'RangeError' && /call stack/i.test(message)) {
    line = null;
  } else {
    const l = stackLine(err);
    if (l !== null) {
      const user = l - getLineOffset();
      const total = code.split('\n').length;
      if (user >= 1 && user <= total) line = user;
    }
  }
  return { type, message, line };
}

/** Executa o código do jogador e os testes. Síncrono: o timeout é responsabilidade de quem chama. */
export function runJs(code: string, fnName: string, tests: TestCase[]): RawRun {
  let stdout = '';
  let stderr = '';
  const push = (target: 'out' | 'err', args: unknown[]) => {
    const line = args.map(fmt).join(' ') + '\n';
    if (target === 'out') {
      if (stdout.length < MAX_OUT) stdout += line;
    } else if (stderr.length < MAX_OUT) stderr += line;
  };
  const fakeConsole = {
    log: (...a: unknown[]) => push('out', a),
    info: (...a: unknown[]) => push('out', a),
    debug: (...a: unknown[]) => push('out', a),
    table: (...a: unknown[]) => push('out', a),
    warn: (...a: unknown[]) => push('err', a),
    error: (...a: unknown[]) => push('err', a),
  };

  getLineOffset();
  let fn: unknown;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const factory = new Function(...SHADOWED, 'console', wrap(code, fnName));
    fn = factory(...SHADOWED.map(() => undefined), fakeConsole);
  } catch (e) {
    return { stdout, stderr, error: toRunError(e, code), outcomes: [] };
  }
  if (typeof fn !== 'function') {
    return {
      stdout,
      stderr,
      error: { type: 'FunctionNotFound', message: `A função ${fnName} não foi encontrada no seu código.`, line: null },
      outcomes: [],
    };
  }
  const outcomes = tests.map((t) => {
    try {
      const args = structuredClone(t.args);
      const value = (fn as (...a: unknown[]) => unknown)(...args);
      return { ok: true, value: normalizeValue(value) };
    } catch (e) {
      return { ok: false, error: toRunError(e, code) };
    }
  });
  return { stdout, stderr, outcomes };
}
