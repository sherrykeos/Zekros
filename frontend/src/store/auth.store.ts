import { create } from "zustand";

/**
 * Represents the authenticated user.
 *
 * NOTE:
 * This should match the User object returned by the backend.
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  isEmailVerified: boolean;
}

/**
 * Global authentication state.
 */
interface AuthState {
  /**
   * Currently logged in user.
   * null means no authenticated user.
   */
  user: AuthUser | null;

  /**
   * True while checking authentication status
   * (for example when the app first loads).
   */
  isLoading: boolean;

  /**
   * Whether the user is authenticated.
   *
   * Derived from user != null,
   * but keeping it explicitly makes consuming components cleaner.
   */
  isAuthenticated: boolean;

  /**
   * Replace the current user.
   */
  setUser: (user: AuthUser | null) => void;

  /**
   * Update loading state.
   */
  setLoading: (loading: boolean) => void;

  /**
   * Completely clear authentication state.
   */
  clearAuth: () => void;
}

/**
 * Global authentication store.
 *
 * This store DOES NOT:
 * ❌ Call APIs
 * ❌ Navigate
 * ❌ Show toasts
 *
 * It ONLY stores authentication state.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  isLoading: true,

  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));