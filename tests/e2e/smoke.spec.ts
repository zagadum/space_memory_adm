import { test, expect } from '@playwright/test';

test.describe('Smoke test', () => {
  test('Приложение загружается', async ({ page }) => {
    // webServer автоматически поднимет 'npm run dev' на http://localhost:5173
    //baseURL уже настроен в playwright.config.ts
    await page.goto('/');

    // Проверяем, что в head правильный title
    await expect(page).toHaveTitle(/Memori \· Payments/i);

    // Убедимся, что контейнер приложения не пустой
    // т.е. Vue успешно примонтировался внутрь <div id="app"></div>
    const appContainer = page.locator('#app');
    
    // Ждем, пока внутри #app появится хотя бы один элемент-потомок
    // (т.е. Vue начал рендер)
    await expect(appContainer.locator('*').first()).toBeVisible({ timeout: 10000 });
  });
});
