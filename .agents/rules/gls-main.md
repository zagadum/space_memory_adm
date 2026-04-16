---
trigger: always_on
---

# GLS Admin — Главное правило проекта
**Activation: Always On**

---

## Архитектура серверов (локальная разработка)

| Сервис | URL | Проект |
|---|---|---|
| **Frontend (этот проект)** | http://localhost:5173 | `space_memory_adm` |
| **Space Memory Backend** | http://localhost:8000 | `space_memory-recrut` (Laravel 11) |
| **Indigo Backend** | http://localhost:8001 | `Indigo` (Laravel 11) |

> Оба бэкенда — Laravel 11 + PostgreSQL + Redis + Sanctum.

---

## HTTP-клиенты (src/api/http.ts)

В проекте **три Axios-клиента** — нельзя использовать их взаимозаменяемо:

| Клиент | Назначение | baseURL |
|---|---|---|
| `http` | Основной клиент (финансы, студенты, зарплаты) | динамически из `getActiveProjectApiUrl()` |
| `httpRecruitment` | Рекрутация Space Memory | `:8000/api/v1/` |
| `httpRecruitmentIndigo` | Рекрутация Indigo | `:8001/api/v1/` |

```typescript
// Правило: выбирать клиент через хелпер, не импортировать напрямую
import { getRecruitmentHttpClient } from '../api/http'
const client = getRecruitmentHttpClient('indigo')  // → httpRecruitmentIndigo
const client = getRecruitmentHttpClient()           // → httpRecruitment (Space)
```

`http` переключается автоматически при смене проекта в UI (`useProjectStore`).
Рекрутационные клиенты всегда фиксированы на свои порты.

---

## Стек проекта

- **Frontend:** Vue 3 (Composition API + `<script setup>`) + TypeScript + Vite + Pinia + vue-router 4 + vue-i18n + Axios
- **Backend:** Laravel 11 + PostgreSQL + Redis (Queue + Cache) + Laravel Sanctum
- **Бэкенды:** два — Space Memory (`:8000`) и Indigo (`:8001`)
- **CRM:** для языковой школы GLS в Варшаве

---

## Структура Frontend (`src/`)

```
src/
  api/          # Axios-клиенты, endpoints.ts, mockAdapter.ts
  app/          # main.ts, router.ts, i18n.ts
  config/       # projectApi.ts, env.ts — настройки окружения
  components/   # layout/ и ui/ (UiButton, UiInput, UiBadge, ToastContainer)
  layouts/      # AppLayout.vue, AuthLayout.vue
  stores/       # Pinia stores
  views/        # Страницы по роутам
  locales/      # ru.json, uk.json, pl.json, en.json
  modals/       # ModalHost.vue и модальные окна
  styles/       # base.css, layout.css
  utils/        # Хелперы: dayjs, форматирование дат/сумм
```

---

## Правила написания кода

### Vue — обязательно
- Всегда `<script setup lang="ts">` — никакого Options API
- Типизировать все props через `defineProps<{...}>()`
- Типизировать все emits через `defineEmits<{...}>()`
- Использовать `useI18n()` для всех текстов — никаких хардкоженных строк
- Добавлять переводы в ВСЕ 4 файла: `ru.json`, `uk.json`, `pl.json`, `en.json`
- Стили — `<style scoped>` внутри компонента, без внешних CSS-файлов
- Использовать существующие UI-компоненты: `UiButton`, `UiInput`, `UiBadge`

### API — обязательно
- Основные запросы — через `http` из `src/api/http.ts`
- Рекрутация — через `getRecruitmentHttpClient(backend)`, не напрямую
- Все URL эндпоинтов — через `src/api/endpoints.ts` — никаких строк напрямую
- Не использовать `httpClient.ts` — он не используется
- Версионирование: все пути начинаются с `/v1/`
- Типизировать request и response интерфейсы

### Pinia Store — обязательно
- `defineStore` с Composition API стилем (Setup Stores)
- Загрузка данных внутри store, не в компоненте
- Обрабатывать `isLoading`, `error` состояния

### Laravel — обязательно
- Контроллеры: один метод — одна ответственность
- Использовать Form Requests для валидации
- Использовать API Resources для трансформации ответов
- Маршруты в `routes/api.php` с префиксом `/v1/`
- Jobs для любых операций >1 сек (расчёты, отчёты, синхронизация)

---

## Производительность — критично
- **НИКОГДА** `SELECT COUNT(*)` для счётчиков — использовать таблицу `counters` с инкрементом
- **НИКОГДА** `setInterval` для обновления данных на фронте
- **НИКОГДА** загружать полный список без пагинации
- Тяжёлые расчёты → Laravel Queue Job → возвращать `job_id` → фронт показывает статус

---

## Формат Student ID
- В базе: целое число (`1`, `2`, `3`)
- В URL: число (`/v1/students/1`)
- В mock-данных: строка с префиксом (`s_1`) — при подключении реального API конвертировать

---

## Именование
- Компоненты: `PascalCase` (`StudentCard.vue`)
- Store файлы: `camelCase.store.ts` (`students.store.ts`)
- API файлы: `camelCase.api.ts` (`students.api.ts`)
- Переменные/функции: `camelCase`
- CSS классы: `kebab-case`

---

## Работа с датами
- Использовать `dayjs` из `src/utils/` — не `new Date()` и не нативный `Date`
- Всегда нормализовать таймзону через утилиты проекта (баг со смещением дней уже решён)
