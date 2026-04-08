# GLS CRM — Модуль Faktury
## Полный анализ задачи и план реализации

**Версия ТЗ:** v1.0 / Март 2026  
**Стек:** Vue 3 + Pinia | Laravel 11 | PostgreSQL  
**Проект:** Global Leaders Skills Sp. z o.o. — EdTech (Space Memory, Speedy Mind INDIGO)

---

## 1. Обзор модуля

Модуль управляет полным жизненным циклом счетов-фактур:
- Автоматическая генерация после оплаты через **Imoje** (webhook)
- Ручное выставление B2C / B2B / Pro Forma
- Корректировочные фактуры FK / FVK
- Экспорт в XLSX формат **Comarch ERP Optima** (18 колонок)
- 5 ролей с разными правами доступа

**Три юридических лица (firma_id):**
| ID | Название | NIP |
|----|----------|-----|
| 1 | Global Leaders Skills Sp. z o.o. | 525-297-09-24 |
| 2 | E-sklep Space Memory — Hrableuski | 527-285-49-02 |
| 3 | Oleksii Lubenets JDG | 527-300-33-88 |

---

## 2. Типы фактур и нумерация

| Тип | Формат номера | Пример |
|-----|---------------|--------|
| Фактура B2C | `FA/[ПРОЕКТ]/ГГГГ/ММ/NNN` | FA/SPACE/2025/05/042 |
| Корректировка B2C | `FK/[ПРОЕКТ]/ГГГГ/ММ/NNN` | FK/SPACE/2025/05/003 |
| Pro Forma | `PF/[ПРОЕКТ]/ГГГГ/ММ/NNN` | PF/INDIGO/2025/05/001 |
| Фактура B2B | `FV/B2B/ГГГГ/ММ/NNN` | FV/B2B/2025/05/006 |
| Корректировка B2B | `FVK/B2B/ГГГГ/ММ/NNN` | FVK/B2B/2025/05/002 |

**Проекты:** SPACE | INDIGO | OLIMP | B2B  
**NNN** — трёхзначный с ведущими нулями, сбрасывается в 001 каждый месяц.

---

## 3. Роли и права доступа

| Действие | superadmin | bookkeeper | admin | manager | trainer |
|----------|-----------|------------|-------|---------|---------|
| Просмотр модуля | ✅ | ✅ | ✅ | ✅ | ❌ |
| Создать B2C/B2B/PF | ✅ | — | ✅ | ✅ | ❌ |
| Создать FK / FVK | ✅ | ✅ | ✅ | ✅ | ❌ |
| Редактировать | ✅ | ✅ | ✅ | ✅ | ❌ |
| Изменить номер | ✅ | ✅ | — | — | ❌ |
| Удалить (soft) | ✅ | ✅ | — | — | ❌ |
| Экспорт XLSX | ✅ | ✅ | ✅ | ✅ | ❌ |
| Отправить email | ✅ | — | ✅ | ✅ | ❌ |

> **Trainer** не видит модуль вообще. Двойная защита: Vue Router guard + Laravel Gate.

---

## 4. Статусы фактуры

| Статус | Код | Когда | Переход |
|--------|-----|-------|---------|
| Выставлена | `wystawiona` | Ручное создание | → wyslana, anulowana |
| Отправлена | `wyslana` | После email | → oplacona, anulowana |
| Оплачена | `oplacona` | Imoje или вручную | ❌ нельзя изменить |
| Аннулирована | `anulowana` | После FK до 0 zł | ❌ нельзя изменить |

**Правила редактирования:** `oplacona` и `anulowana` — заблокированы. Только через FK/FVK.

---

## 5. REST API — Laravel 11

### Маршруты

```php
Route::middleware(['auth:sanctum'])->prefix('api/invoices')->group(function () {
    Route::get   ('/',               [InvoiceController::class, 'index']);
    Route::post  ('/',               [InvoiceController::class, 'store']);
    Route::get   ('/{id}',           [InvoiceController::class, 'show']);
    Route::put   ('/{id}',           [InvoiceController::class, 'update']);
    Route::put   ('/{id}/number',    [InvoiceController::class, 'updateNumber']);
    Route::post  ('/{id}/correct',   [InvoiceController::class, 'createCorrection']);
    Route::delete('/{id}',           [InvoiceController::class, 'destroy']);
    Route::post  ('/{id}/email',     [InvoiceController::class, 'sendEmail']);
    Route::get   ('/export',         [InvoiceController::class, 'export']);
});

Route::post('/webhooks/imoje', [ImojeWebhookController::class, 'handle']);
Route::apiResource('invoice-series', InvoiceSeriesController::class);
```

