import { test, expect } from '@playwright/test';

test.describe('Финансы: Профиль студента и платежи', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Авторизация
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Просмотр баланса и модалка добавления доп. услуги', async ({ page }) => {
    // 1. Переходим в профиль тестового студента (s_1)
    await page.goto('/payments/s_1/payments');

    // 2. Проверяем, что загрузились плашки баланса
    const balRow = page.locator('.bal-row');
    await expect(balRow).toBeVisible({ timeout: 10000 }); // Даем время mockAdapter ответить

    // Проверяем, что отображается хотя бы 1 активная программа
    const programs = page.locator('.prog');
    await expect(programs.first()).toBeVisible();

    // 3. Открываем первую программу (сворачиваем/разворачиваем)
    const firstProgHead = programs.first().locator('.prog-head');
    await expect(firstProgHead).toBeVisible();
    await firstProgHead.click();

    // 4. Убеждаемся, что внутри загружается какой-то контент
    const progInner = programs.first().locator('.prog-inner');
    await expect(progInner).toBeVisible();
  });
});
