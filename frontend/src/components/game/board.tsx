import { useState } from "react";
import { motion } from "motion/react";
import { Cell } from "./cell";
import type { CellState, Player } from "./types";

/**
 * Dynamic game board. The board is visual-only; callers provide cells,
 * playable cells, last move, winning cells, and expiring-piece markers.
 */
export function Board({
  size,
  cells,
  currentPlayer,
  lastMove,
  winningCells,
  aboutToVanish,
  playableCells,
  disabled,
  onCellClick,
  tokensX,
  tokensO,
}: {
  size: 3 | 4 | 5 | 6;
  cells: CellState[];
  currentPlayer: Player;
  lastMove?: number | null;
  winningCells?: number[];
  aboutToVanish?: number[];
  playableCells?: number[];
  disabled?: boolean;
  onCellClick?: (index: number) => void;
  tokensX?: number;
  tokensO?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const total = size * size;
  const playableSet = playableCells ? new Set(playableCells) : null;
  const gap =
    size <= 3
      ? "gap-3"
      : size === 4
        ? "gap-2.5"
        : size === 5
          ? "gap-2"
          : "gap-1.5";

  const renderWinningLine = () => {
    if (!winningCells || winningCells.length < 2) return null;
    const start = winningCells[0];
    const end = winningCells[winningCells.length - 1];

    const r1 = Math.floor(start / size);
    const c1 = start % size;
    const r2 = Math.floor(end / size);
    const c2 = end % size;

    const getCoord = (idx: number) => ((idx + 0.5) / size) * 100;

    const x1 = getCoord(c1);
    const y1 = getCoord(r1);
    const x2 = getCoord(c2);
    const y2 = getCoord(r2);

    return (
      <svg className="absolute inset-0 z-10 h-full w-full pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        <motion.line
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </svg>
    );
  };

  return (
    <div className="mx-auto w-full">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto aspect-square w-full max-w-[min(72vh,700px)]"
      >
        <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_90px_-35px_rgba(0,0,0,0.85)]">
          <div
            className={`grid h-full w-full ${gap}`}
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <Cell
                key={i}
                index={i}
                value={cells[i] ?? null}
                onClick={onCellClick}
                disabled={disabled}
                isPlayable={!playableSet || playableSet.has(i)}
                isLastMove={lastMove === i}
                isWinning={winningCells?.includes(i)}
                winningIndex={winningCells?.indexOf(i)}
                isAboutToVanish={aboutToVanish?.includes(i)}
                hasReclaimToken={
                  cells[i] === "x" ? (tokensX ?? 0) > 0 : cells[i] === "o" ? (tokensO ?? 0) > 0 : false
                }
                previewPlayer={hoverIndex === i ? currentPlayer : null}
                onHoverChange={(h, idx) => setHoverIndex(h ? idx : null)}
              />
            ))}
          </div>
          {renderWinningLine()}
        </div>

        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-white/[0.025] blur-3xl" />
      </motion.div>
    </div>
  );
}
