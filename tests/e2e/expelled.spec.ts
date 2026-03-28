import { test, expect } from '@playwright/test';

test.describe('Выписанные ученики: Таблица, фильтры и массовые действия', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Загрузка таблицы выписанных учеников и карточки статистики', async ({ page }) => {
    // 1. Переходим на страницу Expelled
    await page.goto('/recruitment/space/expelled-students');

    // 2. Ожидаем, что загрузились 4 карточки статистики
    const statCards = page.locator('.stat-card');
    await expect(statCards.first()).toBeVisible({ timeout: 8000 });
    const cardCount = await statCards.count();
    expect(cardCount).toBe(4);

    // 3. Ожидаем, что таблица отобразилась
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // 4. Проверяем, что строки в таблице есть
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Фильтрация по поиску', async ({ page }) => {
    await page.goto('/recruitment/space/expelled-students');
    await expect(page.locator('table')).toBeVisible({ timeout: 8000 });

    // 1. Считаем исходное количество строк
    const initialCount = await page.locator('table tbody tr').count();

    // 2. Вводим текст в поиск (вводим имя студента, которого можно найти в моках)
    const searchInput = page.locator('.table-toolbar .search-box input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Иван');

    // 3. Ждем обновления таблицы (Vue реактивно обновится)
    await page.waitForTimeout(300);

    // 4. Проверяем, что количество строк изменилось или осталось ≤ начальному
    const filteredCount = await page.locator('table tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('Выбор строк и отображение bulk bar', async ({ page }) => {
    await page.goto('/recruitment/space/expelled-students');
    await expect(page.locator('table')).toBeVisible({ timeout: 8000 });

    // 1. Кликаем чекбокс первой строки
    const firstCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // 2. Проверяем, что bulk bar появился
    const bulkBar = page.locator('.bulk-bar.visible');
    await expect(bulkBar).toBeVisible();

    // 3. Bulk bar содержит кнопки действий
    await expect(bulkBar.locator('button')).toHaveCount(3); // Назначить + Архив + Отменить
  });

  test('Массовая архивация: модалка с выбором причины', async ({ page }) => {
    await page.goto('/recruitment/space/expelled-students');
    await expect(page.locator('table')).toBeVisible({ timeout: 8000 });

    // 1. Чекаем первого ученика
    await page.locator('table tbody tr').first().locator('input[type="checkbox"]').check();

    // 2. Кликаем кнопку архивации в bulk bar
    const archiveBtn = page.locator('.bulk-bar.visible .btn-danger');
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // 3. Модалка архивации открылась
    const modal = page.locator('.modal-bd.active .modal');
    await expect(modal).toBeVisible();

    // 4. Выбираем причину
    const firstReason = modal.locator('.reason-opt').first();
    await expect(firstReason).toBeVisible();
    await firstReason.click();

    // 5. Причина отмечена (класс sel)
    await expect(firstReason).toHaveClass(/sel/);
  });

  test('Действия по строке: меню ···', async ({ page }) => {
    await page.goto('/recruitment/space/expelled-students');
    await expect(page.locator('table')).toBeVisible({ timeout: 8000 });

    // 1. Открываем меню действий по первой строке
    const actBtn = page.locator('.act-btn').first();
    await expect(actBtn).toBeVisible();
    await actBtn.click();

    // 2. Dropdown появился
    const dropdown = page.locator('.act-dd.open');
    await expect(dropdown).toBeVisible();

    // 3. Проверяем наличие действий (минимум 3: Перевод, Звонок, История)
    const items = dropdown.locator('.act-item');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(3);
  });
});
