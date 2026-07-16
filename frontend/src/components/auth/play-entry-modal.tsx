import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { User2, LogIn, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePlayEntry } from "@/contexts/play-entry";

export function PlayEntryModal() {
  const { open, closeEntry, intent } = usePlayEntry();
  const navigate = useNavigate();

  const handleGuest = () => {
    closeEntry();
    void navigate({ to: "/app/play" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : closeEntry())}>
      <DialogContent
        className="glass-strong max-w-lg overflow-hidden rounded-3xl border-white/10 bg-background/80 p-0"
        aria-describedby={undefined}
      >
        <div className="relative px-7 pt-7 pb-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {intent === "multiplayer" ? "Multiplayer access" : "Welcome to ZEKROS"}
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              How would you like to continue?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jump straight in as a guest, or sign in to unlock multiplayer and cloud history.
            </p>
          </div>

          <div className="mt-7 space-y-3">
            <motion.button
              whileHover={{ y: -2 }}
              onClick={handleGuest}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.14] via-white/[0.05] to-transparent p-4 text-left"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-white text-black">
                <User2 className="size-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-display text-sm font-semibold">Continue as guest</div>
                  <span className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone">
                    Fastest
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Start playing in one click. Local and bot modes do not require an account.
                </p>
              </div>
              <ArrowRight className="size-4 -translate-x-1 text-muted-foreground transition-all group-hover:translate-x-0 group-hover:text-foreground" />
            </motion.button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EntryOption
                to="/auth/sign-in"
                onClick={closeEntry}
                icon={LogIn}
                title="Sign in"
                description="Welcome back."
              />
              <EntryOption
                to="/auth/sign-up"
                onClick={closeEntry}
                icon={UserPlus}
                title="Create account"
                description="Save progress to the cloud."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Guest mode supports Local PvP, Smart AI and Perfect AI. Multiplayer and cross-device
              history require a free ZEKROS account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EntryOption({
  to,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="glass group flex items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-white/[0.06]"
    >
      <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
    </Link>
  );
}
