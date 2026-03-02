import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { mockAdapter } from "./mockAdapter";

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK !== "false";

export const http = axios.create({
  baseURL: "/",
  timeout: 12000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

if (USE_MOCK) {
  // axios adapter is where "fetch" happens; we swap it with our mock router.
  (http.defaults as any).adapter = (mockAdapter as AxiosAdapter);
}

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiConfig = AxiosRequestConfig;
