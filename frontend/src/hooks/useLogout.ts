import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import { setAccessToken } from "@/services/client";
import { authKeys } from "./auth.keys";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      void navigate({ to: "/" });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getApiErrorMessage(mutation.error, "Sign out failed.") : null,
  };
}
