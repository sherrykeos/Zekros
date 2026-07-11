import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AuthShell, FormField, TextInput, PrimaryButton } from "@/components/auth/auth-shell";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — ZEKROS" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // TODO: wire to `supabase.auth.updateUser({ password })` in Phase 5.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate({ to: "/auth/sign-in" }), 1200);
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title={done ? "Password updated." : "Set a new password."}
      description={done ? "Redirecting to sign in…" : "Pick something memorable but hard to guess."}
      footer={
        <Link to="/auth/sign-in" className="hover:text-foreground">
          ← Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <ShieldCheck className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">You can now sign in.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="New password">
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </FormField>
          <FormField label="Confirm password">
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </FormField>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              {error}
            </div>
          )}
          <PrimaryButton loading={loading}>Update password</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
