import type { MenuAccessMap, MenuAccessMode } from "./menuAccess.config";

// ─────────────────────────────────────────────────────────────────────────────
// Canonical role keys — language-independent slugs used throughout the app.
// The backend may return any alias listed in ROLE_ALIASES; all are normalised
// to one of these values before any access check is performed.
// ─────────────────────────────────────────────────────────────────────────────
export type AppRole =
  | "super-admin"
  | "admin"
  | "teacher"
  | "sales"
  | "quality"
  | "finance"
  | "secretariat"
  | "hr";

// Maps raw backend / legacy strings → canonical AppRole.
// Add new aliases here when the backend naming changes.
export const ROLE_ALIASES: Record<string, AppRole> = {
  // super-admin
  "super-admin":  "super-admin",
  "Super-Admin":  "super-admin",
  "superadmin":   "super-admin",

  // admin
  "admin":  "admin",
  "Admin":  "admin",
  "administrator": "admin",
  "Administrator": "admin",

  // common normalized variants
  "super_admin": "super-admin",
  "super admin": "super-admin",
  "SUPER-ADMIN": "super-admin",
  "ADMIN": "admin",

  // teacher
  "teacher":            "teacher",
  "Trener Space Memory": "teacher",
  "Trener INDIGO":       "teacher",
  "trener":             "teacher",

  // sales / recruitment
  "sales":                          "sales",
  "Kierownik działu rekrutacji":    "sales",
  "Dział rekrutacji учащихся":      "sales",
  "rekrutacja":                     "sales",

  // quality
  "quality":                          "quality",
  "Kierownik Działu Jakości Space":   "quality",
  "Dział Jakości Space":              "quality",
  "Kierownik Działu Jakości INDIGO":  "quality",
  "Dział Jakości INDIGO":             "quality",
  "jakosc":                           "quality",

  // finance
  "finance":                                  "finance",
  "Główna Księgowa":                          "finance",
  "Pracownik działu finansów i administracji": "finance",
  "ksiegowosc":                               "finance",

  // secretariat
  "secretariat":            "secretariat",
  "Pracownik sekretariatu": "secretariat",
  "sekretariat":            "secretariat",

  // hr
  "hr": "hr",
  "HR": "hr",
};

const ROLE_ALIASES_LOWER: Record<string, AppRole> = Object.fromEntries(
  Object.entries(ROLE_ALIASES).map(([k, v]) => [k.toLowerCase(), v])
) as Record<string, AppRole>;

/** Normalises any raw role string coming from the backend into an AppRole.
 *  Returns null when the string is unknown / empty. */
export function normalizeRole(raw: string | null | undefined): AppRole | null {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;

  const direct = ROLE_ALIASES[value];
  if (direct) return direct;

  const lower = value.toLowerCase();
  const byLower = ROLE_ALIASES_LOWER[lower];
  if (byLower) return byLower;

  const slug = lower.replace(/_/g, "-");
  if (slug === "admin") return "admin";
  if (slug === "super-admin" || slug === "super admin") return "super-admin";

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu key groups — every key that can appear in MENU_ACCESS_CONFIG or
// MENU_SECTION_ITEMS. Used to build per-role maps without repetition.
// ─────────────────────────────────────────────────────────────────────────────
const ALWAYS: string[] = ["my-cabinet", "dashboard"];

const SECRETARIAT: string[] = [
  "secretariat", "students", "groups", "teachers", "course-endings",
];

const RECRUITMENT: string[] = [
  "recruitment", "new-students", "leads", "target-mail",
  "expelled", "new-groups", "archived", "import-db",
];

const IMPORT_DB_ACTIONS: string[] = [
  "import-db-update",
  "import-db-delete",
  "import-db-resend-invitation",
];

const FINANCE: string[] = [
  "finance", "student-finance", "debtors", "nadplaty", "cohorts", "settings",
];

const ACCOUNTING: string[] = [
  "accounting", "faktury", "returns", "projects",
  "salary-calculator", "finance-ustawienia",
];

const HR: string[] = [
  "hr", "hr-active", "hr-training", "hr-pipeline", "hr-personal", "hr-analytics",
];

const TRAINER: string[] = [
  "trainer", "trainer-dashboard", "trainer-students", "trainer-groups",
  "lesson-tracker", "salary-demo", "trainer-materials", "trainer-exam", "trainer-mail",
];

const QUALITY: string[] = [
  "quality", "rezygnacje", "holidays-return", "quality-monitoring",
  "quality-analytics", "trial-lessons-qd", "quality-zaliczenia",
  "quality-olimpiad", "spotkania", "sciezka", "quality-materials",
  "zaliczenia-calendar", "all-tasks", "quality-stats",
];

const SETTINGS_SECTION: string[] = [
  "settings-section", "indigo-techniques", "school-settings",
  "access-control", "integrations", "reports",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper — builds a MenuAccessMap where every listed key is "active".
// Any key NOT in the list resolves to "hidden" (enforced in menuAccess.ts).
// ─────────────────────────────────────────────────────────────────────────────
function allow(...groups: string[][]): MenuAccessMap {
  const map: MenuAccessMap = {};
  for (const group of groups) {
    for (const key of group) {
      map[key] = { mode: "active" as MenuAccessMode };
    }
  }
  return map;
}

function block(...groups: string[][]): MenuAccessMap {
  const map: MenuAccessMap = {};
  for (const group of groups) {
    for (const key of group) {
      map[key] = { mode: "blocked" as MenuAccessMode };
    }
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role → menu access matrix
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_MENU_ACCESS: Record<AppRole, MenuAccessMap> = {

  // Full access — everything including admin settings
  "super-admin": allow(
    ALWAYS, SECRETARIAT, RECRUITMENT,
    FINANCE, ACCOUNTING, HR, TRAINER, QUALITY, SETTINGS_SECTION,
    IMPORT_DB_ACTIONS,
  ),

  // Full operational access including settings panel
  "admin": allow(
    ALWAYS, SECRETARIAT, RECRUITMENT,
    FINANCE, ACCOUNTING, HR, TRAINER, QUALITY, SETTINGS_SECTION,
    IMPORT_DB_ACTIONS,
  ),

  // Teacher — only import-db page (recruitment section)
  "teacher": allow(
    ["recruitment", "import-db"],
  ),

  // Sales / Recruitment department — only recruitment pages
  "sales": allow(
    ["recruitment", "new-students", "leads", "target-mail",
     "expelled", "new-groups", "archived", "import-db"],
  ),

  // Quality department — secretariat + recruitment + quality + import-db actions
  "quality": allow(
    SECRETARIAT, RECRUITMENT, IMPORT_DB_ACTIONS, QUALITY,
  ),

  // Finance & accounting + read-only students; no recruitment, no quality
  "finance": allow(
    ALWAYS, FINANCE, ACCOUNTING, ["secretariat", "students"],
  ),

  // Secretariat only — student/group/teacher management
  "secretariat": allow(
    ALWAYS, SECRETARIAT,
  ),

  // HR — groups, teachers + HR panel
  "hr": allow(
    ["secretariat", "groups", "teachers"],
    HR,
  ),
};
