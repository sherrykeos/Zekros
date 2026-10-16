import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Swords } from "lucide-react";

type Cell = {
  id: number;
  owner: "x" | "o" | null;
  age: number;
  decaying?: boolean;
};

const INITIAL_CELLS: Cell[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  owner: null,
  age: 0,
}));

// Pre-scripted tactical blitz moves demonstrating spatial piece decay
const SCRIPT: Array<{ idx: number; owner: "x" | "o" }> = [
  { idx: 5, owner: "x" },
  { idx: 10, owner: "o" },
  { idx: 6, owner: "x" },
  { idx: 9, owner: "o" },
  { idx: 2, owner: "x" },
  { idx: 13, owner: "o" },
  { idx: 7, owner: "x" },
  { idx: 8, owner: "o" },
  { idx: 11, owner: "x" },
  { idx: 4, owner: "o" },
  { idx: 1, owner: "x" },
  { idx: 14, owner: "o" },
  { idx: 15, owner: "x" },
  { idx: 0, owner: "o" },
];

export function HeroPvPPreview() {
  const [cells, setCells] = useState<Cell[]>(INITIAL_CELLS);
  const [turn, setTurn] = useState(0);
  const [lastPlacedIdx, setLastPlacedIdx] = useState<number | null>(null);

  // Autonomous simulated match with disappearing decay mechanics (max 3 pieces per player)
  useEffect(() => {
    const interval = setInterval(() => {
      setTurn((t) => {
        const move = SCRIPT[t % SCRIPT.length];
        setLastPlacedIdx(move.idx);

        setCells((prev) => {
          // Increment age of existing pieces
          const updated = prev.map((c) => ({
            ...c,
            age: c.owner ? c.age + 1 : 0,
            decaying: false,
          }));

          // Enforce 3-piece maximum per player rule
          const playerPieces = updated
            .filter((c) => c.owner === move.owner)
            .sort((a, b) => b.age - a.age);

          if (playerPieces.length >= 3) {
            const oldest = playerPieces[0];
            updated[oldest.id] = { ...oldest, owner: null, age: 0, decaying: true };
          }

          // Mark next oldest pieces with decay warning indicator
          const nextOldest = updated
            .filter((c) => c.owner === move.owner)
            .sort((a, b) => b.age - a.age)[0];
          if (nextOldest) {
            nextOldest.decaying = true;
          }

          // Place the new move
          updated[move.idx] = { id: move.idx, owner: move.owner, age: 0, decaying: false };
          return updated;
        });

        return t + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Allow clicking on any cell to interactively place a piece
  const handleCellClick = (idx: number) => {
    setLastPlacedIdx(idx);
    setCells((prev) => {
      const current = prev[idx];
      const nextOwner = current.owner === "x" ? "o" : current.owner === "o" ? null : "x";
      return prev.map((c) => (c.id === idx ? { ...c, owner: nextOwner, age: 0 } : c));
    });
  };

  return (
    <div className="relative w-full select-none">
      {/* Ambient background glow that enhances transparency */}
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/5 blur-3xl opacity-75" />

      {/* Main Container - 100% Transparent Glass Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.015] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all hover:border-white/20">
        
        {/* Futuristic Tactical HUD Corner Accents */}
        <span className="pointer-events-none absolute left-2.5 top-2.5 size-2 border-l-2 border-t-2 border-white/40" />
        <span className="pointer-events-none absolute right-2.5 top-2.5 size-2 border-r-2 border-t-2 border-white/40" />
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 size-2 border-b-2 border-l-2 border-white/40" />
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 size-2 border-r-2 border-b-2 border-white/40" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3.5">
          {/* Match Status & Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
              Tactical PvP Arena
            </span>
            <span className="hidden sm:inline text-white/20">/</span>
            <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground">
              4×4 Blitz
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80">
            <Swords className="size-3 text-cyan-400" />
            Live Play
          </div>
        </div>

        {/* Interactive Transparent Cyber Arena Grid */}
        <div className="relative aspect-square w-full mt-4 flex items-center justify-center">
          <div className="grid size-full grid-cols-4 gap-2.5 p-1">
            {cells.map((cell) => {
              const isNew = lastPlacedIdx === cell.id && cell.owner !== null;
              return (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => handleCellClick(cell.id)}
                  className={`group relative grid place-items-center rounded-2xl border transition-all duration-300 cursor-pointer ${
                    cell.owner
                      ? cell.decaying
                        ? "border-amber-500/40 bg-amber-500/[0.04] shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "border-white/25 bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.06]"
                  }`}
                >
                  {/* Active Piece */}
                  {cell.owner && (
                    <motion.div
                      initial={isNew ? { scale: 0.3, opacity: 0 } : false}
                      animate={{
                        scale: 1,
                        opacity: cell.decaying ? 0.45 : cell.age >= 1 ? 0.75 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className="grid size-8 place-items-center md:size-10"
                    >
                      {cell.owner === "x" ? (
                        <XMarker decaying={cell.decaying} />
                      ) : (
                        <OMarker decaying={cell.decaying} />
                      )}
                    </motion.div>
                  )}

                  {/* Decaying Piece Pulse Warning Ring */}
                  {cell.decaying && (
                    <span className="absolute inset-1 rounded-xl border border-amber-400/40 animate-pulse pointer-events-none" />
                  )}

                  {/* Coordinate Label */}
                  <span className="absolute bottom-1 right-1 font-mono text-[8px] text-white/20 group-hover:text-white/40">
                    {cell.id + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Tactical Status Bar */}
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-cyan-400" />
            <span className="text-white/80 font-medium">Auto-Decay Active</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Turn {turn + 1}</span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400">12ms Sync</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function XMarker({ decaying }: { decaying?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-full transition-colors ${
        decaying
          ? "stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
          : "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
      }`}
      strokeWidth={2.4}
      strokeLinecap="round"
      fill="none"
    >
      <path d="M5 5 L19 19" />
      <path d="M19 5 L5 19" />
    </svg>
  );
}

function OMarker({ decaying }: { decaying?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-full transition-colors ${
        decaying
          ? "stroke-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
          : "stroke-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
      }`}
      strokeWidth={2.4}
      fill="none"
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
