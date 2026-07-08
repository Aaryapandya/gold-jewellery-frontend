import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { BookingStatus, JewelleryStatus } from "@/types";

// ─── Class name helper ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), "dd MMM yyyy");
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), "dd MMM yyyy, hh:mm a");
}

export function formatRelativeTime(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function toISOStringLocal(date: Date): string {
  return date.toISOString();
}

// ─── Booking status labels & colours ─────────────────────────────────────────

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; colour: string }
> = {
  REQUESTED: { label: "Requested", colour: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", colour: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", colour: "bg-red-100 text-red-800" },
  ACTIVE: { label: "Active", colour: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Completed", colour: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "Cancelled", colour: "bg-rose-100 text-rose-700" },
};

// ─── Jewellery status labels & colours ───────────────────────────────────────

export const JEWELLERY_STATUS_META: Record<
  JewelleryStatus,
  { label: string; colour: string }
> = {
  UNDER_VERIFICATION: {
    label: "Under Verification",
    colour: "bg-yellow-100 text-yellow-800",
  },
  ACTIVE: { label: "Active", colour: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactive", colour: "bg-gray-100 text-gray-600" },
};

// ─── Rental duration calculator ───────────────────────────────────────────────

export function calculateTotalRent(
  startISO: string,
  endISO: string,
  rentPerDay: number
): number {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const days = Math.ceil(hours / 24);
  return Math.max(days, 1) * rentPerDay;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

// ─── Truncation ───────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`;
}

// ─── Initials ─────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
