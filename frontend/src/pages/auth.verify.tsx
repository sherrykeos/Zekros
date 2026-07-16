import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, XCircle } from "lucide-react";
import { AuthShell, PrimaryButton } from "@/components/auth/auth-shell";
import { api } from "@/services/client";

type VerificationResponse = {
  success: boolean;
  message: string;
};

const verificationRequests = new Map<string, Promise<VerificationResponse>>();

function verifyTokenOnce(token: string) {
  const existing = verificationRequests.get(token);
  if (existing) return existing;

  const request = api
    .get<VerificationResponse>("/auth/verify-email", { params: { token } })
    .then((response) => response.data);

  verificationRequests.set(token, request);
  return request;
}

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
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let active = true;

    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const data = await verifyTokenOnce(token);

        if (!active) return;

        setStatus(data.success ? "success" : "error");
        setMessage(data.message || "Email verified successfully.");
      } catch (error: any) {
        if (!active) return;

        setStatus("error");
        setMessage(error.response?.data?.message || "Invalid or expired verification link.");
      }
    }

    void verifyEmail();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell
      eyebrow="Email verification"
      title={
        status === "loading"
          ? "Verifying..."
          : status === "success"
            ? "Email verified"
            : "Verification failed"
      }
      description={message}
      footer={
        <Link to="/auth/sign-in" className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
          {status === "loading" && <Loader2 className="size-6 animate-spin" />}
          {status === "success" && <Check className="size-6 text-green-500" />}
          {status === "error" && <XCircle className="size-6 text-red-500" />}
        </div>

        {status === "success" && (
          <PrimaryButton onClick={() => navigate({ to: "/auth/sign-in" })} className="mt-6">
            Continue to Sign In
          </PrimaryButton>
        )}

        {status === "error" && (
          <PrimaryButton onClick={() => navigate({ to: "/auth/check-email" })} className="mt-6">
            Request new verification email
          </PrimaryButton>
        )}

        {status === "loading" && (
          <p className="mt-6 text-sm text-muted-foreground">Please wait...</p>
        )}
      </div>
    </AuthShell>
  );
}
