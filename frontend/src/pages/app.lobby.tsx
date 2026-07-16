import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MultiplayerLobby } from "@/components/game/multiplayer-lobby";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreateRoom, useStartRoom } from "@/hooks/room";
import type { MatchConfig } from "@/components/game/types";

export const Route = createFileRoute("/app/lobby")({
  head: () => ({ meta: [{ title: "Lobby - ZEKROS" }] }),
  component: LobbyRoute,
});

function LobbyRoute() {
  return (
    <RequireAuth>
      <LobbyPage />
    </RequireAuth>
  );
}

function LobbyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const launchState = (location.state as {
    roomCode?: string;
    room?: any;
    config?: MatchConfig;
    mode?: MatchConfig["mode"];
    playerId?: string;
  } | undefined) ?? {};
  const [roomCode, setRoomCode] = useState(launchState.roomCode ?? "");
  const [room, setRoom] = useState<any>(launchState.room ?? null);
  const [playerId, setPlayerId] = useState(launchState.playerId ?? "");
  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useCreateRoom();
  const { mutateAsync: startRoom, isPending: isStartingRoom } = useStartRoom();

  useEffect(() => {
    if (roomCode || !launchState.config || !user) return;

    void (async () => {
      try {
        const result = await createRoom({
          host: {
            id: user.id,
            name: user.username,
          },
          settings: {
            gameMode: "HUMAN_VS_HUMAN",
            isPrivate: true,
          },
          metadata: {
            source: "frontend",
            config: launchState.config,
          },
        });

        if (result?.success) {
          const nextCode = result.data?.code ?? "";
          setRoomCode(nextCode);
          setRoom(result.data);
          setPlayerId(result.data?.host?.id ?? user.id);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [createRoom, launchState.config, roomCode, user]);

  const handleStart = async () => {
    if (!roomCode || !launchState.config || !user) return;

    try {
      const result = await startRoom({
        roomCode,
        config: launchState.config,
        metadata: {
          source: "frontend",
          playerId: playerId || user.id,
        },
      });

      if (result?.success) {
        void navigate({
          to: "/app/game",
          state: {
            matchId: result.data?.id,
            roomCode,
            room,
            playerId: playerId || room?.host?.id || user.id,
            config: launchState.config,
            mode: launchState.mode ?? launchState.config.mode,
          },
        });
        return;
      }

      console.error(result?.error?.message ?? "Unable to start the match.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      <MultiplayerLobby
        variant="host"
        roomCode={roomCode}
        isStarting={isCreatingRoom || isStartingRoom}
        errorMessage={null}
        onStart={() => void handleStart()}
      />
    </motion.div>
  );
}
