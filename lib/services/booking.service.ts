import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  BookingActionRequest,
  BookingCalendarEntry,
  BookingItem,
  CreateBookingRequest,
  PagedResponse,
} from "@/types";

export const bookingService = {
  async create(payload: CreateBookingRequest): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      "/bookings",
      payload
    );
    return data.data;
  },

  async getById(id: number): Promise<BookingItem> {
    const { data } = await apiClient.get<ApiResponse<BookingItem>>(
      `/bookings/${id}`
    );
    return data.data;
  },

  async getMyBuyerBookings(
    page = 0,
    size = 20
  ): Promise<PagedResponse<BookingItem>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<BookingItem>>>(
      "/bookings/my/buyer",
      { params: { page, size } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async getMySupplierBookings(
    page = 0,
    size = 20
  ): Promise<PagedResponse<BookingItem>> {
    const { data } = await apiClient.get<ApiResponse<PagedResponse<BookingItem>>>(
      "/bookings/my/supplier",
      { params: { page, size } }
    );
    return { ...data.data, content: data.data.content ?? [] };
  },

  async approve(id: number): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/bookings/${id}/approve`,
      {}
    );
    return data.data;
  },

  async reject(id: number, payload: BookingActionRequest): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/bookings/${id}/reject`,
      payload
    );
    return data.data;
  },

  async cancel(id: number, payload: BookingActionRequest): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/bookings/${id}/cancel`,
      payload
    );
    return data.data;
  },

  async markActive(id: number): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/bookings/${id}/active`
    );
    return data.data;
  },

  async returnJewellery(id: number): Promise<BookingItem> {
    const { data } = await apiClient.post<ApiResponse<BookingItem>>(
      `/bookings/${id}/return`
    );
    return data.data;
  },

  async getCalendar(
    jewelleryId: number,
    windowStart?: string,
    windowEnd?: string
  ): Promise<BookingCalendarEntry[]> {
    const { data } = await apiClient.get<ApiResponse<BookingCalendarEntry[]>>(
      `/bookings/calendar/${jewelleryId}`,
      { params: { windowStart, windowEnd } }
    );
    return data.data;
  },
};
