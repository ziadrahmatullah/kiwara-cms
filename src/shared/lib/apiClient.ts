import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import type { ApiEnvelope, ApiErrorBody, Paginated } from "@/types/api";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:6027").replace(/\/+$/, "");

const TOKEN_KEY = "auth_token";
const AUTH_STORAGE_KEY = "kiwara-auth";
const SCOPE_STORAGE_KEY = "kiwara-event-scope";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SCOPE_STORAGE_KEY);
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(err: unknown, fallback = "Terjadi kesalahan"): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Biarkan browser mengisi boundary multipart sendiri.
  if (config.data instanceof FormData || config.data instanceof URLSearchParams) {
    delete config.headers["Content-Type"];
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const msg = data?.message || data?.error || error.message || "Terjadi kesalahan";

    if (status === 401) {
      clearAuth();
      if (window.location.pathname !== "/") window.location.href = "/";
      return Promise.reject(new ApiError("Sesi berakhir, silakan masuk lagi.", status));
    }
    if (status === 403) {
      toast.error("Kamu tidak punya akses untuk aksi ini");
      return Promise.reject(new ApiError(msg, status));
    }
    toast.error(msg);
    return Promise.reject(new ApiError(msg, status));
  },
);

export const apiClient = {
  get: <T>(path: string, params?: object) => instance.get<T>(path, { params }).then((r) => r.data),
  post: <T>(path: string, body?: unknown) => instance.post<T>(path, body).then((r) => r.data),
  put: <T>(path: string, body?: unknown) => instance.put<T>(path, body).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) => instance.patch<T>(path, body).then((r) => r.data),
  delete: <T>(path: string) => instance.delete<T>(path).then((r) => r.data),
};

/** Normalisasi envelope list wedding-be (field paginasi di level atas) ke bentuk {items, pagination}. */
export function toPaginated<T>(res: ApiEnvelope<T[]>): Paginated<T> {
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    items,
    pagination: {
      current_page: res.current_page ?? 1,
      total_page: res.total_page ?? 1,
      total_item: res.total_item ?? items.length,
      current_item: res.current_item ?? items.length,
    },
  };
}

/** Buang key bernilai undefined/null/"" agar tidak dikirim sebagai query string. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
