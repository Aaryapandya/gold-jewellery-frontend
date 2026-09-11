// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "BUYER" | "SUPPLIER" | "ADMIN";

export type BookingStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type JewelleryStatus = "UNDER_VERIFICATION" | "ACTIVE" | "INACTIVE";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  /** True when admin has approved this user's identity documents */
  isVerified: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: "BUYER" | "SUPPLIER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  mobileNumber: string;
  role: UserRole;
  emailVerified: boolean;
  mobileVerified: boolean;
  active: boolean;
  address: string | null;
  city: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  profilePhotoUrl: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  panFrontUrl: string | null;
  panBackUrl: string | null;
  familyMembers: FamilyMember[];
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Jewellery ────────────────────────────────────────────────────────────────

export interface JewelleryItem {
  id: number;
  supplierId: number;
  supplierName: string;
  title: string;
  description: string;
  weightInGrams: number;
  rentPerDay: number;
  category: string;
  addressLine: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  available: boolean;
  status: JewelleryStatus;
  imageUrls: string[];
  billUrls: string[];
  createdAt: string;
  distanceKm?: number | null;
}

export interface CreateJewelleryRequest {
  title: string;
  description: string;
  weightInGrams: number;
  rentPerDay: number;
  category: string;
  addressLine: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface UpdateJewelleryRequest {
  title?: string;
  description?: string;
  weightInGrams?: number;
  rentPerDay?: number;
  category?: string;
  addressLine?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface BookingItem {
  id: number;
  jewelleryId: number;
  jewelleryTitle: string;
  buyerId: number;
  buyerName: string;
  supplierId: number;
  supplierName: string;
  startDateTime: string;
  endDateTime: string;
  actualReturnDateTime: string | null;
  totalAmount: number;
  status: BookingStatus;
  buyerNotes: string | null;
  rejectionReason: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  jewelleryId: number;
  startDateTime: string;
  endDateTime: string;
  buyerNotes?: string;
}

export interface BookingActionRequest {
  reason?: string;
}

export interface BookingCalendarEntry {
  bookingId: number;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalBuyers: number;
  totalSuppliers: number;
  totalBookings: number;
  activeBookings: number;
  requestedBookings: number;
  completedBookings: number;
}

export type DocumentType =
  | "aadhaar_front"
  | "aadhaar_back"
  | "pan_front"
  | "pan_back";

export const JEWELLERY_CATEGORIES = [
  "Necklace",
  "Bangles",
  "Earrings",
  "Ring",
  "Bracelet",
  "Anklet",
  "Maang Tikka",
  "Nose Ring",
  "Waistband",
  "Other",
] as const;

export type JewelleryCategory = (typeof JEWELLERY_CATEGORIES)[number];
