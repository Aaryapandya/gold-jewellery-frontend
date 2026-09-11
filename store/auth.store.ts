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
  isVerified: boolean;
  /** True once hydrate() has finished reading from cookies. Prevents AuthGuard
   *  from acting on default store values before cookies are loaded. */
  hydrated: boolean;
  setSession: (response: AuthResponse) => void;
  setVerified: (verified: boolean) => void;
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
  isVerified: false,
  hydrated: false,

  setSession: (response: AuthResponse) => {
    Cookies.set("accessToken", response.accessToken, COOKIE_OPTS);
    Cookies.set("userRole", response.role, COOKIE_OPTS);
    Cookies.set("userId", String(response.userId), COOKIE_OPTS);
    Cookies.set("isVerified", String(response.isVerified ?? false), COOKIE_OPTS);
    if (response.name) Cookies.set("userName", response.name, COOKIE_OPTS);
    if (response.email) Cookies.set("userEmail", response.email, COOKIE_OPTS);

    set({
      token: response.accessToken,
      userId: response.userId,
      role: response.role,
      name: response.name,
      email: response.email,
      isAuthenticated: true,
      isVerified: response.isVerified ?? false,
    });
  },

  setVerified: (verified: boolean) => {
    Cookies.set("isVerified", String(verified), COOKIE_OPTS);
    set({ isVerified: verified });
  },

  clearSession: () => {
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    Cookies.remove("userId");
    Cookies.remove("isVerified");
    Cookies.remove("userName");
    Cookies.remove("userEmail");

    set({
      token: null,
      userId: null,
      role: null,
      name: null,
      email: null,
      isAuthenticated: false,
      isVerified: false,
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
    const isVerified = Cookies.get("isVerified") === "true";
    const name = Cookies.get("userName") ?? null;
    const email = Cookies.get("userEmail") ?? null;

    if (token && role && userId) {
      set({
        token,
        role,
        userId: Number(userId),
        isAuthenticated: true,
        isVerified,
        name,
        email,
        hydrated: true,
      });
    } else {
      // No valid session in cookies — mark hydration complete so guards
      // can redirect to /login instead of spinning indefinitely.
      set({ hydrated: true });
    }
  },
}));
