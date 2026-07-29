import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12 text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_60%,oklch(0.08_0_0)_100%)]" />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-white/95 to-white/60 text-[10px] font-bold text-black">
            Z
          </div>
          <span className="font-display text-sm font-semibold tracking-[0.18em]">
            ZEKROS
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to landing
        </Link>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative mx-auto mt-14 w-full max-w-md"
      >
        <div className="glass-strong relative overflow-hidden rounded-3xl p-8">
          {eyebrow && (
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <div className="mt-5 text-center text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </motion.main>
    </div>
  );
}

export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 text-[11px] text-destructive-foreground/90">
          {error}
        </div>
      )}
    </label>
  );
}

export function TextInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 ${className}`}
    />
  );
}

export function PrimaryButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          Working…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function OAuthRow({
  onProvider,
}: {
  onProvider?: (id: "google") => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {[
        { id: "google" as const, label: "Google" },
      ].map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onProvider?.(p.id)}
          className="glass inline-flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06]"
        >
          {/* simple monochrome glyphs */}
         <FcGoogle size="20" />
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="h-px flex-1 bg-white/10" />
      {children}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
