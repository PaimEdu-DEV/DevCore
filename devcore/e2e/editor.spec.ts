import { test, expect } from '@playwright/test';
import { SHOTS, seedSave, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

test('lição em JavaScript: erro com linha, depois acerto', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?licao=aldric-l1');
  await expect(page.locator('.ide-file-tab')).toContainText('main.js');
  await setCode(page, 'function armadura(base, bonus) {\n  let total = base + bonsu;\n  return total;\n}\n');
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('.cm-error-line')).toHaveCount(1);
  await expect(page.locator('.dialog-text').first()).toContainText('não existe');
  await page.screenshot({ path: `${SHOTS}/10-lesson-js-error.png` });

  await setCode(page, SOLUTIONS['aldric-l1'].javascript);
  await page.getByRole('button', { name: /Executar/ }).click();
  await expect(page.getByRole('tab', { name: /Testes/ })).toContainText('4/4');
  await page.screenshot({ path: `${SHOTS}/11-lesson-js-ok.png` });
});

test('lição em Python com Pyodide: traceback e acerto', async ({ page }) => {
  test.setTimeout(180_000);
  await seedSave(page, { heroClass: 'alchemist', gender: 'f' });
  await page.goto('/?licao=aldric-l3');
  await expect(page.locator('.ide-file-tab')).toContainText('main.py');
  await page.screenshot({ path: `${SHOTS}/12-lesson-py-loading.png` });
  await expect(page.locator('.ide-status')).toContainText('Python pronto', { timeout: 150_000 });

  await setCode(page, 'def classificar(forca)\n    return "fraco"\n');
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('.dialog-text').first()).toContainText('dois-pontos');
  await page.getByRole('tab', { name: /Terminal/ }).click();
  await expect(page.locator('.ide-term')).toContainText('SyntaxError');
  await page.screenshot({ path: `${SHOTS}/13-lesson-py-error.png` });

  await setCode(page, SOLUTIONS['aldric-l3'].python);
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('tab', { name: /Testes/ })).toContainText('5/5');
  await page.getByRole('tab', { name: /Testes/ }).click();
  await page.screenshot({ path: `${SHOTS}/14-lesson-py-ok.png` });
});

test('laço infinito em JavaScript é interrompido', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?licao=veyr-l1');
  await setCode(page, 'function somarAte(n) {\n  while (true) {}\n}\n');
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('.dialog-text').first()).toContainText('interromper', { timeout: 10_000 });
  // o executor se recupera
  await setCode(page, SOLUTIONS['veyr-l1'].javascript);
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('tab', { name: /Testes/ })).toContainText('5/5');
});
