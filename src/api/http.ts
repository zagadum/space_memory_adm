import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mockAdapter } from "./mockAdapter";

const rawUseMock = String((import.meta as any).env?.VITE_USE_MOCK ?? "true").toLowerCase();
const USE_MOCK_BY_DEFAULT = rawUseMock !== "false";
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/";

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
  baseURL: API_BASE_URL,
  timeout: 12000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

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
  baseURL: API_BASE_URL,
  defaultMock: USE_MOCK_BY_DEFAULT,
  mockOnly: MOCK_ONLY_PREFIXES,
  realOnly: REAL_ONLY_PREFIXES,
});

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;
