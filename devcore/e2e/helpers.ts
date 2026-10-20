import type { Page } from '@playwright/test';

export const SHOTS = process.env.SHOTS_DIR ?? 'test-results/shots';

/** Cria um save pronto no localStorage antes de abrir a página. */
export async function seedSave(page: Page, opts: { heroClass: 'alchemist' | 'mage'; gender?: 'm' | 'f'; name?: string; extra?: Record<string, unknown> }) {
  await page.addInitScript((o) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const now = new Date().toISOString();
    const save = {
      version: 2,
      createdAt: now,
      updatedAt: now,
      player: { name: o.name ?? 'Teste', gender: o.gender ?? 'm', heroClass: o.heroClass },
      stats: { xp: 0, coins: 200, runs: 0, testsPassed: 0, errors: 0, hintsUsed: 0, lessonsDone: 0, bossesDefeated: 0, flawlessPhases: 0, defeats: 0, lightningBest: 0, dailyDone: 0, coinsSpent: 0, playTimeSec: 0 },
      lessons: {},
      bosses: {},
      flags: { intro_done: true },
      cosmetics: { owned: [], equipped: { hat: null, aura: null, spell: null, nameFrame: null, title: null } },
      titles: [],
      daily: { lastWelcomeBonus: null, completed: {} },
      missionsClaimed: [],
      village: { x: 10, y: 12, facing: 'right' },
      ...o.extra,
    };
    localStorage.setItem('devcore.save', JSON.stringify(save));
    localStorage.setItem('devcore.options', JSON.stringify({ textSpeed: 'instant', volume: 0, muted: true, editorFontSize: 15, reducedMotion: 'off' }));
    for (const k of Object.keys(localStorage)) if (k.startsWith('devcore.draft.')) localStorage.removeItem(k);
  }, opts);
}

/** Substitui o conteúdo do editor CodeMirror. */
export async function setCode(page: Page, code: string) {
  const content = page.locator('.cm-content').first();
  await content.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
}
