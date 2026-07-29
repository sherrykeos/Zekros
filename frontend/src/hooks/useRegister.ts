import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RegisterRequest } from "@/types/auth";

export function useRegister() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (_result, variables) => {
      void navigate({
        to: "/auth/check-email",
        search: { email: variables.email },
      });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Registration failed.")
      : null,
  };
}
