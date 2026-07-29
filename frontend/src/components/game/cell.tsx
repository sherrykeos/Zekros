import { motion, AnimatePresence } from "motion/react";
import type { CellState, Player } from "./types";

/**
 * Visual piece. No game logic. Coloring is monochromatic per the
 * ZEKROS design system; only weight/contrast distinguishes X and O.
 */
function Glyph({ player, dim }: { player: Player; dim?: boolean }) {
  if (player === "x") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`size-[58%] ${dim ? "opacity-60" : ""}`}
        aria-hidden
      >
        <path
          d="M5 5 L19 19 M19 5 L5 19"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-[58%] ${dim ? "opacity-60" : ""}`}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="7.2"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
    </svg>
  );
}

export function Cell({
  index,
  value,
  isWinning,
  winningIndex,
  isAboutToVanish,
  isLastMove,
  isPlayable = true,
  disabled,
  onClick,
  onHoverChange,
  previewPlayer,
  hasReclaimToken,
}: {
  index: number;
  value: CellState;
  isWinning?: boolean;
  winningIndex?: number;
  isAboutToVanish?: boolean;
  isLastMove?: boolean;
  isPlayable?: boolean;
  disabled?: boolean;
  onClick?: (index: number) => void;
  onHoverChange?: (hovered: boolean, index: number) => void;
  previewPlayer?: Player | null;
  hasReclaimToken?: boolean;
}) {
  const isDisabled = disabled || !isPlayable;
  // If it has a reclaim token, it doesn't blink, it just shows a white board
  const shouldBlink = Boolean(value) && Boolean(isAboutToVanish);
  const isProtected = Boolean(value) && Boolean(isAboutToVanish) && Boolean(hasReclaimToken);
  const delay =
    winningIndex != null && winningIndex >= 0 ? winningIndex * 0.15 : 0;

  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      onClick={() => onClick?.(index)}
      onMouseEnter={() => onHoverChange?.(true, index)}
      onMouseLeave={() => onHoverChange?.(false, index)}
      whileTap={{ scale: 0.97 }}
      className={`group relative aspect-square w-full overflow-hidden rounded-[1rem] border text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 ${
        isProtected
          ? "border-white/50 bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse"
          : isLastMove
            ? "border-white/20 bg-white/[0.07]"
            : "border-white/[0.08] bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
      } ${isDisabled && !value ? "cursor-not-allowed opacity-60" : ""} ${
        value && isPlayable && !disabled
          ? "cursor-pointer hover:border-white/25 hover:bg-white/[0.06]"
          : ""
      }`}
    >
      {!value && previewPlayer && !isDisabled && (
        <div className="absolute inset-0 grid place-items-center text-foreground/30">
          <Glyph player={previewPlayer} dim />
        </div>
      )}

      <AnimatePresence>
        {value && (
          <motion.div
            key={`${index}-${value}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 grid place-items-center"
          >
            <motion.div
              className="grid h-full w-full place-items-center"
              animate={{
                scale: shouldBlink ? [1, 0.9, 1] : 1,
                opacity: shouldBlink ? [1, 0.1, 1] : 1,
              }}
              transition={
                shouldBlink
                  ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
            >
              <Glyph player={value} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      <span className="sr-only">Cell {index + 1}</span>
    </motion.button>
  );
}
