export type Language = 'python' | 'javascript';

/** Um caso de teste por função: chama fn(...args) e compara com expected (igualdade profunda). */
export interface TestCase {
  name?: string;
  args: unknown[];
  expected: unknown;
  hidden?: boolean;
}

/** O mínimo de um desafio que o motor precisa para rodar. */
export interface RunnableChallenge {
  functionName: Record<Language, string>;
  tests: TestCase[];
}

export interface TestResult {
  name: string;
  ok: boolean;
  expected: unknown;
  received: unknown;
  hidden: boolean;
  /** Erro lançado durante este teste (tipo: mensagem). */
  error?: string;
}

export interface RunError {
  type: string;
  message: string;
  line: number | null;
}

export interface RunResult {
  passed: boolean;
  tests: TestResult[];
  stdout: string;
  stderr: string;
  error?: RunError;
  timeMs: number;
}

export interface RunRequest {
  language: Language;
  code: string;
  challenge: RunnableChallenge;
}

/** Saída crua de um worker (antes da normalização). */
export interface RawTestOutcome {
  ok: boolean;
  /** Valor retornado (já serializável). */
  value?: unknown;
  error?: RunError;
}

export interface RawRun {
  stdout: string;
  stderr: string;
  /** Erro de compilação/execução do código de topo (antes dos testes). */
  error?: RunError;
  outcomes: RawTestOutcome[];
}
