import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { MiniBoard } from "../mini-board";

export function CustomMatchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [boardSize, setBoardSize] = useState(4);
  const [winLength, setWinLength] = useState(3);
  const [maxActive, setMaxActive] = useState(3);
  const [reclaim, setReclaim] = useState(1);
  const [symbol, setSymbol] = useState<"x" | "o">("x");
  const [mode, setMode] = useState<"local" | "smart" | "perfect" | "multi">(
    "smart",
  );

  // Decorative preview pieces — clamped to board size
  const previewPieces = useMemo(() => {
    const total = boardSize * boardSize;
    return [
      { i: 0 % total, player: "x" as const },
      { i: Math.min(total - 1, boardSize + 1), player: "o" as const },
      {
        i: Math.min(total - 1, boardSize * 2),
        player: "x" as const,
        fading: true,
      },
      { i: total - 1, player: "o" as const },
    ];
  }, [boardSize]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl rounded-2xl border-white/10 bg-background/80 p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold tracking-tight">
              Custom match
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tune the rules. Preview updates as you change them.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-5">
              <SliderRow
                label="Board size"
                value={boardSize}
                min={3}
                max={6}
                onChange={setBoardSize}
                hint={`${boardSize} × ${boardSize}`}
              />
              <SliderRow
                label="Win length"
                value={winLength}
                min={3}
                max={Math.min(boardSize, 5)}
                onChange={setWinLength}
                hint={`${winLength} in a row`}
              />
              <SliderRow
                label="Max active pieces"
                value={maxActive}
                min={3}
                max={6}
                onChange={setMaxActive}
                hint={`${maxActive} per player`}
              />
              <SliderRow
                label="Reclaim tokens"
                value={reclaim}
                min={0}
                max={3}
                onChange={setReclaim}
                hint={reclaim === 0 ? "Off" : `${reclaim} per player`}
              />

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Your symbol
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["x", "o"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSymbol(s)}
                      className={`rounded-xl border px-3 py-2.5 font-mono text-sm uppercase tracking-[0.16em] transition-colors ${
                        symbol === s
                          ? "border-white/25 bg-white/[0.08] text-foreground"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.05]"
                      }`}
                    >
                      {s === "x" ? "✕  Player X" : "◯  Player O"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Game mode
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      { id: "local", label: "Local" },
                      { id: "smart", label: "Smart AI" },
                      { id: "perfect", label: "Perfect AI" },
                      { id: "multi", label: "Multiplayer" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                        mode === m.id
                          ? "border-white/25 bg-white/[0.08] text-foreground"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.05]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="md:w-56">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Live preview
              </div>
              <div className="mt-2 glass rounded-2xl p-3">
                <MiniBoard
                  size={boardSize}
                  pieces={previewPieces}
                  animated={false}
                />
                <div className="mt-3 space-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <Row k="Board" v={`${boardSize}×${boardSize}`} />
                  <Row k="Win" v={`${winLength} in a row`} />
                  <Row k="Active" v={`${maxActive}`} />
                  <Row k="Reclaim" v={reclaim === 0 ? "Off" : `${reclaim}`} />
                  <Row k="You" v={symbol.toUpperCase()} />
                  <Row k="Mode" v={mode} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              // TODO: wire to `POST /matches` with this config (backend, Phase 4)
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground"
            >
              Start match
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        {hint && (
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
            {hint}
          </div>
        )}
      </div>
      <Slider
        className="mt-2"
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
