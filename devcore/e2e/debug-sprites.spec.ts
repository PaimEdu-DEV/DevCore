import { test, expect } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR ?? 'test-results/shots';

test('página de debug toca todas as animações', async ({ page }) => {
  await page.goto('/debug/sprites');
  await expect(page.getByText('Imagens carregadas')).toBeVisible();
  const canvases = page.locator('canvas[data-anim]');
  expect(await canvases.count()).toBeGreaterThan(40);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/debug-sprites.png`, fullPage: true });
  await page.getByLabel('Espelhar').check();
  await page.getByLabel('Âncoras (pés/cabeça)').check();
  await page.locator('select').first().selectOption('hat_crown');
  await page.waitForTimeout(400);
  await page.locator('[data-character="hero_mage_f"]').screenshot({ path: `${SHOTS}/debug-hero-flip.png` });
});
