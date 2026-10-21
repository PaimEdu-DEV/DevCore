import { test, expect } from '@playwright/test';
import { SHOTS, seedSave, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

// Jornada (modo feira): portão → caminho → capangas → chefe.
test('jornada: anda, derrota os dois bugs e chega ao Aldric', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?rota=jornada');
  // fala de abertura do Orwin
  await expect(page.locator('.dialog').first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/60-journey-intro.png` });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/61-journey-walk.png` });

  for (const [i, id] of ['bug-soma', 'bug-cura'].entries()) {
    await page.keyboard.down('ArrowRight');
    await expect(page.locator('.qf')).toBeVisible({ timeout: 15_000 });
    await page.keyboard.up('ArrowRight');
    if (i === 0) await page.screenshot({ path: `${SHOTS}/62-journey-fight.png` });
    // errar primeiro mostra a dica de esperado x recebido
    if (i === 0) {
      await page.getByRole('button', { name: /Atacar/ }).click();
      await expect(page.locator('.qf-feedback.fail')).toBeVisible();
    }
    await setCode(page, SOLUTIONS[id].javascript);
    await page.getByRole('button', { name: /Atacar/ }).click();
    await expect(page.locator('.qf')).toBeHidden({ timeout: 10_000 });
  }
  await page.keyboard.down('ArrowRight');
  await expect(page.getByRole('button', { name: /Lutar/ })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: `${SHOTS}/63-journey-boss.png` });
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
  expect(save.journey.beaten).toEqual(['bug-soma', 'bug-cura']);
  await page.getByRole('button', { name: /Lutar/ }).click();
  await expect(page.locator('.hpbox-foe, .versus')).toBeVisible({ timeout: 15_000 });
});

test('jornada: cada área tem seu cenário', async ({ browser }) => {
  for (const area of [1, 2, 3]) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await seedSave(page, { heroClass: 'alchemist', extra: { journey: { area, beaten: [] } } });
    await page.goto('/?rota=jornada');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/64-journey-area${area + 1}.png` });
    await page.close();
  }
});

test('jornada no celular: botões de andar e teclas de código', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?rota=jornada');
  await page.locator('.dialog').first().click();
  const right = page.getByRole('button', { name: 'Andar para a direita' });
  await expect(right).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/65-journey-mobile.png` });
  const box = (await right.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('.qf')).toBeVisible({ timeout: 15_000 });
  await page.mouse.up();
  // monta "a + b" só com as teclas de código, sem teclado do aparelho
  await page.locator('.cm-line', { hasText: 'return 0' }).click();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Apagar' }).click();
  await page.getByRole('button', { name: 'Apagar' }).click();
  await page.locator('.code-token', { hasText: /^a$/ }).click();
  await page.locator('.code-token', { hasText: /^\+$/ }).click();
  await page.locator('.code-token', { hasText: /^b$/ }).click();
  await page.screenshot({ path: `${SHOTS}/66-journey-mobile-fight.png` });
  await page.getByRole('button', { name: /Atacar/ }).click();
  await expect(page.locator('.qf')).toBeHidden({ timeout: 10_000 });
  await ctx.close();
});
