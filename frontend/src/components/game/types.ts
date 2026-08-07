/**
 * Game UI types — surface-only.
 * TODO: realign with backend schema (REST + Socket) in Phase 5.
 */
export type Player = "x" | "o";
export type CellState = Player | null;

export type GameMode =
  "local" | "smart" | "perfect" | "multiplayer" | "quick" | "custom";

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
  /** Timer duration per player in seconds (0 = unlimited / no clock) */
  timerDuration: number;
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
  timerDuration: 120,
};

export function maxActiveFor(size: number): number {
  if (size === 3) return 3;
  if (size === 4) return 5;
  if (size === 5) return 8;
  return 10;
}

export function normalizeMatchConfig(
  config: Partial<MatchConfig> = {},
): MatchConfig {
  const boardSize = config.boardSize ?? defaultConfig.boardSize;
  const derivedWinLength = boardSize as MatchConfig["winLength"];

  const defaultActive = maxActiveFor(boardSize);
  let minActive: number = boardSize;
  let maxActive: number = boardSize;

  if (boardSize === 3) {
    minActive = 3;
    maxActive = 3;
  } else {
    minActive = boardSize;
    maxActive = 10;
  }

  const requestedActive = config.maxActivePieces ?? defaultActive;
  const derivedMaxActivePieces = Math.min(
    maxActive,
    Math.max(minActive, requestedActive),
  );

  return {
    ...defaultConfig,
    ...config,
    boardSize,
    winLength: derivedWinLength,
    maxActivePieces: derivedMaxActivePieces,
    reclaimTokens: config.reclaimTokens ?? derivedMaxActivePieces,
    timerDuration: config.timerDuration ?? 120,
  };
}
