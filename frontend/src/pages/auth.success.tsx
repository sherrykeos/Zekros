import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENT_USER_QUERY_KEY, loadCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/auth/success")({
  head: () => ({ meta: [{ title: "Success - ZEKROS" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      try {
        setStatus("Restoring session...");
        // Reset query state first to ensure no stale cached 'null' user blocks
        queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });

        // Imperatively fetch query which fetches refresh token and loads current user into cache
        const user = await queryClient.fetchQuery({
          queryKey: CURRENT_USER_QUERY_KEY,
          queryFn: loadCurrentUser,
        });

        if (!active) return;

        if (!user) {
          throw new Error("Session restore failed - user is null");
        }

        setStatus("Redirecting...");
        const redirect = sessionStorage.getItem("auth_redirect") || "/app/play";
        sessionStorage.removeItem("auth_redirect");

        void navigate({ to: redirect as any });
      } catch (err) {
        console.error("Auth success page error:", err);
        if (active) {
          void navigate({ to: "/app/play" as any });
        }
      }
    }

    void completeAuth();

    return () => {
      active = false;
    };
  }, [navigate, queryClient]);

  return (
    <AuthShell
      eyebrow="Authentication"
      title="Logging in..."
      description={status}
    >
      <div className="flex flex-col items-center text-center py-6">
        <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse">
          <Loader2 className="size-6 animate-spin text-white" />
        </div>
      </div>
    </AuthShell>
  );
}
