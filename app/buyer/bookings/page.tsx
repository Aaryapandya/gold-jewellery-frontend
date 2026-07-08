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
import { BookingItem, PagedResponse } from "@/types";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function BuyerBookingsPage() {
  const [result, setResult] = useState<PagedResponse<BookingItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookingService
      .getMyBuyerBookings(page, 10)
      .then(setResult)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AuthGuard allowedRoles={["BUYER"]}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track all your jewellery rental requests
            </p>
          </div>
          <Link href="/explore">
            <Button variant="secondary">Browse Jewellery</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : !result || result.content.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No bookings yet"
            description="Start by exploring gold jewellery near you and placing your first booking."
            action={
              <Link href="/explore">
                <Button>Explore Jewellery</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {result.content.map((b) => (
                <BookingCard key={b.id} booking={b} viewAs="BUYER" />
              ))}
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
