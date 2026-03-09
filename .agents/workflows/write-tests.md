---
description: write-tests
---

# Write Tests
**Description:** Пишет тесты для Vue компонентов (Vitest) и Laravel (PHPUnit/Pest). Покрывает критическую бизнес-логику GLS Admin.

## Steps

### Step 1 — Определить что тестировать
Спросить пользователя:
- Что тестируем? (Vue компонент / Laravel контроллер / Job / Store)
- Какие сценарии критичны для бизнеса?

Приоритеты для GLS Admin:
- Высокий: webhook от Drupal (идемпотентность), смена статуса ученика, расчёт платежей
- Средний: фильтрация списка студентов, авторизация эндпоинтов
- Низкий: UI-компоненты (отображение данных)

### Step 2 — Laravel тесты (PHPUnit / Pest)

#### Feature тест для Webhook:
```php
// tests/Feature/Webhooks/DrupalPaymentWebhookTest.php

test('webhook создаёт оплату и меняет статус ученика', function () {
    $student = Student::factory()->create(['status' => 'limited_access']);
    
    $response = $this->postJson('/api/v1/webhooks/drupal/payment-success', [
        'transaction_id' => 'tx_123',
        'drupal_id'      => $student->drupal_id,
        'amount'         => 440,
    ]);
    
    $response->assertOk();
    expect($student->fresh()->status)->toBe('ready_for_group');
    expect(WebhookLog::where('transaction_id', 'tx_123')->exists())->toBeTrue();
});

test('дублированный webhook игнорируется (идемпотентность)', function () {
    WebhookLog::factory()->create(['transaction_id' => 'tx_123']);
    
    $response = $this->postJson('/api/v1/webhooks/drupal/payment-success', [
        'transaction_id' => 'tx_123',
    ]);
    
    $response->assertOk();
    expect(WebhookLog::where('transaction_id', 'tx_123')->count())->toBe(1);
});
```

#### Feature тест для API эндпоинта:
```php
test('неавторизованный запрос возвращает 401', function () {
    $this->getJson('/api/v1/students')->assertUnauthorized();
});

test('список студентов возвращает пагинированный результат', function () {
    Student::factory(25)->create();
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)
        ->getJson('/api/v1/students?per_page=10');
    
    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'status']],
            'meta' => ['current_page', 'total']
        ]);
    
    expect($response->json('data'))->toHaveCount(10);
});
```

#### Unit тест для Job:
```php
test('job диспатчится при старте группы', function () {
    Queue::fake();
    $group = Group::factory()->create(['status' => 'recruiting']);
    
    $this->actingAs(User::factory()->create())
        ->postJson("/api/v1/groups/{$group->id}/start")
        ->assertOk();
    
    Queue::assertPushed(GrantLmsAccessJob::class);
    expect($group->fresh()->status)->toBe('active');
});
```

### Step 3 — Vue тесты (Vitest + Vue Test Utils)

#### Store тест:
```typescript
// src/stores/__tests__/students.store.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useStudentsStore } from '../students.store'
import { http } from '../../api/http'

vi.mock('../../api/http')

beforeEach(() => setActivePinia(createPinia()))

test('fetchStudents загружает данные и снимает loading', async () => {
    vi.mocked(http.get).mockResolvedValue({
        data: { data: [{ id: 1, name: 'Иван' }], meta: { total: 1 } }
    })
    
    const store = useStudentsStore()
    await store.fetchStudents()
    
    expect(store.isLoading).toBe(false)
    expect(store.students).toHaveLength(1)
    expect(store.error).toBeNull()
})

test('fetchStudents обрабатывает ошибку', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('Network error'))
    
    const store = useStudentsStore()
    await store.fetchStudents()
    
    expect(store.isLoading).toBe(false)
    expect(store.error).not.toBeNull()
})
```

### Step 4 — Запустить тесты и исправить
```bash
# Laravel
php artisan test --filter=WebhookTest

# Vue
npm run test
```

Если тесты падают — исправить причину, не тест.

### Step 5 — Проверка покрытия
- [ ] Happy path — успешный сценарий
- [ ] Error path — ошибка сети / валидации
- [ ] Edge case — дубль, пустой список, граничные значения
- [ ] Auth — защищённые роуты возвращают 401 без токена
