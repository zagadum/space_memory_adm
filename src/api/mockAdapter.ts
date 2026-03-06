import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { mockNewGroups, mockGroupStudents, mockMasterStudents, mockTeachers, mockManagers } from "./mockNewGroupsDb";
import { mockDb, mockTransactions, mockKsefInvoices, mockGroups, mockInfo, mockAttendance, mockProgress, mockNotes } from "./mockDb";

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
  if (method === "post" && url === "api/auth/sign-in") {
    const body = readBody(config);
    if (!body?.email || !body?.password) return err(config, 400, "Missing credentials");
    return ok(config, { token: "mock.jwt.token", user: mockDb.me });
  }
  if (method === "get" && url === "api/auth/me") {
    const auth = (config.headers as any)?.Authorization || "";
    if (!String(auth).startsWith("Bearer ")) return err(config, 401, "Unauthorized");
    return ok(config, mockDb.me);
  }

  // --- PAYMENTS ---
  if (method === "get" && url.startsWith("api/payments/student/")) {
    const studentId = url.split("/").pop();
    const data = studentId ? mockDb.students[studentId] : null;
    if (!data) return err(config, 404, "Student not found");
    return ok(config, { student: data.profile, programs: data.programs });
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
  if (method === "post" && url === "api/payments/refund") {
    const body = readBody(config);
    if (!body?.fvnum) return err(config, 400, "fvnum is required");
    return ok(config, {
      id: "refund_" + Math.random().toString(16).slice(2),
      status: "submitted",
      createdAt: new Date().toISOString(),
    });
  }

  if (method === "post" && url === "api/payments/tariff") {
    const body = readBody(config);
    if (!body?.programId || !body?.value) return err(config, 400, "programId/value required");
    return ok(config, { ok: true, programId: body.programId, value: body.value });
  }


  if (method === "get" && url === "api/payments/transactions") {
    const programId = (config.params as any)?.programId;
    if (!programId || !mockTransactions[programId]) return err(config, 400, "programId is required");
    return ok(config, { items: mockTransactions[programId] });
  }

  if (method === "get" && url === "api/payments/ksef-invoices") {
    const programId = (config.params as any)?.programId;
    if (!programId || !mockKsefInvoices[programId]) return err(config, 400, "programId is required");
    return ok(config, { items: mockKsefInvoices[programId] });
  }


  if (method === "post" && url === "api/payments/invoice") {
    const body = readBody(config);
    if (!body?.programId || !body?.fvnum) return err(config, 400, "programId/fvnum required");
    return ok(config, { ok: true, fvnum: body.fvnum });
  }

  if (method === "post" && url === "api/payments/correction") {
    const body = readBody(config);
    if (!body?.programId || body?.amount == null) return err(config, 400, "programId/amount required");
    return ok(config, { ok: true, correctionId: "corr_" + Math.random().toString(16).slice(2) });
  }

  if (method === "post" && url === "api/payments/pause") {
    const body = readBody(config);
    if (!body?.programId || !body?.from || !body?.to) return err(config, 400, "programId/from/to required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/payments/discount") {
    const body = readBody(config);
    if (!body?.programId || !body?.kind || body?.value == null) return err(config, 400, "programId/kind/value required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/payments/extra") {
    const body = readBody(config);
    if (!body?.programId || !body?.date || !body?.title || body?.amount == null) return err(config, 400, "programId/date/title/amount required");
    return ok(config, { ok: true, extraId: "extra_" + Math.random().toString(16).slice(2) });
  }

  if (method === "post" && url === "api/payments/unlock") {
    const body = readBody(config);
    if (!body?.programId) return err(config, 400, "programId required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/payments/archive") {
    const body = readBody(config);
    if (!body?.programId || !body?.reason) return err(config, 400, "programId/reason required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/payments/split") {
    const body = readBody(config);
    if (!body?.programId || !body?.fromGroup || !body?.toGroup || !body?.effectiveDate) return err(config, 400, "programId/fromGroup/toGroup/effectiveDate required");
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/payments/resume") {
    const body = readBody(config);
    if (!body?.programId) return err(config, 400, "programId required");
    return ok(config, { ok: true });
  }

  // --- STUDENT: GROUPS ---
  if (method === "get" && url === "api/student/groups") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { items: g });
  }

  if (method === "post" && url === "api/student/change-group") {
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

  if (method === "post" && url === "api/student/trainer-presence") {
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
  if (method === "get" && url === "api/student/info") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { info });
  }

  if (method === "post" && url === "api/student/info") {
    const body = readBody(config);
    if (!body?.studentId || !body?.patch) return err(config, 400, "studentId/patch required");
    // naive deep merge for demo
    Object.assign(info, { ...info, ...body.patch });
    return ok(config, { ok: true, info });
  }

  // --- STUDENT: ATTENDANCE ---
  if (method === "get" && url === "api/student/attendance") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { attendance: att });
  }

  if (method === "post" && url === "api/student/attendance") {
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
  if (method === "get" && url === "api/student/progress") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { progress: mockProgress });
  }

  // --- STUDENT: NOTES ---
  if (method === "get" && url === "api/student/notes") {
    const studentId = (config.params as any)?.studentId;
    if (!studentId) return err(config, 400, "studentId is required");
    return ok(config, { items: notes });
  }

  if (method === "post" && url === "api/student/notes") {
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

  // --- NEW GROUPS ---
  const ng: any[] = (globalThis as any).__mock_new_groups ?? ((globalThis as any).__mock_new_groups = JSON.parse(JSON.stringify(mockNewGroups)));
  const ngStudents: any = (globalThis as any).__mock_ng_students ?? ((globalThis as any).__mock_ng_students = JSON.parse(JSON.stringify(mockGroupStudents)));

  if (method === "get" && url === "api/new-groups") {
    return ok(config, { items: ng });
  }

  if (method === "get" && url === "api/new-groups/students") {
    const groupId = Number((config.params as any)?.groupId);
    if (!groupId) return err(config, 400, "groupId is required");
    return ok(config, { items: ngStudents[groupId] ?? [] });
  }

  if (method === "get" && url === "api/new-groups/master-students") {
    return ok(config, { items: mockMasterStudents });
  }

  if (method === "get" && url === "api/new-groups/teachers") {
    return ok(config, { items: mockTeachers });
  }

  if (method === "post" && url === "api/new-groups/create") {
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

  if (method === "post" && url === "api/new-groups/start") {
    const body = readBody(config);
    if (!body?.groupId) return err(config, 400, "groupId required");
    const idx = ng.findIndex(x => x.id === body.groupId);
    if (idx !== -1) ng.splice(idx, 1);
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/new-groups/delete") {
    const body = readBody(config);
    if (!body?.groupId) return err(config, 400, "groupId required");
    const idx = ng.findIndex(x => x.id === body.groupId);
    if (idx !== -1) ng.splice(idx, 1);
    return ok(config, { ok: true });
  }

  if (method === "post" && url === "api/new-groups/add-students") {
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

  if (method === "post" && url === "api/new-groups/remove-student") {
    const body = readBody(config);
    if (!body?.groupId || !body?.studentName) return err(config, 400, "groupId/studentName required");
    if (ngStudents[body.groupId]) {
      ngStudents[body.groupId] = ngStudents[body.groupId].filter((s: any) => s.name !== body.studentName);
    }
    return ok(config, { ok: true });
  }

  return err(config, 404, `No mock route for ${method.toUpperCase()} /${url}`);
};
