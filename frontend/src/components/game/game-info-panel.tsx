import { motion } from "motion/react";
import { User, Brain, Sparkles, Users, Settings2, Clock } from "lucide-react";
import type { MatchConfig, Player } from "./types";

const modeMeta: Record<
  MatchConfig["mode"],
  { label: string; icon: typeof User }
> = {
  local: { label: "Local PvP", icon: Users },
  smart: { label: "Smart AI", icon: Brain },
  perfect: { label: "Perfect AI", icon: Sparkles },
  multiplayer: { label: "Multiplayer", icon: Users },
  quick: { label: "Quick Play", icon: Sparkles },
  custom: { label: "Custom Match", icon: Settings2 },
};

function formatTime(seconds?: number): string {
  if (seconds === undefined) return "--:--";
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GameInfoPanel({
  config,
  playerName,
  opponentName,
  turn,
  timeLeftX,
  timeLeftO,
}: {
  config: MatchConfig;
  playerName: string;
  opponentName: string;
  turn: Player;
  timeLeftX?: number;
  timeLeftO?: number;
}) {
  const Mode = modeMeta[config.mode];
  const playerSymbol = config.playerSymbol;
  const opponentSymbol: Player = playerSymbol === "x" ? "o" : "x";

  const playerTime = playerSymbol === "x" ? timeLeftX : timeLeftO;
  const opponentTime = opponentSymbol === "x" ? timeLeftX : timeLeftO;

  return (
    <aside className="glass flex h-full flex-col gap-4 rounded-2xl p-5">
      <header className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Match
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
          <Mode.icon className="size-3" /> {Mode.label}
        </div>
      </header>

      <div className="space-y-2">
        <PlayerRow
          name={playerName}
          symbol={playerSymbol}
          active={turn === playerSymbol}
          timeLeft={playerTime}
          hasTimer={config.timerDuration > 0}
          you
        />
        <PlayerRow
          name={opponentName}
          symbol={opponentSymbol}
          active={turn === opponentSymbol}
          timeLeft={opponentTime}
          hasTimer={config.timerDuration > 0}
        />
      </div>

      <div className="hairline" />

      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Settings2 className="size-3" /> Configuration
        </div>
        <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
          <Stat
            label="Board"
            value={`${config.boardSize}×${config.boardSize}`}
          />
          <Stat label="Win" value={`${config.winLength} in a row`} />
          <Stat label="Active" value={`${config.maxActivePieces} max`} />
          <Stat label="Reclaim" value={`${config.reclaimTokens} tokens`} />
          <Stat
            label="Clock"
            value={
              config.timerDuration > 0
                ? `${Math.round(config.timerDuration / 60)} min / player`
                : "Unlimited"
            }
          />
          <Stat label="Starts" value={config.startingPlayer.toUpperCase()} />
        </dl>
      </div>
    </aside>
  );
}

function PlayerRow({
  name,
  symbol,
  active,
  timeLeft,
  hasTimer,
  you,
}: {
  name: string;
  symbol: Player;
  active?: boolean;
  timeLeft?: number;
  hasTimer?: boolean;
  you?: boolean;
}) {
  const isLowTime = hasTimer && timeLeft !== undefined && timeLeft <= 30;

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.6 }}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        active
          ? "border-white/20 bg-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-xs font-bold">
        {symbol.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {you ? "You" : "Opponent"}
        </div>
      </div>

      {hasTimer && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold transition-colors ${
            active
              ? isLowTime
                ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse"
                : "border-primary/50 bg-primary/20 text-primary"
              : "border-white/10 bg-white/5 text-muted-foreground"
          }`}
        >
          <Clock className="size-3" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      )}

      {active && !hasTimer && (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone">
          <span className="size-1.5 animate-pulse rounded-full bg-bone" />
          Turn
        </span>
      )}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right font-medium">{value}</dd>
    </>
  );
}
