/// <reference lib="webworker" />
import { runJs } from './jsHarness';
import type { TestCase } from './types';

// Guarda o canal de resposta antes de bloquear as APIs perigosas para o código do jogador.
const send = self.postMessage.bind(self);

for (const key of ['fetch', 'XMLHttpRequest', 'importScripts', 'WebSocket', 'EventSource', 'Worker', 'SharedWorker', 'indexedDB', 'caches', 'BroadcastChannel']) {
  try {
    Object.defineProperty(self, key, { value: undefined, configurable: false, writable: false });
  } catch {
    /* algumas propriedades não são configuráveis; seguem sombreadas no wrapper */
  }
}

interface Msg {
  id: number;
  code: string;
  fnName: string;
  tests: TestCase[];
}

self.onmessage = (e: MessageEvent<Msg>) => {
  const { id, code, fnName, tests } = e.data;
  const raw = runJs(code, fnName, tests);
  send({ id, raw });
};
