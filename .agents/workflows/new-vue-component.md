---
description: 
---

# New Vue Component
**Description:** Создаёт новый Vue 3 компонент с полной типизацией, i18n, состояниями загрузки и подключением к store.

## Steps

### Step 1 — Анализ задачи
Перед созданием компонента ответь на вопросы:
- Как называется компонент и что он делает?
- Где он будет использоваться (страница, layout, shared ui)?
- Какие данные ему нужны — получает через props или из store?
- Нужны ли API-запросы?
- Есть ли похожий компонент в `src/components/ui/` который можно переиспользовать?

### Step 2 — Создать файл компонента
Создать `.vue` файл по пути:
- Если reusable → `src/components/ui/ComponentName.vue`
- Если для конкретной страницы → `src/views/[page]/components/ComponentName.vue`

Использовать структуру из правила `@vue-components.md`.

### Step 3 — Если нужны данные из API
Проверить есть ли уже store для этих данных в `src/stores/`.
- Если store есть — подключить через `useXxxStore()`
- Если нет — создать новый store в `src/stores/xxx.store.ts`

Store должен содержать:
```typescript
const isLoading = ref(false)
const error = ref<string | null>(null)
const items = ref<ItemType[]>([])

async function fetchItems() {
  isLoading.value = true
  error.value = null
  try {
    items.value = await xxxApi.getItems()
  } catch (e) {
    error.value = 'Ошибка загрузки'
  } finally {
    isLoading.value = false
  }
}
```

### Step 4 — Добавить переводы
Открыть все 4 файла локализации и добавить новые ключи:
- `src/locales/ru.json`
- `src/locales/uk.json`
- `src/locales/pl.json`
- `src/locales/en.json`

Формат ключей: `componentName.labelName` (например `studentCard.lastPayment`)

### Step 5 — Добавить в endpoints.ts если нужны новые API
Если компонент использует новый эндпоинт — добавить константу в `src/api/endpoints.ts`:
```typescript
NEW_MODULE: {
  LIST: '/v1/new-module',
  DETAIL: (id: number) => `/v1/new-module/${id}`,
}
```

### Step 6 — Проверка
Убедиться что:
- [ ] Нет хардкоженных строк в шаблоне — всё через `t()`
- [ ] Есть состояние загрузки (skeleton или spinner)
- [ ] Есть обработка ошибки
- [ ] Есть пустое состояние
- [ ] Props типизированы через TypeScript
- [ ] Нет прямых axios-вызовов в компоненте — всё через store или api-функции
