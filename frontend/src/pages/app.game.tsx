import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ChevronLeft, Pause, Flag } from "lucide-react";

import { Board } from "@/components/game/board";
import { GameInfoPanel } from "@/components/game/game-info-panel";
import { GameStatusPanel } from "@/components/game/game-status-panel";
import { MoveHistoryPanel } from "@/components/game/move-history-panel";
import { ResultModal, type GameOutcome } from "@/components/game/result-modal";
import {
  defaultConfig,
  normalizeMatchConfig,
  type CellState,
  type MatchConfig,
  type MoveRecord,
  type Player,
} from "@/components/game/types";

import { useGameState, usePlayMove, useResetGame } from "@/hooks/game";

type BackendSymbol = "X" | "O";

type BackendCell = {
  id: string;
  row: number;
  col: number;
  owner: BackendSymbol | null;
};

type BackendGameState = {
  board?: BackendCell[] | { cells?: BackendCell[] };
  currentTurn?: BackendSymbol;
  winner?: BackendSymbol | null;
  draw?: boolean;
  gameOver?: boolean;
  players?: Record<BackendSymbol, { activePieces?: string[]; reclaimTokens?: number }>;
  expiringPiece?: BackendCell | null;
  validMoves?: BackendCell[];
  appliedMoves?: any[];
  match?: { moveHistory?: any[] };
};

export const Route = createFileRoute("/app/game")({
  head: () => ({ meta: [{ title: "Match - ZEKROS" }] }),
  component: GamePage,
});

function toPlayer(symbol?: BackendSymbol | null): Player {
  return symbol === "O" ? "o" : "x";
}

function cellIndex(cell: Pick<BackendCell, "row" | "col">, boardSize: number) {
  return cell.row * boardSize + cell.col;
}

function boardCells(state: BackendGameState | null): BackendCell[] {
  const board = state?.board;
  if (Array.isArray(board)) return board;
  return board?.cells ?? [];
}

function cellsFromState(state: BackendGameState | null, total: number): CellState[] {
  const source = boardCells(state);
  if (!source.length) return Array(total).fill(null);

  const boardSize = Math.sqrt(total);
  const cells = Array<CellState>(total).fill(null);
  for (const cell of source) {
    cells[cellIndex(cell, boardSize)] = cell.owner ? toPlayer(cell.owner) : null;
  }
  return cells;
}

function movesFromHistory(history: any[] = [], boardSize: number): MoveRecord[] {
  return history
    .filter((entry) => entry?.move?.row != null && entry?.move?.col != null)
    .map((entry, index) => ({
      index,
      player: toPlayer(entry.player),
      cell: entry.move.row * boardSize + entry.move.col,
      kind: entry.metadata?.isReclaimMove ? "reclaim" : "place",
      at: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(),
    }));
}

function statusFromState(state: BackendGameState | null, playerSymbol: Player) {
  if (!state?.gameOver) return "playing" as const;
  if (state.draw || !state.winner) return "draw" as const;
  return toPlayer(state.winner) === playerSymbol ? "won" : "lost";
}

