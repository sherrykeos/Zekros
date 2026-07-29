export type AuthProviderName = "LOCAL" | "GOOGLE" | "local" | "google";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  provider?: AuthProviderName;
  isEmailVerified?: boolean;
  createdAt?: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type AuthMessage = {
  success: boolean;
  message: string;
};

export type LoginResult = AuthMessage & {
  accessToken: string;
  user: AuthUser;
};

export type RefreshResult = {
  success: boolean;
  accessToken: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
