import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import SignInPage from "../views/auth/SignInPage.vue";
import StudentListPage from "../views/students/StudentListPage.vue";
import StudentProfilePage from "../views/students/StudentProfilePage.vue";
import NewGroupsPage from "../views/groups/NewGroupsPage.vue";

import PaymentsTab from "../views/students/components/profile-tabs/PaymentsTab.vue";
import GroupsTab from "../views/students/components/profile-tabs/GroupsTab.vue";
import InfoTab from "../views/students/components/profile-tabs/InfoTab.vue";
import AttendanceTab from "../views/students/components/profile-tabs/AttendanceTab.vue";
import ProgressTab from "../views/students/components/profile-tabs/ProgressTab.vue";
import NotesTab from "../views/students/components/profile-tabs/NotesTab.vue";

import { useAuthStore } from "../stores/auth.store";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      component: AuthLayout,
      meta: { public: true },
      children: [{ path: "sign-in", name: "sign-in", component: SignInPage }],
    },
    {
      path: "/",
      component: AppLayout,
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
          component: StudentListPage,
          meta: { title: 'studentList.title', subTitle: 'studentList.secretariat', icon: '👩‍🚀' }
        },
        {
          path: "recruitment/new-groups",
          name: "new-groups",
          component: NewGroupsPage,
          meta: { title: 'sidebar.newGroups', icon: '🚀' }
        },
        {
          path: "finance/settings",
          name: "settings",
          component: () => import("../views/finance/settings/SettingsIndex.vue"),
          meta: { title: 'financeSettings.pageTitle', subTitle: 'financeSettings.pageSubTitle', icon: '⚙️' }
        },
        {
          path: "students/:id",
          component: StudentProfilePage,
          children: [
            { path: "", redirect: { name: "student-payments" } },
            { path: "payments", name: "student-payments", component: PaymentsTab },
            { path: "groups", name: "student-groups", component: GroupsTab },
            { path: "info", name: "student-info", component: InfoTab },
            { path: "attendance", name: "student-attendance", component: AttendanceTab },
            { path: "progress", name: "student-progress", component: ProgressTab },
            { path: "notes", name: "student-notes", component: NotesTab },
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
