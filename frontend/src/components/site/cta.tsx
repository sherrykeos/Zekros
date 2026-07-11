import { motion } from "motion/react";
import { ArrowRight, BellRing } from "lucide-react";
import { useState } from "react";
import { dispatchPlayNow } from "@/contexts/play-entry";

export function CTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section id="cta" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center md:px-12 md:py-20"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Now playable
          </div>
          <h2 className="text-gradient mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Step on the board.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Jump in as a guest or sign in to save matches across devices. Multiplayer rooms and
            ranked seasons are one tap away.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => dispatchPlayNow("default")}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              Play Now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="hairline mx-auto mt-12 max-w-sm" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubscribed(true);
            }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-foreground hover:bg-white/[0.06]"
            >
              <BellRing className="size-3.5" />
              {subscribed ? "Subscribed" : "Get release notes"}
            </button>
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            Optional. One short email per release wave.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
