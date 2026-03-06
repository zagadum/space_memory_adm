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
    user: {
      id: 'u_current',
      name: 'Artem',
      email: 'artem@gls.edu.pl',
      role: 'Dział rekrutacji учащихся',
      initials: 'AR'
    } as User | null,
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
      }
    },
    async signIn(email: string, password: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await authApi.signIn({ email, password });
        this.setToken(res.token);
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
        this.user = await authApi.me();
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
