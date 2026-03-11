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

  // --- AUTH ---
  if (method === "post" && (url === "auth/sign-in" || url === "v1/auth/sign-in" || url === "api/auth/sign-in" || url === "api/v1/auth/sign-in")) {
    const body = readBody(config);
    if (!body?.email || !body?.password) return err(config, 400, "Missing credentials");
    if (body.email !== "admin@demo.local" || body.password !== "demo") {
      return err(config, 401, "Invalid credentials");
    }
    return ok(config, {
      token: "mock.jwt.token.admin",
      user: {
        id: "1",
        email: "admin@demo.local",
        name: "Demo Admin",
        role: "admin",
        initials: "DA",
      },
    });
  }
  if (method === "get" && (url === "auth/me" || url === "v1/auth/me" || url === "api/auth/me" || url === "api/v1/auth/me")) {
    const auth = (config.headers as any)?.Authorization || "";
    if (!String(auth).startsWith("Bearer ")) return err(config, 401, "Unauthorized");
    return ok(config, {
      id: "1",
      email: "admin@demo.local",
      name: "Demo Admin",
      role: "admin",
      initials: "DA",
    });
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

  if (method === "post" && url === "new-groups/add-students") {
    const body = readBody(config);
    if (!body?.groupId || !body?.studentIds) return err(config, 400, "groupId/studentIds required");
    const today = new Date().toISOString().slice(0, 10);
    if (!ngStudents[body.groupId]) ngStudents[body.groupId] = [];
    const existing = new Set(ngStudents[body.groupId].map((s: any) => s.name));
    let added = 0;
    for (const sid of body.studentIds) {
      const ms = mockMasterStudents.find(s => s.id === sid);
      if (ms && !existing.has(ms.name)) {
        ngStudents[body.groupId].push({ id: Date.now() + Math.random(), name: ms.name, age: ms.age, contract: "pending", paymentStr: "0 zł", createdDate: today, manager: null });
        added++;
      }
    }
    return ok(config, { ok: true, added });
  }

  if (method === "post" && url === "new-groups/remove-student") {
    const body = readBody(config);
    if (!body?.groupId || !body?.studentName) return err(config, 400, "groupId/studentName required");
    if (ngStudents[body.groupId]) {
      ngStudents[body.groupId] = ngStudents[body.groupId].filter((s: any) => s.name !== body.studentName);
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

    return err(config, 404, `No mock route for ${method.toUpperCase()} /${url}`);
};

