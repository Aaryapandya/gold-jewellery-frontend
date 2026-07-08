import apiClient from "@/lib/api-client";
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload
    );
    return data.data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload
    );
    return data.data;
  },
};
