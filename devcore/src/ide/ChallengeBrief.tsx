import { RichText } from './RichText';
import { CONCEPT_LABEL, localize, type Challenge } from '../game/data/challenges/types';
import type { Language } from '../runner/types';

/** Painel com o enunciado do desafio (fonte normal, legível). */
export function ChallengeBrief({ challenge, language, className }: { challenge: Challenge; language: Language; className?: string }) {
  const visible = challenge.tests.filter((t) => !t.hidden).length;
  const hidden = challenge.tests.length - visible;
  return (
    <article className={`brief ${className ?? ''}`} aria-label="Enunciado">
      <header className="brief-head">
        <h2 className="brief-title">{challenge.title}</h2>
        <span className="brief-tag">{CONCEPT_LABEL[challenge.concept]}</span>
        <span className="brief-tag">
          {visible} teste(s) visível(is) · {hidden} oculto(s)
        </span>
      </header>
      <RichText text={localize(challenge.statement, challenge, language)} />
    </article>
  );
}
