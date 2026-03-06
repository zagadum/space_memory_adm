# 📚 Payments Tab - Полный сборник документации

**Дата создания:** 2026-03-06  
**Версия:** 1.0  
**Статус:** ✅ Готово к использованию

---

## 📖 Что это?

Полный сборник документации для вкладки "Оплаты" (Payments Tab) в приложении управления студентами. Включает:

- ✅ Все 14 API методов
- ✅ 12 модальных окон
- ✅ Типы данных и интерфейсы
- ✅ Диаграммы архитектуры
- ✅ Примеры использования
- ✅ Инструкции для разработчиков

---

## 📁 Файлы документации

### 1. **PAYMENTS_INDEX.md** 📑
**Начните с этого файла!**

Главный индекс всей документации. Содержит:
- Краткий обзор
- Таблица всех операций
- Ссылки на другие файлы
- Рекомендуемый порядок изучения

**Когда использовать:** Когда впервые обращаетесь к документации

---

### 2. **PAYMENTS_QUICK_REFERENCE.md** ⚡
**Для быстрого поиска!**

Краткая шпаргалка для разработчиков. Содержит:
- Таблица API методов (14 шт.)
- Таблица модальных окон (12 шт.)
- Параметры для `modal.open()`
- Типичные ошибки и решения
- Quick Start для новой операции
- Полезные команды

**Когда использовать:** Когда нужна быстрая справка

---

### 3. **API_PAYMENTS_GUIDE.md** 📘
**Полная документация!**

Детальный справочник со всеми подробностями. Содержит:
- 14 API методов с описанием
- Все параметры payload
- Примеры использования
- Типы данных с комментариями
- Локализация
- Контрольный список для разработчика

**Когда использовать:** Для глубокого изучения или новичкам

---

### 4. **PAYMENTS_API_REFERENCE.ts** 🔧
**TypeScript типы!**

Экспортируемый TypeScript файл со:
- Всеми интерфейсами (interfaces)
- Типами payload и response
- Константами модалей
- Примерами кода (в виде строк)
- Ссылками на файлы

**Когда использовать:** Для автодополнения в IDE

**Импорт:**
```typescript
import { PAYMENTS_MODALS, DISCOUNT_TYPES, MONTH_STATUSES } from './PAYMENTS_API_REFERENCE';
```

---

### 5. **PAYMENTS_ARCHITECTURE.md** 🏗️
**Визуальные диаграммы!**

Архитектурные диаграммы и схемы. Содержит:
- Диаграмма компонентной иерархии
- Поток данных (Data Flow)
- State Management (Pinia stores)
- Паттерны API вызовов
- Модальная система
- Full Flow операции
- Структура файлов

**Когда использовать:** Для понимания общей архитектуры

---

## 🚀 Быстрый старт

### Сценарий 1: "Я новичок в проекте"

1. Прочитайте **PAYMENTS_INDEX.md** (5 минут)
2. Просмотрите **PAYMENTS_QUICK_REFERENCE.md** (10 минут)
3. Посмотрите **PAYMENTS_ARCHITECTURE.md** диаграммы (10 минут)
4. Изучите существующий модал: например `PauseModal.vue` (20 минут)

**Результат:** Вы поймете структуру и сможете начать работать

---

### Сценарий 2: "Нужно добавить новую операцию"

1. Откройте **PAYMENTS_QUICK_REFERENCE.md**
2. Найдите раздел "Quick Start для новой операции"
3. Следуйте 5 шагам
4. Используйте **API_PAYMENTS_GUIDE.md** для деталей

**Результат:** За 30 минут новая операция готова

---

### Сценарий 3: "Нужна конкретная информация"

1. Используйте **PAYMENTS_QUICK_REFERENCE.md** для быстрого поиска
2. Если нужны детали - см. **API_PAYMENTS_GUIDE.md**
3. Если нужны типы - см. **PAYMENTS_API_REFERENCE.ts**

**Результат:** Нашли то, что нужно

---

## 📊 Что здесь документировано

### API Методы (14 шт.)

| Категория | Методы |
|-----------|--------|
| **Загрузка** | getStudentPayments, getTransactions, getKsefInvoices |
| **Операции** | submitRefund, editInvoice, submitCorrection |
| **Управление** | changeTariff, setPause, setDiscount, addExtra, unlock, split, archive, resume |

### Модальные Окна (12 шт.)

| Имя | ID | Компонент |
|-----|----|---------  |
| Пауза | `pause` | PauseModal.vue |
| Скидка | `discount` | DiscountModal.vue |
| Тариф | `tariff` | TariffModal.vue |
| Дополнительно | `extra` | ExtraModal.vue |
| Разблокировка | `unlock` | UnlockModal.vue |
| Разделение | `groupSplit` | GroupSplitModal.vue |
| Архив | `archive` | ArchiveModal.vue |
| Возобновление | `resume` | ResumeModal.vue |
| Возврат денег | `refund` | RefundModal.vue |
| Возврат ОК | `refund-ok` | RefundOkModal.vue |
| Редактирование | `edit-invoice` | EditInvoiceModal.vue |
| Коррекция | `korekta` | KorektaModal.vue |

