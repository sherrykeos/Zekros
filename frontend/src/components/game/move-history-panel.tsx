import { motion } from "motion/react";
import { Rewind, Play, SkipBack, SkipForward, Pause } from "lucide-react";
import type { MoveRecord } from "./types";

/**
 * Move history & replay scrubber.
 * Timeline shows mock moves; the scrubber is a visual placeholder for
 * the future replay engine (Phase 5).
 */
export function MoveHistoryPanel({
  moves,
  currentMove,
  onSeek,
}: {
  moves: MoveRecord[];
  currentMove?: number;
  onSeek?: (index: number) => void;
}) {
  const total = Math.max(1, moves.length);
  const pct = currentMove != null ? Math.min(100, ((currentMove + 1) / total) * 100) : 100;

  return (
    <section className="glass rounded-2xl">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Move history
        </div>
        <div className="flex items-center gap-1">
          {[SkipBack, Rewind, Play, Pause, SkipForward].map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              aria-label={`replay control ${i}`}
            >
              <Icon className="size-3" />
            </button>
          ))}
        </div>
      </header>

      {/* Scrubber */}
      <div className="px-5 pt-4">
        <div className="relative h-1.5 w-full rounded-full bg-white/[0.06]">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
            className="absolute inset-y-0 left-0 rounded-full bg-foreground"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>00:00</span>
          <span>{moves.length} moves</span>
        </div>
      </div>

      {/* Timeline */}
      <ol className="flex max-h-44 gap-2 overflow-x-auto px-5 py-4">
        {moves.length === 0 && (
          <li className="text-xs text-muted-foreground">No moves yet. Make the first one.</li>
        )}
        {moves.map((m, idx) => {
          const active = currentMove === m.index;
          const prev = idx > 0 ? moves[idx - 1]!.at : m.at;
          const deltaMs = Math.max(0, m.at - prev);
          const deltaLabel =
            deltaMs < 1000 ? `+${deltaMs}ms` : `+${(deltaMs / 1000).toFixed(1)}s`;
          return (
            <li key={m.index}>
              <button
                onClick={() => onSeek?.(m.index)}
                className={`flex min-w-[140px] flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-white/25 bg-white/[0.08]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>#{String(m.index + 1).padStart(2, "0")} · {m.kind}</span>
                  <span>{deltaLabel}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <span className="grid size-5 place-items-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[10px]">
                    {m.player.toUpperCase()}
                  </span>
                  <span>cell {m.cell + 1}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
