import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import { setAccessToken } from "@/services/client";
import { authKeys } from "./auth.keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { username?: string; email?: string; avatar?: string }) =>
      authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.currentUser, updatedUser);
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Failed to update profile.")
      : null,
  };
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      setAccessToken(null);
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      void navigate({ to: "/" });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Failed to delete account.")
      : null,
  };
}
