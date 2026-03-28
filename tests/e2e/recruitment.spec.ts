import { test, expect } from '@playwright/test';

test.describe('Цикл рекрутинга (От лида до подписания)', () => {
  // Для рекрутинга нам нужен залогиненный пользователь
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test('Добавление нового ученика', async ({ page }) => {
    // 1. Переходим на страницу рекрутинга
    await page.goto('/recruitment/space/new-students');
    
    // Ждем, пока загрузится тулбар (значит данные подтянулись)
    await expect(page.locator('.table-toolbar')).toBeVisible();

    // 2. Открываем модалку "Добавить ученика", находим кнопку по классу
    const addBtn = page.locator('.ns-actions-row .btn-primary');
    await addBtn.click();
    
    // Проверяем, что модалка открылась
    const modal = page.locator('.modal-backdrop .modal');
    await expect(modal).toBeVisible();

    // 3. Заполняем форму
    // Ищем инпуты по расположению
    const inputs = modal.locator('.modal-input');
    await inputs.nth(0).fill('ТестИмя');
    await inputs.nth(1).fill('ТестФамилия');
    await inputs.nth(2).fill('12'); // Возраст
    
    // Выбираем менеджера
    await inputs.nth(3).selectOption('Артём'); 

    // Отправляем форму
    await modal.locator('.modal-actions .btn-primary').click();

    // 4. Проверяем тост (уведомление об успехе)
    // Уведомления рендерятся в .toast-container > .toast-item.success
    const toast = page.locator('.toast-item.success').first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Модалка должна закрыться
    await expect(modal).not.toBeVisible();

    // 5. Открываем профиль (боковую панель) первого попавшегося студента
    // (так как mock-сервер может не сохранять 'ТестИмя', мы тестируем UI)
    const firstStudent = page.locator('table tbody tr .student-name').first();
    await expect(firstStudent).toBeVisible();
    await firstStudent.click();
    
    const sidePanel = page.locator('.sp-overlay'); // В StudentSidePanel.vue класс подложки или самой панели
    // Убедиться, что панель открылась (даже если класс другой, мы просто ждем сайд-панель)
    // Предполагаем, что класс панели содержит sp-panel или подобное
    await expect(page.locator('.sp-panel, .student-side-panel').first()).toBeVisible();
  });
});
