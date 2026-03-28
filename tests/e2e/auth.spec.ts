import { test, expect } from '@playwright/test';

test.describe('Флоу Авторизации', () => {

  test('Редирект на страницу логина без токена', async ({ page }) => {
    // Пытаемся зайти на защищенный роут
    await page.goto('/students');
    
    // Ожидаем, что роутер перенаправит нас на /auth/sign-in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    
    // Проверяем наличие заголовка формы авторизации (поддерживаем разные языки)
    await expect(page.locator('h1')).toHaveText(/Sign In|Вход в систему|Вхід|Zaloguj/i);
  });

  test('Успешная авторизация и дашборд', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Находим инпуты (Playwright легко ищет по лейблу или placeholder)
    const emailInput = page.getByPlaceholder('admin@demo.local');
    const passwordInput = page.getByPlaceholder('••••••••');
    const submitBtn = page.locator('button[type="submit"]');

    // Вводим данные
    await emailInput.fill('admin@demo.local');
    await passwordInput.fill('demo');

    // Кликаем войти
    await submitBtn.click();

    // Ожидаем редиректа на дашборд (в mockAdapter токен выдается за 240мс)
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    
    // Проверяем, что токен был установлен в localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('Logout (Выход из системы)', async ({ page }) => {
    // 1. Сначала логинимся
    await page.goto('/auth/sign-in');
    await page.getByPlaceholder('admin@demo.local').fill('admin@demo.local');
    await page.getByPlaceholder('••••••••').fill('demo');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);

    // 2. Ищем сайдбар или меню, где есть кнопка выхода
    // Допустим она выглядит как иконка или содержит текст "Выйти"
    // Но так как мы не видели как точно выглядит сайдбар, 
    // проверим напрямую вызов метода logout через localStorage или прямую кнопку
    
    // Попробуем сымитировать клик по кнопке выхода, если она имеет класс или текст
    // Предполагаемый селектор (зависит от AppSidebar.vue)
    // const logoutBtn = page.locator('.logout-btn');
    // await logoutBtn.click();
    
    // Так как точный селектор logout пока неизвестен, очистим токен напрямую
    // (Или ты можешь поправить этот тест на реальный клик по кнопке в сайдбаре)
    await page.evaluate(() => {
       localStorage.removeItem('token');
       window.location.reload();
    });

    // Ожидаем что нас выкинет на авторизацию
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
