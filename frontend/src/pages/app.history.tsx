import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "Match History - ZEKROS" }] }),
  component: HistoryRoute,
});

function HistoryRoute() {
  return (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  );
}

function HistoryPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Match history"
        description="Every game you've played, with replays."
      />

      <EmptyState
        icon={History}
        title="No match history loaded"
        description="Add the match history feature with its own types, API file, hooks, and rendering components."
      />
    </div>
  );
}
