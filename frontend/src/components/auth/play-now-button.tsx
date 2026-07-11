import { ArrowRight } from "lucide-react";
import { dispatchPlayNow } from "@/contexts/play-entry";

type Variant = "primary" | "ghost" | "compact";

export function PlayNowButton({
  variant = "primary",
  className = "",
  label = "Play Now",
  withArrow = true,
}: {
  variant?: Variant;
  className?: string;
  label?: string;
  withArrow?: boolean;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-primary px-5 py-3 text-primary-foreground shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)]"
      : variant === "ghost"
        ? "glass px-5 py-3 text-foreground hover:bg-white/[0.08]"
        : "bg-primary px-3.5 py-1.5 text-primary-foreground";

  return (
    <button
      type="button"
      onClick={() => dispatchPlayNow("default")}
      className={`${base} ${styles} ${className}`}
    >
      {label}
      {withArrow && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}
