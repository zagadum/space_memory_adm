import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "../stores/auth.store";

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
          meta: { title: 'studentList.title', subTitle: 'studentList.secretariat', icon: '👩‍🚀' }
        },
        {
          path: "recruitment/new-students",
          name: "new-students",
          component: () => import("../views/recruitment/NewStudentsPage.vue"),
          meta: { title: 'newStudents.pageTitle', icon: '🌟' }
        },
        {
          path: "recruitment/leads",
          name: "leads",
          component: () => import("../views/recruitment/LeadsPage.vue"),
          meta: { title: 'sidebar.leads', icon: '📋' }
        },
        {
          path: 'recruitment/expelled-students',
          name: 'expelled-students',
          component: () => import('../views/recruitment/ExpelledStudentsPage.vue'),
          meta: { title: 'expelled.pageTitle', icon: '📤' }
        },
        {
          path: "recruitment/new-groups",
          name: "new-groups",
          component: () => import("../views/groups/NewGroupsPage.vue"),
          meta: { title: 'sidebar.newGroups', icon: '🚀' }
        },
        {
          path: 'recruitment/archived-students',
          name: 'archived-students',
          component: () => import('../views/recruitment/ArchivedStudentsPage.vue'),
          meta: { title: 'archived.pageTitle', icon: '🗃️' }
        },
        {
          path: "finance/returns",
          name: "finance-returns",
          component: () => import("../views/finance/ZwrotyView.vue"),
          meta: { title: 'Zwroty', icon: '↩️' }
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
          meta: { title: 'projects.title', subTitle: 'projects.subTitle', icon: '📁' }
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
          meta: { title: 'groupsList.pageTitle', subTitle: 'groupsList.pageSubTitle', icon: '🎓' }
        },
        {
          path: 'teachers',
          name: 'teachers-list',
          component: () => import('../views/teachers/TeachersListPage.vue'),
          meta: { title: 'teachersList.pageTitle', subTitle: 'teachersList.pageSubTitle', icon: '👨‍🏫' }
        },
        { path: 'hr/active', name: 'hr-active', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'hr/training', name: 'hr-training', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'hr/pipeline', name: 'hr-pipeline', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'hr/personal', name: 'hr-personal', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'hr/analytics', name: 'hr-analytics', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/dashboard', name: 'trainer-dashboard', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/students', name: 'trainer-students', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/groups', name: 'trainer-groups', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/lesson-tracker', name: 'lesson-tracker', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/tasks', name: 'trainer-tasks', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/trial-lesson', name: 'trial-lesson', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/trial-month', name: 'trial-month', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/zaliczenia', name: 'trainer-zaliczenia', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/olimpiad', name: 'trainer-olimpiad', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/materials', name: 'trainer-materials', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/exam', name: 'trainer-exam', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'trainer/mail', name: 'trainer-mail', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'secretariat/course-endings', name: 'course-endings', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'finance/students', name: 'finance-students', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'finance/debtors', name: 'finance-debtors', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'finance/nadplaty', name: 'finance-nadplaty', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'finance/settings-ustawienia', name: 'finance-ustawienia', component: () => import('../views/finance/settings/SettingsIndex.vue') },
        { path: 'accounting/faktury', name: 'accounting-faktury', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/rezygnacje', name: 'quality-rezygnacje', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/holidays-return', name: 'quality-holidays', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/monitoring', name: 'quality-monitoring', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/analytics', name: 'quality-analytics', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/trial-lessons', name: 'quality-trial', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/zaliczenia', name: 'quality-zaliczenia', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/olimpiad', name: 'quality-olimpiad', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/spotkania', name: 'quality-spotkania', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/sciezka', name: 'quality-sciezka', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/materials', name: 'quality-materials', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/zaliczenia-calendar', name: 'quality-zcalendar', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/all-tasks', name: 'quality-all-tasks', component: () => import('../views/dashboard/DashboardIndex.vue') },
        { path: 'quality/stats', name: 'quality-stats', component: () => import('../views/dashboard/DashboardIndex.vue') }
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/students" },
  ],
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  const auth = useAuthStore();
  if (!auth.isAuthenticated) return { name: "sign-in" };
  return true;
});
