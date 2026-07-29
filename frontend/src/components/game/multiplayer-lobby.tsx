import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Copy,
  RefreshCcw,
  Users,
  Wifi,
  Crown,
  Play,
  Check,
} from "lucide-react";

function genCode() {
  const s = Math.random()
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  return `ZK-${s.padEnd(4, "X")}`;
}

/**
 * Multiplayer lobby (host & guest variants).
 * UI only — no network code. Hook into socket layer in Phase 5.
 */
export function MultiplayerLobby({
  variant = "host",
  roomCode,
  isStarting = false,
  isRegenerating = false,
  errorMessage,
  onStart,
  onRegenerateCode,
  players = [],
}: {
  variant?: "host" | "guest";
  roomCode?: string;
  isStarting?: boolean;
  isRegenerating?: boolean;
  errorMessage?: string | null;
  onStart?: () => void;
  onRegenerateCode?: () => void;
  players?: any[];
}) {
  const [code, setCode] = useState(roomCode ?? genCode());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (roomCode) {
      setCode(roomCode);
    }
  }, [roomCode]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass space-y-6 rounded-2xl p-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Multiplayer lobby
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              {variant === "host" ? "Your private room." : "Joining a room…"}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Wifi className="size-3" />
            {/* TODO: bind to live socket status */}
            Connecting…
          </div>
        </header>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Room code
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-white/10 bg-white/3 px-5 py-4 text-center font-mono text-2xl tracking-[0.32em]">
              {code}
            </div>
            <button
              onClick={() =>
                onRegenerateCode ? onRegenerateCode() : setCode(genCode())
              }
              disabled={variant !== "host" || isRegenerating}
              className={`grid size-12 place-items-center rounded-xl border border-white/10 bg-white/4 text-foreground hover:bg-white/8 disabled:opacity-40 ${isRegenerating ? "animate-spin" : ""}`}
              aria-label="Regenerate"
            >
              <RefreshCcw className="size-4" />
            </button>
            <button
              onClick={copy}
              className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/4 text-foreground hover:bg-white/8"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Share this code with a friend or generate a new one.
          </div>
        </div>

        <div className="hairline" />

        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Users className="size-3" /> Players
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Slot
              name={players[0]?.name || (variant === "host" ? "You" : "Host")}
              role="Host"
              ready={true}
            />
            {players.length > 1 ? (
              <Slot
                name={
                  players[1]?.name || (variant === "guest" ? "You" : "Guest")
                }
                role="Guest"
                ready={true}
              />
            ) : (
              <Slot empty />
            )}
          </div>
        </div>

        {variant === "host" && (
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Host controls
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/6">
                Lock room
              </button>
              <button className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/6">
                Spectators: off
              </button>
              <button className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/6">
                Re-roll symbols
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          {errorMessage && (
            <div className="mr-auto text-xs text-rose-400">{errorMessage}</div>
          )}
          <button
            onClick={onStart}
            disabled={isStarting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <Play className="size-3.5" />{" "}
            {isStarting
              ? "Starting…"
              : variant === "host"
                ? "Start match"
                : "Ready"}
          </button>
        </div>
      </section>

      {/* Right-side waiting state */}
      <section className="glass flex flex-col items-center justify-center rounded-2xl p-10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/4"
        >
          <Crown className="size-6 text-muted-foreground" />
        </motion.div>
        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Waiting for players
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
          Hold tight — match starts when both players are ready.
        </h3>
        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
          ZEKROS matches are best of one. You can change rules from the host
          panel until launch.
        </p>
      </section>
    </div>
  );
}

function Slot({
  name,
  role,
  ready,
  empty,
}: {
  name?: string;
  role?: string;
  ready?: boolean;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/1.5 px-3 py-3">
        <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/3 text-muted-foreground">
          <Users className="size-4" />
        </div>
        <div className="text-sm text-muted-foreground">
          Waiting for opponent…
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-3">
      <div className="grid size-9 place-items-center rounded-lg bg-white text-black font-mono text-sm font-bold">
        {name?.[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {role}
        </div>
      </div>
      {ready && (
        <span className="rounded-md border border-white/15 bg-white/6 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone">
          Ready
        </span>
      )}
    </div>
  );
}
