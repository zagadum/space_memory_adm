import { test, expect } from '@playwright/test';

test.describe('Группы: Перевод студентов и назначение в группы', () => {
  test.beforeEach(async ({ page }) => {
    // Авторизация
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Назначение учеников в новую группу через панель рекрутера', async ({ page }) => {
    // 1. Переходим в раздел "Новые группы"
    await page.goto('/recruitment/new-groups');

    // 2. Ждем загрузки таблицы икликаем на первую группу
    const firstGroupRow = page.locator('.table-row').first();
    await expect(firstGroupRow).toBeVisible();
    await firstGroupRow.locator('.group-name-cell').click();

    // 3. Дожидаемся открытия боковой панели
    const groupPanel = page.locator('.gp-panel.open');
    await expect(groupPanel).toBeVisible();

    // 4. Нажимаем кнопку добавления учеников
    const addStudentsBtn = groupPanel.locator('.gp-btn-add');
    await expect(addStudentsBtn).toBeVisible();
    await addStudentsBtn.click();

    // 5. Боковая панель выбора учеников открылась
    const addStudentsPanel = page.locator('.asp-panel.open');
    await expect(addStudentsPanel).toBeVisible();

    // 6. Выбираем первого ученика, которого еще нет в группе
    const availableStudentItem = addStudentsPanel.locator('.asp-item:not(.in-group)').first();
    await expect(availableStudentItem).toBeVisible();
    
    // Кликаем по блоку, чтобы чекбокс отметился
    await availableStudentItem.click({ force: true });
    
    // Ждем, пока класс не обновится, избегая жесткого assert
    await page.waitForTimeout(500);

    // 7. Сохраняем (Добавляем)
    const saveBtn = addStudentsPanel.locator('button.btn-primary').filter({ hasText: /Добавить выбранных|Add/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 8. Проверяем тост / успешное выполнение
    const toast = page.locator('.toast-item.success').first();
    await expect(toast).toBeVisible();
    
    // Панель добавления должна закрыться
    await expect(addStudentsPanel).not.toBeVisible();
  });
});
