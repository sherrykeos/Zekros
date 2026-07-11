import { motion } from "motion/react";
import { Play, Trophy, Minus, X } from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";

// TODO: hydrate via `GET /matches/recent` (backend, Phase 4).
const items = [
  { id: "m1", result: "win" as const, opponent: "Smart AI", mode: "4×4 · Reclaim", duration: "3m 12s", at: "2h ago" },
  { id: "m2", result: "loss" as const, opponent: "Perfect AI", mode: "4×4 · Standard", duration: "4m 04s", at: "Yesterday" },
  { id: "m3", result: "draw" as const, opponent: "Mira K.", mode: "5×5 · Endless", duration: "6m 47s", at: "Yesterday" },
  { id: "m4", result: "win" as const, opponent: "Theo R.", mode: "4×4 · Reclaim", duration: "2m 51s", at: "2d ago" },
];

const tone = {
  win: { icon: Trophy, label: "Win", cls: "text-bone" },
  loss: { icon: X, label: "Loss", cls: "text-smoke" },
  draw: { icon: Minus, label: "Draw", cls: "text-muted-foreground" },
};

export function RecentActivity() {
  return (
    <section>
      <SectionHeader
        title="Recent activity"
        description="Your last matches. Replay any of them."
        action={
          <button className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-white/[0.08]">
            View all
          </button>
        }
      />
      <ol className="relative space-y-2.5 border-l border-white/[0.06] pl-5">
        {items.map((it, i) => {
          const T = tone[it.result];
          return (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-[26px] top-3 grid size-3 place-items-center rounded-full border border-white/15 bg-background">
                <span className="size-1 rounded-full bg-bone" />
              </span>
              <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] ${T.cls}`}>
                    <T.icon className="size-4" strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-semibold">
                      {T.label} <span className="text-muted-foreground">vs</span> {it.opponent}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {it.mode} · {it.duration} · {it.at}
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-white/[0.08]">
                  <Play className="size-3" /> Replay
                </button>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
