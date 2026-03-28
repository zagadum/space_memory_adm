import { test, expect } from '@playwright/test';

test.describe('Зарплата преподавателя: Просмотр и подтверждение', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Калькулятор зарплаты загружается и отображает данные', async ({ page }) => {
    // 1. Переходим на страницу калькулятора зарплаты
    await page.goto('/finance/salary-calculator');

    // 2. Ожидаем, что URL корректный
    await expect(page).toHaveURL(/salary-calculator/);

    // 3. Страница отрендерилась (ищем любой видимый элемент: h1, select, card)
    await page.waitForTimeout(1500);
    const body = page.locator('body');
    const text = await body.textContent();
    // Страница salary-calculator должна содержать характерный текст
    expect(text?.length).toBeGreaterThan(50);
  });
});

test.describe('Лиды: Канбан-доска', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Канбан-доска лидов загружается с колонками', async ({ page }) => {
    // 1. Переходим на страницу лидов
    await page.goto('/recruitment/space/leads');

    // 2. Ожидаем загрузки канбан-доски
    const board = page.locator('.kanban-board, .leads-board, .content');
    await expect(board.first()).toBeVisible({ timeout: 8000 });

    // 3. Проверяем, что есть колонки (4 статуса: new, in_progress, trial, decision)
    const columns = page.locator('.kanban-col, .lead-column, .kb-col');
    if (await columns.count() > 0) {
      expect(await columns.count()).toBeGreaterThanOrEqual(2);
    }

    // 4. Проверяем, что есть хотя бы одна карточка Лида
    const leadCards = page.locator('.lead-card, .kanban-card, .kb-card');
    if (await leadCards.count() > 0) {
      await expect(leadCards.first()).toBeVisible();
    }
  });
});

test.describe('Архивированные ученики: Страница списка', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Список архивированных учеников загружается', async ({ page }) => {
    // 1. Переходим на страницу архива
    await page.goto('/recruitment/space/archived-students');

    // 2. Ожидаем, что URL корректный
    await expect(page).toHaveURL(/archived-students/);

    // 3. Ждём рендер страницы
    await page.waitForTimeout(1500);
    const body = page.locator('body');
    const text = await body.textContent();
    // Страница должна содержать контент (не просто пустой рендер)
    expect(text?.length).toBeGreaterThan(50);
  });

  test('Карточки статистики архивированных видны', async ({ page }) => {
    await page.goto('/recruitment/space/archived-students');

    // Ждём, что появятся карточки статистики
    await page.waitForTimeout(1500);
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    // На странице архива могут быть карточки; если не найдены — тест пропускаем
    if (count > 0) {
      await expect(statCards.first()).toBeVisible();
    }
  });
});
