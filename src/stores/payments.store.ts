import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { paymentsApi } from "../api/paymentsApi";
import type { Program, StudentProfile, MonthObj, KsefInvoice } from "../api/mockDb";
import type { Transaction, ProjectSummary } from "../api/paymentsApi";
import { parseApiError } from "../api/errorHelper";

export const usePaymentsStore = defineStore("payments", () => {
  // ── State ──
  const student = ref<StudentProfile | null>(null);
  const programs = ref<Program[]>([]);
  const loading = ref(false);
  const error = ref("");
  const activeTab = ref<"payments" | "groups" | "info" | "attendance" | "progress" | "notes">("payments");

  // Transactions & KSeF
  const transactionsByProgram = ref<Record<string, Transaction[]>>({});
  const txLoading = ref<Record<string, boolean>>({});
  const txError = ref<Record<string, string>>({});
  const ksefInvoicesByProgram = ref<Record<string, KsefInvoice[]>>({});
  const ksefLoading = ref<Record<string, boolean>>({});
  const ksefError = ref<Record<string, string>>({});

  // ── UI state (per-program) ──
  const activeYear = ref<Record<string, number>>({});
  const activeMonth = ref<Record<string, number | null>>({});
  const activeView = ref<Record<string, "grid" | "table">>({});

  // ── НОВОЕ: Разбитые запросы ──────────────────────────────────────────────
  // Список проектов (лёгкий, грузится сразу)
  const projectSummaries = ref<ProjectSummary[]>([]);
  const projectsLoading = ref(false);
  const projectsError = ref("");

  // Календарь — грузится по клику на проект (per-project)
  const calendarByProject = ref<Record<string, Program['years']>>({});
  const calendarLoading = ref<Record<string, boolean>>({});
  const calendarError = ref<Record<string, string>>({});

  // Транзакции — грузятся по клику на раздел (per-project, lazy)
  const newTxByProject = ref<Record<string, Transaction[]>>({});
  const newTxLoading = ref<Record<string, boolean>>({});
  const newTxError = ref<Record<string, string>>({});

  // Текущий studentId (нужен для lazy запросов)
  const currentStudentId = ref("");

  // Справочники для выпадающих списков
  const dictionaries = reactive({
    pauseReasons: [] as Array<any>,
    paymentMethods: [] as Array<any>,
    discountTypes: [] as Array<any>,
    refundReasons: [] as Array<any>,
    tariffs: [] as Array<any>
  });

  // ── Getters ──
  const programsById = computed(() =>
    Object.fromEntries(programs.value.map((p) => [p.id, p])) as Record<string, Program>
  );

  /** Возвращает массив MonthObj для данной программы и текущего года */
  const monthsForProgram = computed(() => (progId: string): MonthObj[] => {
    // Приоритет: новый calendar → старый programs
    const years = calendarByProject.value[progId] || programs.value.find((x) => x.id === progId)?.years;
    if (!years) return Array.from({ length: 12 }, () => ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj));
    const year = String(activeYear.value[progId] || 2026);
    const arr = (years[year] || []) as MonthObj[];
    return Array.from({ length: 12 }, (_, i) =>
      arr[i] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj)
    );
  });

  /** Текущий выбранный месяц */
  const currentMonth = computed(() => (progId: string): MonthObj | null => {
    const idx = activeMonth.value[progId];
    if (idx == null) return null;
    const years = calendarByProject.value[progId] || programs.value.find((x) => x.id === progId)?.years;
    if (!years) return null;
    const year = String(activeYear.value[progId] || 2026);
    const arr = (years[year] || []) as MonthObj[];
    return arr[idx] || ({ s: "future", a: 0, ksef: null, g1: 0, g2: 0 } as MonthObj);
  });

  /** Список годов для программы */
  const yearsForProgram = computed(() => (progId: string): number[] => {
    const years = calendarByProject.value[progId] || programs.value.find((x) => x.id === progId)?.years;
    if (!years) return [2026];
    const ys = Object.keys(years).map(Number).sort();
    return ys.length ? ys : [2026];
  });

  /** Загружен ли календарь для проекта */
  const isCalendarLoaded = computed(() => (progId: string): boolean => {
    return !!calendarByProject.value[progId];
  });

  /** Транзакции: новый endpoint или старый fallback */
  const txForProject = computed(() => (progId: string): Transaction[] => {
    return newTxByProject.value[progId]
      ?? transactionsByProgram.value[progId]
      ?? [];
  });

  // ── Actions ──
  async function fetchDictionaries() {
    try {
      const [pauseReasons, paymentMethods, discountTypes, refundReasons, tariffs] =
        await Promise.all([
          paymentsApi.getPauseReasons(),
          paymentsApi.getPaymentMethods(),
          paymentsApi.getDiscountTypes(),
          paymentsApi.getRefundReasons(),
          paymentsApi.getTariffs(),
        ]);
      Object.assign(dictionaries, { pauseReasons, paymentMethods, discountTypes, refundReasons, tariffs });
    } catch (err: unknown) {
      console.error('Ошибка загрузки словарей:', parseApiError(err));
    }
  }

  // ── СТАРЫЙ монолитный loadStudent (оставляем, пока бэкенд не готов) ───────
  async function loadStudent(studentId = "s_1") {
    loading.value = true;
    error.value = "";
    currentStudentId.value = studentId;

    try {
      const res = await paymentsApi.getStudentPayments(studentId);
      student.value = res.student || null;
      programs.value = res.programs || [];

      for (const p of programs.value) {
        if (activeYear.value[p.id] == null) {
          const years = Object.keys(p.years || {}).map(Number).sort();
          activeYear.value[p.id] = years.length ? years[years.length - 1] : 2026;
        }
        if (activeMonth.value[p.id] === undefined) activeMonth.value[p.id] = null;
        if (activeView.value[p.id] == null) activeView.value[p.id] = "grid";
      }
    } catch (e: unknown) {
      error.value = parseApiError(e, "Failed to load payments");
    } finally {
      loading.value = false;
    }
  }

  /**
   * Запрос 1 — вызывается при открытии вкладки Платежи.
   * Грузит только список проектов (имя, баланс, тариф) — без calendar и tx.
   * Эндпоинт: GET /students/{student_id}/projects
   */
  async function loadProjects(studentId: string) {
    projectsLoading.value = true;
    projectsError.value = "";
    currentStudentId.value = studentId;
    try {
      projectSummaries.value = await paymentsApi.getStudentProjects(studentId);

      // Инициализируем UI-состояние для каждого проекта
      for (const p of projectSummaries.value) {
        if (activeYear.value[p.id] == null) activeYear.value[p.id] = new Date().getFullYear();
        if (activeMonth.value[p.id] === undefined) activeMonth.value[p.id] = null;
        if (activeView.value[p.id] == null) activeView.value[p.id] = "grid";
      }
    } catch (e: unknown) {
      projectsError.value = parseApiError(e, "Failed to load projects");
    } finally {
      projectsLoading.value = false;
    }
  }

  /**
   * Запрос 2 — вызывается по клику на проект в аккордеоне.
   * Грузит календарь (years + months) только для этого проекта.
   * Кэшируется: повторный клик не делает запрос.
   * Эндпоинт: GET /students/{student_id}/projects/{project_id}/calendar
   */
  async function loadCalendar(projectId: string) {
    // Уже загружен — не делаем повторный запрос
    if (calendarByProject.value[projectId]) return;

    const studentId = currentStudentId.value;
    if (!studentId) return;

    calendarLoading.value[projectId] = true;
    calendarError.value[projectId] = "";
    try {
      const res = await paymentsApi.getProjectCalendar(studentId, projectId);
      calendarByProject.value[projectId] = res.years;

      // Синхронизируем activeYear с последним годом в данных
      const years = Object.keys(res.years).map(Number).sort();
      if (years.length) activeYear.value[projectId] = years[years.length - 1];
    } catch (e: unknown) {
      calendarError.value[projectId] = parseApiError(e, "Failed to load calendar");
    } finally {
      calendarLoading.value[projectId] = false;
    }
  }

  /**
   * Запрос 3 — вызывается по клику на раздел "Транзакции" внутри проекта.
   * Грузит транзакции только для этого проекта.
   * Кэшируется: повторный клик не делает запрос.
   * Эндпоинт: GET /students/{student_id}/projects/{project_id}/transactions
   */
  async function loadProjectTransactions(projectId: string) {
    // Уже загружены — не делаем повторный запрос
    if (newTxByProject.value[projectId]?.length) return;

    const studentId = currentStudentId.value;
    if (!studentId) return;

    newTxLoading.value[projectId] = true;
    newTxError.value[projectId] = "";
    try {
      const res = await paymentsApi.getProjectTransactions(studentId, projectId);
      newTxByProject.value[projectId] = res.items;
    } catch (e: unknown) {
      newTxError.value[projectId] = parseApiError(e, "Failed to load transactions");
    } finally {
      newTxLoading.value[projectId] = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // СТАРЫЕ методы (для совместимости пока mock работает через старый эндпоинт)
  // ══════════════════════════════════════════════════════════════════════════

  async function loadTransactions(programId: string) {
    if (transactionsByProgram.value[programId]?.length) return;
    txLoading.value[programId] = true;
    txError.value[programId] = "";
    try {
      transactionsByProgram.value[programId] = await paymentsApi.getTransactions(programId);
    } catch (e: unknown) {
      txError.value[programId] = parseApiError(e, "Failed to load transactions");
    } finally {
      txLoading.value[programId] = false;
    }
  }

  async function loadKsefInvoices(programId: string) {
    if (ksefInvoicesByProgram.value[programId]?.length) return;
    ksefLoading.value[programId] = true;
    ksefError.value[programId] = "";
    try {
      ksefInvoicesByProgram.value[programId] = await paymentsApi.getKsefInvoices(programId);
    } catch (e: unknown) {
      ksefError.value[programId] = parseApiError(e, "Failed to load KSeF invoices");
    } finally {
      ksefLoading.value[programId] = false;
    }
  }

  // ── UI state ───────────────────────────────────────────────────────────────
  function setYear(prog: string, year: number) {
    activeYear.value[prog] = year;
    activeMonth.value[prog] = null;
  }

  function setMonth(prog: string, monthIdx: number | null) {
    activeMonth.value[prog] = monthIdx;
  }

  function setView(prog: string, view: "grid" | "table") {
    activeView.value[prog] = view;
  }

  function updateTariff(programId: string, value: number) {
    const p = programs.value.find((x) => x.id === programId);
    if (!p) return;
    p.tariff = value;
    p.sub = p.sub.replace(/\d+\s*зл\/мес/, `${value} зл/мес`);
  }

  function reset() {
    student.value = null;
    programs.value = [];
    loading.value = false;
    error.value = "";
    transactionsByProgram.value = {};
    txLoading.value = {};
    txError.value = {};
    ksefInvoicesByProgram.value = {};
    ksefLoading.value = {};
    ksefError.value = {};
    activeYear.value = {};
    activeMonth.value = {};
    activeView.value = {};
    // Новые поля
    projectSummaries.value = [];
    projectsLoading.value = false;
    projectsError.value = "";
    calendarByProject.value = {};
    calendarLoading.value = {};
    calendarError.value = {};
    newTxByProject.value = {};
    newTxLoading.value = {};
    newTxError.value = {};
    currentStudentId.value = "";
    Object.assign(dictionaries, { pauseReasons: [], paymentMethods: [], discountTypes: [], refundReasons: [], tariffs: [] });
  }

  // Перезагрузка данных текущего студента (вызывается после мутаций)
  async function reloadCurrent() {
    if (currentStudentId.value) {
      await loadStudent(currentStudentId.value);
    }
  }

  return {
    student, programs, loading, error, activeTab,
    transactionsByProgram, txLoading, txError, ksefInvoicesByProgram, ksefLoading, ksefError,
    activeYear, activeMonth, activeView,
    projectSummaries, projectsLoading, projectsError,
    calendarByProject, calendarLoading, calendarError,
    newTxByProject, newTxLoading, newTxError,
    currentStudentId, dictionaries,
    programsById, monthsForProgram, currentMonth, yearsForProgram, isCalendarLoaded, txForProject,
    fetchDictionaries, loadStudent, loadProjects, loadCalendar, loadProjectTransactions,
    loadTransactions, loadKsefInvoices, setYear, setMonth, setView, updateTariff, reset, reloadCurrent
  };
});
