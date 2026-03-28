import { test, expect } from '@playwright/test';

test.describe('Dashboard: Загрузка и статистика', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Дашборд отображает карточки статистики', async ({ page }) => {
    // 1. Переходим на главную (дашборд)
    await page.goto('/');

    // 2. Ждём загрузки карточек статистики
    const statCards = page.locator('.stat-card, .dash-card, .dashboard-stat');
    await expect(statCards.first()).toBeVisible({ timeout: 8000 });

    // 3. Проверяем, что отображается хотя бы 3 карточки
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Навигация из дашборда в модули', async ({ page }) => {
    await page.goto('/');

    // Проверяем, что сайдбар видим и содержит ссылки
    const sidebar = page.locator('.sidebar, .app-sidebar, nav');
    await expect(sidebar.first()).toBeVisible();

    // Кликаем на пункт Recruitment/New Students в сайдбаре
    // Ищем ссылку по тексту или URL
    const recruitmentLink = page.locator('a[href*="new-students"], .sidebar-link, .menu-item').filter({
      hasText: /ученик|student|uczni/i
    }).first();
    
    if (await recruitmentLink.isVisible()) {
      await recruitmentLink.click();
      // Должны перейти на recruitment страницу
      await expect(page).toHaveURL(/recruitment|new-students/);
    }
  });
});
