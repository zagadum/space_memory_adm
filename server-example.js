// Пример Express сервера для тестирования Real API
// Сохраните этот файл как `server-example.js` в корне проекта

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Тестовые данные (скопированы из mockDb.ts)
const testData = {
  programs: [
    {
      id: "space",
      name: "🌌 Space Memory",
      sub: "Гр. A · Пн 16:00 · Anna Kowalska · 490 зл/мес · 👦 1-й ребёнок · без скидки",
      tariff: 490,
      balance: 120,
      balanceLabel: "переплата"
    },
    {
      id: "indigo",
      name: "⚡ Speedy Mind INDIGO",
      sub: "Гр. C · Пт 15:00 · Ewa Lewandowska · 420 зл/мес · 👧 2-й ребёнок · −10% семья",
      tariff: 420,
      balance: 0,
      balanceLabel: "баланс"
    }
  ],
  student: {
    id: "s_1",
    initials: "АК",
    name: "Anna Kowalska",
    age: "11 лет",
    parent: "Ewa Kowalska (мама)",
    phone: "+48 601 234 567"
  }
};

// Routes

// GET /api/v1/student/programs
app.get('/api/v1/student/programs', (req, res) => {
  const { studentId } = req.query;
  console.log(`[GET] Student programs: ${studentId}`);
  res.json({
    items: testData.programs
  });
});

// GET /api/v1/student/info
app.get('/api/v1/student/info', (req, res) => {
  const { studentId } = req.query;
  console.log(`[GET] Student info: ${studentId}`);
  res.json({
    info: testData.student
  });
});

// GET /api/v1/student/groups
app.get('/api/v1/student/groups', (req, res) => {
  const { studentId } = req.query;
  console.log(`[GET] Student groups: ${studentId}`);
  res.json({
    items: [
      {
        id: "g_sm_a",
        programId: "space",
        programTitle: "Space Memory",
        status: "active"
      }
    ]
  });
});

// POST /api/v1/student/change-group
app.post('/api/v1/student/change-group', (req, res) => {
  console.log(`[POST] Change group:`, req.body);
  res.json({ ok: true });
});

// GET /api/v1/student/attendance
app.get('/api/v1/student/attendance', (req, res) => {
  const { studentId } = req.query;
  console.log(`[GET] Student attendance: ${studentId}`);
  res.json({
    attendance: {
      summary: { total: 24, present: 21, absent: 2, rate: 87.5 },
      items: []
    }
  });
});

// POST /api/v1/student/trainer-presence
app.post('/api/v1/student/trainer-presence', (req, res) => {
  console.log(`[POST] Trainer presence:`, req.body);
  res.json({ ok: true });
});

// POST /api/v1/student/info
app.post('/api/v1/student/info', (req, res) => {
  console.log(`[POST] Update student info:`, req.body);
  res.json({
    ok: true,
    info: testData.student
  });
});

// GET /api/v1/auth/me
app.get('/api/v1/auth/me', (req, res) => {
  console.log(`[GET] Current user`);
  res.json({
    id: "u_1",
    email: "admin@demo.local",
    name: "Demo Admin"
  });
});

// Server
app.listen(PORT, () => {
  console.log(`✅ API Server запущен на http://localhost:${PORT}`);
  console.log(`📱 Фронтенд должен быть настроен на: VITE_API_BASE_URL=http://localhost:${PORT}`);
});

