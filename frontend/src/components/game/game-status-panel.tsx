import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Clock, Coins, Layers, Activity, Hash, Trophy } from "lucide-react";
import type { Player } from "./types";

/**
 * Right-side game HUD. UI only — counters and timer are local state
 * placeholders.
 * TODO: hydrate from the live match state (Phase 5).
 */
export function GameStatusPanel({
  turn,
  status,
  activeX,
  activeO,
  tokensX,
  tokensO,
  maxActive,
  maxTokens,
  moveCount,
  winner,
  startedAt,
  paused,
}: {
  turn: Player;
  status: "idle" | "playing" | "won" | "lost" | "draw";
  activeX: number;
  activeO: number;
  tokensX: number;
  tokensO: number;
  maxActive?: number;
  maxTokens?: number;
  moveCount?: number;
  winner?: Player | null;
  startedAt?: number;
  paused?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [paused]);

  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const mm = String(Math.floor(elapsed / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((elapsed % 60_000) / 1000)).padStart(2, "0");

  const statusLabel = {
    idle: "Waiting",
    playing: "In progress",
    won: "Victory",
    lost: "Defeat",
    draw: "Draw",
  }[status];

  return (
    <aside className="glass flex h-full flex-col gap-4 rounded-2xl p-5">
      <header className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Status
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
          <Activity className="size-3" /> {statusLabel}
        </span>
      </header>

      <motion.div
        key={turn}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] via-white/[0.03] to-transparent p-4"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Current turn
        </div>
        <div className="mt-1 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-white text-black font-mono text-sm font-bold">
            {turn.toUpperCase()}
          </div>
          <div>
            <div className="font-display text-base font-semibold">{turn === "x" ? "Crosses" : "Circles"}</div>
            <div className="text-[11px] text-muted-foreground">Place or reclaim a piece</div>
          </div>
        </div>
      </motion.div>

      <MeterRow
        icon={Layers}
        label="Active pieces"
        max={maxActive}
        left={activeX}
        right={activeO}
      />
      <TokensRow tokensX={tokensX} tokensO={tokensO} max={maxTokens} />

      {winner && (status === "won" || status === "lost") && (
        <div className="rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2.5">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="size-3" /> Winner
          </div>
          <div className="mt-0.5 font-display text-sm font-semibold">
            {winner.toUpperCase()} · {winner === "x" ? "Crosses" : "Circles"}
          </div>
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Clock className="size-3" /> Timer
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
            {mm}:{ss}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Hash className="size-3" /> Moves
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
            {String(moveCount ?? 0).padStart(2, "0")}
          </div>
        </div>
      </div>
    </aside>
  );
}

function MeterRow({
  icon: Icon,
  label,
  left,
  right,
  max,
}: {
  icon: typeof Activity;
  label: string;
  left: number;
  right: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Icon className="size-3" /> {label}
        </span>
        {max != null && (
          <span className="font-mono text-[10px] text-muted-foreground">cap · {max}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SidePill label="X" value={left} max={max} />
        <SidePill label="O" value={right} max={max} />
      </div>
    </div>
  );
}

function SidePill({ label, value, max }: { label: string; value: number; max?: number }) {
  const pct = max && max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="font-mono text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {value}
          {max != null && <span className="text-muted-foreground"> /{max}</span>}
        </span>
      </div>
      {max != null && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
            className="h-full rounded-full bg-foreground/80"
          />
        </div>
      )}
    </div>
  );
}

function TokensRow({
  tokensX,
  tokensO,
  max,
}: {
  tokensX: number;
  tokensO: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Coins className="size-3" /> Reclaim tokens
        </span>
        {max != null && (
          <span className="font-mono text-[10px] text-muted-foreground">start · {max}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TokenStrip label="X" value={tokensX} max={max ?? tokensX} />
        <TokenStrip label="O" value={tokensO} max={max ?? tokensO} />
      </div>
    </div>
  );
}

function TokenStrip({ label, value, max }: { label: string; value: number; max: number }) {
  const dots = Math.max(max, value);
  const empty = value === 0;
  return (
    <div
      className={`rounded-lg border bg-white/[0.02] px-3 py-2 ${
        empty ? "border-dashed border-white/10 opacity-60" : "border-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="font-mono text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {value}
          <span className="text-muted-foreground"> /{max}</span>
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {Array.from({ length: dots }).map((_, i) => {
          const used = i >= value;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{ scale: used ? 0.85 : 1, opacity: used ? 0.4 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`size-1.5 rounded-full ${
                used ? "bg-white/15" : "bg-foreground"
              }`}
            />
          );
        })}
        {empty && (
          <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            empty
          </span>
        )}
      </div>
    </div>
  );
}

