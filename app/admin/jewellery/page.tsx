"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Gem, Star } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { adminService } from "@/lib/services/admin.service";
import { JewelleryItem, JewelleryStatus, PagedResponse } from "@/types";
import { formatCurrency, formatDate, JEWELLERY_STATUS_META } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "UNDER_VERIFICATION", label: "Under Verification" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

function AdminJewelleryContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PagedResponse<JewelleryItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>(searchParams.get("status") ?? "UNDER_VERIFICATION");
  const [changingId, setChangingId] = useState<number | null>(null);

  const fetchListings = () => {
    setLoading(true);
    adminService
      .getAllJewellery({
        status: (status as JewelleryStatus) || undefined,
        page,
        size: 10,
      })
      .then(setResult)
      .catch(() => toast.error("Failed to load jewellery"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, [page, status]);

  const handleStatusChange = async (item: JewelleryItem, newStatus: JewelleryStatus) => {
    setChangingId(item.id);
    try {
      const updated = await adminService.changeJewelleryStatus(item.id, newStatus);
      setResult((prev) =>
        prev
          ? { ...prev, content: prev.content.map((j) => (j.id === updated.id ? updated : j)) }
          : prev
      );
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setChangingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jewellery Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve supplier jewellery listings</p>
        </div>

        {/* Filter */}
        <Card className="mb-5">
          <div className="flex items-end gap-3">
            <div className="w-52">
              <Select label="Status" options={STATUS_OPTIONS} value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }} />
            </div>
            <Button size="sm" onClick={fetchListings}>Apply</Button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : !result || result.content.length === 0 ? (
          <EmptyState icon={Gem} title="No listings found" description="Try changing the status filter." />
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">{result.totalElements} listing(s)</p>
            <div className="space-y-4">
              {result.content.map((item) => {
                const meta = JEWELLERY_STATUS_META[item.status];
                const isChanging = changingId === item.id;
                return (
                  <Card key={item.id} padding="sm">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-amber-50">
                        {item.imageUrls?.[0] ? (
                          <Image src={item.imageUrls[0]} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Star className="h-8 w-8 text-amber-200" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge className={meta.colour}>{meta.label}</Badge>
                          {item.available ? (
                            <Badge className="bg-green-100 text-green-700">Available</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500">Booked</Badge>
                          )}
                        </div>
                        <Link href={`/jewellery/${item.id}`}
                          className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1">
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.category} · {item.weightInGrams}g · {formatCurrency(item.rentPerDay)}/day
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.city} · by {item.supplierName} · listed {formatDate(item.createdAt)}
                        </p>
                        {item.billUrls?.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {item.billUrls.length} bill(s) uploaded · {item.imageUrls?.length ?? 0} image(s)
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-col gap-2 justify-center">
                        {item.status !== "ACTIVE" && (
                          <Button size="sm" loading={isChanging}
                            onClick={() => handleStatusChange(item, "ACTIVE")}>
                            ✓ Approve
                          </Button>
                        )}
                        {item.status !== "INACTIVE" && (
                          <Button size="sm" variant="danger" loading={isChanging}
                            onClick={() => handleStatusChange(item, "INACTIVE")}>
                            Suspend
                          </Button>
                        )}
                        {item.status !== "UNDER_VERIFICATION" && (
                          <Button size="sm" variant="outline" loading={isChanging}
                            onClick={() => handleStatusChange(item, "UNDER_VERIFICATION")}>
                            Re-verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Pagination currentPage={result.pageNumber} totalPages={result.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}

export default function AdminJewelleryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
      <AdminJewelleryContent />
    </Suspense>
  );
}
