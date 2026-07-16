import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/api/auth.api";
import { getAccessToken, setAccessToken } from "@/services/client";
import type { AuthUser } from "@/types/auth";
import { getApiErrorStatus } from "@/lib/api-error";
import { authKeys } from "./auth.keys";

export const CURRENT_USER_QUERY_KEY = authKeys.currentUser;

async function restoreAccessToken() {
  if (getAccessToken()) return true;

  try {
    const session = await authApi.refresh();
    setAccessToken(session.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

async function loadCurrentUser(): Promise<AuthUser | null> {
  const hasAccessToken = await restoreAccessToken();

  if (!hasAccessToken) {
    return null;
  }

  try {
    return await authApi.getCurrentUser();
  } catch (error) {
    if (getApiErrorStatus(error) === 401) {
      setAccessToken(null);
      return null;
    }

    throw error;
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: loadCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
