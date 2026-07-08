"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cn, getInitials } from "@/lib/utils";
import {
  LogOut,
  User,
  Gem,
  LayoutDashboard,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, role, name, clearSession } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const buyerLinks = [
    { href: "/explore", label: "Explore", icon: Gem },
    { href: "/buyer/bookings", label: "My Bookings", icon: ShoppingBag },
    { href: "/buyer/profile", label: "Profile", icon: User },
  ];

  const supplierLinks = [
    { href: "/supplier/listings", label: "My Listings", icon: Gem },
    { href: "/supplier/bookings", label: "Bookings", icon: ShoppingBag },
    { href: "/supplier/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: User },
    { href: "/admin/jewellery", label: "Jewellery", icon: Gem },
    { href: "/admin/bookings", label: "Bookings", icon: ShoppingBag },
  ];

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "SUPPLIER"
      ? supplierLinks
      : role === "BUYER"
      ? buyerLinks
      : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href={isAuthenticated ? (role === "ADMIN" ? "/admin/dashboard" : role === "SUPPLIER" ? "/supplier/listings" : "/explore") : "/"}
          className="flex items-center gap-2 font-bold text-amber-700 text-lg"
        >
          <Gem className="h-6 w-6 text-amber-500" />
          <span>GoldRent</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Avatar + name */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {name ? getInitials(name) : "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <button
              className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
