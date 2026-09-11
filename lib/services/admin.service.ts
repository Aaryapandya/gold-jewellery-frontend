import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  BookingItem,
  DashboardStats,
  JewelleryItem,
  JewelleryStatus,
  PagedResponse,
  UserProfile,
} from "@/types";

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
      "/admin/dashboard/stats"
    );
    return data.data;
  },

  // ─── Users ──────────────────────────────────────────────────────────────────

  async getAllUsers(params: {
    role?: string;
    city?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PagedResponse<UserProfile>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<UserProfile>>>(
      "/admin/users",
      { params: { page: 0, size: 20, ...params } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async getPendingVerificationUsers(
    page = 0,
    size = 20
  ): Promise<PagedResponse<UserProfile>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<UserProfile>>>(
      "/admin/users/pending-verification",
      { params: { page, size } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async getUserById(userId: number): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>(
      `/admin/users/${userId}`
    );
    return data.data;
  },

  async setUserActive(userId: number, active: boolean): Promise<UserProfile> {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      `/admin/users/${userId}/activate`,
      null,
      { params: { active } }
    );
    return data.data;
  },

  async verifyUserEmail(
    userId: number,
    verified: boolean
  ): Promise<UserProfile> {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      `/admin/users/${userId}/verify-email`,
      null,
      { params: { verified } }
    );
    return data.data;
  },

  async verifyUserMobile(
    userId: number,
    verified: boolean
  ): Promise<UserProfile> {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      `/admin/users/${userId}/verify-mobile`,
      null,
      { params: { verified } }
    );
    return data.data;
  },

  // ─── Jewellery ──────────────────────────────────────────────────────────────

  async getAllJewellery(params: {
    status?: JewelleryStatus;
    page?: number;
    size?: number;
  } = {}): Promise<PagedResponse<JewelleryItem>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<JewelleryItem>>>(
      "/admin/jewellery",
      { params: { page: 0, size: 20, ...params } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async changeJewelleryStatus(
    jewelleryId: number,
    status: JewelleryStatus
  ): Promise<JewelleryItem> {
    const { data } = await apiClient.patch<ApiResponse<JewelleryItem>>(
      `/admin/jewellery/${jewelleryId}/status`,
      null,
      { params: { status } }
    );
    return data.data;
  },

  // ─── Bookings ───────────────────────────────────────────────────────────────

  async getAllBookings(page = 0, size = 20): Promise<PagedResponse<BookingItem>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<BookingItem>>>(
      "/admin/bookings",
      { params: { page, size } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async cancelBooking(
    bookingId: number,
    reason: string
  ): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/admin/bookings/${bookingId}/cancel`,
      { reason }
    );
    return data.data;
  },
};
