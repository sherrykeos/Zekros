import { motion } from "motion/react";
import { Zap, Sparkles, User } from "lucide-react";
import { MiniBoard } from "./mini-board";

export function PlayHero({ onQuickPlay }: { onQuickPlay?: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-6 sm:p-10">
      {/* animated gradient backdrop */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-32 -top-32 size-[28rem] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-[22rem] rounded-full bg-white/[0.03] blur-3xl" />
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(120deg, transparent 0%, white 35%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />
      </motion.div>

      <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-bone" /> Welcome back, Player
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Ready to play.
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Pick a mode, summon an opponent, or jump into a quick match. Every game evolves —
            no two boards play the same.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <motion.button
              onClick={onQuickPlay}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_30px_-12px_rgba(255,255,255,0.4)]"
            >
              <User className="size-4" /> Quick Match
            </motion.button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground hover:bg-white/[0.06]">
              <Sparkles className="size-4" /> Challenge Perfect AI
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative hidden w-72 shrink-0 md:block"
        >
          <div className="absolute -inset-6 rounded-3xl bg-white/[0.04] blur-2xl" />
          <div className="glass relative rounded-2xl p-4">
            <MiniBoard
              size={4}
              pieces={[
                { i: 0, player: "x" },
                { i: 5, player: "o" },
                { i: 6, player: "x", fading: true },
                { i: 10, player: "o" },
                { i: 11, player: "x" },
                { i: 15, player: "o", fading: true },
              ]}
            />
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Live preview</span>
              <span>4 × 4</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
