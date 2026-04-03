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
  "secretariat": { mode: "hidden" },
      "students": { mode: "hidden" },
      "groups": { mode: "hidden" },
      "teachers": { mode: "hidden" },
      "course-endings": { mode: "hidden" },

  // Recruitment
  recruitment: { mode: "active" },
      "new-students": { mode: "active" },
      "leads": { mode: "active" },
      "target-mail": { mode: "active" },
      "expelled": { mode: "active" },
      "new-groups": { mode: "active" },
      "archived": { mode: "active" },
      "import-db": { mode: "active" },

  // Finance / accounting
  finance: { mode: "active" },
      "accounting": { mode: "active" },
      "returns": { mode: "active" },
      "projects": { mode: "active" },
      "salary-calculator": { mode: "active" },
      "salary-demo": { mode: "active" },
      "settings": { mode: "active" },

  // Other sections
  hr: { mode: "hidden" },
  "trainer": { mode: "hidden" },
  "quality": { mode: "hidden" },
  "settings-section": { mode: "hidden" },
};

export const MENU_SECTION_ITEMS: Record<string, string[]> = {
  secretariat: ["students", "groups", "teachers", "course-endings"],
  hr: ["hr-active", "hr-training", "hr-pipeline", "hr-personal", "hr-analytics"],
  trainer: ["trainer-dashboard", "trainer-students", "trainer-groups", "lesson-tracker", "salary-demo", "trainer-materials", "trainer-exam", "trainer-mail"],
  recruitment: ["new-students", "leads", "target-mail", "expelled", "new-groups", "archived", "import-db"],
  finance: ["student-finance", "debtors", "nadplaty", "settings"],
  accounting: ["faktury", "returns", "projects", "salary-calculator", "finance-ustawienia"],
  quality: ["rezygnacje", "holidays-return", "quality-monitoring", "quality-analytics", "trial-lessons-qd", "quality-zaliczenia", "quality-olimpiad", "spotkania", "sciezka", "quality-materials", "zaliczenia-calendar", "all-tasks", "quality-stats"],
  "settings-section": ["indigo-techniques", "school-settings", "access-control", "integrations", "reports"],
};

export const MENU_ROUTE_KEY_MAP: Record<string, string> = {
   "dashboard": "dashboard",
   "my-cabinet": "my-cabinet",
   "students-list": "students",
   "groups-list": "groups",
   "teachers-list": "teachers",
   "course-endings": "course-endings",

   "new-students": "new-students",
   "new-students-indigo": "new-students",
   leads: "leads",
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

   "finance-returns": "returns",
   "projects-list": "projects",
   "project-detail": "projects",
   "salary-calculator": "salary-calculator",
   "teacher-salary": "salary-demo",
   settings: "settings",
};

