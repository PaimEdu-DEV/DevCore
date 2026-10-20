import { test, expect } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR ?? 'test-results/shots';

test('título → abertura → criação de personagem → chegada', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/01-title.png` });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Novo Jogo' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/02-menu.png` });
  await page.getByRole('button', { name: 'Novo Jogo' }).click();

  // abertura: avança algumas falas e tira foto de uma cena com diálogo
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${SHOTS}/03-opening.png` });
  await page.getByRole('button', { name: /Pular cena/ }).click();

  await expect(page.getByLabel('Como devo registrar você no Arquivo?')).toBeVisible();
  await page.getByLabel('Como devo registrar você no Arquivo?').fill('Ada');
  await page.screenshot({ path: `${SHOTS}/04-name.png` });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/05-gender.png` });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/06-class.png` });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/07-confirm.png` });
  await page.getByRole('option', { name: 'A tinta! Vamos.' }).click();

  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/08-arrival.png` });
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save') ?? 'null'));
  expect(save.player).toEqual({ name: 'Ada', gender: 'f', heroClass: 'mage' });
});
