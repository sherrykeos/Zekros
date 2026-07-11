import { useState } from "react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { motion } from "motion/react";
import { BotModesGrid } from "@/components/game/bot-modes";
import { SectionHeader } from "@/components/app/primitives";
import { GameConfigurationPage } from "@/components/play/play-config";
import {
  defaultConfig,
  normalizeMatchConfig,
  type MatchConfig,
  type GameMode,
} from "@/components/game/types";
import { useAuth } from "@/contexts/auth";
import { useCreateRoom, useJoinRoom, useStartRoom } from "@/hooks/room";

export const Route = createFileRoute("/app/setup")({
  head: () => ({ meta: [{ title: "Match setup - ZEKROS" }] }),
  component: SetupPage,
});

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
  const { user } = useAuth();
  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useCreateRoom();
  const { mutateAsync: joinRoom, isPending: isJoiningRoom } = useJoinRoom();
  const { mutateAsync: startRoom, isPending: isStartingRoom } = useStartRoom();
  const [isLaunching, setIsLaunching] = useState(false);
  const initialMode = (location.state as { mode?: GameMode } | undefined)?.mode;
  const isStarting = isLaunching || isCreatingRoom || isJoiningRoom || isStartingRoom;

  const handleLaunch = async (config: MatchConfig) => {
    if (isStarting) return;

    const normalizedConfig = normalizeMatchConfig(config);

    if (normalizedConfig.mode === "multiplayer") {
      void navigate({
        to: "/app/lobby",
        state: { config: normalizedConfig, mode: normalizedConfig.mode },
      });
      return;
    }

    setIsLaunching(true);

    try {
      const gameMode = backendMode(normalizedConfig.mode);
      const hostId = user?.id ?? `player_${Date.now()}`;
      const hostName = user?.name ?? "Player";
      const secondPlayerId = `player_local_o_${Date.now()}`;
      const isBotMode = gameMode !== "HUMAN_VS_HUMAN";

      const roomResult = await createRoom({
        host: { id: hostId, name: hostName },
        settings: { gameMode, isPrivate: true },
        metadata: { source: "frontend", config: normalizedConfig },
      });

      if (!roomResult?.success) {
        console.error(roomResult?.error?.message ?? "Unable to create room.");
        return;
      }

      const roomCode = roomResult.data?.code;

      if (!isBotMode) {
        const joinResult = await joinRoom({
          roomCode,
          playerName: "Local Player 2",
          playerId: secondPlayerId,
        });

        if (!joinResult?.success) {
          console.error(joinResult?.error?.message ?? "Unable to add second local player.");
          return;
        }
      }

      const startResult = await startRoom({
        roomCode,
        config: backendConfig(normalizedConfig),
        metadata: {
          source: "frontend",
          playerId: hostId,
          gameMode,
        },
      });

      if (startResult?.success) {
        void navigate({
          to: "/app/game",
          state: {
            matchId: startResult.data?.id,
            roomCode,
            playerId: hostId,
            playerIds: isBotMode ? { x: hostId } : { x: hostId, o: secondPlayerId },
            config: normalizedConfig,
            mode: normalizedConfig.mode,
          },
        });
        return;
      }

      console.error(startResult?.error?.message ?? "Unable to start match.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-6"
    >
      <GameConfigurationPage
        initialMode={initialMode}
        isStarting={isStarting}
        onStart={handleLaunch}
      />

      <section>
        <SectionHeader
          title="Bot modes"
          description="Pick an AI personality. Both run locally with no setup."
        />
        <BotModesGrid
          onLaunch={() =>
            void handleLaunch({
              ...defaultConfig,
              mode: "smart",
            } as MatchConfig)
          }
        />
      </section>
    </motion.div>
  );
}
