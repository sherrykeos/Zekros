import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "../services/api/auth.api";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

/**
 * Handles user logout.
 *
 * Responsibilities:
 * - Call the backend logout endpoint.
 * - Remove the cached authenticated user.
 * - Redirect the user.
 *
 * The backend remains the source of truth.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,

    onSuccess: async () => {
      /**
       * Remove the cached authenticated user.
       *
       * We know after logout there is no valid user,
       * so there's no need to refetch `/auth/me`.
       */
      queryClient.clear();

      navigate({ to: "/" });
    },
  });
}