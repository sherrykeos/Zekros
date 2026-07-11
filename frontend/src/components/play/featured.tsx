import { motion } from "motion/react";
import { Trophy, ArrowUpRight } from "lucide-react";

export function Featured() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.10] via-white/[0.03] to-transparent p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="size-3" /> Featured · Season Zero
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            The first ranked season starts soon.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Climb a tuned ladder, earn placement, and shape the founding leaderboard. Sign up
            and we'll notify you the moment matchmaking opens.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
          Join the waitlist <ArrowUpRight className="size-4" />
        </button>
      </div>
    </motion.section>
  );
}
