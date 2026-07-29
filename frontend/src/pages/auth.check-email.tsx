import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, RefreshCcw, Pencil } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
} from "@/components/auth/auth-shell";
import { useResendVerification } from "@/hooks/useResendVerification";

export const Route = createFileRoute("/auth/check-email")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: (search.email as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Check your email - ZEKROS" }] }),
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const { email } = Route.useSearch();
  const [emailInput, setEmailInput] = useState(email ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const resendVerification = useResendVerification();
  const navigate = useNavigate();

  const targetEmail = emailInput.trim().toLowerCase();

  const handleResend = () => {
    setValidationError(null);

    if (!targetEmail) {
      setValidationError(
        "Enter the email address you used to create your account.",
      );
      return;
    }

    resendVerification.mutate(targetEmail);
  };

  const error = validationError ?? resendVerification.errorMessage;

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Check your inbox."
      description="We sent a verification email. Open that link to finish verifying your account."
      footer={
        <Link to="/auth/sign-in" search={{}} className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Mail className="size-6" />
        </div>

        {email ? (
          <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Sent to
            </div>
            <div className="mt-1 break-all text-sm font-medium text-foreground">
              {email}
            </div>
          </div>
        ) : (
          <div className="mt-5 w-full text-left">
            <FormField label="Email">
              <TextInput
                type="email"
                autoComplete="email"
                placeholder="you@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </FormField>
          </div>
        )}

        {resendVerification.data?.message && (
          <div className="mt-4 w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
            {resendVerification.data.message}
          </div>
        )}

        {error && (
          <div className="mt-4 w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="mt-6 w-full space-y-3">
          <PrimaryButton
            type="button"
            loading={resendVerification.isPending}
            onClick={handleResend}
          >
            <RefreshCcw className="size-4" /> Resend email
          </PrimaryButton>
          <button
            type="button"
            onClick={() => navigate({ to: "/auth/sign-up" })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <Pencil className="size-3.5" /> Change email
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
