import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ResetPasswordRequest } from "@/types/auth";

export function useResetPassword() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      window.setTimeout(() => {
        void navigate({ to: "/auth/sign-in" });
      }, 1200);
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getApiErrorMessage(mutation.error, "Could not reset password.") : null,
  };
}
