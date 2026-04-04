import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mockAdapter } from "./mockAdapter";
import { useAppStore } from "../stores/app.store";
import { useNotificationStore } from "../stores/notification.store";
import { getActiveProjectApiUrl, PROJECT_API_URLS } from "../config/projectApi";
import { APP_ENV } from "../config/env";

const USE_MOCK_BY_DEFAULT = APP_ENV.useMock;

const API_URL = getActiveProjectApiUrl();
const RECRUITMENT_API_URL = APP_ENV.recruitmentApiUrl || API_URL;
const RECRUITMENT_INDIGO_API_URL = APP_ENV.recruitmentIndigoApiUrl || RECRUITMENT_API_URL;

export type RecruitmentBackend = "default" | "indigo";

const MOCK_ONLY_PREFIXES = APP_ENV.mockOnlyPrefixes;
const REAL_ONLY_PREFIXES = APP_ENV.realOnlyPrefixes;

function normalizeRequestUrl(config: InternalAxiosRequestConfig): string {
  const rawUrl = String(config.url || "");
  const noOrigin = rawUrl.replace(/^https?:\/\/[^/]+\//i, "");
  return noOrigin.replace(/^\/+/, "").split("?")[0];
}

function isAbsoluteUrl(url: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function normalizeBaseAndPath(config: InternalAxiosRequestConfig) {
  if (typeof config.baseURL === "string" && config.baseURL) {
    config.baseURL = `${config.baseURL.replace(/\/+$/, "")}/`;
  }

  if (typeof config.url === "string" && config.url && !isAbsoluteUrl(config.url)) {
    config.url = config.url.replace(/^\/+/, "");
  }
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

function attachInterceptors(
  client: ReturnType<typeof axios.create>,
  resolveBaseUrl?: () => string,
  opts: { logoutOn401?: boolean; apiLabel?: string } = {}
) {
  const { logoutOn401 = true, apiLabel = '' } = opts;
  // Request interceptor: attach token + start global loading indicator
  client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (resolveBaseUrl) {
      config.baseURL = resolveBaseUrl();
    }

    normalizeBaseAndPath(config);

    const normalizedUrl = normalizeRequestUrl(config);
    const isSignInRequest = normalizedUrl === "auth/sign-in" || normalizedUrl === "v1/auth/sign-in";
    const token = localStorage.getItem("token");
    if (token && !isSignInRequest) {
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

    // 401 Unauthorized → automatic logout only for main API; recruitment shows toast
    if (error.response?.status === 401) {
      if (logoutOn401) {
        import('../stores/auth.store').then(({ useAuthStore }) => {
          useAuthStore().logout();
        });
      } else {
        const label = apiLabel ? `[${apiLabel}] ` : '';
        useNotificationStore().addToast(
          `${label}Токен недействителен или истёк — войдите ещё раз в систему рекрутации`,
          'error'
        );
      }
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

attachInterceptors(http, getActiveProjectApiUrl, { logoutOn401: true });
attachInterceptors(httpRecruitment, undefined, { logoutOn401: false, apiLabel: 'Recruitment Space' });
attachInterceptors(httpRecruitmentIndigo, undefined, { logoutOn401: false, apiLabel: 'Recruitment Indigo' });
attachAdapterRouting(http);
attachAdapterRouting(httpRecruitment);
attachAdapterRouting(httpRecruitmentIndigo);

export function getRecruitmentHttpClient(backend: RecruitmentBackend = "default") {
  return backend === "indigo" ? httpRecruitmentIndigo : httpRecruitment;
}

console.log("API routing config:", {
  baseURL: API_URL,
  projectApiUrls: PROJECT_API_URLS,
  recruitmentBaseURL: RECRUITMENT_API_URL,
  recruitmentIndigoBaseURL: RECRUITMENT_INDIGO_API_URL,
  defaultMock: USE_MOCK_BY_DEFAULT,
  mockOnly: MOCK_ONLY_PREFIXES,
  realOnly: REAL_ONLY_PREFIXES,
});

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;

