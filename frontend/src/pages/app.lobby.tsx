import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Wifi,
  RefreshCcw,
  Users,
  Play,
  Crown,
  Copy,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useCreateRoom,
  useJoinRoom,
  useRegenerateRoomCode,
} from "@/hooks/room.hooks";
import { roomApi } from "@/services/api/room.api";
import {
  type MatchConfig,
  normalizeMatchConfig,
  defaultConfig,
  maxActiveFor,
} from "@/components/game/types";
import { useSocketStore } from "@/store/useSocketStore";
import { socketService } from "@/services/socket.service";

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

  const launchState =
    (location.state as
      | {
          roomCode?: string;
          room?: any;
          config?: MatchConfig;
          mode?: MatchConfig["mode"];
          playerId?: string;
        }
      | undefined) ?? {};

  const [roomCode, setRoomCode] = useState(launchState.roomCode ?? "");
  const [room, setRoom] = useState<any>(launchState.room ?? null);
  const [playerId, setPlayerId] = useState(launchState.playerId ?? "");

  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useCreateRoom();
  const { mutateAsync: joinRoom, isPending: isJoiningRoom } = useJoinRoom();
  const { mutateAsync: regenerateCode, isPending: isRegeneratingCode } =
    useRegenerateRoomCode();
  const { socket, connect } = useSocketStore();

  // Setup / Configuration state (when no active roomCode)
  const [tab, setTab] = useState<"create" | "join">("create");
  const [boardSize, setBoardSize] = useState<number>(3);
  const [maxActivePieces, setMaxActivePieces] = useState<number>(3);
  const [reclaimTokens, setReclaimTokens] = useState<number>(3);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);

  const [isStartingRoom, setIsStartingRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync maxActivePieces and reclaimTokens when boardSize changes
  useEffect(() => {
    const defActive = maxActiveFor(boardSize);
    setMaxActivePieces(defActive);
    setReclaimTokens(boardSize);
  }, [boardSize]);

  // Derived config from active room metadata or local selection
  const config = room?.metadata?.config
    ? normalizeMatchConfig({
        ...defaultConfig,
        ...room.metadata.config,
        mode: "multiplayer",
      })
    : (launchState.config ??
      normalizeMatchConfig({
        ...defaultConfig,
        mode: "multiplayer",
        boardSize: boardSize as any,
        maxActivePieces,
        reclaimTokens,
        playerSymbol,
        startingPlayer: playerSymbol,
      }));

  // Sync state if launchState changes
  useEffect(() => {
    if (launchState.roomCode && launchState.roomCode !== roomCode) {
      setRoomCode(launchState.roomCode);
      setRoom(launchState.room);
      setPlayerId(launchState.playerId ?? "");
    }
  }, [launchState.roomCode, launchState.room, launchState.playerId, roomCode]);

  // Connect socket
  useEffect(() => {
    connect();
  }, [connect]);

  // Handle socket room subscription & state updates
  useEffect(() => {
    if (!roomCode || !user) return;

    const activeSocket = socket || socketService.connect();
    const pid = playerId || user.id;

    const subscribeRoom = () => {
      activeSocket.emit("room:subscribe", { roomCode, playerId: pid });
      activeSocket.emit("room:get", { roomCode });
    };

    subscribeRoom();

    activeSocket.on("connect", subscribeRoom);

    const onRoomUpdated = (payload: any) => {
      const roomData = payload?.data ?? (payload?.id && payload?.code ? payload : null);
      if (roomData) {
        setRoom(roomData);
        if (roomData.code && roomData.code !== roomCode) {
          setRoomCode(roomData.code);
        }
      }
    };

    const onMatchStarted = (payload: any) => {
      const targetMatchId =
        payload?.data?.id ??
        payload?.data?.matchId ??
        payload?.data?.match?.id ??
        payload?.id;
      if ((payload?.success || payload?.id) && targetMatchId) {
        setTimeout(() => {
          setIsStartingRoom(false);
          void navigate({
            to: "/app/game" as any,
            state: {
              matchId: targetMatchId,
              roomCode,
              playerId: pid,
              config,
              mode: "multiplayer",
            } as any,
          });
        }, 300);
      }
    };

    activeSocket.on("room:update", onRoomUpdated);
    activeSocket.on("room-updated", onRoomUpdated);
    activeSocket.on("match:started", onMatchStarted);
    activeSocket.on("match:rematched", onMatchStarted);

    return () => {
      activeSocket.off("connect", subscribeRoom);
      activeSocket.off("room:update", onRoomUpdated);
      activeSocket.off("room-updated", onRoomUpdated);
      activeSocket.off("match:started", onMatchStarted);
      activeSocket.off("match:rematched", onMatchStarted);
    };
  }, [socket, roomCode, playerId, user, config, navigate]);

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = roomCode;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleCreateRoomManual = async () => {
    if (!user) return;
    setRoomError(null);
    try {
      const matchConfig: MatchConfig = normalizeMatchConfig({
        mode: "multiplayer",
        boardSize: boardSize as any,
        winLength: boardSize as any,
        reclaimTokens,
        maxActivePieces,
        playerSymbol,
        startingPlayer: playerSymbol,
      });

      const result = await createRoom({
        hostOptions: {
          id: user.id,
          userId: user.id,
          name: user.username,
        },
        settings: {
          gameMode: "HUMAN_VS_HUMAN",
          isPrivate: true,
        },
        metadata: {
          source: "frontend",
          config: matchConfig,
        },
      } as any);

      if (result) {
        const resAny = result as any;
        const roomObj = resAny.data ?? resAny;
        const code = roomObj.code ?? resAny.code ?? "";
        setRoomCode(code);
        setRoom(roomObj);
        setPlayerId(user.id);

        if (socket?.connected) {
          socket.emit("room:subscribe", { roomCode: code, playerId: user.id });
          socket.emit("room:reconnect", { roomCode: code, playerId: user.id });
        }
      }
    } catch (error: any) {
      setRoomError(
        error?.response?.data?.error?.message ??
          error?.message ??
          "Failed to create room.",
      );
    }
  };

  const handleJoinRoomManual = async () => {
    if (!user) return;
    setRoomError(null);
    const targetCode = joinCodeInput.trim().toUpperCase();
    if (!targetCode) {
      setRoomError("Please enter a room code.");
      return;
    }

    try {
      const result = await joinRoom({
        roomId: targetCode,
        playerInfo: {
          id: user.id,
          userId: user.id,
          name: user.username,
        } as any,
      });

      const resAny = result as any;
      const finalRoom = resAny?.data ?? resAny;
      setRoomCode(targetCode);
      setRoom(finalRoom);
      setPlayerId(user.id);

      if (socket?.connected) {
        socket.emit("room:join", {
          roomCode: targetCode,
          playerInfo: { id: user.id, userId: user.id, name: user.username },
          reconnectPlayerId: user.id,
        });
        socket.emit("room:subscribe", { roomCode: targetCode, playerId: user.id });
        socket.emit("room:reconnect", { roomCode: targetCode, playerId: user.id });
      }
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code;
      if (errCode === "PLAYER_ALREADY_JOINED") {
        setRoomCode(targetCode);
        setPlayerId(user.id);
        if (socket?.connected) {
          socket.emit("room:reconnect", { roomCode: targetCode, playerId: user.id });
          socket.emit("room:subscribe", { roomCode: targetCode, playerId: user.id });
        }
        return;
      }
      setRoomError(
        error?.response?.data?.error?.message ??
          error?.message ??
          "Failed to join room. Please check the code.",
      );
    }
  };

  const handleToggleReady = () => {
    if (!roomCode || !user) return;
    const activeSocket = socket || socketService.connect();
    const pid = playerId || user.id;
    const isCurrentlyReady =
      room?.players?.find(
        (p: any) =>
          p.id === pid ||
          p.userId === pid ||
          p.id === user.id ||
          p.userId === user.id,
      )?.status === "READY";
    const nextReadyState = !isCurrentlyReady;

    if (room && Array.isArray(room.players)) {
      const updatedPlayers = room.players.map((p: any) => {
        if (
          p.id === pid ||
          p.userId === pid ||
          p.id === user.id ||
          p.userId === user.id
        ) {
          return { ...p, status: nextReadyState ? "READY" : "ONLINE" };
        }
        return p;
      });
      setRoom({ ...room, players: updatedPlayers });
    }

    if (activeSocket) {
      activeSocket.emit("room:ready-toggle", {
        roomCode,
        playerId: pid,
        ready: nextReadyState,
      });
    }
  };

  const handleRegenerateCode = async () => {
    if (!roomCode || !user) return;
    try {
      const result = await regenerateCode(roomCode);
      if (result) {
        const resAny = result as any;
        const roomObj = resAny.data ?? resAny;
        const newCode = roomObj.code ?? resAny.code ?? "";
        if (newCode) {
          setRoomCode(newCode);
          setRoom(roomObj);
          if (socket?.connected) {
            socket.emit("room:subscribe", { roomCode: newCode, playerId: user.id });
            socket.emit("room:reconnect", { roomCode: newCode, playerId: user.id });
          }
        }
      }
    } catch (error) {
      console.error("Failed to regenerate code", error);
    }
  };

  const handleStartMatch = () => {
    if (!roomCode || !user || !socket?.connected) return;
    setIsStartingRoom(true);
    socket.emit(
      "match:start",
      {
        roomCode,
        config,
        metadata: {
          source: "frontend",
          playerId: playerId || user.id,
        },
      },
      (res: any) => {
        setIsStartingRoom(false);
        if (!res?.success) {
          setRoomError(res?.error?.message ?? "Unable to start the match.");
        }
      },
    );
  };

  // Determine host vs guest cleanly:
  // Host is the player who created the room (whose id or userId matches room.host.id / room.host.userId)
  const hostId = room?.host?.id ?? room?.host?.userId;
  const isHost = Boolean(roomCode)
    ? hostId
      ? hostId === user?.id
      : true
    : true;

  const guests =
    room?.players?.filter(
      (p: any) => p.id !== hostId && p.userId !== hostId,
    ) ?? [];
  const allGuestsReady =
    guests.length > 0 && guests.every((p: any) => p.status === "READY");
    
  const activePid = playerId || user?.id;
  const isUserReady =
    room?.players?.find(
      (p: any) =>
        p.id === activePid ||
        p.userId === activePid ||
        p.id === user?.id ||
        p.userId === user?.id,
    )?.status === "READY";

  // Min / Max bounds for Active Pieces depending on board size
  const minActive = boardSize === 3 ? 3 : boardSize;
  const maxActive = boardSize === 3 ? 3 : 10;

  // Render Setup / Configuration screen if room is not yet created or joined
  if (!roomCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[65vh] max-w-xl mx-auto p-4 sm:p-6"
      >
        <div className="w-full glass rounded-3xl border border-white/10 p-6 sm:p-8 space-y-8 bg-background/80 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              Multiplayer Setup
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Configure your match or enter code
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex w-full p-1 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={() => {
                setTab("create");
                setRoomError(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-medium tracking-wide transition-all rounded-xl ${
                tab === "create"
                  ? "bg-white/[0.08] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setTab("join");
                setRoomError(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-medium tracking-wide transition-all rounded-xl ${
                tab === "join"
                  ? "bg-white/[0.08] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Join Room
            </button>
          </div>

          {roomError && (
            <div className="text-center text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 py-2.5 rounded-xl">
              {roomError}
            </div>
          )}

          {tab === "create" ? (
            <div className="space-y-6">
              {/* Board Size */}
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block text-center">
                  Board Size
                </label>
                <div className="flex justify-center gap-4">
                  {[3, 4, 5].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBoardSize(size)}
                      className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        boardSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                          : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Active Pieces */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Max Active Pieces
                  </label>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    {boardSize === 3 ? "Fixed (3)" : `${minActive} – ${maxActive}`}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() =>
                      setMaxActivePieces((prev) => Math.max(minActive, prev - 1))
                    }
                    disabled={boardSize === 3 || maxActivePieces <= minActive}
                    className="w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-display text-3xl font-semibold w-12 text-center text-foreground">
                    {maxActivePieces}
                  </span>
                  <button
                    onClick={() =>
                      setMaxActivePieces((prev) => Math.min(maxActive, prev + 1))
                    }
                    disabled={boardSize === 3 || maxActivePieces >= maxActive}
                    className="w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* Reclaim Tokens */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Reclaim Tokens
                  </label>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    0 – 10
                  </span>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setReclaimTokens((prev) => Math.max(0, prev - 1))}
                    disabled={reclaimTokens <= 0}
                    className="w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-display text-3xl font-semibold w-12 text-center text-foreground">
                    {reclaimTokens}
                  </span>
                  <button
                    onClick={() => setReclaimTokens((prev) => Math.min(10, prev + 1))}
                    disabled={reclaimTokens >= 10}
                    className="w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-full text-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* Starting Piece Symbol */}
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block text-center">
                  Your Piece Symbol
                </label>
                <div className="flex justify-center gap-4">
                  {(["x", "o"] as const).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setPlayerSymbol(sym)}
                      className={`px-6 py-3 rounded-xl border font-mono font-bold text-sm uppercase transition-all ${
                        playerSymbol === sym
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                          : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateRoomManual}
                disabled={isCreatingRoom}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold tracking-wide transition-all disabled:opacity-50 hover:opacity-95 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] mt-2"
              >
                {isCreatingRoom ? "Generating Code..." : "Generate Room Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block text-center">
                  Enter Room Code
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ZK-XXXX"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center font-mono text-2xl tracking-[0.25em] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <button
                onClick={handleJoinRoomManual}
                disabled={isJoiningRoom || !joinCodeInput.trim()}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold tracking-wide transition-all disabled:opacity-50 hover:opacity-95 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
              >
                {isJoiningRoom ? "Joining..." : "Join Room"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Active Lobby Screen (roomCode exists)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-6 relative max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass space-y-6 rounded-2xl p-6 border border-white/10 bg-background/80">
          <header className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Multiplayer lobby
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
                {isHost ? "Your private room." : "Joined room."}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <Wifi className="size-3 text-emerald-400" />
              Connected
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Room code
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-center font-mono text-xl tracking-[0.25em]">
                  {roomCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/4 text-foreground hover:bg-white/8 transition-all"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
                <button
                  onClick={() => void handleRegenerateCode()}
                  disabled={isRegeneratingCode}
                  className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/4 text-foreground hover:bg-white/8 disabled:opacity-40"
                  title="Generate new room code"
                >
                  <RefreshCcw
                    className={`size-4 ${isRegeneratingCode ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="glass rounded-xl p-3.5 space-y-1.5 text-xs border border-white/10 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                Board Configuration
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Board Size:</span>
                <span className="font-medium text-foreground">
                  {config.boardSize}×{config.boardSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Pieces:</span>
                <span className="font-medium text-foreground">
                  {config.maxActivePieces}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reclaim Tokens:</span>
                <span className="font-medium text-foreground">
                  {config.reclaimTokens}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Symbol:</span>
                <span className="font-medium uppercase text-foreground">
                  {config.playerSymbol}
                </span>
              </div>
            </div>
          </div>

          <div className="hairline bg-white/10" />

          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Users className="size-3" /> Players
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-3">
                <div className="grid size-9 place-items-center rounded-lg bg-white text-black font-mono text-sm font-bold">
                  {room?.host?.name?.[0] ?? user?.username?.[0] ?? "H"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {room?.host?.name ?? user?.username ?? "Host"}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Host ({config.playerSymbol.toUpperCase()})
                  </div>
                </div>
                <span className="rounded-md border border-white/15 bg-white/6 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone">
                  Ready
                </span>
              </div>

              {guests.length > 0 ? (
                guests.map((g: any) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-3"
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-white text-black font-mono text-sm font-bold">
                      {g.name?.[0] ?? "G"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{g.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Guest (
                        {config.playerSymbol === "x" ? "O" : "X"})
                      </div>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                        g.status === "READY"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-white/15 bg-white/6 text-muted-foreground"
                      }`}
                    >
                      {g.status === "READY" ? "Ready" : "Waiting"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/1.5 px-3 py-3">
                  <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/3 text-muted-foreground">
                    <Users className="size-4" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Waiting for opponent…
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {roomError && (
              <div className="text-xs text-rose-400">{roomError}</div>
            )}
            <div className="ml-auto flex gap-2">
              {isHost ? (
                <button
                  onClick={handleStartMatch}
                  disabled={isStartingRoom || !allGuestsReady}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
                >
                  <Play className="size-4 fill-primary-foreground" />
                  {isStartingRoom ? "Starting…" : "Start Match"}
                </button>
              ) : (
                <button
                  onClick={handleToggleReady}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    isUserReady
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isUserReady ? "Ready" : "Toggle Ready"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right-side waiting state */}
        <section className="glass flex flex-col items-center justify-center rounded-2xl p-8 text-center border border-white/10 bg-background/80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/4"
          >
            <Crown className="size-6 text-muted-foreground" />
          </motion.div>
          <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {allGuestsReady ? "Lobby Ready" : "Waiting for players"}
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
            {allGuestsReady
              ? "Host can start the match now!"
              : "Hold tight — match starts when both players are ready."}
          </h3>
          <p className="mt-2 max-w-xs text-xs text-muted-foreground">
            ZEKROS matches are best of one. Guest must click "Ready" to unlock starting the match for the Host.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
