import { motion } from "motion/react";
import {
  Grid3x3,
  Hourglass,
  RotateCcw,
  Cpu,
  Brain,
  Wifi,
  History,
  Settings2,
  ListOrdered,
  Network,
} from "lucide-react";

const features = [
  { icon: Grid3x3, title: "Dynamic Boards", desc: "Boards reshape between rounds — 3×3, 4×4, 5×5, asymmetric. The arena is part of the game." },
  { icon: Hourglass, title: "Disappearing Pieces", desc: "Your oldest piece fades when a new one lands. Memory becomes a resource." },
  { icon: RotateCcw, title: "Reclaim Tokens", desc: "Spend a token to reclaim a vanishing cell. Tight economy, tighter decisions." },
  { icon: Cpu, title: "Smart AI", desc: "An adaptive opponent that reads your patterns and counters them in real time." },
  { icon: Brain, title: "Perfect AI", desc: "An optional solver mode tuned to flawless play. The hardest mirror you'll face." },
  { icon: Wifi, title: "Real-Time Multiplayer", desc: "Low-latency matches over a dedicated socket layer. Move and feel it land." },
  { icon: History, title: "Replay", desc: "Step through any match move-by-move. Branch, compare, and learn." },
  { icon: Settings2, title: "Configurable Rules", desc: "Tune board size, token economy, decay rate. Build the variant you want." },
  { icon: ListOrdered, title: "Move History", desc: "A full, queryable timeline of every decision in every game." },
  { icon: Network, title: "REST + Socket", desc: "Stateless API for everything persistent; sockets for everything live." },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Features"
          title="Built like a product. Plays like a sport."
          desc="Ten primitives, one cohesive system. Every detail engineered to reward intent."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-colors hover:bg-white/[0.06]"
            >
              <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-foreground transition-transform group-hover:-translate-y-0.5">
                <f.icon className="size-[18px]" strokeWidth={1.6} />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl text-center"
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</div>
      <h2 className="text-gradient mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{desc}</p>}
    </motion.div>
  );
}