### Query параметры для GET /api/invoices

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | string | `b2c` \| `b2b` (обязательно) |
| `q` | string | Поиск по номеру, клиенту, описанию |
| `projekt` | string | SPACE \| INDIGO \| OLIMP \| B2B |
| `status` | string | wystawiona \| wyslana \| oplacona \| anulowana |
| `date_from` | string | YYYY-MM-DD |
| `date_to` | string | YYYY-MM-DD |
| `per_page` | int | 30 \| 50 \| 100 \| 300 \| 500 |
| `sort_by` | string | data_wystawienia \| brutto \| numer |
| `sort_dir` | string | asc \| desc |

---

## 6. База данных — PostgreSQL

> ⚠️ ТЗ написано под MySQL. Ниже адаптации для **PostgreSQL**.

### 6.1 Таблица `invoices`

```sql
CREATE TABLE invoices (
    id                BIGSERIAL PRIMARY KEY,
    numer             VARCHAR(40)  NOT NULL,
    numer_poprzedni   VARCHAR(40)  NULL,
    type              VARCHAR(5)   NOT NULL CHECK (type IN ('FA','FK','PF','FV','FVK')),
    status            VARCHAR(20)  NOT NULL DEFAULT 'wystawiona'
                                   CHECK (status IN ('wystawiona','wyslana','oplacona','anulowana')),
    projekt           VARCHAR(20)  NOT NULL,
    firma_id          SMALLINT     NOT NULL DEFAULT 1,
    klient_id         BIGINT       NULL REFERENCES clients(id),
    kontrahent_id     BIGINT       NULL REFERENCES kontrahenci(id),
    klient_nazwa      VARCHAR(255) NOT NULL,
    klient_email      VARCHAR(255) NOT NULL,
    klient_ulica      VARCHAR(255) NULL,
    klient_nr_domu    VARCHAR(20)  NULL,
    klient_nr_mies    VARCHAR(20)  NULL,
    klient_kod        VARCHAR(10)  NULL,
    klient_miasto     VARCHAR(100) NULL,
    klient_kraj       VARCHAR(50)  NULL DEFAULT 'Polska',
    klient_nip        VARCHAR(20)  NULL,
    uczen_imie        VARCHAR(255) NULL,
    opis              TEXT         NOT NULL,
    uwagi             TEXT         NULL,
    brutto            DECIMAL(10,2) NOT NULL,
    netto             DECIMAL(10,2) NOT NULL,
    vat               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stawka_vat        VARCHAR(5)   NOT NULL DEFAULT 'ZW',
    waluta            VARCHAR(3)   NOT NULL DEFAULT 'PLN',
    forma_platnosci   VARCHAR(30)  NOT NULL,
    data_wystawienia  DATE         NOT NULL,
    data_sprzedazy    DATE         NOT NULL,
    termin_platnosci  DATE         NOT NULL,
    data_platnosci    DATE         NULL,
    imoje_tx_id       VARCHAR(100) NULL,
    auto_generated    BOOLEAN      NOT NULL DEFAULT FALSE,
    koryguje_id       BIGINT       NULL REFERENCES invoices(id),
    powod_korekty     TEXT         NULL,
    created_by        BIGINT       NOT NULL REFERENCES users(id),
    updated_by        BIGINT       NULL REFERENCES users(id),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP    NULL,

    CONSTRAINT uk_numer    UNIQUE (numer),
    CONSTRAINT uk_imoje    UNIQUE (imoje_tx_id)
);

CREATE INDEX idx_invoices_status      ON invoices(status);
CREATE INDEX idx_invoices_projekt     ON invoices(projekt);
CREATE INDEX idx_invoices_data        ON invoices(data_wystawienia);
CREATE INDEX idx_invoices_klient      ON invoices(klient_id);
CREATE INDEX idx_invoices_kontrahent  ON invoices(kontrahent_id);
```

### 6.2 Таблица `invoice_series` — атомарная нумерация

```sql
CREATE TABLE invoice_series (
    id          BIGSERIAL PRIMARY KEY,
    projekt     VARCHAR(20) NOT NULL,
    prefix      VARCHAR(5)  NOT NULL,
    rok         SMALLINT    NOT NULL,
    miesiac     SMALLINT    NOT NULL,
    last_number INTEGER     NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_series UNIQUE (projekt, prefix, rok, miesiac)
);
```

**Атомарная генерация номера (PostgreSQL):**
```sql
-- В одной транзакции с SELECT FOR UPDATE:
UPDATE invoice_series
SET last_number = last_number + 1,
    updated_at  = NOW()
WHERE projekt = $1 AND prefix = $2 AND rok = $3 AND miesiac = $4
RETURNING last_number;
-- Затем сразу INSERT INTO invoices ...
```

