import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import { setAccessToken } from "@/services/client";
import type { LoginRequest } from "@/types/auth";
import { authKeys } from "./auth.keys";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (session) => {
      setAccessToken(session.accessToken);
      queryClient.setQueryData(authKeys.currentUser, session.user);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      void navigate({ to: "/app/play" });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Sign in failed.")
      : null,
  };
}
