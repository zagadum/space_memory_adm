import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mockAdapter } from "./mockAdapter";

const rawUseMock = String((import.meta as any).env?.VITE_USE_MOCK ?? "false").toLowerCase();
const USE_MOCK_BY_DEFAULT = rawUseMock !== "false";
const API_URL = (import.meta as any).env?.VITE_API_URL || "https://memory.firm.kiev.ua/api";

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

export const http = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Response interceptor for timeout errors and API response unwrapping
http.interceptors.response.use(
  (response) => {
    // Unwrap API response format: { success, message, data: {...} }
    // The backend returns this format, so we extract the data part for axios compatibility
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Большая нагрузка на сервер. Пожалуйста, повторите попытку через несколько секунд.';
      console.error('⏱️ [TIMEOUT ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      });
    }
    return Promise.reject(error);
  }
);

const axiosAny = axios as any;
const defaultAdapter: AxiosAdapter = axiosAny.getAdapter
  ? axiosAny.getAdapter(http.defaults.adapter)
  : (http.defaults.adapter as AxiosAdapter);

if (!defaultAdapter) {
  throw new Error("Axios default adapter is not available");
}

// Route every request either to mock adapter or to the real backend adapter.
(http.defaults as any).adapter = (async (config: InternalAxiosRequestConfig) => {
  if (shouldUseMock(config)) {
    return mockAdapter(config);
  }
  return defaultAdapter(config);
}) as AxiosAdapter;

console.log("API routing config:", {
  baseURL: API_URL,
  defaultMock: USE_MOCK_BY_DEFAULT,
  mockOnly: MOCK_ONLY_PREFIXES,
  realOnly: REAL_ONLY_PREFIXES,
});

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;