### 6.3 Таблица `invoice_audit_log`

```sql
CREATE TABLE invoice_audit_log (
    id         BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT      NOT NULL REFERENCES invoices(id),
    action     VARCHAR(50) NOT NULL
               CHECK (action IN ('created','edited','number_changed','deleted','emailed','correction')),
    user_id    BIGINT      NOT NULL REFERENCES users(id),
    old_value  JSONB       NULL,
    new_value  JSONB       NULL,
    powod      TEXT        NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);
```

### 6.4 Таблица `kontrahenci` (B2B клиенты)

```sql
CREATE TABLE kontrahenci (
    id                  BIGSERIAL PRIMARY KEY,
    nip                 VARCHAR(20)  NOT NULL UNIQUE,
    nazwa               VARCHAR(255) NOT NULL,
    adres               VARCHAR(255) NULL,
    nr_domu             VARCHAR(20)  NULL,
    nr_mies             VARCHAR(20)  NULL,
    kod_pocztowy        VARCHAR(10)  NULL,
    miasto              VARCHAR(100) NULL,
    kraj                VARCHAR(50)  NULL DEFAULT 'Polska',
    email               VARCHAR(255) NULL,
    telefon             VARCHAR(30)  NULL,
    osoba_kontaktowa    VARCHAR(255) NULL,
    uwagi               TEXT         NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

## 7. Laravel — ключевые сервисы

### 7.1 InvoiceNumberService — атомарная нумерация

```php
class InvoiceNumberService
{
    public function generate(string $prefix, string $projekt, int $rok, int $miesiac): string
    {
        return DB::transaction(function () use ($prefix, $projekt, $rok, $miesiac) {
            // Upsert серии если не существует
            DB::statement("
                INSERT INTO invoice_series (projekt, prefix, rok, miesiac, last_number)
                VALUES (?, ?, ?, ?, 0)
                ON CONFLICT (projekt, prefix, rok, miesiac) DO NOTHING
            ", [$projekt, $prefix, $rok, $miesiac]);

            // Атомарно инкрементируем и получаем номер (FOR UPDATE)
            $result = DB::selectOne("
                UPDATE invoice_series
                SET last_number = last_number + 1, updated_at = NOW()
                WHERE projekt = ? AND prefix = ? AND rok = ? AND miesiac = ?
                RETURNING last_number
            ", [$projekt, $prefix, $rok, $miesiac]);

            $n = str_pad($result->last_number, 3, '0', STR_PAD_LEFT);
            $m = str_pad($miesiac, 2, '0', STR_PAD_LEFT);

            return "{$prefix}/{$projekt}/{$rok}/{$m}/{$n}";
        });
    }
}
```

### 7.2 ImojeWebhookController — критичные правила

```php
public function handle(Request $request): JsonResponse
{
    // 1. HMAC-SHA256 верификация (constant-time сравнение!)
    $signature = $request->header('X-Imoje-Signature');
    $expected  = hash_hmac('sha256', $request->getContent(), config('services.imoje.secret'));
    if (!hash_equals($expected, $signature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $txId = $request->input('transaction.id'); // или orderId — уточнить у Imoje

    // 2. Защита от дублей — тихо вернуть 200, НЕ бросать исключение
    if (Invoice::where('imoje_tx_id', $txId)->exists()) {
        return response()->json(['ok' => true]); // 200 OK — Imoje не будет повторять
    }

    // 3. Найти абонемент и создать фактуру
    // ... логика поиска клиента по serviceId/orderId ...
    
    // 4. Поставить в очередь отправку PDF
    SendInvoicePdfJob::dispatch($invoice);

    return response()->json(['ok' => true]); // Всегда 200!
}
```

### 7.3 InvoicePolicy — права по ролям

```php
class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return !$user->hasRole('trainer');
    }

    public function changeNumber(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['superadmin', 'bookkeeper'])
            && $invoice->status === 'wystawiona'
            && $invoice->deleted_at === null;
    }

    public function delete(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'bookkeeper']);
    }

    public function correct(User $user, Invoice $invoice): bool
    {
        // Нельзя корректировать уже скорректированную
        return !in_array($invoice->type, ['FK', 'FVK'])
            && $invoice->status !== 'anulowana'
            && !$user->hasRole('trainer');
    }
}
```

### 7.4 Создание корректировки FK/FVK

```php
public function createCorrection(Request $request, Invoice $original): JsonResponse
{
    $this->authorize('correct', $original);

    return DB::transaction(function () use ($request, $original) {
        $prefix = $original->type === 'FV' ? 'FVK' : 'FK';
        $numer  = $this->numberService->generate(
            $prefix,
            $original->projekt,
            now()->year,
            now()->month
        );

        $correction = Invoice::create([
            'numer'          => $numer,
            'type'           => $prefix,
            'status'         => 'wystawiona',
            'projekt'        => $original->projekt,
            'firma_id'       => $original->firma_id, // ← ОБЯЗАТЕЛЬНО от исходной!
            'klient_id'      => $original->klient_id,
            'kontrahent_id'  => $original->kontrahent_id,
            // ... копируем реквизиты клиента ...
            'brutto'         => $request->nowa_kwota ?? 0,
            'netto'          => $request->nowa_kwota ?? 0,
            'vat'            => 0,
            'stawka_vat'     => 'ZW', // всегда ZW!
            'koryguje_id'    => $original->id,
            'powod_korekty'  => $request->powod,
            'created_by'     => auth()->id(),
        ]);

        // Аннулировать оригинал если do_zera
        if ($request->typ_korekty === 'do_zera') {
            $original->update(['status' => 'anulowana']);
        }

        InvoiceAuditLog::create([
            'invoice_id' => $original->id,
            'action'     => 'correction',
            'user_id'    => auth()->id(),
            'new_value'  => ['correction_id' => $correction->id],
            'powod'      => $request->powod,
            'ip_address' => request()->ip(),
        ]);

        return response()->json(['data' => $correction], 201);
    });
}
```

---

## 8. Frontend — Vue 3 структура файлов

```
resources/js/
├── views/finance/
│   └── InvoicesView.vue          # FE-1: роутинг, вкладки B2C/B2B, тема
├── components/invoices/
│   ├── InvoiceTableB2C.vue       # FE-3
│   ├── InvoiceTableB2B.vue       # FE-3
│   ├── InvoiceFilters.vue        # FE-6: поиск + фильтры
│   ├── InvoicePagination.vue     # FE-5: 30/50/100/300/500
│   ├── InvoiceRowActions.vue     # FE-4: дропдаун ⋯
│   └── modals/
│       ├── ModalNewB2C.vue       # FE-7
│       ├── ModalNewB2B.vue       # FE-8
│       ├── ModalPreviewB2C.vue   # FE-9
│       ├── ModalPreviewB2B.vue   # FE-9
│       ├── ModalPreviewKor.vue   # FE-9
│       ├── ModalCorrectB2C.vue   # FE-10
│       ├── ModalCorrectB2B.vue   # FE-10
│       ├── ModalEdit.vue         # FE-11
│       ├── ModalEditNumber.vue   # FE-12
│       ├── ModalDelete.vue       # FE-13
│       ├── ModalEmail.vue        # FE-14
│       ├── ModalExport.vue       # FE-15
│       ├── ModalProForma.vue     # FE-20
│       └── ModalSettings.vue     # серии нумерации (superadmin)
├── stores/
│   └── useInvoiceStore.ts        # FE-2: все actions, state, getters
├── composables/
│   ├── useInvoicePermissions.ts  # FE-17: CAN checks
│   └── useInvoiceExport.ts       # FE-16: SheetJS, 18 колонок
└── i18n/
    ├── pl.json                   # FE-18
    └── ua.json                   # FE-18
