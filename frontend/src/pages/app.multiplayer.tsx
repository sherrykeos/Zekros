import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Plus } from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/app/primitives";
import { useAuth } from "@/contexts/auth";
import { usePlayEntry } from "@/contexts/play-entry";
import { Balloon } from 'lucide-react';

export const Route = createFileRoute("/app/multiplayer")({
  component: MultiplayerPage,
});

function MultiplayerPage() {
  const navigate = useNavigate();
  const { status } = useAuth();
  const { openAccountRequired } = usePlayEntry();

  const isGuest = status === "guest" || status === "anonymous";

  useEffect(() => {
    if (isGuest) openAccountRequired();
  }, [isGuest, openAccountRequired]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Custom Rooms"
        description="Open rooms, friends, and live lobbies."
      />
      <EmptyState
        icon={Users}
        title="No open rooms yet"
        description="When players create public rooms, you'll see them here. Or start your own."
        action={
          <button
            onClick={() => (isGuest ? openAccountRequired() : navigate({ to: "/app/lobby" }))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="size-4" /> Create room
          </button>
        }
      />

       <SectionHeader
        title="Multiplayer"
        description="Real-time match against a random player on the server."
      />
      <section className="glass rounded-2xl p-5 flex justify-center items-center gap-1">
         <Balloon  className="opacity-40 w-5 h-5 mx-1"/>
        <p className="opacity-40">Coming Soon</p>

      </section>
    </div>
  );
}
