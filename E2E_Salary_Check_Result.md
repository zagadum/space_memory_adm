# E2E Salary Check Result

Дата: 2026-03-10

## Что удалось проверить автоматически

- [x] Backend API тесты проходят (`SalaryApiTest`: 3/3)
- [x] Маршруты salary зарегистрированы под `/api/v1/salary/*`
- [x] Frontend собирается с интеграцией salary API (`vite build`)
- [x] В `teacherSalary.store.ts` вместо mock используется `salaryApi`
- [x] Подтверждение/оспаривание подключены к backend endpoint

## Что требует ручного прогона в браузере

- [ ] Открыть `teacher/salary` и проверить загрузку реальных данных
- [ ] Проверить соответствие полей API и отображения UI
- [ ] Проверить смену месяца и обновление данных
- [ ] Проверить flow `confirm` (status `confirmed`)
- [ ] Проверить flow `dispute` (status `disputed`)
- [ ] Проверить негативные сценарии: `401`, `422`, `404`

## Мини-матрица соответствия API -> UI

- `trainerName` -> карточка тренера (`teacher-name`) -> [ ]
- `status` -> плашка статуса (`st-pill`) -> [ ]
- `subscriptions.amount` -> секция Subscriptions -> [ ]
- `substitutions.amount` -> секция Substitutions -> [ ]
- `methodical.amount` -> секция Methodical -> [ ]
- `individual.amount` -> секция Individual -> [ ]
- `olympiad.amount` -> секция Olympiad -> [ ]
- `admin3pct.amount` -> секция Admin 3% -> [ ]
- `bonuses.amount` -> секция Bonuses -> [ ]
- `trialLessons.rows`/расчет -> секция Trial Lessons -> [ ]
- `month` -> метка периода/селектор -> [ ]

## Команды для ручной проверки

```powershell
Set-Location "D:\www2\space_memory-php8"
php artisan migrate
php artisan db:seed
php artisan serve
```

```powershell
Set-Location "D:\www2\memory-adm"
npm run dev
```

## Итог

Автоматически закрыта техническая часть интеграции (API + store + сборка + тесты).
Финальное закрытие пунктов 7-8 требует ручного UI E2E в браузере.

