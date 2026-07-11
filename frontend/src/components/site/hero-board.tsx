import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Cell = { id: number; owner: "x" | "o" | null; age: number };

const INITIAL: Cell[] = Array.from({ length: 16 }, (_, i) => ({ id: i, owner: null, age: 0 }));

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
];

export function HeroBoard() {
  const [cells, setCells] = useState<Cell[]>(INITIAL);
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTurn((t) => {
        const move = SCRIPT[t % SCRIPT.length];
        setCells((prev) => {
          const next = prev.map((c) => ({ ...c, age: c.owner ? c.age + 1 : 0 }));
          // disappearing-piece rule: max 3 per side
          const sameOwner = next.filter((c) => c.owner === move.owner).sort((a, b) => b.age - a.age);
          if (sameOwner.length >= 3) {
            const oldest = sameOwner[0];
            next[oldest.id] = { ...oldest, owner: null, age: 0 };
          }
          next[move.idx] = { id: move.idx, owner: move.owner, age: 0 };
          return next;
        });
        return t + 1;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-strong relative aspect-square w-full max-w-md overflow-hidden rounded-3xl p-5">
      {/* ambient grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* reflection */}
      <div className="pointer-events-none absolute -inset-y-10 -left-1/3 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative grid h-full grid-cols-4 gap-2.5">
        {cells.map((c) => (
          <motion.div
            key={c.id}
            className="relative grid place-items-center rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
          >
            {c.owner && (
              <motion.div
                key={`${c.id}-${turn}`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: c.age >= 1 ? 0.45 : 1,
                }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="grid size-9 place-items-center md:size-11"
              >
                {c.owner === "x" ? <XMark /> : <OMark />}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* status bar */}
      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          Live
        </span>
        <span>Turn {turn + 1}</span>
        <span className="font-mono">4×4</span>
      </div>
    </div>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-full stroke-white" strokeWidth={2.2} strokeLinecap="round" fill="none">
      <path d="M5 5 L19 19" />
      <path d="M19 5 L5 19" />
    </svg>
  );
}

function OMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-full stroke-white/70" strokeWidth={2.2} fill="none">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
