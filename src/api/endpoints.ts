/**
 * Полный реестр API-эндпоинтов проекта GLS Admin / Space Memory.
 *
 * Все URL указаны БЕЗ ведущего слеша и без префикса /v1/.
 * Префикс добавляется автоматически через baseURL в http.ts.
 *
 * При переходе от mock к live-API — менять ТОЛЬКО этот файл
 * (если бэкенд использует другую структуру URL).
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const AUTH = {
  SIGN_IN: 'auth/sign-in',
  ME: 'auth/me',
  LOGOUT: 'auth/logout',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export const DASHBOARD = {
  STATS: 'dashboard/stats',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RECRUITMENT — Новые ученики
// ═══════════════════════════════════════════════════════════════════════════
export const RECRUITMENT = {
  // CRUD новых учеников
  NEW_STUDENTS: 'recruitment/new-students',
  NEW_STUDENT_BY_ID: (id: number | string) => `recruitment/new-students/${id}`,
  NEW_STUDENT_HISTORY: (id: number | string) => `recruitment/new-students/${id}/history`,
  NEW_STUDENT_ARCHIVE: (id: number | string) => `recruitment/new-students/${id}/archive`,
  NEW_STUDENT_PAYMENTS: (id: number | string) => `recruitment/new-students/${id}/payments`,
  NEW_STUDENT_DOCUMENTS_ALL: (id: number | string) => `recruitment/new-students/${id}/documents`,

  // Документы
  DOCUMENT_DOWNLOAD: (id: number | string) => `recruitment/documents/${id}/download`,
  DOCUMENT_DELETE: (id: number | string) => `recruitment/documents/${id}`,

  // Лиды
  LEADS: 'recruitment/leads',
  LEAD_BY_ID: (id: string) => `recruitment/leads/${id}`,
  LEAD_STATUS: (id: string) => `recruitment/leads/${id}/status`,

  // Target Mail
  TARGET_MAIL: 'recruitment/target-mail',

  // Import DB
  IMPORT_DB: 'recruitment/import-db',
  IMPORT_DB_BY_ID: (id: number | string) => `recruitment/import-db/${id}`,
  IMPORT_DB_RESEND: (id: number | string) => `recruitment/import-db/${id}/resend-invitation`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPELLED STUDENTS — Выписанные ученики
// ═══════════════════════════════════════════════════════════════════════════
export const EXPELLED = {
  LIST: 'expelled-students',
  UPDATE: (id: number) => `expelled-students/${id}`,
  ARCHIVE: (id: number) => `expelled-students/${id}/archive`,
  TRANSFER: (id: number) => `expelled-students/${id}/transfer`,
  BULK_ASSIGN: 'expelled-students/bulk-assign',
  BULK_ARCHIVE: 'expelled-students/bulk-archive',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIVED STUDENTS — Архивированные ученики
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHIVED = {
  LIST: 'archived-students',
  RETURN_TO_NEW: (id: number) => `archived-students/${id}/return-to-new`,
  TRANSFER: (id: number) => `archived-students/${id}/transfer`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS (GLS) — Платежи, биллинг, инвойсы
// ═══════════════════════════════════════════════════════════════════════════
export const PAYMENTS = {
  // Старый монолитный запрос (пока бэкенд не разобьёт)
  STUDENT_DATA: (id: string | number) => `payments/${id}/payments`,

  // Новые разбитые запросы (lazy loading)
  STUDENT_PROJECTS: (id: string) => `payments/${id}/projects`,
  PROJECT_CALENDAR: (studentId: string, projectId: string) =>
    `payments/${studentId}/projects/${projectId}/calendar`,
  PROJECT_TRANSACTIONS: (studentId: string, projectId: string) =>
    `payments/${studentId}/projects/${projectId}/transactions`,

  // Старые совместимые
  TRANSACTIONS: 'payments/transactions',
  KSEF_INVOICES: 'payments/ksef-invoices',

  // Мутации
  REFUND: 'payments/refund',
  TARIFF: 'payments/tariff',
  INVOICE: 'payments/invoice',
  CORRECTION: 'payments/correction',
  PAUSE: 'payments/pause',
  DISCOUNT: 'payments/discount',
  EXTRA: 'payments/extra',
  UNLOCK: 'payments/unlock',
  ARCHIVE: 'payments/archive',
  SPLIT: 'payments/split',
  RESUME: 'payments/resume',

  // Скачивание PDF
  DOCUMENT_PDF: (id: number | string) => `payments/documents/${id}/pdf`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DICTIONARIES — Справочники (причины паузы, методы оплат и т.д.)
// ═══════════════════════════════════════════════════════════════════════════
export const DICTIONARIES = {
  PAUSE_REASONS: 'dictionaries/pause-reasons',
  PAYMENT_METHODS: 'dictionaries/payment-methods',
  DISCOUNT_TYPES: 'dictionaries/discount-types',
  REFUND_REASONS: 'dictionaries/refund-reasons',
  TARIFFS: 'dictionaries/tariffs',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT TABS — Информация по конкретному ученику (вкладки)
// ═══════════════════════════════════════════════════════════════════════════
export const STUDENT = {
  GROUPS: 'student/groups',
  CHANGE_GROUP: 'student/change-group',
  TRAINER_PRESENCE: 'student/trainer-presence',
  INFO: 'student/info',
  ATTENDANCE: 'student/attendance',
  PROGRESS: 'student/progress',
  NOTES: 'student/notes',
  NOTE_BY_ID: (id: string) => `student/notes/${id}`,
  GROUPS_FILTER: 'student/groups-filter',
  TEACHER_FILTER: 'student/teacher-filter',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// NEW GROUPS — Формирование новых групп
// ═══════════════════════════════════════════════════════════════════════════
export const NEW_GROUPS = {
  LIST: 'groups/new-groups',
  STUDENTS: 'groups/students',
  MASTER_STUDENTS: 'groups/master-students',
  TEACHERS: 'groups/teachers',
  CREATE: 'groups/new-groups',
  EDIT: 'groups/edit-groups',
  DELETE: 'groups/delete-groups',
  FULL_INFO: 'groups/full-info',
  ADD_STUDENTS: 'groups/add-student',
  REMOVE_STUDENT: 'groups/remove-student',
  UPDATE_STATUS: 'groups/update-status',
  START: 'groups/start-group',
  GROUP_STUDENTS: (id: number) => `groups/new-groups/${id}/students`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SALARY — Зарплата преподавателей
// ═══════════════════════════════════════════════════════════════════════════
export const SALARY = {
  TEACHER: (teacherId: number | string) => `salary/teacher/${teacherId}`,
  CONFIRM: (salaryId: string | number) => `salary/${salaryId}/confirm`,
  DISPUTE: (salaryId: string | number) => `salary/${salaryId}/dispute`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS — Настройки (пользователи, RBAC)
// ═══════════════════════════════════════════════════════════════════════════
export const SETTINGS = {
  USERS: 'settings/users',
  USER_BY_ID: (id: string | number) => `settings/users/${id}`,
  USER_OVERRIDES: (id: string | number) => `settings/users/${id}/overrides`,
  MY_ACCESS_CONTROL: 'me/access-control',
  ACCESS_CONTROL: 'settings/access-control',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Backwards compatible export (для существующих импортов)
// ═══════════════════════════════════════════════════════════════════════════
export const API_ENDPOINTS = {
  DICTIONARIES,
  PAYMENTS,
} as const;