import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Users } from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";

export const Route = createFileRoute("/app/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard - ZEKROS" }] }),
  component: LeaderboardRoute,
});

function LeaderboardRoute() {
  return (
    <RequireAuth>
      <LeaderboardPage />
    </RequireAuth>
  );
}

function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leaderboard"
        description="Season standings will appear after the leaderboard API is connected."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <EmptyState
          icon={Trophy}
          title="No global standings loaded"
          description="Create leaderboard types, an API module, and query hooks before rendering standings."
        />
        <EmptyState
          icon={Users}
          title="Friends leaderboard unavailable"
          description="The friends leaderboard should use the same feature pattern once social APIs are connected."
        />
      </div>
    </div>
  );
}
