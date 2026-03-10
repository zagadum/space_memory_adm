# Sallery Plan

## Цель
Интегрировать модуль зарплат между `space_memory-php8` (API/БД) и `memory-adm` (web UI) через `/api/v1/*`.

## План и статус

- [x] 1. Создать миграции таблиц зарплатного модуля
  - `space_memory-php8/database/migrations/2026_03_10_130000_create_gls_salary_module_tables.php`
- [x] 2. Создать таблицы
  - `gls_salary_calculations`
  - `gls_salary_disputes`
- [x] 3. Создать тестовые данные
  - `space_memory-php8/database/seeders/SalaryModuleSeeder.php`
  - подключено в `space_memory-php8/database/seeders/DatabaseSeeder.php`
- [x] 4. Написать тест-кейсы
  - `space_memory-php8/tests/Feature/SalaryApiTest.php`
- [x] 5. Добавить API с префиксом `/api/v1/`
  - GET `/api/v1/salary/teacher/{teacherId}`
  - POST `/api/v1/salary/{id}/confirm`
  - POST `/api/v1/salary/{id}/dispute`
- [x] 6. В `memory-adm` добавить вызов API модуля зарплат
  - `memory-adm/src/api/salaryApi.ts`
  - `memory-adm/src/stores/teacherSalary.store.ts`
- [~] 7. Протестировать веб-интерфейс `memory-adm` с API `space_memory-php8`
  - Автоматически выполнено: сборка frontend + проверка интеграции store/api
  - Осталось: ручной E2E в браузере (авторизация, экран `teacher/salary`)
- [~] 8. Проверить, что ответы соответствуют отображению в UI
  - Автоматически выполнено: API тесты + проверка маршрутов `/api/v1/salary/*`
  - Осталось: визуальная сверка API->UI по чек-листу
  - Отчет: `memory-adm/E2E_Salary_Check_Result.md`

## Созданные backend-компоненты
- `app/Models/GlsSalaryCalculation.php`
- `app/Models/GlsSalaryDispute.php`
- `app/Http/Controllers/Api/Salary/SalaryController.php`
- `app/Http/Requests/Api/Salary/GetTeacherSalaryRequest.php`
- `app/Http/Requests/Api/Salary/ConfirmSalaryRequest.php`
- `app/Http/Requests/Api/Salary/DisputeSalaryRequest.php`

## Критерии готовности
- API зарплат доступно только через `/api/v1/*`.
- Данные зарплаты читаются из backend в `TeacherSalaryPage`.
- Подтверждение и оспаривание уходят в backend.
- Feature-тесты API проходят.
