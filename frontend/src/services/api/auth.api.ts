import { api } from "../client";

import type {
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "../../types/api";

export const authApi = {
  async register(data: RegisterRequest): Promise<void> {
    await api.post("/auth/register", data);
  },

  async login(data: LoginRequest): Promise<void> {
    await api.post("/auth/login", data);
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<CurrentUserResponse>("/auth/me");
    return response.data.user;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post("/auth/verify-email", { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post("/auth/resend-verification", { email });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/reset-password", data);
  },

  async refresh(): Promise<void> {
    await api.post("/auth/refresh");
  },
};