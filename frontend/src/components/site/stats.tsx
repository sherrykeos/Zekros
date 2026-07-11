import { motion } from "motion/react";

const stats = [
  { v: "12ms", k: "Median move latency" },
  { v: "10⁴⁷", k: "Possible board states" },
  { v: "99.99%", k: "Match-server uptime target" },
  { v: "0", k: "Loading screens" },
];

export function Stats() {
  return (
    <section className="relative px-4 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="pointer-events-none absolute -inset-y-12 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-white/[0.05] to-transparent" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.k}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
