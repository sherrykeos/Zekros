import { motion } from "motion/react";
import { SectionHeader } from "./features";
import {
  Swords,
  User,
  Users,
  Trophy,
  Infinity as InfinityIcon,
} from "lucide-react";

const modes = [
  {
    icon: User,
    name: "Solo",
    tag: "Practice",
    desc: "Train against scaled AI. Quiet, focused, endless.",
  },
  {
    icon: Swords,
    name: "Duel",
    tag: "1v1 Live",
    desc: "Direct head-to-head over real-time sockets.",
  },
  {
    icon: Trophy,
    name: "Ranked",
    tag: "Competitive",
    desc: "Climb a tuned ladder of adaptive players.",
  },
  {
    icon: Users,
    name: "Lobby",
    tag: "Private",
    desc: "Custom rooms, custom rules, your circle.",
  },
  {
    icon: InfinityIcon,
    name: "Endless",
    tag: "Survival",
    desc: "Decaying board, scaling pressure, single life.",
  },
];

export function Modes() {
  return (
    <section id="modes" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Game modes" title="Five surfaces. One core." />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {modes.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <m.icon className="size-4" strokeWidth={1.6} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {m.tag}
                </span>
              </div>
              <div className="mt-8 font-display text-lg font-semibold">
                {m.name}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
