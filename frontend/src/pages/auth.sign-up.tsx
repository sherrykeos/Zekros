import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
  AuthShell,
  FormField,
  TextInput,
  PrimaryButton,
} from "@/components/auth/auth-shell";
import { api } from "@/services/client";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const strength = useMemo(() => score(password), [password]);
  const strengthLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username: name.trim(),
        email: normalizedEmail,
        password,
      });

      const registeredEmail = response.data?.data?.email ?? normalizedEmail;

      void navigate({
        to: "/auth/check-email",
        search: { email: registeredEmail } as never,
      });
    } catch (error: any) {
      setError(error.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join ZEKROS."
      description="Save matches across devices and play live."
      footer={
        <>
          Already have one?{" "}
          <Link to="/auth/sign-in" className="text-foreground underline-offset-4 hover:underline">
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
          <TextInput
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
          )}
        </FormField>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <PrimaryButton loading={loading}>Create account</PrimaryButton>
        <p className="text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}


