import { test, expect } from '@playwright/test';
import { SHOTS, setCode, walkTo, face } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

test('fluxo completo: novo jogo → herói → lição → portão → Aldric', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('fresh')) return;
    sessionStorage.setItem('fresh', '1');
    localStorage.clear();
    localStorage.setItem('devcore.options', JSON.stringify({ textSpeed: 'instant', volume: 0, muted: true, editorFontSize: 15, reducedMotion: 'off' }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Novo Jogo' }).click();
  await page.getByRole('button', { name: /Pular cena/ }).click();

  await page.getByLabel('Como devo registrar você no Arquivo?').fill('Lin');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter'); // gênero padrão
  await page.keyboard.press('ArrowRight'); // Mago (JavaScript)
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'A tinta! Vamos.' }).click();
  await page.getByRole('button', { name: /Pular cena/ }).click();
  await expect(page.locator('.village-hud')).toContainText('Lin');

  // Treino pelo menu
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Treino' }).click();
  await page.getByRole('button', { name: /Lição 1: Guardando valores/ }).click();
  await setCode(page, SOLUTIONS['aldric-l1'].javascript);
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('tab', { name: /Testes/ })).toContainText('4/4');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page.locator('.village-hud')).toBeVisible();

  // Pergaminho pelo menu
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Pergaminho' }).click();
  await expect(page.locator('.scroll-list li.me')).toContainText('Lin');
  await page.screenshot({ path: `${SHOTS}/40-scroll.png` });
  await page.getByRole('button', { name: 'Voltar' }).click();

  // Até o portão: contorna o poço e sobe pela rua de pedras
  await expect(page.locator('.village-hud')).toBeVisible();
  await page.waitForTimeout(300);
  await walkTo(page, 12, 3);
  await face(page, 'ArrowUp');
  await expect(page.locator('.village-hint')).toContainText('Portão');
  await page.screenshot({ path: `${SHOTS}/41-gate.png` });
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'Abrir o portão' }).click();

  // Jornada: dois bugs no caminho e depois o Aldric
  await expect(page.locator('.journey-hud')).toBeVisible();
  await page.keyboard.press('Enter');
  for (const id of ['bug-soma', 'bug-cura']) {
    await page.keyboard.down('ArrowRight');
    await expect(page.locator('.qf')).toBeVisible({ timeout: 15_000 });
    await page.keyboard.up('ArrowRight');
    await setCode(page, SOLUTIONS[id].javascript);
    await page.getByRole('button', { name: /Atacar/ }).click();
    await expect(page.locator('.qf')).toBeHidden({ timeout: 10_000 });
  }
  await page.keyboard.down('ArrowRight');
  await expect(page.getByRole('button', { name: /Lutar/ })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: `${SHOTS}/42-journey-boss.png` });
  await page.getByRole('button', { name: /Lutar/ }).click();

  // a Jornada vai direto para a luta (sem cutscene, para ser rápida no estande)
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${SHOTS}/44-versus.png` });
  await page.keyboard.press('Enter');
  await expect(page.locator('.hpbox-foe')).toBeVisible();
  await setCode(page, SOLUTIONS['aldric-b1'].javascript);
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('.hpbox-foe')).toContainText('Fase 2/2', { timeout: 15_000 });
  await expect(page.locator('.ide-run')).toBeEnabled({ timeout: 10_000 });
  await setCode(page, SOLUTIONS['aldric-b2'].javascript);
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('button', { name: /Pular cena/ })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /Pular cena/ }).click();
  await expect(page.locator('.journey-hud')).toBeVisible();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
  expect(save.player.heroClass).toBe('mage');
  expect(save.lessons['aldric-l1'].done).toBe(true);
  expect(save.bosses.aldric.defeated).toBe(true);
});
