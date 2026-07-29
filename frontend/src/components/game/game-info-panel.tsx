import { motion } from "motion/react";
import { User, Brain, Sparkles, Users, Settings2 } from "lucide-react";
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

export function GameInfoPanel({
  config,
  playerName,
  opponentName,
  turn,
}: {
  config: MatchConfig;
  playerName: string;
  opponentName: string;
  turn: Player;
}) {
  const Mode = modeMeta[config.mode];

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
          symbol={config.playerSymbol}
          active={turn === config.playerSymbol}
          you
        />
        <PlayerRow
          name={opponentName}
          symbol={config.playerSymbol === "x" ? "o" : "x"}
          active={turn !== config.playerSymbol}
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
          <Stat label="Starts" value={config.startingPlayer.toUpperCase()} />
          <Stat label="You" value={config.playerSymbol.toUpperCase()} />
        </dl>
      </div>
    </aside>
  );
}

function PlayerRow({
  name,
  symbol,
  active,
  you,
}: {
  name: string;
  symbol: Player;
  active?: boolean;
  you?: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.55 }}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        active
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-xs">
        {symbol.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {you ? "You" : "Opponent"}
        </div>
      </div>
      {active && (
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
