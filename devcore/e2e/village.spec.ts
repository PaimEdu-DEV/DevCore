import { test, expect, type Page } from '@playwright/test';
import { SHOTS, seedSave } from './helpers';

/** Clica numa coordenada virtual (448x252) do palco da vila. */
async function clickVirtual(page: Page, vx: number, vy: number) {
  const box = await page.locator('.pixel-stage').boundingBox();
  if (!box) throw new Error('sem palco');
  await page.mouse.click(box.x + (vx / 448) * box.width, box.y + (vy / 252) * box.height);
}

test('vila: andar, conversar, loja, menu e portão', async ({ page }) => {
  await seedSave(page, { heroClass: 'alchemist', gender: 'f', extra: { stats: { xp: 150, coins: 400, runs: 0, testsPassed: 0, errors: 0, hintsUsed: 0, lessonsDone: 0, bossesDefeated: 0, flawlessPhases: 0, defeats: 0, lightningBest: 0, dailyDone: 0, coinsSpent: 0, playTimeSec: 0 } } });
  await page.goto('/?rota=vila');
  await expect(page.locator('.village-hud')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/30-village.png` });

  // clicar no Garrick (tile 6,9) a partir do ponto inicial (10,12): câmera em x=28, y=108.
  await clickVirtual(page, 6 * 24 + 12 - 28, 9 * 24 + 6 - 108);
  await expect(page.locator('.dialog-name')).toHaveText('Garrick', { timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}/33-village-garrick.png` });
  await page.getByRole('option', { name: 'Ver a loja' }).click();
  await expect(page.getByRole('heading', { name: 'Forja do Garrick' })).toBeVisible();
  await page.getByRole('button', { name: /Comprar Chapéu de Pena/ }).click();
  await page.getByRole('tab', { name: 'Aura' }).click();
  await page.getByRole('button', { name: /Comprar Aura de Brasa/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/34-shop.png` });
  await page.getByRole('button', { name: 'Voltar à vila' }).click();
  await expect(page.locator('.village-hud')).toBeVisible();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
  expect(save.cosmetics.equipped.hat).toBe('hat_feather');
  expect(save.cosmetics.equipped.aura).toBe('aura_ember');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/35-village-cosmetics.png` });

  // andar com o teclado
  for (let i = 0; i < 3; i++) {
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(170);
    await page.keyboard.up('ArrowRight');
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/31-village-walk.png` });

  // menu em jogo
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/32-village-menu.png` });
  await page.keyboard.press('Escape');
});
