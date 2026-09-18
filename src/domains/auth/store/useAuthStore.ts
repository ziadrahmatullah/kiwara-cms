import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiEnvelope, ApiErrorBody, AuthUser, LoginResponse } from "@/types/api";
import { API_BASE_URL, clearAuth, setToken } from "@/shared/lib/apiClient";
import { useEventScopeStore } from "@/shared/store/useEventScopeStore";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,

      // Memakai axios polos (bukan apiClient) supaya 401 karena password salah
      // tidak memicu interceptor logout/redirect.
      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await axios.post<ApiEnvelope<LoginResponse>>(`${API_BASE_URL}/auth/login`, {
            email,
            password,
          });
          const { token, ...user } = res.data.data;
          setToken(token);
          set({ token, user, isAuthenticated: true, loading: false });
        } catch (err) {
          set({ loading: false });
          let msg = "Gagal masuk. Coba lagi.";
          if (axios.isAxiosError<ApiErrorBody>(err)) {
            const status = err.response?.status;
            if (status === 401 || status === 400) msg = "Email atau password salah.";
            else msg = err.response?.data?.message || err.response?.data?.error || err.message || msg;
          }
          throw new Error(msg, { cause: err });
        }
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearAuth();
        useEventScopeStore.getState().reset();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "kiwara-auth",
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
