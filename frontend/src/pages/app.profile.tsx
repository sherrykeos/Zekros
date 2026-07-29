import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
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
  Play,
  History as HistoryIcon,
} from "lucide-react";
import {
  EmptyState,
  GlassPanel,
  SectionHeader,
  StatCard,
} from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMatchList } from "@/hooks/match";
import type { MatchHistoryItem } from "@/services/api/matchService";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [{ title: "Profile - ZEKROS" }],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}

function initials(name?: string | null) {
  if (!name) return "ZK";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ZK"
  );
}

function formatDate(value?: string) {
  if (!value) return "Account active";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ProfilePage() {
  const { data: user } = useCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <GlassPanel className="overflow-hidden p-6">
        <div className="flex flex-wrap items-start gap-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 to-white/5 font-display text-xl font-semibold ring-1 ring-white/15"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              initials(user.username)
            )}
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {user.username}
              </h1>
              <Badge tone="solid">
                {user.isEmailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {user.email}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Joined{" "}
                {formatDate(user.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Crown className="size-3.5" /> Provider:{" "}
                {user.provider ?? "LOCAL"}
              </span>
            </div>
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm hover:bg-white/[0.06]">
            <Pencil className="size-3.5" /> Edit
          </button>
        </div>
      </GlassPanel>

      <section>
        <SectionHeader
          title="Lifetime statistics"
          description="Your real gameplay metrics calculated from recorded match history."
        />
        <ProfileStats />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <SectionHeader title="Recent matches" />
          <Link
            to="/app/history"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all history →
          </Link>
        </div>
        <ProfileRecentMatches />
      </section>

      <section>
        <SectionHeader title="Friends" />
        <EmptyState
          icon={UserPlus}
          title="No friends yet"
          description="Once the friends API is connected, friends and party invites appear here."
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

function ProfileStats() {
  const { data: user } = useCurrentUser();
  const { data: response } = useMatchList(user?.id ? { userId: user.id, limit: 200 } : { limit: 100 });
  const matches: MatchHistoryItem[] = response?.data ?? [];

  const stats = useMemo(() => {
    const totalGames = matches.length;
    if (totalGames === 0) {
      return [
        { label: "Games Played", value: "0", hint: "all-time", icon: BarChart3 },
        { label: "Wins", value: "0", icon: Trophy },
        { label: "Losses", value: "0", icon: TrendingUp },
        { label: "Win Rate", value: "0%", icon: TrendingUp },
        { label: "Favorite Mode", value: "-", hint: "no games played", icon: Target },
        { label: "Longest Match", value: "-", icon: Clock },
        { label: "Avg. Match Time", value: "-", icon: Clock },
      ];
    }

    let wins = 0;
    let losses = 0;
    let totalDurationMs = 0;
    let maxDurationMs = 0;
    let durationCount = 0;

    const modeCounts: Record<string, number> = {};

    for (const m of matches) {
      // Game mode tracking
      const mode =
        m.gameMode === "PBOT"
          ? "Perfect Bot"
          : m.gameMode === "NBOT"
          ? "Smart Bot"
          : m.gameMode === "ONLINE"
          ? "Online"
          : "Local";
      modeCounts[mode] = (modeCounts[mode] ?? 0) + 1;

      // Win / loss tracking
      const userParticipant = m.participants?.find((p) => p.userId === user?.id);
      if (userParticipant) {
        if (userParticipant.isWinner) wins++;
        else if (m.result) losses++;
      } else {
        // Fallback if local/guest match
        if (m.result === "PLAYER_X") wins++;
        else if (m.result === "PLAYER_O") losses++;
      }

      // Duration tracking
      if (m.durationMs) {
        totalDurationMs += m.durationMs;
        durationCount++;
        if (m.durationMs > maxDurationMs) maxDurationMs = m.durationMs;
      }
    }

    const winRate = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : "0%";

    let favMode = "-";
    let maxModeCount = 0;
    for (const [mode, count] of Object.entries(modeCounts)) {
      if (count > maxModeCount) {
        maxModeCount = count;
        favMode = mode;
      }
    }

    const formatMs = (ms: number) => {
      const sec = Math.round(ms / 1000);
      if (sec < 60) return `${sec}s`;
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      return `${min}m ${remSec}s`;
    };

    const longest = maxDurationMs > 0 ? formatMs(maxDurationMs) : "-";
    const avgTime = durationCount > 0 ? formatMs(totalDurationMs / durationCount) : "-";

    return [
      { label: "Games Played", value: String(totalGames), hint: "all-time", icon: BarChart3 },
      { label: "Wins", value: String(wins), icon: Trophy },
      { label: "Losses", value: String(losses), icon: TrendingUp },
      { label: "Win Rate", value: winRate, icon: TrendingUp },
      { label: "Favorite Mode", value: favMode, icon: Target },
      { label: "Longest Match", value: longest, icon: Clock },
      { label: "Avg. Match Time", value: avgTime, icon: Clock },
    ];
  }, [matches, user?.id]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
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

function ProfileRecentMatches() {
  const { data: user } = useCurrentUser();
  const { data: response, isLoading } = useMatchList(user?.id ? { userId: user.id, limit: 5 } : { limit: 5 });
  const matches: MatchHistoryItem[] = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <GlassPanel key={n} className="h-20 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No match history"
        description="Your recent matches will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const playerX = m.participants?.find((p) => p.symbol === "X");
        const playerO = m.participants?.find((p) => p.symbol === "O");
        const nameX = playerX?.user?.displayName || playerX?.user?.username || playerX?.guestName || "X";
        const nameO = playerO?.user?.displayName || playerO?.user?.username || playerO?.guestName || "O";

        return (
          <GlassPanel key={m.id} className="flex items-center justify-between p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span>{m.gameMode}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{m.boardSize}×{m.boardSize}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {nameX} vs {nameO}
              </div>
            </div>
            <Link
              to="/app/replay/$id"
              params={{ id: m.id }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white hover:text-black transition-colors"
            >
              <Play className="size-3 fill-current" /> Replay
            </Link>
          </GlassPanel>
        );
      })}
    </div>
  );
}