```

---

## 9. useInvoicePermissions.ts — шаблон

```typescript
import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

type Role = 'superadmin' | 'bookkeeper' | 'admin' | 'manager' | 'trainer'

export function useInvoicePermissions() {
  const auth = useAuthStore()
  const role = computed<Role>(() => auth.user?.role)

  const can = {
    viewModule:     computed(() => role.value !== 'trainer'),
    createInvoice:  computed(() => ['superadmin','admin','manager'].includes(role.value)),
    createFK:       computed(() => role.value !== 'trainer'),
    editInvoice:    computed(() => role.value !== 'trainer'),
    changeNumber:   computed(() => ['superadmin','bookkeeper'].includes(role.value)),
    deleteInvoice:  computed(() => ['superadmin','bookkeeper'].includes(role.value)),
    exportXLSX:     computed(() => role.value !== 'trainer'),
    sendEmail:      computed(() => ['superadmin','admin','manager'].includes(role.value)),
  }

  // Проверить конкретную фактуру
  const canChangeNumber = (invoice: Invoice) =>
    can.changeNumber.value &&
    invoice.status === 'wystawiona' &&
    !invoice.deleted_at

  const canCorrect = (invoice: Invoice) =>
    can.createFK.value &&
    !['FK','FVK'].includes(invoice.type) &&
    invoice.status !== 'anulowana'

  const canEdit = (invoice: Invoice) =>
    can.editInvoice.value &&
    !['oplacona','anulowana'].includes(invoice.status)

  return { can, canChangeNumber, canCorrect, canEdit }
}
```

---

## 10. Router guard для trainer

```typescript
// router/index.ts
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.path.startsWith('/finance/invoices') && auth.user?.role === 'trainer') {
    return '/forbidden'
  }
})
```

---

## 11. useInvoiceExport.ts — XLSX 18 колонок (SheetJS)

```typescript
import * as XLSX from 'xlsx'

