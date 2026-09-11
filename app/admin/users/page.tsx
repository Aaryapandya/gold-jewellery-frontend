"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Search } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { adminService } from "@/lib/services/admin.service";
import { UserProfile, UserRole, PagedResponse } from "@/types";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "BUYER", label: "Buyer" },
  { value: "SUPPLIER", label: "Supplier" },
  { value: "ADMIN", label: "Admin" },
];

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PagedResponse<UserProfile> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>(searchParams.get("role") ?? "");
  const [city, setCity] = useState("");
  const [pendingOnly, setPendingOnly] = useState(
    searchParams.get("pendingVerification") === "true"
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const fetcher = pendingOnly
      ? adminService.getPendingVerificationUsers(page, 15)
      : adminService.getAllUsers({ role: role || undefined, city: city || undefined, page, size: 15 });

    fetcher
      .then(setResult)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, pendingOnly]);

  const handleToggleActive = async (user: UserProfile) => {
    setTogglingId(user.id);
    try {
      const updated = await adminService.setUserActive(user.id, !user.active);
      setResult((prev) =>
        prev
          ? { ...prev, content: prev.content.map((u) => (u.id === updated.id ? updated : u)) }
          : prev
      );
      toast.success(`User ${updated.active ? "activated" : "deactivated"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle user");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
        </div>

        {/* Filters */}
        <Card className="mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Select label="Role" options={ROLE_OPTIONS} value={role}
                onChange={(e) => { setRole(e.target.value); setPage(0); }} />
            </div>
            <div className="w-40">
              <Input label="City" placeholder="e.g. Mumbai" value={city}
                onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="pendingOnly"
                checked={pendingOnly}
                onChange={(e) => { setPendingOnly(e.target.checked); setPage(0); }}
                className="h-4 w-4 rounded border-gray-300 text-amber-600"
              />
              <label htmlFor="pendingOnly" className="text-sm text-gray-700">Pending verification only</label>
            </div>
            <Button size="sm" onClick={fetchUsers}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : !result || result.content.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting the filters." />
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">{result.totalElements} user(s) found</p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Verification</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.content.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="hover:text-amber-600">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={
                          user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                          user.role === "SUPPLIER" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge className={user.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                            {user.emailVerified ? "Email ✓" : "Email ✗"}
                          </Badge>
                          <Badge className={user.mobileVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                            {user.mobileVerified ? "Mobile ✓" : "Mobile ✗"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          {user.role !== "ADMIN" && (
                            <Button
                              variant={user.isActive ? "danger" : "secondary"}
                              size="sm"
                              loading={togglingId === user.id}
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={result.pageNumber}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AuthGuard>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
