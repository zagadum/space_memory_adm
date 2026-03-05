# Переключение между Mock API и реальным сервером

## Быстрый старт

### 1. Для работы с Mock API (развитие и тестирование):
```bash
npm run dev:mock
```
или просто
```bash
npm run dev
```

### 2. Для работы с реальным API:
```bash
npm run dev:api
```

## Конфигурация

Все параметры находятся в файле `.env.local`:

```env
# Включить/отключить Mock API
VITE_USE_MOCK=false  # false = использовать реальный API

# URL базового адреса вашего API сервера
VITE_API_BASE_URL=http://localhost:3000
```

### Примеры конфигурации:

**Для локальной разработки:**
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:3000
```

**Для staging сервера:**
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api-staging.yourcompany.com
```

**Для production:**
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.yourcompany.com
```

## API Endpoints

При использовании реального API ваш сервер должен предоставлять следующие endpoints:

### Authentication
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получить информацию текущего пользователя

### Student Programs (Payments)
- `GET /api/student/programs` - Получить программы обучения студента
- `POST /api/student/programs/:id/action` - Выполнить действие с программой

### Student Groups
- `GET /api/student/groups` - Получить группы студента
- `POST /api/student/change-group` - Изменить группу

### Student Info
- `GET /api/student/info` - Получить информацию о студенте
- `POST /api/student/info` - Обновить информацию

### Attendance
- `GET /api/student/attendance` - Получить посещаемость
- `POST /api/student/trainer-presence` - Отметить присутствие тренера
- `POST /api/student/set-attendance-mark` - Установить отметку присутствия

### Progress & Notes
- `GET /api/student/progress` - Получить прогресс
- `GET /api/student/notes` - Получить заметки
- `POST /api/student/notes` - Создать/обновить заметку

## Проверка статуса

В консоли браузера (F12 → Console) вы увидите логи:
- `Using real API from: http://localhost:3000` - используется реальный API
- Отсутствие этого логов - используется Mock API

## Тестирование Real API

Пример с curl:
```bash
# Получить программы
curl http://localhost:3000/api/student/programs?studentId=s_1

# Получить информацию о студенте
curl http://localhost:3000/api/student/info?studentId=s_1
```

## Обработка ошибок

При использовании реального API убедитесь, что сервер:
1. Возвращает данные в том же формате, что и Mock API
2. Поддерживает CORS если фронтенд и бэкенд на разных доменах
3. Возвращает правильные HTTP статус-коды

Для CORS на Express сервере:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## Переменные окружения в build time

Для production build обновите `.env.production`:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.yourcompany.com
```

Затем запустите:
```bash
npm run build
```

