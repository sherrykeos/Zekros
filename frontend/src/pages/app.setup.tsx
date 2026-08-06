import { useState, useEffect } from "react";
import {
  createFileRoute,
  useNavigate,
  useLocation,
  Link,
} from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Users, Bot, Minus, Plus, Play, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type GameMode,
  type MatchConfig,
  normalizeMatchConfig,
  maxActiveFor,
} from "@/components/game/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useCreateRoom,
  useJoinRoom,
  useStartMatch as useStartRoom,
} from "@/hooks/room.hooks";
import { GAME_INFO } from "@/constants/gameinfoconst";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export const Route = createFileRoute("/app/setup")({
  head: () => ({ meta: [{ title: "Match Setup - ZEKROS" }] }),
  component: SetupPage,
});

type BoardSize = 3 | 4 | 5;

function backendMode(mode: GameMode) {
  if (mode === "perfect") return "HUMAN_VS_PBOT";
  if (mode === "smart") return "HUMAN_VS_NBOT";
  return "HUMAN_VS_HUMAN";
}

function backendConfig(config: MatchConfig) {
  return {
    boardSize: config.boardSize,
    winLength: config.winLength,
    maxActivePieces: config.maxActivePieces,
    reclaimTokens: config.reclaimTokens,
    gameMode: backendMode(config.mode),
    playerSymbol: config.playerSymbol,
    startingPlayer: config.startingPlayer,
  };
}