### Компоненты (6 шт.)

| Компонент | Роль |
|-----------|------|
| PaymentTab | Главный компонент вкладки |
| PaymentBalance | Информационные карточки |
| PaymentPrograms | Список программ (accordion) |
| PaymentMonthDetail | Детали месяца |
| PaymentActions | Кнопки действий |
| PaymentTransactions | История платежей |

---

## 🎯 Поддерживаемые операции

### 🌙 Пауза на обучение
- **API:** `setPause()`
- **Modal:** PauseModal.vue
- **Где:** PaymentActions.vue
- **Что:** Установить перерыв в обучении (отпуск, экзамены и т.д.)

### 🏷️ Применить скидку
- **API:** `setDiscount()`
- **Modal:** DiscountModal.vue
- **Где:** PaymentActions.vue / PaymentMonthDetail.vue
- **Что:** Применить одноразовую скидку на месяц

### 💱 Изменить тариф
- **API:** `changeTariff()`
- **Modal:** TariffModal.vue
- **Где:** PaymentActions.vue
- **Что:** Изменить стоимость обучения

### ➕ Добавить дополнительное занятие
- **API:** `addExtra()`
- **Modal:** ExtraModal.vue
- **Где:** PaymentActions.vue / сетка месяцев
- **Что:** Добавить дополнительное занятие с отдельной оплатой

### 🔓 Разблокировать
- **API:** `unlock()`
- **Modal:** UnlockModal.vue
- **Где:** PaymentActions.vue
- **Что:** Разблокировать заблокированную программу

### 🔄 Разделить группу
- **API:** `split()`
- **Modal:** GroupSplitModal.vue
- **Где:** PaymentActions.vue / PaymentMonthDetail.vue
- **Что:** Перевести студента в другую группу

### 📦 Архивировать
- **API:** `archive()`
- **Modal:** ArchiveModal.vue
- **Где:** PaymentActions.vue
- **Что:** Архивировать программу обучения

### ▶️ Возобновить
- **API:** `resume()`
- **Modal:** ResumeModal.vue
- **Где:** PaymentActions.vue / PaymentMonthDetail.vue
- **Что:** Возобновить архивированную программу

### ↩️ Возврат денег
- **API:** `submitRefund()`
- **Modal:** RefundModal.vue / RefundOkModal.vue
- **Где:** PaymentMonthDetail.vue
- **Что:** Создать запрос на возврат денежных средств

### 📄 Редактировать счет
- **API:** `editInvoice()`
- **Modal:** EditInvoiceModal.vue
- **Где:** PaymentMonthDetail.vue
- **Что:** Редактировать детали счета

### ✏️ Коррекция
- **API:** `submitCorrection()`
- **Modal:** KorektaModal.vue
- **Где:** PaymentMonthDetail.vue
- **Что:** Создать корректирующий документ

---

## 💻 Технический стек

- **Frontend Framework:** Vue 3
- **State Management:** Pinia
- **HTTP Client:** Axios
- **Language:** TypeScript
- **Localization:** vue-i18n
- **Build Tool:** Vite

---

## 🔑 Ключевые файлы проекта

### API слой
```
src/api/
├── paymentsApi.ts      ← Все методы для платежей
├── http.ts             ← HTTP клиент
├── mockDb.ts           ← Типы данных
└── mockAdapter.ts      ← Mock API
```

### Компоненты
```
src/views/students/components/profile-tabs/payments/
├── PaymentTab.vue
├── PaymentBalance.vue
├── PaymentPrograms.vue
├── PaymentMonthDetail.vue
├── PaymentActions.vue
└── PaymentTransactions.vue
```

### Модальные окна
```
src/modals/templates/
├── PauseModal.vue
├── DiscountModal.vue
├── TariffModal.vue
├── ExtraModal.vue
├── UnlockModal.vue
├── GroupSplitModal.vue
├── ArchiveModal.vue
├── ResumeModal.vue
├── RefundModal.vue
├── RefundOkModal.vue
├── EditInvoiceModal.vue
└── KorektaModal.vue
```

### Хранилище
```
src/stores/
├── payments.store.ts   ← Состояние платежей
└── modal.store.ts      ← Состояние модалей
```

### Локализация
```
src/locales/
├── en.json             ← Английский
├── ru.json             ← Русский
├── uk.json             ← Украинский
└── pl.json             ← Польский
```

---

## 📝 Маршруты

### Главная страница платежей
```
/students/s_{studentId}/payments
```

### Пример
```
/students/s_2/payments    ← Платежи студента с ID 2
```

---

## 🛠️ Как использовать документацию

### Для разработки

1. **Начинающий:**
   - Прочитайте PAYMENTS_INDEX.md
   - Изучите PAYMENTS_ARCHITECTURE.md
   - Посмотрите примеры в API_PAYMENTS_GUIDE.md

2. **Опытный:**
   - Используйте PAYMENTS_QUICK_REFERENCE.md
   - Обращайтесь к PAYMENTS_API_REFERENCE.ts