const COLUMN_HEADERS = [
  'Numer dokumentu',
  'Data wystawienia dokumentu',
  'Data sprzedaży',
  'Data – termin płatności',
  'Nazwa kontrahenta',
  'Adres kontrahenta',
  'Numer domu kontrahenta',
  'Numer mieszkania kontrahenta',
  'Kod pocztowy kontrahenta',
  'Miasto kontrahenta',
  'NIP kontrahenta',
  'Netto',
  'Stawka vat',
  'Vat',
  'Brutto',
  'Kraj kontrahenta',
  'Forma płatności',
  'Symbol waluty',
]

export function useInvoiceExport() {
  const exportToXLSX = (invoices: Invoice[], type: 'B2C' | 'B2B') => {
    const rows = invoices.map(inv => [
      inv.numer,
      formatDate(inv.data_wystawienia),   // DD.MM.YYYY
      formatDate(inv.data_sprzedazy),
      formatDate(inv.termin_platnosci),
      inv.klient_nazwa,
      inv.klient_ulica,                   // только улица без номера
      inv.klient_nr_domu,
      inv.klient_nr_mies,
      inv.klient_kod,
      inv.klient_miasto,
      inv.klient_nip ?? '',               // пусто для B2C
      inv.netto,                          // число
      'ZW',                               // всегда ZW
      0,                                  // всегда 0
      inv.brutto,                         // число
      inv.klient_kraj ?? 'Polska',
      inv.forma_platnosci,
      'PLN',                              // всегда PLN
    ])

    const ws = XLSX.utils.aoa_to_sheet([COLUMN_HEADERS, ...rows])

    // Стилизация заголовка: тёмно-синий фон #1E3A5F, белый жирный текст
    // (требует xlsx-style или exceljs для полной поддержки стилей)

    // Числовые форматы для колонок 12, 14, 15 (индексы 11, 13, 14)
    const numFmt = '#,##0.00'
    ;[11, 13, 14].forEach(colIdx => {
      const colLetter = XLSX.utils.encode_col(colIdx)
      Object.keys(ws).forEach(cell => {
        if (cell.startsWith(colLetter) && cell !== `${colLetter}1`) {
          ws[cell].z = numFmt
          ws[cell].t = 'n'
        }
      })
    })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Faktury')

    const today = new Date().toISOString().slice(0,10).replace(/-/g,'')
    XLSX.writeFile(wb, `GLS_Faktury_${type}_${today}.xlsx`)
  }

  return { exportToXLSX }
}

