"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  /**
   * When true (default), BUYER and SUPPLIER users who have not yet been
   * verified by an admin are redirected to /onboarding/verification.
   * Set to false on the onboarding pages themselves so they remain accessible.
   */
  requireVerified?: boolean;
}

/**
 * Client-side route guard.
 * - Redirects to /login if not authenticated.
 * - Redirects unverified buyers/suppliers to /onboarding/verification.
 * - Redirects to appropriate home if role not permitted.
 * Must be used inside the app directory layout where the store is hydrated.
 */
export default function AuthGuard({
  children,
  allowedRoles,
  requireVerified = true,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, role, isVerified, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Wait until cookies have been read before making any routing decisions.
    // Without this guard, the effect would fire against default store values
    // (isAuthenticated=false, isVerified=false) and wrongly redirect users.
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Block unverified buyers / suppliers from accessing protected pages
    if (requireVerified && role !== "ADMIN" && !isVerified) {
      router.replace("/onboarding/verification");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // Redirect to the user's own home
      const home =
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "SUPPLIER"
          ? "/supplier/listings"
          : "/explore";
      router.replace(home);
    }
  }, [hydrated, isAuthenticated, role, isVerified, requireVerified, allowedRoles, router]);

  // Show spinner until store is hydrated from cookies — prevents any content
  // flash or premature redirects based on uninitialised default values.
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show spinner while redirecting unverified users
  if (requireVerified && role !== "ADMIN" && !isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
