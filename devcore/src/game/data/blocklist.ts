// Filtro básico de nomes. Compara sem acentos, sem espaços e com troca de números por letras
// (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, @→a), para pegar variações simples.

const BLOCKED = [
  'porra', 'caralho', 'merda', 'buceta', 'boceta', 'cuzao', 'cu', 'puta', 'puto', 'viado', 'arrombado',
  'fdp', 'filhodaputa', 'vagabunda', 'vadia', 'piranha', 'otario', 'babaca', 'corno', 'pau', 'rola', 'pinto',
  'xoxota', 'xereca', 'punheta', 'bosta', 'retardado', 'macaco', 'nazista', 'hitler', 'estupro', 'pedofilo',
  'fuck', 'shit', 'bitch', 'dick', 'cock', 'pussy', 'nigger', 'nigga', 'faggot', 'whore', 'slut', 'cunt', 'rape',
];

// Palavras curtas só são bloqueadas como nome inteiro, para não barrar nomes como "Paulo" ou "Cuca".
const EXACT_ONLY = new Set(['cu', 'pau', 'rola', 'puto', 'dick', 'cock']);

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z]/g, '');
}

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

export const MAX_NAME = 16;

export function checkName(raw: string): NameCheck {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2) return { ok: false, reason: 'O nome precisa ter pelo menos 2 letras.' };
  if (name.length > MAX_NAME) return { ok: false, reason: `Máximo de ${MAX_NAME} caracteres.` };
  if (!/^[\p{L}\p{N} _.-]+$/u.test(name)) return { ok: false, reason: 'Use só letras, números, espaço, ponto, hífen ou _.' };
  const n = normalizeName(name);
  for (const w of BLOCKED) {
    if (EXACT_ONLY.has(w) ? n === w : n.includes(w)) return { ok: false, reason: 'Esse nome não é permitido no reino. Escolha outro.' };
  }
  return { ok: true, name };
}
