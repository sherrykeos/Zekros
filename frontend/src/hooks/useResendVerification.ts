import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";

export function useResendVerification() {
  const mutation = useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Could not resend the verification email.")
      : null,
  };
}
