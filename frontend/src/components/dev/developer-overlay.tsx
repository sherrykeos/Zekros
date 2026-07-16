import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCcw, Terminal, X } from "lucide-react";

import { devApi } from "@/api/dev.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api, type DevRestLog } from "@/services/client";

/**
 * Hidden developer overlay. Toggled with Ctrl+Shift+D.
 * Uses route state and backend endpoints to expose live diagnostics.
 */
export function DeveloperOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("app");
  const location = useLocation();
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const routeState = (location.state ?? {}) as DevRouteState;
  const routeMatchId = typeof routeState.matchId === "string" ? routeState.matchId : "";
  const routeRoomCode = typeof routeState.roomCode === "string" ? routeState.roomCode : "";
  const [manualMatchId, setManualMatchId] = useState("");
  const [manualRoomCode, setManualRoomCode] = useState("");
  const matchId = manualMatchId.trim() || routeMatchId;
  const roomCode = manualRoomCode.trim().toUpperCase() || routeRoomCode;
  const [restLogs, setRestLogs] = useState<DevRestLog[]>([]);
  const consoleLogs = useConsoleLogs();
  const perf = usePerformanceStats(open);
  const viewport = useViewport(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onRestLog = (event: Event) => {
      const detail = (event as CustomEvent<DevRestLog>).detail;
      setRestLogs((current) => [detail, ...current].slice(0, 80));
    };
    window.addEventListener("zekros:rest-log", onRestLog as EventListener);
    return () => window.removeEventListener("zekros:rest-log", onRestLog as EventListener);
  }, []);

  const health = useQuery({
    queryKey: ["dev", "health"],
    queryFn: devApi.health,
    enabled: open,
    refetchInterval: open ? 5000 : false,
    retry: false,
  });

  const room = useQuery({
    queryKey: ["dev", "room", roomCode],
    queryFn: () => devApi.room(roomCode),
    enabled: open && !!roomCode,
    refetchInterval: open && roomCode ? 2500 : false,
    retry: false,
  });

  const game = useQuery({
    queryKey: ["dev", "game", matchId],
    queryFn: () => devApi.gameState(matchId),
    enabled: open && !!matchId,
    refetchInterval: open && matchId ? 1500 : false,
    retry: false,
  });

  const match = useQuery({
    queryKey: ["dev", "match", matchId],
    queryFn: () => devApi.match(matchId),
    enabled: open && !!matchId,
    refetchInterval: open && matchId ? 2500 : false,
    retry: false,
  });

  const history = useQuery({
    queryKey: ["dev", "history", matchId],
    queryFn: () => devApi.matchHistory(matchId),
    enabled: open && !!matchId,
    refetchInterval: open && matchId ? 2500 : false,
    retry: false,
  });

  const replay = useQuery({
    queryKey: ["dev", "replay", matchId],
    queryFn: () => devApi.replay(matchId),
    enabled: open && !!matchId,
    retry: false,
  });

  const appState = useMemo(
    () => ({
      route: {
        pathname: location.pathname,
        search: location.search,
        state: routeState,
      },
      auth: {
        status: currentUser.isPending ? "loading" : currentUser.data ? "authenticated" : "anonymous",
        user: currentUser.data ?? null,
      },
      backend: {
        baseURL: api.defaults.baseURL,
        health: {
          query: querySnapshot(health),
          data: health.data ?? null,
        },
      },
      activeContext: {
        roomCode: roomCode || null,
        matchId: matchId || null,
        playerId: routeState.playerId ?? null,
        playerIds: routeState.playerIds ?? null,
        mode: routeState.mode ?? routeState.config?.mode ?? null,
      },
      viewport,
    }),
    [currentUser.data, currentUser.isPending, health.data, health.error, health.fetchStatus, health.status, location.pathname, location.search, matchId, roomCode, routeState, viewport],
  );

  const gameState = useMemo(
    () => ({
      activeMatchId: matchId || null,
      query: querySnapshot(game),
      state: game.data?.data ?? null,
    }),
    [game.data, game.error, game.fetchStatus, game.status, matchId],
  );

  const roomState = useMemo(
    () => ({
      activeRoomCode: roomCode || null,
      query: querySnapshot(room),
      state: room.data?.data ?? null,
    }),
    [room.data, room.error, room.fetchStatus, room.status, roomCode],
  );

  const matchState = useMemo(
    () => ({
      activeMatchId: matchId || null,
      match: {
        query: querySnapshot(match),
        state: match.data?.data?.getState ? "Match instance returned non-serializable method shape" : match.data?.data ?? null,
      },
      history: {
        query: querySnapshot(history),
        data: history.data?.data ?? null,
      },
      replay: {
        query: querySnapshot(replay),
        data: replay.data?.data ?? null,
      },
    }),
    [history.data, history.error, history.fetchStatus, history.status, match.data, match.error, match.fetchStatus, match.status, matchId, replay.data, replay.error, replay.fetchStatus, replay.status],
  );

  const flags = useMemo(
    () => [
      { key: "backend.health", on: Boolean(health.data?.success) },
      { key: "dev.overlay", on: true },
      { key: "active.room", on: Boolean(roomCode) },
      { key: "active.match", on: Boolean(matchId) },
      { key: "rest.logging", on: true },
      { key: "socket.client", on: false },
    ],
    [health.data?.success, matchId, roomCode],
  );

  const refreshActive = () => {
    void queryClient.invalidateQueries({ queryKey: ["dev"] });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="bg-black fixed inset-y-2 right-2 z-[81] flex w-[min(520px,95vw)] flex-col overflow-hidden rounded-2xl border border-white/10"
          >
            <header className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="inline-flex items-center gap-2">
                <Terminal className="size-4" />
                <span className="font-display text-sm font-semibold tracking-tight">
                  Developer
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Ctrl + Shift + D
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={refreshActive}
                  className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
                  aria-label="Refresh developer diagnostics"
                >
                  <RefreshCcw className="size-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
                  aria-label="Close developer overlay"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </header>

            <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                    tab === t.id
                      ? "bg-white/[0.08] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="grid gap-2 border-b border-white/[0.06] px-3 py-2 sm:grid-cols-2">
              <input
                value={manualMatchId}
                onChange={(event) => setManualMatchId(event.target.value)}
                placeholder={routeMatchId || "match id override"}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
                aria-label="Developer match id override"
              />
              <input
                value={manualRoomCode}
                onChange={(event) => setManualRoomCode(event.target.value.toUpperCase())}
                placeholder={routeRoomCode || "room code override"}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 font-mono text-[11px] uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
                aria-label="Developer room code override"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === "app" && (
                <Pane title="Application state" hint="Auth, route, viewport, backend health.">
                  <Pre data={appState} />
                </Pane>
              )}
              {tab === "game" && (
                <Pane title="Game state" hint="Live /api/games/:matchId/state snapshot.">
                  {matchId ? <Pre data={gameState} /> : <EmptyHint text="No active matchId from route state or manual override." />}
                </Pane>
              )}
              {tab === "room" && (
                <Pane title="Room state" hint="Live /api/rooms/:roomCode snapshot.">
                  {roomCode ? <Pre data={roomState} /> : <EmptyHint text="No active roomCode from route state or manual override." />}
                </Pane>
              )}
              {tab === "match" && (
                <Pane title="Match state" hint="Match, history, and replay endpoint data.">
                  {matchId ? <Pre data={matchState} /> : <EmptyHint text="No active matchId from route state or manual override." />}
                </Pane>
              )}
              {tab === "rest" && (
                <Pane title="REST logs" hint="Actual Axios calls from the frontend API client.">
                  <RestLogList rows={restLogs} />
                </Pane>
              )}
              {tab === "socket" && (
                <Pane title="Socket events" hint="Socket.IO client is not configured in the frontend yet.">
                  <Pre
                    data={{
                      configured: false,
                      reason: "No socket.io-client dependency or frontend socket service is present.",
                      backendSocketFiles: [
                        "backend/socket/index.socket.js",
                        "backend/socket/events/roomEvents.js",
                        "backend/socket/events/gameEvents.js",
                      ],
                    }}
                  />
                </Pane>
              )}
              {tab === "perf" && (
                <Pane title="Performance" hint="Browser frame and memory diagnostics.">
                  <PerfGrid stats={perf} />
                </Pane>
              )}
              {tab === "logs" && (
                <Pane title="Logs" hint="Console stream captured while this overlay is mounted.">
                  <LogList rows={consoleLogs} mono />
                </Pane>
              )}
              {tab === "flags" && (
                <Pane title="Feature flags" hint="Runtime diagnostic toggles and detected capabilities.">
                  <FlagList rows={flags} />
                </Pane>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

type TabId = "app" | "game" | "room" | "match" | "rest" | "socket" | "perf" | "logs" | "flags";

type DevRouteState = {
  config?: { mode?: string } & Record<string, unknown>;
  mode?: string;
  matchId?: string;
  roomCode?: string;
  playerId?: string;
  playerIds?: Record<string, string>;
  [key: string]: unknown;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "app", label: "App" },
  { id: "game", label: "Game" },
  { id: "room", label: "Room" },
  { id: "match", label: "Match" },
  { id: "rest", label: "REST" },
  { id: "socket", label: "Socket" },
  { id: "perf", label: "Perf" },
  { id: "logs", label: "Logs" },
  { id: "flags", label: "Flags" },
];

function Pane({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </section>
  );
}

function Pre({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[62vh] overflow-auto rounded-xl border border-white/[0.06] bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-bone">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] p-3 text-xs text-muted-foreground">
      {text}
    </div>
  );
}

function LogList({ rows, mono }: { rows: string[]; mono?: boolean }) {
  if (rows.length === 0) return <EmptyHint text="No logs captured yet." />;

  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => (
        <li
          key={`${i}-${r}`}
          className={`rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] ${
            mono ? "font-mono" : ""
          } text-bone`}
        >
          {r}
        </li>
      ))}
    </ul>
  );
}

