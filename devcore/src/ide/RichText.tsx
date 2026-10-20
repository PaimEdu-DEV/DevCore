import { Fragment, type ReactNode } from 'react';

// Renderizador mínimo e seguro para os enunciados: parágrafos, listas com "-" ou "1.",
// **negrito**, `código` e blocos ```código```. Não interpreta HTML.

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={`${keyBase}-t${i++}`}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith('`')) out.push(<code key={`${keyBase}-c${i++}`}>{tok.slice(1, -1)}</code>);
    else out.push(<strong key={`${keyBase}-b${i++}`}>{tok.slice(2, -2)}</strong>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<Fragment key={`${keyBase}-t${i++}`}>{text.slice(last)}</Fragment>);
  return out;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const parts = text.split(/```\w*\n?/);
  parts.forEach((part, pi) => {
    if (pi % 2 === 1) {
      blocks.push(
        <pre key={`pre${pi}`} className="rt-pre">
          <code>{part.replace(/\n$/, '')}</code>
        </pre>,
      );
      return;
    }
    const paras = part.split(/\n\s*\n/).filter((p) => p.trim());
    paras.forEach((p, i) => {
      const lines = p.split('\n').filter((l) => l.trim());
      const key = `p${pi}-${i}`;
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
        blocks.push(<ul key={key}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''), `${key}-${j}`)}</li>)}</ul>);
      } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        blocks.push(<ol key={key}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ''), `${key}-${j}`)}</li>)}</ol>);
      } else {
        blocks.push(
          <p key={key}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {inline(l, `${key}-${j}`)}
              </Fragment>
            ))}
          </p>,
        );
      }
    });
  });
  return <div className={`rich-text ${className ?? ''}`}>{blocks}</div>;
}
