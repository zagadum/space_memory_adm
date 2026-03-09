1) Переключение календаря: Grid ↔ Table

Во вкладке Платежи кнопка “Таблица” теперь активна:

для каждой программы хранится viewMode[p.id] (grid / table)

в режиме Table показывается таблица по 12 месяцам, кликом выбирается месяц (как и в гриде)

Файлы:

src/tabs/PaymentsTab.vue

стили таблицы: src/styles/base.css (блок /* Calendar table view */)

2) Модальные окна: вызовы + привязка к API (mock)

Все действия теперь не “просто закрывают окно”, а дергают мок-эндпоинты:

2.1 Pause

модалка: PauseModal.vue

API: POST api/payments/pause

2.2 Знижка (Discount)

модалка: DiscountModal.vue

API: POST api/payments/discount

2.3 Invoice

модалка: EditInvoiceModal.vue

API: POST api/payments/invoice

2.4 Refund

модалка: RefundModal.vue

API: POST api/payments/refund (как было) + правильный payload

2.5 Correction

модалка: KorektaModal.vue

API: POST api/payments/correction

2.6 Тариф

модалка: TariffModal.vue

API: POST api/payments/tariff (как было) + подтягивание programId/monthIndex из контекста

2.7 Додаткові (Extra)

модалка: ExtraModal.vue

API: POST api/payments/extra

2.8 Unlock

модалка: UnlockModal.vue

API: POST api/payments/unlock

2.9 Arhive

модалка: ArchiveModal.vue

API: POST api/payments/archive

2.10 split

модалка: GroupSplitModal.vue

API: POST api/payments/split

2.11 Resume

модалка: ResumeModal.vue

API: POST api/payments/resume

Где прописаны маршруты моков:

src/api/mockAdapter.ts

3) Транзакции — по API (mock), не из программы

Теперь транзакции грузятся отдельным запросом:

API: GET api/payments/transactions?programId=...

store: payments.loadTransactions(programId) (кеширует)

UI: при раскрытии блока “Транзакции” автоматически подтягивает данные

Файлы:

src/api/paymentsApi.ts (добавлен getTransactions)

src/stores/payments.store.ts (transactionsByProgram + loading/error)

src/api/mockDb.ts (добавлен mockTransactions)

src/tabs/PaymentsTab.vue (отрисовка + состояния загрузки)

3.2 Тексты вынесены в языки

Добавлены новые ключи в:

src/locales/en.json

src/locales/pl.json

src/locales/uk.json

Вынесено:

статусы (Paid/Pending/Overdue/…)

подписи таблицы

кнопки (Unlock/Archive/Split/Resume)

тексты и опции модалок (discount types, archive reasons, placeholders и т.д.)