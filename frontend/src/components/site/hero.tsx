import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroBoard } from "./hero-board";
import { dispatchPlayNow } from "@/contexts/play-entry";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-16 md:pt-44 md:pb-24">
      {/* ambient halo */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-white/70" />
            ZEROTH Labs · Now in private alpha
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease }}
            className="text-gradient mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Strategy,
            <br />
            evolved.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            ZEKROS is a real-time strategy game where boards adapt, pieces vanish,
            and every move compounds. A minimal surface hiding a deep, evolving lattice of decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={() => dispatchPlayNow("default")}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Play Now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how"
              className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08]"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Real-time</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Adaptive AI</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Replayable</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="relative mx-auto w-full max-w-md"
        >
          <HeroBoard />
        </motion.div>
      </div>
    </section>
  );
}
