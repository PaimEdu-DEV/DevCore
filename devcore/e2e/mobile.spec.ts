import { test, expect } from '@playwright/test';
import { SHOTS, seedSave } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test('layout de celular: título, vila com D-pad e batalha', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/60-mobile-title.png` });
  await page.goto('/?rota=vila');
  await expect(page.locator('.dpad')).toBeVisible();
  // anda tocando no D-pad
  const up = page.getByRole('button', { name: 'Cima' });
  await up.dispatchEvent('pointerdown');
  await page.waitForTimeout(400);
  await up.dispatchEvent('pointerup');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/61-mobile-village.png` });
  await page.goto('/?batalha=aldric');
  await page.getByRole('button', { name: 'Pular apresentação' }).click();
  await expect(page.locator('.hpbox-foe')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/62-mobile-battle.png`, fullPage: true });
});

test('celular em pé pede para girar; deitado joga direto', async ({ browser }) => {
  const portrait = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await portrait.newPage();
  await p.goto('/');
  await expect(p.getByRole('dialog', { name: 'Gire o celular' })).toBeVisible();
  await p.screenshot({ path: `${SHOTS}/63-mobile-rotate.png` });
  await p.getByRole('button', { name: 'Jogar em pé mesmo' }).click();
  await expect(p.getByRole('dialog', { name: 'Gire o celular' })).toBeHidden();
  await portrait.close();

  const landscape = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const l = await landscape.newPage();
  await l.goto('/');
  await l.waitForTimeout(300);
  await expect(l.getByRole('dialog', { name: 'Gire o celular' })).toHaveCount(0);
  await landscape.close();
});
