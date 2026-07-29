import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Brain,
  Check,
  Lock,
  Play,
  Settings2,
  Sparkles,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { GlassPanel, SectionHeader } from "@/components/app/primitives";
import { Slider } from "@/components/ui/slider";
import {
  defaultConfig,
  normalizeMatchConfig,
  type MatchConfig,
  type GameMode,
} from "@/components/game/types";
import { Board } from "@/components/game/board";
import { cn } from "@/lib/utils";

type ConfigMode = GameMode;

type ModeOption = {
  id: ConfigMode;
  label: string;
  description: string;
  icon: LucideIcon;
  badge: string;
};

const modeOptions: ModeOption[] = [
  {
    id: "quick",
    label: "Quick Match",
    description: "Fast setup for a local duel.",
    icon: Users,
    badge: "Instant",
  },
  {
    id: "local",
    label: "Local PvP",
    description: "Shared device, split-screen feel.",
    icon: Users,
    badge: "Same screen",
  },
  {
    id: "smart",
    label: "Play vs AI",
    description: "Adaptive AI with a tactical edge.",
    icon: Brain,
    badge: "Adaptive",
  },
  {
    id: "perfect",
    label: "Perfect AI",
    description: "A ruthless solver for deeper practice.",
    icon: Sparkles,
    badge: "Challenging",
  },
  {
    id: "custom",
    label: "Custom Room",
    description: "Bring your own rules into the mix.",
    icon: Settings2,
    badge: "Flexible",
  },
  {
    id: "multiplayer",
    label: "Multiplayer",
    description: "Online match with a live opponent.",
    icon: Wifi,
    badge: "Live",
  },
];

function clampConfig(
  initial?: Partial<MatchConfig>,
  initialMode?: ConfigMode,
): MatchConfig {
  const merged = normalizeMatchConfig({
    ...initial,
    mode: initialMode ?? initial?.mode ?? defaultConfig.mode,
  });
  if (merged.reclaimTokens > 10) merged.reclaimTokens = 10;
  return merged;
}

