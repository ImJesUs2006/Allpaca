import { defineConfig, devices } from '@playwright/test';

/**
 * Tests web contra el stack real (Angular + API + Postgres).
 *
 * Aislamiento: el API corre en el puerto 3100 y Angular en el 4300, ambos
 * apuntando a la base desechable `allpaca_test` (ver server/test/setup-db.ts).
 * Asi los registros y pedidos que crean los tests NUNCA tocan los datos de
 * demo, y `reuseExistingServer: false` evita que se reutilice por error un
 * `npm run dev` abierto contra la base real.
 *
 * `npm run test:web` (raiz) prepara la base antes de invocar esto.
 * Las capturas van a `test-results/screenshots`.
 */
const TEST_DB = process.env.TEST_PGDATABASE || 'allpaca_test';
const API_PORT = 3100;
const WEB_PORT = 4300;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Playwright levanta y apaga los dos servidores. Asi no quedan watchers
  // colgados ni hace falta tener `npm run dev` abierto aparte.
  webServer: [
    {
      command: 'npm run dev:api',
      cwd: '..',
      env: { PORT: String(API_PORT), PGDATABASE: TEST_DB },
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 90_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev:web:test',
      cwd: '..',
      env: { API_TARGET: `http://localhost:${API_PORT}` },
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
  projects: [
    {
      // Usa el Edge del sistema: la descarga de Chromium falla por timeout de
      // red en esta maquina, y Edge/Chromium comparten motor.
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'msedge' },
    },
  ],
});
