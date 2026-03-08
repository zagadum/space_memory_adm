# 📚 Документация Memory ADM

**Последнее обновление:** 2026-03-06  
**Версия:** 1.0

---

## 🎯 Быстрый старт

### Новичок в проекте?
**Начните здесь:** [`API_ALL.md`](./API_ALL.md) — полная сводка всех API, модалей и компонентов (30 минут)

### Нужна быстрая справка?
- **Payments:** [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md)
- **Groups:** [`GROUPS_QUICK_REFERENCE.md`](./GROUPS_QUICK_REFERENCE.md)

### Работаете над конкретным модулем?
- **Payments:** [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md) (520 строк)
- **Groups:** [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md) (513 строк)

---

## 📂 Структура документации

### 🌟 Главные файлы

| Файл | Описание | Время |
|------|----------|-------|
| **[`API_ALL.md`](./API_ALL.md)** | 📚 **Полная сводка ВСЕХ API** (35+ методов, 16 модалей) | 30 мин |
| [`API.md`](./API.md) | Детальная документация API (1587 строк) | 60 мин |
| [`API_CONFIGURATION.md`](./API_CONFIGURATION.md) | Настройка Mock/Real API режима | 10 мин |
| [`DOCUMENTATION_MAP.md`](./DOCUMENTATION_MAP.md) | Карта навигации по документации | 5 мин |

---

### 💰 Payments Tab (7 файлов)

| Файл | Тип | Описание |
|------|-----|----------|
| [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md) | 📘 Полная документация | 14 API методов + примеры (520 строк) |
| [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md) | ⚡ Шпаргалка | Таблицы, параметры, Quick Start (365 строк) |
| [`PAYMENTS_API_REFERENCE.ts`](./PAYMENTS_API_REFERENCE.ts) | 🔧 TypeScript | Все типы и интерфейсы для IDE |
| [`PAYMENTS_INDEX.md`](./PAYMENTS_INDEX.md) | 📑 Индекс | Главный индекс Payments документации |
| [`PAYMENTS_ARCHITECTURE.md`](./PAYMENTS_ARCHITECTURE.md) | 🏗️ Архитектура | Диаграммы и потоки данных |
| [`PAYMENTS_START_HERE.md`](./PAYMENTS_START_HERE.md) | 🎯 Навигация | С чего начать изучение |
| [`READY_TO_USE.md`](./READY_TO_USE.md) | ✅ Резюме | Что готово и как использовать |

**API методы:** 14  
**Модальные окна:** 12  
**Компоненты:** 6

---

### 👥 Groups Tab (4 файла)

| Файл | Тип | Описание |
|------|-----|----------|
| [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md) | 📘 Полная документация | 10 API методов + примеры (513 строк) |
| [`GROUPS_QUICK_REFERENCE.md`](./GROUPS_QUICK_REFERENCE.md) | ⚡ Шпаргалка | Таблицы, параметры, Quick Start (300 строк) |
| [`GROUPS_API_REFERENCE.ts`](./GROUPS_API_REFERENCE.ts) | 🔧 TypeScript | Все типы и интерфейсы для IDE |
| [`GROUPS_INDEX.md`](./GROUPS_INDEX.md) | 📑 Индекс | Главный индекс Groups документации |

**API методы:** 10  
**Модальные окна:** 3  
**Компоненты:** 1

---

## 🗂️ Документация по модулям

### 🔐 Authentication
- **POST** `/api/auth/sign-in` — вход в систему
- **GET** `/api/auth/me` — данные текущего пользователя