export function GameConfigurationPage({
  initialConfig,
  initialMode,
  onStart,
  isStarting = false,
}: {
  initialConfig?: Partial<MatchConfig>;
  initialMode?: ConfigMode;
  onStart?: (config: MatchConfig) => void | Promise<void>;
  isStarting?: boolean;
}) {
  const [config, setConfig] = useState<MatchConfig>(() =>
    clampConfig(initialConfig, initialMode),
  );

  useEffect(() => {
    setConfig((current) => {
      const next = normalizeMatchConfig(current);
      if (
        current.maxActivePieces === next.maxActivePieces &&
        current.winLength === next.winLength &&
        current.boardSize === next.boardSize
      ) {
        return current;
      }
      return next;
    });
  }, [config.boardSize]);

  const previewCells = useMemo(() => {
    const cells = Array(config.boardSize * config.boardSize).fill(null);
    const seeds: Array<[number, "x" | "o"]> = [
      [0, "x"],
      [config.boardSize + 1, "o"],
      [config.boardSize * 2 + 2, "x"],
    ];
    seeds.forEach(([index, player]) => {
      if (index < cells.length) cells[index] = player;
    });
    return cells;
  }, [config.boardSize]);

  const update = <K extends keyof MatchConfig>(
    key: K,
    value: MatchConfig[K],
  ) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const activeMode =
    modeOptions.find((option) => option.id === config.mode) ?? modeOptions[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="space-y-6 pb-6"
    >
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.28 }}
        className="space-y-2"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Match configuration
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Set the rules before the first move.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          This single screen now handles quick matches, AI duels, local play,
          and custom rooms without changing the experience.
        </p>
      </motion.header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <GlassPanel className="overflow-hidden p-5 sm:p-6">
            <SectionHeader
              title="Game mode"
              description="Pick the play style that should launch from this screen."
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {modeOptions.map((option) => {
                const active = config.mode === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => update("mode", option.id)}
                    className={cn(
                      "group flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                      active
                        ? "border-white/20 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                        : "border-white/[0.06] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="mt-0.5 grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        {active && <Check className="size-4 text-foreground" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                      <span className="mt-2 inline-flex text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {option.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <SectionHeader
              title="Board setup"
              description="Choose the board geometry and pacing for this match."
            />
            <div className="max-w-md">
              <SliderField
                label="Board size"
                value={config.boardSize}
                min={3}
                max={6}
                step={1}
                display={`${config.boardSize}Ã—${config.boardSize}`}
                onChange={(value) =>
                  update("boardSize", value as MatchConfig["boardSize"])
                }
              />
            </div>
          </GlassPanel>

          <AdvancedSettings
            reclaimTokens={config.reclaimTokens}
            maxActivePieces={config.maxActivePieces}
            boardSize={config.boardSize}
            onReclaimChange={(value) => update("reclaimTokens", value)}
            onActivePiecesChange={(value) => update("maxActivePieces", value)}
          />
        </div>

        <div className="space-y-6">
          <GlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preview
                </div>
                <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  {config.boardSize}Ã—{config.boardSize} board
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {activeMode.label}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
              <Board
                size={config.boardSize}
                cells={previewCells}
                currentPlayer={config.startingPlayer}
                disabled
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoPill label="Mode" value={activeMode.label} />
              <InfoPill
                label="Reclaim"
                value={
                  config.reclaimTokens === 0
                    ? "Off"
                    : `${config.reclaimTokens} tokens`
                }
              />
              <InfoPill
                label="Active pieces"
                value={`${config.maxActivePieces} / side`}
              />
              <InfoPill
                label="Start"
                value={config.startingPlayer.toUpperCase()}
              />
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Ready to play
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  Launch this setup
                </h3>
              </div>
              <div className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                UI ready
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Rules are created on the backend before the match opens, including
              bot and reclaim behavior.
            </p>
            <StartButton
              config={config}
              isStarting={isStarting}
              onStart={onStart}
              className="mt-5 hidden md:inline-flex"
            />
          </GlassPanel>
        </div>
      </div>
      <div className="sticky bottom-3 z-20 mt-6 rounded-2xl border border-white/10 bg-background/90 p-2 shadow-2xl backdrop-blur md:hidden">
        <StartButton
          config={config}
          isStarting={isStarting}
          onStart={onStart}
          className="w-full justify-center"
        />
      </div>
    </motion.div>
  );
}

function StartButton({
  config,
  isStarting,
  onStart,
  className = "",
}: {
  config: MatchConfig;
  isStarting: boolean;
  onStart?: (config: MatchConfig) => void | Promise<void>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => void onStart?.(config)}
      disabled={isStarting}
      className={`inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:translate-y-[-1px] disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <Play className="size-4" />
      {isStarting ? "Starting..." : "Start match"}
      <ArrowRight className="size-4" />
    </button>
  );
}

function AdvancedSettings({
  reclaimTokens,
  maxActivePieces,
  boardSize,
  onReclaimChange,
  onActivePiecesChange,
}: {
  reclaimTokens: number;
  maxActivePieces: number;
  boardSize: MatchConfig["boardSize"];
  onReclaimChange: (value: number) => void;
  onActivePiecesChange: (value: number) => void;
}) {
  return (
    <GlassPanel className="p-5 sm:p-6">
      <SectionHeader
        title="Advanced settings"
        description="Fine-tune the pacing without leaving the main flow."
      />
      <div className="space-y-5">
        <SliderField
          label="Reclaim tokens"
          value={reclaimTokens}
          min={0}
          max={10}
          step={1}
          display={reclaimTokens === 0 ? "Off" : `${reclaimTokens}`}
          onChange={onReclaimChange}
        />
        <SliderField
          label="Maximum active pieces"
          value={maxActivePieces}
          min={1}
          max={boardSize}
          step={1}
          display={`${maxActivePieces} / side`}
          onChange={onActivePiecesChange}
        />
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-sm text-muted-foreground">
          <Lock className="size-4" />
          Rules are enforced by the backend match engine when you launch.
        </div>
      </div>
    </GlassPanel>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[11px] text-foreground">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => onChange(values[0] ?? value)}
      />
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
