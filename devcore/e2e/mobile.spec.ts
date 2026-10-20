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
