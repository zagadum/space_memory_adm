import { http } from "./http";
import type { Program, StudentProfile, Transaction, KsefInvoice, MonthObj } from "./mockDb";

export type { Transaction };

export interface StudentPaymentsResponse {
  student: StudentProfile;
  programs: Program[];
}

// ─── Новые типы для разбитых запросов ────────────────────────────────────────

/** Список проектов студента — лёгкий ответ без calendar/transactions */
export interface ProjectSummary {
  id: string;
  name: string;
  sub: string;
  tariff: number;
  balance: number;
  balanceLabel: string;
  barGradient: string;
}

/** Календарная сетка платежей по одному проекту */
export interface ProjectCalendarResponse {
  projectId: string;
  years: Record<string, MonthObj[]>;
  extras?: Program['extras'];
}

/** Транзакции по одному проекту */
export interface ProjectTransactionsResponse {
  projectId: string;
  items: Transaction[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const paymentsApi = {

  // ── Старый монолитный запрос (оставляем для обратной совместимости) ─────────
  async getStudentPayments(studentId: string) {
    const { data } = await http.get<StudentPaymentsResponse>(`payments/student/${studentId}`);
    return data;
  },

  // ── НОВЫЕ РАЗБИТЫЕ ЗАПРОСЫ ───────────────────────────────────────────────────

  /**
   * 1. Список проектов — вызывается сразу при открытии вкладки.
   *    Только мета-данные, без calendar и transactions.
   *    GET /students/{student_id}/projects
   */
  async getStudentProjects(studentId: string): Promise<ProjectSummary[]> {
    const { data } = await http.get<{ items: ProjectSummary[] }>(
      `students/${studentId}/projects`
    );
    return data.items;
  },

  /**
   * 2. Календарная сетка — вызывается по клику на проект.
   *    GET /students/{student_id}/projects/{project_id}/calendar
   */
  async getProjectCalendar(
    studentId: string,
    projectId: string
  ): Promise<ProjectCalendarResponse> {
    const { data } = await http.get<ProjectCalendarResponse>(
      `students/${studentId}/projects/${projectId}/calendar`
    );
    return data;
  },

  /**
   * 3. Транзакции — вызывается по клику на раздел "Транзакции".
   *    GET /students/{student_id}/projects/{project_id}/transactions
   */
  async getProjectTransactions(
    studentId: string,
    projectId: string
  ): Promise<ProjectTransactionsResponse> {
    const { data } = await http.get<ProjectTransactionsResponse>(
      `students/${studentId}/projects/${projectId}/transactions`
    );
    return data;
  },

  // ── Старые методы (для совместимости) ────────────────────────────────────────
  async getTransactions(programId: string) {
    const { data } = await http.get<{ items: Transaction[] }>("payments/transactions", { params: { programId } });
    return data.items;
  },

  async getKsefInvoices(programId: string) {
    const { data } = await http.get<{ items: KsefInvoice[] }>("payments/ksef-invoices", { params: { programId } });
    return data.items;
  },

  async submitRefund(payload: { fvnum: string; amount?: number; reason?: string; type?: string; description?: string; method?: string; iban?: string }) {
    const { data } = await http.post<{ id: string; status: string; createdAt: string }>("payments/refund", payload);
    return data;
  },

  async editInvoice(payload: { programId: string; monthIndex?: number; year?: string; fvnum: string; ksef?: string; issueDate?: string; payDate?: string; amount?: number; serviceName?: string; buyerName?: string; buyerAddress?: string; buyerNip?: string }) {
    const { data } = await http.post<{ ok: boolean; fvnum: string }>("payments/invoice", payload);
    return data;
  },

  async submitCorrection(payload: { programId: string; monthIndex?: number; year?: string; amount: number; note?: string; corrDate?: string }) {
    const { data } = await http.post<{ ok: boolean; correctionId: string }>("payments/correction", payload);
    return data;
  },

  async changeTariff(payload: { programId: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post("payments/tariff", payload);
    return data as { ok: boolean; programId: string; value: number };
  },

  async setPause(payload: { programId: string; from: string; to: string; reason?: string; comment?: string }) {
    const { data } = await http.post<{ ok: boolean }>("payments/pause", payload);
    return data;
  },

  async setDiscount(payload: { programId: string; kind: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post<{ ok: boolean }>("payments/discount", payload);
    return data;
  },

  async addExtra(payload: { programId: string; date: string; title: string; amount: number }) {
    const { data } = await http.post<{ ok: boolean; extraId: string }>("payments/extra", payload);
    return data;
  },

  async unlock(payload: { programId: string }) {
    const { data } = await http.post<{ ok: boolean }>("payments/unlock", payload);
    return data;
  },

  async archive(payload: { programId: string; reason?: string; endDate?: string; comment?: string }) {
    const { data } = await http.post<{ ok: boolean }>("payments/archive", payload);
    return data;
  },

  async split(payload: { programId: string; fromGroup: string; toGroup: string; effectiveDate: string }) {
    const { data } = await http.post<{ ok: boolean }>("payments/split", payload);
    return data;
  },

  async resume(payload: { programId: string }) {
    const { data } = await http.post<{ ok: boolean }>("payments/resume", payload);
    return data;
  },
};
