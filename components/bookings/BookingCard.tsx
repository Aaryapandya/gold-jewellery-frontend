"use client";

import Link from "next/link";
import { Calendar, User, Gem, IndianRupee } from "lucide-react";
import { BookingItem } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import BookingStatusBadge from "./BookingStatusBadge";

interface BookingCardProps {
  booking: BookingItem;
  viewAs: "BUYER" | "SUPPLIER" | "ADMIN";
}

export default function BookingCard({ booking, viewAs }: BookingCardProps) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-amber-200 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <BookingStatusBadge status={booking.status} />
            <span className="text-xs text-gray-400">
              #{booking.id}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 truncate">
            <Gem className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
            {booking.jewelleryTitle}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formatDateTime(booking.startDateTime)} →{" "}
                {formatDateTime(booking.endDateTime)}
              </span>
            </div>
            {viewAs === "SUPPLIER" && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>Buyer: {booking.buyerName}</span>
              </div>
            )}
            {viewAs === "BUYER" && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>Supplier: {booking.supplierName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-amber-700">
            {formatCurrency(booking.totalAmount)}
          </p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>

      {/* Rejection/cancellation reason */}
      {(booking.rejectionReason || booking.cancellationReason) && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {booking.rejectionReason
            ? `Rejected: ${booking.rejectionReason}`
            : `Cancelled: ${booking.cancellationReason}`}
        </p>
      )}
    </Link>
  );
}
