import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mockAdapter } from "./mockAdapter";
import { useAppStore } from "../stores/app.store";
import { useNotificationStore } from "../stores/notification.store";

const rawUseMock = String((import.meta as any).env?.VITE_USE_MOCK ?? "false").toLowerCase();
const USE_MOCK_BY_DEFAULT = rawUseMock !== "false";

const API_URL = (import.meta as any).env?.VITE_API_URL || "https://memory.firm.kiev.ua/api/v1/";
const RECRUITMENT_API_URL = (import.meta as any).env?.VITE_RECRUITMENT_API_URL || API_URL;
const RECRUITMENT_INDIGO_API_URL = (import.meta as any).env?.VITE_RECRUITMENT_INDIGO_API_URL || RECRUITMENT_API_URL;

export type RecruitmentBackend = "default" | "indigo";

function parsePrefixList(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.replace(/^\//, ""));
}

const MOCK_ONLY_PREFIXES = parsePrefixList((import.meta as any).env?.VITE_MOCK_ONLY);
const REAL_ONLY_PREFIXES = parsePrefixList((import.meta as any).env?.VITE_REAL_ONLY);

function normalizeRequestUrl(config: InternalAxiosRequestConfig): string {
  const rawUrl = String(config.url || "");
  const noOrigin = rawUrl.replace(/^https?:\/\/[^/]+\//i, "");
  return noOrigin.replace(/^\//, "").split("?")[0];
}

function hasPrefix(url: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => url === prefix || url.startsWith(`${prefix}/`));
}

function shouldUseMock(config: InternalAxiosRequestConfig): boolean {
  const url = normalizeRequestUrl(config);

  if (hasPrefix(url, REAL_ONLY_PREFIXES)) return false;
  if (hasPrefix(url, MOCK_ONLY_PREFIXES)) return true;

  return USE_MOCK_BY_DEFAULT;
}

function createHttpClient(baseURL: string) {
  return axios.create({
    baseURL,
    timeout: 12000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Отключаем кеширование HTTP запросов в браузере
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

function attachInterceptors(client: ReturnType<typeof axios.create>) {
  // Request interceptor: attach token + start global loading indicator
  client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    
    // Добавляем timestamp к GET запросам для отключения кеширования
    if (config.method?.toLowerCase() === 'get') {
      if (!config.params) config.params = {};
      config.params._t = Date.now();
    }
    
    // Global loading (static import fixes race condition)
    useAppStore().startRequest();
    return config;
  },
  (error) => {
    useAppStore().endRequest();
    return Promise.reject(error);
  }
  );

  // Response interceptor: end loading, handle 401 logout, timeout errors
  client.interceptors.response.use(
  (response) => {
    useAppStore().endRequest();
    return response;
  },
  (error) => {
    useAppStore().endRequest();

    // Timeout error — user-friendly message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Большая нагрузка на сервер. Пожалуйста, повторите попытку через несколько секунд.';
      console.error('⏱️ [TIMEOUT ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        timestamp: new Date().toISOString(),
      });
    }

    // 401 Unauthorized → automatic logout
    if (error.response?.status === 401) {
      import('../stores/auth.store').then(({ useAuthStore }) => {
        useAuthStore().logout();
      });
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      useNotificationStore().addToast("У вас нет прав для выполнения этого действия", "error");
    }

    return Promise.reject(error);
  }
  );
}

function attachAdapterRouting(client: ReturnType<typeof axios.create>) {
  const axiosAny = axios as any;
  const defaultAdapter: AxiosAdapter = axiosAny.getAdapter
    ? axiosAny.getAdapter(client.defaults.adapter)
    : (client.defaults.adapter as AxiosAdapter);

  if (!defaultAdapter) {
    throw new Error("Axios default adapter is not available");
  }

  // Route every request either to mock adapter or to the real backend adapter.
  (client.defaults as any).adapter = (async (config: InternalAxiosRequestConfig) => {
    if (shouldUseMock(config)) {
      return mockAdapter(config);
    }
    return defaultAdapter(config);
  }) as AxiosAdapter;
}

export const http = createHttpClient(API_URL);
export const httpRecruitment = createHttpClient(RECRUITMENT_API_URL);
export const httpRecruitmentIndigo = createHttpClient(RECRUITMENT_INDIGO_API_URL);

attachInterceptors(http);
attachInterceptors(httpRecruitment);
attachInterceptors(httpRecruitmentIndigo);
attachAdapterRouting(http);
attachAdapterRouting(httpRecruitment);
attachAdapterRouting(httpRecruitmentIndigo);

export function getRecruitmentHttpClient(backend: RecruitmentBackend = "default") {
  return backend === "indigo" ? httpRecruitmentIndigo : httpRecruitment;
}

console.log("API routing config:", {
  baseURL: API_URL,
  recruitmentBaseURL: RECRUITMENT_API_URL,
  recruitmentIndigoBaseURL: RECRUITMENT_INDIGO_API_URL,
  defaultMock: USE_MOCK_BY_DEFAULT,
  mockOnly: MOCK_ONLY_PREFIXES,
  realOnly: REAL_ONLY_PREFIXES,
});

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;

