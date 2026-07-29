import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Mail, Check } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
} from "@/components/auth/auth-shell";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password - ZEKROS" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();
  const sent = forgotPassword.isSuccess;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setValidationError("Email is required.");
      return;
    }

    forgotPassword.mutate(normalizedEmail);
  };

  const error = validationError ?? forgotPassword.errorMessage;

  return (
    <AuthShell
      eyebrow="Forgot password"
      title={sent ? "Check your inbox." : "Reset your password."}
      description={
        sent
          ? (forgotPassword.data?.message ??
            "We've sent a reset link if an account exists for that email.")
          : "Enter your email and we'll send a reset link."
      }
      footer={
        <Link to="/auth/sign-in" search={{}} className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Check className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The link expires soon. Didn't get it?{" "}
            <button
              onClick={() => forgotPassword.reset()}
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
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              {error}
            </div>
          )}
          <PrimaryButton loading={forgotPassword.isPending}>
            Send reset link
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