function formatDate(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}
```

---

## 12. Критичные правила реализации

> Нарушение любого из них ведёт к юридическим рискам или потере целостности данных.

| # | Правило | Последствие нарушения |
|---|---------|----------------------|
| 1 | **АТОМАРНАЯ НУМЕРАЦИЯ** — `SELECT FOR UPDATE` в транзакции | Дубли номеров = юридический риск |
| 2 | **FIRMA_ID при FK** — обязательно наследуется от исходной | Запрещено польским законодательством |
| 3 | **SOFT DELETE ТОЛЬКО** — `deleted_at`, номер занят навсегда | Нарушение целостности бухучёта |
| 4 | **ДУБЛИ IMOJE** — `imoje_tx_id` UNIQUE, при дубле тихо 200 | Двойные фактуры, повторные webhook |
| 5 | **HMAC ВЕРИФИКАЦИЯ** — каждый webhook проверяется | Поддельные фактуры |
| 6 | **БЛОКИРОВКА РЕДАКТИРОВАНИЯ** — `oplacona`/`anulowana` только через FK | Несоответствие данных |
| 7 | **NUMER_POPRZEDNI** — поиск работает по обоим номерам | Потеря истории при смене номера |
| 8 | **AUDIT LOG** — каждое изменение логируется | Нет следа для бухгалтерии |
| 9 | **TRAINER НЕ ВИДИТ** — router guard + Gate (двойная защита) | Утечка данных |
| 10 | **ZW ВЕЗДЕ** — ставка VAT всегда ZW, vat = 0 | Ошибка налоговой отчётности |

---

## 13. Специфика PostgreSQL vs MySQL из ТЗ

ТЗ написано под MySQL — адаптации обязательны:

| MySQL (ТЗ) | PostgreSQL (реализация) |
|-----------|------------------------|
| `SET @next = last_number + 1` | `UPDATE ... RETURNING last_number` |
| `tinyint(1)` | `BOOLEAN` |
| `year` тип | `SMALLINT` |
| `enum(...)` тип | `VARCHAR(N) CHECK(... IN (...))` или CREATE TYPE |
| `SELECT FOR UPDATE` в транзакции | работает так же |
| `CONCAT(...)` для номера | `CONCAT(...)` работает, или оператор `||` |

---

## 14. Список модальных окон (15 шт.)

| ID | Название | Доступ | Ключевые поля |
|----|----------|--------|---------------|
| modal-new-b2c | Новая фактура B2C | manager+ | Проект, тип, даты, клиент, ученик, сумма, uwagi |
| modal-new-b2b | Новая фактура B2B | manager+ | NIP, название, адрес, проект, позиции |
| modal-proforma | Pro Forma | manager+ | Клиент, ученик, даты, сумма, uwagi |
| modal-preview-b2c | Превью PDF B2C | все | Только чтение. ✅ ZAPŁACONO если оплачена |
| modal-preview-b2b | Превью PDF B2B | все | Только чтение |
| modal-preview-kor | Превью FK/FVK | все | Только чтение |
| modal-kor-b2c | Создать FK | manager+ | Тип коректы, новая сумма, причина |
| modal-kor-b2b | Создать FVK | manager+ | Тип коректы, новая сумма, причина |
| modal-edit | Редактировать | manager+ | Причина обязательна. Сумма заблокирована если oplacona |
| modal-edit-num | Изменить номер | bookkeeper+ | Формат проверяется регулярным выражением, уникальность |
| modal-delete | Удалить | bookkeeper+ | Причина обязательна. Soft delete |
| modal-email | Отправить email | manager+ | Получатель, тема, сообщение |
| modal-export | Экспорт XLSX | manager+ | 18 колонок по формату Comarch |
| modal-settings | Серии нумерации | superadmin | Управление сериями FA/FK/etc |
| modal-add-b2b | Добавить B2B клиента | manager+ | NIP, название, адрес, контакт |

**Валидация номера в modal-edit-num:**
```
/^(FA|FK|PF|FV|FVK)\/(SPACE|INDIGO|OLIMP|B2B)\/\d{4}\/\d{2}\/\d{3}$/
```

---

## 15. PDF-превью — структура документа

1. **Верхний блок:** логотип GLS·edu + реквизиты продавца | Тип документа + номер + даты
2. **Блок контрагентов:** Sprzedawca | Nabywca (родитель, НЕ ребёнок)
3. **Таблица позиций:** Lp. | Opis + *Dotyczy ucznia* | PKWiU | Ilość | J.m. | Cena netto | Stawka VAT | Kwota VAT | Brutto
4. **Итого:** Wartość netto | Kwota VAT | ✅ ZAPŁACONO (если oplacona) или DO ZAPŁATY
5. **Słownie:** сумма прописью на польском
6. **Podstawa zwolnienia z VAT:** art. 43 ust. 1 pkt 26 lit. b ustawy z dnia 11.03.2004 r.
7. **Wystawił:** System CRM (automatycznie) · дата и время (если auto_generated)

---

## 16. XLSX экспорт — 18 колонок (Comarch ERP Optima)

| # | Колонка | Источник | Тип | Примечания |
|---|---------|----------|-----|------------|
| 1 | Numer dokumentu | `invoices.numer` | Текст | |
| 2 | Data wystawienia dokumentu | `data_wystawienia` | Дата DD.MM.YYYY | |
| 3 | Data sprzedaży | `data_sprzedazy` | Дата DD.MM.YYYY | |
| 4 | Data – termin płatności | `termin_platnosci` | Дата DD.MM.YYYY | |
| 5 | Nazwa kontrahenta | `klient_nazwa` | Текст | |
| 6 | Adres kontrahenta | `klient_ulica` | Текст | Только улица, без номера |
| 7 | Numer domu kontrahenta | `klient_nr_domu` | Текст | |
| 8 | Numer mieszkania kontrahenta | `klient_nr_mies` | Текст | |
| 9 | Kod pocztowy kontrahenta | `klient_kod` | Текст | |
| 10 | Miasto kontrahenta | `klient_miasto` | Текст | |
| 11 | NIP kontrahenta | `klient_nip` | Текст | Пусто для B2C |
| 12 | Netto | `netto` | Число | Формат #,##0.00 |
| 13 | Stawka vat | `stawka_vat` | Текст | **Всегда "ZW"** |
| 14 | Vat | `vat` | Число | **Всегда 0** |
| 15 | Brutto | `brutto` | Число | Формат #,##0.00 |
| 16 | Kraj kontrahenta | `klient_kraj` | Текст | **Всегда "Polska"** |
| 17 | Forma płatności | `forma_platnosci` | Текст | Przelew/BLIK/Gotówka |
| 18 | Symbol waluty | `waluta` | Текст | **Всегда "PLN"** |

**Оформление XLSX:**
- Заголовок: тёмно-синий фон `#1E3A5F`, белый жирный текст, Arial 10pt
- Замороженная первая строка (freeze pane)
- Числовые столбцы (12, 14, 15): выравнивание вправо, формат `#,##0.00`
- Чередующиеся строки: белые и `#F8FAFC`

