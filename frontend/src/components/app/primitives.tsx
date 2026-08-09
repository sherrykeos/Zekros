import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function GlassPanel({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={`glass rounded-2xl ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group glass relative overflow-hidden rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-gradient">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-white/[0.04] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  cta,
  accent,
  to,
  search,
  onClick,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  cta?: string;
  accent?: boolean;
  to?: string;
  search?: Record<string, unknown>;
  onClick?: () => void;
}) {
  const content = (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group relative flex h-full flex-col items-start overflow-hidden rounded-2xl p-5 text-left transition-colors ${
        accent
          ? "border border-white/15 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent"
          : "glass"
      }`}
    >
      <div className="flex w-full items-start justify-between">
        <div
          className={`grid size-10 place-items-center rounded-xl ${accent ? "bg-white text-black" : "border border-white/10 bg-white/[0.04] text-foreground"}`}
        >
          <Icon className="size-4" />
        </div>
        <ArrowUpRight className="size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <div className="mt-5 font-display text-base font-semibold tracking-tight">
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {cta && (
        <span className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {cta} →
        </span>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 size-48 rounded-full bg-white/[0.06] blur-3xl" />
      </div>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to as any} search={search as any} className="block h-full">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="block h-full w-full">
      {content}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-8 py-16 text-center">
      <div className="relative grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Icon className="size-5 text-muted-foreground" />
        <span className="absolute inset-0 animate-pulse rounded-2xl ring-1 ring-white/5" />
      </div>
      <h3 className="mt-5 font-display text-base font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/[0.04] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="size-10 rounded-xl" />
      <Skeleton className="mt-5 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-4/5" />
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
