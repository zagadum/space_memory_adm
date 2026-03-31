import {
  MENU_ROUTE_KEY_MAP,
  MENU_SECTION_ITEMS,
  type MenuAccessEntry,
  type MenuAccessMap,
  type MenuAccessMode,
} from "../config/menuAccess.config";
import { AUTHZ_BYPASS } from "../config/featureFlags";
import { normalizeRole, ROLE_MENU_ACCESS } from "../config/roleMenuAccess.config";
import { useAuthStore } from "../stores/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// Dev-only localStorage overrides
// Usage in browser console:
//   import { setMenuAccessOverrides } from '@/utils/menuAccess'
//   setMenuAccessOverrides({ quality: { mode: 'active' } })
// ─────────────────────────────────────────────────────────────────────────────
const OVERRIDES_KEY = "menu_access_overrides";

function readOverrides(): MenuAccessMap {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MenuAccessMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core resolver — priority order:
//   1. Dev override (localStorage)          — highest priority
//   2. Role-based config (ROLE_MENU_ACCESS) — normal operation
//   3. Hidden                               — safe fallback (deny by default)
// ─────────────────────────────────────────────────────────────────────────────
function resolveEntry(menuKey: string): MenuAccessEntry {
  const auth = useAuthStore();

  // Temporary mode: keep auth checks, but skip role-based restrictions.
  if (AUTHZ_BYPASS && auth.isAuthenticated) {
    return { mode: "active" };
  }

  // 1. Dev override
  const overrides = readOverrides();
  if (overrides[menuKey]) return overrides[menuKey];

  // 2. Role-based lookup
  const role = normalizeRole(auth.user?.role);
  if (role) {
    const roleMap = ROLE_MENU_ACCESS[role];
    return roleMap[menuKey] ?? { mode: "hidden" };
  }

  // 3. No user / unknown role → deny everything
  return { mode: "hidden" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API (same surface as before — no changes needed in consumers)
// ─────────────────────────────────────────────────────────────────────────────
export function getMenuAccessMode(menuKey: string): MenuAccessMode {
  return resolveEntry(menuKey).mode;
}

export function getMenuAccessReason(menuKey: string): string {
  return resolveEntry(menuKey).reason ?? "";
}

export function isMenuVisible(menuKey: string): boolean {
  return getMenuAccessMode(menuKey) !== "hidden";
}

export function isMenuAllowed(menuKey: string): boolean {
  return getMenuAccessMode(menuKey) === "active";
}

export function isMenuBlocked(menuKey: string): boolean {
  return getMenuAccessMode(menuKey) === "blocked";
}

export function isSectionVisible(sectionKey: string): boolean {
  if (!isMenuVisible(sectionKey)) return false;
  const items = MENU_SECTION_ITEMS[sectionKey] ?? [];
  if (!items.length) return true;
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

// Optional helper for runtime overrides in browser devtools.
export function setMenuAccessOverrides(overrides: MenuAccessMap): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function clearMenuAccessOverrides(): void {
  localStorage.removeItem(OVERRIDES_KEY);
}
