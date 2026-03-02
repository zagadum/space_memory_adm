# Memori SPA (Vue 3 + Vite)

## Запуск
```bash
npm i
npm run dev
```

Открой: http://localhost:5173

## Демо-логин (mock)
- Email: `admin@demo.local`
- Password: любой непустой

## Mock API
По умолчанию включён (`VITE_USE_MOCK=true`). Эндпоинты:

- `POST /api/auth/sign-in` -> `{ token, user }`
- `GET /api/auth/me` -> `{ id, email, name }`
- `GET /api/payments/student/s_1` -> `{ student, programs }`
- `POST /api/payments/refund` -> `{ id, status, createdAt }`
- `POST /api/payments/tariff` -> `{ ok, programId, value }`

## Структура
```
src/
  app/
  api/
  components/
    header/
    ui/
  layouts/
  modals/
  stores/
  styles/
  tabs/
  locales/
```
