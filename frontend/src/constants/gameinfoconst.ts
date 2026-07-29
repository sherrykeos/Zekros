export interface GameInfoDetail {
  title: string;
  description: string;
}

export const GAME_INFO: Record<string, GameInfoDetail> = {
  boardSize: {
    title: "Board Size",
    description:
      "Dimensions of the grid (3×3, 4×4, 5×5). Form a matching line along any row, column, or diagonal to win.",
  },
  maxActivePieces: {
    title: "Max Active Pieces",
    description:
      "Maximum number of pieces allowed on the board simultaneously per player. Placing beyond this limit causes your oldest piece to vanish.",
  },
  reclaimTokens: {
    title: "Reclaim Tokens",
    description:
      "Special tokens that allow you to manually remove one of your active pieces from the board to create new strategic opportunities.",
  },
  smartBot: {
    title: "Smart Bot",
    description:
      "An adaptive heuristic AI that evaluates board patterns, creates tactical setups, and blocks opponent threats.",
  },
  perfectBot: {
    title: "Perfect Bot",
    description:
      "An unbeatable minimax algorithm engine that evaluates all potential game outcomes to play flawless strategy.",
  },
  pvpMode: {
    title: "PvP (Pass & Play)",
    description:
      "Local two-player match played turn-by-turn on a single screen.",
  },
  playerSymbol: {
    title: "Player Symbol",
    description:
      "The piece symbol (X or O) assigned to you in the match.",
  },
};
