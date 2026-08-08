import { motion } from "motion/react";

const stats = [
  { v: "12ms", k: "Median move latency" },
  { v: "10⁴⁷", k: "Possible board states" },
  { v: "99.99%", k: "Match-server uptime target" },
  { v: "0", k: "Loading screens" },
];

export function Stats() {
  return (
    <section className="relative px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="glass-strong group relative overflow-hidden rounded-3xl p-6 sm:p-7 md:py-8 md:px-10">
          {/* Background Image: stats-band-bg.jpg */}
          <img
            src="/assets/stats-band-bg.jpg"
            alt="Stats Background"
            className="absolute inset-0 size-full object-cover opacity-65 mix-blend-luminosity pointer-events-none transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70 pointer-events-none" />

          {/* Glass Highlight Line */}
          <div className="pointer-events-none absolute -inset-y-12 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-white/10 to-transparent" />

          {/* Stats Grid */}
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div className="text-gradient font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  {s.v}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.k}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
