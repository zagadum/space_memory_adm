import { defineStore } from "pinia";
import { paymentsApi } from "../api/paymentsApi";
import type { Program, StudentProfile, MonthObj, KsefInvoice } from "../api/mockDb";
import type { Transaction, ProjectSummary } from "../api/paymentsApi";

function extractErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const err = e as any;
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Большая нагрузка на сервер. Пожалуйста, повторите попытку через несколько секунд.';
    }
    if ('response' in err) {
      const resp = err.response as { data?: { message?: string } };
      if (resp?.data?.message) return resp.data.message;
    }
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

    // ── НОВОЕ: Разбитые запросы ──────────────────────────────────────────────
    // Список проектов (лёгкий, грузится сразу)
    projectSummaries: [] as ProjectSummary[],
    projectsLoading: false,
    projectsError: "" as string,

    // Календарь — грузится по клику на проект (per-project)
    calendarByProject: {} as Record<string, Program['years']>,
    calendarLoading: {} as Record<string, boolean>,
    calendarError: {} as Record<string, string>,

    // Транзакции — грузятся по клику на раздел (per-project, lazy)
    newTxByProject: {} as Record<string, Transaction[]>,
    newTxLoading: {} as Record<string, boolean>,
    newTxError: {} as Record<string, string>,

    // Текущий studentId (нужен для lazy запросов)
    currentStudentId: "" as string,

    // Справочники для выпадающих списков
    dictionaries: {
      pauseReasons: [] as Array<{ id: string; labelKey: string }>,
      paymentMethods: [] as Array<{ id: string; labelKey: string }>,
      discountTypes: [] as Array<{ id: string; labelKey: string }>
    }
  }),

  getters: {
    programsById: (s) =>
      Object.fromEntries(s.programs.map((p) => [p.id, p])) as Record<string, Program>,

    /** Возвращает массив MonthObj для данной программы и текущего года */
    monthsForProgram: (s) => (progId: string): MonthObj[] => {
      // Приоритет: новый calendar → старый programs
      const years = s.calendarByProject[progId] || s.programs.find((x) => x.id === progId)?.years;
      if (!years) return Array.from({ length: 12 }, () => ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj));
      const year = String(s.activeYear[progId] || 2026);
      const arr = (years[year] || []) as MonthObj[];
      return Array.from({ length: 12 }, (_, i) =>
        arr[i] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj)
      );
    },

    /** Текущий выбранный месяц */
    currentMonth: (s) => (progId: string): MonthObj | null => {
      const idx = s.activeMonth[progId];
      if (idx == null) return null;
      const years = s.calendarByProject[progId] || s.programs.find((x) => x.id === progId)?.years;
      if (!years) return null;
      const year = String(s.activeYear[progId] || 2026);
      const arr = (years[year] || []) as MonthObj[];
      return arr[idx] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj);
    },

    /** Список годов для программы */
    yearsForProgram: (s) => (progId: string): number[] => {
      const years = s.calendarByProject[progId] || s.programs.find((x) => x.id === progId)?.years;
      if (!years) return [2026];
      const ys = Object.keys(years).map(Number).sort();
      return ys.length ? ys : [2026];
    },

    /** Загружен ли календарь для проекта */
    isCalendarLoaded: (s) => (progId: string): boolean => {
      return !!s.calendarByProject[progId];
    },

    /** Транзакции: новый endpoint или старый fallback */
    txForProject: (s) => (progId: string): Transaction[] => {
      return s.newTxByProject[progId]
        ?? s.transactionsByProgram[progId]
        ?? [];
    },
  },

  actions: {
    // ── Справочники ────────────────────────────────────────────────────────────
    async fetchDictionaries() {
      this.dictionaries = {
        pauseReasons: [
          { id: 'vacation', labelKey: 'modals.reasons.vacation' },
          { id: 'illness', labelKey: 'modals.reasons.illness' },
          { id: 'family', labelKey: 'modals.reasons.family' }
        ],
        paymentMethods: [
          { id: 'card', labelKey: 'modals.methods.card' },
          { id: 'cash', labelKey: 'modals.methods.cash' },
          { id: 'transfer', labelKey: 'modals.methods.transfer' }
        ],
        discountTypes: [
          { id: 'family', labelKey: 'modals.discounts.family' },
          { id: 'marketing', labelKey: 'modals.discounts.marketing' }
        ]
      };
    },

    // ── СТАРЫЙ монолитный loadStudent (оставляем, пока бэкенд не готов) ───────
    async loadStudent(studentId = "s_1") {
      this.loading = true;
      this.error = "";
      this.currentStudentId = studentId;

      try {
        const res = await paymentsApi.getStudentPayments(studentId);
        this.student = res.student || null;
        this.programs = res.programs || [];

        for (const p of this.programs) {
          if (this.activeYear[p.id] == null) {
            const years = Object.keys(p.years || {}).map(Number).sort();
            this.activeYear[p.id] = years.length ? years[years.length - 1] : 2026;
          }
          if (this.activeMonth[p.id] === undefined) this.activeMonth[p.id] = null;
          if (this.activeView[p.id] == null) this.activeView[p.id] = "grid";
        }
      } catch (e: unknown) {
        this.error = extractErrorMessage(e, "Failed to load payments");
      } finally {
        this.loading = false;
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // НОВЫЕ РАЗБИТЫЕ ЗАПРОСЫ
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Запрос 1 — вызывается при открытии вкладки Платежи.
     * Грузит только список проектов (имя, баланс, тариф) — без calendar и tx.
     * Эндпоинт: GET /students/{student_id}/projects
     */
    async loadProjects(studentId: string) {
      this.projectsLoading = true;
      this.projectsError = "";
      this.currentStudentId = studentId;
      try {
        this.projectSummaries = await paymentsApi.getStudentProjects(studentId);

        // Инициализируем UI-состояние для каждого проекта
        for (const p of this.projectSummaries) {
          if (this.activeYear[p.id] == null) this.activeYear[p.id] = new Date().getFullYear();
          if (this.activeMonth[p.id] === undefined) this.activeMonth[p.id] = null;
          if (this.activeView[p.id] == null) this.activeView[p.id] = "grid";
        }
      } catch (e: unknown) {
        this.projectsError = extractErrorMessage(e, "Failed to load projects");
      } finally {
        this.projectsLoading = false;
      }
    },

    /**
     * Запрос 2 — вызывается по клику на проект в аккордеоне.
     * Грузит календарь (years + months) только для этого проекта.
     * Кэшируется: повторный клик не делает запрос.
     * Эндпоинт: GET /students/{student_id}/projects/{project_id}/calendar
     */
    async loadCalendar(projectId: string) {
      // Уже загружен — не делаем повторный запрос
      if (this.calendarByProject[projectId]) return;

      const studentId = this.currentStudentId;
      if (!studentId) return;

      this.calendarLoading[projectId] = true;
      this.calendarError[projectId] = "";
      try {
        const res = await paymentsApi.getProjectCalendar(studentId, projectId);
        this.calendarByProject[projectId] = res.years;

        // Синхронизируем activeYear с последним годом в данных
        const years = Object.keys(res.years).map(Number).sort();
        if (years.length) this.activeYear[projectId] = years[years.length - 1];
      } catch (e: unknown) {
        this.calendarError[projectId] = extractErrorMessage(e, "Failed to load calendar");
      } finally {
        this.calendarLoading[projectId] = false;
      }
    },

    /**
     * Запрос 3 — вызывается по клику на раздел "Транзакции" внутри проекта.
     * Грузит транзакции только для этого проекта.
     * Кэшируется: повторный клик не делает запрос.
     * Эндпоинт: GET /students/{student_id}/projects/{project_id}/transactions
     */
    async loadProjectTransactions(projectId: string) {
      // Уже загружены — не делаем повторный запрос
      if (this.newTxByProject[projectId]?.length) return;

      const studentId = this.currentStudentId;
      if (!studentId) return;

      this.newTxLoading[projectId] = true;
      this.newTxError[projectId] = "";
      try {
        const res = await paymentsApi.getProjectTransactions(studentId, projectId);
        this.newTxByProject[projectId] = res.items;
      } catch (e: unknown) {
        this.newTxError[projectId] = extractErrorMessage(e, "Failed to load transactions");
      } finally {
        this.newTxLoading[projectId] = false;
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // СТАРЫЕ методы (для совместимости пока mock работает через старый эндпоинт)
    // ══════════════════════════════════════════════════════════════════════════

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

    // ── UI state ───────────────────────────────────────────────────────────────
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

    updateTariff(programId: string, value: number) {
      const p = this.programs.find((x) => x.id === programId);
      if (!p) return;
      p.tariff = value;
      p.sub = p.sub.replace(/\d+\s*зл\/мес/, `${value} зл/мес`);
    },

    reset() {
      this.student = null;
      this.programs = [];
      this.loading = false;
      this.error = "";
      this.transactionsByProgram = {};
      this.txLoading = {};
      this.txError = {};
      this.ksefInvoicesByProgram = {};
      this.ksefLoading = {};
      this.ksefError = {};
      this.activeYear = {};
      this.activeMonth = {};
      this.activeView = {};
      // Новые поля
      this.projectSummaries = [];
      this.projectsLoading = false;
      this.projectsError = "";
      this.calendarByProject = {};
      this.calendarLoading = {};
      this.calendarError = {};
      this.newTxByProject = {};
      this.newTxLoading = {};
      this.newTxError = {};
      this.currentStudentId = "";
      this.dictionaries = { pauseReasons: [], paymentMethods: [], discountTypes: [] };
    },
  },
});
