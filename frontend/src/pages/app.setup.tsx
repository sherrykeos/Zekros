import { useState, useEffect } from "react";
import {
  createFileRoute,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Users, Bot, Minus, Plus, Play } from "lucide-react";

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
import { JoinRoomModal } from "@/components/play/modals/join-room";
import { usePlayEntry } from "@/contexts/play-entry";

export const Route = createFileRoute("/app/setup")({
  head: () => ({ meta: [{ title: "Match Setup - ZEKROS" }] }),
  component: SetupPage,
});

type BoardSize = 3 | 4 | 5;
type BotDifficulty = "nbot" | "pbot";

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
  const { openAccountRequired } = usePlayEntry();

  const initialMode = (location.state as { mode?: GameMode } | undefined)?.mode;

  const [openJoin, setOpenJoin] = useState(false);
  const [mode, setMode] = useState<GameMode>(
    initialMode === "local" ? "local" : "smart",
  );
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [winLength, setWinLength] = useState<MatchConfig["winLength"]>(3);

  const [reclaimTokens, setReclaimTokens] = useState<number>(3);
  const [manualReclaim, setManualReclaim] = useState(false);

  const [isLaunching, setIsLaunching] = useState(false);
  const isStarting =
    isLaunching || isCreatingRoom || isJoiningRoom || isStartingRoom;

  // Sync board size changes with defaults unless manually overridden
  useEffect(() => {
    setWinLength(boardSize);
    if (!manualReclaim) {
      setReclaimTokens(maxActiveFor(boardSize));
    }
  }, [boardSize, manualReclaim]);

  const handleReclaimChange = (delta: number) => {
    setReclaimTokens((prev) => {
      const next = prev + delta;
      if (next >= 0 && next <= 10) {
        setManualReclaim(true);
        return next;
      }
      return prev;
    });
  };

  const handleLaunch = async () => {
    if (isStarting) return;

    // Use selected difficulty for bots
    const actualMode: GameMode = mode === "local" ? "local" : mode;

    const config: MatchConfig = {
      mode: actualMode,
      boardSize,
      winLength,
      reclaimTokens,
      maxActivePieces: maxActiveFor(boardSize), // Simplified for this layout as requested
      playerSymbol: "x",
      startingPlayer: "x",
    };

    const normalizedConfig = normalizeMatchConfig(config);
    setIsLaunching(true);

    if (actualMode === "multiplayer") {
      void navigate({
        to: "/app/lobby" as any,
        state: {
          config: normalizedConfig,
          mode: normalizedConfig.mode,
        } as any,
      });
      return;
    }

    try {
      const gameModeStr = backendMode(normalizedConfig.mode);
      const hostId = user?.id ?? `player_${Date.now()}`;
      const hostName = user?.username ?? "Local Player";
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
            name: "Local Player 2",
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
        // Smooth premium exit delay
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
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-foreground bg-background selection:bg-primary/20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto flex flex-col items-center gap-14 sm:gap-20 pb-12"
      >
        {/* Header (Using ZEKROS Design System Typography) */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Start New Match
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Strategy begins here.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="relative flex w-full max-w-[400px] p-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          {[
            { id: "local", label: "Local" },
            { id: "smart", label: "Bot" },
            { id: "multiplayer", label: "Multiplayer" },
          ].map((m) => {
            const isActive =
              mode === "local"
                ? m.id === "local"
                : mode === "multiplayer"
                  ? m.id === "multiplayer"
                  : m.id === "smart";
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as GameMode)}
                className={cn(
                  "relative flex-1 py-3 text-sm font-medium tracking-wide transition-colors rounded-full z-10",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute inset-0 bg-primary rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Board Size */}
        <section className="flex flex-col items-center gap-8 w-full">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Board Size
          </h2>
          <div className="flex items-center justify-center gap-12 sm:gap-20">
            {([3, 4, 5] as BoardSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setBoardSize(size)}
                className="group flex flex-col items-center gap-5 outline-none"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-[1.5px] transition-all duration-500 flex items-center justify-center relative",
                    boardSize === size
                      ? "border-primary bg-primary shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      : "border-white/[0.15] bg-white/[0.02] group-hover:border-white/[0.3]",
                  )}
                >
                  <AnimatePresence>
                    {boardSize === size && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-1.5 h-1.5 bg-primary-foreground rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={cn(
                    "font-display text-2xl font-semibold tracking-tight transition-colors duration-500",
                    boardSize === size
                      ? "text-foreground"
                      : "text-muted-foreground/40 group-hover:text-foreground/80",
                  )}
                >
                  {size}×{size}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Reclaim Tokens */}
        <section className="flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Reclaim Tokens
            </h2>
            <AnimatePresence>
              {manualReclaim && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="inline-flex text-[9px] uppercase tracking-[0.16em] text-primary"
                >
                  Custom override
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            <button
              onClick={() => handleReclaimChange(-1)}
              disabled={reclaimTokens <= 0}
              className="w-12 h-12 flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-white/[0.03] rounded-full text-3xl font-light transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              –
            </button>
            <div className="w-20 flex justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={reclaimTokens}
                  initial={{
                    opacity: 0,
                    y: -15,
                    filter: "blur(8px)",
                    scale: 0.9,
                  }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: 15, filter: "blur(8px)", scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-5xl sm:text-6xl font-semibold text-foreground"
                >
                  {reclaimTokens}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              onClick={() => handleReclaimChange(1)}
              disabled={reclaimTokens >= 10}
              className="w-12 h-12 flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-white/[0.03] rounded-full text-3xl font-light transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              +
            </button>
          </div>
        </section>

        {/* Bot Difficulty */}
        <div className="h-[90px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {(mode === "smart" || mode === "perfect") && (
              <motion.section
                key="bot-diff"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Bot Difficulty
                </h2>
                <div className="flex justify-center gap-3">
                  {[
                    { id: "smart", label: "Smart Bot" },
                    { id: "perfect", label: "Perfect Bot" },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setMode(diff.id as GameMode)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 border",
                        mode === diff.id
                          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                      )}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Play Button */}
        <motion.div
          className="pt-8 w-full max-w-sm"
          whileHover={{ scale: isStarting ? 1 : 1.02 }}
          whileTap={{ scale: isStarting ? 1 : 0.98 }}
        >
          <button
            onClick={handleLaunch}
            disabled={isStarting}
            className="group relative w-full py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg tracking-wide transition-all disabled:opacity-80 overflow-hidden shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] flex justify-center items-center"
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
                  className="flex items-center gap-3"
                >
                  <Play className="size-5 fill-primary-foreground" />
                  <span>Start Match</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {mode === "multiplayer" && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() =>
                  user ? setOpenJoin(true) : openAccountRequired()
                }
                className="mt-4 w-full py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground font-medium text-sm transition-colors"
              >
                Have a code? Join Room
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <JoinRoomModal open={openJoin} onOpenChange={setOpenJoin} />
      </motion.div>
    </div>
  );
}
