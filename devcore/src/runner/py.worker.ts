/// <reference lib="webworker" />
import { PY_HARNESS } from './pyHarness';
import type { TestCase } from './types';

export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';

interface PyodideLike {
  runPython(code: string): unknown;
  globals: { get(name: string): (...args: unknown[]) => string };
  setStdin?(opts: { error: boolean }): void;
}

const send = self.postMessage.bind(self);
let ready: Promise<PyodideLike> | null = null;

function init(): Promise<PyodideLike> {
  ready ??= (async () => {
    send({ type: 'progress', stage: 'download' });
    const mod = (await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)) as { loadPyodide: (o: { indexURL: string }) => Promise<PyodideLike> };
    send({ type: 'progress', stage: 'boot' });
    const py = await mod.loadPyodide({ indexURL: PYODIDE_URL });
    py.setStdin?.({ error: true });
    py.runPython(PY_HARNESS);
    send({ type: 'ready' });
    return py;
  })();
  return ready;
}

type Msg = { type: 'init' } | { type: 'run'; id: number; code: string; fnName: string; tests: TestCase[] };

self.onmessage = async (e: MessageEvent<Msg>) => {
  const msg = e.data;
  try {
    const py = await init();
    if (msg.type === 'run') {
      const json = py.globals.get('__devcore_run')(msg.code, msg.fnName, JSON.stringify(msg.tests));
      send({ type: 'result', id: msg.id, raw: JSON.parse(json) });
    }
  } catch (err) {
    send({ type: 'fatal', id: msg.type === 'run' ? msg.id : -1, message: (err as Error)?.message ?? String(err) });
  }
};
