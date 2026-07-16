import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "../services/api/auth.api";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";
import type { LoginRequest } from "../types/api";

/**
 * Handles user login.
 *
 * Responsibilities:
 * - Send login request.
 * - Refresh the current-user query.
 * - Redirect after successful login.
 *
 * Does NOT:
 * - Store user manually.
 * - Manage tokens.
 * - Update global state.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: async () => {
      /**
       * Refresh the authenticated user.
       *
       * This calls GET /auth/me and updates the cache.
       */
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      });

      navigate({ to: "/app/play" });
    },
  });
}