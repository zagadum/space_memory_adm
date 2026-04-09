import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "../stores/auth.store";
import { useAccessStore } from "../stores/access.store";
import { useNotificationStore } from "../stores/notification.store";
import { useGlobalSearchStore } from "../stores/globalSearch.store";
import { getMenuAccessMode, getMenuAccessReason, getMenuKeyByRouteName } from "../utils/menuAccess";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      component: () => import("../layouts/AuthLayout.vue"),
      meta: { public: true },
      children: [
        {
          path: "sign-in",
          name: "sign-in",
          component: () => import("../views/auth/SignInPage.vue"),
        },
      ],
    },
    {
      path: "/change-password",
      name: "change-password",
      component: () => import("../views/auth/ChangePasswordPage.vue"),
      meta: { requiresPasswordChange: true },
    },
    {
      path: "/",
      component: () => import("../layouts/AppLayout.vue"),
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("../views/dashboard/DashboardIndex.vue"),
          meta: { title: 'sidebar.dashboard', icon: '📊' }
        },
        { path: "dashboard", redirect: { name: "dashboard" } },
        {
          path: "students",
          name: "students-list",
          component: () => import("../views/students/StudentListPage.vue"),
          meta: { title: 'studentList.title', subTitle: 'studentList.secretariat', icon: '👩‍🚀', searchPlaceholder: 'search.students' }
        },
        {
          path: "recruitment/space/new-students",
          name: "new-students",
          component: () => import("../views/recruitment/NewStudentsPage.vue"),
          meta: { title: 'newStudents.pageTitle', icon: '🌟', recruitmentBackend: 'default' }
        },
        {
          path: "recruitment/space/leads",
          name: "leads",
          component: () => import("../views/recruitment/LeadsPage.vue"),
          meta: { title: 'sidebar.leads', icon: '📋', recruitmentBackend: 'default', searchPlaceholder: 'search.leads' }
        },
        {
          path: "recruitment/space/target-mail",
          name: "target-mail",
          component: () => import("../views/recruitment/TargetMailPage.vue"),
          meta: { title: 'targetMail.pageTitle', icon: '✉️', recruitmentBackend: 'default' }
        },
        {
          path: 'recruitment/space/expelled-students',
          name: 'expelled-students',
          component: () => import('../views/recruitment/ExpelledStudentsPage.vue'),
          meta: { title: 'expelled.pageTitle', icon: '📤', recruitmentBackend: 'default', searchPlaceholder: 'search.expelled' }
        },
        {
          path: "recruitment/space/new-groups",
          name: "new-groups",
          component: () => import("../views/groups/NewGroupsPage.vue"),
          meta: { title: 'sidebar.newGroups', icon: '🚀', recruitmentBackend: 'default', searchPlaceholder: 'search.newGroups' }
        },
        {
          path: 'recruitment/space/archived-students',
          name: 'archived-students',
          component: () => import('../views/recruitment/ArchivedStudentsPage.vue'),
          meta: { title: 'archived.pageTitle', icon: '🗃️', recruitmentBackend: 'default', searchPlaceholder: 'search.archived' }
        },
        { path: 'recruitment/space', redirect: { name: 'new-students' } },
        { path: 'recruitment/new-students', redirect: { name: 'new-students' } },
        { path: 'recruitment/leads', redirect: { name: 'leads' } },
        { path: 'recruitment/target-mail', redirect: { name: 'target-mail' } },
        { path: 'recruitment/expelled-students', redirect: { name: 'expelled-students' } },
        { path: 'recruitment/new-groups', redirect: { name: 'new-groups' } },
        { path: 'recruitment/archived-students', redirect: { name: 'archived-students' } },
        {
          path: "recruitment/indigo/new-students",
          name: "new-students-indigo",
          component: () => import("../views/recruitment/NewStudentsPage.vue"),
          meta: { title: 'newStudents.pageTitle', icon: '🌟', recruitmentBackend: 'indigo' }
        },
        {
          path: "recruitment/indigo/leads",
          name: "leads-indigo",
          component: () => import("../views/recruitment/LeadsPage.vue"),
          meta: { title: 'sidebar.leads', icon: '📋', recruitmentBackend: 'indigo', searchPlaceholder: 'search.leads' }
        },
        {
          path: "recruitment/indigo/target-mail",
          name: "target-mail-indigo",
          component: () => import("../views/recruitment/TargetMailPage.vue"),
          meta: { title: 'targetMail.pageTitle', icon: '✉️', recruitmentBackend: 'indigo' }
        },
        {
          path: 'recruitment/indigo/expelled-students',
          name: 'expelled-students-indigo',
          component: () => import('../views/recruitment/ExpelledStudentsPage.vue'),
          meta: { title: 'expelled.pageTitle', icon: '📤', recruitmentBackend: 'indigo', searchPlaceholder: 'search.expelled' }
        },
        {
          path: "recruitment/indigo/new-groups",
          name: "new-groups-indigo",
          component: () => import("../views/groups/NewGroupsPage.vue"),
          meta: { title: 'sidebar.newGroups', icon: '🚀', recruitmentBackend: 'indigo', searchPlaceholder: 'search.newGroups' }
        },
        {
          path: 'recruitment/indigo/archived-students',
          name: 'archived-students-indigo',
          component: () => import('../views/recruitment/ArchivedStudentsPage.vue'),
          meta: { title: 'archived.pageTitle', icon: '🗃️', recruitmentBackend: 'indigo', searchPlaceholder: 'search.archived' }
        },
        {
          path: "recruitment/space/import-db",
          name: "import-db",
          component: () => import("../views/recruitment/ImportDbPage.vue"),
          meta: { title: 'importDb.pageTitle', icon: '📥', recruitmentBackend: 'default' }
        },
        {
          path: "recruitment/indigo/import-db",
          name: "import-db-indigo",
          component: () => import("../views/recruitment/ImportDbPage.vue"),
          meta: { title: 'importDb.pageTitle', icon: '📥', recruitmentBackend: 'indigo' }
        },
        { path: 'recruitment/import-db', redirect: { name: 'import-db' } },
        { path: 'recruitment/indigo', redirect: { name: 'new-students-indigo' } },
        {
          path: "finance/returns",
          name: "finance-returns",
          component: () => import("../views/finance/ZwrotyView.vue"),
          meta: { title: 'Zwroty', icon: '↩️', searchPlaceholder: 'search.zwroty' }
        },
        {
          path: "finance/cohorts",
          name: "finance-cohorts",
          component: () => import("../views/finance/CohortAnalysisPage.vue"),
          meta: { title: 'cohorts.title', icon: '📊' }
        },
        {
          path: "finance/settings",
          name: "settings",
          component: () => import("../views/finance/settings/SettingsIndex.vue"),
          meta: { title: 'financeSettings.pageTitle', subTitle: 'financeSettings.pageSubTitle', icon: '⚙️' }
        },
        {
          path: "finance/salary-calculator",
          name: "salary-calculator",
          component: () => import("../views/finance/SalaryCalculatorView.vue"),
          meta: { title: 'sidebar.salaryCalculator', icon: '📊' }
        },
        {
          path: "projects",
          name: "projects-list",
          component: () => import("../views/projects/ProjectsListPage.vue"),
          meta: { title: 'projects.title', subTitle: 'projects.subTitle', icon: '📁', searchPlaceholder: 'search.projects' }
        },
        {
          path: "projects/:id",
          name: "project-detail",
          component: () => import("../views/projects/ProjectDetailView.vue"),
          meta: { title: 'projectDetail.title', icon: '📁' }
        },
        {
          path: "payments/:id",
          component: () => import("../views/students/StudentProfilePage.vue"),
          children: [
            { path: "", redirect: { name: "student-payments" } },
            { path: "payments", name: "student-payments", component: () => import("../views/students/components/profile-tabs/PaymentsTab.vue") },
            { path: "groups", name: "student-groups", component: () => import("../views/students/components/profile-tabs/GroupsTab.vue") },
            { path: "info", name: "student-info", component: () => import("../views/students/components/profile-tabs/InfoTab.vue") },
            { path: "attendance", name: "student-attendance", component: () => import("../views/students/components/profile-tabs/AttendanceTab.vue") },
            { path: "progress", name: "student-progress", component: () => import("../views/students/components/profile-tabs/ProgressTab.vue") },
            { path: "notes", name: "student-notes", component: () => import("../views/students/components/profile-tabs/NotesTab.vue") },
          ],
        },
        {
          path: "teacher/salary",
          name: "teacher-salary",
          component: () => import("../views/teacher/TeacherSalaryPage.vue"),
          meta: { title: 'teacherSalary.pageTitle', icon: '💰' }
        },
        // ─── Stub routes for new sidebar sections ───
        { path: 'my-cabinet', name: 'my-cabinet', component: () => import('../views/dashboard/DashboardIndex.vue') },
        {
          path: 'groups',
          name: 'groups-list',
          component: () => import('../views/groups/GroupsListPage.vue'),
          meta: { title: 'groupsList.pageTitle', subTitle: 'groupsList.pageSubTitle', icon: '🎓', searchPlaceholder: 'search.groups' }
        },
        {
          path: 'teachers',
          name: 'teachers-list',
          component: () => import('../views/teachers/TeachersListPage.vue'),
          meta: { title: 'teachersList.pageTitle', subTitle: 'teachersList.pageSubTitle', icon: '👨‍🏫', searchPlaceholder: 'search.teachers' }
        },
        { path: 'hr/active', name: 'hr-active', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'hr/training', name: 'hr-training', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'hr/pipeline', name: 'hr-pipeline', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'hr/personal', name: 'hr-personal', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'hr/analytics', name: 'hr-analytics', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/dashboard', name: 'trainer-dashboard', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/students',  name: 'trainer-students',  component: () => import('../views/teacher/TrainerStudentsPage.vue'), meta: { title: 'trainerStudents.title', icon: '👨‍🎓', searchPlaceholder: 'search.trainerStudents' } },
        { path: 'trainer/groups',    name: 'trainer-groups',    component: () => import('../views/teacher/TrainerGroupsPage.vue'),   meta: { title: 'trainerGroups.title',   icon: '👥', searchPlaceholder: 'search.trainerGroups' } },
        { path: 'trainer/lesson-tracker', name: 'lesson-tracker', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/tasks', name: 'trainer-tasks', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/trial-lesson', name: 'trial-lesson', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/trial-month', name: 'trial-month', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/zaliczenia', name: 'trainer-zaliczenia', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/olimpiad', name: 'trainer-olimpiad', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/materials', name: 'trainer-materials', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/exam', name: 'trainer-exam', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'trainer/mail', name: 'trainer-mail', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'secretariat/course-endings', name: 'course-endings', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'finance/students', name: 'finance-students', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'finance/debtors', name: 'finance-debtors', component: () => import('../views/finance/DebtorsPage.vue'), meta: { title: 'finance.debtors', icon: '🔴' } },
        { path: 'finance/nadplaty', name: 'finance-nadplaty', component: () => import('../views/finance/OverpaymentsPage.vue'), meta: { title: 'finance.overpayments', icon: '🟢' } },
        { path: 'finance/contractors', name: 'finance-contractors', component: () => import('../views/finance/ContractorsListPage.vue'), meta: { title: 'sidebar.contractors', icon: '🏢' } },
        { path: 'finance/settings-ustawienia', name: 'finance-ustawienia', component: () => import('../views/finance/settings/SettingsIndex.vue') },
        { path: 'accounting/faktury', name: 'accounting-faktury', component: () => import('../views/accounting/InvoicesListPage.vue'), meta: { title: 'sidebar.faktury', icon: '🧾' } },
        { path: 'quality/rezygnacje', name: 'quality-rezygnacje', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/holidays-return', name: 'quality-holidays', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/monitoring', name: 'quality-monitoring', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/analytics', name: 'quality-analytics', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/trial-lessons', name: 'quality-trial', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/zaliczenia', name: 'quality-zaliczenia', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/olimpiad', name: 'quality-olimpiad', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/spotkania', name: 'quality-spotkania', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/sciezka', name: 'quality-sciezka', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/materials', name: 'quality-materials', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/zaliczenia-calendar', name: 'quality-zcalendar', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/all-tasks', name: 'quality-all-tasks', component: () => import('../views/errors/ComingSoonPage.vue') },
        { path: 'quality/stats', name: 'quality-stats', component: () => import('../views/errors/ComingSoonPage.vue') },
        // ─── Settings ───
        {
          path: 'settings',
          name: 'settings-root',
          redirect: { name: 'access-control' }
        },
        // ─── SuperAdmin: Access Control ───
        {
          path: 'settings/access-control',
          name: 'access-control',
          component: () => import('../views/settings/AccessControlPage.vue'),
          meta: { title: 'accessControl.title', icon: '🔐', roles: ['super-admin'] },
        },
        // ─── Error pages ───
        {
          path: '403',
          name: 'access-denied',
          component: () => import('../views/errors/AccessDeniedPage.vue'),
          meta: { title: 'accessDenied.title' },
        },
      ],
    },
    // Catch-all: 404 → proper "not found" page
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import('../views/errors/NotFoundPage.vue'),
      meta: { title: 'notFound.subtitle' },
    },
  ],
});