3. **Архитектор:**
   - Изучите PAYMENTS_ARCHITECTURE.md
   - Прочитайте полный API_PAYMENTS_GUIDE.md

### Для поиска информации

- **Таблицы:** PAYMENTS_QUICK_REFERENCE.md
- **Примеры:** API_PAYMENTS_GUIDE.md
- **Типы:** PAYMENTS_API_REFERENCE.ts
- **Диаграммы:** PAYMENTS_ARCHITECTURE.md

---

## ✅ Контрольный список

Перед стартом:
- [ ] Прочитал PAYMENTS_INDEX.md
- [ ] Посмотрел диаграммы в PAYMENTS_ARCHITECTURE.md
- [ ] Понимаю структуру компонентов
- [ ] Знаю где находятся API методы
- [ ] Знаю где находятся модальные окна
- [ ] Знаю как работает Pinia store

При добавлении новой операции:
- [ ] Добавил API метод в paymentsApi.ts
- [ ] Создал Modal компонент
- [ ] Зарегистрировал модаль в modal.store.ts
- [ ] Добавил импорт в ModalHost.vue
- [ ] Добавил кнопку-триггер
- [ ] Добавил локализацию
- [ ] Протестировал с Mock API
- [ ] Протестировал с реальным API

---

## 📞 Быстрые ссылки

| Файл | Что искать |
|------|-----------|
| PAYMENTS_INDEX.md | Начало, обзор, таблицы |
| PAYMENTS_QUICK_REFERENCE.md | Таблицы, шпаргалка, ошибки |
| API_PAYMENTS_GUIDE.md | Методы, примеры, типы |
| PAYMENTS_API_REFERENCE.ts | TypeScript типы, константы |
| PAYMENTS_ARCHITECTURE.md | Диаграммы, потоки, архитектура |

---

## 🎓 Рекомендуемый порядок изучения

### День 1: Основы (1-2 часа)

1. PAYMENTS_INDEX.md (10 минут)
2. PAYMENTS_QUICK_REFERENCE.md (20 минут)
3. PAYMENTS_ARCHITECTURE.md диаграммы (20 минут)
4. Существующий модал PauseModal.vue (30 минут)

### День 2: Глубокое изучение (2-3 часа)

1. API_PAYMENTS_GUIDE.md (60 минут)
2. payments.store.ts + modal.store.ts (30 минут)
3. Несколько компонентов (PaymentPrograms, PaymentMonthDetail) (30 минут)

### День 3: Практика (3-4 часа)

1. Добавить простую операцию
2. Добавить среднюю операцию
3. Добавить сложную операцию

---

## 🐛 Типичные проблемы

| Проблема | Решение |
|----------|---------|
| "Не знаю где начать" | → PAYMENTS_INDEX.md |
| "Нужна информация быстро" | → PAYMENTS_QUICK_REFERENCE.md |
| "Не работает модаль" | → Проверьте modal.store.ts и ModalHost.vue |
| "API возвращает ошибку" | → Проверьте paymentsApi.ts и endpoint |
| "Непонятно как работает" | → PAYMENTS_ARCHITECTURE.md |

---

## 📈 Статистика

- **API методов:** 14
- **Модальных окон:** 12
- **Компонентов платежей:** 6
- **Файлов документации:** 5
- **Строк кода документации:** 2000+
- **Диаграмм:** 10+
- **Примеров:** 20+

---

## 🚀 Следующие шаги

1. **Для разработчика:**
   - Прочитайте эту документацию
   - Изучите существующие модали
   - Начните добавлять новые функции

2. **Для архитектора:**
   - Проверьте архитектурные диаграммы
   - Обсудите паттерны с командой
   - Планируйте расширения

3. **Для тестировщика:**
   - Прочитайте операции
   - Составьте тест-кейсы
   - Протестируйте каждую операцию

---

## 📄 Документ меньше необходимо поддерживать

Все файлы документации находятся в корне проекта:
- `/API_PAYMENTS_GUIDE.md`
- `/PAYMENTS_QUICK_REFERENCE.md`
- `/PAYMENTS_API_REFERENCE.ts`
- `/PAYMENTS_INDEX.md`
- `/PAYMENTS_ARCHITECTURE.md`
- `/PAYMENTS_DOCUMENTATION_INDEX.md` ← Этот файл

---

## ✨ Особенности этого сборника

✅ **Полнота** - Охватывает все аспекты платежной системы  
✅ **Актуальность** - Создано 2026-03-06  
✅ **Структурированность** - Логичный порядок материала  
✅ **Примеры** - Готовые к использованию примеры кода  
✅ **Диаграммы** - Визуальное представление архитектуры  
✅ **TypeScript** - Полная типизация в отдельном файле  
✅ **Локализация** - Информация о поддерживаемых языках  
✅ **Контрольные списки** - Готовые чек-листы для разработчика  

---

## 📧 Обратная связь

Если вы обнаружили ошибку или неточность в документации:
1. Проверьте текущий статус функции в коде
2. Обновите соответствующий файл документации
3. Убедитесь что все файлы синхронизированы

---

**Удачи в разработке! 🚀**

*Документация создана для облегчения работы с платежной системой студентов*


