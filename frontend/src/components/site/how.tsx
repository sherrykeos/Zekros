import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeader } from "./features";
import {
  Grid3x3,
  Hourglass,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
  Lock,
  type LucideIcon,
} from "lucide-react";

interface GridCell {
  id: number;
  val: string | null;
  active?: boolean;
  fading?: boolean;
  locked?: boolean;
  winning?: boolean;
}

interface Step {
  n: string;
  tag: string;
  icon: LucideIcon;
  title: string;
  shortDesc: string;
  detail: string;
  badge: string;
  gridState: GridCell[];
}

const steps: Step[] = [
  {
    n: "01",
    tag: "PLACEMENT",
    icon: Grid3x3,
    title: "1. Drop Your Piece",
    shortDesc: "Place your symbol on any open cell of the active grid.",
    detail: "Placing a piece starts your turn clock and advances the piece limit counter.",
    badge: "Grid Fill",
    gridState: [
      { id: 0, val: "X", active: true },
      { id: 1, val: null },
      { id: 2, val: "O", active: false },
      { id: 3, val: null },
      { id: 4, val: null },
      { id: 5, val: null },
      { id: 6, val: null },
      { id: 7, val: null },
      { id: 8, val: null },
    ],
  },
  {
    n: "02",
    tag: "DECAY MECHANIC",
    icon: Hourglass,
    title: "2. Oldest Piece Fades",
    shortDesc: "Exceeding piece limit causes your oldest piece to vanish.",
    detail: "Spatial memory is key. Keep track of piece ages before your line dissolves.",
    badge: "Auto-Vanish Queue",
    gridState: [
      { id: 0, val: "X", fading: true },
      { id: 1, val: "O" },
      { id: 2, val: "X" },
      { id: 3, val: "O" },
      { id: 4, val: "X", active: true },
      { id: 5, val: null },
      { id: 6, val: null },
      { id: 7, val: null },
      { id: 8, val: null },
    ],
  },
  {
    n: "03",
    tag: "ECONOMY",
    icon: RotateCcw,
    title: "3. Reclaim & Lock",
    shortDesc: "Spend a token to lock a cell or preserve a fading piece.",
    detail: "Tokens let you override decay during critical endgame winning attempts.",
    badge: "-1 Token Spend",
    gridState: [
      { id: 0, val: "X", locked: true },
      { id: 1, val: "O" },
      { id: 2, val: "X" },
      { id: 3, val: "O" },
      { id: 4, val: "X" },
      { id: 5, val: null },
      { id: 6, val: null },
      { id: 7, val: null },
      { id: 8, val: null },
    ],
  },
  {
    n: "04",
    tag: "VICTORY",
    icon: Trophy,
    title: "4. Align Grid Length To Win",
    shortDesc: "Form a line matching the grid size: 3 for 3×3, 4 for 4×4, or 5 for 5×5.",
    detail: "Complete your alignment horizontally, vertically, or diagonally before pieces dissolve.",
    badge: "3 for 3×3 · 4 for 4×4 · 5 for 5×5",
    gridState: [
      { id: 0, val: "X", winning: true },
      { id: 1, val: "O" },
      { id: 2, val: "O" },
      { id: 3, val: null },
      { id: 4, val: "X", winning: true },
      { id: 5, val: null },
      { id: 6, val: null },
      { id: 7, val: null },
      { id: 8, val: "X", winning: true },
    ],
  },
];

export function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  return (
    <section id="how" className="relative overflow-hidden px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow="Rules of Play"
          title="How Zekros Works"
          desc="Understand the complete game loop in 10 seconds."
        />

        {/* Main Interactive Showcase Container with maze.jpg background */}
        <div className="glass group relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black/70 p-5 sm:p-7 shadow-2xl">
          {/* Background Image rules-maze-bg.jpg */}
          <img
            src="/assets/rules-maze-bg.jpg"
            alt="Tactical Maze Background"
            className="absolute inset-0 size-full object-cover opacity-60 mix-blend-luminosity transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

          {/* Top Step Selector Tabs */}
          <div className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-4 border-b border-white/10 pb-4">
            {steps.map((s, idx) => (
              <button
                key={s.n}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  activeStepIndex === idx
                    ? "border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md"
                    : "border-white/5 bg-white/[0.02] text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <div
                  className={`grid size-6 place-items-center rounded-md font-mono text-[11px] font-bold ${
                    activeStepIndex === idx
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {s.n}
                </div>
                <span className="font-display text-xs font-medium">
                  {s.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Step Active Display Panel */}
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
            
            {/* Left: Step Info & Explanation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.n}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/80 backdrop-blur-md font-mono">
                  <activeStep.icon className="size-3 text-white" />
                  <span>STEP {activeStep.n} / {activeStep.tag}</span>
                </div>

                <h3 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {activeStep.title}
                </h3>

                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {activeStep.shortDesc}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeStep.detail}
                </p>

                <div className="pt-1 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-mono text-white">
                    <Sparkles className="size-3 text-white/60" />
                    {activeStep.badge}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right: Minigrid Visual Diagram */}
            <div className="flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.n}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-3 gap-1.5 size-44 sm:size-48 rounded-2xl border border-white/20 bg-black/90 p-3 shadow-2xl backdrop-blur-xl"
                >
                  {activeStep.gridState.map((cell) => (
                    <div
                      key={cell.id}
                      className={`relative flex items-center justify-center rounded-lg border transition-all duration-300 ${
                        cell.winning
                          ? "border-white bg-white/25 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                          : cell.locked
                          ? "border-white/40 bg-white/15"
                          : cell.fading
                          ? "border-white/20 bg-white/5 opacity-40 animate-pulse"
                          : cell.active
                          ? "border-white/50 bg-white/15"
                          : cell.val
                          ? "border-white/20 bg-white/5"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      {cell.val && (
                        <span
                          className={`font-mono font-bold text-base sm:text-lg ${
                            cell.fading ? "text-white/40" : "text-white"
                          }`}
                        >
                          {cell.val}
                        </span>
                      )}

                      {/* Special Status Markers */}
                      {cell.locked && (
                        <span className="absolute top-1 right-1 text-white">
                          <Lock className="size-2.5" />
                        </span>
                      )}

                      {cell.fading && (
                        <span className="absolute -top-1 -right-1 flex size-1.5">
                          <span className="relative inline-flex size-1.5 rounded-full bg-white/40" />
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Next Step Navigation */}
          <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
              <span>PROGRESSION</span>
              <span>·</span>
              <span>STEP {activeStepIndex + 1} OF 4</span>
            </div>

            <button
              onClick={() => setActiveStepIndex((prev) => (prev + 1) % 4)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-all hover:bg-white/90 cursor-pointer"
            >
              <span>{activeStepIndex === 3 ? "Restart Flow" : "Next Step"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

