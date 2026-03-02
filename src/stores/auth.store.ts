import { defineStore } from "pinia";
import { authApi } from "../api/authApi";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null as null | { id: string; email: string; name: string },
    loading: false,
    error: "" as string,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    async signIn(email: string, password: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await authApi.signIn({ email, password });
        this.token = res.token;
        this.user = res.user;
        localStorage.setItem("token", res.token);
        return true;
      } catch (e: any) {
        this.error = e?.response?.data?.message || "Sign in failed";
        return false;
      } finally {
        this.loading = false;
      }
    },
    async loadMe() {
      if (!this.token) return;
      try {
        this.user = await authApi.me();
      } catch {
        this.logout();
      }
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
    },
  },
});
