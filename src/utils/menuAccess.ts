import {
  MENU_ACCESS_CONFIG,
  MENU_ROUTE_KEY_MAP,
  MENU_SECTION_ITEMS,
  type MenuAccessEntry,
  type MenuAccessMap,
  type MenuAccessMode,
} from "../config/menuAccess.config";

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

function resolveEntry(menuKey: string): MenuAccessEntry {
  const overrides = readOverrides();
  return overrides[menuKey] ?? MENU_ACCESS_CONFIG[menuKey] ?? { mode: "active" };
}

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
    { key: "dashboard", path: "/" },
    { key: "students", path: "/students" },
    { key: "new-students", path: "/recruitment/new-students" },
  ];

  const found = fallbackChecks.find((x) => isMenuAllowed(x.key));
  return found?.path ?? "/auth/sign-in";
}

// Optional helper for runtime overrides in browser devtools.
export function setMenuAccessOverrides(overrides: MenuAccessMap): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

