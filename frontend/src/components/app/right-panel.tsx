import { AnimatePresence, motion } from "motion/react";
import { Activity, Trophy, Megaphone, Lightbulb, Calendar, Code2 } from "lucide-react";
import { useAppShell } from "@/contexts/app-shell";

export function RightPanel() {
  const { rightOpen } = useAppShell();

  return (
    <AnimatePresence initial={false}>
      {rightOpen && (
        <motion.aside
          key="right"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="hidden h-[calc(100vh-1rem)] shrink-0 overflow-hidden xl:block"
        >
          <div className="glass flex h-full w-[320px] flex-col rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-display text-sm font-semibold">Activity</span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Live
              </span>
            </div>
            <div className="hairline mx-3" />
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto p-4">
              <Section title="Quick Stats" icon={Trophy}>
                <div className="grid grid-cols-2 gap-2">
                  <MiniStat label="Rating" value="1,842" trend="+24" />
                  <MiniStat label="Streak" value="7" trend="W" />
                  <MiniStat label="Today" value="3" trend="games" />
                  <MiniStat label="Rank" value="#231" trend="-12" />
                </div>
              </Section>

              <Section title="Recent Matches" icon={Activity}>
                <div className="space-y-1.5">
                  {recent.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`size-1.5 shrink-0 rounded-full ${m.win ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span className="truncate text-xs">{m.opponent}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m.time}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Announcement" icon={Megaphone}>
                <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-3">
                  <div className="text-xs font-medium">Season 01 begins July 14</div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    Climb the global ladder. Cosmetic rewards every 100 ELO.
                  </p>
                </div>
              </Section>

              <Section title="Upcoming Tournament" icon={Calendar}>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-3">
                  <div className="text-xs font-medium">ZEROTH Open · Qualifiers</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Aug 02 · 256 slots</div>
                  <button className="mt-2 w-full rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground">
                    Reserve seat
                  </button>
                </div>
              </Section>

              <Section title="Tip" icon={Lightbulb}>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Reclaim Tokens are most valuable on turn 4. Hold one for the late mid-game.
                </p>
              </Section>

              <Section title="Developer Notes" icon={Code2}>
                <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                  <div>build · 0.1.0-preview</div>
                  <div>region · eu-west-2</div>
                  <div>latency · 24ms (p99 42ms)</div>
                </div>
              </Section>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const recent = [
  { id: 1, opponent: "Vector_91", win: true, time: "2m" },
  { id: 2, opponent: "Smart AI", win: true, time: "14m" },
  { id: 3, opponent: "neon.fox", win: false, time: "1h" },
  { id: 4, opponent: "Perfect AI", win: false, time: "3h" },
];

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3" />
        {title}
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-display text-base font-semibold">{value}</span>
        <span className="text-[10px] text-muted-foreground">{trend}</span>
      </div>
    </div>
  );
}
