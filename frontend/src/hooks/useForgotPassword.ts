import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getApiErrorMessage(mutation.error, "Could not send reset link.") : null,
  };
}
