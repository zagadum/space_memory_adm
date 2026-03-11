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

type MaybeWrapped<T> = T | { data: T };

function unwrapApiData<T>(payload: MaybeWrapped<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const paymentsApi = {

  // ── Старый монолитный запрос (оставляем для обратной совместимости) ─────────
  async getStudentPayments(studentId: string) {
    const { data } = await http.get<MaybeWrapped<StudentPaymentsResponse>>(`students/${studentId}/payments`);
    return unwrapApiData(data);
  },

  // ── НОВЫЕ РАЗБИТЫЕ ЗАПРОСЫ ───────────────────────────────────────────────────

  /**
   * 1. Список проектов — вызывается сразу при открытии вкладки.
   *    Только мета-данные, без calendar и transactions.
   *    GET /students/{student_id}/projects
   */
  async getStudentProjects(studentId: string): Promise<ProjectSummary[]> {
    const { data } = await http.get<MaybeWrapped<{ items: ProjectSummary[] }>>(
      `students/${studentId}/projects`
    );
    return unwrapApiData(data).items;
  },

  /**
   * 2. Календарная сетка — вызывается по клику на проект.
   *    GET /students/{student_id}/projects/{project_id}/calendar
   */
  async getProjectCalendar(
    studentId: string,
    projectId: string
  ): Promise<ProjectCalendarResponse> {
    const { data } = await http.get<MaybeWrapped<ProjectCalendarResponse>>(
      `students/${studentId}/projects/${projectId}/calendar`
    );
    return unwrapApiData(data);
  },

  /**
   * 3. Транзакции — вызывается по клику на раздел "Транзакции".
   *    GET /students/{student_id}/projects/{project_id}/transactions
   */
  async getProjectTransactions(
    studentId: string,
    projectId: string
  ): Promise<ProjectTransactionsResponse> {
    const { data } = await http.get<MaybeWrapped<ProjectTransactionsResponse>>(
      `students/${studentId}/projects/${projectId}/transactions`
    );
    return unwrapApiData(data);
  },

  // ── Старые методы (для совместимости) ────────────────────────────────────────
  async getTransactions(programId: string) {
    const { data } = await http.get<MaybeWrapped<{ items: Transaction[] }>>("payments/transactions", { params: { programId } });
    return unwrapApiData(data).items;
  },

  async getKsefInvoices(programId: string) {
    const { data } = await http.get<MaybeWrapped<{ items: KsefInvoice[] }>>("payments/ksef-invoices", { params: { programId } });
    return unwrapApiData(data).items;
  },

  async submitRefund(payload: { fvnum: string; amount?: number; reason?: string; type?: string; description?: string; method?: string; iban?: string }) {
    const { data } = await http.post<MaybeWrapped<{ id: string; status: string; createdAt: string }>>("payments/refund", payload);
    return unwrapApiData(data);
  },

  async editInvoice(payload: { programId: string; monthIndex?: number; year?: string; fvnum: string; ksef?: string; issueDate?: string; payDate?: string; amount?: number; serviceName?: string; buyerName?: string; buyerAddress?: string; buyerNip?: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean; fvnum: string }>>("payments/invoice", payload);
    return unwrapApiData(data);
  },

  async submitCorrection(payload: { programId: string; monthIndex?: number; year?: string; amount: number; note?: string; corrDate?: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean; correctionId: string }>>("payments/correction", payload);
    return unwrapApiData(data);
  },

  async changeTariff(payload: { programId: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean; programId: string; value: number }>>("payments/tariff", payload);
    return unwrapApiData(data);
  },

  async setPause(payload: { programId: string; from: string; to: string; reason?: string; comment?: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/pause", payload);
    return unwrapApiData(data);
  },

  async setDiscount(payload: { programId: string; kind: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/discount", payload);
    return unwrapApiData(data);
  },

  async addExtra(payload: { programId: string; date: string; title: string; amount: number }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean; extraId: string }>>("payments/extra", payload);
    return unwrapApiData(data);
  },

  async unlock(payload: { programId: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/unlock", payload);
    return unwrapApiData(data);
  },

  async archive(payload: { programId: string; reason?: string; endDate?: string; comment?: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/archive", payload);
    return unwrapApiData(data);
  },

  async split(payload: { programId: string; fromGroup: string; toGroup: string; effectiveDate: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/split", payload);
    return unwrapApiData(data);
  },

  async resume(payload: { programId: string }) {
    const { data } = await http.post<MaybeWrapped<{ ok: boolean }>>("payments/resume", payload);
    return unwrapApiData(data);
  },
};
