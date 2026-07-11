import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Zap,
  DoorOpen,
  DoorClosed,
  Brain,
  Sparkles,
  History,
  BarChart3,
  User,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Play,
  CirclePile,
} from "lucide-react";
import {
  DashboardCard,
  StatCard,
  SectionHeader,
  GlassPanel,
} from "@/components/app/primitives";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const stats = [
  {
    label: "Games Played",
    value: "248",
    hint: "+12 this week",
    icon: BarChart3,
  },
  { label: "Wins", value: "163", hint: "65.7% rate", icon: Trophy },
  { label: "Win Rate", value: "65.7%", hint: "+3.2% MoM", icon: TrendingUp },
  { label: "Avg. Time", value: "4:12", hint: "per match", icon: Clock },
];

const games = [
  {
    mode: "Ranked",
    opponent: "Vector_91",
    winner: "You",
    duration: "5:42",
    date: "Today, 14:21",
    win: true,
  },
  {
    mode: "Smart AI",
    opponent: "Smart AI",
    winner: "You",
    duration: "3:11",
    date: "Today, 12:08",
    win: true,
  },
  {
    mode: "Duel",
    opponent: "neon.fox",
    winner: "neon.fox",
    duration: "7:30",
    date: "Yesterday",
    win: false,
  },
  {
    mode: "Perfect AI",
    opponent: "Perfect AI",
    winner: "Draw",
    duration: "9:14",
    date: "Yesterday",
    win: null,
  },
  {
    mode: "Ranked",
    opponent: "kappa_77",
    winner: "You",
    duration: "4:02",
    date: "Jun 26",
    win: true,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sunday, June 28
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, <span className="text-gradient">Zero</span>.
          </h1>
          {/* <p className="mt-1 text-sm text-muted-foreground">
            You're on a 7-game win streak. Keep the momentum.
          </p> */}
        </div>
        {/* <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]">
          <Play className="size-4" /> Resume last match
        </button> */}
      </motion.section>

      {/* Quick actions */}
      <section>
        <SectionHeader
          title="Jump in"
          description="Pick a mode and you're playing in seconds."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="P v P"
            description="play with you friend locally"
            icon={User}
            cta="let's go"
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
            icon={CirclePile}
            cta="Start"
          />
        </div>
      </section>

      {/* Statistics */}
      <section>
        <SectionHeader
          title="Your statistics"
          description="A snapshot from the last 30 days."
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Recent games + Profile summary */}
      <section className="grid grid-cols-1 gap-5 ">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Recent games"
            description="Your last five matches."
            action={
              <button className="text-xs text-muted-foreground hover:text-foreground">
                View all →
              </button>
            }
          />
          <GlassPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Opponent</th>
                    <th className="px-4 py-3">Winner</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Replay</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g, i) => (
                    <tr
                      key={i}
                      className="border-t border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px]">
                          {g.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {g.opponent}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1.5 ${g.win === true ? "text-emerald-300" : g.win === false ? "text-rose-300" : "text-muted-foreground"}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${g.win === true ? "bg-emerald-400" : g.win === false ? "bg-rose-400" : "bg-muted-foreground"}`}
                          />
                          {g.winner}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {g.duration}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {g.date}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          Watch →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        {/* <div>
          <SectionHeader title="Profile" />
          <GlassPanel className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-white/30 to-white/5 text-sm font-semibold ring-1 ring-white/10">
                ZK
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold">Zero Kelvin</div>
                <div className="truncate text-xs text-muted-foreground">player@zeroth.dev</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Mini label="Rating" value="1,842" />
              <Mini label="Rank" value="#231" />
              <Mini label="Tier" value="Gold" />
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Next tier</span>
                <span>1,842 / 2,000</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-white/70 to-white"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <Target className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                <div className="text-xs font-medium">Favorite mode</div>
                <div className="text-[11px] text-muted-foreground">Ranked Duel — 47% of games</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <User className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                <div className="text-xs font-medium">Member since</div>
                <div className="text-[11px] text-muted-foreground">June 2026 · Founding player</div>
              </div>
            </div>
          </GlassPanel>
        </div> */}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] py-2">
      <div className="font-display text-sm font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
