import type { Router } from "vue-router";

let isCriticalRoutesPreloaded = false;

const criticalRouteLoaders = [
  () => import("../views/dashboard/DashboardIndex.vue"),
  () => import("../views/students/StudentListPage.vue"),
];

type IdleHost = typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
};

function scheduleIdle(task: () => void) {
  const host = globalThis as IdleHost;

  if (typeof host.requestIdleCallback === "function") {
    host.requestIdleCallback(() => task(), { timeout: 1200 });
    return;
  }

  setTimeout(task, 350);
}

function shouldPreload(): boolean {
  if (typeof navigator === "undefined") return false;

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (connection?.saveData) return false;
  if (connection?.effectiveType?.includes("2g")) return false;

  return true;
}

function preloadCriticalRoutes() {
  if (isCriticalRoutesPreloaded) return;
  isCriticalRoutesPreloaded = true;

  void Promise.allSettled(criticalRouteLoaders.map((load) => load()));
}

export function setupCriticalRoutePreload(router: Router) {
  if (!shouldPreload()) return;

  void router.isReady().then(() => {
    const currentRoute = router.currentRoute.value;

    if (!currentRoute.meta.public) {
      scheduleIdle(preloadCriticalRoutes);
      return;
    }

    const removeAfterEach = router.afterEach((to) => {
      if (to.meta.public) return;
      removeAfterEach();
      scheduleIdle(preloadCriticalRoutes);
    });
  });
}