function RestLogList({ rows }: { rows: DevRestLog[] }) {
  if (rows.length === 0) return <EmptyHint text="No REST calls captured yet. Open a match or press refresh." />;

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em]">
            <span className={row.ok ? "text-foreground" : "text-red-300"}>
              {row.method} {row.status}
            </span>
            <span className="text-muted-foreground">{row.durationMs}ms</span>
          </div>
          <div className="mt-1 break-all font-mono text-[11px] text-bone">{row.url}</div>
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-muted-foreground">payload</summary>
            <Pre data={{ request: row.request, response: row.response, error: row.error, at: row.at }} />
          </details>
        </li>
      ))}
    </ul>
  );
}

function PerfGrid({ stats }: { stats: PerfStats }) {
  const rows = [
    { label: "FPS", value: String(stats.fps) },
    { label: "Frame", value: `${stats.frameMs.toFixed(1)} ms` },
    { label: "Heap", value: stats.heapMb == null ? "n/a" : `${stats.heapMb.toFixed(1)} MB` },
    { label: "Renders", value: String(stats.renders) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {s.label}
          </div>
          <div className="mt-1 font-display text-lg font-semibold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function FlagList({ rows }: { rows: { key: string; on: boolean }[] }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((f) => (
        <li
          key={f.key}
          className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px]"
        >
          <span className="font-mono text-bone">{f.key}</span>
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
              f.on ? "bg-white/[0.10] text-foreground" : "bg-white/[0.03] text-muted-foreground"
            }`}
          >
            {f.on ? "on" : "off"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function querySnapshot(query: { status: string; fetchStatus: string; error: unknown }) {
  return {
    status: query.status,
    fetchStatus: query.fetchStatus,
    error: query.error ? String(query.error) : null,
  };
}

type PerfStats = {
  fps: number;
  frameMs: number;
  heapMb: number | null;
  renders: number;
};

function usePerformanceStats(enabled: boolean): PerfStats {
  const renders = useRef(0);
  renders.current += 1;
  const [stats, setStats] = useState<PerfStats>({ fps: 0, frameMs: 0, heapMb: null, renders: 0 });

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let frames = 0;
    let last = performance.now();
    let lastFrame = last;

    const tick = (now: number) => {
      frames += 1;
      const frameMs = now - lastFrame;
      lastFrame = now;

      if (now - last >= 1000) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
        setStats({
          fps: Math.round((frames * 1000) / (now - last)),
          frameMs,
          heapMb: memory?.usedJSHeapSize ? memory.usedJSHeapSize / 1024 / 1024 : null,
          renders: renders.current,
        });
        frames = 0;
        last = now;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return stats;
}

function useViewport(enabled: boolean) {
  const [viewport, setViewport] = useState(() => readViewport());

  useEffect(() => {
    if (!enabled) return;
    const update = () => setViewport(readViewport());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [enabled]);

  return viewport;
}

function readViewport() {
  if (typeof window === "undefined") return { w: 0, h: 0, dpr: 1 };
  return { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio };
}

function useConsoleLogs() {
  const [rows, setRows] = useState<string[]>([]);

  useEffect(() => {
    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    const push = (level: keyof typeof original, args: unknown[]) => {
      const line = `[${level}] ${args.map(formatConsoleArg).join(" ")}`;
      setRows((current) => [line, ...current].slice(0, 80));
    };

    console.log = (...args: unknown[]) => {
      push("log", args);
      original.log(...args);
    };
    console.info = (...args: unknown[]) => {
      push("info", args);
      original.info(...args);
    };
    console.warn = (...args: unknown[]) => {
      push("warn", args);
      original.warn(...args);
    };
    console.error = (...args: unknown[]) => {
      push("error", args);
      original.error(...args);
    };
    console.debug = (...args: unknown[]) => {
      push("debug", args);
      original.debug(...args);
    };

    return () => {
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
      console.debug = original.debug;
    };
  }, []);

  return rows;
}

function formatConsoleArg(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}








