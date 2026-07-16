import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, XCircle } from "lucide-react";
import { AuthShell, PrimaryButton } from "@/components/auth/auth-shell";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Verify email - ZEKROS" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const verification = useVerifyEmail(token);
  const missingToken = !token;
  const loading = verification.isPending && !missingToken;
  const success = verification.isSuccess && Boolean(verification.data?.success);
  const error = missingToken || verification.isError;
  const message = missingToken
    ? "Verification token is missing."
    : verification.message ?? verification.errorMessage ?? "Verifying your email...";

  return (
    <AuthShell
      eyebrow="Email verification"
      title={loading ? "Verifying..." : success ? "Email verified" : "Verification failed"}
      description={message}
      footer={
        <Link to="/auth/sign-in" className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
          {loading && <Loader2 className="size-6 animate-spin" />}
          {success && <Check className="size-6 text-green-500" />}
          {error && <XCircle className="size-6 text-red-500" />}
        </div>

        {success && (
          <PrimaryButton onClick={() => navigate({ to: "/auth/sign-in" })} className="mt-6">
            Continue to Sign In
          </PrimaryButton>
        )}

        {error && (
          <PrimaryButton onClick={() => navigate({ to: "/auth/check-email" })} className="mt-6">
            Request new verification email
          </PrimaryButton>
        )}

        {loading && <p className="mt-6 text-sm text-muted-foreground">Please wait...</p>}
      </div>
    </AuthShell>
  );
}
