import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { Board } from "@/components/game/board";
import { GlassPanel, SectionHeader } from "@/components/app/primitives";
import type { CellState, Player } from "@/components/game/types";

export const Route = createFileRoute("/app/replay/$id")({
  head: () => ({ meta: [{ title: "Replay — ZEKROS" }] }),
  component: ReplayPage,
});

// TODO: fetch replay frames by `id`
type Move = { player: Player; cell: number; ts: string };

const REPLAY = {
  id: "demo",
  mode: "Smart AI",
  opponent: "Smart AI",
  date: "Today, 12:08",
  boardSize: 4 as 3 | 4 | 5 | 6,
  moves: [
    { player: "x", cell: 5, ts: "00:00" },
    { player: "o", cell: 10, ts: "00:04" },
    { player: "x", cell: 6, ts: "00:09" },
    { player: "o", cell: 9, ts: "00:14" },
    { player: "x", cell: 0, ts: "00:21" },
    { player: "o", cell: 15, ts: "00:27" },
    { player: "x", cell: 11, ts: "00:33" },
  ] as Move[],
};

const SPEEDS = [0.5, 1, 1.5, 2, 4] as const;

function ReplayPage() {
  const total = REPLAY.moves.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900 / speed);
    return () => clearTimeout(t);
  }, [playing, step, speed, total]);

  const cells = useMemo<CellState[]>(() => {
    const size = REPLAY.boardSize;
    const arr: CellState[] = Array(size * size).fill(null);
    for (let i = 0; i < step; i++) {
      const m = REPLAY.moves[i];
      arr[m.cell] = m.player;
    }
    return arr;
  }, [step]);

  const lastMove = step > 0 ? REPLAY.moves[step - 1].cell : null;
  const currentTurn: Player = step % 2 === 0 ? "x" : "o";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app/history"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Back to history
        </Link>
        <span className="font-mono text-[11px] text-muted-foreground">#{REPLAY.id}</span>
      </div>

      <SectionHeader
        title={`Replay · ${REPLAY.mode}`}
        description={`vs ${REPLAY.opponent} · ${REPLAY.date}`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <GlassPanel className="p-5">
          <Board
            size={REPLAY.boardSize}
            cells={cells}
            currentPlayer={currentTurn}
            lastMove={lastMove}
            disabled
          />

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <CtrlBtn onClick={() => setStep(0)} label="Restart">
              <RotateCcw className="size-4" />
            </CtrlBtn>
            <CtrlBtn
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              label="Previous move"
              disabled={step === 0}
            >
              <SkipBack className="size-4" />
            </CtrlBtn>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <CtrlBtn
              onClick={() => setStep((s) => Math.min(total, s + 1))}
              label="Next move"
              disabled={step >= total}
            >
              <SkipForward className="size-4" />
            </CtrlBtn>
            <div className="ml-2 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${speed === s ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Scrubber */}
          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={total}
              value={step}
              onChange={(e) => {
                setPlaying(false);
                setStep(Number(e.target.value));
              }}
              className="w-full accent-white"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Move 0</span>
              <span>
                Move {step} / {total}
              </span>
              <span>End</span>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-4">
          <GlassPanel className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Move" value={`${step}/${total}`} />
              <Stat label="Turn" value={currentTurn.toUpperCase()} />
              <Stat label="Speed" value={`${speed}×`} />
              <Stat label="Board" value={`${REPLAY.boardSize}×${REPLAY.boardSize}`} />
            </div>
          </GlassPanel>

          <GlassPanel className="overflow-hidden">
            <div className="border-b border-white/[0.06] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Move list
            </div>
            <ol className="max-h-[420px] overflow-y-auto p-2">
              {REPLAY.moves.map((m, i) => {
                const active = i === step - 1;
                return (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setPlaying(false);
                        setStep(i + 1);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${active ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"}`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium uppercase">{m.player}</span>
                      <span className="text-muted-foreground">cell {m.cell}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{m.ts}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
