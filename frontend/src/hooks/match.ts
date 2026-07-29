import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import matchService from "../services/api/matchService";

export function useMatchList(params?: { userId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["matches", params],
    queryFn: () => matchService.listMatches(params),
  });
}

export function useMatchHistory(matchId: string) {
  return useQuery({
    queryKey: ["history", matchId],
    queryFn: () => matchService.getHistory(matchId),
    enabled: !!matchId,
  });
}

export function useReplay(matchId: string) {
  return useQuery({
    queryKey: ["replay", matchId],
    queryFn: () => matchService.getReplay(matchId),
    enabled: !!matchId,
  });
}

export function useRestartMatch() {
  return useMutation({
    mutationFn: matchService.restartMatch,
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: string | { matchId: string; userId?: string }) => {
      if (typeof payload === "string") {
        return matchService.deleteMatch(payload);
      }
      return matchService.deleteMatch(payload.matchId, { userId: payload.userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