**→** Подробнее: [`API_ALL.md#authentication-api`](./API_ALL.md#-authentication-api)

---

### 💰 Payments (14 методов)
- Загрузка платежей студента
- Транзакции и KSeF счета
- Возврат денег, коррекции
- Тарифы, паузы, скидки
- Архивирование, разблокировка

**→** Подробнее: [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md)

---

### 👥 Groups (10 методов)
- Группы студента
- Перевод между группами
- Посещаемость тренеров
- История групп

**→** Подробнее: [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md)

---

### 📊 Student Info
- Получение информации студента
- Обновление данных

**→** Подробнее: [`API_ALL.md#student-info-api`](./API_ALL.md#-student-info-api)

---

### 📅 Attendance
- Получение посещаемости
- Установка отметок

**→** Подробнее: [`API_ALL.md#attendance-api`](./API_ALL.md#-attendance-api)

---

### 📈 Progress
- Прогресс обучения
- Навыки и достижения

**→** Подробнее: [`API_ALL.md#progress-api`](./API_ALL.md#-progress-api)

---

### 📝 Notes
- Заметки о студенте
- Создание заметок

**→** Подробнее: [`API_ALL.md#notes-api`](./API_ALL.md#-notes-api)

---

### 🚀 New Groups (9 методов)
- Создание новых групп
- Добавление студентов
- Запуск группы

**→** Подробнее: [`API_ALL.md#new-groups-recruitment-api`](./API_ALL.md#-new-groups-recruitment-api)

---

## 🪟 Модальные окна (16 шт.)

### Payments (12 окон)
- `PauseModal` — пауза на обучение
- `DiscountModal` — применить скидку
- `TariffModal` — изменить тариф
- `ExtraModal` — добавить доп. занятие
- `UnlockModal` — разблокировать
- `GroupSplitModal` — разделить группу
- `ArchiveModal` — архивировать
- `ResumeModal` — возобновить
- `RefundModal` → `RefundOkModal` — возврат денег
- `EditInvoiceModal` — редактировать счет
- `KorektaModal` — коррекция баланса

### Groups (2 окна)
- `AttendanceModal` — отметка посещаемости
- `AttendanceStatusModal` — статус посещаемости

### Student Info (1 окно)
- `EditInfoModal` — редактировать информацию

### Trainer (1 окно)
- `TrainerPresenceModal` — отметка тренера

**→** Полный список: [`API_ALL.md#модальные-окна`](./API_ALL.md#-модальные-окна)

---

## ⚙️ Конфигурация

### Смешанный режим Mock/Real API

```bash
# .env
VITE_USE_MOCK=true
VITE_API_BASE_URL=https://memory.firm.kiev.ua

# Mock только для выбранных префиксов
VITE_MOCK_ONLY=api/student/groups,api/payments/refund

# Real только для выбранных префиксов
VITE_REAL_ONLY=api/auth
```

**→** Подробнее: [`API_CONFIGURATION.md`](./API_CONFIGURATION.md) или [`API_ALL.md#конфигурация-api`](./API_ALL.md#-конфигурация-api)

---

## 📊 Статистика проекта

| Показатель | Значество |
|-----------|----------|
| **Файлов документации** | 17 |
| **Строк документации** | 12000+ |
| **API модулей** | 8 |
| **API методов** | 43+ |
| **Модальных окон** | 16 |
| **Компонентов** | 13+ |
| **Основных страниц** | 6 |
| **Табов профиля студента** | 6 |

---

## 🎓 Рекомендации по изучению

### День 1: Обзор (2 часа)
1. [`API_ALL.md`](./API_ALL.md) — полная сводка (30 мин)
2. [`PAYMENTS_INDEX.md`](./PAYMENTS_INDEX.md) — Payments обзор (15 мин)
3. [`GROUPS_INDEX.md`](./GROUPS_INDEX.md) — Groups обзор (15 мин)
4. Один компонент на выбор (60 мин)

### День 2: Payments (3 часа)
1. [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md) — полная документация (60 мин)
2. [`PAYMENTS_ARCHITECTURE.md`](./PAYMENTS_ARCHITECTURE.md) — диаграммы (30 мин)
3. Изучение 3-4 модалей (90 мин)

### День 3: Groups и другие табы (3 часа)
1. [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md) — полная документация (60 мин)
2. InfoTab, AttendanceTab, ProgressTab, NotesTab (120 мин)

### День 4: Практика (4 часа)
- Добавление новой операции с нуля
- Создание нового модального окна
- Интеграция с API

---

## 🔍 Быстрый поиск

### Ищете...?

| Что? | Где? |
|------|------|
| **Все API методы** | [`API_ALL.md`](./API_ALL.md) |
| **Payments справка** | [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md) |
| **Groups справка** | [`GROUPS_QUICK_REFERENCE.md`](./GROUPS_QUICK_REFERENCE.md) |
| **TypeScript типы (Payments)** | [`PAYMENTS_API_REFERENCE.ts`](./PAYMENTS_API_REFERENCE.ts) |
| **TypeScript типы (Groups)** | [`GROUPS_API_REFERENCE.ts`](./GROUPS_API_REFERENCE.ts) |
| **Архитектурные диаграммы** | [`PAYMENTS_ARCHITECTURE.md`](./PAYMENTS_ARCHITECTURE.md) |
| **Модальные окна** | [`API_ALL.md#модальные-окна`](./API_ALL.md#-модальные-окна) |
| **Конфигурация Mock/Real** | [`API_CONFIGURATION.md`](./API_CONFIGURATION.md) |

---

## 🚀 Частые задачи

### 1. Добавить новый API метод
→ [`PAYMENTS_QUICK_REFERENCE.md#quick-start`](./PAYMENTS_QUICK_REFERENCE.md)

### 2. Создать модальное окно
→ [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md) (раздел "Примеры")

### 3. Настроить смешанный режим API
→ [`API_CONFIGURATION.md`](./API_CONFIGURATION.md)

### 4. Понять архитектуру
→ [`PAYMENTS_ARCHITECTURE.md`](./PAYMENTS_ARCHITECTURE.md)

### 5. Найти готовые примеры кода
→ [`PAYMENTS_API_REFERENCE.ts`](./PAYMENTS_API_REFERENCE.ts), [`GROUPS_API_REFERENCE.ts`](./GROUPS_API_REFERENCE.ts)

---

## 📁 Структура файлов

```
docs/
├── README.md                         ← ВЫ ЗДЕСЬ (навигация)
├── API_ALL.md                        ← Полная сводка всех API ⭐
├── API.md                            ← Детальная документация
├── API_CONFIGURATION.md              ← Конфигурация API
├── DOCUMENTATION_MAP.md              ← Карта документации
│
├── Payments (7 файлов)
│   ├── API_PAYMENTS_GUIDE.md        ← Полная документация Payments
│   ├── PAYMENTS_QUICK_REFERENCE.md  ← Шпаргалка Payments
│   ├── PAYMENTS_API_REFERENCE.ts    ← TypeScript типы
│   ├── PAYMENTS_INDEX.md            ← Индекс Payments
│   ├── PAYMENTS_ARCHITECTURE.md     ← Диаграммы Payments
│   ├── PAYMENTS_START_HERE.md       ← С чего начать
│   └── READY_TO_USE.md              ← Финальное резюме
│
└── Groups (4 файла)
    ├── API_GROUPS_GUIDE.md          ← Полная документация Groups
    ├── GROUPS_QUICK_REFERENCE.md    ← Шпаргалка Groups
    ├── GROUPS_API_REFERENCE.ts      ← TypeScript типы
    ├── GROUPS_INDEX.md              ← Индекс Groups
    └── GROUPS_READY.md              ← Финальное резюме
```

---

## 🎯 Выбор файла по задаче

| Задача | Файл | Время |
|--------|------|-------|
| Общий обзор всех API | [`API_ALL.md`](./API_ALL.md) | 30 мин |
| Быстрая справка по Payments | [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md) | 2-5 мин |
| Быстрая справка по Groups | [`GROUPS_QUICK_REFERENCE.md`](./GROUPS_QUICK_REFERENCE.md) | 2-5 мин |
| Глубокое изучение Payments | [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md) | 60 мин |
| Глубокое изучение Groups | [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md) | 60 мин |
| TypeScript в IDE (Payments) | [`PAYMENTS_API_REFERENCE.ts`](./PAYMENTS_API_REFERENCE.ts) | IDE |
| TypeScript в IDE (Groups) | [`GROUPS_API_REFERENCE.ts`](./GROUPS_API_REFERENCE.ts) | IDE |
| Понять архитектуру | [`PAYMENTS_ARCHITECTURE.md`](./PAYMENTS_ARCHITECTURE.md) | 30 мин |
| Настроить Mock/Real | [`API_CONFIGURATION.md`](./API_CONFIGURATION.md) | 10 мин |
| Навигация по документации | [`DOCUMENTATION_MAP.md`](./DOCUMENTATION_MAP.md) | 5 мин |

---

## ✅ Контрольный список

### Перед началом работы
- [ ] Прочитал [`API_ALL.md`](./API_ALL.md)
- [ ] Знаю где находятся API модули
- [ ] Знаю где находятся модальные окна
- [ ] Понимаю структуру проекта
- [ ] Настроил `.env` (mock/real режим)

### При разработке
- [ ] Использую [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md) как справочник
- [ ] Копирую типы из `.ts` файлов
- [ ] Проверяю примеры в Guide файлах
- [ ] Тестирую в mock режиме
- [ ] Тестирую с real API

---

## 📞 Информация

**Проект:** Memory ADM  
**Локация:** `D:\www2\memory-adm`  
**Дата обновления:** 2026-03-06  
**Версия документации:** 1.0  
**Статус:** ✅ Полностью готово

---

## 🎉 Начало работы

### Шаг 1: Прочитайте обзор
→ [`API_ALL.md`](./API_ALL.md) (30 минут)

### Шаг 2: Выберите модуль
- Работаете с платежами? → [`API_PAYMENTS_GUIDE.md`](./API_PAYMENTS_GUIDE.md)
- Работаете с группами? → [`API_GROUPS_GUIDE.md`](./API_GROUPS_GUIDE.md)

### Шаг 3: Используйте шпаргалки
- [`PAYMENTS_QUICK_REFERENCE.md`](./PAYMENTS_QUICK_REFERENCE.md)
- [`GROUPS_QUICK_REFERENCE.md`](./GROUPS_QUICK_REFERENCE.md)

### Шаг 4: Начните разработку! 🚀

---

**Удачной разработки!** 💪

