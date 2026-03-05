import { defineStore } from "pinia";
import { paymentsApi } from "../api/paymentsApi";
import type { Program, StudentProfile, MonthObj, KsefInvoice } from "../api/mockDb";
import type { Transaction } from "../api/paymentsApi";

function extractErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const resp = (e as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export const usePaymentsStore = defineStore("payments", {
  state: () => ({
    student: null as StudentProfile | null,
    programs: [] as Program[],
    loading: false,
    error: "" as string,
    activeTab: "payments" as "payments" | "groups" | "info" | "attendance" | "progress" | "notes",

    // Transactions & KSeF
    transactionsByProgram: {} as Record<string, Transaction[]>,
    txLoading: {} as Record<string, boolean>,
    txError: {} as Record<string, string>,
    ksefInvoicesByProgram: {} as Record<string, KsefInvoice[]>,
    ksefLoading: {} as Record<string, boolean>,
    ksefError: {} as Record<string, string>,

    // ── UI state (per-program) ──
    activeYear: {} as Record<string, number>,
    activeMonth: {} as Record<string, number | null>,
    activeView: {} as Record<string, "grid" | "table">,
  }),

  getters: {
    programsById: (s) =>
      Object.fromEntries(s.programs.map((p) => [p.id, p])) as Record<string, Program>,

    /** Возвращает массив MonthObj для данной программы и текущего года */
    monthsForProgram: (s) => (progId: string): MonthObj[] => {
      const p = s.programs.find((x) => x.id === progId);
      if (!p) return [];
      const year = String(s.activeYear[progId] || 2026);
      const arr = (p.years?.[year] || []) as MonthObj[];
      return Array.from({ length: 12 }, (_, i) =>
        arr[i] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj)
      );
    },

    /** Текущий выбранный месяц */
    currentMonth: (s) => (progId: string): MonthObj | null => {
      const idx = s.activeMonth[progId];
      if (idx == null) return null;
      const p = s.programs.find((x) => x.id === progId);
      if (!p) return null;
      const year = String(s.activeYear[progId] || 2026);
      const arr = (p.years?.[year] || []) as MonthObj[];
      return arr[idx] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj);
    },

    /** Список годов для программы */
    yearsForProgram: (s) => (progId: string): number[] => {
      const p = s.programs.find((x) => x.id === progId);
      if (!p || !p.years) return [2026];
      const ys = Object.keys(p.years).map(Number).sort();
      return ys.length ? ys : [2026];
    },
  },

  actions: {
    // ── Data loading ──
    async loadStudent(studentId = "s_1") {
      this.loading = true;
      this.error = "";
      try {
        const res = await paymentsApi.getStudentPayments(studentId);
        this.student = res.student || null;
        this.programs = res.programs || [];

        // Инициализация UI-состояния для каждой программы
        for (const p of this.programs) {
          if (this.activeYear[p.id] == null) {
            const years = Object.keys(p.years || {}).map(Number).sort();
            this.activeYear[p.id] = years.length ? years[years.length - 1] : 2026;
          }
          if (this.activeMonth[p.id] === undefined) {
            this.activeMonth[p.id] = null;
          }
          if (this.activeView[p.id] == null) {
            this.activeView[p.id] = "grid";
          }
        }
      } catch (e: unknown) {
        this.error = extractErrorMessage(e, "Failed to load payments");
      } finally {
        this.loading = false;
      }
    },

    async loadTransactions(programId: string) {
      if (this.transactionsByProgram[programId]?.length) return;
      this.txLoading[programId] = true;
      this.txError[programId] = "";
      try {
        this.transactionsByProgram[programId] = await paymentsApi.getTransactions(programId);
      } catch (e: unknown) {
        this.txError[programId] = extractErrorMessage(e, "Failed to load transactions");
      } finally {
        this.txLoading[programId] = false;
      }
    },

    async loadKsefInvoices(programId: string) {
      if (this.ksefInvoicesByProgram[programId]?.length) return;
      this.ksefLoading[programId] = true;
      this.ksefError[programId] = "";
      try {
        this.ksefInvoicesByProgram[programId] = await paymentsApi.getKsefInvoices(programId);
      } catch (e: unknown) {
        this.ksefError[programId] = extractErrorMessage(e, "Failed to load KSeF invoices");
      } finally {
        this.ksefLoading[programId] = false;
      }
    },

    // ── UI state actions ──
    setYear(prog: string, year: number) {
      this.activeYear[prog] = year;
      this.activeMonth[prog] = null;
    },

    setMonth(prog: string, monthIdx: number | null) {
      this.activeMonth[prog] = monthIdx;
    },

    setView(prog: string, view: "grid" | "table") {
      this.activeView[prog] = view;
    },

    // ── Data mutations ──
    updateTariff(programId: string, value: number) {
      const p = this.programs.find((x) => x.id === programId);
      if (!p) return;
      p.tariff = value;
      p.sub = p.sub.replace(/\d+\s*зл\/мес/, `${value} зл/мес`);
    },

    reset() {
      this.student = null;
      this.programs = [];
      this.transactionsByProgram = {};
      this.txLoading = {};
      this.txError = {};
      this.ksefInvoicesByProgram = {};
      this.ksefLoading = {};
      this.ksefError = {};
      this.activeYear = {};
      this.activeMonth = {};
      this.activeView = {};
    },
  },
});
