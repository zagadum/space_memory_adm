import { test, expect } from '@playwright/test';

test.describe('Локализация: Смена языка интерфейса (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу логина
    await page.goto('/auth/sign-in');
    
    // Авторизация
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Смена языка с Русского на Польский влияет на боковое меню', async ({ page }) => {
    // 1. Убеждаемся, что мы на главной (или где есть сайдбар)
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // 2. Находим селектор языка
    const langSelect = page.locator('.lang-select');
    await expect(langSelect).toBeVisible();

    // 3. Пробуем переключить на Русский (на случай, если по умолчанию другой)
    await langSelect.selectOption('ru');
    
    // Проверяем, что пункт меню студентов называется "Ученики"
    const studentsNavLabel = page.locator('.nav-item').filter({ hasText: 'Ученики' }).first();
    await expect(studentsNavLabel).toBeVisible();

    // 4. Переключаем на Польский (pl)
    await langSelect.selectOption('pl');

    // Проверяем, что тот же пункт меню теперь называется "Uczniowie"
    const studentsNavLabelPl = page.locator('.nav-item').filter({ hasText: 'Uczniowie' }).first();
    await expect(studentsNavLabelPl).toBeVisible();

    // Проверим также и Английский
    await langSelect.selectOption('en');
    const studentsNavLabelEn = page.locator('.nav-item').filter({ hasText: 'Students' }).first();
    await expect(studentsNavLabelEn).toBeVisible();
  });
});
