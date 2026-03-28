import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Запускать тесты в параллель */
  fullyParallel: true,
  /* Не кидать ошибку если test.only в CI */
  forbidOnly: !!process.env.CI,
  /* Ретраи только в CI */
  retries: process.env.CI ? 2 : 0,
  /* Воркеры: 1 в CI, остальные дефолт */
  workers: process.env.CI ? 1 : undefined,
  /* Формат репортов */
  reporter: 'html',
  
  use: {
    /* Базовый URL для тестов, чтобы использовать page.goto('/') */
    baseURL: 'http://localhost:5173',
    
    /* Собирать трейсы при ретраях */
    trace: 'on-first-retry',
  },

  /* Настройки проектов; пока настроен только Chromium для скорости и простоты */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Автоматически запускать локальный dev server перед тестами */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
