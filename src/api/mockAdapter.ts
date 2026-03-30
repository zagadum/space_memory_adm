import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { mockNewGroups, mockGroupStudents, mockMasterStudents, mockTeachers, mockManagers } from "./mockNewGroupsDb";
import { mockDb, mockTransactions, mockKsefInvoices, mockGroups, mockInfo, mockAttendance, mockProgress, mockNotes, StudentProfile, Program, MonthStatus, PayStatus, KsefStatus } from "./mockDb";

type Json = any;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: { "content-type": "application/json" } as any,
    config: config as any,
  };
}

function err(config: InternalAxiosRequestConfig, status: number, message: string): AxiosResponse<Json> {
  return {
    data: { message },
    status,
    statusText: "Error",
    headers: { "content-type": "application/json" } as any,
    config: config as any,
  };
}

function readBody(config: InternalAxiosRequestConfig): any {
  const d: any = (config as any).data;
  if (!d) return null;
  if (typeof d === "string") {
    try { return JSON.parse(d); } catch { return d; }
  }
  return d;
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await sleep(240);

  // local mutable state (module-level caching behavior)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any[] = (globalThis as any).__mock_groups ?? ((globalThis as any).__mock_groups = JSON.parse(JSON.stringify(mockGroups)));
  const info: any = (globalThis as any).__mock_info ?? ((globalThis as any).__mock_info = JSON.parse(JSON.stringify(mockInfo)));
  const att: any = (globalThis as any).__mock_att ?? ((globalThis as any).__mock_att = JSON.parse(JSON.stringify(mockAttendance)));
  const notes: any[] = (globalThis as any).__mock_notes ?? ((globalThis as any).__mock_notes = JSON.parse(JSON.stringify(mockNotes)));

  const url = (config.url || "").replace(/^\//, "");
  const method = (config.method || "get").toLowerCase();

  console.log('[MOCK] incoming:', method.toUpperCase(), url);

  // --- DASHBOARD STATS ---
  if (method === 'get' && (url === 'dashboard/stats' || url === 'api/v1/dashboard/stats')) {
    // ensure recruitment db is initialized so count is correct even before visiting /new-students
    if (!(globalThis as any).__mock_new_students) {
      (globalThis as any).__mock_new_students = [
        { id: 1, contract: 'signed' },
        { id: 2, contract: 'pending' },
        { id: 3, contract: 'signed' },
        { id: 4, contract: 'pending' },
        { id: 5, contract: 'pending' },
        { id: 6, contract: 'signed' },
        { id: 7, contract: 'pending' },
        { id: 8, contract: 'pending' },
        { id: 9, contract: 'pending' },
        { id: 10, contract: 'signed' },
        { id: 11, contract: 'pending' },
        { id: 12, contract: 'pending' },
      ];
    }
    const nsDb: any[] = (globalThis as any).__mock_new_students;
    // "новые" = pending/registered/new (не signed и не active)
    const newStudentsCount = nsDb.filter((s: any) => {
      const st = String(s.status ?? s.contract ?? '').toLowerCase();
      return st !== 'signed' && st !== 'active';
    }).length;

    return ok(config, {
      totalStudents: nsDb.length,
      activeGroups: 12,
      pendingInvoices: 3,
      newLeads: 5,
      newStudents: newStudentsCount,
    });
  }

  // --- AUTH ---
  // Mock users — one per canonical role. All share password "demo".
  // Token format: "mock.jwt.token.<role>"
  const MOCK_USERS: Record<string, { id: string; email: string; name: string; role: string; initials: string; teacherId?: number }> = {
    "mock.jwt.token.super-admin": { id: "1", email: "superadmin@demo.local",  name: "Super Admin",       role: "super-admin", initials: "SA" },
    "mock.jwt.token.admin":       { id: "2", email: "admin@demo.local",        name: "Demo Admin",        role: "admin",       initials: "DA" },
    "mock.jwt.token.teacher":     { id: "3", email: "teacher@demo.local",      name: "Jan Kowalski",      role: "teacher",     initials: "JK", teacherId: 42 },
    "mock.jwt.token.sales":       { id: "4", email: "sales@demo.local",        name: "Anna Nowak",        role: "sales",       initials: "AN" },
    "mock.jwt.token.quality":     { id: "5", email: "quality@demo.local",      name: "Maria Wiśniewska",  role: "quality",     initials: "MW" },
    "mock.jwt.token.finance":     { id: "6", email: "finance@demo.local",      name: "Piotr Zając",       role: "finance",     initials: "PZ" },
    "mock.jwt.token.secretariat": { id: "7", email: "secretariat@demo.local",  name: "Katarzyna Lis",     role: "secretariat", initials: "KL" },
    "mock.jwt.token.hr":          { id: "8", email: "hr@demo.local",           name: "Tomasz Wróbel",     role: "hr",          initials: "TW" },
  };
  // email → token mapping (password is always "demo" for all mock users)
  const MOCK_CREDENTIALS: Record<string, string> = Object.fromEntries(
    Object.entries(MOCK_USERS).map(([token, u]) => [u.email, token])
  );

  if (method === "post" && (url === "auth/sign-in" || url === "v1/auth/sign-in" || url === "api/auth/sign-in" || url === "api/v1/auth/sign-in")) {
    const body = readBody(config);
    if (!body?.email || !body?.password) return err(config, 400, "Missing credentials");
    const token = MOCK_CREDENTIALS[body.email];
    if (!token || body.password !== "demo") return err(config, 401, "Invalid credentials");
    return ok(config, { token, user: MOCK_USERS[token] });
  }

  if (method === "get" && (url === "auth/me" || url === "v1/auth/me" || url === "api/auth/me" || url === "api/v1/auth/me")) {
    const authHeader = String((config.headers as any)?.Authorization || "");
    if (!authHeader.startsWith("Bearer ")) return err(config, 401, "Unauthorized");
    const token = authHeader.replace("Bearer ", "").trim();
    const user = MOCK_USERS[token];
    if (!user) return err(config, 401, "Invalid token");
    return ok(config, user);
  }

  // --- PAYMENTS ---
  if (method === "get" && url.startsWith("payments/student/")) {
    const studentId = url.split("/").pop();
    let data: { profile: StudentProfile; programs: Program[] } | null = studentId ? mockDb.students[studentId] : null;

    // Если студента нет в БД, генерируем mock данные
    if (!data && studentId) {
      const id = studentId.replace(/^\D+/, ''); // Удаляем префикс
      const names = ["Иван Иванов", "Мария Петрова", "Алексей Сидоров", "Елена Смирнова", "Петр Федоров", "Юлия Кравцова"];
      const teachers = ["Клара Левит", "Ханна Боян"];
      const groups = ["Вт 17 Младшая", "Ср 15 Младшая", "Чт 16 Средняя", "Сб 10 Старшая"];

      const nameIdx = parseInt(id) % names.length;
      const teacherIdx = parseInt(id) % teachers.length;
      const groupIdx = parseInt(id) % groups.length;

      const mockStudent = {
        profile: {
          id: studentId,
          initials: names[nameIdx].split(' ').map(n => n[0]).join(''),
          name: names[nameIdx],
          firstName: names[nameIdx].split(' ')[0],
          lastName: names[nameIdx].split(' ')[1],
          email: `student${id}@demo.local`,
          birthDate: "2012-05-15",
          country: "Польша",
          city: "Варшава",
          street: "Aleje Jerozolimskie 100",
          apartment: "12",
          postalCode: "00-001",
          age: 12,
          parentName: "Марина Иванова",
          parentFirstName: "Марина",
          parentLastName: "Иванова",
          parentPhone: "+48 777 000 222",
          parentRole: "мама",
          parentPassport: "AB 1234567",
          phone: "+48 777 000 111",
          status: "Активна",
          statusColor: "var(--green)",
          photoConsent: true,
          regComment: "Хочет заниматься по выходным",
          totalBalance: { value: "+220 zł", label: "переплата", color: "var(--green)" },
          nextPay: { date: "01.03.2026", approx: "~837 зл · с учётом скидок" },
          enrollments: [
            {
              school: 'Space Memory',
              group: groups[groupIdx],
              teacher: teachers[teacherIdx],
              lessons: [
                { id: 'm1', date: '10.03.2026', block: 'Память', theme: 'Ассоциации', element: 'Слова', teacher: teachers[teacherIdx], attendance: 'Присутствовал', status: 'Оплачено' },
                { id: 'm2', date: '17.03.2026', block: 'Техники', theme: 'Дворец памяти', element: 'Локации', teacher: teachers[teacherIdx], attendance: 'Присутствовал', status: 'Оплачено' }
              ]
            }
          ]
        },
        programs: [
          {
            id: "space_" + id,
            name: "🌌 Space Memory",
            sub: `${groups[groupIdx]} · Вт 17:00 · ${teachers[teacherIdx]} · 490 зл/мес · 👦 1-й ребёнок · без скидки`,
            tariff: 490,
            balance: 120,
            balanceLabel: "переплата",
            barGradient: "linear-gradient(180deg,var(--blue),var(--purple))",
            years: {
              "2025": [
                { s: "paid" as MonthStatus, payStatus: "paid" as PayStatus, a: 490, ksef: "ok" as KsefStatus, g1: 4, g2: 0, txDate: "03.01.2025", lessons: 4, totalLessons: 4 },
                { s: "paid" as MonthStatus, payStatus: "paid" as PayStatus, a: 490, ksef: "ok" as KsefStatus, g1: 4, g2: 0, txDate: "02.02.2025", lessons: 4, totalLessons: 4 },
                { s: "paid" as MonthStatus, payStatus: "paid" as PayStatus, a: 490, ksef: "ok" as KsefStatus, g1: 4, g2: 0, txDate: "01.03.2025", lessons: 4, totalLessons: 4 },
              ],
              "2026": [
                { s: "paid" as MonthStatus, payStatus: "paid" as PayStatus, a: 490, ksef: "ok" as KsefStatus, g1: 4, g2: 0, txDate: "01.01.2026", lessons: 4, totalLessons: 4 },
                { s: "paid" as MonthStatus, payStatus: "paid" as PayStatus, a: 490, ksef: "ok" as KsefStatus, g1: 4, g2: 0, txDate: "01.02.2026", lessons: 4, totalLessons: 4 },
                { s: "pending" as MonthStatus, payStatus: "pending" as PayStatus, a: 490, ksef: null as KsefStatus, g1: 4, g2: 0, lessons: 0, totalLessons: 4 },
              ]
            },
            transactions: []
          }
        ]
      };
      data = mockStudent;
    }

    if (!data) return err(config, 404, "Student not found");
    return ok(config, { student: data.profile, programs: data.programs });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // НОВЫЕ РАЗБИТЫЕ ЗАПРОСЫ
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Запрос 1: GET /students/{student_id}/projects
   * Возвращает список проектов без calendar и transactions
   */
  if (method === "get" && /^students\/[^/]+\/projects$/.test(url)) {
    const studentId = url.split("/")[1];
    const studentData = studentId ? mockDb.students[studentId] : null;
    const programs = studentData?.programs || [];

    const items = programs.map((p: any) => ({
      id: p.id,
      name: p.name,
      sub: p.sub,
      tariff: p.tariff,
      balance: p.balance,
      balanceLabel: p.balanceLabel,
      barGradient: p.barGradient,
    }));

    return ok(config, { items });
  }

  /**
   * Запрос 2: GET /students/{student_id}/projects/{project_id}/calendar
   * Возвращает только years (сетку платежей) для одного проекта
   */
  if (method === "get" && /^students\/[^/]+\/projects\/[^/]+\/calendar$/.test(url)) {
    const parts = url.split("/");
    const studentId = parts[1];
    const projectId = parts[3];

    const studentData = studentId ? mockDb.students[studentId] : null;
    const program = studentData?.programs?.find((p: any) => p.id === projectId);

    if (!program) return err(config, 404, "Project not found");

    return ok(config, {
      projectId,
      years: program.years || {},
      extras: program.extras || [],
    });
  }

  /**
   * Запрос 3: GET /students/{student_id}/projects/{project_id}/transactions
   * Возвращает транзакции для одного проекта
   */
  if (method === "get" && /^students\/[^/]+\/projects\/[^/]+\/transactions$/.test(url)) {
    const parts = url.split("/");
    const projectId = parts[3];

    const items = mockTransactions[projectId] || [];
    return ok(config, { projectId, items });
  }

  /*
   * [x] Research current implementation of `.mcell` and status logic in `PaymentPrograms.vue`
   * [x] Audit and fix i18n keys in `ru.json`, `en.json`, `pl.json`
   * [x] Implement redesigned `.mcell` structure and styles
   * [x] Implement status logic helper/computed property
   * [x] Verify changes
   * [ ] Strictly align `payments.status` with API contracts [/]
   * [ ] Remove hardcoded months and strings in `PaymentPrograms.vue` [ ]
   * [ ] Audit and clean `PaymentMonthDetail.vue` for hardcoded strings [ ]
   * [ ] Fix i18n keys across all 4 languages (ru, en, pl, uk) [ ]
   * [ ] Final verification and TS check [ ]
   */

  // Example mutation endpoints (no real persistence, but realistic response shape)
  if (method === "post" && url === "payments/refund") {
    const body = readBody(config);
    if (!body?.fvnum) return err(config, 400, "fvnum is required");
    return ok(config, {
      id: "refund_" + Math.random().toString(16).slice(2),
      status: "submitted",
      createdAt: new Date().toISOString(),
    });
  }

  if (method === "post" && url === "payments/tariff") {
    const body = readBody(config);
    if (!body?.programId || !body?.value) return err(config, 400, "programId/value required");
    return ok(config, { ok: true, programId: body.programId, value: body.value });
  }

  // Dictionaries
  if (method === "get" && url === "dictionaries/pause-reasons") {
    return ok(config, { items: [
      { id: "illness", label: "Болезнь", icon: "🤧" },
      { id: "vacation", label: "Отпуск", icon: "🏖️" },
      { id: "financial", label: "Финансовые трудности", icon: "💰" },
      { id: "other", label: "Другое", icon: "📝" },
    ] });
  }
  if (method === "get" && url === "dictionaries/payment-methods") {
    return ok(config, { items: [
      { id: "cash", label: "Наличные", icon: "💵" },
      { id: "bank_transfer", label: "Банковский перевод", icon: "🏦" },
      { id: "imoje", label: "iMoje (онлайн)", icon: "💳" },
      { id: "manual", label: "Ручной ввод", icon: "⌨️" },
    ] });
  }
  if (method === "get" && url === "dictionaries/discount-types") {
    return ok(config, { items: [
      { id: "sibling", label: "Скидка для братьев/сестёр", icon: "👨‍👩‍👧‍👦" },
      { id: "loyalty", label: "Лояльность", icon: "❤️" },
      { id: "promo", label: "Промокод", icon: "🎫" },
      { id: "manual", label: "Ручная скидка", icon: "✍️" },
    ] });
  }
  if (method === "get" && url === "dictionaries/refund-reasons") {
    return ok(config, { items: [
      { id: "overpayment", label: "Переплата", icon: "📈" },
      { id: "cancellation", label: "Отмена занятий", icon: "❌" },
      { id: "quality", label: "Претензия к качеству", icon: "⭐" },
      { id: "other", label: "Другое", icon: "📝" },
    ] });
  }
  if (method === "get" && url === "dictionaries/tariffs") {
    return ok(config, { items: [
      { id: 1, label: "Стандарт — 490 грн/мес", amount: 490 },
      { id: 2, label: "Расширенный — 690 грн/мес", amount: 690 },
      { id: 3, label: "VIP — 990 грн/мес", amount: 990 },
    ] });
  }


  if (method === "get" && url === "payments/transactions") {
    const programId = (config.params as any)?.programId;
    if (!programId || !mockTransactions[programId]) return err(config, 400, "programId is required");
    return ok(config, { items: mockTransactions[programId] });
  }

  if (method === "get" && url === "payments/ksef-invoices") {
    const programId = (config.params as any)?.programId;
    if (!programId || !mockKsefInvoices[programId]) return err(config, 400, "programId is required");
    return ok(config, { items: mockKsefInvoices[programId] });
  }


  if (method === "post" && url === "payments/invoice") {
    const body = readBody(config);
    if (!body?.programId || !body?.fvnum) return err(config, 400, "programId/fvnum required");
    return ok(config, { ok: true, fvnum: body.fvnum });
  }

  if (method === "post" && url === "payments/correction") {
    const body = readBody(config);
    if (!body?.programId || body?.amount == null) return err(config, 400, "programId/amount required");
    return ok(config, { ok: true, correctionId: "corr_" + Math.random().toString(16).slice(2) });
  }

  if (method === "post" && url === "payments/pause") {
    const body = readBody(config);
    if (!body?.programId || !body?.from || !body?.to) return err(config, 400, "programId/from/to required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "payments/discount") {
    const body = readBody(config);
    if (!body?.programId || !body?.kind || body?.value == null) return err(config, 400, "programId/kind/value required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "payments/extra") {
    const body = readBody(config);
    if (!body?.programId || !body?.date || !body?.title || body?.amount == null) return err(config, 400, "programId/date/title/amount required");
    return ok(config, { ok: true, extraId: "extra_" + Math.random().toString(16).slice(2) });
  }

  if (method === "post" && url === "payments/unlock") {
    const body = readBody(config);
    if (!body?.programId) return err(config, 400, "programId required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "payments/archive") {
    const body = readBody(config);
    if (!body?.programId || !body?.reason) return err(config, 400, "programId/reason required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "payments/split") {
    const body = readBody(config);
    if (!body?.programId || !body?.fromGroup || !body?.toGroup || !body?.effectiveDate) return err(config, 400, "programId/fromGroup/toGroup/effectiveDate required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "payments/resume") {
    const body = readBody(config);
    if (!body?.programId) return err(config, 400, "programId required");
    return ok(config, { ok: true });
  }

  // --- STUDENT: GROUPS ---
  if (method === "get" && url === "student/groups") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { items: g });
  }

  if (method === "post" && url === "student/change-group") {
    const body = readBody(config);
    if (!body?.studentId || !body?.programId || !body?.fromGroup || !body?.toGroup) {
      return err(config, 400, "studentId/programId/fromGroup/toGroup required");
    }
    const found = g.find((x) => x.programId === body.programId);
    if (found) {
      found.group.code = body.toGroup;
    }
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "student/trainer-presence") {
    const body = readBody(config);
    if (!body?.studentId || !body?.groupId || !body?.trainerId || !body?.presence) {
      return err(config, 400, "studentId/groupId/trainerId/presence required");
    }
    const grp = g.find((x) => x.id === body.groupId);
    const tr = grp?.group?.trainers?.find((t: any) => t.id === body.trainerId);
    if (tr) tr.presence = body.presence;
    return ok(config, { ok: true });
  }

  // --- STUDENT: INFO ---
  if (method === "get" && url === "student/info") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { info });
  }

  if (method === "post" && url === "student/info") {
    const body = readBody(config);
    if (!body?.studentId || !body?.patch) return err(config, 400, "studentId/patch required");
    // naive deep merge for demo
    Object.assign(info, { ...info, ...body.patch });
    return ok(config, { ok: true, info });
  }

  // --- STUDENT: ATTENDANCE ---
  if (method === "get" && url === "student/attendance") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { attendance: att });
  }

  if (method === "post" && url === "student/attendance") {
    const body = readBody(config);
    if (!body?.studentId || !body?.attendanceId || !body?.mark) {
      return err(config, 400, "studentId/attendanceId/mark required");
    }
    const row = att.items.find((x: any) => x.id === body.attendanceId);
    if (row) {
      row.mark = body.mark;
      row.note = body.note ?? "";
    }
    return ok(config, { ok: true });
  }

  // --- STUDENT: PROGRESS ---
  if (method === "get" && url === "student/progress") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { progress: mockProgress });
  }

  // --- STUDENT: NOTES ---
  if (method === "get" && url === "student/notes") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { items: notes });
  }

  if (method === "post" && url === "student/notes") {
    const body = readBody(config);
    if (!body?.studentId || !body?.text) return err(config, 400, "studentId/text required");
    const now = new Date();
    const note = {
      id: "n_" + Math.random().toString(16).slice(2),
      type: body.type || "note",
      status: body.status || "open",
      category: body.category || "general",
      who: "Demo Admin",
      when: now.toLocaleDateString("ru-RU") + " · " + now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      title: body.direction ? `${body.direction}` : "",
      text: body.text,
      tags: Array.isArray(body.tags) ? body.tags : [],
    };
    notes.unshift(note);
    return ok(config, { ok: true, note });
  }

  if (method === "patch" && /^student\/notes\/[^/]+$/.test(url)) {
    const noteId = url.split("/").pop();
    const body = readBody(config) || {};
    const idx = notes.findIndex((item) => String(item.id) === String(noteId));
    if (idx === -1) return err(config, 404, "Note not found");

    const oldNote = notes[idx];
    const nextType = body.type ?? oldNote.type ?? "note";
    const nextDirection = body.direction ?? oldNote.title ?? "";

    const updatedNote = {
      ...oldNote,
      type: nextType,
      status: body.status ?? oldNote.status ?? "open",
      category: body.category ?? oldNote.category ?? "general",
      title: nextDirection || oldNote.title || "",
      text: body.text ?? oldNote.text,
      tags: Array.isArray(body.tags) ? body.tags : oldNote.tags ?? [],
    };

    notes[idx] = updatedNote;
    return ok(config, { ok: true, note: updatedNote });
  }

  if (method === "delete" && /^student\/notes\/[^/]+$/.test(url)) {
    const noteId = url.split("/").pop();
    const idx = notes.findIndex((item) => String(item.id) === String(noteId));
    if (idx === -1) return err(config, 404, "Note not found");
    notes.splice(idx, 1);
    return ok(config, { ok: true });
  }

  // --- NEW GROUPS ---
  const ng: any[] = (globalThis as any).__mock_new_groups ?? ((globalThis as any).__mock_new_groups = JSON.parse(JSON.stringify(mockNewGroups)));
  const ngStudents: any = (globalThis as any).__mock_ng_students ?? ((globalThis as any).__mock_ng_students = JSON.parse(JSON.stringify(mockGroupStudents)));

  if (method === "get" && url === "new-groups") {
    return ok(config, { items: ng });
  }

  if (method === "get" && url === "new-groups/students") {
    const groupId = Number((config.params as any)?.groupId);
    if (!groupId) return err(config, 400, "groupId is required");
    return ok(config, { items: ngStudents[groupId] ?? [] });
  }

  if (method === "get" && url === "new-groups/master-students") {
    return ok(config, { items: mockMasterStudents });
  }

  if (method === "get" && url === "new-groups/teachers") {
    return ok(config, { items: mockTeachers });
  }

  if (method === "post" && url === "new-groups/create") {
    const body = readBody(config);
    if (!body?.name || !body?.day) return err(config, 400, "name/day required");
    const today = new Date().toISOString().slice(0, 10);
    const newGroup = {
      id: Date.now(),
      name: body.name,
      type: body.type ?? "group",
      startDate: body.startDate || (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10); })(),
      createdDate: today,
      totalSlots: body.type === "individual" ? 1 : 10,
      paid: 0,
      manager: mockManagers[0],
      teacher: body.teacherId ? mockTeachers.find(t => t.id === body.teacherId) ?? null : null,
      day: body.day,
      time: body.time ?? "16:00",
      age: body.age ?? null,
      students: body.studentIds ?? [],
    };
    ng.unshift(newGroup);
    ngStudents[newGroup.id] = [];
    return ok(config, { ok: true, group: newGroup });
  }

  if (method === "post" && url === "new-groups/start") {
    const body = readBody(config);
    if (!body?.groupId) return err(config, 400, "groupId required");
    const idx = ng.findIndex(x => x.id === body.groupId);
    if (idx !== -1) ng.splice(idx, 1);
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "new-groups/delete") {
    const body = readBody(config);
    if (!body?.groupId) return err(config, 400, "groupId required");
    const idx = ng.findIndex(x => x.id === body.groupId);
    if (idx !== -1) ng.splice(idx, 1);
    return ok(config, { ok: true });
  }

  if (method === "post" && url.match(/^new-groups\/\d+\/students$/)) {
    const groupId = Number(url.split('/')[1]);
    const body = readBody(config);
    if (!groupId || !body?.studentIds) return err(config, 400, "groupId/studentIds required");
    const today = new Date().toISOString().slice(0, 10);
    if (!ngStudents[groupId]) ngStudents[groupId] = [];
    const existing = new Set(ngStudents[groupId].map((s: any) => s.name));
    let added = 0;
    for (const sid of body.studentIds) {
      const ms = mockMasterStudents.find(s => s.id === sid);
      if (ms && !existing.has(ms.name)) {
        ngStudents[groupId].push({ id: Date.now() + Math.random(), name: ms.name, age: ms.age, contract: "pending", paymentStr: "0 zł", createdDate: today, manager: null });
        added++;
      }
    }
    return ok(config, { ok: true, added });
  }

  if (method === "post" && url === "new-groups/remove-student") {
    const body = readBody(config);
    if (!body?.groupId || !body?.studentId) return err(config, 400, "groupId/studentId required");
    if (ngStudents[body.groupId]) {
      ngStudents[body.groupId] = ngStudents[body.groupId].filter((s: any) => s.id !== body.studentId);
    }
    return ok(config, { ok: true });
  }

  // --- STUDENTS LIST ---
  if (method === "get" && (url === "students/groups-filter" || url === "student/groups-filter")) {
    return ok(config, {
      items: [
        { id: 1, name: "Вт 17 Младшая" },
        { id: 2, name: "Ср 15 Младшая" },
        { id: 3, name: "Чт 16 Средняя" },
        { id: 4, name: "Сб 10 Старшая" }
      ]
    });
  }

  if (method === "get" && (url === "students/teacher-filter" || url === "student/teacher-filter")) {
    return ok(config, {
      items: [
        { id: 1, name: "Клара Левит" },
        { id: 2, name: "Ханна Боян" }
      ]
    });
  }

  // --- SETTINGS: USERS ---
  if (method === "get" && url === "settings/users") {
    return ok(config, {
      items: [
        { id: "u_current", email: "artem@gls.edu.pl", name: "Artem", role: "Dział rekrutacji учащихся", status: "online", lastLogin: "2026-03-06 14:30:00", projects: ['space'], initials: 'AR', colorClass: 'ua-amber' },
        { id: "u_2", email: "biuro@gls.edu.pl", name: "Karolina Nowak", role: "Super-Admin", status: "online", lastLogin: "2026-03-05 09:00:00", projects: ['all'], initials: 'KN', colorClass: 'ua-blue' },
        { id: "u_3", email: "marta@gls.edu.pl", name: "Marta Kowalczyk", role: "Admin", status: "offline", lastLogin: "2026-03-05 09:00:00", projects: ['space', 'indigo'], initials: 'MK', colorClass: 'ua-purple' },
        { id: "u_4", email: "p.wisniewski@gls.edu.pl", name: "Piotr Wiśniewski", role: "Kierownik działu rekrutacji", status: "offline", lastLogin: "2026-03-05 09:00:00", projects: ['space', 'olimp'], initials: 'PW', colorClass: 'ua-amber' }
      ]
    });
  }
  if (method === "patch" && /^settings\/users\//.test(url)) {
    return ok(config, { ...JSON.parse(config.data || "{}"), id: url.split("/")[2] });
  }
  if (method === "delete" && /^settings\/users\//.test(url)) {
    return ok(config, { success: true });
  }


  // ── GROUPS LIST (Secretariat) ──
  if (method === 'get' && url === 'groups') {
    console.log('[MOCK] HIT groups, url:', url);
    const mockGroupsList = [
      { id: 1, name: 'SM-A / Пн 16:00', type: 'group', studentsCount: 8, teacherName: 'Anna Kowalska', lastCommentDate: '2026-03-14', lastComment: 'Ученики подготовлены к зачёту', durationDays: 180, startDate: '2025-09-15' },
      { id: 2, name: 'SM-B / Ср 17:30', type: 'group', studentsCount: 6, teacherName: 'Ewa Lewandowska', lastCommentDate: '2026-03-10', lastComment: 'Нужна замена на следующей неделе', durationDays: 120, startDate: '2025-11-15' },
      { id: 3, name: 'IND-C / Пт 15:00', type: 'mini', studentsCount: 3, teacherName: 'Tomasz Wiśniewski', lastCommentDate: '2026-03-12', lastComment: 'Прогресс отличный, переход на следующий уровень', durationDays: 90, startDate: '2025-12-15' },
      { id: 4, name: 'SM-D / Вт 18:00', type: 'group', studentsCount: 10, teacherName: 'Anna Kowalska', lastCommentDate: '2026-03-08', lastComment: 'Двое учеников пропускают регулярно', durationDays: 365, startDate: '2025-03-15' },
      { id: 5, name: 'INDIGO-A / Чт 16:30', type: 'group', studentsCount: 7, teacherName: 'Maria Nowak', lastCommentDate: '2026-03-13', lastComment: 'Олимпиада в апреле — идёт подготовка', durationDays: 240, startDate: '2025-07-20' },
      { id: 6, name: 'IND-1 / Пн 10:00', type: 'individual', studentsCount: 1, teacherName: 'Tomasz Wiśniewski', lastCommentDate: '2026-02-28', lastComment: 'Родители просят усилить математику', durationDays: 60, startDate: '2026-01-15' },
      { id: 7, name: 'SM-E / Сб 11:00', type: 'group', studentsCount: 9, teacherName: 'Ewa Lewandowska', lastCommentDate: '2026-03-01', lastComment: 'Субботняя группа — высокая посещаемость', durationDays: 300, startDate: '2025-05-20' },
      { id: 8, name: 'MINI-B / Ср 14:00', type: 'mini', studentsCount: 4, teacherName: 'Maria Nowak', lastCommentDate: null, lastComment: null, durationDays: 30, startDate: '2026-02-13' },
      { id: 9, name: 'SM-F / Пт 18:30', type: 'group', studentsCount: 5, teacherName: 'Anna Kowalska', lastCommentDate: '2026-03-11', lastComment: 'Группа готовится к выступлению', durationDays: 150, startDate: '2025-10-15' },
      { id: 10, name: 'IND-2 / Вт 09:00', type: 'individual', studentsCount: 1, teacherName: 'Tomasz Wiśniewski', lastCommentDate: '2026-03-14', lastComment: 'Ребёнок делает быстрый прогресс', durationDays: 45, startDate: '2026-01-30' },
      { id: 11, name: 'SM-G / Чт 17:00', type: 'group', studentsCount: 8, teacherName: 'Ewa Lewandowska', lastCommentDate: '2026-03-09', lastComment: 'Запланирован открытый урок для родителей', durationDays: 200, startDate: '2025-08-28' },
      { id: 12, name: 'INDIGO-B / Пн 15:00', type: 'group', studentsCount: 6, teacherName: 'Maria Nowak', lastCommentDate: '2026-03-07', lastComment: 'Нужны дополнительные материалы', durationDays: 100, startDate: '2025-12-05' },
    ]

    // Фильтрация
    let items = [...mockGroupsList]
    const p = config.params as any || {}

    if (p.search) {
      const s = String(p.search).toLowerCase()
      items = items.filter(g => g.name.toLowerCase().includes(s) || g.teacherName.toLowerCase().includes(s))
    }
    if (p.type) {
      items = items.filter(g => g.type === p.type)
    }
    if (p.teacher_id) {
      // Простая фильтрация по имени для mock
      const teacherMap: Record<number, string> = { 1: 'Anna Kowalska', 2: 'Ewa Lewandowska', 3: 'Tomasz Wiśniewski', 4: 'Maria Nowak' }
      const tName = teacherMap[Number(p.teacher_id)]
      if (tName) items = items.filter(g => g.teacherName === tName)
    }

    // Сортировка
    const ob = p.orderBy || 'name'
    const od = p.orderDirection === 'desc' ? -1 : 1
    items.sort((a: any, b: any) => {
      const va = a[ob] ?? ''
      const vb = b[ob] ?? ''
      if (typeof va === 'number') return (va - vb) * od
      return String(va).localeCompare(String(vb)) * od
    })

    // Пагинация
    const page = Number(p.page) || 1
    const perPage = Number(p.per_page) || 20
    const total = items.length
    const from = (page - 1) * perPage
    const sliced = items.slice(from, from + perPage)

    return ok(config, {
      data: sliced,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
        per_page: perPage,
        total,
        from: sliced.length ? from + 1 : null,
        to: sliced.length ? from + sliced.length : null,
      }
    })
  }

  // ── TEACHERS LIST (Secretariat) ──
  if (method === 'get' && url === 'teachers') {
    console.log('[MOCK] HIT teachers, url:', url);
    const mockTeachersList = [
      { id: 1, firstName: 'Anna', lastName: 'Kowalska', phone: '+48 601 111 222', email: 'anna.kowalska@gls.pl', groupLessonsCount: 5, individualLessonsCount: 2, city: 'Warszawa', comment: 'Doświadczony trener Space Memory' },
      { id: 2, firstName: 'Ewa', lastName: 'Lewandowska', phone: '+48 602 333 444', email: 'ewa.lewandowska@gls.pl', groupLessonsCount: 4, individualLessonsCount: 0, city: 'Warszawa', comment: 'Specjalizacja: INDIGO' },
      { id: 3, firstName: 'Tomasz', lastName: 'Wiśniewski', phone: '+48 603 555 666', email: 'tomasz.w@gls.pl', groupLessonsCount: 2, individualLessonsCount: 3, city: 'Kraków', comment: null },
      { id: 4, firstName: 'Maria', lastName: 'Nowak', phone: '+48 604 777 888', email: 'maria.nowak@gls.pl', groupLessonsCount: 3, individualLessonsCount: 1, city: 'Warszawa', comment: 'Przygotowuje uczniów do olimpiad' },
      { id: 5, firstName: 'Katarzyna', lastName: 'Zielińska', phone: '+48 605 999 000', email: 'k.zielinska@gls.pl', groupLessonsCount: 6, individualLessonsCount: 0, city: 'Gdańsk', comment: 'Nowa w zespole — в trakcie szkolenia' },
      { id: 6, firstName: 'Piotr', lastName: 'Kamiński', phone: '+48 606 111 333', email: 'piotr.k@gls.pl', groupLessonsCount: 3, individualLessonsCount: 2, city: 'Wrocław', comment: 'Prowadzi grupy weekendowe' },
      { id: 7, firstName: 'Aleksandra', lastName: 'Wójcik', phone: '+48 607 222 444', email: 'a.wojcik@gls.pl', groupLessonsCount: 4, individualLessonsCount: 4, city: 'Warszawa', comment: null },
      { id: 8, firstName: 'Michał', lastName: 'Szymański', phone: '+48 608 333 555', email: 'michal.sz@gls.pl', groupLessonsCount: 2, individualLessonsCount: 1, city: 'Poznań', comment: 'Urlop do końca marca' },
      { id: 9, firstName: 'Joanna', lastName: 'Dąbrowska', phone: '+48 609 444 666', email: 'joanna.d@gls.pl', groupLessonsCount: 5, individualLessonsCount: 0, city: 'Kraków', comment: 'Najwyższy wynik QA w lutом' },
      { id: 10, firstName: 'Łukasz', lastName: 'Jankowski', phone: '+48 610 555 777', email: 'lukasz.j@gls.pl', groupLessonsCount: 1, individualLessonsCount: 5, city: 'Warszawa', comment: 'Specjalizacja: zajęcia indyвидualne' },
    ]

    let items = [...mockTeachersList]
    const p = config.params as any || {}

    if (p.search) {
      const s = String(p.search).toLowerCase()
      items = items.filter(t =>
        t.firstName.toLowerCase().includes(s) ||
        t.lastName.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.phone.includes(s)
      )
    }
    if (p.city) {
      items = items.filter(t => t.city === p.city)
    }

    const ob = p.orderBy || 'lastName'
    const od = p.orderDirection === 'desc' ? -1 : 1
    items.sort((a: any, b: any) => {
      const va = a[ob] ?? ''
      const vb = b[ob] ?? ''
      if (typeof va === 'number') return (va - vb) * od
      return String(va).localeCompare(String(vb)) * od
    })

    const page = Number(p.page) || 1
    const perPage = Number(p.per_page) || 20
    const total = items.length
    const from = (page - 1) * perPage
    const sliced = items.slice(from, from + perPage)

    return ok(config, {
      data: sliced,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
        per_page: perPage,
        total,
        from: sliced.length ? from + 1 : null,
        to: sliced.length ? from + sliced.length : null,
      }
    })
  }

  if (method === "get" && url === "students") {
    // Генерируем mock данные для списка студентов
    const mockStudentsList = [
      {
        id: 1,
        full_name: "Иван Иванов",
        firstName: "Иван",
        lastName: "Иванов",
        phone: "+48 777 000 111",
        email: "ivan.ivanov@gmail.com",
        created_at: "2025-12-15",
        start_date: "2025-12-15",
        training_term_days: 82,
        daysSinceContact: 2,
        lastContact: "05.03.2026, 14:30",
        comment: "Активный студент",
        is_paid: true,
        paid: true,
        status: "Активна",
        statusColor: "#10b981",
        initials: "ИИ",
        avatarColor: "#4f6ef7",
        staffInitials: "КЛ",
        staff: "Клара Левит",
        groups: [
          { school_name: "Space Memory", name: "Вт 17 Младшая", teacher_name: "Клара Левит" }
        ],
        enrollments: [
          { school: "Space Memory", group: "Вт 17 Младшая", teacher: "Клара Левит" }
        ]
      },
      {
        id: 2,
        full_name: "Мария Петрова",
        firstName: "Мария",
        lastName: "Петрова",
        phone: "+48 777 000 222",
        email: "maria.petrova@gmail.com",
        created_at: "2025-11-01",
        start_date: "2025-11-01",
        training_term_days: 127,
        daysSinceContact: 8,
        lastContact: "28.02.2026, 10:15",
        comment: "Требует внимания",
        is_paid: false,
        paid: false,
        status: "Требует внимания",
        statusColor: "#f59e0b",
        initials: "МП",
        avatarColor: "#8b5cf6",
        staffInitials: "ХБ",
        staff: "Ханна Боян",
        groups: [
          { school_name: "Speedy Mind Indigo", name: "Ср 15 Младшая", teacher_name: "Ханна Боян" }
        ],
        enrollments: [
          { school: "Speedy Mind Indigo", group: "Ср 15 Младшая", teacher: "Ханна Боян" }
        ]
      },
      {
        id: 3,
        full_name: "Алексей Сидоров",
        firstName: "Алексей",
        lastName: "Сидоров",
        phone: "+48 777 000 333",
        email: "alexey.sidorov@gmail.com",
        created_at: "2025-10-20",
        start_date: "2025-10-20",
        training_term_days: 139,
        daysSinceContact: 15,
        lastContact: "20.02.2026, 16:45",
        comment: "Без контакта 15 дней",
        is_paid: true,
        paid: true,
        status: "Критично",
        statusColor: "#ef4444",
        initials: "АС",
        avatarColor: "#06b6d4",
        staffInitials: "КЛ",
        staff: "Клара Левит",
        groups: [
          { school_name: "Space Memory", name: "Чт 16 Средняя", teacher_name: "Клара Левит" }
        ],
        enrollments: [
          { school: "Space Memory", group: "Чт 16 Средняя", teacher: "Клара Левит" }
        ]
      },
      {
        id: 4,
        full_name: "Елена Смирнова",
        firstName: "Елена",
        lastName: "Смирнова",
        phone: "+48 777 000 444",
        email: "elena.smirnova@gmail.com",
        created_at: "2025-09-10",
        start_date: "2025-09-10",
        training_term_days: 179,
        daysSinceContact: 3,
        lastContact: "04.03.2026, 19:00",
        comment: "Успешная студентка",
        is_paid: true,
        paid: true,
        status: "Активна",
        statusColor: "#10b981",
        initials: "ЕС",
        avatarColor: "#f59e0b",
        staffInitials: "ХБ",
        staff: "Ханна Боян",
        groups: [
          { school_name: "Speedy Mind Indigo", name: "Сб 10 Старшая", teacher_name: "Ханна Боян" }
        ],
        enrollments: [
          { school: "Speedy Mind Indigo", group: "Сб 10 Старшая", teacher: "Ханна Боян" }
        ]
      }
    ];

    const page = Number((config.params as any)?.page) || 1;
    const perPage = Number((config.params as any)?.per_page) || 20;
    const total = mockStudentsList.length;

    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);
    const lastPage = Math.ceil(total / perPage);

    const paginatedStudents = mockStudentsList.slice((page - 1) * perPage, page * perPage);

    return ok(config, {
      data: paginatedStudents,
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: total,
        from: from,
        to: to
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SALARY — mock-роуты для офлайн-разработки
  // Соответствуют реальному API: GET /salary/teacher/{id}, POST /salary/{id}/confirm|dispute
  // ══════════════════════════════════════════════════════════════════════════

  // GET salary/teacher/{teacherId}?month=YYYY-MM&project_id=1
  if (method === "get" && /^salary\/teacher\/\d+$/.test(url)) {
    const month = (config.params as any)?.month || "2026-02";
    return ok(config, {
      id: "1",
      month,
      teacherId: 1,
      projectId: 1,
      trainerName: "Anna Kowalska",
      status: "draft",
      confirmedAt: null,
      subscriptions: {
        amount: 2847.64, base: 25887.60, rate: 11, childrenCount: 58,
        groups: [
          { name: "SM-01", day: "Вт 17:00", kids: 16, base: 7840, salary: 862.40, children: [] },
          { name: "SM-02", day: "Сб 10:00", kids: 14, base: 6860, salary: 754.60, children: [] },
          { name: "SM-05", day: "Пт 18:30", kids: 12, base: 5880, salary: 646.80, children: [] },
          { name: "SI-03", day: "Пн 16:00", kids: 10, base: 3900, salary: 429.00, children: [] },
          { name: "SI-07", day: "Ср 15:00", kids: 6, base: 1407.60, salary: 154.84, children: [] }
        ]
      },
      substitutions: {
        amount: 150.70,
        rows: [
          { child: "Kowalczyk Marta", group: "SM-05 · Пт 18:30", forTrainer: "Zofia Nowak", date: "2026-02-07", abon: 490, salary: 53.90 },
          { child: "Nowak Oliwia",    group: "SM-05 · Пт 18:30", forTrainer: "Zofia Nowak", date: "2026-02-07", abon: 490, salary: 53.90 },
          { child: "Wojciechowska Anna", group: "SI-07 · Ср 15:00", forTrainer: "Marek Wójcik", date: "2026-02-21", abon: 390, salary: 42.90 }
        ]
      },
      methodical: {
        amount: 125.60, rate: 31.40,
        rows: [
          { name: "Methodical meeting — general",       date: "2026-02-05", present: true,  hours: 2, total: 62.80 },
          { name: "Methodical meeting — Space Memory",  date: "2026-02-19", present: true,  hours: 2, total: 62.80 },
          { name: "Methodical meeting — INDIGO",        date: "2026-02-12", present: false, hours: 0, total: 0 }
        ]
      },
      individual: {
        amount: 280.00, rate: 40,
        rows: [
          { child: "Zielinska Weronika", program: "Space Memory", count: 4, total: 160 },
          { child: "Szymanski Bartosz",  program: "INDIGO",        count: 3, total: 120 }
        ]
      },
      olympiad: {
        amount: 160.00, rate: 40,
        rows: [
          { name: "Week 1", date: "2026-02-03", link: "zoom.us/rec/AB12", total: 40 },
          { name: "Week 2", date: "2026-02-10", link: "zoom.us/rec/CD34", total: 40 },
          { name: "Week 3", date: "2026-02-17", link: "zoom.us/rec/EF56", total: 40 },
          { name: "Week 4", date: "2026-02-24", link: "zoom.us/rec/GH78", total: 40 }
        ]
      },
      admin3pct: {
        amount: 660.93, base: 25887.60, pct: 85,
        evaluatedBy: "Quality Dept", evaluatedAt: "2026-03-01",
        checklist: [
          { duty: "Lesson records sent",         status: "done",    comment: null },
          { duty: "Lesson summaries filled",     status: "done",    comment: null },
          { duty: "Tests completed & uploaded",  status: "partial", comment: "2 test videos not uploaded (SM-02, SM-03)." },
          { duty: "Homework uploaded on time",   status: "done",    comment: null },
          { duty: "WhatsApp reviews sent",       status: "done",    comment: null },
          { duty: "Parent feedback given",       status: "partial", comment: "3 parents did not receive feedback." },
          { duty: "Brief reviews sent",          status: "done",    comment: null }
        ]
      },
      bonuses: {
        amount: 500.00,
        rows: [{ reason: "Olympiad results", comment: "2 prize places", status: "approved", total: 500 }]
      },
      trialLessons: {
        amount: 70.00, rate: 35, threshold: 51,
        confirmedByQA: true, confirmedBy: "Quality Dept", confirmedAt: "2026-03-01",
        rows: [
          { name: "Trial SM",     date: "2026-02-08", program: "Space Memory", attended: 6, won: 4, paid: true,  salary: 35, children: [] },
          { name: "Trial SM",     date: "2026-02-15", program: "Space Memory", attended: 8, won: 3, paid: false, salary: 0,  children: [] },
          { name: "Trial INDIGO", date: "2026-02-22", program: "INDIGO",       attended: 5, won: 3, paid: true,  salary: 35, children: [] }
        ]
      },
      rezygnacje: []
    });
  }

  // POST salary/{id}/confirm
  if (method === "post" && /^salary\/\d+\/confirm$/.test(url)) {
    const id = parseInt(url.split("/")[1]);
    return ok(config, {
      id,
      status: "confirmed",
      confirmedAt: new Date().toISOString().replace("T", " ").slice(0, 19)
    });
  }

  // POST salary/{id}/dispute  → 201
  if (method === "post" && /^salary\/\d+\/dispute$/.test(url)) {
    const body = readBody(config);
    if (!body?.teacher_id) return err(config, 422, "teacher_id is required");
    if (!body?.reason || body.reason.length < 3) return err(config, 422, "reason must be at least 3 characters");
    const salaryId = parseInt(url.split("/")[1]);
    return ok(config, {
      id: Math.floor(Math.random() * 10000),
      salary_calculation_id: salaryId,
      status: "disputed"
    }, 201);
  }
  // ── EXPELLED STUDENTS ─────────────────────────────────────────────────────

  // Вспомогательная функция внутри блока (или добавить в начало файла если там уже есть похожие)
  const _dAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  // GET expelled-students
  if (method === 'get' && url === 'expelled-students') {
    const today = new Date();
    const daysBetween = (dateStr: string | null): number =>
      dateStr ? Math.floor((today.getTime() - new Date(dateStr).getTime()) / 86400000) : 9999;

    const students = [
      { id: 1, name: 'Анна Ковалевская',  phone: '+48 601 234 567', group: 'Вт 17 КЛе Младшая', type: 'group',      paid: true,  expelled: _dAgo(15), lastContact: _dAgo(8),  manager: 'Светлана',  comment: 'Обещала перезвонить' },
      { id: 2, name: 'Дмитрий Петров',    phone: '+48 602 345 678', group: 'Пт 19 АНа Старшая', type: 'individual', paid: false, expelled: _dAgo(45), lastContact: _dAgo(3),  manager: 'Александр', comment: '' },
      { id: 3, name: 'Марта Вишневска',   phone: '+48 603 456 789', group: 'Ср 15 ПИе Младшая', type: 'group',      paid: true,  expelled: _dAgo(30), lastContact: null,       manager: '',          comment: '' },
      { id: 4, name: 'Игорь Сидоренко',   phone: '+48 604 567 890', group: 'Чт 18 МАр Средняя', type: 'group',      paid: false, expelled: _dAgo(20), lastContact: _dAgo(12), manager: 'Мария',     comment: 'Не берёт трубку' },
      { id: 5, name: 'Светлана Бондарь',  phone: '+48 605 678 901', group: 'Вт 17 КЛе Младшая', type: 'group',      paid: true,  expelled: _dAgo(8),  lastContact: _dAgo(0),  manager: 'Артём',     comment: 'Заинтересована, ждёт' },
      { id: 6, name: 'Александр Новак',   phone: '+48 606 789 012', group: 'Пт 19 АНа Старшая', type: 'individual', paid: false, expelled: _dAgo(60), lastContact: _dAgo(20), manager: 'Светлана',  comment: 'Рассматривает варианты' },
      { id: 7, name: 'Наталья Романова',  phone: '+48 607 890 123', group: 'Ср 15 ПИе Младшая', type: 'group',      paid: true,  expelled: _dAgo(12), lastContact: _dAgo(5),  manager: '',          comment: '' },
      { id: 8, name: 'Павел Мартиненко', phone: '+48 608 901 234', group: 'Чт 18 МАр Средняя', type: 'group',      paid: false, expelled: _dAgo(4),  lastContact: null,       manager: 'Александр', comment: 'Первый звонок провален' },
    ];

    const withHistory = students.map(s => ({
      ...s,
      history: [
        { event: 'Выписан из группы',     date: s.expelled,     detail: `Группа: ${s.group}`,                                                      color: '#ef4444' },
        { event: 'Передан отделу продаж', date: s.expelled,     detail: 'Начало работы по дозакрытию',                                             color: '#f59e0b' },
        ...(s.lastContact ? [{ event: 'Последний контакт', date: s.lastContact, detail: `Ответственный: ${s.manager || '—'} · ${s.comment || 'без комментария'}`, color: '#4f6ef7' }] : []),
      ],
    }));

    return ok(config, {
      data: withHistory,
      meta: {
        total:  students.length,
        hot:    students.filter(s => daysBetween(s.lastContact) > 7).length,
        none:   students.filter(s => !s.lastContact).length,
        unpaid: students.filter(s => !s.paid).length,
      },
    });
  }

  // PATCH expelled-students/:id
  if (method === 'patch' && /^expelled-students\/\d+$/.test(url)) {
    console.log(`[MOCK] PATCH /expelled-students/${url.split('/')[1]}`);
    return ok(config, {
      id: parseInt(url.split('/')[1]),
      updatedAt: new Date().toISOString(),
    });
  }

  // POST expelled-students/:id/archive
  if (method === 'post' && /^expelled-students\/\d+\/archive$/.test(url)) {
    console.log(`[MOCK] POST /expelled-students/${url.split('/')[1]}/archive`);
    return ok(config, {
      id: parseInt(url.split('/')[1]),
      archivedAt: new Date().toISOString(),
    });
  }

  // POST expelled-students/:id/transfer
  if (method === 'post' && /^expelled-students\/\d+\/transfer$/.test(url)) {
    const body = JSON.parse(config.data || '{}');
    console.log(`[MOCK] POST /expelled-students/${url.split('/')[1]}/transfer, newGroup: ${body.group_id}`);
    return ok(config, {
      id: parseInt(url.split('/')[1]),
      newGroup: body.group_id,
    });
  }

  // POST expelled-students/bulk-assign
  if (method === 'post' && url === 'expelled-students/bulk-assign') {
    const body = JSON.parse(config.data || '{}');
    console.log(`[MOCK] POST /expelled-students/bulk-assign, ids: ${body.ids?.length}`);
    return ok(config, { updated: (body.ids || []).length });
  }

  // POST expelled-students/bulk-archive
  if (method === 'post' && url === 'expelled-students/bulk-archive') {
    const body = JSON.parse(config.data || '{}');
    console.log(`[MOCK] POST /expelled-students/bulk-archive, ids: ${body.ids?.length}`);
    return ok(config, { archived: (body.ids || []).length });
  }

  // ── END EXPELLED STUDENTS ──────────────────────────────────────────────────

  // ── ARCHIVED STUDENTS ──────────────────────────────────────────────────────

  // GET archived-students
  if (method === 'get' && url === 'archived-students') {
    const students = [
      { id: 1, name: 'Анна Ковалевская',    phone: '+48 601 234 567', registered: _dAgo(90),  expelled: _dAgo(45), lastContact: _dAgo(8),  manager: 'Светлана',  comment: 'Обещала перезвонить',         archReason: 'Не актуально',       archComment: 'Сама попросила убрать из списка', hist: [] },
      { id: 2, name: 'Дмитрий Петров',      phone: '+48 602 345 678', registered: _dAgo(120), expelled: _dAgo(60), lastContact: _dAgo(22), manager: 'Александр', comment: 'Не отвечает',                  archReason: 'Не дозвонились 3 раза', archComment: '', hist: [] },
      { id: 3, name: 'Марта Вишневска',     phone: '+48 603 456 789', registered: _dAgo(75),  expelled: _dAgo(40), lastContact: null,       manager: '',          comment: '',                             archReason: 'Переехал',           archComment: 'Переехала в Краков',         hist: [] },
      { id: 4, name: 'Игорь Сидоренко',     phone: '+48 604 567 890', registered: _dAgo(55),  expelled: _dAgo(20), lastContact: _dAgo(12), manager: 'Мария',     comment: 'Не берёт трубку',             archReason: 'Выбрал другую школу', archComment: 'Пошёл в British School',      hist: [] },
      { id: 5, name: 'Светлана Бондарь',    phone: '+48 605 678 901', registered: _dAgo(200), expelled: _dAgo(5),  lastContact: _dAgo(3),  manager: 'Артём',     comment: 'Заинтересована была',         archReason: 'Не актуально',       archComment: 'Ребёнок заболел, пауза на год', hist: [] },
    ];

    const withHistory = students.map(s => ({
      ...s,
      history: [
        { event: 'Регистрация',           date: s.registered, detail: 'Ученик зарегистрирован в системе',                            color: '#4f6ef7' },
        { event: 'Выписан из группы',     date: _dAgo(50),    detail: 'Передан в отдел работы с выписанными',                     color: '#ef4444' },
        ...(s.lastContact ? [{ event: 'Последний контакт', date: s.lastContact, detail: `Ответственный: ${s.manager || '—'} · ${s.comment || 'без комментария'}`, color: '#4f6ef7' }] : []),
        { event: 'Архивирован',           date: s.expelled,   detail: `Причина: ${s.archReason}${s.archComment ? ' · ' + s.archComment : ''}`, color: '#8b5cf6' },
      ],
    }));

    return ok(config, {
      data: withHistory,
      meta: {
        total:  students.length,
        month:  students.filter(s => s.expelled >= _dAgo(30)).length,
        none:   students.filter(s => !s.lastContact).length,
        return: students.filter(s => s.archReason === 'Не актуально').length,
      },
    });
  }

  // POST archived-students/:id/return-to-new
  if (method === 'post' && /^archived-students\/\d+\/return-to-new$/.test(url)) {
    console.log(`[MOCK] POST /archived-students/${url.split('/')[1]}/return-to-new`);
    return ok(config, { id: parseInt(url.split('/')[1]) });
  }

  // POST archived-students/:id/transfer
  if (method === 'post' && /^archived-students\/\d+\/transfer$/.test(url)) {
    const body = JSON.parse(config.data || '{}');
    console.log(`[MOCK] POST /archived-students/${url.split('/')[1]}/transfer, newGroup: ${body.group_id}`);
    return ok(config, {
      id: parseInt(url.split('/')[1]),
      newGroup: body.group_id,
    });
  }

  // ── END ARCHIVED STUDENTS ─────────────────────────────────────────────────

  // ── RECRUITMENT MOCKS ──────────────────────────────────────────────────────
  const mockHistory: Record<number, any[]> = (globalThis as any).__mock_new_students_history ?? ((globalThis as any).__mock_new_students_history = {});
  const newStudentsDb: any[] = (globalThis as any).__mock_new_students ?? ((globalThis as any).__mock_new_students = [
    { 
      id: 1, name: 'Артем', surname: 'Волков', nickname: 'Arty', email: 'artem.volkov@gmail.com', dob: '2012-05-14', contract: 'signed', 
      country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', address: 'ул. Маршалковска 10', apartment: '3', zip: '00-001',
      parent_name: 'Сергей', parent_surname: 'Волков', parent_phone: '+48 601 111 222', parent_passport: 'ABC 123456',
      hobbies: 'Robotyka, LEGO', photo_consent: 1, marketing_consent: 1, digital_content_consent: 1, data_processing_consent: 1, social_media_consent: 1, internal_quality_consent: 1,
      reg_comment: 'Ребёнок увлекается роботами. Прошу уделить внимание развитию лидерских качеств.',
      payment: 489, payment_str: '489 zł', group_name: 'Вт 17 КЛе Младшая', group_color: '#4f6ef7', start_date: '2024-02-20', created_at: '2024-02-15', wait_days: 16, manager_name: 'Светлана',
      document_list: [
        { id: 'doc1', name: 'Umowa edukacyjna', signed: true, template: 'contract_old' },
        { id: 'doc2', name: 'Zgoda RODO', signed: true, template: 'rodo_standard' }
      ],
      contract_old_new: 'old'
    },
    { 
      id: 2, name: 'Кирилл', surname: 'Морозов', nickname: 'Kiri', dob: '2015-09-22', contract: 'pending', 
      country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', address: 'ул. Новый Свят 5', apartment: '', zip: '00-400',
      parent_name: 'Анна', parent_surname: 'Морозова', parent_phone: '+48 602 333 444', parent_passport: 'DEF 654321',
      hobbies: 'Шахматы, рисование', photo_consent: 0, marketing_consent: 0, digital_content_consent: 0, data_processing_consent: 1, social_media_consent: 0, internal_quality_consent: 1,
      reg_comment: 'Кирилл очень любознательный.',
      document_list: [
        { id: 'doc1', name: 'Umowa edukacyjna', signed: false, template: 'contract_new' },
        { id: 'doc2', name: 'Zgoda RODO', signed: false, template: 'rodo_standard' }
      ],
      contract_old_new: 'new'
    },
    { 
      id: 3, name: 'Даниил', surname: 'Глебов', nickname: 'Dan', dob: '2010-11-03', contract: 'signed', 
      country: 'Польша', voivodeship: 'Małopolskie', city: 'Краков', address: 'ул. Флорианска 20', apartment: '7', zip: '30-001',
      parent_name: 'Ірина', parent_surname: 'Глебова', parent_phone: '+48 603 555 666', parent_passport: 'GHI 987654',
      hobbies: 'Kosmos, książki', photo_consent: 1, marketing_consent: 1, digital_content_consent: 1, data_processing_consent: 1, social_media_consent: 1, internal_quality_consent: 1,
      reg_comment: 'Ребёнок любит космос и читать книги.',
      payment: 440, payment_str: '440 zł', group_name: 'Пт 19 АНа Старшая', group_color: '#06b6d4', start_date: '2024-02-22', created_at: '2024-02-17', wait_days: 1, manager_name: 'Артём',
      contract_old_new: 'old'
    },
    { 
      id: 4, name: 'Никита', surname: 'Иванов', nickname: '', dob: '2017-03-19', contract: 'pending', 
      country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', address: 'ул. Пулавска 88', apartment: '12', zip: '02-603',
      parent_name: 'Дмитрий', parent_surname: 'Иванов', parent_phone: '+48 604 777 888', parent_passport: 'JKL 112233',
      hobbies: '', photo_consent: 1, marketing_consent: 0, digital_content_consent: 0, data_processing_consent: 1, social_media_consent: 0, internal_quality_consent: 1,
      reg_comment: 'Застенчивый ребёнок, привыкает медленно.',
      document_list: [
        { id: 'doc1', name: 'Umowa edukacyjna', signed: true, template: 'contract_new' },
        { id: 'doc2', name: 'Zgoda RODO', signed: false, template: 'rodo_standard' }
      ],
      payment: 0, payment_str: '0 zł', group_name: null, group_color: null, start_date: null, created_at: '2024-02-10', wait_days: 7, manager_name: null
    },
    { id: 5, name: 'Полина', surname: 'Синяк', nickname: 'Poli', dob: '2014-07-08', contract: 'pending', payment: 0, payment_str: '0 zł', group_name: null, group_color: null, start_date: null, created_at: '2024-03-03', wait_days: 3, manager_name: 'Мария', parent_phone: '+48 605 888 999' },
    { id: 6, name: 'Аня', surname: 'Белова', nickname: 'Anya', dob: '2016-02-14', contract: 'signed', payment: 464, payment_str: '464 zł', group_name: 'Сб 12 ЕЛа Средняя', group_color: '#f59e0b', start_date: '2024-03-07', created_at: '2024-03-01', wait_days: 5, manager_name: 'Мария', parent_phone: '+48 606 111 222' },
    { id: 7, name: 'Саша', surname: 'Попов', nickname: 'Sash', dob: '2013-11-25', contract: 'pending', payment: 0, payment_str: '0 zł', group_name: null, group_color: null, start_date: null, created_at: '2024-02-28', wait_days: 14, manager_name: null, parent_phone: '+48 607 777 000' },
    { id: 8, name: 'Ева', surname: 'Коваль', nickname: 'Evi', dob: '2018-06-30', contract: 'pending', payment: 0, payment_str: '0 zł', group_name: 'Чт 16 СКо Младшая', group_color: '#06b6d4', start_date: '2024-03-10', created_at: '2024-03-05', wait_days: 4, manager_name: 'Александр', parent_phone: '+48 608 333 444' },
    { id: 9, name: 'Марк', surname: 'Левин', nickname: 'Marky', dob: '2012-01-12', contract: 'pending', payment: 0, payment_str: '0 zł', group_name: null, group_color: null, start_date: null, created_at: '2024-03-12', wait_days: 6, manager_name: 'Светлана', parent_phone: '+48 609 999 111' },
    { id: 10, name: 'Олег', surname: 'Бойко', nickname: 'Oli', dob: '2011-04-19', contract: 'signed', payment: 530, payment_str: '530 zł', group_name: 'Пн 18 ЕЛа Старшая', group_color: '#ef4444', start_date: '2024-03-14', created_at: '2024-03-10', wait_days: 2, manager_name: 'Артём', parent_phone: '+48 610 000 222' },
    { 
      id: 11, name: 'Лера', surname: 'Сокол', nickname: '', dob: '2015-12-03', contract: 'pending', 
      document_list: [
        { id: 'doc1', name: 'Umowa edukacyjna', signed: false },
        { id: 'doc2', name: 'Zgoda RODO', signed: true }
      ],
      payment: 0, payment_str: '0 zł', group_name: null, group_color: null, start_date: null, created_at: '2024-03-13', wait_days: 9, manager_name: null 
    },
    { id: 12, name: 'Мия', surname: 'Янович', nickname: 'Mimi', dob: '2016-10-10', contract: 'pending', payment: 0, payment_str: '0 zł', group_name: 'Чт 16 СКо Младшая', group_color: '#06b6d4', start_date: '2024-03-18', created_at: '2024-03-15', wait_days: 1, manager_name: 'Мария' },
  ]);

  // GET new-students
  if (method === 'get' && (url === 'new-students' || url === 'recruitment/new-students')) {
    const params = (config.params || {}) as Record<string, unknown>;
    const page = Math.max(1, Number(params.page ?? 1) || 1);
    const perPage = Math.max(1, Number(params.per_page ?? params.perPage ?? 10) || 10);
    const forceError = String(params.fail ?? '') === '1';
    const forceEmpty = String(params.empty ?? '') === '1';

    if (forceError) {
      return err(config, 500, 'Mock recruitment new-students error');
    }

    const source = forceEmpty ? [] : newStudentsDb;
    const total = source.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(page, lastPage);
    const start = (currentPage - 1) * perPage;
    const rows = source.slice(start, start + perPage);
    const from = rows.length ? start + 1 : 0;
    const to = rows.length ? start + rows.length : 0;

    console.log(`[MOCK] GET ${url}, page=${currentPage}, perPage=${perPage}, total=${total}`);
    return ok(config, {
      data: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total,
        from,
        to,
        data: rows,
      },
    });
  }

  // POST new-students
  if (method === 'post' && (url === 'new-students' || url === 'recruitment/new-students')) {
    const body = readBody(config) || {};
    const maxId = newStudentsDb.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
    const created = {
      id: maxId + 1,
      name: String(body.name || '').split(' ')[0] || 'Новый',
      surname: String(body.name || '').split(' ').slice(1).join(' ') || 'Ученик',
      nickname: body.nickname ?? '',
      dob: null,
      contract: 'pending',
      payment: 0,
      payment_str: '0 zł',
      group_name: null,
      group_color: null,
      start_date: body.startDate ?? null,
      created_at: new Date().toISOString().slice(0, 10),
      wait_days: 0,
      manager_name: body.manager ?? null,
    };
    newStudentsDb.unshift(created);
    console.log(`[MOCK] POST ${url}, body: ${JSON.stringify(body)}`);
    return ok(config, { ok: true, data: created });
  }

  // GET new-students/:id
  if (method === 'get' && /^recruitment\/new-students\/\d+\/payments$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');

    const amount = Number(found.payment ?? 0);
    const signed = String(found.contract || '') === 'signed';
    return ok(config, {
      data: {
        current_price: amount > 0 ? amount.toFixed(2) : '0.00',
        current_price_desc: amount > 0 ? 'Group lessons' : 'Не выбран',
        document_list: [
          { id: `${id}-contract`, name: 'Umowa edukacyjna', signed, template: 'contract_new' },
          { id: `${id}-rodo`, name: 'Zgoda RODO', signed: true, template: 'rodo_standard' },
        ],
        transaction_list: amount > 0
          ? [
              {
                id: `${id}-tx-1`,
                date: `${found.created_at}T10:00:00Z`,
                amount,
                currency: 'PLN',
                status: 'paid',
              },
            ]
          : [],
      },
    });
  }

  // GET new-students/:id
  if (method === 'get' && /^recruitment\/new-students\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop());
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');
    return ok(config, { data: found });
  }

  // GET new-students/:id/history
  if (method === 'get' && /^recruitment\/new-students\/\d+\/history$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');
    
    const h = mockHistory[id] || [
      { event: 'Ученик создан', created_at: `${found.created_at}T09:00:00Z`, detail: 'Добавлен в рекрутинг', changed_by: found.manager_name || 'Система' }
    ];
    return ok(config, { data: h });
  }

  // PATCH new-students/:id
  if (method === 'patch' && /^recruitment\/new-students\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop());
    const body = readBody(config) || {};
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');

    if (body.history_comment) {
      if (!mockHistory[id]) {
        mockHistory[id] = [
          { event: 'Ученик создан', created_at: `${found.created_at}T09:00:00Z`, detail: 'Добавлен в рекрутинг', changed_by: found.manager_name || 'Система' }
        ];
      }
      mockHistory[id].push({
        event: 'Согласие изменено',
        created_at: new Date().toISOString(),
        detail: body.history_comment,
        changed_by: 'Администратор'
      });
      delete body.history_comment;
    }

    Object.assign(found, body);
    return ok(config, { ok: true, data: found });
  }

  // POST new-students/:id/change-password
  if (method === 'post' && /^recruitment\/new-students\/\d+\/change-password$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const body = readBody(config) || {};
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');
    if (!body.password || String(body.password).trim() === '') return err(config, 422, 'Password is required');
    return ok(config, { ok: true, message: 'Password changed', data: { id } });
  }

  // POST new-students/change-password
  if (method === 'post' && url === 'recruitment/new-students/change-password') {
    const body = readBody(config) || {};
    const id = Number(body.student_id);
    const found = newStudentsDb.find((s) => Number(s.id) === id);
    if (!found) return err(config, 404, 'Student not found');
    if (!body.password || String(body.password).trim() === '') return err(config, 422, 'Password is required');
    return ok(config, { ok: true, message: 'Password changed', data: { id } });
  }

  // POST new-students/:id/archive
  if (method === 'post' && /^recruitment\/new-students\/\d+\/archive$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const index = newStudentsDb.findIndex((s) => Number(s.id) === id);
    if (index >= 0) newStudentsDb.splice(index, 1);
    console.log(`[MOCK] POST ${url}`);
    return ok(config, { ok: true });
  }

  // GET leads
  if (method === 'get' && (url === 'leads' || url === 'recruitment/leads')) {
    console.log(`[MOCK] GET ${url}`);
    return ok(config, {
      data: [
        { id: '1', name: 'Александр Иванов', phone: '+48 123 456 789', subject: 'Математика', createdAt: '2023-10-20', status: 'new' },
        { id: '2', name: 'Мария Петрова', phone: '+48 987 654 321', subject: 'Физика', createdAt: '2023-10-21', status: 'new' },
        { id: '3', name: 'Дмитрий Сидоров', phone: '+48 500 600 700', subject: 'Английский', createdAt: '2023-10-19', status: 'in_progress' },
        { id: '4', name: 'Елена Смирнова', phone: '+48 111 222 333', subject: 'Химия', createdAt: '2023-10-18', status: 'trial' },
        { id: '5', name: 'Игорь Кузнецов', phone: '+48 444 555 666', subject: 'Биология', createdAt: '2023-10-17', status: 'decision' },
      ]
    });
  }

  if (method === 'get' && (
    url === 'target-mail' ||
    url === 'recruitment/target-mail' ||
    url === 'targetmail' ||
    url === 'recruitment/targetmail'
  )) {
    console.log(`[MOCK] GET ${url}`);
    return ok(config, {
      data: [
        {
          id: 1,
          surname: 'Kowalska',
          name: 'Anna',
          parent_email: 'anna.kowalska@example.com',
          status: 'sent',
          error_message: null,
          link_clicked_at: '2026-03-20T09:30:00Z',
          converted_at: null,
        },
        {
          id: 2,
          surname: 'Nowak',
          name: 'Piotr',
          parent_email: 'piotr.nowak@example.com',
          status: 'clicked',
          error_message: null,
          link_clicked_at: '2026-03-21T14:12:00Z',
          converted_at: null,
        },
        {
          id: 3,
          surname: 'Wiśniewska',
          name: 'Maja',
          parent_email: 'maja.parent@example.com',
          status: 'converted',
          error_message: null,
          link_clicked_at: '2026-03-18T08:05:00Z',
          converted_at: '2026-03-18T12:40:00Z',
        },
        {
          id: 4,
          surname: 'Lewandowski',
          name: 'Jan',
          parent_email: 'jan.parent@example.com',
          status: 'error',
          error_message: 'SMTP mailbox unavailable',
          link_clicked_at: null,
          converted_at: null,
        },
        {
          id: 5,
          surname: 'Dąbrowska',
          name: 'Zofia',
          parent_email: 'zofia.parent@example.com',
          status: 'opened',
          error_message: null,
          link_clicked_at: '2026-03-24T17:55:00Z',
          converted_at: null,
        },
      ]
    });
  }

  // POST leads/move (or PATCH leads/:id based on API)
  if ((method === 'post' || method === 'patch') && (url === 'leads/move' || url.startsWith('recruitment/leads/'))) {
    console.log(`[MOCK] ${method.toUpperCase()} ${url}`);
    return ok(config, { ok: true });
  }

  // POST leads/add (or POST recruitment/leads)
  if (method === 'post' && (url === 'leads/add' || url === 'recruitment/leads')) {
    const body = JSON.parse(config.data || '{}');
    console.log(`[MOCK] POST ${url}, body: ${JSON.stringify(body)}`);
    return ok(config, { id: Date.now().toString(), ...body });
  }


  // ── END RECRUITMENT MOCKS ──────────────────────────────────────────────────

  return err(config, 404, `No mock route for ${method.toUpperCase()} /${url}`);
};

