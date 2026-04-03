import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { accessControlApi, type AccessMatrix, type AccessMode } from "../api/accessControlApi";
import { ROLE_MENU_ACCESS, normalizeRole } from "../config/roleMenuAccess.config";

const DEFAULT_MODE: AccessMode = "hidden";

const LEGACY_RESOURCE_ALIASES: Record<string, string> = {
  "student-list": "students",
  "group-list": "groups",
  "settings-access-control": "access-control",
};

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
      matrix.value = normalizeMatrix(data.matrix ?? {});
      role.value = data.role ?? "";
      version.value = Number(data.version || 0);
      initialized.value = true;
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

