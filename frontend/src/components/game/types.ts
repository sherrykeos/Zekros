/**
 * Game UI types — surface-only.
 * TODO: realign with backend schema (REST + Socket) in Phase 5.
 */
export type Player = "x" | "o";
export type CellState = Player | null;

export type GameMode = "local" | "smart" | "perfect" | "multiplayer" | "quick" | "custom";

export type Piece = {
  id: string;
  player: Player;
  cell: number;
  /** Number of turns left before the piece disappears. */
  ttl: number;
};

export type MatchConfig = {
  mode: GameMode;
  boardSize: 3 | 4 | 5 | 6;
  winLength: 3 | 4 | 5 | 6;
  maxActivePieces: number;
  reclaimTokens: number;
  playerSymbol: Player;
  startingPlayer: Player;
};

export type MoveRecord = {
  index: number;
  player: Player;
  cell: number;
  kind: "place" | "reclaim" | "vanish";
  at: number;
};

export const defaultConfig: MatchConfig = {
  mode: "smart",
  boardSize: 3,
  winLength: 3,
  // Auto-derived from boardSize; mirrored here for first-render fidelity.
  maxActivePieces: 3,
  // Defaults to maxActivePieces; user-tunable 0–10.
  reclaimTokens: 3,
  playerSymbol: "x",
  startingPlayer: "x",
};

export function normalizeMatchConfig(config: Partial<MatchConfig> = {}): MatchConfig {
  const boardSize = config.boardSize ?? defaultConfig.boardSize;
  const derivedMaxActivePieces = Math.min(boardSize, Math.max(1, config.maxActivePieces ?? boardSize));
  const derivedWinLength = boardSize as MatchConfig["winLength"];

  return {
    ...defaultConfig,
    ...config,
    boardSize,
    winLength: derivedWinLength,
    maxActivePieces: derivedMaxActivePieces,
    reclaimTokens: config.reclaimTokens ?? defaultConfig.reclaimTokens,
  };
}
