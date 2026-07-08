"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingActionModal from "@/components/bookings/BookingActionModal";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { adminService } from "@/lib/services/admin.service";
import { BookingItem, PagedResponse } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [result, setResult] = useState<PagedResponse<BookingItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    adminService
      .getAllBookings(page, 15)
      .then(setResult)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [page]);

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide booking management</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : !result || result.content.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No bookings found" />
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">{result.totalElements} booking(s)</p>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Jewellery</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Buyer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.content.map((b) => {
                    const isTerminal = ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status);
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{b.id}</td>
                        <td className="px-4 py-3">
                          <Link href={`/jewellery/${b.jewelleryId}`}
                            className="font-medium text-gray-900 hover:text-amber-600 line-clamp-1 max-w-[160px] block">
                            {b.jewelleryTitle}
                          </Link>
                          <p className="text-xs text-gray-400">Supplier: {b.supplierName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/users/${b.buyerId}`}
                            className="text-gray-700 hover:text-amber-600">
                            {b.buyerName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          <span>{formatDateTime(b.startDateTime)}</span>
                          <br />
                          <span>{formatDateTime(b.endDateTime)}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-700">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <BookingStatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/bookings/${b.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                            {!isTerminal && (
                              <Button variant="danger" size="sm"
                                onClick={() => setCancelTarget(b)}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Force-cancel modal */}
      <BookingActionModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Force Cancel Booking"
        description={`Force-cancel booking #${cancelTarget?.id} for "${cancelTarget?.jewelleryTitle}". This action cannot be undone.`}
        confirmLabel="Force Cancel"
        confirmVariant="danger"
        reasonLabel="Reason (required)"
        requireReason
        onConfirm={async (reason) => {
          if (!cancelTarget) return;
          const updated = await adminService.cancelBooking(cancelTarget.id, reason ?? "");
          setResult((prev) =>
            prev
              ? { ...prev, content: prev.content.map((b) => (b.id === updated.id ? updated : b)) }
              : prev
          );
          toast.success("Booking force-cancelled.");
          setCancelTarget(null);
        }}
      />
    </AuthGuard>
  );
}
