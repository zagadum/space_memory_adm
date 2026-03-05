import { http } from "./http";
import type { Program, StudentProfile, Transaction, KsefInvoice } from "./mockDb";

export type { Transaction };

export interface StudentPaymentsResponse {
  student: StudentProfile;
  programs: Program[];
}

export const paymentsApi = {
  async getStudentPayments(studentId: string) {
    const { data } = await http.get<StudentPaymentsResponse>(`api/payments/student/${studentId}`);
    return data;
  },

  async getTransactions(programId: string) {
    const { data } = await http.get<{ items: Transaction[] }>("api/payments/transactions", { params: { programId } });
    return data.items;
  },

  async getKsefInvoices(programId: string) {
    const { data } = await http.get<{ items: KsefInvoice[] }>("api/payments/ksef-invoices", { params: { programId } });
    return data.items;
  },

  async submitRefund(payload: { fvnum: string; amount?: number; reason?: string; type?: string; description?: string; method?: string; iban?: string }) {
    const { data } = await http.post<{ id: string; status: string; createdAt: string }>("api/payments/refund", payload);
    return data;
  },

  async editInvoice(payload: { programId: string; monthIndex?: number; year?: string; fvnum: string; ksef?: string; issueDate?: string; payDate?: string; amount?: number; serviceName?: string; buyerName?: string; buyerAddress?: string; buyerNip?: string }) {
    const { data } = await http.post<{ ok: boolean; fvnum: string }>("api/payments/invoice", payload);
    return data;
  },

  async submitCorrection(payload: { programId: string; monthIndex?: number; year?: string; amount: number; note?: string; corrDate?: string }) {
    const { data } = await http.post<{ ok: boolean; correctionId: string }>("api/payments/correction", payload);
    return data;
  },

  async changeTariff(payload: { programId: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post("api/payments/tariff", payload);
    return data as { ok: boolean; programId: string; value: number };
  },

  async setPause(payload: { programId: string; from: string; to: string; reason?: string; comment?: string }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/pause", payload);
    return data;
  },

  async setDiscount(payload: { programId: string; kind: string; value: number; fromMonthIndex: number }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/discount", payload);
    return data;
  },

  async addExtra(payload: { programId: string; date: string; title: string; amount: number }) {
    const { data } = await http.post<{ ok: boolean; extraId: string }>("api/payments/extra", payload);
    return data;
  },

  async unlock(payload: { programId: string }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/unlock", payload);
    return data;
  },

  async archive(payload: { programId: string; reason?: string; endDate?: string; comment?: string }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/archive", payload);
    return data;
  },

  async split(payload: { programId: string; fromGroup: string; toGroup: string; effectiveDate: string }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/split", payload);
    return data;
  },

  async resume(payload: { programId: string }) {
    const { data } = await http.post<{ ok: boolean }>("api/payments/resume", payload);
    return data;
  },
};
