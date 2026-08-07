import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ChevronLeft, Pause, Flag, Clock, RotateCcw, Info } from "lucide-react";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

import { Board } from "@/components/game/board";
import { GameInfoPanel } from "@/components/game/game-info-panel";
import { GameStatusPanel } from "@/components/game/game-status-panel";
import { MoveHistoryPanel } from "@/components/game/move-history-panel";
import { ResultModal, type GameOutcome } from "@/components/game/result-modal";
import { RematchModal } from "@/components/game/rematch-modal";
import { SinglePlayerPanel } from "@/components/game/single-player-panel";
import {
  defaultConfig,
  normalizeMatchConfig,
  type CellState,
  type MatchConfig,
  type MoveRecord,
  type Player,
} from "@/components/game/types";

import { useGameState, usePlayMove, useResetGame } from "@/hooks/game";
import { useSocketStore } from "@/store/useSocketStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PRESET_AVATARS } from "@/lib/avatar-presets";
import { audioManager } from "@/services/audio/AudioManager";

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
  players?: Record<
    BackendSymbol,
    { activePieces?: string[]; reclaimTokens?: number }
  >;
  expiringPiece?: BackendCell | null;
  validMoves?: BackendCell[];
  appliedMoves?: any[];
  match?: { moveHistory?: any[]; metadata?: any };
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

function cellsFromState(
  state: BackendGameState | null,
  total: number,
): CellState[] {
  const source = boardCells(state);
  if (!source.length) return Array(total).fill(null);

  const boardSize = Math.sqrt(total);
  const cells = Array<CellState>(total).fill(null);
  for (const cell of source) {
    cells[cellIndex(cell, boardSize)] = cell.owner
      ? toPlayer(cell.owner)
      : null;
  }
  return cells;
}

