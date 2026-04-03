import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { accessControlApi, type AccessMatrix, type AccessMode } from "../api/accessControlApi";

const DEFAULT_MODE: AccessMode = "hidden";

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
      matrix.value = data.matrix ?? {};
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
    return matrix.value[resource] ?? DEFAULT_MODE;
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
    matrix.value = next;
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

