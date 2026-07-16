import { api } from "@/services/client";
import type {
  AuthMessage,
  AuthUser,
  LoginRequest,
  LoginResult,
  RefreshResult,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth";

type CurrentUserResponse = {
  success: boolean;
  user: AuthUser;
};

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResult> {
    const response = await api.post<LoginResult>("/auth/login", data);
    return response.data;
  },

  async logout(): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>("/auth/logout");
    return response.data;
  },

  async refresh(): Promise<RefreshResult> {
    const response = await api.post<RefreshResult>("/auth/refresh");
    return response.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<CurrentUserResponse>("/auth/me");
    return response.data.user;
  },

  async verifyEmail(token: string): Promise<AuthMessage> {
    const response = await api.get<AuthMessage>("/auth/verify", {
      params: { token },
    });
    return response.data;
  },

  async resendVerification(email: string): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>("/auth/resend-verification", { email });
    return response.data;
  },

  async forgotPassword(email: string): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>("/auth/reset-password", data);
    return response.data;
  },
};
