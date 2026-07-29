import { motion } from "motion/react";
import { Trophy, Skull, Equal, RotateCcw, Home, Film } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";

export type GameOutcome = "win" | "loss" | "draw";

const meta: Record<
  GameOutcome,
  { title: string; eyebrow: string; description: string; icon: typeof Trophy }
> = {
  win: {
    title: "Victory.",
    eyebrow: "Match complete",
    description: "You out-thought the board. Want to push your streak?",
    icon: Trophy,
  },
  loss: {
    title: "Defeated.",
    eyebrow: "Match complete",
    description: "Every loss is data. Rematch and adapt.",
    icon: Skull,
  },
  draw: {
    title: "A clean draw.",
    eyebrow: "Match complete",
    description: "Perfect symmetry. Try again with a tighter ruleset.",
    icon: Equal,
  },
};

export function ResultModal({
  open,
  outcome,
  durationMs,
  matchId,
  mode,
  winnerSymbol,
  onPlayAgain,
  onClose,
}: {
  open: boolean;
  outcome: GameOutcome;
  durationMs: number;
  matchId?: string;
  mode?: string;
  winnerSymbol?: "x" | "o" | "X" | "O" | null;
  onPlayAgain?: () => void;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const mm = String(Math.floor(durationMs / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((durationMs % 60_000) / 1000)).padStart(2, "0");

  const isPvP = mode === "local";
  const normalizedWinner = winnerSymbol ? winnerSymbol.toUpperCase() : null;

  let m = meta[outcome];
  let title = m.title;
  let description = m.description;
  let IconComponent = m.icon;

  if (isPvP) {
    if (outcome === "draw" || !normalizedWinner) {
      title = "Match Draw.";
      description = "It's a draw between Player X and Player O. Great game!";
      IconComponent = Equal;
    } else {
      title = `PLAYER ${normalizedWinner} WINS!`;
      description = `Player ${normalizedWinner} dominated the board and claimed victory.`;
      IconComponent = Trophy;
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose?.())}>
      <DialogContent
        className="glass-strong max-w-md overflow-hidden rounded-3xl border-white/10 bg-background/80 p-0"
        aria-describedby={undefined}
      >
        <div className="relative px-7 py-8 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl" />

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.14] to-transparent"
          >
            <IconComponent className="size-7" />
          </motion.div>

          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {m.eyebrow}
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Duration · {mm}:{ss}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={onPlayAgain}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <RotateCcw className="size-4" /> Play again
            </button>
            <button
              onClick={() => {
                if (matchId) {
                  void navigate({ to: "/app/replay/$id", params: { id: matchId } });
                } else {
                  void navigate({ to: "/app/history" });
                }
              }}
              className="glass inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.06]"
            >
              <Film className="size-4" /> Replay
            </button>
            <button
              onClick={() => navigate({ to: "/app/history" })}
              className="glass inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.06]"
            >
              <Home className="size-4" /> History
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
