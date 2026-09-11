"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  MapPin,
  Scale,
  Calendar,
  Star,
  ChevronLeft,
  FileText,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";
import { bookingService } from "@/lib/services/booking.service";
import { jewelleryService } from "@/lib/services/jewellery.service";
import { useAuthStore } from "@/store/auth.store";
import {
  BookingCalendarEntry,
  CreateBookingRequest,
  JewelleryItem,
} from "@/types";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  JEWELLERY_STATUS_META,
  calculateTotalRent,
} from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";

// ─── Booking form sub-component ───────────────────────────────────────────────
function BookingForm({
  jewellery,
  onBooked,
}: {
  jewellery: JewelleryItem;
  onBooked: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Minimum start datetime: now + 1h
  const minDatetime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  // Maximum start datetime: now + 90 days
  const maxDatetime = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const totalRent =
    startDate && endDate
      ? calculateTotalRent(
          new Date(startDate).toISOString(),
          new Date(endDate).toISOString(),
          jewellery.rentPerDay
        )
      : null;

  const isFormValid =
    startDate &&
    endDate &&
    new Date(endDate) > new Date(startDate) &&
    // minimum 4 hours
    new Date(endDate).getTime() - new Date(startDate).getTime() >=
      4 * 60 * 60 * 1000;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateBookingRequest = {
        jewelleryId: jewellery.id,
        startDateTime: new Date(startDate).toISOString(),
        endDateTime: new Date(endDate).toISOString(),
        buyerNotes: notes.trim() || undefined,
      };
      await bookingService.create(payload);
      toast.success("Booking request sent! The supplier will review it.");
      setConfirmOpen(false);
      onBooked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="text-center">
        <p className="mb-3 text-sm text-gray-600">Sign in to request a booking</p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Login to Book
        </Button>
      </Card>
    );
  }

  if (role !== "BUYER") {
    return (
      <Card>
        <p className="text-sm text-gray-500 text-center">
          Only buyers can request bookings.
        </p>
      </Card>
    );
  }

  if (!jewellery.available) {
    return (
      <Card>
        <div className="text-center">
          <div className="mb-2 text-4xl">🔒</div>
          <p className="font-medium text-gray-700">Currently Unavailable</p>
          <p className="text-sm text-gray-500 mt-1">
            This item is already booked. Check back later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Request Booking
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              min={minDatetime}
              max={maxDatetime}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              min={startDate || minDatetime}
              max={maxDatetime}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {startDate && endDate && !isFormValid && (
              <p className="mt-1 text-xs text-red-600">
                Minimum rental duration is 4 hours.
              </p>
            )}
          </div>
          <Textarea
            label="Notes for Supplier (optional)"
            placeholder="e.g. Need for wedding ceremony, ensure well-polished"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          {totalRent !== null && (
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated total</span>
                <span className="font-bold text-amber-700 text-lg">
                  {formatCurrency(totalRent)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Based on ₹{jewellery.rentPerDay}/day · final amount confirmed by supplier
              </p>
            </div>
          )}

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            <Calendar className="h-4 w-4" />
            Request Booking
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Booking Request"
        size="sm"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p><span className="font-medium">Item:</span> {jewellery.title}</p>
          <p><span className="font-medium">From:</span> {startDate && formatDateTime(new Date(startDate).toISOString())}</p>
          <p><span className="font-medium">To:</span> {endDate && formatDateTime(new Date(endDate).toISOString())}</p>
          {totalRent !== null && (
            <p><span className="font-medium">Estimated rent:</span> {formatCurrency(totalRent)}</p>
          )}
          <p className="text-xs text-gray-500 rounded-lg bg-gray-50 p-3">
            The supplier must approve this request before it is confirmed. You will be notified.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Back
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Confirm Request
          </Button>
        </div>
      </Modal>
    </>
  );
}

// ─── Calendar section sub-component ─────────────────────────────────────────
function BookingCalendar({
  jewelleryId,
  refresh,
}: {
  jewelleryId: number;
  refresh: number;
}) {
  const { isAuthenticated } = useAuthStore();
  const [entries, setEntries] = useState<BookingCalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    // Show next 60 days
    const start = new Date().toISOString();
    const end = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    bookingService
      .getCalendar(jewelleryId, start, end)
      .then((data) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jewelleryId, isAuthenticated, refresh]);

  if (!isAuthenticated) return null;

  return (
    <Card>
      <h3 className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-amber-500" />
        Booking Calendar (next 60 days)
      </h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">No bookings in the next 60 days. All dates are free!</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.bookingId}
              className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-xs"
            >
              <span className="font-medium text-gray-700">
                {formatDate(e.startDateTime)} → {formatDate(e.endDateTime)}
              </span>
              <Badge
                className={
                  e.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }
              >
                {e.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JewelleryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<JewelleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) { router.replace("/explore"); return; }
    jewelleryService
      .getById(id)
      .then(setItem)
      .catch(() => toast.error("Jewellery not found"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!item) return null;

  const statusMeta = JEWELLERY_STATUS_META[item.status];

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-amber-50">
            <div className="relative h-80 sm:h-96">
              {item.imageUrls?.length > 0 ? (
                <Image
                  src={item.imageUrls[activeImage]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Star className="h-24 w-24 text-amber-200" />
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {item.imageUrls?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {item.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeImage
                        ? "border-amber-500"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <Card>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-100 text-amber-700">{item.category}</Badge>
              <Badge className={statusMeta.colour}>{statusMeta.label}</Badge>
              {item.available ? (
                <Badge className="bg-green-100 text-green-700">Available</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">Booked</Badge>
              )}
            </div>

            <h1 className="mb-1 text-2xl font-bold text-gray-900">{item.title}</h1>
            <p className="mb-4 text-sm text-gray-500">Listed by {item.supplierName}</p>
            <p className="mb-6 text-gray-700 leading-relaxed">{item.description}</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <Scale className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-semibold text-gray-900">{item.weightInGrams}g</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <IndianRupee className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-xs text-gray-500">Per Day</p>
                <p className="font-semibold text-gray-900">{formatCurrency(item.rentPerDay)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center col-span-2">
                <MapPin className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {item.addressLine}, {item.city} – {item.pincode}
                </p>
              </div>
            </div>

            {item.distanceKm != null && (
              <p className="mt-4 text-xs text-blue-600 font-medium">
                📍 {item.distanceKm.toFixed(1)} km from your location
              </p>
            )}
          </Card>

          {/* Bill documents */}
          {item.billUrls?.length > 0 && (
            <Card>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-amber-500" />
                Purchase Bills / Proof of Ownership
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.billUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Bill {i + 1}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Verification note */}
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Admin Verified</p>
              <p className="text-xs text-green-700 mt-0.5">
                This listing has been reviewed by our team. Purchase bills and supplier identity
                have been verified.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Booking panel */}
        <div className="space-y-4">
          {/* Price card */}
          <Card>
            <p className="text-3xl font-bold text-amber-700">
              {formatCurrency(item.rentPerDay)}
              <span className="ml-1 text-base font-normal text-gray-500">/ day</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Listed {formatDate(item.createdAt)}
            </p>
          </Card>

          <BookingForm
            jewellery={item}
            onBooked={() => setCalendarRefresh((n) => n + 1)}
          />

          <BookingCalendar
            jewelleryId={item.id}
            refresh={calendarRefresh}
          />
        </div>
      </div>
    </div>
  );
}