function movesFromHistory(
  history: any[] = [],
  boardSize: number,
): MoveRecord[] {
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

function outcomeFromState(
  state: BackendGameState,
  playerSymbol: Player,
): GameOutcome {
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
        mode:
          launchState.config?.mode ?? launchState.mode ?? defaultConfig.mode,
      }),
    [launchState.config, launchState.mode],
  );

  const { data: user } = useCurrentUser();
  const total = config.boardSize * config.boardSize;
  const matchId =
    typeof launchState.matchId === "string" ? launchState.matchId : "";
  const roomCode =
    typeof launchState.roomCode === "string" ? launchState.roomCode : "";
  const localPlayerId = launchState.playerId ?? user?.id ?? "";

  const [cells, setCells] = useState<CellState[]>(() =>
    Array(total).fill(null),
  );
  const [turn, setTurn] = useState<Player>(config.startingPlayer);
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [serverState, setServerState] = useState<BackendGameState | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [resultOpen, setResultOpen] = useState(false);
  const [outcome, setOutcome] = useState<GameOutcome>("draw");
  const [showConfigTooltip, setShowConfigTooltip] = useState(false);

  const [timeLeftX, setTimeLeftX] = useState<number>(config.timerDuration);
  const [timeLeftO, setTimeLeftO] = useState<number>(config.timerDuration);

  useEffect(() => {
    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const [rematchPending, setRematchPending] = useState(false);
  const [incomingRematch, setIncomingRematch] = useState<{
    senderId: string;
    senderName: string;
  } | null>(null);
  const [rematchDeclined, setRematchDeclined] = useState(false);

  const prevMoveCount = useRef(0);
  const prevGameOver = useRef(false);

  // Play gameStart sound on initial match load or matchId change
  useEffect(() => {
    audioManager.play("gameStart");
    prevMoveCount.current = 0;
    prevGameOver.current = false;
  }, [matchId]);

  // Track moves count for move/reclaim/opponentMove audio cues
  useEffect(() => {
    if (moves.length > prevMoveCount.current) {
      const latestMove = moves[moves.length - 1];
      const isMyMove = latestMove.player === config.playerSymbol;

      if (latestMove.kind === "reclaim") {
        audioManager.play("reclaim");
      } else if (isMyMove) {
        audioManager.play("move");
      } else {
        audioManager.play("opponentMove");
      }
      prevMoveCount.current = moves.length;
    }
  }, [moves, config.playerSymbol]);

  // Track game outcome for victory/defeat/draw audio cues
  useEffect(() => {
    if (resultOpen && !prevGameOver.current) {
      prevGameOver.current = true;
      if (outcome === "win") {
        audioManager.play("victory");
      } else if (outcome === "loss") {
        audioManager.play("defeat");
      } else {
        audioManager.play("draw");
      }
    }
  }, [resultOpen, outcome]);

  const {
    data: gameStateResponse,
    isLoading: isLoadingGameState,
    isFetching: isFetchingGameState,
  } = useGameState(matchId);
  const [isPlayingMove, setIsPlayingMove] = useState(false);
  const [isResettingGame, setIsResettingGame] = useState(false);
  const resetGameMutation = useResetGame();
  const { socket, connect } = useSocketStore();

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!roomCode || !socket || !localPlayerId) return;
    socket.emit("room:reconnect", { roomCode, playerId: localPlayerId });
  }, [roomCode, localPlayerId, socket]);

  const applyServerState = useCallback(
    (state: any) => {
      if (!state) return;

      // Normalize between raw MatchState and flattened SocketState
      const normalizedState: BackendGameState | null = state.game
        ? { ...state.game, match: state }
        : state;

      if (!normalizedState) return;

      setServerState(normalizedState);
      setCells(cellsFromState(normalizedState, total));
      setTurn(toPlayer(normalizedState.currentTurn));
      setMoves(
        movesFromHistory(
          normalizedState.match?.moveHistory ?? normalizedState.appliedMoves,
          config.boardSize,
        ),
      );

      if (normalizedState.gameOver) {
        let actualSymbol = config.playerSymbol;
        const participants = normalizedState.match?.metadata?.participants;
        if (participants && Array.isArray(participants)) {
          const p = participants.find((x: any) => x.id === localPlayerId);
          if (p) actualSymbol = p.symbol.toLowerCase() as Player;
        }

        setOutcome(outcomeFromState(normalizedState, actualSymbol));
        // Delay showing the result card so the user can see the win state/animation
        setTimeout(() => setResultOpen(true), 1500);
      }
    },
    [config.boardSize, config.playerSymbol, total, localPlayerId],
  );

  useEffect(() => {
    if (!matchId || !gameStateResponse?.data) return;
    applyServerState(gameStateResponse.data);
  }, [applyServerState, gameStateResponse, matchId]);

  useEffect(() => {
    if (!socket || !matchId) return;

    const onMatchUpdate = (payload: any) => {
      if (payload?.success && payload.data) {
        applyServerState(payload.data);
      }
    };

    const onMatchRematched = (payload: any) => {
      const data = payload?.data ?? payload;
      const newMatchId =
        data?.id ??
        data?.matchId ??
        data?.match?.id ??
        payload?.id;

      if ((payload?.success || payload?.id || data?.id) && newMatchId) {
        applyServerState(data);
        setStartedAt(Date.now());
        setResultOpen(false);
        setRematchPending(false);
        setIncomingRematch(null);
        setRematchDeclined(false);

        void navigate({
          to: "/app/game" as any,
          state: {
            ...launchState,
            matchId: newMatchId,
            roomCode: data?.roomCode ?? roomCode,
          } as any,
        });
      }
    };

    const onRematchOffered = (payload: any) => {
      const data = payload?.data ?? payload;
      if (data && data.senderId !== localPlayerId) {
        setResultOpen(false);
        setIncomingRematch({
          senderId: data.senderId,
          senderName: data.senderName ?? "Opponent",
        });
      }
    };

    const onRematchDeclined = () => {
      setRematchPending(false);
      setIncomingRematch(null);
      setRematchDeclined(true);
      setTimeout(() => {
        setRematchDeclined(false);
        void navigate({
          to: "/app/lobby" as any,
          state: {
            roomCode,
            playerId: localPlayerId,
            config,
            mode: config.mode,
          } as any,
        });
      }, 2000);
    };

    socket.on("match:update", onMatchUpdate);
    socket.on("match:rematched", onMatchRematched);
    socket.on("match:started", onMatchRematched);
    socket.on("match:rematch-offered", onRematchOffered);
    socket.on("match:rematch-declined", onRematchDeclined);

    return () => {
      socket.off("match:update", onMatchUpdate);
      socket.off("match:rematched", onMatchRematched);
      socket.off("match:started", onMatchRematched);
      socket.off("match:rematch-offered", onRematchOffered);
      socket.off("match:rematch-declined", onRematchDeclined);
    };
  }, [socket, matchId, applyServerState, total, launchState, navigate, roomCode, localPlayerId, config.mode]);

  useEffect(() => {
    setStartedAt(Date.now());
    setResultOpen(false);
  }, [matchId]);

  const actualSymbol: Player = useMemo(() => {
    if (config.mode === "multiplayer") {
      const participants = serverState?.match?.metadata?.participants;
      if (participants && Array.isArray(participants)) {
        const p = participants.find((x: any) => x.id === localPlayerId);
        if (p) return p.symbol.toLowerCase() as Player;
      }
    }
    return config.playerSymbol ?? "x";
  }, [config.mode, config.playerSymbol, localPlayerId, serverState]);

  const status = statusFromState(serverState, actualSymbol);

  // Sync / Reset timers when config.timerDuration or matchId changes
  useEffect(() => {
    setTimeLeftX(config.timerDuration);
    setTimeLeftO(config.timerDuration);
  }, [config.timerDuration, matchId]);

  // Handle Timeout Loss
  const handleTimeoutLoss = useCallback(
    (timedOutPlayer: Player) => {
      const isMeTimedOut = timedOutPlayer === actualSymbol;
      audioManager.play("defeat");
      setOutcome(isMeTimedOut ? "loss" : "win");
      setResultOpen(true);

      if (matchId) {
        const winner = timedOutPlayer === "x" ? "o" : "x";
        socket?.emit("finish-match", {
          matchId,
          roomCode,
          winner,
          reason: "timeout",
        });
      }
    },
    [actualSymbol, matchId, roomCode, socket],
  );

  // Active turn countdown interval
  useEffect(() => {
    if (config.timerDuration <= 0 || status !== "playing" || resultOpen) return;

    const interval = setInterval(() => {
      if (turn === "x") {
        setTimeLeftX((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeoutLoss("x");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeLeftO((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeoutLoss("o");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, status, resultOpen, config.timerDuration, handleTimeoutLoss]);
  const winner = serverState?.winner ? toPlayer(serverState.winner) : null;
  const tokensX =
    serverState?.players?.X?.reclaimTokens ?? config.reclaimTokens;
  const tokensO =
    serverState?.players?.O?.reclaimTokens ?? config.reclaimTokens;

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

  const aboutToVanish = useMemo(() => {
    const activeSymbol = (turn === "x" ? "X" : "O") as "X" | "O";
    const indices: number[] = [];

    const players = serverState?.players;
    if (players) {
      const active = players[activeSymbol]?.activePieces;
      if (active && active.length >= config.maxActivePieces) {
        const oldestCellId = active[0];
        const [row, col] = oldestCellId.split("-").map(Number);
        if (Number.isInteger(row) && Number.isInteger(col)) {
          const idx = row * config.boardSize + col;
          indices.push(idx);
        }
      }
    } else if (serverState?.expiringPiece) {
      if (!serverState.expiringPiece.owner || serverState.expiringPiece.owner === activeSymbol) {
        indices.push(cellIndex(serverState.expiringPiece, config.boardSize));
      }
    } else {
      // Local games fallback for current turn player
      const playerMoves = moves.filter((m) => m.player === turn);
      let count = 0;
      for (const c of cells) {
        if (c === turn) count++;
      }
      if (count >= config.maxActivePieces && playerMoves.length > 0) {
        const oldest = playerMoves.find((m) => cells[m.cell] === turn);
        if (oldest) indices.push(oldest.cell);
      }
    }

    return indices.filter((idx) => cells[idx] === turn);
  }, [cells, config.boardSize, config.maxActivePieces, serverState, moves, turn]);

  const playableCells = useMemo(() => {
    const valid: number[] = [];

    if (serverState?.validMoves?.length) {
      for (const cell of serverState.validMoves) {
        valid.push(cellIndex(cell, config.boardSize));
      }
    } else {
      for (let index = 0; index < cells.length; index++) {
        if (!cells[index]) {
          valid.push(index);
        }
      }
    }

    // Always ensure reclaimable expiring cells for the active turn player are playable if tokens > 0
    const currentTokens = turn === "x" ? tokensX : tokensO;
    if (currentTokens > 0 && aboutToVanish.length > 0) {
      for (const idx of aboutToVanish) {
        if (cells[idx] === turn && !valid.includes(idx)) {
          valid.push(idx);
        }
      }
    }

    return valid;
  }, [cells, config.boardSize, serverState, turn, tokensX, tokensO, aboutToVanish]);

  const winningCells = useMemo(() => {
    if (!serverState?.gameOver || !serverState?.winner) return undefined;

    const boardSize = config.boardSize;
    const winLength = config.winLength ?? (boardSize > 3 ? 4 : 3);
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (!cell) continue;

      const row = Math.floor(i / boardSize);
      const col = i % boardSize;

      for (const [rowStep, colStep] of directions) {
        let count = 1;
        let r = row;
        let c = col;
        const line = [i];

        while (true) {
          r += rowStep;
          c += colStep;

          if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) break;

          const nextIndex = r * boardSize + c;
          if (cells[nextIndex] !== cell) break;

          line.push(nextIndex);
          count++;

          if (count >= winLength) {
            return line;
          }
        }
      }
    }
    return undefined;
  }, [cells, config.boardSize, config.winLength, serverState]);

  const dynamicNames = useMemo(() => {
    if (config.mode === "local") {
      return { player: "Crosses", opponent: "Circles" };
    }
    const participants = serverState?.match?.metadata?.participants;
    if (Array.isArray(participants)) {
      const localPlayer = participants.find((p: any) => p.id === localPlayerId);
      const otherPlayer = participants.find((p: any) => p.id !== localPlayerId);
      return {
        player: localPlayer?.name ? `${localPlayer.name} (You)` : "You",
        opponent: otherPlayer?.name ?? (config.mode === "multiplayer" ? "Opponent" : "Smart AI"),
      };
    }
    return {
      player: "You",
      opponent: config.mode === "multiplayer" ? "Opponent" : "Smart AI",
    };
  }, [config.mode, serverState, localPlayerId]);

  const dynamicAvatars = useMemo(() => {
    const playerAvatar = user?.avatar ?? PRESET_AVATARS[0]?.dataUrl;
    let opponentAvatar: string | null = null;

    if (config.mode === "smart" || config.mode === "perfect") {
      opponentAvatar = PRESET_AVATARS[1]?.dataUrl ?? null; // Quantum Core Bot Avatar
    } else if (config.mode === "local") {
      opponentAvatar = PRESET_AVATARS[3]?.dataUrl ?? null; // Nebula Core Circles Avatar
    } else if (config.mode === "multiplayer") {
      const participants = serverState?.match?.metadata?.participants;
      if (Array.isArray(participants)) {
        const otherPlayer = participants.find((p: any) => p.id !== localPlayerId);
        if (otherPlayer?.avatar || otherPlayer?.avatarUrl) {
          opponentAvatar = otherPlayer.avatar ?? otherPlayer.avatarUrl;
        }
      }
      if (!opponentAvatar) {
        opponentAvatar = PRESET_AVATARS[2]?.dataUrl ?? null;
      }
    } else {
      opponentAvatar = PRESET_AVATARS[2]?.dataUrl ?? null;
    }

    return {
      player: playerAvatar,
      opponent: opponentAvatar,
    };
  }, [user?.avatar, config.mode, serverState, localPlayerId]);

  const turnLabel = useMemo(() => {
    if (config.mode === "local") {
      return turn === "x" ? "Crosses" : "Circles";
    }
    if (config.mode === "multiplayer") {
      const participants = serverState?.match?.metadata?.participants;
      if (Array.isArray(participants)) {
        const activePlayer = participants.find((p: any) => p.symbol?.toLowerCase() === turn);
        if (activePlayer?.name) {
          if (activePlayer.id === localPlayerId) {
            return `${activePlayer.name} (You)'s Turn`;
          }
          return `${activePlayer.name}'s Turn`;
        }
      }
      return turn === actualSymbol ? "Your Turn" : "Opponent's Turn";
    }
    if (turn === actualSymbol) {
      return "Your Turn";
    }
    return "AI's Turn";
  }, [config.mode, turn, actualSymbol, serverState, localPlayerId]);

  // We can determine our valid player symbols from the launchState (for local bots) or the server state (for multiplayer)
  const activeLocalSymbols = useMemo(() => {
    if (!matchId) return ["x", "o"]; // Local game

    if (config.mode === "local") {
      // Local PvP
      return ["x", "o"];
    }

    if (config.mode === "smart" || config.mode === "perfect") {
      // Human vs Bot
      return ["x"];
    }

    // Multiplayer: determine from serverState
    const symbols: Player[] = [];
    const participants = serverState?.match?.metadata?.participants;
    if (participants && Array.isArray(participants)) {
      const p = participants.find((x: any) => x.id === localPlayerId);
      if (p) {
        symbols.push(p.symbol.toLowerCase() as Player);
      }
    }

    // Fallback just in case
    if (symbols.length === 0) symbols.push("x");

    return symbols;
  }, [config.mode, localPlayerId, matchId, serverState]);

  const isHumanTurn = activeLocalSymbols.includes(turn);

  const syncGameState = async () => {
    if (!matchId) return;
    await queryClient.invalidateQueries({ queryKey: ["game", matchId] });
  };

  const handleCell = async (i: number) => {
    if (!playableCells.includes(i) || !isHumanTurn) return;

    if (matchId) {
      const row = Math.floor(i / config.boardSize);
      const col = i % config.boardSize;

      // Determine which player ID to send
      let activePlayerId = localPlayerId;
      if (config.mode === "local" && launchState.playerIds) {
        activePlayerId = launchState.playerIds[turn] ?? localPlayerId;
      }

      if (!activePlayerId) {
        await syncGameState();
        return;
      }

      try {
        setIsPlayingMove(true);
        socket?.emit(
          "match:move",
          {
            matchId,
            playerId: activePlayerId,
            move: `${row}-${col}`,
            roomCode,
          },
          async (response: any) => {
            setIsPlayingMove(false);
            if (!response?.success) {
              console.error(response?.error?.message ?? "Unable to play move.");
              await syncGameState();
              return;
            }

            const state = response.data;
            applyServerState(state);
            setLastMove(i);
            await syncGameState();
          },
        );
      } catch (error) {
        setIsPlayingMove(false);
        console.error(error);
        await syncGameState();
      }
      return;
    }

    const isReclaim = cells[i] === turn && aboutToVanish.includes(i);
    const currentTokens = turn === "x" ? tokensX : tokensO;

    if (cells[i] && (!isReclaim || currentTokens <= 0)) return;

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
        kind: isReclaim ? "reclaim" : "place",
        at: Date.now(),
      },
    ]);
    setTurn(turn === "x" ? "o" : "x");
  };

  const handleReset = async () => {
    const resetStartedAt = Date.now();

    if (config.mode === "multiplayer") {
      if (matchId) {
        setResultOpen(false);
        setRematchPending(true);
        socket?.emit("match:rematch-request", {
          roomCode,
          matchId,
          senderId: localPlayerId,
          senderName: user?.username ?? "Opponent",
        });
      }
      return;
    }

    setIsResettingGame(true);

    try {
      if (matchId) {
        try {
          const response = await resetGameMutation.mutateAsync(matchId);
          const resAny = response as any;
          const newMatchId =
            resAny?.data?.id ??
            resAny?.data?.matchId ??
            resAny?.data?.match?.id ??
            resAny?.id;

          if (newMatchId && newMatchId !== matchId) {
            setCells(Array(total).fill(null));
            setMoves([]);
            setLastMove(null);
            setTurn(config.startingPlayer);
            setServerState(null);
            setTimeLeftX(config.timerDuration);
            setTimeLeftO(config.timerDuration);
            setStartedAt(resetStartedAt);
            setResultOpen(false);

            void navigate({
              to: "/app/game" as any,
              state: {
                ...launchState,
                matchId: newMatchId,
                roomCode,
              } as any,
            });
            return;
          }
        } catch (err) {
          console.warn("Reset game API warning:", err);
        }
      }
    } finally {
      // Local fallback reset (for offline / local PvP or if match API fails)
      setCells(Array(total).fill(null));
      setMoves([]);
      setLastMove(null);
      setTurn(config.startingPlayer);
      setServerState(null);
      setTimeLeftX(config.timerDuration);
      setTimeLeftO(config.timerDuration);
      setStartedAt(resetStartedAt);
      setResultOpen(false);
      setIsResettingGame(false);
    }
  };

  const handleAcceptRematch = () => {
    socket?.emit("match:rematch-accept", { roomCode, matchId });
    setIncomingRematch(null);
  };

  const handleDeclineRematch = () => {
    socket?.emit("match:rematch-decline", {
      roomCode,
      matchId,
      senderId: localPlayerId,
    });
    setIncomingRematch(null);
    void navigate({
      to: "/app/lobby" as any,
      state: {
        roomCode,
        playerId: localPlayerId,
        config,
        mode: config.mode,
      } as any,
    });
  };

  const handleCancelRematchRequest = () => {
    setRematchPending(false);
    setRematchDeclined(false);
    void navigate({
      to: "/app/lobby" as any,
      state: {
        roomCode,
        playerId: localPlayerId,
        config,
        mode: config.mode,
      } as any,
    });
  };

  const handleLeaveMatch = () => {
    if (matchId && status === "playing") {
      const winnerSymbol = actualSymbol === "x" ? "O" : "X";
      socket?.emit("match:finish", {
        matchId,
        roomCode,
        winner: winnerSymbol,
      });
    }
    if (roomCode && localPlayerId) {
      socket?.emit("room:leave", { roomCode, playerId: localPlayerId });
    }
    navigate({ to: "/app/play" });
  };

  const handleResign = () => {
    if (status !== "playing") return;

    if (matchId) {
      const winnerSymbol = actualSymbol === "x" ? "O" : "X";
      socket?.emit("match:finish", {
        matchId,
        roomCode,
        winner: winnerSymbol,
      });
      socket?.emit("finish-match", {
        matchId,
        roomCode,
        winner: winnerSymbol,
      });
    } else {
      setOutcome("loss");
      setResultOpen(true);
    }
  };

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
      className="flex flex-col gap-3"
    >
      <div className="glass-pure flex items-center justify-between gap-1.5 sm:gap-2 rounded-2xl px-3 py-2 sm:px-4">
        <button
          onClick={handleLeaveMatch}
          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-md border border-white/10 bg-white/4 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs text-muted-foreground hover:bg-white/6 hover:text-foreground shrink-0 transition-all"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Leave match</span>
          <span className="sm:hidden">Leave</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div
            className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.22em] text-muted-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none"
            suppressHydrationWarning
          >
            Match - {config.boardSize}x{config.boardSize} - {config.mode}
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setShowConfigTooltip((prev) => !prev)}
              onBlur={() => setTimeout(() => setShowConfigTooltip(false), 200)}
              className="grid size-5 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer"
              aria-label="Match Configuration"
            >
              <Info className="size-3" />
            </button>

            {/* Hover & Touch Tap Tooltip / Card */}
            <div
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-black/95 p-3 sm:p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 ${
                showConfigTooltip
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary font-semibold mb-2 pb-1.5 border-b border-white/10 flex items-center justify-between">
                <span>Match Configuration</span>
                <span className="text-[9px] text-muted-foreground/80 uppercase">{config.mode}</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Board Size:</span>
                  <span className="text-foreground font-medium">{config.boardSize} × {config.boardSize}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Win Length:</span>
                  <span className="text-foreground font-medium">{config.winLength} in a row</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Max Active Pieces:</span>
                  <span className="text-foreground font-medium">{config.maxActivePieces}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Reclaim Tokens:</span>
                  <span className="text-foreground font-medium">{config.reclaimTokens}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Timer Clock:</span>
                  <span className="text-foreground font-medium">
                    {config.timerDuration > 0 ? `${config.timerDuration}s` : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Starting Player:</span>
                  <span className="text-foreground font-medium uppercase">Player {config.startingPlayer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResign}
            disabled={status !== "playing"}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-md border border-white/10 bg-white/4 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Flag className="size-3.5" />
            <span className="hidden sm:inline">Resign</span>
            <span className="sm:hidden font-mono text-[10px]">Resign</span>
          </button>
        </div>
      </div>

      {/* Layout Grid: Left (Opponent - Top on mobile, Left on laptop), Center (Board - Middle on mobile, Center on laptop), Right (Player - Bottom on mobile, Right on laptop) */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)_280px] items-stretch">
        {/* Opponent Box: Top on mobile, Left on laptop */}
        <div className="order-1 lg:order-1 flex flex-col justify-center">
          {/* Previous GameInfoPanel (kept as comment) */}
          {/* 
          <GameInfoPanel
            config={{ ...config, playerSymbol: actualSymbol }}
            playerName={dynamicNames.player}
            opponentName={dynamicNames.opponent}
            turn={turn}
            timeLeftX={timeLeftX}
            timeLeftO={timeLeftO}
          />
          */}
          <SinglePlayerPanel
            name={dynamicNames.opponent}
            symbol={actualSymbol === "x" ? "o" : "x"}
            active={turn !== actualSymbol}
            timeLeft={actualSymbol === "x" ? timeLeftO : timeLeftX}
            hasTimer={config.timerDuration > 0}
            activePieces={actualSymbol === "x" ? counts.o : counts.x}
            maxActivePieces={config.maxActivePieces}
            reclaimTokens={actualSymbol === "x" ? tokensO : tokensX}
            maxReclaimTokens={config.reclaimTokens}
            avatarUrl={dynamicAvatars.opponent}
          />
        </div>

        {/* Center Column: Board */}
        <div className="order-2 lg:order-2 flex flex-col items-center justify-center">
          <Board
            size={config.boardSize}
            cells={cells}
            currentPlayer={turn}
            lastMove={lastMove}
            winningCells={winningCells}
            aboutToVanish={aboutToVanish}
            playableCells={isHumanTurn ? playableCells : []}
            disabled={boardDisabled}
            onCellClick={handleCell}
            tokensX={tokensX}
            tokensO={tokensO}
          />
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <div
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-2.5 py-1 text-[11px] font-mono text-muted-foreground shadow-sm"
              title="Total match duration"
            >
              <Clock className="size-3 text-muted-foreground/80" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>

            {config.mode !== "multiplayer" && (
              <button
                onClick={() => void handleReset()}
                disabled={isResettingGame}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/6 hover:text-foreground transition-all disabled:opacity-50"
              >
                <RotateCcw className="size-3" />
                <span>{isResettingGame ? "Resetting..." : "Reset board"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Player Box: Bottom on mobile, Right on laptop */}
        <div className="order-3 lg:order-3 flex flex-col justify-center">
          {/* Previous GameStatusPanel (kept as comment) */}
          {/* 
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
            turnLabel={turnLabel}
          />
          */}
          <SinglePlayerPanel
            name={dynamicNames.player}
            symbol={actualSymbol}
            active={turn === actualSymbol}
            timeLeft={actualSymbol === "x" ? timeLeftX : timeLeftO}
            hasTimer={config.timerDuration > 0}
            activePieces={actualSymbol === "x" ? counts.x : counts.o}
            maxActivePieces={config.maxActivePieces}
            reclaimTokens={actualSymbol === "x" ? tokensX : tokensO}
            maxReclaimTokens={config.reclaimTokens}
            avatarUrl={dynamicAvatars.player}
            you
          />
        </div>
      </div>

      {/* <MoveHistoryPanel moves={moves} currentMove={moves.length - 1} /> */}

      <ResultModal
        open={resultOpen}
        outcome={outcome}
        durationMs={Date.now() - startedAt}
        matchId={matchId}
        mode={config.mode}
        winnerSymbol={winner}
        onPlayAgain={() => void handleReset()}
        onClose={() => setResultOpen(false)}
      />

      {incomingRematch && (
        <RematchModal
          open={Boolean(incomingRematch)}
          type="incoming"
          senderName={incomingRematch.senderName}
          onAccept={handleAcceptRematch}
          onDecline={handleDeclineRematch}
        />
      )}

      {rematchPending && (
        <RematchModal
          open={rematchPending}
          type="outgoing"
          onCancel={handleCancelRematchRequest}
        />
      )}

      {rematchDeclined && (
        <RematchModal
          open={rematchDeclined}
          type="declined"
          onCancel={handleCancelRematchRequest}
        />
      )}
    </motion.div>
  );
}
