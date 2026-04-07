import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { accessControlApi, type AccessMatrix, type AccessMode } from "../api/accessControlApi";
import { ROLE_MENU_ACCESS, normalizeRole } from "../config/roleMenuAccess.config";
import { MENU_ROUTE_KEY_MAP, MENU_SECTION_ITEMS } from "../config/menuAccess.config";

const DEFAULT_MODE: AccessMode = "hidden";

const LEGACY_RESOURCE_ALIASES: Record<string, string> = {
  "student-list": "students",
  "group-list": "groups",
  "settings-access-control": "access-control",
};

const DEV_DIAG_CACHE = new Set<string>();

function getExpectedResourceKeys(): string[] {
  const fromRoutes = Object.values(MENU_ROUTE_KEY_MAP);
  const fromSections = Object.entries(MENU_SECTION_ITEMS).flatMap(([section, items]) => [section, ...items]);
  return Array.from(new Set(["dashboard", "my-cabinet", ...fromRoutes, ...fromSections]));
}

function withPrivilegedFullAccess(input: AccessMatrix, role: string): AccessMatrix {
  const normalized = normalizeRole(role);
  if (normalized !== "admin" && normalized !== "super-admin") return input;

  // Admin/super-admin: ensure all known resource keys are "active"
  // The backend should already return full access, but this is a safety net
  const next: AccessMatrix = { ...input };
  for (const key of getExpectedResourceKeys()) {
    next[key] = "active";
  }
  return next;
}

function logMissingResourceKeysDev(matrix: AccessMatrix, role: string): void {
  if (!import.meta.env.DEV) return;

  const expected = getExpectedResourceKeys();
  const missing = expected.filter((key) => !(key in matrix));
  if (!missing.length) return;

  const signature = `${role}::${missing.sort().join(",")}`;
  if (DEV_DIAG_CACHE.has(signature)) return;
  DEV_DIAG_CACHE.add(signature);

  console.warn("[access-control] /me/access-control missing resource_key", {
    role,
    missing,
    expectedCount: expected.length,
    receivedCount: Object.keys(matrix).length,
  });
}

function normalizeMatrix(raw: AccessMatrix): AccessMatrix {
  const result: AccessMatrix = {};
  for (const [key, mode] of Object.entries(raw || {})) {
    const canonical = LEGACY_RESOURCE_ALIASES[key] ?? key;
    result[canonical] = mode;
  }
  return result;
}

export const useAccessStore = defineStore("access", () => {
  const matrix = ref<AccessMatrix>({});
  const role = ref("");
  const version = ref(0);
  const initialized = ref(false);
  const loading = ref(false);

  const hasMatrix = computed(() => Object.keys(matrix.value).length > 0);

  async function initAfterLogin() {
    if (loading.value) return;
    loading.value = true;
    try {
      const data = await accessControlApi.getMyAccessControl();
      
      const normalizedMatrix = normalizeMatrix(data.matrix ?? {});
      logMissingResourceKeysDev(normalizedMatrix, data.role ?? "");
      
      matrix.value = withPrivilegedFullAccess(normalizedMatrix, data.role ?? "");
      role.value = data.role ?? "";
      version.value = Number(data.version || 0);
      initialized.value = true;
    } catch (err) {
      console.error('[AccessStore] Failed to init:', err);
    } finally {
      loading.value = false;
    }
  }

  async function reload() {
    await initAfterLogin();
  }

  function clear() {
    matrix.value = {};
    role.value = "";
    version.value = 0;
    initialized.value = false;
  }

  function getMode(resource: string): AccessMode {
    const canonical = LEGACY_RESOURCE_ALIASES[resource] ?? resource;
    const direct = matrix.value[canonical];
    if (direct) return direct;

    // Если backend прислал неполную матрицу, берём безопасный fallback из role-конфига.
    const normalized = normalizeRole(role.value);
    if (normalized === "admin" || normalized === "super-admin") return "active";
    if (normalized) {
      const fallback = ROLE_MENU_ACCESS[normalized]?.[canonical]?.mode;
      if (fallback === "active") return "active";
    }

    return DEFAULT_MODE;
  }

  function canAccess(resource: string): boolean {
    return getMode(resource) !== "hidden";
  }

  function canEdit(resource: string): boolean {
    return getMode(resource) === "active";
  }

  function isHidden(resource: string): boolean {
    return getMode(resource) === "hidden";
  }

  function applyMatrix(next: AccessMatrix, nextVersion?: number) {
    matrix.value = normalizeMatrix(next);
    if (typeof nextVersion === "number") version.value = nextVersion;
    initialized.value = true;
  }

  return {
    matrix,
    role,
    version,
    initialized,
    loading,
    hasMatrix,
    initAfterLogin,
    reload,
    clear,
    getMode,
    canAccess,
    canEdit,
    isHidden,
    applyMatrix,
  };
});

