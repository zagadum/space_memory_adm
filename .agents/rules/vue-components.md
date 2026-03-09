---
trigger: glob
globs: src/**/*.vue
---

# Vue — Правило генерации компонентов
**Activation: Glob — `src/**/*.vue`**

## Шаблон нового компонента

При создании Vue-компонента всегда использовать эту структуру:

```vue
<template>
  <!-- Минимальная разметка. Семантический HTML. -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps<{
  // обязательные и опциональные пропсы с типами
}>()

// Emits
const emit = defineEmits<{
  // события с типами payload
}>()

const { t } = useI18n()

// Логика
</script>

<style scoped>
/* Стили только этого компонента */
</style>
```

## Чеклист перед созданием компонента
1. Проверить — нет ли уже похожего в `src/components/ui/`
2. Если компонент используется в 2+ местах → выносить в `src/components/ui/`
3. Если компонент специфичен для одной страницы → класть рядом со страницей в `components/`

## Состояния которые ВСЕГДА нужны
- `isLoading` — пока данные загружаются показывать skeleton или spinner
- `error` — показывать понятное сообщение об ошибке
- Пустое состояние — что показывать когда данных нет

## Интеграция с i18n
После создания компонента СРАЗУ добавить переводы:
- `src/locales/ru.json` — русский (основной)
- `src/locales/uk.json` — украинский
- `src/locales/pl.json` — польский  
- `src/locales/en.json` — английский

Никогда не оставлять хардкоженный текст в шаблоне.

## Работа с формами
- Использовать `UiInput` из `src/components/ui/`
- Валидацию делать на фронте ДО отправки на сервер
- После успешного submit → показывать toast через `useToast()`

## Асинхронные операции (важно для производительности)
```typescript
// ✓ Правильно — данные в store, компонент только отображает
const store = useStudentsStore()
onMounted(() => store.fetchStudents())

// ✗ Неправильно — axios напрямую в компоненте
const data = await axios.get('/students')
```
