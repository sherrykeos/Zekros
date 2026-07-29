import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  DoorClosed,
  DoorOpen,
  Brain,
  Sparkles,
  User,
  CircleDot,
  History,
} from "lucide-react";
import {
  DashboardCard,
  EmptyState,
  SectionHeader,
} from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/app/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const { data: user } = useCurrentUser();

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Account dashboard
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back,{" "}
            <span className="text-gradient">{user?.username}</span>.
          </h1>
        </div>
        <Link
          to="/app/play"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Play
        </Link>
      </motion.section>

      <section>
        <SectionHeader
          title="Jump in"
          description="Pick a mode and you're playing in seconds."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Local PvP"
            description="Play with a friend locally."
            icon={User}
            cta="Play"
            accent
          />
          <DashboardCard
            title="Play vs Smart AI"
            description="Trained to adapt to your strategy in real time."
            icon={Brain}
            cta="Play"
          />
          <DashboardCard
            title="Play vs Perfect AI"
            description="The unbeatable benchmark. Try to draw."
            icon={Sparkles}
            cta="Challenge"
          />
          <DashboardCard
            title="Create Room"
            description="Spin up a private room and invite friends."
            icon={DoorOpen}
            cta="Create"
          />
          <DashboardCard
            title="Join Room"
            description="Enter a room code to play with anyone."
            icon={DoorClosed}
            cta="Join"
          />
          <DashboardCard
            title="Multiplayer"
            description="Auto-match with someone at your skill level."
            icon={CircleDot}
            cta="Start"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Your statistics"
          description="Stats will appear when the stats feature API is connected."
        />
        <EmptyState
          icon={History}
          title="No account statistics loaded"
          description="Use the auth feature as the reference pattern when adding stats, matches, replays, and leaderboard APIs."
        />
      </section>
    </div>
  );
}
