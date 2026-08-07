import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useJoinRoom } from "@/hooks/room.hooks";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiErrorMessage } from "@/lib/api-error";

export function JoinRoomModal({
  open,
  onOpenChange,
  initialCode = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { mutateAsync: joinRoom, isPending: isJoiningRoom } = useJoinRoom();
  useEffect(() => {
    setCode(initialCode);
    setError(null);
  }, [initialCode, open]);

  const handleJoin = async () => {
    const normalizedCode = code.replace(/[^A-Z0-9]/g, "").toUpperCase();

    try {
      const pId = user?.id ?? `local_${Date.now()}`;
      const result = await joinRoom({
        roomId: normalizedCode,
        playerInfo: {
          id: pId,
          name: user?.username ?? "Local Player",
        },
      });

      if (result) {
        onOpenChange(false);
        void navigate({
          to: "/app/lobby",
          state: {
            roomCode: normalizedCode,
            room: result,
            playerId: pId,
          } as any,
        });
        return;
      }

      console.error("Unable to join room.");
      setError("Unable to join room.");
    } catch (err: any) {
      console.error(err);
      setError(getApiErrorMessage(err, "Failed to join room."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md rounded-2xl border-white/10 bg-background/80 p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold tracking-tight">
              Join a room
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the 6-character room code your friend shared.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Room code
            </div>
            <input
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().slice(0, 7));
                setError(null);
              }}
              placeholder="ZK-XXXX"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center font-mono text-lg tracking-[0.32em] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            {error && (
              <div className="mt-3 text-center text-xs font-medium text-red-500/90 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleJoin()}
              disabled={code.length < 4 || isJoiningRoom}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              {isJoiningRoom ? "Joining…" : "Join match"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
