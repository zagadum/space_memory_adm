# ⚡ Быстрый старт: Mock API → Real API

## 3 способа переключения:

### 1️⃣ **Самый простой - через .env.local**
```bash
# Отредактируйте файл .env.local
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:3000
```
Сохраните и перезагрузите приложение.

### 2️⃣ **Через npm скрипты**
```bash
# Запуск с Mock API
npm run dev:mock

# Запуск с реальным API
npm run dev:api
```

### 3️⃣ **Проверка что работает**
В консоли браузера (F12 → Console) должно быть:
```
Using real API from: http://localhost:3000
```

---

## 🔧 Для тестирования с локальным бэкенд-сервером:

Используйте файл `server-example.js` как шаблон Node.js Express сервера.

**Установить зависимости:**
```bash
npm install express cors
```

**Запустить пример сервера:**
```bash
node server-example.js
```

**Затем в другом терминале:**
```bash
npm run dev:api
```

---

## 📋 Что изменилось:

✅ `.env.local` - переменные окружения для конфигурации  
✅ `src/api/http.ts` - обновлен для поддержки динамического baseURL  
✅ `package.json` - добавлены скрипты `dev:mock` и `dev:api`  
✅ `API_CONFIGURATION.md` - полная документация  
✅ `server-example.js` - пример backend сервера  

---

## 🎯 Шаги для подключения вашего API:

1. **Отредактируйте `.env.local`:**
   ```
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=https://your-api-server.com
   ```

2. **Убедитесь что ваш сервер возвращает нужные данные:**
   - Структуру данных можно посмотреть в `mockDb.ts`
   - Endpoints описаны в `API_CONFIGURATION.md`

3. **При необходимости добавьте CORS на вашем сервере**

4. **Запустите приложение:**
   ```bash
   npm run dev
   ```

5. **Откройте F12 и проверьте Network tab - должны видеть запросы на ваш сервер**

---

Готово! 🚀

