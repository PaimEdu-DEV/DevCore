import { describe, expect, it } from 'vitest';
import { importSave, migrate, newSave, SAVE_VERSION } from './save';
import { checkName } from '../data/blocklist';
import { levelFromXp, xpForLevel } from './progression';

describe('save', () => {
  it('migra um save v1 para a versão atual', () => {
    const s = migrate({ version: 1, name: 'Ada', gender: 'f', heroClass: 'mage', xp: 120, coins: 30, completed: ['aldric-l1'] });
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.player).toEqual({ name: 'Ada', gender: 'f', heroClass: 'mage' });
    expect(s.stats.xp).toBe(120);
    expect(s.lessons['aldric-l1'].done).toBe(true);
    expect(s.cosmetics.equipped.hat).toBeNull();
  });

  it('preenche campos que faltam num save atual', () => {
    const s = newSave({ name: 'Lin', gender: 'm', heroClass: 'alchemist' });
    const partial = JSON.parse(JSON.stringify(s));
    delete partial.daily;
    delete partial.stats.coinsSpent;
    const m = migrate(partial);
    expect(m.daily).toEqual({ lastWelcomeBonus: null, completed: {} });
    expect(m.stats.coinsSpent).toBe(0);
  });

  it('recusa arquivos inválidos com mensagem em português', () => {
    expect(() => importSave('não é json')).toThrow(/JSON/);
    expect(() => importSave('{"foo": 1}')).toThrow(/inválido/);
    expect(() => importSave(JSON.stringify({ version: 999, player: { name: 'x' } }))).toThrow(/mais nova/);
  });
});

describe('nomes', () => {
  it('aceita nomes comuns e respeita o limite', () => {
    expect(checkName('Ada Lovelace').ok).toBe(true);
    expect(checkName('Paulo').ok).toBe(true);
    expect(checkName('João_2').ok).toBe(true);
    expect(checkName('a').ok).toBe(false);
    expect(checkName('x'.repeat(17)).ok).toBe(false);
  });

  it('bloqueia palavrões, inclusive com variações', () => {
    expect(checkName('merda').ok).toBe(false);
    expect(checkName('M3rd4').ok).toBe(false);
    expect(checkName('pu7a').ok).toBe(false);
  });
});

describe('progressão', () => {
  it('segue a curva de níveis', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
    expect(xpForLevel(5)).toBe(1000);
  });
});
