import { motion } from "motion/react";
import { Play, Clock, User } from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";
import { MiniBoard } from "./mini-board";

// TODO: replace with live data from `GET /matches/in-progress` (backend, Phase 4).
const mockMatch = {
  opponent: "Kai Mercer",
  mode: "Smart AI · 4×4",
  timePlayed: "2m 48s",
  pieces: [
    { i: 1, player: "x" as const },
    { i: 5, player: "o" as const },
    { i: 6, player: "x" as const, fading: true },
    { i: 10, player: "o" as const },
  ],
};

export function ContinueMatch({ onResume }: { onResume?: () => void }) {
  return (
    <section>
      <SectionHeader title="Continue match" description="You have a game in progress." />
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="glass relative flex flex-col items-stretch gap-5 overflow-hidden rounded-2xl p-5 sm:flex-row sm:items-center"
      >
        <div className="w-28 shrink-0">
          <MiniBoard size={4} pieces={mockMatch.pieces} animated={false} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            In progress
          </div>
          <div className="mt-1 font-display text-lg font-semibold tracking-tight">
            vs {mockMatch.opponent}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" /> {mockMatch.mode}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {mockMatch.timePlayed}
            </span>
          </div>
        </div>
        <button
          onClick={onResume}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Play className="size-4" /> Resume
        </button>
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/[0.05] blur-3xl" />
      </motion.div>
    </section>
  );
}
