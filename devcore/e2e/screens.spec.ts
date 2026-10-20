import { test, expect } from '@playwright/test';
import { SHOTS, seedSave, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';
import { dailyChallenge, todayKey } from '../src/game/data/challenges';

test('menu: perfil, missões e opções', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage', gender: 'f', extra: { titles: ['first_steps'], lessons: { 'aldric-l1': { done: true, flawless: true } } } });
  await page.goto('/?rota=vila');
  await expect(page.locator('.village-hud')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Perfil' }).click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/70-profile.png` });
  await page.getByRole('button', { name: 'Voltar' }).click();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Missões' }).click();
  await page.getByRole('button', { name: 'Resgatar' }).first().click();
  await expect(page.getByText('✓ Resgatada')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/71-missions.png` });
  await page.getByRole('button', { name: 'Voltar' }).click();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Opções' }).click();
  await expect(page.getByRole('heading', { name: 'Opções' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/72-options.png` });
});

test('desafio diário da Elowen dá recompensa uma vez por dia', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  const daily = dailyChallenge(todayKey());
  await page.goto('/?rota=diario');
  await expect(page.getByRole('heading', { name: 'Desafio diário da Elowen' })).toBeVisible();
  await setCode(page, SOLUTIONS[daily.id].javascript);
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('.dialog-text').first()).toContainText('Caçada do dia concluída');
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
  expect(Object.values(save.daily.completed)).toContain(daily.id);
  expect(save.stats.dailyDone).toBe(1);
});

test('relâmpago do Torvan', async ({ page }) => {
  await seedSave(page, { heroClass: 'mage' });
  await page.goto('/?rota=relampago');
  await page.getByRole('button', { name: 'Começar!' }).click();
  await expect(page.locator('.brief-title')).toBeVisible();
  const id = await page.evaluate(() => document.querySelector('.ide-file-tab') !== null);
  expect(id).toBe(true);
  await page.screenshot({ path: `${SHOTS}/73-lightning.png` });
  await page.getByRole('button', { name: 'Encerrar' }).click();
  await expect(page.getByRole('heading', { name: /Tempo!/ })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/74-lightning-done.png` });
});
