import { test, expect } from '@playwright/test';
import { SHOTS, seedSave, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

// Todas as soluções de referência em Python precisam passar no Pyodide de verdade.
test('todas as soluções em Python passam no Pyodide', async ({ page }) => {
  test.setTimeout(400_000);
  await seedSave(page, { heroClass: 'alchemist' });
  const ids = Object.keys(SOLUTIONS);
  await page.goto(`/?licao=${ids[0]}`);
  await expect(page.locator('.ide-status')).toContainText('Python pronto', { timeout: 150_000 });
  const failures: string[] = [];
  for (const id of ids) {
    await page.goto(`/?licao=${id}`);
    await expect(page.locator('.ide-status')).toContainText('Python pronto', { timeout: 60_000 });
    await setCode(page, SOLUTIONS[id].python);
    await page.keyboard.press('Control+Enter');
    const tab = page.getByRole('tab', { name: /Testes/ });
    await expect(tab.locator('.ide-badge')).toBeVisible({ timeout: 20_000 });
    const badge = (await tab.locator('.ide-badge').textContent()) ?? '';
    const [a, b] = badge.split('/');
    if (a !== b) failures.push(`${id}: ${badge}`);
  }
  expect(failures).toEqual([]);
});

// Cada chefe pode ser vencido do começo ao fim (JavaScript), com captura de tela da luta.
for (const villain of ['veyr', 'seraphine', 'entity'] as const) {
  test(`luta contra ${villain} até o fim`, async ({ page }) => {
    test.setTimeout(120_000);
    await seedSave(page, { heroClass: 'mage', gender: villain === 'seraphine' ? 'f' : 'm' });
    await page.goto(`/?batalha=${villain}`);
    await page.getByRole('button', { name: 'Pular apresentação' }).waitFor();
    await page.keyboard.press('Enter');
    await expect(page.locator('.hpbox-foe')).toBeVisible();
    const phases = Object.keys(SOLUTIONS).filter((id) => id.startsWith(`${villain}-b`));
    for (const [i, id] of phases.entries()) {
      await expect(page.locator('.hpbox-foe')).toContainText(`Fase ${i + 1}/${phases.length}`, { timeout: 15_000 });
      await expect(page.locator('.ide-run')).toBeEnabled({ timeout: 10_000 });
      if (i === 0) {
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${SHOTS}/50-battle-${villain}.png` });
      }
      await setCode(page, SOLUTIONS[id].javascript);
      await page.keyboard.press('Control+Enter');
    }
    await expect(page.getByRole('button', { name: /Pular cena/ })).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/51-defeat-${villain}.png` });
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
    expect(save.bosses[villain].defeated).toBe(true);
  });
}
