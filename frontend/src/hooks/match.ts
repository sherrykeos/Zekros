import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import matchService from "../services/api/matchService";

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