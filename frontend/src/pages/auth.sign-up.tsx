import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
  Divider,
  OAuthRow,
} from "@/components/auth/auth-shell";
import { useRegister } from "@/hooks/useRegister";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: "Create account - ZEKROS" }] }),
  component: SignUpPage,
});

function score(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const register = useRegister();
  const [showPw, setShowPw] = useState(false);

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const strength = useMemo(() => score(password), [password]);
  const strengthLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][
    strength
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const username = name.trim();

    if (!username) {
      setValidationError("Display name is required.");
      return;
    }

    if (!normalizedEmail) {
      setValidationError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    register.mutate({
      username,
      email: normalizedEmail,
      password,
    });
  };

  const error = validationError ?? register.errorMessage;

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join ZEKROS."
      description="Save matches across devices and play live."
      footer={
        <>
          Already have one?{" "}
          <Link
            to="/auth/sign-in"
            search={{}}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Display name" hint="Shown on leaderboards">
          <TextInput
            type="text"
            autoComplete="nickname"
            placeholder="e.g. Mira K."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>
        <FormField label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password" hint="Min. 8 characters">
          <div className="relative">  
          <TextInput
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><button
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
          {password && (
            <div className="mt-2">
              <div className="flex h-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < strength ? "bg-foreground" : "bg-white/[0.08]"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                {strength >= 3 && <Check className="size-3" />} {strengthLabel}
              </div>
            </div>
          )}</div>
        </FormField>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <PrimaryButton loading={register.isPending}>
          Create account
        </PrimaryButton>

        <Divider>or continue with</Divider>
        <OAuthRow onProvider={(provider) => {
          if (provider === "google") {
            handleGoogleLogin();
          }
        }} />

        <p className="text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
