import { defineStore } from "pinia";
import { authApi } from "../api/authApi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  teacherId?: number;   // ID преподавателя — приходит с бэкенда для роли teacher
  forcePasswordChange?: boolean; // true = требует смены пароля после первого входа
}

import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // ── State ──
  const token = ref<string | null>(localStorage.getItem("token") || null);
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref("");

  // ── Getters ──
  const isAuthenticated = computed(() => !!token.value);

  // ── Actions ──
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function updateProfile(data: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...data };
      if (!user.value.initials && user.value.email) {
        user.value.initials = user.value.email.substring(0, 2).toUpperCase();
      }
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true;
    error.value = "";
    try {
      const res = await authApi.signIn({ email, password });
      setToken(res.token);
      if (!res.user.initials && res.user.email) {
        res.user.initials = res.user.email.substring(0, 2).toUpperCase();
      }
      user.value = res.user as User;

      // Если поставлен флаг — router guard сам сделает редирект на /change-password
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.message || "Sign in failed";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function loadMe() {
    if (!token.value) return;
    try {
      const u = await authApi.me();
      if (!u.initials && u.email) {
        u.initials = u.email.substring(0, 2).toUpperCase();
      }
      user.value = u;
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    setToken,
    updateProfile,
    signIn,
    loadMe,
    logout,
  };
});
