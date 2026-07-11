import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Trophy,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  UserPlus,
  Calendar,
  Sparkles,
  Pencil,
  Crown,
} from "lucide-react";
import {
  EmptyState,
  GlassPanel,
  SectionHeader,
  StatCard,
} from "@/components/app/primitives";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [{ title: "Profile — ZEKROS" }],
  }),
  component: ProfilePage,
});

// TODO: replace with authenticated profile fetch
const profile = {
  username: "Zero Kelvin",
  handle: "@zerokelvin",
  initials: "ZK",
  tier: "Member",
  level: 14,
  xp: { current: 4820, next: 6000 },
  joined: "Jun 18, 2026",
  favoriteMode: "Smart AI",
};

const stats = [
  { label: "Games Played", value: "248", hint: "all-time", icon: BarChart3 },
  { label: "Wins", value: "163", icon: Trophy },
  { label: "Losses", value: "72", icon: TrendingUp },
  { label: "Draws", value: "13", icon: Sparkles },
  { label: "Win Rate", value: "65.7%", icon: TrendingUp },
  { label: "Favorite Mode", value: "Smart AI", hint: "47% of games", icon: Target },
  { label: "Longest Match", value: "18:42", icon: Clock },
  { label: "Avg. Match Time", value: "4:12", icon: Clock },
];

const recent = [
  { mode: "Smart AI", opponent: "Smart AI", winner: "You", duration: "3:11", date: "Today, 12:08" },
  { mode: "Duel", opponent: "neon.fox", winner: "neon.fox", duration: "7:30", date: "Yesterday" },
  { mode: "Perfect AI", opponent: "Perfect AI", winner: "Draw", duration: "9:14", date: "Yesterday" },
  { mode: "Local", opponent: "Local", winner: "You", duration: "4:02", date: "Jun 26" },
];

function ProfilePage() {
  const xpPct = Math.round((profile.xp.current / profile.xp.next) * 100);

  return (
    <div className="space-y-8">
      <GlassPanel className="overflow-hidden p-6">
        <div className="flex flex-wrap items-start gap-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-white/30 to-white/5 font-display text-xl font-semibold ring-1 ring-white/15"
          >
            {profile.initials}
            <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border border-white/15 bg-background text-[10px] font-medium">
              {profile.level}
            </span>
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {profile.username}
              </h1>
              <Badge tone="solid">{profile.tier}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{profile.handle}</div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Joined {profile.joined}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Crown className="size-3.5" /> Favorite: {profile.favoriteMode}
              </span>
            </div>

            <div className="mt-4 max-w-md">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Level {profile.level}</span>
                <span>
                  {profile.xp.current} / {profile.xp.next} XP
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-white/70 to-white/30"
                />
              </div>
            </div>
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm hover:bg-white/[0.06]">
            <Pencil className="size-3.5" /> Edit
          </button>
        </div>
      </GlassPanel>

      <section>
        <SectionHeader title="Lifetime statistics" description="Mock data — wired in Phase 7." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Recent matches"
          action={
            <Link
              to="/app/history"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          }
        />
        <GlassPanel className="divide-y divide-white/5">
          {recent.map((r, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <Badge>{r.mode}</Badge>
                <span className="text-muted-foreground">vs {r.opponent}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span
                  className={
                    r.winner === "You"
                      ? "font-medium text-foreground"
                      : r.winner === "Draw"
                        ? ""
                        : "text-foreground/70"
                  }
                >
                  {r.winner === "You" ? "Victory" : r.winner === "Draw" ? "Draw" : "Defeat"}
                </span>
                <span className="font-mono">{r.duration}</span>
                <span>{r.date}</span>
              </div>
            </div>
          ))}
        </GlassPanel>
      </section>

      <section>
        <SectionHeader title="Friends" />
        <EmptyState
          icon={UserPlus}
          title="No friends yet"
          description="Once the social system launches, your friends and party invites appear here."
          action={
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-muted-foreground">
              Coming soon
            </button>
          }
        />
      </section>
    </div>
  );
}

function Badge({
  children,
  tone = "soft",
}: {
  children: React.ReactNode;
  tone?: "soft" | "solid";
}) {
  return (
    <span
      className={
        tone === "solid"
          ? "rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-black"
          : "rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground"
      }
    >
      {children}
    </span>
  );
}
