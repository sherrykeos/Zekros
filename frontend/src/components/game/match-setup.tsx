import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Users, Brain, Sparkles, Wifi, Play, Lock, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Board } from "./board";
import {
  defaultConfig,
  type MatchConfig,
  type Player,
  type CellState,
  maxActiveFor,
} from "./types";

function estimatedMinutes(size: MatchConfig["boardSize"]): [number, number] {
  // Rough heuristic for the live preview — purely cosmetic.
  switch (size) {
    case 3:
      return [1, 3];
    case 4:
      return [3, 6];
    case 5:
      return [6, 10];
    case 6:
      return [10, 18];
  }
}

/**
 * Premium match setup with a live mini-preview.
 * UI-only — `onLaunch` will hand the config to the game route in Phase 5.
 */
export function MatchSetup({
  initial,
  onLaunch,
}: {
  initial?: Partial<MatchConfig>;
  onLaunch?: (config: MatchConfig) => void;
}) {
  const [config, setConfig] = useState<MatchConfig>(() => {
    const merged: MatchConfig = { ...defaultConfig, ...initial };
    merged.maxActivePieces = maxActiveFor(merged.boardSize);
    if (merged.reclaimTokens > 10) merged.reclaimTokens = 10;
    return merged;
  });

  // Keep auto-derived values consistent whenever board size changes.
  useEffect(() => {
    setConfig((c) => {
      const nextMax = maxActiveFor(c.boardSize);
      const nextWin = Math.min(c.winLength, c.boardSize) as 3 | 4 | 5;
      if (c.maxActivePieces === nextMax && c.winLength === nextWin) return c;
      return { ...c, maxActivePieces: nextMax, winLength: nextWin, reclaimTokens: nextMax };
    });
  }, [config.boardSize]);

  const previewCells = useMemo<CellState[]>(() => {
    const arr: CellState[] = Array(config.boardSize * config.boardSize).fill(
      null,
    );
    const seeds: Array<[number, Player]> = [
      [0, "x"],
      [config.boardSize + 1, "o"],
      [config.boardSize * 2 + 2, "x"],
    ];
    seeds.forEach(([i, p]) => {
      if (i < arr.length) arr[i] = p;
    });
    return arr;
  }, [config.boardSize]);

  const update = <K extends keyof MatchConfig>(key: K, value: MatchConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const modeOptions: Array<{
    id: MatchConfig["mode"];
    label: string;
    icon: typeof Users;
    tag: string;
  }> = [
    { id: "local", label: "Local PvP", icon: Users, tag: "Same device" },
    { id: "smart", label: "Smart AI", icon: Brain, tag: "NBot" },
    { id: "perfect", label: "Perfect AI", icon: Sparkles, tag: "PBot" },
    { id: "multiplayer", label: "Multiplayer", icon: Wifi, tag: "Online" },
  ];

  const [estMin, estMax] = estimatedMinutes(config.boardSize);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass space-y-6 rounded-2xl p-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Match setup
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            Configure your game.
          </h2>
        </header>

        <Field label="Game mode">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {modeOptions.map((m) => {
              const active = config.mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => update("mode", m.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-white/25 bg-white/[0.08] text-foreground"
                      : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <m.icon className="size-4" />
                  <span className="text-xs font-medium">{m.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
                    {m.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SliderField
            label="Board size"
            value={config.boardSize}
            min={3}
            max={6}
            step={1}
            display={`${config.boardSize}×${config.boardSize}`}
            onChange={(v) => {
              const n = v as 3 | 4 | 5 | 6;
              update("boardSize", n);
            }}
          />
          <SliderField
            label="Win length"
            value={config.winLength}
            min={3}
            max={Math.min(5, config.boardSize)}
            step={1}
            display={`${config.winLength} in a row`}
            onChange={(v) => update("winLength", v as 3 | 4 | 5)}
          />
          {config.boardSize === 3 ? (
            <ReadOnlyField
              label="Max active pieces"
              value={`${config.maxActivePieces} per side`}
              hint="Fixed for 3x3"
            />
          ) : (
            <SliderField
              label="Max active pieces"
              value={config.maxActivePieces}
              min={config.boardSize}
              max={10}
              step={1}
              display={`${config.maxActivePieces} / side`}
              onChange={(v) => update("maxActivePieces", v)}
            />
          )}
          <SliderField
            label="Reclaim tokens"
            value={config.reclaimTokens}
            min={0}
            max={10}
            step={1}
            display={`${config.reclaimTokens} tokens`}
            onChange={(v) => update("reclaimTokens", v)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Your symbol">
            <SymbolToggle
              value={config.playerSymbol}
              onChange={(p) => update("playerSymbol", p)}
            />
          </Field>
          <Field label="Starting player">
            <SymbolToggle
              value={config.startingPlayer}
              onChange={(p) => update("startingPlayer", p)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => {
              const reset = { ...defaultConfig };
              reset.maxActivePieces = maxActiveFor(reset.boardSize);
              reset.reclaimTokens = reset.maxActivePieces;
              setConfig(reset);
            }}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.06]"
          >
            Reset
          </button>
          <button
            onClick={() => onLaunch?.(config)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <Play className="size-3.5" /> Launch match
          </button>
        </div>
      </section>

      {/* Live preview */}
      <section className="glass rounded-2xl p-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Live preview
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
              {config.boardSize}×{config.boardSize} · {config.winLength} to win
            </h3>
          </div>
          <motion.span
            key={`${config.boardSize}-${config.winLength}-${config.mode}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            {config.mode}
          </motion.span>
        </header>
        <Board
          size={config.boardSize}
          cells={previewCells}
          currentPlayer={config.startingPlayer}
          disabled
        />

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
          <SummaryStat label="Mode" value={config.mode} />
          <SummaryStat
            label="Board"
            value={`${config.boardSize}×${config.boardSize}`}
          />
          <SummaryStat label="Win" value={`${config.winLength} in a row`} />
          <SummaryStat
            label="Max active"
            value={`${config.maxActivePieces} / side`}
          />
          <SummaryStat
            label="Reclaim"
            value={`${config.reclaimTokens} tokens`}
          />
          <SummaryStat
            label="Est. length"
            value={`~${estMin}–${estMax} min`}
            icon={Clock}
          />
        </dl>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[11px] text-foreground">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Lock className="size-3" /> Auto
        </span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        <span className="text-sm font-medium">{value}</span>
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}

function SymbolToggle({
  value,
  onChange,
}: {
  value: Player;
  onChange: (p: Player) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["x", "o"] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-xl border px-3 py-2.5 text-center font-mono text-sm font-semibold uppercase transition-colors ${
            value === p
              ? "border-white/25 bg-white/[0.08] text-foreground"
              : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Clock;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium capitalize">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {value}
      </div>
    </div>
  );
}
