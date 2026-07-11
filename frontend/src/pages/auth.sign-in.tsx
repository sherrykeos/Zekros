import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
} from "@/components/auth/auth-shell";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({ meta: [{ title: "Sign in - ZEKROS" }] }),
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    try {
      await signIn(email.trim().toLowerCase(), password);
      void navigate({ to: "/app/play" });
    } catch (error: any) {
      setError(error.response?.data?.message ?? "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back."
      description="Pick up where you left off."
      footer={
        <>
          New to ZEKROS?{" "}
          <Link to="/auth/sign-up" className="text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField
          label="Password"
          hint={
            <Link to="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <TextInput
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Toggle password"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <PrimaryButton loading={loading}>Sign in</PrimaryButton>
      </form>
    </AuthShell>
  );
}


