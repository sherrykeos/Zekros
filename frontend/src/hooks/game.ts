import { useMutation, useQuery } from "@tanstack/react-query";

import gameService from "../services/api/gameService";

export function useGameState(matchId: string) {
  return useQuery({
    queryKey: ["game", matchId],
    queryFn: () => gameService.getGameState(matchId),
    enabled: !!matchId,
  });
}

export function usePlayMove() {
  return useMutation({
    mutationFn: gameService.playMove,
  });
}

export function useResetGame() {
  return useMutation({
    mutationFn: gameService.resetGame,
  });
}
