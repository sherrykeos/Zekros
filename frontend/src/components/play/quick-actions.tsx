import { motion } from "motion/react";
import {
  Zap,
  Brain,
  Sparkles,
  DoorOpen,
  DoorClosed,
  Settings2,
  ArrowUpRight,
  CirclePile,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";

type Action = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: boolean;
  tag?: string;
};

const actions: Action[] = [
  {
    id: "quick",
    title: "Quick PvP",
    description: "play with your frined locally",
    icon: Zap,
    accent: true,
    tag: "Fastest",
  },
  {
    id: "smart",
    title: "Play vs Smart AI",
    description: "An adaptive opponent that studies your patterns.",
    icon: Brain,
    tag: "Adaptive",
  },
  {
    id: "perfect",
    title: "Play vs Perfect AI",
    description: "Mathematically optimal. Aim for a draw.",
    icon: Sparkles,
    tag: "Hardest",
  },
  // {
  //   id: "Room",
  //   title: "Custom Room",
  //   description: "Spin up a private lobby with your own rules.",
  //   icon: DoorOpen,
  //   tag: "Private",
  // },
  // {
  //   id: "custom",
  //   title: "Custom Match",
  //   description: "Configure board, pieces, tokens and win length.",
  //   icon: Settings2,
  //   tag: "Tweak",
  // },

  // {
  //   id: "multiplayer",
  //   title: "Multiplayer",
  //   description: "Real-time match against a random player on the server.",
  //   icon: CirclePile,
  //   tag: "COMING SOON",
  // },
];

export function QuickActions({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        title="Quick actions"
        description="Jump straight into a match."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.id}
            onClick={() => onSelect?.(a.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className={`group relative flex h-full flex-col items-start overflow-hidden rounded-2xl p-5 text-left transition-colors ${
              a.accent
                ? "border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent"
                : "glass"
            }`}
          >
            <div className="flex w-full items-start justify-between">
              <div
                className={`grid size-11 place-items-center rounded-xl ${
                  a.accent
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/[0.04] text-foreground"
                }`}
              >
                <a.icon className="size-5" strokeWidth={1.6} />
              </div>
              <div className="flex items-center gap-2">
                {a.tag && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {a.tag}
                  </span>
                )}
                <ArrowUpRight className="size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>
            </div>
            <div className="mt-8 font-display text-base font-semibold tracking-tight">
              {a.title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {a.description}
            </p>
            {/* hover glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-20 -top-20 size-48 rounded-full bg-white/[0.07] blur-3xl" />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
