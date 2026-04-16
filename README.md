# GLS Admin — Space Memory & Indigo CRM

**GLS Admin** — CRM-панель для языковой школы Global Leaders Skills (Варшава).
Управляет финансами, студентами, расписанием и рекрутацией для двух продуктов:
**Space Memory** (Польша + Украина) и **Indigo** (отдельный бэкенд).

---

## Архитектура (локальная разработка)

| Сервис | URL | Проект |
|---|---|---|
| **Frontend (этот проект)** | http://localhost:5173 | `space_memory_adm` |
| **Space Memory Backend** | http://localhost:8000 | `space_memory-recrut` |
| **Indigo Backend** | http://localhost:8001 | `Indigo` |

Фронтенд общается с ДВУМЯ независимыми бэкендами через три Axios-клиента:

```
src/api/http.ts
├── http                  — основной клиент (переключается с проектом в UI)
├── httpRecruitment       — рекрутация Space Memory → :8000
└── httpRecruitmentIndigo — рекрутация Indigo       → :8001
```

Функция `getRecruitmentHttpClient('indigo')` возвращает нужный клиент по имени бэкенда.

---

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Создать локальный конфиг (не коммитить)
cp .env.example .env.local
# .env.local уже настроен под localhost:8000 / localhost:8001

# 3. Запустить дев-сервер
npm run dev
# → http://localhost:5173
```

> Перед запуском убедитесь что оба бэкенда запущены: `:8000` и `:8001`.

---

## Тестовые данные

Файл `indigo_recruting.sql` в корне проекта — дамп базы с тестовыми данными для Indigo.

```bash
# Залить в локальную БД Indigo
psql -U postgres -d indigo_db < indigo_recruting.sql
```

---

## Стек

### Frontend
- **Vue 3** — Composition API + `<script setup lang="ts">`
- **Pinia** — Setup Store (загрузка данных в store, не в компоненте)
- **Vite** — сборщик и дев-сервер
- **Axios** — три клиента с перехватчиками токена и глобальным loading

### Backend (оба проекта)
- **Laravel 11** — API, очереди, Jobs
- **PostgreSQL** — основная БД
- **Redis** — кеш и очереди
- **Laravel Sanctum** — аутентификация

---

## Структура `src/`

```
src/
  api/          # Axios-клиенты, endpoints.ts, mockAdapter.ts
  app/          # main.ts, router.ts, i18n.ts
  components/   # ui/ — UiButton, UiInput, UiBadge и др.
  config/       # projectApi.ts, env.ts — настройки окружения
  layouts/      # AppLayout.vue, AuthLayout.vue
  stores/       # Pinia stores (вся бизнес-логика)
  views/        # Страницы по роутам
  modals/       # ModalHost.vue и модальные окна
  locales/      # ru.json, uk.json, pl.json, en.json
  styles/       # base.css, layout.css (CSS-переменные, дизайн-токены)
  types/        # Общие TypeScript интерфейсы
  utils/        # Хелперы: даты (dayjs), форматирование, строки
```

---

## Mock-режим

По умолчанию `VITE_USE_MOCK=false` (реальный API).
Для работы без бэкенда:

```bash
# .env.local
VITE_USE_MOCK=true
```

Можно миксовать: `VITE_MOCK_ONLY=salary` / `VITE_REAL_ONLY=auth,students`.

---

## Ключевые правила (для агентов)

- Правила кода: `.agents/rules/gls-main.md` (всегда активен)
- Правила Vue-компонентов: `.agents/rules/vue-components.md`
- Правила Laravel: `.agents/rules/laravel-backend.md`
- Воркфлоу нового компонента: `.agents/workflows/new-vue-component.md`
- Воркфлоу нового API: `.agents/workflows/new-laravel-api.md`

---

© 2026 Global Leaders Skills. All rights reserved.
