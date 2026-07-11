import { motion } from "motion/react";

/**
 * Decorative mini board used for previews and illustrations.
 * Pure presentational — no game logic. Backend will later hydrate cells.
 */
export function MiniBoard({
  size = 4,
  pieces = [],
  className = "",
  animated = true,
}: {
  size?: number;
  pieces?: Array<{ i: number; player: "x" | "o"; fading?: boolean }>;
  className?: string;
  animated?: boolean;
}) {
  const cells = Array.from({ length: size * size });
  return (
    <div
      className={`grid aspect-square w-full gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {cells.map((_, i) => {
        const p = pieces.find((p) => p.i === i);
        return (
          <div
            key={i}
            className="relative grid place-items-center rounded-[4px] bg-white/[0.025]"
          >
            {p &&
              (animated ? (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: p.fading ? 0.35 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`font-mono text-[10px] font-semibold ${
                    p.player === "x" ? "text-bone" : "text-smoke"
                  }`}
                >
                  {p.player === "x" ? "✕" : "◯"}
                </motion.span>
              ) : (
                <span
                  className={`font-mono text-[10px] font-semibold ${
                    p.player === "x" ? "text-bone" : "text-smoke"
                  } ${p.fading ? "opacity-40" : ""}`}
                >
                  {p.player === "x" ? "✕" : "◯"}
                </span>
              ))}
          </div>
        );
      })}
    </div>
  );
}
