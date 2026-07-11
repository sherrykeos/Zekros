import { motion } from "motion/react";
import { SectionHeader } from "./features";

const steps = [
  {
    n: "01",
    title: "Place",
    desc: "Drop a piece on a live board. Geometry isn't fixed — neither is the meta.",
  },
  {
    n: "02",
    title: "Decay",
    desc: "Your oldest piece fades on the next move. Plan ahead or pay the cost.",
  },
  {
    n: "03",
    title: "Reclaim",
    desc: "Spend tokens to lock cells, disrupt patterns, or extend a piece's life.",
  },
  {
    n: "04",
    title: "Win",
    desc: "Align intent across a shifting lattice. Replay the match, refine the read.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="How it works"
          title="A loop you'll feel by the third match."
          desc="Four primitives. Infinite depth. The kind of system that gets sharper the longer you play."
        />

        <div className="relative mt-16 grid gap-3 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative overflow-hidden rounded-2xl p-6"
            >
              <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
              <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="pointer-events-none absolute right-4 top-4 size-1.5 rounded-full bg-white/40" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
