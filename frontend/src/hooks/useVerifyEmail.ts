import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";

export function useVerifyEmail(token: string) {
  const query = useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  return {
    ...query,
    message: query.data?.message ?? null,
    errorMessage: query.error
      ? getApiErrorMessage(query.error, "Invalid or expired verification link.")
      : null,
  };
}
