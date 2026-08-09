import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
  Calendar,
  Clock,
  Trophy,
  Loader2,
} from "lucide-react";
import { Board } from "@/components/game/board";
import { GlassPanel, SectionHeader } from "@/components/app/primitives";
import type { CellState, Player } from "@/components/game/types";
import { useMatchHistory } from "@/hooks/match";
import type { MatchHistoryItem } from "@/services/api/matchService";
import { audioManager } from "@/services/audio/AudioManager";

export const Route = createFileRoute("/app/replay/$id")({
  head: () => ({ meta: [{ title: "Replay - ZEKROS" }] }),
  component: ReplayPage,
});

const SPEEDS = [0.5, 1, 1.5, 2, 4] as const;

function ReplayPage() {
  const { id } = Route.useParams();
  const { data: response, isLoading, isError, refetch } = useMatchHistory(id);

  const match: MatchHistoryItem | null = response?.data ?? response ?? null;
  const moves = match?.moves ?? [];
  const total = moves.length;
  const boardSize = (match?.boardSize ?? 3) as 3 | 4 | 5 | 6;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  // Reset step to 0 when new match data arrives
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [id]);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900 / speed);
    return () => clearTimeout(t);
  }, [playing, step, speed, total]);

  // Play move cue on step changes during replay
  useEffect(() => {
    if (step > 0 && step <= total) {
      audioManager.play("move");
    }
  }, [step, total]);

  // Compute cell states dynamically up to the current playback step
  const cells = useMemo<CellState[]>(() => {
    const arr: CellState[] = Array(boardSize * boardSize).fill(null);

    if (!moves || moves.length === 0) return arr;

    const participants = match?.participants ?? [];
    const participantMap = new Map<string, Player>();

    for (const p of participants) {
      participantMap.set(p.id, p.symbol.toLowerCase() as Player);
    }

    for (let i = 0; i < step && i < moves.length; i++) {
      const m = moves[i];
      const player = participantMap.get(m.playerId) ?? (i % 2 === 0 ? "x" : "o");
      const idx = m.row * boardSize + m.column;
      arr[idx] = player;

      if (m.removedRow != null && m.removedColumn != null) {
        const removedIdx = m.removedRow * boardSize + m.removedColumn;
        arr[removedIdx] = null;
      }
    }

    return arr;
  }, [step, moves, boardSize, match?.participants]);

  const lastMove = useMemo(() => {
    if (step <= 0 || !moves || moves.length === 0) return null;
    const m = moves[step - 1];
    return m.row * boardSize + m.column;
  }, [step, moves, boardSize]);

  const currentTurn: Player = step % 2 === 0 ? "x" : "o";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <GlassPanel className="flex flex-col items-center justify-center p-16 text-center">
          <Loader2 className="size-8 animate-spin text-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold tracking-tight">Loading Match Replay Data...</h3>
          <p className="mt-1 text-xs text-muted-foreground">Fetching moves, participants, and game state from database...</p>
        </GlassPanel>
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="space-y-6">
        <Link
          to="/app/history"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Back to history
        </Link>

        <GlassPanel className="p-6 text-center text-muted-foreground">
          <p>Match replay not found or could not be loaded.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-foreground hover:bg-white/10"
          >
            Retry
          </button>
        </GlassPanel>
      </div>
    );
  }

  const playerX = match.participants?.find((p) => p.symbol === "X");
  const playerO = match.participants?.find((p) => p.symbol === "O");
  const nameX = playerX?.user?.displayName || playerX?.user?.username || playerX?.guestName || "Player X";
  const nameO = playerO?.user?.displayName || playerO?.user?.username || playerO?.guestName || "Player O";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app/history"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Back to history
        </Link>
        <span className="font-mono text-[11px] text-muted-foreground">
          #{match.id}
        </span>
      </div>

      <SectionHeader
        title={`Replay · ${match.gameMode}`}
        description={`${nameX} (X) vs ${nameO} (O)`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <GlassPanel className="p-5">
          <Board
            size={boardSize}
            cells={cells}
            currentPlayer={currentTurn}
            lastMove={lastMove}
            disabled
          />

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <CtrlBtn onClick={() => { setPlaying(false); setStep(0); }} label="Restart">
              <RotateCcw className="size-4" />
            </CtrlBtn>
            <CtrlBtn
              onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
              label="Previous move"
              disabled={step === 0}
            >
              <SkipBack className="size-4" />
            </CtrlBtn>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 shadow-lg"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>
            <CtrlBtn
              onClick={() => { setPlaying(false); setStep((s) => Math.min(total, s + 1)); }}
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
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    speed === s
                      ? "bg-white/[0.10] text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
              className="w-full accent-white cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Start</span>
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
              <Stat label="Board" value={`${boardSize}×${boardSize}`} />
            </div>
          </GlassPanel>

          <GlassPanel className="overflow-hidden">
            <div className="border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Move list
            </div>
            <ol className="max-h-[420px] overflow-y-auto p-2 divide-y divide-white/[0.03]">
              {moves.map((m, i) => {
                const active = i === step - 1;
                const pSymbol = match.participants?.find((p) => p.id === m.playerId)?.symbol ?? (i % 2 === 0 ? "X" : "O");
                return (
                  <li key={m.id || i}>
                    <button
                      onClick={() => {
                        setPlaying(false);
                        setStep(i + 1);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                        active
                          ? "bg-white/[0.12] text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-bold">{pSymbol}</span>
                      <span className="text-muted-foreground">
                        [{m.row}, {m.column}]
                      </span>
                      {m.removedRow != null && (
                        <span className="text-[10px] text-red-400">
                          -(r{m.removedRow},c{m.removedColumn})
                        </span>
                      )}
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
      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}