function outcomeFromState(state: BackendGameState, playerSymbol: Player): GameOutcome {
  if (state.draw || !state.winner) return "draw";
  return toPlayer(state.winner) === playerSymbol ? "win" : "loss";
}

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const launchState =
    (location.state as
      | {
          config?: MatchConfig;
          mode?: MatchConfig["mode"];
          matchId?: string;
          roomCode?: string;
          playerId?: string;
          playerIds?: Partial<Record<Player, string>>;
        }
      | undefined) ?? {};

  const config = useMemo(
    () =>
      normalizeMatchConfig({
        ...defaultConfig,
        ...launchState.config,
        mode: launchState.config?.mode ?? launchState.mode ?? defaultConfig.mode,
      }),
    [launchState.config, launchState.mode],
  );

  const total = config.boardSize * config.boardSize;
  const matchId = typeof launchState.matchId === "string" ? launchState.matchId : "";
  const roomCode = typeof launchState.roomCode === "string" ? launchState.roomCode : "";
  const playerIds = useMemo(
    () => ({
      x: launchState.playerIds?.x ?? launchState.playerId ?? "",
      o: launchState.playerIds?.o ?? "",
    }),
    [launchState.playerId, launchState.playerIds],
  );

  const [cells, setCells] = useState<CellState[]>(() => Array(total).fill(null));
  const [turn, setTurn] = useState<Player>(config.startingPlayer);
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [serverState, setServerState] = useState<BackendGameState | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [resultOpen, setResultOpen] = useState(false);
  const [outcome, setOutcome] = useState<GameOutcome>("draw");

  const {
    data: gameStateResponse,
    isLoading: isLoadingGameState,
    isFetching: isFetchingGameState,
  } = useGameState(matchId);
  const { mutateAsync: playMove, isPending: isPlayingMove } = usePlayMove();
  const { mutateAsync: resetGame, isPending: isResettingGame } = useResetGame();

  const applyServerState = useCallback(
    (state: BackendGameState | null) => {
      if (!state) return;

      setServerState(state);
      setCells(cellsFromState(state, total));
      setTurn(toPlayer(state.currentTurn));
      setMoves(movesFromHistory(state.match?.moveHistory ?? state.appliedMoves, config.boardSize));

      if (state.gameOver) {
        setOutcome(outcomeFromState(state, config.playerSymbol));
        setResultOpen(true);
      }
    },
    [config.boardSize, config.playerSymbol, total],
  );

  useEffect(() => {
    if (!matchId || !gameStateResponse?.data) return;
    applyServerState(gameStateResponse.data);
  }, [applyServerState, gameStateResponse, matchId]);

  useEffect(() => {
    setStartedAt(Date.now());
    setResultOpen(false);
  }, [matchId]);

  const counts = useMemo(() => {
    const players = serverState?.players;
    if (players) {
      return {
        x: players.X?.activePieces?.length ?? 0,
        o: players.O?.activePieces?.length ?? 0,
      };
    }

    let x = 0;
    let o = 0;
    for (const c of cells) {
      if (c === "x") x++;
      else if (c === "o") o++;
    }
    return { x, o };
  }, [cells, serverState]);

  const playableCells = useMemo(() => {
    if (serverState?.validMoves?.length) {
      return serverState.validMoves.map((cell) => cellIndex(cell, config.boardSize));
    }

    return cells.flatMap((cell, index) => (cell ? [] : [index]));
  }, [cells, config.boardSize, serverState]);

  const aboutToVanish = useMemo(() => {
    if (!serverState?.expiringPiece) return [];

    const index = cellIndex(serverState.expiringPiece, config.boardSize);
    return cells[index] ? [index] : [];
  }, [cells, config.boardSize, serverState]);

  const isHumanTurn = !matchId || Boolean(playerIds[turn]);

  const syncGameState = async () => {
    if (!matchId) return;
    await queryClient.invalidateQueries({ queryKey: ["game", matchId] });
  };

  const handleCell = async (i: number) => {
    if (!playableCells.includes(i) || !isHumanTurn) return;

    if (matchId) {
      const row = Math.floor(i / config.boardSize);
      const col = i % config.boardSize;
      const activePlayerId = playerIds[turn];

      if (!activePlayerId) {
        await syncGameState();
        return;
      }

      try {
        const response = await playMove({
          matchId,
          playerId: activePlayerId,
          move: `${row}-${col}`,
          roomCode,
        });

        if (!response?.success) {
          console.error(response?.error?.message ?? "Unable to play move.");
          await syncGameState();
          return;
        }

        const state = response.data as BackendGameState;
        applyServerState(state);
        setLastMove(i);
        await syncGameState();
      } catch (error) {
        console.error(error);
        await syncGameState();
      }
      return;
    }

    if (cells[i]) return;

    const next = cells.slice();
    next[i] = turn;
    setCells(next);
    setLastMove(i);
    setMoves((current) => [
      ...current,
      {
        index: current.length,
        player: turn,
        cell: i,
        kind: "place",
        at: Date.now(),
      },
    ]);
    setTurn(turn === "x" ? "o" : "x");
  };

  const handleReset = async () => {
    const resetStartedAt = Date.now();

    if (matchId) {
      try {
        const response = await resetGame(matchId);
        const restartedState = response?.data?.game ?? null;
        if (restartedState) {
          applyServerState(restartedState);
        }
        await syncGameState();
      } catch (error) {
        console.error(error);
        await syncGameState();
      }
    } else {
      setCells(Array(total).fill(null));
      setMoves([]);
      setLastMove(null);
      setTurn(config.startingPlayer);
      setServerState(null);
    }

    setStartedAt(resetStartedAt);
    setResultOpen(false);
  };

  const finish = (o: GameOutcome) => {
    setOutcome(o);
    setResultOpen(true);
  };

  const status = statusFromState(serverState, config.playerSymbol);
  const winner = serverState?.winner ? toPlayer(serverState.winner) : null;
  const tokensX = serverState?.players?.X?.reclaimTokens ?? config.reclaimTokens;
  const tokensO = serverState?.players?.O?.reclaimTokens ?? config.reclaimTokens;
  const boardDisabled =
    isPlayingMove ||
    isResettingGame ||
    isFetchingGameState ||
    (!!matchId && isLoadingGameState) ||
    !isHumanTurn ||
    status !== "playing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="glass flex items-center justify-between rounded-2xl px-4 py-2.5">
        <button
          onClick={() => navigate({ to: "/app/play" })}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/4 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/6 hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Leave match
        </button>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Match - {config.boardSize}x{config.boardSize} - {config.mode}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/4 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Pause className="size-3.5" /> Pause
          </button>
          <button
            onClick={() => finish("loss")}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/4 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Flag className="size-3.5" /> Resign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <div className="order-2 xl:order-1">
          <GameInfoPanel
            config={config}
            playerName={config.mode === "local" ? "Crosses" : "You"}
            opponentName={
              config.mode === "multiplayer"
                ? "Opponent"
                : config.mode === "local"
                  ? "Circles"
                  : "Smart AI"
            }
            turn={turn}
          />
        </div>

        <div className="order-1 xl:order-2">
          <Board
            size={config.boardSize}
            cells={cells}
            currentPlayer={turn}
            lastMove={lastMove}
            aboutToVanish={aboutToVanish}
            playableCells={isHumanTurn ? playableCells : []}
            disabled={boardDisabled}
            onCellClick={handleCell}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => void handleReset()}
              className="rounded-md border border-white/10 bg-white/3 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/6 hover:text-foreground"
            >
              Reset board
            </button>
          </div>
        </div>

        <div className="order-3">
          <GameStatusPanel
            key={startedAt}
            turn={turn}
            status={status}
            activeX={counts.x}
            activeO={counts.o}
            tokensX={tokensX}
            tokensO={tokensO}
            maxActive={config.maxActivePieces}
            maxTokens={config.reclaimTokens}
            moveCount={moves.length}
            winner={winner}
            startedAt={startedAt}
          />
        </div>
      </div>

      <MoveHistoryPanel moves={moves} currentMove={moves.length - 1} />

      <ResultModal
        open={resultOpen}
        outcome={outcome}
        durationMs={Date.now() - startedAt}
        onPlayAgain={() => void handleReset()}
        onClose={() => setResultOpen(false)}
      />
    </motion.div>
  );
}
