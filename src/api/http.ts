import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mockAdapter } from "./mockAdapter";

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK !== "false";
const API_URL = (import.meta as any).env?.VITE_API_URL || "https://memory.firm.kiev.ua/api";

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

if (USE_MOCK) {
  // axios adapter is where "fetch" happens; we swap it with our mock router.
  (http.defaults as any).adapter = (mockAdapter as AxiosAdapter);
} else {
  console.log("Using real API from:", API_URL);
}

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;
