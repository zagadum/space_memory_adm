import { defineStore } from "pinia";
import { authApi } from "../api/authApi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null as User | null,
    loading: false,
    error: "" as string,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    updateProfile(data: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...data };
        if (!this.user.initials && this.user.email) {
          this.user.initials = this.user.email.substring(0, 2).toUpperCase();
        }
      }
    },
    async signIn(email: string, password: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await authApi.signIn({ email, password });
        this.setToken(res.token);
        if (!res.user.initials && res.user.email) {
          res.user.initials = res.user.email.substring(0, 2).toUpperCase();
        }
        this.user = res.user;
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
        const user = await authApi.me();
        if (!user.initials && user.email) {
          user.initials = user.email.substring(0, 2).toUpperCase();
        }
        this.user = user;
      } catch {
        this.logout();
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
    },
  },
});
