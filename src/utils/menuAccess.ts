import {
  MENU_ROUTE_KEY_MAP,
  MENU_SECTION_ITEMS,
  type MenuAccessMode,
} from "../config/menuAccess.config";
import { AUTHZ_BYPASS } from "../config/featureFlags";
import { useAuthStore } from "../stores/auth.store";
import { useAccessStore } from "../stores/access.store";

// ─────────────────────────────────────────────────────────────────────────────
// Core resolver — priority order:
//   1. Dev override (localStorage)          — highest priority
//   2. Role-based config (ROLE_MENU_ACCESS) — normal operation
//   3. Hidden                               — safe fallback (deny by default)
// ─────────────────────────────────────────────────────────────────────────────
function resolveMode(menuKey: string): MenuAccessMode {
  const auth = useAuthStore();
  const access = useAccessStore();

  // Temporary mode: keep auth checks, but skip role-based restrictions.
  if (AUTHZ_BYPASS && auth.isAuthenticated) {
    return "active";
  }

  // Пока не загружена матрица после refresh — не блокируем навигацию преждевременно.
  if (!access.initialized) return "active";

  return access.getMode(menuKey) as MenuAccessMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API (same surface as before — no changes needed in consumers)
// ─────────────────────────────────────────────────────────────────────────────
export function getMenuAccessMode(menuKey: string): MenuAccessMode {
  return resolveMode(menuKey);
}

export function getMenuAccessReason(menuKey: string): string {
  if (getMenuAccessMode(menuKey) === "hidden") {
    return "Раздел недоступен по текущим правам";
  }
  return "";
}

export function isMenuVisible(menuKey: string): boolean {
  return getMenuAccessMode(menuKey) !== "hidden";
}

export function isMenuAllowed(menuKey: string): boolean {
  return getMenuAccessMode(menuKey) !== "hidden";
}

export function isMenuBlocked(_menuKey: string): boolean {
  return false;
}

export function isSectionVisible(sectionKey: string): boolean {
  const items = MENU_SECTION_ITEMS[sectionKey] ?? [];
  if (!items.length) return isMenuVisible(sectionKey);
  if (isMenuVisible(sectionKey)) return true;
  return items.some((itemKey) => isMenuVisible(itemKey));
}

export function getMenuKeyByRouteName(routeName?: string | null): string | null {
  if (!routeName) return null;
  return MENU_ROUTE_KEY_MAP[routeName] ?? null;
}

export function getFirstAllowedFallbackPath(): string {
  const fallbackChecks: Array<{ key: string; path: string }> = [
    { key: "dashboard",    path: "/" },
    { key: "students",     path: "/students" },
    { key: "new-students", path: "/recruitment/space/new-students" },
    { key: "quality",      path: "/quality/monitoring" },
    { key: "trainer",      path: "/trainer/dashboard" },
    { key: "hr",           path: "/hr/active" },
  ];

  const found = fallbackChecks.find((x) => isMenuAllowed(x.key));
  return found?.path ?? "/auth/sign-in";
}

