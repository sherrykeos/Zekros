import { createFileRoute } from "@tanstack/react-router";
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
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [{ title: "Profile - ZEKROS" }],
  }),
  component: ProfileRoute,
});

const emptyStats = [
  { label: "Games Played", value: "0", hint: "all-time", icon: BarChart3 },
  { label: "Wins", value: "0", icon: Trophy },
  { label: "Losses", value: "0", icon: TrendingUp },
  { label: "Draws", value: "0", icon: Sparkles },
  { label: "Win Rate", value: "0%", icon: TrendingUp },
  { label: "Favorite Mode", value: "-", hint: "no games yet", icon: Target },
  { label: "Longest Match", value: "-", icon: Clock },
  { label: "Avg. Match Time", value: "-", icon: Clock },
];

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
          description="Stats will populate from the stats feature API."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {emptyStats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Recent matches" />
        <EmptyState
          icon={Clock}
          title="No match history loaded"
          description="Connect the match history API with the same types -> api -> hooks -> components pattern used by auth."
        />
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
