import { useQuery } from "@tanstack/react-query";

import { authApi } from "../services/api/auth.api";


export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;



export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: authApi.getCurrentUser,

    retry: false,
    refetchOnWindowFocus: false,
  });
}