"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronLeft, Calendar, User, Gem, IndianRupee, Clock } from "lucide-react";
import { bookingService } from "@/lib/services/booking.service";
import { useAuthStore } from "@/store/auth.store";
import { BookingItem } from "@/types";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils";
import AuthGuard from "@/components/layout/AuthGuard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingActionModal from "@/components/bookings/BookingActionModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuthStore();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchBooking = () => {
    const id = Number(params.id);
    if (isNaN(id)) { router.replace("/"); return; }
    setLoading(true);
    bookingService
      .getById(id)
      .then(setBooking)
      .catch(() => toast.error("Booking not found"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooking(); }, [params.id]);

  const handleApprove = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const updated = await bookingService.approve(booking.id);
      setBooking(updated);
      toast.success("Booking approved! Item is now reserved for the buyer.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkActive = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const updated = await bookingService.markActive(booking.id);
      setBooking(updated);
      toast.success("Booking marked as active. Jewellery handed over!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark active");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const updated = await bookingService.returnJewellery(booking.id);
      setBooking(updated);
      toast.success("Jewellery returned! Booking completed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record return");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AuthGuard>
    );
  }

  if (!booking) return null;

  const backHref =
    role === "ADMIN"
      ? "/admin/bookings"
      : role === "SUPPLIER"
      ? "/supplier/bookings"
      : "/buyer/bookings";

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Bookings
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <BookingStatusBadge status={booking.status} />
              <span className="text-xs text-gray-400">Booking #{booking.id}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{booking.jewelleryTitle}</h1>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(booking.totalAmount)}</p>
        </div>

        {/* Details card */}
        <Card className="mb-4">
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <Gem className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Jewellery</dt>
                <dd className="font-medium text-gray-900">
                  <Link
                    href={`/jewellery/${booking.jewelleryId}`}
                    className="hover:text-amber-600 hover:underline"
                  >
                    {booking.jewelleryTitle}
                  </Link>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Rental Period</dt>
                <dd className="font-medium text-gray-900 text-sm">
                  {formatDateTime(booking.startDateTime)}
                  <span className="mx-2 text-gray-400">→</span>
                  {formatDateTime(booking.endDateTime)}
                </dd>
              </div>
            </div>

            {booking.actualReturnDateTime && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <dt className="text-xs text-gray-500">Actual Return</dt>
                  <dd className="font-medium text-gray-900 text-sm">
                    {formatDateTime(booking.actualReturnDateTime)}
                  </dd>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Buyer</dt>
                <dd className="font-medium text-gray-900">{booking.buyerName}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Supplier</dt>
                <dd className="font-medium text-gray-900">{booking.supplierName}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IndianRupee className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Total Amount</dt>
                <dd className="font-bold text-lg text-amber-700">{formatCurrency(booking.totalAmount)}</dd>
              </div>
            </div>
          </dl>

          {booking.buyerNotes && (
            <div className="mt-4 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Buyer Notes</p>
              <p className="text-sm text-blue-800">{booking.buyerNotes}</p>
            </div>
          )}

          {booking.rejectionReason && (
            <div className="mt-4 rounded-xl bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-800">{booking.rejectionReason}</p>
            </div>
          )}

          {booking.cancellationReason && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3">
              <p className="text-xs font-medium text-rose-700 mb-1">Cancellation Reason</p>
              <p className="text-sm text-rose-800">{booking.cancellationReason}</p>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Created {formatRelativeTime(booking.createdAt)} · Updated{" "}
            {formatRelativeTime(booking.updatedAt)}
          </p>
        </Card>

        {/* Actions */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {/* SUPPLIER actions */}
            {role === "SUPPLIER" && booking.status === "REQUESTED" && (
              <>
                <Button onClick={handleApprove} loading={actionLoading}>
                  ✓ Approve
                </Button>
                <Button variant="danger" onClick={() => setRejectOpen(true)}>
                  ✗ Reject
                </Button>
              </>
            )}
            {role === "SUPPLIER" && booking.status === "APPROVED" && (
              <Button onClick={handleMarkActive} loading={actionLoading}>
                📦 Mark as Handed Over
              </Button>
            )}
            {role === "SUPPLIER" && booking.status === "ACTIVE" && (
              <Button onClick={handleReturn} loading={actionLoading}>
                ↩ Record Return
              </Button>
            )}

            {/* BUYER actions */}
            {role === "BUYER" &&
              (booking.status === "REQUESTED" || booking.status === "APPROVED") && (
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  Cancel Booking
                </Button>
              )}

            {/* ADMIN actions */}
            {role === "ADMIN" &&
              !["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status) && (
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  Force Cancel
                </Button>
              )}

            {/* Terminal state notice */}
            {["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status) && (
              <p className="text-sm text-gray-500 self-center">
                This booking is in a final state — no further actions available.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Reject modal */}
      <BookingActionModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Booking"
        description="Please provide a reason for rejecting this booking request. The buyer will see this."
        confirmLabel="Reject Booking"
        confirmVariant="danger"
        reasonLabel="Rejection Reason"
        onConfirm={async (reason) => {
          const updated = await bookingService.reject(booking!.id, { reason });
          setBooking(updated);
          toast.success("Booking rejected.");
        }}
      />

      {/* Cancel modal */}
      <BookingActionModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={role === "ADMIN" ? "Force Cancel Booking" : "Cancel Booking"}
        description={
          role === "ADMIN"
            ? "Force-cancel this booking as admin. The supplier will be notified."
            : "Are you sure you want to cancel this booking?"
        }
        confirmLabel="Cancel Booking"
        confirmVariant="danger"
        reasonLabel="Cancellation Reason"
        onConfirm={async (reason) => {
          let updated: BookingItem;
          if (role === "ADMIN") {
            const { adminService } = await import("@/lib/services/admin.service");
            updated = await adminService.cancelBooking(booking!.id, reason ?? "");
          } else {
            updated = await bookingService.cancel(booking!.id, { reason });
          }
          setBooking(updated);
          toast.success("Booking cancelled.");
        }}
      />
    </AuthGuard>
  );
}
