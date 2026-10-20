// Curva de níveis: o nível L começa em 50·L·(L−1) XP (2 → 100, 3 → 300, 4 → 600, 5 → 1000...).

export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}

export function levelProgress(xp: number): { level: number; current: number; needed: number; ratio: number } {
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - start, needed: next - start, ratio: (xp - start) / (next - start) };
}

/** Títulos conquistados (não compráveis). */
export const EARNED_TITLES: Record<string, string> = {
  first_steps: 'Primeiros Passos',
  breaker_aldric: 'Quebra-Escudos',
  breaker_veyr: 'Mestre dos Laços',
  breaker_seraphine: 'Guardião da Biblioteca',
  breaker_entity: 'Salvador do Core',
  flawless: 'Código Impecável',
  lightning: 'Relâmpago Vivo',
  daily: 'Caçador Diário',
};

export function titleLabel(id: string | null | undefined, cosmeticText?: string): string | null {
  if (!id) return null;
  return EARNED_TITLES[id] ?? cosmeticText ?? null;
}
