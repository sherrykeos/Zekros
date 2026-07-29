import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Palette,
  Volume2,
  Sparkles,
  Bell,
  Accessibility,
  Keyboard,
  Info,
  Rocket,
} from "lucide-react";
import type { ComponentType } from "react";
import { GlassPanel } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings â€” ZEKROS" }] }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune ZEKROS to your preferences. Changes are local â€” sync arrives
          with accounts.
        </p>
      </div>

      <SettingsGroup title="Appearance" icon={Palette}>
        <Row label="Theme" hint="Dark is the canonical ZEKROS theme.">
          <Segmented options={["Dark", "System", "Light"]} value="Dark" />
        </Row>
        <Row label="Accent" hint="Monochrome by design.">
          <Segmented options={["Bone", "Smoke", "Ash"]} value="Bone" />
        </Row>
        <Row label="Density" hint="Compact UI for power users.">
          <Segmented options={["Comfortable", "Compact"]} value="Comfortable" />
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Sound" icon={Volume2}>
        <Row label="UI sounds" hint="Subtle clicks and hovers.">
          <Toggle />
        </Row>
        <Row label="Match cues" hint="Place, capture, victory.">
          <Toggle defaultOn />
        </Row>
        <Row label="Master volume" hint="0 mutes everything.">
          <Slider defaultValue={70} />
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Animations" icon={Sparkles}>
        <Row label="Motion" hint="Disable to honor system reduce-motion.">
          <Segmented options={["Full", "Reduced", "Off"]} value="Full" />
        </Row>
        <Row label="Board transitions" hint="Animate placement and vanishes.">
          <Toggle defaultOn />
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Notifications" icon={Bell}>
        <Row label="In-app" hint="Banners for invites and results.">
          <Toggle defaultOn />
        </Row>
        <Row
          label="Match starts"
          hint="Notify when a multiplayer match starts."
        >
          <Toggle defaultOn />
        </Row>
        <Row label="Friend activity" hint="Coming soon â€” requires social.">
          <Toggle />
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Accessibility" icon={Accessibility}>
        <Row label="High contrast" hint="Stronger borders and focus rings.">
          <Toggle />
        </Row>
        <Row label="Larger text" hint="Bumps base type one step.">
          <Toggle />
        </Row>
        <Row label="Color-blind symbols" hint="Adds shape badges to X / O.">
          <Toggle defaultOn />
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Keyboard shortcuts" icon={Keyboard}>
        <Shortcut keys={["âŒ˜", "K"]} label="Open command bar" />
        <Shortcut keys={["âŒ˜", "/"]} label="Focus search" />
        <Shortcut keys={["G", "P"]} label="Go to Play" />
        <Shortcut keys={["G", "H"]} label="Go to History" />
        <Shortcut keys={["?"]} label="Show shortcuts" />
      </SettingsGroup>

      <SettingsGroup title="About ZEKROS" icon={Info}>
        <Row label="Build" hint="Current preview build.">
          <span className="font-mono text-xs text-muted-foreground">
            0.1.0-preview.3
          </span>
        </Row>
        <Row label="Engine" hint="Backend system in development.">
          <span className="font-mono text-xs text-muted-foreground">
            D3T Â· pre-alpha
          </span>
        </Row>
        <Row label="Company" hint="Crafted by ZEROTH Labs.">
          <span className="text-xs text-muted-foreground">ZEROTH Labs</span>
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Future features" icon={Rocket}>
        <Row label="Friends & parties" hint="Coming with the social system.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Ranked seasons" hint="Season 01 ladder, MMR, rewards.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Replay analyzer" hint="Per-move heatmaps and reviews.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Tournaments" hint="Community-run brackets.">
          <Badge>Planned</Badge>
        </Row>
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <GlassPanel className="divide-y divide-white/5">{children}</GlassPanel>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented({ options, value }: { options: string[]; value: string }) {
  const [v, setV] = useState(value);
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setV(o)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${v === o ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-white" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full transition-all ${on ? "left-[18px] bg-black" : "left-0.5 bg-white/80"}`}
      />
    </button>
  );
}

function Slider({ defaultValue = 50 }: { defaultValue?: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="w-32 accent-white"
      />
      <span className="w-8 text-right font-mono text-xs text-muted-foreground">
        {v}
      </span>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="text-sm">{label}</div>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
