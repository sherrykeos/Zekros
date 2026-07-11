import { useState } from "react";
import { motion } from "motion/react";
import { Users, Brain, Sparkles, Wifi, Check, type LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";
import { MiniBoard } from "./mini-board";

type Mode = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: "Casual" | "Standard" | "Advanced" | "Live";
  duration: string;
  skill: string;
  pieces: Array<{ i: number; player: "x" | "o"; fading?: boolean }>;
};

const modes: Mode[] = [
  {
    id: "local",
    title: "Local PvP",
    description: "Share the screen. Two players, one device.",
    icon: Users,
    difficulty: "Casual",
    duration: "5–10 min",
    skill: "Any level",
    pieces: [
      { i: 0, player: "x" }, { i: 4, player: "o" }, { i: 5, player: "x" },
      { i: 8, player: "o", fading: true },
    ],
  },
  {
    id: "smart",
    title: "Human vs Smart AI",
    description: "Adaptive AI that learns your tendencies as you play.",
    icon: Brain,
    difficulty: "Standard",
    duration: "3–6 min",
    skill: "Beginner → Pro",
    pieces: [
      { i: 1, player: "x" }, { i: 5, player: "o" }, { i: 6, player: "x" },
      { i: 10, player: "o", fading: true }, { i: 15, player: "x" },
    ],
  },
  {
    id: "perfect",
    title: "Human vs Perfect AI",
    description: "A solver that plays optimal moves. Pure challenge.",
    icon: Sparkles,
    difficulty: "Advanced",
    duration: "2–5 min",
    skill: "Advanced",
    pieces: [
      { i: 0, player: "o" }, { i: 3, player: "x" }, { i: 5, player: "o" },
      { i: 9, player: "x" }, { i: 10, player: "o" }, { i: 12, player: "x", fading: true },
    ],
  },
  {
    id: "multiplayer",
    title: "Custom Room",
    description: "Real-time matches against your friend at distance.",
    icon: Wifi,
    difficulty: "Live",
    duration: "4–8 min",
    skill: "All ranks",
    pieces: [
      { i: 2, player: "x" }, { i: 5, player: "o" }, { i: 6, player: "x", fading: true },
      { i: 9, player: "o" }, { i: 11, player: "x" }, { i: 14, player: "o" },
    ],
  },
];

const difficultyTone: Record<Mode["difficulty"], string> = {
  Casual: "border-white/10 bg-white/[0.04] text-smoke",
  Standard: "border-white/15 bg-white/[0.07] text-bone",
  Advanced: "border-white/20 bg-white/[0.12] text-foreground",
  Live: "border-white/15 bg-gradient-to-br from-white/[0.14] to-transparent text-foreground",
};

export function GameModes({
  onLaunch,
}: {
  onLaunch?: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string>("smart");

  return (
    <section>
      <SectionHeader
        title="Game modes"
        description="Pick the surface you want to play on."
        action={
          <button
            onClick={() => onLaunch?.(selected)}
            className="rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground"
          >
            Launch selected
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modes.map((m, i) => {
          const isSel = selected === m.id;
          return (
            <motion.button
              key={m.id}
              onClick={() => setSelected(m.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 text-left transition-colors ${
                isSel
                  ? "border border-white/25 bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent"
                  : "glass border border-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <m.icon className="size-4" strokeWidth={1.6} />
                </div>
                {isSel && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="grid size-6 place-items-center rounded-full bg-white text-black"
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                )}
              </div>

              <div className="mt-4">
                <MiniBoard size={4} pieces={m.pieces} className="max-w-[180px]" />
              </div>

              <div className="mt-4 font-display text-base font-semibold tracking-tight">
                {m.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${difficultyTone[m.difficulty]}`}
                >
                  {m.difficulty}
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {m.duration}
                </span>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Recommended · {m.skill}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
