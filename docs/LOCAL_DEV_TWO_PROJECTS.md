# Local workflow: memory-adm + space_memory-recrut-inigo

This note is a fast daily guide for running both projects in one workspace.

## 1) Project roles

- Frontend: `D:\www2\memory-adm` (Vue 3 + Vite)
- API: `D:\www2\space_memory-recrut-inigo` (Laravel)

## 2) One-time setup

### Frontend (`memory-adm`)
```powershell
Set-Location "D:\www2\memory-adm"
npm install
```

### API (`space_memory-recrut-inigo`)
```powershell
Set-Location "D:\www2\space_memory-recrut-inigo"
composer install
npm install
php artisan key:generate
php artisan migrate
```

## 3) Daily start (2 terminals)

### Terminal A: Laravel API
```powershell
Set-Location "D:\www2\space_memory-recrut-inigo"
php artisan serve --host=127.0.0.1 --port=8000
```

### Terminal B: Frontend with real API
```powershell
Set-Location "D:\www2\memory-adm"
npm run dev:api -- --host 127.0.0.1 --port 5173
```

## 4) Health checks

```powershell
Invoke-WebRequest "http://127.0.0.1:8000/up" -UseBasicParsing
Invoke-WebRequest "http://127.0.0.1:5173" -UseBasicParsing
```

Expected: HTTP 200 for both.

## 5) Fast restart

If ports are busy or app behaves oddly:

```powershell
Get-Process php,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then start both services again.

## 6) Where to change code by task

### Frontend (`memory-adm`)
- API client/interceptors: `src/api/http.ts`
- Endpoint declarations: `src/api/endpoints.ts`
- Main pages: `src/views/`
- Shared UI: `src/components/`
- State: `src/stores/`
- Env values: `.env.local` (or `.env`)

### API (`space_memory-recrut-inigo`)
- API routes: `routes/api.php`
- Controllers: `app/Http/Controllers/Api/`
- Business logic/services: `app/Services/`
- DB migrations: `database/migrations/`
- Config/env: `.env`, `config/*.php`

## 7) Common issues

### Frontend uses mock instead of API
- In `memory-adm`, run `npm run dev:api`
- Confirm `VITE_USE_MOCK=false`

### 401 Unauthorized
- Token expired or missing in browser storage
- Re-login and retry

### CORS or wrong base URL
- Check API URLs in `memory-adm/.env.local`
- Confirm backend route exists in `routes/api.php`

### Slow requests/timeouts
- Frontend timeout logic is in `src/api/http.ts`
- Check Laravel logs: `space_memory-recrut-inigo/storage/logs/laravel.log`

## 8) Daily checklist

- [ ] API `http://127.0.0.1:8000/up` returns 200
- [ ] Frontend `http://127.0.0.1:5173` opens
- [ ] Frontend runs in real API mode (`dev:api`)
- [ ] New feature mapped: page -> endpoint -> controller -> migration (if needed)
- [ ] Before commit: quick manual smoke test of touched pages/endpoints

