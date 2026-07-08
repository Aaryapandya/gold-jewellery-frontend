"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users, Gem, ShoppingBag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { adminService } from "@/lib/services/admin.service";
import { DashboardStats } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colour: string;
  href?: string;
}

function StatCard({ label, value, icon: Icon, colour, href }: StatCardProps) {
  const content = (
    <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`rounded-2xl p-3 ${colour}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AuthGuard allowedRoles={["ADMIN"]}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AuthGuard>
    );
  }

  if (!stats) return null;

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and quick actions</p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users}
            colour="bg-blue-100 text-blue-600" href="/admin/users" />
          <StatCard label="Buyers" value={stats.totalBuyers} icon={Users}
            colour="bg-purple-100 text-purple-600" href="/admin/users?role=BUYER" />
          <StatCard label="Suppliers" value={stats.totalSuppliers} icon={Users}
            colour="bg-indigo-100 text-indigo-600" href="/admin/users?role=SUPPLIER" />
          <StatCard label="Total Bookings" value={stats.totalBookings} icon={ShoppingBag}
            colour="bg-amber-100 text-amber-600" href="/admin/bookings" />
          <StatCard label="Active Bookings" value={stats.activeBookings} icon={TrendingUp}
            colour="bg-green-100 text-green-600" />
          <StatCard label="Pending Requests" value={stats.requestedBookings} icon={Clock}
            colour="bg-yellow-100 text-yellow-600" href="/admin/bookings" />
          <StatCard label="Completed" value={stats.completedBookings} icon={CheckCircle}
            colour="bg-teal-100 text-teal-600" />
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/admin/users?pendingVerification=true"
            className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-yellow-800 mb-1">Pending Verification</h3>
            <p className="text-sm text-yellow-700">Review users awaiting email/mobile verification</p>
          </Link>
          <Link href="/admin/jewellery?status=UNDER_VERIFICATION"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-amber-800 mb-1">Jewellery Review</h3>
            <p className="text-sm text-amber-700">Approve or reject new jewellery listings</p>
          </Link>
          <Link href="/admin/bookings"
            className="rounded-2xl border border-blue-200 bg-blue-50 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-blue-800 mb-1">All Bookings</h3>
            <p className="text-sm text-blue-700">Monitor and manage platform-wide bookings</p>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
