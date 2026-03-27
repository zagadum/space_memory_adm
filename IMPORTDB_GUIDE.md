# ImportDB: Руководство реализации

## Что было добавлено

### 1. API слой (`src/api/importDbApi.ts`)
- **Интерфейсы:**
  - `ImportDbItem` - структура элемента с полями: id, surname, first_name, parent_email, phone, nickname, subscription_amount, contract_old_new, balance_overpayment, discount, is_send, is_done
  - `ImportDbListResponse` - ответ со списком и пагинацией

- **Методы API:**
  - `getImportDbList(params)` - получить список импортированных данных
  - `deleteImportDbItem(id)` - удалить запись
  - `resendInvitation(id)` - повторно отправить приглашение
  - `updateImportDbItem(id, payload)` - обновить запись

### 2. Pinia Store (`src/stores/importDb.store.ts`)
- **Состояние:** items, isLoading, error, pagination, backend
- **Вычисляемые свойства:** sentCount, doneCount, pendingCount
- **Действия:** fetchImportDbList, deleteImportDbItem, resendInvitation, updateImportDbItem

### 3. Страница компонента (`src/views/recruitment/ImportDbPage.vue`)
- Таблица с полями ImportDB
- Действия: удалить (с модальным подтверждением), отправить приглашение
- Поиск по фамилии, имени, email, телефону
- Статистика: всего, отправлено, завершено, в ожидании
- Экспорт данных в CSV
- Поддержка двух бэкендов (Space и Indigo)

### 4. Маршруты (`src/app/router.ts`)
```
/recruitment/space/import-db       → ImportDbPage (Space)
/recruitment/indigo/import-db      → ImportDbPage (Indigo)
/recruitment/import-db             → редирект на space версию
```

### 5. Конфиг меню (`src/config/menuAccess.config.ts`)
- Добавлено "import-db" в MENU_ACCESS_CONFIG как "active"
- Добавлено в MENU_SECTION_ITEMS для recruitment
- Добавлено в MENU_ROUTE_KEY_MAP

### 6. Боковая навигация (`src/components/layout/AppSidebar.vue`)
- Пункт меню "Import DB" (📥) в обеих секциях (Space и Indigo)
- Обновлена логика выделения активного пункта

### 7. Локализация (`src/locales/ru.json`)
- Добавлены все необходимые переводы под ключом "importDb"
- Поддержка всех полей таблицы и действий

## Использование

### Для конечного пользователя
1. Открыть меню "Рекрутация" (Space или Indigo)
2. Выбрать пункт "Import DB"
3. Использовать таблицу для:
   - Поиска по фамилии, имени, email, телефону
   - Просмотра статуса отправки приглашений
   - Отправки повторного приглашения (кнопка ✉️)
   - Удаления записей (кнопка 🗑️ с подтверждением)
   - Экспорта данных в CSV

### Для разработчика
- API эндпоинт: `/recruitment/import-db`
- Backend поддерживает: GET (список), DELETE (удалить), POST (отправить приглашение)
- Mock данные можно добавить в `src/api/mockDb.ts`
- Store можно использовать в других компонентах через `useImportDbStore()`

## Структура запроса к API

### GET /recruitment/import-db?page=1&per_page=10
Ответ:
```json
{
  "data": [
    {
      "id": 1,
      "surname": "Иванов",
      "first_name": "Иван",
      "parent_email": "parent@example.com",
      "phone": "+48123456789",
      "nickname": "Ivan",
      "subscription_amount": "99.99",
      "contract_old_new": "new",
      "balance_overpayment": "10.50",
      "discount": "5.00",
      "is_send": true,
      "is_done": false
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 10,
  "total": 50
}
```

### DELETE /recruitment/import-db/:id
Удаляет запись

### POST /recruitment/import-db/:id/resend-invitation
Повторно отправляет приглашение

## Известные ограничения

1. Mock API не реализован - требуется реальный backend
2. Пакетные действия (удалить/отправить несколько) не реализованы
3. Редактирование данных в таблице не реализовано (только удаление и повторная отправка)

## Тестирование

Для локального тестирования:
```bash
npm run dev
# Перейти на http://localhost:5173/recruitment/space/import-db
```

## Файлы, которые были добавлены/изменены

✅ **Новые файлы:**
- `src/api/importDbApi.ts`
- `src/stores/importDb.store.ts`
- `src/views/recruitment/ImportDbPage.vue`

✅ **Изменённые файлы:**
- `src/app/router.ts` - добавлены маршруты
- `src/config/menuAccess.config.ts` - добавлена конфигурация доступа
- `src/components/layout/AppSidebar.vue` - добавлены пункты меню
- `src/locales/ru.json` - добавлены переводы

