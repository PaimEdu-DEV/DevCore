import { test, expect, type Page } from '@playwright/test';
import { SHOTS, seedSave, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

async function solvePhase(page: Page, id: string, lang: 'python' | 'javascript') {
  await setCode(page, SOLUTIONS[id][lang]);
  await page.keyboard.press('Control+Enter');
}

for (const lang of ['javascript', 'python'] as const) {
  test(`luta contra Aldric em ${lang}`, async ({ page }) => {
    test.setTimeout(180_000);
    await seedSave(page, { heroClass: lang === 'python' ? 'alchemist' : 'mage', gender: lang === 'python' ? 'm' : 'f' });
    await page.goto('/?batalha=aldric');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SHOTS}/20-versus-${lang}.png` });
    await page.keyboard.press('Enter');
    await expect(page.locator('.hpbox-foe')).toBeVisible();
    if (lang === 'python') await expect(page.locator('.ide-status')).toContainText('Python pronto', { timeout: 150_000 });

    // erro: contra-ataque
    await setCode(page, lang === 'python' ? 'def dobro(forca):\n    return forca\n' : 'function dobro(forca) {\n  return forca;\n}\n');
    await page.keyboard.press('Control+Enter');
    await expect(page.locator('.hpbox-hero')).toContainText(/\d+\/100/);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOTS}/21-battle-counter-${lang}.png` });
    await expect(page.locator('.hpbox-hero .hpbox-num')).not.toHaveText('100/100', { timeout: 10_000 });

    // fase 1 e 2
    await expect(page.locator('.ide-run')).toBeEnabled({ timeout: 10_000 });
    await solvePhase(page, 'aldric-b1', lang);
    await expect(page.locator('.hpbox-foe')).toContainText('Fase 2/2', { timeout: 15_000 });
    await page.screenshot({ path: `${SHOTS}/22-battle-phase2-${lang}.png` });
    await expect(page.locator('.ide-run')).toBeEnabled({ timeout: 10_000 });
    await solvePhase(page, 'aldric-b2', lang);
    await expect(page.locator('.dialog-text').first()).toContainText('derrotado', { timeout: 15_000 });
    await page.screenshot({ path: `${SHOTS}/23-battle-victory-${lang}.png` });

    // cutscene de derrota do vilão e volta à Jornada, já na área 2
    await expect(page.getByRole('button', { name: /Pular cena/ })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${SHOTS}/24-aldric-defeat-${lang}.png` });
    await page.getByRole('button', { name: /Pular cena/ }).click();
    await expect(page.locator('.journey-area')).toContainText('Floresta Sombria');
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
    expect(save.bosses.aldric.defeated).toBe(true);
    expect(save.journey.area).toBe(1);
    expect(save.titles).toContain('breaker_aldric');
  });
}

test('herói zerado volta à Jornada consolado pelo Orwin', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?batalha=veyr');
  await page.keyboard.press('Enter');
  await expect(page.locator('.hpbox-foe')).toBeVisible();
  test.setTimeout(150_000);
  for (let i = 0; i < 20; i++) {
    const ended = await page.locator('.hpbox-hero .hpbox-num').textContent();
    if (ended?.startsWith('0/')) break;
    await expect(page.locator('.ide-run')).toBeEnabled({ timeout: 15_000 }).catch(() => undefined);
    if (!(await page.locator('.ide-run').isEnabled())) break;
    await page.locator('.ide-run').click();
    await page.waitForTimeout(2500);
  }
  await expect(page.getByRole('button', { name: /Pular cena/ })).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/25-consolation.png` });
  await page.getByRole('button', { name: /Pular cena/ }).click();
  await expect(page.locator('.journey-hud')).toBeVisible();
});
