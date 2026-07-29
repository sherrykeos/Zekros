import { motion } from "motion/react";
import { RotateCcw, Check, X, Loader2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type RematchModalType = "incoming" | "outgoing" | "declined";

export function RematchModal({
  open,
  type,
  senderName = "Opponent",
  onAccept,
  onDecline,
  onCancel,
}: {
  open: boolean;
  type: RematchModalType;
  senderName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={() => null}>
      <DialogContent
        className="glass-strong max-w-md overflow-hidden rounded-3xl border-white/10 bg-background/90 p-0 shadow-2xl backdrop-blur-2xl"
        aria-describedby={undefined}
      >
        <div className="relative px-7 py-8 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl" />

          {type === "incoming" && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="mx-auto grid size-16 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                <RotateCcw className="size-7 animate-spin-slow" />
              </motion.div>

              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-medium">
                Rematch Request
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
                Challenge Offered!
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{senderName}</span> wants a rematch under the same room code!
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={onAccept}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
                >
                  <Check className="size-4" /> Accept Rematch
                </button>
                <button
                  onClick={onDecline}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-medium text-foreground transition-all"
                >
                  <X className="size-4 text-rose-400" /> Decline
                </button>
              </div>
            </>
          )}

          {type === "outgoing" && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-primary"
              >
                <Loader2 className="size-7 animate-spin" />
              </motion.div>

              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Rematch Request
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Invitation Sent
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Waiting for opponent to accept your rematch request...
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={onCancel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  <ArrowLeft className="size-3.5" /> Cancel & Lobby
                </button>
              </div>
            </>
          )}

          {type === "declined" && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="mx-auto grid size-16 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400"
              >
                <X className="size-7" />
              </motion.div>

              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-rose-400 font-medium">
                Rematch Declined
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Match Declined
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your opponent declined the rematch. Returning to room lobby...
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={onCancel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all"
                >
                  Return to Lobby
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
