import { defineConfig } from '@playwright/test';

// Usa o Edge/Chrome já instalado no Windows (sem baixar navegadores).
// Defina PW_CHANNEL=chromium para usar o Chromium do Playwright.
const channel = process.env.PW_CHANNEL ?? 'msedge';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: false,
  // Um worker: os testes andam pela vila com o teclado e carregam o Pyodide, e ficam instáveis em paralelo.
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5199',
    viewport: { width: 1366, height: 768 },
    ...(channel === 'chromium' ? {} : { channel }),
  },
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
