import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  DocumentType,
  FamilyMember,
  UpdateProfileRequest,
  UserProfile,
} from "@/types";

export const userService = {
  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return data.data;
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    const { data } = await apiClient.put<ApiResponse<UserProfile>>(
      "/users/me",
      payload
    );
    return data.data;
  },

  async uploadProfilePhoto(file: File): Promise<UserProfile> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ApiResponse<UserProfile>>(
      "/users/me/photo",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async uploadDocument(docType: DocumentType, file: File): Promise<UserProfile> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ApiResponse<UserProfile>>(
      `/users/me/documents/${docType}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data } = await apiClient.get<ApiResponse<FamilyMember[]>>(
      "/users/me/family"
    );
    return data.data;
  },

  async addFamilyMember(payload: {
    name: string;
    relation: string;
  }): Promise<FamilyMember> {
    const { data } = await apiClient.post<ApiResponse<FamilyMember>>(
      "/users/me/family",
      payload
    );
    return data.data;
  },

  async removeFamilyMember(memberId: number): Promise<void> {
    await apiClient.delete(`/users/me/family/${memberId}`);
  },
};
