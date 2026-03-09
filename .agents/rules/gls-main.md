---
trigger: always_on
---

# GLS Admin — Главное правило проекта
**Activation: Always On**

## Стек проекта
- **Frontend:** Vue 3 (Composition API + `<script setup>`) + TypeScript + Vite + Pinia + vue-router 4 + vue-i18n + Axios
- **Backend:** Laravel 11 + PostgreSQL + Redis (Queue + Cache) + Laravel Sanctum
- **Проект:** CRM для языковой школы в Варшаве (GLS Admin / Space Memory)

## Структура Frontend (`src/`)
```
src/
  api/          # Axios-функции, endpoints.ts, mockAdapter.ts
  app/          # main.ts, router.ts, i18n.ts
  components/   # layout/ и ui/ (UiButton, UiInput, UiBadge, ToastContainer)
  layouts/      # AppLayout.vue, AuthLayout.vue
  stores/       # Pinia stores
  views/        # Страницы по роутам
  locales/      # ru.json, uk.json, pl.json, en.json
  modals/       # ModalHost.vue и модальные окна
  styles/       # base.css, layout.css
```

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
- Все запросы через `src/api/http.ts` (НЕ через httpClient.ts — он не используется)
- Все URL эндпоинтов через `src/api/endpoints.ts` — никаких строк напрямую
- Версионирование: все пути начинаются с `/v1/`
- Типизировать request и response интерфейсы

### Pinia Store — обязательно
- `defineStore` с Composition API стилем (`setup stores`)
- Загрузка данных внутри store, не в компоненте
- Обрабатывать `isLoading`, `error` состояния

### Laravel — обязательно
- Контроллеры: один метод — одна ответственность
- Использовать Form Requests для валидации
- Использовать API Resources для трансформации ответов
- Маршруты в `routes/api.php` с префиксом `/v1/`
- Jobs для любых операций >1 сек (расчёты, отчёты, синхронизация LMS)

## Производительность — критично
- **НИКОГДА** `SELECT COUNT(*)` для счётчиков — использовать таблицу `counters` с инкрементом
- **НИКОГДА** `setInterval` для обновления данных на фронте
- **НИКОГДА** загружать полный список без пагинации
- Тяжёлые расчёты → Laravel Queue Job → возвращать `job_id` → фронт показывает статус

## Формат Student ID
- В базе: целое число (`1`, `2`, `3`)
- В URL: число (`/v1/students/1`)
- В mock-данных: строка с префиксом (`s_1`) — при подключении реального API конвертировать

## Именование
- Компоненты: `PascalCase` (`StudentCard.vue`)
- Store файлы: `camelCase.store.ts` (`students.store.ts`)
- API файлы: `camelCase.api.ts` (`students.api.ts`)
- Переменные/функции: `camelCase`
- CSS классы: `kebab-case`
