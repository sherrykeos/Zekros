import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Copy, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCreateRoom } from "@/hooks/room";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function genCode() {
  const s = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `ZK-${s.padEnd(4, "X")}`;
}

export function CreateRoomModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [code, setCode] = useState(genCode());
  const [visibility, setVisibility] = useState<"private" | "unlisted">("private");
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useCreateRoom();

  const handleCreate = async () => {
    try {
      const result = await createRoom({
        host: {
          id: user?.id ?? `local_${Date.now()}`,
          name: user?.username ?? "Local Player",
        },
        settings: {
          gameMode: "HUMAN_VS_HUMAN",
          isPrivate: visibility === "private",
        },
        metadata: {
          source: "frontend",
        },
      });

      if (result?.success) {
        const roomCode = result.data?.code ?? code;
        setCode(roomCode);
        onOpenChange(false);
        void navigate({ to: "/app/lobby", state: { roomCode, room: result.data } });
        return;
      }

      console.error(result?.error?.message ?? "Unable to create room.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md rounded-2xl border-white/10 bg-background/80 p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold tracking-tight">
              Create a room
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate a code, share it with a friend, and start playing.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Room code
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center font-mono text-lg tracking-[0.32em]">
                  {code}
                </div>
                <button
                  onClick={() => setCode(genCode())}
                  className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  aria-label="Regenerate code"
                >
                  <RefreshCcw className="size-4" />
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(code)}
                  className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  aria-label="Copy code"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Visibility
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["private", "unlisted"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
                      visibility === v
                        ? "border-white/25 bg-white/[0.08] text-foreground"
                        : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleCreate()}
              disabled={isCreatingRoom}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              {isCreatingRoom ? "Creatingâ€¦" : "Create room"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

