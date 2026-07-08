"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import BookingCard from "@/components/bookings/BookingCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import { bookingService } from "@/lib/services/booking.service";
import { BookingItem, BookingStatus, PagedResponse } from "@/types";
import { BOOKING_STATUS_META } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_TABS: { label: string; statuses: BookingStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Requested", statuses: ["REQUESTED"] },
  { label: "Approved", statuses: ["APPROVED"] },
  { label: "Active", statuses: ["ACTIVE"] },
  { label: "Completed", statuses: ["COMPLETED"] },
  { label: "Rejected / Cancelled", statuses: ["REJECTED", "CANCELLED"] },
];

export default function SupplierBookingsPage() {
  const [result, setResult] = useState<PagedResponse<BookingItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setLoading(true);
    bookingService
      .getMySupplierBookings(page, 10)
      .then(setResult)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, [page]);

  const selectedStatuses = STATUS_TABS[activeTab].statuses;
  const filteredBookings = result?.content.filter((b) =>
    !selectedStatuses ? true : selectedStatuses.includes(b.status)
  ) ?? [];

  // Count per status for tab badges
  const countMap = (result?.content ?? []).reduce<Partial<Record<BookingStatus, number>>>(
    (acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc; },
    {}
  );

  return (
    <AuthGuard allowedRoles={["SUPPLIER"]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Incoming Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage booking requests for your jewellery</p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex overflow-x-auto gap-1 border-b border-gray-200 pb-0">
          {STATUS_TABS.map((tab, idx) => {
            const count = tab.statuses
              ? tab.statuses.reduce((s, st) => s + (countMap[st] ?? 0), 0)
              : result?.content.length ?? 0;

            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  activeTab === idx
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    activeTab === idx ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No bookings"
            description={
              activeTab === 0
                ? "No booking requests yet. Make sure your listings are active and verified."
                : `No ${STATUS_TABS[activeTab].label.toLowerCase()} bookings.`
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} booking={b} viewAs="SUPPLIER" />
              ))}
            </div>
            {activeTab === 0 && result && (
              <Pagination
                currentPage={result.pageNumber}
                totalPages={result.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
