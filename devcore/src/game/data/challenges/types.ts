import type { Language, RunnableChallenge, TestCase } from '../../../runner/types';
import type { VillainId } from '../../state/save';

export type Concept = 'basics' | 'loops' | 'functions' | 'errors' | 'mixed';
export type ChallengeKind = 'lesson' | 'boss' | 'extra';

export const CONCEPT_LABEL: Record<Concept, string> = {
  basics: 'Variáveis, tipos e decisões',
  loops: 'Laços e repetição',
  functions: 'Funções e recursão',
  errors: 'Erros e validação',
  mixed: 'Tudo junto',
};

/** Texto igual para as duas linguagens, ou uma versão para cada. */
export type LText = string | Record<Language, string>;

/**
 * Um desafio. Textos podem usar {fn} (nome da função na linguagem do jogador),
 * {True}/{False}/{None} (viram true/false/null em JavaScript), `código` e blocos ```código```.
 */
export interface Challenge extends RunnableChallenge {
  id: string;
  concept: Concept;
  villain: VillainId | null;
  kind: ChallengeKind;
  /** Fase da luta (1, 2, 3) para kind === 'boss'. */
  phase?: number;
  title: string;
  statement: LText;
  starter: Record<Language, string>;
  functionName: Record<Language, string>;
  tests: TestCase[];
  hints: [LText, LText, LText];
  mentor: { success: LText; failure: LText };
  xp: number;
  coins: number;
}

/** Atalho: mesmo nome de função nas duas linguagens. */
export const same = (name: string): Record<Language, string> => ({ python: name, javascript: name });

/** Escolhe a versão da linguagem e troca os marcadores pela sintaxe dela. */
export function localize(text: LText, ch: Pick<Challenge, 'functionName'>, lang: Language): string {
  const js = lang === 'javascript';
  const raw = typeof text === 'string' ? text : text[lang];
  return raw
    .replaceAll('{fn}', ch.functionName[lang])
    .replaceAll('{True}', js ? 'true' : 'True')
    .replaceAll('{False}', js ? 'false' : 'False')
    .replaceAll('{None}', js ? 'null' : 'None');
}
