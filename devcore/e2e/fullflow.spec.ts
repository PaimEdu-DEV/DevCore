import { test, expect, type Page } from '@playwright/test';
import { SHOTS, setCode } from './helpers';
import { SOLUTIONS } from '../src/game/data/challenges/solutions';

async function step(page: Page, key: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.down(key);
    await page.waitForTimeout(175);
    await page.keyboard.up(key);
    await page.waitForTimeout(40);
  }
}

test('fluxo completo: novo jogo → herói → lição → portão → Aldric', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('fresh')) return;
    sessionStorage.setItem('fresh', '1');
    localStorage.clear();
    localStorage.setItem('devcore.options', JSON.stringify({ textSpeed: 'instant', volume: 0, muted: true, editorFontSize: 15, reducedMotion: 'off' }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pressione Enter' }).waitFor();
  await page.keyboard.press('Enter');
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

  // Até o portão: um passo à direita e dez para cima
  await expect(page.locator('.village-hud')).toBeVisible();
  await page.waitForTimeout(300);
  await step(page, 'ArrowRight');
  // sobe até o portão aparecer na dica (robusto a variações de tempo)
  for (let i = 0; i < 16; i++) {
    if ((await page.locator('.village-hint').allTextContents()).join('').includes('Portão')) break;
    await step(page, 'ArrowUp');
    await page.waitForTimeout(120);
  }
  await expect(page.locator('.village-hint')).toContainText('Portão');
  await page.screenshot({ path: `${SHOTS}/41-gate.png` });
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'Atravessar o portão' }).click();
  await expect(page.getByRole('heading', { name: 'O Portão do Reino' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/42-boss-select.png` });
  await page.getByRole('button', { name: /Aldric: disponível/ }).click();
  await page.getByRole('option', { name: 'Lutar mesmo assim' }).click();

  // apresentação do Aldric
  await expect(page.getByRole('button', { name: /Pular cena/ })).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${SHOTS}/43-aldric-intro.png` });
  await page.getByRole('button', { name: /Pular cena/ }).click();

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
  await expect(page.locator('.village-hud')).toBeVisible();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('devcore.save')!));
  expect(save.player.heroClass).toBe('mage');
  expect(save.lessons['aldric-l1'].done).toBe(true);
  expect(save.bosses.aldric.defeated).toBe(true);
});
