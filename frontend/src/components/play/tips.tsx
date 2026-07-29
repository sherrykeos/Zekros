import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";
import { MiniBoard } from "./mini-board";

const tips = [
  {
    title: "Disappearing pieces",
    body: "Your oldest piece on the board fades and lifts when a new one lands. Plan around impermanence.",
    pieces: [
      { i: 0, player: "x" as const, fading: true },
      { i: 5, player: "o" as const },
      { i: 6, player: "x" as const },
      { i: 10, player: "o" as const },
    ],
  },
  {
    title: "Reclaim tokens",
    body: "Spend a token to revive a fallen piece in its original square. Use them as your endgame.",
    pieces: [
      { i: 2, player: "x" as const },
      { i: 5, player: "o" as const, fading: true },
      { i: 6, player: "x" as const },
      { i: 9, player: "o" as const },
      { i: 11, player: "x" as const },
    ],
  },
  {
    title: "Control the center",
    body: "Center squares touch the most win lines. Strong play opens from the middle, not the edges.",
    pieces: [
      { i: 5, player: "x" as const },
      { i: 6, player: "o" as const },
      { i: 9, player: "x" as const },
      { i: 10, player: "o" as const, fading: true },
    ],
  },
  {
    title: "Board dynamics",
    body: "Larger boards reward patience. Smaller boards reward tempo. Pick the surface that fits you.",
    pieces: [
      { i: 0, player: "x" as const },
      { i: 3, player: "o" as const },
      { i: 5, player: "x" as const },
      { i: 10, player: "o" as const },
      { i: 12, player: "x" as const, fading: true },
      { i: 15, player: "o" as const },
    ],
  },
];

export function Tips() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % tips.length), 6000);
    return () => clearInterval(t);
  }, []);

  const tip = tips[idx];

  return (
    <section>
      <SectionHeader
        title="Tips"
        description="Tiny strategy notes to sharpen your game."
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIdx((i) => (i - 1 + tips.length) % tips.length)}
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]"
              aria-label="Previous tip"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % tips.length)}
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]"
              aria-label="Next tip"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        }
      />
      <div className="glass relative overflow-hidden rounded-2xl p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-28 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`b-${idx}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
              >
                <MiniBoard size={4} pieces={tip.pieces} animated={false} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Lightbulb className="size-3" /> Tip {idx + 1} / {tips.length}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`t-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
                  {tip.title}
                </h3>
                <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
                  {tip.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all ${
                i === idx ? "w-8 bg-bone" : "w-3 bg-white/15"
              }`}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
