import { useEffect, useRef } from 'react';

export const isConfirm = (e: KeyboardEvent) => e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z';
export const isCancel = (e: KeyboardEvent) => e.key === 'Escape' || e.key === 'Backspace' || e.key === 'x' || e.key === 'X';

/** Ignora teclas digitadas dentro de campos de texto/editor. */
export function typingInField(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable || !!t.closest?.('.cm-editor');
}

/** Listener global de teclado ativo só enquanto `active`. */
export function useKeys(handler: (e: KeyboardEvent, type: 'down' | 'up') => void, active = true): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const down = (e: KeyboardEvent) => ref.current(e, 'down');
    const up = (e: KeyboardEvent) => ref.current(e, 'up');
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [active]);
}

/** Substitui {nome} e {classe} nos textos de roteiro. */
export function fillText(text: string, vars: { name?: string; heroClass?: 'alchemist' | 'mage' | null }): string {
  const cls = vars.heroClass === 'mage' ? 'Mago' : vars.heroClass === 'alchemist' ? 'Alquimista' : 'herói';
  const lang = vars.heroClass === 'mage' ? 'JavaScript' : vars.heroClass === 'alchemist' ? 'Python' : 'código';
  return text.replaceAll('{nome}', vars.name ?? 'herói').replaceAll('{classe}', cls).replaceAll('{linguagem}', lang);
}
