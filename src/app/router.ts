import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import PaymentsTab from "../tabs/PaymentsTab.vue";
import GroupsTab from "../tabs/GroupsTab.vue";
import InfoTab from "../tabs/InfoTab.vue";
import AttendanceTab from "../tabs/AttendanceTab.vue";
import ProgressTab from "../tabs/ProgressTab.vue";
import NotesTab from "../tabs/NotesTab.vue";
import SignInPage from "../tabs/SignInPage.vue";
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
        { path: "", redirect: "/payments" },
        { path: "payments", name: "payments", component: PaymentsTab },
        { path: "groups", name: "groups", component: GroupsTab },
        { path: "info", name: "info", component: InfoTab },
        { path: "attendance", name: "attendance", component: AttendanceTab },
        { path: "progress", name: "progress", component: ProgressTab },
        { path: "notes", name: "notes", component: NotesTab },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/payments" },
  ],
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  const auth = useAuthStore();
  if (!auth.isAuthenticated) return { name: "sign-in" };
  return true;
});
