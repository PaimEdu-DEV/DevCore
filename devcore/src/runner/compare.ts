import type { Language, RawRun, RunResult, TestCase, TestResult } from './types';

const EPS = 1e-9;

/** Igualdade profunda para valores serializáveis em JSON (números com tolerância de ponto flutuante). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    if (a === b) return true;
    return Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
  }
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) return false;
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

/**
 * Converte qualquer valor JS em algo seguro de transportar/comparar:
 * Map → objeto, Set → array, funções → '<função>', -0 → 0, ciclos → '<ciclo>'.
 * `undefined` é preservado (para mostrar "undefined" e sugerir o return esquecido).
 */
export function normalizeValue(v: unknown, seen = new WeakSet<object>()): unknown {
  if (v === undefined || v === null) return v;
  if (typeof v === 'number') return Object.is(v, -0) ? 0 : v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'function') return '<função>';
  if (typeof v === 'symbol') return v.toString();
  if (typeof v === 'object') {
    if (seen.has(v)) return '<ciclo>';
    seen.add(v);
    if (Array.isArray(v)) return v.map((x) => normalizeValue(x, seen));
    if (v instanceof Map) return Object.fromEntries([...v.entries()].map(([k, x]) => [String(k), normalizeValue(x, seen)]));
    if (v instanceof Set) return [...v].map((x) => normalizeValue(x, seen));
    if (v instanceof Date) return v.toISOString();
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = normalizeValue(x, seen);
    return out;
  }
  return String(v);
}

/** Mostra um valor com a sintaxe da linguagem do jogador. */
export function formatValue(v: unknown, lang: Language): string {
  const py = lang === 'python';
  if (v === undefined) return py ? 'None' : 'undefined';
  if (v === null) return py ? 'None' : 'null';
  if (typeof v === 'boolean') return py ? (v ? 'True' : 'False') : String(v);
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return py ? 'nan' : 'NaN';
    if (!Number.isFinite(v)) return v > 0 ? (py ? 'inf' : 'Infinity') : py ? '-inf' : '-Infinity';
    return String(v);
  }
  if (typeof v === 'string') return py ? `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map((x) => formatValue(x, lang)).join(', ')}]`;
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).map(([k, x]) => `${py ? `'${k}'` : /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${formatValue(x, lang)}`);
    return `{${entries.join(', ')}}`;
  }
  return String(v);
}

export function testName(t: TestCase, fn: string, lang: Language): string {
  if (t.name) return t.name;
  return `${fn}(${t.args.map((a) => formatValue(a, lang)).join(', ')})`;
}

/** Junta a saída crua do worker com os casos de teste e produz o RunResult final. */
export function buildResult(raw: RawRun, tests: TestCase[], fnName: string, lang: Language, timeMs: number): RunResult {
  const results: TestResult[] = tests.map((t, i) => {
    const o = raw.outcomes[i];
    const hidden = !!t.hidden;
    const name = hidden ? `teste oculto #${i + 1}` : testName(t, fnName, lang);
    if (!o) return { name, ok: false, expected: t.expected, received: undefined, hidden, error: raw.error ? `${raw.error.type}: ${raw.error.message}` : 'não executado' };
    if (!o.ok) return { name, ok: false, expected: t.expected, received: undefined, hidden, error: o.error ? `${o.error.type}: ${o.error.message}` : 'erro' };
    return { name, ok: deepEqual(o.value, t.expected), expected: t.expected, received: o.value, hidden };
  });
  // Erro de teste (ex.: ZeroDivisionError dentro da função) vira o erro principal se não houver outro.
  const firstTestError = raw.outcomes.find((o) => !o.ok && o.error)?.error;
  const error = raw.error ?? firstTestError;
  return {
    passed: !raw.error && results.length > 0 && results.every((r) => r.ok),
    tests: results,
    stdout: raw.stdout,
    stderr: raw.stderr,
    error,
    timeMs,
  };
}
