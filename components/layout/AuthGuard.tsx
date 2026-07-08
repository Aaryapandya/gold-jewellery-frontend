"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Client-side route guard.
 * - Redirects to /login if not authenticated.
 * - Redirects to appropriate home if role not permitted.
 * Must be used inside the app directory layout where the store is hydrated.
 */
export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, role, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
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
  }, [isAuthenticated, role, allowedRoles, router]);

  if (!isAuthenticated) {
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
