// Interface única do motor de execução: run({ language, code, challenge }) => Promise<RunResult>.
import { buildResult } from './compare';
import type { RawRun, RunRequest, RunResult } from './types';

export type { RunResult, RunRequest, Language, TestCase, TestResult, RunError, RunnableChallenge } from './types';

export const JS_TIMEOUT_MS = 2500;
export const PY_TIMEOUT_MS = 5000;

// ---------------- JavaScript ----------------
let jsWorker: Worker | null = null;
let seq = 0;

function getJsWorker(): Worker {
  jsWorker ??= new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module', name: 'devcore-js' });
  return jsWorker;
}

function timeoutResult(req: RunRequest, ms: number, timeMs: number): RunResult {
  const fn = req.challenge.functionName[req.language];
  return buildResult(
    {
      stdout: '',
      stderr: '',
      error: { type: 'TimeoutError', message: `O código passou de ${ms / 1000}s e foi interrompido. Provavelmente um laço que nunca termina.`, line: null },
      outcomes: [],
    },
    req.challenge.tests,
    fn,
    req.language,
    timeMs,
  );
}

function runJs(req: RunRequest): Promise<RunResult> {
  const fnName = req.challenge.functionName.javascript;
  const id = ++seq;
  const start = performance.now();
  return new Promise((resolve) => {
    const w = getJsWorker();
    const timer = window.setTimeout(() => {
      w.terminate();
      jsWorker = null;
      resolve(timeoutResult(req, JS_TIMEOUT_MS, performance.now() - start));
    }, JS_TIMEOUT_MS);
    const onMsg = (e: MessageEvent<{ id: number; raw: RawRun }>) => {
      if (e.data.id !== id) return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMsg);
      resolve(buildResult(e.data.raw, req.challenge.tests, fnName, 'javascript', performance.now() - start));
    };
    w.addEventListener('message', onMsg);
    w.addEventListener(
      'error',
      (ev) => {
        window.clearTimeout(timer);
        w.terminate();
        jsWorker = null;
        resolve(buildResult({ stdout: '', stderr: '', error: { type: 'InternalError', message: ev.message || 'Falha no executor.', line: null }, outcomes: [] }, req.challenge.tests, fnName, 'javascript', performance.now() - start));
      },
      { once: true },
    );
    w.postMessage({ id, code: req.code, fnName, tests: req.challenge.tests });
  });
}

// ---------------- Python (Pyodide) ----------------
export type PythonStatus = 'idle' | 'loading' | 'ready' | 'error';
export type PythonStage = 'download' | 'boot' | null;

let pyWorker: Worker | null = null;
let pyReady: Promise<void> | null = null;
let pyStatus: PythonStatus = 'idle';
let pyStage: PythonStage = null;
let pyError: string | null = null;
const pyListeners = new Set<() => void>();

function setPy(status: PythonStatus, stage: PythonStage = pyStage, error: string | null = null) {
  pyStatus = status;
  pyStage = stage;
  pyError = error;
  for (const l of pyListeners) l();
}

export const pythonRuntime = {
  status: () => pyStatus,
  stage: () => pyStage,
  error: () => pyError,
  subscribe(l: () => void) {
    pyListeners.add(l);
    return () => pyListeners.delete(l);
  },
};

function bootPython(): Promise<void> {
  if (pyReady) return pyReady;
  setPy('loading', 'download');
  const w = new Worker(new URL('./py.worker.ts', import.meta.url), { type: 'module', name: 'devcore-py' });
  pyWorker = w;
  pyReady = new Promise<void>((resolve, reject) => {
    const onMsg = (e: MessageEvent<{ type: string; stage?: PythonStage; message?: string; id?: number }>) => {
      if (e.data.type === 'progress') setPy('loading', e.data.stage ?? null);
      if (e.data.type === 'ready') {
        w.removeEventListener('message', onMsg);
        setPy('ready', null);
        resolve();
      }
      if (e.data.type === 'fatal' && e.data.id === -1) {
        w.removeEventListener('message', onMsg);
        fail(e.data.message ?? 'Falha ao carregar o Python.');
      }
    };
    const fail = (message: string) => {
      w.terminate();
      if (pyWorker === w) pyWorker = null;
      pyReady = null;
      setPy('error', null, message);
      reject(new Error(message));
    };
    w.addEventListener('message', onMsg);
    w.addEventListener('error', (ev) => fail(ev.message || 'Falha ao carregar o Python.'), { once: true });
    w.postMessage({ type: 'init' });
  });
  pyReady.catch(() => undefined);
  return pyReady;
}

/** Começa a baixar o Pyodide em segundo plano (chamado quando o jogador escolhe Python). */
export function warmupPython(): void {
  void bootPython().catch(() => undefined);
}

async function runPython(req: RunRequest): Promise<RunResult> {
  const fnName = req.challenge.functionName.python;
  try {
    await bootPython();
  } catch (e) {
    return buildResult(
      { stdout: '', stderr: '', error: { type: 'LoadError', message: `Não consegui carregar o Python (${(e as Error).message}). Verifique a internet e tente de novo.`, line: null }, outcomes: [] },
      req.challenge.tests,
      fnName,
      'python',
      0,
    );
  }
  const w = pyWorker!;
  const id = ++seq;
  const start = performance.now();
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      // Pyodide não pode ser interrompido sem SharedArrayBuffer: encerra e recria em segundo plano.
      w.terminate();
      pyWorker = null;
      pyReady = null;
      warmupPython();
      resolve(timeoutResult(req, PY_TIMEOUT_MS, performance.now() - start));
    }, PY_TIMEOUT_MS);
    const onMsg = (e: MessageEvent<{ type: string; id?: number; raw?: RawRun; message?: string }>) => {
      if (e.data.id !== id) return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMsg);
      if (e.data.type === 'result' && e.data.raw) resolve(buildResult(e.data.raw, req.challenge.tests, fnName, 'python', performance.now() - start));
      else resolve(buildResult({ stdout: '', stderr: '', error: { type: 'InternalError', message: e.data.message ?? 'Falha no executor Python.', line: null }, outcomes: [] }, req.challenge.tests, fnName, 'python', performance.now() - start));
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ type: 'run', id, code: req.code, fnName, tests: req.challenge.tests });
  });
}

export function run(req: RunRequest): Promise<RunResult> {
  return req.language === 'python' ? runPython(req) : runJs(req);
}
