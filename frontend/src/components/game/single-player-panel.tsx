import { motion } from "motion/react";
import { User, Clock, Layers, RefreshCw, Bot } from "lucide-react";
import type { Player } from "./types";

function formatTime(seconds?: number): string {
  if (seconds === undefined) return "--:--";
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SinglePlayerPanel({
  name,
  symbol,
  active,
  timeLeft,
  hasTimer,
  activePieces,
  maxActivePieces,
  reclaimTokens,
  maxReclaimTokens,
  you,
  avatarUrl,
}: {
  name: string;
  symbol: Player;
  active?: boolean;
  timeLeft?: number;
  hasTimer?: boolean;
  activePieces: number;
  maxActivePieces: number;
  reclaimTokens: number;
  maxReclaimTokens: number;
  you?: boolean;
  avatarUrl?: string | null;
}) {
  const isLowTime = hasTimer && timeLeft !== undefined && timeLeft <= 30;
  const isBot = !you && (name.toLowerCase().includes("ai") || name.toLowerCase().includes("bot"));

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.65 }}
      className={`glass flex flex-col gap-3 rounded-2xl p-4 border transition-all duration-300 ${
        active
          ? "border-green-500/50 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.15)] ring-1 ring-green-500/20"
          : "border-white/[0.05] bg-white/[0.01]"
      }`}
    >
      {/* Header with Avatar & Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] text-muted-foreground shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : isBot ? (
              <Bot className="size-5 text-emerald-400" />
            ) : (
              <User className="size-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-foreground">
              {name}
            </div>
            <div className="text-[10px] uppercase font-mono tracking-[0.18em] text-muted-foreground/80">
              {you ? "You" : "Opponent"}
            </div>
          </div>
        </div>

        {active && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-green-400">
            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
            Turn
          </span>
        )}
      </div>
      <div className="hairline" />

      {/* Main Symbol & Clock Card */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] font-mono text-base font-bold text-foreground shadow-inner">
            {symbol.toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-[0.16em] text-muted-foreground">
              Symbol
            </div>
            <div className="text-xs font-semibold text-foreground uppercase">
              Player {symbol.toUpperCase()}
            </div>
          </div>
        </div>

        {hasTimer && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all ${
              active
                ? isLowTime
                  ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : "border-primary/50 bg-primary/20 text-primary shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                : "border-white/10 bg-white/5 text-muted-foreground/80"
            }`}
          >
            <Clock className="size-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="hairline" />

      {/* Game Stats (Active Pieces & Reclaim Tokens) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RefreshCw className="size-3.5 text-muted-foreground/70" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              Reclaim Tokens
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxReclaimTokens }).map((_, index) => {
              const isAvailable = index >= maxReclaimTokens - reclaimTokens;
              return (
                <span
                  key={index}
                  className={`size-2.5 rounded-full transition-all duration-300 ${
                    isAvailable
                      ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      : "bg-white/10 border border-white/90 opacity-40 scale-90"
                  }`}
                  title={isAvailable ? "Available Token" : "Used Token"}
                />
              );
            })}
          </div>
        </div>

        {/* <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="size-3.5 text-muted-foreground/70" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              Active Pieces
            </span>
          </div>
          <div className="font-mono font-semibold text-foreground">
            <span className={activePieces >= maxActivePieces ? "text-amber-400 font-bold" : ""}>
              {activePieces}
            </span>
            <span className="text-muted-foreground/60"> / {maxActivePieces}</span>
          </div>
        </div> */}

        
      </div>
    </motion.div>
  );
}
