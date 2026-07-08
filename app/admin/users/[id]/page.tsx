"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ChevronLeft, ShieldCheck, FileText } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { adminService } from "@/lib/services/admin.service";
import { UserProfile } from "@/types";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) { router.replace("/admin/users"); return; }
    adminService
      .getUserById(id)
      .then(setUser)
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const run = async (action: string, fn: () => Promise<UserProfile>) => {
    setActionLoading(action);
    try {
      const updated = await fn();
      setUser(updated);
      toast.success("Updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={["ADMIN"]}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AuthGuard>
    );
  }

  if (!user) return null;

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Users
        </Link>

        {/* Profile header */}
        <Card>
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center shrink-0">
              {user.profilePhotoUrl ? (
                <Image src={user.profilePhotoUrl} alt={user.name} fill className="object-cover rounded-full" />
              ) : (
                <span className="text-2xl font-bold text-amber-700">{getInitials(user.name)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.mobileNumber && <p className="text-sm text-gray-500">{user.mobileNumber}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={
                  user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                  user.role === "SUPPLIER" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }>{user.role}</Badge>
                <Badge className={user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge className={user.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  Email {user.emailVerified ? "✓" : "✗"}
                </Badge>
                <Badge className={user.mobileVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  Mobile {user.mobileVerified ? "✓" : "✗"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gray-400">Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Address */}
        {(user.address || user.city) && (
          <Card>
            <h2 className="mb-3 font-semibold text-gray-900">Location</h2>
            <p className="text-sm text-gray-700">{[user.address, user.city, user.pincode].filter(Boolean).join(", ")}</p>
            {user.latitude && user.longitude && (
              <p className="text-xs text-gray-400 mt-1">
                Coords: {user.latitude}, {user.longitude}
              </p>
            )}
          </Card>
        )}

        {/* KYC Documents */}
        <Card>
          <h2 className="mb-3 font-semibold text-gray-900">Identity Documents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { label: "Aadhaar Front", url: user.aadhaarFrontUrl },
                { label: "Aadhaar Back", url: user.aadhaarBackUrl },
                { label: "PAN Front", url: user.panFrontUrl },
                { label: "PAN Back", url: user.panBackUrl },
              ] as { label: string; url: string | null }[]
            ).map(({ label, url }) => (
              <div key={label} className="rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <FileText className="h-3.5 w-3.5" /> View
                  </a>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500">Not uploaded</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Admin actions */}
        {user.role !== "ADMIN" && (
          <Card>
            <h2 className="mb-4 font-semibold text-gray-900">Admin Actions</h2>
            <div className="flex flex-wrap gap-3">
              {/* Activate / Deactivate */}
              <Button
                variant={user.isActive ? "danger" : "primary"}
                loading={actionLoading === "active"}
                onClick={() => run("active", () => adminService.setUserActive(user.id, !user.isActive))}
              >
                {user.isActive ? "Deactivate Account" : "Activate Account"}
              </Button>

              {/* Email verification */}
              <Button
                variant={user.emailVerified ? "outline" : "secondary"}
                loading={actionLoading === "email"}
                onClick={() => run("email", () => adminService.verifyUserEmail(user.id, !user.emailVerified))}
              >
                {user.emailVerified ? "Mark Email Unverified" : "✓ Verify Email"}
              </Button>

              {/* Mobile verification */}
              <Button
                variant={user.mobileVerified ? "outline" : "secondary"}
                loading={actionLoading === "mobile"}
                onClick={() => run("mobile", () => adminService.verifyUserMobile(user.id, !user.mobileVerified))}
              >
                {user.mobileVerified ? "Mark Mobile Unverified" : "✓ Verify Mobile"}
              </Button>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Changes take effect immediately. Deactivating prevents user from logging in.
            </p>
          </Card>
        )}

        {/* Family members */}
        {user.familyMembers?.length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold text-gray-900">Family Members</h2>
            <ul className="space-y-2">
              {user.familyMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.relation}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(m.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
