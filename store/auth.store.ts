/**
 * Global auth state via Zustand.
 * Persists session data to cookies (httpOnly not possible on client — JWT is
 * short-lived and validated server-side on every request).
 */

import { create } from "zustand";
import Cookies from "js-cookie";
import { AuthResponse, UserRole } from "@/types";

const COOKIE_OPTS = { expires: 1, sameSite: "Strict" } as const; // 1 day

interface AuthState {
  token: string | null;
  userId: number | null;
  role: UserRole | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  name: null,
  email: null,
  isAuthenticated: false,

  setSession: (response: AuthResponse) => {
    Cookies.set("accessToken", response.accessToken, COOKIE_OPTS);
    Cookies.set("userRole", response.role, COOKIE_OPTS);
    Cookies.set("userId", String(response.userId), COOKIE_OPTS);

    set({
      token: response.accessToken,
      userId: response.userId,
      role: response.role,
      name: response.name,
      email: response.email,
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    Cookies.remove("userId");

    set({
      token: null,
      userId: null,
      role: null,
      name: null,
      email: null,
      isAuthenticated: false,
    });
  },

  /**
   * Rehydrate store from cookies on app mount (client-side only).
   * This handles page refreshes without re-logging in.
   */
  hydrate: () => {
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole") as UserRole | undefined;
    const userId = Cookies.get("userId");

    if (token && role && userId) {
      set({
        token,
        role,
        userId: Number(userId),
        isAuthenticated: true,
      });
    }
  },
}));
