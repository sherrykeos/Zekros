import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Mail, Check } from "lucide-react";
import { AuthShell, FormField, TextInput, PrimaryButton } from "@/components/auth/auth-shell";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — ZEKROS" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // TODO: wire to `supabase.auth.resetPasswordForEmail()` in Phase 5.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell
      eyebrow="Forgot password"
      title={sent ? "Check your inbox." : "Reset your password."}
      description={
        sent
          ? "We've sent a reset link if an account exists for that email."
          : "Enter your email and we'll send a reset link."
      }
      footer={
        <Link to="/auth/sign-in" className="hover:text-foreground">
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Check className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The link expires in 30 minutes. Didn&apos;t get it?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-foreground underline-offset-4 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <TextInput
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </FormField>
          <PrimaryButton loading={loading}>Send reset link</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
