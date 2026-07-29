import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  Trophy,
  Megaphone,
  Lightbulb,
  Calendar,
  Code2,
} from "lucide-react";
import { useAppShell } from "@/contexts/app-shell";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function RightPanel() {
  const { rightOpen } = useAppShell();
  const { data: user } = useCurrentUser();

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
              <span className="font-display text-sm font-semibold">
                Activity
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Live
              </span>
            </div>
            <div className="hairline mx-3" />
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto p-4">
              <Section title="Account" icon={Trophy}>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs font-medium">
                    {user?.username ?? "Not signed in"}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    Account stats will appear here after the stats API is
                    connected.
                  </p>
                </div>
              </Section>

              <Section title="Recent Matches" icon={Activity}>
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug text-muted-foreground">
                  Match activity will render from the match history API.
                </div>
              </Section>

              <Section title="Announcement" icon={Megaphone}>
                <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-3">
                  <div className="text-xs font-medium">
                    Season system pending
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    Leaderboards and rewards should be connected through their
                    own feature API.
                  </p>
                </div>
              </Section>

              <Section title="Upcoming Tournament" icon={Calendar}>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-3">
                  <div className="text-xs font-medium">
                    Tournament module unavailable
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Connect a tournament API before enabling registration.
                  </div>
                  <button
                    disabled
                    className="mt-2 w-full rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground opacity-40"
                  >
                    Reserve seat
                  </button>
                </div>
              </Section>

              <Section title="Tip" icon={Lightbulb}>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Reclaim Tokens are most valuable on turn 4. Hold one for the
                  late mid-game.
                </p>
              </Section>

              <Section title="Developer Notes" icon={Code2}>
                <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                  <div>build - 0.1.0-preview</div>
                  <div>auth - TanStack Query</div>
                  <div>api - typed feature modules</div>
                </div>
              </Section>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

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
