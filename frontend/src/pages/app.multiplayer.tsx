import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Plus, Balloon } from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePlayEntry } from "@/contexts/play-entry";

export const Route = createFileRoute("/app/multiplayer")({
  component: MultiplayerRoute,
});

function MultiplayerRoute() {
  return (
    <RequireAuth>
      <MultiplayerPage />
    </RequireAuth>
  );
}

function MultiplayerPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { openAccountRequired } = usePlayEntry();
  const isAuthenticated = Boolean(currentUser.data);

  useEffect(() => {
    if (!currentUser.isPending && !isAuthenticated) openAccountRequired();
  }, [currentUser.isPending, isAuthenticated, openAccountRequired]);

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
            onClick={() => (isAuthenticated ? navigate({ to: "/app/lobby" }) : openAccountRequired())}
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
      <section className="glass flex items-center justify-center gap-1 rounded-2xl p-5">
        <Balloon className="mx-1 size-5 opacity-40" />
        <p className="opacity-40">Coming Soon</p>
      </section>
    </div>
  );
}
