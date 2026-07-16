import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AuthShell, FormField, TextInput, PrimaryButton } from "@/components/auth/auth-shell";
import { useResetPassword } from "@/hooks/useResetPassword";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Set new password - ZEKROS" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const resetPassword = useResetPassword();
  const done = resetPassword.isSuccess;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!token) {
      setValidationError("Password reset token is missing.");
      return;
    }

    if (pw.length < 8) {
      setValidationError("Use at least 8 characters.");
      return;
    }

    if (pw !== confirm) {
      setValidationError("Passwords don't match.");
      return;
    }

    resetPassword.mutate({ token, password: pw });
  };

  const error = validationError ?? resetPassword.errorMessage;

  return (
    <AuthShell
      eyebrow="Reset password"
      title={done ? "Password updated." : "Set a new password."}
      description={done ? "Redirecting to sign in..." : "Pick something memorable but hard to guess."}
      footer={
        <Link to="/auth/sign-in" className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <ShieldCheck className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {resetPassword.data?.message ?? "You can now sign in."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="New password">
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="********"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </FormField>
          <FormField label="Confirm password">
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="********"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </FormField>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              {error}
            </div>
          )}
          <PrimaryButton loading={resetPassword.isPending}>Update password</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