router.beforeEach(async (to, from) => {
  // Очищаем глобальный поиск при навигации между страницами
  if (to.name !== from.name) {
    try {
      const searchStore = useGlobalSearchStore();
      searchStore.clear();
    } catch {
      // Store может быть ещё не инициализирован
    }
  }

  if (to.meta.public) return true;

  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    return {
      name: "sign-in",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  const accessStore = useAccessStore();
  if (!accessStore.initialized) {
    if (!auth.user) {
      await auth.loadMe();
    } else {
      await accessStore.initAfterLogin();
    }
  }

  // Если пользователь должен сменить пароль — пропускаем только /change-password
  if ((auth.user as any)?.forcePasswordChange && to.name !== 'change-password' && to.name !== 'access-denied') {
    return { name: 'change-password' };
  }

  // Доступ к /403 и /change-password разрешён всегда после авторизации
  if (to.name === 'access-denied' || to.name === 'change-password') return true;

  const menuKey = getMenuKeyByRouteName(String(to.name || ""));
  if (menuKey && getMenuAccessMode(menuKey) === "hidden") {
    // Если дашборд скрыт, редиректим на учеников вместо 403
    if (to.name === 'dashboard' || to.path === '/') {
      return { name: 'students-list' };
    }

    // Показываем причину отказа через тост
    const reason = getMenuAccessReason(menuKey);
    try {
      const notification = useNotificationStore();
      notification.addToast(reason || "Раздел недоступен по текущим правам", "warning");
    } catch {
      // Router guard работает даже без notification store
    }
    // Редиректим на 403 вместо тихого fallback
    return { name: 'access-denied' };
  }

  return true;
});
