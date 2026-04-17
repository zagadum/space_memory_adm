export type MenuAccessMode = "active" | "read-only" | "blocked" | "hidden";

export interface MenuAccessEntry {
  mode: MenuAccessMode;
  reason?: string;
}

export type MenuAccessMap = Record<string, MenuAccessEntry>;
//----- Управление отображение меню -
// Centralized menu access matrix.
// active  -> shown and allowed
// blocked -> shown but navigation is denied
// hidden  -> not shown and navigation is denied
export const MENU_ACCESS_CONFIG: MenuAccessMap = {
  "my-cabinet": { mode: "active" },
  "dashboard": { mode: "active" },

  // Secretariat
  "secretariat": { mode: "active" },
      "students": { mode: "active" },
      "groups": { mode: "active" },
      "teachers": { mode: "active" },
      "course-endings": { mode: "active" },

  // Recruitment
  recruitment: { mode: "active" },
      "new-students": { mode: "active" },
      "leads": { mode: "active" },
      "target-mail": { mode: "active" },
      "expelled": { mode: "active" },
      "new-groups": { mode: "active" },
      "archived": { mode: "active" },
      "import-db": { mode: "active" },
      "link-generator": { mode: "active" },

  // Finance / accounting
  finance: { mode: "active" },
      "accounting": { mode: "active" },
      "returns": { mode: "active" },
      "projects": { mode: "active" },
      "salary-calculator": { mode: "active" },
      "salary-demo": { mode: "active" },
      "settings": { mode: "active" },

  // Other sections
  hr: { mode: "active" },
  "trainer": { mode: "active" },
  "quality": { mode: "active" },
  "settings-section": { mode: "active" },
};

export const MENU_SECTION_ITEMS: Record<string, string[]> = {
  secretariat: ["students", "groups", "teachers", "course-endings"],
  hr: ["hr-active", "hr-training", "hr-pipeline", "hr-personal", "hr-analytics"],
  trainer: ["trainer-dashboard", "trainer-students", "trainer-groups", "lesson-tracker", "salary-demo", "trainer-materials", "trainer-exam", "trainer-mail"],
  recruitment: ["new-students", "leads", "target-mail", "expelled", "new-groups", "archived", "import-db", "link-generator"],
  finance: ["student-finance", "debtors", "nadplaty", "settings"],
  accounting: ["faktury", "returns", "projects", "salary-calculator", "finance-ustawienia"],
  quality: ["rezygnacje", "holidays-return", "quality-monitoring", "quality-analytics", "trial-lessons-qd", "quality-zaliczenia", "quality-olimpiad", "spotkania", "sciezka", "quality-materials", "zaliczenia-calendar", "all-tasks", "quality-stats"],
  "settings-section": ["indigo-techniques", "school-settings", "access-control", "integrations", "reports"],
};

export const MENU_ROUTE_KEY_MAP: Record<string, string> = {
   "dashboard": "dashboard",
   "my-cabinet": "my-cabinet",

   // ── Secretariat ──
   "students-list": "students",
   "groups-list": "groups",
   "teachers-list": "teachers",
   "course-endings": "course-endings",

   // ── Recruitment (Space + Indigo) ──
   "new-students": "new-students",
   "new-students-indigo": "new-students",
   "leads": "leads",
   "leads-indigo": "leads",
   "target-mail": "target-mail",
   "target-mail-indigo": "target-mail",
   "expelled-students": "expelled",
   "expelled-students-indigo": "expelled",
   "new-groups": "new-groups",
   "new-groups-indigo": "new-groups",
   "archived-students": "archived",
   "archived-students-indigo": "archived",
   "import-db": "import-db",
   "import-db-indigo": "import-db",
   "link-generator": "link-generator",
   "link-generator-indigo": "link-generator",

   // ── Finance ──
   "finance-students": "student-finance",
   "finance-debtors": "debtors",
   "finance-nadplaty": "nadplaty",
   "finance-returns": "returns",
   "settings": "settings",
   "finance-ustawienia": "finance-ustawienia",

   // ── Accounting ──
   "accounting-faktury": "faktury",
   "projects-list": "projects",
   "project-detail": "projects",
   "salary-calculator": "salary-calculator",

   // ── HR ──
   "hr-active": "hr-active",
   "hr-training": "hr-training",
   "hr-pipeline": "hr-pipeline",
   "hr-personal": "hr-personal",
   "hr-analytics": "hr-analytics",

   // ── Trainer ──
   "trainer-dashboard": "trainer-dashboard",
   "trainer-students": "trainer-students",
   "trainer-groups": "trainer-groups",
   "lesson-tracker": "lesson-tracker",
   "teacher-salary": "salary-demo",
   "trainer-tasks": "trainer",
   "trial-lesson": "trainer",
   "trial-month": "trainer",
   "trainer-zaliczenia": "trainer",
   "trainer-olimpiad": "trainer",
   "trainer-materials": "trainer-materials",
   "trainer-exam": "trainer-exam",
   "trainer-mail": "trainer-mail",

   // ── Quality ──
   "quality-rezygnacje": "rezygnacje",
   "quality-holidays": "holidays-return",
   "quality-monitoring": "quality-monitoring",
   "quality-analytics": "quality-analytics",
   "quality-trial": "trial-lessons-qd",
   "quality-zaliczenia": "quality-zaliczenia",
   "quality-olimpiad": "quality-olimpiad",
   "quality-spotkania": "spotkania",
   "quality-sciezka": "sciezka",
   "quality-materials": "quality-materials",
   "quality-zcalendar": "zaliczenia-calendar",
   "quality-all-tasks": "all-tasks",
   "quality-stats": "quality-stats",

   // ── Student profile tabs ──
   "student-payments": "students",
   "student-groups": "students",
   "student-info": "students",
   "student-attendance": "students",
   "student-progress": "students",
   "student-notes": "students",

   // ── Settings ──
   "settings-root": "settings-section",
   "access-control": "access-control",
};
