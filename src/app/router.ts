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
          path: "recruitment/leads",
          name: "leads",
          component: () => import("../views/recruitment/LeadsPage.vue"),
          meta: { title: 'sidebar.leads', icon: '📋' }
        },
        {
          path: "recruitment/new-groups",
          name: "new-groups",
          component: () => import("../views/groups/NewGroupsPage.vue"),
          meta: { title: 'sidebar.newGroups', icon: '🚀' }
        },
        {
          path: "finance/settings",
          name: "settings",
          component: () => import("../views/finance/settings/SettingsIndex.vue"),
          meta: { title: 'financeSettings.pageTitle', subTitle: 'financeSettings.pageSubTitle', icon: '⚙️' }
        },
        {
          path: "projects",
          name: "projects-list",
          component: () => import("../views/projects/ProjectsListPage.vue"),
          meta: { title: 'projects.title', subTitle: 'projects.subTitle', icon: '📁' }
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