---

## 17. Таблица колонок UI

| # | Колонка | Данные | Примечания |
|---|---------|--------|------------|
| 1 | — | Checkbox | Групповой выбор |
| 2 | Numer | FA/SPACE/2025/05/042 | Space Mono, кликабельная → превью |
| 3 | Typ | Badge FA/FK/PF/FV/FVK | Цветные бейджи |
| 4 | Data | 15.05.2025 | Дата выставления |
| 5 | Klient | Имя + email + ID | B2C: "Dot. ucznia: X" |
| 6 | Projekt | SPACE/INDIGO + firma badge | |
| 7 | Źródło | ⚡ Imoje auto / ручное | |
| 8 | Kwota | 480,00 zł | Зелёный (оплачен), красный (долг) |
| 9 | Status | Badge + ✅ Zapłacono + дата | |
| 10 | Akcje | ⋯ дропдаун | Зависит от роли |

---

## 18. Задачи разработки — Backend (Laravel)

| # | Задача | Приоритет | Оценка |
|---|--------|-----------|--------|
| BE-1 | Миграции: invoices, invoice_series, invoice_audit_log, kontrahenci | 🔴 Критично | 2ч |
| BE-2 | InvoiceController: index, store, show, update, destroy | 🔴 Критично | 4ч |
| BE-3 | InvoiceNumberService: SELECT FOR UPDATE атомарная нумерация | 🔴 Критично | 2ч |
| BE-4 | InvoiceController: updateNumber + audit log | 🔴 Критично | 2ч |
| BE-5 | InvoiceController: createCorrection (FK/FVK) | 🔴 Критично | 3ч |
| BE-6 | ImojeWebhookController: HMAC-SHA256 + auto-invoice | 🔴 Критично | 3ч |
| BE-7 | InvoiceController: export XLSX через PhpSpreadsheet | 🔴 Критично | 3ч |
| BE-8 | Защита от дублей Imoje: UNIQUE на imoje_tx_id | 🔴 Критично | 1ч |
| BE-9 | InvoiceController: sendEmail (очередь + PDF генерация) | 🟡 Важно | 4ч |
| BE-10 | InvoiceSeriesController: CRUD для настроек серий | 🟡 Важно | 2ч |
| BE-11 | KontrahentController: поиск по NIP + GUS API | 🟡 Важно | 3ч |
| BE-12 | PolicyGates: InvoicePolicy с проверкой ролей | 🔴 Критично | 2ч |
| BE-13 | KSeF интеграция FA(3) XML — опционально на старте | 🟢 Позже | 8ч |
| BE-14 | Comarch ERP Optima XML экспорт | 🟡 Важно | 4ч |

**Итого Backend: ~43 часа**

---

## 19. Задачи разработки — Frontend (Vue 3)

