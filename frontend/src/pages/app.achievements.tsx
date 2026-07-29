import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Trophy,
  Flame,
  Crown,
  Bot,
  Sparkles,
  Swords,
  Lock,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import type { ComponentType } from "react";
import { GlassPanel, SectionHeader } from "@/components/app/primitives";

export const Route = createFileRoute("/app/achievements")({
  head: () => ({ meta: [{ title: "Achievements — ZEKROS" }] }),
  component: AchievementsPage,
});

type Achievement = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress?: { current: number; goal: number };
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
};

// TODO: replace with achievements API
const list: Achievement[] = [
  {
    title: "First Victory",
    description: "Win your first match.",
    icon: Trophy,
    unlocked: false,
    progress: { current: 0, goal: 1 },
    rarity: "Common",
  },
  {
    title: "100 Wins",
    description: "Reach one hundred total wins.",
    icon: Flame,
    unlocked: false,
    progress: { current: 24, goal: 100 },
    rarity: "Rare",
  },
  {
    title: "Perfect Match",
    description: "Win without losing a single piece.",
    icon: Sparkles,
    unlocked: false,
    rarity: "Epic",
  },
  {
    title: "AI Master",
    description: "Defeat the Perfect AI five times.",
    icon: Bot,
    unlocked: false,
    progress: { current: 1, goal: 5 },
    rarity: "Epic",
  },
  {
    title: "Champion",
    description: "Finish a season in the global top 10.",
    icon: Crown,
    unlocked: false,
    rarity: "Legendary",
  },
  {
    title: "Combo Strategist",
    description: "Reclaim three pieces in one match.",
    icon: Zap,
    unlocked: false,
    rarity: "Rare",
  },
  {
    title: "Untouchable",
    description: "Win 10 matches in a row.",
    icon: Shield,
    unlocked: false,
    progress: { current: 2, goal: 10 },
    rarity: "Epic",
  },
  {
    title: "Adaptive Mind",
    description: "Win on every board size 3×3 through 6×6.",
    icon: Target,
    unlocked: false,
    progress: { current: 1, goal: 4 },
    rarity: "Rare",
  },
  {
    title: "Rival",
    description: "Beat the same opponent five times.",
    icon: Swords,
    unlocked: false,
    rarity: "Common",
  },
];

const rarityTone: Record<Achievement["rarity"], string> = {
  Common: "border-white/10 text-muted-foreground",
  Rare: "border-white/15 text-foreground",
  Epic: "border-white/20 text-foreground",
  Legendary: "border-white/30 text-foreground bg-white/[0.04]",
};

function AchievementsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Achievements"
        description="A preview of milestones to chase. The full system arrives with backend."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card a={a} />
          </motion.div>
        ))}
      </div>

      <GlassPanel className="flex items-center justify-between gap-3 p-4">
        <div className="text-xs text-muted-foreground">
          All achievements are{" "}
          <span className="text-foreground">Coming Soon</span>. Progress shown
          is illustrative.
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Lock className="size-3" /> Locked
        </span>
      </GlassPanel>
    </div>
  );
}

function Card({ a }: { a: Achievement }) {
  const Icon = a.icon;
  const pct = a.progress
    ? Math.min(100, Math.round((a.progress.current / a.progress.goal) * 100))
    : 0;

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid size-11 place-items-center rounded-xl border bg-white/[0.03] ${a.unlocked ? "border-white/20 text-foreground" : "border-white/10 text-muted-foreground"}`}
        >
          {a.unlocked ? (
            <Icon className="size-5" />
          ) : (
            <Lock className="size-4" />
          )}
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${rarityTone[a.rarity]}`}
        >
          {a.rarity}
        </span>
      </div>

      <div className="mt-4 font-display text-base font-semibold tracking-tight">
        {a.title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {a.description}
      </p>

      {a.progress ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>
              {a.progress.current} / {a.progress.goal}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-white/60"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">
          Hidden criteria
        </div>
      )}

      {!a.unlocked && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
          Soon
        </div>
      )}
    </div>
  );
}
