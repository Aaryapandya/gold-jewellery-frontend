import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  CreateJewelleryRequest,
  JewelleryItem,
  PagedResponse,
  UpdateJewelleryRequest,
} from "@/types";

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  category?: string;
  page?: number;
  size?: number;
}

export interface MyJewelleryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const jewelleryService = {
  async getNearby(
    params: NearbySearchParams
  ): Promise<PagedResponse<JewelleryItem>> {
    const { data } = await apiClient.get<PagedResponse<JewelleryItem>>(
      "/jewellery/nearby",
      { params }
    );
    return data;
  },

  async getById(id: number): Promise<JewelleryItem> {
    const { data } = await apiClient.get<ApiResponse<JewelleryItem>>(
      `/jewellery/${id}`
    );
    return data.data;
  },

  async getMine(params: MyJewelleryParams = {}): Promise<PagedResponse<JewelleryItem>> {
    const { data } = await apiClient.get<PagedResponse<JewelleryItem>>(
      "/jewellery/my",
      { params: { page: 0, size: 20, sortBy: "createdAt", sortDir: "desc", ...params } }
    );
    return data;
  },

  async create(payload: CreateJewelleryRequest): Promise<JewelleryItem> {
    const { data } = await apiClient.post<ApiResponse<JewelleryItem>>(
      "/jewellery",
      payload
    );
    return data.data;
  },

  async update(
    id: number,
    payload: UpdateJewelleryRequest
  ): Promise<JewelleryItem> {
    const { data } = await apiClient.put<ApiResponse<JewelleryItem>>(
      `/jewellery/${id}`,
      payload
    );
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/jewellery/${id}`);
  },

  async uploadImages(id: number, files: File[]): Promise<JewelleryItem> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const { data } = await apiClient.post<ApiResponse<JewelleryItem>>(
      `/jewellery/${id}/images`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async uploadBills(id: number, files: File[]): Promise<JewelleryItem> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const { data } = await apiClient.post<ApiResponse<JewelleryItem>>(
      `/jewellery/${id}/bills`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
};