function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();

  const { mutateAsync: createRoom, isPending: isCreatingRoom } =
    useCreateRoom();
  const { mutateAsync: joinRoom, isPending: isJoiningRoom } = useJoinRoom();
  const { mutateAsync: startRoom, isPending: isStartingRoom } = useStartRoom();

  const initialMode = (location.state as { mode?: GameMode } | undefined)?.mode;

  // Main Tabs: "pvp" (2 player local) vs "bot" (vs AI)
  const [tab, setTab] = useState<"pvp" | "bot">(
    initialMode === "smart" || initialMode === "perfect" ? "bot" : "pvp",
  );

  // Bot difficulty: "smart" vs "perfect"
  const [botDifficulty, setBotDifficulty] = useState<"smart" | "perfect">(
    initialMode === "perfect" ? "perfect" : "smart",
  );

  // Match Configuration controls (Lobby logic)
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [maxActivePieces, setMaxActivePieces] = useState<number>(3);
  const [reclaimTokens, setReclaimTokens] = useState<number>(3);

  const [isLaunching, setIsLaunching] = useState(false);
  const isStarting =
    isLaunching || isCreatingRoom || isJoiningRoom || isStartingRoom;

  // Sync maxActivePieces & reclaimTokens whenever boardSize changes (Lobby logic)
  useEffect(() => {
    const defActive = maxActiveFor(boardSize);
    setMaxActivePieces(defActive);
    setReclaimTokens(boardSize);
  }, [boardSize]);

  // Min / Max bounds for Active Pieces depending on board size
  const minActive = boardSize === 3 ? 3 : boardSize;
  const maxActive = boardSize === 3 ? 3 : 10;

  const handleLaunch = async () => {
    if (isStarting) return;

    const actualMode: GameMode = tab === "pvp" ? "local" : botDifficulty;

    const config: MatchConfig = {
      mode: actualMode,
      boardSize,
      winLength: boardSize,
      reclaimTokens,
      maxActivePieces,
      playerSymbol: "x",
      startingPlayer: "x",
    };

    const normalizedConfig = normalizeMatchConfig(config);
    setIsLaunching(true);

    try {
      const gameModeStr = backendMode(normalizedConfig.mode);
      const hostId = user?.id ?? `player_${Date.now()}`;
      const hostName = user?.username ?? (tab === "pvp" ? "Player 1" : "Player");
      const secondPlayerId = `player_local_o_${Date.now()}`;
      const isBotMode = gameModeStr !== "HUMAN_VS_HUMAN";

      const roomResult = await createRoom({
        roomOptions: {
          host: { id: hostId, name: hostName },
          settings: { gameMode: gameModeStr, isPrivate: true },
          metadata: { source: "frontend", config: normalizedConfig },
        },
      });

      if (!roomResult) {
        console.error("Unable to create room.");
        return;
      }

      const roomCode = roomResult.code;

      if (!isBotMode) {
        const joinResult = await joinRoom({
          roomId: roomCode,
          playerInfo: {
            id: secondPlayerId,
            name: "Player 2",
          },
        });

        if (!joinResult) {
          console.error("Unable to add second local player.");
          return;
        }
      }

      const startResult = await startRoom({
        roomId: roomCode,
        config: backendConfig(normalizedConfig),
        metadata: {
          source: "frontend",
          playerId: hostId,
          gameMode: gameModeStr,
        },
      });

      if (startResult) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        void navigate({
          to: "/app/game" as any,
          state: {
            matchId: startResult.id,
            roomCode,
            playerId: hostId,
            playerIds: isBotMode
              ? { x: hostId }
              : { x: hostId, o: secondPlayerId },
            config: normalizedConfig,
            mode: normalizedConfig.mode,
          } as any,
        });
        return;
      }

      console.error("Unable to start match.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 text-foreground selection:bg-primary/20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl mx-auto flex flex-col items-center"
      >
        <Link
          to="/app/play"
          className="self-start mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Back to play
        </Link>
        <div className="w-full glass rounded-3xl border border-white/10 p-6 sm:p-8 space-y-8 bg-background/80 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              Match Setup
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Configure game parameters & start playing
            </p>
          </div>

          {/* Mode Switcher: PvP vs Bot */}
          <div className="relative flex w-full p-1 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={() => setTab("pvp")}
              className={cn(
                "relative flex-1 py-2 text-xs sm:text-sm font-medium tracking-wide transition-colors rounded-xl z-10 flex items-center justify-center gap-2",
                tab === "pvp"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="size-4" />
              <span>PvP (Pass & Play)</span>
              {tab === "pvp" && (
                <motion.div
                  layoutId="setup-tab-indicator"
                  className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
            <button
              onClick={() => setTab("bot")}
              className={cn(
                "relative flex-1 py-2 text-xs sm:text-sm font-medium tracking-wide transition-colors rounded-xl z-10 flex items-center justify-center gap-2",
                tab === "bot"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Bot className="size-4" />
              <span>Vs Bot</span>
              {tab === "bot" && (
                <motion.div
                  layoutId="setup-tab-indicator"
                  className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          </div>

          {/* Bot Difficulty Selector (Only visible in Bot tab) */}
          <AnimatePresence mode="wait">
            {tab === "bot" && (
              <motion.div
                key="bot-diff-section"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 pt-1 border-t border-white/5 overflow-hidden"
              >
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block text-center">
                  Bot Difficulty
                </label>
                <div className="flex justify-center gap-3">
                  {[
                    {
                      id: "smart",
                      label: "Smart Bot",
                      desc: "Adaptive Heuristic AI",
                      infoKey: "smartBot",
                    },
                    {
                      id: "perfect",
                      label: "Perfect Bot",
                      desc: "Unbeatable Minimax AI",
                      infoKey: "perfectBot",
                    },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setBotDifficulty(diff.id as any)}
                      className={cn(
                        "flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1 relative group/botbtn",
                        botDifficulty === diff.id
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                          : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{diff.label}</span>
                        <InfoTooltip info={GAME_INFO[diff.infoKey]} />
                      </div>
                      <span className="text-[10px] opacity-60 font-mono font-normal">
                        {diff.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Configuration Options */}
          <div className="space-y-8 pt-5 border-t border-white/5">
            {/* Board Size */}
            <div className="flex justify-between items-center px-2 py-2">
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Board Size
                </label>
                <InfoTooltip info={GAME_INFO.boardSize} />
              </div>
              <div className="flex justify-center gap-3">
                {([3, 4, 5] as BoardSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBoardSize(size)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                      boardSize === size
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                        : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Active Pieces */}
            <div className="flex justify-between items-center px-2 py-2">
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Max Active Pieces
                  </label>
                  <InfoTooltip info={GAME_INFO.maxActivePieces} />
                </div>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {boardSize === 3 ? "Fixed (3)" : `${minActive} – ${maxActive}`}
                </span>
              </div>

              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() =>
                    setMaxActivePieces((prev) => Math.max(minActive, prev - 1))
                  }
                  disabled={boardSize === 3 || maxActivePieces <= minActive}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-display text-2xl sm:text-3xl font-semibold w-10 text-center text-foreground">
                  {maxActivePieces}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMaxActivePieces((prev) => Math.min(maxActive, prev + 1))
                  }
                  disabled={boardSize === 3 || maxActivePieces >= maxActive}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Reclaim Tokens */}
            <div className="flex justify-between items-center px-2 py-2">
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Reclaim Tokens
                  </label>
                  <InfoTooltip info={GAME_INFO.reclaimTokens} />
                </div>
                <span className="font-mono text-xs text-muted-foreground/70">
                  0 – 10
                </span>
              </div>

              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() =>
                    setReclaimTokens((prev) => Math.max(0, prev - 1))
                  }
                  disabled={reclaimTokens <= 0}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-display text-2xl sm:text-3xl font-semibold w-10 text-center text-foreground">
                  {reclaimTokens}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setReclaimTokens((prev) => Math.min(10, prev + 1))
                  }
                  disabled={reclaimTokens >= 10}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Launch Action */}
          <div className="pt-4">
            <button
              onClick={handleLaunch}
              disabled={isStarting}
              className="group relative w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base tracking-wide transition-all disabled:opacity-80 overflow-hidden shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] flex justify-center items-center active:scale-[0.99]"
            >
              <AnimatePresence mode="wait">
                {isStarting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-5 h-5 border-[2.5px] border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2.5 font-bold"
                  >
                    <Play className="size-4 fill-primary-foreground" />
                    <span>
                      {tab === "pvp" ? "Start PvP Match" : "Start Bot Match"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