| # | Задача | Приоритет | Оценка |
|---|--------|-----------|--------|
| FE-1 | InvoicesView.vue: роутинг, вкладки B2C/B2B, тема | 🔴 Критично | 3ч |
| FE-2 | useInvoiceStore (Pinia): все actions, state, getters | 🔴 Критично | 4ч |
| FE-3 | InvoiceTableB2C.vue + InvoiceTableB2B.vue | 🔴 Критично | 4ч |
| FE-4 | InvoiceRowActions.vue: дропдаун ⋯ с правами | 🔴 Критично | 3ч |
| FE-5 | InvoicePagination.vue: 30/50/100/300/500 строк | 🔴 Критично | 2ч |
| FE-6 | InvoiceFilters.vue: поиск + фильтры | 🔴 Критично | 2ч |
| FE-7 | ModalNewB2C.vue: autocomplete учеников | 🔴 Критично | 3ч |
| FE-8 | ModalNewB2B.vue: NIP lookup | 🔴 Критично | 3ч |
| FE-9 | ModalPreviewB2C/B2B/Kor.vue: PDF-превью | 🔴 Критично | 4ч |
| FE-10 | ModalCorrectB2C/B2B.vue: FK/FVK форма | 🔴 Критично | 2ч |
| FE-11 | ModalEdit.vue: блокировка суммы для oplacona | 🟡 Важно | 2ч |
| FE-12 | ModalEditNumber.vue: проверка формата и уникальности | 🟡 Важно | 2ч |
| FE-13 | ModalDelete.vue: подтверждение с причиной | 🟡 Важно | 1ч |
| FE-14 | ModalEmail.vue: форма отправки | 🟡 Важно | 2ч |
| FE-15 | ModalExport.vue: форма экспорта XLSX | 🔴 Критично | 2ч |
| FE-16 | useInvoiceExport.ts: SheetJS, 18 колонок | 🔴 Критично | 3ч |
| FE-17 | useInvoicePermissions.ts: CAN checks | 🔴 Критично | 1ч |
| FE-18 | i18n: ключи PL + UA для всего модуля | 🟡 Важно | 2ч |
| FE-19 | Router guard: redirect trainer → /forbidden | 🔴 Критично | 0.5ч |
| FE-20 | ModalProForma.vue + конвертация PF→FA | 🟡 Важно | 2ч |

**Итого Frontend: ~47 часов**

---

## 20. Рекомендуемый порядок разработки (спринты)

### Sprint 1 — Фундамент (Backend, всё критичное)
```
BE-1 → BE-3 → BE-2 → BE-8 → BE-12
```
Миграции → Нумерация → Контроллер → Защита дублей → Права

### Sprint 2 — Интеграции и экспорт
```
BE-6 → BE-7 → BE-5 → BE-4
```
Webhook Imoje → XLSX → Корректировки → Смена номера

### Sprint 3 — Frontend (ядро)
```
FE-19 → FE-17 → FE-1 → FE-2 → FE-3 → FE-4 → FE-6
```
Router guard ПЕРВЫМ! → Права → View → Store → Таблицы → Фильтры

### Sprint 4 — Модалки и детали
```
FE-7 → FE-8 → FE-9 → FE-10 → FE-15/16
```
Создание B2C/B2B → Превью → Корректировки → Экспорт

### Sprint 5 — Вторичный функционал
```
BE-9 → BE-11 → FE-11..14 → FE-18/20 → BE-14
```
Email → GUS API → Остальные модалки → i18n → Comarch XML

---

## 21. Критерии приёмки

### Backend
- [ ] POST /api/invoices при 100 RPS — нет дублей номеров
- [ ] POST /webhooks/imoje с одним imoje_tx_id — вторая фактура не создаётся
- [ ] POST /webhooks/imoje с неверной HMAC — 401
- [ ] DELETE /api/invoices/{id} — физически запись остаётся, deleted_at заполнено
- [ ] PUT /api/invoices/{id}/number от роли manager — 403
- [ ] POST /api/invoices/{id}/correct — firma_id наследуется корректно
- [ ] GET /api/invoices/export — XLSX, 18 колонок

### Frontend
- [ ] Роль trainer: /finance/invoices → /forbidden
- [ ] Роль manager: в ⋯ нет "Zmień numer" и "Usuń"
- [ ] Роль bookkeeper: видит "Zmień numer", не видит "Wystaw fakturę"
- [ ] Фактура oplacona: поле суммы в modal-edit заблокировано (readonly)
- [ ] Фактура oplacona: статус "✅ Zapłacono" + дата платежа
- [ ] Экспорт: "Stawka vat" = "ZW", "Vat" = 0, "Symbol waluty" = PLN
- [ ] PDF превью оплаченной фактуры: "✅ ZAPŁACONO" вместо "DO ZAPŁATY"
- [ ] Смена номера: проверка формата regex + уникальность через API

---

## 22. Процедура при дублировании транзакции Imoje

1. **Faktura №1** — остаётся без изменений (реальная оплата)
2. **Faktura №2** — создаётся FK до 0 zł с причиной: `"Anulowanie — duplikat transakcji Imoje, błąd banku"`
3. **Надплата** — учитывается в абонементе клиента или возвращается
4. **Обе транзакции Imoje** — не трогаются (только фиксируются в системе)
5. **Номер FK** — не освобождается, занят навсегда

---

*Документ сгенерирован на основе ТЗ v1.0 / Март 2026 и HTML-прототипа интерфейса.*  
*Стек: Vue 3 + Pinia | Laravel 11 | PostgreSQL*
