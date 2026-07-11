import { motion } from "motion/react";
import { Brain, Sparkles, Clock, Gauge } from "lucide-react";

type Bot = {
  id: "smart" | "perfect";
  name: string;
  description: string;
  difficulty: "Adaptive" | "Optimal";
  thinkingTime: string;
  tone: "calm" | "intense";
};

const bots: Bot[] = [
  {
    id: "smart",
    name: "Smart AI",
    description:
      "Studies your tendencies and adapts in real time. Forgiving early, ruthless late.",
    difficulty: "Adaptive",
    thinkingTime: "0.4–1.2s",
    tone: "calm",
  },
  {
    id: "perfect",
    name: "Perfect AI",
    description:
      "A solver that picks the mathematically optimal move every turn. Aim for the draw.",
    difficulty: "Optimal",
    thinkingTime: "0.1–0.4s",
    tone: "intense",
  },
];

export function BotModesGrid({ onLaunch }: { onLaunch?: (id: Bot["id"]) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {bots.map((b, i) => {
        const Icon = b.id === "smart" ? Brain : Sparkles;
        return (
          <motion.button
            key={b.id}
            onClick={() => onLaunch?.(b.id)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 text-left transition-colors ${
              b.tone === "intense"
                ? "border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent"
                : "glass border-white/[0.06]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Icon className="size-5" strokeWidth={1.6} />
              </div>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {b.difficulty}
              </span>
            </div>

            <div className="mt-6 font-display text-lg font-semibold tracking-tight">{b.name}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Meta icon={Clock} label="Thinks in" value={b.thinkingTime} />
              <Meta icon={Gauge} label="Difficulty" value={b.difficulty} />
            </div>

            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/[0.04] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
          </motion.button>
        );
      })}
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
