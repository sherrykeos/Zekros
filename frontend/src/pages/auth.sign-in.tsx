import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
  Divider,
  OAuthRow,
} from "@/components/auth/auth-shell";
import { useLogin } from "@/hooks/useLogin";

import { getApiBaseUrl } from "@/services/client";

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in - ZEKROS" }] }),
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const login = useLogin();
  const search = Route.useSearch();

  const handleGoogleLogin = () => {
    if (search.redirect) {
      sessionStorage.setItem("auth_redirect", search.redirect);
    }
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    login.mutate({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back."
      description="Pick up where you left off."
      footer={
        <>
          New to ZEKROS?{" "}
          <Link
            to="/auth/sign-up"
            className="text-foreground underline-offset-4 hover:underline"
          >
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
            <Link
              to="/auth/forgot-password"
              className="text-muted-foreground hover:text-foreground"
            >
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
              aria-label="Toggle password visibility"
            >
              {showPw ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </FormField>

        {login.errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {login.errorMessage}
          </div>
        )}

        <PrimaryButton loading={login.isPending}>Sign in</PrimaryButton>

        <Divider>or continue with</Divider>
        <OAuthRow onProvider={(provider) => {
          if (provider === "google") {
            handleGoogleLogin();
          }
        }} />
      </form>
    </AuthShell>
  );
}
