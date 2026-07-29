import { Link } from "@tanstack/react-router";
import { Users, LogIn, UserPlus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePlayEntry } from "@/contexts/play-entry";

export function AccountRequiredModal() {
  const { accountRequiredOpen, closeAccountRequired } = usePlayEntry();

  return (
    <Dialog
      open={accountRequiredOpen}
      onOpenChange={(v) => (v ? null : closeAccountRequired())}
    >
      <DialogContent
        className="glass-strong max-w-md overflow-hidden rounded-3xl border-white/10 bg-background/80 p-0"
        aria-describedby={undefined}
      >
        <div className="relative px-7 py-7">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <Users className="size-5" strokeWidth={1.7} />
          </div>
          <h2 className="mt-4 text-center font-display text-xl font-semibold tracking-tight">
            Multiplayer needs an account
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Real-time matches use your ZEKROS profile for ranking, replay
            history and friend invites. Creating one takes about ten seconds.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to="/auth/sign-up"
              search={{}}
              onClick={closeAccountRequired}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              <UserPlus className="size-4" /> Create account
            </Link>
            <Link
              to="/auth/sign-in"
              search={{}}
              onClick={closeAccountRequired}
              className="glass inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.06]"
            >
              <LogIn className="size-4" /> Sign in
            </Link>
          </div>

          <button
            onClick={closeAccountRequired}
            className="mt-3 w-full rounded-lg px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
